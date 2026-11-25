/* ================= Konto und Cloud-Speicherstand (Firebase) =================
   Anmeldung ist freiwillig. Ohne Konto bleibt alles wie bisher auf dem Gerät.
   Mit Konto wird der Spielstand (Profil, Story, Aufträge, Deck, Einstellungen, Käufe) in Firestore gesichert:
   ein Dokument je Konto, users/{uid}, mit Versionszähler rev gegen gegenseitiges Überschreiben.
   Laufende Partien (loota.save, loota.storysave) bleiben auf dem Gerät.
   Das Firebase-SDK (js/fb-sdk.js, nur Auth + Firestore Lite) wird erst geladen, wenn es gebraucht wird. */
const FB_CONFIG = {
  apiKey: 'AIzaSyB4LSPUYUo9i1NU4vphbvW37-yHucm0AN4',
  authDomain: 'plundo-5eeaa.firebaseapp.com',
  projectId: 'plundo-5eeaa',
  storageBucket: 'plundo-5eeaa.firebasestorage.app',
  messagingSenderId: '680447601239',
  appId: '1:680447601239:web:054343a29fdddfb4635112',
  databaseURL: 'https://plundo-5eeaa-default-rtdb.europe-west1.firebasedatabase.app'
};
const K_CLOUD = 'loota.cloud', K_MAIL = 'loota.mail';
const SYNC_KEYS = [K_PROFILE, K_STORY, K_DAILY, K_SET, K_DECK, K_BUY];
const CLOUD = Object.assign({uid: null, email: null, rev: 0, dirty: false, at: 0}, load(K_CLOUD) || {});
const ACC = {user: null, ready: false, busy: false, err: '', info: '', mode: 'start', email: load(K_MAIL) || '', pw: '', state: 'idle', seq: 0, lastPull: 0};
const rawSet = Storage.prototype.setItem;
let cloudApplying = false, upTimer = null;
function saveCloudMeta() { try { rawSet.call(localStorage, K_CLOUD, JSON.stringify(CLOUD)); } catch (e) {} }

// Jede Änderung an einem gesicherten Spielstand merken und kurz danach hochladen
Storage.prototype.setItem = function (k, v) {
  rawSet.call(this, k, v);
  if (cloudApplying || this !== localStorage || !SYNC_KEYS.includes(k)) return;
  ACC.seq++;
  if (!CLOUD.dirty) { CLOUD.dirty = true; saveCloudMeta(); }
  if (CLOUD.uid) { clearTimeout(upTimer); upTimer = setTimeout(() => cloudUpload(), 4000); }
};

let fbPromise = null;
function fbLoad() {
  return fbPromise || (fbPromise = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = 'js/fb-sdk.js';
    s.onload = () => {
      const F = window.FBX, app = F.initializeApp(FB_CONFIG);
      const auth = F.initializeAuth(app, {persistence: [F.indexedDBLocalPersistence, F.browserLocalPersistence], popupRedirectResolver: F.browserPopupRedirectResolver});
      auth.languageCode = 'de';
      const fb = {F, app, auth, db: F.getFirestore(app)};
      F.onAuthStateChanged(auth, u => onUser(u));
      res(fb);
    };
    s.onerror = () => { fbPromise = null; s.remove(); rej(Object.assign(new Error('offline'), {code: 'auth/network-request-failed'})); };
    document.head.appendChild(s);
  }));
}

/* ---------- Spielstand packen, vergleichen, übernehmen ---------- */
function packLocal() { const d = {}; SYNC_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v != null) d[k] = v; }); return d; }
function saveSummary(d) {
  let st = null; try { st = JSON.parse((d && d[K_STORY]) || 'null'); } catch (e) {}
  if (!st) return {stars: 0, coins: 0, done: 0};
  const stars = Object.values(st.stars || {}).reduce((a, v) => a + (Array.isArray(v) ? v.filter(Boolean).length : 0), 0);
  return {stars, coins: st.coins || 0, done: Object.keys(st.done || {}).length};
}
const hasProgress = d => { const s = saveSummary(d); return s.done > 0 || s.coins > 0; };
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const summaryText = d => { const s = saveSummary(d); return `${plural(s.done, 'Station', 'Stationen')}, ${plural(s.stars, 'Stern', 'Sterne')}, ${plural(s.coins, 'Münze', 'Münzen')}`; };
function agoText(ms) {
  if (!ms) return 'noch nie';
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return 'gerade eben'; if (m < 60) return `vor ${m} Min.`;
  const h = Math.round(m / 60); if (h < 24) return `vor ${h} Std.`;
  return new Date(ms).toLocaleDateString('de-DE', {day: 'numeric', month: 'short', year: 'numeric'});
}
const devName = () => /android/i.test(navigator.userAgent) ? 'Android' : /iphone|ipad/i.test(navigator.userAgent) ? 'iOS' : /windows/i.test(navigator.userAgent) ? 'Windows' : /mac/i.test(navigator.userAgent) ? 'Mac' : 'Browser';
// Cloud-Stand auf dieses Gerät schreiben und neu laden, damit alle Spielteile ihn frisch einlesen
function applyCloud(c) {
  cloudApplying = true;
  try { SYNC_KEYS.forEach(k => { const v = c.data && c.data[k]; if (v != null) rawSet.call(localStorage, k, v); else localStorage.removeItem(k); }); } finally { cloudApplying = false; }
  Object.assign(CLOUD, {rev: c.rev || 0, dirty: false, at: Date.now()}); saveCloudMeta();
  try { sessionStorage.setItem('loota.cloudmsg', '1'); } catch (e) {}
  location.reload();
}

/* ---------- Abgleich ---------- */
function onUser(u) {
  ACC.user = u; ACC.ready = true;
  if (u) {
    ACC.mode = 'start';
    if (CLOUD.uid !== u.uid) cloudFirstSync(u);
    else { CLOUD.email = u.email || CLOUD.email; saveCloudMeta(); cloudPull(); }
  } else if (CLOUD.uid) { Object.assign(CLOUD, {uid: null, email: null, rev: 0, at: 0}); saveCloudMeta(); }
  acctRefresh();
}
// Erste Anmeldung auf diesem Gerät: Spielstand im Konto suchen und mit dem hiesigen zusammenbringen
async function cloudFirstSync(u) {
  const {F, db} = await fbLoad();
  try {
    ACC.state = 'saving'; acctRefresh();
    const snap = await F.getDoc(F.doc(db, 'users', u.uid));
    if (!snap.exists()) { Object.assign(CLOUD, {uid: u.uid, email: u.email, rev: 0}); saveCloudMeta(); await cloudUpload(true); return; }
    const c = snap.data(), local = packLocal();
    if (!hasProgress(local)) { Object.assign(CLOUD, {uid: u.uid, email: u.email}); applyCloud(c); return; }
    await cloudConflict(c, u);
  } catch (e) { ACC.state = 'err'; ACC.err = acctErr(e); acctRefresh(); }
}
// Beim Start und beim Zurückkehren in die App: ist im Konto ein neuerer Stand (von einem anderen Gerät)?
async function cloudPull() {
  if (!ACC.user || Date.now() - ACC.lastPull < 30000) return;
  ACC.lastPull = Date.now();
  const {F, db} = await fbLoad();
  try {
    const snap = await F.getDoc(F.doc(db, 'users', ACC.user.uid));
    if (!snap.exists()) { await cloudUpload(true); return; }
    const c = snap.data();
    if ((c.rev || 0) === CLOUD.rev) { if (CLOUD.dirty) cloudUpload(); else { ACC.state = 'ok'; acctRefresh(); } return; }
    if (!CLOUD.dirty) { if (CUR !== 'game') applyCloud(c); return; }   // mitten in einer Partie nicht neu laden: beim nächsten Mal
    await cloudConflict(c, ACC.user);
  } catch (e) { ACC.state = 'err'; ACC.err = acctErr(e); acctRefresh(); }
}
async function cloudConflict(c, u) {
  const local = packLocal();
  const ok = await confirmDialog('Zwei Spielstände',
    `<b>Auf diesem Gerät:</b><br>${summaryText(local)}<br><br><b>In deinem Konto</b> (${esc(c.dev || 'anderes Gerät')}, ${agoText(c.client)}):<br>${summaryText(c.data)}<br><br>Welchen willst du behalten? Der andere wird überschrieben.`,
    'Konto laden', 'Diesen behalten', null, {modal: true});
  if (ok === null) { ACC.state = 'hold'; acctRefresh(); return; }
  Object.assign(CLOUD, {uid: u.uid, email: u.email}); saveCloudMeta();
  if (ok) applyCloud(c);
  else { CLOUD.rev = c.rev || 0; saveCloudMeta(); await cloudUpload(true); }
}
async function cloudUpload(force) {
  clearTimeout(upTimer);
  if (!ACC.user || !CLOUD.uid || ACC.user.uid !== CLOUD.uid) return;
  if (ACC.uploading) { upTimer = setTimeout(() => cloudUpload(force), 3000); return; }
  ACC.uploading = true; ACC.state = 'saving'; acctRefresh();
  const seq = ACC.seq, data = packLocal();
  try {
    const {F, db} = await fbLoad(), ref = F.doc(db, 'users', CLOUD.uid);
    const res = await F.runTransaction(db, async tx => {
      const snap = await tx.get(ref), cur = snap.exists() ? (snap.data().rev || 0) : 0;
      if (!force && cur !== CLOUD.rev) return {conflict: snap.data()};
      const rev = cur + 1;
      tx.set(ref, {v: 1, rev, at: F.serverTimestamp(), client: Date.now(), dev: devName(), data});
      return {rev};
    });
    ACC.uploading = false;
    if (res.conflict) { await cloudConflict(res.conflict, ACC.user); return; }
    Object.assign(CLOUD, {rev: res.rev, at: Date.now(), dirty: ACC.seq !== seq}); saveCloudMeta();
    ACC.state = 'ok'; ACC.err = '';
  } catch (e) { ACC.uploading = false; ACC.state = 'err'; ACC.err = acctErr(e); }
  acctRefresh();
}

/* ---------- Anmelden, Abmelden, Löschen ---------- */
const ACC_ERR = {
  'auth/invalid-email': 'Das sieht nicht nach einer E-Mail-Adresse aus.',
  'auth/missing-email': 'Bitte gib deine E-Mail-Adresse ein.',
  'auth/missing-password': 'Bitte gib dein Passwort ein.',
  'auth/invalid-credential': 'E-Mail oder Passwort stimmen nicht.',
  'auth/wrong-password': 'E-Mail oder Passwort stimmen nicht.',
  'auth/user-not-found': 'Zu dieser E-Mail gibt es noch kein Konto.',
  'auth/email-already-in-use': 'Für diese E-Mail gibt es schon ein Konto. Melde dich damit an.',
  'auth/weak-password': 'Das Passwort braucht mindestens 6 Zeichen.',
  'auth/popup-closed-by-user': 'Anmeldung abgebrochen.',
  'auth/cancelled-popup-request': 'Anmeldung abgebrochen.',
  'auth/popup-blocked': 'Das Anmeldefenster wurde blockiert. Erlaube Pop-ups für diese Seite und versuch es noch einmal.',
  'auth/network-request-failed': 'Keine Verbindung. Prüf dein Internet und versuch es noch einmal.',
  'auth/too-many-requests': 'Zu viele Versuche. Warte kurz und versuch es dann noch einmal.',
  'auth/operation-not-allowed': 'Diese Anmeldeart ist noch nicht freigeschaltet.',
  'auth/unauthorized-domain': 'Anmeldung von dieser Adresse aus ist noch nicht freigeschaltet.',
  'auth/requires-recent-login': 'Aus Sicherheitsgründen musst du dich dafür kurz neu anmelden.',
  'permission-denied': 'Der Speicher hat den Zugriff verweigert.',
  'unavailable': 'Keine Verbindung. Prüf dein Internet und versuch es noch einmal.'
};
const acctErr = e => ACC_ERR[e && e.code] || ACC_ERR[e && e.code && e.code.replace('firestore/', '')] || `Das hat nicht geklappt${e && e.code ? ` (${e.code})` : ''}.`;
async function acctRun(fn) {
  if (ACC.busy) return;
  ACC.busy = true; ACC.err = ''; ACC.info = ''; acctRefresh();
  try { await fn(await fbLoad()); } catch (e) { ACC.err = acctErr(e); }
  ACC.busy = false; acctRefresh();
}
const mailOk = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ACC.email.trim());
const acctBack = () => location.origin + location.pathname.replace(/index\.html$/, '');
function acctGoogle() { acctRun(({F, auth}) => F.signInWithPopup(auth, new F.GoogleAuthProvider())); }
function acctPw(create) {
  if (!mailOk()) { ACC.err = ACC_ERR['auth/invalid-email']; acctRefresh(); return; }
  if (!ACC.pw) { ACC.err = ACC_ERR['auth/missing-password']; acctRefresh(); return; }
  acctRun(async ({F, auth}) => {
    const mail = ACC.email.trim(); store(K_MAIL, mail);
    await (create ? F.createUserWithEmailAndPassword : F.signInWithEmailAndPassword)(auth, mail, ACC.pw);
    ACC.pw = '';
  });
}
function acctReset() {
  if (!mailOk()) { ACC.err = 'Trag oben deine E-Mail-Adresse ein, dann schicken wir dir einen Link zum Zurücksetzen.'; acctRefresh(); return; }
  acctRun(async ({F, auth}) => { await F.sendPasswordResetEmail(auth, ACC.email.trim(), {url: acctBack()}); ACC.info = `Wir haben dir einen Link zum Zurücksetzen an ${ACC.email.trim()} geschickt.`; });
}
async function acctSignOut() {
  const ok = await confirmDialog('Abmelden?', 'Dein Spielstand bleibt auf diesem Gerät. Im Konto ist er gesichert, bis du dich wieder anmeldest.', 'Abmelden', 'Abbrechen');
  if (!ok) return;
  if (CLOUD.dirty) await cloudUpload();
  acctRun(async ({F, auth}) => { await F.signOut(auth); Object.assign(CLOUD, {uid: null, email: null, rev: 0, at: 0}); saveCloudMeta(); });
}
async function acctDelete() {
  const ok = await confirmDialog('Konto löschen?', 'Dein Konto und der Spielstand darin werden endgültig gelöscht. Auf diesem Gerät spielst du ohne Konto weiter.', 'Endgültig löschen', 'Abbrechen');
  if (!ok) return;
  acctRun(async ({F, auth, db}) => {
    const u = auth.currentUser; if (!u) return;
    const del = async () => { await F.deleteDoc(F.doc(db, 'users', u.uid)); await F.deleteUser(u); };
    try { await del(); }
    catch (e) {
      if (e.code !== 'auth/requires-recent-login') throw e;
      if (u.providerData.some(p => p.providerId === 'google.com')) { await F.reauthenticateWithPopup(u, new F.GoogleAuthProvider()); await del(); }
      else throw e;
    }
    Object.assign(CLOUD, {uid: null, email: null, rev: 0, at: 0}); saveCloudMeta();
    ACC.info = 'Dein Konto ist gelöscht.';
  });
}

/* ---------- Oberfläche ---------- */
const ACC_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 15.5v-5m0 0-2.2 2.2M12 10.5l2.2 2.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const G_ICON = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
function acctStatus() {
  if (ACC.state === 'saving') return 'Wird gesichert …';
  if (ACC.state === 'err') return 'Sichern hat nicht geklappt. Wir versuchen es gleich noch einmal.';
  if (ACC.state === 'hold') return 'Noch nicht abgeglichen: Du hast dich noch nicht für einen Spielstand entschieden.';
  return `Gesichert ${agoText(CLOUD.at)}`;
}
function renderAcctCard() {
  const signed = CLOUD.uid || ACC.user;
  ['#pf-acct', '#set-acct'].forEach(sel => { const el = $(sel); if (el) patch(el, `<span class="acc-ic${signed ? ' on' : ''}">${ACC_ICON}</span><span><b>${signed ? 'Spielstand gesichert' : 'Fortschritt sichern'}</b><span>${signed
    ? `${esc((ACC.user && ACC.user.email) || CLOUD.email || 'Angemeldet')} · ${esc(acctStatus())}`
    : 'Melde dich an, dann ist dein Spielstand sicher und auf allen Geräten dabei.'}</span></span>`); });
}
function acctRefresh() { renderAcctCard(); if (SHEETS.length && topSheet().id === 'acct') renderSheet(false); if (typeof renderOnline === 'function') renderOnline(); if (typeof SOC !== 'undefined' && SOC.on && (!ACC.user || ACC.user.uid !== SOC.uid)) { stopSocial(); renderOnline(); } }
const accInput = (id, type, val, ph, ac) => `<input id="${id}" class="pf-input acc-in" type="${type}" value="${esc(val)}" placeholder="${ph}" autocomplete="${ac}" autocapitalize="off" spellcheck="false"${ACC.busy ? ' disabled' : ''}>`;
const accBtn = (act, label, cls = '') => `<button type="button" class="btn ${cls}" data-acct="${act}"${ACC.busy ? ' disabled' : ''}>${label}</button>`;
SHEET_VIEWS.acct = () => {
  const msg = (ACC.err ? `<p class="acc-err">${esc(ACC.err)}</p>` : '') + (ACC.info ? `<p class="acc-info">${esc(ACC.info)}</p>` : '');
  const small = '<p class="hint acc-small">Gesichert werden Profil, Story-Fortschritt, Münzen, Aufträge, Deck und Einstellungen. Eine laufende Partie bleibt auf dem Gerät. Mehr dazu in der <a href="../datenschutz.html">Datenschutzerklärung</a>.</p>';
  const u = ACC.user;
  if (u) {
    const via = u.providerData.some(p => p.providerId === 'google.com') ? 'mit Google' : 'mit E-Mail';
    return {head: h3('Dein Konto'), body: `<div class="acc-who"><span class="acc-ic on">${ACC_ICON}</span><div><b>${esc(u.email || 'Angemeldet')}</b><span>Angemeldet ${via}</span></div></div>
      <p class="acc-state">${esc(acctStatus())}</p>${msg}
      <div class="acts">${accBtn('save', 'Jetzt sichern', 'primary')}${accBtn('out', 'Abmelden')}</div>${small}
      <button type="button" class="acc-del" data-acct="del"${ACC.busy ? ' disabled' : ''}>Konto löschen</button>`};
  }
  if (!ACC.ready && CLOUD.uid) return {head: h3('Dein Konto'), body: `<p class="acc-state">Verbinde …</p>${msg}`};
  const intro = '<p class="acc-lead">Mit einem Konto ist dein Spielstand gesichert, auch wenn du das Handy wechselst. Spielen kannst du auch ohne.</p>';
  if (ACC.mode === 'pw') return {head: h3('Mit E-Mail anmelden'), body: `<p class="acc-lead">Melde dich mit E-Mail und Passwort an, oder leg ein neues Konto an.</p>${accInput('acc-email', 'email', ACC.email, 'deine@e-mail.de', 'email')}${accInput('acc-pw', 'password', ACC.pw, 'Passwort (mindestens 6 Zeichen)', 'current-password')}${msg}
    <div class="acts">${accBtn('pwin', 'Anmelden', 'primary')}${accBtn('pwnew', 'Neues Konto anlegen')}</div>
    <button type="button" class="acc-link" data-acct="reset"${ACC.busy ? ' disabled' : ''}>Passwort vergessen?</button>
    <div class="acts">${accBtn('start', 'Zurück')}</div>`};
  return {head: h3('Fortschritt sichern'), body: `${intro}${msg}<div class="acts">${accBtn('google', `<span class="g-ic">${G_ICON}</span>Mit Google anmelden`, 'acc-google')}${accBtn('pwmode', 'Mit E-Mail anmelden')}</div>${small}`};
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-acct]'); if (!b || b.disabled) return;
  const a = b.dataset.acct;
  if (a === 'open') { ACC.err = ''; ACC.info = ''; if (!ACC.user) ACC.mode = 'start'; openSheet({id: 'acct'}); fbLoad().catch(() => {}); return; }
  if (['start', 'pwmode'].includes(a)) { ACC.mode = a === 'pwmode' ? 'pw' : a; ACC.err = ''; ACC.info = ''; acctRefresh(); return; }
  ({google: acctGoogle, pwin: () => acctPw(false), pwnew: () => acctPw(true), reset: acctReset,
    save: () => cloudUpload(), out: acctSignOut, del: acctDelete})[a]?.();
});
document.addEventListener('input', e => { if (e.target.id === 'acc-email') ACC.email = e.target.value; else if (e.target.id === 'acc-pw') ACC.pw = e.target.value; });
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.classList || !e.target.classList.contains('acc-in')) return;
  e.preventDefault();
  if (ACC.mode === 'pw') acctPw(false);
});
// Charakter-Bildschirm: Konto-Karte mitzeichnen
const renderProfileBase = renderProfile;
renderProfile = function () { renderProfileBase(); renderAcctCard(); };
document.addEventListener('visibilitychange', () => {
  if (!CLOUD.uid) return;
  if (document.hidden) { if (CLOUD.dirty) cloudUpload(); } else cloudPull();
});
// Start: angemeldet gewesen? Dann Firebase gleich im Hintergrund laden
(function cloudBoot() {
  renderAcctCard();
  try { if (sessionStorage.getItem('loota.cloudmsg')) { sessionStorage.removeItem('loota.cloudmsg'); setTimeout(() => toast('Spielstand aus deinem Konto geladen.'), 900); } } catch (e) {}
  if (CLOUD.uid) setTimeout(() => fbLoad().catch(() => { ACC.state = 'err'; ACC.err = ACC_ERR['auth/network-request-failed']; acctRefresh(); }), 1200);
})();

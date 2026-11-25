/* ================= Online: Tische mit Freunden =================
   Schritt 1: Lobby. Ein Spieler eröffnet einen Tisch mit Code, Freunde treten bei, freie Plätze bekommen Bots.
   Die Daten liegen in der Firebase Realtime Database unter tables/{CODE}:
     host       uid des Gastgebers
     state      'lobby' | 'play' | 'closed'
     created    Zeitstempel
     seats/0..3 {uid, name, pt, fr, ti} für Menschen, {bot: true, name, pt} für Bots, leer = freier Platz
     presence/{uid}  true, solange der Spieler verbunden ist (verschwindet beim Verbindungsabbruch)
   Zum Testen ohne Firebase gibt es eine lokale Nachbildung über localStorage (zwei Tabs im selben Browser):
   localStorage loota.netlocal = '1' oder ?netlocal in der Adresse. */
const K_TABLE = 'loota.table';
const SEATS = 4;
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ON = {code: null, t: null, busy: false, err: '', joinCode: '', unwatch: null};
const NET_LOCAL = /[?&]netlocal\b/.test(location.search) || localStorage.getItem('loota.netlocal') === '1';

/* ---------- Datenbank: Firebase oder lokale Nachbildung, beide mit derselben kleinen Schnittstelle ---------- */
const pathParts = p => p.split('/').filter(Boolean);
const LocalDB = (() => {
  const KEY = 'loota.netmock', bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('loota-net') : null;
  const watchers = new Set();
  let uid = sessionStorage.getItem('loota.netuid'); if (!uid) { uid = 'local-' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('loota.netuid', uid); }
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const getIn = (o, p) => pathParts(p).reduce((a, k) => (a == null ? undefined : a[k]), o);
  const setIn = (o, p, v) => { const ks = pathParts(p); let a = o; ks.slice(0, -1).forEach(k => { if (a[k] == null || typeof a[k] !== 'object') a[k] = {}; a = a[k]; }); if (v == null) delete a[ks[ks.length - 1]]; else a[ks[ks.length - 1]] = JSON.parse(JSON.stringify(v)); };
  const write = o => { localStorage.setItem(KEY, JSON.stringify(o)); notify(); if (bc) bc.postMessage(1); };
  const notify = () => watchers.forEach(w => { const v = getIn(read(), w.p); const s = JSON.stringify(v); if (s !== w.last) { w.last = s; w.cb(v == null ? null : JSON.parse(s)); } });
  if (bc) bc.onmessage = notify;
  window.addEventListener('storage', e => { if (e.key === KEY) notify(); });
  const presence = new Set();
  window.addEventListener('beforeunload', () => { if (!presence.size) return; const o = read(); presence.forEach(p => setIn(o, p, null)); localStorage.setItem(KEY, JSON.stringify(o)); if (bc) bc.postMessage(1); });
  return {
    uid: () => uid, ready: async () => true, now: () => Date.now(),
    get: async p => { const v = getIn(read(), p); return v == null ? null : v; },
    set: async (p, v) => { const o = read(); setIn(o, p, v); write(o); },
    update: async (p, obj) => { const o = read(); Object.entries(obj).forEach(([k, v]) => setIn(o, p + '/' + k, v)); write(o); },
    tx: async (p, fn) => { const o = read(); const cur = getIn(o, p); const nv = fn(cur == null ? null : JSON.parse(JSON.stringify(cur))); if (nv === undefined) return {committed: false, val: cur}; setIn(o, p, nv); write(o); return {committed: true, val: nv}; },
    watch: (p, cb) => { const w = {p, cb, last: undefined}; watchers.add(w); setTimeout(notify, 0); return () => watchers.delete(w); },
    presence: async p => { presence.add(p); const o = read(); setIn(o, p, true); write(o); return () => presence.delete(p); }
  };
})();
const FireDB = (() => {
  let db = null, F = null;
  const ready = async () => { if (db) return true; const fb = await fbLoad(); F = fb.F; db = F.getDatabase(fb.app); return true; };
  const r = p => F.dbRef(db, p);
  return {
    uid: () => (ACC.user && ACC.user.uid) || null, ready, now: () => Date.now(),
    get: async p => { await ready(); const s = await F.dbGet(r(p)); return s.exists() ? s.val() : null; },
    set: async (p, v) => { await ready(); await F.dbSet(r(p), v == null ? null : v); },
    update: async (p, obj) => { await ready(); await F.dbUpdate(r(p), obj); },
    tx: async (p, fn) => { await ready(); const res = await F.dbTx(r(p), cur => fn(cur)); return {committed: res.committed, val: res.snapshot.val()}; },
    watch: (p, cb) => { let off = null, dead = false; ready().then(() => { if (!dead) off = F.onValue(r(p), s => cb(s.exists() ? s.val() : null), () => cb(null)); }); return () => { dead = true; if (off) off(); }; },
    presence: async p => { await ready(); const ref = r(p); await F.onDisconnect(ref).remove(); await F.dbSet(ref, true); return () => F.dbSet(ref, null); }
  };
})();
const NET = NET_LOCAL ? LocalDB : FireDB;
const netUid = () => NET.uid();
const onSignedIn = () => NET_LOCAL || !!(ACC.user && ACC.user.uid);

/* ---------- Tisch: eröffnen, beitreten, verlassen ---------- */
function mySeatData() {
  const pt = (ALL_PORTRAITS.find(q => q[0] === PROFILE.portrait && cosOpen(q)) || PORTRAITS[0])[0];
  return {uid: netUid(), name: (PROFILE.name || 'Abenteurer').slice(0, 16), pt, fr: myFrameKey(), ti: myTitle() ? PROFILE.title : ''};
}
const newCode = () => Array.from({length: 5}, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('');
const cleanCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
async function onBusy(fn) {
  if (ON.busy) return; ON.busy = true; ON.err = ''; renderOnline();
  try { await fn(); } catch (e) { console.error(e); ON.err = onErr(e); }
  ON.busy = false; renderOnline();
}
function onErr(e) {
  const c = (e && (e.code || e.message)) || '';
  if (/PERMISSION_DENIED|permission/i.test(c)) return 'Keine Berechtigung. Bist du angemeldet?';
  if (/network|offline|disconnected/i.test(c)) return 'Keine Verbindung zum Server. Prüfe dein Internet.';
  return e && e.userMsg || 'Das hat nicht geklappt. Versuch es gleich noch einmal.';
}
const userErr = m => Object.assign(new Error(m), {userMsg: m});
function createTable() {
  return onBusy(async () => {
    if (!onSignedIn()) throw userErr('Für Online-Partien musst du angemeldet sein.');
    await NET.ready();
    for (let i = 0; i < 8; i++) {
      const code = newCode();
      const res = await NET.tx('tables/' + code, cur => cur ? undefined : {host: netUid(), state: 'lobby', created: NET.now(), v: 1, seats: {0: mySeatData()}});
      if (res.committed) { await enterTable(code); return; }
    }
    throw userErr('Gerade ist kein Tisch frei. Versuch es gleich noch einmal.');
  });
}
function joinTable(code) {
  code = cleanCode(code);
  return onBusy(async () => {
    if (!onSignedIn()) throw userErr('Für Online-Partien musst du angemeldet sein.');
    if (code.length !== 5) throw userErr('Der Code hat 5 Zeichen.');
    await NET.ready();
    const t = await NET.get('tables/' + code);
    if (!t || t.state === 'closed') throw userErr(`Einen Tisch mit dem Code ${code} gibt es nicht (mehr).`);
    const seats = t.seats || {}, me = netUid();
    if (Object.values(seats).some(s => s && s.uid === me)) { await enterTable(code); return; }   // schon dabei (z. B. nach Neuladen)
    if (t.state !== 'lobby') throw userErr('An diesem Tisch läuft schon eine Partie.');
    for (let i = 1; i < SEATS; i++) {
      if (seats[i]) continue;
      const res = await NET.tx(`tables/${code}/seats/${i}`, cur => cur ? undefined : mySeatData());
      if (res.committed) { await enterTable(code); return; }
    }
    throw userErr('Der Tisch ist voll.');
  });
}
async function enterTable(code) {
  if (ON.unwatch) ON.unwatch();
  ON.code = code; ON.t = null; localStorage.setItem(K_TABLE, code); setMyTable(code);
  ON.unpresence = await NET.presence(`tables/${code}/presence/${netUid()}`);
  // Name, Porträt oder Rahmen geändert, seit man sich gesetzt hat: Platz auffrischen
  try { const t = await NET.get('tables/' + code), s = t && t.seats || {}; for (let i = 0; i < SEATS; i++) if (s[i] && s[i].uid === netUid()) { const d = mySeatData(); if (JSON.stringify(s[i]) !== JSON.stringify(d)) await NET.set(`tables/${code}/seats/${i}`, d); } } catch (e) {}
  ON.unwatch = NET.watch('tables/' + code, t => {
    ON.t = t;
    if (!t || t.state === 'closed') { const wasGuest = t && t.host !== netUid(); dropTable(); if (wasGuest || !t) toast('Der Gastgeber hat den Tisch geschlossen.'); }
    else if (!Object.values(t.seats || {}).some(s => s && s.uid === netUid())) { dropTable(); toast('Du bist nicht mehr an diesem Tisch.'); }
    renderOnline();
  });
  renderOnline();
}
function dropTable() {
  if (ON.unwatch) ON.unwatch(); if (ON.unpresence) ON.unpresence();
  ON.unwatch = ON.unpresence = null; ON.code = null; ON.t = null; localStorage.removeItem(K_TABLE); setMyTable(null); renderInvBar();
}
function leaveTable() {
  const code = ON.code, t = ON.t; if (!code) return;
  return onBusy(async () => {
    if (t && t.host === netUid()) await NET.update('tables/' + code, {state: 'closed', seats: null, presence: null});
    else { const i = mySeat(); if (i >= 0) await NET.set(`tables/${code}/seats/${i}`, null); await NET.set(`tables/${code}/presence/${netUid()}`, null); }
    dropTable();
  });
}
const mySeat = () => { const s = (ON.t && ON.t.seats) || {}; for (let i = 0; i < SEATS; i++) if (s[i] && s[i].uid === netUid()) return i; return -1; };
const amHost = () => !!(ON.t && ON.t.host === netUid());
function seatBot(i) {
  if (!amHost() || !ON.code) return;
  const used = new Set(Object.values(ON.t.seats || {}).filter(Boolean).map(s => s.name));
  const faces = PORTRAITS.filter(x => BOT_NAMES[x[0]] && !Object.values(ON.t.seats || {}).some(s => s && s.pt === x[0]));
  const f = pick(faces.length ? faces : PORTRAITS.filter(x => BOT_NAMES[x[0]]));
  let n = pick(BOT_NAMES[f[0]]), guard = 0; while (used.has(n) && guard++ < 20) n = pick(BOT_NAMES[f[0]]);
  return onBusy(() => NET.set(`tables/${ON.code}/seats/${i}`, {bot: true, name: n, pt: f[0]}));
}
function freeSeat(i) { if (amHost() && ON.code && i > 0) return onBusy(() => NET.set(`tables/${ON.code}/seats/${i}`, null)); }
// Nach dem Neuladen an den eigenen Tisch zurück
async function resumeTable() {
  const code = localStorage.getItem(K_TABLE); if (!code || ON.code || !onSignedIn()) return;
  try { await NET.ready(); const t = await NET.get('tables/' + code); if (t && t.state !== 'closed' && Object.values(t.seats || {}).some(s => s && s.uid === netUid())) await enterTable(code); else localStorage.removeItem(K_TABLE); }
  catch (e) { /* offline: beim nächsten Öffnen erneut */ }
}


/* ---------- Freunde: hinzufügen per Spieler-ID, offene Tische sehen, einladen ----------
   users/{uid}/pub          öffentliches Profil (Name, Porträt, Rahmen, Titel, ID)
   users/{uid}/online       true, solange die App offen ist
   users/{uid}/table        Code des Tischs, an dem man gerade sitzt
   users/{uid}/friends/{f}  true = ich habe f als Freund; Freunde sind wir, wenn es beide Seiten haben
   users/{uid}/req/{von}    Freundschaftsanfrage
   users/{uid}/inv/{von}    Einladung an einen Tisch {code, name, pt, at}
   tags/{ID}                uid zur Spieler-ID */
const SOC = {on: false, uid: null, friends: {}, reqs: {}, invs: {}, tables: {}, offs: [], fOffs: {}, tOffs: {}, invited: {}, addId: '', msg: ''};
const myTag = () => NET_LOCAL ? String(netUid()).replace(/[^a-z0-9]/gi, '').toUpperCase().slice(-8).replace(/^(.{4})/, '$1-') : playerTag();
const tagKey = t => String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
const myPub = () => { const d = mySeatData(); delete d.uid; d.tag = myTag(); return d; };
function socRender() { renderOnline(); renderInvBar(); }
async function startSocial() {
  if (!mq().pc.matches || !onSignedIn()) return;
  const uid = netUid(); if (!uid || SOC.uid === uid) return;
  stopSocial(); SOC.uid = uid; SOC.on = true;
  try {
    await NET.ready();
    await NET.set(`users/${uid}/pub`, myPub());
    const tk = tagKey(myTag()); if (tk.length === 8) await NET.tx('tags/' + tk, cur => !cur || cur === uid ? uid : undefined);
    SOC.offs.push(await NET.presence(`users/${uid}/online`));
    SOC.offs.push(NET.watch(`users/${uid}/friends`, v => { syncFriends(Object.keys(v || {})); socRender(); }));
    SOC.offs.push(NET.watch(`users/${uid}/req`, v => { SOC.reqs = v || {}; socRender(); }));
    SOC.offs.push(NET.watch(`users/${uid}/inv`, v => { const now = Date.now(); SOC.invs = Object.fromEntries(Object.entries(v || {}).filter(([, x]) => x && now - (x.at || 0) < 30 * 60000)); socRender(); }));
  } catch (e) { console.warn('Freunde', e); }
}
function stopSocial() {
  SOC.offs.forEach(f => { try { f(); } catch (e) {} }); Object.values(SOC.fOffs).forEach(a => a.forEach(f => f())); Object.values(SOC.tOffs).forEach(f => f());
  Object.assign(SOC, {on: false, uid: null, friends: {}, reqs: {}, invs: {}, tables: {}, offs: [], fOffs: {}, tOffs: {}});
}
function syncFriends(ids) {
  const me = SOC.uid;
  Object.keys(SOC.fOffs).filter(f => !ids.includes(f)).forEach(f => { SOC.fOffs[f].forEach(x => x()); delete SOC.fOffs[f]; delete SOC.friends[f]; });
  ids.filter(f => !SOC.fOffs[f]).forEach(f => {
    const F = SOC.friends[f] = {uid: f, pub: null, online: false, mutual: false, table: null};
    SOC.fOffs[f] = [
      NET.watch(`users/${f}/pub`, v => { F.pub = v; socRender(); }),
      NET.watch(`users/${f}/online`, v => { F.online = !!v; socRender(); }),
      NET.watch(`users/${f}/friends/${me}`, v => { F.mutual = !!v; socRender(); }),
      NET.watch(`users/${f}/table`, v => { F.table = v || null; watchFriendTables(); socRender(); })
    ];
  });
}
// Tische der Freunde beobachten (für „Offene Tische deiner Freunde“)
function watchFriendTables() {
  const codes = new Set(Object.values(SOC.friends).map(f => f.table).filter(Boolean));
  Object.keys(SOC.tOffs).filter(c => !codes.has(c)).forEach(c => { SOC.tOffs[c](); delete SOC.tOffs[c]; delete SOC.tables[c]; });
  codes.forEach(c => { if (!SOC.tOffs[c]) SOC.tOffs[c] = NET.watch('tables/' + c, v => { SOC.tables[c] = v; socRender(); }); });
}
async function setMyTable(code) { if (SOC.uid) { try { await NET.set(`users/${SOC.uid}/table`, code || null); } catch (e) {} } }
function addFriend(raw) {
  const k = tagKey(raw);
  return onBusy(async () => {
    if (k.length !== 8) throw userErr('Eine Spieler-ID hat 8 Zeichen, zum Beispiel ABCD-1234.');
    if (k === tagKey(myTag())) throw userErr('Das ist deine eigene Spieler-ID.');
    const uid = await NET.get('tags/' + k);
    if (!uid) throw userErr('Zu dieser Spieler-ID gibt es niemanden. Ist der Freund schon angemeldet und hat Plundo am PC geöffnet?');
    if (SOC.friends[uid]) throw userErr('Ihr seid schon befreundet oder deine Anfrage läuft noch.');
    await NET.set(`users/${SOC.uid}/friends/${uid}`, true);
    await NET.set(`users/${uid}/req/${SOC.uid}`, Object.assign(myPub(), {at: NET.now()}));
    SOC.addId = ''; toast('Freundschaftsanfrage verschickt');
  });
}
function answerReq(uid, yes) {
  return onBusy(async () => {
    if (yes) await NET.set(`users/${SOC.uid}/friends/${uid}`, true);
    await NET.set(`users/${SOC.uid}/req/${uid}`, null);
    if (yes) toast('Ihr seid jetzt befreundet');
  });
}
function removeFriend(uid) { return onBusy(() => NET.set(`users/${SOC.uid}/friends/${uid}`, null)); }
function inviteFriend(uid) {
  if (!ON.code) return;
  return onBusy(async () => { await NET.set(`users/${uid}/inv/${SOC.uid}`, Object.assign(myPub(), {code: ON.code, at: NET.now()})); SOC.invited[uid] = ON.code; toast('Einladung verschickt'); });
}
function answerInv(uid, yes) {
  const inv = SOC.invs[uid]; if (!inv) return;
  delete SOC.invs[uid]; NET.set(`users/${SOC.uid}/inv/${uid}`, null).catch(() => {});
  renderInvBar();
  if (yes) { if (!HUBON) openHubOnline(); setTimeout(() => joinTable(inv.code), 200); }
  else renderOnline();
}
const friendName = f => (f.pub && f.pub.name) || 'Unbekannt';
const tableFree = t => t && t.state === 'lobby' ? SEATS - Object.values(t.seats || {}).filter(Boolean).length : 0;
function friendRowHTML(f, mode) {
  const face = seatFace(f.pub || {pt: 'du'});
  const t = f.table && SOC.tables[f.table], free = tableFree(t), atMine = ON.t && Object.values(ON.t.seats || {}).some(x => x && x.uid === f.uid);
  let status = !f.mutual ? 'Anfrage gesendet' : f.online ? 'online' : 'offline', btn = '';
  if (f.mutual && mode === 'lobby') {
    if (atMine) status = 'sitzt an deinem Tisch';
    else if (f.online) btn = SOC.invited[f.uid] === ON.code ? '<span class="fr-done">eingeladen</span>' : `<button type="button" class="btn" data-soc="inv" data-u="${f.uid}">Einladen</button>`;
  } else if (f.mutual && t && t.state === 'lobby' && f.table !== ON.code) { status = `am Tisch · ${SEATS - free}/${SEATS}`; if (free && mode === 'open') btn = `<button type="button" class="btn primary" data-soc="go" data-c="${f.table}">Beitreten</button>`; }
  return `<li class="fr-row${f.online && f.mutual ? ' on' : ''}">${face}<span class="fr-t"><b>${esc(friendName(f))}</b><small><i class="fr-dot"></i>${status}</small></span>${btn}` +
    (mode !== 'lobby' ? `<button type="button" class="fr-x" data-soc="del" data-u="${f.uid}" title="Aus der Freundesliste entfernen" aria-label="Entfernen">×</button>` : '') + `</li>`;
}
function friendsSorted() { return Object.values(SOC.friends).sort((a, b) => (b.mutual - a.mutual) || (b.online - a.online) || friendName(a).localeCompare(friendName(b), 'de')); }
// Linke Spalte, solange man an keinem Tisch sitzt: offene Tische der Freunde, Freundesliste, Anfragen
function socPanelsHTML() {
  const invs = Object.entries(SOC.invs), reqs = Object.entries(SOC.reqs), fl = friendsSorted();
  const open = fl.filter(f => f.mutual && f.table && SOC.tables[f.table] && SOC.tables[f.table].state === 'lobby');
  const seen = new Set(); const openU = open.filter(f => !seen.has(f.table) && seen.add(f.table));
  let h = `<div class="panel on-p"><h3>Offene Tische deiner Freunde</h3>`;
  if (invs.length) h += `<ul class="fr-list">${invs.map(([u, x]) => `<li class="fr-row inv">${seatFace(x)}<span class="fr-t"><b>${esc(x.name)}</b><small>lädt dich an den Tisch ein</small></span><button type="button" class="btn primary" data-soc="iyes" data-u="${u}">Beitreten</button><button type="button" class="fr-x" data-soc="ino" data-u="${u}" aria-label="Ablehnen" title="Ablehnen">×</button></li>`).join('')}</ul>`;
  h += openU.length ? `<ul class="fr-list">${openU.map(f => friendRowHTML(f, 'open')).join('')}</ul>` : (invs.length ? '' : `<p class="on-note">Gerade hat keiner deiner Freunde einen offenen Tisch. Eröffne selbst einen und lade sie ein.</p>`);
  h += `</div>`;
  h += `<div class="panel on-p"><h3>Freunde${fl.length ? ` <small class="fr-n">${fl.filter(f => f.mutual && f.online).length} online</small>` : ''}</h3>`;
  if (reqs.length) h += `<p class="fr-sub">Anfragen</p><ul class="fr-list">${reqs.map(([u, x]) => `<li class="fr-row req">${seatFace(x)}<span class="fr-t"><b>${esc(x.name)}</b><small>#${esc(x.tag || '')} möchte mit dir befreundet sein</small></span><button type="button" class="btn primary" data-soc="ryes" data-u="${u}">Annehmen</button><button type="button" class="fr-x" data-soc="rno" data-u="${u}" aria-label="Ablehnen" title="Ablehnen">×</button></li>`).join('')}</ul>`;
  h += fl.length ? `<ul class="fr-list">${fl.map(f => friendRowHTML(f, 'list')).join('')}</ul>` : `<p class="on-note">Noch keine Freunde. Gib unten die Spieler-ID eines Freundes ein. Seine ID steht bei ihm unter „Dein Charakter“.</p>`;
  h += `<div class="on-join fr-add"><input id="fr-id" class="on-codein fr-in" maxlength="9" autocomplete="off" spellcheck="false" placeholder="ABCD-1234" value="${esc(SOC.addId)}" aria-label="Spieler-ID"><button type="button" class="btn" data-soc="add"${ON.busy ? ' disabled' : ''}>Hinzufügen</button></div>` +
    `<p class="fr-me">Deine Spieler-ID: <b>#${esc(myTag())}</b> <button type="button" class="fr-copy" data-soc="myid">kopieren</button></p></div>`;
  return h;
}
function socInviteHTML() {
  const fl = friendsSorted().filter(f => f.mutual);
  return `<div class="panel on-p"><h3>Freunde einladen</h3>` + (fl.length ? `<ul class="fr-list">${fl.map(f => friendRowHTML(f, 'lobby')).join('')}</ul>` : `<p class="on-note">Füge zuerst Freunde hinzu, dann kannst du sie hier mit einem Klick einladen.</p>`) + `</div>`;
}
// Einladung oben rechts, egal auf welcher Seite man gerade ist (PC)
function renderInvBar() {
  let bar = $('#invbar'); const list = Object.entries(SOC.invs).filter(([, x]) => x.code !== ON.code);
  if (!list.length || !mq().pc.matches) { if (bar) bar.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.id = 'invbar'; document.body.appendChild(bar); }
  const [u, x] = list[0];
  patch(bar, `${seatFace(x)}<span><b>${esc(x.name)}</b> lädt dich an den Tisch ein</span><button type="button" class="btn primary" data-soc="iyes" data-u="${u}">Beitreten</button><button type="button" class="btn" data-soc="ino" data-u="${u}">Später</button>`);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-soc]'); if (!b || b.disabled) return;
  const a = b.dataset.soc, u = b.dataset.u;
  if (a === 'add') addFriend(($('#fr-id') || {}).value || SOC.addId);
  else if (a === 'ryes') answerReq(u, true); else if (a === 'rno') answerReq(u, false);
  else if (a === 'del') removeFriend(u);
  else if (a === 'inv') inviteFriend(u);
  else if (a === 'iyes') answerInv(u, true); else if (a === 'ino') answerInv(u, false);
  else if (a === 'go') { if (!HUBON) openHubOnline(); joinTable(b.dataset.c); }
  else if (a === 'myid') copyText('#' + myTag(), 'Spieler-ID kopiert');
});
document.addEventListener('input', e => { if (e.target.id === 'fr-id') SOC.addId = e.target.value; });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'fr-id') addFriend(e.target.value); });

/* ---------- Oberfläche (PC): „Mit Freunden spielen“ auf der Seite „Spielen“ ---------- */

const tableLink = code => `https://plundo.eu/spiel/#tisch=${code}`;
function seatFace(s) {
  const pt = (ALL_PORTRAITS.find(q => q[0] === s.pt) || PORTRAITS[0])[2];
  const fr = s.bot ? null : ALL_FRAMES.find(q => q[0] === s.fr) || FRAMES[0];
  const art = fr ? frameArt(fr[0], true) : '';
  return `<span class="su-face${art ? ' fa' : ''}" style="--fc:${fr ? fr[2] : '#cfb58a'}${art ? `;--fimg:url('${new URL(art, document.baseURI).href}')` : ''}"><img src="${pt}" alt=""></span>`;
}
function onSeatHTML(i, pos) {
  const t = ON.t, s = t && t.seats && t.seats[i], host = amHost();
  if (!t && pos === 'me') return `<div class="su-seat on-seat s-me me">${seatFace(mySeatData())}<b>Du</b><small>${onSignedIn() ? 'bereit' : 'nicht angemeldet'}</small></div>`;
  if (!t) return `<div class="su-seat on-seat s-${pos} free"><span class="su-face empty"><i>+</i></span><b>Freier Platz</b><small>für einen Freund</small></div>`;
  if (!s) return `<div class="su-seat on-seat s-${pos} free"><span class="su-face empty"><i>+</i></span><b>Freier Platz</b><small>wartet auf Freunde</small>` +
    (host ? `<span class="on-sbtns"><button type="button" class="btn" data-on="bot" data-i="${i}">Bot setzen</button></span>` : '') + `</div>`;
  const online = s.bot || (t.presence && t.presence[s.uid]);
  const tag = s.bot ? 'Bot' : i === 0 ? 'Gastgeber' : online ? 'ist dabei' : 'nicht verbunden';
  const ti = !s.bot && s.ti && COSMETICS.title[s.ti] ? `<em>${esc(COSMETICS.title[s.ti])}</em>` : '';
  return `<div class="su-seat on-seat s-${pos}${s.bot ? ' bot' : ''}${online ? '' : ' away'}${s.uid === netUid() ? ' me' : ''}">${seatFace(s)}<b>${esc(s.uid === netUid() ? 'Du' : s.name)}</b>${ti}<small>${tag}</small>` +
    (host && i > 0 ? `<span class="on-sbtns"><button type="button" class="on-x" data-on="free" data-i="${i}" aria-label="${s.bot ? 'Bot entfernen' : 'Vom Tisch nehmen'}" title="${s.bot ? 'Bot entfernen' : 'Vom Tisch nehmen'}">×</button></span>` : '') + `</div>`;
}
function hubOnlineHTML() {
  const t = ON.t, me = t ? Math.max(0, mySeat()) : 0, pos = ['me', 'l', 't', 'r'];
  const seats = [0, 1, 2, 3].map(k => onSeatHTML((me + k) % SEATS, pos[k])).join('');
  const humans = t ? Object.values(t.seats || {}).filter(s => s && !s.bot).length : 0, filled = t ? Object.values(t.seats || {}).filter(Boolean).length : 0;
  let side;
  if (!onSignedIn()) {
    side = `<div class="panel on-p"><h3>Mit Freunden spielen</h3><p>Eröffne einen Tisch und lade bis zu drei Freunde ein. Freie Plätze besetzt du mit Bots.</p>` +
      `<p class="on-note">Für Online-Partien brauchst du ein Konto, damit dich deine Freunde am Tisch erkennen. Dein Fortschritt wird dabei gleich mit gesichert.</p>` +
      `<div class="acts"><button type="button" class="btn primary" data-acct="open">Anmelden</button></div></div>`;
  } else if (!t) {
    side = `<div class="panel on-p"><h3>Tisch eröffnen</h3><p>Lade bis zu drei Freunde an deinen Tisch ein. Freie Plätze besetzt du mit Bots.</p>` +
      `<button type="button" class="btn primary su-start on-go" data-on="create"${ON.busy ? ' disabled' : ''}>Tisch eröffnen</button></div>` +
      socPanelsHTML() +
      `<div class="panel on-p on-codejoin"><h3>Mit Code beitreten</h3>` +
      `<div class="on-join"><input id="on-code" class="on-codein" maxlength="5" autocomplete="off" spellcheck="false" placeholder="CODE" value="${esc(ON.joinCode)}" aria-label="Tisch-Code"><button type="button" class="btn" data-on="join"${ON.busy ? ' disabled' : ''}>Beitreten</button></div></div>`;
  } else {
    const host = amHost();
    side = socInviteHTML() +
      `<div class="panel on-p on-codep"><h3>Tisch-Code <span class="on-smallcode">${ON.code}</span></h3>` +
      `<p class="on-note">Für Freunde, die noch nicht in deiner Liste sind: Code oder Link schicken.</p>` +
      `<div class="on-copy"><button type="button" class="btn" data-on="copycode">Code kopieren</button><button type="button" class="btn" data-on="copylink">Link kopieren</button></div></div>` +
      `<div class="panel on-p"><h3>${host ? 'Deine Runde' : 'Am Tisch'}</h3><ul class="on-facts"><li><b>${humans}</b> ${humans === 1 ? 'Mensch' : 'Menschen'} am Tisch</li><li><b>${filled - humans}</b> ${filled - humans === 1 ? 'Bot' : 'Bots'}</li><li><b>${SEATS - filled}</b> ${SEATS - filled === 1 ? 'freier Platz' : 'freie Plätze'}</li></ul>` +
      (host ? `<p class="on-note">Freie Plätze besetzt du mit „Bot setzen“. Gespielt wird mit deinem Deck (${esc(deckLabel())}).</p>` : `<p class="on-note">Der Gastgeber richtet die Runde ein und startet die Partie.</p>`) + `</div>` +
      (host ? `<button type="button" class="btn primary su-start on-go" data-on="start"${humans < 2 || filled < 3 ? ' disabled' : ''}>Partie starten</button><p class="on-soon">${humans < 2 ? 'Warte, bis sich mindestens ein Freund an den Tisch gesetzt hat.' : filled < 3 ? 'Es braucht mindestens drei Spieler: Setz einen Bot auf einen freien Platz.' : 'Online-Partien kommen im nächsten Schritt. Die Lobby kannst du schon ausprobieren.'}</p>`
        : `<div class="panel on-p on-wait"><span class="on-dots"><i></i><i></i><i></i></span>Warte auf den Gastgeber …</div>`);
  }
  if (ON.err) side += `<p class="on-err">${esc(ON.err)}</p>`;
  return `<main class="pp-modes pd-st pd-bot pd-on tb-taverne${HUBON === 'open' ? ' unroll' : ''}" style="--tbl:url(${new URL(TABLES[0][2], document.baseURI).href})">` +
      `<section class="pd-stinfo su-mid on-side">${side}</section>` +
      `<section class="pd-stmap su-table on-table"><span class="pd-rod" aria-hidden="true"></span>` +
        `<div class="su-foes">${seats}</div><div class="su-deck" aria-hidden="true"><span class="back door"></span><span class="back treas"></span></div>` +
        `<div class="on-plate">${t ? `<small>Tisch</small><b>${ON.code}</b>` : `<small>Online</small><b>Mit Freunden</b>`}</div>` +
        `<button type="button" class="iconbtn pd-x" data-on="${t ? 'leave' : 'close'}" aria-label="${t ? 'Tisch verlassen' : 'Schließen'}" title="${t ? 'Tisch verlassen' : 'Schließen'}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg></button></section>` +
    `</main>`;
}
function renderOnline() { if (HUBON && CUR === 'title') renderHub(); if (onSignedIn() && !SOC.on) startSocial(); }
function openHubOnline() {
  const hub = $('#t-hub'), sec = $('#t-hub .pd-online'), main = $('#t-hub .pd');
  if (sec && main) { const a = main.getBoundingClientRect(), b = sec.getBoundingClientRect(); hub.style.setProperty('--from', b.height ? Math.round(b.top - a.top) + 'px' : '0px'); }
  closeAllSheets(); if (HUBBOT) hubBotsOff(); HUBST = false; HUBSEL = null; HUBON = 'open';
  if (CUR !== 'title') setScreen('title'); else renderHub();
  HUBON = true;
  resumeTable();
}
function closeHubOnline() {
  const m = $('#t-hub .pd-on'); if (m && !UI.reduce) { m.classList.remove('unroll'); m.classList.add('rollup'); }
  setTimeout(() => { HUBON = false; renderHub(); }, UI.reduce ? 0 : 420);
}
async function copyText(s, msg) { try { await navigator.clipboard.writeText(s); toast(msg); } catch (e) { toast(s); } }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-on]'); if (!b || b.disabled) return;
  const a = b.dataset.on, i = +b.dataset.i;
  if (a === 'create') createTable();
  else if (a === 'join') joinTable(($('#on-code') || {}).value || ON.joinCode);
  else if (a === 'leave') leaveTable();
  else if (a === 'close') closeHubOnline();
  else if (a === 'bot') seatBot(i);
  else if (a === 'free') freeSeat(i);
  else if (a === 'copycode') copyText(ON.code, 'Code kopiert');
  else if (a === 'copylink') copyText(tableLink(ON.code), 'Link kopiert');
  else if (a === 'start') toast('Die Online-Partie selbst kommt im nächsten Schritt.');
});
document.addEventListener('input', e => { if (e.target.id === 'on-code') { const v = cleanCode(e.target.value); if (v !== e.target.value) e.target.value = v; ON.joinCode = v; } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'on-code') joinTable(e.target.value); });
// Link plundo.eu/spiel/#tisch=CODE: Code übernehmen und die Lobby öffnen
function onHashEntry() {
  const m = location.hash.match(/tisch=([A-Za-z0-9]{5})/); if (!m) return;
  ON.joinCode = cleanCode(m[1]); history.replaceState(null, '', location.pathname + location.search);
  if (mq().pc.matches) { openHubOnline(); if (onSignedIn()) setTimeout(() => joinTable(ON.joinCode), 300); }
  else openSheet({id: 'online'});
}
window.addEventListener('hashchange', onHashEntry);
setTimeout(onHashEntry, 400);
// Freunde und Einladungen: Verbindung, sobald man angemeldet ist (am PC)
setTimeout(() => { if (NET_LOCAL) startSocial(); }, 600);

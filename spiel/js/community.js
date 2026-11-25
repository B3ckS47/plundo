'use strict';
/* ================= Gemeinschaft: Beitrittsanfragen, Spielerprofil, Melden, Notizen, Friendly-Score, Admin =================
   Daten in der Realtime Database:
     tables/{c}/allow/{uid}     true = darf sich setzen (Einladung des Gastgebers oder angenommene Anfrage)
     tables/{c}/reqs/{uid}      Beitrittsanfrage {name, pt, fr, ti, bg, tag, at, via, st: 'wait' | 'ok' | 'no'}
     users/{uid}/stats          eigene Online-Statistik {g, w} (Partien, Siege)
     users/{uid}/conduct/{gid}  vom Gastgeber eingetragen {c, at, to, left}: Zeit abgelaufen, Partie verlassen
     users/{uid}/warn/{id}      vom Admin bestätigte Meldung {at, r}
     users/{uid}/notes/{other}  eigene Notiz zu einem Spieler {t, at}, nur für einen selbst lesbar
     reports/{who}/{by}         Meldung {r, t, at, c, n, bn}, nur für Admins lesbar
     bans/{uid}                 Online-Sperre {until (-1 = dauerhaft), r, at}
     admins/{uid}               true = Admin (in der Firebase-Konsole eintragen) */
const REQ_COOLDOWN = 5 * 60000;
const REPORT_REASONS = [['griefing', 'Griefing', 'Spielt absichtlich so, dass anderen der Spaß verdorben wird'], ['absprache', 'Absprache', 'Spricht sich heimlich mit anderen ab'], ['cheat', 'Cheaten', 'Nutzt Fehler oder Hilfsmittel, um zu betrügen']];
const COMM = {req: null, reqOff: null, seenReqs: {}, prof: {}, notes: {}, admin: false, ban: null, reports: null, adminOff: null};

/* ---------- Beitrittsanfragen ---------- */
function myReqData(via) { return Object.assign(myPub(), {at: NET.now(), via: via || '', st: 'wait'}); }
function requestJoin(code, via) {
  return onBusy(async () => {
    if (!onSignedIn()) throw userErr('Für Online-Partien musst du angemeldet sein.');
    if (banActive()) throw userErr(banText());
    await NET.ready();
    const t = await NET.get('tables/' + code);
    if (!t || t.state === 'closed') throw userErr('Diesen Tisch gibt es nicht mehr.');
    if (Object.values(t.seats || {}).some(s => s && s.uid === netUid())) { await enterTable(code); return; }
    if (t.allow && t.allow[netUid()]) { ON.busy = false; await joinTable(code); return; }
    if (t.state !== 'lobby') throw userErr('An diesem Tisch läuft schon eine Partie.');
    if (!tableFree(t)) throw userErr('Der Tisch ist voll.');
    const cur = t.reqs && t.reqs[netUid()];
    if (cur && cur.st === 'no' && Date.now() - (cur.at || 0) < REQ_COOLDOWN) throw userErr(`Der Gastgeber hat deine Anfrage gerade abgelehnt. In ${Math.ceil((REQ_COOLDOWN - (Date.now() - cur.at)) / 60000)} Min. kannst du noch einmal fragen.`);
    if (!cur || cur.st !== 'wait') await NET.set(`tables/${code}/reqs/${netUid()}`, myReqData(via));
    watchMyReq(code);
    toast('Anfrage verschickt. Der Gastgeber entscheidet.');
  });
}
function watchMyReq(code) {
  if (COMM.reqOff) COMM.reqOff();
  COMM.req = {code, st: 'wait'};
  COMM.reqOff = NET.watch(`tables/${code}`, t => {
    const r = t && t.reqs && t.reqs[netUid()];
    if (!t || t.state === 'closed' || !r) { if (COMM.req && COMM.req.st === 'wait') toast('Der Tisch ist nicht mehr offen.'); return stopMyReq(); }
    if (r.st === 'ok') { stopMyReq(); joinTable(code); }
    else if (r.st === 'no') { stopMyReq(); Snd.sfx('thud'); toast('Der Gastgeber hat deine Anfrage abgelehnt.'); }
    else if (t.state !== 'lobby') { stopMyReq(); toast('Die Partie an diesem Tisch hat schon begonnen.'); }
  });
  renderOnline();
}
function stopMyReq(quiet) { if (COMM.reqOff) COMM.reqOff(); COMM.reqOff = null; COMM.req = null; if (!quiet) renderOnline(); }
function cancelMyReq() { const r = COMM.req; if (!r) return; stopMyReq(); NET.set(`tables/${r.code}/reqs/${netUid()}`, null).catch(() => {}); }
const openReqs = () => Object.entries((ON.t && ON.t.reqs) || {}).filter(([, r]) => r && r.st === 'wait');
function answerJoin(uid, yes) {
  if (!amHost() || !ON.code) return;
  return onBusy(async () => {
    if (yes && !tableFree(ON.t)) throw userErr('Der Tisch ist schon voll.');
    await NET.update('tables/' + ON.code, yes ? {['allow/' + uid]: true, ['reqs/' + uid + '/st']: 'ok'} : {['reqs/' + uid + '/st']: 'no'});
  });
}
function reqPanelHTML() {
  const list = openReqs(); if (!amHost() || !list.length) return '';
  return `<div class="panel on-p on-reqs"><h3>Möchte sich setzen</h3><ul class="fr-list">${list.map(([u, r]) =>
    `<li class="fr-row req">${seatFace(r)}<span class="fr-t"><b data-prof="${u}">${esc(r.name)}</b><small>${r.via ? `eingeladen von ${esc(r.via)}` : `#${esc(r.tag || '')}`}</small></span>` +
    `<button type="button" class="btn primary" data-comm="jyes" data-u="${u}">Setzen lassen</button><button type="button" class="fr-x" data-comm="jno" data-u="${u}" aria-label="Ablehnen" title="Ablehnen">×</button></li>`).join('')}</ul></div>`;
}
function myReqHTML() {
  if (!COMM.req) return '';
  return `<div class="panel on-p on-myreq"><span class="on-dots"><i></i><i></i><i></i></span><span>Deine Anfrage liegt beim Gastgeber.</span><button type="button" class="btn" data-comm="jcancel">Zurückziehen</button></div>`;
}
// Gastgeber: neue Anfrage mit Ton und Hinweis melden
function noticeReqs(t) {
  if (!t || t.host !== netUid()) return;
  Object.entries(t.reqs || {}).forEach(([u, r]) => { if (r && r.st === 'wait' && COMM.seenReqs[u] !== r.at) { COMM.seenReqs[u] = r.at; Snd.sfx('coin'); toast(`${esc(r.name)} möchte sich an deinen Tisch setzen.`); } });
}

/* ---------- Online-Sperre ---------- */
const banActive = () => !!(COMM.ban && (COMM.ban.until === -1 || COMM.ban.until > Date.now()));
const banText = () => COMM.ban.until === -1 ? 'Dein Online-Zugang ist dauerhaft gesperrt. Alles Gekaufte und das Spiel gegen Bots bleiben dir erhalten.'
  : `Dein Online-Zugang ist bis ${new Date(COMM.ban.until).toLocaleString('de-DE', {dateStyle: 'medium', timeStyle: 'short'})} gesperrt. Alles Gekaufte und das Spiel gegen Bots bleiben dir erhalten.`;
function banPanelHTML() { return banActive() ? `<div class="panel on-p on-ban"><h3>Online gesperrt</h3><p>${esc(banText())}</p>${COMM.ban.r ? `<p class="on-note">Grund: ${esc(COMM.ban.r)}</p>` : ''}</div>` : ''; }

/* ---------- Friendly-Score ---------- */
// Start bei 100. Verlassene Partie −8, viel Zeit verstreichen lassen (ab 3× in einer Partie) −3, sauber beendet +1, bestätigte Meldung −10.
function friendlyScore(conduct, warn) {
  let s = 100;
  Object.values(conduct || {}).sort((a, b) => (a.at || 0) - (b.at || 0)).slice(-60).forEach(e => { if (e.left) s -= 8; else if ((e.to || 0) >= 3) s -= 3; else s = Math.min(100, s + 1); });
  const since = Date.now() - 180 * 864e5;
  Object.values(warn || {}).forEach(w => { if ((w.at || 0) > since) s -= 10; });
  return Math.max(0, Math.min(100, s));
}
const scoreLabel = s => s >= 80 ? ['good', 'Vorbildlich'] : s >= 50 ? ['ok', 'In Ordnung'] : ['bad', 'Auffällig'];

/* ---------- Partie: Statistik und Verhalten ---------- */
const ONG_TO = {};
function ongGid() { const g = ON.t && ON.t.game; return g ? `${ONG.code}-${g.started}` : null; }
function conductWrite(uid, patch) {
  const gid = ongGid(); if (!ONG.host || !gid || !uid) return Promise.resolve();
  return NET.update(`users/${uid}/conduct/${gid}`, Object.assign({c: ONG.code, at: NET.now()}, patch)).catch(() => {});
}
// Gastgeber: am Ende der Partie für jeden Menschen eintragen, wie oft die Zeit ablief und ob er gegangen ist
function conductAtEnd() {
  if (!ONG.host || !ON.t || !ON.t.game) return;
  const map = ON.t.game.map || {}, seats = Object.values(ON.t.seats || {}).filter(Boolean);
  Object.entries(map).forEach(([uid, gs]) => conductWrite(uid, {to: ONG_TO[gs] || 0, left: !seats.some(x => x.uid === uid)}));
}
async function statsAtEnd() {
  if (!onSignedIn() || !S) return;
  const won = S.winner === 0;
  try { await NET.tx(`users/${netUid()}/stats`, cur => { const c = cur || {}; return {g: (c.g || 0) + 1, w: (c.w || 0) + (won ? 1 : 0)}; }); } catch (e) {}
}
const _ongGameOverC = ongGameOver;
ongGameOver = function () { if (!ONG.over) { conductAtEnd(); statsAtEnd(); } return _ongGameOverC(); };
// Gast hat den Tisch während der Partie verlassen: gleich eintragen
const _ongMarkAwayC = ongMarkAway;
ongMarkAway = function (notify) {
  _ongMarkAwayC(notify);
  if (!ONG.host || !ON.t || !ON.t.game) return;
  ONG.leftLogged = ONG.leftLogged || {};
  Object.entries(ONG.offState || {}).forEach(([uid, st]) => { if (st === 'left' && !ONG.leftLogged[uid]) { ONG.leftLogged[uid] = true; conductWrite(uid, {left: true}); } });
};

/* ---------- Spieler hinter einem Platz in der Partie ---------- */
function ongUidOf(ci) {
  if (!ONG.active || !ON.t || !ON.t.game || !S) return null;
  const n = S.players.length, map = ON.t.game.map || {};
  return Object.keys(map).find(u => (map[u] - ONG.seat + n) % n === ci) || null;
}
const friendState = uid => { const f = SOC.friends[uid]; return !f ? 'none' : f.mutual ? 'friend' : 'pending'; };
function addFriendUid(uid, name) {
  return onBusy(async () => {
    if (SOC.friends[uid]) return;
    await NET.set(`users/${SOC.uid}/friends/${uid}`, NET.now());
    await NET.set(`users/${uid}/req/${SOC.uid}`, Object.assign(myPub(), {at: NET.now()}));
    toast(`Freundschaftsanfrage an ${esc(name || 'den Spieler')} verschickt`);
  });
}
const IC = {
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M18 8v6M15 11h6"/></svg>',
  wait: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="18" cy="13" r="3.5"/><path d="M18 11.5V13l1 1"/></svg>',
  note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/></svg>',
  flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>'
};
// PC: kleine Knopfleiste unten rechts im Bereich eines Gegners (Freund, Notiz, Melden)
function seatActsHTML(p) {
  const uid = ongUidOf(p.id); if (!uid || uid === netUid()) return '';
  const fs = friendState(uid), note = COMM.notes[uid];
  const fb = fs === 'friend' ? `<i role="button" tabindex="0" class="gsa on" data-gsa="prof" data-u="${uid}" title="Ihr seid befreundet · Profil ansehen">${IC.heart}</i>`
    : fs === 'pending' ? `<i role="button" tabindex="0" class="gsa" data-gsa="prof" data-u="${uid}" title="Freundschaftsanfrage läuft · Profil ansehen">${IC.wait}</i>`
    : `<i role="button" tabindex="0" class="gsa" data-gsa="add" data-u="${uid}" data-n="${esc(p.name)}" title="Als Freund hinzufügen">${IC.plus}</i>`;
  return `<span class="gs-acts">${fb}<i role="button" tabindex="0" class="gsa${note && note.t ? ' has' : ''}" data-gsa="note" data-u="${uid}" data-n="${esc(p.name)}" title="${note && note.t ? esc('Notiz: ' + note.t) : 'Notiz schreiben'}">${IC.note}</i>` +
    `<i role="button" tabindex="0" class="gsa" data-gsa="rep" data-u="${uid}" data-n="${esc(p.name)}" title="Spieler melden">${IC.flag}</i></span>`;
}
// Im Gegnerblatt (Handy und PC): Profil, Freund, Melden
function oppCommHTML(p) {
  const uid = ongUidOf(p.id); if (!uid || uid === netUid()) return '';
  const fs = friendState(uid);
  return `<div class="comm-bar">${fs === 'friend' ? `<span class="comm-fr">${IC.heart}Ihr seid befreundet</span>` : fs === 'pending' ? `<span class="comm-fr wait">${IC.wait}Anfrage läuft</span>` : `<button type="button" class="btn small" data-gsa="add" data-u="${uid}" data-n="${esc(p.name)}">${IC.plus}Als Freund hinzufügen</button>`}` +
    `<button type="button" class="btn small" data-gsa="prof" data-u="${uid}">${IC.user}Profil</button><button type="button" class="btn small" data-gsa="rep" data-u="${uid}" data-n="${esc(p.name)}">${IC.flag}Melden</button></div>`;
}
const _oppView = SHEET_VIEWS.opp;
SHEET_VIEWS.opp = s => { const v = _oppView(s); if (v && ONG.active && S && S.players[s.pid]) v.body = oppCommHTML(S.players[s.pid]) + v.body; return v; };

/* ---------- Notizen (privat, im Konto) ---------- */
function watchNotes() { if (!SOC.uid || COMM.notesOff) return; COMM.notesOff = NET.watch(`users/${SOC.uid}/notes`, v => { COMM.notes = v || {}; if (CUR === 'game' && S) render(); }); }
function saveNote(uid, text) {
  const t = String(text || '').trim().slice(0, 500);
  COMM.notes[uid] = t ? {t, at: Date.now()} : null;
  return NET.set(`users/${SOC.uid}/notes/${uid}`, t ? {t, at: NET.now()} : null).then(() => toast(t ? 'Notiz gespeichert' : 'Notiz gelöscht')).catch(() => toast('Notiz konnte nicht gespeichert werden.'));
}
SHEET_VIEWS.note = s => ({head: h3(`Notiz zu ${esc(s.name || 'Spieler')}`), body: `<p class="hint">Nur du siehst diese Notiz. Sie hilft dir, den Spieler beim nächsten Mal einzuschätzen.</p>` +
  `<textarea id="comm-note" class="comm-ta" maxlength="500" rows="6" placeholder="z. B. verflucht gern den Führenden, hilft selten">${esc((COMM.notes[s.uid] || {}).t || '')}</textarea>` +
  `<div class="acts"><button type="button" class="btn primary" data-comm="notesave" data-u="${s.uid}">Speichern</button><button type="button" class="btn" data-sheetclose>Abbrechen</button></div>`});

/* ---------- Melden ---------- */
SHEET_VIEWS.report = s => ({head: h3(`${esc(s.name || 'Spieler')} melden`), body: `<p class="hint">Meldungen sieht nur das Plundo-Team. Wir prüfen jede einzeln. Bestätigte Meldungen senken den Friendly-Score, wiederholtes Fehlverhalten führt zur Online-Sperre.</p>` +
  `<div class="comm-reasons">${REPORT_REASONS.map(([k, l, d], i) => `<label class="comm-r"><input type="radio" name="comm-r" value="${k}"${i === 0 ? ' checked' : ''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</div>` +
  `<textarea id="comm-rt" class="comm-ta" maxlength="300" rows="3" placeholder="Was ist passiert? (freiwillig)"></textarea>` +
  `<div class="acts"><button type="button" class="btn primary" data-comm="repsend" data-u="${s.uid}" data-n="${esc(s.name || '')}">Meldung senden</button><button type="button" class="btn" data-sheetclose>Abbrechen</button></div>`});
async function sendReport(uid, name) {
  const r = (document.querySelector('input[name="comm-r"]:checked') || {}).value || 'griefing', t = (($('#comm-rt') || {}).value || '').trim().slice(0, 300);
  try {
    await NET.set(`reports/${uid}/${SOC.uid}`, {r, t, at: NET.now(), c: ONG.code || ON.code || '', n: name || '', bn: (PROFILE.name || '').slice(0, 16)});
    closeAllSheets(); toast('Danke! Wir schauen uns die Meldung an.');
  } catch (e) { toast('Die Meldung ließ sich nicht senden. Versuch es gleich noch einmal.'); }
}

/* ---------- Spielerprofil ---------- */
async function loadProf(uid) {
  const P = COMM.prof[uid] = COMM.prof[uid] || {uid, loading: true};
  try {
    const [pub, stats, conduct, warn, mine, theirs] = await Promise.all([NET.get(`users/${uid}/pub`), NET.get(`users/${uid}/stats`), NET.get(`users/${uid}/conduct`), NET.get(`users/${uid}/warn`),
      uid === SOC.uid ? null : NET.get(`users/${SOC.uid}/friends/${uid}`).catch(() => null), uid === SOC.uid ? null : NET.get(`users/${uid}/friends/${SOC.uid}`).catch(() => null)]);
    Object.assign(P, {pub, stats: stats || {}, conduct, warn, score: friendlyScore(conduct, warn), since: mine && theirs ? Math.max(+mine || 0, +theirs || 0) : 0, friend: !!(mine && theirs), loading: false});
  } catch (e) { P.loading = false; P.err = true; }
  if (SHEETS.length && topSheet().id === 'pprof' && topSheet().uid === uid) renderSheet(false);
}
function openProfile(uid) { if (!uid) return; openSheet({id: 'pprof', uid}); loadProf(uid); }
SHEET_VIEWS.pprof = s => {
  const P = COMM.prof[s.uid] || {loading: true}, pub = P.pub || (SOC.friends[s.uid] || {}).pub || {}, me = s.uid === SOC.uid;
  const bx = ALL_BGS.find(x => x[0] === pub.bg), ti = pub.ti && COSMETICS.title[pub.ti];
  const st = P.stats || {}, g = st.g || 0, w = st.w || 0, sc = P.score != null ? P.score : 100, [sk, sl] = scoreLabel(sc);
  const fs = me ? 'me' : P.friend ? 'friend' : friendState(s.uid);
  const head = `<div class="pp-hero${bx && bx[2] ? ' hasbg' : ''}" style="${bx && bx[2] ? `--bg:url('${bgSrc(bx)}');--bgp:${bx[4] || '50% 50%'}` : ''}">${seatFace(pub.pt ? pub : {pt: 'du'})}<span class="pp-who"><b>${esc(pub.name || 'Spieler')}</b>${ti ? `<em>${esc(ti)}</em>` : ''}<small>#${esc(pub.tag || '')}</small></span></div>`;
  let body = `<div class="pp-grid">` +
    `<div class="pp-cell"><small>Rang</small><b>–</b><em>Ligen starten mit der ersten Saison</em></div>` +
    `<div class="pp-cell"><small>Online-Partien</small><b>${g}</b><em>${w} gewonnen${g ? ` · ${Math.round(w / g * 100)} %` : ''}</em></div>` +
    `<div class="pp-cell fs-${sk}"><small>Friendly-Score</small><b>${P.loading ? '…' : sc}</b><em>${sl}</em><span class="pp-bar"><i style="width:${sc}%"></i></span></div>` +
    `<div class="pp-cell"><small>${me ? 'Das bist du' : 'Freundschaft'}</small><b>${fs === 'friend' ? 'Befreundet' : fs === 'pending' ? 'Anfrage läuft' : me ? 'Du' : 'Nicht befreundet'}</b><em>${fs === 'friend' && P.since ? 'seit ' + new Date(P.since).toLocaleDateString('de-DE', {day: 'numeric', month: 'long', year: 'numeric'}) : fs === 'friend' ? 'seit einiger Zeit' : ''}</em></div></div>`;
  if (!me) {
    const note = (COMM.notes[s.uid] || {}).t || '';
    body += `<div class="pp-note"><small>Deine Notiz</small>${note ? `<p>${esc(note)}</p>` : '<p class="hint">Noch keine Notiz.</p>'}</div>` +
      `<div class="acts">${fs === 'none' ? `<button type="button" class="btn primary" data-gsa="add" data-u="${s.uid}" data-n="${esc(pub.name || '')}">Als Freund hinzufügen</button>` : ''}` +
      `<button type="button" class="btn" data-gsa="note" data-u="${s.uid}" data-n="${esc(pub.name || '')}">${note ? 'Notiz bearbeiten' : 'Notiz schreiben'}</button>` +
      `<button type="button" class="btn" data-gsa="rep" data-u="${s.uid}" data-n="${esc(pub.name || '')}">Melden</button></div>`;
  }
  if (COMM.admin && !me) body += adminPlayerHTML(s.uid);
  return {head, body};
};

/* ---------- PC-Startseite: Freunde, die gerade online sind ---------- */
function friendsOnlineHTML() {
  if (!onSignedIn() || !SOC.on) return '';
  const on = friendsSorted().filter(f => f.mutual && f.online);
  const card = f => { const p = f.pub || {}, bx = ALL_BGS.find(x => x[0] === p.bg), ti = p.ti && COSMETICS.title[p.ti], t = f.table && SOC.tables[f.table];
    const st = t && t.state === 'play' ? 'spielt gerade' : t && t.state === 'lobby' ? `am Tisch · ${SEATS - tableFree(t)}/${SEATS}` : 'online';
    return `<button type="button" class="pfo-card${bx && bx[2] ? ' hasbg' : ''}" data-prof="${f.uid}" style="${bx && bx[2] ? `--bg:url('${bgSrc(bx, true)}');--bgp:${bx[4] || '50% 50%'}` : ''}">${seatFace(p)}<span class="pfo-t"><b>${esc(p.name || 'Freund')}</b>${ti ? `<em>${esc(ti)}</em>` : ''}<small><i class="fr-dot"></i>${st}</small></span></button>`; };
  return `<div class="pd-friends"><span class="pfo-h">Freunde online <b>${on.length}</b></span>` +
    (on.length ? `<div class="pfo-list">${on.slice(0, 5).map(card).join('')}${on.length > 5 ? `<span class="pfo-more">und ${on.length - 5} weitere</span>` : ''}</div>` : `<p class="pfo-none">Gerade ist keiner deiner Freunde online.</p>`) + `</div>`;
}

/* ---------- Laufende Online-Partie: über „Spielen“ zurück, Hinweis auf anderen Seiten ---------- */
function ongRunning() { return ONG.active && !ONG.over; }
setInterval(() => {
  let pill = $('#ongback'); const show = ongRunning() && CUR !== 'game';
  if (!show) { if (pill) pill.remove(); return; }
  if (!pill) { pill = document.createElement('button'); pill.type = 'button'; pill.id = 'ongback'; pill.dataset.comm = 'back'; document.body.appendChild(pill); }
  const my = !!(UI.prompt || UI.sel);
  pill.classList.toggle('hot', my);
  patch(pill, `<span class="on-dots"><i></i><i></i><i></i></span><span>${my ? '<b>Du bist dran!</b> Zurück zur Partie' : 'Online-Partie läuft · zurück'}</span>`);
}, 700);

/* ---------- Admin ---------- */
async function checkAdmin() {
  try { COMM.admin = !!(await NET.get(`admins/${SOC.uid}`)); } catch (e) { COMM.admin = false; }
  if (COMM.admin && !COMM.adminOff) COMM.adminOff = NET.watch('reports', v => { COMM.reports = v || {}; socRender(); if (SHEETS.length && topSheet().id === 'admin') renderSheet(false); });
  socRender();
}
const reportCount = () => Object.values(COMM.reports || {}).reduce((n, x) => n + Object.keys(x || {}).length, 0);
function adminBtnHTML() { return COMM.admin ? `<button type="button" class="btn on-admin" data-comm="admin">Admin: Meldungen <b>${reportCount()}</b></button>` : ''; }
function adminPlayerHTML(uid) {
  const P = COMM.prof[uid] || {}, b = P.ban;
  const btn = (l, ms) => `<button type="button" class="btn small" data-comm="ban" data-u="${uid}" data-ms="${ms}">${l}</button>`;
  return `<div class="adm-box"><small>Admin</small><p>${b && (b.until === -1 || b.until > Date.now()) ? `Gesperrt ${b.until === -1 ? 'dauerhaft' : 'bis ' + new Date(b.until).toLocaleString('de-DE')}` : 'Nicht gesperrt'}${P.score != null && P.score < 50 ? ' · <b class="adm-warn">Score unter 50: Sperre prüfen</b>' : ''}</p>` +
    `<div class="adm-acts">${btn('1 Tag', 864e5)}${btn('7 Tage', 7 * 864e5)}${btn('30 Tage', 30 * 864e5)}${btn('Dauerhaft', -1)}<button type="button" class="btn small" data-comm="unban" data-u="${uid}">Sperre aufheben</button></div></div>`;
}
const _loadProf = loadProf;
loadProf = async function (uid) { if (COMM.admin) { try { (COMM.prof[uid] = COMM.prof[uid] || {uid}).ban = await NET.get('bans/' + uid); } catch (e) {} } return _loadProf(uid); };
SHEET_VIEWS.admin = () => {
  const rep = COMM.reports || {}, whos = Object.keys(rep).sort((a, b) => Object.keys(rep[b]).length - Object.keys(rep[a]).length);
  const rl = k => (REPORT_REASONS.find(x => x[0] === k) || [k, k])[1];
  const body = whos.length ? whos.map(u => { const list = Object.entries(rep[u] || {}), name = (list[0] && list[0][1].n) || 'Spieler';
    return `<div class="panel adm-p"><div class="adm-h"><b data-prof="${u}">${esc(name)}</b><span>${list.length} ${list.length === 1 ? 'Meldung' : 'Meldungen'}</span><button type="button" class="btn small" data-prof="${u}">Profil und Sperre</button></div>` +
      `<ul class="adm-list">${list.map(([by, r]) => `<li><b>${esc(rl(r.r))}</b> von ${esc(r.bn || 'Spieler')} · ${new Date(r.at || 0).toLocaleString('de-DE', {dateStyle: 'short', timeStyle: 'short'})}${r.c ? ` · Tisch ${esc(r.c)}` : ''}${r.t ? `<q>${esc(r.t)}</q>` : ''}` +
        `<span class="adm-acts"><button type="button" class="btn small primary" data-comm="confirm" data-u="${u}" data-by="${by}">Bestätigen (−10)</button><button type="button" class="btn small" data-comm="dismiss" data-u="${u}" data-by="${by}">Verwerfen</button></span></li>`).join('')}</ul></div>`; }).join('')
    : '<p class="hint">Keine offenen Meldungen.</p>';
  return {head: h3('Admin: Meldungen'), body: `<p class="hint">Bestätigen senkt den Friendly-Score des Spielers um 10 und erledigt die Meldung. Verwerfen löscht sie ohne Folgen. Sperren gelten nur für den Online-Modus.</p>${body}`};
};
async function adminConfirm(u, by) {
  const r = (COMM.reports[u] || {})[by]; if (!r) return;
  try { await NET.set(`users/${u}/warn/${by}-${r.at}`, {at: NET.now(), r: r.r}); await NET.set(`reports/${u}/${by}`, null); toast('Meldung bestätigt'); } catch (e) { toast('Hat nicht geklappt: ' + onErr(e)); }
}
async function adminBan(u, ms) {
  const until = ms === -1 ? -1 : Date.now() + ms, r = window.prompt('Grund der Sperre (sieht der Spieler):', 'Wiederholtes Fehlverhalten in Online-Partien');
  if (r === null) return;
  try { await NET.set('bans/' + u, {until, r: r.slice(0, 200), at: NET.now()}); toast('Sperre gesetzt'); loadProf(u); } catch (e) { toast('Hat nicht geklappt: ' + onErr(e)); }
}
async function adminUnban(u) { try { await NET.set('bans/' + u, null); toast('Sperre aufgehoben'); loadProf(u); } catch (e) { toast('Hat nicht geklappt: ' + onErr(e)); } }

/* ---------- Start nach der Anmeldung ---------- */
const _startSocialC = startSocial;
startSocial = async function () {
  const had = SOC.uid;
  await _startSocialC();
  if (!SOC.uid || had === SOC.uid) return;
  watchNotes();
  COMM.banOff = NET.watch('bans/' + SOC.uid, v => { COMM.ban = v; socRender(); });
  checkAdmin();
};
const _stopSocialC = stopSocial;
stopSocial = function () { _stopSocialC(); ['notesOff', 'banOff', 'adminOff'].forEach(k => { if (COMM[k]) COMM[k](); COMM[k] = null; }); Object.assign(COMM, {notes: {}, admin: false, ban: null, reports: null, prof: {}}); stopMyReq(true); };

/* ---------- Klicks ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-gsa]');
  if (g) {
    e.preventDefault(); e.stopPropagation();
    const u = g.dataset.u, n = g.dataset.n, a = g.dataset.gsa;
    if (a === 'add') addFriendUid(u, n).then(() => { if (CUR === 'game') render(); if (SHEETS.length) renderSheet(false); });
    else if (a === 'prof') openProfile(u);
    else if (a === 'note') openSheet({id: 'note', uid: u, name: n});
    else if (a === 'rep') openSheet({id: 'report', uid: u, name: n});
    return;
  }
  const pf = e.target.closest('[data-prof]'); if (pf) { e.preventDefault(); e.stopPropagation(); openProfile(pf.dataset.prof); return; }
  const c = e.target.closest('[data-comm]'); if (!c) return;
  const a = c.dataset.comm, u = c.dataset.u;
  if (a === 'jyes') answerJoin(u, true); else if (a === 'jno') answerJoin(u, false);
  else if (a === 'jcancel') cancelMyReq();
  else if (a === 'notesave') { saveNote(u, ($('#comm-note') || {}).value); popSheet(); if (CUR === 'game') render(); }
  else if (a === 'repsend') sendReport(u, c.dataset.n);
  else if (a === 'back') { closeAllSheets(); setScreen('game'); }
  else if (a === 'admin') openSheet({id: 'admin'});
  else if (a === 'confirm') adminConfirm(u, c.dataset.by);
  else if (a === 'dismiss') NET.set(`reports/${u}/${c.dataset.by}`, null).catch(() => {});
  else if (a === 'ban') adminBan(u, +c.dataset.ms);
  else if (a === 'unban') adminUnban(u);
}, true);
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-gsa]')) { e.preventDefault(); e.target.click(); } });

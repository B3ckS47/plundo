/* ================= Online-Tisch: die Partie läuft beim Gastgeber in einem Worker =================
   Der Worker rechnet die Partie mit derselben Spiellogik wie das Einzelspiel (engine.js).
   Alle Menschen am Tisch (auch der Gastgeber) sind hier „Mitspieler aus dem Netz“: Ihre Entscheidungen kommen als Nachricht,
   und jeder bekommt nach jeder Änderung den Spielstand aus seiner Sicht (eigene Handkarten offen, fremde verdeckt).
   Nachrichten an den Worker:  start {seats, cfg, counts} · ans {seat, id, v} · sel {seat, id, uids} · act {seat, uid, where, label} · sell {seat}
   Nachrichten vom Worker:     view {seat, json} · over {winner} · err {msg} */
self.window = self;
self.document = {};   // damit die Spiellogik mit Pausen spielt (sonst wäre alles sofort vorbei)
self.matchMedia = () => ({matches: false});
importScripts('engine.js');

let CFG = {turn: 60}, PSEQ = 1, VSEQ = 0, FXQ = [], FXN = 0, PUB = 0;
const LAST = {};
function render() { if (!PUB) PUB = setTimeout(publish, 90); }

/* ---------- Fragen an die Menschen: je Sitz eine Warteschlange ---------- */
const QUEUE = {}, AWAY = {};
SERVER = {
  prompts: {}, sels: {},
  ask(who, get, ctx, data) {
    return new Promise(res => { enqueue(who.id, {kind: 'ask', id: PSEQ++, get, ctx, data, res}); });
  },
  sel(who, o) {
    return new Promise(res => { enqueue(who.id, {kind: 'sel', id: PSEQ++, o, res}); });
  }
};
function enqueue(seat, job) { (QUEUE[seat] = QUEUE[seat] || []).push(job); if (QUEUE[seat].length === 1) activate(seat); }
function activate(seat) {
  const job = QUEUE[seat] && QUEUE[seat][0];
  SERVER.prompts[seat] = null; SERVER.sels[seat] = null;
  if (!job) { render(); return; }
  if (job.kind === 'ask') SERVER.prompts[seat] = job; else { SERVER.sels[seat] = job; SERVER.prompts[seat] = SERVER.prompts[seat] || null; }
  job.at = Date.now();
  if (job.timer) clearTimeout(job.timer);
  const secs = AWAY[seat] ? Math.min(CFG.turn || 20, 20) : CFG.turn;
  if (secs > 0) { job.deadline = Date.now() + secs * 1000; job.timer = setTimeout(() => autoAnswer(seat, job.id), secs * 1000 + 300); }
  render();
}
function finish(seat, id, v) {
  const q = QUEUE[seat], job = q && q[0];
  if (!job || job.id !== id) return false;
  clearTimeout(job.timer); q.shift();
  activate(seat);
  job.res(v);
  return true;
}
// Zugzeit abgelaufen: der naheliegende Zug (Hauptknopf; bei einer Auswahl das Nötigste)
function autoAnswer(seat, id) {
  const job = QUEUE[seat] && QUEUE[seat][0]; if (!job || job.id !== id) return;
  postMessage({t: 'to', seat});   // für den Friendly-Score: Zeit abgelaufen
  if (job.kind === 'ask') {
    const q = asSeat(seat, () => job.get()), opts = (q && q.opts || []).filter(o => !o.dis && o.kind !== 'ghost');
    const o = opts.find(x => x.kind === 'primary') || opts[0];
    finish(seat, id, o ? o.v : undefined);
  } else {
    const o = job.o;
    if (o.cancel || o.optional) { finish(seat, id, null); return; }
    const p = P(seat), allowed = selAllowed(seat, o).map(u => findCard(u, p)).filter(Boolean).sort((a, b) => keepValue(p, a) - keepValue(p, b));
    finish(seat, id, allowed.slice(0, o.min || 1).map(c => c.uid));
  }
}
function asSeat(seat, fn) { const keep = ACT; ACT = seat; try { return fn(); } finally { ACT = keep; } }
function selAllowed(seat, o) {
  const p = P(seat), out = [];
  asSeat(seat, () => { [['hand', p.hand], ['eq', p.eq], ['pack', p.pack]].forEach(([w, a]) => a.forEach(c => { try { if (o.filter(c, w)) out.push(c.uid); } catch (e) {} })); });
  return out;
}

/* ---------- Spielstand je Sitz: gedreht (eigener Platz = 0), fremde Hände und Stapel verdeckt ---------- */
const N = () => S.players.length;
const rot = (id, seat) => id == null || id < 0 ? id : (id - seat + N()) % N();
const hidden = n => Array.from({length: n}, (_, i) => ({uid: -(i + 1), k: 'monster', n: '?', hidden: true}));
function viewPlayer(p, seat) {
  const o = Object.assign({}, p);
  o.id = rot(p.id, seat); o.human = p.id === seat;
  if (p.id !== seat) o.hand = hidden(p.hand.length);
  return o;
}
function rotKeys(obj, seat) { const o = {}; Object.keys(obj || {}).forEach(k => { o[rot(+k, seat)] = obj[k]; }); return o; }
function viewCombat(C, seat) {
  if (!C) return null;
  const o = Object.assign({}, C);
  o.f = rot(C.f, seat); o.h = C.h == null ? null : rot(C.h, seat);
  ['asked', 'intf', 'stabbed'].forEach(k => { o[k] = rotKeys(C[k], seat); });
  o.played = {}; Object.keys(C.played || {}).forEach(u => { o.played[u] = rot(C.played[u], seat); });
  o.mB = (C.mB || []).map(b => Object.assign({}, b, b.by != null ? {by: rot(b.by, seat)} : {}));
  return o;
}
// Daten einer Frage: Spieler werden zu Verweisen, Karten bleiben, wie sie sind
function packData(d, seat, depth = 0) {
  if (d == null || typeof d !== 'object' || depth > 4) return d;
  if (Array.isArray(d)) return d.map(x => packData(x, seat, depth + 1));
  if (d.hand && d.eq && typeof d.id === 'number' && d.lvl != null) return {$p: rot(d.id, seat)};
  const o = {}; Object.keys(d).forEach(k => { o[k] = packData(d[k], seat, depth + 1); }); return o;
}
function buildView(seat) {
  const Sv = {
    players: S.players.map(p => viewPlayer(p, seat)).sort((a, b) => a.id - b.id),
    door: S.door.length, tr: S.tr.length, doorDisc: S.doorDisc.slice(-3), trDisc: S.trDisc.slice(-3), doorDiscN: S.doorDisc.length, trDiscN: S.trDisc.length,
    cur: rot(S.cur, seat), turn: S.turn, phase: S.phase, combat: viewCombat(S.combat, seat), reveal: S.reveal, log: S.log.slice(-70), winner: S.winner == null ? null : rot(S.winner, seat),
    goal: S.goal, tides: S.tides, spring: S.spring, draft: S.draft, lastCursed: S.lastCursed == null ? null : rot(S.lastCursed, seat)
  };
  let prompt = null, sel = null;
  const job = QUEUE[seat] && QUEUE[seat][0];
  if (job && job.kind === 'ask') {
    const q = asSeat(seat, () => { try { return job.get(); } catch (e) { return null; } });
    if (q) prompt = {id: job.id, ctx: job.ctx, q: {title: q.title, text: q.text, hint: q.hint, opts: (q.opts || []).map(o => ({l: o.l, v: o.v, kind: o.kind, dis: o.dis || false}))}, data: packData(job.data, seat), deadline: job.deadline || 0};
  } else if (job && job.kind === 'sel') {
    const o = job.o;
    sel = {id: job.id, ctx: o.ctx, title: o.title, text: o.text, min: o.min, max: o.max, cancel: !!o.cancel, optional: !!o.optional, allowed: selAllowed(seat, o), pre: o.pre || [], confirm: asSeat(seat, () => { try { return o.confirm([]); } catch (e) { return 'Bestätigen'; } }), deadline: job.deadline || 0};
  }
  // Wer gerade entscheidet (für „wartet auf …“)
  const wait = Object.keys(QUEUE).filter(k => QUEUE[k] && QUEUE[k].length && +k !== seat).map(k => rot(+k, seat));
  return {v: ++VSEQ, seat, S: Sv, prompt, sel, roll: UI.roll, fx: FXQ.slice(-12).map(f => ({n: f.n, t: f.t, d: packData(f.d, seat)})), wait};
}
function publish() {
  PUB = 0; if (!S) return;
  S.players.forEach(p => {
    if (!p.human) return;
    const json = JSON.stringify(buildView(p.id));
    const key = json.replace(/"v":\d+,/, '');
    if (LAST[p.id] === key) return;
    LAST[p.id] = key;
    postMessage({t: 'view', seat: p.id, json});
  });
}
FX_HANDLER = (t, d) => { FXQ.push({n: ++FXN, t, d}); if (FXQ.length > 30) FXQ.shift(); render(); if (t === 'gameover') postMessage({t: 'over', winner: d.winner}); };

/* ---------- Start und Nachrichten der Mitspieler ---------- */
function startGame(m) {
  CFG = Object.assign({turn: 60}, m.cfg || {});
  TOKEN++; UID = 1; SCN = null;
  UI.speed = CFG.speed || 'normal'; UI.diff = CFG.diff || 'normal'; UI.coach = false; UI.open = false; UI.seen = {};
  DECK_COUNTS = m.counts || null;
  const d = buildDecks(m.counts);
  S = {players: [], door: d.door, tr: d.tr, doorDisc: [], trDisc: [], cur: 0, turn: 1, phase: 0, combat: null, reveal: null, log: [], winner: null, scn: null, online: true, draft: true,
    stats: {played: 0, lvlLost: 0, curses: 0, help: 0, ran: 0, bossBy: null, bossHelped: false, fightWon: false}};
  if (CFG.goal && CFG.goal !== 10) S.goal = CFG.goal;
  m.seats.forEach((s, i) => { const p = newPlayer(i, s.name, !s.bot); Object.assign(p, {face: s.face, uid: s.uid || null, fr: s.fr || null, ti: s.ti || null, pt: s.pt || null, bg: s.bg || null}); if (s.style) p.style = s.style; S.players.push(p); });
  S.tides = [...S.door, ...S.tr].some(c => c.w === 4);
  buildCatalog(allCards());
  log(`Online-Partie mit Draft. Wer zuerst Stufe ${WINLVL()} erreicht, gewinnt. ${S.players[0].name} beginnt. Zuerst wählt jeder seine Starthand: 4 Türkarten, dann 4 Schatzkarten.`, 'sys');
  fx('newgame');
  const t = TOKEN;
  draftStart(t).then(() => gameLoop(t)).catch(e => { if (e !== STALE) { console.error(e); postMessage({t: 'err', msg: String(e && e.message || e)}); } });
}
onmessage = e => {
  const m = e.data || {};
  try {
    if (m.t === 'start') startGame(m);
    else if (m.t === 'ans') finish(m.seat, m.id, m.v);
    else if (m.t === 'sel') { const job = QUEUE[m.seat] && QUEUE[m.seat][0]; if (job && job.kind === 'sel' && job.id === m.id) { const ok = m.uids && selAllowed(m.seat, job.o); finish(m.seat, m.id, m.uids ? m.uids.filter(u => ok.includes(u)) : null); } }
    else if (m.t === 'act') {
      asSeat(m.seat, () => {
        const p = P(m.seat), c = findCard(m.uid, p); if (!c) return;
        const a = cardActions(c, m.where).find(x => x.l === m.label && x.fn && !x.dis); if (a) { const r = a.fn(); if (r && r.catch) r.catch(err => { if (err !== STALE) console.error(err); }); }
      });
      render();
    } else if (m.t === 'sell') { asSeat(m.seat, () => { const r = startSell(); if (r && r.catch) r.catch(() => {}); }); render(); }
    else if (m.t === 'away') { AWAY[m.seat] = !!m.away; const job = QUEUE[m.seat] && QUEUE[m.seat][0]; if (job) { clearTimeout(job.timer); job.timer = null; activate(m.seat); } }
    else if (m.t === 'stop') { TOKEN++; S = null; }
  } catch (err) { console.error(err); postMessage({t: 'err', msg: String(err && err.message || err)}); }
};

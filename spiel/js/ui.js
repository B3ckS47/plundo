'use strict';
/* ================= Plundo · Handy-Oberfläche ================= */
const APP_VERSION = '1.0';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const ICON = {
  phase: ['icons/phase-tuer.png', 'icons/phase-aerger.png', 'icons/phase-pluendern.png', 'icons/phase-gabe.png'],
  kampf: 'icons/wert-kampf.png', run: 'icons/wert-weglaufen.png', hand: 'icons/wert-hand.png', gold: 'icons/wert-gold.png',
  slot: {kopf: 'icons/icon-kopf.png', ruestung: 'icons/icon-ruestung.png', schuhe: 'icons/icon-schuhe.png', hand: 'icons/icon-haende.png',
    none: 'icons/icon-sonstiges.png', pack: 'icons/icon-rucksack.png', race: 'icons/icon-rasse.png', cls: 'icons/icon-klasse.png'},
  portrait: {Du: 'icons/portrait-du.png', Berta: 'icons/portrait-berta.png', Kalle: 'icons/portrait-kalle.png', Uschi: 'icons/portrait-uschi.png',
    Rosi: 'icons/portrait-rosi.png', Fridolin: 'icons/portrait-fridolin.png', Gustav: 'icons/portrait-gustav.png', Hilde: 'icons/portrait-hilde.png',
    Flora: 'icons/portrait-flora.png', Trudi: 'icons/portrait-trudi.png', Walter: 'icons/portrait-walter.png',
    Bruno: 'icons/portrait-bruno.png', Gesine: 'icons/portrait-gesine.png', Sunny: 'icons/portrait-sunny.png',
    Walburga: 'icons/portrait-walburga.png', Pepe: 'icons/portrait-pepe.png', Sardella: 'icons/portrait-sardella.png'}
};
const DICE = [1, 2, 3, 4, 5, 6].map(n => `icons/wuerfel-${n}.png`);
const PHASES = ['Tür öffnen', 'Monster herausfordern', 'Raum durchsuchen', 'Abgabe'];
const portrait = p => p.human ? myPortrait() : (p.face || ICON.portrait[p.name] || ICON.portrait.Du);

/* ================= Profil: Name, Porträt, Rahmen ================= */
const K_PROFILE = 'loota.profile';
const PORTRAITS = [
  ['du', 'Abenteurer', 'icons/portrait-du.png'], ['abenteurerin', 'Abenteurerin', 'icons/portrait-abenteurerin.png'], ['elf', 'Elfe', 'icons/portrait-elfe.png'],
  ['zwerg', 'Zwerg', 'icons/portrait-zwerg.png'], ['halbling', 'Koboldin', 'icons/portrait-koboldin.png'], ['krieger', 'Kriegerin', 'icons/portrait-kriegerin.png'],
  ['zauberer', 'Zauberer', 'icons/portrait-zauberer.png'], ['dieb', 'Hehlerin', 'icons/portrait-diebin.png'], ['priester', 'Exorzist', 'icons/portrait-priester.png']
];
// Zufällige Gegner im freien Spiel: ein Profilbild (nicht deins), ein Name, der zum Bild passt, und eine Spielweise
const BOT_NAMES = {
  du: ['Alrik', 'Jorin', 'Torben', 'Lasse', 'Hennes'], abenteurerin: ['Linnea', 'Merle', 'Ylva', 'Smilla', 'Frieda'], elf: ['Elwira', 'Ilvana', 'Sirana', 'Lyria', 'Faelis'],
  zwerg: ['Grimbart', 'Brokk', 'Gundolf', 'Barthel', 'Ragnar'], halbling: ['Rosalie', 'Tilda', 'Hanne', 'Mirabell', 'Fenna'], krieger: ['Brunhilde', 'Gunhild', 'Kriemhild', 'Walburga', 'Svea'],
  zauberer: ['Wendelin', 'Ottokar', 'Balduin', 'Eusebius', 'Mirko'],
  dieb: ['Fenja', 'Nyra', 'Kira', 'Elster', 'Mara'], priester: ['Bonifaz', 'Kunibert', 'Anselm', 'Benno', 'Gregor']
};
const pick = a => a[Math.floor(Math.random() * a.length)];
function rollRoster() {
  const faces = PORTRAITS.filter(x => x[0] !== PROFILE.portrait && BOT_NAMES[x[0]]).sort(() => Math.random() - 0.5).slice(0, 3);
  const styles = BOT_STYLES.slice().sort(() => Math.random() - 0.5), used = new Set([PROFILE.name]);
  return faces.map(([k, , src], i) => { let n = pick(BOT_NAMES[k]); while (used.has(n)) n = pick(BOT_NAMES[k]); used.add(n); return {name: n, face: src, style: styles[i]}; });
}
let ROSTER = null;
const FRAMES = [['gold', 'Gold', '#e9cf9a'], ['silber', 'Silber', '#dfe5ea'], ['bronze', 'Bronze', '#c8875a'], ['rubin', 'Rubin', '#c0392b'], ['smaragd', 'Smaragd', '#3f9a5c'], ['saphir', 'Saphir', '#3d6fb5']];
const PROFILE = Object.assign({id: null, name: '', portrait: 'du', frame: 'gold'}, (() => { try { return JSON.parse(localStorage.getItem(K_PROFILE)); } catch (e) { return null; } })() || {});
if (!PROFILE.id) { PROFILE.id = (crypto.randomUUID ? crypto.randomUUID() : 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2)); try { localStorage.setItem(K_PROFILE, JSON.stringify(PROFILE)); } catch (e) {} }
function saveProfile() { try { localStorage.setItem(K_PROFILE, JSON.stringify(PROFILE)); } catch (e) {} applyProfile(); }
// Aus dem Storymodus freischaltbar: [Schlüssel, Name, Bild/Farbe, Freischalt-ID]
const ALL_PORTRAITS = [...PORTRAITS, ...Object.entries(COSMETICS.portrait).map(([k, v]) => [k, v.n, v.src, 'portrait:' + k])];
const ALL_FRAMES = [...FRAMES, ...Object.entries(COSMETICS.frame).map(([k, v]) => [k, v.n, v.c, 'frame:' + k])];
const cosOpen = x => !x[3] || owns(x[3]);
// Hintergründe: [Schlüssel, Name, Grafik, Freischalt-ID, Schwerpunkt]. Vom Start an gibt es nur „Ohne“.
const BACKDROPS = [['keiner', 'Ohne', '']];
const ALL_BGS = [...BACKDROPS, ...Object.entries(COSMETICS.bg).map(([k, v]) => [k, v.n, `art/kulisse-${k}.webp`, 'bg:' + k, v.p || '50% 50%'])];
// Absolute Adresse, weil url() in einer CSS-Variable sonst relativ zu css/ aufgelöst wird
const bgSrc = (x, small) => x && x[2] ? new URL(small ? x[2].replace('.webp', '-k.webp') : x[2], document.baseURI).href : '';
function myBg() { return ALL_BGS.find(q => q[0] === PROFILE.bg && cosOpen(q)) || BACKDROPS[0]; }
// Bots: feste Optik passend zum Namen, aus stimmigen Paaren von Hintergrund und Rahmen.
// Im Online-Modus kommt sie später vom Mitspieler selbst.
const BOT_LOOKS = [
  ['staedtchen', 'kupferkessel', 'bierdeckel', 'eichenholz', 'gold'], ['weinkeller', 'rattengrau', 'kerzenwachs', 'goldkronkorken', 'bronze'],
  ['zauberwald', 'moosgruen', 'fliegenpilz', 'leuchtpilz', 'smaragd'], ['sandstrand', 'strandtuch', 'moewenfeder', 'rettungsring', 'saphir'],
  ['hohesee', 'walblau', 'meeresschaum', 'dublonengold', 'korallenrot'], ['sternennacht', 'mitternacht', 'lavendel', 'perlmutt', 'silber'],
  ['abendrot', 'abendrot', 'eichenholz', 'rubin'], ['schatzkammer', 'truhenbeschlag', 'schluesselbund', 'edelsteine', 'gold'],
  ['keiner', 'gold', 'silber', 'bronze', 'rubin', 'smaragd', 'saphir']];
function botLook(p) {
  let h = 0; for (const ch of p.name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const L = BOT_LOOKS[h % BOT_LOOKS.length], fk = L[1 + (h >>> 8) % (L.length - 1)];
  return {bg: ALL_BGS.find(x => x[0] === L[0]) || BACKDROPS[0], frame: ALL_FRAMES.find(x => x[0] === fk) || FRAMES[0]};
}
function bgOf(p) { return p.human ? myBg() : botLook(p).bg; }
// Rahmen eines Spielers: [Schlüssel, Name, Farbe]
function frameOf(p) { return p.human ? (ALL_FRAMES.find(q => q[0] === PROFILE.frame && cosOpen(q)) || FRAMES[0]) : botLook(p).frame; }
// Porträt mit Rahmengrafik für die großen Köpfe (Profil im Spiel)
function bigPortrait(p) {
  const f = frameOf(p), art = frameArt(f[0]), me = p.human ? ' me' : '';
  return `<span class="pfw${art ? ' fa' : ''}" style="--pfimgk:${art ? `url('${new URL(frameArt(f[0], true), document.baseURI).href}')` : 'none'};--fc:${f[2]}"><img class="pt${me}" src="${portrait(p)}" alt=""></span>`;
}
// Klasse und Stil für eine Fläche mit Hintergrund (leer, wenn keiner gewählt ist)
const bgAttr = (x, small) => x && x[2] ? ` hasbg" style="--bg:url('${bgSrc(x, small)}');--bgp:${x[4] || '50% 50%'}` : '';
// Hinweis, wo man eine gesperrte Optik bekommt
function cosmeticSource(id) {
  for (const w of WORLDS) for (const st of w.stations) {
    if (st.reward === id) return `${cosmeticName(id)}: Belohnung in ${wLabel(w)}, Station ${st.no} „${st.name}“.`;
    const it = (st.shop || []).find(x => x.id === id);
    if (it) return `${cosmeticName(id)}: in ${wLabel(w)} bei „${st.name}“ für ${it.price} Münzen.`;
  }
  for (const w of WORLDS) if (w.starReward && w.starReward.id === id) return `${cosmeticName(id)}: für ${w.starReward.n} Sterne in ${wLabel(w)}.`;
  if (id === STREAK_FRAME) return `${cosmeticName(id)}: steckt in der Goldtruhe, die es alle 7 Tage Auftrags-Serie gibt.`;
  if (CHEST_ITEMS.gold.includes(id)) return `${cosmeticName(id)}: selten, nur in der Goldtruhe (alle 7 Tage Auftrags-Serie).`;
  if (CHEST_ITEMS.holz.includes(id)) return `${cosmeticName(id)}: nur aus Truhen, mit etwas Glück schon in der Holztruhe nach 3 Tagen Serie.`;
  const sh = shopItem(id); if (sh) return `${cosmeticName(id)}: im Krämerladen für ${sh.price} Münzen, wenn er im Angebot ist.`;
  return 'Schaltest du im Storymodus frei.';
}
// Herkunft einer Optik für den Filter im Charakter-Bildschirm: start, w1…, laden, truhe
function cosmeticGroup(id) {
  if (!id) return 'start';
  if (EGG_IDS.includes(id)) return 'w0';
  for (const w of WORLDS) {
    if (w.starReward && w.starReward.id === id) return w.id;
    for (const st of w.stations) if (st.reward === id || (st.shop || []).some(x => x.id === id) || (st.choices || []).some(c => (c.rewards || []).includes(id) || c.reward === id)) return w.id;
  }
  if (chestItem(id)) return 'truhe';
  if (shopItem(id)) return 'laden';
  return 'start';
}
// Seiten zum Durchblättern im Charakter-Bildschirm: [Schlüssel, Titel, Unterzeile]
const PF_GROUPS = () => [['start', 'Start', 'Von Anfang an dabei'], ...WORLDS.map(w => [w.id, `${wLabel(w)}`, w.name]), ['laden', 'Krämerladen', 'Wechselndes Angebot'], ['truhe', 'Truhen', 'Belohnung für Auftrags-Serien']];
function pfPage() { const g = PF_GROUPS(), i = g.findIndex(x => x[0] === UI.pfFilter); return i < 0 ? 0 : i; }
function myPortrait() { const x = ALL_PORTRAITS.find(q => q[0] === PROFILE.portrait && cosOpen(q)) || PORTRAITS[0]; return x[2]; }
function myFrame() { const f = ALL_FRAMES.find(q => q[0] === PROFILE.frame && cosOpen(q)) || FRAMES[0]; return f[2]; }
function myTitle() { return PROFILE.title && owns('title:' + PROFILE.title) ? COSMETICS.title[PROFILE.title] : ''; }
function myName() { return PROFILE.name || 'Du'; }
// Rahmen mit eigener Grafik (Ring, der über dem Porträt liegt). Gezeigt nur, wo das Porträt groß ist:
// oben im Charakter-Bildschirm und im eigenen Profil im Spiel. Überall sonst gilt der farbige Rand.
const FRAME_ART = new Set(Object.keys(COSMETICS.frame));   // alle Rahmen außer den sechs Farbringen vom Start
const frameArt = (k, small) => FRAME_ART.has(k) ? `icons/rahmen-${k}${small ? '-k' : ''}.webp` : '';
function myFrameKey() { return (ALL_FRAMES.find(q => q[0] === PROFILE.frame && cosOpen(q)) || FRAMES[0])[0]; }
function applyProfile() {
  const de = document.documentElement, k = myFrameKey(), art = frameArt(k), u = x => `url("${new URL(x, document.baseURI).href}")`;
  de.style.setProperty('--pf', myFrame()); de.style.setProperty('--pfimg', art ? u(art) : 'none'); de.style.setProperty('--pfimgk', art ? u(frameArt(k, true)) : 'none'); de.classList.toggle('pf-art', !!art);
  if (S && CUR === 'game') { W.renderedOnce = true; render(); }
  else if (typeof renderWnav === 'function') renderWnav();   // Leiste oben: Porträt, Name, Titel und Hintergrund gleich mit
}
const PROFILE_NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} ._-]{1,15}$/u;
function renderProfile() {
  const hb = $('#pf-hero'), bx = myBg(); hb.classList.toggle('hasbg', !!bx[2]); hb.style.setProperty('--bg', bx[2] ? `url('${bgSrc(bx)}')` : ''); hb.style.setProperty('--bgp', bx[4] || '');
  patch(hb, `<span class="pf-bigw"><img class="pf-big" src="${myPortrait()}" alt=""></span><div class="pf-who"><b class="fitname">${esc(PROFILE.name || 'Namenlos')}</b>${myTitle() ? `<em class="pf-title">${esc(myTitle())}</em>` : ''}` +
    `</div>`);
  fitNames(hb);
  // Unter dem Kopf: links die längste Serie, rechts die Spielerstufe (kommt mit dem Online-Modus)
  const days = n => `${n} ${n === 1 ? 'Tag' : 'Tage'}`;
  patch($('#pf-stats'), `<div class="panel pf-stat">${candleHtml(streakNow() > 0)}<span><small>Längste Serie</small><b>${days(streakBest())}</b><em>Aktuell: ${days(streakNow())}</em></span></div>` +
    `<div class="panel pf-stat soon"><span class="pf-lvl" aria-hidden="true"></span><span><small>Spielerstufe</small><b>Bald</b><em>Kommt mit dem Online-Modus</em></span></div>`);
  const inp = $('#pf-name'); if (document.activeElement !== inp) inp.value = PROFILE.name;
  const lockI = '<b class="pf-lock" aria-hidden="true"><svg viewBox="0 0 24 24">' + LOCK_PATH + '</svg></b>';
  const PC = mq().pc.matches;
  const G = PF_GROUPS(), pi = pfPage(), [fg, gl, gs] = G[pi], egg = id => !EGG_IDS.includes(id) || owns(id);
  const inG = PC ? id => pfOriginOk(id) && egg(id) && (UI.pfMissing !== false || !id || owns(id)) : id => cosmeticGroup(id) === fg && egg(id);
  const none = PC ? '<p class="hint pf-empty">Mit diesem Filter gibt es hier nichts. Probier eine andere Herkunft.</p>' : '<p class="hint pf-empty">Hier gibt es nichts auf dieser Seite.</p>';
  const items = [...ALL_PORTRAITS.map(x => x[3]), ...ALL_FRAMES.map(x => x[3]), ...ALL_BGS.map(x => x[3]), ...Object.keys(COSMETICS.title).map(k => 'title:' + k)].filter(inG), got = items.filter(id => !id || owns(id)).length;
  const arrow = (d, dis) => `<button type="button" class="pf-arr" data-pfpage="${d}" aria-label="${d < 0 ? 'Vorherige' : 'Nächste'} Seite"${dis ? ' disabled' : ''}><svg viewBox="0 0 24 24"><path d="${d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg></button>`;
  patch($('#pf-filter'), arrow(-1, pi === 0) + `<div class="pf-pg"><b>${esc(gl)}</b><small>${esc(gs)} · ${got} von ${items.length}</small><span class="pf-dots">${G.map((g, i) => `<i class="${i === pi ? 'on' : ''}"></i>`).join('')}</span></div>` + arrow(1, pi === G.length - 1));
  patch($('#pf-portraits'), (ALL_PORTRAITS.filter(x => inG(x[3])).map(x => { const [k, l, src] = x, on = cosOpen(x); return `<button type="button" class="pf-pt${on ? '' : ' locked'}" data-portrait="${k}" aria-pressed="${on && myPortrait() === src && PROFILE.portrait === k}"><img src="${src}" alt="" loading="lazy">${on ? '' : lockI}<span>${l}</span></button>`; }).join('')) || none);
  patch($('#pf-frames'), (ALL_FRAMES.filter(x => inG(x[3])).map(x => { const [k, l, c] = x, on = cosOpen(x); return `<button type="button" class="pf-fr${on ? '' : ' locked'}" data-frame="${k}" aria-pressed="${on && PROFILE.frame === k}" style="--c:${c}">${frameArt(k) ? `<i class="frimg" style="background-image:url('${frameArt(k, true)}')">${on ? '' : `<svg viewBox="0 0 24 24">${LOCK_PATH}</svg>`}</i>` : `<i>${on ? '' : `<svg viewBox="0 0 24 24">${LOCK_PATH}</svg>`}</i>`}<span>${l}</span></button>`; }).join('')) || none);
  patch($('#pf-bgs'), (ALL_BGS.filter(x => inG(x[3])).map(x => { const [k, l] = x, on = cosOpen(x); return `<button type="button" class="pf-bg${on ? '' : ' locked'}" data-bg="${k}" aria-pressed="${on && myBg()[0] === k}"><i class="${x[2] ? '' : 'none'}"${x[2] ? ` style="background-image:url('${bgSrc(x, true)}');background-position:${x[4]}"` : ''}>${on ? '' : `<svg viewBox="0 0 24 24">${LOCK_PATH}</svg>`}</i><span>${l}</span></button>`; }).join('')) || none);
  // Titel: nur die freigeschalteten zeigen, gesperrte wären bei vielen Welten nur Ballast
  const titles = Object.entries(COSMETICS.title).filter(([k]) => (PC || owns('title:' + k)) && inG('title:' + k));
  patch($('#pf-titles'), (!PC || pfOriginOk('') ? `<button type="button" class="pf-ti" data-title="" aria-pressed="${!myTitle()}">Kein Titel</button>` : '') + titles.map(([k, l]) => owns('title:' + k) ? `<button type="button" class="pf-ti" data-title="${k}" aria-pressed="${PROFILE.title === k}">${esc(l)}</button>` : `<span class="pf-ti locked"><svg viewBox="0 0 24 24" aria-hidden="true">${LOCK_PATH}</svg>${esc(l)}</span>`).join('') +
    `<p class="hint">${titles.length ? 'Weitere Titel' : 'Titel'} gibt es im Storymodus, im Krämerladen und in Truhen.</p>`);
  if (mq().pc.matches) renderProfilePC();
}
// Kurze Spieler-ID aus der festen Profil-ID (für Freunde im Online-Modus)
// Herkunftsfilter am PC: alle, Start, Storymodus (oder eine Welt), Laden, Truhen, Besonderes
function pfOriginOk(id) { const o = UI.pfOrigin || 'all', g = cosmeticGroup(id); return o === 'all' || g === o || (o === 'story' && /^w\d/.test(g)); }
function pfSrcLabel(id) { const g = cosmeticGroup(id); if (g === 'start') return 'Start'; if (g === 'laden') return 'Laden'; if (g === 'truhe') return 'Truhe'; if (g === 'special') return 'Besonderes'; const w = WORLDS.find(x => x.id === g); return w ? wLabel(w) : ''; }
const playerTag = () => { const h = String(PROFILE.id || '').replace(/[^a-z0-9]/gi, '').toUpperCase(); return h.slice(0, 4) + '-' + h.slice(4, 8); };
// Charakter am PC: Herkunft als Kacheln statt Blättern, rechts Statistik, Serie und Online
function renderProfilePC() {
  const box = $('#scr-profile .content'); if (!box) return;
  const type = UI.pfType || 'portrait', orig = UI.pfOrigin || 'all', miss = UI.pfMissing !== false;
  box.dataset.pfview = type;
  const egg = id => !EGG_IDS.includes(id) || owns(id);
  const lists = {portrait: ALL_PORTRAITS.map(x => x[3]), frame: ALL_FRAMES.map(x => x[3]), bg: ALL_BGS.map(x => x[3]), title: Object.keys(COSMETICS.title).map(k => 'title:' + k)};
  const cnt = ids => { const it = ids.filter(egg); return [it.filter(id => !id || owns(id)).length, it.length]; };
  const tabs = [['portrait', 'Porträts'], ['frame', 'Rahmen'], ['bg', 'Hintergründe'], ['title', 'Titel']];
  const tot = cnt(Object.values(lists).flat());
  const groups = Object.values(lists).flat().map(cosmeticGroup);
  const worlds = WORLDS.filter(w => groups.includes(w.id));
  const chip = (k, l, on, extra) => `<button type="button" class="pf-chip${on ? ' on' : ''}" data-pforigin="${k}">${l}${extra || ''}</button>`;
  const story = orig === 'story' || /^w\d/.test(orig);
  patch($('#pf-filter'), `<div class="pf-tabs4">` + tabs.map(([k, l]) => { const [g, t] = cnt(lists[k]); return `<button type="button" class="pf-tab4${k === type ? ' on' : ''}" data-pftype="${k}">${l}<small>${g}/${t}</small></button>`; }).join('') +
    `<span class="pf-total">Gesamt ${tot[0]} / ${tot[1]}</span></div>` +
    `<div class="pf-bar"><i style="width:${tot[1] ? Math.round(tot[0] / tot[1] * 100) : 0}%"></i></div>` +
    `<div class="pf-origins"><span class="pf-olbl">Herkunft</span>` + chip('all', 'Alle', orig === 'all') + chip('start', 'Start', orig === 'start') +
    chip('story', 'Storymodus', story, ' <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>') + chip('laden', 'Laden', orig === 'laden') + chip('truhe', 'Truhen', orig === 'truhe') +
    (groups.includes('special') ? chip('special', 'Besonderes', orig === 'special') : '') +
    `<button type="button" class="pf-chip miss${miss ? ' on' : ''}" data-pfmissing aria-pressed="${miss}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>Fehlende zeigen</button></div>` +
    (story ? `<div class="pf-origins sub">` + chip('story', 'Alle Welten', orig === 'story') + worlds.map(w => { const [g, t] = cnt(Object.values(lists).flat().filter(id => cosmeticGroup(id) === w.id)); return chip(w.id, `${esc(wLabel(w))} <small>${g}/${t}</small>`, orig === w.id); }).join('') + '</div>' : ''));
  // Herkunft als Schildchen an jedem Stück
  const key = {}; ALL_PORTRAITS.forEach(x => key['p' + x[0]] = x[3]); ALL_FRAMES.forEach(x => key['f' + x[0]] = x[3]); ALL_BGS.forEach(x => key['b' + x[0]] = x[3]);
  box.querySelectorAll('[data-portrait]').forEach(b => b.dataset.src = pfSrcLabel(key['p' + b.dataset.portrait]));
  box.querySelectorAll('[data-frame]').forEach(b => b.dataset.src = pfSrcLabel(key['f' + b.dataset.frame]));
  box.querySelectorAll('[data-bg]').forEach(b => b.dataset.src = pfSrcLabel(key['b' + b.dataset.bg]));
  let idb = box.querySelector('.pf-idbox'); if (!idb) { idb = document.createElement('div'); idb.className = 'panel pf-idbox'; $('#pf-hero').after(idb); }
  patch(idb, `<span><small>Spieler-ID</small><b>#${playerTag()}</b><em>Damit finden dich Freunde, sobald der Online-Modus da ist.</em></span><button type="button" class="pf-copy" data-copyid aria-label="Spieler-ID kopieren" title="Kopieren"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg></button>`);
  let right = box.querySelector('.pf-right'); if (!right) { right = document.createElement('div'); right.className = 'pf-right'; box.appendChild(right); }
  const st = PROFILE.stats || {}, n = k => fmt(st[k] || 0), days = v => `${v} ${v === 1 ? 'Tag' : 'Tage'}`;
  const cell = (ic, v, l, art) => `<div class="pfs-c"><img${art ? ' class="art"' : ''} src="${ic}" alt=""><b>${v}</b><span>${l}</span></div>`;
  patch(right, `<div class="panel pf-card"><h4 class="pf-h">Statistik</h4><div class="pfs-grid">` +
    cell('icons/muenze-sieg.png', n('won'), 'Partien gewonnen') + cell(ICON.hand, n('played'), 'Partien gespielt') +
    cell(ICON.kampf, n('fights'), 'Kämpfe gewonnen') + cell('icons/st-boss.png', n('big'), 'Monster ab Stufe 10') +
    cell(ICON.run, n('escapes'), 'Geflohen') + cell('icons/portrait-zwerg.png', n('helped'), 'Mal geholfen', true) +
    cell(ICON.gold, n('gold'), 'Gold verkauft') + cell(ART['Pechsträhne'], n('curses'), 'Flüche verteilt', true) +
    `</div><p class="hint">Zählt im freien Spiel und im Storymodus, nicht im Probespiel.</p></div>` +
    `<div class="panel pf-card pf-streak">${candleHtml(streakNow() > 0)}<span><small>Auftrags-Serie</small><b>${days(streakNow())}</b><em>Rekord: ${days(streakBest())}</em></span></div>` +
    `<div class="panel pf-card pf-online"><h4 class="pf-h">Online <em class="pf-soon">Bald</em></h4>` +
    `<div class="pfo-row"><span class="pf-lvl" aria-hidden="true"></span><span><b>Spielerstufe und Liga</b><small>Steig mit jeder Online-Partie auf und miss dich in Ligen und Turnieren.</small></span></div>` +
    `<div class="pfo-row"><span class="pfo-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.2"/><circle cx="17" cy="9.5" r="2.6"/><path d="M3.5 19c.9-3.2 3-5 5.5-5s4.6 1.8 5.5 5M14.5 15.2c.8-.5 1.6-.7 2.5-.7 2 0 3.5 1.4 4.1 4"/></svg></span><span><b>Freunde</b><small>Füge Freunde über ihre Spieler-ID hinzu und lade sie an deinen Tisch ein.</small></span></div>` +
    `<div class="pfo-add"><input type="text" placeholder="Spieler-ID, z. B. #A1B2-C3D4" disabled><button type="button" class="btn small" disabled>Hinzufügen</button></div></div>`);
}
document.addEventListener('click', e => {
  const g = e.target.closest('[data-pfgroup]'); if (g) { UI.pfFilter = g.dataset.pfgroup; renderProfile(); return; }
  const ty = e.target.closest('[data-pftype]'); if (ty) { UI.pfType = ty.dataset.pftype; renderProfile(); return; }
  const or = e.target.closest('[data-pforigin]'); if (or) { UI.pfOrigin = or.dataset.pforigin; renderProfile(); return; }
  if (e.target.closest('[data-pfmissing]')) { UI.pfMissing = UI.pfMissing === false; renderProfile(); return; }
  const c = e.target.closest('[data-copyid]'); if (c) { const t = '#' + playerTag(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast(`Spieler-ID ${t} kopiert.`), () => toast(`Deine Spieler-ID: ${t}`)); }
});
// Wischen über Titel, Porträts und Rahmen blättert ebenfalls
(() => { let x0 = null, y0 = 0;
  document.addEventListener('touchstart', e => { x0 = e.target.closest && e.target.closest('#scr-profile .pf-pager, #scr-profile .pf-sec:not(:first-of-type)') ? e.touches[0].clientX : null; y0 = e.touches[0].clientY; }, {passive: true});
  document.addEventListener('touchend', e => { if (x0 == null) return; const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
    const G = PF_GROUPS(), i = Math.max(0, Math.min(G.length - 1, pfPage() + (dx < 0 ? 1 : -1))); if (G[i][0] === G[pfPage()][0]) return;
    UI.pfFilter = G[i][0]; renderProfile(); buzz(8); }, {passive: true});
})();
document.addEventListener('input', e => {
  if (e.target.id !== 'pf-name') return;
  const v = e.target.value.trim(), hint = $('#pf-name-hint');
  if (!v) { PROFILE.name = ''; hint.classList.remove('err'); hint.textContent = '2 bis 16 Zeichen. Später kann das dein Name für Partien gegen andere sein.'; saveProfile(); renderProfile(); return; }
  if (!PROFILE_NAME_RE.test(v)) { hint.classList.add('err'); hint.textContent = 'Bitte 2 bis 16 Zeichen: Buchstaben, Ziffern, Leerzeichen, Punkt, Binde- oder Unterstrich.'; return; }
  hint.classList.remove('err'); hint.textContent = 'Gespeichert.';
  PROFILE.name = v; saveProfile(); renderProfile();
});

/* ================= Einstellungen und Speicher ================= */
let HUBBOT = false, HUBST = false, HUBW = 0, HUBPG = '', HUBSEL = null;   // Entwurf: Storykarte auf der Seite „Spielen“ (PC): offen, Weltseite, Blätterrichtung, gewählte Station
const K_SET = 'loota.settings', K_SAVE = 'loota.save';
function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function clearSave() { try { localStorage.removeItem(K_SAVE); } catch (e) {} }
// Laufende Storymodus-Station: eigener Spielstand, damit das freie Spiel nicht überschrieben wird (Rätsel und Probespiel sind zu kurz dafür)
const K_STORYSAVE = 'loota.storysave';
function storySave() { const d = load(K_STORYSAVE); return d && d.st && d.S && stationById(d.st) ? d : null; }
function clearStorySave() { try { localStorage.removeItem(K_STORYSAVE); } catch (e) {} }
const SET_V = 2;
const SAVED_SET = load(K_SET);
const SET = Object.assign({music: true, sfx: true, mvol: 0.5, svol: 0.8, vibrate: true, reduce: false, advice: false, coach: false, open: false, speed: 'normal', goal: 10, bots: 3, diff: 'normal', foes: 'zufall', test: false, mode: 'free', draft: false}, SAVED_SET || {});
SET.foes = 'zufall'; SET.draft = true;   // nur noch zufällige Gegner, Draft immer
// Lernhilfen sind ab Einstellungs-Version 2 standardmäßig aus, auch für bereits gespeicherte Einstellungen
if ((SET.sv || 1) < SET_V) { SET.advice = false; SET.coach = false; SET.sv = SET_V; if (SAVED_SET) store(K_SET, SET); }
function saveSettings() { store(K_SET, SET); applySettings(); }
function applySettings() {
  UI.advice = SCN && SCN.tips ? true : SET.advice && !SCN; UI.coach = SCN && SCN.tips ? true : SET.coach && !SCN;   // Probepartie der Einführung: Tipps immer an
  UI.open = SET.open; UI.speed = SET.speed; UI.goal = SET.goal || 10; UI.draft = true;   // Draft ist Standard
  if (!SCN) { UI.bots = SET.bots; UI.diff = SET.diff; }
  UI.reduce = SET.reduce || matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.toggle('reduce', !!SET.reduce);
  Snd.set({music: SET.music, sfx: SET.sfx, mvol: SET.mvol, svol: SET.svol});
  if (!SET.music) Snd.stopMusic();
  renderSoundBtn();
}
function buzz(p) { if (SET.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } }

let GAME_ON = false;
// Tischfläche und Musik der laufenden Partie: im Storymodus von der Welt, im freien Spiel aus den Optionen
let GAME_TABLE = 'taverne', GAME_THEME = 'taverne';
// Tischflächen und Musik der Welten werden mit dem Abschluss der Welt freigeschaltet
const MOOD_WORLD = {keller: 'w2', wald: 'w3', strand: 'w4', schiff: 'w5'};
const moodOk = v => !MOOD_WORLD[v] || worldReady(MOOD_WORLD[v]);
// Freies Spiel: Tischfläche und Musik kommen vom gewählten Deck (auch bei einem eigenen Deck, das ja auf einem Deck aufbaut)
function freeMood(saved, savedTable) {
  const d = deckById(DECK.deck), m = saved || (d.unlocked() ? d.mood : 'taverne'); GAME_TABLE = GAME_THEME = moodOk(m) ? m : 'taverne';
  const t = saved ? savedTable : SET.table; if (t && moodOk(t)) GAME_TABLE = t;
}
// Tischdesigns im freien Spiel: die Taverne und jede Welt, die man abgeschlossen hat
const TABLES = [['taverne', 'Taverne', 'art/hintergrund-tisch.webp'], ['keller', 'Keller', 'art/hintergrund-keller.webp'], ['wald', 'Pilzwald', 'art/hintergrund-wald.webp'], ['strand', 'Strand', 'art/hintergrund-strand.webp'], ['schiff', 'Schiff', 'art/hintergrund-schiff.webp']];
const freeTable = () => { const t = SET.table || ''; if (t && moodOk(t)) return t; const d = deckById(DECK.deck), m = d.unlocked() ? d.mood : 'taverne'; return moodOk(m) ? m : 'taverne'; };
CHECKPOINT_HANDLER = () => {
  if (SCN) { if (!SCN.fight && !SCN.tut && STORY_RUN) store(K_STORYSAVE, {S, seen: UI.seen, ts: Date.now(), bots: UI.bots, diff: UI.diff, v: APP_VERSION, scn: SCN, st: STORY_RUN.st, table: GAME_TABLE, theme: GAME_THEME}); return; }
  store(K_SAVE, {S, seen: UI.seen, ts: Date.now(), bots: UI.bots, diff: UI.diff, v: APP_VERSION, mood: GAME_THEME, table: GAME_TABLE});
};

/* ================= Bildschirme ================= */
/* ================= Deck-Baukasten ================= */
const K_DECK = 'loota.deck';
const POOL = cardPool();
const POOLCAT = Object.fromEntries(POOL.map(p => [p.tpl.n, p.tpl]));
const DEF_COUNTS = Object.fromEntries(POOL.map(p => [p.tpl.n, p.def]));
const DECK_MAX = 4;
/* Decks und Varianten. Weitere Decks (z. B. je Welt aus dem Storymodus) bekommen eigene
   Grund-Stückzahlen (base), ein ikonisches Bild (icon) und eine Freischaltung (unlocked). */
const DECKS = [
  {id: 'grund', name: 'Grunddeck', icon: 'Wütender Gartenzwerg', mood: 'taverne', desc: 'Die Karten, mit denen alles begann. Gespielt wird in der Taverne.', base: p => p.def, unlocked: () => true},
  {id: 'keller', name: 'Keller-Deck', icon: 'Rattenkönig Rüdiger', desc: 'Staubmäuse, Spukgeister und der Rattenkönig: 18 Kellerkarten plus alles aus dem Grunddeck, was in einen Keller passt. Mit Kellergewölbe und Kellermusik.', mood: 'keller',
    base: kellerCount, unlocked: () => !!STORY.worlds.w2, lockTxt: 'Das Keller-Deck schaltest du frei, wenn du im Storymodus Welt 2 abschließt.'},
  {id: 'wald', name: 'Pilzwald-Deck', icon: 'Pilzkönigin Morchella', desc: 'Bovisten, Hexenringe und die Pilzkönigin: 20 Waldkarten plus alles aus dem Grunddeck, was in einen Wald passt. Mit Waldboden und Waldmusik.', mood: 'wald',
    base: waldCount, unlocked: () => !!STORY.worlds.w3, lockTxt: 'Das Pilzwald-Deck schaltest du frei, wenn du im Storymodus Welt 3 abschließt.'},
  {id: 'strand', name: 'Strand-Deck', icon: 'Krabbenbaron Kneifer', desc: 'Quallen, Haie und der Krabbenbaron, dazu Ebbe und Flut: 19 Strandkarten plus alles aus dem Grunddeck, was an einen Strand passt. Mit Sandstrand und Strandmusik.', mood: 'strand',
    base: strandCount, unlocked: () => worldReady('w4'), lockTxt: 'Das Strand-Deck schaltest du frei, wenn du im Storymodus Welt 4 abschließt.'},
  {id: 'meer', name: 'Meeres-Deck', icon: 'Käpt’n Achtarm', desc: 'Wale, Kraken, Piraten und Seegang, dazu die Schatzkarte: 31 Meereskarten plus alles aus dem Grunddeck, was aufs Meer passt. Mit Schiffsdeck und Piratenmusik.', mood: 'schiff',
    base: meerCount, unlocked: () => worldReady('w5'), lockTxt: 'Das Meeres-Deck schaltest du frei, wenn du im Storymodus Welt 5 abschließt.'}
];
// Karten einer Welt tauchen in der Kartenliste erst auf, wenn ihr Deck freigeschaltet ist
const cardOpen = c => !c.w || deckById({2: 'keller', 3: 'wald', 4: 'strand', 5: 'meer'}[c.w]).unlocked();
const VARIANTS = [
  ['standard', 'Standard', 'Die ausgewogene Mischung.', (p, b) => b],
  ['monsterjagd', 'Monsterjagd', 'Mehr Kämpfe, kaum Flüche.', (p, b) => !b ? 0 : p.tpl.k === 'monster' ? b + (p.tpl.lvl <= 12 ? 1 : 0) : p.tpl.k === 'curse' ? b - 1 : p.tpl.k === 'enh' ? b + 1 : b],
  ['fluchchaos', 'Fluch-Chaos', 'Doppelt so viele Flüche, dafür mehr Amulette.', (p, b) => !b ? 0 : p.tpl.k === 'curse' ? b * 2 : p.tpl.k === 'amulet' ? 3 : b],
  ['schnell', 'Schnelle Runde', 'Mehr Stufenkarten und Einmal-Gegenstände, keine Riesenmonster.', (p, b) => !b ? 0 : p.tpl.k === 'levelup' ? 2 : p.tpl.k === 'oneshot' ? b + 1 : p.tpl.k === 'monster' && p.tpl.lvl >= 14 ? 0 : b]
];
const clampCount = n => Math.max(0, Math.min(DECK_MAX, n));
const deckById = id => DECKS.find(d => d.id === id) || DECKS[0];
const variantName = k => k === 'eigenes' ? 'Eigenes' : (VARIANTS.find(v => v[0] === k) || VARIANTS[0])[1];
function variantCounts(deckId, key) {
  const d = deckById(deckId), v = VARIANTS.find(x => x[0] === key) || VARIANTS[0];
  return Object.fromEntries(POOL.map(p => { const b = clampCount(d.base(p)); return [p.tpl.n, clampCount(v[3](p, b))]; }));
}
function currentCounts(s) {
  if (s.variant !== 'eigenes') return variantCounts(s.deck, s.variant);
  const c = s.custom[s.deck] || {}, d = deckById(s.deck);
  return Object.fromEntries(POOL.map(p => [p.tpl.n, clampCount(c[p.tpl.n] != null ? c[p.tpl.n] : d.base(p))]));
}
const DECK = (() => {
  let d = null; try { d = JSON.parse(localStorage.getItem(K_DECK)); } catch (e) {}
  const s = {deck: 'grund', variant: 'standard', custom: {}};
  if (d && d.v === 2) Object.assign(s, {deck: d.deck || 'grund', variant: d.variant || 'standard', custom: d.custom || {}});
  else if (d && d.preset === 'eigenes' && d.counts) { s.variant = 'eigenes'; s.custom.grund = d.counts; }
  else if (d && d.preset) s.variant = d.preset === 'empfohlen' ? 'standard' : d.preset;
  if (!deckById(s.deck).unlocked()) s.deck = 'grund';
  if (s.variant !== 'eigenes' && !VARIANTS.some(v => v[0] === s.variant)) s.variant = 'standard';
  if (s.variant === 'eigenes' && !s.custom[s.deck]) s.variant = 'standard';
  s.counts = currentCounts(s);
  return s;
})();
function saveDeck() { try { localStorage.setItem(K_DECK, JSON.stringify({v: 2, deck: DECK.deck, variant: DECK.variant, custom: DECK.custom})); } catch (e) {} }
function deckStats(counts) {
  let door = 0, tr = 0, mons = 0, curses = 0, lvls = 0, rc = 0;
  POOL.forEach(p => { const n = counts[p.tpl.n] || 0; if (p.deck === 'door') door += n; else tr += n; if (p.tpl.k === 'monster') mons += n; if (p.tpl.k === 'curse') curses += n; if (p.tpl.k === 'levelup') lvls += n; if (p.tpl.k === 'race' || p.tpl.k === 'class') rc += n; });
  const share = door ? mons / door : 0, errors = [], warnings = [];
  const okDoor = door >= 30, okTr = tr >= 25, okMons = mons >= 12 && share >= 0.3;
  if (!okDoor) errors.push(`Der Türstapel braucht mindestens 30 Karten (jetzt ${door}).`);
  if (!okTr) errors.push(`Der Schatzstapel braucht mindestens 25 Karten (jetzt ${tr}).`);
  if (!okMons) errors.push(`Es braucht mindestens 12 Monster, und sie müssen 30 % der Türkarten ausmachen (jetzt ${mons}, ${Math.round(share * 100)} %).`);
  if (lvls > 6) warnings.push('Viele Stufenkarten: Partien werden sehr kurz.');
  if (curses > 16) warnings.push('Sehr viele Flüche: Es wird chaotisch.');
  if (!rc) warnings.push('Ohne Völker und Klassen gibt es keine Fähigkeiten.');
  return {door, tr, mons, share, okDoor, okTr, okMons, errors, warnings, ok: !errors.length};
}
function deckLabel() { return `${deckById(DECK.deck).name} · ${variantName(DECK.variant)}`; }
const LOCK_SVG = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>';
function renderDeckPanel() {
  const st = deckStats(DECK.counts), d = deckById(DECK.deck), v = VARIANTS.find(x => x[0] === DECK.variant);
  const tiles = DECKS.map(x => { const un = x.unlocked(); return `<button type="button" class="dtile${un ? '' : ' locked'}" data-deck="${x.id}" aria-pressed="${DECK.deck === x.id}"><span class="dt-img"><img src="${ART[x.icon]}" alt="" draggable="false">${un ? '' : `<i>${LOCK_SVG}</i>`}</span><b>${esc(x.name)}</b></button>`; }).join('') +
    `<button type="button" class="dtile soon" data-deck="soon"><span class="dt-img"><i>${LOCK_SVG}</i></span><b>Weitere Decks</b></button>`;
  const vbtn = (k, l, wide) => `<button type="button" class="vbtn${wide ? ' wide' : ''}" data-variant="${k}" aria-pressed="${DECK.variant === k}">${l}</button>`;
  const vars = VARIANTS.map(([k, l]) => vbtn(k, l)).join('') + vbtn('eigenes', DECK.custom[DECK.deck] ? 'Eigenes' : 'Eigenes <small>· noch leer</small>', true);
  const row = (ok, need, val) => `<li class="${ok ? 'ok' : 'bad'}"><i aria-hidden="true">${ok ? '✓' : '✗'}</i><span>${need}</span><b>${val}</b></li>`;
  const check = `<div class="dk-check"><p class="dk-st ${st.ok ? 'ok' : 'bad'}">${st.ok ? 'Spielbereit' : 'Noch nicht spielbereit'}</p><p class="dk-need">Damit ein Deck spielbereit ist, braucht es:</p><ul class="dk-req">` +
    row(st.okDoor, 'mindestens 30 Türkarten', st.door) + row(st.okTr, 'mindestens 25 Schatzkarten', st.tr) + row(st.okMons, 'mindestens 12 Monster, die 30 % der Türkarten ausmachen', `${st.mons} · ${Math.round(st.share * 100)} %`) +
    `</ul>${st.warnings.map(w => `<p class="dk-warn">${esc(w)}</p>`).join('')}</div>`;
  patch($('#deck-panel'), `<div class="dk-head"><b>Dein Deck</b></div>` +
    `<div class="dk-lbl">Deck</div><div class="dk-decks">${tiles}</div><p class="dk-desc">${esc(d.desc)}</p>` +
    `<div class="dk-lbl">Variante</div><div class="dk-var">${vars}</div><p class="dk-desc">${esc(v ? v[2] : 'Deine eigene Zusammenstellung. Ändere unten die Anzahl der Karten.')}</p>` + check +
    `<p class="hint">Mit − und + legst du fest, wie oft eine Karte im Deck ist (0 bis ${DECK_MAX}). Jede Änderung speichert die Mischung unter „Eigenes“.${GAME_ON && S && S.winner == null ? ' Änderungen gelten ab dem nächsten Spiel.' : ''}</p>`);
}
function selectDeck(id) {
  if (id === 'soon') { toast('Neue Decks schaltest du später im Storymodus frei.'); return; }
  const d = deckById(id);
  if (!d.unlocked()) { toast(d.lockTxt || 'Dieses Deck ist noch nicht freigeschaltet.'); return; }
  DECK.deck = d.id;
  if (DECK.variant === 'eigenes' && !DECK.custom[d.id]) DECK.variant = 'standard';
  DECK.counts = currentCounts(DECK); saveDeck(); renderCards(); if (HUBBOT) renderSuDecks();
}
function selectVariant(k) {
  if (k === 'eigenes' && !DECK.custom[DECK.deck]) { DECK.custom[DECK.deck] = Object.assign({}, DECK.counts); toast('Eigenes Deck angelegt. Passe unten die Anzahl an.'); }
  DECK.variant = k; DECK.counts = currentCounts(DECK); saveDeck(); renderCards(); if (HUBBOT) renderSuDecks();
}
async function setDeckCount(i, delta) {
  const p = POOL[i]; if (!p) return;
  const n = clampCount((DECK.counts[p.tpl.n] || 0) + delta);
  if (n === DECK.counts[p.tpl.n]) { buzz(30); return; }
  if (DECK.variant !== 'eigenes') {
    const old = DECK.custom[DECK.deck];
    if (old && POOL.some(q => clampCount(old[q.tpl.n] || 0) !== DECK.counts[q.tpl.n])) {
      const ok = await confirmDialog('Eigenes Deck ersetzen?', `Deine Änderung startet ein neues eigenes Deck auf Basis von „${esc(variantName(DECK.variant))}“. Dein bisheriges eigenes Deck wird dabei ersetzt.`, 'Ersetzen', 'Abbrechen');
      if (!ok) return;
    } else toast('Deine Mischung steht jetzt unter „Eigenes“.');
    DECK.custom[DECK.deck] = Object.assign({}, DECK.counts); DECK.variant = 'eigenes';
  }
  DECK.custom[DECK.deck][p.tpl.n] = n; DECK.counts = currentCounts(DECK); saveDeck(); renderCards();
}

const SCREENS = ['title', 'setup', 'game', 'settings', 'rules', 'cards', 'quiz', 'profile', 'story', 'shop'];
let CUR = 'title';
const STACK = [];
function show(name) { if (name !== CUR) STACK.push(CUR); setScreen(name); }
function setScreen(name) {
  SCREENS.forEach(s => { const el = $('#scr-' + s); const on = s === name; el.hidden = !on; if (on) { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); } });
  CUR = name;
  applyLayout();
  updatePaused();
  Snd.mood(name === 'game' && S && S.combat ? 'combat' : 'tavern');
  Snd.theme(name === 'game' ? GAME_THEME : 'taverne');
  ['keller', 'wald', 'strand', 'schiff'].forEach(t => $('#app').classList.toggle('tbl-' + t, name === 'game' && GAME_TABLE === t));
  if (name !== 'game') $('#app').classList.remove('flut');
  if (name === 'title') renderTitle();
  if (name === 'setup') setupPrep();
  if (name === 'game' && HUBBOT) hubBotsOff();
  if (name === 'settings') { renderControls(); renderSaveInfo(); if (mq().pc.matches) settingsPC(); }
  if (name === 'cards') renderCards();
  if (name === 'quiz') renderQuiz();
  if (name === 'profile') renderProfile();
  if (name === 'story') renderStory();
  if (name === 'rules') { buildRulesToc(); if (mq().pc.matches) renderRulesPC(); }
  if (name === 'shop') renderShopPage();
  if (name === 'game') { W.renderedOnce = false; render(); }
  Motes.toggle(name === 'title');
}
function back() {
  if ($('.dialog')) { $('.dialog').remove(); return; }
  if (SHEETS.length) { if (topSheet().id === 'sel') return; popSheet(); return; }
  if (CUR === 'game') { openSheet({id: 'pause'}); return; }
  if (CUR === 'title') return;
  setScreen(STACK.pop() || 'title');
}
history.pushState({app: 1}, '');
window.addEventListener('popstate', () => { back(); history.pushState({app: 1}, ''); });

/* ================= Startbildschirm ================= */
// Ausschnitt der Weltkarte oben auf dem Startbildschirm (senkrechte Lage im Bild)
const HERO_Y = {w1: '68%', w2: '6%', w3: '88%', w4: '52%', w5: '30%'};
const nextStation = w => w.stations.find(st => st.type !== 'shop' && !STORY.done[st.id] && stationUnlocked(st));
const freeGame = () => { const act = GAME_ON && S && S.winner == null && !S.scn; const sv = !act && load(K_SAVE); return act ? {turn: S.turn, lvl: S.players[0].lvl, live: true} : sv ? {turn: sv.S.turn, lvl: sv.S.players[0].lvl} : null; };
// Karte oben: rein zur Optik. Wischen blättert durch alle Welten, die man schon erreicht hat; die Wahl bleibt gespeichert.
const heroWorlds = () => { const cw = currentWorld(); return WORLDS.filter(w => w.map && (w === cw || w.id === 'w1' || STORY.worlds[w.id] || w.stations.some(st => STORY.done[st.id]))); };
const heroWorld = () => { const l = heroWorlds(); return l.find(w => w.id === PROFILE.heroMap) || (currentWorld().map ? currentWorld() : l[0]); };
function renderHero() {
  const hw = heroWorld(), list = heroWorlds(), map = $('#t-map');
  if (map.getAttribute('src') !== hw.map) map.setAttribute('src', hw.map);
  map.style.objectPosition = `50% ${HERO_Y[hw.id] || '60%'}`;
  patch($('#t-dots'), list.length > 1 ? list.map(w => `<i class="${w === hw ? 'on' : ''}"></i>`).join('') : '');
}
function swipeHero(dir) {
  const list = heroWorlds(); if (list.length < 2) return;
  const i = list.indexOf(heroWorld()), nw = list[(i + dir + list.length) % list.length], map = $('#t-map');
  PROFILE.heroMap = nw.id; saveProfile(); buzz(6);
  map.style.opacity = '0'; setTimeout(() => { renderHero(); map.style.opacity = ''; }, 220);
}
(() => {
  let x0 = null, y0 = 0;
  const scr = $('#scr-title');
  scr.addEventListener('touchstart', e => { const t = e.touches[0], r = scr.getBoundingClientRect(); x0 = t.clientY - r.top < r.height * 0.5 ? t.clientX : null; y0 = t.clientY; }, {passive: true});
  scr.addEventListener('touchend', e => { if (x0 == null) return; const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) swipeHero(dx < 0 ? 1 : -1); }, {passive: true});
})();
function renderTitle() {
  const cw = currentWorld(), ss = storySave(), sst = ss && stationById(ss.st), nx = nextStation(cw);
  renderHero();
  $('#t-world').textContent = `${wLabel(cw)}`;
  $('#t-stars').textContent = `${worldStars(cw)} / ${worldMaxStars(cw)}`;
  $('#t-wname').textContent = cw.name;
  const open = worldMaxStars(cw) - worldStars(cw), first = nx && nx.type === 'tutorial', shut = !worldOwned(cw);
  $('#story-info').textContent = shut ? 'Neu: Hier geht die Geschichte weiter' : sst ? `Angefangen: Station ${sst.no} · ${sst.name}` : first ? `Zum Start: ${nx.name}` : nx ? `Weiter mit Station ${nx.no} · ${nx.name}` : open ? `Alles geschafft · noch ${open} ${open === 1 ? 'Stern' : 'Sterne'} offen` : 'Alles geschafft. Bald geht es weiter!';
  $('#t-cta').textContent = shut ? `${wLabel(cw)} ansehen` : sst || (nx && !first) ? 'Story fortsetzen' : first ? 'Mit der Story loslegen' : 'Zur Storykarte';
  // Spielauswahl: die gewählte Kachel ist umrandet, der Spielen-Knopf startet sie
  const mode = SET.mode === 'online' ? 'online' : 'free';
  $$('.t-card[data-mode]').forEach(c => { const on = c.dataset.mode === mode; c.classList.toggle('sel', on); c.setAttribute('aria-checked', String(on)); });
  $('#tn-play').setAttribute('aria-label', `Spielen: ${mode === 'online' ? 'Online spielen' : 'Freies Spiel starten'}`);
  // Charakter oben links
  const pt = $('#t-pt'); pt.style.setProperty('--fr', myFrame()); const pim = pt.querySelector('img'); if (pim.getAttribute('src') !== myPortrait()) pim.setAttribute('src', myPortrait());
  $('#t-name').textContent = PROFILE.name || 'Abenteurer';
  $('#t-title').textContent = myTitle() || 'Dein Charakter';
  $('#shop-info').textContent = STORY.coins;
  // Freies Spiel: offene Partie anzeigen
  const fg = freeGame();
  $('#free-info').textContent = fg ? `${fg.live ? 'Läuft' : 'Gespeichert'} · Runde ${fg.turn}` : 'Gegen 2 oder 3 Bots';
  // Aufträge mit Serie
  const ds = dailyState(), dn = ds.list.filter(e => { const m = missionById(e.id); return m && e.p >= m.n; }).length, sk = streakNow();
  // Serie wie im Auftragsbrett: Kerze, Schiene mit Tagespunkten und Belohnung
  patch($('#t-daily'), `${candleHtml(sk > 0)}<span class="td-main">${streakTrack(sk).track}</span><small id="daily-info" hidden>${dn} von 3</small>`);
  $('#t-daily').setAttribute('aria-label', `Aufträge: ${dn} von 3 erledigt${sk ? `, Serie ${sk} ${sk === 1 ? 'Tag' : 'Tage'}` : ''}`);
  $('#t-daily').classList.toggle('dark', !sk);   // ohne Serie: Brett ohne Kerzenschein
  const wait = chestsWaiting().length;
  $('#t-daily').dataset.go = wait ? 'chest' : 'daily';
  $('#tn-daily').hidden = dn > 0 && !wait;
  renderHub();
}
// Weiter im Storymodus: angefangene Station fortsetzen, sonst die nächste Station auf der Karte öffnen
function storyGo() {
  if (storySave()) { resumeStation(); return; }
  const cw = currentWorld();
  if (!worldOwned(cw)) { if (HUBST_ON()) { openHubStory(null, true); setTimeout(() => openSheet({id: 'buyworld', w: cw.id}), UI.reduce ? 0 : 620); return; } show('story'); openSheet({id: 'buyworld', w: cw.id}); return; }
  const nx = nextStation(cw);
  if (HUBST_ON()) { openHubStory(nx && nx.id); return; }
  show('story');
  if (nx) openStation(nx.id);
}
// Spielen-Knopf unten: startet, was in der Spielauswahl gewählt ist
function playNow() {
  if (SET.mode === 'online') { closeAllSheets(); openSheet({id: 'online'}); return; }
  freePlay();
}
// Freies Spiel: offene Partie weiterspielen oder eine neue einrichten
function setupPrep() { renderFoes(); renderControls(); renderSetupTable(); const sd = $('#setup-deck'); if (sd) { const st = deckStats(DECK.counts); sd.innerHTML = `${esc(deckLabel())} <small>${st.door + st.tr} Karten${st.ok ? '' : ' · nicht spielbereit'}</small>`; } }
async function freePlay() {
  const fg = freeGame();
  const toSetup = () => HUBST_ON() ? openHubBots() : show('setup');
  if (!fg) { toSetup(); return; }
  const ok = await confirmDialog('Freies Spiel', 'Deine Partie wartet noch auf dich. Spielst du weiter oder fängst du neu an?', 'Weiterspielen', 'Neue Partie', 'Abbrechen',
    {ribbon: true, img: 'art/szene-offene-partie.webp', stat: `Runde ${fg.turn} · Stufe ${fg.lvl}`});
  if (ok === null) return;
  if (ok) continueGame(); else toSetup();
}
const Motes = (() => {
  const cv = $('#motes'), cx = cv.getContext('2d'); let on = false, parts = [];
  function size() { cv.width = cv.clientWidth * devicePixelRatio; cv.height = cv.clientHeight * devicePixelRatio; }
  function step() {
    if (!on) return;
    const w = cv.width, h = cv.height;
    cx.clearRect(0, 0, w, h);
    parts.forEach(p => { p.y -= p.v; p.x += Math.sin((p.y + p.o) / 60) * 0.3; if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      cx.globalAlpha = p.a; cx.fillStyle = '#f3c873'; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.3); cx.fill(); });
    requestAnimationFrame(step);
  }
  return { toggle(v) {
    if (v === on) return; on = v;
    if (on && !UI.reduce) { size(); parts = Array.from({length: 34}, () => ({x: Math.random() * cv.width, y: Math.random() * cv.height, r: (Math.random() * 1.6 + 0.6) * devicePixelRatio, v: (Math.random() * 0.35 + 0.12) * devicePixelRatio, a: Math.random() * 0.5 + 0.2, o: Math.random() * 400})); requestAnimationFrame(step); }
    else cx.clearRect(0, 0, cv.width, cv.height);
  } };
})();

/* ================= Steuerelemente (Setup und Optionen) ================= */
const DIFF_TXT = {gemuetlich: 'Die Bots greifen selten ein und verfluchen wenig. Gut zum Kennenlernen.', normal: 'Die Bots spielen wie typische Mitspieler: Sie bremsen vor allem, wer vorne liegt.', gnadenlos: 'Die Bots greifen oft ein und verteilen Flüche großzügig. Hier schenkt dir niemand etwas.'};
function renderControls() {
  $$('.seg[data-set]').forEach(seg => { const k = seg.dataset.set; seg.querySelectorAll('button').forEach(b => { const lk = !moodOk(b.dataset.v); b.classList.toggle('locked', lk); b.setAttribute('aria-pressed', String(!lk && String(moodOk(SET[k]) ? SET[k] : 'taverne') === b.dataset.v)); }); });
  $$('[data-toggle]').forEach(sw => sw.setAttribute('aria-checked', String(!!SET[sw.dataset.toggle])));
  $$('[data-range]').forEach(r => { r.value = SET[r.dataset.range]; }); goalLabel();
  $('#diff-hint').textContent = DIFF_TXT[SET.diff] || '';
  $('#row-vibrate').hidden = !('vibrate' in navigator);
}
// Freies Spiel: die Gegner der nächsten Partie (zufällig oder der Stammtisch)
function renderFoes() {
  if (SET.foes !== 'stammtisch' && !ROSTER) ROSTER = rollRoster();
  const list = SET.foes === 'stammtisch' ? ['Berta', 'Kalle', 'Uschi'].map(n => ({name: n, face: ICON.portrait[n], style: STYLES[n]})) : ROSTER;
  $$('.seg[data-set="bots"] .pts img').forEach((img, i) => { const f = list[i % 3]; if (f) img.src = f.face; });
  const el = $('#setup-foes'); if (!el) return;
  patch(el, list.slice(0, SET.bots).map(f => `<div class="foe"><img src="${f.face}" alt=""><span><b>${esc(f.name)}</b><small>${esc(f.style.l || '')}</small></span></div>`).join('') +
    (SET.foes === 'stammtisch' ? '' : '<button type="button" class="btn small" data-go="reroll">Neu würfeln</button>'));
  const hf = HUBBOT && $('#t-hub .su-foes'); if (hf) patch(hf, botSeatsHTML());
}
function renderSaveInfo() {
  const s = load(K_SAVE);
  $('#save-info').textContent = s ? `Gespeichert am ${new Date(s.ts).toLocaleString('de-DE', {dateStyle: 'short', timeStyle: 'short'})}: Runde ${s.S.turn}, du auf Stufe ${s.S.players[0].lvl}.` : 'Kein gespeichertes Spiel.';
  $('#app-version').textContent = 'Version ' + APP_VERSION;
  const bw = Object.keys(PURCHASE.worlds).filter(k => PURCHASE.worlds[k]); $('#cheat-buy').textContent = bw.length ? 'Freigeschaltet: ' + bw.map(k => 'Welt ' + k.slice(1)).join(', ') : 'Noch nichts freigeschaltet';
  const sk = streakNow(), cw = chestsWaiting().length; $('#cheat-streak').textContent = `Aktuell ${sk} ${sk === 1 ? 'Tag' : 'Tage'} · Rekord ${streakBest()}${cw ? ` · ${cw} ${cw === 1 ? 'Truhe' : 'Truhen'} bereit` : ''}`;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent), standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  $('#install-hint').textContent = standalone ? 'Die App ist installiert.' : ios ? 'Installieren am iPhone: In Safari auf „Teilen“ tippen, dann „Zum Home-Bildschirm“.' : 'Installieren: Im Browser-Menü „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.';
}
document.addEventListener('input', e => {
  const r = e.target.closest('[data-range]'); if (!r) return;
  SET[r.dataset.range] = +r.value; saveSettings();
  if (r.dataset.range === 'goal') { UI.goal = +r.value; goalLabel(); }
});
// Länge der Partie im freien Spiel: Siegstufe 2 bis 10
function goalLabel() {
  const g = SET.goal || 10, el = $('#goal-val'); if (!el) return;
  el.textContent = `Stufe ${g}`;
  $('#goal-hint').textContent = g >= 10 ? 'Die ganze Partie wie im Original.' : g >= 7 ? 'Eine etwas kürzere Partie.' : g >= 4 ? 'Eine kurze Partie für zwischendurch.' : 'Eine ganz schnelle Runde, oft nach wenigen Kämpfen vorbei.';
}

/* ================= Spiel starten ================= */
async function startNewGame() {
  if ((GAME_ON && S && S.winner == null) || load(K_SAVE)) {
    const ok = await confirmDialog('Neues Spiel?', 'Dein laufendes Spiel wird dabei überschrieben.', 'Neues Spiel', 'Abbrechen');
    if (!ok) return;
  }
  const st = deckStats(DECK.counts);
  let counts = DECK.counts;
  if (!st.ok) {
    const useDef = await confirmDialog('Dein Deck ist noch nicht spielbereit', esc(st.errors[0]) + ' Mit dem Grunddeck in der Variante „Standard“ spielen?', 'Standard spielen', 'Deck bearbeiten');
    if (!useDef) { show('cards'); return; }
    counts = variantCounts('grund', 'standard');
  }
  DECK_COUNTS = counts;
  UI.roster = SET.foes === 'stammtisch' ? null : (ROSTER || rollRoster()); ROSTER = null;
  SCN = null; STORY_RUN = null; freeMood();
  clearSave(); applySettings();
  W.reset(); GAME_ON = true;
  STACK.length = 0; STACK.push('title');
  setScreen('game');
  newGame(false);
}
function continueGame() {
  if (GAME_ON && S && S.winner == null) { setScreen('game'); return; }
  const d = load(K_SAVE); if (!d) return;
  SCN = null; STORY_RUN = null; freeMood(d.mood, d.table || d.mood); applySettings();
  UI.bots = d.bots || UI.bots; UI.diff = d.diff || UI.diff;
  W.reset(); GAME_ON = true;
  STACK.length = 0; STACK.push('title');
  setScreen('game');
  resumeGame(d);
}

/* ================= Hilfen für Darstellung ================= */
function patch(el, html) { if (el.__h !== html) { el.innerHTML = html; el.__h = html; return true; } return false; }
function cardNum(c) {
  switch (c.k) {
    case 'monster': return c.lvl; case 'curse': return '!'; case 'enh': return sign(c.v);
    case 'item': case 'oneshot': return c.b ? '+' + c.b : ''; case 'levelup': return '+1'; default: return '';
  }
}
function cardMini(c, o = {}) {
  const t = TYPES[c.k], num = cardNum(c), art = ART[c.n];
  const tag = o.inert ? 'span' : 'button';
  // Beim Verkaufen steht der Goldwert auf jeder verkaufbaren Karte
  const gold = !o.inert && typeof S !== 'undefined' && S && UI.sel && UI.sel.ctx === 'sell' && o.where && ['hand', 'eq', 'pack'].includes(o.where) ? goldOf(me(), c) : 0;
  const data = o.inert ? '' : o.cname ? `data-cname="${esc(c.n)}"` : `data-uid="${c.uid}" data-where="${o.where || ''}"`;
  return `<${tag}${o.inert ? '' : ' type="button"'} class="mc k-${c.k}${o.size ? ' ' + o.size : ''}${o.extra ? ' ' + o.extra : ''}" ${data} aria-label="${esc(c.n)}">` +
    `<span class="mc-head"><span class="mc-type">${t.s || t.l}</span>${num !== '' ? `<span class="mc-num">${num}</span>` : ''}</span>` +
    (art ? `<img class="mc-art" src="${art}" alt="" loading="lazy" decoding="async" draggable="false">` : `<img class="mc-art" src="${ICON.slot.race}" alt="" draggable="false" style="object-fit:contain;padding:8px">`) +
    (gold ? `<span class="mc-gold">${fmt(gold)} Gold</span>` : '') +
    `<span class="mc-name">${esc(c.n)}</span></${tag}>`;
}
function cardBig(c) {
  const t = TYPES[c.k], num = cardNum(c), human = c === HUMAN;
  let body = '', foot = '';
  switch (c.k) {
    case 'monster': body = `<div>${c.txt}</div><div class="bc-bad"><b>Pech:</b> ${c.badTxt}</div>`; foot = `<span>${c.tr} ${pl(c.tr, 'Schatz', 'Schätze')}</span><span>${c.up || 1} ${pl(c.up || 1, 'Stufe', 'Stufen')}</span>`; break;
    case 'item': body = `<div>${itemTxt(c) || 'Keine Besonderheit.'}</div>`; foot = `<span>${slotTxt(c)}</span><span>${fmt(c.g)} Gold</span>`; break;
    case 'oneshot': body = `<div>${c.txt || 'Im Kampf für eine Seite deiner Wahl. Danach ablegen.'}</div>`; foot = `<span>Einmal einsetzbar</span><span>${fmt(c.g)} Gold</span>`; break;
    case 'enh': body = '<div>In einem beliebigen Kampf auf ein Monster spielen.</div>'; foot = `<span>${c.trm > 0 ? '+' : '−'}${Math.abs(c.trm)} ${pl(Math.abs(c.trm), 'Schatz', 'Schätze')}</span>${S && hasCls(me(), 'dieb') ? '<span>200 Gold</span>' : ''}`; break;
    default: body = `<div>${c.txt || ''}</div>`;
  }
  const art = ART[c.n] ? `<img class="bc-art" src="${ART[c.n]}" alt="">` : human ? `<img class="bc-art human" src="${ICON.slot.race}" alt="">` : '';
  return `<div class="bc k-${c.k}"><div class="bc-head"><span class="bc-type">${human ? 'Volk · keine Karte' : `${t.l} · ${t.d}karte`}</span>${num !== '' ? `<span class="bc-num">${num}</span>` : ''}</div>` +
    `<div class="bc-name">${esc(c.n)}</div>${art}<div class="bc-body">${body}</div>${foot ? `<div class="bc-foot">${foot}</div>` : ''}</div>`;
}
const coinsHTML = l => { const m = WINLVL(); let s = ''; for (let i = 1; i <= m; i++) s += `<i class="${i <= l ? 'on' : ''}${i === l ? ' cur' : ''}${i === m ? ' goal' : ''}"></i>`; return s; };

/* ================= Beobachter: Effekte aus Zustandsänderungen ================= */
const W = {
  lv: {}, hand: new Set(), fresh: new Set(), reveal: null, combat: false, logSeen: 0, diceHideAt: 0, pulse: new Set(), renderedOnce: false,
  reset() { this.tableKey = null; this.fightRef = null; this.nums = {}; this.lv = {}; this.hand = new Set(); this.fresh = new Set(); this.reveal = null; this.combat = false; this.logSeen = 0; this.diceHideAt = 0; this.pulse = new Set(); this.renderedOnce = false; }
};
function watch() {
  if (!S) return;
  const first = !W.renderedOnce;
  S.players.forEach(p => {
    const prev = W.lv[p.id];
    if (prev != null && p.lvl !== prev) {
      if (p.lvl > prev) {
        if (p.human) { Snd.sfx('levelup'); buzz([20, 40, 20]); banner(`Stufe ${p.lvl}!`, 'good'); W.coinPop = true; setTimeout(() => { W.coinPop = false; }, 700); burstAt(PCGX() ? '#gme .gs-pt' : '#mebar', 14); }
        else { Snd.sfx('coin', 0.5); W.pulse.add(p.id); }
      } else if (p.human) { Snd.sfx('leveldown'); buzz(60); }
    }
    W.lv[p.id] = p.lvl;
  });
  const me0 = S.players[0], ids = new Set(me0.hand.map(c => c.uid));
  let added = 0;
  ids.forEach(u => { if (!W.hand.has(u)) { added++; if (!first) W.fresh.add(u); } });
  if (added && !first && CUR === 'game') { Snd.sfx('deal'); setTimeout(() => { W.fresh.clear(); render(); }, 650); }
  W.hand = ids;
  if (S.reveal && S.reveal.uid !== W.reveal) { W.reveal = S.reveal.uid; if (S.reveal.boss) banner(S.reveal.n + '!', 'bad'); Snd.sfx('thud'); setTimeout(() => Snd.sfx('flip'), 160); buzz(25); }
  if (!S.reveal) W.reveal = null;
  const inC = !!S.combat;
  if (inC && !W.combat) { Snd.sfx('battle'); buzz(30); }
  if (inC !== W.combat && CUR === 'game') Snd.mood(inC ? 'combat' : 'tavern');
  W.combat = inC;
  W.renderedOnce = true;
}

/* ================= Rendern ================= */
let RQ = 0;
function render() {
  if (RQ) return;
  RQ = requestAnimationFrame(() => { RQ = 0; try { doRender(); if (UI.step || $('#stepbtn')) showStep(); } catch (e) { console.error(e); } });
}
function doRender() {
  if (S) { try { UI.adv = UI.advice ? advise() : null; } catch (e) { console.error(e); UI.adv = null; } } else UI.adv = null;
  watch();
  applyLayout();
  if (CUR === 'game' && S) { $('#scr-game').classList.toggle('fighting', !!S.combat); renderTop(); renderOpps(); renderTable(); renderAct(); renderMe(); renderHand(); if (LAYOUT) renderWide(); }
  tutUpdate();
  syncSel();
  if (SHEETS.length) renderSheet(false);
  renderDice();
}
function renderSoundBtn() {
  const on = SET.music || SET.sfx, svg = on ? '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z M16 9a4 4 0 0 1 0 6 M18.5 6.5a8 8 0 0 1 0 11" /></svg>' : '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z M17 9l5 6 M22 9l-5 6" /></svg>';
  $$('[data-go="sound"]').forEach(b => patch(b, svg));
}
function renderTop() {
  const who = S.winner != null ? 'Spiel vorbei' : S.cur === 0 ? 'Dein Zug' : `${P(S.cur).name} ist am Zug`;
  // Mitte der Kopfleiste: nur Rundenzahl und die vier Phasen, der Text steht für Screenreader im Label
  patch($('#tb-title'), String(S.turn));
  const mid = $('#tb-mid'); mid.setAttribute('aria-label', SCN && SCN.fight ? 'Rätselkampf' : `${SCN ? `Ziel Stufe ${WINLVL()}, ` : ''}Runde ${S.turn}, ${who}${S.phase ? `, Phase: ${PHASES[S.phase - 1]}` : ''}`);
  mid.classList.toggle('mine', S.cur === 0 && S.winner == null);
  const td = tideNow(), tt = $('#tb-tide');
  tt.hidden = !td; tt.className = 'tb-tide ' + (td || ''); tt.title = td === 'flut' ? 'Flut: Meeresmonster +3, Weglaufen +1' : 'Ebbe: Raum durchsuchen bringt einen Schatz';
  if (td) mid.setAttribute('aria-label', mid.getAttribute('aria-label') + (td === 'flut' ? ', Flut' : ', Ebbe'));
  $('#app').classList.toggle('flut', td === 'flut' && CUR === 'game');
  patch($('#phasedots'), ICON.phase.map((src, i) => `<span class="pd ${S.phase === i + 1 ? 'on' : S.phase > i + 1 ? 'done' : ''}"><img src="${src}" alt="${PHASES[i]}" title="${PHASES[i]}" class="${S.phase === i + 1 ? 'on' : S.phase > i + 1 ? 'done' : ''}"><span class="pd-l">${PHASES[i]}</span></span>`).join(''));
  const unread = Math.max(0, S.log.length - W.logSeen), badge = $('#log-badge');
  badge.hidden = unread === 0 || topSheet()?.id === 'log';
  badge.textContent = unread > 99 ? '99+' : unread;
}
function renderOpps() {
  const C = S.combat, many = S.players.length > 3;
  const html = S.players.filter(p => !p.human).map(p => {
    const role = C && (C.f === p.id ? 'kämpft' : C.h === p.id ? 'hilft' : ''), turn = S.cur === p.id && S.winner == null;
    return `<button type="button" class="oc${turn ? ' turn' : ''}${p.dead ? ' dead' : ''}${bgAttr(bgOf(p), true) || '" style="'};--fc:${frameOf(p)[2]}" data-opp="${p.id}" aria-label="${esc(p.name)}, Stufe ${p.lvl}">` +
      (role ? `<span class="tag red">${role}</span>` : p.dead ? '<span class="tag">tot</span>' : turn ? '<span class="tag">am Zug</span>' : '') +
      `<span class="pt"><img src="${portrait(p)}" alt=""><span class="lvb">${p.lvl}</span></span>` +
      `<span class="ot"><span class="on">${esc(p.name)}</span><span class="os"><span><img src="${ICON.kampf}" alt="">${power(p)}</span><span><img src="${ICON.run}" alt="">${sign(runBonus(p))}</span>${many ? '' : `<span><img src="${ICON.hand}" alt="">${p.hand.length}</span>`}${p.spore ? `<span class="neg" title="Sporenwolke"><img class="spi" src="${ART['Sporenwolke']}" alt="">−${p.spore}</span>` : ''}</span></span></button>`;
  }).join('');
  const ob = $('#opps'); ob.classList.toggle('few', S.players.length <= 3);   // ein oder zwei Gegner: höhere Kacheln
  patch(ob, html);
  if (W.pulse.size) { W.pulse.forEach(id => { const el = $(`.oc[data-opp="${id}"]`); if (el) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); } }); W.pulse.clear(); }
}
/* Spielfeld: große Bildfläche für Kampf und aufgedeckte Karten */
const ART_FALLBACK = 'icons/icon-sonstiges.png';
function revealTxt(c) {
  if (c.k === 'item') return itemTxt(c) || `${slotTxt(c)}, ${fmt(c.g)} Gold`;
  if (c.k === 'enh') return `${sign(c.v)} für ein Monster`;
  if (c.k === 'oneshot') return c.txt || 'Einmal im Kampf einsetzbar.';
  return c.txt || '';
}
function artTop(c, enh) {
  const t = TYPES[c.k];
  const chip = c.k === 'monster' ? `${c.boss ? 'Boss' : 'Monster'} · Stufe ${c.lvl}` : `${t.d} · ${t.l}`;
  return `<span class="chip-k">${chip}</span><span class="aname">${esc(c.n)}</span>` +
    (enh && enh.length ? `<span class="enhs">${enh.map(e => `<span class="enh">${esc(e.n)} ${sign(e.v)}</span>`).join('')}</span>` : '');
}
function artNode(c, enh, anim) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = `art k-${c.k}${anim ? ' ' + anim : ''}`;
  b.dataset.uid = c.uid; b.dataset.where = 'table';
  b.setAttribute('aria-label', c.n + ', Karte ansehen');
  b.innerHTML = `<img src="${ART[c.n] || ART_FALLBACK}" alt="" decoding="async"><span class="art-top"></span>`;
  patch(b.querySelector('.art-top'), artTop(c, enh));
  return b;
}
/* Vorschau beim Ziehen: Bonus kurz eintragen, rechnen, wieder austragen */
function withPv(C, fn) {
  const pv = UI.pv; let undo = null;
  if (pv && C) {
    if (pv.side === 'p') { C.pB.push(pv.b); undo = () => C.pB.pop(); }
    else if (pv.side === 'm') { C.mB.push(pv.b); undo = () => C.mB.pop(); }
    else if (pv.mon && C.mons.includes(pv.mon)) { pv.mon.enh.push(pv.e); undo = () => pv.mon.enh.pop(); }
  }
  try { return fn(); } finally { if (undo) undo(); }
}
function hudHTML(C) {
  const f0 = sideStrength(C).s, m0 = monStrength(C).s;
  const [sF, sM, r] = withPv(C, () => [sideStrength(C), monStrength(C), evalCombat(C)]);
  const pvF = sF.s !== f0, pvM = sM.s !== m0, pv = pvF || pvM;
  const f = P(C.f), h = C.h != null ? P(C.h) : null;
  const pts = [f, h].filter(Boolean).map(p => `<img${p.human ? ' class="me"' : ''} src="${portrait(p)}" alt="">`).join('');
  const who = (f.human ? 'Du' : f.name) + (h ? ' + ' + (h.human ? 'du' : h.name) : '');
  const team = f.human || (h && h.human);
  const verdict = r.win ? (f.human ? 'du gewinnst' : team ? 'ihr gewinnt' : f.name + ' gewinnt') : (f.human ? 'du verlierst' : team ? 'ihr verliert' : f.name + ' verliert');
  return `<button type="button" class="side me" data-go="parts" aria-label="Kampfstärke ${sF.s}, Aufschlüsselung"><span class="pts">${pts}</span><span class="sv">${pvF ? `<span class="was">${f0} →</span>` : ''}<b class="snum${pvF ? ' pv' : ''}" data-n="f">${sF.s}</b><span class="slbl">${esc(who)}</span></span></button>` +
    `<div class="mid"><span class="verdict ${r.win ? 'win' : 'lose'}${pv ? ' pv' : ''}">${pv ? '→ ' : ''}${esc(verdict)}</span>${r.a === r.b ? `<span class="tie">${r.tieWin ? '' : 'Gleichstand verliert'}</span>` : ''}</div>` +
    `<button type="button" class="side mon" data-go="parts" aria-label="Monsterstärke ${sM.s}, Aufschlüsselung">${PCGX() ? `<span class="pts mpts">${C.mons.map(m => `<img src="${ART[m.c.n] || ART_FALLBACK}" alt="">`).join('')}</span>` : ''}<span class="sv">${pvM ? `<span class="was">${m0} →</span>` : ''}<b class="snum red${pvM ? ' pv' : ''}" data-n="m">${sM.s}</b><span class="slbl">${C.mons.length > 1 ? C.mons.length + ' Monster' : 'Monster'}</span></span></button>`;
}
function paintHud(hud, C) {
  if (!patch(hud, hudHTML(C)) || UI.pv) return;
  hud.querySelectorAll('.snum').forEach(b => {
    const k = b.dataset.n, v = +b.textContent;
    if (W.nums[k] != null && W.nums[k] !== v) { b.classList.add(v > W.nums[k] ? 'up' : 'down'); }
    W.nums[k] = v;
  });
}
function pcgArenaH() { const a = PCGX() && $('#table .arena'); if (a) a.style.setProperty('--ah', a.clientHeight + 'px'); }
window.addEventListener('resize', () => requestAnimationFrame(pcgArenaH));
function renderTable() {
  const el = $('#table');
  const C = S.combat, R = S.reveal;
  const L = tablePick() || UI.dview || null;
  if (L && L.draft) { renderDraft(el, L); return; }
  if (L) { if (W.tableKey !== 'loot') { W.tableKey = 'loot'; W.fightRef = null; el.__h = null; el.innerHTML = ''; } patch(el, lootHTML(L)); return; }
  const key = C ? 'fight' : R ? 'reveal:' + R.uid : 'idle';
  if (key !== W.tableKey || (C && C !== W.fightRef)) {
    const prevReveal = W.tableKey && W.tableKey.startsWith('reveal:') ? +W.tableKey.slice(7) : null;
    W.tableKey = key; W.fightRef = C || null; W.nums = {};
    el.__h = null; el.innerHTML = '';
    if (C) {
      el.innerHTML = '<div class="arena fight"><div class="arts"></div><div class="hud enter"></div></div>';
    } else if (R) {
      el.innerHTML = '<div class="arena reveal"><div class="arts"></div><div class="hud rhud enter"></div></div>';
      el.querySelector('.arts').appendChild(artNode(R, null, 'flip'));
      patch(el.querySelector('.hud'), `<span class="rtxt">${linkify(esc(stripTags(revealTxt(R))))}</span>`);
    } else {
      el.innerHTML = '<div class="idle"></div>';
    }
    W.prevReveal = prevReveal;
  }
  if (C) {
    const arts = el.querySelector('.arts'), have = new Map([...arts.children].map(n => [+n.dataset.uid, n]));
    C.mons.forEach((m, i) => {
      let n = have.get(m.c.uid);
      if (!n) { n = artNode(m.c, m.enh, m.c.uid === W.prevReveal ? '' : 'enter'); }
      else patch(n.querySelector('.art-top'), artTop(m.c, m.enh));
      have.delete(m.c.uid);
      if (arts.children[i] !== n) arts.insertBefore(n, arts.children[i] || null);
    });
    have.forEach(n => n.remove());
    arts.dataset.n = C.mons.length;
    paintHud(el.querySelector('.hud'), C);
    pcgArenaH();
  } else if (!R) {
    if ($('#app').classList.contains('pcg')) patch(el.querySelector('.idle'), `<div class="gdoor${S.cur === 0 && S.winner == null ? ' mine' : ''}"><span class="back door"></span></div><div class="idle-txt">${S.winner != null ? 'Das Spiel ist vorbei.' : S.cur === 0 ? 'Tür noch geschlossen.' : esc(P(S.cur).name) + ' ist am Zug.'}</div>`); else
    patch(el.querySelector('.idle'), `<div class="decks"><div class="deck"><div class="back door" role="img" aria-label="Türstapel"></div>Tür ${S.door.length} · Ablage ${S.doorDisc.length}</div><div class="deck"><div class="back treas" role="img" aria-label="Schatzstapel"></div>Schatz ${S.tr.length} · Ablage ${S.trDisc.length}</div></div><div class="idle-txt">${S.winner != null ? 'Das Spiel ist vorbei.' : S.cur === 0 ? 'Die Tür ist noch zu. Was wohl dahinter lauert?' : esc(P(S.cur).name) + ' ist am Zug.'}</div>`);
  }
}
const stripTags = h => String(h).replace(/<[^>]+>/g, '');
const sellBtnHTML = p => { const b = sellBlock(p); return `<div class="acts"><button type="button" class="btn${UI.adv && UI.adv.sell ? ' rec' : ''}" data-go="sell"${b ? ' disabled' : ''}>Gegenstände verkaufen${b ? ` <small>(ab Stufe ${WINLVL() - 1} nicht mehr)</small>` : ''}</button>${b ? `<p>${esc(b)}</p>` : ''}</div>`; };
// Beute mit Helfer: Die offenen Schätze liegen auf dem Tisch und werden dort angetippt
// Draft: eigenes Tischbild, damit die Flug- und Dreh-Animation nicht bei jedem Neuzeichnen neu startet
// Auswahl auf dem Tisch: Beute nach dem Kampf, Draft und die Elfen-Fähigkeit
function tablePick() { const q = UI.prompt; return q && q.data && (q.ctx === 'loot' || q.data.draft) ? q.data : null; }
function renderDraft(el, L) {
  const key = 'draft:' + L.kind + ':' + L.pick, anim = !UI.reduce;
  if (W.tableKey !== key) {
    W.tableKey = key; W.fightRef = null; el.__h = null;
    const sub = L.sub || (L.pool.length === 1 ? 'Die letzte Karte gehört dir' : `Wahl ${L.pick} von 3 · der Rest geht an ${esc(L.to.name)}`);
    el.innerHTML = `<div class="arena lootar draft from-${L.side} to-${L.exit}"><div class="loot-h">${esc(L.title || 'Draft · ' + L.kind)}</div><div class="loot-sub">${sub}</div>` +
      `<div class="loot-cards" data-n="${L.pool.length}">${L.pool.map((c, i) => `<div class="dcard${anim ? ' in' : ''}" style="--i:${i}" data-duid="${c.uid}"><div class="dflip">${cardMini(c, {where: 'loot', extra: 'lootc'})}<span class="back ${L.deck === 'door' ? 'door' : 'treas'} dback"></span></div></div>`).join('')}</div></div>`;
  }
  const rec = L.phase === 'pick' && UI.adv && UI.adv.opt !== undefined ? (L.vals ? L.vals.indexOf(UI.adv.opt) : UI.adv.opt) : -1;
  el.querySelectorAll('.dcard').forEach((d, i) => {
    const mc = d.querySelector('.mc'); if (mc) mc.classList.toggle('rec', i === rec);
    if (L.phase === 'out' && !d.classList.contains('gone')) {
      d.classList.remove('in'); d.classList.add('gone', anim ? (+d.dataset.duid === L.picked ? 'taken' : 'out') : 'hide');
    }
  });
}
function lootHTML(L) {
  const rec = UI.adv && UI.adv.opt !== undefined ? UI.adv.opt : -1;
  const got = (p, a) => `<span class="lg-row"><img src="${portrait(p)}" alt=""><b>${p.human ? 'Du' : esc(p.name)}</b>${a.length ? a.map(c => `<span class="lg-c">${esc(c.n)}</span>`).join('') : '<span class="lg-none">noch nichts</span>'}</span>`;
  return `<div class="arena lootar"><div class="loot-h">Beute wählen</div>` +
    `<div class="loot-cards" data-n="${L.pool.length}">${L.pool.map((c, i) => cardMini(c, {where: 'loot', extra: 'lootc' + (i === rec ? ' rec' : '')})).join('')}</div>` +
    `<div class="loot-got">${got(L.h, L.hGot)}${got(L.f, L.fGot)}</div></div>`;
}
function adviceBox() {
  const a = UI.adv; if (!a) return '';
  const can = a.opt !== undefined || a.uid || a.sell || (UI.sel && a.picks);
  return `<div class="adv${UI.advOpen ? ' open' : ''}" data-advtoggle><div class="t"><b>${linkify(esc(a.text))}</b><span class="why">${linkify(esc(a.why || ''))}</span></div>${can ? '<button type="button" class="btn" data-adv>Übernehmen</button>' : ''}</div>`;
}
/* Aktionsleiste: eine Zeile Kontext, darunter wenige kompakte Buttons */
const SHORT_OPT = [
  [/^Fertig: Monster besiegen$/, 'Monster besiegen'], [/^Aufgeben und weglaufen$/, 'Weglaufen'], [/^Um Hilfe bitten$/, 'Hilfe holen'],
  [/^Zauberer: Gegenzauber.*/, 'Gegenzauber'], [/^Nebelpulver einsetzen$/, 'Nebelpulver'], [/^Kompass einsetzen$/, 'Kompass'],
  [/^(.+) \(Kampfstärke (\d+)\)$/, '$1 ($2)'], [/^Helfen \(für (\d+) (Schatz|Schätze)\)$/, 'Helfen: $1 $2'], [/^Glücksamulett einsetzen$/, 'Amulett einsetzen']
];
function shortOpt(l, ctx) {
  if (ctx === 'helpOffer') { const m = l.match(/^(\d+) (Schatz|Schätze)$/); if (m) return m[1]; }
  for (const [re, rep] of SHORT_OPT) if (re.test(l)) return l.replace(re, rep);
  return l;
}
function promptCaption(q, ctx, data) {
  const p = me();
  switch (ctx) {
    case 'kick': return q.text || q.title;
    case 'trouble': return 'Kein Monster hinter der Tür';
    case 'loot': return data && data.draft ? 'Tipp auf dem Tisch auf eine Karte' : 'Tipp auf dem Tisch auf einen Schatz';
    case 'elfpick': return 'Tipp auf dem Tisch auf die Karte, die du behältst';
    case 'charity': { const over = p.hand.length - handLimit(p); return over > 0 ? `Abgabe: ${over} ${pl(over, 'Karte', 'Karten')} zu viel` : 'Fertig? Dann Zug beenden'; }
    case 'helpWho': return 'Wen bittest du um Hilfe?';
    case 'helpOffer': return data && data.b ? `Wie viele Schätze bekommt ${data.b.name}?` : q.title;
    case 'botHelp': return data && data.b ? `${data.b.name} bittet dich um Hilfe` : q.title;
    case 'run': {
      if (!data || !data.m) return q.title;
      const need = 5 - (runBonus(p) + (data.m.c.run || 0));
      return `Flucht vor ${data.m.c.n}: ` + (need <= 1 ? 'klappt sicher' : need > 6 ? 'nur mit Karten' : `ab einer ${need}`);
    }
    default: return q.title;
  }
}
function dockButtons(q, ctx) {
  if (ctx === 'loot' || tablePick()) return [];   // gewählt wird auf dem Tisch
  const items = [];
  const mons = ctx === 'trouble' ? q.opts.map((o, i) => [o, i]).filter(([o]) => /^m\d+$/.test(String(o.v))) : [];
  q.opts.forEach((o, i) => { if (!mons.some(([, j]) => j === i)) items.push({type: 'opt', i, o}); });
  if (mons.length) items.unshift({type: 'pick', o: {l: 'Herausfordern', kind: '', dis: mons.every(([o]) => o.dis)}, rec: UI.adv && mons.some(([o]) => o.v === UI.adv.opt)});
  // Primäraktion zuerst, „Abbrechen“ zuletzt
  items.sort((x, y) => (x.o.kind === 'primary' ? -1 : 0) - (y.o.kind === 'primary' ? -1 : 0) || (x.o.kind === 'ghost' ? 1 : 0) - (y.o.kind === 'ghost' ? 1 : 0));
  const cancel = items.filter(it => it.o.kind === 'ghost');
  let main = items.filter(it => it.o.kind !== 'ghost');
  const allNum = main.every(it => it.type === 'opt' && /^\d+$/.test(shortOpt(it.o.l, ctx)));
  if (main.length > 3 && !allNum) main = [...main.slice(0, 2), {type: 'more', o: {l: 'Mehr …', kind: ''}}];
  return [...main, ...cancel];
}
function renderAct() {
  const el = $('#act');
  let html, cls = 'act';
  if (S.winner != null) {
    const w = S.winner >= 0 ? P(S.winner) : null, story = !!S.scn;
    cls += ' your';
    html = `<div class="cap"><span class="ct">${w && w.human ? 'Du hast gewonnen!' : w ? esc(w.name) + ' gewinnt.' : 'Nicht geschafft.'}</span></div><div class="dbtns"><button type="button" class="btn primary" data-go="again">Nochmal</button><button type="button" class="btn" data-go="${story ? 'storymap' : 'menu'}">${story ? 'Zur Karte' : 'Hauptmenü'}</button></div>`;
  } else if (UI.prompt) {
    const q = UI.prompt.get(), ctx = UI.prompt.ctx, data = UI.prompt.data; tutGate(q, ctx); UI.opts = q.opts;
    cls += ' your';
    const hasInfo = !!(q.text || (UI.coach && q.hint && q.hint.length) || UI.adv);
    const tip = UI.adv ? '<span class="tipchip">Tipp</span>' : '';
    const btns = dockButtons(q, ctx).map(it => {
      const k = it.o.kind === 'primary' ? ' primary' : it.o.kind === 'danger' ? ' danger' : it.o.kind === 'ghost' ? ' ghost' : '';
      const rec = (it.type === 'opt' && UI.adv && UI.adv.opt !== undefined && UI.adv.opt === it.o.v) || it.rec ? ' rec' : '';
      const num = it.type === 'opt' && /^\d+$/.test(shortOpt(it.o.l, ctx)) ? ' num' : '';
      const attr = it.type === 'opt' ? `data-opt="${it.i}"` : it.type === 'pick' ? 'data-dpick' : 'data-dmore';
      if (it.o.kind === 'ghost' && /^Abbrechen$/.test(it.o.l)) return `<button type="button" class="btn ghost x" ${attr} aria-label="Abbrechen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg></button>`;
      return `<button type="button" class="btn${k}${rec}${num}" ${attr} ${it.o.dis ? 'disabled' : ''}>${esc(it.type === 'opt' ? shortOpt(it.o.l, ctx) : it.o.l)}</button>`;
    }).join('');
    html = `<button type="button" class="cap${hasInfo ? ' info' : ''}" ${hasInfo ? 'data-dinfo' : 'disabled'}>${tip}<span class="ct">${esc(stripTags(promptCaption(q, ctx, data)))}</span>${hasInfo ? '<span class="ii" aria-label="Mehr Infos">i</span>' : ''}</button><div class="dbtns" data-n="${dockButtons(q, ctx).length}">${btns}</div>`;
  } else {
    cls += ' idle';
    // letzte Meldung seit dem Zugwechsel; direkt nach dem Wechsel steht dort, wer jetzt dran ist
    const last = S.log.slice().reverse().find(e => UI.coach || e.kind !== 'rule');
    const who = P(S.cur);
    const line = !last || last.kind === 'turn' ? (S.cur === 0 ? 'Einen Moment …' : `${who.name} ist am Zug`) : stripTags(last.t);
    // Porträt passend zur Meldung: wer am Satzanfang steht, sonst wer am Zug ist
    const actor = S.players.find(p => p.human ? /^(Du|Dein|Deine)\b/.test(line) : line.startsWith(p.name + ' ') || line.startsWith(p.name + ':')) || who;
    html = `<div class="cap"><img class="cpt${actor.human ? ' me' : ''}" src="${portrait(actor)}" alt=""><span class="ct">${esc(line)}</span></div>`;
  }
  if (el.className !== cls) el.className = cls;
  patch(el, html);
}
function renderMe() {
  const p = me();
  const C = S.combat, role = C ? (C.f === 0 ? 'kämpft' : C.h === 0 ? 'hilft' : '') : '', turn = S.cur === 0 && S.winner == null;
  const over = p.hand.length > handLimit(p), mb = $('#mebar'), bx = myBg();
  mb.classList.toggle('hasbg', !!bx[2]); mb.style.setProperty('--bg', bx[2] ? `url('${bgSrc(bx, true)}')` : ''); mb.style.setProperty('--bgp', bx[4] || '');
  // Ganzer Bereich öffnet das eigene Profil; Status wie bei den Gegnern als Schild oben rechts
  mb.dataset.go = 'equip'; mb.setAttribute('role', 'button'); mb.setAttribute('aria-label', `Deine Werte und Ausrüstung, Stufe ${p.lvl} von ${WINLVL()}`);
  const tag = role ? `<span class="tag red">${role}</span>` : p.dead ? '<span class="tag">tot</span>' : turn ? '<span class="tag">am Zug</span>' : '';
  patch(mb, tag + `<button type="button" class="ptbtn" data-go="equip" aria-label="Deine Werte und Ausrüstung"><img class="pt" src="${myPortrait()}" alt=""></button>` +
    `<span class="mlv${W.coinPop ? ' pop' : ''}" title="Stufe ${p.lvl} von ${WINLVL()}"><img src="icons/muenze-voll.png" alt=""><b>${p.lvl}<small>/${WINLVL()}</small></b>${p.spore ? `<em class="neg" title="Sporenwolke">−${p.spore}</em>` : ''}${p.gold ? `<em class="gold" title="Goldbeutel: ${fmt(p.gold)} Gold">${fmt(p.gold)} G</em>` : ''}</span>` +
    `<span class="mstats"><button type="button" class="mstat" data-go="equip" aria-label="Kampfstärke ${power(p)}"><img src="${ICON.kampf}" alt="">${power(p)}</button>` +
    `<button type="button" class="mstat" data-go="equip" aria-label="Weglaufen ${sign(runBonus(p))}"><img src="${ICON.run}" alt="">${sign(runBonus(p))}</button>` +
    `<button type="button" class="mstat${over ? ' warn' : ''}" data-go="equip" aria-label="Handkarten ${p.hand.length} von ${handLimit(p)}"><img src="${ICON.hand}" alt="">${p.hand.length}/${handLimit(p)}</button>` +
    `<button type="button" class="mstat packbtn" data-go="equip" aria-label="Ausrüstung und Rucksack, ${p.pack.length} von ${packLimit(p)}"><img src="${ICON.slot.pack}" alt="">${p.pack.length}/${packLimit(p)}</button></span>`);
}
function renderHand() {
  const el = $('#hand'), p = me();
  const cards = p.hand.slice().sort((a, b) => TYPE_ORDER.indexOf(a.k) - TYPE_ORDER.indexOf(b.k));
  if (!cards.length) { patch(el, '<p class="empty">Keine Handkarten.</p>'); return; }
  if (el.__h) { el.innerHTML = ''; el.__h = null; }
  const existing = new Map([...el.children].map(n => [n.dataset.uid, n]));
  const nodes = cards.map(c => {
    const cls = [];
    if (UI.adv && (UI.adv.uid === c.uid || (UI.adv.picks && UI.adv.picks.includes(c.uid)))) cls.push('rec');
    if (W.fresh.has(c.uid)) cls.push('new');
    if (dragIntents(c).some(it => !it.dis)) cls.push('can');
    const html = cardMini(c, {where: 'hand', extra: cls.join(' ')});
    let node = existing.get(String(c.uid));
    if (!node || node.__h !== html) { const tmp = document.createElement('div'); tmp.innerHTML = html; const n = tmp.firstElementChild; n.__h = html; if (node) node.replaceWith(n); node = n; }
    existing.delete(String(c.uid));
    return node;
  });
  existing.forEach(n => n.remove());
  nodes.forEach((n, i) => { if (el.children[i] !== n) el.insertBefore(n, el.children[i] || null); });
}
function renderDice() {
  const ov = $('#diceov'), r = UI.roll;
  if (!r || (W.diceHideAt && performance.now() > W.diceHideAt)) { ov.hidden = true; return; }
  ov.hidden = false;
  const img = $('#dice-img'), src = DICE[r.face - 1];
  if (img.getAttribute('src') !== src) img.setAttribute('src', src);
  const cls = r.rolling ? 'roll' : 'land'; if (img.className !== cls) img.className = cls;
  $('#dice-cap').textContent = r.rolling ? (r.who === 'Du' ? 'Du würfelst …' : `${r.who} würfelt …`) : `${r.who === 'Du' ? 'Dein Wurf' : r.who}: ${r.face}`;
}

/* ================= Blätter ================= */
const SHEETS = [];
const topSheet = () => SHEETS[SHEETS.length - 1];
function updatePaused() { UI.paused = CUR !== 'game' || document.hidden || SHEETS.some(s => s.id !== 'sel' && s.id !== 'log'); }
function openSheet(s) {
  if (TUT && SCN && SCN.tut) { if (s.id === 'equip') TUT.sawMe = true; if (s.id === 'card') TUT.sawCard = true; if (s.id === 'opp') TUT.sawOpp = true; }   // Probespiel: Profile einmal ansehen
  SHEETS.push(s); renderSheet(true); Snd.sfx('page');
}
function popSheet() { SHEETS.pop(); renderSheet(true); }
function closeAllSheets() { while (SHEETS.length && topSheet().id !== 'sel') SHEETS.pop(); if (SHEETS.length && topSheet().id === 'sel') { renderSheet(false); return; } renderSheet(true); }
function renderSheet(fresh) {
  const wrap = $('#sheetwrap'), el = $('#sheet');
  updatePaused();
  if (SCN && SCN.tut && fresh) setTimeout(tutUpdate, 0);
  if (!SHEETS.length) { wrap.classList.remove('open'); wrap.setAttribute('aria-hidden', 'true'); el.innerHTML = ''; el.__h = ''; dockSheet(); return; }
  const s = topSheet(), view = SHEET_VIEWS[s.id](s);
  if (!view) { SHEETS.pop(); renderSheet(true); return; }
  wrap.classList.add('open'); wrap.setAttribute('aria-hidden', 'false'); el.dataset.sid = s.id; dockSheet();
  const canClose = s.id !== 'sel';
  const html = `<div class="grab"><i></i></div><div class="sh-head${view.hero ? ' has-hero' : ''}">${SHEETS.length > 1 && canClose ? '<button type="button" class="iconbtn" data-sheetback aria-label="Zurück"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg></button>' : ''}${view.head || ''}${canClose ? '<button type="button" class="iconbtn" data-sheetclose aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg></button>' : ''}</div><div class="sh-body">${view.body}</div>`;
  const body = el.querySelector('.sh-body'), st = body && !fresh ? body.scrollTop : 0;
  if (fresh) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }
  if (patch(el, html)) { const nb = el.querySelector('.sh-body'); if (nb) nb.scrollTop = s.id === 'log' && (fresh || s.stick) ? nb.scrollHeight : st; }
  if (s.id === 'log') W.logSeen = S ? S.log.length : 0;
  watchBoards(el); fitNames(el);
}
const h3 = t => `<h3>${t}</h3>`;
/* Holzbretter (Auftragsbrett, Ladenregal) als ein einziges Bild in genau passender Größe zeichnen:
   Rahmen unverzerrt, Mitte gestreckt. Als CSS-9-Slice zeigte der Browser je nach Skalierung Haarlinien an den Nähten. */
// Holzbretter und Schriftrolle: Quelle, Schnittkanten im Bild [oben, rechts, unten, links], Anzeigebreite der Kanten, Alphakanal
const BOARDS = [
  {sel: '.notes', src: 'art/brett-auftraege.webp', s: [54, 54, 54, 54], w: [17, 17, 17, 17]},
  // Händler im Storymodus: je Welt eigenes Regal (vor dem allgemeinen Eintrag, der erste passende gewinnt)
  {sel: '.sitems.rg-w1', src: 'art/regal-w1.webp', s: [120, 120, 120, 120], w: [30, 30, 30, 30]},
  {sel: '.sitems.rg-w2', src: 'art/regal-w2.webp', s: [200, 190, 190, 190], w: [48, 46, 46, 46]},
  {sel: '.sitems.rg-w3', src: 'art/regal-w3.webp', s: [215, 150, 110, 150], w: [50, 36, 28, 36]},
  {sel: '.sitems.rg-w4', src: 'art/regal-w4.webp', s: [105, 105, 105, 105], w: [26, 26, 26, 26]},
  {sel: '.sitems.rg-w5', src: 'art/regal-w5.webp', s: [185, 185, 185, 185], w: [44, 44, 44, 44]},
  {sel: '.sitems', src: 'art/ladenregal.webp', s: [95, 95, 95, 95], w: [24, 24, 24, 24]},
  {sel: '.scroll', src: 'art/schriftrolle.webp', s: [100, 110, 95, 110], w: [46, 52, 44, 52], alpha: true},
  {sel: '.pack', src: 'art/leder-rucksack.webp', s: [72, 72, 72, 72], w: [22, 22, 22, 22], alpha: true}
];
const BOARD_IMG = {}, BOARD_URL = {};
let BOARD_CSS = false;   // true, wenn Zeichnen nicht erlaubt ist
const boardRO = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(es => es.forEach(e => paintBoard(e.target))) : null;
function watchBoards(root) {
  BOARDS.forEach(({sel}) => root.querySelectorAll(sel).forEach(el => {
    if (!el.__ro) { el.__ro = true; if (boardRO) boardRO.observe(el); }
    // Nicht nur auf den ResizeObserver verlassen: beim Aufklappen des Fensters meldet er sonst einmal 0 und dann nichts mehr
    requestAnimationFrame(() => paintBoard(el)); setTimeout(() => paintBoard(el), 450);
  }));
}
function paintBoard(el, tries = 0) {
  const cfg = BOARDS.find(b => el.matches(b.sel)); if (!cfg || !el.isConnected) return;
  // Direkt als Datei geöffnet (file://) darf Chrome die Zeichenfläche nicht auslesen: dann die CSS-Fassung aus neun Stücken
  if (location.protocol === 'file:' || BOARD_CSS) { el.classList.add('b9'); return; }
  const {src, s, w: bw, alpha} = cfg, w = el.offsetWidth, h = el.offsetHeight;
  if (!w || !h) { if (tries < 20) setTimeout(() => paintBoard(el, tries + 1), 100); return; }
  const dpr = Math.min(3, window.devicePixelRatio || 1), key = `${src}|${w}x${h}@${dpr}`;
  if (el.__bk === key) return; el.__bk = key;
  const apply = u => { if (el.__bk === key) el.style.backgroundImage = `url(${u})`; };
  if (BOARD_URL[key]) { apply(BOARD_URL[key]); return; }
  let img = BOARD_IMG[src]; if (!img) { img = BOARD_IMG[src] = new Image(); img.src = src; }
  const draw = () => {
    const W = Math.round(w * dpr), H = Math.round(h * dpr), b = bw.map(v => Math.round(v * dpr)), iw = img.naturalWidth, ih = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
    const sx = [0, s[3], iw - s[1], iw], dx = [0, b[3], W - b[1], W], sy = [0, s[0], ih - s[2], ih], dy = [0, b[0], H - b[2], H];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.drawImage(img, sx[i], sy[j], sx[i + 1] - sx[i], sy[j + 1] - sy[j], dx[i], dy[j], dx[i + 1] - dx[i], dy[j + 1] - dy[j]);
    try { c.toBlob(bl => { if (!bl) { BOARD_CSS = true; el.classList.add('b9'); return; } BOARD_URL[key] = URL.createObjectURL(bl); apply(BOARD_URL[key]); }, alpha ? 'image/png' : 'image/jpeg', 0.9); }
    catch (e) { BOARD_CSS = true; el.classList.add('b9'); }
  };
  if (img.complete && img.naturalWidth) draw(); else img.addEventListener('load', draw, {once: true});
}
/* Ausrüsten: was steckt schon im Slot, was wandert in den Rucksack, wie ändert sich die Kampfstärke */
function equipInfo(p, c) {
  if (!p || !c || c.k !== 'item' || !c.slot || c.slot === 'none' || p.eq.includes(c)) return null;
  const q = Object.assign({}, p, {eq: [...p.eq], pack: [...p.pack], hand: [...p.hand]});
  const moved = equip(q, c), ok = canEquip(p, c).ok;
  const now = p.eq.filter(i => i.slot === c.slot);
  return {now, moved, ok, k0: power(p), k1: power(q), r0: runBonus(p), r1: runBonus(q)};
}
const SLOT_HEAD = {kopf: 'Auf dem Kopf trägst du', ruestung: 'Als Rüstung trägst du', schuhe: 'An den Füßen trägst du', hand: 'In der Hand hältst du'};
const SLOT_FREE = {kopf: 'Du trägst noch keine Kopfbedeckung.', ruestung: 'Du trägst noch keine Rüstung.', schuhe: 'Du trägst noch kein Schuhwerk.', hand: 'Beide Hände sind noch frei.'};
function equipInfoHTML(p, c) {
  const e = equipInfo(p, c); if (!e) return '';
  const row = i => { const out = e.moved.includes(i), act = usable(p, i);
    return `<button type="button" class="es-it" data-uid="${i.uid}" data-where="eq"><img src="${ART[i.n] || ART_FALLBACK}" alt=""><span><b>${esc(i.n)}</b><small>${sign(i.b || 0)}${act ? '' : ' · inaktiv'}${i.run ? ` · Weglaufen ${sign(i.run)}` : ''}</small></span><em class="${out ? 'out' : ''}">${out ? 'kommt in den Rucksack' : 'bleibt'}</em></button>`; };
  const head = c.slot === 'hand' && e.now.length > 1 ? 'In den Händen hältst du' : SLOT_HEAD[c.slot];
  const body = e.now.length ? `<span class="es-h">${head}</span>${e.now.map(row).join('')}${c.slot === 'hand' && !e.moved.length ? '<span class="es-free">Die zweite Hand ist noch frei.</span>' : ''}` : `<span class="es-free">${SLOT_FREE[c.slot]}</span>`;
  const d = e.k1 - e.k0, dr = e.r1 - e.r0;
  const pw = e.ok ? `<span class="es-pw ${d > 0 ? 'up' : d < 0 ? 'down' : ''}">Kampfstärke ${e.k0} → ${e.k1}${dr ? ` · Weglaufen ${sign(e.r0)} → ${sign(e.r1)}` : ''}</span>` : '';
  return `<div class="eqswap">${body}${pw}</div>`;
}
function equipSub(p, c) {
  const e = equipInfo(p, c); if (!e) return '';
  return (e.moved.length ? `ersetzt ${e.moved.map(i => i.n).join(' + ')}` : 'Platz frei') + (e.ok ? ` · Kampf ${e.k0} → ${e.k1}` : '');
}
const SHEET_VIEWS = {
  info() {
    if (!UI.prompt) return null;
    const q = UI.prompt.get(); tutGate(q, UI.prompt.ctx);
    const hints = UI.coach && q.hint && q.hint.length ? `<ul class="hints">${q.hint.map(x => `<li>${linkify(x)}</li>`).join('')}</ul>` : '';
    return {head: h3(esc(q.title)), body: `${q.text ? `<p class="atxt">${linkify(q.text)}</p>` : ''}${adviceBox()}${hints}<div class="acts">${q.opts.map((o, i) => `<button type="button" class="btn ${o.kind === 'primary' ? 'primary' : o.kind === 'danger' ? 'danger' : ''}${UI.adv && UI.adv.opt !== undefined && UI.adv.opt === o.v ? ' rec' : ''}" data-opt="${i}" ${o.dis ? 'disabled' : ''}>${esc(o.l)}</button>`).join('')}</div>`};
  },
  pick() {
    if (!UI.prompt || UI.prompt.ctx !== 'trouble') return null;
    const q = UI.prompt.get(), p = me();
    const items = q.opts.map((o, i) => [o, i]).filter(([o]) => /^m\d+$/.test(String(o.v))).map(([o, i]) => {
      const c = findCard(+String(o.v).slice(1)); if (!c) return '';
      const ok = power(p) > c.lvl;
      return `<button type="button" class="pickbtn${UI.adv && UI.adv.opt === o.v ? ' rec' : ''}" data-opt="${i}">${cardMini(c, {inert: true, size: 'grid'})}<span class="pk ${ok ? 'good' : 'bad'}">Du ${power(p)} : ${c.lvl}</span></button>`;
    }).join('');
    return {head: h3('Welches Monster forderst du heraus?'), body: `<div class="sel-grid">${items}</div><p class="hint">Tipp: Du kannst ein Monster auch direkt aufs Spielfeld ziehen.</p>`};
  },
  more() {
    if (!UI.prompt) return null;
    const q = UI.prompt.get(); tutGate(q, UI.prompt.ctx);
    return {head: h3(esc(q.title)), body: `<div class="acts">${q.opts.map((o, i) => `<button type="button" class="btn ${o.kind === 'primary' ? 'primary' : o.kind === 'danger' ? 'danger' : ''}" data-opt="${i}" ${o.dis ? 'disabled' : ''}>${esc(o.l)}</button>`).join('')}</div>`};
  },
  card(s) {
    let c = null;
    if (s.human) c = HUMAN; else if (s.cname) c = CATALOG[s.cname] || POOLCAT[s.cname]; else c = findCard(s.uid);
    if (!c) return null;
    const live = !s.cname && !s.human && s.where && ['hand', 'eq', 'pack', 'race', 'cls'].includes(s.where);
    const acts = live ? cardActions(c, s.where) : [];
    let tutLock = false;   // Einführung: nur die Aktion, um die es gerade geht (auch nicht Ablegen, Verkaufen oder Rucksack)
    if (live) acts.forEach(a => { if (a.fn && !tutActOk(c, a.l, s.where)) { a.dis = true; tutLock = true; } });
    if (tutLock && acts.some(a => a.fn) && acts.every(a => !a.fn || a.dis)) acts.unshift({info: 'Hilde: „Die brauchst du gerade nicht. Mach erst mal, was ich dir zeige.“'});
    UI.cardActs = acts;
    const meaning = cardMeaning(c), wh = S && !s.human ? whereNow(c) : [];
    const actHTML = acts.map((a, i) => a.info ? `<p>${a.info}</p>` : `<button type="button" class="btn ${a.kind === 'primary' ? 'primary' : ''}${UI.adv && UI.adv.uid === c.uid && UI.adv.act && a.l.startsWith(UI.adv.act) ? ' rec' : ''}" data-cact="${i}" ${a.dis ? 'disabled' : ''}>${esc(a.l)}</button>${a.dis && a.dis !== true ? `<p class="err">${a.dis}</p>` : ''}`).join('');
    const swap = live && (s.where === 'hand' || s.where === 'pack') ? equipInfoHTML(me(), c) : '';
    const info = (meaning ? `<p class="meaning">${meaning}</p>` : '') + (wh.length ? `<ul class="wherenow">${wh.map(x => `<li>${x}</li>`).join('')}</ul>` : ''), actBox = actHTML ? `<div class="acts">${actHTML}</div>` : '';
    /* Beim Ausrüsten stehen Slot-Info und Knopf direkt unter der Karte, die Erklärung danach */
    if (PCGX() && CUR === 'game') {
      // PC: Karte links, rechts die Aktionen kompakt. Hauptaktionen groß, alles andere als kleine Knöpfe nebeneinander,
      // Ziele („Auf Nyra spielen“) mit dem Porträt des Spielers.
      const face = l => { const m = l.match(/^Auf (.+?) spielen$/); const q = m && S.players.find(x => (x.human ? 'dich' : x.name) === m[1]); return q ? `<img class="cdx-pt" src="${portrait(q)}" alt="">` : ''; };
      const btn = (a, i) => `<button type="button" class="btn ${a.kind === 'primary' ? 'primary' : ''}${UI.adv && UI.adv.uid === c.uid && UI.adv.act && a.l.startsWith(UI.adv.act) ? ' rec' : ''}" data-cact="${i}" ${a.dis ? 'disabled' : ''}>${face(a.l)}<span>${esc(a.l)}</span></button>`;
      const main = [], more = [], notes = [];
      acts.forEach((a, i) => { if (a.info) notes.push(`<p class="cdx-note">${a.info}</p>`); else { (a.kind === 'primary' ? main : more).push(btn(a, i)); if (a.dis && a.dis !== true) notes.push(`<p class="err">${a.dis}</p>`); } });
      if (!main.length && more.length) { const k = acts.findIndex(a => !a.info && !a.dis && !/^Auf /.test(a.l)); if (k >= 0) { const b0 = btn(Object.assign({}, acts[k], {kind: 'primary'}), k), j = more.indexOf(btn(acts[k], k)); if (j >= 0) { more.splice(j, 1); main.push(b0); } } }
      const box = main.length || more.length ? `<div class="cdx-acts">${main.length ? `<div class="cdx-main">${main.join('')}</div>` : ''}${more.length ? `<div class="cdx-more">${more.join('')}</div>` : ''}</div>` : '';
      return {head: h3(''), body: `<div class="cdx"><div class="cdx-card">${cardBig(c)}</div><div class="cdx-side">${notes.join('')}${swap}${box}${info}</div></div>`};
    }
    return {head: h3(''), body: cardBig(c) + (swap ? swap + actBox + info : info + actBox)};
  },
  opp(s) {
    const p = S && S.players[s.pid]; if (!p) return null;
    const hand = UI.open && p.hand.length ? `<div class="hsec"><span class="hsec-h"><img src="${ICON.hand}" alt="">Handkarten</span><span class="hsec-x">sichtbar, weil eingeschaltet</span></div><div class="pack-row">${p.hand.map(c => cardMini(c, {where: 'opp', size: 'tiny'})).join('')}</div>` : '';
    if (PCGX()) return {hero: true, head: heroHead(p), body: `<div class="hbody hb2"><div class="hb-l">${heroStats(p)}${heroAbil(p)}${heroPack(p, false, true)}${hand}</div><div class="hb-r">${heroDoll(p, false)}</div></div>`};
    return {hero: true, head: heroHead(p), body: `<div class="hbody">${heroStats(p)}${heroAbil(p)}${heroDoll(p, false)}${heroPack(p, false)}${hand}</div>`};
  },
  equip() {
    if (!S) return null;
    const p = me(), free = isFree();
    if (PCGX()) return {hero: true, head: heroHead(p), body: `<div class="hbody hb2"><div class="hb-l">${heroStats(p)}${heroAbil(p)}${heroPack(p, true, true)}<p class="hint hb-hint">Karte anklicken für Aktionen. Im Kampf zählen Stufe, Volk, Klasse und die Ausrüstung, der Rucksack nicht.</p>${free ? sellBtnHTML(p) : ''}</div><div class="hb-r">${heroDoll(p, true)}</div></div>`};
    return {hero: true, head: heroHead(p), body: `<div class="hbody">${heroStats(p)}${heroAbil(p)}${heroDoll(p, true)}${heroPack(p, true)}` +
      `<p class="hint hb-hint">Karte antippen für Aktionen. Im Kampf zählen Stufe, Volk, Klasse und die Ausrüstung, der Rucksack nicht.</p>` +
      (free ? sellBtnHTML(p) : '') + `</div>`};
  },
  log(s) {
    if (!S) return null;
    s.stick = true;
    const items = S.log.filter(e => UI.coach || e.kind !== 'rule');
    return {head: h3('Spielleiter-Notizen'), body: `<ul class="loglist">${items.map(e => `<li class="l-${e.kind}">${e.kind === 'rule' ? '<b>Regel:</b> ' : ''}${linkify(e.t)}</li>`).join('')}</ul>`};
  },
  parts() {
    const C = S && S.combat; if (!C) return null;
    const sF = sideStrength(C), sM = monStrength(C), r = evalCombat(C);
    const li = x => `<li><span>${esc(x.l)}</span><b>${x.keep ? x.v : sign(x.v)}</b></li>`;
    return {head: h3('Wie sich der Kampf zusammensetzt'), body: `<h4 class="lbl">Kämpfende Seite</h4><ul class="parts">${sF.parts.filter(x => x.v !== 0 || x.keep).map(li).join('')}<li class="sum"><span>Summe</span><b>${sF.s}</b></li></ul>` +
      `<h4 class="lbl">Monster</h4><ul class="parts">${sM.parts.filter(x => x.v !== 0 || x.keep).map(li).join('')}<li class="sum"><span>Summe</span><b>${sM.s}</b></li></ul>` +
      `<p class="hint">${r.win ? 'Die kämpfende Seite ist stärker und gewinnt.' : r.a === r.b ? 'Gleichstand reicht nicht.' : 'Das Monster ist stärker. Ohne weitere Hilfe heißt es weglaufen.'}</p>`};
  },
  pause() {
    if (S && S.scn) { const st = stationById(S.scn);
      return {head: h3(st ? `${st.no} · ${esc(st.name)}` : 'Pause'), body: `${st ? `<div class="st-goal"><b>Ziel</b><p>${esc(st.goal)}</p></div>` : ''}<div class="acts"><button type="button" class="btn primary" data-go="resume">Weiterspielen</button><button type="button" class="btn" data-go="restart">Von vorne beginnen</button><button type="button" class="btn" data-go="settings">Optionen</button><button type="button" class="btn" data-go="rules">Spielregeln</button><button type="button" class="btn" data-go="storymap">Zur Storykarte</button></div><p class="hint">${SCN && !SCN.fight && !SCN.tut ? 'Die Station wird zu Beginn jedes deiner Züge gespeichert. Auf der Storykarte kannst du sie später fortsetzen.' : 'Rätsel und Probespiel werden nicht gespeichert. Verlässt du sie, startest du später neu.'}</p>`}; }
    return {head: h3('Pause'), body: `<div class="acts"><button type="button" class="btn primary" data-go="resume">Weiterspielen</button><button type="button" class="btn" data-go="restart">Von vorne beginnen</button><button type="button" class="btn" data-go="settings">Optionen</button><button type="button" class="btn" data-go="rules">Spielregeln</button><button type="button" class="btn" data-go="cards">Alle Karten</button><button type="button" class="btn" data-go="menu">Hauptmenü</button></div><p class="hint">Dein Spiel wird zu Beginn jedes deiner Züge gespeichert.</p>`};
  },
  sel() {
    const s = UI.sel; if (!s) return null;
    const p = me(), cands = [];
    [['hand', p.hand], ['eq', p.eq], ['pack', p.pack]].forEach(([w, arr]) => arr.forEach(c => { if (s.filter(c, w)) cands.push([c, w]); }));
    const picked = [...s.picked].map(findCard).filter(Boolean), err = s.validate ? s.validate(picked) : null;
    const ok = picked.length >= s.min && picked.length <= s.max && !err;
    const mini = ([c, w]) => cardMini(c, {where: w, extra: (s.picked.has(c.uid) ? 'picked' : '') + (UI.adv && UI.adv.picks && UI.adv.picks.includes(c.uid) ? ' rec' : '') + (w === 'eq' && !usable(p, c) ? ' inactive' : '')});
    const zones = [['eq', 'Ausgerüstet'], ['pack', 'Im Rucksack'], ['hand', 'Auf der Hand']].filter(([w]) => cands.some(x => x[1] === w));
    const grid = zones.length > 1
      ? zones.map(([w, l]) => { const cs = cands.filter(x => x[1] === w); return `<h4 class="selgrp">${l}<span>${cs.length}</span></h4><div class="sel-grid">${cs.map(mini).join('')}</div>`; }).join('')
      : `<div class="sel-grid">${cands.map(mini).join('')}</div>`;
    return {head: h3(esc(s.title || 'Karten wählen')), body: `<p class="atxt" style="margin:0">${s.text} <span class="hint">(${picked.length} gewählt)</span></p>${adviceBox()}${s.extra ? `<p class="sel-extra">${s.extra(picked)}</p>` : ''}${err ? `<p class="sel-err">${err}</p>` : ''}${grid}` +
      `<div class="acts"><button type="button" class="btn primary" data-sel="ok" ${ok ? '' : 'disabled'}>${s.confirm ? s.confirm(picked) : 'Bestätigen'}</button>${s.optional ? '<button type="button" class="btn" data-sel="skip">Überspringen</button>' : ''}${s.cancel ? '<button type="button" class="btn ghost" style="color:var(--ink);border-color:var(--edge)" data-sel="cancel">Abbrechen</button>' : ''}</div>`};
  }
};
function syncSel() {
  const has = SHEETS.some(s => s.id === 'sel');
  if (UI.sel && !has) openSheet({id: 'sel'});
  if (!UI.sel && has) { for (let i = SHEETS.length - 1; i >= 0; i--) if (SHEETS[i].id === 'sel') SHEETS.splice(i, 1); renderSheet(true); }
}
function stats3(p) {
  return `<div class="stats3"><div class="stat3"><img src="${ICON.kampf}" alt=""><b>${power(p)}</b><span>Kampfstärke</span></div><div class="stat3"><img src="${ICON.run}" alt=""><b>${sign(runBonus(p))}</b><span>Weglaufen</span></div><div class="stat3"><img src="${ICON.hand}" alt=""><b>${p.hand.length}/${handLimit(p)}</b><span>Handkarten</span></div></div>`;
}
function abilList(p) {
  const a = [...(p.race ? ABIL[p.race.r].map(x => `<span class="ab race">${x}</span>`) : []), ...(p.cls ? ABIL[p.cls.c].map(x => `<span class="ab">${x}</span>`) : [])];
  return `<div class="abil">${a.length ? a.join('') : '<span class="ab none">keine Fähigkeiten</span>'}</div>`;
}
/* ===== Heldenbogen: geöffnetes Profil im Spiel =====
   Kopf mit Hintergrund, Porträt, Rahmen, Titel und Stufe. Darunter drei Werte (antippen = Rechnung),
   Volk und Klasse mit Fähigkeiten, die Ausrüstung als Figur (Kopf, Hände, Rüstung, Schuhe, Sonstiges in den Ecken)
   und der Rucksack als Leiste. */
// Lange Namen werden kleiner geschrieben statt abgeschnitten (bis zur Mindestgröße)
function fitNames(root) {
  requestAnimationFrame(() => $$('.fitname', root).forEach(el => {
    if (!el.clientWidth) return;
    const max = parseFloat(el.dataset.fmax || (el.dataset.fmax = getComputedStyle(el).fontSize)), min = max * 0.55;
    let f = max; el.style.fontSize = f + 'px';
    while (el.scrollWidth > el.clientWidth + 1 && f > min) { f -= 1; el.style.fontSize = f + 'px'; }
  }));
}
// Hintergrund als Ware: kleines Gemälde auf der Staffelei (Leinwand ist in der Grafik ausgeschnitten)
const easel = (key, c, cls = '') => `<span class="easel${cls}"><i style="background-image:url('art/kulisse-${key}-k.webp');background-position:${(c && c.p) || '50% 50%'}"></i></span>`;
function heroHead(p) {
  const title = p.human ? myTitle() : '';
  return `<div class="sh-hero${bgAttr(bgOf(p))}"><span class="hh-pt">${bigPortrait(p)}<b class="hh-lvl" aria-label="Stufe ${p.lvl}">${p.lvl}</b></span>` +
    `<h3><span class="fitname">${esc(p.human ? myName() : p.name)}</span>${title ? `<em class="sh-title">${esc(title)}</em>` : ''}${p.dead ? '<span class="sh-lvl">tot</span>' : ''}<span class="coins">${coinsHTML(p.lvl)}</span></h3></div>`;
}
function heroStats(p) {
  const pw = power(p), eqb = pw - p.lvl, rb = runBonus(p), need = Math.max(1, 5 - rb), over = p.hand.length > handLimit(p), open = UI.ptip;
  const tile = (k, icon, val, lbl, sub, cls = '') => `<button type="button" class="hs${cls}${open === k ? ' on' : ''}" data-ptip="${k}" aria-expanded="${open === k}"><img src="${icon}" alt=""><b>${val}</b><span>${lbl}</span><small>${sub}</small></button>`;
  const tip = open === 'power' ? powerTip(p) : open === 'run' ? runTip(p) : open === 'hand' ? handTip(p) : open === 'gold' ? goldTip(p) : '';
  const g = p.gold || 0;
  return `<div class="hstats">${tile('power', ICON.kampf, pw, 'Kampfstärke', `Stufe ${p.lvl}${eqb ? ` ${eqb > 0 ? '+' : '−'} ${Math.abs(eqb)}` : ''}`, ' main')}` +
    tile('run', ICON.run, need <= 1 ? 'immer' : `ab ${need}`, 'Weglaufen', `Bonus ${sign(rb)}`) +
    tile('hand', ICON.hand, `${p.hand.length}/${handLimit(p)}`, 'Handkarten', over ? 'zu viele' : 'Platz frei', over ? ' warn' : '') +
    tile('gold', ICON.gold, fmt(g), 'Goldbeutel', g < 1000 ? `${fmt(1000 - g)} bis Stufe` : 'reicht für Stufe', g ? ' gold' : '') + `</div>` +
    (tip ? `<div class="tipbox hs-tip">${tip}</div>` : '');
}
function heroAbil(p) {
  const a = [...(p.race ? (ABIL[p.race.r] || []).map(x => `<span class="ab race">${x}</span>`) : []), ...(p.cls ? (ABIL[p.cls.c] || []).map(x => `<span class="ab">${x}</span>`) : [])];
  return a.length ? `<div class="abil habil">${a.join('')}</div>` : '';
}
// Volk oder Klasse als Platz in der Figur
function identTile(p, c, kind, mine) {
  const lbl = kind === 'race' ? 'Volk' : 'Klasse';
  if (!c && kind === 'cls') return `<span class="et empty id"><img src="${ICON.slot.cls}" alt=""><span class="et-n">Klasse</span></span>`;
  const art = c ? ART[c.n] : (ART.Mensch || ICON.slot.race), attrs = c ? `data-uid="${c.uid}" data-where="${mine ? kind : 'opp'}"` : 'data-human="1"';
  return `<button type="button" class="et id k-${kind}" ${attrs} aria-label="${lbl}: ${esc(c ? c.n : 'Mensch')}"><img class="et-art" src="${art}" alt=""><i class="et-kind">${lbl}</i><span class="et-n">${esc(c ? c.n : 'Mensch')}</span></button>`;
}
function eqTile(p, c, mine, where, cls = '') {
  if (!c) return '';
  const off = where === 'eq' && !usable(p, c), badges = [];
  if (c.b) badges.push(`<b class="et-b${off ? ' off' : ''}">+${c.b}</b>`);
  if (c.run) badges.push(`<b class="et-r${off ? ' off' : ''}"><img src="${ICON.run}" alt="">+${c.run}</b>`);
  return `<button type="button" class="et${off ? ' off' : ''}${cls}${mine && UI.adv && UI.adv.uid === c.uid ? ' rec' : ''}" data-uid="${c.uid}" data-where="${mine ? where : 'opp'}" aria-label="${esc(c.n)}">` +
    `<img class="et-art" src="${ART[c.n] || ICON.slot[c.slot] || ICON.slot.none}" alt="" loading="lazy">${badges.join('')}${c.big ? '<i class="et-big">Sperrig</i>' : ''}` +
    `<span class="et-n">${esc(c.n)}</span>${off ? `<i class="et-off">nur ${esc(reqName(c))}</i>` : ''}</button>`;
}
const eqEmpty = (slot, lbl, cls = '') => `<span class="et empty${cls}"><img src="${ICON.slot[slot]}" alt=""><span class="et-n">${lbl}</span></span>`;
function heroDoll(p, mine) {
  const by = s => p.eq.filter(i => i.slot === s), hands = by('hand'), misc = by('none');
  const two = hands.find(h => (h.hands || 1) > 1);
  const cell = (pos, html) => `<div class="dc ${pos}">${html}</div>`;
  const kopf = by('kopf')[0], rue = by('ruestung')[0], sch = by('schuhe')[0];
  const hL = two || hands[0], hR = two ? null : hands[1];
  const corners = ['bl', 'br'];
  let html = cell('tl', identTile(p, p.race, 'race', mine)) + cell('tr', identTile(p, p.cls, 'cls', mine)) + cell('k', kopf ? eqTile(p, kopf, mine, 'eq') : eqEmpty('kopf', 'Kopf')) +
    cell('hl', hL ? eqTile(p, hL, mine, 'eq') : eqEmpty('hand', 'Hand')) +
    cell('r', rue ? eqTile(p, rue, mine, 'eq') : eqEmpty('ruestung', 'Rüstung')) +
    cell('hr', two ? `<span class="et empty both"><img src="${ICON.slot.hand}" alt=""><span class="et-n">beide Hände</span></span>` : hR ? eqTile(p, hR, mine, 'eq') : eqEmpty('hand', 'Hand')) +
    cell('s', sch ? eqTile(p, sch, mine, 'eq') : eqEmpty('schuhe', 'Schuhe'));
  misc.slice(0, 2).forEach((c, i) => { html += cell(corners[i], eqTile(p, c, mine, 'eq', ' misc')); });
  if (!misc.length) html += cell('bl', eqEmpty('none', 'Sonstiges', ' misc'));
  const extra = misc.slice(2).map(c => eqTile(p, c, mine, 'eq', ' misc')).join('');
  // Ausrüstung, die noch an keinem der Plätze hängt (z. B. mehr als zwei Hände), sicherheitshalber darunter
  const placed = new Set([kopf, rue, sch, hL, hR, ...misc].filter(Boolean)), rest = p.eq.filter(i => !placed.has(i)).map(c => eqTile(p, c, mine, 'eq')).join('');
  const bonus = p.eq.reduce((n, i) => n + (usable(p, i) ? i.b || 0 : 0), 0);
  return `<div class="hsec"><span class="hsec-h">Ausrüstung und Herkunft</span><span class="hsec-x">${bonus ? `+${bonus} Kampfstärke` : 'noch kein Bonus'}</span></div>` +
    `<div class="doll">${html}</div>${extra || rest ? `<div class="pack-row">${extra}${rest}</div>` : ''}`;
}
function heroPack(p, mine, always) {
  return `<div class="hsec"><span class="hsec-h"><img src="${ICON.slot.pack}" alt="">Rucksack</span><span class="hsec-x">${p.pack.length ? `${p.pack.length} ${p.pack.length === 1 ? 'Karte' : 'Karten'} · zählt nicht im Kampf` : 'leer'}</span></div>` +
    (p.pack.length || always ? `<div class="pack${p.pack.length ? '' : ' empty'}">${p.pack.length ? p.pack.map(c => eqTile(p, c, mine, 'pack')).join('') : `<span class="pack-none">Noch nichts im Rucksack. Passen ${packLimit(p)} Karten hinein.</span>`}</div>` : '');
}
function slotRows(p, mine) {
  // Eigene Karten sind antippbar mit Aktionen, die der Gegner nur zum Ansehen (where 'opp')
  const W = w => mine ? w : 'opp';
  const item = (c, w) => cardMini(c, {where: W(w), size: 'tiny', extra: (w === 'eq' && !usable(p, c) ? 'inactive' : '') + (mine && UI.adv && UI.adv.uid === c.uid ? ' rec' : '')});
  const human = `<button type="button" class="mc tiny k-race" data-human="1" aria-label="Mensch"><span class="mc-head"><span class="mc-type">Volk</span></span><img class="mc-art" src="${ART.Mensch || ICON.slot.race}" alt="" draggable="false"><span class="mc-name">Mensch</span></button>`;
  const rows = [];
  rows.push(['race', 'Volk', p.race ? cardMini(p.race, {where: W('race'), size: 'tiny'}) : human]);
  rows.push(['cls', 'Klasse', p.cls ? cardMini(p.cls, {where: W('cls'), size: 'tiny'}) : '<span class="none">keine Klasse</span>']);
  const by = s => p.eq.filter(i => i.slot === s);
  [['kopf', 'Kopf'], ['ruestung', 'Rüstung'], ['schuhe', 'Schuhe'], ['hand', `Hände ${handsUsed(p)}/2`], ['none', 'Sonstiges']].forEach(([s, l]) => rows.push([s, l, by(s).map(c => item(c, 'eq')).join('') || '<span class="none">leer</span>']));
  rows.push(['pack', 'Rucksack', p.pack.map(c => item(c, 'pack')).join('') || '<span class="none">leer</span>']);
  return rows.map(([k, l, v]) => `<div class="slotrow"><span class="sl"><img src="${ICON.slot[k]}" alt="">${l}</span><span class="sv">${v}</span></div>`).join('');
}

/* Ziehen zum Schließen */
(() => {
  let y0 = null, dy = 0;
  const sheet = $('#sheet');
  sheet.addEventListener('touchstart', e => { if (!e.target.closest('.grab,.sh-head')) return; y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = 'none'; }, {passive: true});
  sheet.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sheet.style.transform = `translateY(${dy}px)`; }, {passive: true});
  sheet.addEventListener('touchend', () => { if (y0 == null) return; sheet.style.transition = ''; sheet.style.transform = ''; if (dy > 90 && topSheet() && topSheet().id !== 'sel') closeAllSheets(); y0 = null; });
})();

/* ================= Effekte ================= */
function quietSheet() { return SHEETS.some(s => s.id !== 'sel'); }
function banner(text, kind) {
  if (quietSheet()) return;
  $$('.banner').forEach(b => b.remove());
  const b = document.createElement('div'); b.className = 'banner ' + (kind || ''); b.textContent = text;
  // PC: mittig auf dem Spielfeld statt mitten im Bildschirm
  if (CUR === 'game' && typeof PCGX === 'function' && PCGX()) { const t = $('#table'), q = $('#geq'); if (t) { const r = t.getBoundingClientRect(), bot = q ? q.getBoundingClientRect().top : r.bottom; b.style.left = Math.round(r.left + r.width / 2) + 'px'; b.style.top = Math.round(r.top + (bot - r.top) * 0.45) + 'px'; } }
  document.body.appendChild(b); setTimeout(() => b.remove(), 1500);
}
function flash(kind) { if (UI.reduce) return; const f = document.createElement('div'); f.className = 'flash ' + kind; document.body.appendChild(f); setTimeout(() => f.remove(), 700); }
function shake() { if (UI.reduce) return; const g = $('#scr-game'); g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake'); }
function toast(text) { if (SHEETS.length) return; $$('.toast').forEach(t => t.remove()); const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = text; document.body.appendChild(t); setTimeout(() => t.remove(), 2500); }
const Particles = (() => {
  const cv = $('#fxcanvas'), cx = cv.getContext('2d'), coin = new Image(); coin.src = 'icons/muenze-voll.png';
  let parts = [], running = false;
  function step() {
    const dpr = devicePixelRatio || 1;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(p => { p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.011;
      cx.save(); cx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5)); cx.translate(p.x, p.y); cx.rotate(p.r); cx.drawImage(coin, -p.s / 2, -p.s / 2, p.s, p.s); cx.restore(); });
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 50);
    if (parts.length) requestAnimationFrame(step); else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  return { burst(x, y, n = 22, spread = 1) {
    if (UI.reduce) return;
    const dpr = devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    for (let i = 0; i < n; i++) parts.push({x, y, vx: (Math.random() - 0.5) * 9 * spread, vy: -Math.random() * 9 - 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, s: 14 + Math.random() * 12, life: 1});
    if (!running) { running = true; requestAnimationFrame(step); }
  } };
})();
function burstAt(sel, n) { const el = $(sel); if (!el) return; const r = el.getBoundingClientRect(); if (!r.width && !r.height) return; Particles.burst(r.left + r.width / 2, r.top + r.height / 2, n); }

FX_HANDLER = (t, d) => {
  switch (t) {
    case 'tide': Snd.sfx(d.flut ? 'wave' : 'ebb'); if (d.flut) buzz([20, 60, 20]); break;
    case 'seegang': { Snd.sfx('wave'); buzz([30, 80, 30]); const a = $('#app'); a.classList.remove('kipp-l', 'kipp-r'); void a.offsetWidth; a.classList.add(d.left ? 'kipp-l' : 'kipp-r'); setTimeout(() => a.classList.remove('kipp-l', 'kipp-r'), 1300); if (CUR === 'game') toast(`Seegang! Alle geben eine Karte nach ${d.left ? 'links' : 'rechts'} weiter.`); break; }
    case 'dig': Snd.sfx('coin'); if (d.p.human) { banner('Schatz!', 'good'); burstAt('#hand', 24); } break;
    case 'newgame': W.reset(); break;
    case 'turn': if (d.p.human) { Snd.sfx('page'); buzz(15); if (W.renderedOnce) toast('Du bist am Zug'); } break;
    case 'interfere': Snd.sfx('evil'); buzz(40); toast(`${esc(d.by.name)} greift ein!`); break;
    case 'play': Snd.sfx('play'); buzz(12); break;
    case 'win': Snd.sfx('win'); banner(d.p.human ? 'Sieg!' : `${d.p.name} siegt`, d.mine ? 'good' : ''); if (d.mine) { burstAt('#table', 26); flash('gold'); } break;
    case 'lose': Snd.sfx('lose'); banner(d.p.human ? 'Niederlage' : `${d.p.name} verliert`, d.mine ? 'bad' : ''); break;
    case 'escape': Snd.sfx('escape'); if (d.p.human) banner('Entkommen!', 'good'); break;
    case 'hurt': Snd.sfx('hurt'); if (d.p.human) { shake(); flash('red'); buzz([60, 40, 60]); } break;
    case 'curse': Snd.sfx('curse'); if (d.p.human) { flash('purple'); buzz(80); banner('Verflucht!', 'bad'); } break;
    case 'death': Snd.sfx('death'); if (d.p.human) { flash('dark'); banner('Tot!', 'bad'); buzz([100, 50, 100]); } break;
    case 'dice': Snd.sfx('dice'); W.diceHideAt = 0; break;
    case 'diceland': Snd.sfx('diceland'); buzz(20); W.diceHideAt = performance.now() + 1500; setTimeout(render, 1550); break;
    case 'gameover':
      if (S && S.scn && STORY_RUN && !STORY_RUN.done) { STORY_RUN.done = true; clearStorySave(); const res = finishStation(stationById(STORY_RUN.st), S); setTimeout(() => showStoryEnd(res), 1000); }
      else if (!(S && S.scn)) { setTimeout(() => showEnd(d.winner), 1000); clearSave(); }
      break;
  }
};
// PC: Endfenster mittig über dem Spielfeld statt mitten im Bildschirm (Abdunklung bleibt über allem)
function endOnTable(el) {
  if (CUR !== 'game' || typeof PCGX !== 'function' || !PCGX()) return;
  const t = $('#table'); if (!t) return;
  const r = t.getBoundingClientRect();
  el.classList.add('ontable');
  Object.assign(el.style, {paddingLeft: Math.max(24, r.left) + 'px', paddingRight: Math.max(24, innerWidth - r.right) + 'px', paddingTop: Math.max(24, r.top) + 'px', paddingBottom: Math.max(24, innerHeight - r.bottom) + 'px'});
}
function showEnd(wid) {
  if (!S) return;
  const w = P(wid), mine = w.human;
  Snd.sfx(mine ? 'victory' : 'defeat'); buzz(mine ? [40, 60, 40, 60, 120] : 200);
  const el = document.createElement('div'); el.className = 'endov';
  el.innerHTML = `<div class="panel"><div class="end-hero${bgAttr(bgOf(w))}">${bigPortrait(w)}</div><h2>${mine ? (PROFILE.name ? `Gewonnen, ${esc(PROFILE.name)}!` : 'Gewonnen!') : esc(w.name) + ' gewinnt'}</h2><p>${mine ? `Stufe ${WINLVL()} durch einen Monstersieg. Die ganze Beute gehört dir!` : 'Kein Drama, die nächste Runde wartet schon. In den Notizen siehst du, wie es dazu kam.'}</p><button type="button" class="btn primary" data-go="again">Nochmal spielen</button><button type="button" class="btn" data-go="log">Notizen ansehen</button><button type="button" class="btn" data-go="menu">Hauptmenü</button></div>`;
  endOnTable(el); document.body.appendChild(el);
  if (mine) { let k = 0; const iv = setInterval(() => { Particles.burst(Math.random() * innerWidth, innerHeight * 0.25, 18, 1.4); if (++k > 5) clearInterval(iv); }, 280); }
}
// Antwort: true (ja), false (nein) oder null (abgebrochen: Abbrechen-Knopf oder Tippen daneben)
// opt.ribbon: Überschrift auf dem roten Stoffband, opt.img Bild darunter, opt.stat kurze Zeile in Fett
function confirmDialog(title, text, yes, no, cancel, opt = {}) {
  return new Promise(res => {
    const d = document.createElement('div'); d.className = 'dialog';
    const btns = `<div class="btnrow"><button type="button" class="btn" data-dlg="0">${no}</button><button type="button" class="btn primary" data-dlg="1">${yes}</button></div>${cancel ? `<button type="button" class="dlg-x" data-dlg="x">${cancel}</button>` : ''}`;
    d.innerHTML = opt.ribbon
      ? `<div class="panel dlg-rib"><span class="ribbon"><span>${title}</span></span>${opt.img ? `<img class="dlg-scene" src="${opt.img}" alt="">` : ''}${opt.stat ? `<p class="dlg-stat">${opt.stat}</p>` : ''}<p>${text}</p>${btns}</div>`
      : `<div class="panel"><h3>${title}</h3><p>${text}</p>${btns}</div>`;
    d.addEventListener('click', e => {
      if (e.target === d) { if (opt.modal) return; d.remove(); res(null); return; }   // modal: nur über die Knöpfe zu schließen
      const b = e.target.closest('[data-dlg]'); if (!b) return;
      d.remove(); res(b.dataset.dlg === 'x' ? null : b.dataset.dlg === '1');
    });
    document.body.appendChild(d);
  });
}

/* ================= Karten-Übersicht und Quiz ================= */
const KGROUPS = [['monster', 'Monster'], ['curse', 'Flüche'], ['race', 'Völker'], ['class', 'Klassen'], ['enh', 'Launen'], ['wander', 'Sonderkarten (Tür)'], ['item', 'Gegenstände'], ['oneshot', 'Einmal einsetzbar'], ['levelup', 'Stufenkarten'], ['amulet', 'Sonderkarten (Schatz)']];
const KFILTERS = [['alle', 'Alle'], ['monster', 'Monster'], ['curse', 'Flüche'], ['rc', 'Volk/Klasse'], ['item', 'Gegenstände'], ['misc', 'Sonstige']];
const SLOT_ORDER = ['kopf', 'ruestung', 'schuhe', 'hand', 'none'];
/* Filterleiste: dunkler Grund nur, solange sie oben festklebt */
function updFilterStuck() {
  const sc = $('#scr-cards .content'), f = $('#card-filter'); if (!sc || !f) return;
  f.classList.toggle('stuck', f.getBoundingClientRect().top <= sc.getBoundingClientRect().top + 2);
}
function renderCards() {
  renderDeckPanel(); requestAnimationFrame(updFilterStuck);
  const f = UI.kfilter || 'alle';
  patch($('#card-filter'), KFILTERS.map(([k, l]) => `<button type="button" class="chip" data-kf="${k}" aria-pressed="${f === k}">${l}</button>`).join(''));
  const show = k => f === 'alle' || f === k || (f === 'rc' && (k === 'race' || k === 'class')) || (f === 'misc' && ['enh', 'wander', 'oneshot', 'levelup', 'amulet'].includes(k));
  const all = POOL.map((p, i) => [p.tpl, i]).filter(([c]) => cardOpen(c));
  const sorter = {monster: (a, b) => a.lvl - b.lvl, item: (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot) || (a.hands || 0) - (b.hands || 0) || a.b - b.b, oneshot: (a, b) => (a.b || 0) - (b.b || 0), enh: (a, b) => a.v - b.v};
  let html = '';
  KGROUPS.forEach(([k, label]) => {
    if (!show(k)) return;
    const cs = all.filter(([c]) => c.k === k).sort(([a], [b]) => (sorter[k] || ((x, y) => x.n.localeCompare(y.n, 'de')))(a, b));
    if (!cs.length) return;
    const total = cs.reduce((n, [c]) => n + (DECK.counts[c.n] || 0), 0);
    html += `<h3 class="cgroup">${label}<span>${total} im Deck</span></h3>` + cs.map(([c, i]) => {
      const n = DECK.counts[c.n] || 0;
      return `<div class="dk${n ? '' : ' off'}">${cardMini(c, {cname: true, size: 'grid'})}<div class="stp"><button type="button" data-dk="${i}" data-d="-1" aria-label="${esc(c.n)} einmal weniger" ${n ? '' : 'disabled'}>−</button><b>${n}×</b><button type="button" data-dk="${i}" data-d="1" aria-label="${esc(c.n)} einmal mehr" ${n >= DECK_MAX ? 'disabled' : ''}>+</button></div></div>`;
    }).join('');
  });
  patch($('#card-grid'), html);
}
function renderQuiz() {
  const Q = UI.q || (UI.q = {i: 0, ans: []});
  const el = $('#quiz');
  if (Q.i >= QUIZ.length) {
    const right = Q.ans.filter((a, i) => a === QUIZ[i].a).length;
    const verdict = right >= 10 ? 'Regelfest! Die Bots können sich warm anziehen.' : right >= 7 ? 'Sehr ordentlich. Ein, zwei Regeln noch mal anschauen.' : 'Ein Blick in die Spielregeln lohnt sich noch.';
    patch(el, `<div class="panel qscore"><div class="big">${right} / ${QUIZ.length}</div><p>${verdict}</p><button type="button" class="btn primary" data-q="restart">Nochmal</button></div>`);
    return;
  }
  const q = QUIZ[Q.i], a = Q.ans[Q.i];
  patch(el, `<div class="qprog"><span>Frage ${Q.i + 1} / ${QUIZ.length}</span><span class="qbar"><i style="width:${(Q.i / QUIZ.length) * 100}%"></i></span></div>` +
    `<div class="panel qcard"><h3>${q.q}</h3><div class="qopts">${q.o.map((o, j) => `<button type="button" class="btn ${a != null ? (j === q.a ? 'right' : j === a ? 'wrong' : '') : ''}" data-q="${j}" ${a != null ? 'disabled' : ''}>${o}</button>`).join('')}</div>` +
    (a != null ? `<p class="qexpl">${a === q.a ? 'Richtig. ' : 'Nicht ganz. '}${q.e}</p><div class="acts"><button type="button" class="btn primary" data-q="next">${Q.i + 1 < QUIZ.length ? 'Nächste Frage' : 'Ergebnis'}</button></div>` : '') + '</div>');
}

/* ================= Storymodus: Karte, Stationen, Ergebnis ================= */
let STORY_RUN = null; // {st, done} während eine Station läuft
const LOCK_PATH = '<rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />';
const ST_TYPES = {tutorial: 'Einführung', puzzle: 'Rätselkampf', duel: 'Herausforderung', event: 'Ereignis', shop: 'Händler', boss: 'Boss'};
const ST_ICON = {
  puzzle: '<path d="M14.5 4H20v5.5L9.5 20 4 14.5z M7.5 13.5l3 3 M4 20l2.5-2.5" />',
  duel: '<rect x="3.5" y="5" width="10" height="14" rx="2" /><path d="M15 6.5l5 1.3-3.2 12.2-3.3-.9" />',
  event: '<path d="M5 5h14v10H10l-5 4z M9 9h6 M9 12h4" />',
  shop: '<path d="M6 9h12l-1.2 11H7.2z M9 9a3 3 0 0 1 6 0" />',
  boss: '<path d="M4 18l1.8-10 4.2 5 2-7 2 7 4.2-5L20 18z M4 21h16" />'
};
const starSvg = on => `<img class="star${on ? ' on' : ''}" src="icons/stern-${on ? 'voll' : 'leer'}.png" alt="" aria-hidden="true">`;
// Medaillen der Stationen: Musely-Symbole, solange eins fehlt das gezeichnete
// „Welt 2“, für die Einführungswelt einfach „Einführung“
const wLabel = w => w.n ? `Welt ${w.n}` : (w.short || 'Einführung');
const ST_IMG = {puzzle: 'icons/st-puzzle.png', duel: 'icons/st-duel.png', event: 'icons/st-event.png', shop: 'icons/st-shop.png', boss: 'icons/st-boss.png', lock: 'icons/st-lock.png'};
const medalIcon = t => t === 'tutorial' ? '<img class="mi face" src="icons/portrait-hilde.png" alt="">' : ST_IMG[t] ? `<img class="mi" src="${ST_IMG[t]}" alt="">` : `<svg viewBox="0 0 24 24">${ST_ICON[t] || LOCK_PATH}</svg>`;
const coinImg = '<img src="icons/muenze-voll.png" alt="">';
let SAVED_ST = null;   // Station mit gespeichertem Spielstand (für die Karte)
function renderStory() {
  const open = openWorlds(), cw = currentWorld();
  SAVED_ST = (storySave() || {}).st || null;
  patch($('#st-coins'), `${coinImg}<b>${STORY.coins}</b>`);
  const head = w => `<button type="button" class="st-info" data-worldrules="${w.id}" aria-label="Sonderregeln von ${wLabel(w)}"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v6 M12 7.5h.01" /></svg></button><span class="st-world">${wLabel(w)}</span><b class="st-name">${esc(w.name)}</b><span class="st-stars">${starSvg(true)}<b>${worldStars(w)}</b> von ${worldMaxStars(w)} Sternen${STORY.worlds[w.id] ? ' · abgeschlossen' : ''}</span>`;
  patch($('#st-head'), head(open[0]));
  let next = null;
  open.forEach(w => { const n = w.stations.find(st => stationUnlocked(st) && !STORY.done[st.id]); if (n && (!next || w === cw)) next = n; });
  const maps = open.map((w, i) => (i ? `<div class="st-link" aria-hidden="true"></div><div class="panel st-head st-band">${head(w)}</div>` : '') + worldMapHTML(w, next)).join('');
  const f = fogWorld();
  patch($('#st-map'), maps + (f ? fogHTML(f, f.near) : ''));
  if (!worldOwned(cw)) { if (!STORY.intro['kauf-' + cw.id] && CUR === 'story' && !SHEETS.length) { STORY.intro['kauf-' + cw.id] = true; saveStory(); openSheet({id: 'buyworld', w: cw.id}); } }
  else if (!STORY.intro[cw.id]) { STORY.intro[cw.id] = true; saveStory(); openSheet({id: 'storyintro', w: cw.id}); }
  renderStorySide();
  if (next && CUR === 'story') {
    const sc = $('#scr-story .content');
    if (sc && sc.__scrolledTo !== next.id) { sc.__scrolledTo = next.id; requestAnimationFrame(() => { const el = $(`.snode[data-station="${next.id}"]`); if (el) sc.scrollTop = Math.max(0, sc.scrollTop + el.getBoundingClientRect().top - sc.getBoundingClientRect().top - sc.clientHeight / 2); }); }
  }
}
// Weiche Linie durch alle Punkte (Catmull-Rom als Bézier-Kurven)
function smoothPath(p) {
  const f = n => +n.toFixed(1);
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
function worldMapHTML(w, next) {
  const art = !!w.map, H = art ? 100 : w.mapH, done = !!STORY.worlds[w.id];
  const X = st => art ? st.ax : st.x, Y = st => art ? st.ay : st.y;
  const segs = [];
  // Wegpunkte (st.via[von]) lassen den Pfad den Gängen der Karte folgen, sonst eine einfache Kurve
  w.stations.forEach(st => (st.req || st.reqAny || []).forEach(r => { const a = stationById(r); if (!a || a.world !== w.id) return; const ya = Y(a), yb = Y(st), via = art && st.via && st.via[r];
    const d = via ? smoothPath([[X(a), ya], ...via, [X(st), yb]]) : `M${X(a)} ${ya} C${X(a)} ${(ya + yb) / 2} ${X(st)} ${(ya + yb) / 2} ${X(st)} ${yb}`;
    segs.push(`<path class="${STORY.done[r] ? 'on' : ''}" d="${d}" vector-effect="non-scaling-stroke" />`); }));
  const marks = (w.landmarks || []).map(([t, x, y]) => `<span class="st-mark${x < 25 ? ' l' : x > 75 ? ' r' : ''}" style="left:${x}%;top:${y}px">${esc(t)}</span>`).join('');
  const nodes = w.stations.map(st => {
    const un = stationUnlocked(st), dn = !!STORY.done[st.id], s = starsOf(st.id), mx = maxStars(st);
    const stars = mx ? `<span class="sn-stars">${Array.from({length: mx}, (_, i) => starSvg(!!s[i])).join('')}</span>` : '';
    const run = SAVED_ST === st.id;
    return `<button type="button" class="snode t-${st.type}${un ? '' : ' locked'}${dn ? ' done' : ''}${next === st ? ' next' : ''}${run ? ' paused' : ''}" data-station="${st.id}" style="left:${X(st)}%;top:${Y(st)}${art ? '%' : 'px'}" aria-label="${esc(st.no + ' ' + st.name)}${un ? '' : ', gesperrt'}">` +
      `<span class="sn-medal">${medalIcon(un ? st.type : 'lock')}<i>${st.no}</i></span><span class="sn-name">${esc(st.name)}</span>${run ? (dn ? `${stars}<span class="sn-run">Neuer Versuch läuft</span>` : '<span class="sn-run">angefangen</span>') : stars}</button>`;   // schon geschafft bleibt geschafft, auch beim Wiederholen
  }).join('');
  const last = w.stations[w.stations.length - 1];
  if (!art) segs.push(`<path class="${done ? 'on' : ''}" d="M${last.x} ${last.y} L${last.x} ${w.mapH}" vector-effect="non-scaling-stroke" />`);
  const buy = worldOwned(w) ? '' : `<button type="button" class="st-buy" data-buyworld="${w.id}"><span class="sn-medal">${medalIcon('lock')}</span><b>${wLabel(w)} freischalten</b><small>Antippen für alle Infos</small></button>`;
  return `<div class="smap-in${art ? ' pic' : ''}${buy ? ' shut' : ''}" data-world="${w.id}" style="${art ? `aspect-ratio:${w.mapRatio};background-image:url(${w.map})` : `height:${w.mapH}px`}">${buy}<svg class="st-path" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${segs.join('')}</svg>${art ? '' : marks}${nodes}</div>`;
}
// Nächste Welt: im Nebel zu erahnen, je weiter unten desto dichter
function fogHTML(f, open) {
  const pts = [[50, 0], ...f.teaser];
  const seg = f.teaser.map((p, i) => { const a = pts[i]; return `<path d="M${a[0]} ${a[1]} C${a[0]} ${(a[1] + p[1]) / 2} ${p[0]} ${(a[1] + p[1]) / 2} ${p[0]} ${p[1]}" vector-effect="non-scaling-stroke" />`; }).join('');
  const dots = f.teaser.map(([x, y]) => `<span class="fog-node" style="left:${x}%;top:${y}%"><span class="sn-medal"><svg viewBox="0 0 24 24"><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8v.5 M12 17h.01" /></svg></span></span>`).join('');
  return `<div class="st-link" aria-hidden="true"></div><div class="st-fog${open ? ' near' : ''}" style="aspect-ratio:${(f.ratio / f.show).toFixed(4)}"><div class="fog-map${f.map ? ' pic' : ''}"${f.map ? ` style="background-image:url(${f.map})"` : ''}><svg class="st-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${seg}</svg>${dots}</div>` +
    `<div class="fog-layer" aria-hidden="true"></div><div class="fog-drift d1" aria-hidden="true"></div><div class="fog-drift d2" aria-hidden="true"></div>` +
    `<div class="fog-label"><span class="sn-medal">${medalIcon('lock')}</span><span class="fog-world">Welt ${f.n}</span><b>${esc(f.name)}</b><small>${open ? esc(f.soon) : esc(f.hint)}</small></div></div>`;
}
function openStation(id) {
  const st = stationById(id); if (!st) return;
  if (!worldOwned(worldById(st.world))) { openSheet({id: 'buyworld', w: st.world}); return; }
  if (!stationUnlocked(st) && !SET.test) { toast('Erst die Station davor schaffen.'); buzz(30); return; }
  if (st.type === 'shop') visitShop(st);
  if ((CUR === 'story' || HUBST) && SHEETS.length === 1 && topSheet().id === 'station') SHEETS.pop();   // breite Ansicht: Karte bleibt bedienbar, die neue Station ersetzt die alte
  openSheet({id: 'station', st: id});
  renderStory();
  if (HUBST) { HUBSEL = id; const k = hubPages().findIndex(q => q.w && q.w.id === st.world); if (k >= 0) HUBW = k; renderHub(); }
}
function startStation(id) {
  const st = stationById(id); if (!st || !st.scn || !stationUnlocked(st)) return;
  clearStorySave();
  const scn = scenarioFor(st);
  const w = worldById(st.world);
  scn.stars = st.type === 'tutorial' ? null : ['Station schaffen', ...(st.extras || []).map(e => e.t)];
  scn.counts = variantCounts(w.deck, scn.variant || 'standard'); delete scn.variant;
  if (scn.more) { Object.assign(scn.counts, scn.more); delete scn.more; }
  // Der Endgegner einer Welt (ab Welt 2) kommt nur im Bosskampf ins Deck
  const fin = w.id !== 'w1' && w.stations.find(x => x.final), bossName = fin && fin.scn && fin.scn.boss;
  if (bossName && !scn.boss) scn.counts[bossName] = 0;
  GAME_TABLE = w.table || 'taverne'; GAME_THEME = w.theme || 'taverne'; TUT = null;
  SCN = scn; STORY_RUN = {st: st.id, done: false};
  $$('.endov').forEach(x => x.remove()); while (SHEETS.length) SHEETS.pop(); renderSheet(true);
  applySettings();
  UI.bots = (scn.bots || []).length; UI.diff = scn.diff || 'normal';
  W.reset(); GAME_ON = true;
  STACK.length = 0; STACK.push('title', 'story');
  setScreen('game');
  newGame(false);
}
/* ================= Auftragsbrett und Krämerladen ================= */
function untilMidnight() { const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); const min = Math.max(1, Math.round((m - n) / 60000)); const h = Math.floor(min / 60); return min >= 60 ? `${h} ${h === 1 ? 'Stunde' : 'Stunden'}` : `${min} ${min === 1 ? 'Minute' : 'Minuten'}`; }
function missionToast(text, coins) {   // auch über offenen Blättern sichtbar
  $$('.mtoast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast mtoast';
  t.innerHTML = `${esc(text)}${coins ? ` <span class="mt-c">${coinImg}+${coins}</span>` : ''}`;
  document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
  Snd.sfx('coin'); buzz([30, 40, 30]);
  if (CUR === 'title') renderTitle();
}
// Lebenslange Statistik im Profil (wird mit dem Konto gesichert); gezählt wie die Aufträge, also nicht in Probespiel und Rätseln
const LIFE_KEYS = {gameplayed: 'played', gamewon: 'won', win: 'fights', escape: 'escapes', helped: 'helped', curse: 'curses', big: 'big', gold: 'gold', oneshot: 'oneshots', intf: 'intf'};
TRACK_HANDLER = (k, n) => { dailyTrack(k, n); const key = LIFE_KEYS[k]; if (!key) return; PROFILE.stats = PROFILE.stats || {}; PROFILE.stats[key] = (PROFILE.stats[key] || 0) + n; try { localStorage.setItem(K_PROFILE, JSON.stringify(PROFILE)); } catch (e) {} };
DAILY_NOTIFY = (text, coins) => missionToast(text, coins);
// Serie: Kerze (brennt nur bei laufender Serie) und Fortschritt bis zum nächsten Ziel, ein Feld pro Tag
function candleHtml(on) { return `<span class="candle${on ? ' on' : ''}" aria-hidden="true"><i class="glow"></i><img src="icons/sym-serie-aus.png" alt=""><img class="flame" src="icons/sym-serie-flamme.png" alt=""></span>`; }
// Fortschritt der Serie: durchgehende Schiene, ein Punkt pro Tag, am Ende die Belohnung (Auftragsbrett und Startseite)
function streakTrack(sk) {
  const today = sk > 0 && streakToday(), days = n => `${n} ${n === 1 ? 'Tag' : 'Tage'}`;
  const hit = today && (sk === 3 || (sk >= 7 && sk % 7 === 0));   // heute ein Ziel erreicht: Leiste bleibt bis morgen voll
  const nx = streakNext(hit ? sk - 1 : sk), len = nx.at - nx.from, fill = sk - nx.from, f = n => (n / len).toFixed(4);
  const dots = Array.from({length: len - 1}, (_, k) => { const i = k + 1, cl = i <= fill ? 'f' : i === fill + 1 && !today ? 't' : '', c = streakCoins(nx.from + i);
    return `<span class="sk-dot ${cl}${c ? ' sk-coin' : ''}" style="--f:${f(i)};--d:${(0.15 + i / len * 0.7).toFixed(2)}s">${c ? coinImg : ''}<em>${c ? `+${c}` : nx.from + i}</em></span>`; }).join('');
  // nächste Münzen-Stufe vor der Truhe (ab Woche 2)
  let nc = 0; for (let d = sk + 1; d < nx.at; d++) if (streakCoins(d)) { nc = d; break; }
  // am Ende eine Truhe: wartet eine aufs Öffnen, wackelt sie; heute erreicht und schon offen: offene Truhe, grün umrandet
  const wait = chestsWaiting()[0];
  const goal = wait ? `<span class="sk-goal ready" style="--f:1" data-chest><img src="icons/truhe-${wait.t}-zu.png" alt="${CHESTS[wait.t].n}"><em>Öffnen!</em></span>`
    : `<span class="sk-goal${hit ? ' ok' : fill + 1 === len && !today ? ' t' : ''}" style="--f:1"><img src="icons/truhe-${nx.chest}-${hit ? 'auf' : 'zu'}.png" alt=""><em>Tag ${nx.at}</em></span>`;
  const lbl = wait ? `Deine ${CHESTS[wait.t].n} ist bereit. Tippe sie an!` : hit ? `Ziel erreicht! Nächste Truhe am ${streakNext(sk).at}. Tag.`
    : nc ? `Noch ${days(nc - sk)} bis ${streakCoins(nc)} Münzen, ${days(nx.at - sk)} bis ${esc(nx.l)}` : `Noch ${days(nx.at - sk)} bis ${esc(nx.l)}`;
  const track = `<div class="sk-track" style="--f:${f(fill)}"><span class="sk-rail"><i></i></span>${dots}${goal}</div>`;
  return {today, track, html: `${track}<span class="sk-l">${lbl}</span>`};
}
function streakBox(sk) {
  const tr = streakTrack(sk);
  const txt = !sk ? 'Erledige heute einen Auftrag, dann zündet Hilde die Kerze an.'
    : tr.today ? 'Heute geschafft! Morgen geht es weiter.' : 'Heute noch offen. Sonst erlischt die Kerze um Mitternacht.';
  return `<div class="streakbox${sk ? ' lit' : ''}"><div class="sk-head">${candleHtml(sk > 0)}<div class="sk-main">` +
    `<b>${sk ? `<span class="sk-n">${sk}</span> ${sk === 1 ? 'Tag' : 'Tage'} in Folge` : 'Noch keine Serie'}</b><span class="sk-txt">${txt}</span></div></div>${tr.html}${chestsWaiting().length ? `<button type="button" class="btn primary small sk-open" data-chest>${CHESTS[chestsWaiting()[0].t].n} öffnen</button>` : ''}` +
    `<span class="sk-info">In der Holztruhe stecken Münzen oder mit Glück ein Porträt, Rahmen oder Titel. In der Goldtruhe ist sicher eins davon. Ab der zweiten Woche gibt es zwischendurch Münzen.</span></div>`;
}
// Truhe öffnen: wackelt immer stärker, heller Blitz (darin wechselt das Bild auf offen), Strahlen, Münzregen, Beute steigt auf
function showChest() {
  const w = chestsWaiting()[0]; if (!w || $('.chestov')) return;
  const nm = CHESTS[w.t].n, el = document.createElement('div'); el.className = 'chestov ' + w.t;
  el.innerHTML = `<div class="cv-rays" aria-hidden="true"><i></i></div><div class="cv-box"><span class="cv-name">${nm}</span>` +
    `<button type="button" class="cv-chest idle" aria-label="${nm} öffnen"><img class="cv-zu" src="icons/truhe-${w.t}-zu.png" alt=""><img class="cv-auf" src="icons/truhe-${w.t}-auf.png" alt=""></button>` +
    `<p class="cv-hint">Tippe auf die Truhe!</p><div class="cv-loot scroll" hidden></div><button type="button" class="cv-later">Später öffnen</button></div>`;
  document.body.appendChild(el); Snd.sfx('deal');
  const box = el.querySelector('.cv-chest'), done = () => { el.remove(); if (CUR === 'title') renderTitle(); if (topSheet() && topSheet().id === 'daily') renderSheet(false); };
  el.querySelector('.cv-later').addEventListener('click', done);
  box.addEventListener('click', () => {
    if (box.disabled) return; box.disabled = true;
    el.querySelector('.cv-hint').hidden = true; el.querySelector('.cv-later').hidden = true;
    box.classList.remove('idle'); box.classList.add('shake'); Snd.sfx('dice'); buzz([20, 60, 20, 60, 30]);
    setTimeout(() => {
      const r = openChest(); if (!r) { done(); return; }
      const fl = document.createElement('div'); fl.className = 'cv-flash'; el.appendChild(fl);
      el.classList.add('open'); box.classList.remove('shake');
      Snd.sfx('levelup'); buzz([40, 50, 80]);
      const b = box.getBoundingClientRect(); Particles.burst(b.left + b.width / 2, b.top + b.height * 0.35, w.t === 'gold' ? 40 : 26, 1.2);
      const k = r.id && r.id.split(':')[0], loot = el.querySelector('.cv-loot');
      loot.innerHTML = r.id
        ? `<span class="ribbon"><span>Neu für dich</span></span>${k === 'title' ? `<span class="cv-title">„${esc(COSMETICS.title[r.id.split(':')[1]])}“</span>` : cosPreview(r.id)}<b>${esc(cosmeticName(r.id).replace(/^\S+ „|“$/g, ''))}</b><small>${{portrait: 'Porträt', frame: 'Rahmen', bg: 'Hintergrund', title: 'Titel'}[k]} · im Charakter-Bildschirm auswählen</small>${r.coins ? `<span class="cv-coins sm">${coinImg}+${r.coins}</span>` : ''}`
        : `<span class="ribbon"><span>Münzen</span></span><span class="cv-coins">${coinImg}+${r.coins}</span><small>Für den Krämerladen</small>`;
      loot.insertAdjacentHTML('beforeend', '<button type="button" class="btn primary small cv-ok">Super!</button>');
      setTimeout(() => { loot.hidden = false; watchBoards(el); Snd.sfx('coin'); }, 450);
      loot.querySelector('.cv-ok').addEventListener('click', done);
    }, UI.reduce ? 50 : 1050);
  });
}
function dailyNotes(st) {
  return st.list.map((e, i) => {
    const m = missionById(e.id); if (!m) return '';
    const done = e.p >= m.n, pct = Math.round(e.p / m.n * 100), prog = m.k === 'gold' ? `${fmt(e.p)} / ${fmt(m.n)} Gold` : `${e.p} / ${m.n}`;
    return `<div class="note d${m.d}${done ? ' done' : ''}"><span class="nl">${MISSION_LEVEL[m.d]}<span class="nc">${coinImg}+${MISSION_COINS[m.d]}</span></span><b>${esc(m.t)}</b>` +
      `<span class="nbar"><i style="width:${pct}%"></i></span><span class="np"><span class="npv">${prog}</span>${done ? '<em class="nstamp" role="img" aria-label="Erledigt"></em>' : ''}${!done && !st.rer ? `<button type="button" class="btn small" data-reroll="${i}">Tauschen</button>` : ''}</span></div>`;
  }).join('');
}
// PC: Optionen während der Partie als Fenster über dem Spielfeld (die Partie bleibt offen). Dieselben Schalter wie auf der Seite „Optionen“.
SHEET_VIEWS.gsettings = () => {
  const pan = i => { const el = $(`#scr-settings .content > .panel:nth-child(${i})`); if (!el) return ''; const c = el.cloneNode(true); c.querySelectorAll('[id]').forEach(x => x.removeAttribute('id')); c.querySelectorAll('.trow').forEach(r => { if (r.querySelector('[data-toggle="vibrate"]')) r.remove(); }); c.querySelectorAll('.hint').forEach(h => { if (/iPhone/.test(h.textContent)) h.remove(); }); return `<div class="panel">${c.innerHTML}</div>`; };
  return {head: h3('Optionen'), body: `<div class="gset">${pan(1)}${pan(2)}</div><div class="acts gset-acts"><button type="button" class="btn primary" data-sheetclose>Weiterspielen</button><button type="button" class="btn" data-go="allsettings">Alle Optionen</button></div>`};
};
SHEET_VIEWS.daily = () => {
  const st = dailyState(), sk = streakNow();
  const notes = dailyNotes(st);
  const streak = streakBox(sk);
  return {head: h3('Hildes Auftragsbrett'),
    body: `<img class="scene" src="art/szene-auftragsbrett.webp" alt=""><div class="say"><img src="icons/portrait-hilde.png" alt=""><p>„Ich hab da ein paar Aufträge für dich. Jeden Tag neue, versprochen.“</p></div><div class="notes">${notes}</div>${streak}` +
      `<p class="hint">Neue Aufträge in ${untilMidnight()}. Sie zählen im freien Spiel und im Storymodus, nicht in Rätseln und im Probespiel.${st.rer ? '' : ' Einen Auftrag pro Tag darfst du tauschen.'}</p>` +
      `<div class="acts"><button type="button" class="btn" data-go="shop">Zum Krämerladen (${STORY.coins} Münzen)</button></div>`};
};
SHEET_VIEWS.online = () => ({head: h3('Online spielen'),
  body: `<img class="scene" src="art/kachel-online.webp" alt="">` +
    `<p>Bald spielst du hier mit deinen Freunden statt gegen Bots:</p><ul class="online-list"><li>Freunde über einen Code oder Link hinzufügen</li><li>Eine Partie erstellen und Freunde einladen</li><li>Sehen, wer gerade online ist</li></ul>` +
    `<p class="hint">Dafür meldest du dich einmal an. Dann ist auch dein Fortschritt gesichert, wenn du das Handy wechselst.</p>` +
    `<div class="acts"><button type="button" class="btn primary" data-sheetclose>Alles klar</button></div>`});
function cosPreview(id) {
  const [k, key] = id.split(':'), c = COSMETICS[k] && COSMETICS[k][key];
  if (k === 'portrait') return `<img class="sp-pt" src="${c.src}" alt="">`;
  if (k === 'bg') return easel(key, c);
  if (k === 'frame') return frameArt(key) ? `<span class="sp-fa" style="--fa:url('${new URL(frameArt(key, true), document.baseURI).href}')"><img src="${myPortrait()}" alt=""></span>` : `<span class="sp-fr" style="--c:${c.c}"><img src="${myPortrait()}" alt=""></span>`;
  return '';   // Titel brauchen kein Bild, der Name steht daneben
}
// Ein Fach im Regal: Ware auf dem Regalbrett (Titel auf einem Holzschild), Preisschild links am Brett,
// beim Angebot durchgestrichen mit Pappschild daneben, darunter Name und Kaufen. Für Krämerladen und Händler im Storymodus.
function shelfItem(id, base, price, pct, buyAttr) {
  const own = owns(id), poor = STORY.coins < price, [k, key] = id.split(':'), nm = esc(cosmeticName(id).replace(/^\S+ „|“$/g, ''));
  const ware = k === 'title' ? `<span class="sp-ti"><span>${esc(COSMETICS.title[key])}</span></span>` : cosPreview(id);
  const tag = `<span class="ptag${pct ? ' old' : ''}"><span>${coinImg}<s>${base}</s></span></span>`;
  const sale = pct ? `<span class="sale" aria-label="Angebot: ${price} Münzen statt ${base}"><b>${price}</b><em>−${pct} %</em></span>` : '';
  return `<div class="sitem${own ? ' own' : ''}${pct ? ' deal' : ''}"><span class="si-ware">${tag}${ware}${sale}</span><span class="si-t"><b>${nm}</b><small>${{portrait: 'Porträt', frame: 'Rahmen', bg: 'Hintergrund', title: 'Titel'}[k]}</small></span>` +
    `<button type="button" class="btn small sbuy${own || poor ? '' : ' primary'}" ${buyAttr}="${id}"${own || poor ? ' disabled' : ''}>${own ? 'Gekauft' : 'Kaufen'}</button></div>`;
}
SHEET_VIEWS.shop = () => {
  const st = dailyState();
  const items = st.shop.map(id => { const it = shopItem(id); if (!it) return ''; const deal = shopDeal(id); return shelfItem(id, it.price, shopPrice(id), deal ? deal.pct : 0, 'data-shopbuy'); }).join('');
  return {head: h3('Krämerladen'),
    body: `<img class="scene" src="art/szene-kraemerladen.webp" alt=""><div class="say"><img src="icons/portrait-kuno.png" alt=""><p>Krämer Kuno: „Frisch reingekommen, nur heute! Na ja, fast nur heute.“</p></div><p class="shop-coins">${coinImg}<b>${STORY.coins}</b> Münzen</p>` +
      `<div class="sitems">${items || '<p class="hint">Du hast schon alles aus dem Laden. Hut ab!</p>'}</div>` +
      `<p class="hint">Neues Angebot in ${untilMidnight()}. Münzen gibt es für Aufträge und im Storymodus. Gekauftes wählst du im Charakter-Bildschirm aus.</p>` +
      `<div class="acts"><button type="button" class="btn" data-go="daily">Zu den Aufträgen</button><button type="button" class="btn" data-go="profile">Zum Charakter</button></div>`};
};
function resumeStation() {
  const d = storySave(); if (!d) return;
  if (GAME_ON && S && S.scn === d.st && S.winner == null) { closeAllSheets(); setScreen('game'); return; }
  SCN = d.scn; STORY_RUN = {st: d.st, done: false}; TUT = null;
  GAME_TABLE = d.table || 'taverne'; GAME_THEME = d.theme || 'taverne';
  $$('.endov').forEach(x => x.remove()); while (SHEETS.length) SHEETS.pop(); renderSheet(true);
  applySettings();
  UI.bots = d.bots || (d.scn.bots || []).length; UI.diff = d.diff || 'normal';
  W.reset(); GAME_ON = true;
  STACK.length = 0; STACK.push('title', 'story');
  setScreen('game');
  resumeGame(d);
}
// Eine andere Station läuft noch: vor dem Start fragen, ob deren Spielstand verloren gehen darf
async function askStartStation(id) {
  const d = storySave();
  if (d && d.st !== id) {
    const o = stationById(d.st);
    const ok = await confirmDialog('Andere Station läuft noch', `„${esc(o.no + ' · ' + o.name)}“ ist noch nicht fertig gespielt. Startest du hier, geht der Spielstand dort verloren.`, 'Trotzdem starten', 'Abbrechen');
    if (!ok) return;
  }
  startStation(id);
}
function pickChoice(v) {
  const s = topSheet(); if (!s || s.id !== 'station') return;
  const st = stationById(s.st), r = chooseEvent(st, v); if (!r) return;
  Snd.sfx('coin'); toast(`+${r.coins} Münzen${r.rewards && r.rewards.length ? ` · Neu: ${cosmeticName(r.rewards[0])}` : ''}`); renderSheet(false); renderStory();
}
function buyItem(id) {
  const s = topSheet(); if (!s || s.id !== 'station') return;
  const st = stationById(s.st), item = (st.shop || []).find(x => x.id === id); if (!item) return;
  const r = buyCosmetic(item);
  if (r === 'poor') { toast(`Dafür brauchst du ${item.price} Münzen.`); buzz(40); return; }
  if (r === 'ok') { Snd.sfx('coin'); buzz([20, 30, 20]); toast(`${cosmeticName(id)} gehört dir. Auswählen kannst du ihn im Charakter-Bildschirm.`); }
  renderSheet(false); renderStory();
}
function cosmeticPreview(id) {
  const [k, key] = id.split(':'), c = COSMETICS[k][key];
  if (k === 'portrait') return `<img class="cos-pt" src="${c.src}" alt="">`;
  if (k === 'frame') return `<i class="cos-fr" style="--c:${c.c}"></i>`;
  if (k === 'bg') return easel(key, c, ' small');
  return `<i class="cos-ti">„“</i>`;
}
// Story-Text, wenn bekannt mit dem Gesicht dessen, der spricht oder auftritt
const sayHTML = (face, text) => face ? `<div class="st-say"><img src="${face}" alt=""><p class="st-text">${esc(text)}</p></div>` : `<p class="st-text">${esc(text)}</p>`;
/* Fluch aufs Spielfeld gezogen: hier wählst du, wen er trifft */
function curseImpact(c, t) {
  const e = c.eff || {};
  switch (e.t) {
    case 'lvl': return t.lvl > 1 ? `Stufe ${t.lvl} → ${Math.max(1, t.lvl - e.n)}` : 'Ist schon auf Stufe 1';
    case 'slot': { const it = t.eq.find(i => i.slot === e.s); return it ? `Verliert ${it.n}` : 'Trägt dort nichts'; }
    case 'best': { const all = [...t.eq, ...t.pack].sort((a, b) => (b.b || 0) - (a.b || 0) || (b.g - a.g)); return all.length ? `Verliert ${all[0].n}` : 'Hat keine Gegenstände'; }
    case 'hand': return t.hand.length ? `Hat ${t.hand.length} ${t.hand.length === 1 ? 'Handkarte' : 'Handkarten'}` : 'Hat keine Handkarten';
    case 'class': return t.cls ? `Verliert ${t.cls.n}` : t.lvl > 1 ? `Keine Klasse: Stufe ${t.lvl} → ${t.lvl - 1}` : 'Keine Klasse, schon Stufe 1';
    case 'race': return t.race ? `Verliert ${t.race.n}` : 'Ist schon Mensch';
    case 'chill': return t.chill ? 'Friert schon' : 'Im nächsten Kampf −' + e.n;
    case 'spore': return (t.spore || 0) >= 2 ? 'Steckt schon tief in Sporen' : `Im Kampf −${(t.spore || 0) + e.n}, bis zum nächsten Sieg`;
    default: return '';
  }
}
const curseTargets = c => { const acts = cardActions(c, 'hand'); return S.players.map(t => [t, !t.human && acts.find(a => a.fn && !a.dis && a.l === `Auf ${t.name} spielen`)]).filter(x => x[1]); };
SHEET_VIEWS.curse = s => {
  const c = S && findCard(s.uid); if (!c || !me().hand.includes(c)) return null;
  const ts = curseTargets(c); if (!ts.length) return null;
  const C = S.combat, mean = c.txt ? `<b>Wirkung:</b> ${esc(c.txt)}` : cardMeaning(c);
  const row = ([t]) => { const role = C && !C.resolved ? (C.f === t.id ? 'kämpft' : C.h === t.id ? 'hilft' : '') : S.cur === t.id ? 'am Zug' : '';
    return `<button type="button" class="ctgt" data-cursepick="${t.id}"><img src="${portrait(t)}" alt=""><span class="ct-t"><b>${esc(t.name)}</b><small>Stufe ${t.lvl} · Kampfstärke ${power(t)}${t.dead ? ' · tot' : ''}</small>${curseImpact(c, t) ? `<em>${esc(curseImpact(c, t))}</em>` : ''}</span>${role ? `<span class="ct-role">${role}</span>` : ''}</button>`; };
  return {head: h3(`Wen triffst du mit „${esc(c.n)}“?`), body: (mean ? `<p class="meaning ct-mean">${mean}</p>` : '') + `<div class="ctg">${ts.map(row).join('')}</div>`};
};
// Kaufwelt: Vorschau mit Karte, Figuren und Angeboten. Bis zur Play-Store-Version schaltet nur die Testphase frei.
SHEET_VIEWS.buyworld = s => {
  const w = worldById(s.w); if (!w) return null;
  const faces = [...new Set(w.stations.filter(st => st.scn && typeof st.scn === 'object' && st.scn.bots).flatMap(st => st.scn.bots))].filter(n => ICON.portrait[n]);
  const owned = worldOwned(w), rest = w.stations.filter(st => st.type !== 'shop').length;
  const offers = OFFERS.filter(o => o.worlds.includes(w.id) && offerOk(o) && (o.worlds.length === 1 || o.worlds.some(x => x !== w.id && !worldOwned(worldById(x))))).map(o => `<button type="button" class="btn${o.worlds.length > 1 ? ' primary' : ''} bw-offer" data-offer="${o.id}"><b>${esc(o.n)}</b><span>${SET.test && !BILL.ready ? 'Gratis (Testphase)' : esc(offerPrice(o))}</span>${o.note ? `<small>${esc(o.note)}</small>` : ''}</button>`).join('');
  return {head: h3(`${wLabel(w)} · ${esc(w.name)}`), body: `<div class="bw-map" style="background-image:url(${w.map})"><span class="bw-faces">${faces.map(n => `<img src="${ICON.portrait[n]}" alt="${esc(n)}">`).join('')}</span></div>` +
    `<p class="bw-lead">${esc(w.intro.split('. ').slice(0, 3).join('. '))}.</p>` +
    `<ul class="bw-list"><li><b>${rest} Stationen</b> mit Rätseln, Duellen und ${esc(w.sell.boss)} als Boss</li><li><b>${esc(w.sell.rule.split(':')[0])}:</b>${esc(w.sell.rule.split(':').slice(1).join(':'))}</li><li><b>${w.sell.cards} neue Karten</b> und neue Optik: ${esc(w.sell.loot)} zum Sammeln</li><li><b>Danach fürs freie Spiel:</b> ${esc(w.unlocks.join(', '))}</li></ul>` +
    (owned ? `<p class="bw-own">Gehört dir. Viel Spaß!</p><div class="acts"><button type="button" class="btn primary" data-storyclose>Los geht’s</button></div>`
      : `<div class="bw-offers">${offers}</div>${needPrev(w) ? `<p class="hint">Einzeln gibt es ${wLabel(w)}, sobald dir ${wLabel(needPrev(w))} gehört.</p>` : ''}<p class="hint">${BILL.ready ? 'Einmal kaufen, für immer spielen. Bezahlt wird über Google Play.' : SET.test ? 'Testphase: Du kannst die Welt hier gratis freischalten. Echte Käufe gibt es in der Plundo-App aus dem Play Store.' : 'Einmal kaufen, für immer spielen. Kaufen kannst du in der Plundo-App aus dem Play Store. Bist du dort angemeldet, hast du deine Welten auch hier.'}</p>` +
        (BILL.ready ? `<button type="button" class="acc-link" data-billrestore>Schon gekauft? Käufe wiederherstellen</button>` : ''))};
};
async function buyOffer(id) {
  const o = OFFERS.find(x => x.id === id); if (!o || !offerOk(o)) return;
  if (BILL.ready) { if (!(await billBuy(id))) return; }
  else if (SET.test) unlockOffer(id);
  else { toast('Kaufen kannst du in der Plundo-App aus dem Play Store. Bist du dort angemeldet, hast du deine Welten auch hier.'); buzz(30); return; }
  Snd.sfx('victory'); buzz([40, 60, 40]);
  closeAllSheets(); toast(`${o.n} freigeschaltet!`);
  burstAt('#st-map', 30);
  renderStory(); renderTitle(); if (CUR === 'shop') renderShopPage();
}
// Sonderregeln einer Welt, über das i an der Weltüberschrift der Storykarte
// Sonderregeln einer Welt direkt auf der Seite (PC). In der Station nur, wenn es welche gibt.
function worldRulesHTML(w, compact) {
  if (!w) return '';
  if (!(w.rules && w.rules.length)) return compact ? '' : `<div class="hs-rules"><span class="hs-lbl">Sonderregeln</span><p class="wr-none">In dieser Welt gelten nur die Grundregeln.</p></div>`;
  return `<div class="hs-rules"><span class="hs-lbl">Sonderregeln in ${esc(wLabel(w))}</span><dl class="wr-list">${w.rules.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${linkify(esc(d))}</dd>`).join('')}</dl></div>`;
}
SHEET_VIEWS.worldrules = s => {
  const w = worldById(s.w); if (!w) return null;
  const list = w.rules && w.rules.length ? `<dl class="wr-list">${w.rules.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${linkify(esc(d))}</dd>`).join('')}</dl>`
    : '<p>In dieser Welt gelten nur die Grundregeln. Nachlesen kannst du sie unter „Karten“ bei „Regeln und Probespiel“.</p>';
  return {head: h3(`${wLabel(w)} · Sonderregeln`), body: list + `<p class="hint">Sterne gibt es pro Station: einen fürs Schaffen und je einen für die Zusatzziele. Welche das sind, steht beim Start auch in den Notizen.</p><div class="acts"><button type="button" class="btn primary" data-storyclose>Alles klar</button></div>`};
};
SHEET_VIEWS.storyintro = s => {
  const w = worldById(s.w);
  return {head: h3(`${wLabel(w)} · ${esc(w.name)}`), body: `${sayHTML(w.face, w.intro)}<ul class="st-howto"><li>${starSvg(true)}<span>Jede Station gibt bis zu 3 Sterne: einen fürs Schaffen, zwei für Zusatzziele.</span></li><li>${coinImg}<span>Für Siege und Sterne gibt es Münzen. Die tauschst du beim Händler gegen Rahmen, Titel, Porträts und Hintergründe.</span></li><li><svg viewBox="0 0 24 24" class="noadv"><path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3z M9.5 20h5 M4 4l16 16" /></svg><span>${w.intro0 ? 'Hilde erklärt dir alles Schritt für Schritt. In der Probepartie helfen dir Tipps, danach spielst du ohne.' : 'Im Storymodus gibt es keine Tipps und keine Zug-Empfehlung.'}</span></li></ul><div class="acts"><button type="button" class="btn primary" data-storyclose>Auf geht’s</button></div>`};
};
SHEET_VIEWS.station = s => {
  const st = stationById(s.st); if (!st) return null;
  const done = !!STORY.done[st.id], stars = starsOf(st.id);
  // Testmodus: gesperrte Stationen lassen sich bis hierhin überspringen, offene direkt
  if (SET.test && !stationUnlocked(st)) return {head: h3(`${esc(st.no)} · ${esc(st.name)}`), body: `<p class="st-test">Testmodus: Diese Station ist noch gesperrt.</p><div class="acts"><button type="button" class="btn primary" data-story-skipto="${st.id}">Alles bis hierhin überspringen</button><button type="button" class="btn" data-storyclose>Schließen</button></div>`};
  const testBtn = SET.test && !done && st.type !== 'shop' && st.type !== 'event' ? `<button type="button" class="btn" data-story-skip="${st.id}">Überspringen (Test)</button>` : '';
  let body = `<span class="st-type t-${st.type}">${ST_TYPES[st.type]}${st.hard ? ' · schwer' : st.easy ? ' · leicht' : ''} · ${esc(st.place)}</span>${sayHTML(st.face, st.text)}<div class="st-goal"><b>Ziel</b><p>${esc(st.goal)}</p></div>`;
  const pre = body.length;
  if (st.type === 'event') {
    const ch = STORY.choice[st.id];
    body += ch ? `<p class="st-chosen">${starSvg(true)}<span>Entschieden: <b>${esc(st.choices.find(c => c.v === ch).l)}</b>. ${esc(st.choices.find(c => c.v === ch).d)}</span></p><div class="acts"><button type="button" class="btn" data-storyclose>Schließen</button></div>`
      : `<div class="st-choices">${st.choices.map(c => `<button type="button" class="btn st-choice" data-story-choice="${c.v}"><b>${esc(c.l)}</b><small>${esc(c.d)}</small></button>`).join('')}</div><p class="hint">Die Entscheidung gilt für diesen Durchgang der Welt.</p>`;
  } else if (st.type === 'shop') {
    // Händler im Storymodus: gleiches Regal wie der Krämerladen, je Welt mit eigener Optik (Klasse rg-w1 … rg-w5)
    body += `<p class="st-purse">${coinImg}Du hast <b>${STORY.coins}</b> Münzen.</p><div class="sitems rg-${st.id.slice(0, 2)}">${st.shop.map(it => shelfItem(it.id, it.price, it.price, 0, 'data-buy')).join('')}</div>` +
      `<div class="acts"><button type="button" class="btn primary" data-storyclose>${esc(st.onward || 'Weiter')}</button></div>`;
  } else if (st.type === 'tutorial') {
    body += `<ul class="st-goals"><li class="${stars[0] ? 'ok' : ''}">${starSvg(!!stars[0])}<span>Station schaffen</span></li></ul>`;
    if (st.reward) body += `<p class="st-reward">Belohnung: ${esc(cosmeticName(st.reward))}${owns(st.reward) ? ' · hast du schon' : ''}</p>`;
    body += `<div class="acts"><button type="button" class="btn primary" data-story-start="${st.id}">${done ? 'Nochmal spielen' : 'Los geht’s'}</button>${done || STORY.worlds[st.world] ? '' : `<button type="button" class="btn" data-story-tutskip="${st.id}">Einführung überspringen, ich kenne das Spiel</button>`}</div>`;
  } else {
    const goals = [['Station schaffen', !!stars[0]], ...(st.extras || []).map((e, i) => [e.t, !!stars[i + 1]])];
    body += `<ul class="st-goals">${goals.map(([t, ok]) => `<li class="${ok ? 'ok' : ''}">${starSvg(ok)}<span>${esc(t)}</span></li>`).join('')}</ul>`;
    if (st.reward) body += `<p class="st-reward">Belohnung: ${esc(cosmeticName(st.reward))}${owns(st.reward) ? ' · hast du schon' : ''}</p>`;
    const sv = storySave(), mine = sv && sv.st === st.id;
    body += mine ? `<p class="st-saved">${done ? 'Schon geschafft, neuer Versuch läuft' : 'Angefangen'}: Runde ${sv.S.turn}, du bist auf Stufe ${sv.S.players[0].lvl}.</p><div class="acts"><button type="button" class="btn primary" data-story-resume>Fortsetzen</button><button type="button" class="btn" data-story-start="${st.id}">Neu starten</button>${testBtn}</div>`
      : `<div class="acts"><button type="button" class="btn primary" data-story-start="${st.id}">${done ? 'Nochmal spielen' : 'Los geht’s'}</button>${testBtn}</div>`;
  }
  if (HUBST && CUR === 'title' && SHEETS.length === 1) {
    const rest = body.slice(pre);
    return {head: '', hero: true, body: hubStationHead(st) + `<div class="hs-main">${sayHTML(st.face, st.text)}<div class="st-goal"><b>Ziel</b><p>${esc(st.goal)}</p></div>${hubCast(st)}${rest}</div>`};
  }
  return {head: h3(`${esc(st.no)} · ${esc(st.name)}`), body};
};
// Mitte der Storykarte am PC: Kopfbild aus der Weltkarte rund um die Station, darunter wer mitspielt
function hubStationHead(st) {
  const w = worldById(st.world), bg = w.map ? `background-image:url(${w.map});background-position:${st.ax}% ${st.ay}%` : '';
  return `<div class="hs-hero t-${st.type}" style="${bg}"><div class="hs-hero-in"><span class="sn-medal">${medalIcon(st.type)}<i>${esc(st.no)}</i></span>` +
    `<div><span class="hs-kind">${ST_TYPES[st.type]}${st.hard ? ' · schwer' : st.easy ? ' · leicht' : ''} · ${esc(st.place)}</span><h2>${esc(st.name)}</h2></div></div></div>`;
}
function hubCast(st) {
  if (!st.scn || st.type === 'event' || st.type === 'shop') return '';
  const scn = scenarioFor(st), bots = scn.bots || [];
  const ppl = bots.map(n => `<span class="hs-p"><img src="${ICON.portrait[n] || ICON.portrait.Du}" alt=""><b>${esc(n)}</b></span>`).join('') +
    (scn.boss ? `<span class="hs-p boss"><img src="${ART[scn.boss] || ''}" alt=""><b>${esc(scn.boss)}</b><small>lauert im Stapel</small></span>` : '');
  return ppl ? `<div class="hs-cast"><span class="hs-lbl">Am Tisch</span><div class="hs-people"><span class="hs-p me"><img src="${myPortrait()}" alt=""><b>Du</b></span>${ppl}</div></div>` : '';
}
function showStoryEnd(res) {
  if (!STORY_RUN) return;
  const st = stationById(STORY_RUN.st), w = res.won;
  Snd.sfx(w ? 'victory' : 'defeat'); buzz(w ? [40, 60, 40, 60, 120] : 200);
  const goals = [['Station geschafft', res.stars[0]], ...(st.extras || []).map((e, i) => [e.t, res.stars[i + 1]])];
  const el = document.createElement('div'); el.className = 'endov story';
  if (res.egg) {   // Easter Egg: verlorene Probepartie
    Snd.sfx('victory'); buzz([30, 50, 30]);
    const el = document.createElement('div'); el.className = 'endov story egg';
    el.innerHTML = `<div class="panel"><div class="egg-pic"><img src="${COSMETICS.portrait.hoppel.src}" alt=""></div>` +
      `<h2>Nicht geschafft …</h2><p>„Na, das war wohl nix“, sagt Hilde. „Aber schau mal, wer dich trösten will.“ Unter dem Tisch hoppelt ein kleiner Hase hervor und stupst dich an.</p>` +
      res.rewards.map(r => `<p class="se-reward">Geheim freigeschaltet: ${esc(cosmeticName(r))}</p>`).join('') +
      `<p class="hint">Das bekommt nur, wer die Probepartie verliert. Verrat es nicht weiter!</p>` +
      `<div class="acts"><button type="button" class="btn primary" data-go="again">Nochmal versuchen</button><button type="button" class="btn" data-go="storymap">Zur Karte</button></div></div>`;
    endOnTable(el); document.body.appendChild(el);
    setTimeout(() => Particles.burst(innerWidth / 2, innerHeight * 0.3, 24, 1.2), 300);
    return;
  }
  const lose = st.type === 'puzzle' ? 'Das reicht noch nicht. Schau dir deine Karten noch einmal an.' : S && S.winner > 0 ? `${esc(P(S.winner).name)} war schneller. Gleich noch einmal?` : 'Gleich noch einmal?';
  el.innerHTML = `<div class="panel"><div class="se-stars">${res.stars.map((v, i) => `<span class="se-star${v ? ' on' : ''}" style="--d:${0.15 + i * 0.25}s">${starSvg(v)}</span>`).join('')}</div>` +
    `<h2>${w ? (st.final ? esc(worldById(st.world).finalTitle || 'Welt geschafft!') : 'Geschafft!') : 'Nicht geschafft'}</h2><p>${w ? (st.winText ? esc(st.winText) : esc(st.name) + ' liegt hinter dir.') : lose}</p>` +
    `<ul class="st-goals">${goals.map(([t, ok]) => `<li class="${ok ? 'ok' : ''}">${starSvg(ok)}<span>${esc(t)}</span></li>`).join('')}</ul>` +
    (res.coins ? `<p class="se-coins">${coinImg}+${res.coins} Münzen</p>` : '') +
    res.rewards.map(r => `<p class="se-reward">Neu: ${esc(cosmeticName(r))}</p>`).join('') +
    (res.worldDone ? `<p class="se-outro">${esc(worldById(st.world).outro)}</p>` + (worldById(st.world).unlocks ? `<p class="se-reward">Fürs freie Spiel freigeschaltet: ${esc(worldById(st.world).unlocks.join(', '))}</p>` : '') : '') +
    `<div class="acts"><button type="button" class="btn primary" data-go="storymap">Zur Karte</button><button type="button" class="btn" data-go="again">Nochmal</button></div></div>`;
  endOnTable(el); document.body.appendChild(el);
  if (w) { let k = 0; const iv = setInterval(() => { Particles.burst(Math.random() * innerWidth, innerHeight * 0.25, 18, 1.4); if (++k > 4) clearInterval(iv); }, 280); }
}

/* ================= Eingaben ================= */
function go(a) {
  switch (a) {
    case 'continue': continueGame(); break;
    case 'storygo': storyGo(); break;
    case 'playnow': playNow(); break;
    case 'chest': showChest(); break;
    case 'streakplus': { const n = cheatStreak(); if (!chestsWaiting().length || n % 7 && n !== 3) toast(`Serie: ${n} ${n === 1 ? 'Tag' : 'Tage'}`); renderSaveInfo(); break; }
    case 'streakreset': resetStreak(); toast('Serie auf 0 gesetzt'); renderSaveInfo(); break;
    case 'unlockall': confirmDialog('Alles freischalten?', 'Alle Welten werden gekauft, jede Station gilt mit allen Sternen als geschafft, und alle Decks, Tische, Musikstücke, Titel, Rahmen und Porträts werden freigeschaltet.', 'Freischalten', 'Abbrechen').then(ok => { if (!ok) return; unlockAll(); toast('Alles freigeschaltet'); renderSaveInfo(); renderControls(); }); break;
    case 'buyreset': PURCHASE.worlds = {}; savePurchase(); toast('Käufe zurückgesetzt'); renderSaveInfo(); break;
    case 'shopreroll': { const st = dailyState(); st.shop = rollShop(dayKey(), ':' + Date.now()); st.deal = null; saveDaily(); dailyState(); toast(st.shop.length ? 'Laden neu bestückt' : 'Im Laden gibt es nichts mehr, das du nicht hast'); break; }
    case 'online': closeAllSheets(); openSheet({id: 'online'}); break;
    case 'setup': freePlay(); break;
    case 'tutorial': closeAllSheets(); startStation('w0s1'); break;
    case 'resetstory': confirmDialog('Storymodus zurücksetzen?', 'Alle Stationen, Sterne, Münzen und Belohnungen aus dem Storymodus gehen verloren.', 'Zurücksetzen', 'Abbrechen').then(ok => { if (ok) { resetStory(); clearStorySave(); toast('Storymodus zurückgesetzt'); } }); break;
    case 'reroll': ROSTER = rollRoster(); renderFoes(); Snd.sfx('deal'); break;
    case 'home': if (HUBBOT) { closeHubBots(); break; } if (HUBST) { closeHubStory(); break; } closeAllSheets(); STACK.length = 0; setScreen('title'); break;
    case 'story': if (HUBST_ON()) openHubStory(); else show('story'); break;
    case 'storymap': $$('.endov').forEach(x => x.remove()); closeAllSheets(); if (GAME_ON && S && S.scn && S.winner == null) { TOKEN++; } if (S && S.scn) GAME_ON = false; STACK.length = 0; if (HUBST_ON()) { openHubStory(); break; } STACK.push('title'); setScreen('story'); break;
    case 'start': startNewGame(); break;
    case 'rules': closeAllSheets(); show('rules'); break;
    case 'cards': closeAllSheets(); show('cards'); break;
    case 'quiz': UI.q = null; show('quiz'); break;
    case 'profile': closeAllSheets(); show('profile'); break;
    case 'daily': closeAllSheets(); openSheet({id: 'daily'}); break;
    case 'shop': closeAllSheets(); if (mq().pc.matches) show('shop'); else openSheet({id: 'shop'}); break;
    case 'settings': closeAllSheets(); if (CUR === 'game' && PCGX()) { openSheet({id: 'gsettings'}); renderControls(); break; } show('settings'); break;
    case 'allsettings': closeAllSheets(); show('settings'); break;
    case 'pause': openSheet({id: 'pause'}); break;
    case 'resume': closeAllSheets(); break;
    case 'menu': $$('.endov').forEach(x => x.remove()); closeAllSheets(); STACK.length = 0; setScreen('title'); break;
    case 'restart': (async () => {
      const ok = await confirmDialog('Von vorne beginnen?', S && S.scn ? 'Diese Station startet noch einmal ganz von vorne. Die laufende Partie geht dabei verloren.' : 'Es geht mit denselben Einstellungen neu los. Die laufende Partie geht dabei verloren.', 'Neu starten', 'Abbrechen');
      if (!ok) return;
      closeAllSheets(); $$('.endov').forEach(x => x.remove());
      if (STORY_RUN && S && S.scn) startStation(STORY_RUN.st);
      else { GAME_ON = false; clearSave(); if (UI.roster) ROSTER = UI.roster; startNewGame(); }   // gleiche Gegner, gleiche Einstellungen
    })(); break;
    case 'again': $$('.endov').forEach(x => x.remove()); closeAllSheets(); if (STORY_RUN && S && S.scn) { startStation(STORY_RUN.st); break; } GAME_ON = false; startNewGame(); break;
    case 'log': $$('.endov').forEach(x => x.remove()); openSheet({id: 'log'}); break;
    case 'equip': openSheet({id: 'equip'}); break;
    case 'parts': openSheet({id: 'parts'}); break;
    case 'sell': startSell(); render(); break;
    case 'sound': { const on = SET.music || SET.sfx; SET.music = !on; SET.sfx = !on; saveSettings(); if (SET.music) { Snd.unlock(); Snd.startMusic(); } toast(on ? 'Ton aus' : 'Ton an'); renderSoundBtn(); if (CUR === 'game') render(); break; }
    case 'delsave': confirmDialog('Spielstand löschen?', 'Das gespeicherte Spiel ist danach weg.', 'Löschen', 'Behalten').then(ok => { if (ok) { clearSave(); if (GAME_ON) { GAME_ON = false; TOKEN++; } renderSaveInfo(); toast('Spielstand gelöscht'); } }); break;
  }
}
document.addEventListener('click', e => {
  const t = e.target;
  if (performance.now() < Drag.noClickUntil) { e.preventDefault(); e.stopPropagation(); return; }
  if (t.closest('.t-me,.t-coins,.t-gear,.t-wbtn,.t-cta,.t-card,.t-daily,.t-nav button,.btn,.iconbtn,.chip,.seg button,.switch,.oc,.mstat,.rcchip,.oitem,.ptbtn,.side,.art,.pf-pt,.pf-fr,.pickbtn')) { Snd.sfx('tap'); buzz(8); }
  if (CUR === 'title' && t.closest('#scr-title') && !t.closest('button,a,.t-modes,.t-nav,.t-top')) {
    const cta = $('.t-cta').getBoundingClientRect();
    if (e.clientY < cta.top - 2) { Snd.sfx('tap'); buzz(8); go('story'); return; }
  }
  let el;
  if ((el = t.closest('[data-pfpage]'))) { const G = PF_GROUPS(), i = Math.max(0, Math.min(G.length - 1, pfPage() + Number(el.dataset.pfpage))); UI.pfFilter = G[i][0]; renderProfile(); buzz(8); return; }
  if (t.closest('[data-chest]')) { showChest(); return; }
  if ((el = t.closest('.t-card[data-mode]'))) { if (SET.mode !== el.dataset.mode) { SET.mode = el.dataset.mode; saveSettings(); } renderTitle(); return; }
  if ((el = t.closest('[data-cname]'))) { openSheet({id: 'card', cname: el.dataset.cname}); return; }
  if ((el = t.closest('[data-ptip]'))) { UI.ptip = UI.ptip === el.dataset.ptip ? null : el.dataset.ptip; renderSheet(false); buzz(6); return; }
  if ((el = t.closest('[data-human]'))) { openSheet({id: 'card', human: true}); return; }
  if ((el = t.closest('[data-where="loot"]'))) {
    const L = tablePick(), i = L ? L.pool.findIndex(c => c.uid === +el.dataset.uid) : -1;
    if (i >= 0 && UI.resolve) {
      const v = L.vals ? L.vals[i] : i, les = SCN && SCN.tut && !SCN.tutFree && tutLesson();
      if (les && les.only && !les.only({v})) { buzz(30); return; }   // Einführung: nur die vorgesehene Karte
      Snd.sfx('deal'); W.hoverUid = null; UI.resolve(v);
    }
    return;
  }
  if ((el = t.closest('[data-uid]'))) {
    const uid = +el.dataset.uid, where = el.dataset.where;
    if (UI.sel && topSheet() && topSheet().id === 'sel' && ['hand', 'eq', 'pack'].includes(where)) {
      const c = findCard(uid);
      if (c && UI.sel.filter(c, where)) { const s = UI.sel.picked; if (s.has(uid)) s.delete(uid); else { if (UI.sel.max === 1) s.clear(); if (s.size < UI.sel.max) s.add(uid); } Snd.sfx('deal'); render(); }
      return;
    }
    openSheet({id: 'card', uid, where}); return;
  }
  if ((el = t.closest('[data-opt]'))) { const o = UI.opts[+el.dataset.opt]; if (o && !o.dis && UI.resolve) { UI.advOpen = false; UI.hintsOpen = false; closeAllSheets(); UI.resolve(o.v); } return; }
  if ((el = t.closest('[data-dpick]'))) { openSheet({id: 'pick'}); return; }
  if ((el = t.closest('[data-dmore]'))) { openSheet({id: 'more'}); return; }
  if ((el = t.closest('[data-dinfo]'))) { openSheet({id: 'info'}); return; }
  if ((el = t.closest('[data-adv]'))) { closeAllSheets(); applyAdvice(); render(); return; }
  if ((el = t.closest('[data-advtoggle]'))) { UI.advOpen = !UI.advOpen; render(); return; }
  if ((el = t.closest('[data-hints]'))) { UI.hintsOpen = !UI.hintsOpen; render(); return; }
  if ((el = t.closest('[data-cursepick]'))) {
    const sh = topSheet(), c = sh && sh.id === 'curse' && findCard(sh.uid), x = c && curseTargets(c).find(([p]) => p.id === +el.dataset.cursepick);
    closeAllSheets();
    if (!x) { toast('Den Fluch kannst du gerade nicht ausspielen.'); return; }
    Snd.sfx('play'); buzz(15);
    try { x[1].fn(); } catch (err) { if (err !== STALE) console.error(err); }
    render(); return;
  }
  if ((el = t.closest('[data-cact]'))) { const a = UI.cardActs[+el.dataset.cact]; if (a && a.fn && !a.dis) { popSheet(); try { a.fn(); } catch (err) { if (err !== STALE) console.error(err); } render(); } return; }
  if ((el = t.closest('[data-sel]'))) { if (UI.sel) { const v = el.dataset.sel; UI.sel.done(v === 'ok' ? [...UI.sel.picked] : null); } return; }
  if ((el = t.closest('[data-opp]'))) { openSheet({id: 'opp', pid: +el.dataset.opp}); return; }
  if ((el = t.closest('[data-sheetclose]'))) { if (!(topSheet() && topSheet().id === 'sel')) closeAllSheets(); return; }
  if ((el = t.closest('[data-sheetback]'))) { popSheet(); return; }
  if ((el = t.closest('[data-back]'))) { back(); return; }
  if ((el = t.closest('[data-go]'))) { go(el.dataset.go); return; }
  if ((el = t.closest('.seg[data-set] button.locked'))) { toast(`Schaltest du frei, wenn du im Storymodus Welt ${worldById(MOOD_WORLD[el.dataset.v]).n} abschließt.`); buzz(30); return; }
  if ((el = t.closest('.seg[data-set] button'))) { const k = el.parentElement.dataset.set; SET[k] = isNaN(+el.dataset.v) ? el.dataset.v : +el.dataset.v; saveSettings(); renderControls(); if (CUR === 'setup' || HUBBOT) renderFoes(); return; }
  if ((el = t.closest('[data-toggle]'))) { const k = el.dataset.toggle; SET[k] = !SET[k]; saveSettings(); renderControls(); if (k === 'music' && SET.music) { Snd.unlock(); Snd.startMusic(); } if (CUR === 'game') render(); return; }
  if ((el = t.closest('[data-portrait]'))) { if (el.classList.contains('locked')) { toast(cosmeticSource('portrait:' + el.dataset.portrait)); return; } PROFILE.portrait = el.dataset.portrait; saveProfile(); renderProfile(); return; }
  if ((el = t.closest('[data-frame]'))) { if (el.classList.contains('locked')) { toast(cosmeticSource('frame:' + el.dataset.frame)); return; } PROFILE.frame = el.dataset.frame; saveProfile(); renderProfile(); return; }
  if ((el = t.closest('[data-bg]'))) { if (el.classList.contains('locked')) { toast(cosmeticSource('bg:' + el.dataset.bg)); return; } PROFILE.bg = el.dataset.bg; saveProfile(); renderProfile(); return; }
  if ((el = t.closest('[data-title]'))) { if (el.classList.contains('locked')) { toast('Schaltest du im Storymodus frei.'); return; } PROFILE.title = el.dataset.title; saveProfile(); renderProfile(); return; }
  if ((el = t.closest('[data-worldrules]'))) { openSheet({id: 'worldrules', w: el.dataset.worldrules}); return; }
  if ((el = t.closest('[data-buyworld]'))) { openSheet({id: 'buyworld', w: el.dataset.buyworld}); return; }
  if ((el = t.closest('[data-billrestore]'))) { billRestore(false).then(n => { if (n) { closeAllSheets(); } }); return; }
  if ((el = t.closest('[data-offer]'))) { buyOffer(el.dataset.offer); return; }
  if ((el = t.closest('[data-station]'))) { openStation(el.dataset.station); return; }
  if ((el = t.closest('[data-story-start]'))) { askStartStation(el.dataset.storyStart); return; }
  if ((el = t.closest('[data-story-resume]'))) { resumeStation(); return; }
  if ((el = t.closest('[data-reroll]'))) { if (rerollMission(+el.dataset.reroll)) { Snd.sfx('deal'); renderSheet(false); renderTitle(); } return; }
  if ((el = t.closest('[data-shopbuy]'))) { const id = el.dataset.shopbuy, r = buyShopItem(id);
    if (r === 'poor') { buzz(40); return; }
    if (r === 'ok') { Snd.sfx('coin'); missionToast(`${cosmeticName(id)} gehört dir`, 0); renderSheet(false); renderTitle(); if (CUR === 'profile') renderProfile(); if (CUR === 'shop') renderShopPage(); renderWnav(); }
    return; }
  if ((el = t.closest('[data-story-choice]'))) { pickChoice(el.dataset.storyChoice); return; }
  if ((el = t.closest('[data-buy]'))) { buyItem(el.dataset.buy); return; }
  if ((el = t.closest('[data-storyclose]'))) { closeAllSheets(); return; }
  // Einführung überspringen: die ganze Welt 0 gilt als geschafft (ohne Sterne), weiter geht es in Welt 1
  if ((el = t.closest('[data-story-tutskip]'))) { const st = stationById(el.dataset.storyTutskip); const w = st && worldById(st.world);
    if (w && w.intro0) { STORY.worlds[w.id] = true; } else if (st && !STORY.done[st.id]) { STORY.done[st.id] = true; STORY.stars[st.id] = [false]; }
    saveStory(); closeAllSheets(); renderStory(); renderTitle(); return; }
  if ((el = t.closest('[data-tutok]'))) { if (TUT && TUT.cur) TUT.fin.add(TUT.cur); tutUpdate(); return; }
  if ((el = t.closest('[data-story-skip]'))) { skipStation(stationById(el.dataset.storySkip)); closeAllSheets(); toast('Station übersprungen'); renderStory(); return; }
  if ((el = t.closest('[data-story-skipto]'))) { skipTo(stationById(el.dataset.storySkipto)); closeAllSheets(); toast('Bis hierhin übersprungen'); renderStory(); return; }
  if ((el = t.closest('[data-deck]'))) { selectDeck(el.dataset.deck); return; }
  if ((el = t.closest('[data-variant]'))) { selectVariant(el.dataset.variant); return; }
  if ((el = t.closest('[data-dk]'))) { setDeckCount(+el.dataset.dk, +el.dataset.d); Snd.sfx(+el.dataset.d > 0 ? 'deal' : 'tap', .6); return; }
  if ((el = t.closest('[data-kf]'))) { UI.kfilter = el.dataset.kf; renderCards(); const sc = $('#scr-cards .content'); sc.scrollTop = Math.min(sc.scrollTop, $('#deck-panel').offsetHeight + 6); return; }
  if ((el = t.closest('[data-q]'))) {
    const Q = UI.q, v = el.dataset.q;
    if (v === 'next') { Q.i++; } else if (v === 'restart') { UI.q = {i: 0, ans: []}; } else { Q.ans[Q.i] = +v; Snd.sfx(+v === QUIZ[Q.i].a ? 'coin' : 'leveldown'); buzz(+v === QUIZ[Q.i].a ? 15 : 50); }
    renderQuiz(); return;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { back(); return; }
  // Breite Ansicht mit Tastatur: Leertaste oder Enter drückt den Hauptknopf der Aktionsleiste
  if ((e.key === ' ' || e.key === 'Enter') && LAYOUT && CUR === 'game' && !SHEETS.length && !/INPUT|TEXTAREA|SELECT|BUTTON/.test((e.target && e.target.tagName) || '')) {
    const b = $('#act .rec:not([disabled])') || $('#act .btn.primary:not([disabled])'); if (b) { e.preventDefault(); b.click(); }
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) Snd.suspend(); else Snd.resume();
  updatePaused();
});

/* ================= Werte erklärt ================= */
function tipRows(rows,total){
  return `<ul class="tip-l">${rows.map(r=>`<li class="${r.off?'off':''}"><span>${esc(r.l)}</span><b>${r.v}</b></li>`).join('')}${total!=null?`<li class="sum"><span>Summe</span><b>${total}</b></li>`:''}</ul>`;
}
function powerTip(p){
  const rows=[{l:'Stufe',v:p.lvl}];
  p.eq.forEach(i=>{ if(!i.b) return; rows.push(usable(p,i) ? {l:i.n,v:'+'+i.b} : {l:`${i.n} (nur für ${reqName(i)})`,v:'0',off:true}); });
  const n=[];
  if(hasCls(p,'krieger')) n.push('Krieger: Ohne Helfer +3 im Kampf.');
  if(hasCls(p,'priester')) n.push('Exorzist: Gegen Untote +3.');
  if(hasCls(p,'zauberer')) n.push('Zauberer: Einmal pro Kampf hebt der Gegenzauber eine Karte gegen dich auf.');
  if(hasCls(p,'pirat')) n.push('Pirat: Allein gewonnen gibt es 1 Schatz mehr. Bei Seegang gibt er nichts ab.');
  if(p.spore) n.push(`Sporenwolke: im Kampf −${p.spore}, bis ein Kampf gewonnen ist.`);
  n.push('Im Kampf kommen noch Einmal-Gegenstände, ein Helfer und Monsterboni dazu.');
  return `<b class="tip-h">Kampfstärke = Stufe + ausgerüstete Gegenstände</b>${tipRows(rows,power(p))}<span class="tip-n">${n.join(' ')}</span>`;
}
function runTip(p){
  const rows=[];
  const fl=isFlut();
  p.eq.forEach(i=>{
    if(i.run) rows.push(usable(p,i) ? {l:i.n,v:sign(i.run)} : {l:`${i.n} (inaktiv)`,v:'0',off:true});
    if(i.flutRun) rows.push(!usable(p,i) ? {l:`${i.n} (inaktiv)`,v:'0',off:true} : fl ? {l:`${i.n} bei Flut`,v:sign(i.flutRun)} : {l:`${i.n} (nur bei Flut)`,v:'0',off:true});
  });
  if(fl) rows.push({l:'Flut',v:'+1'});
  if(p.sand) rows.push({l:'Sand in der Badehose',v:'−2'});
  const b=runBonus(p), need=5-b, pc=Math.round(Math.max(0,Math.min(6,7-need))/6*100);
  const n=[];
  if(hasCls(p,'priester')) n.push('Exorzist: Untote verfolgen dich nie.');
  if(hasCls(p,'zauberer')) n.push('Zauberer: Nach einem misslungenen Wurf bis zu 3 Karten abwerfen, je +1.');
  n.push('Manche Monster ändern den Wurf noch, etwa das Vampir-Kaninchen (−1).');
  return `<b class="tip-h">Weglaufen: ohne Bonus ab einer 5</b>${rows.length?tipRows(rows,sign(b)):'<span class="tip-n">Keine Boni.</span>'}<b>${need<=1?'Entkommt immer.':`Entkommt ab einer ${need}: ${pc} %.`}</b><span class="tip-n">${n.join(' ')}</span>`;
}
function goldTip(p){
  const g=p.gold||0, kob=p.race&&p.race.r==='halbling';
  return `<b class="tip-h">Goldbeutel: ${fmt(g)} Gold</b><span class="tip-n">Beim Verkaufen gibt es je 1000 Gold eine Stufe. Was übrig bleibt, landet im Goldbeutel und zählt beim nächsten Verkauf mit${g&&g<1000?`: Mit Gegenständen für ${fmt(1000-g)} Gold steigst du auf`:''}. Die Siegstufe gibt es dafür nie.${kob?' Als Kobold bringt dir einmal pro Zug ein Verkauf 200 Gold extra.':''}</span>`;
}
function handTip(p){
  return `<b class="tip-h">Handkarten: höchstens ${handLimit(p)}</b><span class="tip-n">Gilt am Ende des eigenen Zugs. Den Überschuss bekommt als Abgabe, wer die niedrigste Stufe hat. Rucksack: ${p.pack.length} von ${packLimit(p)} Gegenständen${(p.gold||0)?`, Goldbeutel: ${fmt(p.gold)} Gold`:''}.${p.human?'':' Welche Karten das sind, ist geheim.'}</span>`;
}
const ABIL={
  elf:['Raum durchsuchen: 2 ziehen, 1 behalten'], zwerg:['Rucksack 5','beliebig viele Sperrige'], halbling:['Feilschen: +200 Gold pro Zug'],
  krieger:['ohne Helfer: +3'], zauberer:['Gegenzauber','Fluchtzauber: Karten abwerfen'], dieb:['verkauft Flüche und Launen'], priester:['gegen Untote: +3','Untote verfolgen ihn nicht'], pirat:['allein gewonnen: +1 Schatz','seefest bei Seegang']
};

/* ================= Ziehen und Ablegen: Karten aufs Spielfeld ================= */
function resolveOpt(v) { closeAllSheets(); UI.advOpen = false; if (UI.resolve) UI.resolve(v); }
function dragIntents(c) {
  const I = [];
  if (!S || S.winner != null || !UI.prompt || UI.sel || !c || !tutCardOk(c)) return I;
  if (UI.prompt.ctx === 'trouble' && c.k === 'monster') {
    const o = UI.prompt.get().opts.find(o => o.v === 'm' + c.uid);
    if (o) I.push({zones: ['table'], label: `${c.n} herausfordern`, run: () => resolveOpt(o.v)});
  }
  if (!me().hand.includes(c)) return I;
  const acts = cardActions(c, 'hand').filter(a => a.l && a.fn && !/^Verkaufen/.test(a.l) && tutActOk(c, a.l, 'hand'));
  const C = S.combat;
  switch (c.k) {
    case 'item': case 'race': case 'class': case 'levelup':
      acts.forEach(a => /Rucksack/.test(a.l) ? I.push({zones: ['pack'], label: a.l, run: a.fn, dis: a.dis, sub: a.dis ? '' : 'zählt dann nicht mehr als Handkarte'})
        : I.push({zones: ['table'], label: a.l.replace(/^Benutzen: /, ''), run: a.fn, dis: a.dis, sub: c.k === 'item' && !a.dis ? equipSub(me(), c) : ''})); break;
    case 'oneshot':
      acts.forEach(a => { const mon = /Monster/.test(a.l), z = [mon ? 'monside' : 'fighter']; if (a.kind === 'primary') z.push('table'); I.push({zones: z, label: a.l, run: a.fn, dis: a.dis, pv: c.b ? {side: mon ? 'm' : 'p', b: {l: c.n, v: mon ? c.b : osP(c, C)}} : null}); }); break;
    case 'enh':
      if (C) acts.forEach((a, i) => { const m = C.mons[i]; if (!m) return; const z = ['art:' + m.c.uid]; if (C.mons.length === 1) z.push('table', 'monside'); I.push({zones: z, label: a.l.replace(' spielen', ''), run: a.fn, dis: a.dis, pv: {mon: m, e: {n: c.n, v: c.v}}}); });
      break;
    case 'wander':
      if (acts.length === 1) I.push({zones: ['table'], label: acts[0].l, run: acts[0].fn});
      else if (acts.length > 1) I.push({zones: ['table'], label: 'Monster wählen …', run: () => openSheet({id: 'card', uid: c.uid, where: 'hand'})});
      break;
    case 'monster': {
      const w = me().hand.find(x => x.k === 'wander');
      if (w) { const wa = cardActions(w, 'hand').find(a => a.fn && a.l.startsWith(`Mit ${c.n} (`)); if (wa) I.push({zones: ['table'], label: 'Als Hinterhalt dazuschicken', run: wa.fn}); }
      break;
    }
    case 'curse': {
      if (c.eff && c.eff.t === 'seegang') { const a = acts.find(x => x.fn); if (a) I.push({zones: ['table'], label: 'Seegang auslösen', run: a.fn}); break; }
      /* direkt auf einen Gegner oben, oder irgendwo aufs Spielfeld und danach das Ziel wählen */
      const ts = [];
      acts.forEach(a => { const t = S.players.find(x => !x.human && a.l === `Auf ${x.name} spielen`); if (t) { ts.push([t, a]); I.push({zones: ['opp:' + t.id], label: `Fluch auf ${t.name}`, run: a.fn}); } });
      if (ts.length === 1) I.push({zones: ['table'], label: `Fluch auf ${ts[0][0].name}`, run: ts[0][1].fn});
      else if (ts.length > 1) I.push({zones: ['table'], label: 'Fluch spielen: Ziel wählen', run: () => openSheet({id: 'curse', uid: c.uid}), sheet: true});
      break;
    }
  }
  return I;
}
const Drag = (() => {
  let st = null;
  const TH = 10;
  function zoneAt(x, y) {
    if (st && st.split) {
      const t = $('#table'), r = t && t.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        const left = x < r.left + r.width / 2;
        return {key: left ? 'fighter' : 'monside', el: st.ov && st.ov.querySelector(left ? '.dh.me' : '.dh.mon')};
      }
    }
    const el = document.elementFromPoint(x, y); if (!el) return null;
    let z;
    if ((z = el.closest('.oc[data-opp]'))) return {key: 'opp:' + z.dataset.opp, el: z};
    if ((z = el.closest('#mebar .packbtn'))) return {key: 'pack', el: z};
    // Ohne geteiltes Feld gehören die beiden Stärke-Anzeigen unten einfach zum Spielfeld
    if (el.closest('#table .side')) return {key: 'table', el: $('#table')};
    if ((z = el.closest('#table .art[data-uid]'))) return {key: 'art:' + z.dataset.uid, el: z, art: true};
    if ((z = el.closest('#table'))) return {key: 'table', el: z};
    return null;
  }
  function intentFor(zone) {
    if (!zone || !st) return null;
    let it = st.intents.find(i => i.zones.includes(zone.key));
    if (!it && (zone.art || zone.key === 'fighter' || zone.key === 'monside')) it = st.intents.find(i => i.zones.includes('table'));
    return it || null;
  }
  function zoneEls(key) {
    if (key === 'table') return [$('#table')];
    if (key === 'pack') return [$('#mebar .packbtn')];
    if (key === 'fighter') return [$('#table .side.me')];
    if (key === 'monside') return [$('#table .side.mon')];
    if (key.startsWith('opp:')) return [$(`.oc[data-opp="${key.slice(4)}"]`)];
    if (key.startsWith('art:')) return [$(`#table .art[data-uid="${key.slice(4)}"]`)];
    return [];
  }
  function down(e) {
    if (CUR !== 'game' || !S || (e.button != null && e.button > 0)) return;
    const el = e.target.closest('#hand .mc[data-uid]'); if (!el || SHEETS.length || UI.sel) return;
    st = {uid: +el.dataset.uid, el, x0: e.clientX, y0: e.clientY, id: e.pointerId, started: false};
  }
  function start(e) {
    const c = findCard(st.uid); if (!c) { st = null; return; }
    st.c = c; st.intents = dragIntents(c); st.started = true;
    const r = st.el.getBoundingClientRect();
    st.offX = st.x0 - r.left; st.offY = st.y0 - r.top;
    const g = st.el.cloneNode(true);
    g.classList.remove('new', 'can', 'rec'); g.classList.add('ghost'); g.removeAttribute('data-uid');
    g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    const lab = document.createElement('span'); lab.className = 'dlabel'; document.body.appendChild(lab);
    document.body.appendChild(g); st.g = g; st.lab = lab; st.r = r;
    st.el.classList.add('lifted');
    try { st.el.setPointerCapture(e.pointerId); } catch (err) {}
    const keys = new Set(); st.intents.forEach(i => i.zones.forEach(z => keys.add(z)));
    st.marked = [];
    st.split = !!(S.combat && keys.has('fighter') && keys.has('monside') && $('#table'));
    if (st.split) { st.ov = splitOverlay(st.intents); $('#table').classList.add('splitting'); }
    else keys.forEach(k => { if (k === 'fighter' || k === 'monside') return; zoneEls(k).forEach(z => { if (z) { z.classList.add('dz'); st.marked.push(z); } }); });
    Snd.sfx('deal', 0.6); buzz(10);
  }
  function move(x, y) {
    const dx = x - st.x0;
    st.g.style.transform = `translate(${x - st.offX}px, ${y - st.offY}px) rotate(${Math.max(-8, Math.min(8, dx / 25))}deg) scale(1.08)`;
    const zone = zoneAt(x, y), it = intentFor(zone);
    if (st.hover !== (zone && zone.el)) { if (st.hover) st.hover.classList.remove('dzh'); st.hover = zone && it ? zone.el : null; if (st.hover) st.hover.classList.add('dzh'); }
    st.zone = zone; st.it = it;
    const pv = it && !it.dis && it.pv ? it.pv : null;
    if (pv !== UI.pv) setPv(pv);
    const txt = it ? it.label : '', key = txt + '|' + (it && it.sub || '');
    if (st.labKey !== key) { st.labKey = key; st.lab.innerHTML = esc(txt) + (it && it.sub ? `<small>${esc(it.sub)}</small>` : ''); }
    st.lab.classList.toggle('show', !!txt && !st.split);
    st.lab.classList.toggle('no', !!(it && it.dis));
    if (txt && !st.split) {   // Beschriftung am Bildschirmrand nicht abschneiden
      const gr = st.g.getBoundingClientRect(), lw = st.lab.offsetWidth, lh = st.lab.offsetHeight;
      const left = Math.min(Math.max((gr.left + gr.right) / 2 - lw / 2, 6), innerWidth - 6 - lw);
      const top = gr.bottom + 8 + lh < innerHeight - 6 ? gr.bottom + 8 : Math.max(6, gr.top - lh - 8);
      st.lab.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    }
  }
  function setPv(pv) { UI.pv = pv; const hud = $('#table .hud'); if (hud && S && S.combat) paintHud(hud, S.combat); }
  function splitOverlay(intents) {
    const C = S.combat, inMine = C.f === 0 || C.h === 0;
    const who = inMine ? (C.h != null ? 'Für euch' : 'Für dich') : `Für ${P(C.f).name}`;
    const pts = [P(C.f), C.h != null ? P(C.h) : null].filter(Boolean).map(p => `<img${p.human ? ' class="me"' : ''} src="${portrait(p)}" alt="">`).join('');
    const half = (z, cls, lbl, img) => { const it = intents.find(i => i.zones.includes(z)); const v = it && it.pv && it.pv.b ? sign(it.pv.b.v) : '';
      return `<div class="dh ${cls}${it && it.dis ? ' no' : ''}"><span class="dh-who">${img}${esc(lbl)}</span>${v ? `<b class="dh-b">${v}</b>` : ''}</div>`; };
    const el = document.createElement('div'); el.className = 'dsplit';
    el.innerHTML = half('fighter', 'me', who, `<span class="dh-pts">${pts}</span>`) + half('monside', 'mon', C.mons.length > 1 ? 'Für die Monster' : 'Für das Monster', `<span class="dh-pts">${C.mons.map(m => `<img src="${ART[m.c.n] || ART_FALLBACK}" alt="">`).join('')}</span>`);
    $('#table').appendChild(el);
    return el;
  }
  function cleanup() {
    if (!st) return;
    if (st.ov) { const ov = st.ov; ov.classList.add('out'); setTimeout(() => ov.remove(), 160); const t = $('#table'); if (t) t.classList.remove('splitting'); }
    if (UI.pv) setPv(null);
    (st.marked || []).forEach(z => z.classList.remove('dz', 'dzh'));
    if (st.el) st.el.classList.remove('lifted');
    if (st.lab) st.lab.remove();
  }
  function flyBack(g, r) {
    g.style.transition = 'transform .28s cubic-bezier(.3,.8,.3,1.1)';
    g.style.transform = `translate(${r.left}px, ${r.top}px) rotate(0) scale(1)`;
    setTimeout(() => g.remove(), 300);
  }
  function end(e) {
    if (!st || (e && e.pointerId !== st.id)) return;
    const s0 = st;
    if (!s0.started) { st = null; return; }
    Drag.noClickUntil = performance.now() + 400;
    cleanup();
    let it = s0.it; const g = s0.g;
    st = null;
    /* Hat sich die Lage während des Ziehens geändert (Kampf vorbei, Fenster zu), zählt die alte Aktion nicht mehr */
    if (it && !it.dis && e.type !== 'pointercancel') { const k = it.zones.join(); it = dragIntents(s0.c).find(i => i.label === it.label && i.zones.join() === k) || null; if (!it) { flyBack(g, s0.r); toast('Zu spät, die Lage hat sich gerade geändert.'); return; } }
    if (e.type === 'pointercancel' || !it || it.dis) {
      flyBack(g, s0.r);
      if (e.type !== 'pointercancel' && s0.zone) {
        if (it && it.dis) toast(esc(it.dis));
        else { const info = cardActions(s0.c, 'hand').find(a => a.info); toast(info ? info.info : 'Diese Karte kannst du gerade nicht ausspielen.'); }
        Snd.sfx('leveldown', 0.4); buzz(40);
      }
      return;
    }
    g.style.transition = 'transform .25s ease, opacity .25s ease';
    g.style.transform = g.style.transform.replace(/scale\([^)]*\)/, 'scale(.5)');
    g.style.opacity = '0';
    setTimeout(() => g.remove(), 270);
    if (!it.sheet) { Snd.sfx('play'); buzz(15); }
    try { it.run(); } catch (err) { if (err !== STALE) console.error(err); }
    render();
  }
  document.addEventListener('pointerdown', down);
  document.addEventListener('pointermove', e => {
    if (!st || e.pointerId !== st.id) return;
    if (!st.started) {
      const dx = e.clientX - st.x0, dy = e.clientY - st.y0;
      if (Math.abs(dx) > TH && Math.abs(dx) > Math.abs(dy)) { st = null; return; }
      if (dy < -TH && Math.abs(dy) > Math.abs(dx) * 0.8) start(e); else return;
      if (!st) return;
    }
    e.preventDefault();
    move(e.clientX, e.clientY);
  }, {passive: false});
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
  /* Rückfallebenen: Ein Rechtsklick öffnet während des Ziehens kein Kontextmenü mehr (das hat bisher das Loslassen „verschluckt“).
     Kommt das Loslassen trotzdem nicht an (Maustaste außerhalb des Fensters losgelassen, Fenster gewechselt, Escape),
     fliegt die Karte zurück auf die Hand, statt hängen zu bleiben. */
  const abort = () => { if (st && st.started) end({type: 'pointercancel', pointerId: st.id}); else st = null; };
  document.addEventListener('contextmenu', e => { if (st && st.started) e.preventDefault(); });
  document.addEventListener('pointermove', e => { if (st && st.started && e.pointerId === st.id && e.pointerType === 'mouse' && !(e.buttons & 1)) abort(); }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && st && st.started) abort(); });
  window.addEventListener('blur', abort);
  document.addEventListener('visibilitychange', () => { if (document.hidden) abort(); });
  return {noClickUntil: 0, active: () => !!(st && st.started)};
})();

/* ================= Start ================= */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; $('#btn-install').hidden = false; });
$('#btn-install').addEventListener('click', async () => { if (!deferredInstall) return; deferredInstall.prompt(); try { await deferredInstall.userChoice; } catch (e) {} deferredInstall = null; $('#btn-install').hidden = true; });
/* ================= Probespiel mit Hilde ================= */
// Lektionen: Die erste, deren Lage eintritt (when), erscheint in Hildes Sprechblase und bleibt, bis sie erledigt ist (done)
// oder mit „Verstanden“ weggetippt wird (ok). only = welche Knöpfe im Dock gerade erlaubt sind, hl = was aufleuchtet.
let TUT = null;
const tHand = n => S && me().hand.find(c => typeof n === 'string' ? c.n === n : n(c));
const tEq = n => S && me().eq.some(c => c.n === n);
const tCtx = () => UI.prompt && S.cur === 0 ? UI.prompt.ctx : null;
const tFight = () => S.combat && !S.combat.resolved && S.combat.f === 0 && tCtx() === 'fight';
const tCard = n => `#hand .mc[aria-label="${n}"]`;
const tOpt = pred => () => { const i = (UI.opts || []).findIndex(pred); return i >= 0 ? `#act [data-opt="${i}"]` : null; };
const S1 = ['w0s1'], S2 = ['w0s2'], S3 = ['w0s3'], S4 = ['w0s4'];
const tMon = n => S.combat && S.combat.mons.some(m => m.c.n === n);
const tAsk = c => UI.prompt && UI.prompt.ctx === c;   // auch außerhalb des eigenen Zugs (Einmischen)
const TUT_LESSONS = [
  /* ---- Station 1: Willkommen ---- */
  {id: 'w1', st: S1, ok: 'Weiter', big: true, dim: true, step: [1, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'Willkommen in meiner Taverne! Ich bin Hilde. Hier spielen wir Plundo. Du bist Abenteurer und fängst ganz unten an, auf Stufe 1.'},
  {id: 'w2', st: S1, ok: 'Weiter', big: true, dim: true, step: [2, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'Wer zuerst die Zielstufe erreicht, gewinnt. Normalerweise ist das Stufe 10. Zum Üben reicht heute Stufe 2.'},
  {id: 'w3', st: S1, ok: 'Weiter', big: true, dim: true, step: [3, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'Stufen bekommst du vor allem, wenn du Monster besiegst. Dafür brauchst du Ausrüstung: Schwerter, Helme, Stiefel und allerlei Unsinn. Ein rostiges Schwert hab ich dir schon in die Hand gedrückt.'},
  {id: 'w4', st: S1, ok: 'Zeig her', big: true, dim: true, step: [4, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'Die anderen am Tisch wollen dasselbe. Mal helfen sie dir, mal legen sie dich rein. Genau das macht den Spaß aus. Komm, ich zeig dir den Tisch.'},
  {id: 't1', st: S1, ok: 'Weiter', spot: '#opps', step: [5, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'Oben sitzen die anderen Spieler, heute nur Berta. Du siehst ihr Bild, ihre Stufe und was sie gerade macht.'},
  {id: 't2', st: S1, ok: 'Weiter', spot: '#table', step: [6, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'In der Mitte ist das Spielfeld. Hier tauchen Monster auf, und hier wird gekämpft.'},
  {id: 't3', st: S1, ok: 'Weiter', spot: '#act', step: [7, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: () => PCGX() ? 'Rechts neben dem Spielfeld stehen deine Möglichkeiten. Der orange Knopf ist fast immer der nächste Schritt.' : 'Darunter stehen deine Möglichkeiten. Der orange Knopf ist fast immer der nächste Schritt.'},
  {id: 't4', st: S1, ok: 'Weiter', spot: '#mebar', step: [8, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: () => PCGX() ? 'Das bist du. Die Zahl an deinem Bild ist deine Stufe, die Punkte zeigen, wie weit es noch bis zum Sieg ist. Am unteren Rand des Spielfelds liegt deine Ausrüstung. Klickst du auf dein Schild, siehst du alles im Detail.' : 'Das bist du. Die Münze zeigt deine Stufe: 1 von 2. Die Zahlen daneben erkläre ich dir, wenn wir sie brauchen. Tippst du hier drauf, siehst du deine Ausrüstung.'},
  {id: 't5', st: S1, ok: 'Weiter', spot: '#hand', step: [9, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'Ganz unten liegen deine Handkarten. Die hast du in Reserve und spielst sie aus, wenn du sie brauchst.'},
  {id: 't6', st: S1, ok: 'Alles klar', spot: '#scr-game .topbar', step: [10, 10], only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: () => PCGX() ? 'Links auf dem Spielfeld siehst du, in welchem Schritt deines Zuges du gerade bist. Rechts oben auf dem Spielfeld ist das Menü, falls du eine Pause brauchst. Daneben stehen die Notizen mit allem, was im Spiel passiert ist.' : 'Und ganz oben: Links ist das Menü, falls du eine Pause brauchst. In der Mitte siehst du, in welchem Schritt deines Zuges du gerade bist. Rechts stehen die Notizen mit allem, was im Spiel passiert ist.'},
  {id: 'karte', st: S1, act: /^Ausrüsten/, sheet: 'card', when: () => tCtx() === 'kick' && S.turn === 1, done: () => TUT.sawCard && !SHEETS.length, only: () => false, hl: () => '#hand .mc', shl: () => $$('#sheet [data-cact]').find(b => /Ausrüsten/.test(b.textContent)),
    text: 'Tipp mal auf deine Karte. Dann siehst du groß, was sie kann. Mit „Ausrüsten“ setzt du den Helm auf und wirst stärker.'},
  {id: 'tuer', st: S1, when: () => tCtx() === 'kick' && S.turn === 1, done: () => tCtx() !== 'kick', hl: () => '#act .btn.primary',
    text: 'Jetzt geht es los. Jeder Zug beginnt damit, dass du eine Tür öffnest. Dahinter kann ein Monster lauern. Tipp auf „Tür öffnen“.'},
  {id: 'staerke', st: S1, ok: 'Weiter', spot: '#table .hud', only: () => false, when: () => tFight(),
    text: () => `Ein Monster! Ein Wütender Gartenzwerg. Links steht deine Stärke: ${power(me())}. Das ist deine Stufe plus alles, was du trägst. Rechts steht die Stärke des Monsters: ${S.combat.mons[0].c.lvl}.`},
  {id: 'sieg', st: S1, when: () => tFight() && evalCombat(S.combat).win, done: () => !tFight(), hl: () => '#act .btn.primary',
    text: 'Ist deine Zahl höher, gewinnst du. Bei Gleichstand gewinnt das Monster. Deine ist höher, also tipp auf „Monster besiegen“.'},
  /* ---- Station 2: Wer bin ich? ---- */
  {id: 'hallo2', st: S2, ok: true, only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'Diesmal geht es um dich: Volk, Klasse und was du mit Gegenständen machst, die du nicht brauchst. Ziel ist Stufe 4.'},
  {id: 'rasse', st: S2, act: /^Ausspielen/, when: () => tCtx() === 'kick' && tHand('Elf') && !me().race, done: () => !!me().race, only: () => false, hl: () => tCard('Elf'),
    text: 'Völker geben dir besondere Fähigkeiten. Tipp die Elfe an, lies, was sie kann, und spiel sie dann aus.'},
  {id: 'klasse', st: S2, act: /^Ausspielen/, when: () => tCtx() === 'kick' && me().race && !me().cls && tHand('Krieger'), done: () => !!me().cls, only: () => false, hl: () => [tCard('Krieger'), '#table'],
    text: 'Jetzt die Klasse. Krieger sind allein stark: Kämpfen sie ohne Helfer, haben sie +3. Probier diesmal den schnellen Weg: Halt den Krieger fest und zieh ihn nach oben aufs Spielfeld. So spielst du jede Karte aus, ohne sie erst anzutippen.'},
  {id: 'breitschwert', st: S2, act: /^Ausrüsten/, when: () => tCtx() === 'kick' && me().cls && tHand('Breitschwert der Angeberei'), done: () => tEq('Breitschwert der Angeberei'), only: () => false, hl: () => tCard('Breitschwert der Angeberei'),
    text: 'Manche Gegenstände darf nur eine bestimmte Klasse oder ein bestimmtes Volk benutzen. Das Breitschwert der Angeberei ist nur für Krieger, braucht beide Hände und gibt +4. Rüste es aus.'},
  {id: 'verkaufen', st: S2, act: /^Verkaufen/, sell: ['Protzige Goldkette', 'Hörnerhelm'], when: () => tCtx() === 'kick' && tEq('Breitschwert der Angeberei') && (tHand('Protzige Goldkette') || tHand('Hörnerhelm')) && me().lvl < 3, done: () => me().lvl >= 3, only: () => false, hl: () => [tCard('Protzige Goldkette'), tCard('Hörnerhelm')].filter(Boolean),
    // Wer nur eins von beiden verkauft hat, verkauft das andere hinterher (das Gold bleibt im Goldbeutel)
    text: () => !tHand('Protzige Goldkette') ? `Das Gold der Goldkette liegt jetzt in deinem Goldbeutel. Für die nächste Stufe fehlt noch etwas: Tipp den Hörnerhelm an und verkauf ihn auch.`
      : !tHand('Hörnerhelm') ? `Das Gold des Hörnerhelms liegt jetzt in deinem Goldbeutel. Für die nächste Stufe fehlt noch etwas: Tipp die Goldkette an und verkauf sie auch.`
      : 'Goldkette und Hörnerhelm brauchst du gerade nicht. Gegenstände kannst du verkaufen: Je 1000 Gold bringen dir eine Stufe, der Rest kommt in deinen Goldbeutel. Tipp die Goldkette an, wähle „Verkaufen“ und markiere auch den Hörnerhelm.'},
  {id: 'tuer3', st: S2, when: () => tCtx() === 'kick' && S.turn === 1 && me().lvl >= 3, done: () => tCtx() !== 'kick', hl: () => '#act .btn.primary',
    text: 'Stufe 3, und das ganz ohne Kampf! Jetzt öffnest du die Tür.'},
  {id: 'raum', st: S2, when: () => tCtx() === 'trouble' && S.turn === 1, done: () => tCtx() !== 'trouble', only: o => o.v === 'loot', hl: tOpt(o => o.v === 'loot'),
    text: 'Kein Monster hinter der Tür. Dann durchsuchst du den Raum: Du ziehst eine Türkarte verdeckt auf die Hand.'},
  {id: 'elfwahl', st: S2, when: () => tCtx() === 'elfpick', done: () => tCtx() !== 'elfpick', only: o => o.v === 'a', hl: () => UI.prompt && UI.prompt.data && UI.prompt.data.a ? `#table [data-duid="${UI.prompt.data.a.uid}"]` : null,
    text: 'Als Elf hast du scharfe Augen: Du ziehst beim Durchsuchen 2 Karten und behältst die bessere. Nimm den Zauberer.'},
  {id: 'almosen', st: S2, cards: true, act: /Rucksack/, when: () => tCtx() === 'charity' && me().hand.length > handLimit(me()), done: () => tCtx() !== 'charity' || me().hand.length <= handLimit(me()), hl: () => '#act .btn.primary',
    text: 'Am Ende deines Zuges darfst du höchstens 5 Karten behalten. Was zu viel ist, bekommt der Spieler mit der niedrigsten Stufe, also Berta. Gegenstände kannst du vorher auch in den Rucksack legen, die zählen dann nicht mehr als Handkarten. Sonst gib 1 Karte ab.'},
  {id: 'ende2', st: S2, when: () => tCtx() === 'charity' && S.turn === 1, done: () => tCtx() !== 'charity', hl: () => '#act .btn.primary',
    text: 'Jetzt passt alles. Beende deinen Zug.'},
  {id: 'kampf3', st: S2, when: () => tFight() && S.turn === 2 && evalCombat(S.combat).win, done: () => !tFight(), hl: () => '#act .btn.primary',
    text: 'Mit Breitschwert bist du dem Rentner-Ritter klar überlegen. Besiege ihn, dann hast du Stufe 4.'},
  /* ---- Station 3: Zu stark! ---- */
  {id: 'hallo3', st: S3, ok: true, only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'Heute wird es ungemütlich. Ich zeige dir, was du tust, wenn ein Monster zu stark ist. Ziel ist Stufe 5.'},
  {id: 'fluch', st: S3, when: () => tCtx() === 'trouble' && S.log.some(e => /Pechsträhne/.test(e.t)), done: () => tCtx() !== 'trouble', only: o => o.v === 'loot', hl: tOpt(o => o.v === 'loot'),
    text: 'Pech gehabt! Einen Fluch, den du beim Öffnen der Tür aufdeckst, bekommst du selbst ab: eine Stufe weniger. Jetzt durchsuchst du noch den Raum.'},
  {id: 'verdeckt', st: S3, ok: true, cards: ['Windböe'], when: () => tCtx() && tHand('Windböe'), done: () => !tHand('Windböe'), hl: () => '.oc[data-opp="1"]',
    text: 'Verdeckt gezogene Flüche wirken nicht auf dich. Die Windböe kannst du jederzeit auf einen Gegner spielen: Zieh sie oben auf Berta, dann ist ihr Hörnerhelm weg. Du kannst sie dir aber auch aufheben.'},
  {id: 'trank', st: S3, act: /^Für unsere Seite/, when: () => tFight() && !evalCombat(S.combat).win && tHand('Trank der Tapferkeit'), done: () => !tHand('Trank der Tapferkeit') || !tFight(), only: () => false, hl: () => tCard('Trank der Tapferkeit'),
    text: 'Knapp daneben, und bei Gleichstand gewinnt immer das Monster. Einmal-Gegenstände wie der Trank wirken nur in diesem Kampf und können ihn drehen: Zieh den Trank auf deine Seite des Spielfelds.'},
  {id: 'golem', st: S3, when: () => tFight() && tMon('Bürokratie-Golem') && !evalCombat(S.combat).win, done: () => !tFight(), only: o => o.v === 'run', hl: tOpt(o => o.v === 'run'),
    text: 'Gegen den Bürokratie-Golem habt ihr auch zu zweit keine Chance. Wenn nicht mal Hilfe reicht, bleibt nur Weglaufen. Normalerweise würfelst du und brauchst eine 5 oder 6. Klappt es nicht, trifft dich, was unten auf dem Monster steht.'},
  {id: 'nebel', st: S3, when: () => tCtx() === 'run' && tHand('Nebelpulver'), done: () => tCtx() !== 'run', only: o => o.v === 'nebel', hl: tOpt(o => o.v === 'nebel'),
    text: 'Zum Glück hast du Nebelpulver. Damit entkommst du sicher, ohne zu würfeln.'},
  {id: 'hilfe', st: S3, when: () => tFight() && tMon('Troll unter der Autobahnbrücke') && !evalCombat(S.combat).win && S.combat.h == null, done: () => !tFight() || S.combat.h != null, only: o => o.v === 'help', hl: tOpt(o => o.v === 'help'),
    text: 'Den Troll schaffst du allein nicht. Dann holst du dir Hilfe: Bitte Berta, mitzukämpfen. Ihre Kampfstärke zählt dann mit, dafür teilt ihr die Schätze.'},
  {id: 'hilfewer', st: S3, noCancel: true, only: o => o.v === 1, when: () => tCtx() === 'helpWho', done: () => tCtx() !== 'helpWho', hl: tOpt(o => o.v === 1),
    text: 'Tipp auf Berta.'},
  {id: 'angebot', st: S3, noCancel: true, when: () => tCtx() === 'helpOffer', done: () => tCtx() !== 'helpOffer',
    text: 'Wie viele Schätze bietest du ihr an? Je mehr, desto eher sagt jemand ja. Berta hilft dir heute aber sowieso.'},
  {id: 'beute3', st: S3, when: () => tCtx() === 'loot', done: () => tCtx() !== 'loot', only: () => true, hl: () => '#table .loot-cards',
    text: 'Mit Helfer werden die Schätze offen gezogen. Berta hat geholfen, darum wählt sie zuerst, dann ihr abwechselnd. Tipp auf dem Tisch auf den Schatz, den du willst.'},
  {id: 'zusammen', st: S3, when: () => tFight() && S.combat.h != null && evalCombat(S.combat).win, done: () => !tFight(), hl: () => '#act .btn.primary',
    text: 'Zusammen seid ihr stärker als der Troll. Tipp auf „Monster besiegen“ und hol dir Stufe 4!'},
  {id: 'almosen3', st: S3, cards: true, act: /Rucksack/, when: () => tCtx() === 'charity' && me().hand.length > handLimit(me()) && tHand('Nebelpulver'), done: () => tCtx() !== 'charity' || me().hand.length <= handLimit(me()), hl: () => '#act .btn.primary',
    text: 'Du hast mehr als 5 Karten. Den Rest bekommt Berta, das kennst du schon. Das Nebelpulver behältst du aber, das brauchst du gleich noch.'},
  {id: 'sieg3', st: S3, when: () => tFight() && tMon('Schleimige Socke') && evalCombat(S.combat).win, done: () => !tFight(), hl: () => '#act .btn.primary',
    text: 'Weggelaufen ist nicht verloren: Du hast nur keine Stufe bekommen. Die Schleimige Socke schaffst du locker. Besiege sie und hol dir Stufe 5!'},
  /* ---- Station 5: Die Probepartie ---- */
  {id: 'p1', st: ['w0s5'], ok: 'Weiter', big: true, dim: true, step: [1, 3], only: () => false, when: () => S.turn === 1 && S.cur === 0,
    text: 'Deine Probepartie! Es geht bis Stufe 5, gegen Berta und Kalle. Diesmal sage ich dir nicht jeden Schritt an, du spielst ganz normal.'},
  {id: 'p2', st: ['w0s5'], ok: 'Weiter', big: true, dim: true, step: [2, 3], only: () => false, when: () => S.turn === 1 && S.cur === 0,
    text: 'Ein bisschen helfe ich dir aber: Du bekommst eine Zug-Empfehlung, und in den Notizen erkläre ich, welche Regel gerade greift. Das gibt es im Storymodus sonst nicht.'},
  {id: 'p3', st: ['w0s5'], ok: 'Los geht’s', spot: '#act, #hand', step: [3, 3], only: () => false, when: () => S.turn === 1 && S.cur === 0,
    text: 'Meine Empfehlung erkennst du am grünen „Tipp“: hier in der Leiste und oben auf Karten, die du jetzt spielen solltest. Folgen musst du nicht, aber es lohnt sich meistens. Im freien Spiel kannst du das in den Optionen einschalten.'},
  /* ---- Station 4: Alle gegen dich ---- */
  {id: 'hallo4', st: S4, ok: true, only: () => false, when: () => tCtx() === 'kick' && S.turn === 1,
    text: 'Kalle spielt mit, und der will gewinnen. Heute lernst du, wie man sich in Kämpfe einmischt. Ziel ist Stufe 5.'},
  {id: 'herausfordern', st: S4, cards: ['Wütender Gartenzwerg'], when: () => tCtx() === 'trouble' && tHand('Wütender Gartenzwerg'), done: () => tCtx() !== 'trouble', only: o => /^m\d+$/.test(String(o.v)), hl: () => '#act [data-dpick]',
    text: 'Kein Monster hinter der Tür? Dann darfst du eins von deiner Hand herausfordern. Der Wütende Gartenzwerg ist schwach: Fordere ihn heraus.'},
  {id: 'kalle', st: S4, when: () => S.cur === 1 && !S.combat, done: () => S.cur === 0 || !!S.combat,
    text: 'Jetzt ist Kalle dran. Pass gut auf, gleich darfst du mitmischen.'},
  {id: 'einmischen', st: S4, act: /^Auf /, when: () => tAsk('interfere') && tHand('Stinksauer'), done: () => !tHand('Stinksauer') || !tAsk('interfere'), only: () => false, hl: () => tCard('Stinksauer'),
    text: 'Kalle gewinnt gerade gegen den Rentner-Ritter. Mit Launen machst du fremde Monster stärker: Zieh „Stinksauer“ auf sein Monster, dann hat es +5.'},
  {id: 'weiter', st: S4, when: () => tAsk('interfere') && !tHand('Stinksauer'), done: () => !tAsk('interfere'), hl: () => '#act .btn.primary',
    text: 'Jetzt verliert Kalle! Tipp auf „Fertig, weiter“ und schau zu, was passiert.'},
  {id: 'winzig', st: S4, act: /^Auf /, when: () => tFight() && !evalCombat(S.combat).win && tHand('Winzig'), done: () => !tHand('Winzig') || !tFight(), only: () => false, hl: () => tCard('Winzig'),
    text: 'Der Bürokratie-Golem ist zu stark für dich. Launen darfst du auch in deinem eigenen Kampf spielen: „Winzig“ macht das Monster um 5 schwächer. Zieh die Karte aufs Spielfeld.'},
  {id: 'sieg4', st: S4, when: () => tFight() && S.turn >= 2 && evalCombat(S.combat).win, done: () => !tFight(), hl: () => '#act .btn.primary',
    text: 'Jetzt bist du stärker. Besiege den Golem und hol dir Stufe 5!'}
];
const tutLesson = () => TUT && TUT.cur ? TUT_LESSONS.find(l => l.id === TUT.cur) : null;
// Welche Aktion mit einer erlaubten Karte? Nur die, um die es in der Lektion geht (Ausrüsten statt Rucksack …)
function tutActOk(c, label, where) {
  if (!SCN || !SCN.tut || SCN.tutFree || !S || S.winner != null) return true;
  if (!tutCardOk(c)) return false;
  if ((where || 'hand') !== 'hand') return false;   // Ausrüstung, Rucksack, Volk, Klasse bleiben in der Einführung, wie sie sind
  const L = tutLesson(); if (!L) return false;
  if (L.act) return L.act.test(label);
  if (L.cards === true) return !/Verkaufen|Ablegen/.test(label);
  return !/Rucksack|Ablegen|Verkaufen|für das Monster|Für das Monster/.test(label);
}
// Verkaufen in der Einführung: nur, was die Lektion vorsieht
function tutSellOk(c) {
  if (!SCN || !SCN.tut || SCN.tutFree) return true;
  const L = tutLesson();
  return !!(L && L.sell && L.sell.includes(c.n));
}
function tutGate(q, ctx) {
  if (!SCN || !SCN.tut) return;
  const L = tutLesson(), strict = !SCN.tutFree;
  // Einführung: Bots nicht helfen (sonst könnte Kalle die Station gewinnen)
  if (strict && ctx === 'botHelp') { q.opts.forEach(o => { if (o.v === 'yes') o.dis = true; }); return; }
  if (strict && L && L.noCancel) q.opts.forEach(o => { if (o.v === 'x') o.dis = true; });   // Abbrechen würde aus der Lektion führen
  // Ohne eigene Vorgabe der Lektion: an den üblichen Stellen nur den Hauptknopf erlauben (Tür auf, Monster besiegen,
  // Raum durchsuchen, Fertig, Zug beenden), damit niemand vom geplanten Weg abweicht
  if (strict && (!L || !L.only) && ['kick', 'trouble', 'fight', 'interfere', 'charity', 'run'].includes(ctx)) {
    if (q.opts.some(o => o.kind === 'primary' && !o.dis)) q.opts.forEach(o => { if (o.kind !== 'ghost' && o.kind !== 'primary') o.dis = true; });
    return;
  }
  if (!L || !L.only) return;
  const was = q.opts.map(o => o.dis);
  q.opts.forEach(o => { if (o.kind !== 'ghost' && !L.only(o)) o.dis = true; });
  // Sicherheitsnetz: Im Kampf darf eine Lektion nie alle Wege versperren (sonst steckt man fest)
  if ((ctx === 'fight' || ctx === 'run') && !L.ok && !q.opts.some(o => o.kind !== 'ghost' && !o.dis) &&
      !me().hand.some(c => { try { return cardActions(c, 'hand').some(x => x.fn && !x.dis && tutActOk(c, x.l, 'hand')); } catch (e) { return false; } }))
    q.opts.forEach((o, i) => { o.dis = was[i]; });   // nur wenn auch keine erlaubte Karte mehr hilft
}
// In den Lektionen der Einführung darf man nur die Karten spielen, auf die Hilde gerade zeigt
// (oder die eine Lektion ausdrücklich freigibt). So kann niemand vom geplanten Weg abkommen.
function tutCardOk(c) {
  if (!SCN || !SCN.tut || !S || S.winner != null || !c) return true;
  const L = tutLesson(); if (!L) return !!SCN.tutFree;   // zwischen den Lektionen: Hand gesperrt (außer in der freien Probepartie)
  if (L.cards) return L.cards === true || L.cards.includes(c.n);
  const el = $(tCard(c.n)); if (!el) return false;
  return (L.hl ? [].concat(L.hl()) : []).filter(Boolean).some(h => typeof h === 'string' ? el.matches(h) : h === el);
}
function tutUpdate() {
  const box = $('#tutor'); if (!box) return;
  const on = SCN && SCN.tut && S && CUR === 'game' && S.winner == null;
  $$('.tut-hl').forEach(e => e.classList.remove('tut-hl'));
  if (!on) { box.hidden = true; return; }
  TUT = TUT || {fin: new Set(), cur: null};
  const was = TUT.cur;
  let L = tutLesson();
  if (L && (TUT.fin.has(L.id) || (L.done && L.done()))) { TUT.fin.add(L.id); L = null; TUT.cur = null; }
  // Passt eine Lektion nicht mehr (z. B. die Karte, um die es geht, ist weg), nicht daran hängen bleiben
  if (L && !L.ok && L.done && !SHEETS.length && S.cur === 0 && UI.prompt && !L.when()) { TUT.fin.add(L.id); L = null; TUT.cur = null; }
  if (!L) { L = TUT_LESSONS.find(l => (!l.st || l.st.includes(SCN.tut)) && !TUT.fin.has(l.id) && l.when()); if (L) TUT.cur = L.id; }
  if (TUT.cur !== was) render();   // Knöpfe im Dock neu sperren oder freigeben
  const dim = $('#tutdim');
  if (!L || (L.sheet && SHEETS.length)) {
    box.hidden = true; if (dim) dim.hidden = true;
    if (L && L.shl && SHEETS.length) { const e = L.shl(); if (e) e.classList.add('tut-hl'); }   // Hinweisrahmen im geöffneten Fenster
    return;
  }
  const okL = L.ok === true ? 'Verstanden' : L.ok;
  const dots = L.step ? `<span class="tsteps">${Array.from({length: L.step[1]}, (_, i) => `<i${i < L.step[0] ? ' class="on"' : ''}></i>`).join('')}</span>` : '';
  patch(box, `<img src="icons/portrait-hilde.png" alt=""><div class="tt"><b>Hilde</b><p>${esc(typeof L.text === 'function' ? L.text() : L.text)}</p>${okL || dots ? `<div class="tfoot">${okL ? `<button type="button" class="btn small${L.dim || L.spot ? ' primary' : ''}" data-tutok>${esc(okL)}</button>` : ''}${dots}</div>` : ''}</div>`);
  box.dataset.lesson = L.id; box.hidden = false; box.classList.toggle('big', !!L.big);
  if (dim) { dim.hidden = !(L.dim || L.spot); if (!dim.hidden) tutSpot(L); }
  if (L.hl) { let h = L.hl(); (Array.isArray(h) ? h : [h]).forEach(sel => { if (sel) $$(sel).forEach(e => e.classList.add('tut-hl')); }); }
  tutPlace(); clearTimeout(TUT.pt); TUT.pt = setTimeout(tutPlace, 500);   // nach Einblend-Animationen noch einmal
}
// Oben oder unten auf dem Spielfeld, je nachdem, wo nichts Wichtiges verdeckt wird (Kampfanzeige, Hervorgehobenes)
// Abdunkeln: alles außer dem erklärten Bereich (Loch mit großem Schatten); fängt Klicks ab
function tutSpot(L) {
  const dim = $('#tutdim'), hole = dim.firstElementChild;
  // Breite Ansicht: Gegner und eigene Leiste stehen woanders
  let spot = L.spot;
  if (spot && $('#app').classList.contains('pcg')) spot = spot.replace('#mebar', '#gme, #geq').replace('#opps', '#wopps').replace('#scr-game .topbar', '#gphase, #scr-game .gd-tools');
  else if (spot && LAYOUT) spot = spot.replace('#mebar', '#wme').replace('#opps', LAYOUT === 'pc' ? '#wopps' : '#opps');
  const els = spot ? $$(spot).filter(e => e.offsetParent) : [];
  if (!els.length) { Object.assign(hole.style, {left: '50%', top: '50%', width: '0px', height: '0px'}); dim.dataset.at = ''; return; }
  const rs = els.map(e => e.getBoundingClientRect()), pad = 6;
  const l = Math.min(...rs.map(r => r.left)) - pad, t = Math.min(...rs.map(r => r.top)) - pad, r = Math.max(...rs.map(r => r.right)) + pad, b = Math.max(...rs.map(r => r.bottom)) + pad;
  Object.assign(hole.style, {left: Math.max(2, l) + 'px', top: Math.max(2, t) + 'px', width: (Math.min(innerWidth - 2, r) - Math.max(2, l)) + 'px', height: (Math.min(innerHeight - 2, b) - Math.max(2, t)) + 'px'});
  dim.dataset.at = [t, b].join(',');
}
function tutPlace() {
  const box = $('#tutor'), t = $('#table'); if (!box || box.hidden || !t || !S) return;
  const L = tutLesson(), dim = $('#tutdim');
  // Breite Ansicht: Hildes Hinweis steht über der Spielfeld-Spalte, nicht über die ganze Breite
  if (LAYOUT) { const r = t.getBoundingClientRect(); Object.assign(box.style, {left: Math.round(r.left + r.width / 2) + 'px', width: Math.round(Math.min(560, r.width - 20)) + 'px'}); }
  else Object.assign(box.style, {left: '', width: ''});
  if (L && (L.dim || L.spot)) {
    if (dim && !dim.hidden) tutSpot(L);
    const bh = box.offsetHeight, at = dim && dim.dataset.at ? dim.dataset.at.split(',').map(Number) : null;
    let y;
    if (!at) y = (innerHeight - bh) / 2;
    else if ((at[0] + at[1]) / 2 > innerHeight / 2) y = Math.max(8, at[0] - bh - 12);   // Bereich unten: Hinweis darüber
    else y = Math.min(innerHeight - bh - 8, at[1] + 12);                                // Bereich oben: Hinweis darunter
    box.style.top = Math.round(y) + 'px'; return;
  }
  const tr = t.getBoundingClientRect(), bh = box.offsetHeight;
  const rects = els => [...els].map(e => e.getBoundingClientRect()).filter(r => r.height && r.bottom > tr.top && r.top < tr.bottom);
  const hard = rects([...$$('.tut-hl'), ...(S.combat ? $$('#table .hud') : [])]), soft = rects($$('#table .art-top'));   // Kampfanzeige muss frei bleiben, Monstername möglichst
  const top = tr.top + 6, bottom = Math.max(top, tr.bottom - bh - 6);
  const cands = [top, ...soft.map(r => r.bottom + 4), bottom];
  const ok = (y, list) => y >= top && y <= bottom && !list.some(r => r.top < y + bh && r.bottom > y);
  const y = cands.find(c => ok(c, [...hard, ...soft])) ?? cands.find(c => ok(c, hard)) ?? top;
  box.style.top = Math.round(y) + 'px';
}
window.addEventListener('resize', () => tutPlace());

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
(() => { const d = buildDecks(); buildCatalog([...d.door, ...d.tr]); })();
applySettings();
applyProfile();
setScreen('title');
{ let raf = 0; $('#scr-cards .content').addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; updFilterStuck(); }); }, {passive: true}); }
// Direkt ins Menü: Browser erlauben Ton erst nach der ersten Berührung, dann startet die Musik von selbst
{ const EV = ['pointerup', 'touchend', 'click', 'keydown'];
  const first = () => { Snd.unlock(); Snd.startMusic(); if (Snd.running()) EV.forEach(e => document.removeEventListener(e, first, true)); };
  EV.forEach(e => document.addEventListener(e, first, true)); }


/* ================= Regeln: Suche ================= */
function rulesFilter(q) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean), items = $$('#scr-rules details.rule');
  let any = false;
  items.forEach(d => { const txt = ((d.dataset.k || '') + ' ' + d.textContent).toLowerCase(), hit = words.every(w => txt.includes(w)); d.hidden = !hit; if (words.length) d.open = hit; any = any || hit; });
  const none = $('#scr-rules .rs-none'); if (none) none.hidden = any || !words.length;
}
document.addEventListener('input', e => { if (e.target && e.target.id === 'rules-q') { if (mq().pc.matches) renderRulesPC(); else rulesFilter(e.target.value); } });

/* ================= Optionen am PC: Karten mit Symbol, Testphase als breiter Streifen ================= */
const SET_ICON = {
  klang: '<path d="M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M18.5 6.5a7.5 7.5 0 0 1 0 11" />',
  spiel: '<rect x="4" y="5" width="10" height="14" rx="2" transform="rotate(-8 9 12)" /><rect x="10" y="5" width="10" height="14" rx="2" transform="rotate(8 15 12)" />',
  konto: '<circle cx="12" cy="8.5" r="3.5" /><path d="M5 19.5c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />',
  stand: '<path d="M6 4h10l3 3v13H6z M9 4v5h6V4 M9 14h7 M9 17h5" />',
  test: '<path d="M10 3h4 M10.5 3v6L5 19a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5.5-10V3 M7.5 15h9" />',
  about: '<path d="M6 9h9v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z M15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2 M9 12v5 M12 12v5 M6 9c-.4-2 1-3.6 2.8-3.4.7-1.3 2.5-1.6 3.6-.6 1.4-.4 2.8.6 2.6 2.2" />'
};
function settingsPC() {
  const box = $('#scr-settings .content'); if (!box || box.__pc) return; box.__pc = true;
  [['s-klang', 'klang'], ['s-spiel', 'spiel'], ['s-stand', 'stand'], ['s-test', 'test'], ['about', 'about'], ['s-konto', 'konto']].forEach(([c, k]) => {
    const h = box.querySelector(`.${c} > h3.lbl`); if (!h || h.querySelector('.set-ic')) return;
    const img = {klang: 'set-klang', spiel: 'set-spiel', konto: 'set-konto', about: 'set-stammtisch'}[k];
    h.insertAdjacentHTML('afterbegin', img ? `<img class="set-img" src="icons/${img}.png" alt="">` : `<span class="set-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${SET_ICON[k]}</svg></span>`);
  });
  // Stammtisch statt „Über die App“: Gemeinschaft, Kanäle, Version und Rechtliches (Installieren läuft über den Play Store)
  const abp = box.querySelector('.about'); if (abp) {
    abp.querySelector('h3.lbl').lastChild.textContent = 'Stammtisch';
    [...abp.children].forEach(x => { if (!x.matches('h3')) x.classList.add('set-old'); });
    abp.insertAdjacentHTML('beforeend', `<div class="set-club"><p>Plundo ist ein Hobbyprojekt und wächst mit jeder Welt. Eine Idee für eine Karte, Lob oder einen Fehler gefunden? Dann setz dich zu uns an den Stammtisch.</p>` +
      `<div class="set-links"><button type="button" class="set-link dc" data-soon="Der Stammtisch auf Discord öffnet bald."><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 7.5c2.4-.7 4.6-.7 7 0M7 17c3.2 1.3 6.8 1.3 10 0M7.2 6.6C5.4 9.2 4.6 12 4.8 15.6c1.4 1.2 3 1.9 4.6 2.2l1-1.7M16.8 6.6c1.8 2.6 2.6 5.4 2.4 9-1.4 1.2-3 1.9-4.6 2.2l-1-1.7" /><circle cx="9.5" cy="12.5" r="1.2" /><circle cx="14.5" cy="12.5" r="1.2" /></svg><span><b>Discord</b><small>Bald</small></span></button>` +
      `<a class="set-link web" href="https://plundo.eu" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></svg><span><b>plundo.eu</b><small>Neuigkeiten</small></span></a></div>` +
      `<p class="set-foot">Version ${APP_VERSION} · <a href="../datenschutz.html">Datenschutz</a> · <a href="../impressum.html">Impressum</a></p></div>`);
  }
  // Klang und Bild: „Effekte reduzieren“ wandert zum Klang, Spielstand in die Konto-Karte
  const kl = box.querySelector('.s-klang'), red = box.querySelector('[data-toggle="reduce"]');
  if (kl && red) { kl.querySelector('h3.lbl').lastChild.textContent = 'Klang und Bild'; kl.appendChild(red.closest('.trow')); }
  const ko = box.querySelector('.s-konto'), st = box.querySelector('.s-stand');
  if (ko && st) { const d = document.createElement('div'); d.className = 'set-save'; d.innerHTML = '<span class="set-sub">Laufende Partie</span>'; [...st.children].filter(x => !x.matches('h3')).forEach(x => d.appendChild(x)); ko.appendChild(d); st.hidden = true; ko.querySelector('h3.lbl').lastChild.textContent = 'Konto und Spielstand'; }
  const sub = (k, t) => { const r = box.querySelector(`[data-toggle="${k}"]`), sp = r && r.closest('.trow').querySelector('span'); if (sp && !sp.querySelector('small')) sp.insertAdjacentHTML('beforeend', `<small>${t}</small>`); };
  sub('advice', 'Markiert, welcher Schritt sich gerade lohnt.'); sub('coach', 'Erklärt passende Regeln in Hinweisen und Notizen.');
  sub('music', 'Jede Welt und jeder Tisch hat eigene Musik.'); sub('sfx', 'Karten, Würfel, Münzen und Kampf.');
  const tp = box.querySelector('.s-test'); if (tp) {
    tp.querySelector('h3.lbl').insertAdjacentHTML('beforeend', '<em class="set-badge">verschwindet zum Release</em>');
    const kids = [...tp.children].filter(x => !x.matches('h3'));
    const grp = (a, b, cls) => { const d = document.createElement('div'); d.className = 'tp-g ' + cls; kids.slice(a, b).forEach(x => d.appendChild(x)); tp.appendChild(d); };
    grp(0, 3, 'g1'); grp(3, 6, 'g2'); grp(6, 9, 'g3'); grp(9, 10, 'g4');
  }
  renderAcctCard();
}
/* ================= Regeln am PC: ein Kapitel pro Seite, zu jeder Regel ein Bild =================
   Der Text kommt weiter aus rules.html (dieselben Regeln wie am Handy), hier stehen nur die Bilder dazu.
   Bild-Kürzel: c:Karte (echte Karte, anklickbar), tuer/schatz (Kartenrücken), i:Bild, wide:breites Bild,
   p:Porträt, me (dein Porträt), d:Würfelzahl, ph:Phase, vs:a:b (Stärkevergleich), x:Text (kleines Schild) */
const RULES_PC = [
  {ic: 'i:icons/muenze-sieg.png', hero: ['tuer', 'c:Drache des Montagmorgens', 'schatz'],
    v: [['i:icons/muenze-sieg.png', 'x:Stufe 10'], ['tuer', 'c:Wütender Gartenzwerg'], ['c:Rostiges Schwert', 'c:Elf'], ['tuer', 'schatz', 'x:je 4']]},
  {ic: 'ph:tuer', hero: ['tuer'],
    v: [['ph:tuer', 'tuer'], ['ph:aerger', 'c:Vampir-Kaninchen'], ['ph:pluendern', 'tuer'], ['ph:gabe', 'x:max. 5'], ['sl:rucksack']]},
  {ic: 'i:icons/wert-kampf.png', hero: ['c:Rostiges Schwert', 'c:Troll unter der Autobahnbrücke'],
    v: [['c:Topfhelm mit Delle', 'c:Trank der Tapferkeit'], ['c:Schwarm Stechmücken', 'c:Stinksauer'], ['vs:7:7'], ['i:icons/truhe-gold-auf.png', 'schatz'], ['c:Schleimige Socke', 'c:Übellaunige Möwe']]},
  {ic: 'p:zwerg', hero: ['me', 'p:zwerg'],
    v: [['me', 'p:zwerg'], ['me', 'i:icons/muenze-voll.png'], ['c:Gusseiserne Bratpfanne', 'c:Nebelpulver'], ['c:Elf', 'c:Schwarm Stechmücken'], ['i:icons/wert-weglaufen.png']]},
  {ic: 'c:Stinksauer', hero: ['c:Riesenhaft', 'c:Hinterhalt', 'c:Stinkbombe'],
    v: [['p:kriegerin', 'p:zauberer', 'p:koboldin'], ['c:Stinksauer', 'c:Winzig'], ['c:Trank der Tapferkeit', 'c:Riesenböller'], ['c:Hinterhalt', 'c:Vampir-Kaninchen'], ['c:Pechsträhne'], ['c:Flasche Drachenschnaps']]},
  {ic: 'i:icons/wert-weglaufen.png', hero: ['d:5', 'c:Nebelpulver'],
    v: [['d:5', 'd:6'], ['c:Schnelle Latschen'], ['c:Hydra mit Migräne'], ['c:Nebelpulver'], ['c:Drache des Montagmorgens'], ['d:1', 'x:Stufe 1']]},
  {ic: 'i:icons/icon-rucksack.png', hero: ['c:Hörnerhelm', 'c:Glitzer-Plattenrüstung', 'c:Schnelle Latschen'],
    v: [['slots'], ['c:Riesenhammer', 'c:Zwerg'], ['sl:rucksack'], ['c:Topfhelm mit Delle', 'c:Hörnerhelm'], ['c:Elfendolch', 'c:Elf'], ['c:Glitzer-Plattenrüstung']]},
  {ic: 'i:icons/truhe-gold-zu.png', hero: ['c:Protzige Goldkette', 'i:icons/truhe-gold-auf.png'],
    v: [['c:Protzige Goldkette'], ['i:icons/truhe-gold-zu.png', 'x:1.000 Gold = 1 Stufe'], ['i:icons/truhe-gold-klein.png'], ['i:icons/muenze-sieg.png'], ['c:Kobold', 'c:Hehler']]},
  {ic: 'c:Regelheft gelesen', hero: ['c:Würfel angehaucht', 'c:Snacks mitgebracht'],
    v: [['c:Regelheft gelesen'], ['c:Pizza für alle bestellt', 'x:bis Stufe 9'], ['i:icons/st-boss.png', 'i:icons/muenze-sieg.png']]},
  {ic: 'c:Pechsträhne', hero: ['c:Rost', 'c:Taschendieb-Gnom'],
    v: [['tuer', 'c:Pechsträhne'], ['c:Windböe'], ['c:Rost'], ['c:Glücksamulett']]},
  {ic: 'c:Lich mit Rückenschmerzen', split: true, hero: ['c:Lich mit Rückenschmerzen'],
    v: [['c:Zwerg', 'c:Krieger'], ['tuer', 'schatz', 'x:ablegen'], ['p:kriegerin', 'p:zauberer'], ['tuer', 'schatz', 'x:je 4']]},
  {ic: 'c:Elf', hero: ['c:Elf', 'c:Zwerg', 'c:Kobold'],
    v: [['wide:art/rasse-mensch.webp'], ['c:Elf'], ['c:Zwerg'], ['c:Kobold'], ['c:Krieger'], ['c:Zauberer'], ['c:Hehler'], ['c:Exorzist'], ['c:Pirat']]},
  {ic: 'p:hilde', hero: ['p:hilde'],
    v: [['c:Glitzer-Plattenrüstung'], ['c:Hydra mit Migräne'], ['c:Stinksauer', 'c:Trank der Tapferkeit'], ['sl:rucksack'], ['me', 'p:zwerg', 'x:Beute?']]}
];
const RP_PHASE = {tuer: ['phase-tuer', 'Tür öffnen'], aerger: ['phase-aerger', 'Ärger suchen'], pluendern: ['phase-pluendern', 'Raum durchsuchen'], gabe: ['phase-gabe', 'Abgabe']};
let RP_CH = 0, RP_DATA = null;
// Kapitel aus rules.html lesen: jeder Absatz, jeder Listenpunkt und jede Tabellenzeile wird eine Regel
function rulesPCData() {
  if (RP_DATA) return RP_DATA;
  RP_DATA = $$('#scr-rules details.rule').map((d, i) => {
    const conf = RULES_PC[i] || {v: []}, pts = [];
    d.querySelectorAll('.rule-body > *').forEach(el => {
      if (el.matches('p')) {
        if (conf.split && !el.classList.contains('hint')) el.innerHTML.split(/(?<=[.;])\s+(?=[A-ZÄÖÜ])/).forEach(h => pts.push({h}));
        else pts.push({h: el.innerHTML, hint: el.classList.contains('hint')});
      } else if (el.matches('ol,ul')) el.querySelectorAll(':scope > li').forEach(li => pts.push({h: li.innerHTML.replace(/^<div>|<\/div>$/g, '')}));
      else if (el.matches('table')) el.querySelectorAll('tbody tr').forEach(tr => pts.push({h: `<b>${tr.cells[0].innerHTML}:</b> ${tr.cells[1].innerHTML}`}));
    });
    pts.forEach((p, j) => { p.v = conf.v[j] || []; p.t = p.h.replace(/<[^>]+>/g, '').toLowerCase(); });
    return {title: d.querySelector('summary').textContent, k: (d.dataset.k || '').toLowerCase(), ic: conf.ic, hero: conf.hero || [], pts};
  });
  return RP_DATA;
}
function rpTok(t) {
  const i = t.indexOf(':'), k = i < 0 ? t : t.slice(0, i), v = i < 0 ? '' : t.slice(i + 1);
  switch (k) {
    case 'c': { const p = POOL.find(x => x.tpl.n === v); return p ? cardMini(p.tpl, {cname: true}) : ''; }
    case 'tuer': return '<span class="rp-back"><img src="art/ruecken-tuer.webp" alt="Türkarte"></span>';
    case 'schatz': return '<span class="rp-back"><img src="art/ruecken-schatz.webp" alt="Schatzkarte"></span>';
    case 'i': return `<img class="rp-ic" src="${v}" alt="">`;
    case 'wide': return `<img class="rp-wide" src="${v}" alt="">`;
    case 'p': return `<img class="rp-face" src="icons/portrait-${v}.png" alt="">`;
    case 'me': return `<img class="rp-face" src="${myPortrait()}" alt="Du">`;
    case 'd': return `<img class="rp-die" src="icons/wuerfel-${v}.png" alt="Würfel ${v}">`;
    case 'ph': { const [f, l] = RP_PHASE[v]; return `<span class="rp-ph"><img src="icons/${f}.png" alt=""><small>${l}</small></span>`; }
    case 'vs': { const [a, b] = v.split(':'); return `<span class="rp-vs"><span><img src="icons/wert-kampf.png" alt=""><b>${a}</b></span><i>=</i><span class="m"><b>${b}</b><small>Monster</small></span></span>`; }
    case 'x': return `<span class="rp-x">${esc(v)}</span>`;
    case 'slots': return `<span class="rp-slots">${['kopf', 'ruestung', 'schuhe', 'haende'].map(s => `<img src="icons/icon-${s}.png" alt="">`).join('')}</span>`;
    case 'sl': return `<span class="rp-sl"><img src="icons/icon-${v}.png" alt=""></span>`;
  }
  return '';
}
function rpIcon(t) {
  const i = t.indexOf(':'), k = t.slice(0, i), v = t.slice(i + 1);
  const src = k === 'c' ? ART[v] : k === 'p' ? `icons/portrait-${v}.png` : k === 'ph' ? `icons/${RP_PHASE[v][0]}.png` : v;
  return `<img class="rt-ic${k === 'c' || k === 'p' ? ' art' : ''}" src="${src}" alt="">`;
}
const rpMark = (h, words) => !words.length ? h : h.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, txt) => tag || txt.replace(new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi'), '<mark>$1</mark>'));
const rpRow = (p, words) => `<article class="rp-pt${p.hint ? ' hint' : ''}"><div class="rp-vis n${p.v.length}">${p.v.map(rpTok).join('')}</div><div class="rp-txt">${rpMark(p.h, words)}</div></article>`;
function renderRulesPC() {
  const scr = $('#scr-rules'), box = scr && scr.querySelector('.content.rules'); if (!box) return;
  let main = box.querySelector('.rules-pc'), side = box.querySelector('.rp-side');
  if (!main) { main = document.createElement('div'); main.className = 'rules-pc'; box.appendChild(main); }
  if (!side) {
    side = document.createElement('div'); side.className = 'rp-side';
    side.innerHTML = `<div class="rp-tiles"><button type="button" class="rp-tile" data-go="tutorial"><img src="icons/portrait-hilde.png" alt=""><b>Probespiel</b><span>Hilde erklärt jeden Schritt</span></button>` +
      `<button type="button" class="rp-tile quiz" data-go="quiz"><img src="${ART['Regelheft gelesen']}" alt=""><b>Regel-Quiz</b><span>Zehn Fragen zum Testen</span></button></div>`;
    box.querySelector('.rules-side').prepend(side);
    const toc = document.createElement('nav'); toc.className = 'rp-toc'; toc.setAttribute('aria-label', 'Kapitel'); box.querySelector('.rules-side').appendChild(toc);
  }
  const data = rulesPCData(), q = ($('#rules-q') || {}).value || '', words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hitCh = ch => words.every(w => ch.k.includes(w) || ch.title.toLowerCase().includes(w) || ch.pts.some(p => p.t.includes(w)));
  patch(box.querySelector('.rp-toc'), data.map((ch, i) => `<button type="button" class="${i === RP_CH && !words.length ? 'on' : ''}${words.length && !hitCh(ch) ? ' dim' : ''}" data-rch="${i}"><span class="rt-n">${i + 1}</span>${rpIcon(ch.ic)}<span class="rt-t">${esc(ch.title)}</span></button>`).join(''));
  let html;
  if (words.length) {
    const groups = data.map((ch, i) => {
      if (!hitCh(ch)) return '';
      let pts = ch.pts.filter(p => words.every(w => p.t.includes(w)));
      if (!pts.length) pts = ch.pts.filter(p => words.some(w => p.t.includes(w)));
      if (!pts.length) pts = ch.pts.slice(0, 2);
      return `<section class="rp-hit"><button type="button" class="rp-hit-h" data-rch="${i}">${rpIcon(ch.ic)}<b>${esc(ch.title)}</b><span>Ganzes Kapitel lesen ›</span></button>${pts.map(p => rpRow(p, words)).join('')}</section>`;
    }).join('');
    html = `<div class="rp-page rp-search"><header class="rp-head"><div><small>Suche</small><h2>„${esc(q.trim())}“</h2></div></header>` +
      (groups || `<p class="rp-none"><img src="icons/portrait-hilde.png" alt="">Dazu steht hier nichts. Versuch ein anderes Wort, zum Beispiel Rucksack, Gleichstand oder Kobold.</p>`) + '</div>';
  } else {
    const ch = data[RP_CH], prev = data[RP_CH - 1], next = data[RP_CH + 1];
    html = `<div class="rp-page"><header class="rp-head"><div><small>Kapitel ${RP_CH + 1} von ${data.length}</small><h2>${esc(ch.title)}</h2></div><div class="rp-hero n${ch.hero.length}">${ch.hero.map(rpTok).join('')}</div></header>` +
      ch.pts.map(p => rpRow(p, [])).join('') +
      `<nav class="rp-nav">${prev ? `<button type="button" class="rp-go" data-rch="${RP_CH - 1}"><small>‹ Zurück</small><b>${esc(prev.title)}</b></button>` : '<span></span>'}` +
      (next ? `<button type="button" class="rp-go nx" data-rch="${RP_CH + 1}"><small>Weiter ›</small><b>${esc(next.title)}</b></button>` : `<button type="button" class="rp-go nx" data-go="quiz"><small>Alles gelesen?</small><b>Zum Regel-Quiz ›</b></button>`) + '</nav></div>';
  }
  if (patch(main, html)) main.scrollTop = 0;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-rch]'); if (!b || !mq().pc.matches) return;
  RP_CH = +b.dataset.rch; const q = $('#rules-q'); if (q) q.value = '';
  renderRulesPC();
});

/* ================= Breite Ansicht (Tablet quer, PC) ================= */
// var statt let/const: applyLayout läuft schon beim Start, bevor dieser Teil der Datei ausgeführt ist
var LAYOUT = '';
// PC-Ansicht: volle Größe ab 1400 × 760, darunter (ab Tablet-Größe) verkleinert per Zoom (siehe index.html). Die alte Tablet-Ansicht greift dann nicht mehr.
function mq() {
  if (window.__MQ) return window.__MQ;
  const pcN = matchMedia('(min-width: 1400px) and (min-height: 760px)'), tabN = matchMedia('(min-width: 900px) and (min-height: 560px) and (orientation: landscape)');
  const zoomed = () => (window.__ZOOM || 1) !== 1;
  const wrap = (fn, nat) => { const L = []; let last = fn(); const chk = () => { const v = fn(); if (v !== last) { last = v; L.forEach(f => f({matches: v})); } };
    nat.addEventListener('change', chk); addEventListener('resize', chk); return {get matches() { return fn(); }, addEventListener: (t, f) => L.push(f), removeEventListener: (t, f) => { const i = L.indexOf(f); if (i >= 0) L.splice(i, 1); }}; };
  return (window.__MQ = {pc: wrap(() => pcN.matches || zoomed(), pcN), tab: wrap(() => tabN.matches && !pcN.matches && !zoomed(), tabN), hover: matchMedia('(hover: hover) and (pointer: fine)')});
}
function applyLayout() {
  const M = mq(), MQ_PC = M.pc, MQ_TAB = M.tab;
  const mode = CUR === 'game' ? (MQ_PC.matches ? 'pc' : MQ_TAB.matches ? 'tab' : '') : '';
  const app = $('#app'); if (!app) return;
  const wide = MQ_TAB.matches || MQ_PC.matches;
  app.classList.toggle('wide', wide);
  document.documentElement.classList.toggle('wide-game', !!mode);
  document.documentElement.classList.toggle('wide-any', wide);
  const wasMenu = document.documentElement.classList.contains('wide-menu');
  document.documentElement.classList.toggle('wide-menu', wide && CUR !== 'game');
  if (wasMenu !== document.documentElement.classList.contains('wide-menu') && CUR === 'title' && typeof renderTitle === 'function') renderTitle();
  if (typeof renderWnav === 'function') renderWnav();
  if (HUBBOT && !mq().pc.matches) hubBotsOff();
  dockSheet();
  const g = mode === 'pc' && PCG_ON(); app.classList.toggle('pcg', g); document.documentElement.classList.toggle('pcg-on', g);
  if (mode === LAYOUT) return;
  LAYOUT = mode; app.classList.toggle('lay-pc', mode === 'pc'); app.classList.toggle('lay-tab', mode === 'tab');
  if (S && CUR === 'game') render();
}
[mq().pc, mq().tab].forEach(m => m.addEventListener('change', () => { applyLayout(); render(); }));
function oppWideHTML(p) {
  const C = S.combat, role = C && (C.f === p.id ? 'kämpft' : C.h === p.id ? 'hilft' : ''), turn = S.cur === p.id && S.winner == null;
  const tiny = c => cardMini(c, {where: 'opp', size: 'tiny', extra: !usable(p, c) ? 'inactive' : ''});
  const by = sl => p.eq.filter(i => i.slot === sl);
  const empty = (sl, l) => `<span class="wo-empty" title="${l}"><img src="${ICON.slot[sl]}" alt="${l}"></span>`;
  const one = (sl, l) => { const a = by(sl); return a.length ? a.map(tiny).join('') : empty(sl, l); };
  const hands = by('hand'); const handHTML = hands.length ? hands.map(tiny).join('') : empty('hand', 'Hände');
  const ident = (c, kind) => c ? cardMini(c, {where: 'opp', size: 'tiny'}) : kind === 'race' ? `<span class="wo-empty txt" title="Volk">Mensch</span>` : `<span class="wo-empty txt" title="Klasse">–</span>`;
  return `<div class="wopp${turn ? ' turn' : ''}${p.dead ? ' dead' : ''}${bgAttr(bgOf(p), true) || '" style="'};--fc:${frameOf(p)[2]}" data-oppw="${p.id}">` +
    `<button type="button" class="wo-head" data-opp="${p.id}" aria-label="${esc(p.name)}, Stufe ${p.lvl}">` +
    `<span class="pt"><img src="${portrait(p)}" alt=""><span class="lvb">${p.lvl}</span></span>` +
    `<span class="wo-t"><b>${esc(p.name)}</b>${role ? `<span class="tag red">${role}</span>` : p.dead ? '<span class="tag">tot</span>' : turn ? '<span class="tag">am Zug</span>' : ''}` +
    `<span class="os"><span title="Kampfstärke"><img src="${ICON.kampf}" alt="">${power(p)}</span><span title="Weglaufen"><img src="${ICON.run}" alt="">${sign(runBonus(p))}</span><span title="Handkarten"><img src="${ICON.hand}" alt="">${p.hand.length}</span><span title="Rucksack"><img src="${ICON.slot.pack}" alt="">${p.pack.length}/${packLimit(p)}</span>${p.gold ? `<span class="gold" title="Goldbeutel">${fmt(p.gold)} G</span>` : ''}${p.spore ? `<span class="neg" title="Sporenwolke">−${p.spore}</span>` : ''}</span></span></button>` +
    `<div class="wo-eq">${ident(p.race, 'race')}${ident(p.cls, 'cls')}<i class="wo-sep"></i>${one('kopf', 'Kopf')}${one('ruestung', 'Rüstung')}${handHTML}${one('schuhe', 'Schuhe')}${by('none').map(tiny).join('')}</div></div>`;
}
function fightWideHTML() {
  const C = S.combat; if (!C) return '';
  const v = SHEET_VIEWS.parts(); if (!v) return '';
  return `<div class="wpanel wfight-in"><h4 class="wp-h">Kampf</h4>${v.body}</div>`;
}
function renderWide() {
  if ($('#app').classList.contains('pcg')) { renderPCG(); return; }
  const pc = LAYOUT === 'pc', p = me();
  // Gegner: auf dem PC mit voller Ausrüstung, auf dem Tablet als Liste links
  if (pc) patch($('#wopps'), S.players.filter(x => !x.human).map(oppWideHTML).join(''));
  const items = S.log.filter(e => UI.coach || e.kind !== 'rule').slice(0, 80);
  patch($('#wlog'), `<div class="wpanel"><h4 class="wp-h">Spielleiter-Notizen</h4><ul class="loglist">${items.map(e => `<li class="l-${e.kind}">${e.kind === 'rule' ? '<b>Regel:</b> ' : ''}${linkify(e.t)}</li>`).join('')}</ul></div>`);
  W.logSeen = S.log.length;
  patch($('#wfight'), fightWideHTML());
  const free = isFree();
  patch($('#wme'), `<div class="wpanel wme-in">${heroHead(p)}<div class="hbody">${heroStats(p)}${heroAbil(p)}${heroDoll(p, true)}${heroPack(p, true)}` +
    (free ? sellBtnHTML(p) : '') + `</div></div>`);
  const pv = W.hoverUid != null && pc && mq().hover.matches ? findCard(W.hoverUid) : null;
  patch($('#wprev'), pv ? `<div class="wprev-in">${cardBig(pv)}</div>` : '');
  const dD = S.doorDisc[S.doorDisc.length - 1], dT = S.trDisc[S.trDisc.length - 1];
  patch($('#wpile'), pc && (dD || dT) ? `<span class="wp-lbl">Zuletzt abgelegt</span><span class="wp-cards">${[dD, dT].filter(Boolean).map(c => cardMini(c, {inert: true, size: 'tiny'})).join('')}</span>` : '');
}
/* ================= Partie am PC (neuer Aufbau, Entwurf mit ?entwurf) =================
   Oben die Menüleiste, darunter die Gegner als Schilder im Format ihrer Hintergründe, in der Mitte der Tisch mit den Phasen links
   und den Stapeln rechts, am unteren Tischrand deine Ausrüstung. Rechts Notizen, Kampfrechnung und die Knöpfe; unten dein Schild und die Hand. */
const PCG_ON = () => true;   // neue Partie am PC (früher nur mit ?entwurf)
const PCGX = () => { const a = document.getElementById('app'); return !!a && a.classList.contains('pcg'); };
function seatHTML(p) {
  const C = S.combat, role = C && (C.f === p.id ? 'kämpft' : C.h === p.id ? 'hilft' : ''), turn = S.cur === p.id && S.winner == null, bx = bgOf(p);
  const tag = role ? `<span class="gs-tag red">${role}</span>` : p.dead ? '<span class="gs-tag">tot</span>' : turn ? '<span class="gs-tag">am Zug</span>' : '';
  const bgu = bx && bx[2] ? new URL(bgSrc(bx), document.baseURI).href : p.human ? new URL('art/kulisse-staedtchen.webp', document.baseURI).href : '';
  const style = `--fc:${frameOf(p)[2]}${bgu ? `;--bg:url('${bgu}');--bgp:${(bx && bx[2] && bx[4]) || '50% 50%'}` : ''}`;
  return `<button type="button" class="gseat${turn ? ' turn' : ''}${p.dead ? ' dead' : ''}${p.human ? ' me' : ''}" ${p.human ? 'data-go="equip"' : `data-opp="${p.id}"`} style="${style}" aria-label="${p.human ? 'Du' : esc(p.name)}, Stufe ${p.lvl}">` +
    `<span class="gs-pt">${bigPortrait(p)}<i>${p.lvl}</i></span>` +
    (lastingCurses(p).length ? `<span class="gs-curse" data-cursetip="${p.id}">Verflucht</span>` : '') +
    `<span class="gs-t"><span class="gs-n"><b>${p.human ? 'Du' : esc(p.name)}</b>${tag}</span>` +
    `<span class="gs-st"><span title="Kampfstärke"><img src="${ICON.kampf}" alt="">${power(p)}</span><span title="Weglaufen"><img src="${ICON.run}" alt="">${sign(runBonus(p))}</span>` +
    `<span title="Handkarten"${p.human && p.hand.length > handLimit(p) ? ' class="warn"' : ''}><img src="${ICON.hand}" alt="">${p.hand.length}${p.human ? '/' + handLimit(p) : ''}</span><span title="Goldbeutel: ${fmt(p.gold || 0)} Gold"${p.gold ? ' class="gold"' : ''}><img src="${ICON.gold}" alt="">${fmt(p.gold || 0)}</span></span>` +
    `<span class="gs-dots" aria-hidden="true">${Array.from({length: WINLVL()}, (_, i) => `<em class="${i < p.lvl ? 'on' : ''}"></em>`).join('')}</span>` +
    `</span></button>`;
}
// Tempo „Manuell“: Knopf zum Weiterklicken, solange ein Bot auf dich wartet (auch Leertaste oder Enter am PC)
function showStep() {
  let b = $('#stepbtn');
  if (!UI.step) { if (b) b.hidden = true; return; }
  // PC: unten rechts im Spielfeld, im freien Feld rechts neben Rucksack und Verkaufen
  const host = (PCGX() && $('#geq')) || $('#scr-game');
  if (!b) { b = document.createElement('button'); b.type = 'button'; b.id = 'stepbtn'; b.className = 'btn primary stepbtn'; }
  if (b.parentNode !== host) host.appendChild(b);
  const p = S && S.players[S.cur];
  b.innerHTML = `<span><small>${p ? esc(p.name) + ' ist dran' : 'Bots'}</small>Weiter</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;
  b.hidden = false;
}
document.addEventListener('click', e => { if (e.target.closest('#stepbtn') && UI.step) { buzz(6); UI.step(); } });
document.addEventListener('keydown', e => {
  if (!UI.step || CUR !== 'game' || e.repeat) return;
  if ((e.key === ' ' || e.key === 'Enter') && !e.target.closest('input,textarea,select') && !SHEETS.length) { e.preventDefault(); UI.step(); }
});
// Flüche, die gerade an einem Spieler hängen (bleiben über den Zug hinaus)
function lastingCurses(p) {
  const nm = k => (p.curses && p.curses[k]) || {chill: 'Kellerkälte', spore: 'Sporenwolke', sun: 'Sonnenbrand', sand: 'Sand in der Badehose'}[k];
  const out = [];
  if (p.chill) out.push({n: nm('chill'), t: `Im nächsten Kampf −${p.chill}.`});
  if (p.spore) out.push({n: nm('spore'), t: `−${p.spore} in jedem Kampf, auch als Helfer, bis ein Kampf gewonnen ist.`});
  if (p.sun) out.push({n: nm('sun'), t: '−1 in jedem Kampf und niemand hilft, bis ein Kampf gewonnen ist. Sonnencreme hilft sofort.'});
  if (p.sand) out.push({n: nm('sand'), t: 'Weglaufen −2, bis zum nächsten Stufenaufstieg.'});
  return out;
}
function curseTipHTML(p) {
  return lastingCurses(p).map(c => { const tp = POOL.find(x => x.tpl.n === c.n); return `<div class="ct-row">${tp ? cardMini(tp.tpl, {inert: true}) : ''}<span><b>${esc(c.n)}</b>${esc(c.t)}</span></div>`; }).join('');
}
document.addEventListener('mouseover', e => {
  const b = e.target.closest && e.target.closest('[data-cursetip]'); let tip = $('#cursetip');
  if (!b) { if (tip) tip.hidden = true; return; }
  const p = S && S.players.find(x => String(x.id) === b.dataset.cursetip); if (!p) return;
  if (!tip) { tip = document.createElement('div'); tip.id = 'cursetip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
  tip.innerHTML = `<small>${p.human ? 'Dich verfolgt' : esc(p.name) + ' verfolgt'}</small>${curseTipHTML(p)}`; tip.hidden = false;
  const r = b.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
  let x = Math.min(window.innerWidth - w - 10, Math.max(10, r.right - w)), y = r.bottom + 8;
  if (y + h > window.innerHeight - 10) y = r.top - h - 8;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
});
function renderPCG() {
  const p = me(), mine = S.cur === 0 && S.winner == null;
  patch($('#wopps'), S.players.filter(x => !x.human).map(seatHTML).join(''));
  patch($('#gme'), seatHTML(p));
  // Phasen deines Zugs links am Tisch
  const who = S.winner != null ? 'Spiel vorbei' : mine ? 'Dein Zug' : `${esc(P(S.cur).name)} ist am Zug`;
  const td = tideNow();
  patch($('#gphase'), `<span class="gp-h">${who} · Runde ${S.turn}</span>${td ? `<span class="gp-tide ${td}" title="${td === 'flut' ? 'Flut: Meeresmonster +3, Weglaufen +1' : 'Ebbe: Raum durchsuchen bringt einen Schatz'}"><i class="tb-tide ${td}"></i>${td === 'flut' ? 'Flut' : 'Ebbe'}<small>${td === 'flut' ? 'Meeresmonster +3 · Weglaufen +1' : 'Durchsuchen bringt einen Schatz'}</small></span>` : ''}<ol>${ICON.phase.map((src, i) => `<li class="${S.phase === i + 1 ? 'on' : S.phase > i + 1 ? 'done' : ''}"><img src="${src}" alt=""><span>${PHASES[i]}</span></li>`).join('')}</ol>`);
  // Stapel, zuletzt abgelegt und Menü rechts am Tisch
  patch($('#gdeck'), `<div class="gd-tools"><button type="button" class="iconbtn" data-go="pause" aria-label="Menü"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>${$('#btn-sound').outerHTML.replace('id="btn-sound"', '')}</div>` +
    `<div class="gd-pile"><span class="back door"></span><span class="back door"></span><span class="back door"></span><small>Tür · ${S.door.length}</small></div>` +
    `<div class="gd-pile"><span class="back treas"></span><span class="back treas"></span><span class="back treas"></span><small>Schatz · ${S.tr.length}</small></div>`);
  // Deine Ausrüstung am unteren Tischrand (Klick öffnet die Karte, leere Plätze deine Figur)
  const by = s => p.eq.filter(i => i.slot === s), hands = by('hand'), two = hands.find(h => (h.hands || 1) > 1), misc = by('none');
  const slot = (c, sl, l) => c ? eqTile(p, c, true, 'eq') : eqEmpty(sl, l);
  patch($('#geq'), `<div class="ge-row">${identTile(p, p.race, 'race', true)}${identTile(p, p.cls, 'cls', true)}${slot(by('kopf')[0], 'kopf', 'Kopf')}${slot(by('ruestung')[0], 'ruestung', 'Rüstung')}` +
    `${slot(two || hands[0], 'hand', 'Hand')}${two ? `<span class="et empty both"><img src="${ICON.slot.hand}" alt=""><span class="et-n">beide Hände</span></span>` : slot(hands[1], 'hand', 'Hand')}` +
    `${slot(by('schuhe')[0], 'schuhe', 'Schuhe')}${misc.length ? misc.map(c => eqTile(p, c, true, 'eq', ' misc')).join('') : eqEmpty('none', 'Sonstiges', ' misc')}` +
    `<button type="button" class="ge-pack" data-go="equip" aria-label="Rucksack, ${p.pack.length} von ${packLimit(p)}"><img src="${ICON.slot.pack}" alt=""><b>${p.pack.length}/${packLimit(p)}</b><small>Rucksack</small></button>` +
    (() => { const blk = sellBlock(p), any = p.eq.concat(p.pack, p.hand).some(c => c.g), ok = isFree() && mine && !blk && any;
      const why = !mine ? 'Verkaufen geht nur in deinem Zug.' : blk ? blk : !any ? 'Du hast nichts, was sich verkaufen lässt.' : !isFree() ? 'Gerade nicht, erst diesen Schritt beenden.' : 'Gegenstände verkaufen';
      return `<button type="button" class="ge-pack ge-sell${ok && UI.adv && UI.adv.sell ? ' rec' : ''}" data-go="sell"${ok ? '' : ' disabled'} title="${esc(why)}"><img src="icons/muenze-voll.png" alt=""><b>Verkaufen</b><small>${ok ? 'Gegenstände' : 'gerade nicht'}</small></button>`; })() + `</div>`);
  // Notizen und Kampfrechnung rechts
  const items = S.log.filter(e => UI.coach || e.kind !== 'rule').slice(-80);
if (  patch($('#wlog'), `<div class="wpanel"><h4 class="wp-h">Notizen</h4><i class="wpin"></i><ul class="loglist">${items.map(e => `<li class="l-${e.kind}">${e.kind === 'rule' ? '<b>Regel:</b> ' : ''}${linkify(e.t)}</li>`).join('')}</ul></div>`) || W.pcgFight !== !!S.combat) { W.pcgFight = !!S.combat; requestAnimationFrame(() => { const ll = $('#wlog .loglist'); if (ll) ll.scrollTop = ll.scrollHeight; }); }
  W.logSeen = S.log.length;
  patch($('#wfight'), fightWideHTML());
  const pv = W.hoverUid != null && mq().hover.matches ? findCard(W.hoverUid) : null;
  patch($('#wprev'), pv ? `<div class="wprev-in">${cardBig(pv)}</div>` : '');
  requestAnimationFrame(pcgFitHand);
}
// Hand am PC: passt sie nicht in die Reihe, rücken die Karten zusammen (überlappen leicht) statt abgeschnitten zu werden
function pcgFitHand() {
  const h = $('#hand'); if (!h || !PCGX()) return;
  const cs = [...h.querySelectorAll(':scope > .mc')], n = cs.length; if (n < 2) { h.style.removeProperty('--hg'); return; }
  const w = cs[0].getBoundingClientRect().width, avail = h.clientWidth, g = Math.min(8, (avail - n * w) / (n - 1));
  h.style.setProperty('--hg', Math.floor(g) + 'px');
}
window.addEventListener('resize', () => requestAnimationFrame(pcgFitHand));
// Kartenvorschau beim Überfahren mit der Maus (nur PC-Ansicht)
document.addEventListener('pointerover', e => {
  if (LAYOUT !== 'pc' || e.pointerType !== 'mouse') return;
  const el = e.target.closest && e.target.closest('[data-uid]'); const uid = el ? +el.dataset.uid : null;
  if (el && el.closest('#wprev')) return;
  if (uid !== W.hoverUid) { W.hoverUid = uid; render(); }
});

/* Einsprung von der Website: spiel/#konto öffnet die Anmeldung, spiel/#regeln die Regeln */
function hashEntry() {
  const h = location.hash; if (h !== '#regeln' && h !== '#konto') return;
  if (h === '#regeln') show('rules');
  else if (h === '#konto') { const b = document.querySelector('[data-acct="open"]'); if (b) b.click(); }
  history.replaceState(null, '', location.pathname + location.search);
}
window.addEventListener('load', () => setTimeout(hashEntry, 400));
window.addEventListener('hashchange', hashEntry);

/* ================= Breite Ansicht außerhalb der Partie ================= */
// Storymodus am PC oder Tablet: Die Station steht rechts neben der Karte statt als Fenster darüber
function dockSheet() {
  const wrap = $('#sheetwrap'); if (!wrap) return;
  if (HUBST && !mq().pc.matches) HUBST = false;   // Fenster kleiner gezogen: zurück zur normalen Ansicht
  const hd = !!HUBST && CUR === 'title' && SHEETS.length === 1 && topSheet().id === 'station';
  const on = hd || (document.documentElement.classList.contains('wide-menu') && CUR === 'story' && SHEETS.length === 1 && topSheet().id === 'station');
  wrap.classList.toggle('dock', on); wrap.classList.toggle('hubdock', hd);
  if (hd) { const i = $('#t-hub .pd-stbox'), a = $('#app'); if (i && a) { const r = i.getBoundingClientRect(), b = a.getBoundingClientRect(); Object.assign(wrap.style, {left: r.left - b.left + 'px', top: r.top - b.top + 'px', width: r.width + 'px', height: r.height + 'px'}); } }
  else ['left', 'top', 'width', 'height'].forEach(k => wrap.style[k] = '');
  if (HUBST && !hd && HUBSEL && CUR === 'title' && !SHEETS.length) { HUBSEL = null; renderHub(); }
  const side = $('#st-side'); if (side) side.classList.toggle('covered', on);
}
function renderStorySide() {
  const side = $('#st-side'); if (!side) return;
  const open = openWorlds(), cw = currentWorld();
  let next = null;
  open.forEach(w => { const n = w.stations.find(st => stationUnlocked(st) && !STORY.done[st.id]); if (n && (!next || w === cw)) next = n; });
  const all = open.reduce((a, w) => a + w.stations.length, 0), done = open.reduce((a, w) => a + w.stations.filter(st => STORY.done[st.id]).length, 0);
  const nextHTML = next ? `<button type="button" class="st-nextcard t-${next.type}" data-station="${next.id}"><span class="sn-medal">${medalIcon(next.type)}<i>${next.no}</i></span><span><small>Nächste Station</small><b>${esc(next.name)}</b><em>${ST_TYPES[next.type]} · ${esc(next.place)}</em></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></button>`
    : `<p class="st-alldone">${starSvg(true)}<span>Alle offenen Stationen sind geschafft.</span></p>`;
  patch(side, `<div class="panel st-sidein"><span class="st-world">${wLabel(cw)}</span><b class="st-name">${esc(cw.name)}</b>` +
    `<div class="st-sstats"><span>${starSvg(true)}<b>${worldStars(cw)}</b> / ${worldMaxStars(cw)} Sterne</span><span><b>${done}</b> / ${all} Stationen</span><span>${coinImg}<b>${STORY.coins}</b> Münzen</span></div>` +
    nextHTML + `<p class="hint">Klick auf der Karte auf eine Station, dann erscheint sie hier.</p>` +
    `<button type="button" class="btn small" data-worldrules="${cw.id}">Sonderregeln dieser Welt</button></div>`);
}
// Regeln: Inhaltsverzeichnis für die breite Ansicht
function buildRulesToc() {
  const toc = $('#rules-toc'); if (!toc || toc.__built) return; toc.__built = true;
  toc.innerHTML = '<h4 class="lbl">Inhalt</h4>' + $$('#scr-rules details.rule').map((d, i) => `<button type="button" data-rtoc="${i}">${esc(d.querySelector('summary').textContent)}</button>`).join('');
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-rtoc]'); if (!b) return;
  const d = $$('#scr-rules details.rule')[+b.dataset.rtoc]; if (!d) return;
  d.hidden = false; d.open = true; d.scrollIntoView({behavior: SET.reduce ? 'auto' : 'smooth', block: 'start'});
});

/* ================= Startseite am PC und Tablet: alles auf einen Blick ================= */
function plunkTips() { return [
  'Psst! Wer zuerst Stufe 10 erreicht, gewinnt. Wer zuletzt lacht, meistens auch.',
  'Hilde hat neue Aufträge ans Brett gehängt. Die bringen Münzen!',
  'Im Krämerladen gibt es jeden Tag andere Sachen. Ich sag ja nur.',
  'Ein Helfer im Kampf wählt seine Beute zuerst. Also gut verhandeln!',
  'Flüche spielt man am liebsten auf den, der gerade vorne liegt. Hehe.',
]; }
function renderHub() {
  const hub = $('#t-hub'); if (!hub) return;
  const on = document.documentElement.classList.contains('wide-menu');
  hub.hidden = !on; if (!on) return;
  const cw = currentWorld(), nx = nextStation(cw), st = dailyState(), sk = streakNow();
  const dn = st.list.filter(e => { const m = missionById(e.id); return m && e.p >= m.n; }).length, wait = chestsWaiting().length;
  const ay = nx && nx.ay != null ? nx.ay : 50;
  const fg = freeGame();
  if (hub.__tip == null) hub.__tip = Math.floor(Math.random() * plunkTips().length);
  // Kachel mit Bild: rechts das Motiv, links Text auf dunklem Verlauf. Ohne Bild: nur das Symbol.
  if (mq().pc.matches) { hub.classList.add('pc'); hubPatchPC(hub, pcPlayHTML(cw, nx, st, sk, dn, wait, ay, fg)); return; }
  hub.classList.remove('pc');
  const menu = (go, art, icon, b, small, cls = '') => `<button type="button" class="hub-btn${art ? ' hasart' : ''}${cls}" data-go="${go}"${art ? ` style="--art:url('${new URL(art, document.baseURI).href}')"` : ''}>${art ? '' : `<img src="${icon}" alt="">`}<span><b>${b}</b><small>${small}</small></span></button>`;
  const bx = myBg();
  patch(hub,
    `<aside class="hub-l">` +
      `<button type="button" class="hub-me${bx[2] ? ' hasbg' : ''}" data-go="profile"${bx[2] ? ` style="--bg:url('${new URL(bgSrc(bx), document.baseURI).href}');--bgp:${bx[4] || '50% 50%'}"` : ''}>` +
        `<span class="pf-bigw"><img class="pf-big" src="${myPortrait()}" alt=""></span><span class="hub-who"><b>${esc(PROFILE.name || 'Abenteurer')}</b><small>${esc(myTitle() || 'Dein Charakter')}</small><em>${coinImg}${STORY.coins} Münzen</em></span></button>` +
      `<section class="hub-daily"><header><img src="icons/portrait-hilde.png" alt=""><div><h3>Hildes Aufträge</h3><span>${dn} von 3 erledigt · neue in ${untilMidnight()}</span></div></header><div class="notes">${hubNotes(st)}</div></section>` +
      `<button type="button" class="t-daily hub-streak${sk ? '' : ' dark'}" data-go="${wait ? 'chest' : 'daily'}">${candleHtml(sk > 0)}<span class="td-main">${streakTrack(sk).track}</span></button>` +
    `</aside>` +
    `<main class="hub-c">` +
      `<h1 class="hub-logo"><img src="art/logo-plundo.webp" alt="Plundo" width="1158" height="530"></h1>` +
      `<section class="hub-story"><img src="art/karte-welt${cw.id.replace('w', '')}.webp" alt="" style="object-position:50% ${ay}%" onerror="this.style.visibility='hidden'">` +
        `<div class="hs-txt"><div class="t-chips"><span class="t-world">${wLabel(cw)}</span><span class="t-stars"><img src="icons/stern-voll.png" alt=""><b>${worldStars(cw)} / ${worldMaxStars(cw)}</b></span></div>` +
        `<button type="button" class="hs-name" data-go="story">${esc(cw.name)}</button><span class="hs-next">${esc($('#story-info').textContent)}</span>` +
        `<button type="button" class="t-cta" data-go="storygo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg><span>${esc($('#t-cta').textContent)}</span></button></div></section>` +
      `<div class="hub-modes">` +
        `<button type="button" class="hub-mode" data-go="setup"><img src="art/kachel-frei.webp" alt=""><span><b>Freies Spiel</b><small>${fg ? `${fg.live ? 'Läuft' : 'Gespeichert'} · Runde ${fg.turn}` : 'Gegen 2 oder 3 Bots'}</small></span></button>` +
        `<button type="button" class="hub-mode" data-go="online"><img src="art/kachel-online.webp" alt=""><span class="tc-badge">Bald</span><span><b>Online</b><small>Mit Freunden spielen</small></span></button>` +
      `</div>` +
    `</main>` +
    `<aside class="hub-r">` +
      `<nav class="hub-menu" aria-label="Bereiche">` +
        // Freunde kommt als fünfte Kachel dazu, sobald es den Online-Modus gibt
        menu('cards', 'art/hub-karten.webp', '', 'Karten und Deck', 'Deck wählen') +
        menu('shop', 'art/hub-laden.webp', '', 'Krämerladen', `${STORY.coins} Münzen`) +
        menu('rules', 'art/hub-regeln.webp', '', 'Regeln', 'FAQ und Quiz') +
        menu('settings', 'art/hub-optionen.webp', '', 'Optionen', 'Klang, Spiel') +
      `</nav>` +
    `</aside>`);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-plunk]'); if (!b) return;
  const hub = $('#t-hub'); hub.__tip = (hub.__tip + 1) % plunkTips().length; Snd.sfx('page'); renderHub();
  const img = $('.hub-plunk img'); if (img) { img.classList.remove('hop'); void img.offsetWidth; img.classList.add('hop'); }
});

// Aufträge auf der Startseite: kompakter, „Tauschen“ nur als kleines Symbol
function hubNotes(st) {
  return dailyNotes(st).replace(/<button type="button" class="btn small" data-reroll="(\d+)">Tauschen<\/button>/g,
    '<button type="button" class="nreroll" data-reroll="$1" aria-label="Auftrag tauschen" title="Auftrag tauschen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4"/></svg></button>');
}

/* ================= PC und Tablet: Leiste oben auf allen Unterseiten ================= */
function renderWnav() {
  const nav = $('#wnav'); if (!nav) return;
  const on = (document.documentElement.classList.contains('wide-menu') && CUR !== 'game') || (CUR === 'game' && document.documentElement.classList.contains('pcg-on'));
  nav.hidden = !on; document.documentElement.classList.toggle('has-wnav', on); if (!on) return;
  document.documentElement.classList.toggle('pcnav', on && mq().pc.matches);
  if (mq().pc.matches) { patch(nav, pcNavHTML()); pcEdges(); return; }
  const act = CUR === 'quiz' ? 'rules' : CUR;
  const tab = (go, scr, label) => `<button type="button" class="wn-tab${act === scr ? ' on' : ''}" data-go="${go}"${act === scr ? ' aria-current="page"' : ''}>${label}</button>`;
  patch(nav, `<button type="button" class="wn-logo" data-wnhome aria-label="Zur Startseite"><img src="art/logo-klein.webp" alt="Plundo"></button>` +
    `<div class="wn-tabs">` + tab('story', 'story', 'Story') + tab('setup', 'setup', 'Freies Spiel') + tab('cards', 'cards', 'Karten und Deck') +
      `<button type="button" class="wn-tab" data-go="shop">Krämerladen</button>` + tab('rules', 'rules', 'Regeln') + tab('settings', 'settings', 'Optionen') + `</div>` +
    `<div class="wn-right">` + (CUR === 'title' ? '' : `<button type="button" class="wn-coins" data-go="shop" aria-label="${STORY.coins} Münzen, zum Krämerladen">${coinImg}<b>${STORY.coins}</b></button>` +
    `<button type="button" class="wn-me${act === 'profile' ? ' on' : ''}" data-go="profile" aria-label="Dein Charakter"><span class="t-pt" style="--fr:${myFrame()}"><img src="${myPortrait()}" alt=""></span><b>${esc(PROFILE.name || 'Abenteurer')}</b></button>`) +
    `<button type="button" class="wn-exit" data-wnexit title="Spiel verlassen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/></svg><span>Verlassen</span></button></div>`);
}
// Verlassen: zurück zur Website, auf Wunsch vorher abmelden
async function exitGame() {
  const signed = typeof CLOUD !== 'undefined' && CLOUD.uid;
  const r = signed
    ? await confirmDialog('Plundo verlassen?', 'Du kehrst zur Startseite von plundo.eu zurück. Dein Fortschritt ist im Konto gesichert.', 'Zur Website', 'Abmelden und zur Website', 'Abbrechen')
    : await confirmDialog('Plundo verlassen?', 'Du kehrst zur Startseite von plundo.eu zurück. Ohne Konto bleibt dein Fortschritt nur auf diesem Gerät.', 'Zur Website', 'Abbrechen');
  if (r === null || (!signed && !r)) return;
  if (signed && r === false) {
    try { if (CLOUD.dirty) await cloudUpload(); const {F, auth} = await fbLoad(); await F.signOut(auth); Object.assign(CLOUD, {uid: null, email: null, rev: 0, at: 0}); saveCloudMeta(); } catch (_) {}
  }
  location.href = '../';
}
document.addEventListener('click', e => { if (e.target.closest('[data-wnexit]')) exitGame(); });
document.addEventListener('click', e => {
  if (!e.target.closest('[data-wnhome]')) return;
  closeAllSheets(); STACK.length = 0; setScreen('title');
});

/* ================= PC: Menüleiste mit ausrollenden Kacheln, Seite „Spielen“, Krämerladen als Seite ================= */
// Münzen-Bereich: Bild und Hintergrund wachsen mit dem Münzstand
function coinTier(n) {
  return n >= 700 ? {t: 4, img: 'icons/truhe-gold-auf.png', l: 'Schatztruhe'} : n >= 300 ? {t: 3, img: 'icons/truhe-holz-auf.png', l: 'Volle Truhe'}
    : n >= 100 ? {t: 2, img: 'icons/truhe-holz-klein.png', l: 'Kleine Truhe'} : {t: 1, img: 'icons/muenze-voll.png', l: 'Ein paar Münzen'};
}
function pcNavHTML() {
  const act = ['title', 'story', 'setup'].includes(CUR) ? 'play' : CUR === 'quiz' ? 'rules' : CUR;
  const st = dailyState(), shopN = st.shop.filter(id => shopItem(id) && !owns(id)).length;
  // Jeder Menüpunkt hat sein eigenes Bild. In Ruhe ist nur ein Streifen davon zu sehen, beim Drüberfahren rollt es von oben aus.
  const item = (key, go, label, art, info) => `<button type="button" class="pn-item c-${key}${act === key ? ' on' : ''}" data-go="${go}"${act === key ? ' aria-current="page"' : ''} style="--art:url('${new URL(art, document.baseURI).href}')">` +
    `<span class="pn-bg" aria-hidden="true"></span><span class="pn-lbl"><b>${label}</b><small>${info}</small></span></button>`;
  const ct = coinTier(STORY.coins), bx = myBg(), signed = typeof CLOUD !== 'undefined' && CLOUD.uid;
  return `<button type="button" class="wn-logo" data-go="home" aria-label="Spielen"><img src="art/logo-klein.webp" alt="Plundo"></button>` +
    `<div class="pn-items">` +
      item('play', 'home', 'Spielen', 'art/menu-spielen.webp', 'Story, Freies Spiel, bald Online') +
      item('cards', 'cards', 'Karten', 'art/menu-karten.webp', 'Alle Karten ansehen, Deck wählen') +
      item('shop', 'shop', 'Laden', 'art/menu-laden.webp', shopN ? `Heute ${shopN} ${shopN === 1 ? 'Angebot' : 'Angebote'}` : 'Alles ausverkauft') +
      item('rules', 'rules', 'Regeln', 'art/menu-regeln.webp', 'FAQ, Probespiel und Quiz') +
      item('settings', 'settings', 'Optionen', 'art/menu-optionen.webp', 'Klang, Spiel, Konto') +
    `</div>` +
    `<div class="pn-right">` +
      `<button type="button" class="pn-coins t${ct.t}" data-go="shop" title="${ct.l}"><span><b>${STORY.coins}</b><small>Münzen</small></span></button>` +
      // Shop für Echtgeld (Werbung aus, Welten): kommt später, Platz ist schon da
      `<button type="button" class="pn-shop" data-pnshop><span><b>Shop</b></span></button>` +
      `<button type="button" class="pn-me${act === 'profile' ? ' on' : ''}${bx[2] ? ' hasbg' : ''}" data-go="profile"${bx[2] ? ` style="--bg:url('${new URL(bgSrc(bx), document.baseURI).href}');--bgp:${bx[4] || '50% 50%'}"` : ''}>` +
        `<span class="pf-bigw"><img class="pf-big" src="${myPortrait()}" alt=""></span><span class="pn-who"><b>${esc(PROFILE.name || 'Abenteurer')}</b><small>${esc(myTitle() || 'Dein Charakter')}</small></span></button>` +
      (signed ? `<button type="button" class="pn-out" data-wnexit><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/></svg><span>Ausloggen</span></button>`
              : `<button type="button" class="pn-out" data-acct="open"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 16l4-4-4-4M18 12H8"/></svg><span>Anmelden</span></button>`) +
    `</div>`;
}
// Seite „Spielen“ am PC: links die Spielarten, rechts Hildes Aufträge und die Serie
// PC „Spielen“: Online im Mittelpunkt (bis zum Start als „Bald“), darunter Allein spielen
function pcPlayHTML(cw, nx, st, sk, dn, wait, ay, fg) {
  const play = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg>';
  const soon = (ic, kind, title, txt, msg) => `<button type="button" class="pd-card" data-soon="${esc(msg)}"><img class="pd-ic" src="${ic}" alt=""><span><small>${kind}</small><b>${title}</b><em>${txt}</em></span><span class="pd-bald">Bald</span></button>`;
  if (HUBBOT) return hubBotsHTML() + pcSideHTML(st, sk, dn, wait);
  if (HUBST) return hubStoryHTML(cw) + pcSideHTML(st, sk, dn, wait);
  return `<main class="pp-modes pd">` +
      `<section class="pd-online"><img src="art/kachel-online.webp" alt=""><span class="tc-badge pd-badge">Bald</span>` +
        `<div class="pd-on-txt"><span class="pp-mode">Online</span>` +
          `<div class="pd-league"><span class="pd-crest"><b>?</b></span><div class="pd-lg"><b>Ligen und Saisons</b><small>Spiel gegen andere, steig in höhere Ligen auf und gewinne Rahmen, Titel und Hintergründe, die es nur hier gibt.</small></div></div>` +
          `<div class="pd-modesel"><button type="button" class="on" data-go="online"><b>Klassisch</b><small>3 bis 4 Spieler</small></button><button type="button" data-go="online"><b>2 gegen 2</b><small>Im Team</small></button></div>` +
          `<div class="pp-acts"><button type="button" class="t-cta pd-off" data-go="online">${play}<span>Spiel suchen</span></button><button type="button" class="btn pp-map" data-go="online">Mit Freunden spielen</button></div>` +
        `</div></section>` +
      `<div class="pd-row3">` +
        soon('icons/truhe-gold-zu.png', 'Turnier', 'Jeden 2. Sonntag', 'Mit besonderen Preisen', 'Das Sonntagsturnier startet zusammen mit dem Online-Modus.') +
        soon('icons/nav-freunde.png', 'Gilde', 'Gemeinsam stärker', 'Mit anderen um Gildenpunkte spielen', 'Gilden kommen, sobald der Online-Modus läuft.') +
        soon('icons/muenze-sieg.png', 'Rangliste', 'Wer ist ganz oben?', 'Auf- und Abstieg am Saisonende', 'Die Rangliste startet mit der ersten Online-Saison.') +
      `</div>` +
      `<div class="pd-solo"><span class="pd-h">Allein spielen</span><div class="pd-solo-row">` +
        `<div class="pd-tile"><img src="art/karte-welt${cw.id.replace('w', '')}.webp" alt="" style="object-position:50% ${ay}%"><button type="button" class="pd-hit" data-go="story" aria-label="Zur Weltkarte"></button>` +
          `<span><b>Storymodus</b><small>${wLabel(cw)} · ${worldStars(cw)} / ${worldMaxStars(cw)} Sterne · schaltet Decks frei</small></span>` +
          `<button type="button" class="t-cta pd-go" data-go="storygo" title="${esc($('#t-cta').textContent)}">${play}<span>Weiter</span></button></div>` +
        `<div class="pd-tile"><img src="art/kachel-frei.webp" alt=""><button type="button" class="pd-hit" data-go="setup" aria-label="Spiel erstellen"></button><span><b>Gegen Bots</b><small>${fg ? `${fg.live ? 'Läuft' : 'Gespeichert'} · Runde ${fg.turn}` : 'Freies Spiel mit deinen Regeln'}</small></span>` +
          `<button type="button" class="t-cta pd-go" data-go="setup">${play}<span>Spiel erstellen</span></button></div>` +
      `</div></div>` +
    `</main>` +
    pcSideHTML(st, sk, dn, wait);
}
function pcSideHTML(st, sk, dn, wait) {
  return `<aside class="pp-side">` +
  `<section class="hub-daily"><header><img src="icons/portrait-hilde.png" alt=""><div><h3>Hildes Aufträge</h3><span>${dn} von 3 erledigt · neue in ${untilMidnight()}</span></div></header><div class="notes">${hubNotes(st)}</div></section>` +
  `<button type="button" class="t-daily hub-streak${sk ? '' : ' dark'}" data-go="${wait ? 'chest' : 'daily'}">${candleHtml(sk > 0)}<span class="td-main">${streakTrack(sk).track}</span></button>` +
  `</aside>`;
}

/* Entwurf: Storymodus direkt auf der Seite „Spielen“ (PC). Die Karte rollt aus der Kachel nach oben aus,
   daneben stehen die Infos zur Station. */
const HUBST_ON = () => mq().pc.matches;   // PC: Storykarte rollt auf der Seite „Spielen“ aus
function storyNext() { let next = null; const cw = currentWorld(); openWorlds().forEach(w => { const n = w.stations.find(st => stationUnlocked(st) && !STORY.done[st.id]); if (n && (!next || w === cw)) next = n; }); return next; }
// PC: Seite „Spielen“ in zwei Teilen aktualisieren. Die Seitenleiste (Hildes Aufträge, Serie) wird nur neu gebaut, wenn sich darin etwas ändert.
function hubPatchPC(hub, html) {
  const k = html.lastIndexOf('<aside class="pp-side">'), main = k >= 0 ? html.slice(0, k) : html, side = k >= 0 ? html.slice(k) : '';
  let m = hub.querySelector(':scope > .hub-ms'), sd = hub.querySelector(':scope > .hub-ss');
  if (!m || !sd) { hub.innerHTML = '<div class="hub-ms"></div><div class="hub-ss"></div>'; hub.__h = null; m = hub.firstChild; sd = hub.lastChild; }
  if (patch(m, main) && HUBBOT) hubBotsMount();
  if (HUBST) requestAnimationFrame(() => pdTilesFade());
  patch(sd, side);
}

/* PC: „Gegen Bots“ direkt auf der Seite „Spielen“. Der Tisch rollt aus der Kachel nach oben aus (rechts, wo die Kachel liegt),
   links stehen die Einstellungen. Das sind dieselben Knöpfe wie auf der Handy-Seite: Sie werden nur umgehängt. */
let SETUP_PANELS = null;
function hubBotsHTML() {
  const list = SET.foes === 'stammtisch' ? ['Berta', 'Kalle', 'Uschi'].map(n => ({name: n, face: ICON.portrait[n], style: STYLES[n]})) : (ROSTER || []);
  const pos = SET.bots === 2 ? ['l2', 'r2'] : ['l', 't', 'r'];
  return `<main class="pp-modes pd-st pd-bot tb-${freeTable()}${HUBBOT === 'open' ? ' unroll' : ''}" style="--tbl:url(${new URL((TABLES.find(t => t[0] === freeTable()) || TABLES[0])[2], document.baseURI).href})">` +
      `<section class="pd-stinfo su-mid"></section>` +
      `<section class="pd-stmap su-table"><span class="pd-rod" aria-hidden="true"></span>` +
        `<div class="su-foes"></div><div class="su-deck" aria-hidden="true"><span class="back door"></span><span class="back treas"></span></div>` +
        `<div class="su-seat s-me me"><span class="su-face"><img src="${myPortrait()}" alt=""></span><b>Du</b><small>fängst an</small></div>` +
        `<div class="su-tables">${tablePickHTML()}</div>` +
        `<button type="button" class="iconbtn pd-x" data-hubst="close" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg></button></section>` +
    `</main>`;
}
function botSeatsHTML() {
  const list = SET.foes === 'stammtisch' ? ['Berta', 'Kalle', 'Uschi'].map(n => ({name: n, face: ICON.portrait[n], style: STYLES[n]})) : (ROSTER || []);
  const pos = SET.bots === 2 ? ['l2', 'r2'] : ['l', 't', 'r'];
  return list.slice(0, SET.bots).map((f, i) => `<div class="su-seat s-${pos[i]}"><span class="su-face"><img src="${f.face}" alt=""></span><b>${esc(f.name)}</b><small>${esc((f.style && f.style.l) || '')}</small></div>`).join('') +
    (SET.foes === 'stammtisch' ? '' : `<button type="button" class="su-reroll b${SET.bots}" data-go="reroll" aria-label="Neue Gegner" title="Neue Gegner"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4" /></svg><span>Neue Gegner</span></button>`);
}
function tablePickHTML() {
  const cur = freeTable(), list = TABLES.filter(t => moodOk(t[0])), i = Math.max(0, list.findIndex(t => t[0] === cur));
  return `<button type="button" data-tbl="-1"${list.length > 1 ? '' : ' disabled'} aria-label="Voriger Tisch"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg></button>` +
    `<span><small>Tisch</small><b>${esc(list[i][1])}</b></span>` +
    `<button type="button" data-tbl="1"${list.length > 1 ? '' : ' disabled'} aria-label="Nächster Tisch"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></button>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tbl]'); if (!b || !HUBBOT) return;
  const list = TABLES.filter(t => moodOk(t[0])), i = Math.max(0, list.findIndex(t => t[0] === freeTable()));
  SET.table = list[(i + +b.dataset.tbl + list.length) % list.length][0]; saveSettings(); Snd.sfx('deal'); buzz(6);
  suTableSync();
});
function hubBotsMount() {
  const slot = $('#t-hub .su-mid'); if (!slot) return;
  if (!SETUP_PANELS) SETUP_PANELS = [...$$('#scr-setup .content > .panel')];
  slot.append(...SETUP_PANELS);
  slot.insertAdjacentHTML('beforeend', '<button type="button" class="btn primary su-start" data-go="start">Los geht’s!</button>');
  const f = $('#t-hub .su-foes'); if (f) { f.__h = null; patch(f, botSeatsHTML()); }
  const dp = $('#setup-deck'); if (dp && !dp.parentNode.querySelector('.su-decks')) dp.insertAdjacentHTML('afterend', '<div class="su-decks"></div>');
  renderSuDecks();
}
// PC: Deck und Mischung direkt im Aufbau wählen, ohne Umweg über „Karten und Deck“
// Handy-Aufbau: Spieltisch (Optik) wählen
function renderSetupTable() {
  const box = $('#setup-table'); if (!box) return;
  const cur = freeTable(), list = TABLES.filter(t => moodOk(t[0])), i = Math.max(0, list.findIndex(t => t[0] === cur)), t = list[i];
  patch(box, `<button type="button" class="st-arr" data-sttbl="-1"${list.length > 1 ? '' : ' disabled'} aria-label="Voriger Tisch"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>` +
    `<div class="st-prev tb-${t[0]}" style="background-image:url('${new URL(t[2], document.baseURI).href}')"><span class="back door"></span><b>${esc(t[1])}</b></div>` +
    `<button type="button" class="st-arr" data-sttbl="1"${list.length > 1 ? '' : ' disabled'} aria-label="Nächster Tisch"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>`);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-sttbl]'); if (!b) return;
  const list = TABLES.filter(t => moodOk(t[0])), i = Math.max(0, list.findIndex(t => t[0] === freeTable()));
  SET.table = list[(i + +b.dataset.sttbl + list.length) % list.length][0]; saveSettings(); Snd.sfx('deal'); buzz(6); renderSetupTable();
});
function renderSuDecks() {
  const box = $('#t-hub .su-decks'); if (!box) return;
  const list = DECKS.filter(x => x.unlocked()), i = Math.max(0, list.findIndex(x => x.id === DECK.deck)), d = list[i] || DECKS[0], many = list.length > 1;
  const arr = (k, lbl) => `<button type="button" class="sd-arr" data-sddeck="${k}"${many ? '' : ' disabled'} aria-label="${lbl}"><svg viewBox="0 0 24 24"><path d="${k < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg></button>`;
  const own = !!DECK.custom[DECK.deck];
  const vt = (k, l, tip, off) => `<button type="button" class="sd-var${DECK.variant === k ? ' on' : ''}${off ? ' off' : ''}" ${off ? 'data-sdown aria-disabled="true"' : `data-variant="${k}"`} data-tip="${esc(tip)}">${l}</button>`;
  patch(box, `<div class="sd-one">${arr(-1, 'Voriges Deck')}<div class="sd-card"><img src="${ART[d.icon]}" alt="" draggable="false"><span><b>${esc(d.name)}</b><small>${esc(d.desc.split(':')[0].replace(/\. .*/, '.'))}</small>` +
    (many ? `<i class="sd-dots">${list.map(x => `<em class="${x === d ? 'on' : ''}"></em>`).join('')}</i>` : '') + `</span></div>${arr(1, 'Nächstes Deck')}</div>` +
    `<div class="sd-vars5">` + VARIANTS.map(([k, l, tip]) => vt(k, l, tip)).join('') +
    vt('eigenes', 'Eigenes', own ? 'Deine eigene Zusammenstellung für dieses Deck.' : 'Unter „Karten und Deck“ kannst du dir ein eigenes Deck bauen. Dann wählst du es hier aus.', !own) + `</div>`);
  setupPrep(); suTableSync();
}
// Tisch im PC-Aufbau: Bild, Name und Türrücken passend zur Optik
function suTableSync() {
  const m = $('#t-hub .pd-bot'); if (!m) return;
  const t = freeTable();
  m.style.setProperty('--tbl', `url(${new URL((TABLES.find(x => x[0] === t) || TABLES[0])[2], document.baseURI).href})`);
  m.className = m.className.replace(/\btb-\w+/g, '').trim() + ' tb-' + t;
  const tp = $('#t-hub .su-tables'); if (tp) patch(tp, tablePickHTML());
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-sddeck]');
  if (a) { const list = DECKS.filter(x => x.unlocked()), i = Math.max(0, list.findIndex(x => x.id === DECK.deck)); selectDeck(list[(i + +a.dataset.sddeck + list.length) % list.length].id); Snd.sfx('deal'); return; }
  if (e.target.closest('[data-sdown]')) toast('Unter „Karten und Deck“ kannst du dir ein eigenes Deck bauen.');
});
function hubBotsOff() {
  $$('.su-decks').forEach(x => x.remove());
  if (SETUP_PANELS) $('#scr-setup .content').append(...SETUP_PANELS);
  HUBBOT = false;
}
function openHubBots() {
  const hub = $('#t-hub'), tile = $$('#t-hub .pd-solo-row .pd-tile')[1], main = $('#t-hub .pd');
  if (tile && main) { const a = main.getBoundingClientRect(), b = tile.getBoundingClientRect(); hub.style.setProperty('--from', b.height ? Math.round(b.top - a.top) + 'px' : '100%'); }
  closeAllSheets(); if (!ROSTER && SET.foes !== 'stammtisch') ROSTER = rollRoster();
  HUBST = false; HUBSEL = null; HUBBOT = 'open';
  if (CUR !== 'title') setScreen('title'); else renderHub();
  setupPrep(); HUBBOT = true;
}
function closeHubBots() {
  const m = $('#t-hub .pd-bot'); if (m && !UI.reduce) { m.classList.remove('unroll'); m.classList.add('rollup'); }
  setTimeout(() => { hubBotsOff(); renderHub(); }, UI.reduce ? 0 : 420);
}
function hubPages() { const f = fogWorld(); return [...openWorlds().map(w => ({w})), ...(f ? [{f}] : [])]; }
function hubStoryHTML(cw) {
  SAVED_ST = (storySave() || {}).st || null;
  const next = storyNext(), pages = hubPages(); HUBW = Math.max(0, Math.min(pages.length - 1, HUBW));
  const pg = pages[HUBW];
  let map = pg.w ? worldMapHTML(pg.w, next) : fogHTML(pg.f, pg.f.near).replace('<div class="st-link" aria-hidden="true"></div>', '');
  if (HUBSEL) map = map.replace(`class="snode `, m => m).replace(new RegExp(`class="(snode[^"]*)"( data-station="${HUBSEL}")`), 'class="$1 sel"$2');
  const nameOf = q => q.w ? q.w.name : q.f.name, lblOf = q => q.w ? wLabel(q.w) : `Welt ${q.f.n}`;
  // Welten als Kacheln über dem Textfeld (wie auf der Startseite), praktisch auch für viele Welten
  const tiles = `<div class="pd-wtiles">${pages.map((q, k) => { const ww = q.w, img = ww ? ww.map : q.f.map;
    return `<button type="button" class="pd-wt${k === HUBW ? ' on' : ''}${q.f ? ' fog' : ''}${ww && !worldOwned(ww) ? ' shut' : ''}" data-hubwt="${k}"${img ? ` style="--img:url('${new URL(img, document.baseURI).href}')"` : ''} aria-label="${esc(lblOf(q))}: ${esc(nameOf(q))}">` +
      `<span class="pd-wt-t"><small>${esc(lblOf(q))}</small><b>${esc(nameOf(q))}</b>${ww ? `<em>${starSvg(true)}${worldStars(ww)}/${worldMaxStars(ww)}</em>` : `<em>im Nebel</em>`}</span></button>`; }).join('')}</div>`;
  const w = pg.w || cw, all = w.stations.length, done = w.stations.filter(st => STORY.done[st.id]).length;
  return `<main class="pp-modes pd-st${HUBST === 'open' ? ' unroll' : ''}">` +
      `<section class="pd-stmap"><span class="pd-rod" aria-hidden="true"></span><div class="pd-page${HUBPG ? ' pg-' + HUBPG : ''}" data-page="${HUBW}">${map}</div>` +
        `<button type="button" class="iconbtn pd-x" data-hubst="close" aria-label="Karte schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg></button></section>` +
      `<section class="pd-stinfo">${tiles}<div class="pd-stbox"><div class="panel st-sidein"><span class="st-world">${wLabel(w)}</span><b class="st-name">${esc(w.name)}</b>` +
        `<div class="st-sstats"><span>${starSvg(true)}<b>${worldStars(w)}</b> / ${worldMaxStars(w)} Sterne</span><span><b>${done}</b> / ${all} Stationen</span><span>${coinImg}<b>${STORY.coins}</b> Münzen</span></div>` +
        `${worldRulesHTML(w)}<p class="hint">Klick auf der Karte auf eine Station, dann erscheint sie hier.</p></div></div></section>` +
    `</main>`;
}
function openHubStory(stId, noAuto) {
  const hub = $('#t-hub'), tile = $('#t-hub .pd-solo-row .pd-tile'), main = $('#t-hub .pd');
  if (tile && main) { const a = main.getBoundingClientRect(), b = tile.getBoundingClientRect(); hub.style.setProperty('--from', b.height ? Math.round(b.top - a.top) + 'px' : '100%'); }
  closeAllSheets(); if (HUBBOT) hubBotsOff(); HUBST = 'open'; HUBPG = ''; HUBSEL = null;
  { const sid = stId || (storyNext() || {}).id, stw = sid && stationById(sid), k = stw ? hubPages().findIndex(q => q.w && q.w.id === stw.world) : -1; HUBW = k >= 0 ? k : hubPages().findIndex(q => q.w === currentWorld()); }
  if (CUR !== 'title') setScreen('title'); else renderHub();
  HUBST = true;
  const id = noAuto ? null : stId || (storyNext() || {}).id;
  if (id) setTimeout(() => { if (HUBST) openStation(id); }, UI.reduce ? 0 : 620);
}
function closeHubStory() {
  if (!HUBST) return;
  closeAllSheets();
  const m = $('#t-hub .pd-st'); if (m && !UI.reduce) { m.classList.remove('unroll'); m.classList.add('rollup'); }
  setTimeout(() => { HUBST = false; HUBSEL = null; renderHub(); }, UI.reduce ? 0 : 420);
}
document.addEventListener('click', e => { if (e.target.closest('[data-hubst="close"]')) { if (HUBBOT) closeHubBots(); else closeHubStory(); } });
// Weltkacheln: Mausrad scrollt seitwärts, wenn es mehr Welten gibt, als nebeneinander passen
document.addEventListener('wheel', e => { const t = e.target.closest && e.target.closest('.pd-wtiles'); if (!t || t.scrollWidth <= t.clientWidth) return; e.preventDefault(); const now = performance.now(); if (now - (t.__wh || 0) < 220) return; t.__wh = now; const w = (t.querySelector('.pd-wt') || {}).offsetWidth || 150; t.scrollBy({left: Math.sign(e.deltaY || e.deltaX) * (w + 10)}); }, {passive: false});
function pdTilesFade(t) {
  t = t || $('#t-hub .pd-wtiles'); if (!t) return;
  if (!t.__sc) { t.__sc = true; t.addEventListener('scroll', () => pdTilesFade(t), {passive: true}); const on = t.querySelector('.pd-wt.on'); if (on && on.offsetLeft + on.offsetWidth > t.clientWidth) t.scrollLeft = on.offsetLeft - t.clientWidth + on.offsetWidth + 4; }
  t.classList.toggle('more', t.scrollLeft + t.clientWidth < t.scrollWidth - 4); t.classList.toggle('less', t.scrollLeft > 4);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-hubwt]'); if (!b || !HUBST) return;
  const k = +b.dataset.hubwt; if (k === HUBW) return;
  HUBPG = UI.reduce ? '' : k > HUBW ? 'r' : 'l'; HUBW = k; HUBSEL = null;
  if (SHEETS.length) closeAllSheets();
  renderHub(); HUBPG = ''; Snd.sfx('deal'); buzz(6);
  const t = $(`#t-hub [data-hubwt="${k}"]`); if (t) t.scrollIntoView({block: 'nearest', inline: 'nearest'});
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-hubw]'); if (!b || !HUBST) return;
  const d = +b.dataset.hubw, n = hubPages().length, k = Math.max(0, Math.min(n - 1, HUBW + d)); if (k === HUBW) return;
  HUBW = k; HUBPG = UI.reduce ? '' : d > 0 ? 'r' : 'l'; renderHub(); HUBPG = ''; Snd.sfx('deal'); buzz(6);
});
document.addEventListener('click', e => { const b = e.target.closest('[data-soon]'); if (b) toast(b.dataset.soon); });
function renderShopPage() {
  const el = $('#shop-page'); if (!el) return;
  if (!mq().pc.matches) { el.classList.remove('two'); patch(el, `<div class="panel shop-panel">${SHEET_VIEWS.shop().body}</div>`); watchBoards(el); fitNames(el); return; }
  // PC: links der Krämerladen (Münzen), rechts der Shop (Echtgeld)
  el.classList.add('two');
  const st = dailyState();
  const items = st.shop.map(id => { const it = shopItem(id); if (!it) return ''; const deal = shopDeal(id); return shelfItem(id, it.price, shopPrice(id), deal ? deal.pct : 0, 'data-shopbuy'); }).join('');
  const kl = `<section class="kl-panel"><header class="kl-head"><div><h2>Krämerladen</h2></div><span class="kl-coins">${coinImg}<b>${STORY.coins}</b> Münzen</span></header>` +
    `<div class="say"><img src="icons/portrait-kuno.png" alt=""><p>Krämer Kuno: „Frisch reingekommen, nur heute! Na ja, fast nur heute.“</p></div>` +
    `<div class="kl-shelf"><div class="sitems">${items || Array.from({length: 4}, () => '<div class="sitem empty"><span class="si-ware"></span><span class="si-t"><b>&nbsp;</b><small>&nbsp;</small></span></div>').join('')}</div>${items ? '' : '<p class="kl-empty">Du hast schon alles aus dem Laden. Hut ab!<small>Morgen räumt Kuno neue Ware ins Regal.</small></p>'}</div>` +
    `<p class="kl-hint">Neues Angebot in ${untilMidnight()}. Münzen gibt es für Aufträge und im Storymodus. Gekauftes wählst du im Charakter-Bildschirm aus.</p></section>`;
  patch(el, kl + premiumHTML()); watchBoards(el); fitNames(el);
}
// Shop für Echtgeld: Kaufwelten sind echt (über Google Play), der Rest sind Platzhalter für später
function premiumHTML() {
  const wimg = id => new URL(`art/karte-welt${id.slice(1)}.webp`, document.baseURI).href;
  const own = id => !!PURCHASE.worlds[id];
  const offer = (o, extra) => {
    const done = o.worlds.every(own), part = !done && o.worlds.length > 1 && o.worlds.some(own), wait = !done && !offerOk(o), off = done || part || wait;
    const wname = o.worlds.map(id => worldById(id).name).join(' und '), prev = wait && needPrev(worldById(o.worlds[0]));
    const txt = part ? 'Ein Teil gehört dir schon, hol dir einfach die andere Welt einzeln' : wait ? `Erst nach ${prev ? wLabel(prev) : 'der Welt davor'} erhältlich, oder im Paket` : o.worlds.length > 1 ? 'Beide Kaufwelten mit allen Stationen, Karten und Belohnungen' : 'Neue Stationen, Karten, Sonderregeln und Belohnungen';
    return `<button type="button" class="pr-item${done ? ' owned' : ''}${off && !done ? ' wait' : ''}${extra && extra.best && !off ? ' best' : ''}" ${off ? 'disabled' : `data-buyworld="${o.worlds[0]}"`}>` +
      `<span class="pr-pic${o.worlds.length > 1 ? ' duo' : ''}">${o.worlds.map(id => `<img src="${wimg(id)}" alt="">`).join('')}</span>` +
      `<span class="pr-t"><small>${o.worlds.length > 1 ? 'Paket' : 'Welt ' + o.worlds[0].slice(1)}</small><b>${esc(wname)}</b><em>${txt}</em></span>` +
      `${extra && extra.best && !off ? '<i class="pr-badge">Spare 20 %</i>' : ''}<span class="pr-price">${done ? 'Gekauft' : part ? '–' : wait ? LOCK_SVG : esc(offerPrice(o))}</span></button>`;
  };
  const soon = (ic, kind, title, txt) => `<button type="button" class="pr-item soon" data-soon="${esc(title)} kommt bald in den Shop."><span class="pr-pic ic">${ic}</span><span class="pr-t"><small>${kind}</small><b>${title}</b><em>${txt}</em></span><span class="pr-price">Bald</span></button>`;
  const g = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  return `<section class="pr-panel"><header class="pr-head"><img src="${new URL('art/shop-kissen-mini.webp', document.baseURI).href}" alt=""><div><h2>Shop</h2><p>Unterstütze Plundo und hol dir mehr Abenteuer.</p></div></header>` +
    `<div class="pr-list"><span class="pr-lbl">Welten</span>${offer(OFFERS[2], {best: true})}${offer(OFFERS[0])}${offer(OFFERS[1])}` +
    `<span class="pr-lbl">Extras</span>` +
    soon(g('<path d="M4 4l16 16 M9.5 5H19v9.5 M5 9v10h10" />'), 'Komfort', 'Werbefrei', 'Spielen ohne Werbung, einmal kaufen, für immer') +
    soon(g('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />'), 'Unterstützer', 'Gönnerpaket', 'Exklusiver Rahmen, Titel und Hintergrund als Dankeschön') +
    `</div><footer class="pr-foot"><span>${g('<rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />')}Sichere Bezahlung über Google Play</span><span>Käufe gelten für dein Konto auf allen Geräten</span></footer></section>`;
}

document.addEventListener('click', e => { if (e.target.closest('[data-pnshop]')) { if (CUR !== 'shop') go('shop'); } });

// Inhaltsbreite am PC: von der linken Kante von „Spielen“ bis zur rechten Kante des Profils, live gemessen
function pcEdgesNow() {
  const a = $('#wnav .pn-item'), b = $('#wnav .pn-me'), app = $('#app'); if (!a || !b || !app) return;
  const r = app.getBoundingClientRect(), root = document.documentElement.style;
  root.setProperty('--cl', Math.round(a.getBoundingClientRect().left - r.left) + 'px');
  root.setProperty('--cr', Math.round(r.right - b.getBoundingClientRect().right) + 'px');
}
function pcEdges() {
  cancelAnimationFrame(pcEdges.r);
  pcEdges.r = requestAnimationFrame(() => requestAnimationFrame(pcEdgesNow));
  clearTimeout(pcEdges.t); pcEdges.t = setTimeout(pcEdgesNow, 350);   // nach dem Nachladen von Bildern und Schrift noch einmal messen
  if (!pcEdges.ro && window.ResizeObserver) { const n = $('#wnav'); if (n) { pcEdges.ro = new ResizeObserver(() => { if (document.documentElement.classList.contains('pcnav')) pcEdgesNow(); }); pcEdges.ro.observe(n); } }
}
window.addEventListener('resize', () => { if (document.documentElement.classList.contains('pcnav')) pcEdges(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (document.documentElement.classList.contains('pcnav')) pcEdges(); });

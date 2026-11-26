'use strict';
/* ================= Große Kartenansicht (Sammelkarten-Design) =================
   Jede Kartenart hat feste Felder. Regeln stehen als Schlagwörter auf der Karte,
   die Erklärung erscheint direkt auf der Karte (PC: beim Überfahren, Handy: beim Antippen).
   Varianten: '' normal (G), 'foil' Glitzer (S), 'full' Vollbild (E), 'alt' alternatives Artwork (L). */

const TC_ICON = {run: 'icons/wert-weglaufen.png', kampf: 'icons/wert-kampf.png', hand: 'icons/icon-haende.png', cards: 'icons/wert-hand.png', coin: 'icons/muenze-voll.png',
  chest: 'icons/truhe-holz-klein.png', gold: 'icons/wert-gold.png', beute: 'icons/sym-beute.png', cls: 'icons/icon-klasse.png', race: 'icons/icon-rasse.png',
  aerger: 'icons/phase-aerger.png', tuer: 'icons/phase-tuer.png', none: 'icons/icon-sonstiges.png',
  slot: {kopf: 'icons/icon-kopf.png', ruestung: 'icons/icon-ruestung.png', schuhe: 'icons/icon-schuhe.png', hand: 'icons/icon-haende.png', none: 'icons/icon-sonstiges.png'}};
const TC_WAVE = '<svg viewBox="0 0 24 24"><path fill="#2a6b9a" d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2v3c-2.5 0-2.5-2-5-2s-2.5 2-5 2-2.5-2-5-2-2.5 2-5 2zM2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2v3c-2.5 0-2.5-2-5-2s-2.5 2-5 2-2.5-2-5-2-2.5 2-5 2z"/></svg>';
// Welten (Decks): Name und Set-Symbol (einfarbige Maske, eingefärbt per CSS)
const TC_WORLD = {1: {n: 'Grunddeck', s: 'grund'}, 2: {n: 'Keller', s: 'keller'}, 3: {n: 'Wald', s: 'wald'}, 4: {n: 'Strand', s: 'strand'}, 5: {n: 'Hohe See', s: 'meer'}};
const TC_SLOT = {kopf: 'Kopf', ruestung: 'Rüstung', schuhe: 'Schuhe', hand: 'Hand', none: 'Kein Platz'};
const TC_FOES = {zwerg: ['Zwergenfeind', 'Zwerge'], elf: ['Elfenfeind', 'Elfen'], halbling: ['Koboldfeind', 'Kobolde'],
  dieb: ['Hehlerfeind', 'Hehler'], krieger: ['Kriegerfeind', 'Krieger'], priester: ['Exorzistenfeind', 'Exorzisten'], zauberer: ['Zaubererfeind', 'Zauberer'], pirat: ['Piratenfeind', 'Piraten']};
const TC_ONLY = {zwerg: 'Zwerge', elf: 'Elfen', halbling: 'Kobolde', dieb: 'Hehler', krieger: 'Krieger', priester: 'Exorzisten', zauberer: 'Zauberer', pirat: 'Piraten'};
const TC_HUNT = {und: ['Untotenjäger', 'Untote'], undead: ['Untotenjäger', 'Untote'], pilzb: ['Pilzjäger', 'Pilze'], pilz: ['Pilzjäger', 'Pilze'], meerb: ['Meeresjäger', 'Meeresmonster'],
  piratb: ['Piratenjäger', 'Piraten'], pirat: ['Piratenjäger', 'Piraten'], tiefb: ['Tiefseejäger', 'Tiefseemonster'], nager: ['Nagerjäger', 'Nager'], moewe: ['Möwenjäger', 'die Möwen-Bande']};
// Vorteile der Völker und Klassen als Schlagwörter (Erklärung wie im Kartentext)
const TC_PERKS = {
  elf: [['Scharfe Augen', 'Durchsuchst du den Raum, ziehst du 2 Karten und behältst 1.']],
  zwerg: [['Packesel', 'Du darfst beliebig viele sperrige Gegenstände tragen, und dein Rucksack fasst 5 statt 3 Karten.']],
  halbling: [['Feilschen', 'Einmal pro Zug bringt dir ein Verkauf 200 Gold extra.']],
  krieger: [['Allein stark 3', 'Kämpfst du ohne Helfer, hast du +3.']],
  zauberer: [['Gegenzauber', 'Einmal pro Kampf 2 Karten abwerfen und eine Laune oder einen Einmal-Gegenstand gegen dich aufheben. Misslingt ein Fluchtwurf: bis zu 3 Karten abwerfen, je +1.']],
  dieb: [['Schwarzmarkt', 'Du darfst auch Flüche und Launen verkaufen, für je 200 Gold.']],
  priester: [['Untotenjäger 3', 'Gegen Untote hast du +3.'], ['Geisterruhe', 'Untote verfolgen dich beim Weglaufen nie.']],
  pirat: [['Plündern', 'Gewinnst du einen Kampf ohne Helfer, ziehst du 1 Schatz mehr.'], ['Seefest', 'Bei Seegang gibst du keine Karte ab.']]
};
const tcKw = (img, t, r, o = {}) => Object.assign({img, t, r}, o);

// Fähigkeiten eines Monsters
function tcMonsterKw(c) {
  const k = [];
  if (c.meer) k.push(tcKw(null, 'Meer', 'Bei Flut +3.', {svg: TC_WAVE}));
  if (c.tiefsee) k.push(tcKw(null, 'Tiefsee', 'Weglaufen −1, außer mit Taucherhelm.', {svg: TC_WAVE}));
  if (c.soft) k.push(tcKw(null, 'Schmilzt ' + c.soft, `Bei Flut −${c.soft}.`, {svg: TC_WAVE}));
  if (c.run < 0) k.push(tcKw(TC_ICON.run, 'Verfolger ' + -c.run, `Weglaufen −${-c.run}.`));
  if (c.run > 0) k.push(tcKw(TC_ICON.run, 'Träge ' + c.run, `Weglaufen +${c.run}.`));
  if (c.noHelp) k.push(tcKw(TC_ICON.hand, 'Einzelgänger', 'Niemand darf dir in diesem Kampf helfen.', {no: true}));
  if (c.puff) k.push(tcKw(TC_ICON.kampf, 'Aufbläher ' + c.puff, `+${c.puff}, wenn dir jemand hilft.`));
  if (c.vs) {
    const f = TC_FOES[c.vs.race || c.vs.cls];
    if (f) k.push(tcKw(TC_ICON.kampf, `${f[0]} ${c.vs.val}`, `+${c.vs.val} gegen ${f[1]}.`));
  }
  if (c.np) k.push(tcKw(TC_ICON.coin, 'Gnädig ' + c.np, `Verfolgt niemanden unter Stufe ${c.np}: Wer darunter liegt, darf ihn einfach liegen lassen.`));
  return k;
}
// Pech eines Monsters bzw. Wirkung eines Fluchs
function tcBadKw(e, c) {
  if (!e) return [];
  const n = e.n || 1;
  switch (e.t) {
    case 'multi': return e.l.flatMap(x => tcBadKw(x, c));
    case 'lvl': return [tcKw(TC_ICON.coin, 'Stufenverlust ' + n, `Verliere ${n} ${pl(n, 'Stufe', 'Stufen')}.`)];
    case 'hand': return [tcKw(TC_ICON.cards, 'Kartenverlust ' + n, `Wirf ${n} zufällige ${pl(n, 'Handkarte', 'Handkarten')} ab.`)];
    case 'cheap': return [tcKw(TC_ICON.beute, 'Langfinger ' + n, n === 1 ? 'Verliere deinen billigsten Gegenstand.' : `Verliere deine ${n} billigsten Gegenstände.`)];
    case 'best': return [tcKw(TC_ICON.beute, 'Meisterdieb', 'Verliere deinen wertvollsten Gegenstand.')];
    case 'hands': return [tcKw(TC_ICON.hand, 'Entwaffnen', 'Verliere alles, was du in den Händen hältst.')];
    case 'slot': return [tcKw(TC_ICON.slot[e.s], 'Zerschlagen: ' + TC_SLOT[e.s], `Verliere den Gegenstand, den du als ${SLOTN[e.s]} trägst.`)];
    case 'class': return [tcKw(TC_ICON.cls, 'Klassenverlust', 'Verliere deine Klasse.')];
    case 'race': return [tcKw(TC_ICON.race, 'Volksverlust', 'Verliere dein Volk, du bist wieder Mensch.')];
    case 'death': return [tcKw(TC_ICON.aerger, 'Tödlich', 'Du bist tot: Handkarten und Gegenstände sind weg, Stufe, Volk und Klasse bleiben.')];
    case 'sand': return [tcKw(TC_ICON.run, 'Sandig', 'Weglaufen −2, bis du eine Stufe aufsteigst.')];
    case 'sun': return [tcKw(TC_ICON.aerger, 'Sonnenbrand', '−1 in jedem Kampf, und niemand hilft dir, bis du einen Kampf gewinnst. Sonnencreme beseitigt ihn, ein Sonnenschirm schützt davor.')];
    case 'spore': return [tcKw(TC_ICON.aerger, 'Sporen ' + n, `−${n} in jedem Kampf, bis du einen Kampf gewinnst.`)];
    case 'chill': return [tcKw(TC_ICON.kampf, 'Schwächung ' + n, `Im nächsten Kampf −${n}.`)];
    case 'seegang': return [tcKw(TC_ICON.cards, 'Seegang', (c && c.txt) || 'Alle geben 1 Handkarte an den Nachbarn weiter.')];
  }
  return [];
}
// Wirkung eines Gegenstands
function tcItemKw(c) {
  const k = [];
  if (c.b > 0) k.push(tcKw(TC_ICON.kampf, `+${c.b} im Kampf`, `Solange du ihn trägst, hast du +${c.b}.`));
  if (c.req) { const key = c.req.race || c.req.cls; k.push(tcKw(c.req.race ? TC_ICON.race : TC_ICON.cls, 'Nur ' + TC_ONLY[key], `Wirkt nur für ${reqName(c)}.`)); }
  if (c.big) k.push(tcKw(TC_ICON.chest, 'Sperrig', 'Du darfst nur einen sperrigen Gegenstand tragen, Zwerge beliebig viele.'));
  if (c.run > 0) k.push(tcKw(TC_ICON.run, 'Flink ' + c.run, `+${c.run} beim Weglaufen.`));
  if (c.run < 0) k.push(tcKw(TC_ICON.run, 'Schwerfällig ' + -c.run, `Weglaufen −${-c.run}.`));
  ['und', 'pilzb', 'meerb', 'piratb', 'tiefb'].forEach(p => { if (c[p]) k.push(tcKw(TC_ICON.kampf, `${TC_HUNT[p][0]} ${c[p]}`, `Gegen ${TC_HUNT[p][1]} +${c[p]} statt +${c.b || 0}.`)); });
  if (c.shade) k.push(tcKw(TC_ICON.aerger, 'Sonnenschutz', 'Schützt vor Sonnenbrand.'));
  if (c.flutRun) k.push(tcKw(TC_ICON.run, 'Schwimmhilfe ' + c.flutRun, `Bei Flut +${c.flutRun} beim Weglaufen.`));
  if (c.korb) k.push(tcKw(TC_ICON.beute, 'Pilzkorb', 'Für die Pilzpfanne reichen zwei verschiedene Speisepilze.'));
  if (c.diver) k.push(tcKw(TC_ICON.run, 'Taucher', 'In der Tiefsee kein Weglauf-Malus.'));
  return k;
}
// Wirkung einer Einmal-Karte
function tcOneshotKw(c) {
  const k = [];
  if (c.map) return [tcKw(TC_ICON.beute, 'Schatzkarte', c.txt)];
  if (c.b > 0) k.push(tcKw(TC_ICON.kampf, `+${c.b} einmalig`, `+${c.b} im Kampf, danach wird die Karte abgelegt.`));
  if (c.vs && c.vs.tag && TC_HUNT[c.vs.tag]) k.push(tcKw(TC_ICON.kampf, `${TC_HUNT[c.vs.tag][0]} ${c.vs.val}`, `Gegen ${TC_HUNT[c.vs.tag][1]} sogar +${c.vs.val}.`));
  if (c.escape) k.push(tcKw(TC_ICON.run, 'Flucht', 'Beim Weglaufen entkommst du ohne Würfeln, vor allen Monstern des Kampfes.'));
  if (c.cream) k.push(tcKw(TC_ICON.aerger, 'Sonnenschutz', 'Wer Sonnenbrand hat, ist ihn damit sofort los, auch außerhalb von Kämpfen.'));
  if (c.speise) k.push(tcKw(TC_ICON.beute, 'Speisepilz', 'Steinpilz, Pfifferling und Champignon zusammen ergeben eine Pilzpfanne (+1 Stufe).'));
  return k;
}
// Kartentext ohne die Regeln, die schon als Schlagwort dastehen
function tcFlavor(c) {
  if (c.k !== 'monster') return c.flv || '';
  const out = [];
  (c.txt || '').split(/(?<=[.!?“])\s+/).forEach(s => {
    s = s.replace(/,? dass Weglaufen [+−]\d+\./, '.');
    if (/^(Meer|Tiefsee|Untot|Nager|Pilz|Pirat|Boss)(, (untot|Tiefsee|Pirat|Meer))*\.$/i.test(s) || /^Bringt \d+ Stufen?\./.test(s) || /^Verfolgt niemanden/.test(s)) return;
    const i = s.indexOf(':');
    if (i > 0 && /Weglaufen|Niemand darf|[+−]\d|Bei Flut|verfolg/i.test(s.slice(i + 1))) { out.push(s.slice(0, i).trim() + '.'); return; }
    if (/^(Bei Flut|[+−]\d|Weglaufen|Niemand darf helfen)/.test(s)) return;
    out.push(s);
  });
  return out.join(' ');
}
// Kartennummer innerhalb ihrer Welt (Reihenfolge wie im Kartenpool)
let TC_NO = null;
function tcNumber(c) {
  if (!TC_NO) { TC_NO = {}; const cnt = {}; cardPool().forEach(p => { const w = p.tpl.w || 1; cnt[w] = (cnt[w] || 0) + 1; if (!TC_NO[p.tpl.n]) TC_NO[p.tpl.n] = cnt[w]; }); }
  return TC_NO[c.n] || 0;
}
// Alternative Artworks (Legendär): Kartenname -> Bild im Hochformat
const ALT_ART = {
  'Drache des Montagmorgens': 'art/alt-drache-des-montagmorgens.webp', 'Rattenkönig Rüdiger': 'art/alt-rattenkoenig-ruediger.webp',
  'Diebischer Waschbär': 'art/alt-diebischer-waschbaer.webp', 'Pilzkönigin Morchella': 'art/alt-pilzkoenigin-morchella.webp',
  'Gezeiten-Titan': 'art/alt-gezeiten-titan.webp', 'Krabbenbaron Kneifer': 'art/alt-krabbenbaron-kneifer.webp', 'Riesenkrake Klara': 'art/alt-riesenkrake-klara.webp',
  'Krieger': 'art/alt-krieger.webp', 'Kanal-Krokodil Klaus': 'art/alt-kanal-krokodil-klaus.webp', 'Bärlauch-Bär': 'art/alt-baerlauch-baer.webp',
  'Hai mit Schwimmflügeln': 'art/alt-hai-mit-schwimmfluegeln.webp', 'Käpt’n Achtarm': 'art/alt-kaeptn-achtarm.webp'
};
const TC_VAR_RAR = {'': 1, foil: 2, full: 3, alt: 4};

const tcChip = (k, bad) => `<span class="tc-chip${bad ? ' bad' : ''}"${k.r ? ` tabindex="0" data-tip="${esc(`<b>${k.t}:</b> ${k.r}`)}"` : ''}><span class="tc-ic${k.no ? ' no' : ''}">${k.svg || (k.img ? `<img src="${k.img}" alt="">` : '')}</span>${esc(k.t)}</span>`;
const tcZone = (lab, inner, cls) => `<div class="tc-zone ${cls}"><b class="tc-lab">${lab}</b>${inner}</div>`;
const tcNone = t => `<span class="tc-none">${t}</span>`;

// Die große Karte. v = Variante ('', 'foil', 'full', 'alt')
function tcHTML(c, v = '') {
  const human = c === HUMAN, chips = (l, bad) => l.map(k => tcChip(k, bad)).join('');
  let typ = TYPES[c.k] ? TYPES[c.k].l : '', val = '', valL = '', z1 = '', z2 = '', loot = '';
  let flv = tcFlavor(c);
  const flvH = () => flv ? `<span class="tc-flv">${esc(flv)}</span>` : '';
  const gold = g => g ? `<span title="Gold"><img src="${TC_ICON.gold}" alt="">${fmt(g)}</span>` : '';
  switch (c.k) {
    case 'monster': {
      const ab = tcMonsterKw(c);
      typ = [c.boss ? 'Boss' : 'Monster', c.undead && 'Untot', c.meer && 'Meer', c.tiefsee && 'Tiefsee', c.pilz && 'Pilz', c.nager && 'Nager', c.pirat && 'Pirat'].filter(Boolean).join(' · ');
      val = c.lvl; valL = 'Stufe';
      z1 = tcZone('Fähigkeiten', (ab.length ? chips(ab) : tcNone('Keine besonderen Fähigkeiten')) + flvH(), 'z1');
      z2 = tcZone('Pech', chips(tcBadKw(c.bad, c), true) || tcNone(esc(c.badTxt || '')), 'z2 bad');
      loot = `<span title="Schätze"><img src="${TC_ICON.chest}" alt="">${c.tr}</span><span title="Stufen"><img src="${TC_ICON.coin}" alt="">${c.up || 1}</span>`;
      break;
    }
    case 'curse': {
      val = '!'; valL = 'Fluch';
      z1 = tcZone('Fluch', (chips(tcBadKw(c.eff, c), true) || tcNone(esc(c.txt || ''))) + flvH(), 'z1');
      z2 = tcZone('Einsatz', chips([tcKw(TC_ICON.tuer, 'Sofort', 'Wer ihn beim Türöffnen aufdeckt, wird sofort getroffen.'), tcKw(TC_ICON.cards, 'Auf jeden', 'Von der Hand darfst du ihn jederzeit auf einen beliebigen Spieler spielen.')]), 'z2');
      break;
    }
    case 'race': case 'class': {
      const race = c.k === 'race', perks = human ? [] : (TC_PERKS[race ? c.r : c.c] || []).map(([t, r]) => tcKw(race ? TC_ICON.race : TC_ICON.cls, t, r));
      val = `<img src="${race ? TC_ICON.race : TC_ICON.cls}" alt="">`; valL = race ? 'Volk' : 'Klasse';
      z1 = tcZone('Vorteil', (perks.length ? chips(perks) : tcNone(human ? 'Keine Besonderheit' : esc(c.txt || ''))) + flvH(), 'z1');
      z2 = tcZone('Regel', human ? chips([tcKw(TC_ICON.race, 'Ohne Volkskarte', c.txt)])
        : chips([tcKw(TC_ICON.cards, race ? 'Nur ein Volk' : 'Nur eine Klasse', race ? 'Du hast höchstens ein Volk. Ein neues ersetzt das alte.' : 'Du hast höchstens eine Klasse. Eine neue ersetzt die alte.'),
          tcKw(TC_ICON.tuer, 'Jederzeit ablegen', 'Du darfst die Karte jederzeit ablegen.')]), 'z2');
      break;
    }
    case 'item': {
      const ab = tcItemKw(c);
      if (ab.some(k => k.r === flv)) flv = '';
      val = c.b ? '+' + c.b : `<img src="${TC_ICON.slot[c.slot] || TC_ICON.none}" alt="">`; valL = c.b ? 'Bonus' : TC_SLOT[c.slot];
      z1 = tcZone('Wirkung', (ab.length ? chips(ab) : tcNone('Keine Besonderheit')) + flvH(), 'z1');
      const eq = [tcKw(TC_ICON.slot[c.slot] || TC_ICON.none, TC_SLOT[c.slot] || 'Kein Platz', c.slot === 'none' ? 'Belegt keinen Platz, du kannst ihn zusätzlich tragen.' : `Belegt den Platz ${SLOTN[c.slot]}.`)];
      if (c.slot === 'hand') eq.push(tcKw(TC_ICON.hand, c.hands === 2 ? 'Zweihändig' : 'Einhändig', c.hands === 2 ? 'Belegt beide Hände.' : 'Belegt eine Hand.'));
      z2 = tcZone('Ausrüstung', chips(eq), 'z2');
      loot = gold(c.g);
      break;
    }
    case 'oneshot': {
      const ab = tcOneshotKw(c);
      val = c.b ? '+' + c.b : `<img src="${c.escape ? TC_ICON.run : TC_ICON.beute}" alt="">`; valL = c.b ? 'Bonus' : 'Einmal';
      z1 = tcZone('Wirkung', (ab.length ? chips(ab) : tcNone(esc(c.txt || ''))) + flvH(), 'z1');
      const use = c.map ? [tcKw(TC_ICON.tuer, 'Eigener Zug', 'Mit beiden Hälften in deinem Zug den Schatz ausgraben.')]
        : c.escape ? [tcKw(TC_ICON.run, 'Beim Weglaufen', 'Statt zu würfeln, wenn du wegläufst.')]
        : [tcKw(TC_ICON.kampf, 'Im Kampf', 'Nur während eines Kampfes spielbar.'), c.pOnly ? tcKw(TC_ICON.hand, 'Nur Kämpfer', 'Nur für die kämpfende Seite, nicht für das Monster.') : tcKw(TC_ICON.cards, 'Jede Seite', 'Für dich, einen Mitspieler oder für das Monster.')];
      z2 = tcZone('Einsatz', chips(use), 'z2');
      loot = gold(c.g);
      break;
    }
    case 'enh': {
      val = sign(c.v); valL = 'Monster';
      const ab = [tcKw(TC_ICON.kampf, 'Monster ' + sign(c.v), `Das Monster bekommt ${sign(c.v)}.`)];
      if (c.trm > 0) ab.push(tcKw(TC_ICON.chest, 'Extra-Beute ' + c.trm, `Wer das Monster besiegt, zieht ${c.trm} ${pl(c.trm, 'Schatz', 'Schätze')} mehr.`));
      if (c.trm < 0) ab.push(tcKw(TC_ICON.chest, 'Magere Beute ' + -c.trm, `Wer das Monster besiegt, zieht ${-c.trm} ${pl(-c.trm, 'Schatz', 'Schätze')} weniger.`));
      z1 = tcZone('Wirkung', chips(ab) + flvH(), 'z1');
      z2 = tcZone('Einsatz', chips([tcKw(TC_ICON.kampf, 'Jeder Kampf', 'In einem beliebigen Kampf auf ein Monster spielen, auch in fremden.')]), 'z2');
      loot = `<span title="Schätze"><img src="${TC_ICON.chest}" alt="">${sign(c.trm)}</span>`;
      break;
    }
    case 'levelup': {
      val = '+1'; valL = 'Stufe';
      z1 = tcZone('Wirkung', chips([tcKw(TC_ICON.coin, 'Aufstieg 1', 'Steige sofort 1 Stufe auf.')]) + flvH(), 'z1');
      z2 = tcZone('Einsatz', chips([tcKw(TC_ICON.tuer, 'Eigener Zug', 'Nur in deinem eigenen Zug, außerhalb von Kämpfen.'), tcKw(TC_ICON.coin, 'Kein Sieg', 'Damit darfst du nicht die letzte Stufe zum Sieg holen.')]), 'z2');
      break;
    }
    case 'amulet': {
      val = '★'; valL = 'Sonder';
      z1 = tcZone('Wirkung', chips([tcKw(TC_ICON.aerger, 'Fluchschutz', 'Der Fluch, der dich gerade trifft, wirkt nicht.')]) + flvH(), 'z1');
      z2 = tcZone('Einsatz', chips([tcKw(TC_ICON.aerger, 'Bei Fluch', 'Spiele die Karte in dem Moment, in dem dich ein Fluch trifft.')]), 'z2');
      break;
    }
    default: {   // Sonderkarten wie Hinterhalt
      val = '★'; valL = 'Sonder';
      z1 = tcZone('Wirkung', chips([tcKw(TC_ICON.aerger, c.n, c.txt || '')]) + flvH(), 'z1');
      z2 = tcZone('Einsatz', chips([tcKw(TC_ICON.kampf, 'Fremder Kampf', 'In einem Kampf, in dem du nicht selbst kämpfst.')]), 'z2');
    }
  }
  const w = TC_WORLD[c.w || 1] || TC_WORLD[1], nr = human ? 0 : tcNumber(c);
  const altArt = v === 'alt' && ALT_ART[c.n];
  if (v === 'alt' && !altArt) v = 'full';
  const art = altArt || ART[c.n];
  const rar = TC_VAR_RAR[v] || 1;
  const nf = Math.min(7, 7 * 15 / Math.max(15, c.n.length));
  const vCls = v === 'foil' ? ' v-foil' : v === 'full' ? ' v-full' : v === 'alt' ? ' v-full v-alt' : '';
  const artH = art ? `<img src="${art}" alt="" draggable="false">` : `<img class="tc-noart" src="${human ? TC_ICON.race : TC_ICON.none}" alt="">`;
  return `<div class="tc k-${c.k}${vCls}"><div class="tc-f">
    <div class="tc-art">${art ? `<i class="tc-blur" style="background-image:url('${art}')"></i>` : ''}${artH}<i class="tc-spk"></i></div><i class="tc-pat"></i>
    <div class="tc-coin tc-lv"><b>${val}</b><small>${valL}</small></div>
    <div class="tc-coin tc-sym" title="${w.n}"><i style="-webkit-mask-image:url(icons/deck-${w.s}.png);mask-image:url(icons/deck-${w.s}.png)"></i></div>
    <div class="tc-rib" style="--nf:${nf}cqw">${esc(c.n)}</div><div class="tc-typ">${human ? 'Volk · keine Karte' : typ}</div>
    <div class="tc-zones">${z1}${z2}</div><div class="tc-loot">${loot}</div>
    ${nr ? `<span class="tc-rar" data-rar="${rar}" title="${RARITY ? RARITY[rar].n : ''}"><b>${'GSEL'[rar - 1]}</b>${String(nr).padStart(3, '0')}</span>` : ''}
    <div class="tc-tip"></div><i class="tc-spk tc-spk-all"></i></div></div>`;
}

// Erklärung eines Schlagworts: erscheint auf der Karte direkt über dem Schlagwort
function tcShowTip(ch) {
  const f = ch.closest('.tc-f'), tip = f && f.querySelector('.tc-tip'); if (!tip) return;
  const fr = f.getBoundingClientRect(), cr = ch.getBoundingClientRect();
  tip.innerHTML = ch.dataset.tip; tip.style.bottom = (fr.bottom - cr.top + fr.width * .02) + 'px'; tip.classList.add('on');
}
const tcHideTips = () => document.querySelectorAll('.tc-tip.on').forEach(t => t.classList.remove('on'));
if (typeof document !== 'undefined') {
  document.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const ch = e.target.closest && e.target.closest('.tc-chip[data-tip]'); if (ch) tcShowTip(ch); });
  document.addEventListener('pointerout', e => { if (e.pointerType !== 'mouse') return; const ch = e.target.closest && e.target.closest('.tc-chip[data-tip]'); if (ch && !ch.contains(e.relatedTarget)) tcHideTips(); });
  document.addEventListener('click', e => {
    const ch = e.target.closest && e.target.closest('.tc-chip[data-tip]');
    const open = ch && ch.closest('.tc-f').querySelector('.tc-tip.on');
    tcHideTips(); if (ch && !open) { e.stopPropagation(); tcShowTip(ch); }
  }, true);
  // Glitzer und Neigung folgen Maus oder Finger
  document.addEventListener('pointermove', e => {
    const f = e.target.closest && e.target.closest('.tc.v-foil .tc-f, .tc.v-full .tc-f'); if (!f) return;
    const r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    f.style.transform = `rotateY(${(x - .5) * 14}deg) rotateX(${(.5 - y) * 14}deg)`; f.style.setProperty('--mx', x * 100 + '%'); f.style.setProperty('--my', y * 100 + '%');
  });
  document.addEventListener('pointerout', e => { const f = e.target.closest && e.target.closest('.tc-f'); if (f && f.style.transform && !f.contains(e.relatedTarget)) f.style.transform = ''; });
}

/* ================= Sammlung: Varianten, die man besitzt, und das gewählte Design ================= */
// STORY.coll[Name] = {foil: 1, full: 1, alt: 1}, STORY.cvar[Name] = gewählte Variante. Normal (G) besitzt jeder.
const VARIANT_NAMES = {'': 'Normal', foil: 'Glitzer', full: 'Vollbild', alt: 'Legendär'};
const collOwned = (n, v) => !v || !!(STORY.coll && STORY.coll[n] && STORY.coll[n][v]);
function collAdd(n, v) {
  STORY.coll = STORY.coll || {}; const e = STORY.coll[n] = STORY.coll[n] || {};
  if (e[v]) return false;
  e[v] = 1; return true;
}
function cardVariant(c) {
  const v = STORY.cvar && STORY.cvar[c.n];
  return v && collOwned(c.n, v) && (v !== 'alt' || ALT_ART[c.n]) ? v : '';
}
function setCardVariant(n, v) {
  if (!collOwned(n, v)) return false;
  STORY.cvar = STORY.cvar || {};
  if (v) STORY.cvar[n] = v; else delete STORY.cvar[n];
  saveStory(); return true;
}
// Welche Varianten es von einer Karte gibt
const cardVariants = n => ['', 'foil', 'full'].concat(ALT_ART[n] ? ['alt'] : []);

/* ================= Booster ================= */
// Kein Glücksspiel für Echtgeld: Booster gibt es nur für erspielte Münzen oder aus Truhen.
// Dritter Platz: 5 % Legendär, 45 % Vollbild, sonst Glitzer. Die ersten beiden sind immer Glitzer.
const BOOSTER = {price: 60, alt: 0.05, full: 0.45, pity: 0.5, dup: {foil: 10, full: 25, alt: 100}};
const BOOSTER_DECK = {2: 'keller', 3: 'wald', 4: 'strand', 5: 'meer'};
// Welten, deren Booster man bekommen kann: Grunddeck immer, die anderen, sobald ihr Deck freigeschaltet ist
const BOOSTER_SLOTS = 5;
const boosterAll = () => Object.keys(TC_WORLD).map(Number).sort((a, b) => a - b);
const boosterWorlds = () => boosterAll().filter(w => w === 1 || (typeof deckById === 'function' && deckById(BOOSTER_DECK[w]) && deckById(BOOSTER_DECK[w]).unlocked()));
const boosterPool = w => [...new Set(cardPool().filter(p => (p.tpl.w || 1) === w).map(p => p.tpl.n))];
const boostersWaiting = () => STORY.boosters || [];
function grantBooster(w) { (STORY.boosters = STORY.boosters || []).push(w); saveStory(); }
// Sammelstand einer Welt
function collStats(w) {
  const pool = boosterPool(w), cnt = v => pool.filter(n => collOwned(n, v)).length;
  return {n: pool.length, foil: cnt('foil'), full: cnt('full'), alt: pool.filter(n => ALT_ART[n] && collOwned(n, 'alt')).length, altN: pool.filter(n => ALT_ART[n]).length};
}
// Alles gesammelt (jede Karte in Glitzer und Vollbild, alle alternativen Artworks): ein Booster bringt nur noch Münzen
function collComplete(w) { const c = collStats(w); return c.n > 0 && c.foil === c.n && c.full === c.n && c.alt === c.altN; }
// Auswahl der Vitrine für einen Tag (rein rechnerisch, damit sie sich testen lässt).
// Fach 1: die neueste freigeschaltete Welt. Passen alle übrigen in die Fächer, liegen sie alle drin.
// Sonst kommen sie aus einem gemischten Stapel, ohne Zurücklegen: jede Welt ist dran, bevor neu gemischt wird.
// Komplett gesammelte Welten kommen nur bei jedem zweiten Mischen in den Stapel.
// st = {bag: [...], round: n} wird dabei fortgeschrieben; keep = schon gezogene Welten dieses Tages, die bleiben.
function boosterPick(unlocked, st, complete = () => false, keep = [], r = Math.random) {
  const u = [...unlocked].sort((a, b) => a - b); if (!u.length) return [];
  const newest = u[u.length - 1], rest = u.slice(0, -1), n = BOOSTER_SLOTS - 1;
  if (rest.length <= n) return [newest, ...rest];
  const out = keep.filter(w => rest.includes(w)).slice(0, n);
  st.bag = (st.bag || []).filter(w => rest.includes(w) && !out.includes(w));
  let guard = 0;
  while (out.length < n && guard++ < 50) {
    if (!st.bag.length) {
      st.round = (st.round || 0) + 1;
      let fresh = rest.filter(w => !out.includes(w) && (!complete(w) || st.round % 2 === 0));
      if (!fresh.length) fresh = rest.filter(w => !out.includes(w));
      for (let i = fresh.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [fresh[i], fresh[j]] = [fresh[j], fresh[i]]; }
      st.bag = fresh;
    }
    out.push(st.bag.shift());
  }
  return [newest, ...out.sort((a, b) => a - b)];
}
const boosterRotates = () => boosterWorlds().length > BOOSTER_SLOTS;
// Booster-Regal im Krämerladen: bis zu 5 Welten am Tag, je ein Booster. Gekauft ist er bis morgen weg.
// Die Auswahl wird einmal am Tag festgelegt und gespeichert; wird mittags eine neue Welt frei, rückt sie in Fach 1.
function boosterOffers() {
  const d = dailyState(), u = boosterWorlds();
  if (!d.bSold || d.bSold.day !== d.day) { d.bSold = {day: d.day, w: []}; saveDaily(); }
  const key = u.join(',');
  if (!d.bPick || d.bPick.day !== d.day || d.bPick.u !== key) {
    const st = STORY.bRot = STORY.bRot || {bag: [], round: 0};
    const keep = d.bPick && d.bPick.day === d.day ? d.bPick.w.slice(1) : [];
    d.bPick = {day: d.day, u: key, w: boosterPick(u, st, collComplete, keep)};
    saveDaily(); saveStory();
  }
  return d.bPick.w.map(w => ({w, sold: d.bSold.w.includes(w)}));
}
function buyBooster(w) {
  const o = boosterOffers().find(x => x.w === w); if (!o || o.sold) return 'none';
  if (STORY.coins < BOOSTER.price) return 'poor';
  STORY.coins -= BOOSTER.price; dailyState().bSold.w.push(w); saveDaily(); grantBooster(w); return 'ok';
}
// Einen Booster öffnen: 2 Glitzer, dazu ein dritter Platz mit Glitzer, Vollbild oder Legendär (siehe BOOSTER). Jeder Platz zieht mit 50 % aus fehlenden Karten.
// Doppelte werden zu Münzen. Neue Varianten werden gleich als Design gewählt, wenn die Karte bisher normal gespielt wurde.
function openBooster(r = Math.random) {
  const list = STORY.boosters || []; if (!list.length) return null;
  const w = list.shift(), pool = boosterPool(w), picked = new Set(), out = [];
  const pick = (v, from) => {
    const free = from.filter(n => !picked.has(n)), miss = free.filter(n => !collOwned(n, v)), src = miss.length && r() < BOOSTER.pity ? miss : free;
    const n = src[Math.floor(r() * src.length)]; picked.add(n); return n;
  };
  const alts = pool.filter(n => ALT_ART[n]), roll = r();
  const third = alts.length && roll < BOOSTER.alt ? 'alt' : roll < BOOSTER.alt + BOOSTER.full ? 'full' : 'foil';
  ['foil', 'foil', third].forEach(v => {
    const n = pick(v, v === 'alt' ? alts : pool), isNew = collAdd(n, v), coins = isNew ? 0 : BOOSTER.dup[v];
    if (isNew && !(STORY.cvar && STORY.cvar[n])) { STORY.cvar = STORY.cvar || {}; STORY.cvar[n] = v; }
    else if (isNew && (v === 'alt' || (v === 'full' && STORY.cvar[n] === 'foil'))) STORY.cvar[n] = v;
    STORY.coins += coins; out.push({n, v, dup: !isNew, coins});
  });
  saveStory();
  return {w, cards: out, coins: out.reduce((s, x) => s + x.coins, 0)};
}

/* ================= Designauswahl auf der Kartenseite ================= */
// Unter der großen Karte (nur in der Kartenübersicht): Normal, Glitzer, Vollbild, Legendär. Gesperrte lassen sich ansehen, aber nicht wählen.
function cvSelectHTML(c, pv) {
  const cur = cardVariant(c), w = TC_WORLD[c.w || 1] || TC_WORLD[1];
  const btns = cardVariants(c.n).map(v => {
    const own = collOwned(c.n, v), on = (pv != null ? pv : cur) === v;
    return `<button type="button" class="cv-b${on ? ' on' : ''}${own ? '' : ' lock'}${cur === v ? ' sel' : ''}" data-cvar="${v}" data-cvn="${esc(c.n)}" aria-pressed="${on}">` +
      `<i class="cv-r" data-rar="${TC_VAR_RAR[v]}">${'GSEL'[TC_VAR_RAR[v] - 1]}</i><span>${VARIANT_NAMES[v]}</span>${own ? (cur === v ? '<small>Gewählt</small>' : '<small>Wählen</small>') : '<small>Fehlt</small>'}</button>`;
  }).join('');
  const shown = pv != null ? pv : cur;
  const note = collOwned(c.n, shown) ? '' : `<p class="cv-note">Noch nicht in deiner Sammlung. ${shown === 'alt' ? 'Mit viel Glück' : 'Zu finden'} in Boostern der Welt „${w.n}“.</p>`;
  return `<div class="cvsel">${btns}</div>${note}`;
}

/* ================= Booster öffnen ================= */
const BOOSTER_LOOK = {1: 'grund', 2: 'keller', 3: 'wald', 4: 'strand', 5: 'meer'};
// Booster-Packung: Bild je Welt (art/booster-*.webp), Weltname auf dem goldenen Banner.
// Der gezackte obere Rand ist ein eigener Ausschnitt desselben Bildes, damit er beim Öffnen abreißen kann.
function boosterPackHTML(w, cls = '') {
  const wd = TC_WORLD[w], src = `art/booster-${BOOSTER_LOOK[w]}.webp`;
  return `<span class="bpack w-${BOOSTER_LOOK[w]}${cls}" style="--bimg:url('${src}')"><img class="bpk-body" src="${src}" alt="" draggable="false">` +
    `<img class="bpk-top" src="${src}" alt="" draggable="false"><b class="bpk-name">${esc(wd.n)}</b><span class="bpk-shine"></span></span>`;
}
// Overlay: Booster wackelt, reißt auf, drei Karten fliegen verdeckt heraus und drehen sich nacheinander um.
// Doppelte bekommen einen Stempel, ihre Münzen fliegen nach oben.
function showBooster(onDone) {
  const w0 = boostersWaiting()[0]; if (!w0 || document.querySelector('.bstov')) return;
  const el = document.createElement('div'); el.className = 'bstov';
  el.innerHTML = `<div class="bst-rays" aria-hidden="true"><i></i></div><div class="bst-box"><span class="bst-name">Booster ${esc(TC_WORLD[w0].n)}</span>` +
    `<button type="button" class="bst-pack idle" aria-label="Booster öffnen">${boosterPackHTML(w0)}</button>` +
    `<p class="bst-hint">Tippe auf den Booster!</p><div class="bst-cards"></div><div class="bst-sum" hidden></div>` +
    `<div class="bst-acts" hidden></div><button type="button" class="bst-later">Später öffnen</button></div>`;
  document.body.appendChild(el); if (typeof Snd !== 'undefined') Snd.sfx('deal');
  const close = () => { el.remove(); onDone && onDone(); };
  el.querySelector('.bst-later').addEventListener('click', close);
  const pack = el.querySelector('.bst-pack');
  pack.addEventListener('click', () => {
    if (pack.disabled) return; pack.disabled = true;
    el.querySelector('.bst-hint').hidden = true; el.querySelector('.bst-later').hidden = true;
    pack.classList.remove('idle'); pack.classList.add('shake');
    if (typeof Snd !== 'undefined') Snd.sfx('foil'); if (typeof buzz === 'function') buzz([20, 60, 20, 60, 30]);
    const fast = typeof UI !== 'undefined' && UI.reduce;
    setTimeout(() => {
      const res = openBooster(); if (!res) { close(); return; }
      pack.classList.remove('shake'); pack.classList.add('torn'); el.classList.add('open');
      if (typeof Snd !== 'undefined') { Snd.sfx('tear'); setTimeout(() => Snd.sfx('whoosh'), 250); }
      const box = el.querySelector('.bst-cards');
      box.innerHTML = res.cards.map((x, i) => `<button type="button" class="bst-card r-${x.v}" style="--i:${i}" data-bcard="${esc(x.n)}" data-bv="${x.v}">` +
        `<span class="bst-in"><span class="bst-back"><i style="-webkit-mask-image:url(icons/deck-${TC_WORLD[res.w].s}.png);mask-image:url(icons/deck-${TC_WORLD[res.w].s}.png)"></i></span>` +
        `<span class="bst-front">${tcHTML(POOLCAT[x.n] || CATALOG[x.n], x.v)}${x.dup ? `<span class="bst-dup">Doppelt</span><span class="bst-coin"><img src="icons/muenze-voll.png" alt="">+${x.coins}</span>` : '<span class="bst-new">Neu</span>'}</span></span></button>`).join('');
      // Der Spieler dreht jede Karte selbst um (in beliebiger Reihenfolge). Die dritte Karte (Vollbild bzw. Legendär) bekommt den großen Auftritt.
      const hint = el.querySelector('.bst-hint');
      const flip = (i, charged) => {
        const b = box.children[i]; if (!b || b.classList.contains('flip') || b.classList.contains('charge')) return;
        const x = res.cards[i], last = i === res.cards.length - 1;
        // Die seltene dritte Karte: erst zittern und Trommelwirbel, dann aufdecken
        if (last && !charged && !fast) { b.classList.add('charge'); if (typeof Snd !== 'undefined') Snd.sfx('roll', x.v === 'alt' ? 1.1 : 0.7); if (typeof buzz === 'function') buzz([15, 40, 15, 40, 15, 40]);
          setTimeout(() => { b.classList.remove('charge'); flip(i, true); }, x.v === 'alt' ? 1100 : 750); return; }
        b.classList.add('flip');
        if (typeof Snd !== 'undefined') Snd.sfx(x.v === 'alt' ? 'revealL' : x.v === 'full' ? 'revealE' : 'revealS');
        if (last && typeof buzz === 'function') buzz(x.v === 'alt' ? [60, 40, 120] : [40, 30, 60]);
        if (last && x.v !== 'foil') { el.classList.add('peak', 'peak-' + x.v); if (typeof Particles !== 'undefined') { const r = b.getBoundingClientRect(); Particles.burst(r.left + r.width / 2, r.top + r.height / 2, x.v === 'alt' ? 60 : 30, 1.2); } }
        if (x.dup) setTimeout(() => { b.classList.add('dup'); if (typeof Snd !== 'undefined') { Snd.sfx('stamp'); setTimeout(() => Snd.sfx('coin'), 380); } }, fast ? 0 : last ? 900 : 420);
        if (box.querySelectorAll('.bst-card:not(.flip)').length === 0) { hint.hidden = true; setTimeout(finish, fast ? 0 : 900); }
      };
      box.querySelectorAll('.bst-card').forEach((b, i) => b.addEventListener('click', e => { if (!b.classList.contains('flip')) { e.stopPropagation(); flip(i); } }));
      const finish = () => {
        const nNew = res.cards.filter(x => !x.dup).length, sum = el.querySelector('.bst-sum'), acts = el.querySelector('.bst-acts');
        sum.innerHTML = `${nNew ? `<b>${nNew} ${nNew === 1 ? 'neue Karte' : 'neue Karten'}</b>` : '<b>Nur Doppelte</b>'}${res.coins ? `<span>Für Doppelte gibt es stattdessen <img src="icons/muenze-voll.png" alt="">${res.coins} Münzen.</span>` : ''}<small>Tippe auf eine Karte, um sie groß anzusehen.</small>`;
        const more = boostersWaiting().length;
        acts.innerHTML = (more ? `<button type="button" class="btn primary" data-bnext>Nächsten öffnen (${more})</button>` : '') + `<button type="button" class="btn${more ? '' : ' primary'}" data-bdone>Fertig</button>`;
        sum.hidden = false; acts.hidden = false;
        acts.querySelector('[data-bdone]').addEventListener('click', close);
        const nx = acts.querySelector('[data-bnext]'); if (nx) nx.addEventListener('click', () => { el.remove(); showBooster(onDone); });
      };
      setTimeout(() => { box.classList.add('ready'); hint.textContent = 'Tippe auf eine Karte, um sie umzudrehen!'; hint.hidden = false; }, fast ? 0 : 700);
    }, fast ? 50 : 900);
  });
  // Aufgedeckte Karte antippen: groß ansehen
  el.addEventListener('click', e => {
    const b = e.target.closest('.bst-card.flip'); if (!b || e.target.closest('.tc-chip')) return;
    if (typeof openSheet === 'function') openSheet({id: 'card', cname: b.dataset.bcard, pv: b.dataset.bv, look: true});
  });
}

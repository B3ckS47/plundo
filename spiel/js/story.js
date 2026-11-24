'use strict';
/* ================= Storymodus: Welten, Stationen, Fortschritt =================
   Nur Daten und Logik, keine Oberfläche. ui.js zeichnet Karte, Blätter und Ergebnis.
   Eine Station beschreibt ihr Szenario (scn) so, wie es die Engine als SCN erwartet. */
const K_STORY = 'loota.story';

// Freischaltbare Optik. Rahmenfarben und Porträts übernimmt der Charakter-Bildschirm.
const COSMETICS = {
  title: {
    neuling: 'Neuling',
    hasenfuss: 'Hasenfuß',   // Easter Egg: nur wer die Probepartie der Einführung verliert
    stammgast: 'Stammgast',
    brueckenbezwinger: 'Brückenbezwinger',
    montagsheld: 'Montagsheld',
    kellerkind: 'Kellerkind',
    geisterjaeger: 'Geisterjäger',
    fassfluesterer: 'Fassflüsterer',
    rattenschreck: 'Rattenschreck',
    pilzkenner: 'Pilzkenner',
    wurzelfluesterer: 'Wurzelflüsterer',
    schwammerlsucher: 'Schwammerlsucher',
    myzelmeister: 'Myzelmeister',
    sandfuss: 'Sandfuß',
    leuchtturmwaechter: 'Leuchtturmwächter',
    wellenreiter: 'Wellenreiter',
    strandkoenig: 'Herr der Strandkörbe',
    leichtmatrose: 'Leichtmatrose',
    krabbenbezwinger: 'Krabbenbezwinger',
    seebaer: 'Seebär',
    kaepten: 'Käpt’n des Stammtischs',
    // Krämerladen
    gluckspilz: 'Glückspilz',
    wuerfelkoenig: 'Würfelkönig',
    kartenhai: 'Kartenhai',
    fruehaufsteher: 'Frühaufsteher',
    nachteule: 'Nachteule',
    schatzsucher: 'Schatzsucher',
    // Nur aus Truhen
    truhenknacker: 'Truhenknacker',
    gluecksritter: 'Glücksritter',
    dauerbrenner: 'Dauerbrenner',
    stammtischlegende: 'Stammtischlegende'
  },
  frame: {
    kupferkessel: {n: 'Kupferkessel', c: '#c8773a'},
    moewenfeder: {n: 'Möwenfeder', c: '#e9eef2'},
    rattengrau: {n: 'Rattengrau', c: '#8b9096'},
    kerzenwachs: {n: 'Kerzenwachs', c: '#f1e2b8'},
    goldkronkorken: {n: 'Goldener Kronkorken', c: '#e8b923'},
    moosgruen: {n: 'Moosgrün', c: '#6a9a3e'},
    fliegenpilz: {n: 'Fliegenpilz', c: '#c8352b'},
    leuchtpilz: {n: 'Leuchtpilz', c: '#7fe3d4'},
    strandtuch: {n: 'Strandtuch', c: '#e2574c'},
    rettungsring: {n: 'Rettungsring', c: '#f26b3a'},
    meeresschaum: {n: 'Meeresschaum', c: '#9fe0dc'},
    walblau: {n: 'Walblau', c: '#4a7fb5'},
    dublonengold: {n: 'Dublonengold', c: '#d9a63a'},
    korallenrot: {n: 'Korallenrot', c: '#e06650'},
    // Krämerladen und Serie
    bierdeckel: {n: 'Bierdeckel', c: '#d9b38c'},
    abendrot: {n: 'Abendrot', c: '#e8774a'},
    mitternacht: {n: 'Mitternacht', c: '#2c3e70'},
    eichenholz: {n: 'Eichenholz', c: '#8a5a2b'},
    lavendel: {n: 'Lavendel', c: '#a98bd6'},
    perlmutt: {n: 'Perlmutt', c: '#efe6f5'},
    wochenstammgast: {n: 'Wochenstammgast', c: '#f0b429'},
    // Nur aus der Goldtruhe
    truhenbeschlag: {n: 'Truhenbeschlag', c: '#6b4a2b'},
    schluesselbund: {n: 'Schlüsselbund', c: '#c9a227'},
    edelsteine: {n: 'Edelsteinkranz', c: '#b03a7a'}
  },
  portrait: {
    hoppel: {n: 'Hoppel', src: 'icons/portrait-hoppel.png'},   // Easter Egg (siehe hasenfuss)
    gartenzwerg: {n: 'Gartenzwerg', src: 'icons/portrait-gartenzwerg.png'},
    rentner: {n: 'Rentner-Ritter', src: 'icons/portrait-rentner.png'},
    rosi: {n: 'Ratte Rosi', src: 'icons/portrait-rosi.png'},
    flora: {n: 'Fee Flora', src: 'icons/portrait-flora.png'},
    sunny: {n: 'Surfer Sunny', src: 'icons/portrait-sunny.png'},
    walburga: {n: 'Wal Walburga', src: 'icons/portrait-walburga.png'},
    // Krämerladen: die Gegner aus Taverne, Keller und Wald
    berta: {n: 'Berta', src: 'icons/portrait-berta.png'},
    kalle: {n: 'Kalle', src: 'icons/portrait-kalle.png'},
    uschi: {n: 'Uschi', src: 'icons/portrait-uschi.png'},
    hilde: {n: 'Wirtin Hilde', src: 'icons/portrait-hilde.png'},
    fridolin: {n: 'Fass Fridolin', src: 'icons/portrait-fridolin.png'},
    gustav: {n: 'Gespenst Gustav', src: 'icons/portrait-gustav.png'},
    trudi: {n: 'Trüffelschwein Trudi', src: 'icons/portrait-trudi.png'},
    walter: {n: 'Waldschrat Walter', src: 'icons/portrait-walter.png'},
    bruno: {n: 'Bademeister Bruno', src: 'icons/portrait-bruno.png'},
    gesine: {n: 'Möwe Gesine', src: 'icons/portrait-gesine.png'},
    pepe: {n: 'Papagei Pepe', src: 'icons/portrait-pepe.png'},
    sardella: {n: 'Smutje Sardella', src: 'icons/portrait-sardella.png'},
    // Nur aus der Goldtruhe
    minka: {n: 'Tavernenkatze Minka', src: 'icons/portrait-minka.png'},
    klappi: {n: 'Mimik Klappi', src: 'icons/portrait-klappi.png'},
    kurt: {n: 'Schlüsselmeister Kurt', src: 'icons/portrait-kurt.png'}
  },
  // Hintergründe hinter Porträt und Werten. Grafik im Querformat 3 : 1 (art/kulisse-…), p = Schwerpunkt für den Ausschnitt
  bg: {
    staedtchen: {n: 'Städtchen', p: '50% 55%'},
    weinkeller: {n: 'Weinkeller', p: '50% 60%'},
    zauberwald: {n: 'Zauberwald', p: '50% 55%'},
    sandstrand: {n: 'Sandstrand', p: '40% 55%'},
    hohesee: {n: 'Hohe See', p: '50% 62%'},
    // Krämerladen
    sternennacht: {n: 'Sternennacht', p: '50% 55%'},
    abendrot: {n: 'Abendrot', p: '50% 55%'},
    // Nur aus der Goldtruhe
    schatzkammer: {n: 'Schatzkammer', p: '50% 62%'}
  }
};
function cosmeticName(id) {
  const [k, key] = id.split(':'), c = COSMETICS[k] && COSMETICS[k][key];
  if (!c) return id;
  const kind = {title: 'Titel', frame: 'Rahmen', portrait: 'Porträt', bg: 'Hintergrund'}[k];
  return `${kind} „${typeof c === 'string' ? c : c.n}“`;
}

const storyWon = S => S.winner === 0;
const WORLDS = [{
  /* Welt 0: Einführung bei Hilde. Jede Station bringt ein Thema bei, Hilde erklärt Schritt für Schritt (Lektionen in ui.js, je Station).
     Wer die Regeln kennt, startet direkt in Welt 1: die ist von Anfang an offen. */
  id: 'w0', n: 0, name: 'Hildes Taverne', short: 'Einführung', face: 'icons/portrait-hilde.png', deck: 'grund', mapH: 600, map: 'art/karte-welt0.webp', mapRatio: 768 / 1376, intro0: true,
  intro: 'Hilde wischt gerade die Theke, als du hereinkommst. „Neu hier? Dann zeig ich dir erst mal, wie bei uns gespielt wird. Keine Sorge, Berta beißt nicht.“ Wer die Regeln schon kennt, kann gleich mit Welt 1 loslegen.',
  outro: 'Hilde nickt zufrieden: „Jetzt kennst du alles, was du brauchst. Der Rest kommt mit der Übung.“ Am Stammtisch tuscheln Berta, Kalle und Uschi schon über dich.',
  landmarks: [['Theke', 50, 30], ['Ecktisch', 72, 175], ['Hinterzimmer', 30, 285], ['Kellertür', 72, 395], ['Stammtisch', 30, 505]],
  stations: [
    {id: 'w0s1', face: 'icons/portrait-hilde.png', no: '1', x: 50, y: 80, ax: 58, ay: 22, type: 'tutorial', name: 'Willkommen', place: 'Theke',
      text: 'Hilde stellt dir einen Becher hin: „Du hast noch nie Plundo gespielt? Kein Problem. Ich zeig dir erst mal, worum es geht und was du alles auf dem Tisch siehst.“',
      goal: 'Lerne, worum es geht und wie der Spieltisch aufgebaut ist. Dann besiegst du dein erstes Monster.',
      scn: {tut: 'w0s1', target: 2, bots: ['Berta'], diff: 'gemuetlich',
        start: {lvl: 1, eq: ['Rostiges Schwert'], hand: ['Topfhelm mit Delle'], deal: false},
        botStart: {Berta: {lvl: 1, eq: ['Hörnerhelm'], deal: false}},
        botStyles: {Berta: {help: 0, curse: 0, intf: 0, l: 'schaut heute nur zu'}},
        deck: {door: ['Wütender Gartenzwerg', 'Kobold', 'Zauberer'],
          tr: ['Lederschürze', 'Glücksumhang']}},
      reward: 'title:neuling',
      winText: '„Dein erstes Monster!“, ruft Hilde. „Stufe 2, und schon hast du gewonnen. Beim nächsten Mal kümmern wir uns um deine Ausrüstung.“'},
    {id: 'w0s2', req: ['w0s1'], face: 'icons/portrait-hilde.png', no: '2', x: 22, y: 190, ax: 85, ay: 41, type: 'tutorial', name: 'Wer bin ich?', place: 'Ecktisch',
      text: '„Mensch ohne Klasse? Das geht besser“, lacht Hilde. „Heute wirst du Elf und Krieger, und ich zeige dir, wie man alten Kram zu Gold macht.“',
      goal: 'Erreiche Stufe 4. Du lernst Volk und Klasse, Verkaufen und die Abgabe am Zugende.',
      scn: {tut: 'w0s2', target: 4, bots: ['Berta'], diff: 'gemuetlich',
        start: {lvl: 2, hand: ['Elf', 'Krieger', 'Breitschwert der Angeberei', 'Protzige Goldkette', 'Hörnerhelm', 'Trank der Tapferkeit', 'Stinkbombe', 'Gummihuhn mit Quietsch', 'Windböe'], deal: false},
        botStart: {Berta: {lvl: 1, eq: ['Topfhelm mit Delle'], deal: false}},
        botStyles: {Berta: {help: 3, curse: 0, intf: 0, l: 'heute ganz friedlich'}},
        deck: {door: ['Kobold', 'Zauberer', 'Zwerg', 'Exorzist', 'Elf', 'Rentner-Ritter', 'Hehler', 'Zwerg'],
          tr: ['Lederschürze', 'Schnelle Latschen', 'Flasche Drachenschnaps']}},
      winText: '„Elf, Krieger, reich und großzügig“, zählt Hilde auf. „Jetzt fehlt nur noch, was man tut, wenn ein Monster zu stark ist.“'},
    {id: 'w0s3', req: ['w0s2'], face: 'icons/portrait-hilde.png', no: '3', x: 78, y: 300, ax: 25, ay: 49, type: 'tutorial', name: 'Zu stark!', place: 'Hinterzimmer',
      text: 'Im Hinterzimmer riecht es nach Ärger. „Nicht jedes Monster haust du allein um“, sagt Hilde. „Dann brauchst du einen Trick, Freunde oder schnelle Beine.“',
      goal: 'Erreiche Stufe 5. Du lernst Flüche, Einmal-Gegenstände, Hilfe holen und Weglaufen.',
      scn: {tut: 'w0s3', target: 5, keep: ['Nebelpulver'], bots: ['Berta'], diff: 'gemuetlich',
        start: {lvl: 3, eq: ['Topfhelm mit Delle', 'Rostiges Schwert'], hand: ['Trank der Tapferkeit', 'Nebelpulver'], deal: false},
        botStart: {Berta: {lvl: 2, eq: ['Riesenhammer', 'Hörnerhelm'], deal: false}},
        botStyles: {Berta: {help: 3, curse: 0, intf: 0, l: 'hilft dir gern'}},
        perks: {freeHelp: 'Berta', always: true, why: 'Für dich doch immer!'},
        deck: {door: ['Pechsträhne', 'Windböe', 'Kobold', 'Zauberer', 'Pilzkönig', 'Exorzist', 'Krieger', 'Troll unter der Autobahnbrücke', 'Elf', 'Hehler', 'Bürokratie-Golem', 'Zwerg', 'Winzig', 'Schleimige Socke'],
          tr: ['Gusseiserne Bratpfanne', 'Glücksumhang', 'Lederschürze', 'Schnelle Latschen', 'Flasche Drachenschnaps']}},
      winText: '„Mit Hilfe geht alles“, sagt Hilde. „Aber pass auf: Am Stammtisch hilft dir keiner umsonst. Die mischen sich lieber in deine Kämpfe ein.“'},
    {id: 'w0s4', req: ['w0s3'], face: 'icons/portrait-kalle.png', no: '4', x: 22, y: 410, ax: 77, ay: 66, type: 'tutorial', name: 'Alle gegen dich', place: 'Kellertür',
      text: 'Kalle setzt sich dazu und reibt sich die Hände. „Jetzt wird es lustig“, sagt Hilde. „Bei uns mischt jeder in jedem Kampf mit. Zeig Kalle, wie das geht.“',
      goal: 'Erreiche Stufe 5. Du lernst Monster herausfordern und Launen, in fremden und in eigenen Kämpfen.',
      scn: {tut: 'w0s4', target: 5, bots: ['Kalle'], diff: 'gemuetlich',
        start: {lvl: 3, eq: ['Rostiges Schwert', 'Stahlkappenstiefel'], hand: ['Wütender Gartenzwerg', 'Stinksauer', 'Winzig', 'Trank der Tapferkeit'], deal: false},
        botStart: {Kalle: {lvl: 3, eq: ['Rostiges Schwert', 'Hörnerhelm'], deal: false}},
        botStyles: {Kalle: {help: 0, curse: 0, intf: 0, l: 'will unbedingt gewinnen'}},
        deck: {door: ['Kobold', 'Rentner-Ritter', 'Bürokratie-Golem', 'Zauberer', 'Exorzist', 'Elf'],
          tr: ['Lederschürze', 'Topfhelm mit Delle', 'Glücksumhang', 'Schnelle Latschen', 'Flasche Drachenschnaps']}},
      winText: 'Kalle verschränkt die Arme: „Das war gemein.“ Hilde grinst: „Das war Plundo. Jetzt bist du bereit für eine richtige Partie.“'},
    {id: 'w0s5', req: ['w0s4'], face: 'icons/portrait-hilde.png', no: '5', x: 78, y: 520, ax: 30, ay: 84, type: 'duel', name: 'Die Probepartie', place: 'Stammtisch', final: true,
      text: 'Zum Abschluss eine ganze Partie, wie am Stammtisch. „Diesmal sage ich dir nicht jeden Schritt an“, sagt Hilde. „Aber ich gebe dir Tipps, die es sonst nicht gibt.“',
      goal: 'Gegen Berta und Kalle: Erreiche als Erster Stufe 5.',
      // Feste Reihenfolge: eine Partie ohne großes Pech. Elfe und Zauberer mit passenden Gegenständen, schaffbare Monster,
      // ein Fluch (mit dem Glücksamulett abwehrbar). Berta und Kalle ziehen nur Völker, Klassen, Flüche und Launen,
      // spielen fair und kommen nicht an Schätze: So bleibt auch die Reihenfolge deiner Schätze fest.
      scn: {tut: 'w0s5', tutFree: true, target: 5, bots: ['Berta', 'Kalle'], diff: 'gemuetlich', tips: true,
        start: {lvl: 2, hand: ['Elf', 'Zauberer', 'Elfendolch', 'Spitzhut mit Sternchen', 'Trank der Tapferkeit'], deal: false},
        botStart: {Berta: {lvl: 1, eq: ['Hörnerhelm'], deal: false}, Kalle: {lvl: 1, eq: ['Gusseiserne Bratpfanne'], deal: false}},
        botStyles: {Berta: {help: 3, curse: 0, intf: 0, l: 'hilft dir gern'}, Kalle: {help: 0, curse: 0, intf: 0, l: 'spielt heute fair'}},
        deck: {door: ['Schwarm Stechmücken', 'Kobold', 'Exorzist', 'Zwerg', 'Krieger',
            'Rentner-Ritter', 'Rost', 'Stinksauer', 'Löcher in den Sohlen', 'Winzig',
            'Pechsträhne', 'Windböe', 'Identitätskrise', 'Hehler', 'Taschendieb-Gnom', 'Kobold',
            'Vampir-Kaninchen', 'Ahnenforschung', 'Zwerg', 'Exorzist', 'Krieger',
            'Bürokratie-Golem'],
          tr: ['Zauberstab der Ausreden', 'Glücksamulett', 'Kettenhemd aus Kronkorken', 'Stahlkappenstiefel', 'Protzige Goldkette', 'Flasche Drachenschnaps', 'Glücksumhang', 'Riesenböller']}},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}],
      winText: '„Geschafft!“ Hilde schiebt dir einen Bierdeckel über den Tresen. „Den kriegt hier nur, wer die Probepartie gewinnt. Häng ihn dir um dein Bild, im Charakter.“',
      reward: 'frame:bierdeckel'}
  ],
  finalTitle: 'Einführung geschafft!'
}, {
  id: 'w1', n: 1, name: 'Rund um die Taverne', face: 'icons/portrait-hilde.png', deck: 'grund', mapH: 1000, map: 'art/karte-welt1.webp', mapRatio: 768 / 1376,
  intro: 'Du bist neu in der Taverne. Berta, Kalle und Uschi sitzen jeden Abend am Stammtisch und lachen über jeden Neuen. Wirtin Hilde zwinkert dir zu: „Willst du dir einen Namen machen? Das Städtchen hat Plagen genug. Fang im Garten an.“',
  outro: 'Der Drache trollt sich, das Städtchen atmet auf. Am Stammtisch ist plötzlich ein Stuhl für dich frei. Da ruft Hilde aus der Küche: „Das Bier ist alle! Und aus dem Keller kommen komische Geräusche …“',
  landmarks: [['Taverne', 50, 22], ['Garten', 80, 92], ['Hafen', 88, 312], ['Autobahnbrücke', 5, 548], ['Rathaus', 5, 604], ['Flohmarkt', 95, 604], ['Drachenhöhle', 95, 862]],
  stations: [
    {id: 'w1s1', face: 'icons/portrait-hilde.png', ax: 72.9, ay: 19.6, no: '1', x: 50, y: 90, type: 'puzzle', name: 'Ärger im Beet', place: 'Garten',
      text: 'Hildes Gartenzwerg ist schon wieder stinksauer und bewacht das Kräuterbeet mit dem Rechen. „Ich brauche Petersilie“, seufzt Hilde. „Und zwar heute.“',
      goal: 'Besiege den stinksauren Wütenden Gartenzwerg (Kampfstärke 6). Du hast Stufe 2, eine Bratpfanne und drei Karten auf der Hand.',
      scn: {fight: {mons: ['Wütender Gartenzwerg'], enh: ['Stinksauer']}, start: {lvl: 2, eq: ['Gusseiserne Bratpfanne'], hand: ['Winzig', 'Trank der Tapferkeit', 'Riesenböller'], deal: false}, bots: []},
      extras: [{t: 'Mit nur einer Karte gewinnen', ok: st => st.played <= 1}, {t: 'Den Riesenböller behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Riesenböller')}],
      reward: 'title:stammgast'},
    {id: 'w1s2', luck: 0.55, face: 'icons/portrait-kalle.png', ax: 48.2, ay: 11.6, no: '2', x: 28, y: 200, type: 'duel', name: 'Kalle prahlt', place: 'Stammtisch', req: ['w1s1'],
      text: 'Kalle lehnt sich zurück: „Eine Runde, du und ich. Wer zuerst Stufe 5 hat, zahlt die Zeche nicht.“ Er grinst, als hätte er schon gewonnen.',
      goal: '1 gegen 1 gegen Kalle: Erreiche Stufe 5 vor ihm.',
      scn: {target: 5, bots: ['Kalle'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}],
      reward: 'frame:kupferkessel'},
    {id: 'w1s3', face: 'art/monster-uebellaunige-moewe.webp', ax: 55.3, ay: 32.3, no: '3', x: 66, y: 310, type: 'event', name: 'Die Möwe am Hafen', place: 'Hafen', req: ['w1s2'],
      text: 'Am Hafen sitzt die Übellaunige Möwe auf einem Poller, Bertas Hörnerhelm im Schnabel. Mit einem Stück Brot lockst du sie weg. Jetzt hältst du den Helm in der Hand.',
      goal: 'Entscheide, was mit dem Helm passiert. Das wirkt sich auf die nächste Station aus.',
      choices: [
        {v: 'return', l: 'Berta den Helm zurückgeben', d: 'Berta hilft dir in Station 4 einmal, ohne dass du ihr etwas anbieten musst.'},
        {v: 'keep', l: 'Den Hörnerhelm behalten', d: 'Du startest Station 4 mit dem Hörnerhelm (+2).'},
        {v: 'sell', l: 'Den Helm verkaufen', d: 'Du bekommst 30 Münzen.', coins: 30}
      ]},
    {id: 'w1s4', luck: 0.3, face: 'icons/portrait-uschi.png', ax: 21.5, ay: 33.1, no: '4', x: 34, y: 420, type: 'duel', name: 'Kartenrunde am Ufer', place: 'Seeufer', req: ['w1s3'],
      text: 'Am Seeufer haben Berta und Uschi einen Klapptisch aufgestellt. „Mal sehen, ob du auch gegen zwei bestehst“, sagt Uschi und mischt verdächtig gut.',
      goal: 'Gegen Berta und Uschi: Erreiche vor den beiden Stufe 6.',
      scn: story => ({target: 6, bots: ['Berta', 'Uschi'], diff: 'gemuetlich',
        start: story.choice.w1s3 === 'keep' ? {eq: ['Hörnerhelm']} : undefined,
        perks: story.choice.w1s3 === 'return' ? {freeHelp: 'Berta', why: 'Du hast mir meinen Helm zurückgebracht. Ehrensache!'} : undefined}),
      extras: [{t: 'Nie Hilfe annehmen', ok: st => !st.help}, {t: 'Höchstens 1 Fluch abbekommen', ok: st => st.curses <= 1}]},
    {id: 'w1s5', face: 'art/monster-troll-unter-der-autobahnbruecke.webp', ax: 50.8, ay: 44.0, no: '5', x: 68, y: 530, type: 'puzzle', name: 'Maut unter der Brücke', place: 'Autobahnbrücke', req: ['w1s4'],
      text: 'Unter der Autobahnbrücke verlangt ein Troll Maut. Zwerge kann er nicht ausstehen, und du bist heute leider einer.',
      goal: 'Besiege den Troll unter der Autobahnbrücke (Stufe 9, gegen Zwerge +3). Du bist Zwerg auf Stufe 5 mit Stahlkappenstiefeln und Hellebarde.',
      scn: {fight: {mons: ['Troll unter der Autobahnbrücke']}, start: {lvl: 5, race: 'Zwerg', eq: ['Stahlkappenstiefel', 'Hellebarde mit Wimpel'], hand: ['Trank der Tapferkeit', 'Stinkbombe', 'Krieger'], deal: false}, bots: []},
      extras: [{t: 'Ohne Einmal-Gegenstand', ok: st => !st.os}, {t: 'Ohne eine Karte auszuspielen', ok: st => !st.played}],
      reward: 'title:brueckenbezwinger'},
    {id: 'w1s6a', luck: 0.2, face: 'art/monster-buerokratie-golem.webp', ax: 22.8, ay: 64.0, no: '6a', x: 25, y: 650, type: 'duel', name: 'Ein Tag im Amt', place: 'Rathaus', hard: true, req: ['w1s5'],
      text: 'Im Rathaus stapeln sich die Formulare bis unter die Decke. Bürokratie-Golem und Steuerprüfer-Gespenst warten schon, und Berta, Kalle und Uschi wollen auch einen Stempel.',
      goal: 'Gegen alle drei, mit doppelt so vielen Flüchen im Deck: Erreiche Stufe 7. Hier gibt es doppelte Münzen.',
      scn: {target: 7, bots: ['Berta', 'Kalle', 'Uschi'], variant: 'fluchchaos', diff: 'normal'}, coinMul: 2,
      extras: [{t: 'In weniger als 15 Runden', ok: (st, S) => S.turn < 15}, {t: 'Höchstens 2 Flüche abbekommen', ok: st => st.curses <= 2}]},
    {id: 'w1s6b', luck: 0.3, face: 'icons/portrait-kalle.png', ax: 79.4, ay: 62.5, no: '6b', x: 75, y: 650, type: 'duel', name: 'Flohmarkt', place: 'Flohmarkt', easy: true, req: ['w1s5'],
      text: 'Auf dem Flohmarkt verkauft Kalle angeblich echte Heldenausrüstung. Ihr spielt um seinen Stand.',
      goal: 'Gegen Kalle: Erreiche Stufe 6.',
      scn: {target: 6, bots: ['Kalle'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}]},
    {id: 'w1s7', ax: 51.4, ay: 77.0, no: '7', x: 50, y: 770, type: 'shop', name: 'Rast im Gasthof', place: 'Gasthof', reqAny: ['w1s6a', 'w1s6b'],
      text: 'Kurz vor der Drachenhöhle steht ein kleiner Gasthof. Der Wirt zeigt auf ein Regal voller Kram: „Für ein paar Münzen ist alles zu haben. Wer weiß, ob du wiederkommst.“',
      goal: 'Tausche Münzen gegen Rahmen, Porträts und einen Hintergrund. Danach geht es zum Drachen.',
      shop: [{id: 'frame:moewenfeder', price: 30}, {id: 'portrait:gartenzwerg', price: 40}, {id: 'portrait:rentner', price: 40}, {id: 'bg:staedtchen', price: 50}], onward: 'Weiter zum Drachen'},
    {id: 'w1s8', luck: 0.25, face: 'art/monster-drache-des-montagmorgens.webp', ax: 80.7, ay: 90.8, no: '8', x: 50, y: 895, type: 'boss', name: 'Der Drache des Montagmorgens', place: 'Drachenhöhle', req: ['w1s7'],
      text: 'Jeden Montag legt der Drache das Städtchen lahm: kein Kaffee, keine Laune, kein Durchkommen. Heute stellst du dich ihm. Die drei vom Stammtisch wollen den Ruhm natürlich selbst.',
      goal: 'Gegen Berta, Kalle und Uschi. Der Drache steckt in der unteren Hälfte des Türstapels und ist montags noch nicht ganz wach: Stufe 13 statt 16. Wer ihn besiegt, gewinnt. Besiegt ihn jemand anderes, hast du verloren. Stufe 10 gewinnt wie gewohnt.',
      scn: {target: 10, bots: ['Berta', 'Kalle', 'Uschi'], boss: 'Drache des Montagmorgens', bossLvl: 13, diff: 'normal'},
      extras: [{t: 'Den Drachen selbst besiegen', ok: st => st.bossBy === 0}, {t: 'Nie Hilfe annehmen', ok: st => !st.help}],
      reward: 'title:montagsheld', final: true}
  ],
  finalTitle: 'Der Drache ist besiegt!'
}, {
  id: 'w2', n: 2, name: 'Der Tavernenkeller', face: 'icons/portrait-hilde.png', deck: 'keller', table: 'keller', theme: 'keller', map: 'art/karte-welt2.webp', mapRatio: 768 / 1376,
  // solange Welt 1 offen ist: im Nebel zu erahnen (Punkte in Prozent der oberen 55 % des Bildes)
  fog: {show: 0.55, teaser: [[49.9, 30.5], [17.5, 43.1], [36.7, 69.3]], hint: 'Besiege den Drachen des Montagmorgens, dann geht es hinab.'},
  intro: 'Das Bier ist alle, und aus dem Keller kommen seltsame Geräusche. Hilde drückt dir eine Laterne in die Hand: „Unten hat sich Rattenkönig Rüdiger zum Herrscher ausgerufen. Seitdem spielen alle da unten nach seinen Regeln. Hol mir mein Bier zurück!“ Am Stammtisch wetten Berta, Kalle und Uschi schon, ob du überhaupt wiederkommst.',
  outro: 'Rüdiger rückt seinen Kronkorken gerade und gibt sich geschlagen. Hilde bekommt ihr Bier, der Stammtisch zahlt die Wettschulden. Hinter dem Thron entdeckst du einen schmalen Tunnel. Es riecht nach Moos und Pilzen …',
  rules: [['Kellerkälte', 'Ein Fluch: Im nächsten Kampf hast du −2. Danach ist die Kälte vorbei.'], ['Nager', 'Viele Kellermonster sind Nager. Die Mausefalle bringt gegen sie +6 statt +2.'], ['Untote', 'Gegen den Korkgeist und andere Untote helfen Knoblauchzopf (+5), Fassdeckel-Schild (+4) und Priester (+3 je abgeworfene Karte).'], ['Rattenkönig Rüdiger', 'Der Boss steckt nur in der letzten Station im Türstapel. Wer ihn besiegt, gewinnt sofort.']],
  unlocks: ['das Keller-Deck mit Tischfläche „Kellergewölbe“ und Kellermusik'],
  starReward: {n: 18, id: 'frame:goldkronkorken'},
  finalTitle: 'Rüdiger ist besiegt!',
  stations: [
    {id: 'w2s1', face: 'art/monster-staubmaus-bande.webp', ax: 49.9, ay: 16.8, no: '1', type: 'puzzle', name: 'Die Kellertreppe', place: 'Kellertreppe', req: ['w1s8'],
      text: 'Unten an der Kellertreppe raschelt es. Auf der letzten Stufe hockt eine Staubmaus-Bande, zu dritt und stinksauer, weil du ihnen mit der Laterne ins Gesicht leuchtest.',
      goal: 'Besiege die stinksaure Staubmaus-Bande (Kampfstärke 6). Du hast Stufe 2, eine Kellerlaterne und drei Karten auf der Hand.',
      scn: {fight: {mons: ['Staubmaus-Bande'], enh: ['Stinksauer']}, start: {lvl: 2, eq: ['Kellerlaterne'], hand: ['Mausefalle', 'Trank der Tapferkeit', 'Riesenböller'], deal: false}, bots: []},
      extras: [{t: 'Mit nur einer Karte gewinnen', ok: st => st.played <= 1}, {t: 'Den Riesenböller behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Riesenböller')}],
      reward: 'title:kellerkind'},
    {id: 'w2s2', luck: 0.35, face: 'icons/portrait-rosi.png', ax: 17.5, ay: 23.7, no: '2', type: 'duel', name: 'Rosi will spielen', place: 'Fässerecke', req: ['w2s1'],
      text: 'Zwischen den Fässern sitzt Ratte Rosi, Rüdigers vorlaute Nichte, und mischt Karten mit dem Schwanz. „Du willst zu meinem Onkel? Erst gegen mich. Und glaub ja nicht, dass ich dir jemals helfe.“',
      goal: '1 gegen 1 gegen Ratte Rosi, mit dem Keller-Deck: Erreiche Stufe 5 vor ihr.',
      scn: {target: 5, bots: ['Rosi'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}],
      reward: 'frame:rattengrau'},
    {id: 'w2s3', face: 'icons/portrait-fridolin.png', ax: 36.7, ay: 38.1, via: {w2s2: [[15.5, 31], [22, 37.5]]}, no: '3', type: 'event', name: 'Das sprechende Fass', place: 'Fasslager', req: ['w2s2'],
      text: 'Ein dickes Bierfass räuspert sich: „Fass Fridolin, sehr erfreut. Du willst in den Vorratsraum? Da spielen Rosi und ich heute Karten. Ich mach dir ein Angebot, unter Kellerleuten.“',
      goal: 'Nimm eines von Fridolins Angeboten an. Es wirkt sich auf die nächste Station aus.',
      choices: [
        {v: 'shield', l: 'Den Fassdeckel-Schild nehmen', d: 'Du startest Station 4 mit dem Fassdeckel-Schild (+2, gegen Untote +4).'},
        {v: 'help', l: 'Fridolins Hilfe annehmen', d: 'Fridolin hilft dir in Station 4 einmal, ohne Schätze zu verlangen.'},
        {v: 'coins', l: 'Die 30 Münzen nehmen', d: 'Du bekommst 30 Münzen.', coins: 30}
      ]},
    {id: 'w2s4', luck: 0.25, face: 'icons/portrait-fridolin.png', ax: 80.8, ay: 37.9, no: '4', type: 'duel', name: 'Kartenrunde im Vorratsraum', place: 'Vorratsraum', req: ['w2s3'],
      text: 'Zwischen Kartoffelsäcken und Schatztruhen haben Rosi und Fridolin einen Tisch aus Kisten gebaut. „Wer zuerst Stufe 6 hat, kriegt die Truhe“, quiekt Rosi. Fridolin gluckert zustimmend.',
      goal: 'Gegen Rosi und Fridolin: Erreiche als Erster Stufe 6.',
      scn: story => ({target: 6, bots: ['Rosi', 'Fridolin'], diff: 'gemuetlich',
        start: story.choice.w2s3 === 'shield' ? {eq: ['Fassdeckel-Schild']} : undefined,
        perks: story.choice.w2s3 === 'help' ? {freeHelp: 'Fridolin', why: 'Abgemacht ist abgemacht. Einmal umsonst!'} : undefined}),
      extras: [{t: 'Nie Hilfe annehmen', ok: st => !st.help}, {t: 'Höchstens 1 Fluch abbekommen', ok: st => st.curses <= 1}]},
    {id: 'w2s5', face: 'icons/portrait-gustav.png', ax: 81.8, ay: 57.5, no: '5', type: 'puzzle', name: 'Gustavs Geisterstunde', place: 'Weinkeller', req: ['w2s4'],
      text: 'Im Weinkeller schlägt eine Uhr, die es gar nicht gibt. Gespenst Gustav, seit 300 Jahren gelangweilt, hat zwei Untote zum Spielen eingeladen und den Korkgeist schon mal zu riesenhafter Größe aufgeblasen. „Endlich Unterhaltung“, gähnt er.',
      goal: 'Besiege Korkgeist und Steuerprüfer-Gespenst zusammen (Kampfstärke 18: je Stufe 4, riesenhaft +10, beide untot). Du bist Exorzist auf Stufe 4 mit dem Fassdeckel-Schild: Kampfstärke 11 gegen Untote. Gleichstand reicht nicht.',
      scn: {fight: {mons: ['Korkgeist', 'Steuerprüfer-Gespenst'], enh: ['Riesenhaft']}, start: {lvl: 4, cls: 'Exorzist', eq: ['Fassdeckel-Schild'], hand: ['Knoblauchzopf', 'Trank der Tapferkeit', 'Winzig', 'Stinkbombe', 'Ahnenforschung'], deal: false}, bots: []},
      extras: [{t: 'Den Knoblauchzopf behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Knoblauchzopf')}, {t: 'Mit höchstens 2 Karten', ok: st => (st.played || 0) <= 2}],
      reward: 'title:geisterjaeger'},
    {id: 'w2s6a', luck: 0.1, face: 'icons/portrait-gustav.png', ax: 49.6, ay: 57.1, no: '6a', type: 'duel', name: 'Weinkeller', place: 'Weinkeller', hard: true, req: ['w2s5'],
      text: 'Tiefer im Weinkeller ist es kalt, und die Flaschen flüstern. Rosi und Gustav spielen hier ihre Lieblingsvariante, mit doppelt so vielen Flüchen. „Ich liebe Flüche“, kichert Rosi.',
      goal: 'Gegen Rosi und Gustav, mit doppelt so vielen Flüchen im Deck: Erreiche Stufe 7. Hier gibt es doppelte Münzen.',
      scn: {target: 7, bots: ['Rosi', 'Gustav'], variant: 'fluchchaos', diff: 'normal'}, coinMul: 2,
      extras: [{t: 'In weniger als 15 Runden', ok: (st, S) => S.turn < 15}, {t: 'Nie aus einem Kampf weglaufen', ok: st => !st.ran}]},
    {id: 'w2s6b', luck: 0.3, face: 'icons/portrait-fridolin.png', ax: 48.3, ay: 75.7, via: {w2s5: [[84, 66], [83, 77], [74, 80.5], [58, 80]]}, no: '6b', type: 'duel', name: 'Kartoffelkeller', place: 'Kartoffelkeller', easy: true, req: ['w2s5'],
      text: 'Im Kartoffelkeller riecht es nach Erde. Fridolin hat sich gemütlich zwischen die Säcke gerollt: „Eine ruhige Runde, nur wir zwei? Ich helfe dir sogar, gegen eine kleine Gebühr.“',
      goal: 'Gegen Fridolin: Erreiche Stufe 6.',
      scn: {target: 6, bots: ['Fridolin'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}]},
    {id: 'w2s7', ax: 19.4, ay: 82.3, via: {w2s6a: [[24, 58.5], [16, 64], [16, 75]]}, no: '7', type: 'shop', name: 'Rast beim Kellermeister', place: 'Kellermeister', reqAny: ['w2s6a', 'w2s6b'],
      text: 'Kurz vor dem Thronsaal hat der alte Kellermeister seinen Stand: Kerzenstummel, Korken und allerlei Krimskrams. „Für ein paar Münzen ist alles zu haben. Rüdiger zahlt ja nie.“',
      goal: 'Tausche Münzen gegen Rahmen, Titel, Porträts und Hintergründe. Danach geht es zu Rüdiger.',
      shop: [{id: 'title:fassfluesterer', price: 30}, {id: 'frame:kerzenwachs', price: 40}, {id: 'portrait:rosi', price: 60}, {id: 'bg:weinkeller', price: 60}], onward: 'Weiter zu Rüdiger'},
    {id: 'w2s8', luck: 0.25, face: 'art/monster-rattenkoenig-ruediger.webp', ax: 49.2, ay: 90.4, no: '8', type: 'boss', name: 'Rüdigers Thronsaal', place: 'Thronsaal', req: ['w2s7'],
      text: 'Auf einem Thron aus Pfandkisten sitzt Rattenkönig Rüdiger, den Kronkorken schief auf dem Kopf. Rosi, Fridolin und Gustav sitzen schon am Tisch. „Wer mich besiegt, kriegt das Bier“, piepst Rüdiger. „Aber das schafft eh keiner.“',
      goal: 'Gegen Rosi, Fridolin und Gustav. Rüdiger steckt in der unteren Hälfte des Türstapels und ist nach dem Festmahl etwas träge: Stufe 13 statt 14. Wer ihn besiegt, gewinnt. Besiegt ihn jemand anderes, hast du verloren. Stufe 10 gewinnt wie gewohnt.',
      scn: {target: 10, bots: ['Rosi', 'Fridolin', 'Gustav'], boss: 'Rattenkönig Rüdiger', bossLvl: 13, diff: 'normal'},
      extras: [{t: 'Rüdiger selbst besiegen', ok: st => st.bossBy === 0}, {t: 'Ohne Hilfe gegen Rüdiger', ok: st => st.bossBy === 0 && !st.bossHelped}],
      reward: 'title:rattenschreck', final: true}
  ]
}, {
  id: 'w3', n: 3, name: 'Der Pilzwald', face: 'icons/portrait-hilde.png', deck: 'wald', table: 'wald', theme: 'wald', map: 'art/karte-welt3.webp', mapRatio: 768 / 1376,
  fog: {show: 0.55, teaser: [[50, 20], [74, 40.9], [28, 60]], hint: 'Besiege Rattenkönig Rüdiger, dann führt ein Tunnel hinaus in den Wald.'},
  intro: 'Hinter Rüdigers Thron führt ein Tunnel hinaus in den Pilzwald. Nachts leuchtet dort alles, und die Pilze tratschen über ihr Wurzelnetz. Hilde ist in Sorge: „Pilzkönigin Morchella will das Städtchen überwuchern, und meine Taverne soll ihr Sommerpalast werden! Ihr Mann, der Pilzkönig, hat da nichts zu melden.“ Berta drückt dir einen Korb in die Hand: „Bring was Leckeres mit!“',
  outro: 'Morchella zieht beleidigt ihre Sporen zurück, und der Pilzkönig atmet hörbar auf. Hilde bekommt einen Korb voller Steinpilze, und die Taverne bleibt eine Taverne. Hinter dem Sporenpalast plätschert ein Bach talabwärts. Es riecht nach Salz, und irgendwo kreischen Möwen …',
  rules: [['Pilze', 'Viele Waldmonster sind Pilze. Das Pilzmesser bringt gegen sie +3, die Fußpilzsalbe +6.'], ['Sporenwolke', 'Bleibt, bis du einen Kampf gewinnst. So lange hast du −1 in jedem Kampf, auch als Helfer. Mehrere Wolken zählen zusammen.'], ['Pilzpfanne', 'Steinpilz, Pfifferling und Champignon zusammen ablegen bringt 1 Stufe, mit dem Sammelkorb reichen zwei verschiedene. Nie für die Siegstufe.'], ['Myzel-Koloss', 'Das Waldnetz hört mit: Gegen ihn darf niemand helfen.']],
  unlocks: ['das Pilzwald-Deck mit Tischfläche „Waldboden“ und Waldmusik'],
  starReward: {n: 18, id: 'frame:leuchtpilz'},
  finalTitle: 'Morchella ist besiegt!',
  stations: [
    {id: 'w3s1', face: 'art/monster-hexenring.webp', ax: 50, ay: 11, no: '1', type: 'puzzle', name: 'Licht am Tunnelende', place: 'Tunnelausgang', req: ['w2s8'],
      text: 'Am Ende des Tunnels blendet dich grünes Licht. Kaum trittst du hinaus, stehst du mitten in einem kleinen Hexenring. Die Pilze sind stinksauer, weil du einem von ihnen auf den Hut getreten bist.',
      goal: 'Besiege den stinksauren Hexenring (Kampfstärke 9, ein Pilz). Du hast Stufe 3, eine Kellerlaterne und drei Karten auf der Hand.',
      scn: {fight: {mons: ['Hexenring'], enh: ['Stinksauer']}, start: {lvl: 3, eq: ['Kellerlaterne'], hand: ['Fußpilzsalbe', 'Steinpilz', 'Trank der Tapferkeit'], deal: false}, bots: []},
      extras: [{t: 'Mit nur einer Karte gewinnen', ok: st => st.played <= 1}, {t: 'Den Steinpilz behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Steinpilz')}],
      reward: 'title:pilzkenner'},
    {id: 'w3s2', luck: 0.15, face: 'icons/portrait-flora.png', ax: 74, ay: 22.5, no: '2', type: 'duel', name: 'Floras Lichtung', place: 'Lichtung', req: ['w3s1'],
      text: 'Auf der Lichtung schwirrt Fee Flora herum, eine Nektartasse in der Hand und viel zu wach. „Oh, Besuch! Spielen wir? Bitte, bitte, bitte! Ich helf dir auch, ehrlich!“',
      goal: '1 gegen 1 gegen Fee Flora, mit dem Pilzwald-Deck: Erreiche Stufe 5 vor ihr.',
      scn: {target: 5, bots: ['Flora'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}],
      reward: 'frame:moosgruen'},
    {id: 'w3s3', face: 'icons/portrait-trudi.png', ax: 28, ay: 33, no: '3', type: 'event', name: 'Trudi wittert was', place: 'Trüffelgrund', req: ['w3s2'],
      text: 'Etwas Rosafarbenes wühlt im Boden: Trüffelschwein Trudi, mit Pudelmütze und Korb. „Psst, ich hab heute schon dreimal was gefunden. Eins davon kannst du haben, wenn du mich nachher zum Hexenring begleitest.“',
      goal: 'Nimm einen von Trudis Funden. Er wirkt sich auf die nächste Station aus.',
      choices: [
        {v: 'knife', l: 'Das Pilzmesser nehmen', d: 'Du startest Station 4 mit dem Pilzmesser (+1, gegen Pilze +3).'},
        {v: 'basket', l: 'Den Sammelkorb mit zwei Pilzen nehmen', d: 'Du startest Station 4 mit Sammelkorb, Steinpilz und Pfifferling. Damit kannst du sofort eine Pilzpfanne kochen.'},
        {v: 'coins', l: 'Die 30 Münzen nehmen', d: 'Du bekommst 30 Münzen.', coins: 30}
      ]},
    {id: 'w3s4', luck: 0.1, face: 'icons/portrait-flora.png', ax: 29, ay: 49, no: '4', type: 'duel', name: 'Kartenrunde im Hexenring', place: 'Hexenring', req: ['w3s3'],
      text: 'Im großen Hexenring tanzen die Pilze, bis sich Flora und Trudi in die Mitte setzen. „Wer zuerst Stufe 6 hat, darf den Ring verlassen“, kichert Flora. Trudi schnüffelt schon an deinem Gepäck.',
      goal: 'Gegen Flora und Trudi: Erreiche als Erster Stufe 6.',
      scn: story => ({target: 6, bots: ['Flora', 'Trudi'], diff: 'gemuetlich',
        start: story.choice.w3s3 === 'knife' ? {eq: ['Pilzmesser']} : story.choice.w3s3 === 'basket' ? {eq: ['Sammelkorb'], hand: ['Steinpilz', 'Pfifferling']} : undefined}),
      extras: [{t: 'Einmal die Pilzpfanne kochen', ok: st => (st.pfanne || 0) >= 1}, {t: 'Nie aus einem Kampf weglaufen', ok: st => !st.ran}]},
    {id: 'w3s5', face: 'icons/portrait-walter.png', ax: 75, ay: 53, no: '5', type: 'puzzle', name: 'Walters Wurzelrätsel', place: 'Hohle Eiche', req: ['w3s4'],
      text: 'In der hohlen Eiche wohnt Waldschrat Walter, 800 Jahre alt und schlecht gelaunt. „Ruhe! Du trampelst wie ein Troll.“ Dann pfeift er, und ein echter Moos-Troll stapft heran, stinksauer, weil Walter ihn geweckt hat. „Der mag keine Elfen“, brummt Walter und grinst.',
      goal: 'Besiege den stinksauren Moos-Troll (Kampfstärke 14: Stufe 6, stinksauer +5, gegen Elfen +3). Du bist Elf auf Stufe 4 mit dem Moosmantel: Kampfstärke 6. Völker und Klassen darfst du jederzeit ablegen.',
      scn: {fight: {mons: ['Moos-Troll'], enh: ['Stinksauer']}, start: {lvl: 4, race: 'Elf', eq: ['Moosmantel'], hand: ['Fußpilzsalbe', 'Champignon', 'Trank der Tapferkeit', 'Winzig'], deal: false}, bots: []},
      extras: [{t: 'Ohne die Fußpilzsalbe', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Fußpilzsalbe')}, {t: 'Den Champignon behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Champignon')}],
      reward: 'title:wurzelfluesterer'},
    {id: 'w3s6a', face: 'icons/portrait-walter.png', ax: 9, ay: 64, via: {w3s5: [[52, 57], [30, 59.5]]}, no: '6a', type: 'duel', name: 'Das Dickicht', place: 'Dickicht', hard: true, req: ['w3s5'],
      text: 'Westlich der Eiche wird der Wald so dicht, dass kaum Licht durchkommt. Flora und Walter spielen hier ihre Lieblingsvariante, mit doppelt so vielen Flüchen. „Endlich Stille“, brummt Walter. Flora kichert schon wieder.',
      goal: 'Gegen Flora und Walter, mit doppelt so vielen Flüchen im Deck: Erreiche Stufe 7. Hier gibt es doppelte Münzen.',
      scn: {target: 7, bots: ['Flora', 'Walter'], variant: 'fluchchaos', diff: 'normal'}, coinMul: 2,
      extras: [{t: 'In weniger als 15 Runden', ok: (st, S) => S.turn < 15}, {t: 'Nie aus einem Kampf weglaufen', ok: st => !st.ran}]},
    {id: 'w3s6b', luck: 0.05, face: 'icons/portrait-trudi.png', ax: 52, ay: 68, no: '6b', type: 'duel', name: 'Am Bachlauf', place: 'Bachlauf', easy: true, req: ['w3s5'],
      text: 'Am Bach plätschert es friedlich. Trudi hat sich auf die Moosbrücke gelegt und lässt die Füße ins Wasser baumeln. „Eine ruhige Runde? Aber wehe, du nimmst mir meine Pilze weg.“',
      goal: 'Gegen Trudi: Erreiche Stufe 6.',
      scn: {target: 6, bots: ['Trudi'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}]},
    {id: 'w3s7', ax: 25, ay: 79, no: '7', type: 'shop', name: 'Hütte der Kräuterhexe', place: 'Kräuterhütte', reqAny: ['w3s6a', 'w3s6b'],
      text: 'Die Kräuterhexe hat ihre Hütte nicht weit von Morchellas Palast gebaut, „wegen der Kundschaft“. Zwischen Kräuterbündeln und Salbentöpfen gibt es allerlei zu kaufen.',
      goal: 'Tausche Münzen gegen Rahmen, Titel, Porträts und Hintergründe. Danach geht es zu Morchella.',
      shop: [{id: 'title:schwammerlsucher', price: 30}, {id: 'frame:fliegenpilz', price: 40}, {id: 'portrait:flora', price: 60}, {id: 'bg:zauberwald', price: 60}], onward: 'Weiter zu Morchella'},
    {id: 'w3s8', luck: 0.1, face: 'art/monster-pilzkoenigin-morchella.webp', ax: 73, ay: 88, no: '8', type: 'boss', name: 'Morchellas Sporenpalast', place: 'Sporenpalast', req: ['w3s7'],
      text: 'Morchellas Sporenpalast leuchtet wie eine riesige Laterne. Die Königin thront in der Mitte, ihr Mann hält ihr die Schleppe. Flora, Trudi und Walter sitzen schon am Tisch. „Wer mich besiegt, darf gehen“, säuselt Morchella. „Alle anderen werden Kompost.“',
      goal: 'Gegen Flora, Trudi und Walter. Morchella steckt in der unteren Hälfte des Türstapels: Stufe 14. Wer sie besiegt, gewinnt. Besiegt sie jemand anderes, hast du verloren. Stufe 10 gewinnt wie gewohnt.',
      scn: {target: 10, bots: ['Flora', 'Trudi', 'Walter'], boss: 'Pilzkönigin Morchella', bossLvl: 14, diff: 'normal'},
      extras: [{t: 'Morchella selbst besiegen', ok: st => st.bossBy === 0}, {t: 'Ohne Hilfe gegen Morchella', ok: st => st.bossBy === 0 && !st.bossHelped}],
      reward: 'title:myzelmeister', final: true}
  ]
}, {
  id: 'w4', n: 4, name: 'Sommerpause', face: 'icons/portrait-hilde.png', deck: 'strand', table: 'strand', theme: 'strand', map: 'art/karte-welt4.webp', mapRatio: 768 / 1376, paid: true,
  fog: {show: 0.6, teaser: [[44.7, 46.2], [80.8, 54.8]], hint: 'Besiege Pilzkönigin Morchella, dann folgst du dem Bach bis ans Meer.'},
  intro: 'Hilde hängt ein Schild an die Tür: „Wegen Urlaub geschlossen!“ Drei Welten voller Ratten, Pilze und Drachen sind genug. Der ganze Stammtisch folgt dem Bach bis ans Meer. Doch am Strand ist kein Platz mehr frei: Krabbenbaron Kneifer hat jeden Strandkorb mit Handtüchern reserviert und kassiert Strandgebühr. Berta krempelt die Ärmel hoch: „Das wollen wir doch mal sehen.“',
  outro: 'Kneifer klappert mit den Scheren und gibt die Strandkörbe frei. Der Stammtisch liegt endlich in der Sonne. Doch als die Flut kommt, springt Kneifer auf ein Piratenschiff, und Uschi ist weg. Am Strand liegt nur noch ihr Wettbuch. Von draußen ruft jemand: „Lösegeld, oder sie spielt bei uns mit!“',
  rules: [['Ebbe und Flut', 'Sie wechseln mit jeder Runde, Runde 1 ist Ebbe. Den Stand siehst du am Wasser auf dem Tisch und am Symbol neben der Rundenzahl.'], ['Bei Flut', 'Monster mit dem Merkmal Meer haben +3, der Sandburg-Koloss weicht auf (−3). Weglaufen klappt mit +1, mit Schwimmflügeln mit +3.'], ['Bei Ebbe', 'Das Watt liegt frei: „Raum durchsuchen“ bringt einen Schatz statt einer Türkarte.'], ['Sonnenbrand', 'Bleibt, bis du einen Kampf gewinnst: −1 in jedem Kampf, und niemand hilft dir. Sonnencreme beseitigt ihn sofort, ein Sonnenschirm schützt davor.'], ['Sand in der Badehose', 'Weglaufen −2, bis du eine Stufe aufsteigst.']],
  sell: {boss: 'Krabbenbaron Kneifer', rule: 'Ebbe und Flut: eine neue Spielregel, die den ganzen Tisch verändert', cards: 19, loot: '4 Titel, 3 Rahmen und ein Porträt'},
  unlocks: ['das Strand-Deck mit Tischfläche „Sandstrand“ und Strandmusik'],
  starReward: {n: 18, id: 'frame:meeresschaum'},
  finalTitle: 'Kneifer ist besiegt!',
  stations: [
    {id: 'w4s1', face: 'art/monster-strandkorb-mimik.webp', ax: 44.7, ay: 27.7, no: '1', type: 'puzzle', name: 'Der erste Strandkorb', place: 'Dünenpfad', req: ['w3s8'],
      text: 'Hinter den Dünen steht ein einzelner Strandkorb, noch ohne Handtuch. Endlich! Kaum willst du dich hineinsetzen, klappt er zu und zeigt seine Holzzähne. Er ist stinksauer, weil du Sand auf sein Polster geschüttelt hast.',
      goal: 'Besiege die stinksaure Strandkorb-Mimik (Kampfstärke 9). Du hast Stufe 3, Flip-Flops und drei Karten auf der Hand: Kampfstärke 4.',
      scn: {fight: {mons: ['Strandkorb-Mimik'], enh: ['Stinksauer']}, start: {lvl: 3, eq: ['Flip-Flops'], hand: ['Kokosnuss', 'Sonnencreme LSF 50', 'Flasche Drachenschnaps'], deal: false}, bots: []},
      extras: [{t: 'Mit höchstens zwei Karten gewinnen', ok: st => st.played <= 2}, {t: 'Die Sonnencreme behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Sonnencreme LSF 50')}],
      reward: 'title:sandfuss'},
    {id: 'w4s7', ax: 80.8, ay: 32.9, no: '2', type: 'shop', name: 'Paules Bauchladen', place: 'Dünenkamm', req: ['w4s1'],
      text: 'Oben auf der Düne steht Pommes-Paule mit seinem Bauchladen und winkt jedem, der vom Bach herunterkommt. „Pommes, Eis, Strandmode! Alles frisch, fast alles.“ Zwischen den Pommestüten liegen Titel, ein Rahmen und ein Porträt.',
      goal: 'Tausche Münzen gegen Rahmen, Titel, Porträts und Hintergründe. Danach geht es hinunter zu den Strandkörben.',
      shop: [{id: 'title:wellenreiter', price: 30}, {id: 'frame:rettungsring', price: 40}, {id: 'portrait:sunny', price: 60}, {id: 'bg:sandstrand', price: 60}], onward: 'Weiter zum Strand'},
    {id: 'w4s2', luck: 0.15, face: 'icons/portrait-berta.png', ax: 42.5, ay: 46.6, no: '3', type: 'duel', name: 'Handtuchkrieg', place: 'Strandkörbe', req: ['w4s7'],
      text: 'Ein einziger Strandkorb ist noch frei, und Berta hat ihn auch gesehen. Sie wirft ihr Handtuch, du wirfst deins. Beide landen gleichzeitig. „Dann spielen wir drum“, sagt Berta und mischt schon.',
      goal: '1 gegen 1 gegen Berta, mit dem Strand-Deck: Erreiche Stufe 5 vor ihr. Achte auf Ebbe und Flut.',
      scn: {target: 5, bots: ['Berta'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}],
      reward: 'frame:strandtuch'},
    {id: 'w4s3', face: 'icons/portrait-gesine.png', ax: 29.1, ay: 61, no: '4', type: 'event', name: 'Flaschenpost', place: 'Flutsaum', req: ['w4s2'],
      text: 'Zwischen Treibholz und Seetang glitzert eine Flasche. Möwe Gesine hat sie zuerst entdeckt und hackt schon mit dem Schnabel darauf herum. „Meins! Na gut, teilen wir. Du darfst dir was aussuchen, aber nur eins!“',
      goal: 'Nimm etwas aus der Flaschenpost. Es wirkt sich auf die nächste Station aus.',
      choices: [
        {v: 'schnorchel', l: 'Den Schnorchel nehmen', d: 'Du startest Station 5 mit dem Schnorchel (+1, gegen Meeresmonster +3).'},
        {v: 'schirm', l: 'Den Sonnenschirm mit Sonnencreme nehmen', d: 'Du startest Station 5 mit Sonnenschirm (+2, schützt vor Sonnenbrand) und Sonnencreme auf der Hand.'},
        {v: 'coins', l: 'Die 30 Münzen nehmen', d: 'Du bekommst 30 Münzen.', coins: 30}
      ]},
    {id: 'w4s4', luck: 0.1, face: 'icons/portrait-bruno.png', ax: 35.9, ay: 75.8, no: '5', type: 'duel', name: 'Sandburg-Wettbewerb', place: 'Sandburgen', req: ['w4s3'],
      text: 'Bademeister Bruno hat einen Sandburg-Wettbewerb ausgerufen, mit Pfeife und Klemmbrett. Gesine sitzt schon auf ihrer Burg. „Wer zuerst Stufe 6 hat, gewinnt“, verkündet Bruno. „Und wer wegläuft, fliegt raus!“',
      goal: 'Gegen Bruno und Gesine: Erreiche als Erster Stufe 6.',
      scn: story => ({target: 6, bots: ['Bruno', 'Gesine'], diff: 'gemuetlich',
        start: story.choice.w4s3 === 'schnorchel' ? {eq: ['Schnorchel']} : story.choice.w4s3 === 'schirm' ? {eq: ['Sonnenschirm'], hand: ['Sonnencreme LSF 50']} : undefined}),
      extras: [{t: 'Bei Flut ein Meeresmonster besiegen', ok: st => (st.meerflut || 0) >= 1}, {t: 'Nie aus einem Kampf weglaufen', ok: st => !st.ran}]},
    {id: 'w4s5', face: 'art/monster-betrunkener-klabautermann.webp', ax: 72.8, ay: 51.8, no: '6', type: 'puzzle', name: 'Der Leuchtturm', place: 'Mole', req: ['w4s4'],
      text: 'Draußen auf der Mole torkelt ein Klabautermann um den Leuchtturm, eine Rumflasche in der Hand. Die Flut schwappt schon über die Steine. „Wer hat meinen Rum ausgetrunken?“, brüllt er und schaut dich an. Stinksauer ist er sowieso.',
      goal: 'Besiege den stinksauren Klabautermann bei Flut (Kampfstärke 14: Stufe 6, stinksauer +5, Flut +3). Du bist Krieger auf Stufe 4 mit Schnorchel und Sonnenschirm: Kampfstärke 7, gegen Meeresmonster 9. Krieger haben allein +3. Gleichstand reicht nicht.',
      scn: {fight: {mons: ['Betrunkener Klabautermann'], enh: ['Stinksauer']}, spring: true, start: {lvl: 4, cls: 'Krieger', eq: ['Schnorchel', 'Sonnenschirm'], hand: ['Kokosnuss', 'Sonnencreme LSF 50', 'Trank der Tapferkeit', 'Stinkbombe'], deal: false}, bots: []},
      extras: [{t: 'Ohne die Sonnencreme', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Sonnencreme LSF 50')}, {t: 'Mit nur einer ausgespielten Karte', ok: st => st.played <= 1}],
      reward: 'title:leuchtturmwaechter'},
    {id: 'w4s6a', face: 'icons/portrait-gesine.png', ax: 69.9, ay: 72.2, no: '7a', type: 'duel', name: 'Die Brandung', place: 'Felsen', hard: true, req: ['w4s5'],
      text: 'An den Felsen hinter dem Leuchtturm schlagen die Wellen hoch. Heute ist Springflut, das Wasser geht gar nicht mehr zurück. Gesine und Bruno spielen trotzdem. „Ich pass auf, dass keiner ertrinkt“, sagt Bruno. Gesine klaut ihm die Pfeife.',
      goal: 'Gegen Gesine und Bruno bei Springflut, also in jeder Runde Flut: Erreiche Stufe 7. Hier gibt es doppelte Münzen.',
      scn: {target: 7, bots: ['Gesine', 'Bruno'], spring: true, diff: 'normal'}, coinMul: 2,
      extras: [{t: 'In weniger als 15 Runden', ok: (st, S) => S.turn < 15}, {t: 'Nie aus einem Kampf weglaufen', ok: st => !st.ran}]},
    {id: 'w4s6b', luck: 0.05, face: 'icons/portrait-sunny.png', ax: 38.8, ay: 89.7, no: '7b', type: 'duel', name: 'Die Lagune', place: 'Lagune', easy: true, req: ['w4s5'],
      text: 'In der flachen Lagune treibt Surfer Sunny auf seinem Brett und lässt die Hand ins Wasser hängen. „Eine Runde? Ganz entspannt, Alter. Wer gewinnt, ist doch egal.“ Er gewinnt dann aber doch ganz gern.',
      goal: 'Gegen Sunny: Erreiche Stufe 6.',
      scn: {target: 6, bots: ['Sunny'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}]},
    {id: 'w4s8', luck: 0.1, face: 'art/monster-krabbenbaron-kneifer.webp', ax: 82, ay: 93.6, no: '8', type: 'boss', name: 'Kneifers Sandburg', place: 'Wasserlinie', reqAny: ['w4s6a', 'w4s6b'],
      text: 'Kneifers Sandburg ragt mit Scherentürmen aus dem Wasser. Der Baron sitzt im Hof auf einem Thron aus Muscheln, das Monokel im Auge. Bruno, Gesine und Sunny sitzen schon am Tisch. „Wer mich besiegt, kriegt die Strandkörbe“, klappert Kneifer. „Alle anderen zahlen doppelt.“',
      goal: 'Gegen Bruno, Gesine und Sunny. Kneifer steckt in der unteren Hälfte des Türstapels: Stufe 15, ein Meeresmonster, bei Flut also 18. Wer ihn besiegt, gewinnt. Besiegt ihn jemand anderes, hast du verloren. Stufe 10 gewinnt wie gewohnt.',
      scn: {target: 10, bots: ['Bruno', 'Gesine', 'Sunny'], boss: 'Krabbenbaron Kneifer', bossLvl: 15, diff: 'normal'},
      extras: [{t: 'Kneifer selbst besiegen', ok: st => st.bossBy === 0}, {t: 'Ohne Hilfe gegen Kneifer', ok: st => st.bossBy === 0 && !st.bossHelped}],
      reward: 'title:strandkoenig', final: true}
  ]
}, {
  id: 'w5', n: 5, name: 'Auf hoher See', face: 'icons/portrait-hilde.png', deck: 'meer', table: 'schiff', theme: 'schiff', map: 'art/karte-welt5.webp', mapRatio: 768 / 1376, paid: true,
  fog: {show: 0.6, teaser: [[25, 18.3], [60, 38.3], [40, 51.7]], hint: 'Besiege Krabbenbaron Kneifer, dann geht es aufs Meer.'},
  intro: 'Ohne Uschi ist der Stammtisch nur halb so laut. Hilde kramt eine alte Seekarte aus dem Keller, Sunny leiht euch sein Surfbrett, und Wal Walburga bietet an, euch zu ziehen. Irgendwo da draußen segelt Käpt’n Achtarm, ein Krake mit acht Säbeln und einem Holzbein, das er nicht braucht. Kneifer ist jetzt sein Bootsmann. „Uschi spielt Karten mit denen“, sagt Berta. „Die armen Piraten.“',
  outro: 'Achtarm streicht die Flagge mit allen acht Armen. Uschi steht an Deck, einen Sack voller Dublonen über der Schulter. „Ich hab sie alle beim Kartenspielen ausgenommen. Warum hat das so lange gedauert?“ Walburga zieht das Schiff nach Hause. Am Abend sitzt der Stammtisch wieder bei Hilde, und an der Wand hängt jetzt eine Piratenflagge.',
  rules: [['Seegang', 'Eine Ereigniskarte im Türstapel. Wird sie aufgedeckt, geben alle 1 zufällige Handkarte an den Nachbarn weiter: in ungerader Runde nach links, in gerader nach rechts. Verdeckt gezogen darfst du sie jederzeit von der Hand auslösen, auch mitten im Kampf.'], ['Schatzkarte', 'Im Schatzstapel liegen eine linke und eine rechte Hälfte. Hast du beide, gräbst du in deinem Zug den Schatz aus und ziehst 3 Schätze.'], ['Piraten', 'Augenklappe, Enterhaken und Kanonenkugel sind gegen Piraten stärker. Wer einen Piraten besiegt, findet manchmal eine Schatzkarten-Hälfte.'], ['Klasse Pirat', 'Nur im Meeres-Deck. Plündern: Wer als Pirat ohne Helfer gewinnt, zieht 1 Schatz mehr. Seefest: Bei Seegang gibt der Pirat keine Karte ab, bekommt aber trotzdem eine.'], ['Tiefsee', 'Tiefseemonster leben im Dunkeln: Weglaufen −1. Mit dem Taucherhelm gilt der Malus nicht, und es gibt +3 im Kampf.'], ['Käpt’n Achtarm', 'Der Boss steckt nur in der letzten Station im Türstapel. Wer ihn besiegt, gewinnt sofort.']],
  sell: {boss: 'Käpt’n Achtarm', rule: 'Seegang und Schatzkarte: Karten wandern übers Deck, und ein Schatz will ausgegraben werden', cards: 31, loot: '4 Titel, 3 Rahmen und ein Porträt'},
  unlocks: ['das Meeres-Deck mit Tischfläche „Schiffsdeck“ und Piratenmusik'],
  starReward: {n: 18, id: 'frame:korallenrot'},
  finalTitle: 'Uschi ist frei!',
  stations: [
    {id: 'w5s1', face: 'art/monster-tintenfisch-taschendieb.webp', ax: 25, ay: 11, no: '1', type: 'puzzle', name: 'Der Taschendieb', place: 'Anlegesteg', req: ['w4s8'],
      text: 'Kaum habt ihr den Proviant auf Sunnys Surfbrett geladen, schlängelt sich ein Arm aus dem Wasser und greift nach dem Fischbrötchen. Dann noch einer. Und noch einer. Ein Tintenfisch mit Ganovenmaske, und er ist stinksauer, weil ihr ihn erwischt habt.',
      goal: 'Besiege den stinksauren Tintenfisch-Taschendieb (Kampfstärke 9). Du hast Stufe 4, eine Augenklappe und drei Karten auf der Hand: Kampfstärke 5.',
      scn: {fight: {mons: ['Tintenfisch-Taschendieb'], enh: ['Stinksauer']}, start: {lvl: 4, eq: ['Augenklappe'], hand: ['Rumfass', 'Fischbrötchen', 'Kanonenkugel'], deal: false}, bots: []},
      extras: [{t: 'Mit höchstens zwei Karten gewinnen', ok: st => st.played <= 2}, {t: 'Die Kanonenkugel behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Kanonenkugel')}],
      reward: 'title:leichtmatrose'},
    {id: 'w5s2', luck: 0.15, face: 'icons/portrait-walburga.png', ax: 60, ay: 23, no: '2', type: 'duel', name: 'Walburgas Lied', place: 'Offenes Meer', req: ['w5s1'],
      text: 'Walburga zieht euer Brett mit einem Seil übers Meer und singt dabei so laut, dass die Möwen abdrehen. „Zum Zeitvertreib eine Runde? Ich bin ganz schlecht, ehrlich!“ Sie ist nicht schlecht.',
      goal: '1 gegen 1 gegen Walburga, mit dem Meeres-Deck: Erreiche Stufe 5 vor ihr.',
      scn: {target: 5, bots: ['Walburga'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}],
      reward: 'frame:walblau'},
    {id: 'w5s3', face: 'icons/portrait-pepe.png', ax: 40, ay: 31, no: '3', type: 'event', name: 'Pepe plappert', place: 'Krähennest', req: ['w5s2'],
      text: 'Ein Piratenschiff! Oben im Krähennest sitzt ein bunter Papagei und plappert: „Kombüse! Kombüse! Sardella kocht! Krrrah!“ Für ein kleines Geschenk verrät er bestimmt mehr.',
      goal: 'Gib Pepe etwas und nimm, was er dir dafür zeigt. Es wirkt sich auf die nächste Station aus.',
      choices: [
        {v: 'helm', l: 'Den Taucherhelm nehmen', d: 'Du startest Station 4 mit dem Taucherhelm (+1, gegen Tiefsee +3, kein Weglauf-Malus).'},
        {v: 'haken', l: 'Den Enterhaken nehmen', d: 'Du startest Station 4 mit dem Enterhaken (+2, gegen Piraten +4).'},
        {v: 'pirat', l: 'Bei Sardella anheuern', d: 'Du startest Station 4 als Pirat: allein gewonnen 1 Schatz mehr, bei Seegang gibst du nichts ab.'},
        {v: 'coins', l: 'Die 30 Münzen nehmen', d: 'Du bekommst 30 Münzen.', coins: 30}
      ]},
    {id: 'w5s4', luck: 0.1, face: 'icons/portrait-sardella.png', ax: 58, ay: 37, no: '4', type: 'duel', name: 'Die Kombüse', place: 'Piratenschiff', req: ['w5s3'],
      text: 'In der Kombüse rührt Smutje Sardella in einem Topf, aus dem ein Stiefel ragt. Pepe sitzt auf ihrer Schulter. „Blinde Passagiere? Wer gewinnt, darf bleiben. Wer verliert, schält Kartoffeln.“',
      goal: 'Gegen Sardella und Pepe: Erreiche als Erster Stufe 6.',
      scn: story => ({target: 6, bots: ['Sardella', 'Pepe'], diff: 'gemuetlich',
        start: story.choice.w5s3 === 'helm' ? {eq: ['Taucherhelm']} : story.choice.w5s3 === 'haken' ? {eq: ['Enterhaken']} : story.choice.w5s3 === 'pirat' ? {cls: 'Pirat'} : undefined}),
      extras: [{t: 'Einen Schatz ausgraben', ok: st => (st.dig || 0) >= 1}, {t: 'Nie aus einem Kampf weglaufen', ok: st => !st.ran}]},
    {id: 'w5s5', face: 'art/monster-krabbenbaron-kneifer.webp', ax: 14, ay: 44, no: '5', type: 'puzzle', name: 'Kneifers Revanche', place: 'Treibgut', req: ['w5s4'],
      text: 'Auf einem treibenden Fass hockt Kneifer, grün im Gesicht vor Seekrankheit. Trotzdem hebt er die Scheren: „Ihr schon wieder! Diesmal kneife ich zurück!“ Seekrank ist er schwächer, aber stinksauer.',
      goal: 'Besiege Kneifer (Kampfstärke 15: Stufe 15, seekrank −5, stinksauer +5). Du hast Stufe 5 und einen Piratensäbel: Kampfstärke 8.',
      scn: {fight: {mons: ['Krabbenbaron Kneifer'], enh: ['Winzig', 'Stinksauer']}, start: {lvl: 5, eq: ['Piratensäbel'], hand: ['Rumfass', 'Fischbrötchen', 'Riesenböller'], deal: false}, bots: []},
      extras: [{t: 'Mit genau zwei Karten gewinnen', ok: st => st.played === 2}, {t: 'Das Fischbrötchen behalten', ok: (st, S) => S.players[0].hand.some(c => c.n === 'Fischbrötchen')}],
      reward: 'title:krabbenbezwinger'},
    {id: 'w5s6a', face: 'icons/portrait-sardella.png', ax: 78, ay: 47, no: '6a', type: 'duel', name: 'Der Sturm', place: 'Sturmfront', hard: true, req: ['w5s5'],
      text: 'Mitten im Sturm hält Sardella das Steuer, Pepe klammert sich an den Mast. Die Wellen schlagen über das Deck, und die Karten rutschen ständig vom Tisch. „Weiterspielen!“, brüllt Sardella. „Bei Seegang schmeckt alles besser!“',
      goal: 'Gegen Sardella und Pepe mit dreimal so viel Seegang im Deck: Erreiche Stufe 7. Hier gibt es doppelte Münzen.',
      scn: {target: 7, bots: ['Sardella', 'Pepe'], diff: 'normal', more: {'Seegang': 6}}, coinMul: 2,
      extras: [{t: 'In weniger als 15 Runden', ok: (st, S) => S.turn < 15}, {t: 'Nie aus einem Kampf weglaufen', ok: st => !st.ran}]},
    {id: 'w5s6b', luck: 0.05, face: 'icons/portrait-walburga.png', ax: 53, ay: 63, no: '6b', type: 'duel', name: 'Die Schatzinsel', place: 'Insel', easy: true, req: ['w5s5'],
      text: 'Auf einer winzigen Insel mit einem roten X im Sand döst Walburga im seichten Wasser. „Hier ist es so schön ruhig. Noch eine Runde, bevor ihr weiterfahrt?“',
      goal: 'Gegen Walburga: Erreiche Stufe 6.',
      scn: {target: 6, bots: ['Walburga'], diff: 'gemuetlich'},
      extras: [{t: 'Keine Stufe verlieren', ok: st => !st.lvlLost}, {t: 'In weniger als 12 Runden', ok: (st, S) => S.turn < 12}]},
    {id: 'w5s7', ax: 32, ay: 77, no: '7', type: 'shop', name: 'Fietes Floß', place: 'Riff', reqAny: ['w5s6a', 'w5s6b'],
      text: 'Über dem Riff treibt Fischhändler Fiete auf seinem Floß, zwischen Kisten voller Muscheln und Fischbrötchen. „Moin! Alles frisch aus dem Meer, sogar die Rahmen.“',
      goal: 'Tausche Münzen gegen Rahmen, Titel, Porträts und Hintergründe. Danach geht es zu Achtarm.',
      shop: [{id: 'title:seebaer', price: 30}, {id: 'frame:dublonengold', price: 40}, {id: 'portrait:walburga', price: 60}, {id: 'bg:hohesee', price: 60}], onward: 'Weiter zu Achtarm'},
    {id: 'w5s8', luck: 0.1, face: 'art/monster-kaeptn-achtarm.webp', ax: 75, ay: 86, no: '8', type: 'boss', name: 'Achtarms Flaggschiff', place: 'Flaggschiff', req: ['w5s7'],
      text: 'Das schwarze Flaggschiff liegt vor euch, eine Krake als Galionsfigur. An Deck sitzt Uschi und mischt die Karten, Pepe und Sardella sind auch schon da. Achtarm lehnt am Mast und schwingt alle acht Säbel. „Wer mich besiegt, kriegt das Schiff. Und die Dame da gleich mit, die schuldet mir nämlich schon drei Truhen.“',
      goal: 'Gegen Pepe, Sardella und Uschi. Achtarm steckt in der unteren Hälfte des Türstapels: Stufe 16, Pirat und Tiefsee. Wer ihn besiegt, gewinnt. Besiegt ihn jemand anderes, hast du verloren. Stufe 10 gewinnt wie gewohnt.',
      scn: {target: 10, bots: ['Pepe', 'Sardella', 'Uschi'], boss: 'Käpt’n Achtarm', bossLvl: 16, diff: 'normal'},
      extras: [{t: 'Achtarm selbst besiegen', ok: st => st.bossBy === 0}, {t: 'Ohne Hilfe gegen Achtarm', ok: st => st.bossBy === 0 && !st.bossHelped}],
      reward: 'title:kaepten', final: true}
  ]
}];

// Welten, die noch kommen: auf der Karte im Nebel zu erahnen (map = späteres Musely-Bild)
// map fehlt noch: dann zeigt der Nebel eine schlichte Fläche. teaser in Prozent des sichtbaren Ausschnitts
const WORLDS_SOON = [];
// Welten, die gerade offen sind: Welt 1 immer, jede weitere nach Abschluss der vorigen
const openWorlds = () => WORLDS.filter((w, i) => i <= 1 || STORY.worlds[WORLDS[i - 1].id]);
const currentWorld = () => {
  const o = openWorlds(), last = o[o.length - 1];
  if (last.id === 'w1' && !STORY.worlds.w0 && !last.stations.some(st => STORY.done[st.id])) return WORLDS[0];
  return last;
};
// Die erste noch verschlossene Welt, als Nebel-Teaser (echte Welt mit fog-Daten oder Vorschau)
function fogWorld() {
  const o = openWorlds(), w = WORLDS[o.length];
  if (w) return {id: w.id, n: w.n, name: w.name, map: w.map, ratio: w.mapRatio, show: w.fog.show, teaser: w.fog.teaser, hint: w.fog.hint, soon: w.fog.hint, near: false};
  const f = WORLDS_SOON[0]; return f ? Object.assign({near: !!STORY.worlds[o[o.length - 1].id]}, f) : null;
}

const STORY = (() => {
  let s = null;
  try { if (typeof localStorage !== 'undefined') s = JSON.parse(localStorage.getItem(K_STORY)); } catch (e) {}
  const base = {v: 1, done: {}, stars: {}, coins: 0, owned: [], choice: {}, worlds: {}, intro: {}, fails: {}};
  return Object.assign(base, s || {});
})();
function saveStory() { try { localStorage.setItem(K_STORY, JSON.stringify(STORY)); } catch (e) {} }
if (STORY.done.w1s0 && !STORY.worlds.w0) { STORY.worlds.w0 = true; STORY.intro.w0 = true; }
// Belohnungen der Einführung (Titel nach Station 1, Rahmen nach der Probepartie) auch für alle, die sie schon hinter sich haben
if (STORY.done.w0s1 || STORY.worlds.w0) { if (!STORY.owned.includes('title:neuling')) STORY.owned.push('title:neuling'); }
if (STORY.done.w0s5 || STORY.worlds.w0) { if (!STORY.owned.includes('frame:bierdeckel')) STORY.owned.push('frame:bierdeckel'); }

/* ================= Käufe =================
   Kaufwelten (paid) sind sichtbar, sobald die Welt davor geschafft ist, spielbar aber erst nach dem Kauf.
   Gespeichert getrennt vom Fortschritt, damit ein Zurücksetzen des Storymodus keine Käufe löscht.
   Echte Bezahlung kommt mit der Play-Store-Version; bis dahin schaltet die Testphase gratis frei. */
const K_BUY = 'loota.kauf';
const PURCHASE = (() => { let b = null; try { if (typeof localStorage !== 'undefined') b = JSON.parse(localStorage.getItem(K_BUY)); } catch (e) {} return Object.assign({worlds: {}}, b || {}); })();
function savePurchase() { try { localStorage.setItem(K_BUY, JSON.stringify(PURCHASE)); } catch (e) {} }
const worldOwned = w => !w || !w.paid || !!PURCHASE.worlds[w.id];
// Welt abgeschlossen und (bei Kaufwelten) gekauft: erst dann gibt es Tisch, Musik, Deck und Karten fürs freie Spiel.
// Wird ein Kauf erstattet, ist das wieder zu, auch wenn die Welt schon gespielt ist.
const worldReady = id => !!STORY.worlds[id] && worldOwned(worldById(id));
// Kaufreihenfolge: eine Kaufwelt gibt es einzeln erst, wenn die Kaufwelt davor dir gehört (im Paket geht beides zusammen)
const needPrev = w => { const i = WORLDS.indexOf(w), p = WORLDS[i - 1]; return p && p.paid && !worldOwned(p) ? p : null; };
const offerOk = o => o.worlds.every(id => { const p = needPrev(worldById(id)); return !p || o.worlds.includes(p.id); });
// Angebote: einzelne Welt oder das Paket mit der nächsten Kaufwelt (Preise vorläufig)
const OFFERS = [
  {id: 'w4', worlds: ['w4'], n: 'Welt 4', price: '2,49 €'},
  {id: 'w5', worlds: ['w5'], n: 'Welt 5', price: '2,49 €'},
  {id: 'w45', worlds: ['w4', 'w5'], n: 'Welt 4 und 5', price: '3,99 €'}
];
function unlockOffer(id) { const o = OFFERS.find(x => x.id === id); if (!o) return false; o.worlds.forEach(w => { PURCHASE.worlds[w] = true; }); savePurchase(); return true; }
const allStations = () => WORLDS.flatMap(w => w.stations.map(st => Object.assign(st, {world: w.id})));
function stationById(id) { return allStations().find(st => st.id === id); }
function worldById(id) { return WORLDS.find(w => w.id === id); }
function stationUnlocked(st) {
  if (!worldOwned(worldById(st.world))) return false;   // ohne Kauf zu, auch schon gespielte Stationen (etwa nach einer Erstattung)
  if (STORY.done[st.id]) return true;   // einmal geschafft, bleibt offen (auch wenn später eine Station davor dazukommt)
  if (st.req && !st.req.every(r => STORY.done[r])) return false;
  if (st.reqAny && !st.reqAny.some(r => STORY.done[r])) return false;
  return true;
}
const maxStars = st => st.type === 'event' ? 1 : st.type === 'shop' ? 0 : 1 + (st.extras || []).length;
const starsOf = id => STORY.stars[id] || [];
const starNum = id => starsOf(id).filter(Boolean).length;
function worldStars(w) { return w.stations.reduce((n, st) => n + starNum(st.id), 0); }
function worldMaxStars(w) { return w.stations.reduce((n, st) => n + maxStars(st), 0); }
// Belohnungen aus Kaufwelten (Stationen und Sterne) gelten nur, solange die Welt gekauft ist
let PAID_LOOT = null;
const paidLoot = () => PAID_LOOT || (PAID_LOOT = Object.fromEntries(WORLDS.filter(w => w.paid).flatMap(w => [...w.stations.map(st => st.reward), w.starReward && w.starReward.id].filter(Boolean).map(id => [id, w]))));
const owns = id => STORY.owned.includes(id) && (!paidLoot()[id] || worldOwned(paidLoot()[id]));
function grant(id) { if (id && !STORY.owned.includes(id)) { STORY.owned.push(id); return true; } return false; }

// Szenario für die Engine; variant wird von der Oberfläche in Stückzahlen übersetzt
function scenarioFor(st) {
  const raw = typeof st.scn === 'function' ? st.scn(STORY) : st.scn;
  const scn = Object.assign({id: st.id}, raw);
  Object.keys(scn).forEach(k => scn[k] === undefined && delete scn[k]);
  // Verstecktes Glück: Grundwert der Station, dazu +0,1 je Niederlage dort (höchstens +0,4)
  const fails = Math.min(4, (STORY.fails || {})[st.id] || 0);
  if (st.luck || fails) scn.luck = Math.min(0.9, (st.luck || 0) + 0.1 * fails);
  return scn;
}

// Ergebnis einer gespielten Station auswerten und speichern
// Versteckte Belohnungen: im Charakter unsichtbar, bis man sie hat
const EGG_IDS = ['portrait:hoppel', 'title:hasenfuss'];
function finishStation(st, S) {
  const w = storyWon(S), mul = st.coinMul || 1;
  const stars = [w, ...(st.extras || []).map(e => { try { return w && !!e.ok(S.stats || {}, S); } catch (err) { return false; } })];
  const old = starsOf(st.id), merged = stars.map((v, i) => v || !!old[i]);
  const fresh = merged.filter((v, i) => v && !old[i]).length;
  if (fresh && st.type !== 'tutorial') dailyTrack('star', fresh);
  let coins = 0;
  if (w && !STORY.done[st.id]) coins += 10 * mul;
  coins += fresh * 5 * mul;
  const rewards = [];
  if (w && st.reward && grant(st.reward)) rewards.push(st.reward);
  STORY.stars[st.id] = merged;
  starReward(st.world, rewards);
  let worldDone = false;
  if (w) STORY.done[st.id] = true;
  STORY.fails = STORY.fails || {};
  if (!w && !STORY.done[st.id]) STORY.fails[st.id] = (STORY.fails[st.id] || 0) + 1;
  if (w && st.final && !STORY.worlds[st.world]) { STORY.worlds[st.world] = true; worldDone = true; }
  // Easter Egg: Wer die Probepartie der Einführung verliert, bekommt Trost von Hoppel
  let egg = false;
  if (!w && st.id === 'w0s5' && S.winner > 0) EGG_IDS.forEach(id => { if (grant(id)) { rewards.push(id); egg = true; } });
  STORY.stars[st.id] = merged;
  STORY.coins += coins;
  saveStory();
  return {won: w, stars, fresh, coins, rewards, worldDone, egg};
}
function chooseEvent(st, v) {
  const c = st.choices.find(x => x.v === v); if (!c || STORY.done[st.id]) return null;
  STORY.choice[st.id] = v; STORY.done[st.id] = true; STORY.stars[st.id] = [true];
  const coins = 5 + (c.coins || 0); STORY.coins += coins;
  const rewards = []; starReward(st.world, rewards);
  saveStory();
  return {coins, rewards};
}
// Sterne-Belohnung einer Welt (z. B. Rahmen ab 18 Sternen)
function starReward(worldId, rewards) {
  const w = worldById(worldId), r = w && w.starReward;
  if (r && worldStars(w) >= r.n && grant(r.id)) rewards.push(r.id);
}
// Testmodus: eine Station als geschafft werten, mit allen Sternen, Belohnung und Münzen wie bei einem Sieg
function skipStation(st) {
  if (!st || STORY.done[st.id]) return;
  if (st.type === 'event') { chooseEvent(st, st.choices[0].v); return; }
  STORY.done[st.id] = true;
  if (st.type !== 'shop') {
    const stars = [true, ...(st.extras || []).map(() => true)], mul = st.coinMul || 1;
    STORY.stars[st.id] = stars; STORY.coins += (10 + 5 * stars.length) * mul;
    if (st.reward) grant(st.reward);
    if (st.final) STORY.worlds[st.world] = true;
    starReward(st.world, []);
  }
  saveStory();
}
// Testmodus: alles bis vor diese Station überspringen (frühere Welten und die Stationen davor)
function skipTo(st) {
  for (const w of WORLDS) {
    for (const x of w.stations) { if (x === st) return; if (!(x.easy && w.stations.some(y => y.hard && STORY.done[y.id]))) skipStation(x); }
  }
}
// Testphase: alle Welten kaufen, jede Station mit allen Sternen abschließen und alle Optik freischalten
function unlockAll() {
  OFFERS.forEach(o => o.worlds.forEach(w => { PURCHASE.worlds[w] = true; })); savePurchase();
  allStations().forEach(st => skipStation(st));
  WORLDS.forEach(w => { STORY.worlds[w.id] = true; STORY.intro[w.id] = true; STORY.intro['kauf-' + w.id] = true; });
  Object.entries(COSMETICS).forEach(([k, list]) => Object.keys(list).forEach(key => grant(k + ':' + key)));
  saveStory();
}
function resetStory() { Object.assign(STORY, {done: {}, stars: {}, coins: 0, owned: [], choice: {}, worlds: {}, intro: {}, fails: {}}); saveStory(); }
function visitShop(st) { if (!STORY.done[st.id]) { STORY.done[st.id] = true; saveStory(); } }
function buyCosmetic(item) {
  if (owns(item.id)) return 'owned';
  if (STORY.coins < item.price) return 'poor';
  STORY.coins -= item.price; grant(item.id); saveStory();
  return 'ok';
}

/* ================= Tägliche Aufträge, Serie und Krämerladen =================
   Jeden Tag (Ortszeit, ab Mitternacht) drei Aufträge: leicht, mittel, schwer. Sie zählen im freien Spiel und im
   Storymodus, nicht in Rätseln und im Probespiel. Belohnung sind Münzen, dieselben wie im Storymodus. */
const K_DAILY = 'loota.daily';
const MISSIONS = [
  {id: 'kampf3', d: 0, k: 'win', n: 3, t: 'Gewinne 3 Kämpfe'},
  {id: 'fluch2', d: 0, k: 'curse', n: 2, t: 'Spiel 2 Flüche auf Gegner'},
  {id: 'einmal3', d: 0, k: 'oneshot', n: 3, t: 'Setz 3 Einmal-Gegenstände ein'},
  {id: 'flucht', d: 0, k: 'escape', n: 1, t: 'Entkomme einmal beim Weglaufen'},
  {id: 'helfen', d: 1, k: 'helped', n: 1, t: 'Hilf einem Mitspieler, einen Kampf zu gewinnen'},
  {id: 'gold', d: 1, k: 'gold', n: 1000, t: 'Verkaufe Gegenstände für 1.000 Gold'},
  {id: 'einmischen', d: 1, k: 'intf', n: 2, t: 'Misch dich zweimal in fremde Kämpfe ein'},
  {id: 'untot', d: 1, k: 'undead', n: 1, t: 'Besiege ein untotes Monster'},
  {id: 'kampf6', d: 1, k: 'win', n: 6, t: 'Gewinne 6 Kämpfe'},
  {id: 'nager', d: 1, k: 'nager', n: 1, t: 'Besiege einen Nager', w: 'w2'},
  {id: 'pilz', d: 1, k: 'pilz', n: 1, t: 'Besiege ein Pilz-Monster', w: 'w3'},
  {id: 'pfanne', d: 1, k: 'pfanne', n: 1, t: 'Koche eine Pilzpfanne', w: 'w3'},
  {id: 'meer', d: 1, k: 'meer', n: 1, t: 'Besiege ein Meeresmonster', w: 'w4'},
  {id: 'pirat', d: 1, k: 'pirat', n: 1, t: 'Besiege einen Piraten', w: 'w5'},
  {id: 'schatz', d: 1, k: 'dig', n: 1, t: 'Grabe einen Schatz aus', w: 'w5'},
  {id: 'sieg', d: 2, k: 'gamewon', n: 1, t: 'Gewinne eine Partie'},
  {id: 'gross', d: 2, k: 'big', n: 1, t: 'Besiege ein Monster ab Stufe 10'},
  {id: 'sauber', d: 2, k: 'cleanwin', n: 1, t: 'Gewinne eine Partie, ohne eine Stufe zu verlieren'},
  {id: 'stern', d: 2, k: 'star', n: 1, t: 'Hol dir einen neuen Stern im Storymodus', stars: true}
];
const MISSION_COINS = [10, 15, 25], MISSION_LEVEL = ['Leicht', 'Mittel', 'Schwer'];
// Täglich wechselndes Angebot im Krämerladen (nur, was du noch nicht hast)
const SHOP_POOL = [
  {id: 'portrait:berta', price: 60}, {id: 'portrait:kalle', price: 60}, {id: 'portrait:uschi', price: 60}, {id: 'portrait:hilde', price: 100},
  {id: 'portrait:fridolin', price: 80}, {id: 'portrait:gustav', price: 80}, {id: 'portrait:trudi', price: 80}, {id: 'portrait:walter', price: 80},
  {id: 'portrait:bruno', price: 80}, {id: 'portrait:gesine', price: 80}, {id: 'portrait:pepe', price: 80}, {id: 'portrait:sardella', price: 80},
{id: 'frame:abendrot', price: 40}, {id: 'frame:mitternacht', price: 50}, {id: 'frame:eichenholz', price: 40},
  {id: 'frame:lavendel', price: 40}, {id: 'frame:perlmutt', price: 50},
  {id: 'title:gluckspilz', price: 30}, {id: 'title:wuerfelkoenig', price: 30}, {id: 'title:kartenhai', price: 30},
  {id: 'title:fruehaufsteher', price: 30}, {id: 'title:nachteule', price: 30}, {id: 'title:schatzsucher', price: 30},
  {id: 'bg:sternennacht', price: 70}, {id: 'bg:abendrot', price: 70}
];
const SHOP_N = 4;
const STREAK_FRAME = 'frame:wochenstammgast';
// Nur aus Truhen: die Holztruhe zieht aus den einfachen, die Goldtruhe zuerst aus den seltenen.
// Gezogen wird nur, was in COSMETICS steht.
const CHEST_ITEMS = {
  holz: ['title:truhenknacker', 'title:gluecksritter', 'title:dauerbrenner'],
  gold: ['title:stammtischlegende', 'portrait:minka', 'portrait:klappi', 'portrait:kurt', 'frame:truhenbeschlag', 'frame:schluesselbund', 'frame:edelsteine', 'bg:schatzkammer']
};
const cosmeticExists = id => { const [k, key] = id.split(':'); return !!(COSMETICS[k] && COSMETICS[k][key]); };
const chestItem = id => id === STREAK_FRAME || CHEST_ITEMS.holz.includes(id) || CHEST_ITEMS.gold.includes(id);
let DAILY_NOTIFY = null;   // (Text, Münzen) => Hinweis in der Oberfläche

function dayKey(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function dayOffset(n) { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d); }
// Zufall mit festem Startwert, damit Aufträge und Ladenangebot am selben Tag gleich bleiben
function seeded(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
const hasOpenStars = () => openWorlds().some(w => worldStars(w) < worldMaxStars(w));
const missionOk = m => (!m.w || openWorlds().some(w => w.id === m.w && worldOwned(w))) && (!m.stars || hasOpenStars());
const missionById = id => MISSIONS.find(m => m.id === id);

function rollMissions(day) {
  const r = seeded('auftrag-' + day);
  const used = [];   // kein Zähler doppelt, z. B. nicht „3 Kämpfe“ und „6 Kämpfe“ am selben Tag
  return [0, 1, 2].map(d => { const pool = MISSIONS.filter(m => m.d === d && missionOk(m) && !used.includes(m.k)); const m = pool[Math.floor(r() * pool.length)]; used.push(m.k); return {id: m.id, p: 0}; });
}
// Tagesangebot: je ein Porträt, ein Rahmen und ein Titel, dazu ein beliebiges viertes Stück (nur, was man noch nicht hat).
// Fehlt eine Sorte, füllt der Rest auf. salt würfelt für Tests ein anderes Angebot am selben Tag.
function rollShop(day, salt) {
  const r = seeded('laden-' + day + (salt || '')), open = SHOP_POOL.filter(x => !owns(x.id)).map(x => x.id);
  const take = a => a.length ? a.splice(Math.floor(r() * a.length), 1)[0] : null, out = [];
  ['portrait', 'frame', 'title'].forEach(k => { const id = take(open.filter(id => id.startsWith(k + ':'))); if (id) out.push(id); });
  const rest = open.filter(id => !out.includes(id));
  while (rest.length && out.length < SHOP_N) out.push(take(rest));
  return out;
}
let DAILY = null;
function saveDaily() { try { if (typeof localStorage !== 'undefined') localStorage.setItem(K_DAILY, JSON.stringify(DAILY)); } catch (e) {} }
// Aktueller Stand, beim Tageswechsel neue Aufträge und ein neues Angebot
function dailyState() {
  if (!DAILY) { try { DAILY = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(K_DAILY)) : null; } catch (e) { DAILY = null; } }
  if (!DAILY) DAILY = {day: null, list: [], rer: false, streak: {n: 0, last: null}, shop: []};
  const today = dayKey();
  if (DAILY.day !== today) { DAILY.day = today; DAILY.list = rollMissions(today); DAILY.rer = false; DAILY.shop = rollShop(today); saveDaily(); }
  // Leeres Angebot (z. B. weil damals schon alles gekauft war), inzwischen gibt es aber wieder etwas: gleich neu bestücken
  else if (!DAILY.shop.length && SHOP_POOL.some(x => !owns(x.id))) { DAILY.shop = rollShop(today); saveDaily(); }
  // Auftrag aus einer Welt, die dir nicht (mehr) gehört (etwa nach einer Erstattung): gegen einen passenden tauschen
  DAILY.list.forEach((e, i) => {
    const m = missionById(e.id); if (m && (e.p >= m.n || missionOk(m))) return;
    const d = m ? m.d : i, pool = MISSIONS.filter(x => x.d === d && missionOk(x) && !DAILY.list.some(y => { const ym = missionById(y.id); return y.id === x.id || (ym && ym.k === x.k); }));
    if (pool.length) { DAILY.list[i] = {id: pool[Math.floor(seeded('ersatz-' + today + i)() * pool.length)].id, p: 0}; saveDaily(); }
  });
  // Tagesangebot: das vierte Stück ist reduziert
  if (DAILY.shop.length && (!DAILY.deal || !DAILY.shop.includes(DAILY.deal.id))) {
    const r = seeded('angebot-' + today + DAILY.shop.join());
    DAILY.deal = {id: DAILY.shop[DAILY.shop.length - 1], pct: DEAL_PCT[Math.floor(r() * DEAL_PCT.length)]}; saveDaily();
  }
  return DAILY;
}
// Laufende Serie: zählt, solange gestern oder heute mindestens ein Auftrag erledigt wurde
function streakNow() { const s = dailyState().streak; return s.last === dayKey() || s.last === dayOffset(-1) ? s.n : 0; }
// Nächstes Serienziel nach n Tagen: bei 3 Tagen 20 Münzen, alle 7 Tage der Rahmen (sonst 40 Münzen)
// Serienziele bringen Truhen: nach 3 Tagen eine Holztruhe, alle 7 Tage eine Goldtruhe. Kaufen kann man sie nicht.
const CHESTS = {holz: {n: 'Holztruhe'}, gold: {n: 'Goldtruhe'}};
function streakGoal(at) { const t = at === 3 ? 'holz' : 'gold'; return {chest: t, l: `zur ${CHESTS[t].n}`}; }
const chestsWaiting = () => dailyState().chests || [];
// Truhe öffnen: Holztruhe meist Münzen, manchmal etwas Einfaches nur aus Truhen oder aus dem Krämerladen;
// Goldtruhe sicher etwas (zuerst der Rahmen „Wochenstammgast“, dann Seltenes nur aus Truhen) und dazu Münzen.
// Schon Vorhandenes wird nie gezogen.
function openChest() {
  const d = dailyState(); if (!d.chests || !d.chests.length) return null;
  const c = d.chests.shift(), gold = c.t === 'gold', rnd = a => a[Math.floor(Math.random() * a.length)];
  const open = a => a.filter(id => cosmeticExists(id) && !owns(id));
  const pool = open(SHOP_POOL.map(x => x.id)), common = open(CHEST_ITEMS.holz), rare = open(CHEST_ITEMS.gold);
  let id = null;
  if (gold) id = !owns(STREAK_FRAME) ? STREAK_FRAME : rare.length ? rnd(rare) : common.length ? rnd(common) : pool.length ? rnd(pool) : null;
  else if (Math.random() < 0.35) id = common.length && (Math.random() < 0.6 || !pool.length) ? rnd(common) : pool.length ? rnd(pool) : null;
  const coins = gold ? (id ? 20 : 60 + 5 * Math.floor(Math.random() * 9)) : (id ? 0 : 15 + 5 * Math.floor(Math.random() * 5));
  if (id) grant(id);
  STORY.coins += coins; saveStory(); saveDaily();
  return {t: c.t, id, coins};
}
function streakNext(n) { const at = n < 3 ? 3 : n < 7 ? 7 : Math.ceil((n + 1) / 7) * 7; return Object.assign({at, from: at === 3 ? 0 : at === 7 ? 3 : at - 7}, streakGoal(at)); }
// Längste je erreichte Serie (auch wenn die aktuelle schon abgerissen ist)
function streakBest() { const s = dailyState().streak; return Math.max(s.best || 0, s.n || 0); }
function streakToday() { return dailyState().streak.last === dayKey(); }
function bumpStreak() {
  const s = dailyState().streak, today = dayKey();
  if (s.last === today) return;
  s.n = s.last === dayOffset(-1) ? s.n + 1 : 1; s.last = today;
  s.best = Math.max(s.best || 0, s.n);   // Rekord fürs Profil
  streakChest(s);
}
// Ab der zweiten Woche Münzen zwischendurch: am 3. und 6. Tag jeder Woche (Tag 10, 13, 17, 20 …)
const STREAK_COINS = {3: 10, 6: 15};
const streakCoins = n => n > 7 ? STREAK_COINS[n % 7] || 0 : 0;
// Serienziel erreicht: Truhe dazulegen (3. Tag Holz, alle 7 Tage Gold) bzw. Münzen gutschreiben
function streakChest(s) {
  const t = s.n === 3 ? 'holz' : s.n % 7 === 0 ? 'gold' : null;
  if (t) { const d = dailyState(); (d.chests = d.chests || []).push({t, n: s.n}); DAILY_NOTIFY && DAILY_NOTIFY(`Serie: ${s.n} Tage! Eine ${CHESTS[t].n} wartet auf dich.`, 0); }
  const c = streakCoins(s.n);
  if (c) { STORY.coins += c; saveStory(); DAILY_NOTIFY && DAILY_NOTIFY(`Serie: ${s.n} Tage! Hilde legt dir Münzen hin.`, c); }
}
// Testphase: Serie um einen Tag verlängern bzw. auf 0 setzen
function cheatStreak() { const s = dailyState().streak; s.n = streakNow() + 1; s.last = dayKey(); s.best = Math.max(s.best || 0, s.n); streakChest(s); saveDaily(); return s.n; }
function resetStreak() { const d = dailyState(); d.streak.n = 0; d.streak.last = null; d.chests = []; saveDaily(); }
// Von der Engine gemeldet: k = Zähler, n = Menge
function dailyTrack(k, n = 1) {
  const st = dailyState(); let gain = 0;
  st.list.forEach(e => {
    const m = missionById(e.id); if (!m || m.k !== k || e.p >= m.n) return;
    e.p = Math.min(m.n, e.p + n);
    if (e.p >= m.n) { const c = MISSION_COINS[m.d]; gain += c; STORY.coins += c; bumpStreak(); DAILY_NOTIFY && DAILY_NOTIFY(`Auftrag erledigt: ${m.t}`, c); }
  });
  saveDaily(); if (gain) saveStory();
}
// Einen Auftrag pro Tag gegen einen anderen gleicher Schwierigkeit tauschen
function rerollMission(i) {
  const st = dailyState(), e = st.list[i], m = e && missionById(e.id);
  if (!m || st.rer || e.p >= m.n) return false;
  const pool = MISSIONS.filter(x => x.d === m.d && missionOk(x) && !st.list.some(y => y.id === x.id || missionById(y.id).k === x.k));
  if (!pool.length) return false;
  st.list[i] = {id: pool[Math.floor(Math.random() * pool.length)].id, p: 0}; st.rer = true; saveDaily();
  return true;
}
const shopItem = id => SHOP_POOL.find(x => x.id === id);
const DEAL_PCT = [20, 25, 30, 40, 50];
const shopDeal = id => { const d = dailyState().deal; return d && d.id === id ? d : null; };
// Preis heute: beim Tagesangebot reduziert, auf 5 Münzen gerundet
function shopPrice(id) { const it = shopItem(id), d = it && shopDeal(id); return !it ? 0 : d ? Math.max(5, Math.round(it.price * (100 - d.pct) / 500) * 5) : it.price; }
function buyShopItem(id) { const it = shopItem(id); if (!it || !dailyState().shop.includes(id)) return 'gone'; return buyCosmetic(Object.assign({}, it, {price: shopPrice(id)})); }
if (typeof module !== 'undefined') module.exports = {WORLDS, STORY, COSMETICS, scenarioFor, finishStation, chooseEvent, stationById, stationUnlocked, maxStars, openWorlds, worldStars, worldMaxStars, dailyState, dailyTrack, rerollMission, streakNow, MISSIONS, buyShopItem};

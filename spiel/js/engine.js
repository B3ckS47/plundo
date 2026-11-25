'use strict';
const HEADLESS = typeof document === 'undefined';

/* ================= Karten (alle frei erfunden) ================= */
const MONSTERS = [
  {n:'Wütender Gartenzwerg',lvl:1,tr:1,x:2,bad:{t:'lvl',n:1},txt:'Verteidigt sein Beet mit dem Rechen.',badTxt:'Verliere 1 Stufe.'},
  {n:'Schleimige Socke',lvl:1,tr:1,x:2,bad:{t:'slot',s:'schuhe'},txt:'Lag drei Jahre unter dem Bett.',badTxt:'Verliere dein Schuhwerk.'},
  {n:'Schwarm Stechmücken',lvl:2,tr:1,vs:{race:'elf',val:2},bad:{t:'lvl',n:1},txt:'Lieben Elfenblut: +2 gegen Elfen.',badTxt:'Verliere 1 Stufe.'},
  {n:'Übellaunige Möwe',lvl:2,tr:1,x:2,bad:{t:'slot',s:'kopf'},txt:'Klaut Pommes und Helme.',badTxt:'Verliere deine Kopfbedeckung.'},
  {n:'Kellerassel XXL',lvl:3,tr:1,vs:{race:'halbling',val:3},bad:{t:'hand',n:2},txt:'Hält Kobolde für Snacks: +3 gegen Kobolde.',badTxt:'Wirf 2 zufällige Handkarten ab.'},
  {n:'Rentner-Ritter',lvl:4,tr:2,x:2,bad:{t:'slot',s:'ruestung'},txt:'Erzählt von früher. Stundenlang.',badTxt:'Verliere deine Rüstung.'},
  {n:'Steuerprüfer-Gespenst',lvl:4,tr:2,undead:true,bad:{t:'lvl',n:1},txt:'Untot. Prüft rückwirkend zehn Jahre.',badTxt:'Verliere 1 Stufe.'},
  {n:'Pilzkönig',lvl:5,tr:2,pilz:true,bad:{t:'best'},txt:'Pilz. Hält Hof im Komposthaufen.',badTxt:'Verliere deinen besten Gegenstand.'},
  {n:'Vampir-Kaninchen',lvl:6,tr:2,undead:true,run:-1,bad:{t:'lvl',n:2},txt:'Untot und erschreckend schnell: Weglaufen −1.',badTxt:'Verliere 2 Stufen.'},
  {n:'Durchgedrehter Saugroboter',lvl:6,tr:2,bad:{t:'multi',l:[{t:'slot',s:'schuhe'},{t:'hand',n:2}]},txt:'Hat deine Schnürsenkel gefressen.',badTxt:'Verliere dein Schuhwerk und 2 Handkarten.'},
  {n:'Riesen-Nacktschnecke',lvl:7,tr:2,run:1,bad:{t:'multi',l:[{t:'slot',s:'schuhe'},{t:'lvl',n:1}]},txt:'Sehr, sehr langsam: Weglaufen +1.',badTxt:'Verliere dein Schuhwerk und 1 Stufe.'},
  {n:'Zombie-Hausmeister',lvl:8,tr:2,undead:true,bad:{t:'class'},txt:'Untot. Hat den Schlüssel zu jedem Raum.',badTxt:'Verliere deine Klasse. Hast du keine: 1 Stufe.'},
  {n:'Troll unter der Autobahnbrücke',lvl:9,tr:3,vs:{race:'zwerg',val:3},bad:{t:'lvl',n:2},txt:'Verlangt Maut. Mag keine Zwerge: +3 gegen Zwerge.',badTxt:'Verliere 2 Stufen.'},
  {n:'Bürokratie-Golem',lvl:10,tr:3,bad:{t:'hand',n:99},txt:'Besteht aus Formularen in dreifacher Ausfertigung.',badTxt:'Wirf deine gesamte Hand ab.'},
  {n:'Falsche Schatztruhe',lvl:11,tr:3,bad:{t:'multi',l:[{t:'best'},{t:'lvl',n:1}]},txt:'Sieht aus wie ein Schatz. Ist keiner.',badTxt:'Verliere deinen besten Gegenstand und 1 Stufe.'},
  {n:'Feuerspeiende Kaffeemaschine',lvl:12,tr:3,np:3,bad:{t:'multi',l:[{t:'slot',s:'kopf'},{t:'slot',s:'ruestung'}]},txt:'Verfolgt niemanden bis Stufe 3.',badTxt:'Verliere Kopfbedeckung und Rüstung.'},
  {n:'Hydra mit Migräne',lvl:14,tr:4,np:4,bad:{t:'lvl',n:3},txt:'Neun Köpfe, neunfache Kopfschmerzen. Verfolgt niemanden bis Stufe 4.',badTxt:'Verliere 3 Stufen.'},
  {n:'Drache des Montagmorgens',lvl:16,tr:4,up:2,np:5,bad:{t:'death'},txt:'Bringt 2 Stufen. Verfolgt niemanden bis Stufe 5.',badTxt:'Du bist tot.'},
  {n:'Lich mit Rückenschmerzen',lvl:18,tr:5,up:2,undead:true,np:5,bad:{t:'death'},txt:'Untot. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 5.',badTxt:'Du bist tot.'}
];
const CURSES = [
  {n:'Pechsträhne',x:2,eff:{t:'lvl',n:1},txt:'Verliere 1 Stufe.'},
  {n:'Windböe',eff:{t:'slot',s:'kopf'},txt:'Verliere deine Kopfbedeckung.'},
  {n:'Rost',eff:{t:'slot',s:'ruestung'},txt:'Verliere deine Rüstung.'},
  {n:'Löcher in den Sohlen',eff:{t:'slot',s:'schuhe'},txt:'Verliere dein Schuhwerk.'},
  {n:'Identitätskrise',eff:{t:'class'},txt:'Verliere deine Klasse. Hast du keine: 1 Stufe.'},
  {n:'Ahnenforschung',eff:{t:'race'},txt:'Verliere dein Volk. Du bist wieder Mensch.'},
  {n:'Taschendieb-Gnom',eff:{t:'hand',n:2},txt:'Wirf 2 zufällige Handkarten ab.'}
];
/* Welt 2 (Tavernenkeller): nur im Keller-Deck. w = Welt, x = Stückzahl dort */
const MONSTERS_W2 = [
  {n:'Staubmaus-Bande',lvl:1,tr:1,x:2,nager:true,bad:{t:'hand',n:1},txt:'Nager. Zu dritt unterm Regal.',badTxt:'Wirf 1 zufällige Handkarte ab.'},
  {n:'Spinne mit Strickzeug',lvl:2,tr:1,run:-1,bad:{t:'slot',s:'schuhe'},txt:'Du klebst im Netz: Weglaufen −1.',badTxt:'Verliere dein Schuhwerk.'},
  {n:'Kerzenwachs-Golem',lvl:3,tr:1,vs:{race:'zwerg',val:2},bad:{t:'slot',s:'ruestung'},txt:'Verklebt Bärte: +2 gegen Zwerge.',badTxt:'Verliere deine Rüstung.'},
  {n:'Korkgeist',lvl:4,tr:2,undead:true,bad:{t:'lvl',n:1},txt:'Untot. Spukt in jeder Flasche mit Korken.',badTxt:'Verliere 1 Stufe.'},
  {n:'Schimmel-Schleim',lvl:5,tr:2,run:1,bad:{t:'best'},txt:'Sehr langsam: Weglaufen +1.',badTxt:'Verliere deinen besten Gegenstand.'},
  {n:'Rollendes Riesenfass',lvl:7,tr:2,run:-2,bad:{t:'multi',l:[{t:'lvl',n:1},{t:'slot',s:'schuhe'}]},txt:'Rollt dir hinterher: Weglaufen −2.',badTxt:'Verliere 1 Stufe und dein Schuhwerk.'},
  {n:'Pfandflaschen-Golem',lvl:10,tr:3,bad:{t:'lvl',n:2},txt:'Klirrt bedrohlich.',badTxt:'Verliere 2 Stufen.'},
  {n:'Ratten-Leibgarde',lvl:12,tr:3,nager:true,np:3,bad:{t:'multi',l:[{t:'slot',s:'kopf'},{t:'lvl',n:1}]},txt:'Nager. Bewacht den Thron. Verfolgt niemanden bis Stufe 3.',badTxt:'Verliere deine Kopfbedeckung und 1 Stufe.'},
  {n:'Rattenkönig Rüdiger',lvl:14,tr:4,up:2,nager:true,np:4,bad:{t:'multi',l:[{t:'lvl',n:2},{t:'best'}]},txt:'Nager. Trägt einen Kronkorken als Krone. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 4.',badTxt:'Verliere 2 Stufen und deinen besten Gegenstand.'},
  {n:'Kanal-Krokodil Klaus',lvl:15,tr:4,up:2,np:5,bad:{t:'death'},txt:'Kam als Haustier und wuchs durchs Abflussrohr. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 5.',badTxt:'Du bist tot.'}
].map(m=>Object.assign({w:2},m));
const CURSES_W2 = [
  {n:'Kellerkälte',w:2,x:2,eff:{t:'chill',n:2},txt:'Im nächsten Kampf −2.'},
  {n:'Licht aus!',w:2,x:2,eff:{t:'slot',s:'hand'},txt:'Verliere einen Gegenstand in der Hand.'}
];
const ITEMS_W2 = [
  {n:'Kellerlaterne',w:2,x:2,slot:'hand',hands:1,b:1,g:300,run:1},
  {n:'Fassdeckel-Schild',w:2,x:2,slot:'hand',hands:1,b:2,g:400,und:4},
  {n:'Kartoffelsack-Rüstung',w:2,slot:'ruestung',b:1,g:100,flv:'Riecht nach Keller.'},
  {n:'Kronkorken-Krone',w:2,slot:'kopf',b:2,g:500,flv:'Nur echt mit Zacken.'}
];
const ONESHOTS_W2 = [
  {n:'Mausefalle',w:2,x:2,b:2,g:200,pOnly:true,vs:{tag:'nager',val:6},txt:'Gegen Nager +6, sonst +2. Nur für die kämpfende Seite.'},
  {n:'Knoblauchzopf',w:2,x:2,b:1,g:200,pOnly:true,vs:{tag:'undead',val:5},txt:'Gegen Untote +5, sonst +1. Nur für die kämpfende Seite.'}
];
const LEVELUPS_W2 = ['Bier aus dem Keller geholt'];
// Was aus dem Grunddeck mit in den Keller darf (Name -> Stückzahl); Schätze kommen alle mit
const KELLER_GRUND = {'Wütender Gartenzwerg':1,'Schleimige Socke':2,'Kellerassel XXL':1,'Steuerprüfer-Gespenst':1,'Pilzkönig':1,'Vampir-Kaninchen':1,'Riesen-Nacktschnecke':1,'Zombie-Hausmeister':1,'Falsche Schatztruhe':1,
  'Pechsträhne':1,'Rost':1,'Löcher in den Sohlen':1,'Identitätskrise':1,'Ahnenforschung':1,'Taschendieb-Gnom':1};
/* Grund-Schätze, die in einem Welt-Deck Platz für die Welt-Karten machen (Name -> Stückzahl dort).
   Getauscht wird möglichst Gleiches gegen Gleiches (Platz, Bonus), damit die Decks gleich stark bleiben. */
const TR_SWAP = {
  2: {'Topfdeckel-Schild':0,'Gusseiserne Bratpfanne':0,'Gummihuhn mit Quietsch':0,'Lederschürze':0,'Hörnerhelm':0,
      'Stinkbombe':0,'Trank der Tapferkeit':1,'Regelheft gelesen':0},
  3: {'Gummihuhn mit Quietsch':0,'Gusseiserne Bratpfanne':0,'Topfhelm mit Delle':0,'Rutschige Schleimrüstung':0,
      'Trank der Tapferkeit':1,'Flasche Drachenschnaps':1,'Stinkbombe':0,'Würfel angehaucht':0},
  4: {'Topfhelm mit Delle':0,'Topfdeckel-Schild':0,'Gummihuhn mit Quietsch':0,'Schnelle Latschen':0,'Glücksumhang':0,
      'Trank der Tapferkeit':1,'Stinkbombe':0,'Snacks mitgebracht':0},
  5: {'Topfhelm mit Delle':0,'Hörnerhelm':0,'Rostiges Schwert':0,'Gummihuhn mit Quietsch':0,'Stahlkappenstiefel':0,'Lederschürze':0,
      'Trank der Tapferkeit':1,'Stinkbombe':0,'Nebelpulver':1,'Pizza für alle bestellt':0,'Snacks mitgebracht':0}
};
const trCount = (p, w) => TR_SWAP[w][p.tpl.n] != null ? TR_SWAP[w][p.tpl.n] : p.def;
// Stückzahl einer Pool-Karte im Keller-Deck
function kellerCount(p){ if(p.tpl.w===2) return p.wdef; if(p.deck==='tr') return trCount(p,2); if(p.tpl.k==='monster'||p.tpl.k==='curse') return KELLER_GRUND[p.tpl.n]||0; return p.def; }
/* Welt 3 (Pilzwald): nur im Pilzwald-Deck. pilz = Monster-Merkmal, spore = Fluch bis zum nächsten Sieg */
const MONSTERS_W3 = [
  {n:'Wandernder Bovist',lvl:1,tr:1,x:2,pilz:true,bad:{t:'spore',n:1},txt:'Pilz. Platzt bei jeder Berührung.',badTxt:'Du bekommst eine Sporenwolke ab: −1 in jedem Kampf, bis du einen gewinnst.'},
  {n:'Eichhörnchen-Inkasso',lvl:2,tr:1,bad:{t:'slot',s:'kopf'},txt:'Treibt alte Nussschulden ein.',badTxt:'Verliere deine Kopfbedeckung. Es baut ein Nest darin.'},
  {n:'Pfifferling-Gang',lvl:3,tr:1,pilz:true,vs:{race:'halbling',val:2},bad:{t:'hand',n:1},txt:'Pilz. Zu fünft und sehr reizbar: +2 gegen Kobolde.',badTxt:'Wirf 1 zufällige Handkarte ab.'},
  {n:'Hexenring',lvl:4,tr:2,pilz:true,run:-2,bad:{t:'lvl',n:1},txt:'Pilz. Wer hineintritt, muss tanzen: Weglaufen −2.',badTxt:'Verliere 1 Stufe.'},
  {n:'Moos-Troll',lvl:6,tr:2,vs:{race:'elf',val:3},bad:{t:'slot',s:'ruestung'},txt:'Hält Elfen für Unkraut: +3 gegen Elfen.',badTxt:'Verliere deine Rüstung.'},
  {n:'Gestiefelter Fliegenpilz',lvl:8,tr:2,pilz:true,bad:{t:'multi',l:[{t:'lvl',n:1},{t:'spore',n:1}]},txt:'Pilz. Fesch, aber giftig.',badTxt:'Verliere 1 Stufe und bekomme eine Sporenwolke ab.'},
  {n:'Bärlauch-Bär',lvl:9,tr:2,run:-2,bad:{t:'lvl',n:2},txt:'Riecht dich drei Täler weit: Weglaufen −2.',badTxt:'Verliere 2 Stufen.'},
  {n:'Myzel-Koloss',lvl:12,tr:3,pilz:true,noHelp:true,np:3,bad:{t:'lvl',n:2},txt:'Pilz. Das Waldnetz hört alles mit: Niemand darf helfen. Verfolgt niemanden bis Stufe 3.',badTxt:'Verliere 2 Stufen.'},
  {n:'Pilzkönigin Morchella',lvl:15,tr:4,up:2,pilz:true,np:4,bad:{t:'multi',l:[{t:'lvl',n:2},{t:'best'}]},txt:'Pilz. Ihr Mann, der Pilzkönig, trägt ihr die Schleppe. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 4.',badTxt:'Verliere 2 Stufen und deinen besten Gegenstand.'},
  {n:'Moorgeist mit Mundgeruch',lvl:16,tr:4,up:2,undead:true,np:5,bad:{t:'death'},txt:'Untot. Ein einziger Hauch genügt. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 5.',badTxt:'Du bist tot.'}
].map(m=>Object.assign({w:3},m));
const CURSES_W3 = [
  {n:'Sporenwolke',w:3,x:2,eff:{t:'spore',n:1},txt:'Bleibt, bis du einen Kampf gewinnst: So lange −1 in jedem Kampf.'},
  {n:'Ameisen in der Hose',w:3,x:2,eff:{t:'slot',s:'ruestung'},txt:'Verliere deine Rüstung.'}
];
const ITEMS_W3 = [
  {n:'Pilzmesser',w:3,x:2,slot:'hand',hands:1,b:1,g:300,pilzb:3},
  {n:'Sammelkorb',w:3,slot:'hand',hands:1,b:1,g:200,korb:true,flv:'Für die Pilzpfanne reichen zwei verschiedene Speisepilze.'},
  {n:'Fliegenpilzhut',w:3,slot:'kopf',b:2,g:400,flv:'Steht dir erstaunlich gut.'},
  {n:'Moosmantel',w:3,slot:'ruestung',b:2,g:400,run:1,flv:'Im Wald sieht man dich kaum.'}
];
const SPEISE = ['Steinpilz','Pfifferling','Champignon'];
const ONESHOTS_W3 = [
  ...SPEISE.map(n=>({n,w:3,x:2,b:2,g:100,pOnly:true,speise:true,txt:'+2. Speisepilz: Steinpilz, Pfifferling und Champignon zusammen ergeben eine Pilzpfanne (+1 Stufe). Nur für die kämpfende Seite.'})),
  {n:'Fußpilzsalbe',w:3,x:2,b:1,g:200,pOnly:true,vs:{tag:'pilz',val:6},txt:'Gegen Pilze +6, sonst +1. Nur für die kämpfende Seite.'}
];
const LEVELUPS_W3 = ['Aus dem Wald zurückgefunden'];
// Was aus dem Grunddeck mit in den Wald darf (Name -> Stückzahl); Schätze kommen alle mit
const WALD_GRUND = {'Wütender Gartenzwerg':1,'Schleimige Socke':1,'Schwarm Stechmücken':1,'Kellerassel XXL':1,'Rentner-Ritter':1,'Pilzkönig':1,'Vampir-Kaninchen':1,'Riesen-Nacktschnecke':1,
  'Pechsträhne':1,'Windböe':1,'Rost':1,'Löcher in den Sohlen':1,'Identitätskrise':1,'Ahnenforschung':1,'Taschendieb-Gnom':1};
function waldCount(p){ if(p.tpl.w===3) return p.wdef; if(p.tpl.w) return 0; if(p.deck==='tr') return trCount(p,3); if(p.tpl.k==='monster'||p.tpl.k==='curse') return WALD_GRUND[p.tpl.n]||0; return p.def; }
/* Welt 4 (Sommerpause, Strand): nur im Strand-Deck. meer = Monster-Merkmal (bei Flut +3), sun = Sonnenbrand,
   sand = Sand in der Badehose. Ebbe und Flut wechseln mit jeder Runde, solange Strandkarten im Spiel sind. */
const MONSTERS_W4 = [
  {n:'Sandfloh-Schwarm',lvl:1,tr:1,x:2,bad:{t:'hand',n:1},txt:'Springt überall hin.',badTxt:'Wirf 1 zufällige Handkarte ab.'},
  {n:'Möwen-Bande',lvl:2,tr:1,moewe:true,bad:{t:'cheap'},txt:'Klaut alles, was nach Pommes riecht. Gegen die Kokosnuss machtlos.',badTxt:'Sie klauen deinen billigsten Gegenstand.'},
  {n:'Quallen-Gang',lvl:3,tr:1,x:2,meer:true,bad:{t:'sun'},txt:'Meer. Brennt wie Feuer.',badTxt:'Du bekommst Sonnenbrand: −1 in jedem Kampf, und niemand hilft dir, bis du einen Kampf gewinnst.'},
  {n:'Strandkorb-Mimik',lvl:4,tr:1,run:-2,bad:{t:'slot',s:'schuhe'},txt:'Klappt zu: Weglaufen −2.',badTxt:'Verliere dein Schuhwerk.'},
  {n:'Seeigel-Igel',lvl:5,tr:1,meer:true,vs:{race:'halbling',val:3},bad:{t:'lvl',n:1},txt:'Meer. Kobolde laufen barfuß: +3 gegen Kobolde.',badTxt:'Verliere 1 Stufe.'},
  {n:'Betrunkener Klabautermann',lvl:6,tr:2,meer:true,run:-1,bad:{t:'multi',l:[{t:'lvl',n:1},{t:'slot',s:'kopf'}]},txt:'Meer. Torkelt unberechenbar: Weglaufen −1.',badTxt:'Verliere 1 Stufe und deine Kopfbedeckung.'},
  {n:'Bademeister-Golem',lvl:8,tr:2,vs:{cls:'krieger',val:3},bad:{t:'class'},txt:'„Hier wird nicht gerauft!“ +3 gegen Krieger.',badTxt:'Verliere deine Klasse.'},
  {n:'Hai mit Schwimmflügeln',lvl:10,tr:3,meer:true,run:-2,bad:{t:'lvl',n:2},txt:'Meer. Schwimmt schneller als du: Weglaufen −2.',badTxt:'Verliere 2 Stufen.'},
  {n:'Sandburg-Koloss',lvl:12,tr:3,soft:3,np:3,bad:{t:'multi',l:[{t:'slot',s:'ruestung'},{t:'lvl',n:1}]},txt:'Bei Flut weicht er auf: dann −3. Verfolgt niemanden bis Stufe 3.',badTxt:'Verliere deine Rüstung und 1 Stufe.'},
  {n:'Krabbenbaron Kneifer',lvl:15,tr:4,up:2,meer:true,np:4,bad:{t:'multi',l:[{t:'lvl',n:2},{t:'hands'}]},txt:'Meer. Kassiert für jeden Fußbreit Sand. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 4.',badTxt:'Verliere 2 Stufen und alles, was du in den Händen hältst.'},
  {n:'Sandwurm mit Sonnenbrand',lvl:16,tr:4,up:2,np:5,bad:{t:'death'},txt:'Taucht genau dort auf, wo dein Handtuch liegt. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 5.',badTxt:'Du bist tot.'}
].map(m=>Object.assign({w:4},m));
const CURSES_W4 = [
  {n:'Sonnenbrand',w:4,x:2,eff:{t:'sun'},txt:'Bleibt, bis du einen Kampf gewinnst: So lange −1 in jedem Kampf, und niemand hilft dir.'},
  {n:'Sand in der Badehose',w:4,x:2,eff:{t:'sand'},txt:'Weglaufen −2, bis du eine Stufe aufsteigst.'}
];
const ITEMS_W4 = [
  {n:'Schnorchel',w:4,slot:'kopf',b:1,g:300,meerb:3,flv:'Unter Wasser sieht man die Quallen kommen.'},
  {n:'Sonnenschirm',w:4,x:2,slot:'hand',hands:1,b:2,g:300,shade:true,flv:'Schützt vor Sonnenbrand.'},
  {n:'Flip-Flops',w:4,x:2,slot:'schuhe',b:1,run:1,g:200},
  {n:'Schwimmflügel',w:4,slot:'none',b:0,g:300,flutRun:2,flv:'Bei Flut +2 beim Weglaufen.'}
];
const ONESHOTS_W4 = [
  {n:'Sonnencreme LSF 50',w:4,x:2,b:2,g:200,pOnly:true,cream:true,txt:'+2 für die kämpfende Seite. Wer Sonnenbrand hat, ist ihn damit sofort los, auch außerhalb von Kämpfen.'},
  {n:'Kokosnuss',w:4,x:2,b:3,g:200,vs:{tag:'moewe',val:5},txt:'+3, gegen die Möwen-Bande sogar +5. Für jede Seite spielbar.'}
];
const LEVELUPS_W4 = ['Den Strandkorb erobert'];
// Was aus dem Grunddeck mit an den Strand darf (Name -> Stückzahl); Schätze kommen alle mit
const STRAND_GRUND = {'Übellaunige Möwe':1,'Schleimige Socke':1,'Schwarm Stechmücken':2,'Rentner-Ritter':1,'Steuerprüfer-Gespenst':1,'Durchgedrehter Saugroboter':1,'Riesen-Nacktschnecke':1,'Falsche Schatztruhe':1,
  'Pechsträhne':1,'Windböe':1,'Rost':1,'Löcher in den Sohlen':1,'Identitätskrise':1,'Taschendieb-Gnom':1};
function strandCount(p){ if(p.tpl.w===4) return p.wdef; if(p.tpl.w) return 0; if(p.deck==='tr') return trCount(p,4); if(p.tpl.k==='monster'||p.tpl.k==='curse') return STRAND_GRUND[p.tpl.n]||0; return p.def; }
// Gezeiten: null ohne Strandkarten, sonst 'ebbe' in ungeraden und 'flut' in geraden Runden (Springflut: immer Flut)
function tideNow(){ if(!S || !S.tides) return null; return S.spring || S.turn%2===0 ? 'flut' : 'ebbe'; }
const isFlut = () => tideNow()==='flut';
const isEbbe = () => tideNow()==='ebbe';
const hasShade = p => p.eq.some(i=>i.shade && usable(p,i));
/* Welt 5 (Auf hoher See): nur im Meeres-Deck. pirat und tiefsee = Monster-Merkmale, Seegang = Ereignis für alle,
   Schatzkarte = zwei Hälften, zusammen 3 Schätze */
const MONSTERS_W5 = [
  {n:'Sardinen-Schwarm',lvl:1,tr:1,x:2,bad:{t:'hand',n:1},txt:'Kommt immer in Massen.',badTxt:'Wirf 1 zufällige Handkarte ab.'},
  {n:'Einsiedlerkrebs mit Mietrückstand',lvl:2,tr:1,bad:{t:'slot',s:'ruestung'},txt:'Sucht ein neues Zuhause.',badTxt:'Er zieht in deine Rüstung ein: Verliere sie.'},
  {n:'Kugelfisch mit Wutproblem',lvl:3,tr:1,puff:3,bad:{t:'lvl',n:1},txt:'Bläst sich auf: +3, wenn dir jemand hilft.',badTxt:'Verliere 1 Stufe.'},
  {n:'Tintenfisch-Taschendieb',lvl:4,tr:1,tiefsee:true,bad:{t:'cheap',n:2},txt:'Tiefsee. Acht Arme, acht Taschen.',badTxt:'Er klaut deine 2 billigsten Gegenstände.'},
  {n:'Zitteraal am Steuer',lvl:5,tr:1,vs:{race:'zwerg',val:2},bad:{t:'hand',n:2},txt:'Zwerge tragen zu viel Metall: +2 gegen Zwerge.',badTxt:'Wirf 2 zufällige Handkarten ab.'},
  {n:'Geisterpirat Gismo',lvl:6,tr:2,pirat:true,undead:true,bad:{t:'lvl',n:1},txt:'Pirat, untot. Spukt seit 300 Jahren an Deck.',badTxt:'Verliere 1 Stufe.'},
  {n:'Pirat mit zwei Holzbeinen',lvl:7,tr:2,pirat:true,run:2,bad:{t:'multi',l:[{t:'slot',s:'schuhe'},{t:'lvl',n:1}]},txt:'Pirat. So langsam, dass Weglaufen +2.',badTxt:'Verliere dein Schuhwerk und 1 Stufe.'},
  {n:'Seekranke Seeschlange',lvl:8,tr:2,tiefsee:true,vs:{race:'elf',val:3},bad:{t:'lvl',n:1},txt:'Tiefsee. Elfen werden auch seekrank: +3 gegen Elfen.',badTxt:'Verliere 1 Stufe.'},
  {n:'Muschel-Mimik',lvl:9,tr:2,bad:{t:'best'},txt:'Sieht aus wie eine Perlmuschel.',badTxt:'Verliere deinen besten Gegenstand.'},
  {n:'Wal mit Schluckauf',lvl:10,tr:3,run:-1,bad:{t:'hand',n:99},txt:'Verschluckt dich und spuckt dich wieder aus: Weglaufen −1.',badTxt:'Wirf deine ganze Hand ab.'},
  {n:'Schwertfisch-Fechtmeister',lvl:11,tr:3,vs:{cls:'zauberer',val:3},bad:{t:'lvl',n:2},txt:'Zauberer fuchteln zu langsam: +3 gegen Zauberer.',badTxt:'Verliere 2 Stufen.'},
  {n:'Riesenkrake Klara',lvl:13,tr:3,tiefsee:true,noHelp:true,np:3,bad:{t:'lvl',n:2},txt:'Tiefsee. Zu viele Arme: Niemand darf helfen. Verfolgt niemanden bis Stufe 3.',badTxt:'Verliere 2 Stufen.'},
  {n:'Käpt’n Achtarm',lvl:16,tr:4,up:2,pirat:true,tiefsee:true,np:4,bad:{t:'multi',l:[{t:'lvl',n:2},{t:'best'}]},txt:'Pirat, Tiefsee. Acht Arme, acht Säbel. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 4.',badTxt:'Verliere 2 Stufen und deinen besten Gegenstand.'},
  {n:'Inselschildkröte Ilse',lvl:17,tr:4,up:2,np:5,bad:{t:'death'},txt:'Man hält sie für eine Insel, bis sie abtaucht. Bringt 2 Stufen. Verfolgt niemanden bis Stufe 5.',badTxt:'Du bist tot.'}
].map(m=>Object.assign({w:5},m));
const CURSES_W5 = [
  {n:'Seegang',w:5,x:2,eff:{t:'seegang'},txt:'Das Schiff schaukelt: Alle geben 1 zufällige Handkarte an den Nachbarn weiter, in ungerader Runde nach links, in gerader nach rechts. Von der Hand jederzeit spielbar.'},
  {n:'Seekrank',w:5,x:2,eff:{t:'chill',n:2},txt:'Im nächsten Kampf −2.'},
  {n:'Über die Planke',w:5,eff:{t:'lvl',n:1},txt:'Verliere 1 Stufe.'}
];
const ITEMS_W5 = [
  {n:'Augenklappe',w:5,slot:'kopf',b:1,g:200,piratb:3,flv:'Piraten halten dich für einen von ihnen.'},
  {n:'Taucherhelm',w:5,slot:'kopf',b:1,g:400,tiefb:3,diver:true,flv:'In der Tiefsee kein Weglauf-Malus.'},
  {n:'Enterhaken',w:5,x:2,slot:'hand',hands:1,b:2,g:300,piratb:4},
  {n:'Piratensäbel',w:5,slot:'hand',hands:1,b:3,g:500},
  {n:'Holzbein',w:5,slot:'schuhe',b:2,g:200,run:-1,flv:'Stabil, aber nicht schnell.'},
  {n:'Rettungsweste',w:5,slot:'ruestung',b:2,g:300,run:1}
];
const ONESHOTS_W5 = [
  {n:'Rumfass',w:5,x:2,b:3,g:200,txt:'+3, für jede Seite.'},
  {n:'Kanonenkugel',w:5,x:2,b:2,g:300,pOnly:true,vs:{tag:'pirat',val:5},txt:'Gegen Piraten +5, sonst +2. Nur für die kämpfende Seite.'},
  {n:'Fischbrötchen',w:5,b:2,g:100,txt:'+2, für jede Seite.'},
  {n:'Kompass',w:5,escape:true,g:200,txt:'Beim Weglaufen statt zu würfeln: Du entkommst automatisch, vor allen Monstern des Kampfes.'},
  {n:'Schatzkarte (linke Hälfte)',w:5,b:0,g:100,map:'l',txt:'Zusammen mit der rechten Hälfte: in deinem Zug den Schatz ausgraben und 3 Schätze ziehen.'},
  {n:'Schatzkarte (rechte Hälfte)',w:5,b:0,g:100,map:'r',txt:'Zusammen mit der linken Hälfte: in deinem Zug den Schatz ausgraben und 3 Schätze ziehen.'}
];
const LEVELUPS_W5 = ['Seebeine bekommen','Land in Sicht!'];
const MEER_GRUND = {'Übellaunige Möwe':1,'Schleimige Socke':1,'Steuerprüfer-Gespenst':1,'Durchgedrehter Saugroboter':1,'Riesen-Nacktschnecke':1,'Falsche Schatztruhe':1,
  'Pechsträhne':1,'Windböe':1,'Rost':1,'Identitätskrise':1,'Taschendieb-Gnom':1};
function meerCount(p){ if(p.tpl.w===5) return p.wdef; if(p.tpl.w) return 0; if(p.deck==='tr') return trCount(p,5); if(p.tpl.k==='monster'||p.tpl.k==='curse') return MEER_GRUND[p.tpl.n]||0; return p.def; }
// Schatzkarte: beide Hälften auf der Hand
const mapSet = p => { const l=p.hand.find(c=>c.map==='l'), r=p.hand.find(c=>c.map==='r'); return l && r ? [l,r] : null; };
function canDig(p){ if(!mapSet(p)) return {ok:false, why:'Dafür brauchst du beide Hälften der Schatzkarte.'}; return {ok:true}; }
function doDig(p){
  const set=mapSet(p); if(!set) return;
  set.forEach(c=>{ take(p,c); discard(c); });
  const got=[]; for(let i=0;i<3;i++){ const t=drawTr(); if(t){ p.hand.push(t); got.push(t); } }
  if(p.human){ stat('dig'); track('dig'); }
  log(p.human ? `Du legst die Schatzkarte zusammen und gräbst den Schatz aus: ${got.map(c=>`<b>${cardLabel(c)}</b>`).join(', ')}.` : `${p.name} gräbt mit der Schatzkarte einen Schatz aus und zieht ${got.length} Schätze.`,'good');
  ruleOnce('dig','Schatzkarte: Beide Hälften zusammen ablegen bringt 3 Schätze.');
  fx('dig',{p}); render();
}
// Seegang: jeder gibt 1 zufällige Handkarte weiter, ungerade Runde nach links (zum nächsten Platz), gerade nach rechts
function seegang(){
  const ps=S.players.filter(q=>!q.dead), n=ps.length; if(n<2) return;
  const left=S.turn%2===1, give=ps.map(q=>q.hand.length && !hasCls(q,'pirat') ? q.hand[rnd(q.hand.length)] : null);
  ps.forEach((q,i)=>{ if(give[i]) take(q,give[i]); });
  ps.forEach((q,i)=>{ const to=ps[(i+(left?1:n-1))%n]; if(give[i]) to.hand.push(give[i]); });
  const mine=give[ps.indexOf(me())], got=give[(ps.indexOf(me())+(left?n-1:1))%n];
  log(`Seegang! Das Schiff kippt nach ${left?'links':'rechts'}: Alle geben eine zufällige Handkarte weiter.${me().human && (mine||got) ? ` Du gibst ${mine?`<b>${cardLabel(mine)}</b>`:'nichts'} ab und bekommst ${got?`<b>${cardLabel(got)}</b>`:'nichts'}.` : ''}`,'sys');
  const fest=ps.filter(q=>hasCls(q,'pirat')); if(fest.length) log(`Seefest: ${fest.map(q=>nm(q)).join(' und ')} ${fest.length>1?'geben':V(fest[0],'gibst','gibt')} als ${fest.length>1?'Piraten':'Pirat'} nichts ab.`,'sys');
  ruleOnce('seegang','Seegang: Alle geben 1 zufällige Handkarte an den Nachbarn weiter, in ungerader Runde nach links, in gerader nach rechts.');
  fx('seegang',{left}); render();
}
// Pilzpfanne: drei verschiedene Speisepilze (mit Sammelkorb zwei) gegen 1 Stufe, nie für die Siegstufe
function pfanneSet(p){
  const need=p.eq.some(i=>i.korb && usable(p,i)) ? 2 : 3, pick=[];
  SPEISE.forEach(n=>{ const c=p.hand.find(x=>x.n===n); if(c && pick.length<need) pick.push(c); });
  return pick.length>=need ? pick : null;
}
function canPfanne(p){
  if(!pfanneSet(p)){ const korb=p.eq.some(i=>i.korb && usable(p,i)); return {ok:false, why:`Für die Pilzpfanne brauchst du ${korb?'zwei':'drei'} verschiedene Speisepilze: Steinpilz, Pfifferling, Champignon.`}; }
  if(p.lvl>=WINLVL()-1) return {ok:false, why:`Stufe ${WINLVL()} gibt es nur für einen Monstersieg.`};
  return {ok:true};
}
function doPfanne(p){
  const set=pfanneSet(p); if(!set || p.lvl>=WINLVL()-1) return;
  set.forEach(c=>{ take(p,c); discard(c); }); p.lvl++;
  if(p.human){ stat('pfanne'); track('pfanne'); }
  log(`${nm(p)} ${V(p,'kochst','kocht')} eine Pilzpfanne aus ${set.map(c=>c.n).join(', ')} und ${V(p,'steigst','steigt')} auf Stufe ${p.lvl}.`,'good');
  ruleOnce('pfanne','Pilzpfanne: Steinpilz, Pfifferling und Champignon zusammen ablegen bringt 1 Stufe, mit Sammelkorb reichen zwei verschiedene. Nie für die Siegstufe.');
}
// Einmal-Karten: Wert für die kämpfende Seite (gegen Nager/Untote teils mehr) und für das Monster
const osP = (c, C) => !c.b ? 0 : (c.vs && C && C.mons.some(m => m.c[c.vs.tag])) ? c.vs.val : c.b;
const osM = c => c.pOnly ? 0 : (c.b || 0);
const RACES = {
  // Interne Schlüssel bleiben (halbling = Kobold), damit alte Spielstände und Kartenlisten passen.
  elf:{n:'Elf',txt:'Scharfe Augen: Durchsuchst du den Raum, ziehst du 2 Karten und behältst 1.'},
  zwerg:{n:'Zwerg',txt:'Beliebig viele Sperrige Gegenstände. Dein Rucksack fasst 5 statt 3.'},
  halbling:{n:'Kobold',txt:'Feilschen: Einmal pro Zug bringt dir ein Verkauf 200 Gold extra.'}
};
const CLASSES = {
  // Interne Schlüssel bleiben (dieb = Hehler, priester = Exorzist).
  krieger:{n:'Krieger',txt:'Allein stark: Kämpfst du ohne Helfer, hast du +3.'},
  zauberer:{n:'Zauberer',txt:'Gegenzauber: Einmal pro Kampf 2 Karten abwerfen und eine Laune oder einen Einmal-Gegenstand gegen dich aufheben. Misslingt ein Fluchtwurf: bis zu 3 Karten abwerfen, je +1.'},
  dieb:{n:'Hehler',txt:'Du darfst auch Flüche und Launen verkaufen, für je 200 Gold.'},
  priester:{n:'Exorzist',txt:'Gegen Untote +3. Untote verfolgen dich beim Weglaufen nie.'},
  pirat:{n:'Pirat',w:5,txt:'Plündern: Gewinnst du einen Kampf ohne Helfer, ziehst du 1 Schatz mehr. Seefest: Bei Seegang gibst du keine Karte ab.'}
};
const ENH = [
  {n:'Stinksauer',v:5,trm:1,x:2},
  {n:'Riesenhaft',v:10,trm:2},
  {n:'Winzig',v:-5,trm:-1,x:2}
];
const ITEMS = [
  {n:'Topfhelm mit Delle',slot:'kopf',b:1,g:200},
  {n:'Spitzhut mit Sternchen',slot:'kopf',b:3,g:400,req:{cls:'zauberer'}},
  {n:'Hörnerhelm',slot:'kopf',b:2,g:600},
  {n:'Lederschürze',slot:'ruestung',b:1,g:200},
  {n:'Kettenhemd aus Kronkorken',slot:'ruestung',b:2,g:400},
  {n:'Glitzer-Plattenrüstung',slot:'ruestung',b:3,g:600,big:true},
  {n:'Rutschige Schleimrüstung',slot:'ruestung',b:1,g:300,run:1},
  {n:'Schnelle Latschen',slot:'schuhe',b:0,g:400,run:2},
  {n:'Stahlkappenstiefel',slot:'schuhe',b:2,g:400},
  {n:'Rostiges Schwert',slot:'hand',hands:1,b:2,g:300},
  {n:'Gusseiserne Bratpfanne',slot:'hand',hands:1,b:1,g:200},
  {n:'Topfdeckel-Schild',slot:'hand',hands:1,b:2,g:400},
  {n:'Zauberstab der Ausreden',slot:'hand',hands:1,b:3,g:500,req:{cls:'zauberer'}},
  {n:'Elfendolch',slot:'hand',hands:1,b:3,g:400,req:{race:'elf'}},
  {n:'Gummihuhn mit Quietsch',slot:'hand',hands:1,b:1,g:100},
  {n:'Heiliges Nudelholz',slot:'hand',hands:1,b:3,g:400,req:{cls:'priester'}},
  {n:'Messer mit Korkenzieher',slot:'hand',hands:1,b:3,g:300,req:{cls:'dieb'}},
  {n:'Riesenhammer',slot:'hand',hands:2,b:4,g:600,big:true},
  {n:'Hellebarde mit Wimpel',slot:'hand',hands:2,b:3,g:500},
  {n:'Zwergenaxt',slot:'hand',hands:2,b:4,g:600,big:true,req:{race:'zwerg'}},
  {n:'Breitschwert der Angeberei',slot:'hand',hands:2,b:4,g:700,req:{cls:'krieger'}},
  {n:'Glücksumhang',slot:'none',b:1,g:300},
  {n:'Protzige Goldkette',slot:'none',b:1,g:600}
];
const ONESHOTS = [
  {n:'Trank der Tapferkeit',b:2,g:100,x:2},
  {n:'Flasche Drachenschnaps',b:3,g:200,x:2},
  {n:'Riesenböller',b:5,g:300},
  {n:'Stinkbombe',b:2,g:100},
  {n:'Nebelpulver',escape:true,g:200,x:2,txt:'Beim Weglaufen statt zu würfeln: Du entkommst automatisch, vor allen Monstern des Kampfes.'}
];
const LEVELUPS = ['Pizza für alle bestellt','Regelheft gelesen','Würfel angehaucht','Snacks mitgebracht'];

const TYPES = {
  monster:{l:'Monster',d:'Tür'}, curse:{l:'Fluch',d:'Tür'}, race:{l:'Volk',d:'Tür'}, class:{l:'Klasse',d:'Tür'},
  enh:{l:'Laune',s:'Laune',d:'Tür'}, wander:{l:'Sonderkarte',d:'Tür'},
  item:{l:'Gegenstand',d:'Schatz'}, oneshot:{l:'Einmal einsetzbar',s:'Einmal',d:'Schatz'}, levelup:{l:'Stufenkarte',s:'Stufe',d:'Schatz'}, amulet:{l:'Sonderkarte',d:'Schatz'}
};
// Kartenbilder: Kartenname -> Bilddatei im Ordner art/
const ART = {
  "Flasche Drachenschnaps":"art/einmal-flasche-drachenschnaps.webp",
  "Nebelpulver":"art/einmal-nebelpulver.webp",
  "Riesenböller":"art/einmal-riesenboeller.webp",
  "Stinkbombe":"art/einmal-stinkbombe.webp",
  "Trank der Tapferkeit":"art/einmal-trank-der-tapferkeit.webp",
  "Ahnenforschung":"art/fluch-ahnenforschung.webp",
  "Identitätskrise":"art/fluch-identitaetskrise.webp",
  "Löcher in den Sohlen":"art/fluch-loecher-in-den-sohlen.webp",
  "Pechsträhne":"art/fluch-pechstraehne.webp",
  "Rost":"art/fluch-rost.webp",
  "Taschendieb-Gnom":"art/fluch-taschendieb-gnom.webp",
  "Windböe":"art/fluch-windboee.webp",
  "Breitschwert der Angeberei":"art/gegenstand-breitschwert-der-angeberei.webp",
  "Elfendolch":"art/gegenstand-elfendolch.webp",
  "Glitzer-Plattenrüstung":"art/gegenstand-glitzer-plattenruestung.webp",
  "Glücksumhang":"art/gegenstand-gluecksumhang.webp",
  "Gummihuhn mit Quietsch":"art/gegenstand-gummihuhn-mit-quietsch.webp",
  "Gusseiserne Bratpfanne":"art/gegenstand-gusseiserne-bratpfanne.webp",
  "Heiliges Nudelholz":"art/gegenstand-heiliges-nudelholz.webp",
  "Hellebarde mit Wimpel":"art/gegenstand-hellebarde-mit-wimpel.webp",
  "Hörnerhelm":"art/gegenstand-hoernerhelm.webp",
  "Kettenhemd aus Kronkorken":"art/gegenstand-kettenhemd-aus-kronkorken.webp",
  "Lederschürze":"art/gegenstand-lederschuerze.webp",
  "Messer mit Korkenzieher":"art/gegenstand-messer-mit-korkenzieher.webp",
  "Protzige Goldkette":"art/gegenstand-protzige-goldkette.webp",
  "Riesenhammer":"art/gegenstand-riesenhammer.webp",
  "Rostiges Schwert":"art/gegenstand-rostiges-schwert.webp",
  "Rutschige Schleimrüstung":"art/gegenstand-rutschige-schleimruestung.webp",
  "Schnelle Latschen":"art/gegenstand-schnelle-latschen.webp",
  "Spitzhut mit Sternchen":"art/gegenstand-spitzhut-mit-sternchen.webp",
  "Stahlkappenstiefel":"art/gegenstand-stahlkappenstiefel.webp",
  "Topfdeckel-Schild":"art/gegenstand-topfdeckel-schild.webp",
  "Topfhelm mit Delle":"art/gegenstand-topfhelm-mit-delle.webp",
  "Zauberstab der Ausreden":"art/gegenstand-zauberstab-der-ausreden.webp",
  "Zwergenaxt":"art/gegenstand-zwergenaxt.webp",
  "Dieb":"art/klasse-dieb.webp", "Hehler":"art/klasse-dieb.webp",
  "Krieger":"art/klasse-krieger.webp",
  "Priester":"art/klasse-priester.webp", "Exorzist":"art/klasse-priester.webp",
  "Pirat":"art/klasse-pirat.webp",
  "Zauberer":"art/klasse-zauberer.webp",
  "Bürokratie-Golem":"art/monster-buerokratie-golem.webp",
  "Drache des Montagmorgens":"art/monster-drache-des-montagmorgens.webp",
  "Durchgedrehter Saugroboter":"art/monster-durchgedrehter-saugroboter.webp",
  "Falsche Schatztruhe":"art/monster-falsche-schatztruhe.webp",
  "Feuerspeiende Kaffeemaschine":"art/monster-feuerspeiende-kaffeemaschine.webp",
  "Hydra mit Migräne":"art/monster-hydra-mit-migraene.webp",
  "Kellerassel XXL":"art/monster-kellerassel-xxl.webp",
  "Lich mit Rückenschmerzen":"art/monster-lich-mit-rueckenschmerzen.webp",
  "Pilzkönig":"art/monster-pilzkoenig.webp",
  "Rentner-Ritter":"art/monster-rentner-ritter.webp",
  "Riesen-Nacktschnecke":"art/monster-riesen-nacktschnecke.webp",
  "Schleimige Socke":"art/monster-schleimige-socke.webp",
  "Schwarm Stechmücken":"art/monster-schwarm-stechmuecken.webp",
  "Steuerprüfer-Gespenst":"art/monster-steuerpruefer-gespenst.webp",
  "Troll unter der Autobahnbrücke":"art/monster-troll-unter-der-autobahnbruecke.webp",
  "Übellaunige Möwe":"art/monster-uebellaunige-moewe.webp",
  "Vampir-Kaninchen":"art/monster-vampir-kaninchen.webp",
  "Wütender Gartenzwerg":"art/monster-wuetender-gartenzwerg.webp",
  "Zombie-Hausmeister":"art/monster-zombie-hausmeister.webp",
  "Elf":"art/rasse-elf.webp",
  "Halbling":"art/rasse-halbling.webp", "Kobold":"art/rasse-kobold.webp",
  "Zwerg":"art/rasse-zwerg.webp",
  "Mensch":"art/rasse-mensch.webp",
  "Glücksamulett":"art/sonder-gluecksamulett.webp",
  "Ungebetener Gast":"art/sonder-ungebetener-gast.webp", "Hinterhalt":"art/sonder-ungebetener-gast.webp",
  "Pizza für alle bestellt":"art/stufe-pizza-fuer-alle-bestellt.webp",
  "Regelheft gelesen":"art/stufe-regelheft-gelesen.webp",
  "Snacks mitgebracht":"art/stufe-snacks-mitgebracht.webp",
  "Würfel angehaucht":"art/stufe-wuerfel-angehaucht.webp",
  "Riesenhaft":"art/verstaerker-riesenhaft.webp",
  "Stinksauer":"art/verstaerker-stinksauer.webp",
  "Winzig":"art/verstaerker-winzig.webp",
  "Staubmaus-Bande":"art/monster-staubmaus-bande.webp",
  "Spinne mit Strickzeug":"art/monster-spinne-mit-strickzeug.webp",
  "Kerzenwachs-Golem":"art/monster-kerzenwachs-golem.webp",
  "Korkgeist":"art/monster-korkgeist.webp",
  "Schimmel-Schleim":"art/monster-schimmel-schleim.webp",
  "Rollendes Riesenfass":"art/monster-rollendes-riesenfass.webp",
  "Pfandflaschen-Golem":"art/monster-pfandflaschen-golem.webp",
  "Ratten-Leibgarde":"art/monster-ratten-leibgarde.webp",
  "Rattenkönig Rüdiger":"art/monster-rattenkoenig-ruediger.webp",
  "Kanal-Krokodil Klaus":"art/monster-kanal-krokodil-klaus.webp",
  "Moorgeist mit Mundgeruch":"art/monster-moorgeist-mit-mundgeruch.webp",
  "Sandwurm mit Sonnenbrand":"art/monster-sandwurm-mit-sonnenbrand.webp",
  "Inselschildkröte Ilse":"art/monster-inselschildkroete-ilse.webp",
  "Kellerkälte":"art/fluch-kellerkaelte.webp",
  "Licht aus!":"art/fluch-licht-aus.webp",
  "Kellerlaterne":"art/gegenstand-kellerlaterne.webp",
  "Fassdeckel-Schild":"art/gegenstand-fassdeckel-schild.webp",
  "Kartoffelsack-Rüstung":"art/gegenstand-kartoffelsack-ruestung.webp",
  "Kronkorken-Krone":"art/gegenstand-kronkorken-krone.webp",
  "Mausefalle":"art/einmal-mausefalle.webp",
  "Knoblauchzopf":"art/einmal-knoblauchzopf.webp",
  "Bier aus dem Keller geholt":"art/stufe-bier-aus-dem-keller-geholt.webp",
  "Wandernder Bovist":"art/monster-wandernder-bovist.webp",
  "Eichhörnchen-Inkasso":"art/monster-eichhoernchen-inkasso.webp",
  "Pfifferling-Gang":"art/monster-pfifferling-gang.webp",
  "Hexenring":"art/monster-hexenring.webp",
  "Moos-Troll":"art/monster-moos-troll.webp",
  "Gestiefelter Fliegenpilz":"art/monster-gestiefelter-fliegenpilz.webp",
  "Bärlauch-Bär":"art/monster-baerlauch-baer.webp",
  "Myzel-Koloss":"art/monster-myzel-koloss.webp",
  "Pilzkönigin Morchella":"art/monster-pilzkoenigin-morchella.webp",
  "Sporenwolke":"art/fluch-sporenwolke.webp",
  "Ameisen in der Hose":"art/fluch-ameisen-in-der-hose.webp",
  "Pilzmesser":"art/gegenstand-pilzmesser.webp",
  "Sammelkorb":"art/gegenstand-sammelkorb.webp",
  "Fliegenpilzhut":"art/gegenstand-fliegenpilzhut.webp",
  "Moosmantel":"art/gegenstand-moosmantel.webp",
  "Steinpilz":"art/einmal-steinpilz.webp",
  "Pfifferling":"art/einmal-pfifferling.webp",
  "Champignon":"art/einmal-champignon.webp",
  "Fußpilzsalbe":"art/einmal-fusspilzsalbe.webp",
  "Aus dem Wald zurückgefunden":"art/stufe-aus-dem-wald-zurueckgefunden.webp",
  "Sandfloh-Schwarm":"art/monster-sandfloh-schwarm.webp",
  "Möwen-Bande":"art/monster-moewen-bande.webp",
  "Quallen-Gang":"art/monster-quallen-gang.webp",
  "Strandkorb-Mimik":"art/monster-strandkorb-mimik.webp",
  "Seeigel-Igel":"art/monster-seeigel-igel.webp",
  "Betrunkener Klabautermann":"art/monster-betrunkener-klabautermann.webp",
  "Bademeister-Golem":"art/monster-bademeister-golem.webp",
  "Hai mit Schwimmflügeln":"art/monster-hai-mit-schwimmfluegeln.webp",
  "Sandburg-Koloss":"art/monster-sandburg-koloss.webp",
  "Krabbenbaron Kneifer":"art/monster-krabbenbaron-kneifer.webp",
  "Sonnenbrand":"art/fluch-sonnenbrand.webp",
  "Sand in der Badehose":"art/fluch-sand-in-der-badehose.webp",
  "Schnorchel":"art/gegenstand-schnorchel.webp",
  "Sonnenschirm":"art/gegenstand-sonnenschirm.webp",
  "Flip-Flops":"art/gegenstand-flip-flops.webp",
  "Schwimmflügel":"art/gegenstand-schwimmfluegel.webp",
  "Sonnencreme LSF 50":"art/einmal-sonnencreme.webp",
  "Kokosnuss":"art/einmal-kokosnuss.webp",
  "Den Strandkorb erobert":"art/stufe-den-strandkorb-erobert.webp",
  "Sardinen-Schwarm":"art/monster-sardinen-schwarm.webp",
  "Einsiedlerkrebs mit Mietrückstand":"art/monster-einsiedlerkrebs.webp",
  "Kugelfisch mit Wutproblem":"art/monster-kugelfisch.webp",
  "Tintenfisch-Taschendieb":"art/monster-tintenfisch-taschendieb.webp",
  "Zitteraal am Steuer":"art/monster-zitteraal.webp",
  "Geisterpirat Gismo":"art/monster-geisterpirat-gismo.webp",
  "Pirat mit zwei Holzbeinen":"art/monster-pirat-holzbeine.webp",
  "Seekranke Seeschlange":"art/monster-seeschlange.webp",
  "Muschel-Mimik":"art/monster-muschel-mimik.webp",
  "Wal mit Schluckauf":"art/monster-wal-schluckauf.webp",
  "Schwertfisch-Fechtmeister":"art/monster-schwertfisch.webp",
  "Riesenkrake Klara":"art/monster-riesenkrake-klara.webp",
  "Käpt’n Achtarm":"art/monster-kaeptn-achtarm.webp",
  "Seegang":"art/fluch-seegang.webp",
  "Seekrank":"art/fluch-seekrank.webp",
  "Über die Planke":"art/fluch-ueber-die-planke.webp",
  "Augenklappe":"art/gegenstand-augenklappe.webp",
  "Taucherhelm":"art/gegenstand-taucherhelm.webp",
  "Enterhaken":"art/gegenstand-enterhaken.webp",
  "Piratensäbel":"art/gegenstand-piratensaebel.webp",
  "Holzbein":"art/gegenstand-holzbein.webp",
  "Rettungsweste":"art/gegenstand-rettungsweste.webp",
  "Rumfass":"art/einmal-rumfass.webp",
  "Kanonenkugel":"art/einmal-kanonenkugel.webp",
  "Fischbrötchen":"art/einmal-fischbroetchen.webp",
  "Kompass":"art/einmal-kompass.webp",
  "Schatzkarte (linke Hälfte)":"art/besonders-schatzkarte-links.webp",
  "Schatzkarte (rechte Hälfte)":"art/besonders-schatzkarte-rechts.webp",
  "Seebeine bekommen":"art/stufe-seebeine-bekommen.webp",
  "Land in Sicht!":"art/stufe-land-in-sicht.webp"
};
function artKey(c){ if(c.k==='item') return c.slot; return {monster:'monster',curse:'curse',race:'race',class:'cls',enh:'enh',wander:'wander',oneshot:'potion',levelup:'levelup',amulet:'none'}[c.k]; }

const TYPE_ORDER = ['race','class','item','oneshot','levelup','amulet','monster','enh','wander','curse'];
const SLOTN = {kopf:'Kopfbedeckung',ruestung:'Rüstung',schuhe:'Schuhwerk',hand:'Hand',none:'ohne Slot'};

/* ================= Hilfsfunktionen ================= */
const rnd = n => Math.floor(Math.random()*n);
const shuffle = a => { for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const sign = v => (v>0?'+':v<0?'−':'±') + Math.abs(v);
const fmt = n => n.toLocaleString('de-DE');
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pl = (n, one, many) => n===1 ? one : many;
let UID = 1;

const STALE = {stale:true};
let TOKEN = 0;
let S = null;
const UI = {tab:'spiel', prompt:null, resolve:null, reject:null, opts:[], sel:null, menu:null, menuActs:[], roll:null,
  speed:'normal', coach:true, advice:true, adv:null, open:false, bots:3, diff:'normal', seen:{}, logLen:0, quiz:{}};
const DIFF = {gemuetlich:0.5, normal:1, gnadenlos:1.6};
const diffF = () => DIFF[UI.diff]||1;
/* Ereignis-Hook für Effekte und Sounds, die Oberfläche setzt FX_HANDLER */
let FX_HANDLER = null;
function fx(type, data){ if(FX_HANDLER){ try{ FX_HANDLER(type, data||{}); }catch(e){ console.error(e); } } }
let CHECKPOINT_HANDLER = null;
// Zähler für die täglichen Aufträge (nur deine Aktionen; Rätsel und Probespiel zählen nicht)
let TRACK_HANDLER = null;
function track(k, n=1){ if(!TRACK_HANDLER || (SCN && (SCN.fight || SCN.tut))) return; try{ TRACK_HANDLER(k, n); }catch(e){} }
/* ================= Szenarien (Storymodus) =================
   SCN setzt die Oberfläche vor newGame; null = freies Spiel.
   {target, bots:[Namen], counts, start:{lvl, race, cls, eq:[], hand:[], deal}, boss:'Kartenname',
    fight:{mons:[], enh:[]}, perks:{freeHelp:'Name'}} */
let SCN = null;
// Siegstufe: Station im Storymodus, sonst die im freien Spiel gewählte Länge (2 bis 10), sonst 10
const WINLVL = () => (SCN && SCN.target) || (S && S.goal) || 10;
// Spielweisen der Gegner (gelten auch im freien Spiel)
// l = kurze Beschreibung für das Gegnerblatt
const STYLES = {
  Berta: {help:1.35, curse:0.6, intf:0.8, fair:true, l:'hilfsbereit, will aber fair beteiligt werden'},
  Kalle: {help:0.6, curse:1, intf:1.1, seek:0.35, l:'Schlitzohr, kämpft lieber allein'},
  Uschi: {help:0.9, curse:1.5, intf:1.3, spite:true, l:'giftig, verflucht gern'},
  // Welt 2: Kellerbewohner
  Rosi: {help:0, curse:1.8, intf:1, spite:true, noHelp:true, l:'verflucht jeden, der führt, und hilft nie'},
  Fridolin: {help:1.4, curse:0.5, intf:0.7, greedy:true, seek:0.5, l:'hilft nur für fast alle Schätze'},
  Gustav: {help:0.8, curse:0.9, intf:1.7, l:'mischt sich ständig ein'},
  // Welt 3: Waldbewohner
  Flora: {help:1.5, cheap:true, curse:0.6, intf:1.4, envy:true, l:'hilft gern und billig, mischt sich aber gegen jeden ein, der vor ihr liegt'},
  Trudi: {help:1, curse:0.8, intf:0.9, greedy:true, collect:true, cautious:true, seek:0.4, l:'sammelt Speisepilze für die Pilzpfanne und hilft nur gegen viele Schätze'},
  Walter: {help:0, curse:1.6, intf:1, grudge:true, noHelp:true, noWhy:'Pssst! Ich helfe niemandem. Ruhe im Wald!', l:'verflucht den, der zuletzt aufgestiegen ist, und hilft nie'},
  // Welt 4: Strandbewohner
  Bruno: {help:1.2, curse:1.1, intf:0.9, whistle:true, l:'hilft gern, verflucht aber jeden, der aus einem Kampf wegläuft'},
  Gesine: {help:1, curse:0.9, intf:1.6, greedy:true, l:'klaut gern: hilft nur gegen fast alle Schätze und mischt sich ständig ein'},
  Sunny: {help:1.4, cheap:true, curse:0.3, intf:0.5, lazy:true, l:'hilft billig und flucht kaum, sucht aber selten selbst Ärger'},
  // Welt 5: auf hoher See
  Walburga: {help:1.6, cheap:true, curse:0.4, intf:0.2, lazy:true, l:'hilft jedem gern und billig, ist aber langsam und mischt sich kaum ein'},
  Pepe: {help:1, curse:1.1, intf:1.1, mimic:true, l:'macht nach: verflucht, wen zuletzt ein Fluch traf, und hilft gern, wenn gerade jemand geholfen hat'},
  Sardella: {help:1, curse:0.9, intf:1.2, greedy:true, maps:true, l:'gierig: hilft nur gegen fast alle Schätze und sammelt Schatzkarten'}
};
// Spielweisen für zufällige Gegner im freien Spiel
const BOT_STYLES = [
  {help:1.35, curse:0.6, intf:0.8, fair:true, l:'hilfsbereit, will aber fair beteiligt werden'},
  {help:0.6, curse:1, intf:1.1, seek:0.35, l:'Schlitzohr, kämpft lieber allein'},
  {help:0.9, curse:1.5, intf:1.3, spite:true, l:'giftig, verflucht gern'},
  {help:1.2, curse:0.7, intf:0.8, greedy:true, l:'hilft nur für fast alle Schätze'},
  {help:0.8, curse:0.9, intf:1.7, l:'mischt sich ständig ein'},
  {l:'ausgeglichen'}
];
const styleOf = p => (p && (p.style || STYLES[p.name])) || {};
function stat(k, n=1){ if(S && S.stats) S.stats[k]=(S.stats[k]||0)+n; }
const SPEEDS = {langsam:2400, normal:1500, schnell:380};
// Manuell: Bots warten bei jedem Schritt, bis du auf „Weiter“ klickst (eigene Züge laufen im normalen Tempo)
const MANUAL = -1;
const spd = (f=1) => HEADLESS ? 0 : UI.speed==='manuell' ? (S && S.players[S.cur] && !S.players[S.cur].human ? MANUAL : SPEEDS.normal*f) : (SPEEDS[UI.speed]||SPEEDS.normal)*f;

function stepWait(t){ return new Promise((res,rej)=>{ UI.step=()=>{ UI.step=null; if(typeof showStep==='function') showStep(); if(t!==TOKEN) return rej(STALE); res(); }; if(typeof showStep==='function') showStep(); }); }
function sleep(ms){ const t=TOKEN; if(ms===MANUAL && !HEADLESS) return stepWait(t); if(ms<0) ms=0; return new Promise((res,rej)=>{ const done=()=>{ if(t!==TOKEN) return rej(STALE); if(UI.paused && !HEADLESS) return setTimeout(done,150); res(); }; setTimeout(done, HEADLESS?0:ms); }); }
function ask(get, ctx, data){
  const t=TOKEN;
  return new Promise((res,rej)=>{
    UI.prompt={get, ctx, data};
    UI.resolve = v => { UI.prompt=null; UI.resolve=null; UI.reject=null; t===TOKEN ? res(v) : rej(STALE); };
    UI.reject = () => rej(STALE);
    render();
  });
}
function selectCards(o){
  const t=TOKEN;
  return new Promise((res,rej)=>{
    UI.menu=null;
    UI.sel = Object.assign({}, o, {picked:new Set(o.pre||[]),
      done:v=>{ UI.sel=null; render(); t===TOKEN ? res(v) : rej(STALE); },
      reject:()=>rej(STALE)});
    render();
  });
}

const P = i => S.players[i];
const me = () => S.players[0];
const nm = p => p.human ? 'Du' : p.name;
const nmA = p => p.human ? 'dich' : p.name;
const nmD = p => p.human ? 'dir' : p.name;
const V = (p, du, er) => p.human ? du : er;
const hasRace = (p,r) => !!(p.race && p.race.r===r);
const hasCls = (p,c) => !!(p.cls && p.cls.c===c);
const handLimit = p => 5;
const packLimit = p => hasRace(p,'zwerg') ? 5 : 3;

function log(t, kind='ev'){ S.log.push({t,kind}); if(S.log.length>400) S.log.splice(0,50); render(); }
function rule(t){ log(t,'rule'); }
function ruleOnce(key,t){ if(UI.seen[key]) return; UI.seen[key]=true; rule(t); }

/* ================= Decks ================= */
function mk(def, deck){ return Object.assign({uid:UID++, deck}, def); }
// Kartenpool: jede Karte einmal als Vorlage, mit empfohlener Stückzahl
function cardPool(){
  const P=[], add=(tpl,deck,def)=>P.push({tpl,deck,def});
  MONSTERS.forEach(m=>add(Object.assign({k:'monster'},m),'door',m.x||1));
  CURSES.forEach(c=>add(Object.assign({k:'curse'},c),'door',c.x||1));
  Object.keys(RACES).forEach(r=>add({k:'race',r,n:RACES[r].n,txt:RACES[r].txt},'door',2));
  Object.keys(CLASSES).filter(c=>!CLASSES[c].w).forEach(c=>add({k:'class',c,n:CLASSES[c].n,txt:CLASSES[c].txt},'door',2));
  ENH.forEach(e=>add(Object.assign({k:'enh'},e),'door',e.x||1));
  add({k:'wander',n:'Hinterhalt',txt:'Spiele diese Karte mit einem Monster von deiner Hand in einen fremden Kampf. Das Monster kämpft mit.'},'door',2);
  ITEMS.forEach(i=>add(Object.assign({k:'item',hands:i.slot==='hand'?(i.hands||1):0},i),'tr',1));
  ONESHOTS.forEach(o=>add(Object.assign({k:'oneshot'},o),'tr',o.x||1));
  LEVELUPS.forEach(n=>add({k:'levelup',n,txt:'Steige 1 Stufe auf. Im eigenen Zug außerhalb von Kämpfen, nicht für Stufe 10.'},'tr',1));
  add({k:'amulet',n:'Glücksamulett',txt:'Spiele diese Karte, wenn dich ein Fluch trifft: Er wirkt nicht.'},'tr',2);
  // Weltkarten: im Grundspiel 0, ihre Stückzahl im Weltdeck steht in wdef
  const addW=(tpl,deck,n)=>P.push({tpl,deck,def:0,wdef:n});
  MONSTERS_W2.forEach(m=>addW(Object.assign({k:'monster'},m),'door',m.x||1));
  CURSES_W2.forEach(c=>addW(Object.assign({k:'curse'},c),'door',c.x||1));
  ITEMS_W2.forEach(i=>addW(Object.assign({k:'item',hands:i.slot==='hand'?(i.hands||1):0},i),'tr',i.x||1));
  ONESHOTS_W2.forEach(o=>addW(Object.assign({k:'oneshot'},o),'tr',o.x||1));
  LEVELUPS_W2.forEach(n=>addW({k:'levelup',n,w:2,txt:'Steige 1 Stufe auf. Im eigenen Zug außerhalb von Kämpfen, nicht für Stufe 10.'},'tr',1));
  MONSTERS_W3.forEach(m=>addW(Object.assign({k:'monster'},m),'door',m.x||1));
  CURSES_W3.forEach(c=>addW(Object.assign({k:'curse'},c),'door',c.x||1));
  ITEMS_W3.forEach(i=>addW(Object.assign({k:'item',hands:i.slot==='hand'?(i.hands||1):0},i),'tr',i.x||1));
  ONESHOTS_W3.forEach(o=>addW(Object.assign({k:'oneshot'},o),'tr',o.x||1));
  LEVELUPS_W3.forEach(n=>addW({k:'levelup',n,w:3,txt:'Steige 1 Stufe auf. Im eigenen Zug außerhalb von Kämpfen, nicht für Stufe 10.'},'tr',1));
  MONSTERS_W4.forEach(m=>addW(Object.assign({k:'monster'},m),'door',m.x||1));
  CURSES_W4.forEach(c=>addW(Object.assign({k:'curse'},c),'door',c.x||1));
  ITEMS_W4.forEach(i=>addW(Object.assign({k:'item',hands:i.slot==='hand'?(i.hands||1):0},i),'tr',i.x||1));
  ONESHOTS_W4.forEach(o=>addW(Object.assign({k:'oneshot'},o),'tr',o.x||1));
  LEVELUPS_W4.forEach(n=>addW({k:'levelup',n,w:4,txt:'Steige 1 Stufe auf. Im eigenen Zug außerhalb von Kämpfen, nicht für Stufe 10.'},'tr',1));
  MONSTERS_W5.forEach(m=>addW(Object.assign({k:'monster'},m),'door',m.x||1));
  addW({k:'class',c:'pirat',w:5,n:CLASSES.pirat.n,txt:CLASSES.pirat.txt},'door',2);
  CURSES_W5.forEach(c=>addW(Object.assign({k:'curse'},c),'door',c.x||1));
  ITEMS_W5.forEach(i=>addW(Object.assign({k:'item',hands:i.slot==='hand'?(i.hands||1):0},i),'tr',i.x||1));
  ONESHOTS_W5.forEach(o=>addW(Object.assign({k:'oneshot'},o),'tr',o.x||1));
  LEVELUPS_W5.forEach(n=>addW({k:'levelup',n,w:5,txt:'Steige 1 Stufe auf. Im eigenen Zug außerhalb von Kämpfen, nicht für Stufe 10.'},'tr',1));
  return P;
}
// Stückzahlen pro Kartenname; null = Empfehlung. Wird von der Oberfläche vor einem neuen Spiel gesetzt.
let DECK_COUNTS=null;
function buildDecks(counts){
  counts = counts || DECK_COUNTS;
  const door=[], tr=[];
  cardPool().forEach(({tpl,deck,def})=>{
    const old=Object.keys(OLD_NAMES).find(k=>OLD_NAMES[k]===tpl.n);
    const n = counts && counts[tpl.n]!=null ? counts[tpl.n] : counts && old && counts[old]!=null ? counts[old] : def;
    for(let i=0;i<n;i++) (deck==='door'?door:tr).push(mk(Object.assign({},tpl),deck));
  });
  return {door:shuffle(door), tr:shuffle(tr)};
}
function drawDoor(){
  if(!S.door.length){ if(!S.doorDisc.length) return null; S.door=shuffle(S.doorDisc); S.doorDisc=[]; log('Der Türstapel ist leer. Die Ablage wird neu gemischt.','sys'); }
  return S.door.pop();
}
/* Glück im Storymodus (SCN.luck, 0 bis 1): In frühen Stationen und nach Niederlagen zieht der Spieler
   beim Türaufstoßen öfter etwas Gutes und bekommt bessere Schätze, die Bots öfter etwas Unangenehmes.
   Die Karten kommen nur aus den obersten des Stapels, ein Boss bleibt immer, wo er liegt. */
const LUCK = () => (SCN && SCN.luck) || 0;
function luckyDoor(p){
  const L=LUCK(); if(!L || !p || S.door.length<2) return drawDoor();
  if(Math.random() >= (p.human ? L : L*0.6)) return drawDoor();
  const pw=power(p), n=Math.min(6,S.door.length);
  const score=c=>{ if(c.boss) return null;
    if(c.k==='monster') return c.lvl<pw ? 10+(c.tr||1) : c.lvl===pw ? 3 : 1;
    return c.k==='curse' ? 0 : 5; };
  let bi=-1, bv=0;
  for(let i=S.door.length-n;i<S.door.length;i++){ const sc=score(S.door[i]); if(sc==null) continue; const v=p.human ? sc : -sc; if(bi<0 || v>bv){ bi=i; bv=v; } }
  return bi<0 ? drawDoor() : S.door.splice(bi,1)[0];
}
function luckyTr(){
  const L=LUCK(); if(!L || S.tr.length<2 || Math.random()>=L) return drawTr();
  const n=Math.min(4,S.tr.length); let bi=S.tr.length-1, bv=-1;
  for(let i=S.tr.length-n;i<S.tr.length;i++){ const c=S.tr[i], v=c.k==='levelup' ? 9 : (c.b||0)*2+(c.k==='oneshot'?3:0)+(c.g||0)/200; if(v>bv){ bv=v; bi=i; } }
  return S.tr.splice(bi,1)[0];
}
function drawTr(){
  if(!S.tr.length){ if(!S.trDisc.length) return null; S.tr=shuffle(S.trDisc); S.trDisc=[]; log('Der Schatzstapel ist leer. Die Ablage wird neu gemischt.','sys'); }
  return S.tr.pop();
}
function discard(c){ if(!c) return; (c.deck==='door' ? S.doorDisc : S.trDisc).push(c); }
function take(p,c){ const u=c.uid; p.hand=p.hand.filter(x=>x.uid!==u); p.eq=p.eq.filter(x=>x.uid!==u); p.pack=p.pack.filter(x=>x.uid!==u); }

/* ================= Werte ================= */
function usable(p,it){
  if(it.req){ if(it.req.cls && !hasCls(p,it.req.cls)) return false; if(it.req.race && !hasRace(p,it.req.race)) return false; }
  return true;
}
function reqName(it){ if(!it.req) return ''; return it.req.cls ? CLASSES[it.req.cls].n : RACES[it.req.race].n; }
function itemBonus(p){ return p.eq.filter(i=>usable(p,i)).reduce((s,i)=>s+(i.b||0),0); }
function power(p){ return p.lvl + itemBonus(p); }
function runBonus(p){ let b=0; const fl=isFlut(); p.eq.forEach(i=>{ if(i.run && usable(p,i)) b+=i.run; if(fl && i.flutRun && usable(p,i)) b+=i.flutRun; }); if(fl) b+=1; if(p.sand) b-=2; return b; }
function handsUsed(p){ return p.eq.filter(i=>i.slot==='hand').reduce((s,i)=>s+(i.hands||1),0); }
function canEquip(p,c){
  if(c.k!=='item') return {ok:false, why:'Das ist kein Gegenstand.'};
  if(!usable(p,c)) return {ok:false, why:`Nur für ${reqName(c)}. Spiele zuerst die passende Karte aus.`};
  if(c.big && !hasRace(p,'zwerg')){
    const other=[...p.eq,...p.pack].find(i=>i.big && i.uid!==c.uid);
    if(other) return {ok:false, why:`Du trägst schon einen Sperrigen Gegenstand (${other.n}). Nur Zwerge dürfen mehrere haben. Verkaufe ihn zuerst.`};
  }
  return {ok:true};
}
// Gegenstände von der Hand in den Rucksack: zählen dann nicht mehr als Handkarten, bringen aber keinen Bonus.
// Grenzen: Sperrige Gegenstände (einer, außer Zwerge) und die Rucksack-Größe.
function canStash(p,c){
  if(c.k!=='item') return {ok:false, why:'Nur Gegenstände kommen in den Rucksack.'};
  if(c.big && !hasRace(p,'zwerg')){
    const other=[...p.eq,...p.pack].find(i=>i.big && i.uid!==c.uid);
    if(other) return {ok:false, why:`Du hast schon einen Sperrigen Gegenstand (${other.n}). Nur Zwerge dürfen mehrere haben.`};
  }
  if(p.pack.length>=packLimit(p)) return {ok:false, why:`Dein Rucksack ist voll: höchstens ${packLimit(p)} Gegenstände.`};
  return {ok:true};
}
function stash(p,c){ take(p,c); p.pack.push(c); }
function stashItem(c){
  const p=me(), cs=canStash(p,c); if(!cs.ok){ log(cs.why,'sys'); return; }
  stash(p,c); log(`${c.n} kommt in den Rucksack.`);
  ruleOnce('stash','Gegenstände im Rucksack zählen nicht zu deinen Handkarten, bringen aber keinen Bonus. Anlegen kannst du sie in deinem Zug außerhalb von Kämpfen.');
}
const stashable = p => p.hand.filter(c=>c.k==='item' && canStash(p,c).ok);
function equip(p,c){
  take(p,c); const moved=[];
  // Abgelegtes kommt in den Rucksack; ist der voll, auf die Hand.
  const away=o=>{ if(p.pack.length<packLimit(p)) p.pack.push(o); else p.hand.push(o); moved.push(o); };
  if(['kopf','ruestung','schuhe'].includes(c.slot)){
    const old=p.eq.find(i=>i.slot===c.slot);
    if(old){ p.eq=p.eq.filter(i=>i!==old); away(old); }
  }
  if(c.slot==='hand'){
    let used=handsUsed(p);
    while(used + c.hands > 2){
      const o=p.eq.filter(i=>i.slot==='hand').sort((a,b)=>a.b-b.b)[0];
      p.eq=p.eq.filter(i=>i!==o); away(o); used-=o.hands;
    }
  }
  p.eq.push(c);
  return moved;
}
function gainOf(p,it){
  if(!canEquip(p,it).ok) return -1;
  const q=Object.assign({},p,{eq:[...p.eq],pack:[...p.pack],hand:[...p.hand]});
  const before=itemBonus(q)+runBonus(q)*0.5;
  equip(q,it);
  return itemBonus(q)+runBonus(q)*0.5-before;
}
// Goldwert einer Karte: Gegenstände nach Aufdruck, Hehler verkaufen auch Flüche und Launen.
function goldOf(p,c){ if(c.g>0 && (c.k==='item'||c.k==='oneshot')) return c.g; if(p && hasCls(p,'dieb') && (c.k==='curse'||c.k==='enh')) return 200; return 0; }
const sellable = (p,c) => goldOf(p,c)>0;
// Goldbeutel: Was nicht für eine Stufe reicht, bleibt im Beutel (p.gold).
function sellValue(p,cards){
  const raw=cards.reduce((s,c)=>s+goldOf(p,c),0);
  const bonus=(hasRace(p,'halbling') && !p.soldDouble && cards.length) ? 200 : 0;
  const purse=p.gold||0, sum=raw+bonus+purse;
  return {raw, bonus, purse, sum, dbl:bonus>0, lv:Math.floor(sum/1000)};
}
// Verkauf ausführen: Stufen gutschreiben, Rest in den Beutel. Gibt die gewonnenen Stufen zurück.
function doSell(p,cards){
  const v=sellValue(p,cards), lv=Math.max(0,Math.min(v.lv,WINLVL()-1-p.lvl));
  cards.forEach(c=>{ take(p,c); discard(c); });
  p.lvl+=lv; p.gold=v.sum-lv*1000; if(v.bonus) p.soldDouble=true;
  return {v, lv};
}
function keepValue(p,c){
  switch(c.k){
    case 'levelup': return 9;
    case 'amulet': return 7;
    case 'oneshot': return 5+(c.b||3);
    case 'curse': return 4;
    case 'enh': return 4;
    case 'wander': return 3;
    case 'monster': return 2;
    case 'race': return p.race?1:6;
    case 'class': return p.cls?1:6;
    case 'item': return 1+(c.g||0)/250+(gainOf(p,c)>0?4:0);
  }
  return 1;
}
function rcText(p){ return `${p.race?p.race.n:'Mensch'} · ${p.cls?p.cls.n:'keine Klasse'}`; }

/* ================= Kampf-Rechnung ================= */
function vsBonus(mc,C){
  if(!mc.vs) return 0;
  const ps=[P(C.f)]; if(C.h!=null) ps.push(P(C.h));
  return ps.some(p=>(mc.vs.race && hasRace(p,mc.vs.race)) || (mc.vs.cls && hasCls(p,mc.vs.cls))) ? mc.vs.val : 0;
}
function sideStrength(C){
  const f=P(C.f); let s=power(f);
  const parts=[{l:`${f.human?'Deine':f.name+'s'} Stufe`,v:f.lvl,keep:true},{l:`${f.human?'Deine':f.name+'s'} Gegenstände`,v:itemBonus(f)}];
  if(C.h!=null){ const h=P(C.h); s+=power(h); parts.push({l:`Helfer: ${h.human?'du':h.name} (Stufe ${h.lvl} + Gegenst.)`,v:power(h)}); }
  const sides=[f, C.h!=null?P(C.h):null];
  [['und','undead','gegen Untote'],['pilzb','pilz','gegen Pilze'],['meerb','meer','gegen Meeresmonster'],['piratb','pirat','gegen Piraten'],['tiefb','tiefsee','gegen Tiefseemonster']].forEach(([k,tag,l])=>{ if(C.mons.some(m=>m.c[tag])) sides.forEach(q=>q && q.eq.forEach(i=>{ if(i[k] && usable(q,i)){ const v=i[k]-(i.b||0); s+=v; parts.push({l:`${i.n} ${l}`,v}); } })); });
  sides.forEach(q=>{ if(q && q.spore){ s-=q.spore; parts.push({l:`Sporenwolke (${q.human?'du':q.name})`,v:-q.spore}); } });
  sides.forEach(q=>{ if(q && q.sun){ s-=1; parts.push({l:`Sonnenbrand (${q.human?'du':q.name})`,v:-1}); } });
  if(hasCls(f,'krieger') && C.h==null){ s+=3; parts.push({l:'Krieger: allein stark',v:3}); }
  if(C.mons.some(m=>m.c.undead)) sides.forEach(q=>{ if(q && hasCls(q,'priester')){ s+=3; parts.push({l:`Exorzist gegen Untote (${q.human?'du':q.name})`,v:3}); } });
  C.pB.forEach(b=>{ s+=b.v; parts.push(b); });
  return {s, parts};
}
function monStrength(C){
  let s=0; const parts=[];
  C.mons.forEach(m=>{
    let v=m.c.lvl; parts.push({l:m.c.n,v:m.c.lvl,keep:true});
    m.enh.forEach(e=>{ v+=e.v; parts.push({l:`„${e.n}“`,v:e.v}); });
    const vs=vsBonus(m.c,C); if(vs){ v+=vs; parts.push({l:`Bonus gegen ${m.c.vs.race ? {elf:'Elfen',zwerg:'Zwerge',halbling:'Kobolde'}[m.c.vs.race] : CLASSES[m.c.vs.cls].n}`,v:vs}); }
    if(isFlut() && m.c.meer){ v+=3; parts.push({l:'Flut (Meer)',v:3}); }
    if(m.c.puff && C.h!=null){ v+=m.c.puff; parts.push({l:'Bläst sich auf (Helfer da)',v:m.c.puff}); }
    if(isFlut() && m.c.soft){ v-=m.c.soft; parts.push({l:'Flut weicht ihn auf',v:-m.c.soft}); }
    s+=v;
  });
  C.mB.forEach(b=>{ s+=b.v; parts.push(b); });
  return {s, parts};
}
function evalCombat(C){
  const a=sideStrength(C).s, b=monStrength(C).s, tieWin=false;   // Gleichstand verliert immer
  return {a, b, tieWin, win: a>b || (a===b && tieWin)};
}
const levelsGained = C => C.mons.reduce((s,m)=>s+(m.c.up||1),0);
const treasuresOf = C => C.mons.reduce((s,m)=>s+Math.max(0, m.c.tr + m.enh.reduce((t,e)=>t+(e.trm||0),0)),0);
const monNames = C => C.mons.map(m=>m.c.n).join(' und ');
function wouldWinWith(C,p){ const h=C.h; C.h=p.id; const r=evalCombat(C); C.h=h; return r.win; }
function strongestMon(C){ return C.mons.slice().sort((a,b)=>b.c.lvl-a.c.lvl)[0]; }
// Gegenzauber (Zauberer): Launen und Einmal-Gegenstände, die andere gegen die kämpfende Seite gespielt haben
function counterTargets(C){
  const t=[], foe=by=>by!=null && by!==C.f && by!==C.h;
  C.mB.forEach(b=>{ if(foe(b.by) && b.v>0) t.push({l:b.l, v:b.v, kind:'mb', ref:b}); });
  C.mons.forEach(m=>m.enh.forEach(e=>{ if(C.played && foe(C.played[e.uid]) && e.v>0) t.push({l:`„${e.n}“ auf ${m.c.n}`, v:e.v, kind:'enh', m, e}); }));
  return t;
}
function applyCounter(C,t){
  if(t.kind==='mb') C.mB.splice(C.mB.indexOf(t.ref),1);
  else { t.m.enh.splice(t.m.enh.indexOf(t.e),1); discard(t.e); }
  C.counter=true; markIntf();
}
// Beute mit Helfer: abwechselnd wählen, der Helfer zuerst, bis er seine Zahl hat. Der Rest gehört dem Kämpfer.
// Wer keine echte Wahl hat (nur noch eine Karte, oder der Helfer bekommt ohnehin alle übrigen), wählt nicht.
async function draftLoot(f,h,cards,deal){
  const pool=cards.slice(), fGot=[], hGot=[]; let hTurn=true;
  while(pool.length){
    const needH=deal-hGot.length;
    if(needH<=0){ fGot.push(...pool.splice(0)); break; }
    if(needH>=pool.length){ hGot.push(...pool.splice(0)); break; }
    const who=hTurn ? h : f;
    let pick;
    if(who.human){
      const v=await ask(()=>({title:'Beute wählen', text: who===h ? `Du hast geholfen und wählst zuerst. Noch ${needH} ${pl(needH,'Schatz','Schätze')} für dich.` : `Du bist dran. ${h.name} bekommt noch ${needH} ${pl(needH,'Schatz','Schätze')}, der Rest gehört dir.`,
        hint:['Der Helfer wählt zuerst, dann abwechselnd, bis er die abgemachte Zahl hat. Der Rest gehört dem Kämpfer.'], opts:pool.map((c,i)=>({l:c.n,v:i,kind:'primary'}))}), 'loot', {pool, f, h, fGot, hGot, needH});
      pick=pool[v];
    } else pick=pool.slice().sort((a,b)=>keepValue(who,b)-keepValue(who,a))[0];
    pool.splice(pool.indexOf(pick),1); (who===f?fGot:hGot).push(pick);
    if(!who.human) log(`${who.name} wählt ${pick.n}.`);
    hTurn = who===f;
  }
  return {fGot,hGot};
}

/* ================= Spielstart ================= */
function newPlayer(id,name,human){ return {id,name,human,lvl:1,race:null,cls:null,eq:[],pack:[],hand:[],dead:false,soldDouble:false,gold:0}; }
function newGame(allBots){
  TOKEN++;
  if(UI.reject){ const r=UI.reject; UI.prompt=null; UI.resolve=null; UI.reject=null; try{ r(); }catch(e){} }
  if(UI.sel){ const r=UI.sel.reject; UI.sel=null; try{ r(); }catch(e){} }
  UI.menu=null; UI.roll=null; UI.seen={}; UI.logLen=0; UI.dview=null; UI.step=null; if(typeof showStep==='function') showStep();
  UID=1;
  const sc=SCN;
  const d=buildDecks(sc && sc.counts);
  S={players:[], door:d.door, tr:d.tr, doorDisc:[], trDisc:[], cur:0, turn:1, phase:0, combat:null, reveal:null, log:[], winner:null,
     scn: sc ? sc.id||true : null, stats:{played:0, lvlLost:0, curses:0, help:0, ran:0, bossBy:null, bossHelped:false, fightWon:false}};
  if(!sc && !allBots && UI.goal && UI.goal !== 10) S.goal = UI.goal;   // kürzere Partie im freien Spiel
  // Starthand wird immer gedraftet, außer die Station legt Karten fest (Probespiel, Rätsel, feste Starthände)
  if(!sc || !(sc.start || sc.botStart || sc.deck || sc.tut || sc.fight)) S.draft = true;
  // Freies Spiel: zufällige Gegner aus UI.roster (Name, Bild, Spielweise), sonst der Stammtisch
  const roster = !sc && UI.roster && UI.roster.length >= UI.bots ? UI.roster.slice(0, UI.bots) : null;
  const names = sc && sc.bots ? sc.bots : roster ? roster.map(r=>r.name) : ['Berta','Kalle','Uschi'].slice(0, UI.bots);
  S.players.push(newPlayer(0,'Du',!allBots));
  if(allBots) S.players[0].name='Testbot';
  names.forEach((n,i)=>{ const p=newPlayer(i+1,n,false); if(roster){ p.face=roster[i].face; p.style=roster[i].style; } S.players.push(p); });
  if(sc && sc.boss) placeBoss(sc.boss, sc.bossLvl);
  S.tides = !!(sc && sc.tides) || [...S.door,...S.tr].some(c=>c.w===4); S.spring = !!(sc && sc.spring);
  if(S.tides) log(S.spring ? 'Springflut: In dieser Partie ist jede Runde Flut. Meeresmonster +3, Weglaufen +1.' : 'Am Strand wechseln Ebbe und Flut mit jeder Runde. Runde 1 ist Ebbe.','sys');
  S.players.forEach(p=>{
    if(p.id===0 && sc && sc.start) applyStart(p, sc.start);
    else if(!p.human && sc && sc.botStart && sc.botStart[p.name]) applyStart(p, sc.botStart[p.name]);
    else if(!S.draft) for(let i=0;i<4;i++){ p.hand.push(drawDoor()); p.hand.push(drawTr()); }
    if(!p.human && sc && sc.botStyles && sc.botStyles[p.name]) p.style=sc.botStyles[p.name];
  });
  // Probespiel: diese Karten liegen in genau der Reihenfolge oben auf den Stapeln (erste zuerst gezogen)
  if(sc && sc.deck) ['door','tr'].forEach(k=>{ const list=(sc.deck[k]||[]).map(pullCard); for(let i=list.length-1;i>=0;i--) S[k].push(list[i]); });
  buildCatalog(allCards());
  if(!S.draft) S.players.filter(p=>!p.human).forEach(botSetup);
  if(sc && sc.fight) log('Rätselkampf: Gewinne diesen einen Kampf mit dem, was du hast.','sys');
  else if(sc && sc.tut) log('Probespiel mit Hilde: Wer zuerst Stufe '+WINLVL()+' erreicht, gewinnt.','sys');
  else if(sc) log(`Neue Partie. Wer zuerst Stufe ${WINLVL()} erreicht, gewinnt.${sc.boss?` Irgendwo im Türstapel lauert ${sc.boss}: Wer ihn besiegt, gewinnt sofort.`:''} Du beginnst.`,'sys');
  else if(S.draft) log(`Neue Partie mit Draft. Wer zuerst Stufe ${WINLVL()} erreicht, gewinnt. Alle starten auf Stufe 1 als Mensch ohne Klasse. Zuerst wählt jeder seine Starthand: 4 Türkarten, dann 4 Schatzkarten.`,'sys');
  else log(`Neue Partie. Wer zuerst Stufe ${WINLVL()} erreicht, gewinnt. Alle starten auf Stufe 1 als Mensch ohne Klasse und mit 4 Tür- und 4 Schatzkarten. Du beginnst.`,'sys');
  if(sc && sc.stars && sc.stars.length) log(`Sterne in dieser Station: ${sc.stars.map(t=>'★ '+t).join(' · ')}`,'sys');
  rule('Tippe deine Handkarten an, um sie auszuspielen. Volk, Klasse und Gegenstände darfst du gleich jetzt auslegen.');
  fx('newgame');
  const t=TOKEN;
  return (sc && sc.fight ? puzzleLoop(t) : S.draft ? draftStart(t).then(()=>gameLoop(t)) : gameLoop(t)).catch(e=>{ if(e!==STALE){ console.error(e); if(!HEADLESS) log('Hoppla, ein Programmfehler: '+e.message,'sys'); else throw e; } });
}
function allCards(){ const a=[...S.door,...S.tr,...S.doorDisc,...S.trDisc]; S.players.forEach(p=>a.push(...p.hand,...p.eq,...p.pack,...[p.race,p.cls].filter(Boolean))); return a; }
// Karte für ein Szenario holen: aus den Stapeln nehmen, sonst neu anlegen
// Alte Kartennamen (Spielstände, gespeicherte Stückzahlen, Szenarien)
const OLD_NAMES={'Halbling':'Kobold','Dieb':'Hehler','Priester':'Exorzist','Ungebetener Gast':'Hinterhalt'};
const canonName = n => OLD_NAMES[n]||n;
function pullCard(name){
  name=canonName(name);
  for(const st of [S.door,S.tr]){ const i=st.findIndex(c=>c.n===name); if(i>=0) return st.splice(i,1)[0]; }
  const t=cardPool().find(x=>x.tpl.n===name);
  if(!t) throw new Error('Unbekannte Karte im Szenario: '+name);
  return mk(Object.assign({},t.tpl),t.deck);
}
function applyStart(p,st){
  p.lvl=st.lvl||1;
  if(st.race){ p.race=pullCard(st.race); }
  if(st.cls){ p.cls=pullCard(st.cls); }
  (st.eq||[]).forEach(n=>p.eq.push(pullCard(n)));
  (st.hand||[]).forEach(n=>p.hand.push(pullCard(n)));
  if(st.deal!==false){ for(let i=0;i<4;i++){ p.hand.push(drawDoor()); p.hand.push(drawTr()); } }
}
// Bossmonster in die untere Hälfte des Türstapels mischen (gezogen wird von oben = Ende)
function placeBoss(name, lvl){
  const t=cardPool().find(x=>x.tpl.n===name); if(!t) throw new Error('Unbekannter Boss: '+name);
  S.door=S.door.filter(c=>c.n!==name);
  const b=mk(Object.assign({},t.tpl,{boss:true},lvl?{lvl}:{}),'door');
  S.door.splice(rnd(Math.max(1,Math.floor(S.door.length/2))),0,b);
}
// Rätselkampf: ein einzelner Kampf, danach ist Schluss
async function puzzleLoop(t){
  const f=SCN.fight, p=me();
  S.cur=0; S.phase=2;
  log('Rätselkampf','turn');
  fx('turn',{p});
  const mons=f.mons.map(pullCard);
  await combat(0, mons, (f.enh||[]).map(pullCard));
  if(t!==TOKEN) return;
  if(S.winner==null) S.winner = S.stats.fightWon ? 0 : -1;
  fx('gameover',{winner:S.winner});
  render();
}
/* ================= Draft: Starthand reihum wählen ================= */
// Jeder bekommt 4 Karten, nimmt eine und gibt den Rest weiter. Türkarten im Uhrzeigersinn (an den Nächsten),
// danach Schatzkarten gegen den Uhrzeigersinn. Die letzte Karte eines Päckchens wird nicht gewählt, sie kommt einfach.
function draftValue(p,c){
  if(c.k==='race') return p.hand.some(x=>x.k==='race') ? 1 : 6;
  if(c.k==='class') return p.hand.some(x=>x.k==='class') ? 1 : 6;
  return keepValue(p,c);
}
async function draftStart(t){
  const N=S.players.length;
  for(const [k,dir,lbl] of [['door',1,'Türkarten'],['tr',-1,'Schatzkarten']]){
    let packs=S.players.map(()=>{ const a=[]; for(let i=0;i<4;i++){ const c=k==='door'?drawDoor():drawTr(); if(c) a.push(c); } return a; });
    const to=i=>P((i+dir+N)%N);
    log(`Draft: ${lbl}. Nimm eine Karte, den Rest bekommt ${to(0).name}.`,'sys');
    for(let pick=1; packs.some(a=>a.length); pick++){
      for(let i=0;i<N;i++){
        const p=P(i), pool=packs[i]; if(!pool.length) continue;
        let c;
        if(p.human){
          // Das Päckchen fliegt verdeckt von der Seite ein, aus der es kommt, und dreht sich um.
          // Nach der Wahl dreht sich der Rest wieder um und fliegt zum Nächsten, die gewählte Karte geht auf die Hand.
          const view={pool, draft:true, kind:lbl, deck:k, pick, to:to(i), side: pick===1 ? 'top' : dir>0 ? 'right' : 'left', exit: dir>0 ? 'left' : 'right', phase:'in'};
          UI.dview=view; render(); await sleep(UI.reduce ? 0 : 950);
          if(pool.length===1) c=pool[0];
          else {
            view.phase='pick';
            const v=await ask(()=>({title:'Draft', text:`${lbl}: Nimm eine Karte. Die übrigen ${pool.length-1} gehen an ${to(i).name}.`,
              hint:['Beim Draft wählt jeder aus seinem Päckchen eine Karte und gibt den Rest weiter. Türkarten wandern im Uhrzeigersinn, Schatzkarten in die andere Richtung.'],
              opts:pool.map((c,j)=>({l:c.n,v:j,kind:'primary'}))}), 'loot', view);
            c=pool[v];
          }
          view.phase='out'; view.picked=c.uid; render(); await sleep(UI.reduce ? 0 : 820);
        }
        else if(pool.length===1) c=pool[0];
        else c=pool.slice().sort((a,b)=>draftValue(p,b)-draftValue(p,a))[0];
        pool.splice(pool.indexOf(c),1); p.hand.push(c);
      }
      if(t!==TOKEN) throw STALE;
      packs=packs.map((_,i)=>packs[(i-dir+N)%N]);
      if(packs.some(a=>a.length)) await sleep(HEADLESS?0:220);
    }
  }
  UI.dview=null;
  log('Draft fertig. Jeder hat seine Starthand. Los geht’s!','sys');
  S.players.filter(p=>!p.human).forEach(botSetup);
  render();
}

async function gameLoop(t){
  while(S.winner==null && t===TOKEN){
    const p=P(S.cur);
    S.phase=0; S.combat=null;
    const snap=S.players.map(q=>q.lvl);
    if(p.human) await humanTurn(p); else await botTurn(p);
    // Wer zuletzt aufgestiegen ist (für Walter, den Waldschrat)
    const up=S.players.filter((q,i)=>q.lvl>snap[i]); if(up.length) S.lastUp=(up.find(q=>q.id===p.id)||up[0]).id;
    up.forEach(q=>{ if(q.sand){ q.sand=0; log(`${nm(q)} ${V(q,'schüttelst','schüttelt')} den Sand aus der Badehose.`,'good'); } });
    if(S.winner!=null || t!==TOKEN) break;
    S.cur=(S.cur+1)%S.players.length;
    if(S.cur===0){ S.turn++; if(S.tides && !S.spring){ const fl=isFlut(); log(fl ? `Runde ${S.turn}: Die Flut kommt! Meeresmonster +3, Weglaufen +1.` : `Runde ${S.turn}: Ebbe. Das Watt liegt frei: Wer den Raum durchsucht, zieht einen Schatz.`,'sys'); fx('tide',{flut:fl}); ruleOnce('tide','Ebbe und Flut: Bei Flut haben Meeresmonster +3 und Weglaufen klappt mit +1. Bei Ebbe bringt „Raum durchsuchen“ einen Schatz statt einer Türkarte.'); } }
    if(S.turn>400){ log('Abbruch nach 400 Runden.','sys'); break; }
  }
  if(S.winner!=null && t===TOKEN) track('gameplayed');
  if(S.winner===0 && t===TOKEN){ track('gamewon'); if(!S.stats.lvlLost) track('cleanwin'); }
  if(S.winner!=null && t===TOKEN) fx('gameover',{winner:S.winner});
  render();
}
/* Spielstand fortsetzen (gespeichert zu Beginn deines Zuges) */
function resumeGame(data){
  TOKEN++;
  if(UI.reject){ const r=UI.reject; UI.prompt=null; UI.resolve=null; UI.reject=null; try{ r(); }catch(e){} }
  if(UI.sel){ const r=UI.sel.reject; UI.sel=null; try{ r(); }catch(e){} }
  UI.menu=null; UI.roll=null; UI.seen=data.seen||{}; UI.logLen=0;
  S=data.S;
  let maxU=0; const scan=c=>{ if(c && c.uid>maxU) maxU=c.uid; };
  [S.door,S.tr,S.doorDisc,S.trDisc].forEach(a=>a.forEach(scan));
  S.players.forEach(p=>{ [p.hand,p.eq,p.pack].forEach(a=>a.forEach(scan)); scan(p.race); scan(p.cls); });
  UID=maxU+1;
  const all=[...S.door,...S.tr,...S.doorDisc,...S.trDisc]; S.players.forEach(p=>all.push(...p.hand,...p.eq,...p.pack,...[p.race,p.cls].filter(Boolean)));
  buildCatalog(all);
  S.combat=null; S.reveal=null;
  log('Spielstand geladen. Es geht weiter mit deinem Zug.','sys');
  const t=TOKEN;
  return gameLoop(t).catch(e=>{ if(e!==STALE){ console.error(e); log('Hoppla, ein Programmfehler: '+e.message,'sys'); } });
}
function revive(p){
  p.dead=false;
  for(let i=0;i<4;i++){ const a=drawDoor(), b=drawTr(); if(a) p.hand.push(a); if(b) p.hand.push(b); }
  log(`${p.human?'Du kehrst':p.name+' kehrt'} zurück und ${V(p,'ziehst','zieht')} 4 Tür- und 4 Schatzkarten.`,'sys');
}

/* ================= Dein Zug ================= */
function isFree(){ return S && S.cur===0 && me().human && !S.combat && UI.prompt && !UI.sel && S.winner==null; }

async function humanTurn(p){
  if(p.dead) revive(p);
  p.soldDouble=false;
  S.phase=1;
  log(`Dein Zug · Runde ${S.turn}`,'turn');
  fx('turn',{p});
  if(CHECKPOINT_HANDLER){ try{ CHECKPOINT_HANDLER(); }catch(e){} }
  await ask(()=>({title:'Phase 1 · Tür öffnen', text:'Bereite dich vor, dann öffne die Tür.', hint:hintStart(p), opts:[{l:'Tür öffnen',v:'kick',kind:'primary'}]}), 'kick');
  const c=luckyDoor(p);
  let fought=false;
  if(c){
    S.reveal=c;
    log(`Du öffnest die Tür: <b>${cardLabel(c)}</b>.`);
    if(c.k==='monster'){ ruleOnce('openmon','Ein offen aufgedecktes Monster musst du sofort bekämpfen.'); S.reveal=null; await combat(0,[c]); fought=true; }
    else if(c.k==='curse'){ ruleOnce('doorcurse','Einen Fluch, den du beim Öffnen der Tür aufdeckst, bekommst du selbst ab.'); await sleep(1100); S.reveal=null; await applyCurse(p,c,null); }
    else { await sleep(1000); S.reveal=null; p.hand.push(c); log(`${c.n} kommt auf deine Hand.`); if(c.k==='race'||c.k==='class') ruleOnce('rcplay','Völker und Klassen darfst du im eigenen Zug jederzeit ausspielen. Zieh die Karte aufs Spielfeld oder tippe sie an.'); }
  }
  if(S.winner!=null) return;
  if(!fought && !p.dead){
    S.phase=2;
    const v=await ask(()=>{
      const mons=p.hand.filter(x=>x.k==='monster');
      return {title:'Phase 2 · Monster herausfordern – oder Phase 3 · Raum durchsuchen', text:'Kein Monster hinter der Tür. Willst du eins von deiner Hand bekämpfen?', hint:hintTrouble(p,mons),
        opts:[...mons.map(m=>({l:`Herausfordern: ${m.n} (Stufe ${m.lvl})`,v:'m'+m.uid,kind:power(p)>m.lvl?'':'danger'})),{l:'Raum durchsuchen',v:'loot',kind:'primary'}]};
    }, 'trouble');
    if(v==='loot'){
      S.phase=3;
      const watt=isEbbe(); let d=watt ? luckyTr() : drawDoor();
      if(d && hasRace(p,'elf')){ const d2=watt ? drawTr() : drawDoor();
        if(d2){
          // Wie beim Draft: beide Karten fliegen verdeckt von rechts ein, drehen sich um; nach der Wahl geht eine auf die Hand, die andere fliegt nach links weg
          const view={pool:[d,d2], draft:true, kind:'elf', title:'Elf · Scharfe Augen', sub:'Behalte eine Karte, die andere kommt auf den Ablagestapel', deck:watt?'tr':'door', pick:`${S.turn}-${d.uid}`, side:'right', exit:'left', vals:['a','b'], a:d, b:d2, phase:'in'};
          UI.dview=view; render(); await sleep(UI.reduce ? 0 : 800);
          view.phase='pick';
          const keep=await ask(()=>({title:'Elf: Scharfe Augen', text:'Du ziehst 2 Karten. Welche behältst du?', hint:['Die andere kommt auf den Ablagestapel.'], opts:[{l:cardLabel(d),v:'a',kind:'primary'},{l:cardLabel(d2),v:'b',kind:'primary'}]}), 'elfpick', view);
          view.phase='out'; view.picked=(keep==='b' ? d2 : d).uid; render(); await sleep(UI.reduce ? 0 : 820); UI.dview=null;
          if(keep==='b'){ discard(d); d=d2; } else discard(d2);
          ruleOnce('elfloot','Elfen ziehen beim Durchsuchen 2 Karten und behalten 1.'); } }
      if(d && watt){ p.hand.push(d); log(`Ebbe: Du suchst im Watt und findest <b>${cardLabel(d)}</b>.`,'good'); }
      else if(d){ p.hand.push(d); log(`Du durchsuchst den Raum und ziehst verdeckt: <b>${cardLabel(d)}</b>.`);
        if(d.k==='curse') ruleOnce('hiddencurse','Verdeckt gezogene Flüche wirken nicht auf dich. Du kannst sie später jederzeit auf jemanden spielen.');
        if(d.k==='monster') ruleOnce('handmon','Ein Monster auf der Hand nutzt du nächsten Zug für „Monster herausfordern“ oder mit „Hinterhalt“ in fremden Kämpfen.'); }
    } else {
      const m=p.hand.find(x=>'m'+x.uid===v);
      if(m){ take(p,m); log(`Du forderst <b>${m.n}</b> von deiner Hand heraus.`); await combat(0,[m]); }
    }
  }
  if(S.winner!=null) return;
  S.phase=4;
  while(true){
    const v=await ask(()=>{ const over=p.hand.length-handLimit(p);
      return {title:'Phase 4 · Abgabe', text: over>0 ? `Du hast ${p.hand.length} Karten, erlaubt sind ${handLimit(p)}.` : 'Dein Zug ist fast vorbei. Lege noch aus, was du brauchst.', hint:hintCharity(p),
        opts: over>0 ? [...(stashable(p).length ? [{l:'In den Rucksack',v:'stash'}] : []), {l:`${over} ${pl(over,'Karte','Karten')} abgeben`,v:'give',kind:'primary'}] : [{l:'Zug beenden',v:'end',kind:'primary'}]}; }, 'charity');
    if(v==='end') break;
    if(v==='stash'){
      const ok=stashable(p);
      const sel=await selectCards({ctx:'stash', title:'In den Rucksack', text:'Wähle Gegenstände von deiner Hand. Im Rucksack zählen sie nicht als Handkarten, bringen aber keinen Bonus.', min:1, max:ok.length, cancel:true,
        filter:(c,w)=>w==='hand' && ok.includes(c), confirm:()=> 'In den Rucksack'});
      if(sel) sel.map(findCard).filter(Boolean).forEach(stashItem);
      continue;
    }
    const over=p.hand.length-handLimit(p);
    if(over<=0) continue;
    const sel=await selectCards({ctx:'charity', title:'Abgabe', text:`Wähle ${over} ${pl(over,'Karte','Karten')}, die du abgibst.`, min:over, max:over, cancel:true,
      filter:(c,w)=>w==='hand' && !(SCN && SCN.keep && SCN.keep.includes(c.n) && p.hand.length-over>0), confirm:()=> 'Abgeben'});   // Einführung: wichtige Karte bleibt
    if(!sel) continue;
    doCharity(p, sel.map(findCard).filter(Boolean));
  }
}
function hintStart(p){
  const h=[];
  const eqable=p.hand.filter(c=>c.k==='item' && gainOf(p,c)>0);
  if(!p.race && p.hand.some(c=>c.k==='race')) h.push('Du hast eine Volkskarte auf der Hand. Ausspielen gibt dir ihre Fähigkeit.');
  if(!p.cls && p.hand.some(c=>c.k==='class')) h.push('Du hast eine Klassenkarte auf der Hand. Spiel sie aus, manche Gegenstände brauchen sie.');
  if(eqable.length) h.push(`Anlegen lohnt sich: ${eqable.map(c=>c.n).join(', ')}. Karte antippen, dann „Ausrüsten“.`);
  const sv=sellValue(p,[...p.pack,...p.hand.filter(c=>c.k==='item' && gainOf(p,c)<=0)]);
  if(sv.sum>=1000 && p.lvl<WINLVL()-1) h.push(`Du hast nicht genutzte Gegenstände für ${fmt(sv.sum)} Gold. Verkaufen bringt dir eine Stufe.`);
  if(p.hand.some(c=>c.k==='levelup') && p.lvl<WINLVL()-1) h.push('Eine Stufenkarte direkt zu benutzen lohnt sich fast immer.');
  if(canPfanne(p).ok) h.push('Du hast alles für eine Pilzpfanne. Tippe einen Speisepilz an und wähle „Pilzpfanne kochen“.');
  if(p.spore) h.push(`Die Sporenwolke kostet dich −${p.spore} in jedem Kampf, bis du einen gewinnst.`);
  if(p.sun) h.push(p.hand.some(c=>c.cream) ? 'Du hast Sonnenbrand und Sonnencreme auf der Hand: Creme dich ein, dann hilft dir auch wieder jemand.' : 'Mit Sonnenbrand hast du −1 in jedem Kampf, und niemand hilft dir, bis du einen Kampf gewinnst.');
  if(p.sand) h.push('Sand in der Badehose: Weglaufen −2, bis du eine Stufe aufsteigst.');
  if(S.tides) h.push(isFlut() ? 'Es ist Flut: Meeresmonster haben +3, dafür klappt Weglaufen mit +1.' : 'Es ist Ebbe: Meeresmonster sind normal stark, und „Raum durchsuchen“ bringt einen Schatz.');
  if(!h.length) h.push('Alles bereit. Deine Kampfstärke: '+power(p)+'.');
  return h;
}
function hintTrouble(p,mons){
  const h=[];
  if(mons.length){
    const safe=mons.filter(m=>power(p)>m.lvl+2);
    h.push(`Deine Kampfstärke ist ${power(p)}. ${safe.length?'Mit Puffer schlägst du: '+safe.map(m=>m.n).join(', ')+'.':'Keins deiner Hand-Monster schlägst du mit Puffer.'}`);
    h.push('Die anderen können eingreifen. Ein knapper Kampf ist riskant.');
  } else h.push(isEbbe() ? 'Ohne Monster auf der Hand bleibt nur: Raum durchsuchen. Bei Ebbe findest du im Watt einen Schatz.' : 'Ohne Monster auf der Hand bleibt nur: Raum durchsuchen. Du ziehst 1 Türkarte verdeckt.');
  return h;
}
function charityTargets(p){
  const minL=Math.min(...S.players.map(o=>o.lvl));
  if(p.lvl===minL) return null;
  return S.players.filter(o=>o.id!==p.id && o.lvl===minL);
}
function hintCharity(p){
  const lim=handLimit(p), over=p.hand.length-lim;
  if(over<=0) return [`Du hast ${p.hand.length} von höchstens ${lim} Karten. Alles gut.`];
  const t=charityTargets(p);
  return [`Spiele vorher aus, was geht: Gegenstände anlegen, in den Rucksack legen, verkaufen, Flüche verteilen. Sonst gibst du ${over} ${pl(over,'Karte','Karten')} ab.`,
    t ? `Die Karten bekommt ${t.map(x=>x.name).join(' und ')} (niedrigste Stufe).` : 'Du hast selbst (mit) die niedrigste Stufe, also werden sie abgelegt.'];
}
function doCharity(p,cards){
  if(!cards.length) return;
  const t=charityTargets(p);
  if(!t){ cards.forEach(c=>{ take(p,c); discard(c); }); log(`${nm(p)} ${V(p,'legst','legt')} ${cards.length} ${pl(cards.length,'Karte','Karten')} ab.`); ruleOnce('charself','Abgabe: Wer selbst (mit) die niedrigste Stufe hat, legt die überzähligen Karten ab.'); }
  else { const toMe=[]; cards.forEach((c,i)=>{ take(p,c); const r=t[i%t.length]; r.hand.push(c); if(r.human) toMe.push(c); });
    log(`${nm(p)} ${V(p,'gibst','gibt')} ${cards.length} ${pl(cards.length,'Karte','Karten')} an ${t.map(nmA).join(' und ')} ab.${toMe.length?` Du bekommst: ${toMe.map(c=>`<b>${cardLabel(c)}</b>`).join(', ')}.`:''}`);
    ruleOnce('charity','Abgabe: Überzählige Handkarten gehen an den Spieler mit der niedrigsten Stufe.'); }
}

/* ================= Bot-Zug ================= */
function botSetup(p){
  if(!p.race){ const r=p.hand.find(c=>c.k==='race'); if(r){ take(p,r); p.race=r; } }
  if(!p.cls){ const c=p.hand.find(c=>c.k==='class'); if(c){ take(p,c); p.cls=c; } }
  let again=true, guard=0;
  while(again && guard++<10){
    again=false;
    const cands=[...p.hand.filter(c=>c.k==='item'),...p.pack].sort((a,b)=>b.b-a.b);
    for(const it of cands){ if(gainOf(p,it)>0){ equip(p,it); again=true; break; } }
  }
}
async function botManage(p){
  const r0=p.race, c0=p.cls;
  botSetup(p);
  if(p.race!==r0) log(`${p.name} spielt das Volk ${p.race.n} aus.`);
  if(p.cls!==c0) log(`${p.name} spielt die Klasse ${p.cls.n} aus.`);
  if(canPfanne(p).ok) doPfanne(p);
  if(p.sun){ const cr=p.hand.find(c=>c.cream); if(cr) useCream(p,cr); }
  if(mapSet(p)) doDig(p);
  for(const lu of p.hand.filter(c=>c.k==='levelup')){ if(p.lvl<WINLVL()-1){ take(p,lu); discard(lu); p.lvl++; log(`${p.name} spielt „${lu.n}“ und steigt auf Stufe ${p.lvl}.`); ruleOnce('levelup',`Stufenkarten spielt man im eigenen Zug außerhalb von Kämpfen, aber nie für die Siegstufe ${WINLVL()}.`); } }
  botSell(p);
  for(const cu of p.hand.filter(c=>c.k==='curse')){
    if(!p.hand.includes(cu)) continue;   // nach Seegang schon weitergewandert
    if(cu.eff.t==='seegang'){ if(Math.random()<0.3){ take(p,cu); log(`${p.name} löst Seegang aus!`); discard(cu); seegang(); } continue; }
    const t=pickCurseTarget(p,cu);
    if(t && Math.random()<Math.min(0.95,0.75*diffF()*(styleOf(p).curse||1))){ take(p,cu); log(`${p.name} spielt den Fluch „${cu.n}“ auf ${nmA(t)}!`,'bad'); ruleOnce('cursehand','Flüche von der Hand darf man jederzeit auf jeden Spieler spielen.'); await sleep(spd(0.6)); await applyCurse(t,cu,p); }
  }
}
function botSell(p){
  if(p.lvl>=WINLVL()-1) return;
  const cands=[...p.pack,...p.hand.filter(c=>c.k==='item' && gainOf(p,c)<=0), ...(hasCls(p,'dieb') ? p.hand.filter(c=>(c.k==='curse'||c.k==='enh') && keepValue(p,c)<5) : [])];
  const pick=chooseSell(p,cands); if(!pick.length) return;
  const {v,lv}=doSell(p,pick); if(lv<1) return;
  log(`${p.name} verkauft ${pick.map(c=>c.n).join(', ')} für ${fmt(v.raw+v.bonus)} Gold${v.bonus?' (als Kobold mit 200 Gold Aufschlag)':''} und steigt auf Stufe ${p.lvl}.${p.gold?` Im Goldbeutel: ${fmt(p.gold)} Gold.`:''}`);
  ruleOnce('sell','Verkaufen: Je 1.000 Gold gibt es 1 Stufe. Was übrig bleibt, kommt in den Goldbeutel.');
}
function curseHits(t,c){
  const e=c.eff;
  if(e.t==='slot') return t.eq.some(i=>i.slot===e.s);
  if(e.t==='race') return !!t.race;
  if(e.t==='hand') return t.hand.length>0;
  if(e.t==='lvl') return t.lvl>1;
  if(e.t==='chill') return !t.chill;
  if(e.t==='spore') return (t.spore||0)<2;
  if(e.t==='sun') return !t.sun && !hasShade(t);
  if(e.t==='sand') return !t.sand;
  if(e.t==='seegang') return true;
  return true;
}
function pickCurseTarget(p,c){
  const spare=Math.random()<LUCK();   // Glück: diesmal bleibst du verschont
  const others=S.players.filter(o=>o.id!==p.id && !o.dead && curseHits(o,c) && !(spare && o.human));
  if(!others.length) return null;
  if(styleOf(p).grudge){ const g=others.find(o=>o.id===S.lastUp); if(g) return g; }
  if(c.eff.t==='seegang') return p;   // Seegang trifft alle, das Ziel ist egal
  if(styleOf(p).mimic && S.lastCursed!=null){ const g=others.find(o=>o.id===S.lastCursed); if(g) return g; }
  if(styleOf(p).whistle && S.lastRan!=null){ const g=others.find(o=>o.id===S.lastRan); if(g) return g; }
  const max=Math.max(...others.map(o=>o.lvl));
  if(max<p.lvl - (styleOf(p).spite?1:0)) return null;
  const top=others.filter(o=>o.lvl===max);
  return top[rnd(top.length)];
}
function botTroubleChoice(p){
  if(styleOf(p).lazy && Math.random()<0.65) return null;
  const fl=isFlut(), eff=c=>c.lvl + (c.vs && ((c.vs.race && hasRace(p,c.vs.race)) || (c.vs.cls && hasCls(p,c.vs.cls)))?c.vs.val:0) + (fl && c.meer?3:0) - (fl && c.soft?c.soft:0);
  const ms=p.hand.filter(c=>c.k==='monster' && power(p) - (p.spore||0) - (p.sun?1:0) > eff(c) + (styleOf(p).cautious?4:2));
  return ms.sort((a,b)=>b.lvl-a.lvl)[0]||null;
}
async function botTurn(p){
  if(p.dead) revive(p);
  p.soldDouble=false;
  S.phase=1;
  log(`${p.name} ist am Zug`,'turn');
  fx('turn',{p});
  await sleep(spd(0.7));
  await botManage(p);
  if(S.winner!=null) return;
  await sleep(spd(0.5));
  const c=luckyDoor(p); let fought=false;
  if(c){
    S.reveal=c; log(`${p.name} öffnet die Tür: <b>${cardLabel(c)}</b>.`); await sleep(spd());
    if(c.k==='monster'){ S.reveal=null; await combat(p.id,[c]); fought=true; }
    else if(c.k==='curse'){ S.reveal=null; await applyCurse(p,c,null); }
    else { S.reveal=null; p.hand.push(c); await botManage(p); }
  }
  if(S.winner!=null) return;
  if(!fought && !p.dead){
    S.phase=2;
    const m=botTroubleChoice(p);
    if(m){ take(p,m); log(`${p.name} fordert <b>${m.n}</b> (Stufe ${m.lvl}) von der Hand heraus.`); await sleep(spd()); await combat(p.id,[m]); }
    else { S.phase=3; const watt=isEbbe(); let d=watt ? drawTr() : drawDoor();
      if(d && hasRace(p,'elf')){ const d2=watt ? drawTr() : drawDoor(); if(d2){ if(keepValue(p,d2)>keepValue(p,d)){ discard(d); d=d2; } else discard(d2); } }
      if(d) p.hand.push(d); log(watt ? `Ebbe: ${p.name} sucht im Watt und findet einen Schatz.` : `${p.name} durchsucht den Raum und zieht 1 Türkarte verdeckt.`); await sleep(spd(0.6)); }
  }
  if(S.winner!=null) return;
  await botManage(p);
  S.phase=4;
  let over=p.hand.length-handLimit(p);
  for(const it of stashable(p)){ if(over<=0) break; if(!canStash(p,it).ok) break; stash(p,it); over--; log(`${p.name} legt ${it.n} in den Rucksack.`); }
  if(over>0){ const give=p.hand.slice().sort((a,b)=>keepValue(p,a)-keepValue(p,b)).slice(0,over); doCharity(p,give); }
  await sleep(spd(0.6));
}

/* ================= Kampf ================= */
async function combat(fid, cards, preEnh){
  const C=S.combat={f:fid, h:null, deal:0, mons:cards.map((c,i)=>({c,enh: i===0 && preEnh ? preEnh : []})), pB:[], mB:[], used:[], berserk:0, turning:0, stabbed:{}, intf:{}, asked:{}, played:{}, counter:false, resolved:false, hchg:false};
  const f=P(fid);
  log(`Kampf: ${nm(f)} gegen <b>${monNames(C)}</b> (Stufe ${C.mons[0].c.lvl}).`);
  if(f.chill){ C.pB.push({l:`Kellerkälte (${nm(f)})`,v:-f.chill}); log(`Kellerkälte: ${nm(f)} ${V(f,'zitterst','zittert')} und ${V(f,'kämpfst','kämpft')} mit −${f.chill}.`,'bad'); f.chill=0; }
  ruleOnce('power','Kampfstärke = Stufe + Boni der ausgerüsteten Gegenstände. Sie muss höher sein als die Monsterstufe. Gleichstand verliert.');
  render();
  if(f.human) await humanFight(C); else await botFight(C);
  C.resolved=true;
  const r=evalCombat(C);
  if(r.win) [f, C.h!=null?P(C.h):null].forEach(q=>{ if(q && q.spore){ q.spore=0; log(`Die Sporenwolke um ${nmA(q)} verzieht sich.`,'good'); } if(q && q.sun){ q.sun=0; log(`Der Sonnenbrand ${q.human?'auf deiner Haut':'von '+q.name} klingt ab.`,'good'); } });
  if(SCN && SCN.fight){
    S.stats.fightWon=r.win;
    if(r.win){ fx('win',{p:f, mine:true}); log(`Du besiegst ${monNames(C)}! Rätsel gelöst.`,'good'); }
    else { fx('lose',{p:f, mine:true}); log(`${monNames(C)} ist zu stark. Versuch es noch einmal.`,'bad'); }
  } else if(r.win) await winCombat(C); else await loseCombat(C);
  C.mons.forEach(m=>{ discard(m.c); m.enh.forEach(discard); });
  C.used.forEach(discard);
  await sleep(spd(0.5));
  UI.roll=null;
  S.combat=null;
  render();
}
function combatPrompt(C){
  const p=me(), r=evalCombat(C), h=[];
  const os=p.hand.filter(c=>c.k==='oneshot' && c.b);
  if(!r.win){
    const need=r.b-r.a+(r.tieWin?0:1);
    h.push(`Dir ${pl(need,'fehlt','fehlen')} ${need} ${pl(need,'Punkt','Punkte')}.`);
    if(os.length) h.push(`Einmal-Gegenstände auf deiner Hand: ${os.map(c=>`${c.n} (+${osP(c,C)})`).join(', ')}. Aufs Spielfeld ziehen oder antippen.`);
    const tiny=p.hand.find(c=>c.k==='enh' && c.v<0); if(tiny) h.push(`„${tiny.n}“ (${sign(tiny.v)}) darfst du auch auf dein eigenes Monster spielen.`);
    if(C.h==null) h.push(noHelpMon(C) ? (p.sun && !C.mons.some(m=>m.c.noHelp) ? 'Mit deinem Sonnenbrand will dir niemand helfen. Sonnencreme oder ein gewonnener Kampf hilft.' : 'Hilfe gibt es hier nicht: Das Waldnetz hört mit, niemand darf dir helfen.') : 'Du kannst einen Mitspieler um Hilfe bitten und Schätze anbieten.');
    h.push('Reicht nichts davon: aufgeben und weglaufen.');
  } else {
    h.push('Wenn du „Fertig“ sagst, haben die anderen noch kurz Zeit einzugreifen.');
    const plus=p.hand.find(c=>c.k==='enh' && c.v>0);
    if(plus && r.a-r.b>plus.v+1) h.push(`Trick: „${plus.n}“ (${sign(plus.v)}) auf dein eigenes Monster bringt dir mehr Schätze. Nur, wenn du trotzdem sicher gewinnst.`);
    if(p.lvl+levelsGained(C)>=WINLVL()) h.push('Dieser Sieg bringt dir das Spiel. Rechne mit Gegenwehr!');
  }
  const opts=[];
  opts.push(r.win ? {l:'Fertig: Monster besiegen',v:'done',kind:'primary'} : {l: SCN && SCN.fight ? 'Aufgeben' : 'Aufgeben und weglaufen',v:'run',kind:'danger'});
  if(C.h==null && !noHelpMon(C) && S.players.some(x=>!x.human && !x.dead && !C.asked[x.id])) opts.push({l:'Um Hilfe bitten',v:'help'});
  if(hasCls(p,'zauberer') && C.f===0 && !C.counter && p.hand.length>=2 && counterTargets(C).length) opts.push({l:'Zauberer: Gegenzauber (2 Karten)',v:'counter'});
  return {title:`Kampf · ${r.a} gegen ${r.b}`, text: r.win ? 'Du gewinnst diesen Kampf gerade.' : (r.a===r.b ? 'Gleichstand. Das reicht nicht, du verlierst gerade.' : 'Du verlierst diesen Kampf gerade.'), hint:h, opts};
}
async function humanFight(C){
  const p=me();
  while(true){
    const v=await ask(()=>combatPrompt(C), 'fight');
    if(v==='help'){ await humanAskHelp(C); continue; }
    if(v==='counter'){
      const ts=counterTargets(C); if(!ts.length) continue;
      const pick=await ask(()=>({title:'Gegenzauber', text:'Was hebst du auf? Danach wirfst du 2 Karten ab.', hint:['Einmal pro Kampf. Aufheben kannst du Launen und Einmal-Gegenstände, die andere gegen dich gespielt haben.'],
        opts:[...ts.map((t,i)=>({l:`${t.l} (${sign(t.v)})`,v:i,kind:i===0?'primary':''})),{l:'Abbrechen',v:'x',kind:'ghost'}]}), 'counter');
      if(pick==='x') continue;
      const sel=await selectCards({ctx:'counter', title:'Gegenzauber', text:'Wirf 2 Karten ab.', min:2, max:2, cancel:true, filter:(c,w)=>w==='hand', confirm:()=>'Abwerfen'});
      if(!sel || sel.length<2) continue;
      sel.map(findCard).forEach(c=>{ take(p,c); discard(c); }); stat('discarded',2);
      const t=ts[pick]; applyCounter(C,t); log(`Gegenzauber: ${t.l} ist aufgehoben.`,'good');
      ruleOnce('counter','Zauberer: Einmal pro Kampf hebt der Gegenzauber eine Laune oder einen Einmal-Gegenstand auf, den jemand gegen ihn gespielt hat.');
      continue;
    }
    if(v==='berserk' || v==='turn'){
      const used = v==='berserk' ? C.berserk : C.turning, per = v==='berserk'?1:3, max=Math.min(3-used,p.hand.length);
      const sel=await selectCards({ctx:v, title: v==='berserk'?'Krieger-Fähigkeit':'Priester gegen Untote', text:`Wirf bis zu ${max} ${pl(max,'Karte','Karten')} ab. Jede bringt +${per}.`, min:1, max, cancel:true, filter:(c,w)=>w==='hand', confirm:cs=>`${cs.length} abwerfen (+${cs.length*per})`});
      if(sel && sel.length){ sel.map(findCard).forEach(c=>{ take(p,c); discard(c); }); stat('discarded', sel.length);
        if(v==='berserk'){ C.berserk+=sel.length; C.pB.push({l:`Krieger-Fähigkeit (${sel.length} ${pl(sel.length,'Karte','Karten')})`,v:sel.length}); }
        else { C.turning+=sel.length; C.pB.push({l:`Priester gegen Untote (${sel.length} ${pl(sel.length,'Karte','Karten')})`,v:3*sel.length}); }
        log(`Du wirfst ${sel.length} ${pl(sel.length,'Karte','Karten')} ab und bekommst +${sel.length*per}.`); }
      continue;
    }
    if(v==='run') return;
    if(v==='done'){
      if(!evalCombat(C).win) return;
      log('Du sagst: „Fertig!“ Die anderen dürfen jetzt noch eingreifen …','sys');
      await sleep(spd(0.6));
      const any=await botsInterfere(C);
      if(any){ ruleOnce('respond','Nach einem Eingriff darfst du reagieren: mehr Einmal-Gegenstände, Hilfe holen oder aufgeben.'); continue; }
      log('Niemand greift ein.','sys');
      return;
    }
  }
}
async function humanAskHelp(C){
  const cands=S.players.filter(x=>!x.human && !x.dead && !C.asked[x.id]);
  const total=treasuresOf(C);
  const v=await ask(()=>({title:'Um Hilfe bitten', text:'Wen fragst du? Nur 1 Mitspieler darf helfen.', hint:['Die Kampfstärke des Helfers wird zu deiner addiert. Bietest du Schätze an, sagt er eher Ja.','Niemand hilft gern jemandem, der damit das Spiel gewinnt.'],
    opts:[...cands.map(b=>({l:`${b.name} (Kampfstärke ${power(b)})`,v:b.id})),{l:'Abbrechen',v:'x',kind:'ghost'}]}), 'helpWho');
  if(v==='x') return;
  const b=P(v);
  const offer=await ask(()=>({title:`Angebot an ${b.name}`, text:`Wie viele der ${total} ${pl(total,'Schatz','Schätze')} bietest du an?`, hint:['Mit Helfer werden die Schätze offen gezogen. Der Helfer bekommt, was vereinbart ist.'],
    opts:[...Array.from({length:total+1},(_,i)=>({l:`${i} ${pl(i,'Schatz','Schätze')}`,v:i})),{l:'Abbrechen',v:'x',kind:'ghost'}]}), 'helpOffer', {b});
  if(offer==='x') return;
  C.asked[b.id]=true;
  log(`Du bittest ${b.name} um Hilfe und bietest ${offer} ${pl(offer,'Schatz','Schätze')}.`);
  await sleep(spd(0.6));
  const ans=botAcceptHelp(b,C,offer);
  if(ans.yes){ C.h=b.id; C.deal=offer; stat('help'); log(`${b.name}: „${ans.why}“ ${b.name} hilft dir.`,'good'); ruleOnce('helper','Mit Helfer zählen beide Kampfstärken. Verliert ihr, müssen beide einzeln weglaufen.'); }
  else log(`${b.name} lehnt ab: „${ans.why}“`,'bad');
}
function botAcceptHelp(b,C,offer){
  const f=P(C.f), total=treasuresOf(C), st=styleOf(b);
  if(!wouldWinWith(C,b)) return {yes:false, why:'Selbst mit mir reicht das nicht.'};
  if(SCN && SCN.perks && SCN.perks.freeHelp===b.name && f.human && (!S.stats.perkUsed || SCN.perks.always)){ S.stats.perkUsed=true; return {yes:true, why:SCN.perks.why||'Ehrensache!'}; }
  if(f.lvl+levelsGained(C)>=WINLVL() || C.mons.some(m=>m.c.boss)) return {yes:false, why:'Damit du gewinnst? Sicher nicht!'};
  if(st.noHelp) return {yes:false, why:st.noWhy||'Helfen? Ich? Pfoten weg von meinen Schätzen!'};
  if(st.cheap && Math.random()<(offer===0?0.55:0.95)*(f.lvl>b.lvl+2?0.6:1)) return {yes:true, why: offer>0 ? 'Oh ja, oh ja! Ich helfe!' : 'Umsonst? Na klar, ich mag dich!'};
  if(st.greedy){ const all=Math.max(1,total);
    if(offer>=all) return {yes:true, why:'Alle Schätze? Prost, abgemacht!'};
    if(offer>=Math.ceil(all*0.75) && Math.random()<0.45) return {yes:true, why:'Na gut, fast alles ist auch was.'};
    return {yes:false, why: offer===0 ? 'Für nichts? Da bleibt mein Spundloch zu.' : `Unter ${all} ${pl(all,'Schatz','Schätzen')} rolle ich nicht los.`}; }
  const leaderGap=f.lvl - Math.max(...S.players.filter(x=>x.id!==f.id).map(x=>x.lvl));
  let chance = offer===0 ? 0.2 : (total>0 && offer/total>=0.5 ? 0.9 : 0.65);
  if(leaderGap>=2) chance-=0.35;
  chance*=st.help||1;
  if(st.mimic && S.lastHelped!=null && S.lastHelped!==b.id) chance*=1.6;
  if(st.fair && offer<Math.ceil(total/2)) chance*=0.4;
  if(Math.random()<chance) return {yes:true, why: offer>0 ? 'Abgemacht.' : 'Na gut, ausnahmsweise.'};
  return {yes:false, why: offer===0 ? 'Für nichts? Nein danke.' : 'Nicht dieses Mal.'};
}
function humanCanInterfere(C){
  const p=me(); if(!p.human || p.dead) return false;
  return p.hand.some(c=>(c.k==='enh') || (c.k==='oneshot' && osM(c)) || c.k==='curse') ||
    (p.hand.some(c=>c.k==='wander') && p.hand.some(c=>c.k==='monster'));
}
function interferePrompt(C){
  const f=P(C.f), p=me(), r=evalCombat(C), helper=C.h===0, h=[];
  if(helper){ h.push('Du hilfst. Mit Einmal-Gegenständen kannst du eure Seite stärken.'); }
  else if(r.win){
    if(f.lvl+levelsGained(C)>=WINLVL()) h.push(`Achtung: Gewinnt ${f.name} diesen Kampf, ist das Spiel vorbei!`);
    const opts=[];
    p.hand.filter(c=>c.k==='enh' && c.v>0).forEach(c=>opts.push(`„${c.n}“ (${sign(c.v)})`));
    p.hand.filter(c=>c.k==='oneshot' && osM(c)).forEach(c=>opts.push(`${c.n} für das Monster (+${osM(c)})`));
    if(p.hand.some(c=>c.k==='wander') && p.hand.some(c=>c.k==='monster')) opts.push('Hinterhalt mit einem Monster von deiner Hand');
    if(p.hand.some(c=>c.k==='curse')) opts.push('ein Fluch auf '+f.name);
    if(opts.length) h.push('Möglich: '+opts.join(', ')+'. Karte aufs Spielfeld ziehen oder antippen.');
    h.push('Eingreifen kostet Karten. Lohnt sich vor allem gegen den, der vorne liegt.');
  } else h.push(`${f.name} verliert gerade.`);
  const o=[{l: C.hchg ? 'Fertig, weiter' : 'Nicht eingreifen', v:'ok', kind:'primary'}];
  return {title:`${f.name} kämpft · ${r.a} gegen ${r.b}`, text: helper ? `Du hilfst ${f.name} gegen ${monNames(C)}.` : `${f.name} ${r.win?'gewinnt':'verliert'} gerade gegen ${monNames(C)}. Willst du eingreifen?`, hint:h, opts:o};
}
async function humanInterfereWindow(C){
  const p=me(); if(!p.human || p.dead) return false;
  const r=evalCombat(C), helper=C.h===0;
  if(helper){ if(!p.hand.some(c=>c.k==='oneshot' && c.b)) return false; }
  else if(!r.win || !humanCanInterfere(C)) return false;
  C.hchg=false;
  while(true){
    const v=await ask(()=>interferePrompt(C), 'interfere');
    if(v==='stab'){
      const sel=await selectCards({ctx:'stab', title:'Dieb: in den Rücken fallen', text:'Wirf 1 Karte ab. Die kämpfende Seite bekommt −2.', min:1, max:1, cancel:true, filter:(c,w)=>w==='hand', confirm:()=>'Abwerfen'});
      if(sel && sel.length){ const c=findCard(sel[0]); take(p,c); discard(c); C.stabbed[0]=true; C.pB.push({l:'Dieb: du fällst in den Rücken',v:-2}); C.hchg=true; C.asked[0]=true; track('intf'); log(`Du fällst ${P(C.f).name} in den Rücken: −2.`,'bad'); }
      continue;
    }
    break;
  }
  return C.hchg;
}
async function botFight(C){
  const b=P(C.f);
  await sleep(spd());
  botBoost(b,C);
  if(!evalCombat(C).win) await botSeekHelp(b,C);
  let guard=0;
  while(guard++<8){
    let changed=false;
    if(await humanInterfereWindow(C)) changed=true;
    if(await botsInterfere(C)) changed=true;
    if(!changed) break;
    await sleep(spd(0.5));
    botBoost(b,C);
    if(!evalCombat(C).win && C.h==null) await botSeekHelp(b,C);
  }
  await sleep(spd(0.5));
}
function botBoost(b,C){
  const r=evalCombat(C); if(r.win) return false;
  const need=r.b-r.a+(r.tieWin?0:1);
  if(hasCls(b,'zauberer') && C.f===b.id && !C.counter && b.hand.length>=2){
    const ts=counterTargets(C).sort((x,y)=>y.v-x.v);
    if(ts.length && ts[0].v>=need){ b.hand.slice().sort((x,y)=>keepValue(b,x)-keepValue(b,y)).slice(0,2).forEach(c=>{ take(b,c); discard(c); });
      applyCounter(C,ts[0]); log(`${b.name} wirkt als Zauberer einen Gegenzauber: ${ts[0].l} ist aufgehoben.`,'good'); return true; }
  }
  const res=[];
  const sides=[b]; if(C.h!=null && !P(C.h).human) sides.push(P(C.h));
  const decisive=b.lvl+levelsGained(C)>=WINLVL() || C.mons.some(m=>m.c.boss);
  sides.forEach(q=>q.hand.forEach(c=>{
    if(c.k==='oneshot' && c.speise && styleOf(q).collect && !decisive) return;
    if(c.k==='oneshot' && c.b){ const v=osP(c,C); res.push({v, use:()=>{ take(q,c); C.used.push(c); C.pB.push({l:`${c.n} (${q.name})`,v}); log(`${q.name} setzt ${c.n} ein (+${v}).`); if(c.cream && q.sun){ q.sun=0; log(`Der Sonnenbrand von ${q.name} ist weg.`,'good'); } }}); }
    if(c.k==='enh' && c.v<0) res.push({v:-c.v, use:()=>{ take(q,c); const m=strongestMon(C); m.enh.push(c); log(`${q.name} spielt „${c.n}“ (${sign(c.v)}) auf ${m.c.n}.`); }});
  }));
  const total=res.reduce((s,x)=>s+x.v,0);
  if(total<need) return false;
  res.sort((x,y)=>x.v-y.v);
  let chosen=res.find(x=>x.v>=need); chosen = chosen ? [chosen] : null;
  if(!chosen){ chosen=[]; let s=0; for(const x of res.slice().sort((x,y)=>y.v-x.v)){ chosen.push(x); s+=x.v; if(s>=need) break; } }
  chosen.forEach(x=>x.use());
  return true;
}
const noHelpMon = C => C.mons.some(m=>m.c.noHelp) || !!(P(C.f) && P(C.f).sun);
async function botSeekHelp(b,C){
  if(C.h!=null || noHelpMon(C)) return;
  const sk=styleOf(b).seek; if(sk!=null && Math.random()>sk && !severe(strongestMon(C).c.bad)) return;
  const total=treasuresOf(C);
  const cands=S.players.filter(p=>p.id!==b.id && !p.dead && !C.asked[p.id] && wouldWinWith(C,p))
    .sort((x,y)=>(y.human?1:0)-(x.human?1:0));
  for(const p of cands){
    C.asked[p.id]=true;
    const offer=total>0 ? Math.max(1,Math.floor(total/2)) : 0;
    if(p.human){
      const r=evalCombat(C);
      const v=await ask(()=>({title:`${b.name} bittet dich um Hilfe`, text:`${b.name} kämpft gegen ${monNames(C)} und steht bei ${r.a} gegen ${r.b}. Mit dir wären es ${r.a+power(p)}. Angebot: ${offer} von ${total} ${pl(total,'Schatz','Schätzen')}.`,
        hint:[`Hilfst du, steigt ${b.name} auf Stufe ${Math.min(10,b.lvl+levelsGained(C))}.`,'Verliert ihr trotzdem (z. B. weil jemand eingreift), musst du auch weglaufen.'],
        opts:[{l:`Helfen (für ${offer} ${pl(offer,'Schatz','Schätze')})`,v:'yes',kind:'primary'},{l:'Ablehnen',v:'no'}]}), 'botHelp', {b, offer});
      if(v==='yes'){ C.h=0; C.deal=offer; log(`Du hilfst ${b.name} für ${offer} ${pl(offer,'Schatz','Schätze')}.`,'good'); ruleOnce('helper','Mit Helfer zählen beide Kampfstärken. Verliert ihr, müssen beide einzeln weglaufen.'); return; }
      log(`Du lehnst ab.`);
    } else {
      const ans=botAcceptHelp(p,C,offer);
      log(`${b.name} bittet ${p.name} um Hilfe (${offer} ${pl(offer,'Schatz','Schätze')}).`);
      await sleep(spd(0.6));
      if(ans.yes){ C.h=p.id; C.deal=offer; log(`${p.name}: „${ans.why}“`,'good'); return; }
      log(`${p.name}: „${ans.why}“`);
    }
  }
}
async function botsInterfere(C){
  let any=false;
  for(const b of S.players){
    if(b.human || b.id===C.f || b.id===C.h || b.dead) continue;
    const r=evalCombat(C); if(!r.win) break;
    const f=P(C.f);
    const threat=f.lvl+levelsGained(C)>=WINLVL() || C.mons.some(m=>m.c.boss);
    if((C.intf[b.id]||0) >= (threat?2:1)) continue;
    const others=S.players.filter(x=>x.id!==f.id);
    const leading=styleOf(b).envy ? f.lvl>b.lvl : f.lvl>=Math.max(...others.map(x=>x.lvl));
    const mine=C.f===0 || C.h===0;
    const chance=(threat?1:Math.min(1,(leading?0.45:0.15)*diffF()*(styleOf(b).intf||1))) * (mine ? 1-LUCK()*0.7 : 1);
    if(Math.random()>chance) continue;
    if(botPlayAgainst(b,C,threat)){ C.intf[b.id]=(C.intf[b.id]||0)+1; any=true; await sleep(spd()); }
  }
  return any;
}
function botPlayAgainst(b,C,threat){
  const opts=[];
  b.hand.forEach(c=>{ if(c.k==='enh' && c.v>0) opts.push({c,v:c.v,kind:'enh'}); if(c.k==='oneshot' && osM(c)) opts.push({c,v:osM(c),kind:'os'}); });
  const w=b.hand.find(c=>c.k==='wander'), wm=b.hand.filter(c=>c.k==='monster').sort((x,y)=>y.lvl-x.lvl)[0];
  if(w && wm) opts.push({c:w,m:wm,v:wm.lvl,kind:'wander'});
  if(!opts.length) return false;
  const r=evalCombat(C);
  const need=r.a-r.b+(r.tieWin?1:0);
  opts.sort((x,y)=>x.v-y.v);
  let pick=opts.find(o=>o.v>=need);
  if(!pick){ if(!threat) return false; pick=opts[opts.length-1]; }
  const f=P(C.f);
  fx('interfere',{by:b, kind:pick.kind});
  if(pick.kind==='enh'){ take(b,pick.c); const m=strongestMon(C); m.enh.push(pick.c); C.played[pick.c.uid]=b.id; log(`${b.name} spielt „${pick.c.n}“ (${sign(pick.c.v)}) auf ${m.c.n}!`,'bad'); ruleOnce('enh','Launen darf jeder in jeden Kampf spielen. Sie verändern auch die Zahl der Schätze.'); }
  else if(pick.kind==='os'){ take(b,pick.c); C.used.push(pick.c); C.mB.push({l:`${pick.c.n} (von ${b.name})`,v:pick.v,by:b.id}); log(`${b.name} setzt ${pick.c.n} für das Monster ein (+${pick.v})!`,'bad'); ruleOnce('osmon','Einmal-Gegenstände dürfen auch für das Monster gespielt werden, direkt von der Hand.'); }
  else if(pick.kind==='wander'){ take(b,pick.c); take(b,pick.m); discard(pick.c); C.mons.push({c:pick.m,enh:[]}); log(`${b.name} spielt „Hinterhalt“: <b>${pick.m.n}</b> (Stufe ${pick.m.lvl}) mischt mit!`,'bad'); ruleOnce('wander','Bei mehreren Monstern zählen alle zusammen. Bei einer Niederlage wird vor jedem einzeln weggelaufen.'); }
  else if(pick.kind==='stab'){ const c=b.hand.slice().sort((x,y)=>keepValue(b,x)-keepValue(b,y))[0]; take(b,c); discard(c); C.stabbed[b.id]=true; C.pB.push({l:`${b.name} fällt in den Rücken (Dieb)`,v:-2}); log(`${b.name} fällt ${nmD(f)} als Dieb in den Rücken: −2!`,'bad'); }
  return true;
}
async function winCombat(C){
  const f=P(C.f), h=C.h!=null?P(C.h):null, lv=levelsGained(C);
  if(f.human){ track('win'); if(C.mons.some(m=>m.c.lvl>=10)) track('big'); ['undead','nager','pilz','meer','pirat'].forEach(t=>{ if(C.mons.some(m=>m.c[t])) track(t); }); if(isFlut() && C.mons.some(m=>m.c.meer)) stat('meerflut'); }
  if(h && h.human) track('helped');
  if(h) S.lastHelped=h.id;
  if(C.mons.some(m=>m.c.pirat) && Math.random()<1/3){ const has=new Set(f.hand.filter(c=>c.map).map(c=>c.map));
    for(const st of [S.tr,S.trDisc]){ const i=st.findIndex(c=>c.map && !has.has(c.map)); if(i>=0){ const c=st.splice(i,1)[0]; f.hand.push(c); log(`Der Pirat hatte etwas in der Tasche: ${nm(f)} ${V(f,'findest','findet')} <b>${c.n}</b>.`,'good'); break; } } }
  fx('win',{p:f, mine: f.human || (h&&h.human)});
  f.lvl+=lv;
  const boss=C.mons.find(m=>m.c.boss);
  if(boss){
    if(f.lvl>WINLVL()) f.lvl=WINLVL();
    S.stats.bossBy=f.id; S.stats.bossHelped=!!h; S.winner=f.id;
    log(f.human ? `Du besiegst ${boss.c.n}${h?` mit Hilfe von ${nmD(h)}`:''} und gewinnst!` : `${f.name} besiegt ${boss.c.n} und gewinnt das Spiel.`, f.human?'good':'bad');
    render(); return;
  }
  log(`${nm(f)} ${V(f,'besiegst','besiegt')} ${monNames(C)}${h?` mit Hilfe von ${nmD(h)}`:''} und ${V(f,'steigst','steigt')} ${lv} ${pl(lv,'Stufe','Stufen')} auf: Stufe ${Math.min(f.lvl,WINLVL())}.`,'good');
  if(!f.human && SCN && SCN.tut && !SCN.tutFree && f.lvl>=WINLVL()) f.lvl=WINLVL()-1;   // Einführung: Bots gewinnen nie
  if(f.lvl>=WINLVL()){ f.lvl=WINLVL(); S.winner=f.id; log(f.human ? `Stufe ${WINLVL()}! Du hast gewonnen!` : `${f.name} erreicht Stufe ${WINLVL()} und gewinnt das Spiel.`, f.human?'good':'bad'); render(); return; }
  const loot=!h && hasCls(f,'pirat') ? 1 : 0, n=treasuresOf(C)+loot, drawn=[];
  if(loot){ log(`Plündern: ${nm(f)} ${V(f,'ziehst','zieht')} als Pirat 1 Schatz mehr.`,'good'); ruleOnce('pirat','Piraten teilen nicht gern: Wer als Pirat ohne Helfer gewinnt, zieht 1 Schatz mehr.'); }
  for(let i=0;i<n;i++){ const t=(f.human || (h && h.human)) ? luckyTr() : drawTr(); if(t) drawn.push(t); }
  if(h){
    log(`Die ${n} ${pl(n,'Schatz','Schätze')} werden offen gezogen: ${drawn.map(c=>`<b>${c.n}</b>`).join(', ')||'keine'}.`);
    ruleOnce('opentr','Mit Helfer werden die Schätze offen gezogen. Der Helfer wählt zuerst, dann wird abwechselnd gewählt, bis er die abgemachte Zahl hat. Der Rest gehört dem Kämpfer.');
    const {fGot,hGot}=await draftLoot(f,h,drawn,C.deal);
    h.hand.push(...hGot); f.hand.push(...fGot);
    log(`${nm(h)} ${V(h,'bekommst','bekommt')} ${hGot.length ? hGot.map(c=>c.n).join(', ') : 'nichts'}, ${nm(f)} ${V(f,'bekommst','bekommt')} ${fGot.length ? fGot.map(c=>c.n).join(', ') : 'nichts'}.`);
  } else {
    f.hand.push(...drawn);
    if(f.human) log(`Du ziehst ${n} ${pl(n,'Schatz','Schätze')} verdeckt: ${drawn.map(c=>`<b>${c.n}</b>`).join(', ')||'keine'}.`,'good');
    else log(`${f.name} zieht ${n} ${pl(n,'Schatz','Schätze')} verdeckt.`);
    ruleOnce('hidtr','Allein gewonnen: Die Schätze werden verdeckt gezogen.');
  }
  render();
}
async function loseCombat(C){
  const f=P(C.f), h=C.h!=null?P(C.h):null;
  fx('lose',{p:f, mine: f.human || (h&&h.human)});
  if(f.human || (h&&h.human)) stat('ran');
  log(`${nm(f)} ${V(f,'verlierst','verliert')} den Kampf und ${V(f,'musst','muss')} weglaufen!`,'bad');
  ruleOnce('lose','Verloren heißt: keine Stufen, keine Schätze. Jeder Beteiligte würfelt für jedes Monster: ab 5 gelingt die Flucht.');
  for(const p of [f,h].filter(Boolean)){
    for(let i=0;i<C.mons.length;i++){ if(p.dead) break; if(await runAway(p,C.mons[i],i,C.mons.length)==='all') break; }
  }
}
function severe(bad){ if(bad.t==='death') return true; if(bad.t==='lvl') return bad.n>=2; if(bad.t==='multi') return bad.l.length>=2 || bad.l.some(severe); if(bad.t==='hand') return bad.n>=5; return false; }
async function runAway(p,m,i=0,n=1){
  const left=n-i; S.lastRan=p.id;
  if(m.c.np && p.lvl<=m.c.np){ if(p.human) track('escape'); log(`${m.c.n} verfolgt niemanden bis Stufe ${m.c.np}. ${nm(p)} ${V(p,'entkommst','entkommt')} automatisch.`,'good'); ruleOnce('np','„Verfolgt niemanden bis Stufe X“: Wer diese Stufe oder niedriger hat, entkommt ohne Würfeln.'); return; }
  if(m.c.undead && hasCls(p,'priester')){ log(`${m.c.n} ist untot und verfolgt keinen Exorzisten. ${nm(p)} ${V(p,'entkommst','entkommt')} automatisch.`,'good'); ruleOnce('exo','Exorzisten werden von Untoten nie verfolgt: Sie entkommen ohne Würfeln.'); return; }
  const deep=m.c.tiefsee && !p.eq.some(i=>i.diver && usable(p,i)) ? -1 : 0;
  const mod=runBonus(p)+(m.c.run||0)+deep;
  const need=5-mod;
  const nebel=p.hand.find(c=>c.escape);
  if(p.human){
    const parts=[]; p.eq.forEach(i=>{ if(i.run && usable(p,i)) parts.push(`${i.n} +${i.run}`); if(isFlut() && i.flutRun && usable(p,i)) parts.push(`${i.n} bei Flut +${i.flutRun}`); }); if(isFlut()) parts.push('Flut +1'); if(p.sand) parts.push('Sand in der Badehose −2'); if(deep) parts.push('Tiefsee −1'); if(m.c.run) parts.push(`${m.c.n} ${sign(m.c.run)}`);
    const v=await ask(()=>({title:`Weglaufen vor ${m.c.n}${n>1?` (Monster ${i+1} von ${n})`:''}`, text: need<=1 ? 'Mit deinen Boni klappt die Flucht auf jeden Fall.' : need>6 ? 'Mit diesen Mali schaffst du es nur mit Hilfe von Karten.' : `Du brauchst eine ${need}${need<6?' oder mehr':''}. Grundwert 5${parts.length?', '+parts.join(', '):''}.`,
      hint:[`Misslingt es: ${m.c.badTxt}`, ...(n>1?['Bei mehreren Monstern läufst du vor jedem einzeln weg.']:[]), ...(nebel?[left>1?`Mit ${nebel.n} entkommst du sicher, und zwar vor allen ${left} übrigen Monstern.`:`Mit ${nebel.n} entkommst du sicher.`]:[])],
      opts:[{l:'Würfeln',v:'roll',kind:'primary'}, ...(nebel?[{l:`${nebel.n} einsetzen`,v:'nebel'}]:[])]}), 'run', {m, left});
    if(v==='nebel'){ take(p,nebel); discard(nebel); track('escape'); log(nebel.n==='Kompass' ? `Der Kompass zeigt dir den Weg: Du entkommst${left>1?' allen übrigen Monstern':''}!` : `Du verschwindest im Nebelpulver und entkommst${left>1?' allen übrigen Monstern':''}!`,'good'); return 'all'; }
  } else if(nebel && (severe(m.c.bad) || left>1)){ take(p,nebel); discard(nebel); log(nebel.n==='Kompass' ? `${p.name} folgt dem Kompass und entkommt${left>1?' allen übrigen Monstern':''}.` : `${p.name} verschwindet im Nebelpulver und entkommt${left>1?' allen übrigen Monstern':''}.`,'good'); return 'all'; }
  let roll=await rollDie(p), total=roll+mod;
  log(`${nm(p)} ${V(p,'würfelst','würfelt')} eine ${roll}${mod?` (${sign(mod)} = ${total})`:''}.`);
  if(total<5 && hasCls(p,'zauberer') && p.hand.length>=5-total && 5-total<=3){
    const k=5-total;
    if(p.human){
      const sel=await selectCards({ctx:'zauberer', title:'Zauberer: Fluchtzauber', text:`Wirf ${k} ${pl(k,'Karte','Karten')} ab, um den Wurf auf 5 zu bringen (je +1).`, min:k, max:k, optional:true, filter:(c,w)=>w==='hand', confirm:()=>'Abwerfen'});
      if(sel && sel.length){ sel.map(findCard).forEach(c=>{ take(p,c); discard(c); }); total+=k; log(`Du wirfst ${k} ${pl(k,'Karte','Karten')} ab: Der Wurf zählt jetzt ${total}.`); }
    } else if(severe(m.c.bad) || k===1){ const cs=p.hand.slice().sort((x,y)=>keepValue(p,x)-keepValue(p,y)).slice(0,k); cs.forEach(c=>{ take(p,c); discard(c); }); total+=k; log(`${p.name} wirft als Zauberer ${k} ${pl(k,'Karte','Karten')} ab: Der Wurf zählt ${total}.`); }
  }
  if(total>=5){ if(p.human) track('escape'); log(`${nm(p)} ${V(p,'entkommst','entkommt')}!`,'good'); fx('escape',{p}); }
  else { log(`Flucht misslungen: ${m.c.badTxt}`,'bad'); fx('hurt',{p}); applyBad(p,m.c.bad); render(); await sleep(spd(0.6)); }
}
async function rollDie(p){
  const final=1+rnd(6);
  if(HEADLESS) return final;
  const reduce=window.matchMedia && (matchMedia('(prefers-reduced-motion: reduce)').matches || UI.reduce);
  fx('dice',{p});
  if(!reduce){ for(let i=0;i<10;i++){ UI.roll={who:nm(p),face:1+rnd(6),rolling:true}; render(); await sleep(75); } }
  UI.roll={who:nm(p),face:final,rolling:false}; fx('diceland',{p,face:final}); render();
  await sleep(Math.max(500,spd(0.9)));
  return final;
}

/* ================= Flüche und Niederlagen ================= */
async function applyCurse(t,c,by){
  if(c.eff.t==='seegang'){ discard(c); seegang(); return; }
  const am=t.hand.find(x=>x.k==='amulet');
  if(am){
    let use=true;
    if(t.human){ const v=await ask(()=>({title:`Fluch: ${c.n}`, text:`${c.txt} Du hast ein Glücksamulett.`, hint:['Das Amulett hebt den Fluch auf. Danach ist es weg.'], opts:[{l:'Glücksamulett einsetzen',v:'yes',kind:'primary'},{l:'Fluch hinnehmen',v:'no'}]}), 'amulet', {c}); use=v==='yes'; }
    if(use){ take(t,am); discard(am); discard(c); log(`${nm(t)} ${V(t,'wehrst','wehrt')} den Fluch mit dem Glücksamulett ab.`,'good'); return; }
  }
  S.lastCursed=t.id;
  log(`Fluch „${c.n}“ trifft ${nmA(t)}: ${c.txt}`,'bad');
  if(t.human) stat('curses');
  fx('curse',{p:t});
  const was={chill:t.chill,spore:t.spore,sun:t.sun,sand:t.sand}, l0=t.lvl;
  applyBad(t,c.eff);
  fx('cursehit',{p:t,lost:t.lvl<l0});
  // Flüche, die über den Zug hinaus bleiben: merken, welche Karte sie gebracht hat (für die Anzeige am Spieler)
  t.curses=t.curses||{}; ['chill','spore','sun','sand'].forEach(k=>{ if(t[k] && t[k]!==was[k]) t.curses[k]=c.n; });
  discard(c);
  render();
}
function applyBad(p,eff){
  switch(eff.t){
    case 'lvl': { const b=p.lvl; p.lvl=Math.max(1,p.lvl-eff.n); if(p.human) stat('lvlLost',b-p.lvl); if(b===p.lvl){ log(`${nm(p)} ${V(p,'bist','ist')} schon auf Stufe 1. Tiefer geht es nicht.`); ruleOnce('min1','Unter Stufe 1 kann niemand fallen.'); } else log(`${nm(p)} ${V(p,'verlierst','verliert')} ${b-p.lvl} ${pl(b-p.lvl,'Stufe','Stufen')}: jetzt Stufe ${p.lvl}.`,'bad'); break; }
    case 'chill': { const C=S.combat;
      if(C && !C.resolved && (C.f===p.id || C.h===p.id)){ C.pB.push({l:`Kellerkälte (${nm(p)})`,v:-eff.n}); log(`Die Kellerkälte wirkt sofort: −${eff.n} in diesem Kampf.`,'bad'); }
      else { p.chill=eff.n; log(`${nm(p)} ${V(p,'frierst','friert')}: Im nächsten Kampf −${eff.n}.`,'bad'); }
      break; }
    case 'slot': if(eff.s==='hand'){ const it=p.eq.filter(i=>i.slot==='hand').sort((a,b)=>(b.b||0)-(a.b||0))[0]; if(it){ take(p,it); discard(it); log(`${nm(p)} ${V(p,'verlierst','verliert')} ${it.n}.`,'bad'); } else log(`${nm(p)} ${V(p,'hältst','hält')} nichts in der Hand. Glück gehabt!`); break; }
    { const it=p.eq.find(i=>i.slot===eff.s); if(it){ take(p,it); discard(it); log(`${nm(p)} ${V(p,'verlierst','verliert')} ${it.n}.`,'bad'); } else { log(`${nm(p)} ${V(p,'trägst','trägt')} keine ${SLOTN[eff.s]}. Glück gehabt!`); ruleOnce('nothing','Betrifft ein Fluch oder eine Niederlage etwas, das du nicht hast, passiert einfach nichts.'); } break; }
    case 'best': { const all=[...p.eq,...p.pack].sort((a,b)=>(b.b||0)-(a.b||0)||(b.g-a.g)); if(all.length){ take(p,all[0]); discard(all[0]); log(`${nm(p)} ${V(p,'verlierst','verliert')} ${all[0].n}.`,'bad'); } else log(`${nm(p)} ${V(p,'hast','hat')} keine Gegenstände zu verlieren.`); break; }
    case 'hand': { const n=Math.min(eff.n,p.hand.length), lost=[]; for(let i=0;i<n;i++){ const c=p.hand.splice(rnd(p.hand.length),1)[0]; lost.push(c); discard(c); }
      log(n ? `${nm(p)} ${V(p,'wirfst','wirft')} ${eff.n>=99?'die ganze Hand':n+' '+pl(n,'Handkarte','Handkarten')} ab: ${lost.map(c=>`<b>${cardLabel(c)}</b>`).join(', ')}.` : `${nm(p)} ${V(p,'hast','hat')} keine Handkarten.`,'bad');
      if(n) ruleOnce('discardpublic','Abgeworfene Karten liegen offen in der Ablage. Jeder darf sehen, was weg ist.');
      break; }
    case 'class': { if(p.cls){ log(`${nm(p)} ${V(p,'verlierst','verliert')} die Klasse ${p.cls.n}.`,'bad'); discard(p.cls); p.cls=null; } else { if(p.human && p.lvl>1) stat('lvlLost'); p.lvl=Math.max(1,p.lvl-1); log(`Keine Klasse da: ${nm(p)} ${V(p,'verlierst','verliert')} stattdessen 1 Stufe.`,'bad'); } break; }
    case 'race': { if(p.race){ log(`${nm(p)} ${V(p,'verlierst','verliert')} das Volk ${p.race.n} und ${V(p,'bist','ist')} wieder Mensch.`,'bad'); discard(p.race); p.race=null; } else log(`${nm(p)} ${V(p,'bist','ist')} sowieso Mensch. Nichts passiert.`); break; }
    case 'spore': { p.spore=Math.min(3,(p.spore||0)+eff.n);
      log(`${nm(p)} ${V(p,'hustest','hustet')} in einer Sporenwolke: −${p.spore} in jedem Kampf bis zum nächsten gewonnenen.`,'bad');
      ruleOnce('spore','Sporenwolke: Sie bleibt, bis man einen Kampf gewinnt. So lange gibt es in jedem Kampf −1 je Wolke, auch als Helfer.');
      break; }
    case 'sun': {
      if(hasShade(p)){ log(`Der Sonnenschirm schützt ${nmA(p)} vor dem Sonnenbrand.`,'good'); break; }
      if(p.sun){ log(`${nm(p)} ${V(p,'bist','ist')} schon krebsrot. Schlimmer geht es nicht.`); break; }
      p.sun=1; log(`${nm(p)} ${V(p,'bekommst','bekommt')} Sonnenbrand: −1 in jedem Kampf, und niemand hilft, bis zum nächsten gewonnenen Kampf.`,'bad');
      ruleOnce('sun','Sonnenbrand: −1 in jedem Kampf, und niemand hilft dir. Er bleibt, bis du einen Kampf gewinnst. Sonnencreme beseitigt ihn sofort, ein Sonnenschirm schützt davor.');
      break; }
    case 'sand': { if(!p.sand){ p.sand=1; log(`${nm(p)} ${V(p,'hast','hat')} Sand in der Badehose: Weglaufen −2, bis ${V(p,'du aufsteigst','er wieder aufsteigt')}.`,'bad'); } break; }
    case 'cheap': { const all=[...p.eq,...p.pack].sort((a,b)=>(a.g||0)-(b.g||0)); if(all.length){ take(p,all[0]); discard(all[0]); log(`Die Möwen klauen ${nmD(p)} ${all[0].n}.`,'bad'); } else log(`${nm(p)} ${V(p,'hast','hat')} nichts, was die Möwen interessiert.`); break; }
    case 'hands': { const its=p.eq.filter(i=>i.slot==='hand'); its.forEach(i=>{ take(p,i); discard(i); }); log(its.length ? `${nm(p)} ${V(p,'verlierst','verliert')} ${its.map(i=>i.n).join(' und ')}.` : `${nm(p)} ${V(p,'hältst','hält')} nichts in den Händen.`,'bad'); break; }
    case 'death': kill(p); break;
    case 'multi': eff.l.forEach(e=>applyBad(p,e)); break;
  }
}
function kill(p){
  log(`${nm(p)} ${V(p,'bist','ist')} tot!`,'bad');
  fx('death',{p});
  ruleOnce('death','Tod: Stufe, Volk und Klasse bleiben. Handkarten sind weg, von deinen Gegenständen nimmt sich jeder andere einen, der Rest wird abgelegt. Im nächsten Zug gibt es neue 4 + 4 Karten.');
  const loot=shuffle([...p.eq,...p.pack]); p.eq=[]; p.pack=[];
  if(p.human && p.hand.length) log(`Deine Handkarten kommen in die Ablage: ${p.hand.map(c=>`<b>${cardLabel(c)}</b>`).join(', ')}.`,'bad');
  p.hand.forEach(discard); p.hand=[];
  const others=S.players.filter(o=>o.id!==p.id).sort((a,b)=>b.lvl-a.lvl);
  for(const o of others){ if(!loot.length) break; const it=loot.pop(); o.hand.push(it); log(`${o.human?'Du nimmst dir':o.name+' nimmt sich'}: ${it.n}.`); }
  loot.forEach(discard);
  p.dead=true;
}

/* ================= Deine Kartenaktionen ================= */
function findCard(uid){
  if(!S) return null;
  const p=me();
  const pools=[p.hand,p.eq,p.pack];
  for(const a of pools){ const c=a.find(x=>x.uid===uid); if(c) return c; }
  if(p.race && p.race.uid===uid) return p.race;
  if(p.cls && p.cls.uid===uid) return p.cls;
  if(S.reveal && S.reveal.uid===uid) return S.reveal;
  if(UI.prompt && UI.prompt.data && UI.prompt.data.pool && (UI.prompt.ctx==='loot' || UI.prompt.data.draft)){ const c=UI.prompt.data.pool.find(x=>x.uid===uid); if(c) return c; }
  const o=ownerOf(uid); if(o) return o.c;
  if(S.combat){ for(const m of S.combat.mons){ if(m.c.uid===uid) return m.c; const e=m.enh.find(x=>x.uid===uid); if(e) return e; } }
  return null;
}
function ownerOf(uid){
  for(const q of S.players){ if(q.human) continue;
    let c=q.eq.find(x=>x.uid===uid); if(c) return {q,c,z:'eq'};
    c=q.pack.find(x=>x.uid===uid); if(c) return {q,c,z:'pack'};
    if(q.race && q.race.uid===uid) return {q,c:q.race,z:'rc'};
    if(q.cls && q.cls.uid===uid) return {q,c:q.cls,z:'rc'}; }
  return null;
}
function cardActions(c, where){
  const p=me(), C=S.combat, A=[];
  if(!UI.prompt || S.winner!=null || UI.sel) return [{info:'Warte, bis du wieder an der Reihe bist oder gefragt wirst.'}];
  const myTurn=S.cur===0, free=isFree();
  const live=C && !C.resolved;
  const inMine=live && (C.f===0 || C.h===0);
  const sellAct = () => { if(free && sellable(p,c)) A.push(sellBlock(p) ? {l:'Verkaufen', fn:()=>{}, dis:sellBlock(p)} : {l:`Verkaufen (${fmt(goldOf(p,c))} Gold)`, fn:()=>startSell(c.uid)}); };
  if(where==='hand'){
    switch(c.k){
      case 'item': {
        if(free){ const ce=canEquip(p,c), cs=canStash(p,c); A.push({l:'Ausrüsten', fn:()=>doEquip(c), dis: ce.ok?false:ce.why}); A.push({l:'In den Rucksack legen', fn:()=>stashItem(c), dis: cs.ok?false:cs.why}); }
        else if(myTurn && C) A.push({info:'Im Kampf darfst du keine Gegenstände anlegen.'});
        else A.push({info:'Gegenstände legst du nur im eigenen Zug außerhalb von Kämpfen an.'});
        sellAct(); break;
      }
      case 'race': case 'class': {
        if(myTurn) A.push({l:`Ausspielen${(c.k==='race'?p.race:p.cls)?' (ersetzt '+(c.k==='race'?p.race.n:p.cls.n)+')':''}`, fn:()=>playRC(c)});
        else A.push({info:'Völker und Klassen spielst du im eigenen Zug aus.'}); break;
      }
      case 'oneshot': {
        if(c.cream && p.sun && !C) A.push({l:'Eincremen: Sonnenbrand weg', fn:()=>useCream(p,c), kind:'primary'});
        if(c.speise && !C){ const cp=canPfanne(p); A.push({l:'Pilzpfanne kochen: +1 Stufe', fn:()=>doPfanne(p), kind: cp.ok?'primary':'', dis: !free ? 'Die Pilzpfanne kochst du in deinem Zug außerhalb von Kämpfen.' : cp.ok ? false : cp.why}); }
        if(live && c.b){
          const vp=osP(c,C);
          if(inMine) A.push({l:`Für unsere Seite (+${vp})`, fn:()=>playOneShot(c,'p'), kind:'primary'});
          else A.push({l:`Für ${P(C.f).name} (+${vp})`, fn:()=>playOneShot(c,'p'), kind: c.pOnly?'primary':''});
          if(!c.pOnly) A.push({l:`Für das Monster (+${c.b})`, fn:()=>playOneShot(c,'m'), kind: inMine?'':'primary'});
        } else if(c.escape) A.push({info:`${c.n} bietet dir das Spiel beim Weglaufen an.`});
        else if(c.map){ const cd=canDig(p); A.push({l:'Schatz ausgraben: 3 Schätze', fn:()=>doDig(p), kind: cd.ok?'primary':'', dis: C ? 'Den Schatz gräbst du außerhalb von Kämpfen aus.' : cd.ok ? false : cd.why}); }
        else A.push({info:'Einmal-Gegenstände spielst du während eines Kampfes, auch in fremden.'});
        sellAct(); break;
      }
      case 'enh': {
        if(live) C.mons.forEach(m=>A.push({l:`Auf ${m.c.n} spielen (${sign(c.v)})`, fn:()=>playEnh(c,m), kind:'primary'}));
        else A.push({info:'Launen spielst du während eines Kampfes auf ein Monster, in jedem Kampf.'});
        sellAct(); break;
      }
      case 'wander': {
        const ms=p.hand.filter(x=>x.k==='monster');
        if(live && !inMine){ ms.forEach(m=>A.push({l:`Mit ${m.n} (Stufe ${m.lvl}) dazuschicken`, fn:()=>playWander(c,m), kind:'primary'})); if(!ms.length) A.push({info:'Dafür brauchst du zusätzlich ein Monster auf der Hand.'}); }
        else A.push({info:'Spiele diese Karte im Kampf eines Mitspielers, zusammen mit einem Monster von deiner Hand.'});
        break;
      }
      case 'monster': A.push({info: myTurn && S.phase===2 && !C ? 'Zieh das Monster aufs Spielfeld oder tippe unten auf „Monster herausfordern“.' : 'Monster von der Hand spielst du bei „Monster herausfordern“ oder mit „Hinterhalt“ in fremde Kämpfe.'}); break;
      case 'curse': {
        if(c.eff.t==='seegang'){ A.push({l:'Seegang auslösen: alle geben 1 Karte weiter', fn:()=>playSeegang(c), kind:'primary'}); break; }
        S.players.filter(x=>!x.human).forEach(t=>A.push({l:`Auf ${t.name} spielen`, fn:()=>playCurseOn(c,t)}));
        A.push({info:'Flüche von der Hand gehen jederzeit, auf jeden.'}); sellAct(); break;
      }
      case 'levelup': A.push({l:'Benutzen: +1 Stufe', fn:()=>useLevelUp(c), kind:'primary', dis: !free ? 'Stufenkarten spielst du im eigenen Zug außerhalb von Kämpfen.' : p.lvl>=WINLVL()-1 ? `Stufe ${WINLVL()} gibt es nur für einen Monstersieg.` : false}); break;
      case 'amulet': A.push({info:'Das Spiel fragt dich automatisch, wenn dich ein Fluch trifft.'}); break;
    }
  } else if(where==='eq'){
    if(free){ const full=p.pack.length>=packLimit(p); A.push({l:'In den Rucksack legen', fn:()=>{ take(p,c); p.pack.push(c); log(`${c.n} kommt in den Rucksack.`); }, dis: full ? `Dein Rucksack ist voll: höchstens ${packLimit(p)} Gegenstände.` : false}); sellAct(); }
    else A.push({info:'Ausrüstung änderst du nur im eigenen Zug außerhalb von Kämpfen.'});
  } else if(where==='pack'){
    if(free){ const ce=canEquip(p,c); A.push({l:'Anlegen', fn:()=>doEquip(c), dis: ce.ok?false:ce.why, kind:'primary'}); sellAct(); }
    else A.push({info:'Aus dem Rucksack holst du Dinge nur im eigenen Zug außerhalb von Kämpfen.'});
  } else if(where==='race' || where==='cls'){
    A.push({l:'Ablegen', fn:()=>{ if(where==='race'){ discard(p.race); p.race=null; } else { discard(p.cls); p.cls=null; } log(`Du legst ${c.n} ab.`); ruleOnce('droprc','Völker und Klassen kannst du jederzeit ablegen. Gegenstände, die sie voraussetzen, werden dann inaktiv.'); }});
  }
  return A;
}
function doEquip(c){
  const p=me(); const ce=canEquip(p,c); if(!ce.ok){ log(ce.why,'sys'); return; }
  const moved=equip(p,c);
  const inPack=moved.filter(m=>p.pack.includes(m)), toHand=moved.filter(m=>p.hand.includes(m));
  log(`Du rüstest ${c.n} aus.${inPack.length?` ${names(inPack)} ${pl(inPack.length,'kommt','kommen')} in den Rucksack.`:''}${toHand.length?` Der Rucksack ist voll: ${names(toHand)} ${pl(toHand.length,'kommt','kommen')} auf die Hand.`:''}`);
  if(moved.length) ruleOnce('pack',`Was du nicht gleichzeitig nutzen kannst, kommt in den Rucksack (höchstens ${packLimit(p)} Gegenstände). Dort zählt es nicht zu den Handkarten, bringt aber auch keinen Bonus.`);
  if(c.big) ruleOnce('big','Sperrige Gegenstände: Davon darfst du nur einen haben, außer du bist Zwerg.');
}
function playRC(c){
  const p=me(); take(p,c); if(S.combat) stat('played');
  if(c.k==='race'){ if(p.race){ discard(p.race); } p.race=c; } else { if(p.cls){ discard(p.cls); } p.cls=c; }
  log(`Du bist jetzt ${c.n}: ${c.txt}`,'good');
  ruleOnce('onerc','Du hast höchstens 1 Volk und 1 Klasse. Eine neue Karte ersetzt die alte.');
}
function markIntf(){ const C=S.combat; if(C && C.f!==0){ C.hchg=true; } fx('play',{}); }
// Sonnencreme außerhalb von Kämpfen: nur den Sonnenbrand loswerden
function useCream(p,c){ if(!p.sun) return; take(p,c); discard(c); p.sun=0; if(p.human){ stat('played'); track('oneshot'); } log(`${nm(p)} ${V(p,'cremst dich','cremt sich')} mit ${c.n} ein. Der Sonnenbrand ist weg.`,'good'); render(); }
function playOneShot(c,side){
  const p=me(), C=S.combat; take(p,c); C.used.push(c); stat('played'); stat('os'); track('oneshot'); if(C.f!==0 && C.h!==0) track('intf');
  if(c.cream && side==='p' && p.sun && (C.f===0 || C.h===0)){ p.sun=0; log('Die Sonnencreme kühlt: Dein Sonnenbrand ist weg.','good'); }
  if(side==='p'){ const v=osP(c,C); C.pB.push({l:`${c.n} (von dir)`,v}); log(`Du setzt ${c.n} für ${C.f===0||C.h===0?'eure Seite':P(C.f).name} ein (+${v}).`,'good'); }
  else { C.mB.push({l:`${c.n} (von dir)`,v:c.b,by:0}); log(`Du setzt ${c.n} für das Monster ein (+${c.b}).`); if(C.f!==0 && C.h!==0) C.asked[0]=true; }
  markIntf();
}
function playEnh(c,m){
  const p=me(), C=S.combat; take(p,c); m.enh.push(c); if(C.played) C.played[c.uid]=0; stat('played'); if(C.f!==0 && C.h!==0) track('intf');
  log(`Du spielst „${c.n}“ (${sign(c.v)}) auf ${m.c.n}.`);
  ruleOnce('enh','Launen darf jeder in jeden Kampf spielen. Sie verändern auch die Zahl der Schätze.');
  if(C.f!==0 && C.h!==0 && c.v>0) C.asked[0]=true;
  markIntf();
}
function playWander(w,m){
  const p=me(), C=S.combat; take(p,w); take(p,m); discard(w); C.mons.push({c:m,enh:[]}); stat('played'); track('intf');
  log(`Du spielst „Hinterhalt“: <b>${m.n}</b> (Stufe ${m.lvl}) mischt mit!`);
  ruleOnce('wander','Bei mehreren Monstern zählen alle zusammen. Bei einer Niederlage wird vor jedem einzeln weggelaufen.');
  C.asked[0]=true; markIntf();
}
function playSeegang(c){ const p=me(); take(p,c); discard(c); stat('played'); log('Du löst Seegang aus.'); seegang(); }
function playCurseOn(c,t){
  const p=me(); take(p,c); track('curse');
  log(`Du spielst den Fluch „${c.n}“ auf ${t.name}.`);
  ruleOnce('cursehand','Flüche von der Hand darf man jederzeit auf jeden Spieler spielen.');
  if(S.combat && !S.combat.resolved) { markIntf(); if(S.combat.f===t.id) S.combat.asked[0]=true; }
  applyCurse(t,c,p).catch(e=>{ if(e!==STALE) console.error(e); });
}
function useLevelUp(c){
  const p=me(); if(p.lvl>=WINLVL()-1 || !isFree()) return; take(p,c); discard(c); p.lvl++;
  log(`Du spielst „${c.n}“: Stufe ${p.lvl}.`,'good');
  ruleOnce('levelup',`Stufenkarten spielt man im eigenen Zug außerhalb von Kämpfen, aber nie für die Siegstufe ${WINLVL()}.`);
}
// Auf der vorletzten Stufe bringt Verkaufen nichts mehr: Die Siegstufe gibt es nur für einen Monstersieg
const sellBlock = p => p.lvl>=WINLVL()-1 ? `Auf Stufe ${WINLVL()-1} bringt Verkaufen nichts mehr. Stufe ${WINLVL()} gibt es nur für einen Sieg über ein Monster.` : '';
async function startSell(pre){
  const p=me(); if(!isFree()) return;
  if(sellBlock(p)){ if(typeof toast==='function') toast(sellBlock(p)); return; }
  try{
    const sel=await selectCards({ctx:'sell', title:'Gegenstände verkaufen', text:'Wähle, was du verkaufen willst. Je 1.000 Gold gibt es 1 Stufe, der Rest kommt in deinen Goldbeutel.', min:1, max:99, pre: Array.isArray(pre)?pre:(pre?[pre]:[]), cancel:true,
      filter:(c,w)=> sellable(p,c) && ['hand','eq','pack'].includes(w) && (typeof tutSellOk!=='function' || tutSellOk(c)),
      extra:cs=>{ const v=sellValue(p,cs), lv=Math.min(v.lv,WINLVL()-1-p.lvl), rest=v.sum-lv*1000; return `Summe: <b>${fmt(v.sum)} Gold</b>${v.purse?` (davon ${fmt(v.purse)} aus dem Goldbeutel)`:''}${v.bonus?' · Kobold: +200 Gold':''} · ergibt <b>${lv} ${pl(lv,'Stufe','Stufen')}</b>${rest>0&&cs.length?` · ${fmt(rest)} Gold bleiben im Beutel`:''}`; },
      validate:cs=>null,
      confirm:()=>'Verkaufen'});
    if(!sel || !sel.length) return;
    const cs=sel.map(findCard).filter(Boolean); if(!cs.length) return;
    const {v,lv}=doSell(p,cs); track('gold', v.raw+v.bonus);
    log(`Du verkaufst ${cs.map(c=>c.n).join(', ')} für ${fmt(v.raw+v.bonus)} Gold${v.bonus?' (als Kobold mit 200 Gold Aufschlag)':''}${lv?`: Stufe ${p.lvl}`:''}.${p.gold?` Im Goldbeutel: ${fmt(p.gold)} Gold.`:''}`,'good');
    if(v.bonus) ruleOnce('halbsell','Kobold: Einmal pro Zug bringt ein Verkauf 200 Gold extra.');
    ruleOnce('sell','Verkaufen: Je 1.000 Gold gibt es 1 Stufe. Was übrig bleibt, kommt in den Goldbeutel und zählt beim nächsten Verkauf mit.');
  }catch(e){ if(e!==STALE) throw e; }
}


/* ================= Zug-Empfehlung ================= */
function zoneOf(uid){ const p=me(); if(p.hand.some(c=>c.uid===uid)) return 'hand'; if(p.pack.some(c=>c.uid===uid)) return 'pack'; if(p.eq.some(c=>c.uid===uid)) return 'eq'; return null; }
function cheapest(p,n){ return p.hand.slice().sort((a,b)=>keepValue(p,a)-keepValue(p,b)).slice(0,n); }
const names = cs => cs.map(c=>c.n).join(', ');
function dblWhy(v){ return (v.bonus ? ' Als Kobold feilschst du einmal pro Zug 200 Gold heraus.' : '') + (v.purse ? ` Aus dem Goldbeutel kommen ${fmt(v.purse)} Gold dazu.` : ''); }
function chooseSell(p,cands){
  const maxLv=WINLVL()-1-p.lvl, target=Math.min(Math.floor(sellValue(p,cands).sum/1000),maxLv);
  if(target<1) return [];
  const pick=[]; for(const c of cands.slice().sort((a,b)=>goldOf(p,b)-goldOf(p,a))){ pick.push(c); if(sellValue(p,pick).sum>=target*1000) break; }
  for(const c of pick.slice().sort((a,b)=>goldOf(p,a)-goldOf(p,b))){ const rest=pick.filter(x=>x!==c); if(rest.length && sellValue(p,rest).sum>=target*1000) pick.splice(pick.indexOf(c),1); }
  return pick;
}
function bestRC(p,kind){
  const cards=p.hand.filter(c=>c.k===kind); if(!cards.length) return null;
  const items=[...p.hand,...p.pack,...p.eq].filter(c=>c.k==='item' && c.req);
  const score=c=>items.filter(i=>kind==='race'?i.req.race===c.r:i.req.cls===c.c).reduce((s,i)=>s+i.b,0)+((kind==='race'&&c.r==='elf')||(kind==='class'&&c.c==='krieger')?0.5:(kind==='class'&&c.c==='pirat')?0.4:0);
  return cards.sort((a,b)=>score(b)-score(a))[0];
}
function gainWhy(p,it){
  const q=Object.assign({},p,{eq:[...p.eq],pack:[...p.pack],hand:[...p.hand]});
  const b0=power(q), r0=runBonus(q), moved=equip(q,it), b1=power(q), r1=runBonus(q), parts=[];
  if(b1!==b0) parts.push(`Kampfstärke ${b0} → ${b1}`);
  if(r1!==r0) parts.push(`Weglaufen ${sign(r0)} → ${sign(r1)}`);
  return parts.join(', ')+'.'+(moved.length?` ${names(moved)} ${pl(moved.length,'wandert','wandern')} in den Rucksack.`:'')+' Nur ausgerüstete Gegenstände zählen im Kampf.';
}
function curseTargetAdv(p,c,charity){
  const ts=S.players.filter(o=>!o.human && !o.dead && curseHits(o,c)).sort((a,b)=>b.lvl-a.lvl || power(b)-power(a));
  if(!ts.length) return null;
  const t=ts[0];
  return charity || t.lvl>=p.lvl+2 || t.lvl>=WINLVL()-2 ? t : null;
}
const t_sunLoss = f => f.sun || hasShade(f) ? 0 : 2;
function curseLoss(f,c){
  const e=c.eff;
  if(e.t==='chill') return 2;
  if(e.t==='spore') return 2;
  if(e.t==='sun') return t_sunLoss(f);
  if(e.t==='sand') return 1;
  if(e.t==='seegang') return 0;
  if(e.t==='slot' && e.s==='hand'){ const it=f.eq.filter(i=>i.slot==='hand' && usable(f,i)).sort((a,b)=>(b.b||0)-(a.b||0))[0]; return it ? (it.b||0) : 0; }
  if(e.t==='slot'){ const it=f.eq.find(i=>i.slot===e.s); return it && usable(f,it) ? (it.b||0) : 0; }
  if(e.t==='lvl') return Math.min(e.n, f.lvl-1);
  if(e.t==='class'){ if(!f.cls) return f.lvl>1?1:0; return f.eq.filter(i=>i.req && i.req.cls===f.cls.c).reduce((s,i)=>s+i.b,0); }
  if(e.t==='race'){ if(!f.race) return 0; return f.eq.filter(i=>i.req && i.req.race===f.race.r).reduce((s,i)=>s+i.b,0); }
  return 0;
}
function adviseFree(p,charity){
  if(canPfanne(p).ok){ const c=pfanneSet(p)[0]; return {uid:c.uid, act:'Pilzpfanne kochen', text:'Koch eine Pilzpfanne.', why:'Deine Speisepilze zusammen bringen dir sofort 1 Stufe. Einzeln im Kampf wären sie je nur +2 wert.'}; }
  const r=bestRC(p,'race');
  if(r && !p.race) return {uid:r.uid, act:'Ausspielen', text:`Spiel das Volk ${r.n} aus.`, why:`Ohne Volk bist du Mensch ohne Fähigkeit. ${r.n}: ${r.txt}`};
  const k=bestRC(p,'class');
  if(k && !p.cls) return {uid:k.uid, act:'Ausspielen', text:`Spiel die Klasse ${k.n} aus.`, why:`${k.n}: ${k.txt}`};
  for(const kind of ['race','class']){
    const cur=kind==='race'?p.race:p.cls; if(!cur) continue;
    const inactive=[...p.eq,...p.pack].filter(i=>i.k==='item' && i.req && !usable(p,i));
    for(const card of p.hand.filter(c=>c.k===kind)){
      const on=inactive.filter(i=>kind==='race'?i.req.race===card.r:i.req.cls===card.c);
      const off=p.eq.filter(i=>i.req && usable(p,i) && (kind==='race'?i.req.race===cur.r:i.req.cls===cur.c));
      if(on.reduce((s,i)=>s+i.b,0)-off.reduce((s,i)=>s+i.b,0)>=2) return {uid:card.uid, act:'Ausspielen', text:`Wechsle zu ${card.n}.`, why:`Damit ${pl(on.length,'wird','werden')} ${names(on)} aktiv.`};
    }
  }
  const items=[...p.hand.filter(c=>c.k==='item'),...p.pack].map(c=>({c,g:gainOf(p,c)})).filter(x=>x.g>0).sort((a,b)=>b.g-a.g);
  if(items.length){ const it=items[0].c; return {uid:it.uid, act:p.pack.includes(it)?'Anlegen':'Ausrüsten', text:`Rüste ${it.n} aus.`, why:gainWhy(p,it)}; }
  const lu=p.hand.find(c=>c.k==='levelup');
  if(lu && p.lvl<WINLVL()-1) return {uid:lu.uid, act:'Benutzen', text:`Benutze „${lu.n}“.`, why:'Eine Stufe mehr heißt +1 Kampfstärke und ein Schritt zum Sieg. Aufheben bringt fast nie etwas.'};
  if(p.lvl<WINLVL()-1){
    const pick=chooseSell(p,[...p.pack,...p.hand.filter(c=>c.k==='item' && gainOf(p,c)<=0)]);
    if(pick.length){ const v=sellValue(p,pick), lv=Math.min(v.lv,WINLVL()-1-p.lvl);
      return {sell:true, picks:pick.map(c=>c.uid), text:`Verkaufe ${names(pick)}.`, why:`${pl(pick.length,'Den','Die')} nutzt du gerade nicht.${dblWhy(v)} Zusammen ${fmt(v.sum)} Gold ergeben ${lv} ${pl(lv,'Stufe','Stufen')}.`}; }
  }
  if(charity){ const st=stashable(p)[0]; if(st) return {uid:st.uid, act:'In den Rucksack legen', text:`Leg ${st.n} in den Rucksack.`, why:'Im Rucksack zählt er nicht mehr als Handkarte. So musst du weniger abgeben, und verkaufen kannst du ihn später trotzdem.'}; }
  for(const c of p.hand.filter(c=>c.k==='curse')){
    const t=curseTargetAdv(p,c,charity);
    if(t) return {uid:c.uid, act:`Auf ${t.name}`, text:`Spiel den Fluch „${c.n}“ auf ${t.name}.`, why: charity ? `Du musst ohnehin Karten loswerden. Besser ein Fluch auf ${t.name} (Stufe ${t.lvl}) als ein Geschenk.` : `${t.name} liegt mit Stufe ${t.lvl} vorn. Den Führenden zu bremsen ist die beste Verwendung für Flüche.`};
  }
  return null;
}
function adviseTrouble(p){
  const os=p.hand.filter(c=>c.k==='oneshot' && c.b).reduce((s,c)=>s+c.b,0);
  const ms=p.hand.filter(c=>c.k==='monster').map(m=>({m, lv:m.lvl+(m.vs && hasRace(p,m.vs.race)?m.vs.val:0)}))
    .filter(x=>{ const buf=power(p)+os-x.lv, win=p.lvl+(x.m.up||1)>=WINLVL(); return power(p)>x.lv && buf>=(win?7:4); })
    .sort((a,b)=>b.m.lvl-a.m.lvl);
  if(ms.length){ const x=ms[0], win=p.lvl+(x.m.up||1)>=WINLVL();
    return {opt:'m'+x.m.uid, text:`Kämpfe gegen ${x.m.n}.`, why:`Kampfstärke ${power(p)} gegen ${x.lv}${os?`, dazu +${os} aus Einmal-Gegenständen als Reserve`:''}. Genug Puffer, falls jemand eingreift. Bringt ${x.m.tr} ${pl(x.m.tr,'Schatz','Schätze')} und eine Stufe.${win?' Das wäre der Sieg, rechne mit Gegenwehr.':''}`}; }
  return {opt:'loot', text:'Durchsuche den Raum.', why: p.hand.some(c=>c.k==='monster') ? 'Keins deiner Hand-Monster schlägst du mit genug Puffer. Durchsuchen bringt eine Karte ohne Risiko.' : 'Du hast kein Monster auf der Hand. Durchsuchen bringt eine Karte ohne Risiko.'};
}
function bestHelper(C){
  const f=P(C.f); if(f.lvl+levelsGained(C)>=WINLVL()) return null;
  if(noHelpMon(C)) return null;
  return S.players.filter(x=>!x.human && !x.dead && x.id!==C.f && !C.asked[x.id] && wouldWinWith(C,x))
    .sort((a,b)=>a.lvl-b.lvl || power(b)-power(a))[0] || null;
}
function adviseFight(p,C){
  const r=evalCombat(C);
  if(r.win){ const m=r.a-r.b; return {opt:'done', text:'Sag „Fertig“.', why: m>=3 ? `Du liegst ${m} vorn. Halte Einmal-Gegenstände zurück, bis jemand eingreift.` : 'Knapp vorn. Greift jemand ein, darfst du danach noch reagieren. Vorher Karten zu verbrauchen wäre Verschwendung.'}; }
  const need=r.b-r.a+(r.tieWin?0:1);
  const res=[];
  p.hand.forEach(c=>{
    if(c.k==='oneshot' && c.b) res.push({c,v:osP(c,C),act:'Für unsere Seite',lbl:`${c.n} (+${osP(c,C)})`});
    if(c.k==='enh' && c.v<0) res.push({c,v:-c.v,act:'Auf ',lbl:`„${c.n}“ (${sign(c.v)}) auf das Monster`});
  });
  const spare=p.hand.length-res.length;
  if(hasCls(p,'zauberer') && C.f===0 && !C.counter && spare>=2){ const ts=counterTargets(C).sort((a,b)=>b.v-a.v);
    if(ts.length && ts[0].v>=need) return {opt:'counter', text:'Wirk deinen Gegenzauber.', why:`${ts[0].l} kostet dich ${ts[0].v}. Der Gegenzauber hebt es auf, dafür gehen nur 2 unwichtige Karten weg.`}; }
  const resSum=res.reduce((s,x)=>s+x.v,0);
  if(resSum>=need){
    res.sort((a,b)=>a.v-b.v);
    const one=res.find(x=>x.v>=need);
    if(one) return {uid:one.c.uid, act:one.act, text:`Spiel ${one.lbl}.`, why:`Dir ${pl(need,'fehlt','fehlen')} ${need}. Das ist die kleinste Karte, die reicht.`};
    const big=res[res.length-1];
    return {uid:big.c.uid, act:big.act, text:`Spiel ${big.lbl}.`, why:`Dir ${pl(need,'fehlt','fehlen')} ${need}. Allein reicht keine Karte, zusammen schon. Fang mit der stärksten an.`};
  }
  if(C.h==null){
    const b=bestHelper(C);
    if(b) return {opt:'help', text:`Bitte ${b.name} um Hilfe.`, why:`Mit ${b.name} (Kampfstärke ${power(b)}) stündet ihr bei ${r.a+power(b)} gegen ${r.b}.${hasCls(p,'krieger')?' Dein Krieger-Bonus von +3 fällt mit Helfer weg, ist schon eingerechnet.':''}`};
  }
  const won=p.lvl+levelsGained(C)>=WINLVL() && C.h==null;
  return {opt:'run', text:'Gib auf und lauf weg.', why:`Dir ${pl(need,'fehlt','fehlen')} ${need}, und mit deinen Karten ist das nicht zu schaffen.${won?' Hilfe bekommst du nicht, weil du damit gewinnen würdest.':''} Heb deine Karten für später auf.`};
}
function adviseBotHelp(p,C,d){
  const b=d.b, after=Math.min(10,b.lvl+levelsGained(C));
  if(after>=WINLVL()-1 && after>p.lvl) return {opt:'no', text:'Lehne ab.', why:`${b.name} käme auf Stufe ${after}. So nah am Sieg hilft man niemandem.`};
  if(b.lvl>=p.lvl+2) return {opt:'no', text:'Lehne ab.', why:`${b.name} liegt schon ${b.lvl-p.lvl} Stufen vor dir. Hilf lieber nicht beim Davonziehen.`};
  if(d.offer===0) return {opt:'no', text:'Lehne ab.', why:'Ohne Belohnung hast du nichts davon.'};
  const risky=C.mons.some(m=>severe(m.c.bad));
  return {opt:'yes', text:'Hilf mit.', why:`Du bekommst ${d.offer} ${pl(d.offer,'Schatz','Schätze')}, und ${b.name} zieht nicht davon.${risky?' Kleines Risiko: Greift jemand ein und ihr verliert, musst du auch weglaufen.':''}`};
}
function adviseInterfere(p,C){
  const f=P(C.f), r=evalCombat(C);
  if(C.h===0){
    if(!r.win){ const need=r.b-r.a+(r.tieWin?0:1), os=p.hand.filter(c=>c.k==='oneshot' && c.b).sort((a,b)=>osP(a,C)-osP(b,C)), pick=os.find(c=>osP(c,C)>=need)||os[os.length-1];
      if(pick) return {uid:pick.uid, act:'Für unsere Seite', text:`Spiel ${pick.n} für eure Seite.`, why:`Ihr liegt ${need} zurück. Verliert ihr, musst du auch weglaufen und bekommst keine Schätze.`}; }
    return {opt:'ok', text:'Weiter.', why: r.win ? 'Ihr gewinnt bereits. Spar dir deine Karten.' : 'Du hast nichts, was hilft.'};
  }
  if(!r.win) return {opt:'ok', text:'Nicht eingreifen.', why:`${f.name} verliert sowieso.`};
  const threat=f.lvl+levelsGained(C)>=WINLVL();
  const maxO=Math.max(...S.players.filter(x=>x.id!==f.id).map(x=>x.lvl));
  const leading=f.lvl>=maxO && f.lvl>=p.lvl+1;
  if(!threat && !leading) return {opt:'ok', text:'Nicht eingreifen.', why:`${f.name} liegt nicht vorn. Eingreifen kostet Karten, die du später gegen den Führenden brauchst.`};
  const need=r.a-r.b+(r.tieWin?1:0), opts=[];
  p.hand.forEach(c=>{
    if(c.k==='enh' && c.v>0) opts.push({c,v:c.v,act:'Auf ',lbl:`„${c.n}“ (${sign(c.v)}) auf das Monster`});
    if(c.k==='oneshot' && osM(c)) opts.push({c,v:osM(c),act:'Für das Monster',lbl:`${c.n} für das Monster (+${osM(c)})`});
    if(c.k==='curse'){ const l=curseLoss(f,c); if(l>0) opts.push({c,v:l,act:`Auf ${f.name}`,lbl:`den Fluch „${c.n}“ auf ${f.name} (−${l})`}); }
  });
  const w=p.hand.find(c=>c.k==='wander'), wm=p.hand.filter(c=>c.k==='monster').sort((a,b)=>b.lvl-a.lvl)[0];
  if(w && wm) opts.push({c:w,v:wm.lvl,act:'Mit '+wm.n,lbl:`„Hinterhalt“ mit ${wm.n} (+${wm.lvl})`});
  const why0 = threat ? `Gewinnt ${f.name} diesen Kampf, ist das Spiel vorbei!` : `${f.name} liegt mit Stufe ${f.lvl} vorn.`;
  if(!opts.length) return {opt:'ok', text:'Nicht eingreifen.', why:`${why0} Du hast aber nichts Passendes auf der Hand.`};
  opts.sort((a,b)=>a.v-b.v);
  let pick=opts.find(o=>o.v>=need), why;
  if(pick) why=`${why0} ${f.name} liegt ${need} vorn, damit dreht sich der Kampf.`;
  else { if(!threat) return {opt:'ok', text:'Nicht eingreifen.', why:`${why0} Allein dreht keine deiner Karten den Kampf (${f.name} liegt ${need} vorn). Spar sie dir.`};
    pick=opts[opts.length-1]; why=`${why0} Allein reicht es nicht, aber vielleicht ziehen die anderen mit.`; }
  return {uid:pick.c.uid, act:pick.act, text:`Spiel ${pick.lbl}.`, why};
}
function adviseRun(p,d){
  const m=d.m, need=5-(runBonus(p)+(m.c.run||0)), ch=Math.max(0,Math.min(6,7-need))/6, pc=Math.round(ch*100);
  const nebel=p.hand.find(c=>c.escape), left=d.left||1;
  if(nebel && left>1 && ch<1) return {opt:'nebel', text:`Setz ${nebel.n==='Kompass'?'den Kompass':'das Nebelpulver'} ein.`, why:`Es bringt dich vor allen ${left} übrigen Monstern in Sicherheit. Sonst musst du ${left}-mal würfeln.`};
  if(nebel && (severe(m.c.bad) || ch<=1/3)) return {opt:'nebel', text:`Setz ${nebel.n==='Kompass'?'den Kompass':'das Nebelpulver'} ein.`, why:`Ohne liegt deine Chance bei ${pc} %, und es droht: ${m.c.badTxt}`};
  return {opt:'roll', text:'Würfle.', why:`Deine Chance: ${pc} %.${nebel?` ${nebel.n==='Kompass'?'Den Kompass':'Das Nebelpulver'} hebst du für Schlimmeres auf.`:''}`};
}
function adviseSel(p){
  const s=UI.sel;
  switch(s.ctx){
    case 'charity': { const cs=cheapest(p,s.min); return {picks:cs.map(c=>c.uid), text:`Gib ${names(cs)} ab.`, why:'Diese Karten sind für dich am wenigsten wert.'}; }
    case 'sell': {
      const pick=chooseSell(p,[...p.pack,...p.hand.filter(c=>c.k==='item' && gainOf(p,c)<=0)]);
      if(!pick.length) return {text:'Lieber nichts verkaufen.', why:'Deine ungenutzten Gegenstände bringen zusammen mit dem Goldbeutel keine 1.000 Gold. Ausgerüstetes zu verkaufen schwächt dich meist mehr, als die Stufe bringt.'};
      return {picks:pick.map(c=>c.uid), text:`Verkaufe ${names(pick)}.`, why:`Die trägst du nicht oder sie bringen dir nichts.${dblWhy(sellValue(p,pick))}`}; }
    case 'counter': case 'zauberer': { const cs=cheapest(p,s.min); return {picks:cs.map(c=>c.uid), text:`Wirf ${names(cs)} ab.`, why:`${pl(cs.length,'Diese Karte ist','Diese Karten sind')} für dich am wenigsten wert.`}; }
  }
  return null;
}
function advise(){
  if(!S || S.winner!=null) return null;
  const p=me(); if(!p.human) return null;
  if(UI.sel) return adviseSel(p);
  if(!UI.prompt) return null;
  const pr=UI.prompt, C=S.combat, d=pr.data||{};
  switch(pr.ctx){
    case 'kick': return adviseFree(p,false) || {opt:'kick', text:'Öffne die Tür.', why:`Alles Sinnvolle ist ausgelegt. Deine Kampfstärke: ${power(p)}.`};
    case 'trouble': return adviseFree(p,false) || adviseTrouble(p);
    case 'charity': {
      const over=p.hand.length-handLimit(p), f=adviseFree(p,over>0); if(f) return f;
      if(over>0){ const cs=cheapest(p,over), t=charityTargets(p);
        return {opt:'give', picks:cs.map(c=>c.uid), text:`Gib ${over} ${pl(over,'Karte','Karten')} ab: ${names(cs)}.`, why:`Mehr lässt sich nicht sinnvoll ausspielen. ${t?`Die Karten bekommt ${t.map(x=>x.name).join(' und ')}.`:'Du legst sie ab, weil du selbst (mit) die niedrigste Stufe hast.'}`}; }
      return {opt:'end', text:'Beende deinen Zug.', why:'Es gibt nichts mehr, was sich lohnt.'};
    }
    case 'fight': return adviseFight(p,C);
    case 'helpWho': { const b=bestHelper(C); return b ? {opt:b.id, text:`Frag ${b.name}.`, why:`Mit ${b.name} gewinnt ihr.`} : {opt:'x', text:'Abbrechen.', why:'Keiner der übrigen Mitspieler würde den Kampf drehen.'}; }
    case 'helpOffer': { const total=treasuresOf(C), n=Math.min(total,Math.max(1,Math.ceil(total/2)));
      return {opt:n, text:`Biete ${n} ${pl(n,'Schatz','Schätze')} an.`, why:'Etwa die Hälfte ist ein faires Angebot. Bei zu wenig sagen viele Nein. Dein Helfer wählt zuerst, dann abwechselnd.'}; }
    case 'counter': return {opt:0, text:`Heb ${(counterTargets(C)[0]||{}).l||'die stärkste Karte'} auf.`, why:'Das ist die Karte, die dich am meisten kostet.'};
    case 'elfpick': return keepValue(p,d.b)>keepValue(p,d.a) ? {opt:'b', text:`Behalte ${d.b.n}.`, why:'Die ist für dich mehr wert.'} : {opt:'a', text:`Behalte ${d.a.n}.`, why:'Die ist für dich mehr wert.'};
    case 'loot': { const val=d.draft?draftValue:keepValue, best=d.pool.map((c,i)=>({c,i})).sort((a,b)=>val(p,b.c)-val(p,a.c))[0]; return {opt:best.i, text:`Nimm ${best.c.n}.`, why:'Die Karte ist für dich am meisten wert.'}; }
    case 'botHelp': return adviseBotHelp(p,C,d);
    case 'interfere': return adviseInterfere(p,C);
    case 'run': return adviseRun(p,d);
    case 'amulet': return curseHits(p,d.c) ? {opt:'yes', text:'Setz das Glücksamulett ein.', why:'Der Fluch würde dich wirklich treffen.'} : {opt:'no', text:'Nimm den Fluch hin.', why:'Er trifft bei dir ins Leere. Heb dir das Amulett für einen Fluch auf, der wehtut.'};
  }
  return null;
}
function adviceHTML(){
  const a=UI.adv; if(!a) return '';
  const can = a.opt!==undefined || a.uid || a.sell || (UI.sel && a.picks);
  return `<div class="advice"><span class="adv-l">Empfehlung</span><b>${linkify(esc(a.text))}</b><span class="adv-why">${linkify(esc(a.why||''))}</span>${can?'<button class="btn small" type="button" data-adv>Übernehmen</button>':''}</div>`;
}
function applyAdvice(){
  const a=UI.adv; if(!a) return;
  if(UI.sel){
    if(!a.picks) return;
    const ok=a.picks.filter(u=>{ const c=findCard(u); return c && UI.sel.filter(c,zoneOf(u)); }).slice(0,UI.sel.max);
    UI.sel.picked=new Set(ok);
    const cs=ok.map(findCard), valid=ok.length>=UI.sel.min && !(UI.sel.validate && UI.sel.validate(cs));
    if(valid) UI.sel.done(ok); else render();
    return;
  }
  if(a.sell){ startSell(a.picks); return; }
  if(a.uid){ const c=findCard(a.uid), w=zoneOf(a.uid); if(!c || !w) return;
    const act=cardActions(c,w).find(x=>x.fn && !x.dis && x.l.startsWith(a.act));
    if(act){ UI.menu=null; act.fn(); render(); } return; }
  if(a.opt!==undefined && UI.prompt && UI.resolve){ const o=UI.prompt.get().opts.find(o=>o.v===a.opt && !o.dis); if(o){ UI.menu=null; UI.resolve(o.v); } }
}


/* ================= Kartennamen anklickbar ================= */
let CATALOG={}, COPIES={}, NAME_RE=null;
function buildCatalog(cards){
  CATALOG={}; COPIES={};
  cards.forEach(c=>{ if(!CATALOG[c.n]) CATALOG[c.n]=c; COPIES[c.n]=(COPIES[c.n]||0)+1; });
  const alts=Object.keys(CATALOG).sort((a,b)=>b.length-a.length).map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  try{ NAME_RE=new RegExp('(?<![\\p{L}\\p{N}])('+alts.join('|')+')(?![\\p{L}\\p{N}])','gu'); }
  catch(e){ NAME_RE=new RegExp('('+alts.join('|')+')','g'); }
}
function linkify(html){
  if(!NAME_RE || !html) return html||'';
  return String(html).split(/(<[^>]+>)/).map(part=> part.startsWith('<') ? part :
    part.replace(NAME_RE, m=>`<button type="button" class="lc" data-cname="${esc(m)}">${m}</button>`)).join('');
}
function cardMeaning(c){
  switch(c.k){
    case 'item': {
      const slot = c.slot==='hand' ? (c.hands===2?'beide Hände':'eine Hand') : c.slot==='none' ? 'keinen Slot' : `den Slot ${SLOTN[c.slot]}`;
      let t = c.b ? `Gibt +${c.b} Kampfstärke, solange er ausgerüstet ist` : 'Gibt keinen Kampfbonus';
      if(c.run) t += `, dazu +${c.run} beim Weglaufen`;
      if(c.und) t += `, gegen Untote sogar +${c.und}`;
      if(c.pilzb) t += `, gegen Pilze sogar +${c.pilzb}`;
      if(c.meerb) t += `, gegen Meeresmonster sogar +${c.meerb}`;
      if(c.piratb) t += `, gegen Piraten sogar +${c.piratb}`;
      if(c.tiefb) t += `, gegen Tiefseemonster sogar +${c.tiefb}`;
      if(c.diver) t += ', und in der Tiefsee kein Weglauf-Malus';
      if(c.flutRun) t += `, bei Flut +${c.flutRun} beim Weglaufen`;
      if(c.shade) t += ', schützt vor Sonnenbrand';
      t += `. Belegt ${slot}.`;
      if(c.req) t += ` Wirkt nur für ${reqName(c)}.`;
      if(c.big) t += ' Sperriger Gegenstand: davon darf man nur einen haben, Zwerge beliebig viele.';
      return t + ` Verkaufswert ${fmt(c.g)} Gold.`;
    }
    case 'oneshot': if(c.map) return `Schatzkarte: ${c.txt} Gräbst du den Schatz aus, kommen beide Hälften in die Ablage. Verkaufswert ${fmt(c.g)} Gold.`;
      if(c.pOnly) return `Einmal einsetzbar: Im Kampf direkt von der Hand spielbar, aber nur für die kämpfende Seite, nicht für das Monster. ${c.txt} Danach abgelegt. Verkaufswert ${fmt(c.g)} Gold.`;
      return c.escape ? 'Einmal einsetzbar: Beim Weglaufen entkommt man damit ohne Würfeln, auch bei mehreren Monstern vor allen auf einmal. Danach wird die Karte abgelegt.' : `Einmal einsetzbar: Im Kampf direkt von der Hand spielbar, für jede Seite, auch für das Monster. +${c.b}, danach abgelegt. Verkaufswert ${fmt(c.g)} Gold.`;
    case 'monster': return `Stufe ${c.lvl}${c.undead?', untot':''}${c.nager?', Nager':''}${c.pilz?', Pilz':''}${c.meer?', Meer (bei Flut +3)':''}${c.pirat?', Pirat':''}${c.tiefsee?', Tiefsee (Weglaufen −1)':''}.${c.soft?` Bei Flut −${c.soft}.`:''}${c.noHelp?' Niemand darf helfen.':''} Wer es besiegt, steigt ${c.up||1} ${pl(c.up||1,'Stufe','Stufen')} auf und zieht ${c.tr} ${pl(c.tr,'Schatz','Schätze')}. Wer verliert und nicht entkommt: ${c.badTxt}`;
    case 'curse': return 'Fluch. Beim Öffnen der Tür aufgedeckt trifft er sofort den, der ihn aufdeckt. Von der Hand darf man ihn jederzeit auf jeden spielen. Hehler können ihn für 200 Gold verkaufen.';
    case 'race': return 'Volk: Man hat höchstens eins. Ein neues ersetzt das alte, ablegen geht jederzeit.';
    case 'class': return 'Klasse: Man hat höchstens eine. Eine neue ersetzt die alte, ablegen geht jederzeit.';
    case 'levelup': return 'Stufenkarte: Im eigenen Zug außerhalb von Kämpfen spielbar. Bringt 1 Stufe, aber nie die Siegstufe.';
    case 'enh': return `Laune: Jeder darf sie in jedem Kampf auf ein Monster spielen. ${sign(c.v)} Stufen, ${c.trm>0?'+':'−'}${Math.abs(c.trm)} ${pl(Math.abs(c.trm),'Schatz','Schätze')}.`;
    default: return '';
  }
}
function whereNow(c){
  const n=c.n, out=[];
  if(!S) return out;
  S.players.forEach(p=>{
    p.eq.filter(x=>x.n===n).forEach(()=>out.push(p.human?'Ausgerüstet bei dir.':`Ausgerüstet bei ${p.name}.`));
    p.pack.filter(x=>x.n===n).forEach(()=>out.push(p.human?'In deinem Rucksack.':`Im Rucksack von ${p.name}.`));
    if(p.race && p.race.n===n) out.push(p.human?'Das ist dein Volk.':`Volk von ${p.name}.`);
    if(p.cls && p.cls.n===n) out.push(p.human?'Das ist deine Klasse.':`Klasse von ${p.name}.`);
    if(p.human || UI.open) p.hand.filter(x=>x.n===n).forEach(()=>out.push(p.human?'Auf deiner Hand.':`Auf der Hand von ${p.name}.`));
  });
  if(S.combat) S.combat.mons.forEach(m=>{ if(m.c.n===n) out.push('Gerade im Kampf.'); m.enh.forEach(e=>{ if(e.n===n) out.push(`Gerade im Kampf, auf ${m.c.n}.`); }); });
  if(S.reveal && S.reveal.n===n) out.push('Liegt gerade offen auf dem Tisch.');
  const d=[...S.doorDisc,...S.trDisc].filter(x=>x.n===n).length;
  if(d) out.push(`${d}× in der Ablage.`);
  if(COPIES[n]>1) out.push(`Im Spiel gibt es diese Karte ${COPIES[n]}×.`);
  return out;
}


/* ================= Darstellungs-Helfer (rein) ================= */
function cardLabel(c){ return c.k==='curse' ? 'Fluch! '+c.n : c.k==='monster' ? `${c.n} (Stufe ${c.lvl})` : c.n; }
function itemTxt(c){
  const t=[];
  if(c.req) t.push(`Nur für ${reqName(c)}.`);
  if(c.run) t.push(`+${c.run} beim Weglaufen.`);
  if(c.big) t.push('Sperriger Gegenstand.');
  if(c.und) t.push(`Gegen Untote +${c.und} statt +${c.b}.`);
  if(c.pilzb) t.push(`Gegen Pilze +${c.pilzb} statt +${c.b}.`);
  if(c.meerb) t.push(`Gegen Meeresmonster +${c.meerb} statt +${c.b}.`);
  if(c.piratb) t.push(`Gegen Piraten +${c.piratb} statt +${c.b}.`);
  if(c.tiefb) t.push(`Gegen Tiefseemonster +${c.tiefb} statt +${c.b}.`);
  if(c.slot==='none') t.push('Belegt keinen Slot.');
  if(c.flv) t.push(c.flv);
  return t.join(' ');
}
function slotTxt(c){ if(c.slot==='hand') return c.hands===2?'2 Hände':'1 Hand'; return SLOTN[c.slot]; }
const HUMAN = {k:'race', n:'Mensch', txt:'Keine Besonderheit. Wer keine Volkskarte ausliegen hat, ist Mensch. Das ist keine eigene Karte.'};
const QUIZ=[
  {q:'Du öffnest die Tür und deckst einen Fluch auf. Was passiert?', o:['Er kommt auf deine Hand.','Er trifft sofort dich.','Du darfst ihn auf einen Mitspieler spielen.','Er wird abgelegt.'], a:1, e:'Offen beim Öffnen der Tür aufgedeckt: Der Fluch wirkt sofort auf dich. Nur verdeckt gezogene Flüche darfst du anderen geben.'},
  {q:'Deine Kampfstärke ist 8, das Monster hat Stufe 8. Wie geht es aus?', o:['Du gewinnst.','Ihr würfelt neu.','Du verlierst und musst weglaufen.','Unentschieden, nichts passiert.'], a:2, e:'Gleichstand ist immer eine Niederlage. Du musst höher sein als das Monster.'},
  {q:'Ab welchem Würfelergebnis gelingt das Weglaufen ohne Boni?', o:['Ab 4','Ab 5','Nur bei 6','Ab 3'], a:1, e:'5 oder 6. Manche Gegenstände, Monster und Welten ändern den Wurf.'},
  {q:'Du bist auf Stufe 9 und hast Gegenstände für 1.200 Gold. Kannst du dir Stufe 10 kaufen?', o:['Ja, 1.000 Gold sind eine Stufe.','Nein, Stufe 10 gibt es nur für einen Monstersieg.','Ja, aber nur als Kobold.','Ja, mit dem Goldbeutel.'], a:1, e:'Die Siegstufe gibt es nur, indem du ein Monster besiegst. Verkaufen, Goldbeutel und Stufenkarten bringen dich höchstens auf 9.'},
  {q:'Ende deines Zuges: 7 Handkarten, Berta hat als Einzige die niedrigste Stufe. Was passiert?', o:['Nichts, es gibt kein Limit.','Du legst 2 Karten ab.','Du gibst 2 Karten als Abgabe an Berta.','Du gibst alle Karten an Berta.'], a:2, e:'Abgabe: Alles über 5 Karten geht an den Spieler mit der niedrigsten Stufe. Bist du selbst (mit) am niedrigsten, legst du ab. Vorher kannst du Gegenstände in den Rucksack legen.'},
  {q:'Kalle hilft dir für 1 von 3 Schätzen. Wie werden die Schätze verteilt?', o:['Kalle bekommt einen zufälligen.','Du suchst dir zuerst einen aus.','Kalle sucht sich einen aus, der Rest gehört dir.','Du bestimmst allein.'], a:2, e:'Mit Helfer werden die Schätze offen gezogen. Der Helfer wählt zuerst, dann wählt ihr abwechselnd, bis er die abgemachte Zahl hat. Der Rest gehört dir. Helfen darf immer nur 1 Mitspieler.'},
  {q:'Beim Durchsuchen des Raums ziehst du verdeckt einen Fluch. Was jetzt?', o:['Er trifft dich sofort.','Er kommt auf deine Hand. Du kannst ihn später auf jemanden spielen.','Du musst ihn sofort auf den Spieler links spielen.','Er wird abgelegt.'], a:1, e:'Verdeckt gezogene Flüche sind Handkarten. Spielen darfst du sie jederzeit, auf jeden.'},
  {q:'Du stirbst. Was behältst du?', o:['Gar nichts, du fängst auf Stufe 1 an.','Stufe, Volk und Klasse.','Deine Handkarten.','Deine ausgerüsteten Gegenstände.'], a:1, e:'Stufe, Volk und Klasse bleiben. Handkarten werden abgelegt, von deinen Gegenständen nimmt sich jeder andere einen. Im nächsten Zug ziehst du 4 Tür- und 4 Schatzkarten.'},
  {q:'Wer darf eine Laune wie „Stinksauer“ (+5) spielen?', o:['Nur der Kämpfer.','Nur wer gerade nicht kämpft.','Jeder Spieler, in jedem Kampf.','Niemand, die Karte liegt einfach im Spiel.'], a:2, e:'Jeder darf sie in jeden Kampf spielen, auch auf das eigene Monster. Launen verändern meist auch die Zahl der Schätze.'},
  {q:'Dein Rucksack ist voll. Du rüstest einen neuen Helm aus. Wo landet der alte?', o:['Im Rucksack, der wird einfach größer.','Auf deiner Hand.','Er wird abgelegt.','Er geht an den Spieler mit der niedrigsten Stufe.'], a:1, e:'Der Rucksack fasst 3 Gegenstände, beim Zwerg 5. Passt nichts mehr hinein, kommt der alte Gegenstand auf die Hand. Dort zählt er bei der Abgabe mit.'}
];

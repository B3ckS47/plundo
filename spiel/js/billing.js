/* ================= Käufe über Google Play =================
   Echte Käufe gibt es nur in der Plundo-App aus dem Play Store (Trusted Web Activity): Dort stellt Chrome
   die Digital Goods API bereit. Ablauf: Payment Request → Play-Kaufdialog → Kauf-Token an unseren Prüf-Server
   (Cloudflare Worker) → der prüft den Kauf bei Google und bestätigt ihn → Welt freischalten.
   Ohne Bestätigung erstattet Google einen Kauf nach drei Tagen zurück; darum prüft die App beim Start
   auch alle vorhandenen Käufe noch einmal (Wiederherstellen, falls etwas unterwegs abgebrochen ist).
   Im Browser gibt es keine Käufe; wer angemeldet ist, bekommt gekaufte Welten über den Cloud-Spielstand. */
const PLAY_SKU = {w4: 'welt_4', w5: 'welt_5', w45: 'welt_4_5'};   // Produkt-IDs in der Play Console
const BILL_URL = '';   // Adresse des Prüf-Servers, z. B. https://plundo-kauf.<konto>.workers.dev (nach dem Einrichten eintragen)
const BILL = {svc: null, ready: false, prices: {}, busy: false};
const offerOfSku = sku => Object.keys(PLAY_SKU).find(k => PLAY_SKU[k] === sku);
const offerPrice = o => BILL.prices[PLAY_SKU[o.id]] || o.price;
function billFmt(p) { try { return new Intl.NumberFormat('de-DE', {style: 'currency', currency: p.currency}).format(+p.value); } catch (e) { return `${p.value} ${p.currency}`; } }

async function billInit() {
  if (!('getDigitalGoodsService' in window) || !window.PaymentRequest) return;
  try { BILL.svc = await window.getDigitalGoodsService('https://play.google.com/billing'); } catch (e) { BILL.svc = null; }
  if (!BILL.svc) return;
  BILL.ready = true;
  try { (await BILL.svc.getDetails(Object.values(PLAY_SKU))).forEach(d => { BILL.prices[d.itemId] = billFmt(d.price); }); } catch (e) {}
  billRestore(true);
}
// Kauf beim Prüf-Server prüfen und bestätigen lassen
async function billVerify(token, sku) {
  if (!BILL_URL) throw Object.assign(new Error('kein Prüf-Server'), {code: 'noserver'});
  const r = await fetch(BILL_URL.replace(/\/$/, '') + '/verify', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({sku, token})});
  const j = await r.json().catch(() => ({}));
  if ((!r.ok && !j.state) || j.state === 'error') throw Object.assign(new Error('Server ' + r.status), {code: 'server'});
  return j;   // {ok: true} | {ok: false, state: 'pending' | 'cancelled' | 'invalid'}
}
function billGrant(offerId, token) {
  PURCHASE.tokens = PURCHASE.tokens || {};
  PURCHASE.tokens[PLAY_SKU[offerId]] = token;
  return unlockOffer(offerId);   // speichert PURCHASE, das geht über den Cloud-Spielstand auch auf andere Geräte
}
// Welten eines erstatteten Kaufs wieder zumachen, außer ein anderer gültiger Kauf deckt sie ab (etwa Welt 4 einzeln und das Paket)
function billRevoke(skus) {
  const worldsOf = sku => (OFFERS.find(x => x.id === offerOfSku(sku)) || {worlds: []}).worlds;
  const keep = new Set(Object.keys(PURCHASE.tokens || {}).flatMap(worldsOf));
  skus.flatMap(worldsOf).forEach(w => { if (!keep.has(w)) delete PURCHASE.worlds[w]; });
  savePurchase();
}
async function billBuy(offerId) {
  const sku = PLAY_SKU[offerId]; if (!sku || BILL.busy) return false;
  BILL.busy = true;
  try {
    const req = new PaymentRequest([{supportedMethods: 'https://play.google.com/billing', data: {sku}}],
      {total: {label: 'Plundo', amount: {currency: 'EUR', value: '0'}}});   // Preis kommt aus der Play Console
    const res = await req.show();
    const token = res.details && res.details.purchaseToken;
    let v = {ok: false};
    try { v = await billVerify(token, sku); } catch (e) { v = {ok: false, err: e.code}; }
    await res.complete(v.ok ? 'success' : 'fail');
    if (v.ok) { billGrant(offerId, token); return true; }
    if (v.state === 'pending') toast('Die Zahlung ist noch nicht abgeschlossen. Sobald sie durch ist, wird die Welt freigeschaltet.');
    else if (v.err) toast('Der Kauf konnte gerade nicht bestätigt werden. Keine Sorge: Beim nächsten Start versuchen wir es noch einmal.');
    else toast('Der Kauf wurde nicht abgeschlossen.');
    return false;
  } catch (e) {
    if (e && e.name !== 'AbortError') toast('Der Kauf hat nicht geklappt. Versuch es bitte noch einmal.');
    return false;
  } finally { BILL.busy = false; }
}
// Vorhandene Käufe von Google holen, prüfen (und dabei bestätigen) und freischalten
async function billRestore(silent) {
  if (!BILL.ready) return 0;
  let n = 0;
  try {
    const list = await BILL.svc.listPurchases();
    for (const p of list) {
      const oid = offerOfSku(p.itemId); if (!oid) continue;
      try { const v = await billVerify(p.purchaseToken, p.itemId); if (v.ok && billGrant(oid, p.purchaseToken)) n++; } catch (e) {}
    }
    // Erstattete Käufe zurücknehmen: Ein gespeicherter Kauf, den Google nicht mehr listet, wird beim Prüf-Server nachgefragt.
    // Nur wenn der ihn sicher als storniert meldet (erstattet oder Rückbuchung), ist die Welt wieder zu.
    const seen = new Set(list.map(p => p.purchaseToken)), toks = PURCHASE.tokens || {};
    const gone = [];
    for (const sku of Object.keys(toks)) {
      if (seen.has(toks[sku])) continue;
      try { const v = await billVerify(toks[sku], sku); if (v.state === 'cancelled') { delete toks[sku]; gone.push(sku); } } catch (e) {}
    }
    if (gone.length) { billRevoke(gone); toast('Ein erstatteter Kauf wurde zurückgenommen.'); if (typeof renderStory === 'function') { renderStory(); renderTitle(); } }
  } catch (e) { if (!silent) toast('Käufe konnten gerade nicht abgerufen werden.'); return 0; }
  if (n) { if (typeof renderStory === 'function') { renderStory(); renderTitle(); } }
  if (!silent) toast(n ? 'Deine Käufe sind wiederhergestellt.' : 'Keine Käufe gefunden.');
  return n;
}
billInit();

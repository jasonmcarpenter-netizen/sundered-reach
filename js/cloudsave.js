/* ---------- cloud save: keeps this viewer's save in the artifact's database, under their own private path.
   A save is split into pieces of at most ~120 KB (one database document holds 256 KiB). The pieces are written
   first and an index document last; the index lists a checksum per piece, so a half-finished write is detected
   and ignored instead of loaded. ---------- */
const CloudSave = (() => {
  const PIECE = 120000;
  let base = null, name = '', ready = false, busy = false, queued = null, timer = null, lastJson = null, lastPieces = [], status = 'checking', listener = null;
  const setStatus = s => { status = s; if (listener) { try { listener(s); } catch (e) {} } };
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({code:'timeout'}), ms))]);
  const hash = str => { let x = 0x811c9dc5; for (let i = 0; i < str.length; i++){ x ^= str.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; } return x.toString(16) + ':' + str.length; };
  const split = json => { const out = []; for (let i = 0; i < json.length; i += PIECE) out.push(json.slice(i, i + PIECE)); return out.length ? out : ['']; };
  const indexRef = () => base.doc(name);
  const pieceRef = i => base.doc(name + '-' + i);
  async function read(){
    const snap = await withTimeout(indexRef().get(), 10000);
    if (!snap.exists) return {json:null, savedAt:0};
    const idx = snap.data() || {};
    const n = +idx.n || 0, hashes = Array.isArray(idx.hashes) ? idx.hashes : [];
    if (!n || hashes.length !== n) return {json:null, savedAt:0, broken:true};
    const parts = await withTimeout(Promise.all(Array.from({length:n}, (_, i) => pieceRef(i).get())), 15000);
    const strs = parts.map(p => (p.exists && typeof (p.data() || {}).part === 'string') ? p.data().part : null);
    if (strs.some((s, i) => s === null || hash(s) !== hashes[i])) return {json:null, savedAt:0, broken:true};
    const json = strs.join('');
    lastJson = json; lastPieces = strs.slice();
    return {json, savedAt: +idx.savedAt || 0};
  }
  async function connect(docName){
    name = docName;
    try {
      if (!window.claude || typeof window.claude.use !== 'function'){ setStatus('local'); return null; }
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user){ setStatus('local'); return null; }
      const id = await user.id();
      if (!id){ setStatus('local'); return null; }
      base = db.collection('data/users/' + id);
      const remote = await read();
      ready = true; setStatus('cloud');
      return remote;
    } catch (e) { ready = false; setStatus('local'); return null; }
  }
  async function pull(){ if (!ready) return null; try { return await read(); } catch (e) { return null; } }
  function push(json, savedAt){
    if (!ready || json === lastJson) return;
    queued = {json, savedAt}; clearTimeout(timer); timer = setTimeout(flush, 1200);
  }
  async function flush(){
    clearTimeout(timer);
    if (!ready || busy || !queued) return;
    const q = queued; queued = null; busy = true; setStatus('saving');
    try {
      const pieces = split(q.json);
      for (let i = 0; i < pieces.length; i++){
        if (pieces[i] !== lastPieces[i]){ await pieceRef(i).set({part:pieces[i]}); lastPieces[i] = pieces[i]; }
      }
      lastPieces.length = pieces.length;
      await indexRef().set({n:pieces.length, hashes:pieces.map(hash), savedAt:q.savedAt, v:2});
      lastJson = q.json; setStatus('cloud');
    } catch (e) {
      lastPieces = []; // unknown state: rewrite every piece next time
      const code = e && e.code;
      if (code === 'unavailable' || code === 'resource_exhausted' || code === 'timeout'){ if (!queued) queued = q; setStatus('retrying'); busy = false; setTimeout(flush, 2500 + Math.random() * 2500); return; }
      if (code === 'quota_exceeded') setStatus('full');
      else { ready = false; setStatus('local'); }
    }
    busy = false;
    if (queued && ready) flush();
  }
  async function clear(){
    lastJson = null; lastPieces = []; queued = null; clearTimeout(timer);
    if (!ready) return;
    try { await indexRef().delete(); } catch (e) {}
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', () => flush());
  return {
    connect, pull, push, flush, clear,
    get ready(){ return ready; },
    get status(){ return status; },
    onStatus(f){ listener = f; },
    label(){
      return ({checking:'Checking for your online save…', cloud:'Saved to your Claude account. Your progress follows you to any device where you’re signed in.',
        saving:'Saving to your Claude account…', retrying:'Couldn’t reach your Claude account. Retrying…',
        full:'Your online save is full. Progress is saved on this device only.',
        local:'Saving on this device only. Sign in to Claude to keep your progress on every device.'})[status] || '';
    }
  };
})();
// Save codes: a portable text copy of a save, for moving it by hand
function toSaveCode(json){ return btoa(unescape(encodeURIComponent(json))); }
function fromSaveCode(code){ return decodeURIComponent(escape(atob(String(code).replace(/\s+/g, '')))); }


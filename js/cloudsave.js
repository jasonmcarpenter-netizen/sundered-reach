/* ---------- cloud save: Firebase (Google sign-in + Firestore), one document per player at saves/{uid}.
   localStorage is always written too (see save() in core.js), so the game plays fully signed out.
   js/firebase.js loads the SDK as a module and hands this file a small API on window.SR_FIREBASE. ---------- */
const CloudSave = (() => {
  let fb = null, uid = null, who = '', ready = false, busy = false, queued = null, timer = null, lastJson = null;
  let status = 'checking', listener = null, signInListener = null, firstUser = true;
  const setStatus = s => { status = s; if (listener) { try { listener(s); } catch (e) {} } };
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({code:'timeout'}), ms))]);
  // Wait for js/firebase.js; if the SDK can't load (offline, blocked), stay local
  const loadFirebase = () => window.SR_FIREBASE ? Promise.resolve(window.SR_FIREBASE)
    : new Promise(res => { const t = setTimeout(() => res(null), 10000); window.addEventListener('sr-firebase', () => { clearTimeout(t); res(window.SR_FIREBASE); }, {once:true}); });
  async function read(){
    const d = await withTimeout(fb.read(uid), 10000);
    if (!d || typeof d.json !== 'string') return {json:null, savedAt:0};
    lastJson = d.json;
    return {json:d.json, savedAt:+d.savedAt || 0};
  }
  // Resolves once with the first sign-in state: the remote save if signed in, else null.
  // Later sign-ins (the button, or a redirect) go to onSignIn's callback instead.
  function connect(){
    return new Promise(async resolve => {
      fb = await loadFirebase();
      if (!fb){ setStatus('local'); resolve(null); return; }
      fb.onUser(async user => {
        const first = firstUser; firstUser = false;
        if (!user){ ready = false; uid = null; who = ''; lastJson = null; setStatus('signedout'); if (first) resolve(null); return; }
        uid = user.uid; who = user.name; setStatus('checking');
        let remote = null;
        try { remote = await read(); ready = true; setStatus('cloud'); }
        catch (e) { ready = false; setStatus(e && e.code === 'permission-denied' ? 'denied' : 'offline'); }
        if (first) resolve(remote);
        else if (signInListener && ready) { try { signInListener(remote); } catch (e) {} }
      });
    });
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
      await withTimeout(fb.write(uid, {json:q.json, savedAt:q.savedAt, v:2}), 15000);
      lastJson = q.json; setStatus('cloud');
    } catch (e) {
      const code = e && e.code;
      if (code === 'unavailable' || code === 'timeout' || code === 'deadline-exceeded'){ if (!queued) queued = q; setStatus('retrying'); busy = false; setTimeout(flush, 2500 + Math.random() * 2500); return; }
      if (code === 'resource-exhausted') setStatus('full');
      else if (code === 'permission-denied') { ready = false; setStatus('denied'); }
      else { ready = false; setStatus('offline'); }
    }
    busy = false;
    if (queued && ready) flush();
  }
  async function clear(){
    lastJson = null; queued = null; clearTimeout(timer);
    if (!ready) return;
    try { await fb.remove(uid); } catch (e) {}
  }
  async function signIn(){
    if (!fb) return;
    try { await fb.signIn(); } catch (e) { if (e && e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') setStatus('signinfail'); }
  }
  async function signOut(){ if (!fb) return; await flush(); try { await fb.signOut(); } catch (e) {} }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', () => flush());
  return {
    connect, pull, push, flush, clear, signIn, signOut,
    get ready(){ return ready; },
    get status(){ return status; },
    get canSignIn(){ return !!fb && !uid; },
    get canSignOut(){ return !!fb && !!uid; },
    onStatus(f){ listener = f; },
    onSignIn(f){ signInListener = f; },
    label(){
      return ({checking:'Checking for your online save…',
        cloud:`Synced to ${who}. Your progress follows you to any device where you sign in.`,
        saving:'Saving online…', retrying:'Couldn’t reach the online save. Retrying…',
        full:'Your online save is full. Progress is saved on this device only.',
        denied:'The online save refused this account. Progress is saved on this device only.',
        offline:'Couldn’t reach the online save. Progress is saved on this device only.',
        signinfail:'Sign-in didn’t work. Progress is saved on this device only.',
        signedout:'Saving on this device only. Sign in to sync your progress across devices.',
        local:'Saving on this device only.'})[status] || '';
    }
  };
})();
// Save codes: a portable text copy of a save, for moving it by hand
function toSaveCode(json){ return btoa(unescape(encodeURIComponent(json))); }
function fromSaveCode(code){ return decodeURIComponent(escape(atob(String(code).replace(/\s+/g, '')))); }

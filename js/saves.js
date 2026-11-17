// ---------- save codes and cloud sync ----------
function openSaveCode(){
  const cur = M || loadMeta();
  const json = cur ? JSON.stringify(cur) : '';
  const msg = h('p', {class:'muted', role:'status', style:'min-height:1.4em'});
  const out = h('textarea', {class:'codebox', readonly:true, rows:4, 'aria-label':'Your save code'});
  out.value = json ? toSaveCode(json) : '';
  const inp = h('textarea', {class:'codebox', rows:4, placeholder:'Paste a save code here', 'aria-label':'Paste a save code'});
  modal('Save code',
    h('p', {class:'muted'}, 'Your progress already follows you when you\u2019re signed in to Claude. A save code is a backup: copy it, then paste it into the game on another device.'),
    json ? [out, h('button', {class:'btn', onclick: async () => { try { await navigator.clipboard.writeText(out.value); msg.textContent = 'Copied.'; } catch (e) { out.select(); msg.textContent = 'Select the code above and copy it.'; } }}, 'Copy save code')]
      : h('p', {class:'muted'}, 'There\u2019s no save on this device yet.'),
    h('div', {class:'sec'}, h('h3', {}, 'Load a save code'),
      h('p', {class:'muted', style:'font-size:14px;margin:0 0 6px'}, 'This replaces the progress you have now, for every hero.'),
      inp,
      h('button', {class:'btn ghost', style:'margin-top:8px', onclick: () => {
        try { const p = JSON.parse(fromSaveCode(inp.value)); if (!p || !p.heroes) throw 0; C = null; M = p; S = null; lastBody = null; save(); closeModal(); screen = 'select'; render(true); }
        catch (e) { msg.textContent = 'That code didn\u2019t work. Check that you copied all of it.'; }
      }}, 'Load this save')),
    msg);
}
function syncFromCloud(remote, first){
  const local = M || loadMeta();
  const localAt = (local && local.savedAt) || 0;
  if (remote && remote.json && remote.savedAt > localAt){
    let parsed = null; try { parsed = JSON.parse(remote.json); } catch (e) {}
    if (parsed && parsed.heroes && !C){
      const wasPlaying = screen === 'game';
      M = parsed; S = null; lastBody = null;
      try { localStorage.setItem(SAVE_KEY, remote.json); } catch (e) {}
      if (wasPlaying){ closeModal(); screen = 'select'; selectNotice = 'You made progress on another device, so the game loaded it. Pick up where you left off.'; }
      render(true); return;
    }
  }
  if (first && local && CloudSave.ready && (!remote || !remote.json || localAt >= remote.savedAt)){
    if (!local.savedAt) local.savedAt = Date.now();
    CloudSave.push(JSON.stringify(local), local.savedAt);
  }
}
let selectNotice = null;
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible' || !CloudSave.ready || C) return;
  const r = await CloudSave.pull(); if (r) syncFromCloud(r, false);
});
CloudSave.onStatus(() => { document.querySelectorAll('#cloudline').forEach(el => { el.textContent = CloudSave.label(); }); });



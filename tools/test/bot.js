// Test bot: plays chapters through the game's own functions and clicks the real buttons, so rendering is
// exercised too. Load it into the running game (see tools/test/README.md), then load paths.js.
(() => {
  const B = window.BOT = {errors: [], log: [], fights: []};
  window.addEventListener('error', e => B.errors.push('error: ' + e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
  window.addEventListener('unhandledrejection', e => B.errors.push('rejection: ' + (e.reason && e.reason.message || e.reason)));
  const ce = console.error; console.error = (...a) => { B.errors.push('console.error: ' + a.join(' ')); ce.apply(console, a); };
  // run combat synchronously (a hidden or background page throttles timers to 1/s)
  window.later = function(fn){ const g = C.gen; if (C && C.gen === g && !C.over) fn(); };
  const sleep = () => Promise.resolve();
  const note = t => B.log.push(t);
  function fail(t){ B.errors.push('bot: ' + t); throw new Error(t); }
  B.ch = function(sub){
    if (S.mode !== 'scene') fail(`ch("${sub}") but mode=${S.mode} map=${S.map}`);
    const v = SCENES[S.scene].view();
    const c = v.choices.find(c => c.label.includes(sub));
    if (!c) fail(`no choice "${sub}" in ${S.scene}: [${v.choices.map(c => c.label).join(' | ')}]`);
    if (c.req && !c.req()) fail(`choice "${sub}" in ${S.scene} is locked (${c.tag})`);
    // click the real button so the rendered UI is exercised
    const btn = [...document.querySelectorAll('.choice')].find(b => b.textContent.includes(sub));
    if (!btn) fail(`button "${sub}" not rendered in ${S.scene}`);
    btn.click();
  };
  B.has = sub => S.mode === 'scene' && SCENES[S.scene].view().choices.some(c => c.label.includes(sub) && (!c.req || c.req()));
  B.visit = function(id){
    if (S.mode !== 'map') fail(`visit(${id}) but mode=${S.mode} scene=${S.scene}`);
    const n = MAPS[S.map].nodes.find(n => n.id === id);
    if (!n) fail(`no node ${id} on map ${S.map}`);
    if (n.open && !n.open()) fail(`node ${id} locked: ${n.lockText}`);
    const btn = [...document.querySelectorAll('.spot')].find(b => b.querySelector('b').textContent === n.label);
    btn.click();
  };
  B.spend = function(list){ list.forEach(id => { const c = H().cost(id); if (S.skillPts >= c){ S.pc.skills[id] = (S.pc.skills[id] || 0) + 1; S.skillPts -= c; } }); save(); };
  B.spendAll = function(order){ let guard = 0; while (S.skillPts > 0 && guard++ < 50){ const id = order[guard % order.length]; const c = H().cost(id); if (S.skillPts >= c) { S.pc.skills[id] = (S.pc.skills[id] || 0) + 1; S.skillPts -= c; } else if (order.every(x => H().cost(x) > S.skillPts)) break; } while (S.attrPts > 0){ S.pc.attrs[order.attr || 'endur']++; S.attrPts--; } save(); };

  // ---- combat AI ----
  const pct = u => u.hp / u.max;
  const ready = (u, id) => { const a = ACTIONS[id]; return a.known(u) && a.can(u) && !(u.cd[id] > 0) && !(a.sp && u.sp < a.sp); };
  function act(id, tid){ choose(id); if (C && C.phase === 'target') pickTarget(tid); }
  function item(id, tid){ chooseItem(id); pickTarget(tid); }
  const low = arr => arr.slice().sort((a, b) => a.hp - b.hp)[0];
  function decide(){
    const u = U(C.active); const es = enemiesAlive(); const hs = heroesAlive(); const pc = U('pc');
    const winding = es.find(e => e.winding);
    const hurt = low(hs.filter(x => pct(x) < 0.5));
    if (u.id === 'pc'){
      if (pct(u) < 0.3 && S.items.draught > 0) return item('draught', 'pc');
      if (u.st.grey >= 2 && pct(u) < 0.5 && S.items.tonic > 0) return item('tonic', 'pc');
      if (S.hero === 'kael'){
        if (pct(u) < 0.3 && ready(u, 'laststand')) return act('laststand');
        if (winding && !winding.spec.aoe && ready(u, 'bash') && meleeTargets().includes(winding)) return act('bash', winding.id);
        if (winding && winding.spec.aoe || (winding && pct(u) < 0.5)) return act('defend');
        if (hs.some(x => pct(x) < 0.5) && ready(u, 'rally')) return act('rally');
        const t = low(meleeTargets());
        if (ready(u, 'power')) return act('power', t.id);
        return act('attack', t.id);
      }
      if (S.hero === 'ilsa'){
        if (u.sp < 5){ if (S.items.aether > 0 && u.sp < 4) return item('aether', 'pc'); return act('channel'); }
        if (winding && ready(u, 'shackles')) return act('shackles', winding.id);
        if (winding && winding.spec.aoe && ready(u, 'ward')) return act('ward', 'pc');
        const boss = es.find(e => e.max >= 60);
        if (boss && ready(u, 'word')) return act('word', boss.id);
        if (es.length >= 3 && ready(u, 'arc')) return act('arc');
        if (pct(u) < 0.5 && !u.st.ward && ready(u, 'ward')) return act('ward', 'pc');
        return act('firebolt', low(es).id);
      }
      if (S.hero === 'wren'){
        if (winding && ready(u, 'hamstring')) return act('hamstring', winding.id);
        if (winding && winding.spec.aoe && ready(u, 'vanish')) return act('vanish');
        if (pct(u) < 0.35 && ready(u, 'vanish')) return act('vanish');
        const boss = es.find(e => e.max >= 60);
        const t = boss && es.length <= 2 ? boss : low(es);
        if (ready(u, 'aimed')) return act('aimed', t.id);
        return act('shoot', t.id);
      }
      if (S.hero === 'tamsin'){
        const greyed = hs.filter(x => x.st.grey).length;
        const cleansable = es.filter(e => e.cleanse && e.hp <= e.max * 0.6).length;
        if (ready(u, 'mendgrey') && (cleansable >= 1 || greyed >= 1 && pct(u) < 0.6)) return act('mendgrey');
        if (hurt && ready(u, 'mend')) return act('mend', hurt.id);
        if (winding && winding.spec.aoe && ready(u, 'sanctuary')) return act('sanctuary');
        const calmT = es.find(e => e.calm);
        if (calmT && ready(u, 'calm')) return act('calm', low(es.filter(e => e.calm)).id);
        if (u.sp < 5 && ready(u, 'pray')) return act('pray');
        const cl = es.filter(e => e.cleanse && e.hp > e.max * 0.6);
        const hol = es.filter(e => e.hollow && !e.cleanse);
        if (ready(u, 'smite') && (hol.length || cl.length)) return act('smite', low(hol.length ? hol : cl).id);
        if (ready(u, 'mace')) return act('mace', low(meleeTargets()).id);
        return act('defend');
      }
    } else {
      const aid = S.ally.id;
      if (aid === 'bran'){ if (hurt && ready(u, 'bandage')) return act('bandage', hurt.id); return act('sling', low(es).id); }
      if (aid === 'hask'){ if (pct(pc) < 0.6 && ready(u, 'guard')) return act('guard'); if (ready(u, 'hammer')) return act('hammer', low(meleeTargets()).id); return act('defend'); }
      if (aid === 'tobin'){ if (pct(pc) < 0.6 && ready(u, 'cover')) return act('cover'); if (ready(u, 'haft')) return act('haft', low(meleeTargets()).id); return act('defend'); }
      if (aid === 'bracken'){ if (pct(pc) < 0.5 && ready(u, 'howl')) return act('howl'); if (ready(u, 'bite')) return act('bite', low(meleeTargets()).id); return act('defend'); }
    }
    act('defend');
  }
  B.decide = decide;
  B.fight = async function(maxRetries){
    const id = C.id; let tries = 1, rounds = 0;
    const startInfo = C.units.filter(u => u.side === 'hero').map(u => `${u.name} ${u.hp}/${u.max}`).join(', ');
    for (let guard = 0; guard < 20000; guard++){
      await sleep(1);
      if (!C) fail('combat vanished');
      if (C.phase === 'over'){
        const o = C.over;
        if (o.result === 'lose' && C.def.lethal){
          if (tries > (maxRetries == null ? 15 : maxRetries)) fail(`lost ${id} ${tries} times`);
          tries++; retryCombat(); continue;
        }
        rounds = C.round;
        B.fights.push({hero:S.hero, id, result:o.result, tries, rounds, start:startInfo});
        const btn = [...document.querySelectorAll('.result .btn')].find(b => b.textContent === 'Continue');
        if (!btn) fail('no Continue button after ' + id);
        btn.click();
        return o.result;
      }
      if (C.phase === 'player'){
        try { decide(); } catch (e) { B.errors.push(`decide in ${id}: ${e.message}`); throw e; }
      }
    }
    fail('fight did not end: ' + id);
  };
  B.rest = function(){ const r = ['Rest', 'rest']; if (B.has('Rest')) B.ch('Rest'); };
  B.state = () => ({hero:S.hero, mode:S.mode, scene:S.scene, map:S.map, level:S.level, hp:S.pc.hp, sp:S.pc.sp});
})();

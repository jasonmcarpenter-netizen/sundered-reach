// Scripted chapter paths for the test bot (load bot.js first). opts pick the branch at each choice.
// BOT.suite() runs the standard smoke test and balance sim in one call; see tools/test/README.md.
(() => {
  const B = BOT; const w = () => Promise.resolve();
  const restAt = (hub) => { B.visit(hub); B.rest(); if (S.mode === 'scene') B.ch('Back'); };
  const fight = async () => { await w(5); await B.fight(); };
  B.kael = async (o) => {
    beginHero('kael', true); B.ch('Continue'); B.spend(['leadership','lore','lockpick','survival']); B.ch('arena warrens');
    B.visit('office'); B.ch(o.deal || 'Refuse'); B.ch('Back');
    B.spendAll(['blades','tough']);
    B.visit('gate'); B.ch('arming'); if (o.dario !== 'killed' && B.has('Check your sword')){ B.ch('Check your sword'); B.ch('Scrub'); } B.ch('Walk out'); await fight();
    B.ch(o.dario === 'killed' ? 'Finish it' : 'Lower'); B.ch('Continue');
    B.ch(S.flags.darioAlly ? 'Dario’s key' : 'Pick the lock'); B.ch('Into the tunnels');
    B.visit('guard'); B.ch('Fight'); await fight(); B.ch('Back');
    B.spendAll(['blades','tough']); restAt('junction');
    B.visit('cache'); B.ch('Pick the lock'); B.ch('Back');
    B.visit('sealed'); B.ch('Squeeze'); B.ch('Back away'); restAt('junction');
    B.visit('chamber'); B.ch('Fight the Grey'); await fight(); B.ch('Tell him'); B.ch('End of');
  };
  B.ilsa = async (o) => {
    beginHero('ilsa', true); B.ch('Continue'); B.spend(['lore','lockpick','leadership','stealth']); B.ch('Slip out');
    B.visit('i_study'); B.ch('Unpick'); B.ch('Back');
    B.spendAll(['arcane','spellcraft']); restAt('i_dorm');
    B.visit('i_archive'); B.ch('Face the Sentinel'); await fight();
    B.ch('Boots'); B.ch(o.choice === 'hide' ? 'Slip the last pages' : 'Give it up'); B.ch('Continue'); B.ch('Down into');
    B.visit('i_stair'); B.ch('Fight'); await fight(); B.ch('Back');
    B.spendAll(['arcane','spellcraft']); restAt('i_landing');
    B.visit('i_vault'); B.ch('Pick the lock'); B.ch('Back');
    restAt('i_landing');
    B.visit('i_furnace'); B.ch('Fight Proctor'); await fight(); B.ch('Down to the sea'); B.ch('End of');
  };
  B.tamsin = async (o) => {
    beginHero('tamsin', true); B.ch('Continue'); B.spend(['divine','leadership','maces','survival']); B.ch('Out into');
    B.visit('t_hall'); B.ch('Back');
    B.visit('t_path'); B.ch('Climb');
    B.visit('t_steps'); B.ch('Push through'); await fight(); B.ch('Back');
    B.visit('t_camp'); B.ch('Heal him'); B.ch(o.orrin === 'judged' ? 'Send him down' : 'Let him go'); B.ch('Back');
    B.spendAll(['divine','maces']); restAt('t_hermit');
    B.visit('t_gate'); B.ch('Face them'); await fight(); B.ch('Back');
    restAt('t_hermit');
    B.visit('t_shrine'); B.ch('Fight Velka'); await fight(); B.ch('Decide'); B.ch('Go down'); B.ch('End of');
  };
  B.wren = async (o) => {
    const notes = [];
    const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 80)));
    beginHero('wren', true); B.ch('Continue'); B.spend(o.spend || ['lockpick','lore','leadership','stealth']); B.ch('Walk into');
    B.visit('w_fence'); grab();
    if (B.has('news out of Varrow')){ B.ch('news out of Varrow'); grab(); B.ch('Ask something'); }
    if (B.has('coast road')){ B.ch('coast road'); grab(); B.ch('Ask something'); }
    B.ch('Back to the map');
    B.visit('w_broker'); B.ch('Two hundred crowns. Done'); B.ch('Back');
    B.visit('w_pavilion'); grab(); B.ch('Say nothing');
    B.spendAll(['bows','tough']);
    B.visit('w_gate'); B.ch('Cross');
    B.visit('w_trail'); grab();
    if (B.has('Open the pouch')) B.ch('Open the pouch'); else if (B.has('Go on')) B.ch('Go on');
    B.ch('Fight'); await fight(); B.ch('Back');
    B.spendAll(['bows','tough']); restAt('w_hide');
    B.visit('w_patrol'); grab();
    if (o.patrol === 'bluff') { B.ch('Crown’s own envoy'); B.ch('Back'); }
    else { B.ch('Fight your way'); await fight(); B.ch('Back'); }
    B.spendAll(['bows','tough']); restAt('w_hide');
    B.visit('w_meet'); grab(); B.ch('Fight Sable'); await fight(); grab();
    B.ch('Head for');
    if (o.key === 'kept'){ B.ch('Keep it'); B.ch('Continue'); }
    else { B.ch('Sell him'); if (B.has('Fight')){ B.ch('Fight'); await fight(); } B.ch('Continue'); }
    B.ch('End of');
    return notes;
  };
  // Balance sim: build a hero at a given XP with the bot's spending, then fight a combat N times (first try each)
  // Synchronous: no timers (a hidden page throttles them) and no rendering
  B.trial = function(combatId){
    const keepLater = window.later, keepRender = window.render;
    window.later = function(fn){ const g = C.gen; if (C && C.gen === g && !C.over) fn(); };
    window.render = () => {};
    try {
      startCombat(combatId);
      for (let g = 0; g < 5000 && C.phase !== 'over'; g++){ if (C.phase === 'player') B.decide(); else break; }
      const r = C.phase === 'over' ? C.over.result : 'stuck'; const rounds = C.round;
      restoreSnap(); C.gen++; C = null; return {r, rounds};
    } finally { window.later = keepLater; window.render = keepRender; }
  };
  B.sim = async function(hero, xp, combatId, n, order, pre){
    beginHero(hero, true); if (S.ally) { S.ally.joined = true; S.ally.hp = allyMax(); }
    if (pre) B.spend(pre);
    gainXP(xp); B.spendAll(order); restAll(); save();
    if (hero === 'ilsa') S.flags.word = true;
    let wins = 0, rounds = 0;
    for (let i = 0; i < n; i++){ const t = B.trial(combatId); if (t.r === 'win') wins++; rounds += t.rounds; }
    return `${hero} L${S.level} ${combatId}: first-try wins ${wins}/${n} (${Math.round(wins / n * 100)}%), avg ${Math.round(rounds / n)} rounds`;
  };
  B.ilsa2 = async (o) => {
    const notes = []; const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 80)));
    beginHero('ilsa'); const st = nextStep('ilsa'); if (st.kind !== 'next') throw new Error('ilsa ch2 not available: ' + JSON.stringify(st));
    beginChapter(2); notes.push('start level ' + S.level + (S.notice ? ' (' + S.notice + ')' : ''));
    B.ch('Up into');
    B.visit('i2_bridge'); grab(); B.ch('Fight'); await fight(); B.ch('Back');
    B.spendAll(['arcane','spellcraft']); restAt('i2_camp');
    if (o.den !== false){ B.visit('i2_den'); B.ch('Go in'); await fight(); B.ch('Back'); restAt('i2_camp'); }
    B.visit('i2_hold'); B.ch(o.hold === 'speak' ? 'Speak for him' : 'Let Hask'); B.ch('Back');
    B.spendAll(['arcane','spellcraft']);
    B.visit('i2_climb'); B.ch('Down into');
    B.visit('i2_hall'); grab(); if (B.has('Fight')){ B.ch('Fight'); await fight(); B.ch('Back'); } else { B.ch('Take the supplies'); B.ch('Back'); }
    B.visit('i2_temple'); grab(); B.rest(); if (S.mode === 'scene') B.ch('Back');
    B.visit('i2_steps'); B.ch('Climb'); await fight(); B.ch('Back');
    B.spendAll(['arcane','spellcraft']); restAt('i2_temple');
    B.visit('i2_shrine'); notes.push('boss at level ' + S.level); B.ch('Fight the Ward'); await fight();
    B.ch('Decide'); B.ch(o.speak ? 'Speak the Word' : 'Take your hand'); B.ch('Down the mountain'); B.ch('End of chapter 2');
    return notes;
  };
  B.endEchoes = () => [...document.querySelectorAll('.end .echo')].map(e => e.textContent.slice(0, 90));

  // ---- the standard check after any change (CLAUDE.md, Working rules) ----
  // Plays every built chapter through both branch sets, then simulates each boss. ERASES this origin's
  // saved game (localStorage), so only run it on localhost. Returns a plain-text report.
  B.suite = async function(opts){
    opts = opts || {}; const n = opts.runs || 100;
    const lines = [], errs0 = B.errors.length, fights0 = B.fights.length;
    const play = async (name, steps) => {
      try { localStorage.clear(); } catch (e) {}
      M = null; S = null; C = null; const f0 = B.fights.length;
      try { await steps(); lines.push(`PASS ${name}`); }
      catch (e) { lines.push(`FAIL ${name}: ${e.message} @ ${JSON.stringify(B.state())}`); }
      lines.push('     fights: ' + B.fights.slice(f0).map(f => `${f.hero}/${f.id} x${f.tries}`).join(' '));
    };
    lines.push('== Play-throughs ==');
    await play('hostile branches: Kael kills Dario, Ilsa hides the pages, Tamsin frees Orrin, Wren fights and keeps the key, Ilsa ch2 speaks the Word', async () => {
      await B.kael({dario:'killed'}); await B.ilsa({choice:'hide'}); await B.tamsin({orrin:'freed'});
      await B.wren({patrol:'fight', key:'kept'});
      if (hasChapter('ilsa', 2)) await B.ilsa2({speak:true, hold:'self'});
    });
    await play('friendly branches: Kael spares Dario, Ilsa reports, Tamsin judges Orrin (held shrine), Wren bluffs and sells, Ilsa ch2 stays silent', async () => {
      await B.kael({dario:'spared'}); await B.ilsa({choice:'report'}); await B.tamsin({orrin:'judged'});
      M.heroes.tamsin.flags.choice = 'defend'; save();
      await B.wren({patrol:'bluff', key:'sold', spend:['lockpick','lore','stealth','bows']});
      if (hasChapter('ilsa', 2)) await B.ilsa2({speak:false, hold:'speak'});
    });
    lines.push('', `== Boss balance (bot, ${n} first tries each; utility skills bought first, like a player) ==`);
    const sims = [
      ['kael', 180, 'boss', ['blades','tough'], ['leadership','lore','lockpick','survival']],
      ['kael', 300, 'boss', ['blades','tough'], ['leadership','lore','lockpick','survival']],
      ['ilsa', 200, 'i_boss', ['arcane','spellcraft'], ['lore','lockpick','leadership','stealth']],
      ['tamsin', 230, 't_boss', ['divine','maces'], ['divine','leadership','maces','survival']],
      ['wren', 155, 'w_boss', ['bows','tough'], ['lockpick','lore','leadership','stealth']],
      ['wren', 245, 'w_boss', ['bows','tough'], ['lockpick','lore','leadership','stealth']]
    ];
    for (const [hero, xp, id, order, pre] of sims){ try { localStorage.clear(); } catch (e) {} M = null; S = null; lines.push(await B.sim(hero, xp, id, n, order, pre)); }
    if (COMBATS.i2_boss) for (const c of ['evacuate', 'defend']) for (const xp of [400, 620]){
      M = {v:2, cur:null, heroes:{kael:null, ilsa:null, tamsin:{flags:{choice:c}, level:1}, wren:null}};
      lines.push(`(Tamsin ${c}) ` + await B.sim('ilsa', xp, 'i2_boss', n, ['arcane','spellcraft'], ['lore','lockpick','leadership','stealth']));
    }
    try { localStorage.clear(); } catch (e) {} M = null; S = null; C = null; screen = 'title'; render(true);
    const errs = B.errors.slice(errs0);
    lines.push('', errs.length ? '== Errors ==\n' + errs.join('\n') : '== No errors ==');
    return lines.join('\n');
  };
})();

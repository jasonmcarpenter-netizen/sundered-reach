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
      // a party fight writes health and XP back to each hero, so keep their states too
      const heroSnap = isPartyState(S) ? JSON.stringify(M.heroes) : null;
      startCombat(combatId);
      for (let g = 0; g < 5000 && C.phase !== 'over'; g++){ if (C.phase === 'player') B.decide(); else break; }
      const r = C.phase === 'over' ? C.over.result : 'stuck'; const rounds = C.round;
      restoreSnap(); C.gen++; C = null;
      if (heroSnap) M.heroes = JSON.parse(heroSnap);
      return {r, rounds};
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
  B.tamsin2 = async (o) => {
    const notes = []; const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 80)));
    beginHero('tamsin'); const st = nextStep('tamsin'); if (st.kind !== 'next' || st.n !== 2) throw new Error('tamsin ch2 not available: ' + JSON.stringify(st));
    beginChapter(2); notes.push('start level ' + S.level);
    B.ch('Up the pass');
    B.visit('t2_snow'); B.ch('Stand and fight'); await fight(); B.ch('Back');
    B.spendAll(['divine','maces']); restAt('t2_camp');
    if (o.chapel !== false){ B.visit('t2_chapel'); B.ch('Tend her'); B.ch('Back'); restAt('t2_camp'); }
    B.visit('t2_post');
    if (o.post === 'argue') { B.ch(tEvac() ? 'Let them through' : 'write that down'); B.ch('Back'); }
    else if (o.post === 'sneak') { B.ch('goat track'); B.ch('Back'); }
    else { B.ch('Break through'); await fight(); B.ch('Back'); }
    B.spendAll(['divine','maces']);
    B.visit('t2_descend'); B.ch('Down to Saint');
    B.visit('t2_hospice'); grab(); B.rest(); if (S.mode === 'scene') B.ch('Back');
    B.visit('t2_abbess'); B.ch('Back'); B.visit('t2_tower'); B.ch('Back');
    restAt('t2_hospice');
    B.visit('t2_night'); grab(); notes.push('boss at level ' + S.level); B.ch('Into the courtyard'); await fight();
    notes.push('freed converts ' + S.flags.freedConverts);
    B.ch('Hear them out'); B.ch(o.order === 'keepers' ? 'Keep faith' : 'Ring the bells'); B.ch('Continue'); B.ch('End of chapter 2');
    return notes;
  };
  B.kael2 = async (o) => {
    const notes = []; const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 80)));
    beginHero('kael'); const st = nextStep('kael'); if (st.kind !== 'next' || st.n !== 2) throw new Error('kael ch2 not available: ' + JSON.stringify(st));
    beginChapter(2); notes.push('start level ' + S.level);
    B.ch('North along');
    B.visit('k2_mill'); B.ch('Fight'); await fight(); B.ch('Back');
    B.spendAll(['blades','tough']); restAt('k2_camp');
    B.visit('k2_farm'); grab();
    if (B.has('Show me the well')) B.ch('Show me the well'); else B.ch(o.farm === 'night' ? 'after dark' : 'I’ve seen');
    B.ch(o.haul ? 'bare hands' : 'Listen to it'); B.ch('Back');
    B.visit('k2_inn'); grab(); B.ch('Buy the carters'); B.ch('Back'); B.ch('Sit down'); B.ch('Back'); B.ch('Back to the map');
    B.visit('k2_wagon'); grab();
    if (B.has('Hit the wagon')){ B.ch('Hit the wagon'); await fight(); B.ch('Back'); }
    else { B.ch(B.has('Search') ? 'Search' : 'Strip'); B.ch('Back'); }
    if (o.pit !== false){ restAt('k2_camp'); B.visit('k2_pit'); B.ch('Fight'); await fight(); B.ch('Back'); }
    B.spendAll(['blades','tough']); restAt('k2_camp');
    B.visit('k2_onward'); B.ch('Down to');
    B.visit('k2_toll'); B.ch('Back');
    if (o.prep){ B.visit('k2_watch'); B.ch(o.prep === 'strings' ? 'crossbow string' : 'where it narrows'); B.ch('Back'); }
    restAt('k2_bank');
    B.visit('k2_crossing'); grab(); notes.push('boss at level ' + S.level); B.ch('Fight the Iron'); await fight();
    B.ch('Decide'); B.ch(o.captain === 'handed' ? 'Hand her' : 'Tear up'); B.ch('Continue'); B.ch('End of chapter 2');
    return notes;
  };
  B.wren2 = async (o) => {
    const notes = []; const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 80)));
    beginHero('wren'); const st = nextStep('wren'); if (st.kind !== 'next' || st.n !== 2) throw new Error('wren ch2 not available: ' + JSON.stringify(st));
    beginChapter(2); notes.push('start level ' + S.level);
    B.ch('North along');
    B.visit('w2_hut'); grab(); B.ch('Back');
    B.visit('w2_sarne');
    if (B.has('Fight')){ B.ch('Fight'); await fight(); B.ch('Back'); }
    else { B.ch(B.has('Read the bark') ? 'Read the bark' : 'Pick through'); B.ch('Back'); }
    B.spendAll(['bows','tough']); restAt('w2_camp');
    if (o.glade !== false){ B.visit('w2_glade'); B.ch('Fight'); await fight(); B.ch('Back'); B.spendAll(['bows','tough']); restAt('w2_camp'); }
    B.visit('w2_onward'); B.ch('Into the enclave');
    B.visit('w2_gate'); grab();
    if (B.has('Walk in')) B.ch('Walk in');
    else B.ch(o.gate === 'guest' ? 'envoy’s camp' : B.has('one of yours') ? 'one of yours' : 'over the wall');
    B.ch('Back');
    B.visit('w2_marrow'); grab(); B.ch('Back');
    B.visit('w2_hall'); B.ch(B.has('Look for your father') ? 'Look for your father' : B.has('Read the oldest') ? 'Read the oldest' : 'bone comb'); B.ch('Back');
    B.visit('w2_door'); if (B.has('Open it')) B.ch('Open it'); else B.ch('Leave'); B.ch('Back');
    B.visit('w2_well'); grab(); B.ch('Back');
    if (o.quiver){ B.visit('w2_watch'); B.ch('steal the quiver'); B.ch('Back'); }
    B.spendAll(['bows','tough']); restAt('w2_hall');
    B.visit('w2_night'); notes.push('boss at level ' + S.level); B.ch('Fight Nell'); await fight();
    B.ch('Hear them out'); B.ch(o.fragment === 'kept' ? 'Keep it' : 'Give the fragment'); B.ch('Continue'); B.ch('End of chapter 2');
    return notes;
  };
  B.kael3 = async (o) => {
    const notes = []; const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 80)));
    beginHero('kael'); const st = nextStep('kael'); if (st.kind !== 'next' || st.n !== 3) throw new Error('kael ch3 not available: ' + JSON.stringify(st));
    beginChapter(3); notes.push('start level ' + S.level); grab();
    B.ch('Into the fever');
    B.visit('k3_tents'); B.ch('Deal'); await fight(); B.ch('Back');
    B.spendAll(['blades','tough']); restAt('k3_camp');
    B.visit('k3_watch'); grab();
    if (o.gate !== 'water' && B.has('Marrow’s sergeant')) B.ch('Marrow’s sergeant');
    else if (o.gate !== 'water' && B.has('sealed bounty contract')) B.ch('sealed bounty contract');
    else {
      B.ch('Back'); B.visit('k3_water');
      if (o.water === 'force') { B.ch('by force'); await fight(); B.ch('Into the city'); }
      else B.ch(B.has('Iron Tally’s barge') ? 'Iron Tally’s barge' : B.has('pick the grate') ? 'pick the grate' : 'swim through');
    }
    notes.push('in by ' + S.flags.cityHow);
    B.ch('Along the Salt Quay');
    B.visit('k3_find');
    if (B.has('Go to Number Nine')) { B.ch('Go to Number Nine'); B.ch('Back'); }
    else if (o.cart) { B.ch('Stop the cart'); await fight(); B.ch('Back'); }
    else { B.ch('Follow the cart'); B.ch('Back'); }
    B.visit('k3_factor'); grab(); if (B.has('Your name is in')) { B.ch('Your name is in'); B.ch('Back'); } else B.ch('Leave him');
    B.visit('k3_side'); grab(); if (B.has('Remember it')) B.ch('Remember it'); B.ch('Back');
    B.spendAll(['blades','tough']); restAt('k3_room');
    B.visit('k3_yard'); grab();
    if (!o.yardFight && (B.has('sail-loft') || B.has('side door'))) B.ch(B.has('sail-loft') ? 'sail-loft' : 'side door');
    else { B.ch('Go over the wall'); await fight(); B.ch('Back'); restAt('k3_room'); B.visit('k3_yard'); B.ch('Down to the cellar'); }
    notes.push('boss at level ' + S.level); B.ch('Fight Voss'); await fight();
    B.ch('Decide'); B.ch(o.hoard === 'quiet' ? 'Keep it quiet' : 'Expose it'); B.ch('Continue'); B.ch('End of chapter 3');
    return notes;
  };
  B.ilsa3 = async (o) => {
    const notes = []; const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 80)));
    beginHero('ilsa'); const st = nextStep('ilsa'); if (st.kind !== 'next' || st.n !== 3) throw new Error('ilsa ch3 not available: ' + JSON.stringify(st));
    beginChapter(3); notes.push('start level ' + S.level);
    B.ch('Up the pass');
    B.visit('i3_snow'); B.ch('Fight'); await fight(); B.ch('Back');
    B.spendAll(['arcane','spellcraft']); restAt('i3_camp');
    B.visit('i3_chapel'); grab();
    if (B.has('Sit with her')) B.ch('Sit with her'); else if (B.has('Read her notebook')) B.ch('Read her notebook'); else B.ch('Close her eyes');
    B.ch('Back');
    B.visit('i3_post'); grab();
    if (B.has('Marrow’s riders')) { B.ch('Marrow’s riders'); B.ch('Back'); }
    else if (B.has('Thank him')) { B.ch('Thank him'); B.ch('Back'); }
    else if (!o.postFight && B.has('lip round')) { B.ch('lip round'); B.ch('Back'); }
    else { B.ch('Break through'); await fight(); B.ch('Back'); }
    notes.push('post: ' + S.flags.postHow);
    B.spendAll(['arcane','spellcraft']);
    B.visit('i3_descend'); B.ch('Down to Saint');
    B.visit('i3_rest'); grab(); B.rest(); if (S.mode === 'scene') B.ch('Back');
    B.visit('i3_wood'); B.ch(B.has('Read the Magister') ? 'Read the Magister' : 'Burn the packs'); B.ch('Back');
    B.spendAll(['arcane','spellcraft']); restAt('i3_rest');
    B.visit('i3_bridge'); notes.push('boss at level ' + S.level); B.ch('Fight Magister'); await fight();
    B.ch('Decide'); B.ch(o.magister === 'crown' ? 'Give him to the Crown' : 'Go home, Magister'); B.ch('Continue'); B.ch('End of chapter 3');
    return notes;
  };
  B.tamsin3 = async (o) => {
    const notes = []; const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 80)));
    beginHero('tamsin'); const st = nextStep('tamsin'); if (st.kind !== 'next' || st.n !== 3) throw new Error('tamsin ch3 not available: ' + JSON.stringify(st));
    beginChapter(3); notes.push('start level ' + S.level); grab();
    B.ch('Into the Lantern');
    B.visit('t3_infirmary'); grab(); B.ch('Back');
    B.visit('t3_nave');
    if (o.calm && B.has('altar steps')) B.ch('altar steps'); else B.ch(B.has('Use the chaos') ? 'Use the chaos' : 'Note');
    B.ch('Back');
    B.visit('t3_archive');
    const ways = ['Go down with Brother Ivo', 'Follow Brother Ivo', 'Ask Brother Ivo again', 'bell-ringers', 'ossuary'];
    B.ch(ways.find(w => B.has(w))); notes.push('archive via ' + S.flags.archiveHow);
    B.ch('Into the archive');
    B.visit('t3_stacks'); B.ch('Fight'); await fight(); B.ch('Back');
    B.spendAll(['divine','maces']); restAt('t3_lamp');
    B.visit('t3_reading');
    B.ch(B.has('Look it up') ? 'Look it up' : (!o.slow && B.has('Search the catalogue')) ? 'Search the catalogue' : 'Pull books'); B.ch('Back');
    B.spendAll(['divine','maces']); restAt('t3_lamp');
    B.visit('t3_vault'); notes.push('boss at level ' + S.level); B.ch('Stop him'); await fight();
    B.ch('Decide');
    const pick = {aurel:'Light the Second', saved: B.has('Save the rite') ? 'Save the rite' : 'Save the book', ivo:'Go back for'}[o.rite];
    B.ch(B.has(pick) ? pick : (B.has('Save the rite') ? 'Save the rite' : 'Save the book'));
    notes.push('rite ' + S.flags.rite);
    B.ch('Continue'); B.ch('End of chapter 3');
    return notes;
  };
  B.wren3 = async (o) => {
    const notes = []; const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 80)));
    beginHero('wren'); const st = nextStep('wren'); if (st.kind !== 'next' || st.n !== 3) throw new Error('wren ch3 not available: ' + JSON.stringify(st));
    beginChapter(3); notes.push('start level ' + S.level);
    B.ch('Down the river');
    B.visit('w3_tally'); grab();
    if (B.has('I’ll take')) B.ch('I’ll take'); else if (B.has('Fight them off')) { B.ch('Fight them off'); await fight(); } else B.ch('Keep your head down');
    B.ch('Back');
    B.visit('w3_patrol');
    if (B.has('Thank him')) B.ch('Thank him');
    else if (B.has('Sink the crate')) B.ch('Sink the crate');
    else if (B.has('Grain for')) B.ch('Grain for');
    else if (B.has('When they board')) { B.ch('When they board'); await fight(); }
    else B.ch('Watch it go');
    B.ch('Back'); notes.push('patrol: ' + (S.flags.patrolHow3 || 'none'));
    B.spendAll(['bows','tough']); restAt('w3_deck');
    B.visit('w3_quell');
    if (o.quell === 'pay' && B.has('Pay her')) B.ch('Pay her');
    else if (B.has('steal your debt')) B.ch('steal your debt');
    else { B.ch('see what her bargemen do'); await fight(); B.ch('Continue'); }
    B.ch('Back'); notes.push('quell: ' + S.flags.quellHow);
    B.visit('w3_onward'); B.ch('To Corvane Reach');
    if (o.wreck){ B.visit('w3_wreck'); B.ch('Go aboard'); await fight(); B.ch('Back'); restAt('w3_reeds'); }
    B.visit('w3_scout'); B.ch(B.has('Swim close') ? 'Swim close' : 'Count them'); B.ch('Back');
    B.spendAll(['bows','tough']); restAt('w3_reeds');
    B.visit('w3_barge'); notes.push('boss at level ' + S.level); B.ch('Fight'); await fight();
    B.ch('Decide'); B.ch(o.barge === 'crown' ? 'Steer it' : 'Open the seacocks'); B.ch('Continue'); B.ch('End of chapter 3');
    return notes;
  };
  // The Act 2 party engine, before any Act 2 chapter exists: registers a throwaway party chapter, pools supplies,
  // runs a four-hero fight, opens a hero's sheet over the party, saves and reloads, restarts, then removes it all.
  B.partyTest = async () => {
    const notes = [], ok = (c, t) => { if (!c) fail('party: ' + t); };
    ok(partyReady(), 'not ready after every chapter 3');
    const pre = partyStep(); notes.push('card before: ' + pre.kind);
    const gold0 = PARTY.reduce((n, id) => n + (M.heroes[id].gold || 0), 0), xp0 = PARTY.map(id => M.heroes[id].xp);
    const realCh1 = HEROES.party.chapters[1]; HEROES.party.chapters[1] = {title:'Party test', start:'zz_party'};
    SCENES.zz_party = {view: () => ({title:'Party test', text:['Four heroes in one place.'], choices:[{label:'Fight together', act: () => startCombat('zz_party')}, partyRest(), Object.assign({label:'Lore check', act: () => {}}, chk('lore', 1)), Object.assign({label:'Ilsa check', act: () => {}}, chkBy('ilsa', 'arcane', 1))].filter(Boolean)})};
    SCENES.zz_partyWin = {view: () => ({title:'Won', text:['Done.'], choices:[{label:'Finish the test', act: () => { S.mode = 'end'; save(); render(true); }}]})};
    COMBATS.zz_party = {title:'Party test', enemies:() => ['shardbound', 'sarneguard', 'sarneguard', 'inkwraith', 'voss', 'hale'], lethal:true, win:'zz_partyWin', back:'zz_party', intro:'A test fight.'};
    try {
      screen = 'select'; render(true);
      ok(document.querySelector('.hero.party'), 'no Act 2 card');
      [...document.querySelectorAll('.hero.party .btn')].find(b => /Act 2/.test(b.textContent)).click();
      ok(S === M.party && S.scene === 'zz_party', 'did not start the party chapter');
      ok(M.party.gold === gold0 && PARTY.every(id => M.heroes[id].gold === 0), 'gold not pooled');
      ok(document.querySelectorAll('.pm-who').length === 4, 'top bar does not show four heroes');
      const xpStart = PARTY.map(id => M.heroes[id].xp); // after any catch-up at the chapter start
      ok(B.has('Lore check') && B.has('Ilsa check'), 'party skill checks failed');
      B.ch('Fight together');
      ok(C && C.party && C.units.filter(u => u.hero).length === 4, 'party fight does not have four heroes');
      notes.push('heroes: ' + C.units.filter(u => u.hero).map(u => `${u.name} ${u.hp}/${u.max} ${u.row}`).join(', '));
      await fight();
      ok(PARTY.every((id, i) => M.heroes[id].xp > xpStart[i]), 'not everyone got experience');
      notes.push('fight won, xp each +' + (M.heroes.kael.xp - xpStart[0]));
      // a hero's sheet over the party: S is the hero while open, the party again after
      openSheet(); [...document.querySelectorAll('.modal .btn')].find(b => b.textContent.startsWith('Ilsa Venn')).click();
      ok(S === M.heroes.ilsa && document.querySelector('.modal h2').textContent === 'Ilsa Venn', 'Ilsa’s sheet did not open');
      const plus = [...document.querySelectorAll('.modal .pm')].find(b => b.textContent === '+' && !b.disabled);
      if (plus) plus.click();
      ok(S === M.heroes.ilsa && document.querySelector('.pm-who'), 'sheet click lost the party page');
      closeModal(); ok(S === M.party, 'S not back to the party after closing the sheet');
      B.ch('Finish the test');
      ok(document.querySelector('.end h2').textContent.includes('Act 2'), 'party chapter end did not render');
      // save and reload
      const saved = JSON.stringify(M); M = JSON.parse(saved); S = null; screen = 'select'; render(true);
      beginParty(); ok(S === M.party && S.mode === 'end', 'party did not reload at its chapter end');
      // restart the chapter: heroes go back to how they were when it began
      restartChapter(); ok(S === M.party && S.scene === 'zz_party' && M.heroes.kael.xp === xpStart[0], 'restart did not restore the chapter start');
      // back to a solo hero and their ending
      beginHero('kael'); ok(S === M.heroes.kael && document.querySelector('.end'), 'switching back to Kael failed');
      notes.push('sheet, save/reload, restart and switch: ok');
    } finally {
      if (realCh1) HEROES.party.chapters[1] = realCh1; else delete HEROES.party.chapters[1]; delete SCENES.zz_party; delete SCENES.zz_partyWin; delete COMBATS.zz_party;
      delete M.party; if (M.cur === 'party') M.cur = 'kael';
    }
    return notes;
  };
  // ---- Act 2 (party) ----
  // How the bot builds each hero (utility skills first, like a player), for the party route and party sims
  const HERO_BUILD = {kael:[['leadership','lore','lockpick','survival'], ['blades','tough']], ilsa:[['lore','lockpick','leadership','stealth'], ['arcane','spellcraft']],
    tamsin:[['divine','leadership','maces','survival'], ['divine','maces']], wren:[['lockpick','lore','leadership','stealth'], ['bows','tough']]};
  B.spendParty = () => { M.party.members.forEach(id => asHeroState(id, () => B.spendAll(HERO_BUILD[id][1]))); };
  B.party1 = async (o) => {
    const notes = []; const grab = () => document.querySelectorAll('.scene .echo').forEach(e => notes.push(S.scene + ': ' + e.textContent.slice(0, 70)));
    const st = partyStep(); if (st.kind !== 'start') throw new Error('Act 2 not startable: ' + JSON.stringify(st));
    screen = 'select'; render(true);
    [...document.querySelectorAll('.hero.party .btn')].find(b => /Begin Act 2/.test(b.textContent)).click();
    notes.push('levels ' + PARTY.map(id => HEROES[id].name + ' ' + M.heroes[id].level).join(', ') + ', gold ' + S.gold);
    B.ch('Kael'); B.ch('Ilsa'); B.ch('Tamsin'); B.ch('Wren'); B.ch('Down into');
    grab(); B.ch(o.trust === 'wren' ? 'Wren lowers' : 'Kael lowers');
    grab(); B.ch(o.shown === 'tamsin' ? 'Tamsin shows' : 'Ilsa shows');
    B.ch('Fight together'); await fight(); notes.push('freed ' + S.flags.squareFreed);
    B.ch(o.base === 'hostel' ? 'Pilgrims' : 'Gull’s Rest');
    for (const who of ['Hask', 'Bracken', 'Tobin']){ B.visit('a21_base'); B.ch(who); B.ch('Back'); }
    B.spendParty();
    B.visit('a21_court'); grab(); notes.push('crown ' + crownStanding() + ' ' + crownMood()); B.ch('Back');
    if (o.town){
      B.visit('a21_townhouse');
      if (o.town === 'fight' || !(B.has('Read the marks') || B.has('Slip into'))){ B.ch('Go over the wall'); await fight(); }
      else B.ch(B.has('Read the marks') ? 'Read the marks' : 'Slip into');
      B.ch('Back'); notes.push('lead ' + S.flags.sarneLead);
    }
    if (o.cache){ B.visit('a21_base'); B.rest(); if (S.mode === 'scene') B.ch('Back'); B.visit('a21_cache'); B.ch('Go in'); await fight(); B.ch('Back'); }
    B.spendParty();
    B.visit('a21_base'); B.rest(); if (S.mode === 'scene') B.ch('Back');
    B.visit('a21_under');
    if (o.ward) B.ch(o.ward === 'wren' ? 'Wren puts' : 'Kael puts');
    notes.push('boss at ' + PARTY.map(id => M.heroes[id].level).join('/')); B.ch('Stop him'); await fight();
    B.ch('Decide together'); B.ch(o.pillar === 'watched' ? 'Keep it secret' : 'Report it'); B.ch('Continue'); B.ch('End of Act 2');
    return notes;
  };
  // Party balance sim: four fresh heroes at `xp` each, built like the bot builds them, with Act 2 supplies
  B.psim = function(xp, combatId, n, flags, gear){
    M = {v:2, cur:null, heroes:{kael:null, ilsa:null, tamsin:null, wren:null}}; S = null; C = null;
    PARTY.forEach(id => { beginHero(id, true); B.spend(HERO_BUILD[id][0]); gainXP(xp); B.spendAll(HERO_BUILD[id][1]);
      if (id === 'ilsa') S.flags.word = true; if (id === 'kael') S.gear.armor = 2; if (id === 'wren'){ S.gear.bow = 2; S.gear.armor = 1; }
      restAll(); S.chapter = 3; S.mode = 'end'; });
    M.party = partyState(); Object.assign(M.party.items, {draught:4, tonic:2, aether:2}); Object.assign(M.party.flags, flags || {});
    M.cur = 'party'; S = M.party; save();
    let wins = 0, rounds = 0;
    for (let i = 0; i < n; i++){ const t = B.trial(combatId); if (t.r === 'win') wins++; rounds += t.rounds; }
    return `party L${M.heroes.kael.level} ${combatId}${flags ? ' ' + JSON.stringify(flags) : ''}: first-try wins ${wins}/${n} (${Math.round(wins / n * 100)}%), avg ${Math.round(rounds / n)} rounds`;
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
      if (hasChapter('tamsin', 2)) await B.tamsin2({post:'argue', order:'warners'});
      if (hasChapter('kael', 2)) lines.push('     kael2: ' + (await B.kael2({farm:'talk', prep:'strings', captain:'freed'})).join(' | '));
      if (hasChapter('wren', 2)) lines.push('     wren2: ' + (await B.wren2({gate:'guest', quiver:true, fragment:'kept'})).join(' | '));
      if (hasChapter('ilsa', 3)) lines.push('     ilsa3: ' + (await B.ilsa3({magister:'home'})).join(' | '));
      if (hasChapter('wren', 3)) lines.push('     wren3: ' + (await B.wren3({wreck:true, barge:'sunk'})).join(' | '));
      if (hasChapter('kael', 3)) lines.push('     kael3: ' + (await B.kael3({gate:'water', water:'force', cart:true, yardFight:true, hoard:'exposed'})).join(' | '));
      // The bot's Ilsa never carries Aurel, so put him at the Cathedral here to exercise Tamsin's cure path
      if (hasChapter('tamsin', 3)) { M.heroes.ilsa.flags.aurelSent = true; save(); }
      if (hasChapter('tamsin', 3)) lines.push('     tamsin3: ' + (await B.tamsin3({calm:true, rite:'aurel'})).join(' | '));
      lines.push('     party engine: ' + (await B.partyTest()).join(' | '));
      if (hasChapter('party', 1)) lines.push('     act2 ch1: ' + (await B.party1({trust:'wren', shown:'ilsa', base:'gull', town:'fight', cache:true, ward:'wren', pillar:'watched'})).join(' | '));
    });
    await play('friendly branches: Kael spares Dario, Ilsa reports, Tamsin judges Orrin (held shrine), Wren bluffs and sells, Ilsa ch2 stays silent', async () => {
      await B.kael({dario:'spared'}); await B.ilsa({choice:'report'}); await B.tamsin({orrin:'judged'});
      M.heroes.tamsin.flags.choice = 'defend'; save();
      await B.wren({patrol:'bluff', key:'sold', spend:['lockpick','lore','stealth','bows']});
      if (hasChapter('ilsa', 2)) await B.ilsa2({speak:false, hold:'speak'});
      if (hasChapter('tamsin', 2)) await B.tamsin2({post:'fight', order:'keepers', chapel:false});
      if (hasChapter('kael', 2)) lines.push('     kael2: ' + (await B.kael2({haul:true, pit:false, captain:'handed'})).join(' | '));
      if (hasChapter('wren', 2)) lines.push('     wren2: ' + (await B.wren2({glade:false, fragment:'crown'})).join(' | '));
      if (hasChapter('ilsa', 3)) lines.push('     ilsa3: ' + (await B.ilsa3({postFight:true, magister:'crown'})).join(' | '));
      if (hasChapter('wren', 3)) lines.push('     wren3: ' + (await B.wren3({quell:'pay', barge:'crown'})).join(' | '));
      if (hasChapter('kael', 3)) lines.push('     kael3: ' + (await B.kael3({hoard:'quiet'})).join(' | '));
      if (hasChapter('tamsin', 3)) lines.push('     tamsin3: ' + (await B.tamsin3({rite:'saved', slow:true})).join(' | '));
      if (hasChapter('party', 1)) lines.push('     act2 ch1: ' + (await B.party1({trust:'kael', shown:'tamsin', base:'hostel', pillar:'told'})).join(' | '));
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
    if (COMBATS.t2_boss) for (const orrin of ['freed', undefined, 'judged']) for (const xp of [420, 620]){
      M = null; S = null; beginHero('tamsin', true); S.ally.joined = true; S.ally.hp = allyMax();
      B.spend(['divine','leadership','maces','survival']); gainXP(xp); B.spendAll(['divine','maces']); restAll(); S.flags.orrin = orrin; save();
      let wins = 0; for (let i = 0; i < n; i++) if (B.trial('t2_boss').r === 'win') wins++;
      lines.push(`(Orrin ${orrin || 'never met'}) tamsin L${S.level} t2_boss: first-try wins ${wins}/${n} (${Math.round(wins / n * 100)}%)`);
    }
    // Kael ch2: spared players reach Brask around level 5, Dario-killers around 6 (bigger crew); with and without a prep
    if (COMBATS.k2_boss) for (const [d, prep, xp] of [['spared', null, 620], ['spared', 'strings', 620], ['ally', 'bottleneck', 620], ['killed', null, 880], ['killed', 'strings', 880]]){
      M = null; S = null; beginHero('kael', true); S.ally.joined = true; S.ally.hp = allyMax();
      B.spend(['leadership','lore','lockpick','survival']); gainXP(xp); B.spendAll(['blades','tough']); restAll();
      S.flags.dario = d === 'killed' ? 'killed' : 'spared'; if (d === 'ally') S.flags.darioAlly = true; S.flags.k2Prep = prep; save();
      let wins = 0; for (let i = 0; i < n; i++) if (B.trial('k2_boss').r === 'win') wins++;
      lines.push(`(Dario ${d}, prep ${prep || 'none'}) kael L${S.level} k2_boss: first-try wins ${wins}/${n} (${Math.round(wins / n * 100)}%)`);
    }
    // Wren ch2: with Ysolde's wardens (the usual way) or as the Crown's guest (one more knife); quiver stolen or not
    if (COMBATS.w2_boss) for (const [wardens, quiver, xp] of [[true, false, 400], [true, false, 620], [true, true, 620], [false, false, 620], [false, false, 880]]){
      M = null; S = null; beginHero('wren', true); S.ally.joined = true; S.ally.hp = allyMax();
      B.spend(['lockpick','lore','leadership','stealth']); gainXP(xp); B.spendAll(['bows','tough']); S.gear.bow = 2; restAll();
      S.flags.metAunt = true; S.flags.asGuest = !wardens; S.flags.quiverTaken = quiver; save();
      let wins = 0; for (let i = 0; i < n; i++) if (B.trial('w2_boss').r === 'win') wins++;
      lines.push(`(${wardens ? 'wardens' : 'Crown guest'}, quiver ${quiver ? 'stolen' : 'kept'}) wren L${S.level} w2_boss: first-try wins ${wins}/${n} (${Math.round(wins / n * 100)}%)`);
    }
    // Act 2 ch1: party fights at the levels players reach (level 8–9; the hostile route arrives higher)
    if (COMBATS.a21_boss){
      lines.push(B.psim(1460, 'a21_square', n));
      // party enemies scale to the party's level, so the boss should hold steady from level 8 to 12
      for (const [xp, f] of [[1460, null], [1760, null], [1760, {wardRead:'kael'}], [2060, null], [2660, null]]) lines.push(B.psim(xp, 'a21_boss', n, f));
    }
    // Wren ch3: the Drowned One at levels 6–7; learned the hymn; the Iron Tally helping (Kael freed Brask)
    if (COMBATS.w3_boss) for (const [help, lore, xp] of [[false, false, 1160], [false, true, 1160], [true, true, 1160], [false, true, 860]]){
      M = null; S = null; beginHero('wren', true); S.ally.joined = true; S.ally.hp = allyMax();
      B.spend(['lockpick','lore','leadership','stealth']); gainXP(xp); B.spendAll(['bows','tough']); S.gear.bow = 2; S.gear.armor = 1; restAll();
      Object.assign(S.flags, {tallyHelp:help, ritualLore:lore}); S.items.draught = 3; save();
      let wins = 0; for (let i = 0; i < n; i++) if (B.trial('w3_boss').r === 'win') wins++;
      lines.push(`(${lore ? 'learned the hymn' : 'no hymn'}${help ? ', Iron Tally' : ''}) wren L${S.level} w3_boss: first-try wins ${wins}/${n} (${Math.round(wins / n * 100)}%)`);
    }
    // Tamsin ch3: Saul at levels 7–8, for Kael's hoard choice; slow find adds an ink-wraith
    if (COMBATS.t3_boss) for (const [hoard, late, xp] of [[null, false, 1160], ['exposed', false, 1160], ['quiet', false, 1160], ['quiet', true, 1160], [null, false, 1460]]){
      M = {v:2, cur:null, heroes:{kael: hoard ? {flags:{hoard}, level:1} : null, ilsa:null, tamsin:null, wren:null}}; S = null;
      beginHero('tamsin'); S.ally.joined = true; S.ally.hp = allyMax();
      B.spend(['divine','leadership','maces','survival']); gainXP(xp); B.spendAll(['divine','maces']); restAll();
      S.flags.lateFind = late; S.items.draught = 3; save();
      let wins = 0; for (let i = 0; i < n; i++) if (B.trial('t3_boss').r === 'win') wins++;
      lines.push(`(Kael's hoard ${hoard || 'not yet'}${late ? ', slow find' : ''}) tamsin L${S.level} t3_boss: first-try wins ${wins}/${n} (${Math.round(wins / n * 100)}%)`);
    }
    // Ilsa ch3: Hale at levels 7–8; hid the pages or reported; read his notes; Marrow's riders (Wren gave the fragment)
    if (COMBATS.i3_boss) for (const [choice, lore, escort, xp] of [['hide', true, false, 1460], ['hide', false, false, 1160], ['report', true, false, 1160], ['report', true, true, 1160]]){
      M = null; S = null; beginHero('ilsa', true); S.ally.joined = true; S.ally.hp = allyMax();
      B.spend(['lore','lockpick','leadership','stealth']); gainXP(xp); B.spendAll(['arcane','spellcraft']); restAll();
      Object.assign(S.flags, {word:true, choice, leashLore:lore, escort}); S.items.draught = 3; save();
      let wins = 0; for (let i = 0; i < n; i++) if (B.trial('i3_boss').r === 'win') wins++;
      lines.push(`(${choice === 'hide' ? 'hid the pages' : 'reported'}${lore ? ', read his notes' : ''}${escort ? ', Marrow’s riders' : ''}) ilsa L${S.level} i3_boss: first-try wins ${wins}/${n} (${Math.round(wins / n * 100)}%)`);
    }
    // Kael ch3: Voss at levels 7–8, for each of Wren's barge outcomes (her ch3 writes `barge`)
    if (COMBATS.k3_boss) for (const [barge, xp] of [[null, 1160], ['sunk', 1160], ['crown', 1160], [null, 1460]]){
      M = {v:2, cur:null, heroes:{kael:null, ilsa:null, tamsin:null, wren: barge ? {flags:{barge}, level:1} : null}}; S = null;
      beginHero('kael'); S.ally.joined = true; S.ally.hp = allyMax();
      B.spend(['leadership','lore','lockpick','survival']); gainXP(xp); B.spendAll(['blades','tough']); S.gear.armor = 1; S.items.draught = 3; restAll(); save();
      let wins = 0; for (let i = 0; i < n; i++) if (B.trial('k3_boss').r === 'win') wins++;
      lines.push(`(Wren's barge ${barge || 'not yet'}) kael L${S.level} k3_boss: first-try wins ${wins}/${n} (${Math.round(wins / n * 100)}%)`);
    }
    try { localStorage.clear(); } catch (e) {} M = null; S = null; C = null; screen = 'title'; render(true);
    const errs = B.errors.slice(errs0);
    lines.push('', errs.length ? '== Errors ==\n' + errs.join('\n') : '== No errors ==');
    return lines.join('\n');
  };
})();

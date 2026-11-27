// ================= THE PARTY (ACT 2) =================
// From Act 2 the four heroes play together. The party has its own story state, M.party, shaped like a hero's
// (hero:'party', chapter, mode, scene, map, flags, chronicle, quests, combatId, notice) plus `members`, `rows`, and the
// pooled `gold` and `items`. While the party plays, S is M.party, so scenes, maps and quests work as they do for a hero.
// Each hero's level, skills, attributes, gear and health stay in M.heroes[id]; anything about one hero runs inside
// asHeroState (combat.js). Party chapters register in HEROES.party.chapters, like a hero's, and their scene IDs use
// the prefix a2_. Loads after chapters.js; Act 2 chapter files load after this one.
HEROES.party = {name:'The party', full:'The party', chapters:{}, actions:[], echoes: () => [],
  blurb:'Kael, Ilsa, Tamsin and Wren, together in Corvane.', roleLine:'Act 2 · Together', home:'Corvane'};
const PARTY = ['kael', 'ilsa', 'tamsin', 'wren'];

// Act 2 opens when all four heroes have finished chapter 3
const partyReady = () => !!M && PARTY.every(id => chaptersDone(M.heroes[id]) >= 3);
function partyState(){
  return {v:2, hero:'party', chapter:1, mode:'scene', scene:null, map:null, flags:{}, chronicle:[], quests:{}, combatId:null, notice:null,
    members:PARTY.slice(), rows:{}, gold:0, items:{draught:0, tonic:0, aether:0}};
}
const inParty = () => isPartyState(S);
const memberStates = () => (M && (S && S.members || (M.party && M.party.members)) || PARTY).map(id => M.heroes[id]).filter(Boolean);

// ---------- rules, party-aware ----------
// A party skill check uses the best hero's rank; chkBy() gates a reply on one named hero
const _skSolo = sk;
sk = function(id){ return inParty() ? Math.max(0, ...S.members.map(h => asHeroState(h, () => _skSolo(id)))) : _skSolo(id); };
function chkBy(hero, id, n){ return {req: () => asHeroState(hero, () => _skSolo(id)) >= n, tag:`${HEROES[hero].name} · ${SKILLS[id].name} ${n}`}; }
const _restAllSolo = restAll;
restAll = function(){ if (inParty()) S.members.forEach(h => asHeroState(h, _restAllSolo)); else _restAllSolo(); };
// Everyone in the party earns the full experience; returns "Kael 9"-style labels for anyone who levelled
const _gainXPSolo = gainXP;
gainXP = function(n){
  if (!inParty()) return _gainXPSolo(n);
  const ups = [];
  S.members.forEach(h => asHeroState(h, () => { if (_gainXPSolo(n).length) ups.push(`${HEROES[h].name} ${S.level}`); }));
  return ups;
};
// Someone in the party is hurt or short of spell points (for "Rest" choices in party scenes)
const partyHurt = () => S.members.some(h => asHeroState(h, () => S.pc.hp < pcMax() || S.pc.sp < spMax()));
const partyRest = (text) => partyHurt() ? {label:'Rest (restores everyone’s health and spell points)', act: () => { restAll(); S.notice = text || 'You rest. Everyone’s health and spell points are restored.'; render(); }} : null;
// Party experience: each hero gets PARTY_XP_SHARE of what a fight or scene is worth. With the full amount, parties
// gained 2–4 levels a chapter and reached level 20+ by A2·3, past the point where levels make heroes much stronger.
const PARTY_XP_SHARE = 0.5;
const partyXP = n => Math.round(n * PARTY_XP_SHARE);
const xpNoteParty = n => { n = partyXP(n); const ups = gainXP(n); return `+${n} experience each${ups.length ? `. Level up: ${ups.join(', ')}.` : '.'}`; };

// ---------- starting and restarting ----------
function beginParty(){
  if (!M.party){
    const P = partyState();
    // pool everyone's crowns and supplies into the party pack
    PARTY.forEach(id => { const s = M.heroes[id]; P.gold += s.gold || 0; s.gold = 0;
      Object.keys(P.items).forEach(k => { P.items[k] += (s.items && s.items[k]) || 0; if (s.items) s.items[k] = 0; }); });
    M.party = P;
  }
  M.cur = 'party'; S = M.party; screen = 'game';
  if (!S.scene && !S.map){ beginPartyChapter(S.chapter || 1); return; }
  if (S.mode === 'combat' && S.combatId) startCombat(S.combatId);
  else { if (S.mode === 'combat') S.mode = 'map'; save(); render(true); }
}
// Every hero more than 2 levels behind the leader catches up, then everyone rests. Works for the party and the pairs.
function beginPartyChapter(n){
  if (S.hero === 'party' && n >= FINALE_CHAPTER) poolPairs();
  S.chapter = n; S.mode = 'scene'; S.map = null; S.combatId = null;
  const ups = [];
  S.members.forEach(h => asHeroState(h, () => { if (catchUp().length) ups.push(`${HEROES[h].name} ${S.level}`); }));
  restAll();
  S.chapterSnap = null;
  S.chapterSnap = JSON.stringify({party:S, heroes:Object.fromEntries(S.members.map(h => [h, M.heroes[h]]))});
  S.notice = ups.length ? `Catch-up: ${ups.join(', ')}. New skill points to spend.` : null;
  chron(`${groupActLabel(S.hero, n).replace(/^the/, "The")}, chapter ${n} began: ${chapterTitle(S.hero, n)}.`);
  go(HEROES[S.hero].chapters[n].start);
}
const _restartSolo = restartChapter;
restartChapter = function(){
  if (!inParty()) return _restartSolo();
  C = null;
  const snap = S.chapterSnap; if (!snap) return;
  const d = JSON.parse(snap);
  Object.keys(d.heroes).forEach(h => { M.heroes[h] = d.heroes[h]; });
  S = d.party; S.chapterSnap = snap; storeGroup(S);
  screen = 'game'; go(HEROES[S.hero].chapters[S.chapter].start);
};
// What the Act 2 card on the select screen offers. Party chapters from FINALE_CHAPTER on are the finale: they wait
// until both Act 3 pairs have finished their chapters.
function partyStep(){
  if (!partyReady()) return {can:false, kind:'locked'};
  const p = M.party;
  if (!p) return hasChapter('party', 1) ? {can:true, kind:'start', n:1} : {can:false, kind:'unbuilt', n:1};
  if (p.mode !== 'end') return hasChapter('party', chapterOf(p)) ? {can:true, kind:'continue', n:chapterOf(p)} : {can:false, kind:'unbuilt', n:chapterOf(p)};
  const n = chapterOf(p) + 1;
  if (n >= FINALE_CHAPTER && !Object.keys(PAIRS).every(id => chaptersDone(groupState(id)) >= PAIR_CHAPTERS)) return {can:false, kind:'pairs', n};
  return hasChapter('party', n) ? {can:true, kind:'next', n} : {can:false, kind:'unbuilt', n};
}

// ---------- Act 3: the pairs ----------
// After Act 2 the party splits into two pairs, each its own story state in M.pairs (shaped like M.party, with
// hero:'south' | 'west', its two members and `allies:true`, so the heroes' companions fight beside them). The player
// switches between the pairs like the heroes in Act 1, and a pair can't be more than one chapter ahead: pair chapter
// n needs the other pair to have finished n − 1. Each pair writes its own flags; read the other's with pairF(id) and
// the Act 2 party's with partyF(). Then the party regroups for the finale, party chapters FINALE_CHAPTER and on.
const PAIRS = {south:['kael', 'wren'], west:['ilsa', 'tamsin']};
const PAIR_CHAPTERS = 2, FINALE_CHAPTER = 5;
const PAIR_ALLY = {hp:3, dmg:2.5}; // companions toughened to fight at party scale
HEROES.south = {name:'Kael and Wren', full:'Kael and Wren', chapters:{}, actions:[], echoes: () => [],
  blurb:'South, after House Sarne’s shards.', roleLine:'Act 3 · South', home:'The south'};
HEROES.west = {name:'Ilsa and Tamsin', full:'Ilsa and Tamsin', chapters:{}, actions:[], echoes: () => [],
  blurb:'West, to the Arcanum.', roleLine:'Act 3 · West', home:'The west'};
const isGroupId = id => id === 'party' || id in PAIRS;
const groupState = id => !M ? null : id === 'party' ? M.party : (M.pairs || {})[id];
const curGroup = () => (M && isGroupId(M.cur)) ? groupState(M.cur) : null;
function storeGroup(s){ if (s.hero === 'party') M.party = s; else (M.pairs = M.pairs || {})[s.hero] = s; }
const partyF = () => (M && M.party && M.party.flags) || {};
const pairF = id => (groupState(id) && groupState(id).flags) || {};
const otherPair = id => id === 'south' ? 'west' : 'south';
const groupActLabel = (id, n) => id === 'party' ? (n >= FINALE_CHAPTER ? 'the finale' : 'Act 2') : `Act 3 (${HEROES[id].name})`;
const act3Ready = () => !!(M && M.party && chaptersDone(M.party) >= 4);
// Split the party's pack between the two pairs, the first time either starts
function makePairs(){
  if (M.pairs) return;
  M.pairs = {};
  Object.keys(PAIRS).forEach((id, i) => {
    const P = Object.assign(partyState(), {hero:id, members:PAIRS[id].slice(), allies:true});
    P.gold = i ? Math.floor(M.party.gold / 2) : Math.ceil(M.party.gold / 2);
    Object.keys(P.items).forEach(k => { const t = M.party.items[k] || 0; P.items[k] = i ? Math.floor(t / 2) : Math.ceil(t / 2); });
    P.flags.fromParty = true;
    M.pairs[id] = P;
  });
  M.party.gold = 0; Object.keys(M.party.items).forEach(k => { M.party.items[k] = 0; });
}
// The pairs' packs come back together for the finale
function poolPairs(){
  if (!M.pairs || M.party.pooled) return;
  Object.values(M.pairs).forEach(p => { M.party.gold += p.gold; p.gold = 0;
    Object.keys(M.party.items).forEach(k => { M.party.items[k] += p.items[k] || 0; p.items[k] = 0; }); });
  M.party.pooled = true;
}
function beginPair(id){
  makePairs();
  M.cur = id; S = M.pairs[id]; screen = 'game';
  if (!S.scene && !S.map){ beginPartyChapter(S.chapter || 1); return; }
  if (S.mode === 'combat' && S.combatId) startCombat(S.combatId);
  else { if (S.mode === 'combat') S.mode = 'map'; save(); render(true); }
}
// What a pair's card on the select screen offers
function pairStep(id){
  if (!act3Ready()) return {can:false, kind:'locked'};
  const p = groupState(id);
  const lockedBy = n => chaptersDone(groupState(otherPair(id))) < n - 1;
  if (!p) return hasChapter(id, 1) ? {can:true, kind:'start', n:1} : {can:false, kind:'unbuilt', n:1};
  if (!p.scene && !p.map) return hasChapter(id, chapterOf(p)) ? {can:true, kind:'start', n:chapterOf(p)} : {can:false, kind:'unbuilt', n:chapterOf(p)};
  if (p.mode !== 'end') return hasChapter(id, chapterOf(p)) ? {can:true, kind:'continue', n:chapterOf(p)} : {can:false, kind:'unbuilt', n:chapterOf(p)};
  const n = chapterOf(p) + 1;
  if (n > PAIR_CHAPTERS) return {can:false, kind:'done', n};
  if (!hasChapter(id, n)) return {can:false, kind:'unbuilt', n};
  return lockedBy(n) ? {can:false, kind:'wait', n} : {can:true, kind:'next', n};
}
// The select-screen step for any group
const groupStep = id => id === 'party' ? partyStep() : pairStep(id);

// ---------- rendering ----------
// While a hero's character sheet is open over a party scene, S points at that hero; the page behind it still
// renders as the party.
let sheetHero = null;
const _renderSolo = render;
render = function(scrollTop){
  const G = curGroup();
  if (!(G && screen === 'game')) return _renderSolo(scrollTop);
  const keep = S; S = G;
  try { _renderSolo(scrollTop); } finally { S = sheetHero ? keep : G; }
};
const _closeModal = closeModal;
closeModal = function(){ _closeModal(); if (sheetHero){ sheetHero = null; if (curGroup()) S = curGroup(); } };

const _renderTopSolo = renderTop;
renderTop = function(){
  if (!inParty()) return _renderTopSolo();
  const inCombat = !!C;
  const pts = memberStates().reduce((n, s) => n + s.skillPts + s.attrPts, 0);
  const members = S.members.map(hid => asHeroState(hid, () => {
    const u = inCombat && !C.over ? U(hid) : null;
    const hp = u ? u.hp : S.pc.hp, max = u ? u.max : pcMax();
    return h('div', {class:'pm-who'}, h('b', {}, HEROES[hid].name), h('span', {class:'muted'}, ` ${S.level}`),
      h('div', {class:'meter'}, bar(hp, max), h('span', {class:'hp'}, `${hp}/${max}`)));
  }));
  return h('div', {class:'top party'},
    h('div', {class:'who'}, h('div', {class:'name'}, HEROES[S.hero].name + ' ', h('span', {}, `${S.gold} crowns`)), h('div', {class:'pmembers'}, members)),
    h('div', {class:'tbtns'},
      h('button', {class:'tbtn', onclick: openSheet, disabled: inCombat, title: inCombat ? 'Not during a fight' : null}, 'Characters', pts > 0 ? h('span', {class:'badge'}, pts) : null),
      h('button', {class:'tbtn', onclick: openJournal}, 'Journal'),
      h('button', {class:'tbtn', onclick: openMenu}, 'Menu')));
};

// Pick whose sheet to open; each sheet is the hero's own, and the pack shows the group's shared supplies
const _openSheetSolo = openSheet;
openSheet = function(){
  if (!inParty()) return _openSheetSolo();
  if (S.mode === 'combat') return;
  const G = S;
  modal('Characters',
    h('p', {class:'muted', style:'margin:0'}, 'Each hero keeps their own skills and gear. Crowns and supplies are shared.'),
    h('div', {class:'sec'}, h('div', {class:'kv'}, h('div', {}, h('span', {}, 'Crowns '), G.gold),
      Object.keys(ITEMS).map(id => h('div', {}, h('span', {}, ITEMS[id].name + ' '), G.items[id] || 0)))),
    h('div', {style:'display:flex;flex-direction:column;gap:8px'}, G.members.map(hid => {
      const s = M.heroes[hid]; const p = s.skillPts + s.attrPts;
      return h('button', {class:'btn ghost', onclick: () => { sheetHero = hid; S = M.heroes[hid]; _openSheetSolo(); }},
        `${HEROES[hid].full}, level ${s.level}`, p ? h('span', {class:'badge'}, p) : null);
    })));
};

// What can be played next from a group's chapter end: its own next chapter, the other pair, the finale or Act 3
function groupNext(){
  const out = [], add = (id, label) => out.push({label, act: () => { const st = groupStep(id);
    if (id === 'party'){ M.cur = 'party'; S = M.party; screen = 'game'; beginPartyChapter(st.n); }
    else if (st.kind === 'next'){ beginPair(id); beginPartyChapter(st.n); } else beginPair(id); }});
  const mine = groupStep(S.hero);
  if (mine.can) add(S.hero, `Begin chapter ${mine.n}`);
  if (act3Ready()) Object.keys(PAIRS).filter(id => id !== S.hero).forEach(id => {
    const st = pairStep(id); if (st.can) add(id, `${st.kind === 'continue' ? 'Continue' : 'Play'} ${HEROES[id].name}`); });
  if (S.hero !== 'party' && partyStep().can) add('party', 'Begin the finale');
  return out;
}
const _renderEndSolo = renderEnd;
renderEnd = function(){
  if (!inParty()) return _renderEndSolo();
  const n = chapterOf(S), next = groupNext(), act = groupActLabel(S.hero, n);
  app.append(h('div', {class:'end', style:'padding-top:28px'},
    h('h2', {}, `End of ${act}, chapter ${n}: ${chapterTitle(S.hero, n)}`),
    h('p', {}, memberStates().map(s => `${HEROES[s.hero].name} ${s.level}`).join(' · ')),
    h('h3', {style:'font-size:20px;margin:18px 0 6px'}, 'How your choices echo'),
    HEROES[S.hero].echoes().map(t => h('div', {class:'echo', html:t})),
    h('h3', {style:'font-size:20px;margin:18px 0 6px'}, 'Chronicle'),
    S.chronicle.map(t => h('div', {class:'q', style:'font-size:15px'}, t)),
    h('p', {class:'muted', style:'margin-top:18px'}, next.length ? 'What next?' : S.flags.gameOver ? 'The end of The Sundered Reach, Game 1. Thank you for playing.' : 'The next chapter is being written.'),
    h('div', {style:'display:flex;gap:8px;flex-wrap:wrap'},
      next.map((x, i) => h('button', {class: i ? 'btn ghost' : 'btn', onclick: x.act}, x.label)),
      h('button', {class: next.length ? 'btn ghost' : 'btn', onclick: () => { screen = 'select'; render(true); }}, 'Choose a hero'),
      h('button', {class:'btn ghost', onclick: () => { screen = 'title'; render(true); }}, 'Title screen'))));
};

// The Act 2 card, and from the end of Act 2 the two Act 3 pair cards, under the four heroes on the select screen
const _renderSelectSolo = renderSelect;
renderSelect = function(){
  _renderSelectSolo();
  const grid = app.querySelector('.heroes'); if (!grid) return;
  const st = partyStep(), p = M && M.party, finale = p && chapterOf(p) >= 4;
  const label = st.kind === 'locked' ? 'Opens when all four heroes have finished chapter 3.'
    : st.kind === 'pairs' ? 'The four meet again when both pairs have finished their roads.'
    : st.kind === 'unbuilt' ? (p ? (p.flags.gameOver ? 'Game 1 is complete.' : 'The next chapter is being written.') : 'All four have reached Corvane. Act 2 is being written.')
    : st.kind === 'continue' ? `Chapter ${st.n}: ${chapterTitle('party', st.n)}` : `Ready: chapter ${st.n}, ${chapterTitle('party', st.n)}`;
  const btn = st.kind === 'continue' ? 'Continue' : st.kind === 'start' ? 'Begin Act 2' : st.kind === 'next' ? `Begin chapter ${st.n}` : 'Not yet';
  grid.append(h('div', {class:'hero party' + (st.can ? '' : ' locked')},
    h('h3', {}, finale ? 'The four, together' : 'Act 2: Together'), h('div', {class:'role'}, 'Kael · Ilsa · Tamsin · Wren'), h('div', {class:'muted', style:'font-size:14px'}, 'Corvane'),
    h('p', {}, finale ? (p.flags.gameOver ? 'The end of Game 1.' : 'Act 2, and the finale: all four beneath Corvane.') : 'The four meet in the capital as strangers, and find out what the Heartland Wardstone really is.'),
    h('div', {class:'hstatus'}, label),
    h('button', {class:'btn', disabled: !st.can, onclick: () => { if (st.kind === 'next'){ beginParty(); beginPartyChapter(st.n); } else beginParty(); }}, btn)));
  if (!finale) return;
  Object.keys(PAIRS).forEach(id => {
    const ps = pairStep(id);
    const lab = ps.kind === 'done' ? 'Their road is done. Waiting for the others.' : ps.kind === 'wait' ? 'Waiting for the other pair to catch up.'
      : ps.kind === 'unbuilt' ? 'Being written.' : ps.kind === 'continue' ? `Chapter ${ps.n}: ${chapterTitle(id, ps.n)}` : `Ready: chapter ${ps.n}, ${chapterTitle(id, ps.n)}`;
    grid.append(h('div', {class:'hero party' + (ps.can ? '' : ' locked')},
      h('h3', {}, `Act 3: ${HEROES[id].name}`), h('div', {class:'role'}, HEROES[id].roleLine), h('div', {class:'muted', style:'font-size:14px'}, HEROES[id].home),
      h('p', {}, HEROES[id].blurb), h('div', {class:'hstatus'}, lab),
      h('button', {class:'btn', disabled: !ps.can, onclick: () => { if (ps.kind === 'next'){ beginPair(id); beginPartyChapter(ps.n); } else beginPair(id); }},
        ps.kind === 'continue' ? 'Continue' : ps.kind === 'start' ? 'Begin Act 3' : ps.kind === 'next' ? `Begin chapter ${ps.n}` : 'Not yet')));
  });
};

// ---------- level scaling for party fights ----------
// Party enemies are tuned for a party at PARTY_TUNED_LEVEL (or a combat's own `level`). A party that's ahead or behind
// (more or fewer optional fights in Act 1, catch-up) meets enemies scaled to its average level, so a boss stays a
// boss. Health scales faster than damage, so fights get longer rather than spikier. Never below 70%, and no more than
// PARTY_SCALE_CAP levels' worth up: heroes gain little per level past about 14 (skills top out), so more upward scaling
// only made bosses harder the more a party had levelled.
const PARTY_TUNED_LEVEL = 9;
const PARTY_SCALE = {hp:0.08, dmg:0.05};
const PARTY_SCALE_CAP = 2; // levels above the tuning level that still scale; past it, being ahead pays off
const PAIR_SCALE = {hp:0.04, dmg:0.03}; // Act 3 pairs: half the slope; with only two heroes, a level's worth of scaling swings a fight much harder
function partyLevel(ids){ const G = curGroup(); const ls = (ids || (G ? G.members : PARTY)).map(id => M.heroes[id].level); return ls.reduce((a, b) => a + b, 0) / ls.length; }
function partyScaleFactors(def, ids){
  const d = Math.min(PARTY_SCALE_CAP, partyLevel(ids) - (def.level || PARTY_TUNED_LEVEL));
  const sc = (curGroup() && curGroup().allies) ? PAIR_SCALE : PARTY_SCALE;
  return {hp: Math.max(0.7, 1 + sc.hp * d), dmg: Math.max(0.7, 1 + sc.dmg * d)};
}
function scalePartyEnemies(enemies, def, ids){
  const f = partyScaleFactors(def, ids);
  if (f.hp === 1 && f.dmg === 1) return;
  enemies.forEach(e => { e.hp = e.max = Math.round(e.max * f.hp); e.dmg = e.dmg.map(x => Math.round(x * f.dmg)); });
}

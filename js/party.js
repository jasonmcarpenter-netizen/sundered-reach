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
const memberStates = () => (M && M.party ? M.party.members : PARTY).map(id => M.heroes[id]).filter(Boolean);

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
const xpNoteParty = n => { const ups = gainXP(n); return `+${n} experience each${ups.length ? `. Level up: ${ups.join(', ')}.` : '.'}`; };

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
// Every hero more than 2 levels behind the party's leader catches up, then everyone rests
function beginPartyChapter(n){
  S.chapter = n; S.mode = 'scene'; S.map = null; S.combatId = null;
  const ups = [];
  S.members.forEach(h => asHeroState(h, () => { if (catchUp().length) ups.push(`${HEROES[h].name} ${S.level}`); }));
  restAll();
  S.chapterSnap = null;
  S.chapterSnap = JSON.stringify({party:S, heroes:Object.fromEntries(S.members.map(h => [h, M.heroes[h]]))});
  S.notice = ups.length ? `Catch-up: ${ups.join(', ')}. New skill points to spend.` : null;
  chron(`Act 2, chapter ${n} began: ${chapterTitle('party', n)}.`);
  go(HEROES.party.chapters[n].start);
}
const _restartSolo = restartChapter;
restartChapter = function(){
  if (!inParty()) return _restartSolo();
  C = null;
  const snap = S.chapterSnap; if (!snap) return;
  const d = JSON.parse(snap);
  Object.keys(d.heroes).forEach(h => { M.heroes[h] = d.heroes[h]; });
  S = d.party; S.chapterSnap = snap; M.party = S;
  screen = 'game'; go(HEROES.party.chapters[S.chapter].start);
};
// What the Act 2 card on the select screen offers
function partyStep(){
  if (!partyReady()) return {can:false, kind:'locked'};
  const p = M.party;
  if (!p) return hasChapter('party', 1) ? {can:true, kind:'start', n:1} : {can:false, kind:'unbuilt', n:1};
  if (p.mode !== 'end') return hasChapter('party', chapterOf(p)) ? {can:true, kind:'continue', n:chapterOf(p)} : {can:false, kind:'unbuilt', n:chapterOf(p)};
  const n = chapterOf(p) + 1;
  return hasChapter('party', n) ? {can:true, kind:'next', n} : {can:false, kind:'unbuilt', n};
}

// ---------- rendering ----------
// While a hero's character sheet is open over a party scene, S points at that hero; the page behind it still
// renders as the party.
let sheetHero = null;
const _renderSolo = render;
render = function(scrollTop){
  if (!(M && M.cur === 'party' && M.party && screen === 'game')) return _renderSolo(scrollTop);
  const keep = S; S = M.party;
  try { _renderSolo(scrollTop); } finally { S = sheetHero ? keep : M.party; }
};
const _closeModal = closeModal;
closeModal = function(){ _closeModal(); if (sheetHero){ sheetHero = null; if (M && M.cur === 'party' && M.party) S = M.party; } };

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
    h('div', {class:'who'}, h('div', {class:'name'}, 'The party ', h('span', {}, `${S.gold} crowns`)), h('div', {class:'pmembers'}, members)),
    h('div', {class:'tbtns'},
      h('button', {class:'tbtn', onclick: openSheet, disabled: inCombat, title: inCombat ? 'Not during a fight' : null}, 'Characters', pts > 0 ? h('span', {class:'badge'}, pts) : null),
      h('button', {class:'tbtn', onclick: openJournal}, 'Journal'),
      h('button', {class:'tbtn', onclick: openMenu}, 'Menu')));
};

// Party: pick whose sheet to open; each sheet is the hero's own, and the pack shows the party's shared supplies
const _openSheetSolo = openSheet;
openSheet = function(){
  if (!inParty()) return _openSheetSolo();
  if (S.mode === 'combat') return;
  modal('Characters',
    h('p', {class:'muted', style:'margin:0'}, 'Each hero keeps their own skills and gear. Crowns and supplies are shared.'),
    h('div', {class:'sec'}, h('div', {class:'kv'}, h('div', {}, h('span', {}, 'Crowns '), M.party.gold),
      Object.keys(ITEMS).map(id => h('div', {}, h('span', {}, ITEMS[id].name + ' '), M.party.items[id] || 0)))),
    h('div', {style:'display:flex;flex-direction:column;gap:8px'}, M.party.members.map(hid => {
      const s = M.heroes[hid]; const p = s.skillPts + s.attrPts;
      return h('button', {class:'btn ghost', onclick: () => { sheetHero = hid; S = M.heroes[hid]; _openSheetSolo(); }},
        `${HEROES[hid].full}, level ${s.level}`, p ? h('span', {class:'badge'}, p) : null);
    })));
};

const _renderEndSolo = renderEnd;
renderEnd = function(){
  if (!inParty()) return _renderEndSolo();
  const n = chapterOf(S), next = partyStep();
  app.append(h('div', {class:'end', style:'padding-top:28px'},
    h('h2', {}, `End of Act 2, chapter ${n}: ${chapterTitle('party', n)}`),
    h('p', {}, memberStates().map(s => `${HEROES[s.hero].name} ${s.level}`).join(' · ')),
    h('h3', {style:'font-size:20px;margin:18px 0 6px'}, 'How your choices echo'),
    HEROES.party.echoes().map(t => h('div', {class:'echo', html:t})),
    h('h3', {style:'font-size:20px;margin:18px 0 6px'}, 'Chronicle'),
    S.chronicle.map(t => h('div', {class:'q', style:'font-size:15px'}, t)),
    h('p', {class:'muted', style:'margin-top:18px'}, next.can ? `Next: Act 2, chapter ${next.n}, ${chapterTitle('party', next.n)}.` : 'The rest of Act 2 is being written.'),
    h('div', {style:'display:flex;gap:8px;flex-wrap:wrap'},
      next.can ? h('button', {class:'btn', onclick: () => beginPartyChapter(next.n)}, `Begin chapter ${next.n}`) : null,
      h('button', {class: next.can ? 'btn ghost' : 'btn', onclick: () => { screen = 'select'; render(true); }}, 'Choose a hero'),
      h('button', {class:'btn ghost', onclick: () => { screen = 'title'; render(true); }}, 'Title screen'))));
};

// The Act 2 card under the four heroes on the select screen
const _renderSelectSolo = renderSelect;
renderSelect = function(){
  _renderSelectSolo();
  const grid = app.querySelector('.heroes'); if (!grid) return;
  const st = partyStep(), p = M && M.party;
  const label = st.kind === 'locked' ? 'Opens when all four heroes have finished chapter 3.'
    : st.kind === 'unbuilt' ? (p ? 'The next chapter is being written.' : 'All four have reached Corvane. Act 2 is being written.')
    : st.kind === 'continue' ? `Chapter ${st.n}: ${chapterTitle('party', st.n)}` : `Ready: chapter ${st.n}, ${chapterTitle('party', st.n)}`;
  const btn = st.kind === 'continue' ? 'Continue Act 2' : st.kind === 'start' ? 'Begin Act 2' : st.kind === 'next' ? `Begin chapter ${st.n}` : 'Not yet';
  grid.append(h('div', {class:'hero party' + (st.can ? '' : ' locked')},
    h('h3', {}, 'Act 2: Together'), h('div', {class:'role'}, 'Kael · Ilsa · Tamsin · Wren'), h('div', {class:'muted', style:'font-size:14px'}, 'Corvane'),
    h('p', {}, 'The four meet in the capital as strangers, and find out what the Heartland Wardstone really is.'),
    h('div', {class:'hstatus'}, label),
    h('button', {class:'btn', disabled: !st.can, onclick: () => { if (st.kind === 'next'){ beginParty(); beginPartyChapter(st.n); } else beginParty(); }}, btn)));
};

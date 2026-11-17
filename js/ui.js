// ---------- rendering ----------
function render(scrollTop){
  app.innerHTML = '';
  if (screen === 'title') renderTitle();
  else if (screen === 'select') renderSelect();
  else if (S.mode === 'end') renderEnd();
  else {
    app.append(renderTop());
    // A finished fight stays on screen (result, XP, Continue) until leaveCombat clears C,
    // even though endCombat has already moved S.mode on so a reload resumes after the fight.
    if (C) renderCombat();
    else if (S.mode === 'scene') renderScene();
    else if (S.mode === 'map') renderMap();
  }
  if (scrollTop) window.scrollTo(0, 0);
}
function bar(cur, max, cls){ const p = max ? clamp(cur / max, 0, 1) : 0; return h('div', {class:'bar' + (cls ? ' ' + cls : '') + (!cls && p < 0.3 ? ' low' : '')}, h('i', {style:`width:${(p * 100).toFixed(1)}%`})); }
function renderTop(){
  const inCombat = !!C;
  const p = inCombat && !C.over ? U('pc') : null; // once a fight is over, show the saved (post-fight, post-level-up) values
  const hp = p ? p.hp : S.pc.hp, max = p ? p.max : pcMax();
  const sp = p ? p.sp : S.pc.sp, spm = spMax();
  const prev = XP_AT[S.level] || 0, nxt = nextXP(S.level);
  const pts = S.skillPts + S.attrPts;
  return h('div', {class:'top'},
    h('div', {class:'who'},
      h('div', {class:'name'}, H().name + ' ', h('span', {}, `Level ${S.level}`)),
      h('div', {class:'bars'},
        h('div', {class:'meter'}, 'HP', bar(hp, max), `${hp}/${max}`),
        spm ? h('div', {class:'meter'}, 'SP', bar(sp, spm, 'sp'), `${sp}/${spm}`) : null,
        h('div', {class:'meter'}, 'XP', bar(S.xp - prev, nxt - prev, 'xp'), `${S.xp}/${nxt}`)
      )
    ),
    h('div', {class:'tbtns'},
      h('button', {class:'tbtn', onclick: openSheet, disabled: !!inCombat, title: inCombat ? 'Not during a fight' : null}, 'Character', pts > 0 ? h('span', {class:'badge'}, pts) : null),
      h('button', {class:'tbtn', onclick: openJournal}, 'Journal'),
      h('button', {class:'tbtn', onclick: openMenu}, 'Menu')
    )
  );
}
function noticeEl(){ if (!S.notice) return null; const n = h('div', {class:'notice', role:'status'}, S.notice); S.notice = null; return n; }
function para(t){ return t.startsWith('@echo:') ? h('div', {class:'echo', html:t.slice(6)}) : h('p', {html:t}); }
function renderScene(){
  const v = SCENES[S.scene].view();
  const wrap = h('div', {class:'scene'});
  const n = noticeEl(); if (n) wrap.append(n);
  wrap.append(h('h2', {}, v.title));
  wrap.append(h('div', {class:'text'}, v.text.map(para)));
  const ch = h('div', {class:'choices'});
  v.choices.forEach((c, i) => {
    const ok = !c.req || c.req();
    ch.append(h('button', {class:'choice', disabled: !ok, onclick: () => { if (c.act) c.act(); else if (c.go) go(c.go); }},
      h('span', {class:'num'}, i + 1),
      h('span', {}, c.tag ? h('span', {class:'tag ' + (ok ? 'ok' : 'no')}, c.tag) : null, c.label)));
  });
  wrap.append(ch);
  app.append(wrap);
}
function nodeState(n){ return {open: !n.open || n.open(), done: n.done ? n.done() : false}; }
function renderMap(){
  const m = MAPS[S.map];
  const n0 = noticeEl(); if (n0) app.append(n0);
  app.append(h('div', {class:'maptitle'}, h('h2', {}, m.title), h('span', {class:'muted'}, 'Tap a place to go there')));
  app.append(h('p', {class:'muted'}, m.blurb()));
  const pos = {}; m.nodes.forEach(n => pos[n.id] = n);
  let s = `<svg viewBox="0 0 ${m.w} ${m.h}" class="mapsvg" role="img" aria-label="${m.title} map">`;
  m.edges.forEach(([a, b]) => {
    const A = pos[a], B = pos[b]; const lit = nodeState(A).open && nodeState(B).open;
    s += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="${lit ? '#7a6955' : '#3a3128'}" stroke-width="2" ${lit ? '' : 'stroke-dasharray="4 5"'}/>`;
  });
  m.nodes.forEach(n => {
    const {open, done} = nodeState(n);
    const stroke = !open ? '#4a3f33' : done ? '#8a7a64' : '#de8c3c';
    s += `<g class="node${open ? '' : ' locked'}" data-node="${n.id}">`;
    s += `<circle cx="${n.x}" cy="${n.y}" r="14" fill="${done ? '#2c241d' : '#211b16'}" stroke="${stroke}" stroke-width="${open && !done ? 2.5 : 1.5}"/>`;
    if (done) s += `<circle cx="${n.x}" cy="${n.y}" r="4" fill="#8a7a64"/>`;
    else if (open) s += `<circle cx="${n.x}" cy="${n.y}" r="5" fill="#de8c3c"/>`;
    s += `<text x="${n.x}" y="${n.y + 30}" text-anchor="middle" font-size="12.5" fill="${open ? '#efe5d3' : '#6f6455'}" font-family="Alegreya, Georgia, serif">${n.label}</text></g>`;
  });
  s += '</svg>';
  const wrap = h('div', {class:'mapwrap', html:s});
  wrap.querySelectorAll('[data-node]').forEach(g => { const n = pos[g.getAttribute('data-node')]; if (nodeState(n).open) g.addEventListener('click', () => go(n.id)); });
  app.append(wrap);
  app.append(h('div', {class:'spots'}, m.nodes.map(n => {
    const {open, done} = nodeState(n);
    return h('button', {class:'spot', disabled: !open, onclick: () => go(n.id)}, h('b', {}, n.label), h('small', {}, !open ? (n.lockText || 'Not yet') : done ? 'Visited' : n.sub));
  })));
}
function unitCard(u){
  const valid = C.phase === 'target' && validTargets().some(t => t.id === u.id);
  const cls = 'unit' + (C.active === u.id && C.phase !== 'over' ? ' active' : '') + (valid ? ' target' : '') + (u.hp <= 0 ? ' dead' : '');
  const st = u.st; const chips = [];
  if (st.stun) chips.push(['Stunned', 'bad']);
  if (st.bleed) chips.push([`Bleeding ${st.bleed}`, 'bad']);
  if (st.grey) chips.push([`Grey-touched ${st.grey}`, 'grey']);
  if (st.defend) chips.push(['Defending', 'good']);
  if (st.ward) chips.push([`Warded ${st.ward}`, 'good']);
  if (st.guard) chips.push(['Guarding', 'good']);
  if (st.taunt) chips.push(['Drawing attacks', 'good']);
  if (st.inspired) chips.push(['Inspired', 'good']);
  if (st.laststand) chips.push(['Last Stand', 'good']);
  if (st.hidden) chips.push(['Vanished', 'good']);
  if (st.poised) chips.push(['Sure strike', 'good']);
  let intent = null;
  if (u.side === 'enemy' && u.hp > 0) intent = u.winding ? h('div', {class:'intent warn'}, `Readying ${u.spec.name}! ${u.spec.aoe ? 'Hits everyone. Defend or Ward.' : 'Defend or stun it.'}`) : h('div', {class:'intent'}, u.ranged ? 'Ranged attacks' : 'Melee attacks');
  const body = [
    h('div', {class:'un'}, h('span', {}, u.name), h('span', {class:'hp'}, `${u.hp}/${u.max}`)),
    bar(u.hp, u.max),
    u.spMax ? h('div', {class:'spline'}, bar(u.sp, u.spMax, 'sp'), h('span', {class:'hp'}, `SP ${u.sp}/${u.spMax}`)) : null,
    intent,
    valid ? h('div', {class:'intent warn'}, 'Tap to choose') : null,
    chips.length ? h('div', {class:'chips'}, chips.map(([t, c]) => h('span', {class:'chip ' + c}, t))) : null
  ];
  return valid ? h('button', {class:cls, onclick: () => pickTarget(u.id), 'aria-label':`Choose ${u.name}`}, body) : h('div', {class:cls}, body);
}
function rowBlock(units, side){
  const rows = side === 'enemy' ? ['back', 'front'] : ['front', 'back'];
  return h('div', {class:'side'}, rows.map(r => {
    const us = units.filter(u => u.row === r);
    if (!us.length) return null;
    return [h('div', {class:'rowlbl'}, `${side === 'enemy' ? 'Enemy' : 'Your'} ${r} row`), h('div', {class:'row'}, us.map(unitCard))];
  }));
}
function renderCombat(){
  app.append(h('div', {class:'cb-head'}, h('h2', {}, C.def.title), h('span', {class:'muted'}, C.round ? `Round ${C.round}` : '')));
  app.append(rowBlock(C.units.filter(u => u.side === 'enemy'), 'enemy'));
  if (C.order.length){
    const names = C.order.map((id, i) => { const u = U(id); if (!u || u.hp <= 0) return null; return i === C.idx ? h('b', {}, u.name) : h('span', {}, u.name); }).filter(Boolean);
    app.append(h('div', {class:'order'}, 'Turn order: ', names.map((n, i) => i ? [' › ', n] : n)));
  }
  app.append(rowBlock(C.units.filter(u => u.side === 'hero'), 'hero'));
  app.append(actionPanel());
  const lg = h('div', {class:'log', 'aria-live':'polite'}, C.log.slice(-10).map(t => h('div', {}, t)));
  app.append(lg);
  lg.scrollTop = lg.scrollHeight;
}
function actionPanel(){
  const box = h('div', {class:'actions'});
  if (C.phase === 'over'){
    const o = C.over;
    if (o.result === 'lose' && C.def.lethal){
      box.append(h('div', {class:'result'}, h('h3', {style:'color:var(--bad)'}, `${H().name} falls`),
        h('p', {class:'muted'}, 'The story could end here. Try the fight again from the start.'),
        h('div', {style:'display:flex;gap:8px;justify-content:center;flex-wrap:wrap'},
          h('button', {class:'btn', onclick: retryCombat}, 'Retry the fight'),
          h('button', {class:'btn ghost', onclick: stepBack}, 'Step back'))));
      return box;
    }
    const title = o.result === 'win' ? 'Victory' : o.result === 'fled' ? 'You got away' : 'You yield';
    box.append(h('div', {class:'result'}, h('h3', {style:'color:var(--accent)'}, title),
      o.xp ? h('p', {}, `+${o.xp} experience`) : null,
      o.ups.length ? h('p', {class:'pts'}, `Level up! ${H().name} is now level ${S.level}, fully healed, with new skill points to spend.`) : null,
      h('button', {class:'btn', onclick: leaveCombat}, 'Continue')));
    return box;
  }
  const u = U(C.active);
  if (C.phase === 'enemy' || C.phase === 'wait' || !u || u.side !== 'hero'){
    box.append(h('div', {class:'prompt'}, u && u.side === 'enemy' ? `${u.name} is acting…` : '…'));
    return box;
  }
  if (C.phase === 'target'){
    const allyPick = C.pick.item || ACTIONS[C.pick.act].target === 'ally';
    const what = C.pick.item ? ITEMS[C.pick.item].name : ACTIONS[C.pick.act].label;
    box.append(h('div', {class:'prompt'}, `${u.name}: ${what}. ${allyPick ? 'Choose who gets it.' : 'Choose a target above.'}`));
    if (allyPick) box.append(h('div', {class:'abtns'}, validTargets().map(t => h('button', {class:'abtn', onclick: () => pickTarget(t.id)}, t.name, h('small', {}, `${t.hp}/${t.max}`)))));
    box.append(h('div', {style:'margin-top:8px'}, h('button', {class:'btn ghost', onclick: () => { C.pick = null; C.phase = 'player'; render(); }}, 'Cancel')));
    return box;
  }
  box.append(h('div', {class:'prompt'}, `${u.name}’s turn · ${u.row} row`));
  const ids = u.id === 'pc' ? H().actions : ALLIES[S.ally.id].actions;
  const grid = h('div', {class:'abtns'});
  ids.forEach(id => {
    const a = ACTIONS[id];
    if (!a.known(u)) return;
    const cd = u.cd[id] || 0;
    const spShort = a.sp && u.sp < a.sp;
    const ok = a.can(u) && !cd && !spShort;
    const sub = cd ? `Ready in ${cd}` : spShort ? `Needs ${a.sp} SP` : !a.can(u) ? (a.why || 'Not now') : (a.sp ? `${a.sp} SP · ${a.sub}` : a.sub);
    grid.append(h('button', {class:'abtn', disabled: !ok, onclick: () => choose(id)}, a.label, h('small', {}, sub)));
  });
  Object.keys(ITEMS).forEach(id => {
    const n = S.items[id] || 0;
    if (ITEMS[id].mage && !spMax()) return;
    grid.append(h('button', {class:'abtn', disabled: n <= 0, onclick: () => chooseItem(id)}, ITEMS[id].name, h('small', {}, `${n} left`)));
  });
  box.append(grid);
  return box;
}

// ---------- modals ----------
function closeModal(){ modalRoot.innerHTML = ''; }
function modal(title, ...body){
  modalRoot.innerHTML = '';
  const ov = h('div', {class:'overlay', onclick: e => { if (e.target === ov) closeModal(); }},
    h('div', {class:'modal', role:'dialog', 'aria-modal':'true', 'aria-label':title},
      h('div', {class:'mhead'}, h('h2', {}, title), h('button', {class:'x', onclick: closeModal}, 'Close')),
      ...body));
  modalRoot.append(ov);
}
function openSheet(){
  if (S.mode === 'combat') return;
  const added = {skills:{}, attrs:{}}; // points added since this sheet opened, so they can be taken back
  const bump = (kind, id, d) => {
    const before = pcMax(), spBefore = spMax();
    if (kind === 'skill'){ const c = H().cost(id); S.pc.skills[id] = (S.pc.skills[id] || 0) + d; S.skillPts -= d * c; added.skills[id] = (added.skills[id] || 0) + d; }
    else { S.pc.attrs[id] += d; S.attrPts -= d; added.attrs[id] = (added.attrs[id] || 0) + d; }
    S.pc.hp = clamp(S.pc.hp + (pcMax() - before), 1, pcMax());
    S.pc.sp = clamp((S.pc.sp || 0) + (spMax() - spBefore), 0, spMax());
    save(); render(); draw();
  };
  const draw = () => {
    const k = S.pc; const hd = H();
    const statRow = (id, def, cur, add, kind) => {
      const cost = kind === 'skill' ? hd.cost(id) : 1;
      const canAdd = kind === 'skill' ? S.skillPts >= cost && !def.special && cur < 10 : S.attrPts > 0;
      return h('div', {class:'statrow'},
        h('span', {}, def.name, cost > 1 ? h('span', {class:'muted', style:'font-size:13px'}, ` · ${cost} pts`) : null),
        h('button', {class:'pm', disabled: !add, 'aria-label':`Remove a point from ${def.name}`, onclick: () => bump(kind, id, -1)}, '−'),
        h('span', {class:'v', style: add ? 'color:var(--accent)' : null}, cur),
        h('button', {class:'pm', disabled: !canAdd, 'aria-label':`Add a point to ${def.name}`, onclick: () => bump(kind, id, 1)}, '+'),
        h('span', {class:'d'}, def.desc));
    };
    const [lo, hi] = pcDmg();
    const glance = S.hero === 'wren' ? [
      ['Health', `${k.hp}/${pcMax()}`], ['Bow damage', `${bowDmg()[0]}–${bowDmg()[1]}`], ['Bow hit', `${clamp(bowAcc(), 0, 95)}% base`],
      ['Knife', `${lo}–${hi}`], ['Armor', `${pcArmor()} per hit`], ['Bow', S.gear.bowName], ['Crowns', S.gold]
    ] : S.hero === 'tamsin' ? [
      ['Health', `${k.hp}/${pcMax()}`], ['Spell points', `${k.sp}/${spMax()}`],
      ['Mend heals', `${healAmt()}`], ['Smite', `${divineDmg()[0]}–${divineDmg()[1]}`],
      ['Mace', `${lo}–${hi}`], ['Armor', `${pcArmor()} per hit`], ['Lantern', S.gear.focusName], ['Crowns', S.gold]
    ] : S.hero === 'ilsa' ? [
      ['Health', `${k.hp}/${pcMax()}`], ['Spell points', `${k.sp}/${spMax()}`],
      ['Spell damage', `${spellDmg()[0]}–${spellDmg()[1]}`], ['Spell hit', `${clamp(spellAcc(), 0, 95)}% base`],
      ['Dagger', `${lo}–${hi}`], ['Armor', `${pcArmor()} per hit`], ['Focus', S.gear.focusName], ['Crowns', S.gold]
    ] : [
      ['Health', `${k.hp}/${pcMax()}`], ['Damage', `${lo}–${hi}`], ['Hit chance', `${clamp(pcAcc(), 0, 95)}% base`], ['Armor', `${pcArmor()} per hit`],
      ['Block', `${pcBlock()}%`], ['Crowns', S.gold], ['Weapon', S.gear.swordName], ['Shield', S.gear.shieldName]
    ];
    modal(hd.full,
      h('p', {class:'muted', style:'margin:0'}, `${hd.race} ${hd.role}, level ${S.level}. ${hd.costNote}`),
      h('div', {class:'sec'}, h('h3', {}, 'At a glance'), h('div', {class:'kv'}, glance.map(([a, b]) => h('div', {}, h('span', {}, a + ' '), b)))),
      h('div', {class:'sec'}, h('h3', {}, 'Skills ', h('span', {class:'pts'}, `· ${S.skillPts} point${S.skillPts === 1 ? '' : 's'} to spend`)),
        hd.skillList.filter(id => !SKILLS[id].special || (k.skills[id] || 0) > 0).map(id => statRow(id, SKILLS[id], k.skills[id] || 0, added.skills[id], 'skill'))),
      h('div', {class:'sec'}, h('h3', {}, 'Attributes ', S.attrPts > 0 ? h('span', {class:'pts'}, `· ${S.attrPts} to spend`) : h('span', {class:'muted', style:'font-size:13px'}, '· +1 every third level')),
        Object.keys(ATTRS).map(id => statRow(id, ATTRS[id], k.attrs[id], added.attrs[id], 'attr'))),
      h('div', {class:'sec'}, h('h3', {}, 'Signature ability'),
        h('p', {style:'font-size:15px;margin:0'}, h('b', {}, hd.signature[0] + '. '), hd.signature[1], (S.hero === 'ilsa' && !S.flags.word) ? h('span', {class:'muted'}, ' Not learned yet.') : null)),
      h('div', {class:'sec'}, h('h3', {}, 'Pack'),
        Object.keys(ITEMS).filter(id => !ITEMS[id].mage || spMax()).map(id => {
          const full = id === 'aether' ? S.pc.sp >= spMax() : id === 'draught' ? S.pc.hp >= pcMax() : false;
          return h('div', {class:'statrow'}, h('span', {}, `${ITEMS[id].name} × ${S.items[id] || 0}`), h('span'), h('span'),
            h('button', {class:'tbtn', disabled: !(S.items[id] > 0) || full, onclick: () => {
              S.items[id]--;
              if (id === 'draught') healKael(18); else if (id === 'tonic') healKael(5); else S.pc.sp = Math.min(spMax(), S.pc.sp + 15);
              save(); render(); draw();
            }}, `Use on ${hd.name}`),
            h('span', {class:'d'}, ITEMS[id].desc));
        })),
      h('div', {style:'display:flex;gap:8px;margin-top:16px'}, h('button', {class:'btn', onclick: closeModal}, 'Done'))
    );
  };
  draw();
}
function openJournal(){
  const qs = Object.entries(S.quests).sort((a, b) => a[1].order - b[1].order);
  modal(`${H().name}’s Journal`,
    h('div', {class:'sec'}, h('h3', {}, 'Quests'),
      qs.length ? qs.map(([id, q]) => h('div', {class:'q'}, h('b', {}, q.title), h('span', {class:'st ' + q.status}, q.status), h('div', {class:'muted', style:'font-size:15px'}, q.text))) : h('p', {class:'muted'}, 'No quests yet.')),
    h('div', {class:'sec'}, h('h3', {}, 'Chronicle'),
      h('p', {class:'muted', style:'font-size:14px;margin:0 0 6px'}, 'Choices that will echo into the other heroes’ stories.'),
      S.chronicle.length ? S.chronicle.map(t => h('div', {class:'q', style:'font-size:15px'}, t)) : h('p', {class:'muted'}, 'Nothing yet.'))
  );
}
function openMenu(){
  const confirmBox = h('div');
  modal('Menu',
    cloudBox('muted'),
    h('p', {class:'muted'}, 'Each hero keeps their own place.'),
    h('div', {style:'display:flex;flex-direction:column;gap:8px'},
      h('button', {class:'btn', onclick: () => { closeModal(); C = null; screen = 'select'; render(true); }}, 'Switch hero'),
      h('button', {class:'btn ghost', onclick: () => { closeModal(); C = null; screen = 'title'; render(true); }}, 'Title screen'),
      h('button', {class:'btn ghost', onclick: openSaveCode}, 'Save code (move a save by hand)'),
      h('button', {class:'btn ghost', onclick: () => {
        confirmBox.innerHTML = '';
        confirmBox.append(h('p', {}, `Restart ${H().name}’s chapter from the beginning? Only this hero’s progress is lost.`),
          h('div', {style:'display:flex;gap:8px'}, h('button', {class:'btn', onclick: () => { closeModal(); C = null; beginHero(S.hero, true); }}, 'Restart'), h('button', {class:'btn ghost', onclick: () => { confirmBox.innerHTML = ''; }}, 'Keep playing')));
      }}, `Restart ${H().name}’s chapter`),
      confirmBox)
  );
}

// ---------- title, hero select, chapter end ----------
function beginHero(id, fresh){
  if (!M) M = {v:2, cur:null, heroes:{kael:null, ilsa:null, tamsin:null}};
  M.cur = id; screen = 'game';
  if (fresh || !M.heroes[id]){
    S = ({kael:kaelState, ilsa:ilsaState, tamsin:tamsinState, wren:wrenState})[id]();
    M.heroes[id] = S;
    S.pc.hp = pcMax(); S.pc.sp = spMax();
    if (S.ally.joined) S.ally.hp = allyMax(); // Tamsin starts with Bracken already at her side
    go(HEROES[id].start);
    return;
  }
  S = M.heroes[id];
  // Saves made before the line above have Bracken at 0 health; a living companion is never saved at 0
  if (S.ally && S.ally.joined && !S.ally.hp) S.ally.hp = allyMax();
  if (S.mode === 'combat' && S.combatId) startCombat(S.combatId);
  else { if (S.mode === 'combat') S.mode = 'map'; save(); render(true); }
}
function renderTitle(){
  const saved = M || loadMeta();
  const has = saved && Object.values(saved.heroes).some(Boolean);
  const confirmBox = h('div', {style:'margin-top:12px'});
  app.append(h('div', {class:'title'},
    h('h1', {}, 'The Sundered Reach'),
    h('div', {class:'sub'}, 'Book One · Four Lives'),
    h('p', {}, 'Seven Wardstones hold the Hollow beneath the land, and they are cracking. Four strangers will each see one sign of it, long before they see each other.'),
    h('div', {class:'btns'},
      has ? h('button', {class:'btn', onclick: async () => { if (CloudSave.ready){ const r = await CloudSave.pull(); syncFromCloud(r, false); } M = M || saved; screen = 'select'; render(true); }}, 'Continue') : null,
      h('button', {class: has ? 'btn ghost' : 'btn', onclick: () => {
        if (!has){ M = null; S = null; screen = 'select'; render(true); return; }
        confirmBox.innerHTML = '';
        confirmBox.append(h('p', {class:'muted'}, 'Start over? This erases every hero’s progress.'),
          h('div', {class:'btns'}, h('button', {class:'btn', onclick: () => { clearAll(); M = null; S = null; screen = 'select'; render(true); }}, 'Erase and start over'),
            h('button', {class:'btn ghost', onclick: () => { confirmBox.innerHTML = ''; }}, 'Cancel')));
      }}, 'New game')),
    confirmBox,
    cloudBox('cloudline'),
    h('button', {class:'linkbtn', onclick: openSaveCode}, 'Use a save code')
  ));
}
function heroStatus(id){
  const s = M && M.heroes[id];
  if (!s) return {label:'Not started', btn:`Begin ${HEROES[id].name}’s chapter`};
  if (s.mode === 'end') return {label:'Chapter complete', btn:'View the ending', done:true};
  const where = s.mode === 'map' ? MAPS[s.map].title : s.mode === 'combat' ? 'In a fight' : (SCENES[s.scene] && SCENES[s.scene].view ? '' : '');
  return {label:`In progress · level ${s.level}${where ? ' · ' + where : ''}`, btn:'Continue'};
}
function renderSelect(){
  if (selectNotice){ app.append(h('div', {class:'notice', role:'status', style:'margin-top:20px'}, selectNotice)); selectNotice = null; }
  app.append(h('div', {style:'padding-top:28px'}, h('h2', {style:'font-size:30px;color:var(--accent)'}, 'Choose a life'),
    h('p', {class:'muted'}, 'Each hero starts alone, somewhere different. Play their chapters in any order and switch between them from the menu. What one hero does echoes in the others’ stories.')));
  const cards = BUILT.map(id => {
    const hd = HEROES[id]; const st = heroStatus(id);
    return h('div', {class:'hero'},
      h('h3', {}, hd.name), h('div', {class:'role'}, hd.roleLine), h('div', {class:'muted', style:'font-size:14px'}, hd.home), h('p', {}, hd.blurb),
      h('div', {class:'hstatus' + (st.done ? ' done' : '')}, st.label),
      h('button', {class:'btn', onclick: () => beginHero(id)}, st.btn),
      st.done ? h('button', {class:'btn ghost', onclick: () => beginHero(id, true)}, 'Play it again') : null);
  });
  const locked = [].map(x => h('div', {class:'hero locked'}, h('h3', {}, x.n), h('div', {class:'role'}, x.role), h('div', {class:'muted', style:'font-size:14px'}, x.home), h('p', {}, x.t), h('button', {class:'btn ghost', disabled:true}, 'Not built yet')));
  app.append(h('div', {class:'heroes'}, cards, locked));
  app.append(h('div', {style:'margin-top:16px'}, h('button', {class:'btn ghost', onclick: () => { screen = 'title'; render(true); }}, 'Back')));
}
function renderEnd(){
  const hd = H();
  const top = Object.entries(S.pc.skills).filter(([id, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([id, v]) => `${SKILLS[id].name} ${v}`).join(', ');
  const nextId = BUILT.find(id => id !== S.hero && !(M.heroes[id] && M.heroes[id].mode === 'end'));
  const nextDone = !nextId;
  app.append(h('div', {class:'end', style:'padding-top:28px'},
    h('h2', {}, `End of ${hd.name}’s Chapter`),
    h('p', {}, `${hd.name} leaves at level ${S.level}, with ${top}.`),
    h('h3', {style:'font-size:20px;margin:18px 0 6px'}, 'How your choices echo'),
    hd.echoes().map(t => h('div', {class:'echo', html:t})),
    h('h3', {style:'font-size:20px;margin:18px 0 6px'}, 'Chronicle'),
    S.chronicle.map(t => h('div', {class:'q', style:'font-size:15px'}, t)),
    h('p', {class:'muted', style:'margin-top:18px'}, nextDone ? 'Every Act 1 opening chapter is done. Next in the series: Act 2, when the four heroes meet in Corvane.' : `Next: ${HEROES[nextId].name}’s chapter. Your choices here will show up in it.`),
    h('div', {style:'display:flex;gap:8px;flex-wrap:wrap'},
      !nextDone ? h('button', {class:'btn', onclick: () => beginHero(nextId)}, `Play ${HEROES[nextId].name}’s chapter`) : null,
      h('button', {class: nextDone ? 'btn' : 'btn ghost', onclick: () => { screen = 'select'; render(true); }}, 'Choose a hero'),
      h('button', {class:'btn ghost', onclick: () => { screen = 'title'; render(true); }}, 'Title screen'))
  ));
}




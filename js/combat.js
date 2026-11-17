// ---------- navigation ----------
function go(id){
  S.mode = 'scene'; S.scene = id;
  const sc = SCENES[id]; if (sc.enter) sc.enter();
  save(); render(true);
}
function toMap(id){ S.mode = 'map'; S.map = id; save(); render(true); }

// ---------- combat ----------
function startCombat(id){
  const def = COMBATS[id];
  S.mode = 'combat'; S.combatId = id; S.notice = null;
  save(); // the save holds the moment before this fight; reloading or retrying starts it fresh
  const snap = JSON.stringify(S);
  const keys = def.enemies();
  const counts = {}; keys.forEach(k => counts[k] = (counts[k] || 0) + 1);
  const seen = {};
  const enemies = keys.map((k, i) => {
    const d = ENEMIES[k]; seen[k] = (seen[k] || 0) + 1;
    const name = counts[k] > 1 ? `${d.name} ${'ABCD'[seen[k] - 1]}` : d.name;
    return {id:'e' + i, key:k, side:'enemy', name, hp:d.hp, max:d.hp, row:d.row || 'front', dmg:d.dmg, acc:d.acc, dodge:d.dodge, armor:d.armor,
      init:d.init, xp:d.xp, ranged:!!d.ranged, hollow:!!d.hollow, calm:!!d.calm, cleanse:!!d.cleanse, spec:d.spec || null, bleed:d.bleed || 0, greyChance:d.greyChance || 0, st:{}, cd:{}, turns:0, winding:false};
  });
  const hd = H();
  const heroes = [{id:'pc', side:'hero', name:hd.name, hp:Math.max(1, S.pc.hp), max:pcMax(), sp:Math.min(S.pc.sp || 0, spMax()), spMax:spMax(), row:hd.row,
    init:S.pc.attrs.grace * 2, dodge:S.pc.attrs.grace * 2, armor:pcArmor(), st:{}, cd:{}}];
  if (S.ally.joined){
    const a = ALLIES[S.ally.id];
    heroes.push({id:'ally', side:'hero', name:a.name, hp:Math.max(1, S.ally.hp), max:allyMax(), sp:0, spMax:0, row:a.row, init:a.init, dodge:a.dodge, armor:a.armor, st:{}, cd:{}});
  }
  C = {id, def, snap, units:heroes.concat(enemies), order:[], idx:0, round:0, log:[def.intro], phase:'wait', active:null, pick:null, over:null, gen:0, used:{}};
  render(true);
  later(newRound, 350);
}
const U = id => C.units.find(u => u.id === id);
const heroesAlive = () => C.units.filter(u => u.side === 'hero' && u.hp > 0);
const enemiesAlive = () => C.units.filter(u => u.side === 'enemy' && u.hp > 0);
function log(t){ C.log.push(t); if (C.log.length > 40) C.log.shift(); }
function later(fn, ms){
  const g = C.gen;
  const delay = ms != null ? ms : (matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 650);
  setTimeout(() => { if (C && C.gen === g && !C.over) fn(); }, delay);
}
function newRound(){
  C.round++;
  C.order = C.units.filter(u => u.hp > 0).map(u => ({id:u.id, r:u.init + rand(5)})).sort((a, b) => b.r - a.r).map(o => o.id);
  C.idx = 0; step();
}
function applyDmg(u, n){
  if (u.st.ward && n > 0){ const a = Math.min(u.st.ward, n); u.st.ward -= a; n -= a; log(`The ward absorbs ${a}${n ? '' : ' of it'}.`); if (u.st.ward <= 0) delete u.st.ward; }
  if (u.st.laststand && u.hp - n < 1){ n = Math.max(0, u.hp - 1); log(`Last Stand holds. ${u.name} refuses to fall.`); }
  u.hp = Math.max(0, u.hp - n);
  if (u.hp === 0) log(`${u.name} ${u.side === 'enemy' ? 'is defeated' : 'falls'}.`);
  return n;
}
function addGrey(t, n){
  if (t.id === 'pc' && S.hero === 'ilsa' && n > 1){ n = 1; log('Old Blood: the grey barely takes hold of Ilsa.'); }
  t.st.grey = Math.max(t.st.grey || 0, n);
}
function tick(u){
  const st = u.st;
  if (st.bleed){ log(`${u.name} bleeds for 3.`); applyDmg(u, 3); if (--st.bleed <= 0) delete st.bleed; }
  if (u.hp > 0 && st.grey){
    const n = (u.id === 'pc' && (S.hero === 'ilsa' || S.pc.attrs.spirit >= 3)) ? 2 : 3;
    log(`The grey gnaws at ${u.name} for ${n}.`); applyDmg(u, n); if (--st.grey <= 0) delete st.grey;
  }
  if (st.inspired && --st.inspired <= 0) delete st.inspired;
  if (st.laststand && --st.laststand <= 0) delete st.laststand;
  if (st.guard && --st.guard <= 0) delete st.guard;
  if (st.taunt && --st.taunt <= 0) delete st.taunt;
}
function step(){
  if (checkEnd()) return;
  if (C.idx >= C.order.length){ newRound(); return; }
  const u = U(C.order[C.idx]);
  if (!u || u.hp <= 0){ C.idx++; step(); return; }
  delete u.st.defend;
  for (const k in u.cd) if (u.cd[k] > 0) u.cd[k]--;
  tick(u);
  if (checkEnd()) return;
  if (u.hp <= 0){ C.idx++; render(); later(step); return; }
  if (u.st.stun){ delete u.st.stun; log(`${u.name} is stunned and loses the turn.`); C.idx++; render(); later(step); return; }
  C.active = u.id;
  if (u.side === 'hero'){ C.phase = 'player'; C.pick = null; render(); }
  else { C.phase = 'enemy'; render(); later(() => { enemyAct(u); C.idx++; render(); later(step); }); }
}
function checkEnd(){
  if (C.over) return true;
  if (U('pc').hp <= 0){ endCombat('lose'); return true; }
  if (enemiesAlive().length === 0){ endCombat('win'); return true; }
  return false;
}

// hero rules
function meleeTargets(){ const e = enemiesAlive(); const f = e.filter(x => x.row === 'front'); return f.length ? f : e; }
function strike(u, t, o){
  let acc, lo, hi;
  if (u.id === 'pc'){
    if (o.spell){ acc = spellAcc() - Math.floor(t.dodge / 2); [lo, hi] = spellDmg(); }
    else if (o.holy){ acc = divineAcc() - Math.floor(t.dodge / 2); [lo, hi] = divineDmg(); }
    else { acc = pcAcc() - t.dodge; [lo, hi] = pcDmg(); }
  } else { acc = 72 - t.dodge; [lo, hi] = ALLIES[S.ally.id].dmg(); }
  acc = clamp(acc + (u.st.inspired ? 10 : 0) + (o.accMod || 0), 15, 95);
  const lbl = o.label ? `${u.name}’s ${o.label}` : u.name;
  if (rand(100) >= acc){ log(`${lbl} misses ${t.name}.`); return false; }
  let d = ri(lo, hi) * (o.mult || 1);
  if (u.st.grey) d *= 0.8;
  let crit = false;
  if (u.id === 'pc' && rand(100) < 5 + S.pc.attrs.grace){ d *= 1.5; crit = true; }
  d = Math.max(1, Math.round(d - t.armor));
  log(`${lbl} ${crit ? 'lands a critical hit on' : 'hits'} ${t.name} for ${d}.`);
  applyDmg(t, d);
  return true;
}
function breakWind(t){ if (t.winding){ t.winding = false; log(`${t.name} is stunned, and the ${t.spec.name} is broken off.`); } else log(`${t.name} is stunned.`); }
const isPc = (u, hero) => u.id === 'pc' && S.hero === hero;
const isAlly = (u, id) => u.id === 'ally' && S.ally.id === id;
const front = u => u.row === 'front';
const ACTIONS = {
  // Kael
  attack:{label:'Attack', sub:'Melee', target:'melee', known: u => isPc(u, 'kael'), can: front, why:'Front row only', run(u, t){ strike(u, t, {}); }},
  power:{label:'Power Strike', sub:'1.6× damage', target:'melee', cd:2, known: u => isPc(u, 'kael') && sk('blades') >= 1, can: front, why:'Front row only',
    run(u, t){ strike(u, t, {mult:1.6, accMod:-10, label:'Power Strike'}); }},
  bash:{label:'Shield Bash', sub:'Can stun', target:'melee', cd:3, known: u => isPc(u, 'kael') && sk('shields') >= 1, can: front, why:'Front row only',
    run(u, t){ if (strike(u, t, {mult:0.6, label:'Shield Bash'}) && t.hp > 0 && rand(100) < 35 + sk('shields') * 10){ t.st.stun = 1; breakWind(t); } }},
  rally:{label:'Rally', sub:'Heal + accuracy', target:null, cd:4, known: u => isPc(u, 'kael') && sk('leadership') >= 1, can: () => true,
    run(u){ const n = 4 + sk('leadership') * 3; heroesAlive().forEach(x => { x.hp = Math.min(x.max, x.hp + n); x.st.inspired = 3; }); log(`${u.name} rallies the party: +${n} health and sharper aim.`); }},
  laststand:{label:'Last Stand', sub:'Once per fight', target:null, known: u => isPc(u, 'kael'), can: () => !C.used.laststand, why:'Used',
    run(u){ C.used.laststand = true; u.st.laststand = 3; log(`${u.name} sets his feet. For two rounds, nothing will put him down.`); }},
  // Ilsa
  firebolt:{label:'Firebolt', sub:'Any target', sp:4, target:'any', known: u => isPc(u, 'ilsa') && sk('arcane') >= 1, can: () => true,
    run(u, t){ strike(u, t, {spell:true, label:'Firebolt'}); }},
  shackles:{label:'Frost Shackles', sub:'Can stun', sp:5, target:'any', known: u => isPc(u, 'ilsa') && sk('arcane') >= 1, can: () => true,
    run(u, t){ if (strike(u, t, {spell:true, mult:0.5, label:'Frost Shackles'}) && t.hp > 0 && rand(100) < 45 + sk('arcane') * 8){ t.st.stun = 1; breakWind(t); } }},
  ward:{label:'Ward', sub:'Absorbs damage', sp:5, target:'ally', known: u => isPc(u, 'ilsa') && sk('arcane') >= 2, can: () => true,
    run(u, t){ const n = 8 + sk('arcane') * 2 + sk('spellcraft') * 2; t.st.ward = n; log(`A ward shimmers around ${t.id === u.id ? 'Ilsa' : t.name}, ready to absorb ${n}.`); }},
  arc:{label:'Arc Lightning', sub:'Hits every enemy', sp:11, cd:2, target:null, known: u => isPc(u, 'ilsa') && sk('arcane') >= 3, can: () => true,
    run(u){ log('Lightning leaps from enemy to enemy.'); enemiesAlive().forEach(e => strike(u, e, {spell:true, mult:0.45, label:'Arc Lightning'})); }},
  word:{label:'Unwritten Word', sub:'Once per fight', target:'any', known: u => isPc(u, 'ilsa') && S.flags.word, can: () => !C.used.word, why:'Used',
    run(u, t){ C.used.word = true; const d = 12 + S.pc.attrs.mind * 2 + sk('arcane') * 2; log(`Ilsa speaks the Unwritten Word. ${t.name} takes ${d}, straight through any armor.`); applyDmg(t, d); u.st.grey = Math.max(u.st.grey || 0, 2); log('Something vast notices. Ilsa is grey-touched.'); }},
  channel:{label:'Channel', sub:'Regain SP', target:null, known: u => isPc(u, 'ilsa'), can: u => u.sp < u.spMax, why:'SP full',
    run(u){ const n = 5 + sk('spellcraft') * 2 + S.pc.attrs.mind; u.sp = Math.min(u.spMax, u.sp + n); log(`Ilsa closes her eyes and channels: +${n} SP.`); }},
  dagger:{label:'Dagger', sub:'Melee', target:'melee', known: u => isPc(u, 'ilsa'), can: front, why:'Front row only', run(u, t){ strike(u, t, {label:'dagger'}); }},
  // Brannoc
  sling:{label:'Sling', sub:'Ranged', target:'any', known: u => isAlly(u, 'bran'), can: () => true, run(u, t){ strike(u, t, {label:'sling stone'}); }},
  bandage:{label:'Bandage', sub:'Heal an ally', target:'ally', cd:2, known: u => isAlly(u, 'bran'), can: () => true,
    run(u, t){ const n = 9 + S.level; t.hp = Math.min(t.max, t.hp + n); delete t.st.bleed; log(`Brannoc bandages ${t.id === u.id ? 'himself' : t.name} for ${n}.`); }},
  // Hask
  hammer:{label:'Hammer', sub:'Melee', target:'melee', known: u => isAlly(u, 'hask'), can: front, why:'Front row only', run(u, t){ strike(u, t, {label:'hammer'}); }},
  guard:{label:'Guard', sub:'Take her hits', target:null, cd:3, known: u => isAlly(u, 'hask'), can: () => U('pc').hp > 0,
    run(u){ u.st.guard = 2; log(`Hask plants himself in front of ${U('pc').name}. Blows meant for her will hit him instead.`); }},
  // Everyone
  defend:{label:'Defend', sub:'Halve damage', target:null, known: () => true, can: () => true,
    run(u){ u.st.defend = 1; log(`${u.name} braces for the next blow.`); }},
  swap:{label:'Swap Row', sub:'', target:null, known: () => true, can: () => true,
    run(u){ u.row = u.row === 'front' ? 'back' : 'front'; log(`${u.name} moves to the ${u.row} row.`); }},
  flee:{label:'Flee', sub:'', target:null, known: () => !!C.def.flee, can: () => true,
    run(u){ const ch = 35 + sk('survival') * 12 + S.pc.attrs.grace * 2; if (rand(100) < ch){ log('You break away and retreat.'); endCombat('fled'); } else log('You try to break away, but they cut you off.'); }}
};
const ITEMS = {
  draught:{name:'Healing Draught', desc:'Restores 18 health.', use(t){ t.hp = Math.min(t.max, t.hp + 18); return `${t.name} drinks a Healing Draught: +18 health.`; }},
  tonic:{name:'Bitter Tonic', desc:'Cures poison, bleeding and grey-touch, +5 health.', use(t){ delete t.st.bleed; delete t.st.grey; t.hp = Math.min(t.max, t.hp + 5); return `${t.name} downs a Bitter Tonic. The burning clears.`; }},
  aether:{name:'Aether Draught', desc:'Restores 15 spell points.', mage:true, use(t){ t.sp = Math.min(t.spMax, t.sp + 15); return `${t.name} drinks an Aether Draught: +15 SP.`; }}
};
function choose(actId){
  const a = ACTIONS[actId];
  if (!a.target){ doAct(actId, null); return; }
  C.pick = {act:actId}; C.phase = 'target'; render();
}
function chooseItem(itemId){ C.pick = {item:itemId}; C.phase = 'target'; render(); }
function validTargets(){
  if (!C.pick) return [];
  if (C.pick.item) return heroesAlive().filter(u => !ITEMS[C.pick.item].mage || u.spMax > 0);
  const t = ACTIONS[C.pick.act].target;
  if (t === 'melee') return meleeTargets();
  if (t === 'any') return enemiesAlive();
  if (t === 'ally') return heroesAlive();
  if (t === 'calm') return enemiesAlive().filter(e => e.calm);
  return [];
}
function pickTarget(id){
  if (C.phase !== 'target') return;
  if (!validTargets().some(t => t.id === id)) return;
  if (C.pick.item){ const t = U(id); S.items[C.pick.item]--; log(ITEMS[C.pick.item].use(t)); finishTurn(); return; }
  doAct(C.pick.act, id);
}
function doAct(actId, tid){
  const a = ACTIONS[actId]; const u = U(C.active);
  if (a.sp) u.sp -= a.sp;
  a.run(u, tid ? U(tid) : null);
  if (a.cd) u.cd[actId] = a.cd;
  if (C.over){ render(); return; }
  finishTurn();
}
function finishTurn(){ C.pick = null; C.phase = 'wait'; C.idx++; render(); if (!checkEnd()) later(step); }

// enemy rules
function enemyStrike(e, t, mult, sp, aoe){
  if (!aoe && t.id === 'pc'){ const a = U('ally'); if (a && a.hp > 0 && a.st.guard){ log(`${a.name} takes the blow meant for ${t.name}.`); t = a; } }
  const acc = clamp(e.acc - t.dodge - (t.st.defend ? 10 : 0), 15, 95);
  if (rand(100) >= acc){ log(`${e.name}${sp ? '’s ' + sp.name : ''} misses ${t.name}.`); return; }
  let d = ri(e.dmg[0], e.dmg[1]) * mult;
  if (e.st.grey) d *= 0.8;
  let note = '';
  if (t.id === 'pc' && S.hero === 'kael' && !e.ranged && rand(100) < pcBlock() + (t.st.defend ? 25 : 0)){ d *= 0.35; note = ' (blocked)'; }
  if (t.st.defend) d *= 0.5;
  d = Math.max(1, Math.round(d - t.armor));
  log(`${e.name}${sp ? '’s ' + sp.name : ''} hits ${t.name} for ${d}${note}.`);
  applyDmg(t, d);
  if (t.hp <= 0) return;
  if (sp && sp.stun && !t.st.defend){ t.st.stun = 1; log(`${t.name} is caught and stunned.`); }
  if (sp && sp.grey) addGrey(t, sp.grey);
  if (e.bleed && rand(100) < e.bleed){ t.st.bleed = 3; log(`${t.name} is bleeding.`); }
  if (e.greyChance && rand(100) < e.greyChance){ log(`${t.name} is grey-touched.`); addGrey(t, 2); }
}
function enemyAct(e){
  const hs = heroesAlive(); if (!hs.length) return;
  const pickT = () => { const tt = hs.find(x => x.st.taunt); if (tt) return tt; if (e.ranged) return hs[rand(hs.length)]; const f = hs.filter(x => x.row === 'front'); const pool = f.length ? f : hs; return pool[rand(pool.length)]; };
  if (e.winding){
    e.winding = false;
    if (e.spec.aoe){ log(`${e.name} unleashes ${e.spec.name}!`); hs.forEach(t => enemyStrike(e, t, e.spec.mult, e.spec, true)); }
    else enemyStrike(e, pickT(), e.spec.mult, e.spec);
  }
  else if (e.spec && (e.turns + 1) % e.spec.every === 0){ e.winding = true; log(e.spec.windup.replace('{n}', e.name)); }
  else enemyStrike(e, pickT(), 1, null);
  e.turns++;
}

function endCombat(result){
  if (C.over) return;
  C.gen++;
  const def = C.def; const p = U('pc'); const a = U('ally');
  const over = {result, xp:0, ups:[]};
  if (result === 'lose' && def.lethal){ C.over = over; C.phase = 'over'; render(); return; }
  S.pc.hp = Math.max(1, p.hp); S.pc.sp = p.sp;
  if (a) S.ally.hp = a.hp > 0 ? a.hp : Math.ceil(allyMax() * 0.4);
  if (result === 'win'){
    over.xp = C.units.filter(u => u.side === 'enemy').reduce((s, u) => s + u.xp, 0);
    if (def.done) def.done();
    over.ups = gainXP(over.xp);
    over.next = def.win;
  } else if (result === 'lose'){
    S.pc.hp = Math.ceil(pcMax() * 0.5);
    over.xp = def.loseXP || 0; if (def.done) def.done();
    over.ups = gainXP(over.xp);
    over.next = def.lose;
  } else over.next = null;
  C.over = over; C.phase = 'over';
  // persist the outcome now, so a reload continues after the fight
  if (over.next){ S.mode = 'scene'; S.scene = over.next; const sc = SCENES[over.next]; if (sc.enter) sc.enter(); }
  else S.mode = 'map';
  S.combatId = null; save();
  render();
}
function leaveCombat(){
  const over = C.over; C = null;
  if (over.next){ S.mode = 'scene'; S.scene = over.next; } else S.mode = 'map';
  save(); render(true);
}
function restoreSnap(){ S = JSON.parse(C.snap); M.heroes[M.cur] = S; }
function retryCombat(){ const id = C.id; restoreSnap(); C = null; startCombat(id); }
function stepBack(){ const id = C.id; restoreSnap(); C = null; S.combatId = null; S.mode = 'scene'; S.scene = COMBATS[id].back; save(); render(true); }


const SAVE_KEY = 'sundered-reach-v2';
const OLD_KEY = 'sundered-reach-kael-v1';
const app = document.getElementById('app');
const modalRoot = document.getElementById('modal');
let M = null;        // the whole save: {v, cur, heroes:{kael, ilsa}}
let S = null;        // the active hero's chapter state (lives inside M)
let C = null;        // combat state (never saved)
let screen = 'title';

// ---------- helpers ----------
function h(tag, props, ...kids){
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})){
    if (v === false || v == null) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)){
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}
const rand = n => Math.floor(Math.random() * n);
const ri = (a, b) => a + rand(b - a + 1);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let lastBody = null;
function save(){
  if (!M) return;
  const body = JSON.stringify(Object.assign({}, M, {savedAt:0}));
  if (body === lastBody) return; // nothing changed since the last save
  lastBody = body; M.savedAt = Date.now();
  const json = JSON.stringify(M);
  try { localStorage.setItem(SAVE_KEY, json); } catch (e) {}
  CloudSave.push(json, M.savedAt);
}
function migrateV1(s){
  if (!s || !s.kael || s.mode === 'title' || s.mode === 'select') return null;
  s.hero = 'kael'; s.pc = s.kael; delete s.kael;
  s.ally = Object.assign({id:'bran'}, s.bran); delete s.bran;
  s.gear.focus = 0; s.items.aether = s.items.aether || 0;
  if (s.mode === 'combat' && !s.combatId) s.mode = 'map';
  return s;
}
function loadMeta(){
  try {
    const t = localStorage.getItem(SAVE_KEY);
    if (t) return JSON.parse(t);
    const o = localStorage.getItem(OLD_KEY);
    if (o){ const s = migrateV1(JSON.parse(o)); if (s) return {v:2, cur:'kael', heroes:{kael:s, ilsa:null}}; }
  } catch (e) {}
  return null;
}
function clearAll(){ try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(OLD_KEY); } catch (e) {} lastBody = null; CloudSave.clear(); }

// ---------- rules ----------
const ATTRS = {
  might:{name:'Might', desc:'Melee damage.'},
  grace:{name:'Grace', desc:'Accuracy, dodge, critical hits and turn order.'},
  mind:{name:'Mind', desc:'Spell power and spell points.'},
  spirit:{name:'Spirit', desc:'Resists the grey touch of the Hollow.'},
  endur:{name:'Endurance', desc:'+4 max health per point.'}
};
const SKILLS = {
  blades:{name:'Blades', desc:'Hit chance and damage with swords. Power Strike.'},
  shields:{name:'Shields', desc:'Chance to block melee blows. Shield Bash can stun.'},
  daggers:{name:'Daggers', desc:'Hit chance and damage with daggers.'},
  arcane:{name:'Arcane Magic', desc:'Spell damage and accuracy. Ward at rank 2, Arc Lightning at rank 3.'},
  spellcraft:{name:'Spellcraft', desc:'+3 spell points per rank, +1 spell damage, better Channel and Ward.'},
  armor:{name:'Heavy Armor', desc:'Every 2 ranks cut 1 more damage from each hit.'},
  tough:{name:'Toughness', desc:'+5 max health per rank.'},
  stealth:{name:'Stealth', desc:'Move unseen and hide things.'},
  leadership:{name:'Leadership', desc:'Persuasion in dialogue. Kael: unlocks Rally.'},
  survival:{name:'Survival', desc:'Notice danger and tampering. Better odds to flee.'},
  lockpick:{name:'Lockpicking', desc:'Open locks quietly.'},
  lore:{name:'Lore', desc:'Read old writing. Recognize poisons and relics.'},
  wardlore:{name:'Wardlore', desc:'Sense the Wardstones. Learned only through the story.', special:true}
};
const HEROES = {
  kael:{name:'Kael', full:'Kael Dunmore', race:'Human', role:'swordsman', ptsPerLevel:6, row:'front', start:'intro',
    skillList:['blades','shields','armor','tough','leadership','survival','lockpick','lore','wardlore'],
    cost: () => 1,
    costNote:'Humans pay 1 point per skill rank and earn 6 points a level.',
    signature:['Last Stand', 'Once per fight, Kael cannot drop below 1 health for two rounds.'],
    actions:['attack','power','bash','rally','laststand','defend','swap','flee'],
    blurb:'A pit fighter working off his dead father’s debt to House Sarne. Tonight’s bout will change everything.',
    roleLine:'Swordsman · Human', home:'Varrow, the arena city'},
  ilsa:{name:'Ilsa', full:'Ilsa Venn', race:'Sylvari', role:'mage', ptsPerLevel:5, row:'back', start:'i_intro',
    skillList:['arcane','spellcraft','daggers','lore','stealth','lockpick','leadership','survival','armor','tough','wardlore'],
    cost: id => (id === 'armor' || id === 'tough') ? 2 : 1,
    costNote:'Sylvari pay 2 points a rank for Heavy Armor and Toughness, 1 for everything else, and earn 5 points a level. Old Blood: the Hollow’s grey touch barely holds on her.',
    signature:['Unwritten Word', 'Learned from the Concord. Once per fight, a word that strikes for huge damage through any armor. The Hollow notices: Ilsa is grey-touched afterward.'],
    actions:['firebolt','shackles','ward','arc','word','channel','dagger','defend','swap','flee'],
    blurb:'An apprentice at the Arcanum whose mentor has vanished, leaving her a note and a warning.',
    roleLine:'Mage · Sylvari', home:'The Spire Coast'}
};
const ALLIES = {
  bran:{name:'Brannoc', max: () => 24 + S.level * 2, armor:1, init:4, dodge:4, row:'back', dmg: () => [4, 7], actions:['sling','bandage','defend','swap','flee']},
  hask:{name:'Hask', max: () => 34 + S.level * 3, armor:3, init:3, dodge:2, row:'front', dmg: () => [5 + Math.floor(S.level / 2), 9 + Math.floor(S.level / 2)], actions:['hammer','guard','defend','swap','flee']}
};
const H = () => HEROES[S.hero];
const BUILT = ['kael', 'ilsa', 'tamsin', 'wren'];
const XP_AT = [0, 0, 80, 200, 380, 600, 860];
const nextXP = l => XP_AT[l + 1] || (860 + (l - 5) * 300);
function sk(id){ return S.pc.skills[id] || 0; }
function chk(id, n){ return { req: () => sk(id) >= n, tag: SKILLS[id].name + ' ' + n }; }

function pcMax(){
  const k = S.pc;
  if (S.hero === 'ilsa') return 16 + k.attrs.endur * 4 + sk('tough') * 5 + (S.level - 1) * 5;
  if (S.hero === 'tamsin') return 22 + k.attrs.endur * 4 + sk('tough') * 5 + (S.level - 1) * 6;
  if (S.hero === 'wren') return 18 + k.attrs.endur * 4 + sk('tough') * 5 + (S.level - 1) * 5;
  return 22 + k.attrs.endur * 4 + sk('tough') * 5 + (S.level - 1) * 6;
}
function allyMax(){ return ALLIES[S.ally.id].max(); }
function pcArmor(){ const stone = S.hero === 'tamsin' ? (S.level >= 4 ? 2 : 1) : 0; return (S.hero === 'kael' ? 1 : 0) + stone + Math.ceil(sk('armor') / 2) + S.gear.armor; }
function pcAcc(){ const g = S.pc.attrs.grace; if (S.hero === 'tamsin') return 64 + g * 3 + sk('maces') * 4; if (S.hero === 'wren') return 62 + g * 3 + sk('daggers') * 4; return S.hero === 'ilsa' ? 60 + g * 3 + sk('daggers') * 4 : 66 + g * 3 + sk('blades') * 3; }
function pcDmg(){
  const m = S.pc.attrs.might;
  if (S.hero === 'ilsa'){ const b = m + sk('daggers') + S.gear.sword; return [2 + b, 4 + b]; }
  if (S.hero === 'tamsin'){ const b = m + sk('maces') + S.gear.sword; return [3 + b, 6 + b]; }
  if (S.hero === 'wren'){ const b = m + sk('daggers') + S.gear.sword; return [2 + b, 5 + b]; }
  const b = m + sk('blades') + S.gear.sword; return [3 + b, 6 + b];
}
function pcBlock(){ return sk('shields') * 6; }
function spMax(){ if (S.hero === 'tamsin') return 8 + S.pc.attrs.spirit * 3 + sk('divine') * 2 + (S.level - 1) * 3; if (S.hero !== 'ilsa') return 0; return 10 + S.pc.attrs.mind * 3 + sk('spellcraft') * 3 + (S.level - 1) * 3; }
function spellDmg(){ const b = S.pc.attrs.mind + sk('arcane') + sk('spellcraft') + (S.gear.focus || 0); return [4 + b, 7 + b]; }
function spellAcc(){ return 80 + S.pc.attrs.mind * 2 + sk('arcane') * 3; }

function chron(t){ S.chronicle.push(t); }
function quest(id, title, text, status){ S.quests[id] = {title, text, status: status || 'active', order: (S.quests[id] && S.quests[id].order != null) ? S.quests[id].order : Object.keys(S.quests).length}; }
function setQ(id, status, text){ if (S.quests[id]){ S.quests[id].status = status; if (text) S.quests[id].text = text; } }
function healKael(n){ S.pc.hp = Math.min(pcMax(), S.pc.hp + n); }
function restAll(){ S.pc.hp = pcMax(); S.pc.sp = spMax(); if (S.ally.joined) S.ally.hp = allyMax(); }
function gainXP(n){
  S.xp += n; const ups = [];
  while (S.xp >= nextXP(S.level)){
    S.level++; S.skillPts += H().ptsPerLevel;
    if (S.level % 3 === 0) S.attrPts += 1;
    restAll();
    ups.push(S.level);
  }
  return ups;
}
// Another hero's saved chapter, for linked choices
const other = id => (M && M.heroes[id]) || null;
const otherF = id => (other(id) && other(id).flags) || {};
const echo = (hero, text) => '@echo:' + `<b>Echo from ${HEROES[hero].name}’s chapter.</b> ${text}`;

function baseState(hero){
  return {v:2, hero, chapter:1, mode:'scene', scene:null, map:null, level:1, xp:0, skillPts:4, attrPts:0, gold:12,
    flags:{}, chronicle:[], quests:{}, combatId:null, notice:null};
}
function kaelState(){
  const s = baseState('kael');
  s.pc = {hp:0, sp:0, attrs:{might:4, grace:3, mind:1, spirit:2, endur:3},
    skills:{blades:2, shields:1, armor:1, tough:0, leadership:0, survival:0, lockpick:0, lore:0, wardlore:0}};
  s.ally = {id:'bran', joined:false, hp:0};
  s.items = {draught:0, tonic:0, aether:0};
  s.gear = {armor:0, sword:0, focus:0, swordName:"Father's sword", shieldName:'Arena shield'};
  return s;
}
function ilsaState(){
  const s = baseState('ilsa'); s.gold = 8;
  s.pc = {hp:0, sp:0, attrs:{might:1, grace:3, mind:5, spirit:3, endur:2},
    skills:{arcane:2, spellcraft:1, daggers:1, lore:1, stealth:0, lockpick:0, leadership:0, survival:0, armor:0, tough:0, wardlore:0}};
  s.ally = {id:'hask', joined:false, hp:0};
  s.items = {draught:0, tonic:0, aether:0};
  s.gear = {armor:0, sword:0, focus:0, swordName:'Silver dagger', shieldName:'None', focusName:'Apprentice’s wand'};
  return s;
}


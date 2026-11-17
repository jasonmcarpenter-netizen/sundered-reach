// ---------- chapters ----------
// Each hero's story is a run of chapters, listed in HEROES[id].chapters. S.chapter is the chapter the hero is in,
// and S.mode === 'end' means that chapter is finished. Saves from before chapters existed have no S.chapter,
// so they count as chapter 1. Later chapter files (js/heroes/<hero>/ch2.js …) add their entry to
// HEROES[id].chapters and load after this file.
HEROES.kael.chapters = {1:{title:'The Sands of Varrow', start:'intro'}};
HEROES.ilsa.chapters = {1:{title:'The Spire Coast', start:'i_intro'}};
HEROES.tamsin.chapters = {1:{title:'Kell’s Rest', start:'t_intro'}};
HEROES.wren.chapters = {1:{title:'The Thornwood', start:'w_intro'}};

const chapterOf = s => (s && s.chapter) || 1;
// Chapters this hero has finished
const chaptersDone = s => !s ? 0 : chapterOf(s) - (s.mode === 'end' ? 0 : 1);
const hasChapter = (id, n) => !!(HEROES[id].chapters && HEROES[id].chapters[n]);
const chapterTitle = (id, n) => hasChapter(id, n) ? HEROES[id].chapters[n].title : '';
// No hero gets more than one chapter ahead: chapter n needs every other hero to have finished chapter n − 2.
// A chapter can also name story dependencies: chapters[n].needs = [['tamsin', 1]] (it reacts to that chapter's choices).
// Returns what's holding it back as [{id, ch}], or null if it can start.
function chapterLock(id, n){
  const lock = [];
  BUILT.forEach(o => { if (o !== id && n - 2 >= 1 && chaptersDone(M && M.heroes[o]) < n - 2) lock.push({id:o, ch:n - 2}); });
  ((HEROES[id].chapters[n] || {}).needs || []).forEach(([o, ch]) => {
    if (chaptersDone(M && M.heroes[o]) >= ch) return;
    const have = lock.find(l => l.id === o); if (have) have.ch = Math.max(have.ch, ch); else lock.push({id:o, ch});
  });
  return lock.length ? lock : null;
}
// "Tamsin finishes chapter 1", "Tamsin and Wren finish chapter 1", "Kael finishes chapter 2 and Wren finishes chapter 1"
function lockText(lock){
  const byCh = {}; lock.forEach(l => (byCh[l.ch] = byCh[l.ch] || []).push(l.id));
  return Object.entries(byCh).map(([ch, ids]) => `${nameList(ids)} ${ids.length > 1 ? 'finish' : 'finishes'} chapter ${ch}`).join(' and ');
}
const xpForLevel = l => l <= 1 ? 0 : nextXP(l - 1);
// Catch-up XP: a hero more than 2 levels behind the leader is brought up to 2 below. Returns new levels gained.
function catchUp(){
  const others = BUILT.filter(o => o !== S.hero && M.heroes[o]).map(o => M.heroes[o].level);
  if (!others.length) return [];
  const floor = Math.max(...others) - 2;
  if (S.level >= floor) return [];
  return gainXP(Math.max(0, xpForLevel(floor) - S.xp));
}
// Start chapter n for the active hero, keeping level, gear, companion, items, quests and flags
function beginChapter(n){
  S.chapter = n; S.mode = 'scene'; S.map = null; S.combatId = null;
  const ups = catchUp();
  restAll();
  S.chapterSnap = null;
  S.chapterSnap = JSON.stringify(S); // for "Restart this chapter"
  S.notice = ups.length ? `Catch-up: ${H().name} trained on the road and is now level ${S.level}, with new skill points to spend.` : null;
  chron(`Chapter ${n} began: ${chapterTitle(S.hero, n)}.`);
  go(HEROES[S.hero].chapters[n].start);
}
function restartChapter(){
  C = null;
  if (chapterOf(S) > 1 && S.chapterSnap){
    const snap = S.chapterSnap;
    S = JSON.parse(snap); S.chapterSnap = snap; M.heroes[M.cur] = S;
    screen = 'game'; go(HEROES[S.hero].chapters[S.chapter].start);
  } else beginHero(S.hero, true);
}
// What a hero's card on the select screen and the chapter-end screen can offer next
function nextStep(id){
  const s = M && M.heroes[id];
  if (!s) return {can:true, kind:'start'};
  if (s.mode !== 'end') return {can:true, kind:'continue'};
  const n = chapterOf(s) + 1;
  if (!hasChapter(id, n)) return {can:false, kind:'unbuilt', n};
  const lock = chapterLock(id, n);
  return lock ? {can:false, kind:'locked', n, lock} : {can:true, kind:'next', n};
}

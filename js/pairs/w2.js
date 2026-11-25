// ================= ACT 3, WEST 2: THE FIRST FLAME =================
// Ilsa and Tamsin (with Hask and Bracken) go up into Hearthdeep, to Kell's Rest and the Fourth Ward where Tamsin's
// story began, after the last piece of the lost cure. The founders' text says the Second Lantern is lit from a first
// flame, and the first flame was kept in the Lantern Well under the Fourth Ward until the Sundering buried it. Saint
// Calder's Rest (rest; Abbess Merrow; Aurel by Tamsin's `rite` and Ilsa's `aurelSent`; Tobin brings the founder's lamp
// if S2 sent it west, `lamp`), the Old Road (optional: the Kindled marching on Corvane), Kell's Rest (Tamsin's ch1
// evacuate/defend: Elder Durra or an empty village). Beneath the Fourth Ward: the Lantern Well (rest), the Speaking
// Stone (the Hollow talks to Ilsa in her own voice; she answers → `heardTerms` (a weaker boss) or keeps silent),
// the Well's Heart (waking the flame: Wren's blood `vial`, Tamsin's own light, or Ilsa's Word), boss: the Hollow
// Speaker and its echoes. Choice: w2Flame = 'spent' (the flame heals Kell's Rest now, and with the founder's lamp
// Tamsin's own cost too: `lanternHealed`) or 'carried' (taken whole to Corvane for the Keystone). Scene IDs use the
// prefix a3w2_. West flags: lamp, aurelHelp, roadDone2, village, wellWake, heardTerms, w2Boss, w2Flame, lanternHealed.
HEROES.west.chapters[2] = {title:'The First Flame', start:'a3w2_intro'};

const w2Voice = () => { const p = partyF(), i = ilf(), w = S.flags; return !!(i.spokeWard || p.voiceDeep || w.voiceSpire); };
const w2Vial = () => { const n = S.flags.vial; return n >= 2 ? 'Two measures of Wren’s blood left in the vial.' : n === 1 ? 'One measure of Wren’s blood left in the vial.' : 'The vial of Wren’s blood is empty.'; };

Object.assign(SCENES, {
  a3w2_intro:{
    enter(){ quest('w2', 'The First Flame', 'Find the first flame of the Lantern, under the Fourth Ward at Kell’s Rest.'); },
    view: () => {
      const t = tf();
      const txt = [`It's in the silver book, three pages from the end, in a hand that shakes as if the writer were very old or very cold: <em>the second lantern is lit from the first, and the first was lit from the Well, which is under the Fourth.</em>`,
        `The Fourth Ward. Kell's Rest. Tamsin reads it twice, then closes the book and goes and stands at the rail of the coaster for a long time, looking east, toward the mountains she grew up in.`,
        `"Home," says Hask, beside her. It isn't a question. Bracken leans on her legs.`];
      txt.push(t.choice === 'evacuate' ? `The last time Tamsin saw Kell's Rest she was leading sixty-three people down the mountain away from it, and the shrine behind them was going dark.` : `The last time Tamsin saw Kell's Rest she had stood twelve days at the Fourth Ward holding it with her hands, and the village had buried people every one of those days.`);
      if (w2Voice()) txt.push(`Ilsa hasn't slept well since the Ninth Tower. Something keeps saying her name, in her own voice, from very far down. The closer they get to the mountains, the clearer it gets.`);
      return {title:'East, to Hearthdeep', text:txt, choices:[{label:'Up into the mountains', act: () => toMap('a3w2_road')}]};
    }
  },
  a3w2_calder:{ view: () => {
    const f = S.flags, t = tf(), i = ilf(), s = pairF('south');
    const txt = [`Saint Calder's Rest is still there on its shelf above the pass road, bells and all. Abbess Merrow comes out to the gate herself, leaning on a stick now. "Sister Orlo," she says. "And the Arcanum girl. Come in out of the wind."`];
    const ch = [partyRest('You sleep at Saint Calder’s Rest. Everyone’s health and spell points are restored.')];
    if (i.aurelSent){
      if (t.rite === 'aurel') txt.push(`And in the herb garden, on his knees in the dirt with a trowel, Magister Aurel, whole, cured, grey only at the temples where grey belongs. He sees Ilsa and drops the trowel.`);
      else txt.push(`And in a cell off the infirmary, grey to the eyes, Magister Aurel, still waiting for a cure. He knows Ilsa's voice even when he can't see her.`);
      if (!f.aurelSeen){ f.aurelSeen = true; if (t.rite === 'aurel') f.aurelHelp = true; }
      if (t.rite === 'aurel') txt.push(`"The Fourth Ward," he says, when she tells him. "I studied it for thirty years before Graff. There's a thing in the shape of it now that wasn't there. It talks. I'll tell you where it's weakest."`);
      txt.push(echo('tamsin', t.rite === 'aurel' ? 'Tamsin lit the Second Lantern for Aurel and cured him.' : 'Tamsin saved the book of the Second Lantern, and Aurel waits.'));
    }
    if (s.s2Lamp === 'west' && !f.lamp){
      txt.push(`And in the guest-hall, a young man with very muddy boots and something wrapped in a good shirt: Tobin Marsh, again. "I'm getting good at this," he says. He unwraps an old bronze lamp with a branch-and-ring on its foot, and the flame in Tamsin's own lantern leans toward it like a plant toward a window.`, echo('wren', 'Wren and Kael found the founder’s lamp in Corrin Sarne’s tent, and sent it west.'));
      ch.push({label:'Take the founder’s lamp.', act: () => { f.lamp = true; S.notice = xpNoteParty(100); chron('Tobin brought the founder’s lamp to Saint Calder’s Rest, from Kael and Wren.'); go('a3w2_lampTaken'); }});
    }
    ch.push(back());
    return {title:'Saint Calder’s Rest', text:txt, choices:ch.filter(Boolean)};
  }},
  a3w2_lampTaken:{ view: () => ({title:'Saint Calder’s Rest', text:[`Tamsin holds the founder's lamp in both hands. It's cold. It's very old. "The first lantern," she says. "The one the rite starts with. The Order lost it in the Sundering." She looks up. "It needs the first flame. And the first flame's under the Fourth Ward."`], choices:[back()]})},
  a3w2_oldroad:{ view: () => {
    const f = S.flags;
    if (f.roadDone2) return {title:'The Old Road', text:[`The old road is quiet. The Kindled won't be marching anywhere.`], choices:[back()]};
    return {title:'The Old Road', text:[`On the old road below the pass, a column of people in ash-grey robes is coming down out of the mountains: Kindled, the Ashen Hand's zealots, forty or fifty of them, with carts. Going west. Toward Corvane.`,
      `"The Cinder Father's calling them in," says Ilsa. "All of them. Whatever he means to do at the Keystone, it's soon."`,
      `They're too many to stop. But their rearguard is small, and the carts carry something under tarpaulins that glows grey.`],
      choices:[{label:'Hit the rearguard and the carts', act: () => startCombat('a3w2_road')}, back('Let them go')]};
  }},
  a3w2_roadWin:{ enter(){ if (S.flags.roadDone2) return; S.flags.roadDone2 = true; S.items.draught += 2; S.items.tonic += 1; chron('On the old road, Ilsa and Tamsin broke the Kindled rearguard and burned their carts of shards.'); }, view: () => ({title:'The Old Road', text:[`The carts are full of shards, and something worse: pick-heads forged from Wardstone, sharp enough to cut a Keystone's root. Hask tips them into a ravine one by one. Among the rearguard's packs there are two Healing Draughts and a Bitter Tonic.`, `The rest of the Kindled are already over the next ridge, going west. They'll be in Corvane before you.`], choices:[back()]})},
  a3w2_village:{ view: () => {
    const f = S.flags, t = tf();
    const txt = [];
    if (t.choice === 'evacuate'){
      txt.push(`Kell's Rest is empty. Grey moss on the doorsteps, grey water in the well, the prayer-flags on the shrine path faded to the colour of ash. Tamsin walks through it without stopping, the way you walk past a grave you can't afford to sit down at.`);
      if (!f.village) f.village = 'empty';
    } else {
      txt.push(`Kell's Rest is still here, just. Half the houses are shut up, and the ones that aren't have grey on the doorposts. Elder Durra comes out to meet Tamsin, older and thinner, and holds her for a long time without saying anything.`,
        `"They still go grey," Durra says at last. "Slower than before. You held it. But it's still coming up." She looks at the shrine on the hill. "Something's down there, Tamsin. It talks at night. In a girl's voice." She looks at Ilsa. And then looks again.`);
      if (!f.village) f.village = 'held';
    }
    txt.push(echo('tamsin', t.choice === 'evacuate' ? 'Tamsin led Kell’s Rest down the mountain and left the shrine dark.' : 'Tamsin stayed twelve days and held the Fourth Ward with her hands.'));
    return {title:'Kell’s Rest', text:txt, choices:[t.choice !== 'evacuate' ? partyRest('You sleep in Durra’s house. Everyone’s health and spell points are restored.') : null, back()].filter(Boolean)};
  }},
  a3w2_shrine:{ view: () => {
    const f = S.flags;
    if (f.shrineDone) return {title:'The Shrine of the Fourth Ward', text:[`The shrine door stands open on the stair down.`], choices:[{label:'Down beneath the Fourth Ward', act: () => toMap('a3w2_below')}, back()]};
    return {title:'The Shrine of the Fourth Ward', text:[`The shrine above Kell's Rest is a low stone house built over the Fourth Ward, the way a lantern is built over a flame. Its door is open. The grey coming out of it moves, like breath, and in the grey things are moving too: shapes like villagers, like pilgrims, like people who came up here to pray and didn't go home.`,
      w2Voice() ? `And from inside, very faint, in a voice exactly like Ilsa's: "<em>Ilsa. Come down. Come down and talk to me.</em>"` : `From inside, very faint, someone is talking. It sounds like a girl reading aloud.`],
      choices:[{label:'Clear the door', act: () => startCombat('a3w2_shrine')}, back()]};
  }},
  a3w2_shrineWin:{ enter(){ S.flags.shrineDone = true; }, view: () => ({title:'The Shrine of the Fourth Ward', text:[`The grey shapes come apart and settle into the stones of the floor. Behind the altar, a stair goes down that Tamsin swears was never there before.`], choices:[{label:'Down beneath the Fourth Ward', act: () => toMap('a3w2_below')}]})},

  // --- Beneath the Fourth Ward ---
  a3w2_well:{ view: () => ({title:'The Lantern Well', text:[`A round chamber cut from the mountain's heart, dry and warm, with a well in the middle of it that has no water in it, only a faint gold glow, very far down. Old lamp-niches all round the walls, empty. Somebody kept a light here once, for a very long time.`],
    choices:[partyRest('You rest beside the Lantern Well. Everyone’s health and spell points are restored.'), back()].filter(Boolean)})},
  a3w2_stone:{ view: () => {
    const f = S.flags;
    if (f.stoneDone) return {title:'The Speaking Stone', text:[`The cracked face of the Fourth Ward is quiet now. Listening.`], choices:[back()]};
    const t = [`Below the well, the Fourth Ward itself: a great black stone in the rock, cracked from top to bottom, the crack lit grey from inside. ${ilf().spokeWard ? 'Ilsa spoke into this crack once, years ago it feels like, and it has been listening ever since.' : 'Ilsa has never been this close to it.'}`,
      `And it speaks. In her voice. Her exact voice, her careful Arcanum vowels, her habit of pausing before the important word.`,
      `"<em>Ilsa. You read the book. You know what they did. They fed me, and I slept, and they called it a victory. I don't want to be fed. I don't want to sleep.</em>" A pause, before the important word. "<em>I want to be </em>asked<em>. Ask me. Ask me what I'd take, instead.</em>"`];
    return {title:'The Speaking Stone', text:t, choices:[
      {label:'Ilsa asks it.', act: () => { f.stoneDone = true; f.heardTerms = true; chron('Beneath the Fourth Ward, Ilsa asked the Hollow what it would take instead of lives. It told her.'); go('a3w2_terms'); }},
      {label:'Ilsa says nothing at all, and walks away.', act: () => { f.stoneDone = true; f.heardTerms = false; chron('Beneath the Fourth Ward, the Hollow spoke to Ilsa in her own voice, and she did not answer.'); go('a3w2_silent'); }}
    ]};
  }},
  a3w2_terms:{ view: () => ({title:'The Speaking Stone', text:[`Ilsa asks. And it tells her, in her own voice, quietly, for a long time.`,
    `When she comes back up to the well, Tamsin takes one look at her face and doesn't ask. Ilsa sits down against the wall and puts her head on her knees. "It's not a monster," she says, muffled. "That would be easier. It's a bargain that wants to be renegotiated." She looks up. "And I know what it'd take, now. I'll tell you. Not yet."`,
    `The thing growing in the Ward's crack is quieter, after. As if it had got what it wanted, for now.`], choices:[back()]})},
  a3w2_silent:{ view: () => ({title:'The Speaking Stone', text:[`Ilsa turns her back on her own voice and walks up the stair. It calls after her the whole way, getting louder, getting angrier, until it isn't her voice any more, only something wearing it badly.`, `In the crack of the Fourth Ward, the grey thrashes.`], choices:[back()]})},
  a3w2_heart:{ view: () => {
    const f = S.flags;
    if (f.wellWake) return {title:'The Well’s Heart', text:[`The way to the Well's heart is open.`], choices:[{label:'Go down', go:'a3w2_boss'}, back()]};
    const t = [`At the bottom of the Lantern Well, under the gold glow, there's a door with no handle, and on it the same seal as the Ninth Tower's: seven stones round an eighth. Behind it, the glow. The first flame.`,
      `It wants waking. The founders keyed everything they made the same way.`, w2Vial()];
    const ch = [];
    if (f.vial > 0) ch.push({label:'Tamsin gives the seal a drop of Wren’s blood.', act: () => { f.vial--; f.wellWake = 'blood'; go('a3w2_heart'); }});
    ch.push({label:'Tamsin gives it her own light instead.', act: () => { f.wellWake = 'light'; asHeroState('tamsin', () => { S.pc.hp = Math.max(1, S.pc.hp - Math.ceil(pcMax() * 0.3)); }); chron('Beneath the Fourth Ward, Tamsin opened the founders’ seal with her own light. It cost her.'); go('a3w2_heart'); }});
    ch.push({label:'Ilsa speaks the Word into it.', act: () => { f.wellWake = 'word'; chron('Beneath the Fourth Ward, Ilsa opened the founders’ seal with the Word, a few yards from the thing that speaks in her voice.'); go('a3w2_heart'); }});
    ch.push(back());
    return {title:'The Well’s Heart', text:t, choices:ch};
  }},
  a3w2_boss:{ view: () => {
    const f = S.flags;
    const t = [`The door opens on a small round room, and in the middle of it, on a stone, a flame. Just a flame, the size of a hand, burning on nothing, gold and steady. It has been burning here for nine hundred years.`,
      `And wrapped round the stone, reaching for the flame and flinching back from it, over and over, is the thing that grew up out of the Fourth Ward's crack: grey, thin, many-armed, with a face that keeps almost being Ilsa's. The Hollow Speaker. Around it, smaller shapes with the same almost-face: echoes.`];
    if (f.heardTerms) t.push(`It knows what Ilsa asked it. It's slower, now, unsure, as if it hasn't decided whether you're enemies.`);
    else if (f.heardTerms === false) t.push(`It knows Ilsa wouldn't answer it. It's furious.`);
    if (f.wellWake === 'word') t.push(`It heard the Word, a few yards away. Every echo turns toward Ilsa.`);
    if (f.aurelHelp) t.push(`Aurel's voice in Ilsa's head, from the herb garden: <em>the joints, where it bends. The Ward's crack runs through it there.</em>`);
    t.push(`<em>A hard fight. The Speaker uses Ilsa's own Word against all of you; its echoes come back if they're not burned with light.</em>`);
    return {title:'The Well’s Heart', text:t, choices:[{label:'Fight the Hollow Speaker', act: () => startCombat('a3w2_boss')}, {label:'Fall back and prepare', act: () => toMap('a3w2_below')}]};
  }},
  a3w2_bossWin:{ enter(){ if (S.flags.w2Boss) return; S.flags.w2Boss = true; }, view: () => {
    const f = S.flags;
    const t = [`The Hollow Speaker comes apart into grey dust that falls back into the Fourth Ward's crack like sand into an hourglass. The last thing to go is the almost-face, and the last thing it says, in Ilsa's voice, is "<em>Later.</em>"`,
      `The first flame burns on its stone, untouched.`];
    t.push(f.lamp ? `Tamsin lights the founder's lamp from it. The flame goes across like a spark jumping, and the old bronze lamp fills with gold, and she holds both lights, first and second, and for a moment she can't speak at all. It's whole. The whole rite. The thing the Order lost.` : `Tamsin lights her own lantern from it, carefully, the way you'd light a candle from an altar. The first flame and the second, together. The rite isn't whole without the founders' lamp, wherever that's got to. But this is most of it.`);
    return {title:'The Well’s Heart', text:t, choices:[{label:'What to do with it', go:'a3w2_choice'}]};
  }},
  a3w2_choice:{ view: () => {
    const f = S.flags, t = tf(), p = partyF();
    const cost = t.lanternCost || p.lanternTwice || p.lanternThrice;
    const txt = [`The first flame can heal. That's what it's for: what the Lantern Order was for, before the Sundering. Tamsin can feel it in her hands.`,
      `She could spend it here. Walk down the hill into Kell's Rest and draw the grey out of everyone ${f.village === 'held' ? 'Durra has left' : 'who ever comes home to it'}, for good, the way it was meant to be done.${f.lamp && cost ? ' And with the founders’ lamp, the whole rite: what the Lantern took from her each time she paid for it, she could have back.' : ''}`,
      `Or she could carry it. Whole and unspent, to Corvane, to the Keystone. Whatever happens there, a flame that's burned for nine hundred years might be the difference.`];
    return {title:'The First Flame', text:txt, choices:[
      {label:'Spend it here. Heal Kell’s Rest.', act: () => { f.w2Flame = 'spent'; if (f.lamp && cost) f.lanternHealed = true; chron(`Tamsin spent the first flame at Kell’s Rest, and the grey went out of the village.${f.lanternHealed ? ' What the Lantern had taken from her came back.' : ''}`); go('a3w2_end'); }},
      {label:'Carry it to Corvane, whole.', act: () => { f.w2Flame = 'carried'; chron('Tamsin carried the first flame west, whole and unspent, for the Keystone.'); go('a3w2_end'); }}
    ]};
  }},
  a3w2_end:{ view: () => {
    const f = S.flags;
    const t = [f.w2Flame === 'spent' ? `Tamsin walks down through Kell's Rest at dawn with the first flame in her cupped hands, and the grey goes out of the doorposts and the well and the moss on the steps, and out of ${f.village === 'held' ? 'Durra, who sits down in the road and laughs' : 'the empty houses, waiting for whoever comes home'}. By noon the flame is gone. Tamsin is tired in an ordinary way, for the first time in a year.${f.lanternHealed ? ' Her hands, when she holds them up to the light, are steady.' : ''}` : `Tamsin carries the first flame out of the mountain in her lantern, burning gold behind the glass, and walks past the grey doorposts of Kell's Rest without stopping. It's the hardest thing she's ever done. Bracken whines at every door.`,
      `Then down the mountain, and west, toward Corvane, behind the Kindled, with the silver book in Hask's pack and the Hollow's voice gone quiet in Ilsa's head. For now. <em>Later</em>, it said.`, w2Vial()];
    return {title:'Leaving Hearthdeep', text:t, choices:[{label:'End of chapter', act: () => {
      setQ('w2', 'done', 'Ilsa and Tamsin found the first flame of the Lantern under the Fourth Ward.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  a3w2_road:{
    title:'Hearthdeep',
    blurb: () => `The pass road, the mountains, and Kell's Rest above them.`,
    w:340, h:260,
    nodes:[
      {id:'a3w2_calder', label:'Saint Calder’s Rest', x:50, y:210, sub:'Rest'},
      {id:'a3w2_oldroad', label:'The Old Road', x:170, y:210, sub:'Grey robes, going west', done: () => S.flags.roadDone2},
      {id:'a3w2_village', label:'Kell’s Rest', x:120, y:70, sub:'Tamsin’s village', done: () => S.flags.village},
      {id:'a3w2_shrine', label:'The Shrine', x:290, y:100, sub:'The Fourth Ward', open: () => S.flags.village, done: () => S.flags.shrineDone, lockText:'Go to the village first'}
    ],
    edges:[['a3w2_calder','a3w2_oldroad'],['a3w2_calder','a3w2_village'],['a3w2_village','a3w2_shrine'],['a3w2_oldroad','a3w2_shrine']]
  },
  a3w2_below:{
    title:'Beneath the Fourth Ward',
    blurb: () => `Under the shrine, under the mountain: the Lantern Well.`,
    w:340, h:260,
    nodes:[
      {id:'a3w2_well', label:'The Lantern Well', x:60, y:200, sub:'Rest'},
      {id:'a3w2_stone', label:'The Speaking Stone', x:150, y:60, sub:'The Fourth Ward', done: () => S.flags.stoneDone},
      {id:'a3w2_heart', label:'The Well’s Heart', x:290, y:150, sub:'The first flame', open: () => S.flags.stoneDone, done: () => S.flags.w2Boss, lockText:'Something is talking. Go and see.'},
      {id:'a3w2_up', label:'Up to the Shrine', x:170, y:220, sub:'Back to Kell’s Rest'}
    ],
    edges:[['a3w2_well','a3w2_stone'],['a3w2_stone','a3w2_heart'],['a3w2_well','a3w2_up']]
  }
});
SCENES.a3w2_up = {view: () => ({title:'The Stair', text:[`The stair up to the shrine.`], choices:[{label:'Up to Kell’s Rest', act: () => toMap('a3w2_road')}, back()]})};

Object.assign(ENEMIES, {
  // Pair enemies: two heroes and their two companions, tuned for level 17
  kindledrear:{name:'Kindled Rearguard', hp:480, dmg:[42,48], acc:76, dodge:6, armor:2, init:6, xp:60},
  kindledcant:{name:'Kindled Cantor', hp:300, dmg:[36,40], acc:76, dodge:6, armor:0, init:5, xp:60, ranged:true, row:'back', greyChance:30},
  lostpilgrim:{name:'Lost Pilgrim', hp:440, dmg:[38,44], acc:72, dodge:2, armor:1, init:4, xp:50, hollow:true, cleanse:true, greyChance:25},
  // the echo that turned when Ilsa used the Word so close
  smallecho:{name:'Grey Echo', hp:240, dmg:[36,42], acc:76, dodge:8, armor:0, init:6, xp:40, hollow:true, greyChance:25},
  greyecho:{name:'Grey Echo', hp:400, dmg:[46,52], acc:76, dodge:8, armor:0, init:6, xp:60, hollow:true, greyChance:25},
  speaker:{name:'The Hollow Speaker', hp:1200, dmg:[48,56], acc:78, dodge:4, armor:2, init:5, xp:400, hollow:true, ranged:true, row:'back', greyChance:25,
    spec:{every:2, name:'The Word, Unspoken', windup:'{n} opens its almost-mouth, and says something in Ilsa’s voice that makes the air go grey.', mult:2.2, aoe:true, grey:2}},
  // Ilsa asked it what it wanted; it isn't sure you're enemies
  speakerUnsure:{name:'The Hollow Speaker', hp:1100, dmg:[44,52], acc:76, dodge:4, armor:2, init:5, xp:400, hollow:true, ranged:true, row:'back', greyChance:20,
    spec:{every:2, name:'The Word, Unspoken', windup:'{n} opens its almost-mouth, hesitates, and speaks anyway.', mult:2.0, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  a3w2_road:{title:'The Old Road', level:17, lethal:true, flee:true, win:'a3w2_roadWin', back:'a3w2_oldroad',
    enemies:() => ['kindledrear', 'kindledrear', 'kindledcant'], intro:'The Kindled rearguard turns, singing.'},
  a3w2_shrine:{title:'The Shrine Door', level:17, lethal:true, win:'a3w2_shrineWin', back:'a3w2_shrine',
    enemies:() => ['lostpilgrim', 'lostpilgrim', 'lostpilgrim'], intro:'The grey shapes in the doorway turn toward you. They were people, once. Some of them still are.'},
  a3w2_boss:{title:'The Hollow Speaker', level:17, lethal:true, win:'a3w2_bossWin', back:'a3w2_boss',
    enemies:() => {
      const f = S.flags, e = ['greyecho'];
      if (!f.aurelHelp) e.push('greyecho');                                         // Aurel showed Ilsa where it's weakest
      if (f.wellWake === 'word') e.push('smallecho');                               // it heard the Word, and one more echo turned
      return e.concat([f.heardTerms ? 'speakerUnsure' : 'speaker']);
    },
    intro:'The Hollow Speaker turns its almost-face to Ilsa.'}
});

const _w1Echoes = HEROES.west.echoes;
HEROES.west.echoes = () => {
  const f = S.flags, e = _w1Echoes();
  if (f.lamp) e.push('Tobin brought the founder’s lamp west, from Kael and Wren.');
  if (f.aurelHelp) e.push('Aurel, cured, told Ilsa where the Hollow Speaker was weakest.');
  if (f.roadDone2) e.push('Ilsa and Tamsin broke the Kindled rearguard on the old road. The rest are already marching on Corvane.');
  if (f.heardTerms) e.push('Ilsa asked the Hollow what it would take instead of lives. She knows its terms.');
  if (f.heardTerms === false) e.push('The Hollow spoke to Ilsa in her own voice, and she did not answer.');
  if (f.w2Boss) e.push('The first flame of the Lantern is found.');
  if (f.w2Flame === 'spent') e.push(`Tamsin spent the first flame healing Kell’s Rest.${f.lanternHealed ? ' What the Lantern had taken from her came back.' : ''}`);
  if (f.w2Flame === 'carried') e.push('Tamsin carries the first flame to Corvane, whole and unspent.');
  return e;
};

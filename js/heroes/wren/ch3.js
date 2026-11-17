// ================= WREN, CHAPTER 3: THE RIVER =================
// The end of Wren's Act 1. Wren and Tobin take the river barges down to Corvane: the Iron Tally (Kael's ch2 choice),
// Crown river patrols (her fragment choice), Mother Quell's debt, and Voss's last shard barge with Ashen Hand
// river-priests raising something from the water. Scene IDs use the prefix w3_.
// Placeholder names: the Patient Heron, the Drowned One, Corvane Reach. Writes `barge` ('sunk' | 'crown'), read by
// Kael's chapter 3.
HEROES.wren.chapters[3] = {title:'The River', start:'w3_intro'};

const wTally = () => otherF('kael').captain || null;         // 'freed' or 'handed'
const wFragKept = () => S.flags.fragment === 'kept';
const w3XP = (n) => { const ups = gainXP(n); return `+${n} experience${ups.length ? `. Level up! Wren is now level ${S.level}.` : '.'}`; };

Object.assign(SCENES, {
  w3_intro:{
    enter(){ quest('river', 'The River', 'Take the river barges down to Corvane.'); },
    view: () => {
      const t = [
        `The river below Ardh Lirien is wide and brown and slow, and it carries half the trade of the Reach down to Corvane on its back: salt barges, grain barges, timber rafts, and boats that don't say what they carry.`,
        `You and Tobin buy passage on a grain barge called the <em>Patient Heron</em>, whose bargemaster asks no questions for an extra crown a day. ${wFragKept() ? 'Tobin keeps the crate between his feet on the deck. It hums against the planks.' : 'Tobin keeps looking at the place on his back where the crate used to be.'}`,
        `Five days to Corvane. On a river, everybody can see you coming, and nobody can get off.`
      ];
      return {title:'The River', text:t, choices:[{label:'Down the river', act: () => toMap('w3_river')}]};
    }
  },

  // --- The upper river ---
  w3_deck:{ view: () => ({
    title:'The Patient Heron',
    text:[`A space between the grain sacks under an awning, out of the sun. Tobin snores. The river slides by.`],
    choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health)', act: () => { restAll(); S.notice = 'You rest. Health restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  w3_tally:{ view: () => {
    const f = S.flags, k = wTally();
    if (f.tallyDone) return {title:'The Tally Barge', text:[f.tallyHelp ? `The Iron Tally's barge is a little way downriver, keeping pace with you.` : `The Iron Tally's barge is gone.`], choices:[back()]};
    if (k === 'freed') return {title:'The Tally Barge', text:[
      `On the second day, a barge comes alongside with an iron tally-stick nailed over its door, and a broad, grey-haired woman leaning on the rail. "You're the half-Sylvari who travels with nobody," she says. "And you know Kael Dunmore. He let me walk at Hollin's Ford, and I pay my debts. Odile Brask."`,
      `"There's a shard barge two days downriver," she says. "Voss's last. And men in ash-grey robes on it who aren't Voss's. If you're going near it, the Iron Tally will be near too."`,
      echo('kael', 'Kael beat the Iron Tally at Hollin’s Ford and let Captain Brask walk. She owes him, and his friends.')
    ], choices:[{label:'"I’ll take that help."', act: () => { f.tallyDone = true; f.tallyHelp = true; S.notice = w3XP(60); chron('Captain Brask of the Iron Tally offered you her help on the river, for Kael’s sake.'); render(); }}]};
    if (k === 'handed') return {title:'The Tally Barge', text:[
      `On the second day, a barge comes alongside with an iron tally-stick nailed over its door, and men with crossbows at the rail. "Half-Sylvari," their leader calls. "You were seen on the road with Dunmore's kind. Our captain's in a Crown cellar because of him. Come here."`,
      echo('kael', 'Kael handed Captain Brask to the Crown. Her crew works the river now, and they’re hunting anyone who walks beside him.')
    ], choices:[{label:'Fight them off', act: () => startCombat('w3_tally')}, back('Pull away for now')]};
    return {title:'The River Traffic', text:[`Barges, rafts and fishing boats. One with an iron tally-stick over the door keeps its distance. The bargemaster says the Free Companies work the river in winter.`], choices:[{label:'Keep your head down.', act: () => { f.tallyDone = true; render(); }}, back()]};
  }},
  w3_tallyWin:{ enter(){ S.flags.tallyDone = true; S.gold += 25; S.notice = 'You find 25 crowns on the boarders.'; chron('You fought off the Iron Tally on the river.'); }, view: () => ({
    title:'The Tally Barge',
    text:[`The Tally barge pulls away with its wounded. One of them shouts back across the water: "Voss's shard barge is two days down! Hope the priests drown you!"`],
    choices:[back()]
  })},
  w3_patrol:{ view: () => {
    const f = S.flags;
    if (f.patrolDone3) return {title:'The Crown Cutter', text:[`The Crown's river cutter is behind you.`], choices:[back()]};
    if (S.flags.fragment === 'crown') return {title:'The Crown Cutter', text:[
      `A Crown cutter comes down the river searching every barge. When they get to the <em>Heron</em>, you show them Envoy Marrow's pass, and the lieutenant salutes. "The envoy said you might be on the river. She says to watch for a barge with Sarne paint and grey robes on it, two days down."`
    ], choices:[{label:'Thank him.', act: () => { f.patrolDone3 = true; f.patrolHow3 = 'pass'; S.notice = w3XP(60); render(); }}]};
    if (wFragKept()) return {title:'The Crown Cutter', text:[
      `A Crown cutter comes down the river searching every barge. There's a drawing on the lieutenant's board: a half-Sylvari archer, and underneath, <em>WARDSTONE FRAGMENT, STOLEN FROM THE CROWN.</em> They're two barges away.`,
      `The crate on the deck hums.`
    ], choices:[
      Object.assign({label:'Sink the crate in the bilge under the grain, and be somewhere else when they search.', act: () => { f.patrolDone3 = true; f.patrolHow3 = 'hid'; S.notice = w3XP(60); chron('You hid the fragment from a Crown river patrol.'); render(); }}, chk('stealth', 2)),
      Object.assign({label:'"Grain for the Lantern Cathedral, lieutenant. The Order will be very cross if it’s late."', act: () => { f.patrolDone3 = true; f.patrolHow3 = 'bluff'; S.notice = w3XP(60); render(); }}, chk('leadership', 1)),
      {label:'When they board, fight.', act: () => startCombat('w3_patrol')},
      back()
    ]};
    return {title:'The Crown Cutter', text:[`A Crown cutter goes by upriver, searching barges. They don't stop for the <em>Heron</em>.`], choices:[{label:'Watch it go.', act: () => { f.patrolDone3 = true; render(); }}]};
  }},
  w3_patrolWin:{ enter(){ S.flags.patrolDone3 = true; S.flags.patrolHow3 = 'fight'; S.items.draught += 1; S.notice = 'You find a Healing Draught on the cutter.'; chron('You fought off a Crown river patrol. The Crown will remember.'); }, view: () => ({
    title:'The Crown Cutter',
    text:[`The cutter drifts away with its crew bailing and swearing. The bargemaster of the <em>Heron</em> looks at you and doubles your fare.`],
    choices:[back()]
  })},
  w3_quell:{ view: () => {
    const f = S.flags;
    if (f.quellDone) return {title:'Quell’s Barge', text:[`Quell's green-and-gold barge is far behind you.`], choices:[back()]};
    const t = [
      `At the river town of Wending, a barge painted green and gold is moored at the quay, and nobody at Gallows Ford remembers it ever moving: Mother Quell's counting-house. She's come down the river to meet you. Of course she has.`,
      `"Wren." Small and soft-spoken, with more rings than fingers. "You carried my crate to the wrong buyer, and then you didn't bring it back. Nell came home limping. I'll have the crate, or its worth. Three hundred crowns."`,
      `"And then I'll tell you something worth knowing about a barge called the <em>Grey Heron</em>, because I sold its route to the wrong people too, and I'd like them sunk."`
    ];
    if (wFragKept()) t.push(`Her eyes go to the crate on Tobin's back and stay there.`);
    return {title:'Quell’s Barge', text:t, choices:[
      {label:'Pay her three hundred crowns.', req: () => S.gold >= 300, tag: S.gold >= 300 ? null : 'Needs 300 crowns', act: () => { S.gold -= 300; f.quellDone = true; f.quellHow = 'paid'; chron('You paid Mother Quell three hundred crowns and settled your debt.'); go('w3_quellTip'); }},
      Object.assign({label:'Come back at night and steal your debt marker out of her strongbox.', act: () => { f.quellDone = true; f.quellHow = 'stole'; S.notice = w3XP(80); chron('You stole your debt marker out of Mother Quell’s strongbox.'); go('w3_quellTip'); }}, chk('lockpick', 1)),
      {label:'"No." And see what her bargemen do.', act: () => startCombat('w3_quell')},
      back()
    ]};
  }},
  w3_quellWin:{ enter(){ S.flags.quellDone = true; S.flags.quellHow = 'fought'; chron('You fought Mother Quell’s bargemen at Wending. Your debt is not settled; it’s just angrier.'); }, view: () => ({
    title:'Quell’s Barge',
    text:[`When her bargemen are in the river, Quell is still sitting in her chair, counting. "Well," she says. "I'll put it on your account." She doesn't sound angry. She sounds like a woman who will be patient for a very long time.`],
    choices:[{label:'Continue', go:'w3_quellTip'}]
  })},
  w3_quellTip:{ view: () => ({
    title:'Quell’s Barge',
    text:[
      {paid:`Quell counts it twice. "Good girl," she says, and for once you don't hate it.`, stole:`You're three bends downriver by dawn, with your debt marker burning in the stove.`, fought:``}[S.flags.quellHow] || '',
      `${S.flags.quellHow === 'fought' ? 'Her' : 'Quell’s'} tip comes all the same, because Quell likes the Ashen Hand even less than she likes you: the <em>Grey Heron</em>, Voss's last shard barge, anchored at Corvane Reach a day above the city. "Twelve crates of stone," she says. "And priests in grey who've been singing to the water every night. Something down there is singing back."`
    ],
    choices:[back()]
  })},
  w3_onward:{ view: () => ({
    title:'Down to Corvane Reach',
    text:[`The river widens and slows, and on the last day before Corvane the <em>Heron</em> anchors for the night at Corvane Reach, a stretch of reed-bed and backwater. Two bends down, a barge with Sarne paint is anchored in the middle of the water, and you can hear singing.`],
    choices:[{label:'To Corvane Reach', act: () => toMap('w3_reach')}, {label:'Not yet', act: () => toMap('w3_river')}]
  })},

  // --- Corvane Reach ---
  w3_reeds:{ view: () => ({
    title:'The Reed Bed',
    text:[`A hollow in the reeds where you can see the Sarne barge and it can't see you. Tobin keeps watch with his boathook across his knees.`],
    choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health)', act: () => { restAll(); S.notice = 'You rest. Health restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  w3_wreck:{ view: () => S.flags.wreckDone ? ({
      title:'The Sunk Barge', text:[`The old wreck is quiet now.`], choices:[back()]
    }) : ({
      title:'The Sunk Barge',
      text:[`In the backwater, an old salt barge lies half sunk, and something has been climbing out of it at night: you can see the wet tracks on the bank. Grey, and shaped like hands.`],
      choices:[{label:'Go aboard', act: () => startCombat('w3_wreck')}, back('Leave it')]
    })
  },
  w3_wreckWin:{ enter(){ S.flags.wreckDone = true; S.gear.armor += 1; S.items.tonic += 1; S.notice = 'In the wreck’s cabin you find a bargemaster’s leather coat, oiled and studded (+1 armor), and a Bitter Tonic.'; }, view: () => ({
    title:'The Sunk Barge',
    text:[`They were bargemen once. The grey came up out of the river into them. Whatever the priests are calling, it's been leaking into the water for weeks.`],
    choices:[back()]
  })},
  w3_scout:{ view: () => {
    const f = S.flags;
    if (f.scoutDone) return {title:'Under the Barge', text:[f.ritualLore ? `You know the shape of their hymn now, and where it breaks.` : `You've seen the barge from the water.`], choices:[back()]};
    return {title:'Under the Barge', text:[
      `After dark, you can swim out to the Sarne barge under the reeds and listen. Three priests in ash-grey robes kneel at the stern, singing down into the water, and the crates are open, and the shards in them are glowing in time with the song.`,
      `Something under the barge is answering.`
    ], choices:[
      Object.assign({label:'Swim close enough to hear the words of the hymn.', act: () => { f.scoutDone = true; f.ritualLore = true; S.notice = w3XP(60); chron('You swam under the Grey Heron and learned the river-priests’ hymn.'); render(); }}, chk('stealth', 1)),
      {label:'Count them from the reeds and swim back.', act: () => { f.scoutDone = true; render(); }},
      back()
    ]};
  }},
  w3_barge:{ view: () => {
    const f = S.flags;
    const t = [`At midnight the singing rises, and the water around the <em>Grey Heron</em> heaves. You and Tobin come over the stern rail together.`];
    if (f.tallyHelp) t.push(`On the far side of the barge, the Iron Tally comes over the rail too, and one of the priests takes a crossbow bolt and turns to face them, half his attention gone.`);
    if (f.ritualLore) t.push(`You know the hymn. When it comes to the part that calls, you shout the wrong word into it, and the thing coming up out of the water falters.`);
    t.push(`And then it's on the deck: a shape of grey water and black shards, man-high and growing, with a drowned bargeman's face, reaching for the crates.`, `<em>This will be a hard fight. The priests sing it stronger; the Drowned One drags at whoever's nearest.</em>`);
    return {title:'The Grey Heron', text:t, choices:[{label:'Fight', act: () => startCombat('w3_boss')}, {label:'Fall back into the reeds', act: () => toMap('w3_reach')}]};
  }},
  w3_bossWin:{
    enter(){ if (S.flags.w3Boss) return; S.flags.w3Boss = true; },
    view: () => ({
      title:'The Grey Heron',
      text:[
        `The Drowned One comes apart all at once into grey water and runs off the deck through the scuppers, and the last priest goes over the rail after it. The singing stops.`,
        `Twelve crates of Wardstone shards on the deck, glowing faintly. The barge's tiller under your hand. Corvane, a day downriver.`,
        `"We could sink it," Tobin says. "Right here. Nobody gets them, ever." He looks at the grey still slicking the water around the hull. "Or we could take it in. The Crown's water-gate. Proof." He shrugs. "Your call. It's always your call."`
      ],
      choices:[{label:'Decide', go:'w3_choice'}]
    })
  },
  w3_choice:{ view: () => ({
    title:'The Grey Heron',
    text:[
      `Sink it, and twelve crates of the cage go to the bottom of the Reach where the Ashen Hand can't sing to them and Voss can't sell them. Voss will be left with half a cellar and no more coming. But the grey that's already in the water will spread downriver, into Corvane's wells.`,
      `Steer it in, and the Crown has a barge full of proof sailing into its own water-gate, and the river stays clean. But Sarne and the Arcanum will know by morning that the Crown has their barge, and they'll be ready for whoever comes next.`
    ],
    choices:[
      {label:'Open the seacocks. Sink it.', act: () => { S.flags.barge = 'sunk'; chron('You sank Voss’s last shard barge at Corvane Reach.'); go('w3_sunk'); }},
      {label:'Steer it into the Crown’s water-gate.', act: () => { S.flags.barge = 'crown'; chron('You steered Voss’s last shard barge into the Crown’s water-gate.'); go('w3_crown'); }}
    ]
  })},
  w3_sunk:{ view: () => ({
    title:'Corvane Reach',
    text:[
      `The <em>Grey Heron</em> goes down by the stern, slowly, with the shards glowing through the water all the way to the bottom. Then they're gone, and the river is dark.`,
      `In the morning, the water at Corvane Reach has a faint grey sheen to it, and it runs downriver, toward the city.`
    ],
    choices:[{label:'Continue', go:'w3_ending'}]
  })},
  w3_crown:{ view: () => ({
    title:'Corvane',
    text:[
      `You bring the <em>Grey Heron</em> down the last reach at dawn with Tobin on the sweep oar, under the walls of Corvane, straight into the Crown's water-gate with a white rag on the mast. Soldiers come running.`,
      S.flags.fragment === 'crown' ? `You show them Marrow's pass, and an hour later the envoy herself comes down to the quay and looks at the crates for a long time. "Thank you," she says. "Again."` : `They arrest you, then they open the crates, and then they stop arresting you. A captain takes the barge. Nobody thanks you, but nobody hangs you either.`,
      `By noon, the whole quay knows the Crown has a Sarne barge full of stone.`
    ],
    choices:[{label:'Continue', go:'w3_ending'}]
  })},
  w3_ending:{ view: () => {
    const f = S.flags, t = otherF('tamsin');
    const txt = [
      `Corvane. Tall houses leaning together over narrow streets, towers, the green dome of the Council House, and the great iron lantern burning on the roof of the Lantern Cathedral.`,
      `Somewhere in this city, twenty years ago, your father came to warn the Crown and never came back.`,
      wFragKept() ? `The crate hums against Tobin's back. It hasn't stopped since you came under the walls.` : `Tobin keeps reaching for a crate that isn't there.`
    ];
    if (t.foundRite) txt.push(`And at the Lantern Cathedral, they say, a Stoneborn sister came up out of a burning archive with a book that needs a Warden's blood.`, echo('tamsin', 'Tamsin found the Second Lantern: a cure that needs one of a Warden’s blood. Wren is of the Warden line.'));
    txt.push(`In your vision there were three others, all walking toward this city. You think you've just walked into it with them.`, `<em>This is the end of Wren's part of Act 1. In Act 2, the four meet in Corvane.</em>`);
    return {title:'Corvane', text:txt, choices:[{label:'End of chapter 3', act: () => {
      setQ('river', 'done', f.barge === 'sunk' ? 'You came down the river to Corvane and sank Voss’s last shard barge.' : 'You came down the river to Corvane and gave Voss’s last shard barge to the Crown.');
      setQ('corvane', 'done', 'You reached Corvane.');
      quest('others', 'The others from the vision', 'Find the three strangers from your vision. You think they’re in Corvane.');
      if (S.flags.metAunt) quest('father2', 'Your father in Corvane', 'Your father came to Corvane twenty years ago to warn the Crown, and never came back. Find out what happened to him.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  w3_river:{
    title:'The River',
    blurb: () => `Five days of brown water to Corvane, and nowhere to get off.`,
    w:340, h:250,
    nodes:[
      {id:'w3_deck', label:'The Patient Heron', x:50, y:205, sub:'Rest'},
      {id:'w3_tally', label:'The Tally Barge', x:150, y:150, sub:'The Iron Tally', done: () => S.flags.tallyDone},
      {id:'w3_patrol', label:'Crown Cutter', x:70, y:75, sub:'A patrol', done: () => S.flags.patrolDone3},
      {id:'w3_quell', label:'Wending Quay', x:250, y:80, sub:'Mother Quell', done: () => S.flags.quellDone},
      {id:'w3_onward', label:'Corvane Reach', x:290, y:200, sub:'The Grey Heron', open: () => S.flags.quellDone && S.flags.patrolDone3 && S.flags.tallyDone, lockText:'Deal with the Tally barge, the patrol and Quell'}
    ],
    edges:[['w3_deck','w3_tally'],['w3_deck','w3_patrol'],['w3_patrol','w3_quell'],['w3_tally','w3_quell'],['w3_tally','w3_onward'],['w3_quell','w3_onward']]
  },
  w3_reach:{
    title:'Corvane Reach',
    blurb: () => `Reeds, backwater and a Sarne barge singing in the dark.`,
    w:340, h:240,
    nodes:[
      {id:'w3_reeds', label:'The Reed Bed', x:50, y:190, sub:'Rest'},
      {id:'w3_wreck', label:'Sunk Barge', x:70, y:70, sub:'Optional', done: () => S.flags.wreckDone},
      {id:'w3_scout', label:'Under the Barge', x:180, y:180, sub:'Listen', done: () => S.flags.scoutDone},
      {id:'w3_barge', label:'The Grey Heron', x:290, y:100, sub:'The river-priests', done: () => S.flags.w3Boss}
    ],
    edges:[['w3_reeds','w3_wreck'],['w3_reeds','w3_scout'],['w3_scout','w3_barge'],['w3_wreck','w3_barge']]
  }
});

Object.assign(ENEMIES, {
  bargeman:{name:'Quell’s Bargeman', hp:34, dmg:[8,11], acc:72, dodge:5, armor:1, init:5, xp:35},
  drowned:{name:'Drowned Bargeman', hp:34, dmg:[8,11], acc:70, dodge:2, armor:1, init:3, xp:35, hollow:true, greyChance:25},
  riverpriest:{name:'River-Priest', hp:50, dmg:[10,13], acc:74, dodge:6, armor:0, init:5, xp:50, ranged:true, row:'back', calm:true, greyChance:20},
  // The Iron Tally (Brask freed) is fighting this one from the other rail
  riverpriestHurt:{name:'River-Priest (fighting the Tally)', hp:25, dmg:[10,13], acc:74, dodge:6, armor:0, init:5, xp:50, ranged:true, row:'back', calm:true, greyChance:20},
  // The lead priest sings the hymn: an area grey every other turn
  hymnpriest:{name:'Ashen Cantor of the River', hp:75, dmg:[10,13], acc:74, dodge:6, armor:0, init:5, xp:80, ranged:true, row:'back', greyChance:20,
    spec:{every:2, name:'Drowning Hymn', windup:'{n} lifts both hands, and the river rises to the rail in a grey wave.', mult:1.8, aoe:true, grey:2}},
  // Tuned by bot sim (150 runs): ~80% first-try wins at level 7 if she learned the hymn (63% if not), ~92% with the
  // Iron Tally too; 60–85% at level 6. Fights run 12–16 rounds.
  drownedone:{name:'The Drowned One', hp:200, dmg:[14,17], acc:72, dodge:2, armor:2, init:3, xp:200, hollow:true,
    spec:{every:3, name:'Undertow', windup:'{n} rises, and the water around your feet starts to pull.', mult:1.6, stun:true}},
  // Wren knew the hymn and shouted the wrong word into it
  drownedWeak:{name:'The Drowned One', hp:165, dmg:[13,16], acc:70, dodge:2, armor:2, init:3, xp:200, hollow:true,
    spec:{every:3, name:'Undertow', windup:'{n} rises unsteadily, and the water around your feet starts to pull.', mult:1.4, stun:true}}
});
Object.assign(COMBATS, {
  w3_tally:{title:'The Tally Barge', enemies:() => ['tallyhand', 'tallynet', 'tallyxbow'], lethal:true, win:'w3_tallyWin', back:'w3_tally',
    intro:'The Iron Tally comes over the rail.'},
  w3_patrol:{title:'The Crown Cutter', enemies:() => ['soldier', 'soldier', 'sergeant'], lethal:true, win:'w3_patrolWin', back:'w3_patrol',
    intro:'The Crown soldiers swing aboard with their shields up.'},
  w3_quell:{title:'Quell’s Barge', enemies:() => ['bargeman', 'bargeman', 'qknife'], lethal:true, win:'w3_quellWin', back:'w3_quell',
    intro:'Quell doesn’t look up from her counting. Her bargemen pick up their hooks.'},
  w3_wreck:{title:'The Sunk Barge', enemies:() => ['drowned', 'drowned', 'drowned'], lethal:true, flee:true, win:'w3_wreckWin', back:'w3_wreck',
    intro:'They come up out of the flooded hold.'},
  // The Drowned One, the cantor and two priests. The Iron Tally boarding (Brask freed) wounds one priest; knowing
  // the hymn weakens the Drowned One.
  w3_boss:{title:'The Drowned One', lethal:true, win:'w3_bossWin', back:'w3_barge',
    enemies:() => {
      const f = S.flags;
      return [f.ritualLore ? 'drownedWeak' : 'drownedone', 'riverpriest', f.tallyHelp ? 'riverpriestHurt' : 'riverpriest', 'hymnpriest'];
    },
    intro:'The Drowned One rises over the rail. Behind it the priests keep singing.'}
});

// Chapter 3 echoes: Wren's own ending, and into Kael's, Ilsa's and Tamsin's
const _wrenEchoesW3 = HEROES.wren.echoes, _kaelEchoesW3 = HEROES.kael.echoes, _ilsaEchoesW3 = HEROES.ilsa.echoes, _tamsinEchoesW3 = HEROES.tamsin.echoes;
HEROES.wren.echoes = () => { const e = _wrenEchoesW3(); const f = S.flags;
  if (chapterOf(S) < 3) return e;
  if (f.barge === 'sunk') e.push('Wren sank Voss’s last shard barge at Corvane Reach. The Ashen Hand can’t sing to it, and a grey sheen is running downriver into Corvane.');
  if (f.barge === 'crown') e.push('Wren steered Voss’s last shard barge into the Crown’s water-gate. The Crown has its proof, and Sarne and the Arcanum have been warned.');
  if (f.quellHow === 'paid') e.push('Wren paid Mother Quell. Her debt at Gallows Ford is settled.');
  if (f.quellHow === 'stole') e.push('Wren stole her debt marker from Mother Quell. Quell knows.');
  if (f.quellHow === 'fought') e.push('Wren fought Mother Quell’s bargemen. Quell has put it on her account.');
  if (f.tallyHelp) e.push('The Iron Tally fought beside Wren on the river, for Kael’s sake.');
  return e; };
HEROES.kael.echoes = () => { const e = _kaelEchoesW3(); const w = otherF('wren');
  if (w.barge === 'sunk') e.push('<b>Linked:</b> Wren sank Voss’s last shard barge. His cellar was half empty when Kael got there.');
  if (w.barge === 'crown') e.push('<b>Linked:</b> Wren brought Voss’s shard barge into the Crown’s water-gate. The Crown was watching Number Nine.');
  if (w.tallyHelp && S.flags.captain === 'freed') e.push('<b>Linked:</b> Captain Brask paid her debt to Kael by fighting beside Wren on the river.');
  return e; };
HEROES.ilsa.echoes = () => { const e = _ilsaEchoesW3(); const w = otherF('wren');
  if (w.barge === 'crown') e.push('<b>Linked:</b> Wren gave the Crown a barge of Wardstone shards bound for the Arcanum’s Corvane house.');
  return e; };
HEROES.tamsin.echoes = () => { const e = _tamsinEchoesW3(); const w = otherF('wren');
  if (w.barge === 'sunk') e.push('<b>Linked:</b> Wren sank a shard barge above Corvane. The grey is in the river now, and it will reach the city’s wells.');
  return e; };

// ================= ILSA, CHAPTER 2: KELL'S REST =================
// Ilsa goes north into Hearthdeep to find the Lantern Order. Kell's Rest is as Tamsin left it (evacuated or
// defended), so this chapter waits for Tamsin's chapter 1. Scene IDs use the prefix i2_.
HEROES.ilsa.chapters[2] = {title:'Kell’s Rest', start:'i2_intro', needs:[['tamsin', 1]]};

// Ilsa's companion Hask gets a little sturdier if she helps him make peace with his clan
ALLIES.hask.max = () => 34 + S.level * 3 + (S.flags.haskClan === 'mended' ? 6 : 0);
// Speaking the Word into the Fourth Ward deepens it: +8 damage
ACTIONS.word.run = function(u, t){
  C.used.word = true;
  const d = 12 + S.pc.attrs.mind * 2 + sk('arcane') * 2 + (S.flags.wordDeep ? 8 : 0);
  log(`Ilsa speaks the Unwritten Word. ${t.name} takes ${d}, straight through any armor.`); applyDmg(t, d);
  u.st.grey = Math.max(u.st.grey || 0, 2); log('Something vast notices. Ilsa is grey-touched.');
};

const tamsinChoice = () => otherF('tamsin').choice === 'evacuate' ? 'evacuate' : 'defend';
const aurelWithUs = () => S.flags.aurel === 'carried';

Object.assign(SCENES, {
  i2_intro:{
    enter(){ quest('lantern', 'Find the Lantern Order', 'Aurel said the Lantern Order holds the other half of the Concord. Their nearest house is the shrine above Kell’s Rest, in the Hearthdeep mountains.'); },
    view: () => ({
      title:'The North Road',
      text:[
        `Hask's boat puts in at a fishing village where the Spire Coast turns north and grey. From there the road climbs for six days into the Hearthdeep mountains, and the snow starts on the fourth.`,
        `The road to Corvane runs straight east through the lowlands, but you aren't taking it. ${S.flags.aurelTold || S.flags.fullReading ? `The Concord's last page said the bargain can be <em>ended</em>, and Aurel said the Lantern Order holds the other half of how.` : `The Concord names the Lantern Order as the keepers of the Fourth Ward, and the Fourth Ward stands in Hearthdeep.`} Their nearest house is a shrine above a village called Kell's Rest.`,
        aurelWithUs() ? `Aurel rides in a litter Hask built from oars and sailcloth. He sleeps most of the day. The grey has reached his collarbone.` : `Hask walks ahead, breaking the snow with his boots, and doesn't say much. He was born in these mountains. You've never asked why he left.`
      ],
      choices:[{label:'Up into the mountains', act: () => toMap('i2_road')}]
    })
  },

  // --- The North Road hub ---
  i2_camp:{ view: () => ({
    title:'The Road Camp',
    text:[`A shelf of rock out of the wind, a fire, and Hask's iron pot. ${aurelWithUs() ? 'Aurel is propped against the packs, watching the flames.' : 'Hask tends the fire as if it were a patient.'}`],
    choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest by the fire (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest by the fire. Health and spell points restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  i2_bridge:{ view: () => S.flags.bridgeDone ? ({
      title:'The Rope Bridge', text:[`The bridge sways over the gorge. Nobody guards it now.`], choices:[back()]
    }) : ({
      title:'The Rope Bridge',
      text:[
        `The road crosses a gorge on a bridge of rope and planks, and someone has made camp at the near end: men in ash-grey robes with hammers and chisels, hollow-eyed, arguing in low voices.`,
        otherF('tamsin').bossDone ? `Ashen Hand. Their Voice is dead on the mountain above Kell's Rest, and they're running, but not fast enough to stop being dangerous. One of them sees your ears and smiles.` : `Ashen Hand zealots. One of them sees your ears and smiles.`,
        `"Sylvari," he says. "The god likes your kind. Old blood. It lasts."`
      ].concat(otherF('tamsin').bossDone ? [echo('tamsin', 'Tamsin killed Velka, the Ashen Voice, at the Fourth Ward. Her zealots scattered down this road.')] : []),
      choices:[{label:'Fight your way across', act: () => startCombat('i2_bridge')}, back('Back off for now')]
    })
  },
  i2_bridgeWin:{ enter(){ S.flags.bridgeDone = true; S.items.aether += 1; S.notice = 'One of the zealots carried an Aether Draught.'; }, view: () => ({
    title:'The Rope Bridge',
    text:[`Hask tests the bridge with one boot, then the other, then sighs and starts across. "Stoneborn don't do bridges," he says. "We do tunnels. Bridges are for people in a hurry."`],
    choices:[back()]
  })},
  i2_den:{ view: () => S.flags.denDone ? ({
      title:'The Bear’s Den', text:[`The cave is quiet. Only bones, and a grey stain on the stone where the bear lay.`], choices:[back()]
    }) : ({
      title:'The Bear’s Den',
      text:[`Off the road, a cave mouth breathes cold air. Inside, something huge shifts and grunts: a mountain bear, its fur gone grey and stiff as frost. It isn't sleeping. Grey things don't.`, `It's guarding something. A dead traveller's pack lies at the back of the cave.`],
      choices:[{label:'Go in', act: () => startCombat('i2_bear')}, back('Leave it')]
    })
  },
  i2_bearWin:{ enter(){ if (S.flags.denDone) return; S.flags.denDone = true; S.items.draught += 2; S.gold += 25; S.notice = 'In the dead traveller’s pack: 2 Healing Draughts and 25 crowns.'; }, view: () => ({
    title:'The Bear’s Den',
    text:[`The traveller wore the lantern badge of the Order. Whoever they were, they were going to Kell's Rest too, and they didn't get there.`],
    choices:[back()]
  })},
  i2_hold:{ view: () => {
    if (S.flags.holdDone) return {title:'Stonebarrow', text:[`The great doors of Stonebarrow stand open for you now. ${S.flags.haskClan === 'mended' ? 'Hask’s sister waves from the gate.' : 'Nobody waves.'}`], choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest in the hall (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest in Stonebarrow’s hall. Health and spell points restored.'; render(); }} : null,
      back()].filter(Boolean)};
    return {
      title:'Stonebarrow',
      text:[
        `Stonebarrow is a Stoneborn hold cut straight into the mountain: a pair of doors forty feet tall, and behind them a hall that goes back further than your lamp can reach. Hask stops in front of the doors and doesn't move.`,
        `"This is my clan," he says finally. "I left thirty years ago. I broke an oath to do it." He looks at his hands. "They may not let me in. They may not let <em>you</em> in. Sylvari aren't much loved under the mountain."`,
        `The doors open a crack. A Stoneborn woman with Hask's jaw and none of his patience looks him up and down. "Hask. Brother. You look old."`
      ],
      choices:[
        Object.assign({label:'Speak for him. "He kept the keys to every room in the Arcanum for thirty years, and never once betrayed a trust. Ask me how I know."', act: () => { S.flags.holdDone = true; S.flags.haskClan = 'mended'; S.items.tonic += 1; S.items.draught += 1; restAll(); S.notice = 'Hask makes peace with his clan. He is sturdier for it (+6 health). They give you a Bitter Tonic and a Healing Draught.'; chron('You spoke for Hask at Stonebarrow, and his clan took him back.'); render(); }}, chk('leadership', 1)),
        {label:'Let Hask speak for himself.', act: () => { S.flags.holdDone = true; S.flags.haskClan = 'tolerated'; S.items.draught += 1; restAll(); S.notice = 'Stonebarrow lets you rest a night, and no more. They give you a Healing Draught.'; chron('Hask went home to Stonebarrow. His clan let him stay a night.'); render(); }},
        back('Not now')
      ]
    };
  }},
  i2_climb:{ view: () => ({
    title:'The Last Climb',
    text:[
      `The road tops a ridge, and below it, in a bowl of the mountains, lies Kell's Rest: stone houses dug into the hillside, and on the peak above it, a shrine like a candle on a shelf.`,
      tamsinChoice() === 'evacuate' ? `No smoke rises from the chimneys. The snow in the lanes is unbroken. And the grey is everywhere: a fog lying in the valley like milk in a bowl, thickest around the dark shrine on the peak.` : `Smoke rises from a few chimneys. There are fresh graves outside the village wall, a long row of them. On the peak, the shrine still burns with a faint, steady light.`,
      `You can't come back down this road once you're in the village. Not without finishing what you came for.`
    ],
    choices:[{label:'Down into Kell’s Rest', act: () => toMap('i2_kell')}, {label:'Not yet', act: () => toMap('i2_road')}]
  })},

  // --- Kell's Rest hub ---
  i2_lane:{ view: () => ({title:'The Village Lane', text:[tamsinChoice() === 'evacuate' ? `Empty houses, doors left open. A child's sledge lies on its side in the snow.` : `Stone houses with their shutters closed. Somebody is chopping wood, slowly.`], choices:[back()]}) },
  i2_hall:{ view: () => {
    if (tamsinChoice() === 'evacuate') return S.flags.hallDone ? {title:'The Elder’s Hall', text:[`The hall is empty again. The looters won't be back.`], choices:[back()]} : {
      title:'The Elder’s Hall',
      text:[
        `The Elder's Hall stands open, and somebody is inside: four men with sacks, prising the silver fittings off the council chairs. Not villagers. Scavengers from the next valley, come to strip a dead village.`,
        `They see you, and they see Hask, and they decide that two more travellers is just more silver.`,
        echo('tamsin', 'Tamsin evacuated Kell’s Rest. The village lived, but it is empty now, and the grey and the scavengers have it.')
      ],
      choices:[{label:'Fight', act: () => startCombat('i2_looters')}, back('Back off for now')]
    };
    return {
      title:'The Elder’s Hall',
      text:[
        `Elder Durra Flint is ninety and looks a hundred now. She sits by the fire in the hall with a blanket over her knees and listens to you without interrupting.`,
        `"Tamsin held the stone," she says. "Twelve days. We buried nine while she prayed. She went north to Corvane after, to find a cure. Sister Maud has her vigil now." She studies you. "And you've come to the shrine with a book that burns. Kesh will take you up. He knows the back paths."`,
        echo('tamsin', 'Tamsin stayed to hold the Fourth Ward. The village grieves, but the shrine holds, and Elder Durra is your ally.'),
        !S.flags.durraGift ? `She presses supplies on you, and won't hear a word about payment.` : ''
      ].filter(Boolean),
      choices:[
        !S.flags.durraGift ? {label:'Take the supplies', act: () => { S.flags.durraGift = true; S.flags.hallDone = true; S.items.draught += 2; S.items.aether += 1; S.notice = 'Elder Durra gives you 2 Healing Draughts and an Aether Draught. Kesh will guide you up the mountain.'; chron('Elder Durra of Kell’s Rest took you in. Kesh guided you to the shrine.'); render(); }} : null,
        back()
      ].filter(Boolean)
    };
  }},
  i2_looterWin:{ enter(){ S.flags.hallDone = true; S.gold += 30; S.items.draught += 1; S.notice = 'The scavengers had 30 crowns and a Healing Draught between them.'; }, view: () => ({
    title:'The Elder’s Hall',
    text:[`Hask stands the council chairs back up, one by one, very carefully. "When they come home," he says, "the chairs should be here."`],
    choices:[back()]
  })},
  i2_temple:{ view: () => {
    const t = [
      `The Lantern Temple is one stone room with an old lantern on the altar. ${tamsinChoice() === 'evacuate' ? 'It has gone out. Somebody left in a hurry and didn’t think to carry the flame.' : 'It burns low and steady, and someone has swept the floor this morning.'}`
    ];
    if (aurelWithUs()) t.push(tamsinChoice() === 'evacuate'
      ? `Pinned under the lantern is a letter in a tiny, fierce hand, addressed to <em>whoever comes next</em>: <em>"The grey that is in the land cannot be cured here. If you carry someone grey-touched, take them to the Lantern Cathedral in Corvane. The archive there may have what we lost. Sister Maud."</em>`
      : `Sister Maud's novice is tending the lantern. She looks at Aurel in his litter for a long time. "Sister Maud would say the same as me," she says quietly. "This is beyond the village. Take him to the Lantern Cathedral in Corvane. If the cure exists, it's there."`);
    return {title:'The Lantern Temple', text:t, choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest here (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest in the temple. Health and spell points restored.'; render(); }} : null,
      back()
    ].filter(Boolean)};
  }},
  i2_steps:{ view: () => S.flags.stepsDone ? ({
      title:'The Pilgrim Steps', text:[`Seven hundred steps, and the way up is clear.`], choices:[back()]
    }) : ({
      title:'The Pilgrim Steps',
      text: tamsinChoice() === 'evacuate' ? [
        `Seven hundred steps cut into the mountain, and the grey fog lies on every one of them. Halfway up, things are moving in it: ash hounds and grey wolves, circling the shrine like dogs around a sickbed.`
      ] : [
        `Kesh the hunter meets you at the foot of the steps with a bow and a coil of rope. "The steps aren't safe since the grey got into the wolves," he says. "I'll take you round the back way. We'll still meet some of them."`
      ],
      choices:[{label:'Climb', act: () => startCombat('i2_steps')}, back('Back off for now')]
    })
  },
  i2_stepsWin:{ enter(){ S.flags.stepsDone = true; }, view: () => ({
    title:'The Pilgrim Steps',
    text:[tamsinChoice() === 'evacuate' ? `The fog is thinner above the halfway point, and the shrine is close now. You can hear it: a low, grinding sound, like a millstone turning.` : `Kesh leads you out onto the shrine terrace. "I'll go no further," he says. "Sister Maud's up there. And something else. It came out of the crack three nights ago."`],
    choices:[back()]
  })},
  i2_shrine:{ view: () => ({
    title:'The Fourth Ward',
    text:[
      `The inner shrine is a ring of standing stones around a pillar of black stone veined with silver. A crack runs down it from crown to root.`,
      tamsinChoice() === 'evacuate'
        ? `The Ward is dark. Grey pours from the crack in a slow, steady flood, and in the flood something is standing up: a shape of ash and silver shards, taller than Hask, with a mouth where its chest should be. It is eating the stone, a little at a time.`
        : `Sister Maud kneels at the foot of the Ward, tiny and nearly blind, praying without a voice. The crack is holding. But something has squeezed out through it anyway: a shape of ash and silver shards, taller than Hask, with a mouth where its chest should be. It circles the old woman, and every time it comes close, her prayer pushes it back a step.`,
      `<em>This will be a hard fight. Rest at the temple first if you need to.</em>`
    ],
    choices:[{label:'Fight the Ward-Eater', act: () => startCombat('i2_boss')}, {label:'Back away and prepare', act: () => toMap('i2_kell')}]
  })},
  i2_bossWin:{
    enter(){ if (S.flags.wardEaterDone) return; S.flags.wardEaterDone = true; S.pc.skills.wardlore = Math.max(2, S.pc.skills.wardlore || 0); S.notice = 'Your Wardlore rises to 2.'; },
    view: () => ({
      title:'The Fourth Ward',
      text:[
        `The Ward-Eater comes apart into ash and falling shards, and the shards ring on the stone like coins. The grinding sound stops.`,
        tamsinChoice() === 'evacuate' ? `In the silence, you can hear the crack. It sounds like breathing.` : `Sister Maud lifts her head. "Child," she says, without turning. "You carry a word from the Concord. I can hear it in you, like a bell. Come here."`,
        `You put your hand on the cold silver vein. The Unwritten Word stirs in your throat. You know, the way you know your own name, that you could speak it into the stone. It would close the crack. Not forever. For a season, maybe. And something underneath everything would hear your voice, and remember it.`
      ],
      choices:[{label:'Decide', go:'i2_choice'}]
    })
  },
  i2_choice:{ view: () => ({
    title:'The Fourth Ward',
    text:[
      tamsinChoice() === 'evacuate'
        ? `If you speak the Word, the crack closes, and the grey fog drains out of the valley. Kell's Rest could go home. But the Hollow will know your voice, and it will look for you.`
        : `If you speak the Word, the crack closes, and Sister Maud can stop praying for the first time in weeks. She's very old, and she won't last many more. But the Hollow will know your voice, and it will look for you.`,
      `If you don't, the Ward stays as it is, and the Hollow goes on not knowing you exist.`,
      `Hask says nothing. He's leaving this one to you.`
    ],
    choices:[
      {label:'Speak the Word into the stone.', act: () => { S.flags.spokeWard = true; S.flags.wordDeep = true; S.flags.marked = true; chron('You spoke the Unwritten Word into the Fourth Ward. The crack closed for a season, and the Hollow learned your voice.'); go('i2_spoke'); }},
      {label:'Take your hand away.', act: () => { S.flags.spokeWard = false; chron('You chose not to speak the Word into the Fourth Ward. It is still cracked.'); go('i2_silent'); }}
    ]
  })},
  i2_spoke:{ enter(){ S.notice ='The Unwritten Word grows stronger (+8 damage). The Hollow has marked you.'; }, view: () => ({
    title:'The Fourth Ward',
    text:[
      `You speak it. The stone rings like a struck bell, and the crack closes from root to crown, slow as frost creeping across a window.`,
      `And underneath everything, something stops turning in its sleep. It listens. For one long moment you feel it looking for you, the way you'd feel a draught on the back of your neck. Then it's gone. But it knows your voice now.`,
      tamsinChoice() === 'evacuate' ? `Below, the fog is already draining out of the valley like water out of a basin. Kell's Rest could go home.` : `Sister Maud sags against the stone and laughs, a dry little sound. "Twelve days, Tamsin prayed. Thirty, I did. And a girl with a book does it in a breath." She pats your hand. "Go carefully, child. It will remember you."`
    ],
    choices:[{label:'Down the mountain', go:'i2_ending'}]
  })},
  i2_silent:{ view: () => ({
    title:'The Fourth Ward',
    text:[
      `You take your hand away. The Word settles back into your throat, unspoken.`,
      tamsinChoice() === 'evacuate' ? `The crack goes on breathing grey into the valley. Kell's Rest will stay empty for a long time.` : `Sister Maud nods slowly, as if she expected nothing else, and bows her head over the stone again. "Then I'll pray," she says. "It's what I'm for."`,
      `Hask lets out a breath. "It's a hard thing, being careful," he says. "But somebody ought to be."`
    ],
    choices:[{label:'Down the mountain', go:'i2_ending'}]
  })},
  i2_ending:{ view: () => {
    const f = S.flags; const t = [
      `You come down from the shrine in the evening. ${tamsinChoice() === 'evacuate' ? (f.spokeWard ? 'The fog is gone, and for the first time the empty village looks like it is only waiting.' : 'The fog lies thick behind you.') : 'Durra has lit a lamp in the hall window for you.'}`,
      aurelWithUs() ? `Aurel is awake when you reach the temple. "The Cathedral, then," he says, before you can tell him. "In Corvane." He smiles with half his face. "I always did want to see it."` : `You think about Aurel, and the stair, and whether he got out.`,
      `There's a pass over the mountains to the east. On the other side is the Heartland, and Corvane. Hask shoulders the packs. "Three days over the top," he says. "If the snow holds."`
    ];
    return {title:'Kell’s Rest', text:t, choices:[{label:'End of chapter 2', act: () => {
      setQ('lantern', 'done', f.spokeWard ? 'You found the Fourth Ward and spoke the Word into it.' : 'You found the Fourth Ward and left it as it was.');
      if (aurelWithUs()) quest('aurelcure', 'Bring Aurel to the Cathedral', 'The Lantern Order says only the archive under the Lantern Cathedral in Corvane might cure Aurel’s grey.');
      quest('pass', 'Cross the pass', 'Take the mountain pass east, over the Hearthdeep, down to the Heartland and Corvane.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  i2_road:{
    title:'The North Road',
    blurb: () => `Six days of switchbacks into the Hearthdeep. The snow is grey at the edges.`,
    w:340, h:250,
    nodes:[
      {id:'i2_camp', label:'Road Camp', x:55, y:205, sub:'Rest'},
      {id:'i2_bridge', label:'Rope Bridge', x:150, y:150, sub:'Zealots', done: () => S.flags.bridgeDone},
      {id:'i2_den', label:'Bear’s Den', x:60, y:85, sub:'Optional', open: () => S.flags.bridgeDone, done: () => S.flags.denDone, lockText:'Across the bridge'},
      {id:'i2_hold', label:'Stonebarrow', x:285, y:190, sub:'Hask’s clan', open: () => S.flags.bridgeDone, done: () => S.flags.holdDone, lockText:'Across the bridge'},
      {id:'i2_climb', label:'The Ridge', x:250, y:55, sub:'Kell’s Rest', open: () => S.flags.bridgeDone, lockText:'Across the bridge'}
    ],
    edges:[['i2_camp','i2_bridge'],['i2_bridge','i2_den'],['i2_bridge','i2_hold'],['i2_bridge','i2_climb']]
  },
  i2_kell:{
    title:'Kell’s Rest',
    blurb: () => tamsinChoice() === 'evacuate' ? `An empty village under grey fog. The shrine on the peak is dark.` : `A grieving village. On the peak, the shrine still burns.`,
    w:340, h:250,
    nodes:[
      {id:'i2_lane', label:'Village Lane', x:55, y:205, sub:'Where you came in', done: () => true},
      {id:'i2_temple', label:'Lantern Temple', x:70, y:90, sub:'Rest'},
      {id:'i2_hall', label:'Elder’s Hall', x:175, y:175, sub:'The village elder',done: () => S.flags.hallDone},
      {id:'i2_steps', label:'Pilgrim Steps', x:205, y:95, sub:'The climb', open: () => S.flags.hallDone, done: () => S.flags.stepsDone, lockText:'Visit the hall first'},
      {id:'i2_shrine', label:'The Fourth Ward', x:290, y:40, sub:'The shrine', open: () => S.flags.stepsDone, done: () => S.flags.wardEaterDone, lockText:'Up the steps'}
    ],
    edges:[['i2_lane','i2_temple'],['i2_lane','i2_hall'],['i2_hall','i2_steps'],['i2_temple','i2_steps'],['i2_steps','i2_shrine']]
  }
});

Object.assign(ENEMIES, {
  greybear:{name:'Grey Bear', hp:56, dmg:[8,12], acc:70, dodge:2, armor:2, init:3, xp:65, hollow:true,
    spec:{every:3, name:'Mauling', windup:'{n} rears up on its hind legs, roaring without a sound.', mult:1.8}},
  scavenger:{name:'Scavenger', hp:26, dmg:[6,9], acc:70, dodge:6, armor:1, init:5, xp:30},
  // Tuned by bot sim (150 runs): about 73–85% first-try wins at levels 4–5, like Kael's and Wren's bosses
  wardeater:{name:'Ward-Eater', hp:190, dmg:[12,16], acc:72, dodge:2, armor:3, init:3, xp:220, hollow:true,
    spec:{every:2, name:'Grey Tide', windup:'{n} opens the mouth in its chest, and grey pours out like water.', mult:1.6, aoe:true, grey:2}},
  // Weaker when Tamsin held the shrine: Sister Maud's prayer drags at it
  wardeaterHeld:{name:'Ward-Eater', hp:152, dmg:[11,15], acc:70, dodge:2, armor:3, init:3, xp:220, hollow:true,
    spec:{every:3, name:'Grey Tide', windup:'{n} opens the mouth in its chest, and grey pours out like water.', mult:1.5, aoe:true, grey:2}},
  shardling:{name:'Shardling', hp:20, dmg:[7,10], acc:74, dodge:10, armor:0, init:7, xp:25, hollow:true, ranged:true, row:'back', greyChance:30}
});
Object.assign(COMBATS, {
  i2_bridge:{title:'The Rope Bridge', enemies:() => ['zealot', 'cultist', 'cultist'], lethal:true, win:'i2_bridgeWin', back:'i2_bridge',
    intro:'The zealots heft their hammers and come at you along the gorge.'},
  i2_bear:{title:'The Bear’s Den', enemies:() => ['greybear'], lethal:true, flee:true, win:'i2_bearWin', back:'i2_den',
    intro:'The grey bear heaves itself up off the cave floor.'},
  i2_looters:{title:'The Elder’s Hall', enemies:() => ['scavenger', 'scavenger', 'scavenger', 'scavenger'], lethal:true, win:'i2_looterWin', back:'i2_hall',
    intro:'The scavengers drop their sacks and pull knives.'},
  i2_steps:{title:'The Pilgrim Steps', enemies:() => tamsinChoice() === 'evacuate' ? ['hound', 'hound', 'greywolf'] : ['hound', 'greywolf'], lethal:true, win:'i2_stepsWin', back:'i2_steps',
    intro: tamsinChoice() === 'evacuate' ? 'Shapes come down the steps out of the fog.' : 'Kesh’s back way still crosses a wolf run. The grey things find you.'},
  i2_boss:{title:'The Ward-Eater', enemies:() => [tamsinChoice() === 'evacuate' ? 'wardeater' : 'wardeaterHeld', 'shardling', 'shardling', 'shardling'], lethal:true, win:'i2_bossWin', back:'i2_shrine',
    intro: tamsinChoice() === 'evacuate' ? 'The Ward-Eater turns from the stone. Shards rise from the crack and circle it.' : 'The Ward-Eater turns from the stone, and Sister Maud’s prayer drags at it like a current. Shards rise from the crack and circle it.'}
});

// Chapter 2 echoes join Ilsa's ending list, and reach back into Tamsin's
const _ilsaEchoes2 = HEROES.ilsa.echoes, _tamsinEchoes2 = HEROES.tamsin.echoes;
HEROES.ilsa.echoes = () => { const e = _ilsaEchoes2(); const f = S.flags;
  if (chapterOf(S) < 2) return e;
  if (f.spokeWard) e.push('Ilsa spoke the Unwritten Word into the Fourth Ward. The crack is closed for a season, her Word is stronger, and the Hollow knows her voice.');
  else if (f.spokeWard === false) e.push('Ilsa kept the Word to herself at the Fourth Ward. The Hollow still doesn’t know her, and the Ward is still cracked.');
  if (f.haskClan === 'mended') e.push('Hask made peace with his clan at Stonebarrow. The hold will open its doors to Ilsa again.');
  if (aurelWithUs()) e.push('Aurel is going to Corvane, to the Lantern Cathedral, where the cure might be.');
  return e; };
HEROES.tamsin.echoes = () => { const e = _tamsinEchoes2(); const i = otherF('ilsa');
  if (i.spokeWard && S.flags.choice === 'evacuate') e.push('<b>Linked:</b> Ilsa spoke the Unwritten Word into the Fourth Ward and closed the crack for a season. The grey has drained out of the valley, and Kell’s Rest could go home.');
  if (i.spokeWard && S.flags.choice === 'defend') e.push('<b>Linked:</b> Ilsa spoke the Unwritten Word into the Fourth Ward and closed the crack for a season. Sister Maud is free of her vigil.');
  if (i.spokeWard === false) e.push('<b>Linked:</b> Ilsa reached the Fourth Ward and chose not to speak the Word into it. The crack is still open.');
  if (i.wardEaterDone && S.flags.choice === 'defend') e.push('<b>Linked:</b> Elder Durra took Ilsa in and Kesh guided her to the shrine.');
  return e; };

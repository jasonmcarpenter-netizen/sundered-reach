// ================= TAMSIN'S CHAPTER: HEARTHDEEP =================
HEROES.tamsin = {name:'Tamsin', full:'Tamsin Orlo', race:'Stoneborn', role:'healer', ptsPerLevel:5, row:'front', start:'t_intro',
  skillList:['divine','maces','armor','tough','leadership','lore','survival','lockpick','stealth','wardlore'],
  cost: id => (id === 'stealth' || id === 'bows') ? 2 : 1,
  costNote:'Stoneborn pay 2 points a rank for Stealth, 1 for everything else, and earn 5 points a level. Stoneskin: natural armor that thickens at level 4.',
  signature:['Mend the Grey', 'Once per fight, cleanse the grey from every ally and heal them. Hollow creatures are burned by it, and grey-touched people are set free.'],
  actions:['mace','smite','mend','sanctuary','calm','mendgrey','pray','defend','swap','flee'],
  blurb:'A temple healer in a mountain village, where a grey sickness is spreading down from the shrine.',
  roleLine:'Healer · Stoneborn', home:'Hearthdeep'};
ALLIES.bracken = {name:'Bracken', max: () => 28 + S.level * 3, armor:1, init:7, dodge:10, row:'front', dmg: () => [5 + Math.floor(S.level / 2), 9 + Math.floor(S.level / 2)], actions:['bite','howl','defend','swap','flee']};
Object.assign(SKILLS, {
  divine:{name:'Divine Magic', desc:'Healing, Smite and protection. Sanctuary at rank 2.'},
  maces:{name:'Maces', desc:'Hit chance and damage with a mace.'}
});
function tamsinState(){
  const s = baseState('tamsin'); s.gold = 6;
  s.pc = {hp:0, sp:0, attrs:{might:3, grace:2, mind:2, spirit:5, endur:4},
    skills:{divine:2, maces:1, armor:1, tough:1, leadership:1, lore:1, survival:0, lockpick:0, stealth:0, wardlore:0}};
  s.ally = {id:'bracken', joined:true, hp:0};
  s.items = {draught:1, tonic:1, aether:0};
  s.gear = {armor:0, sword:0, focus:0, swordName:'Temple mace', shieldName:'None', focusName:'Lantern of Kell'};
  return s;
}
function divineDmg(){ const b = S.pc.attrs.spirit + sk('divine') + (S.gear.focus || 0); return [5 + b, 8 + b]; }
function divineAcc(){ return 80 + S.pc.attrs.spirit * 2 + sk('divine') * 3; }
function healAmt(){ return 6 + sk('divine') * 3 + S.pc.attrs.spirit; }

Object.assign(ACTIONS, {
  mace:{label:'Mace', sub:'Melee', target:'melee', known: u => isPc(u, 'tamsin'), can: front, why:'Front row only', run(u, t){ strike(u, t, {label:'mace'}); }},
  smite:{label:'Smite', sub:'1.5× vs Hollow', sp:5, target:'any', known: u => isPc(u, 'tamsin') && sk('divine') >= 1, can: () => true,
    run(u, t){ strike(u, t, {holy:true, mult: t.hollow ? 1.5 : 1, label:'Smite'}); }},
  mend:{label:'Mend', sub:'Heal an ally', sp:6, target:'ally', known: u => isPc(u, 'tamsin') && sk('divine') >= 1, can: () => true,
    run(u, t){ const n = healAmt(); t.hp = Math.min(t.max, t.hp + n); delete t.st.bleed; log(`Tamsin mends ${t.id === u.id ? 'her own wounds' : t.name}: +${n} health.`); }},
  sanctuary:{label:'Sanctuary', sub:'Ward everyone', sp:7, target:null, known: u => isPc(u, 'tamsin') && sk('divine') >= 2, can: () => true,
    run(u){ const n = 5 + sk('divine') * 2; heroesAlive().forEach(x => x.st.ward = Math.max(x.st.ward || 0, n)); log(`Pale light settles over the party. Each is warded against ${n} damage.`); }},
  calm:{label:'Calm', sub:'Talk one down', target:'calm', cd:2, known: u => isPc(u, 'tamsin') && sk('leadership') >= 1, can: () => enemiesAlive().some(e => e.calm), why:'No one here will listen',
    run(u, t){
      const ch = clamp(20 + sk('leadership') * 12 + S.pc.attrs.spirit * 3 + Math.round((1 - t.hp / t.max) * 40), 5, 90);
      if (rand(100) < ch){ t.hp = 0; t.calmed = true; log(`Tamsin talks to ${t.name}, quietly, the way she talks to the dying. ${t.name} lowers the weapon and walks away.`); }
      else log(`${t.name} won’t listen. Not yet.`);
    }},
  mendgrey:{label:'Mend the Grey', sub:'Once per fight', target:null, known: u => isPc(u, 'tamsin'), can: () => !C.used.mendgrey, why:'Used',
    run(u){
      C.used.mendgrey = true; const heal = 6 + sk('divine') * 2;
      log('Tamsin lays her hands flat on the air, and the grey draws back like a tide.');
      heroesAlive().forEach(x => { delete x.st.grey; x.hp = Math.min(x.max, x.hp + heal); });
      enemiesAlive().forEach(e => {
        if (e.cleanse && e.hp <= e.max * 0.6){ e.hp = 0; e.calmed = true; log(`The grey drains out of ${e.name}. They fall to their knees, weeping, themselves again.`); }
        else if (e.cleanse){ e.st.stun = 1; log(`${e.name} staggers as the grey is torn at, but it holds on. Weaken them first.`); }
        else if (e.hollow){ const d = 6 + sk('divine') * 2 + Math.floor(S.pc.attrs.spirit / 2); log(`${e.name} burns in the light for ${d}.`); applyDmg(e, d); }
      });
    }},
  pray:{label:'Pray', sub:'Regain SP', target:null, known: u => isPc(u, 'tamsin'), can: u => u.sp < u.spMax, why:'SP full',
    run(u){ const n = 6 + sk('divine') + S.pc.attrs.spirit; u.sp = Math.min(u.spMax, u.sp + n); log(`Tamsin prays under her breath: +${n} SP.`); }},
  bite:{label:'Bite', sub:'Can cause bleeding', target:'melee', known: u => isAlly(u, 'bracken'), can: front, why:'Front row only',
    run(u, t){ if (strike(u, t, {label:'bite'}) && t.hp > 0 && rand(100) < 30){ t.st.bleed = 3; log(`${t.name} is bleeding.`); } }},
  howl:{label:'Howl', sub:'Draw enemy attacks', target:null, cd:3, known: u => isAlly(u, 'bracken'), can: () => true,
    run(u){ u.st.taunt = 2; log('Bracken howls, hackles up. Every enemy turns toward him.'); }}
});

const tWhere = () => S.flags.choice === 'evacuate' ? 'evacuate' : S.flags.choice === 'defend' ? 'defend' : null;
Object.assign(SCENES, {
  t_intro:{ view: () => ({
    title:'Kell’s Rest, Hearthdeep',
    text:[
      `Kell's Rest sits high in the Hearthdeep mountains, a village of stone houses dug halfway into the hillside, with the old shrine on the peak above it like a candle on a shelf.`,
      `It's the middle of winter, and the snow is coming down grey.`,
      `Three weeks ago the grey sickness came. It starts in the fingertips, a cold that doesn't warm, and creeps inward. Twelve people have it now. Two have died. You are the village's only healer, the last Lantern Order sister this side of the pass, and your mending can slow it. It can't stop it.`,
      `Your hound Bracken is asleep across your feet. Down the lane, someone is shouting about the goat pens.`
    ],
    choices:[{label:'Continue', go:'t_build'}]
  })},
  t_build:{ view: () => ({
    title:'Tamsin Orlo',
    text:[
      `You are <em>Tamsin Orlo</em>: Stoneborn, healer of the Lantern Order, thirty-four years old and level 1. You are built like the mountain you were born on, and you have never once let a patient see you tired.`,
      `You fight with a mace and Divine Magic. <em>Mend</em> heals, <em>Smite</em> burns the grey-touched, and <em>Calm</em> can talk an ordinary person out of a fight. Your hound <em>Bracken</em> fights beside you and can Howl to draw attacks to himself.`,
      `Stoneborn earn 5 skill points a level. <em>You have ${S.skillPts} unspent skill point${S.skillPts === 1 ? '' : 's'}.</em>`
    ],
    choices:[
      {label:'Open the character sheet', act: () => openSheet()},
      {label:'Out into the village', act: () => { quest('sickness', 'The grey sickness', 'Twelve villagers are sick and two are dead. Find out where the grey is coming from.'); toMap('kellsrest'); }}
    ]
  })},
  t_temple:{ view: () => ({
    title:'The Lantern Temple',
    text:[
      `The temple is one stone room with a lantern that has burned for four hundred years, and your cot behind a curtain. Mother Hollis trained you here. She died last spring, and the lantern is yours to keep lit now.`,
      (S.pc.hp < pcMax() || S.pc.sp < spMax()) ? `You could rest an hour. Bracken would approve.` : `You're rested. The lantern burns steady.`
    ],
    choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest by the lantern. Health and spell points restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  t_pens:{ view: () => S.flags.wolvesDone ? ({
      title:'The Goat Pens', text:[`Kesh is mending the fence and pretending not to be shaken. The goats are back in their pens, complaining.`], choices:[back()]
    }) : ({
      title:'The Goat Pens',
      text:[
        `Two wolves are in among the goats, and they're wrong: grey to the muzzle, eyes filmed white, silent as snow. The grey has got into the animals now.`,
        `Bracken is already growling. Kesh the hunter is pinned against the fence with a broken bow.`
      ],
      choices:[{label:'Drive them off', act: () => startCombat('t_wolves')}, {label:'Not yet', act: () => toMap('kellsrest')}]
    })
  },
  t_wolvesWin:{ enter(){ S.flags.wolvesDone = true; }, view: () => ({
    title:'The Goat Pens',
    text:[
      `Kesh sits down in the snow and laughs, shakily. "I've hunted these mountains twenty years. Never saw a wolf that didn't make a sound."`,
      `He wipes his face. "I saw people on the shrine path this morning. Grey cloaks. Going up, not coming down. Tell the Elder."`,
      `<em>Mend the Grey</em> burns grey-touched creatures and cleanses your friends. It's at its best when the grey is thickest.`
    ],
    choices:[back()]
  })},
  t_sick:{ view: () => S.flags.tended ? ({
      title:'The Sick House',
      text:[`The patients sleep. The grey is no further up their arms than it was this morning. It isn't any lower, either.`],
      choices:[back()]
    }) : ({
      title:'The Sick House',
      text:[
        `The old granary has become the sick house: twelve cots, a stove, and the smell of willow bark. Old Bram, who taught half the village to carve; the Ashby twins; Kesh's sister Wenna. Grey to the wrist, grey to the elbow.`,
        `Your mending won't cure them. But it pushes the grey back, a little, for a day or two.`
      ],
      choices:[
        {label:'Tend them all (uses 10 spell points)', req: () => S.pc.sp >= 10, tag: S.pc.sp >= 10 ? null : 'Needs 10 SP', act: () => {
          S.pc.sp -= 10; S.flags.tended = true; const ups = gainXP(30);
          S.notice = `You spend an hour at the cots. +30 experience${ups.length ? `. Level up! Tamsin is now level ${S.level}.` : '.'}`;
          chron('You tended the grey-sick of Kell’s Rest.'); render();
        }},
        back()
      ]
    })
  },
  t_hall:{
    enter(){ if (!S.flags.council){ S.flags.council = true; setQ('sickness', 'active', 'The grey is coming from the shrine on the peak. Strangers in grey cloaks went up the path.'); quest('shrine', 'Climb to the shrine', 'Find out what the grey-cloaked strangers are doing at the Shrine of the Fourth Ward.'); } },
    view: () => ({
      title:'The Elder’s Hall',
      text:[
        `Elder Durra Flint is ninety and looks it, and her mind is as sharp as a chisel. She listens to you without interrupting.`,
        S.flags.wolvesDone ? `"Kesh told me about the cloaks on the shrine path," she says. "And now the wolves. The grey is coming from the shrine, Tamsin. It's always been coming from the shrine."` : `"Strangers on the shrine path," she says. "Grey cloaks, going up. Kesh saw them. And the grey is thickest at the top of the village. It's coming from the shrine, Tamsin."`,
        `"There's an old stone up there. Older than Kell's Rest. The Lantern Order kept it, before the Order forgot us." She looks at you. "You're the Order now. Go and see."`
      ],
      choices:[back()]
    })
  },
  t_path:{ view: () => ({
    title:'The Shrine Path',
    text:[`The path to the shrine switchbacks up the mountain, through pines bent under grey snow. Bracken goes first, nose down, the way he always does.`, `There'll be no resting once you're up there, except at the hermit's cave, if she still lets people in.`],
    choices:[{label:'Climb', act: () => { quest('shrine', 'Climb to the shrine', 'Find out what the grey-cloaked strangers are doing at the Shrine of the Fourth Ward.'); toMap('shrine'); }}, {label:'Not yet', act: () => toMap('kellsrest')}]
  })},

  // --- Shrine hub ---
  t_foot:{ view: () => ({title:'The Foot of the Path', text:[`The village lights are small below you. Up is the only way.`], choices:[{label:'Back down to the village', act: () => toMap('kellsrest')}, back()]}) },
  t_steps:{ view: () => S.flags.stepsDone ? ({
      title:'The Pilgrim Steps', text:[`Trampled snow and a dropped grey cloak.`], choices:[back()]
    }) : ({
      title:'The Pilgrim Steps',
      text:[
        `Seven hundred steps cut into the mountain. Halfway up, figures in ash-grey cloaks are waiting, with a grey hound on a chain. One of them is barely more than a boy, holding his spear like he's afraid of it.`,
        `"Turn back, sister," the oldest one calls. "The Voice is waking the god. Nobody passes."`
      ],
      choices:[
        S.flags.talkedScout ? null : Object.assign({label:'Talk to the boy. Ask him if his mother knows where he is.', act: () => { S.flags.talkedScout = true; S.notice = 'The boy drops his spear and runs down the mountain. One fewer to fight.'; chron('You talked a young cultist into going home.'); render(); }}, chk('leadership', 1)),
        {label:'Push through', act: () => startCombat('t_steps')},
        back('Back off for now')
      ].filter(Boolean)
    })
  },
  t_stepsWin:{ enter(){ S.flags.stepsDone = true; S.items.draught += 1; S.notice = 'You found a Healing Draught in a cultist’s pack.'; }, view: () => ({
    title:'The Pilgrim Steps',
    text:[`Their packs are full of chisels and grey-stained sacking. Whatever they're doing up there, it involves cutting stone.`],
    choices:[back()]
  })},
  t_hermit:{
    enter(){ if (!S.flags.metMaud){ S.flags.metMaud = true; S.items.tonic += 2; quest('cure', 'Find the true cure', 'Sister Maud says the Lantern Order once had a true cure for the grey. It was lost in the Sundering. Some of it may survive in the Order’s archives in Corvane.'); chron('You met Sister Maud, the hermit, and learned of the lost cure.'); } },
    view: () => {
      const i = otherF('ilsa');
      const t = [
        `In a cave below the shrine lives Sister Maud, the last Lantern sister older than you. She is tiny, fierce and nearly blind, and she knew your name before you said it.`,
        `"The Order had a cure for the grey once," she says, pressing two bitter tonics into your hands. "A true one. We lost it in the Sundering, along with half of everything else. Some of it may still be in the archive under the Lantern Cathedral in Corvane, if the Crown hasn't burned it for kindling."`,
        `"Sealing the stones is a bandage, child. You know about bandages. They hold until they don't."`
      ];
      if (i.fullReading || i.aurelTold) t.push(echo('ilsa', 'On the Spire Coast, Ilsa learned that the Lantern Order holds the other half of the Concord: the cure, and maybe the way to end the Hollow for good.'));
      if (S.pc.sp < spMax() || S.pc.hp < pcMax()) t.push(`Maud lets you sit by her fire. "Rest. You look like your teacher did, right before she worked herself to death."`);
      return {title:'The Hermit’s Cave', text:t, choices:[
        (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest by her fire (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest by Maud’s fire. Health and spell points restored.'; render(); }} : null,
        back()
      ].filter(Boolean)};
    }
  },
  t_camp:{ view: () => S.flags.campDone ? ({
      title:'The Ashen Camp', text:[`A cold firepit and torn tents. Nobody is coming back for them.`], choices:[back()]
    }) : ({
      title:'The Ashen Camp',
      text:[
        `Below the shrine is a cult camp, abandoned in a hurry. In one tent, a man lies on a bedroll, grey to the collarbone, shaking. His cloak is trimmed with silver: a deacon of the Ashen Hand. His own people left him here to die.`,
        `He looks at you, at the Lantern on your belt, and laughs weakly. "Of course. Of course it's you they send."`
      ],
      choices:[{label:'Heal him.', go:'t_orrin'}, back('Leave him')]
    })
  },
  t_orrin:{ view: () => ({
    title:'The Ashen Camp',
    text:[
      `You can't cure him, but you can push the grey back. You work until your hands ache. When you're done he can sit up, and he can talk.`,
      `His name is Deacon Orrin. The leader of the Ashen Hand here is Velka, whom they call the Voice. She's at the shrine with her zealots, chiseling at the stone, to "let the god breathe." The god breathed on Orrin first. That's when they left him.`,
      `Kesh and two men from the village come up the trail behind you, with rope. Kesh's sister is in the sick house. He looks at Orrin, then at you. "Elder Durra says it's your call, Tamsin. But if he comes down to the village, they'll hang him."`
    ],
    choices:[
      {label:'Let him go, if he swears to leave the Ashen Hand.', act: () => { S.flags.campDone = true; S.flags.orrin = 'freed'; chron('You healed Deacon Orrin and let him go.'); go('t_orrinFree'); }},
      {label:'Send him down to the village for judgment.', act: () => { S.flags.campDone = true; S.flags.orrin = 'judged'; chron('You sent Deacon Orrin down to the village. They hanged him.'); go('t_orrinJudged'); }}
    ]
  })},
  t_orrinFree:{ view: () => ({
    title:'The Ashen Camp',
    text:[
      `Orrin swears. You don't know if he means it. You don't think he knows either.`,
      `Kesh spits in the snow and says nothing. Before he goes, Orrin grips your hand. "The Voice keeps a second key to the inner shrine on her belt. And she's afraid of you, sister. Of what you do. Remember that."`
    ],
    choices:[back()]
  })},
  t_orrinJudged:{ view: () => ({
    title:'The Ashen Camp',
    text:[
      `They tie his hands and lead him down the mountain. He doesn't fight. At the bend in the path he looks back at you once, without anger.`,
      `Later, from the shrine, you'll see a fire in the village square and know what it means. Kesh did what you asked. That's the trouble with being the one who decides.`
    ],
    choices:[back()]
  })},
  t_gate:{ view: () => S.flags.gateDone ? ({
      title:'The Shrine Gate', text:[`The gate stands open. The people you freed have gone down the mountain.`], choices:[back()]
    }) : ({
      title:'The Shrine Gate',
      text:[
        `The shrine gate is guarded, but not by cultists. Pilgrims stand in the snow, grey to the eyes, swaying: villagers from the next valley, by their clothes, who came to pray and stayed too long. An ash hound circles them like a shepherd's dog.`,
        `They turn toward you, slow and silent. They're not wicked. They're sick.`,
        `<em>Mend the Grey can free grey-touched people, once the grey in them has been weakened.</em>`
      ],
      choices:[{label:'Face them', act: () => startCombat('t_gate')}, back('Back off for now')]
    })
  },
  t_gateWin:{ enter(){ S.flags.gateDone = true; }, view: () => ({
    title:'The Shrine Gate',
    text:[
      C_saved() ? `The pilgrims you freed sit in the snow, shivering and blinking like people waking from a long sleep. You send them down the mountain to Elder Durra.` : `It's over. You kneel by the pilgrims for a long time afterward, and Bracken presses against your side.`,
      `Beyond the gate, the shrine. You can hear chisels.`
    ],
    choices:[back()]
  })},
  t_shrine:{ view: () => ({
    title:'The Inner Shrine',
    text:[
      `The inner shrine is a ring of standing stones around a pillar of black stone veined with silver: the Fourth Ward. A crack runs down it from crown to root, and grey pours out of it like smoke from a chimney.`,
      `Zealots in grey are hacking at its base with chisels and hammers. Above them on the altar stands a woman with grey eyes and a voice like a bell: Velka, the Ashen Voice.`,
      `"Sister," she says, almost kindly. "You've spent your whole life keeping people from dying. Wouldn't you like to rest?"`,
      `<em>This will be a hard fight. Velka stays behind her zealots. Calm won't work on her, but it might on them.</em>`
    ],
    choices:[{label:'Fight Velka', act: () => startCombat('t_boss')}, {label:'Back away and prepare', act: () => toMap('shrine')}]
  })},
  t_bossWin:{
    enter(){ if (S.flags.bossDone) return; S.flags.bossDone = true; S.pc.skills.wardlore = Math.max(1, S.pc.skills.wardlore || 0); S.notice = 'You learned Wardlore 1.'; },
    view: () => {
      const k = otherF('kael');
      const t = [
        `Velka falls against the Wardstone, and the grey takes her the way it took Orrin, all at once. Her zealots scatter down the mountain.`,
        `You put your hands on the stone to steady yourself, and the world opens. You see the Reach from very high up: a swordsman on bloody sand, a girl with ink-stained hands and a book that burns without burning, an archer in a dark forest guarding a crate that glows.`,
        `And under them all, something enormous and patient, turning over in its sleep.`
      ];
      if (k.bossDone) t.push(echo('kael', 'Far to the south, under Varrow, Kael touched the Third Ward and saw you here, a stone-skinned healer kneeling in grey snow.'));
      t.push(`You come back to yourself on your knees. The crack in the stone is spreading. Grey pours down the mountain toward Kell's Rest like water down a gutter.`);
      return {title:'The Fourth Ward', text:t, choices:[{label:'Decide what to do', go:'t_choice'}]};
    }
  },
  t_choice:{ view: () => ({
    title:'The Fourth Ward',
    text:[
      `You know two things, the way you know a fever is about to break or about to kill.`,
      `If you stay, and pour everything you have into the stone, you can hold the crack. Days, maybe weeks of prayer. The shrine will hold, and the grey will stay on the mountain. But the sick house has no one else to tend it, and not all of them will live that long.`,
      `If you go down now, you can get Kell's Rest out over the pass before the grey reaches the village. Everyone who can walk will live. But the Fourth Ward will fall, and the grey will have the valley.`
    ],
    choices:[
      {label:'Go down. Get everyone out.', act: () => { S.flags.choice = 'evacuate'; chron('You evacuated Kell’s Rest. The village lived, and the Fourth Ward fell.'); go('t_ending'); }},
      {label:'Stay. Hold the stone.', act: () => { S.flags.choice = 'defend'; chron('You stayed to hold the Fourth Ward. The shrine held, and some of the sick died without you.'); go('t_ending'); }}
    ]
  })},
  t_ending:{ view: () => {
    const f = S.flags; const t = f.choice === 'evacuate' ? [
      `You run the whole way down. Elder Durra doesn't argue. By nightfall, the whole of Kell's Rest is on the pass road with its goats and its grandmothers and its sick, wrapped in blankets on sledges, Bracken herding the stragglers.`,
      `From the top of the pass you look back. The shrine on the peak is dark, and grey fog is pouring down into the valley where you were born. Nobody speaks.`,
      `"Where will we go?" Durra asks. You're the Order now. You have to have an answer. "Corvane," you say. "The Lantern Cathedral. If the cure exists, it's there."`
    ] : [
      `You stay. You kneel at the stone and pray until your voice is gone, then keep praying without it. Kesh brings you food. The grey stays on the mountain.`,
      `On the ninth day, Kesh brings you news instead. Old Bram is dead, and one of the Ashby twins. Wenna is alive. He sits with you in the snow for a long time, and doesn't blame you, which is worse.`,
      `On the twelfth day the crack stops spreading. It isn't healed. It's holding. Sister Maud climbs up to take your place. "Go," she says. "Corvane. Find the cure, child, or none of this was worth anything."`
    ];
    if (f.orrin === 'freed') t.push(`On the road, you keep thinking about Orrin. Somewhere out there he's either keeping his oath or he isn't.`);
    return {title: f.choice === 'evacuate' ? 'The Pass Road' : 'The Shrine, Twelve Days Later', text:t, choices:[{label:'End of Tamsin’s chapter', act: () => {
      setQ('shrine', 'done', 'You stopped the Ashen Voice at the Fourth Ward.');
      setQ('sickness', f.choice === 'evacuate' ? 'failed' : 'active', f.choice === 'evacuate' ? 'The village escaped, but the grey has the valley now.' : 'The shrine holds, for now. The sick are still sick.');
      quest('corvane', 'Go north to Corvane', 'Find the Lantern Cathedral and its archives. Look for the lost cure.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});
function C_saved(){ return !!S.flags.savedPilgrims; }

Object.assign(MAPS, {
  kellsrest:{
    title:'Kell’s Rest',
    blurb: () => `Grey snow on stone roofs. The shrine on the peak is hidden in cloud.`,
    w:340, h:240,
    nodes:[
      {id:'t_temple', label:'Lantern Temple', x:60, y:60, sub:'Home · rest'},
      {id:'t_pens', label:'Goat Pens', x:170, y:40, sub:'Trouble', done: () => S.flags.wolvesDone},
      {id:'t_sick', label:'Sick House', x:282, y:60, sub:'Your patients', done: () => S.flags.tended},
      {id:'t_hall', label:'Elder’s Hall', x:95, y:170, sub:'Elder Durra', done: () => S.flags.council},
      {id:'t_path', label:'Shrine Path', x:250, y:175, sub:'Up the mountain', open: () => S.flags.council, lockText:'Speak to the Elder first'}
    ],
    edges:[['t_temple','t_pens'],['t_pens','t_sick'],['t_temple','t_hall'],['t_hall','t_path'],['t_sick','t_path'],['t_pens','t_hall']]
  },
  shrine:{
    title:'The Shrine Road',
    blurb: () => `Seven hundred steps up the mountain, in grey snow. The chisels never stop.`,
    w:340, h:270,
    nodes:[
      {id:'t_foot', label:'Foot of the Path', x:55, y:225, sub:'Back to the village', done: () => true},
      {id:'t_steps', label:'Pilgrim Steps', x:110, y:150, sub:'Cultists', done: () => S.flags.stepsDone},
      {id:'t_hermit', label:'Hermit’s Cave', x:50, y:65, sub:'Rest · optional', open: () => S.flags.stepsDone, done: () => S.flags.metMaud, lockText:'Past the steps'},
      {id:'t_camp', label:'Ashen Camp', x:285, y:150, sub:'Optional', open: () => S.flags.stepsDone, done: () => S.flags.campDone, lockText:'Past the steps'},
      {id:'t_gate', label:'Shrine Gate', x:180, y:85, sub:'Pilgrims', open: () => S.flags.stepsDone, done: () => S.flags.gateDone, lockText:'Past the steps'},
      {id:'t_shrine', label:'Inner Shrine', x:280, y:40, sub:'The Ashen Voice', open: () => S.flags.gateDone, done: () => S.flags.bossDone, lockText:'Through the gate'}
    ],
    edges:[['t_foot','t_steps'],['t_steps','t_hermit'],['t_steps','t_camp'],['t_steps','t_gate'],['t_gate','t_shrine']]
  }
});

Object.assign(ENEMIES, {
  greywolf:{name:'Grey Wolf', hp:22, dmg:[5,8], acc:74, dodge:10, armor:0, init:7, xp:25, hollow:true, bleed:20},
  cultist:{name:'Ashen Cultist', hp:26, dmg:[7,10], acc:70, dodge:5, armor:1, init:5, xp:30, calm:true},
  hound:{name:'Ash Hound', hp:24, dmg:[6,9], acc:74, dodge:10, armor:0, init:7, xp:25, hollow:true, greyChance:30},
  pilgrim:{name:'Grey Pilgrim', hp:30, dmg:[5,8], acc:68, dodge:2, armor:0, init:3, xp:30, hollow:true, cleanse:true, greyChance:25},
  zealot:{name:'Ashen Zealot', hp:32, dmg:[10,13], acc:72, dodge:4, armor:2, init:5, xp:40, calm:true,
    spec:{every:4, name:'Fervor Strike', windup:'{n} raises a chisel-hammer over his head, chanting.', mult:1.7}},
  velka:{name:'Velka, the Ashen Voice', hp:80, dmg:[8,11], acc:74, dodge:8, armor:1, init:6, xp:170, ranged:true, row:'back', hollow:true, greyChance:30,
    spec:{every:3, name:'Ashfall', windup:'{n} raises her arms, and the grey snow begins to swirl.', mult:1.6, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  t_wolves:{title:'The Goat Pens', enemies:() => ['greywolf', 'greywolf', 'greywolf'], lethal:true, win:'t_wolvesWin', back:'t_pens',
    intro:'The grey wolves turn from the goats to you, silent.'},
  t_steps:{title:'The Pilgrim Steps', enemies:() => S.flags.talkedScout ? ['cultist', 'cultist', 'hound'] : ['cultist', 'cultist', 'cultist', 'hound'], lethal:true, win:'t_stepsWin', back:'t_steps',
    intro:'The cultists lower their spears and come down the steps. The hound slips its chain.'},
  t_gate:{title:'The Shrine Gate', enemies:() => ['pilgrim', 'pilgrim', 'pilgrim', 'hound'], lethal:true, win:'t_gateWin', back:'t_gate',
    done: () => { S.flags.savedPilgrims = C.units.some(u => u.key === 'pilgrim' && u.calmed); },
    intro:'The pilgrims shuffle toward you through the snow. The hound circles behind them.'},
  t_boss:{title:'Velka, the Ashen Voice', enemies:() => ['zealot', 'zealot', 'hound', 'velka'], lethal:true, win:'t_bossWin', back:'t_shrine',
    intro:'The zealots drop their chisels and pick up hammers. Velka begins to sing.'}
});

HEROES.tamsin.echoes = () => {
  const f = S.flags; const e = [];
  if (f.choice === 'evacuate') e.push('Kell’s Rest is empty but alive. The Fourth Ward fell, and the grey has the valley. When Ilsa comes north, she will find an empty village and a cracked, dark shrine.');
  else e.push('The Fourth Ward holds for now, but some of the sick died while Tamsin prayed. When Ilsa comes north, she will find a grieving village, an intact shrine, and an ally in Elder Durra.');
  if (f.orrin === 'freed') e.push('Deacon Orrin owes Tamsin his life. If he keeps his oath, he may one day lead the party to the Ashen Hand.');
  else if (f.orrin === 'judged') e.push('Deacon Orrin was hanged in Kell’s Rest. The Ashen Hand lost a leader, and the ones who are left are angrier.');
  else e.push('Tamsin never found the cult camp. Deacon Orrin died alone on the mountain.');
  if (f.metMaud) e.push('Tamsin knows the Lantern Order once had a true cure, and that pieces of it may be in the archive under the Lantern Cathedral in Corvane.');
  if (f.savedPilgrims) e.push('Tamsin freed grey-touched pilgrims without killing them. Word of a healer who can do that will travel.');
  const k = otherF('kael'), i = otherF('ilsa');
  if (i.aurel === 'carried') e.push('<b>Linked:</b> Ilsa is bringing Magister Aurel north, grey to the shoulders. Tamsin may be the only one who can help him.');
  if (i.fullReading || i.aurelTold) e.push('<b>Linked:</b> Ilsa knows the bargain can be ended. Tamsin’s lost cure may be the other half of how.');
  if (k.bossDone) e.push('<b>Linked:</b> Kael saw Tamsin in his vision at the Third Ward, and she saw him in hers.');
  return e;
};
// Tamsin's choices echo back into Kael's and Ilsa's endings
const _kaelEchoes = HEROES.kael.echoes, _ilsaEchoes = HEROES.ilsa.echoes;
HEROES.kael.echoes = () => { const e = _kaelEchoes(); const t = otherF('tamsin');
  if (t.bossDone) e.push('<b>Linked:</b> Tamsin saw a swordsman on bloody sand in her vision at the Fourth Ward. She saw Kael.');
  return e; };
HEROES.ilsa.echoes = () => { const e = _ilsaEchoes(); const t = otherF('tamsin');
  if (t.choice === 'evacuate') e.push('<b>Linked:</b> Tamsin evacuated Kell’s Rest. When Ilsa goes north, she will find an empty village and a dark shrine.');
  if (t.choice === 'defend') e.push('<b>Linked:</b> Tamsin held the Fourth Ward. When Ilsa goes north, she will find a grieving village, an intact shrine, and an ally.');
  if (t.metMaud && S.flags.aurel === 'carried') e.push('<b>Linked:</b> Tamsin learned the Lantern Order once had a true cure. It might save Aurel.');
  return e; };



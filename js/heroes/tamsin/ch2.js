// ================= TAMSIN, CHAPTER 2: THE PASS ROAD =================
// Tamsin leaves Hearthdeep for the Heartland: leading the villagers (evacuated) or alone after twelve days
// (defended). A Crown quarantine, the Lantern Order's split at Saint Calder's Rest, and an Ashen Hand attack.
// Scene IDs use the prefix t2_. Placeholder names: Saint Calder's Rest, Abbess Merrow, Brother Aldo, Cantor Vey.
HEROES.tamsin.chapters[2] = {title:'The Pass Road', start:'t2_intro'};

const tEvac = () => S.flags.choice === 'evacuate';
// Ilsa's chapter 2 (if played) sends a runner with news from the Fourth Ward
const ilsaWardNews = () => { const i = otherF('ilsa'); return i.wardEaterDone ? (i.spokeWard ? 'spoke' : 'silent') : null; };

Object.assign(SCENES, {
  t2_intro:{
    enter(){ quest('pass2', 'Over the pass', tEvac() ? 'Get the people of Kell’s Rest over the pass and down to the Lantern waystation at Saint Calder’s Rest.' : 'Cross the pass alone and find the Lantern waystation at Saint Calder’s Rest. Then Corvane.'); },
    view: () => ({
      title:'The Pass Road',
      text: tEvac() ? [
        `Sixty-three people, eleven sledges, forty goats and one hound. That's Kell's Rest now: a line of lanterns crawling up the pass road through grey snow, with the sick wrapped in blankets on the sledges and Elder Durra riding on the first one like a queen on a very small throne.`,
        `Behind you, the valley is full of fog. Nobody looks back anymore. They look at you. You're the Order now, and the Order is supposed to know where it's going.`,
        `The Lantern Order keeps a waystation on the far side of the pass, Saint Calder's Rest. Beds, a hospice, sisters who'll know what to do. You hope.`
      ] : [
        `You come down from the shrine on the thirteenth day with your voice gone and your hands shaking. Sister Maud has the vigil now. Kesh walks you to the edge of the village and gives you a pack of food you didn't ask for.`,
        `Nine graves outside the wall. You knew every one of them. You don't stop.`,
        `Bracken pads beside you up the pass road, pressing against your leg every few steps as if to make sure you're still there. On the far side of the pass is a Lantern waystation, Saint Calder's Rest, and beyond that the Heartland and Corvane, and somewhere in Corvane the cure, if it exists.`
      ],
      choices:[{label:'Up the pass road', act: () => toMap('t2_pass')}]
    })
  },

  // --- The Pass Road hub ---
  t2_camp:{ view: () => ({
    title: tEvac() ? 'The Caravan Camp' : 'A Fire in the Rocks',
    text:[tEvac() ? `The sledges are drawn up in a ring against the wind, and somebody has got a pot going. Durra is telling the children a story about a goat who climbed to the moon. Nobody believes it, and everyone is listening.` : `A fire in a cleft of rock, just big enough for you and Bracken. He puts his head on your knee and goes to sleep at once.`],
    choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest. Health and spell points restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  t2_snow:{ view: () => S.flags.snowDone ? ({
      title:'The Snowfield', text:[`Trampled snow, and the long shadow of the pass ahead.`], choices:[back()]
    }) : ({
      title:'The Snowfield',
      text:[
        `The road crosses a wide snowfield under the peaks, and the grey wolves are waiting in the middle of it, silent, spread out the way hunting wolves never do.`,
        tEvac() ? `They've smelled the sick on the sledges. They're coming for the slowest.` : `They've been following you since the treeline. Bracken's hackles have been up for an hour.`
      ],
      choices:[{label:'Stand and fight', act: () => startCombat('t2_snow')}, back('Back off for now')]
    })
  },
  t2_snowWin:{ enter(){ S.flags.snowDone = true; }, view: () => ({
    title:'The Snowfield',
    text:[tEvac() ? `Nobody on the sledges was hurt. Kesh's sister Wenna, grey to the elbow, sits up on her sledge and says, "I saw you. I saw the whole thing." She sounds proud of you. You don't know what to do with that.` : `Bracken licks a cut on his shoulder and looks at you as if to say he'd have managed without you. You doubt it. You don't tell him.`],
    choices:[back()]
  })},
  t2_chapel:{ view: () => S.flags.chapelDone ? ({
      title:'The Ice Chapel', text:[`The hermit sleeps by the fire you built. The grey has stopped at her wrists.`], choices:[back()]
    }) : ({
      title:'The Ice Chapel',
      text:[
        `Off the road, a pilgrims' chapel is half buried in a drift. Inside, an old woman sits wrapped in furs in front of a dead fire, grey to the shoulders, perfectly calm.`,
        `"Lantern," she says, seeing yours. "I was one of you once. Forty years ago. Sit down, sister. Before I go, there's a thing I should tell someone."`
      ],
      choices:[
        {label:'Tend her first (uses 10 spell points)', req: () => S.pc.sp >= 10, tag: S.pc.sp >= 10 ? null : 'Needs 10 SP', act: () => {
          S.pc.sp -= 10; S.flags.chapelDone = true; S.flags.cureClue = true; const ups = gainXP(40);
          S.notice = `+40 experience${ups.length ? `. Level up! Tamsin is now level ${S.level}.` : '.'}`;
          quest('cure', 'Find the true cure', 'Sister Maud said the Order once had a true cure for the grey. A hermit on the pass says it was never a medicine: it was a rite, written in the Cathedral archive under the name “the Second Lantern.”');
          chron('On the pass you tended a hermit who remembered the name of the lost cure: the Second Lantern.');
          go('t2_hermit');
        }},
        back('Leave her in peace')
      ]
    })
  },
  t2_hermit:{ view: () => ({
    title:'The Ice Chapel',
    text:[
      `You build up the fire and work until the grey stops creeping. It won't go back. But it stops.`,
      `"The cure," the old woman says when you're done. "Everyone thinks it was a medicine, and that's why they never found it. It wasn't. It was a rite. Two lanterns lit from one flame. They wrote it down in the Cathedral archive under the name of the <em>Second Lantern</em>, and then they lost the book on purpose, because the Crown wanted it."`,
      `She closes her eyes. "Find the Second Lantern, sister. And don't let them make you choose between the truth and the people. That's how they got us last time."`
    ],
    choices:[back()]
  })},
  t2_post:{ view: () => {
    if (S.flags.postDone) return {title:'The Quarantine Post', text:[`The barrier pole is up. The road down to the Heartland is open.`], choices:[back()]};
    const text = [
      `Where the pass road starts down into the Heartland, the Crown has built a barrier: a pole across the road, a hut, a fire, and a dozen soldiers in Crown blue with scarves over their faces. A painted board says <em>CLOSED BY ORDER OF THE CROWN. FEVER.</em>`,
      tEvac() ? `The captain looks at the sledges, and at the grey on the sick, and shakes his head. "Healthy ones can pass after three days' watch. Those don't pass at all. Orders."` : `The captain looks at you, a Lantern sister coming down off the mountain alone, grey snow in your hair. "Where from?" he says. "And what did you see up there?"`,
      `Officially, there is no crisis. That's why there's a quarantine.`
    ];
    return {title:'The Quarantine Post', text, choices:[
      Object.assign({label: tEvac() ? '"They’re my patients. They’re not contagious, and you know it, or you’d have burned the road. Let them through."' : '"I saw a crack in a Wardstone, captain. You can write that down, or you can let me pass and pretend I didn’t say it."', act: () => { S.flags.postHow = 'argue'; go('t2_postPast'); }}, chk('leadership', 2)),
      Object.assign({label:'Wait for the snow and the dark, then lead everyone round by the goat track.', act: () => { S.flags.postHow = 'sneak'; go('t2_postPast'); }}, chk('survival', 1)),
      {label:'Break through the barrier.', act: () => startCombat('t2_post')},
      back('Back off for now')
    ]};
  }},
  t2_postPast:{
    enter(){ if (S.flags.postDone) return; S.flags.postDone = true; const ups = gainXP(100); S.notice = `+100 experience${ups.length ? `. Level up! Tamsin is now level ${S.level}.` : '.'}`; chron(S.flags.postHow === 'argue' ? 'You talked your way past a Crown quarantine.' : 'You slipped past a Crown quarantine in the dark.'); },
    view: () => ({
      title:'The Quarantine Post',
      text:[
        S.flags.postHow === 'argue'
          ? `The captain looks at you for a long moment. Then he lifts the pole himself. "I didn't see you," he says. "Nobody saw you." ${tEvac() ? 'The sledges creak past him, one by one, and he doesn’t look at any of them.' : 'He doesn’t meet your eyes.'}`
          : `It takes all night. ${tEvac() ? 'Sixty-three people and forty goats on a goat track in the dark, and nobody falls, and the goats only complain twice.' : 'You and Bracken pick your way round the post through the drifts, and the sentries never look up.'} By dawn the barrier is behind you.`,
        `Below, the road winds down out of the snow toward a stone house with a lantern over its gate: Saint Calder's Rest.`
      ],
      choices:[back()]
    })
  },
  t2_postWin:{ enter(){ S.flags.postDone = true; S.flags.postHow = 'fight'; S.items.draught += 1; S.notice = 'You found a Healing Draught in the guard hut.'; chron('You fought your way through a Crown quarantine. The Crown will remember a Lantern sister who did that.'); }, view: () => ({
    title:'The Quarantine Post',
    text:[`The soldiers who can still run are running down the road ahead of you. ${tEvac() ? 'Durra looks at the fallen men and then at you, and says nothing at all, which from Durra is a great deal.' : 'You kneel and bind the captain’s arm before you go. He watches you do it as if you were mad.'}`, `Below, the road winds down toward Saint Calder's Rest.`],
    choices:[back()]
  })},
  t2_descend:{ view: () => ({
    title:'Down from the Pass',
    text:[`The road drops out of the snow into pine forest, then into the first green you've seen in a month. At the bottom, a stone house with a lantern over the gate.`, `Once you're down, there's no going back up.`],
    choices:[{label:'Down to Saint Calder’s Rest', act: () => toMap('t2_way')}, {label:'Not yet', act: () => toMap('t2_pass')}]
  })},

  // --- Saint Calder's Rest hub ---
  t2_gate:{ view: () => ({title:'The Gate', text:[`The lantern over the gate of Saint Calder's Rest has burned for three hundred years. Someone has hung a black ribbon on it.`], choices:[back()]}) },
  t2_hospice:{
    enter(){
      if (S.flags.runnerDone || !ilsaWardNews()) return;
      S.flags.runnerDone = true;
      if (ilsaWardNews() === 'spoke' && tEvac()) chron('News reached you that the fog had lifted from your valley. Elder Durra took half the village home.');
    },
    view: () => {
      const news = ilsaWardNews();
      const t = [
        `The hospice is a long room of clean beds. ${tEvac() ? 'The sisters take your sick from the sledges without being asked, and for the first time in a month you sit down and let somebody else do it.' : 'Most of the beds are empty. The sister on duty looks at your hands and makes you sit down.'}`
      ];
      if (news === 'spoke') t.push(tEvac()
        ? `On the second day, a runner comes over the pass with a letter from Kesh. <em>"The fog has gone out of the valley. All at once, like a tide. A Sylvari girl went up to the shrine with a book, and came down, and the grey was gone. Come home."</em> Durra reads it twice. By evening, half the village is packing to go back. The other half looks at you.`
        : `On the second day, a runner comes over the pass with a letter from Kesh. <em>"A Sylvari girl went up to the shrine with a book and spoke to the stone, and the crack closed. Sister Maud has stopped praying. She says to tell you she's bored."</em>`, echo('ilsa', 'Ilsa spoke the Unwritten Word into the Fourth Ward and closed the crack for a season.'));
      else if (news === 'silent') t.push(`On the second day, a runner comes over the pass with a letter from Kesh. <em>"A Sylvari girl came to the shrine with a book that burns. She fought the thing that came out of the crack, and then she went away again. The crack's still there."</em>`, echo('ilsa', 'Ilsa reached the Fourth Ward and chose not to speak the Word into it.'));
      return {title:'The Hospice', text:t, choices:[
        (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health and spell points)', act: () => { restAll(); S.notice = 'You sleep in a real bed. Health and spell points restored.'; render(); }} : null,
        back()
      ].filter(Boolean)};
    }
  },
  t2_abbess:{ enter(){ S.flags.metAbbess = true; }, view: () => ({
    title:'The Abbess’s Study',
    text:[
      `Abbess Merrow is tall and grey and tired, and her study is full of letters with the Crown's seal on them. She listens to all of it: the shrine, the crack, the grey, Velka.`,
      `"I believe you," she says. "That's the trouble. The Crown has told every Lantern house in the Heartland that there is a fever, and that it is ordinary, and that we will say so. If we say otherwise, they close our hospices. Then who tends the sick?"`,
      `"I'm not a coward, Sister Orlo. I'm a woman with forty beds and a letter that says I can keep them if I keep quiet."`
    ],
    choices:[back()]
  })},
  t2_tower:{ enter(){ S.flags.metAldo = true; }, view: () => ({
    title:'The Bell Tower',
    text:[
      `Brother Aldo is twenty, maybe, and has ink on his fingers and a list of every Lantern house in the Heartland pinned to the bell-tower wall. He's been waiting for someone like you.`,
      `"The old law of the Order: when the Wardstones fail, the Lanterns ring. Every house rings, and every village hears it, and people <em>know</em>." He puts a hand on the bell rope. "The Abbess won't ring. But if a sister who's <em>seen</em> it says ring, half the brothers here will follow her."`,
      `"People are walking into the grey right now because nobody told them. How many more?"`
    ],
    choices:[back()]
  })},
  t2_night:{ view: () => {
    const o = S.flags.orrin;
    const t = [`On the second night, the dogs in the yard start barking, and then stop all at once.`];
    if (o === 'freed') t.push(`An hour before that, a thin man in a travel-stained cloak had come to the gate and asked for you by name: Deacon Orrin, whom you healed and let go. "They're coming tonight," he said. "Cantor Vey and the Choir. For the grey-touched. They think the sick belong to the god." He'd counted them for you. You've had time to bar the doors and move the sick. There are fewer of them than there might have been.`);
    else if (o === 'judged') t.push(`Nobody warns you. They come over the wall in the dark, more of them than you'd have thought, singing. One has a strip of white cloth tied round his arm: mourning, for a deacon hanged in Kell's Rest.`);
    else t.push(`They come over the wall in the dark, singing.`);
    t.push(`Ash-grey robes in the courtyard. Some of them are grey to the eyes, swaying, the way the pilgrims at the shrine were: converts, not zealots. Behind them, on the wall, a man with a voice like a church organ is leading the hymn. Cantor Vey.`, `<em>This will be a hard fight. Mend the Grey can free the converts once they're weakened.</em>`);
    return {title:'The Courtyard', text:t, choices:[{label:'Into the courtyard', act: () => startCombat('t2_boss')}, {label:'Hold back and prepare', act: () => toMap('t2_way')}]};
  }},
  t2_bossWin:{
    enter(){ if (S.flags.choirDone) return; S.flags.choirDone = true; S.flags.freedConverts = (C ? C.units : []).filter(u => u.key === 'convert' && u.calmed).length; },
    view: () => ({
      title:'The Courtyard',
      text:[
        `Cantor Vey goes down in the middle of a note, and the hymn stops. In the silence, you can hear the sick in the hospice, awake and afraid, and nobody singing at all.`,
        S.flags.freedConverts ? `${S.flags.freedConverts === 1 ? 'One of the converts' : 'The converts you freed'} kneel${S.flags.freedConverts === 1 ? 's' : ''} in the courtyard, blinking, ordinary again. The sisters take them inside with the others.` : `Nobody in grey robes is left standing. You kneel by each of them anyway.`,
        `In the morning, the Abbess and Brother Aldo come to you together, and stand on either side of you, and don't look at each other.`
      ],
      choices:[{label:'Hear them out', go:'t2_choice'}]
    })
  },
  t2_choice:{ view: () => ({
    title:'Saint Calder’s Rest',
    text:[
      `"The Ashen Hand came for our sick," Aldo says. "Because they're grey. Because nobody out there knows what grey means. Ring the bells, Sister Orlo, and the next village will know."`,
      `"Ring the bells," the Abbess says, "and the Crown closes this house and every house like it by midsummer, and the sick die in the road instead of in a bed. Keep faith with me, and I'll give you a letter that opens the archive under the Lantern Cathedral. Everything the Order ever wrote about the grey. Your cure, if it's anywhere."`,
      `They're both right. That's what makes it hard.`
    ],
    choices:[
      {label:'Ring the bells. People have a right to know.', act: () => { S.flags.order = 'warners'; chron('You backed Brother Aldo and the warners. The Lantern bells rang across the Heartland.'); go('t2_bells'); }},
      {label:'Keep faith with the Abbess. Keep the hospices open, and find the cure.', act: () => { S.flags.order = 'keepers'; S.flags.abbessLetter = true; chron('You kept faith with Abbess Merrow. The bells stayed silent, and she gave you a letter for the Cathedral archive.'); go('t2_silence'); }}
    ]
  })},
  t2_bells:{ view: () => ({
    title:'Saint Calder’s Rest',
    text:[
      `Aldo rings the first bell himself. Across the valley, after a long minute, another bell answers. Then another, fainter, and another, until the whole Heartland seems to be ringing, house to house, the way the old law says.`,
      `The Abbess listens with her eyes closed. "I hope you're right," she says. "I'll write to the Cathedral that you're not to be admitted to the archive. I have to. You understand."`,
      `You understand. You'll have to find another way in.`
    ],
    choices:[{label:'Continue', go:'t2_ending'}]
  })},
  t2_silence:{ view: () => ({
    title:'Saint Calder’s Rest',
    text:[
      `Aldo takes his hand off the bell rope very slowly, as if it hurts. He doesn't say anything. He doesn't have to.`,
      `The Abbess writes the letter at her desk and seals it with the Order's lantern. "The archivist is a friend," she says. "Show him this. And Sister Orlo: thank you. I know what it cost."`,
      `On the road outside, a family goes by, heading north, toward the pass and the grey, and nobody stops them.`
    ],
    choices:[{label:'Continue', go:'t2_ending'}]
  })},
  t2_ending:{ view: () => {
    const f = S.flags; const t = [
      tEvac() ? (f.runnerDone && ilsaWardNews() === 'spoke' ? `Half of Kell's Rest goes home over the pass with Durra. The other half stays at Saint Calder's Rest, in the hospice, with work and beds. Durra hugs you hard enough to hurt. "Find the cure, child," she says. "Then come home and tell us about it."` : `The people of Kell's Rest stay at Saint Calder's Rest, in the hospice and the barns. Durra will look after them. "Go on," she says. "Find the cure. That's what you're for."`)
        : `You leave Saint Calder's Rest the next morning with Bracken and a full pack.`,
      f.order === 'warners' ? `Behind you, the bells are still ringing.` : `Behind you, the bells are silent. The letter is in your pack, wrapped in oilcloth.`,
      `The road runs east through the Heartland, through farms where the wheat stands grey in the fields, to Corvane and the Lantern Cathedral.`
    ];
    return {title:'The Heartland Road', text:t, choices:[{label:'End of chapter 2', act: () => {
      setQ('pass2', 'done', tEvac() ? 'You brought the people of Kell’s Rest over the pass.' : 'You crossed the pass to Saint Calder’s Rest.');
      quest('cathedral', 'The Lantern Cathedral', f.order === 'keepers' ? 'Take Abbess Merrow’s letter to the archivist under the Lantern Cathedral in Corvane.' : 'The Abbess has barred you from the Cathedral archive. Find another way in.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  t2_pass:{
    title:'The Pass Road',
    blurb: () => tEvac() ? `Eleven sledges, sixty-three people and a road over the top of the world.` : `One sister and one hound, and a long road over the mountains.`,
    w:340, h:250,
    nodes:[
      {id:'t2_camp', label:'Camp', x:55, y:205, sub:'Rest'},
      {id:'t2_snow', label:'Snowfield', x:150, y:150, sub:'Wolves', done: () => S.flags.snowDone},
      {id:'t2_chapel', label:'Ice Chapel', x:60, y:75, sub:'Optional', open: () => S.flags.snowDone, done: () => S.flags.chapelDone, lockText:'Across the snowfield'},
      {id:'t2_post', label:'Quarantine Post', x:250, y:95, sub:'The Crown', open: () => S.flags.snowDone, done: () => S.flags.postDone, lockText:'Across the snowfield'},
      {id:'t2_descend', label:'Down from the Pass', x:290, y:205, sub:'Saint Calder’s Rest', open: () => S.flags.postDone, lockText:'Past the quarantine'}
    ],
    edges:[['t2_camp','t2_snow'],['t2_snow','t2_chapel'],['t2_snow','t2_post'],['t2_post','t2_descend']]
  },
  t2_way:{
    title:'Saint Calder’s Rest',
    blurb: () => `A Lantern waystation at the foot of the pass: a hospice, a bell tower and an abbess with a desk full of Crown letters.`,
    w:340, h:250,
    nodes:[
      {id:'t2_gate', label:'The Gate', x:55, y:205, sub:'Where you came in', done: () => true},
      {id:'t2_hospice', label:'Hospice', x:70, y:90, sub:'Rest'},
      {id:'t2_abbess', label:'Abbess’s Study', x:185, y:185, sub:'Abbess Merrow', done: () => S.flags.metAbbess},
      {id:'t2_tower', label:'Bell Tower', x:200, y:70, sub:'Brother Aldo', done: () => S.flags.metAldo},
      {id:'t2_night', label:'The Courtyard', x:295, y:130, sub:'The second night', open: () => S.flags.metAbbess && S.flags.metAldo, done: () => S.flags.choirDone, lockText:'Meet the Abbess and Brother Aldo'}
    ],
    edges:[['t2_gate','t2_hospice'],['t2_gate','t2_abbess'],['t2_hospice','t2_tower'],['t2_abbess','t2_night'],['t2_tower','t2_night']]
  }
});

Object.assign(ENEMIES, {
  convert:{name:'Grey Convert', hp:30, dmg:[10,13], acc:70, dodge:3, armor:0, init:4, xp:35, hollow:true, cleanse:true, greyChance:20},
  // Tuned by bot sim (150 runs): ~65–86% first-try wins at levels 4–5 (91–97% if Orrin warned her). Tamsin
  // out-heals anything that only hits one target, so the pressure is the frequent area hymn.
  cantor:{name:'Cantor Vey', hp:85, dmg:[12,15], acc:74, dodge:8, armor:1, init:6, xp:220, ranged:true, row:'back', greyChance:25,
    spec:{every:2, name:'Hymn of Ash', windup:'{n} draws a great breath, and the grey in the courtyard rises like smoke to his voice.', mult:2.0, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  t2_snow:{title:'The Snowfield', enemies:() => tEvac() ? ['greywolf', 'greywolf', 'greywolf', 'greywolf'] : ['greywolf', 'greywolf', 'greywolf'], lethal:true, win:'t2_snowWin', back:'t2_snow',
    intro:'The grey wolves come across the snow at a lope, without a sound.'},
  t2_post:{title:'The Quarantine Post', enemies:() => ['soldier', 'soldier', 'sergeant'], lethal:true, win:'t2_postWin', back:'t2_post',
    intro:'The soldiers pull up their scarves and lower their spears.'},
  t2_boss:{title:'Cantor Vey and the Choir', lethal:true, win:'t2_bossWin', back:'t2_night',
    // Orrin warned her (freed): one fewer convert. Orrin hanged (judged): a zealot in place of a convert, who can't be freed.
    enemies:() => S.flags.orrin === 'freed' ? ['zealot', 'convert', 'convert', 'cantor'] : S.flags.orrin === 'judged' ? ['zealot', 'zealot', 'convert', 'convert', 'cantor'] : ['zealot', 'convert', 'convert', 'convert', 'cantor'],
    intro:'The Choir comes across the courtyard, still singing. Cantor Vey stays on the wall.'}
});

// Chapter 2 echoes: Tamsin's own ending, and back into Kael's and Ilsa's
const _tamsinEchoesT2 = HEROES.tamsin.echoes, _kaelEchoesT2 = HEROES.kael.echoes, _ilsaEchoesT2 = HEROES.ilsa.echoes;
HEROES.tamsin.echoes = () => { const e = _tamsinEchoesT2(); const f = S.flags;
  if (chapterOf(S) < 2) return e;
  if (f.order === 'warners') e.push('Tamsin backed Brother Aldo. The Lantern bells rang across the Heartland, and the Abbess barred her from the Cathedral archive.');
  if (f.order === 'keepers') e.push('Tamsin kept faith with Abbess Merrow. The hospices stay open and the bells stay silent, and she carries a letter into the Cathedral archive.');
  if (f.cureClue) e.push('Tamsin knows the name of the lost cure: the Second Lantern, a rite, not a medicine.');
  if (f.postHow === 'fight') e.push('Tamsin broke through a Crown quarantine. In Corvane, the Crown will be watching for a Lantern sister.');
  if (f.freedConverts) e.push(`Tamsin freed ${f.freedConverts === 1 ? 'a grey-touched convert' : 'grey-touched converts'} of the Ashen Hand instead of killing them.`);
  return e; };
HEROES.kael.echoes = () => { const e = _kaelEchoesT2(); const t = otherF('tamsin');
  if (t.order === 'warners') e.push('<b>Linked:</b> Tamsin had the Lantern bells rung across the Heartland. On Kael’s road north, every village will be talking about the Wardstones, and the Crown will be asking who started it.');
  if (t.order === 'keepers') e.push('<b>Linked:</b> Tamsin kept the Lantern Order quiet. On Kael’s road north, the grey fever is still “ordinary,” and people walk into it unwarned.');
  return e; };
HEROES.ilsa.echoes = () => { const e = _ilsaEchoesT2(); const t = otherF('tamsin');
  if (t.runnerDone && S.flags.spokeWard && t.choice === 'evacuate') e.push('<b>Linked:</b> The news of what Ilsa did at the Fourth Ward reached Tamsin. Half of Kell’s Rest went home.');
  if (t.cureClue && S.flags.aurel === 'carried') e.push('<b>Linked:</b> Tamsin learned the lost cure is a rite called the Second Lantern. It might be what Aurel needs.');
  return e; };

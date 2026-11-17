// ================= ILSA, CHAPTER 3: THE PASS =================
// The end of Ilsa's Act 1. From Kell's Rest, Ilsa and Hask cross the Hearthdeep pass (Tamsin's chapter 2 road)
// with Arcanum hunters behind them, down to Saint Calder's Rest and on toward Corvane. Scene IDs use the prefix i3_.
// Placeholder names: Magister Hale, the Leash. Writes `magister` ('home' | 'crown'), read by Kael's chapter 3.
HEROES.ilsa.chapters[3] = {title:'The Pass', start:'i3_intro'};

const iHid = () => S.flags.choice === 'hide';
const iTamsin = () => otherF('tamsin');
const iRiders = () => otherF('wren').fragment === 'crown';   // Wren gave Marrow the fragment: Marrow sends riders
const iXP = (n) => { const ups = gainXP(n); return `+${n} experience${ups.length ? `. Level up! Ilsa is now level ${S.level}.` : '.'}`; };

Object.assign(SCENES, {
  i3_intro:{
    enter(){ quest('pass3', 'Over the pass', 'Cross the Hearthdeep pass to the Heartland and go on to Corvane. The Arcanum has sent hunters after you.'); },
    view: () => {
      const t = [
        `You leave Kell's Rest by the pass road with Hask breaking trail and the Concord in an oilcloth against your ribs. The road climbs out of the valley into a white silence where the only sound is your own breath.`,
        `On the second morning Hask points back down the valley. Far below, on the road you just walked, a line of dark figures in Arcanum grey, and something with them on a chain that walks on all fours and isn't a dog.`,
        iHid() ? `"That's a lot of hunters for one apprentice," Hask says. "What exactly did you steal?" You both know. The Concord's last pages. The Arcanum wants them back badly enough to send a magister.` : `"They can't want the book," Hask says. "You gave it up." "They want me," you say. "I've read it. That's enough."`
      ];
      if (S.flags.aurel === 'carried') t.push(`Aurel rides on Hask's back now, strapped there like a child. The grey is at his jaw. He's awake for an hour a day, and he spends it apologising.`);
      if (S.flags.marked) t.push(`And at night, in the snow, something answers when you talk in your sleep. Since the Fourth Ward, the Hollow knows your voice.`);
      return {title:'The Pass Road', text:t, choices:[{label:'Up the pass', act: () => toMap('i3_pass')}]};
    }
  },

  // --- The high pass ---
  i3_camp:{ view: () => ({
    title:'The Cleft',
    text:[`A cleft in the rocks out of the wind. Hask builds a fire of dwarf pine and sits between you and the dark with his hammer across his knees.`],
    choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest. Health and spell points restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  i3_snow:{ view: () => S.flags.snowDone ? ({
      title:'The Snowfield', text:[`Your tracks, and the others', crossing the snowfield.`], choices:[back()]
    }) : ({
      title:'The Snowfield',
      text: S.flags.marked ? [
        `Halfway across the snowfield, you say something to Hask, and the snow answers. Grey shapes rise out of the drifts on every side, turning their blind heads toward the sound of you.`,
        `The Hollow knows your voice. It's come to listen.`
      ] : [
        `Halfway across the snowfield, two figures in Arcanum grey stand up out of a snow-hide where they've been waiting: the hunters' scouts, sent ahead to pin you down.`,
        `"Apprentice Venn," one calls. "The Magister would like a word."`
      ],
      choices:[{label:'Fight', act: () => startCombat('i3_snow')}, back('Back off for now')]
    })
  },
  i3_snowWin:{ enter(){ S.flags.snowDone = true; }, view: () => ({
    title:'The Snowfield',
    text:[S.flags.marked ? `When the last grey thing falls apart into snow, the silence comes back, and it's worse. Hask looks at you sidelong. "Could you maybe not talk," he says, "until we're off the mountain?"` : `One of the scouts carries orders sealed with the Arcanum's mark: <em>"Magister Hale to recover the apprentice, the Concord and any copies. The Leash is authorised."</em>`],
    choices:[back()]
  })},
  i3_chapel:{ view: () => {
    const f = S.flags, t = iTamsin();
    if (f.chapelDone) return {title:'The Ice Chapel', text:[t.cureClue ? `The hermit's fire is still burning.` : `The chapel is quiet. You left the hermit's notes where you found them.`], choices:[back()]};
    if (t.cureClue){
      const txt = [
        `Off the road, a pilgrims' chapel is half buried in a drift, and there's smoke from its chimney. Inside, an old woman in furs sits by the fire, grey to the wrists and no further. "Another one," she says. "A Lantern sister came through and stopped the grey in me. Sit down. You've the look of someone who reads."`,
        echo('tamsin', 'Tamsin tended the hermit of the Ice Chapel, and the grey stopped at her wrists.')
      ];
      return {title:'The Ice Chapel', text:txt, choices:[{label:'Sit with her.', act: () => { f.chapelDone = true; f.hermitTalk = true; if (S.flags.aurel === 'carried') S.flags.aurelSteady = true; S.notice = iXP(60); chron('On the pass, the hermit of the Ice Chapel told you about the Second Lantern.'); go('i3_hermit'); }}, back()]};
    }
    return {title:'The Ice Chapel', text:[
      `Off the road, a pilgrims' chapel is half buried in a drift. Inside, an old woman in furs sits in front of a dead fire, grey all through, and very still. She's been dead for days. On her knees there's a notebook in Lantern script.`
    ], choices:[
      Object.assign({label:'Read her notebook.', act: () => { f.chapelDone = true; f.hermitNotes = true; S.notice = iXP(40); chron('On the pass you read a dead Lantern hermit’s notes about a lost rite called the Second Lantern.'); go('i3_notes'); }}, chk('lore', 1)),
      {label:'Close her eyes and leave her in peace.', act: () => { f.chapelDone = true; render(); }},
      back()
    ]};
  }},
  i3_hermit:{ view: () => ({
    title:'The Ice Chapel',
    text:[
      `"The Second Lantern," she says, when you tell her about the Concord. "Two lanterns lit from one flame. The Order's cure, that they lost on purpose. Your book is the cage, girl. The Lantern is the key that turns it back. One's no good without the other."`,
      S.flags.aurel === 'carried' ? `She looks at Aurel for a long time and puts her hand on his forehead, and something passes from her to him, and the grey at his jaw goes back a finger's width. "That'll hold him to Corvane," she says, very tired. "Not further."` : `"Tell the sister who saved me," she says, "that I'm still here."`
    ],
    choices:[back()]
  })},
  i3_notes:{ view: () => ({
    title:'The Ice Chapel',
    text:[`The notes are a hermit's, half prayer and half memory. One line is underlined three times: <em>"The Second Lantern. Two lights, one flame. It is written under the Cathedral, and the Crown wants it forgotten."</em>`],
    choices:[back()]
  })},
  i3_post:{ view: () => {
    const f = S.flags, t = iTamsin();
    if (f.postDone) return {title:'The Quarantine Post', text:[`The barrier pole is behind you.`], choices:[back()]};
    const text = [`Where the road starts down into the Heartland, the Crown's quarantine post blocks it: a pole, a hut, a fire and soldiers in Crown blue with scarves over their faces.`];
    const ch = [];
    if (iRiders()){
      text.push(`And three riders in Crown blue on tall horses, waiting, who aren't from the post at all. Their sergeant salutes you. "Envoy Marrow's compliments, Apprentice Venn. A half-Sylvari girl gave the envoy a piece of the cage, and now the envoy believes your book. We're to see you safe to Corvane."`, echo('wren', 'Wren gave the Wardstone fragment to Envoy Marrow. Marrow believes the Concord now, and has sent riders for Ilsa.'));
      ch.push({label:'Ride on with Marrow’s riders.', act: () => { f.postDone = true; f.postHow = 'riders'; f.escort = true; S.notice = iXP(80); chron('Envoy Marrow’s riders met you at the quarantine post and rode with you.'); go('i3_postPast'); }});
    } else if (t.postHow === 'argue'){
      text.push(`The captain looks at Hask, and at you, and at your ink-stained hands. "Another one off the mountain," he says. "A Lantern sister came through here a while back and told me what she'd seen. I didn't believe her. I've been sorry since." He lifts the pole.`, echo('tamsin', 'Tamsin talked her way past this post, and the captain remembers her.'));
      ch.push({label:'Thank him, and go through.', act: () => { f.postDone = true; f.postHow = 'waved'; S.notice = iXP(80); go('i3_postPast'); }});
    } else if (t.postHow === 'fight'){
      text.push(`There are three times as many soldiers as the post was built for, and a new palisade. "A Lantern sister broke through here," the sergeant tells you, unasked. "Broke heads. Nobody comes down off that mountain now. Nobody."`, echo('tamsin', 'Tamsin fought her way through this post. It has been reinforced.'));
      ch.push(Object.assign({label:'Wait for snow and dark, and slip round the palisade.', act: () => { f.postDone = true; f.postHow = 'sneak'; S.notice = iXP(80); go('i3_postPast'); }}, chk('stealth', 2)));
      ch.push({label:'Break through.', act: () => startCombat('i3_post')});
    } else {
      if (t.postHow === 'sneak') text.push(`They've staked out the goat track that goes round the post. Somebody must have used it.`);
      ch.push(Object.assign({label:'Slip round the post in the dark.', act: () => { f.postDone = true; f.postHow = 'sneak'; S.notice = iXP(80); go('i3_postPast'); }}, chk('stealth', 1)));
      ch.push(Object.assign({label:'"I’m carrying evidence for Envoy Marrow of Corvane. Delay me and you can explain it to her."', act: () => { f.postDone = true; f.postHow = 'talk'; S.notice = iXP(80); go('i3_postPast'); }}, chk('leadership', 2)));
      ch.push({label:'Break through.', act: () => startCombat('i3_post')});
    }
    ch.push(back());
    return {title:'The Quarantine Post', text, choices:ch};
  }},
  i3_postPast:{ view: () => ({
    title:'The Quarantine Post',
    text:[{riders:`You ride down out of the snow between two of Marrow's riders, with Hask on the third horse looking deeply unhappy about it.`, waved:`The pole drops behind you. The captain doesn't look back.`, sneak:`It takes all night, and Hask is not built for creeping. But by dawn the post is behind you.`, talk:`The sergeant reads Marrow's name like it's a curse, and lifts the pole.`}[S.flags.postHow] || `The post is behind you.`, `Below, the road winds down into pine forest toward a stone house with a lantern over its gate.`],
    choices:[back()]
  })},
  i3_postWin:{ enter(){ S.flags.postDone = true; S.flags.postHow = 'fight'; S.items.draught += 1; S.notice = 'You find a Healing Draught in the guard hut.'; chron('You broke through a Crown quarantine post on the pass.'); }, view: () => ({
    title:'The Quarantine Post',
    text:[`The soldiers who can still run are running. Hask drags the pole aside. "The Crown will remember that," he says. "So will the Arcanum, when they ask the Crown where you went."`],
    choices:[back()]
  })},
  i3_descend:{ view: () => ({
    title:'Down from the Pass',
    text:[`The road drops out of the snow into pine forest and the first green you've seen in weeks. At the bottom, a stone house with a lantern over the gate: Saint Calder's Rest.`, `Behind you, still on the mountain, the hunters. Once you're down, they'll be down too.`],
    choices:[{label:'Down to Saint Calder’s Rest', act: () => toMap('i3_way')}, {label:'Not yet', act: () => toMap('i3_pass')}]
  })},

  // --- Saint Calder's Rest and the pine wood ---
  i3_rest:{
    enter(){
      const f = S.flags;
      if (f.aurel === 'carried' && !f.aurelSent){ f.aurelSent = true; chron('At Saint Calder’s Rest you sent Aurel ahead to the Lantern Cathedral in Corvane with Lantern pilgrims.'); }
    },
    view: () => {
      const f = S.flags, o = iTamsin().order;
      const t = [];
      if (o === 'keepers') t.push(`Abbess Merrow takes you in herself. "Sister Orlo kept faith with this house," she says, "so this house keeps faith with her friends." The hospice beds are clean, and nobody asks about hunters.`, echo('tamsin', 'Tamsin kept faith with Abbess Merrow. Saint Calder’s Rest shelters Ilsa.'));
      else if (o === 'warners') t.push(`The Crown is watching Saint Calder's Rest: there are soldiers at the gate, since the bells. Brother Aldo meets you on the road instead and takes you up the back stair to the bell tower. "Sister Orlo rang the bells," he says. "We'll hide anyone she'd have hidden."`, echo('tamsin', 'Tamsin rang the Lantern bells. The Crown watches Saint Calder’s Rest now, and Brother Aldo hides Ilsa.'));
      else t.push(`The sisters of Saint Calder's Rest give you beds in the hospice without asking where you've come from. The hunters are a day behind you, maybe less.`);
      if (f.aurel === 'carried') t.push(`In the morning a company of Lantern pilgrims sets out for Corvane, and Aurel goes with them on a cart, to the Cathedral, where the cure might be. "Go on," he whispers when you hesitate. "They're hunting you, not me. Find me there." ${f.aurelSteady ? 'The hermit’s touch is still holding.' : 'The grey is at his jaw.'}`);
      return {title: o === 'warners' ? 'The Bell Tower' : 'Saint Calder’s Rest', text:t, choices:[
        (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health and spell points)', act: () => { restAll(); S.notice = 'You sleep. Health and spell points restored.'; render(); }} : null,
        back()
      ].filter(Boolean)};
    }
  },
  i3_wood:{ view: () => {
    const f = S.flags;
    if (f.woodDone) return {title:'The Pine Wood', text:[f.leashLore ? `You know what the Leash is now, and how it's held.` : `The hunters' camp is empty. They're coming.`], choices:[back()]};
    return {title:'The Pine Wood', text:[
      `Below Saint Calder's Rest the road runs through a pine wood to a bridge over the river. Hask finds the hunters' camp before they find you: a cold fire, packs, and a chain staked into the ground, very thick, with nothing on it now.`,
      `Magister Hale has already moved down to the bridge. But he's left his notes in his pack.`
    ], choices:[
      Object.assign({label:'Read the Magister’s notes on the Leash.', act: () => { f.woodDone = true; f.leashLore = true; S.notice = iXP(60); chron('You read Magister Hale’s notes and learned how the Leash is bound.'); go('i3_leash'); }}, chk('lore', 1)),
      {label:'Burn the packs and go.', act: () => { f.woodDone = true; S.items.aether += 1; S.notice = 'You find an Aether Draught before you burn the packs.'; render(); }}
    ]};
  }},
  i3_leash:{ view: () => ({
    title:'The Pine Wood',
    text:[`The Leash, the notes say, is a grey-touched hunting hound the Arcanum fed on shard dust until it became something else. It's bound to the Magister through the chain-rune on his wrist. <em>"If the rune is disrupted, the Leash weakens. Do not let the apprentice learn this."</em>`, `Hask grins for the first time in a week.`],
    choices:[back()]
  })},
  i3_bridge:{ view: () => {
    const f = S.flags;
    const t = [`The bridge is old stone, one arch over a fast black river. Magister Hale is waiting in the middle of it: a tall, grey, careful man in Arcanum robes, with a chain wrapped round his wrist, and on the other end of the chain the Leash, a thing like a hound the size of a pony, grown through with black shards.`];
    if (iHid()) t.push(`"The pages, Venn," he says. "And any copies. And yourself. In that order." The air around him is thin and cold: the Council has given him everything it has.`);
    else t.push(`"You read it," he says. "The Council of Masters regrets that. Come quietly and we can discuss what you're allowed to remember."`);
    if (f.escort) t.push(`Marrow's riders draw up behind you on the road. Before anyone speaks, one of them puts an arrow through a hunter's shoulder. "Envoy's business," the sergeant calls.`);
    if (f.leashLore) t.push(`You look at the rune on his wrist, and he sees you look, and for the first time his face changes.`);
    t.push(`<em>This will be a hard fight. Hale's Unravelling hits everyone at once; the Leash hits like a wall.</em>`);
    return {title:'The Lower Bridge', text:t, choices:[{label:'Fight Magister Hale', act: () => startCombat('i3_boss')}, {label:'Fall back and prepare', act: () => toMap('i3_way')}]};
  }},
  i3_bossWin:{
    enter(){ if (S.flags.i3Boss) return; S.flags.i3Boss = true; },
    view: () => ({
      title:'The Lower Bridge',
      text:[
        `The Leash goes down, and the chain goes slack, and Hale goes down with it, as if half of him had been in the hound. He sits against the parapet with his wrist bleeding where the rune was, and looks at you with something like respect.`,
        `"The Council will send someone else," he says. "Someone less polite." He coughs. "Or you could make me useful. I'm a magister of the Arcanum's Corvane house. I know where the shards go, and who signs for them."`,
        S.flags.escort ? `Marrow's sergeant has his hand on his sword. "The envoy would very much like a magister of the Arcanum," he says.` : `Up the road, the quarantine post. The Crown would very much like a magister of the Arcanum.`
      ],
      choices:[{label:'Decide', go:'i3_choice'}]
    })
  },
  i3_choice:{ view: () => ({
    title:'The Lower Bridge',
    text:[
      `If you send him home owing you, you have a friend inside the Arcanum's Corvane house: someone who'll open a door when you need one. But he goes back to the Council knowing your route and what your Word can do.`,
      `If you give him to the Crown, the Crown hears from a magister's own mouth that the Arcanum has been buying Wardstone shards. ${iHid() ? 'Your warrant might soften.' : ''} And the Arcanum will know you did it, and close every door it has.`
    ],
    choices:[
      {label:'"Go home, Magister. Remember who let you."', act: () => { S.flags.magister = 'home'; chron('You let Magister Hale go home to the Arcanum’s Corvane house, owing you.'); go('i3_home'); }},
      {label:'Give him to the Crown.', act: () => { S.flags.magister = 'crown'; chron('You handed Magister Hale of the Arcanum to the Crown.'); go('i3_crown'); }}
    ]
  })},
  i3_home:{ view: () => ({
    title:'The Lower Bridge',
    text:[
      `Hale gets up slowly and looks at you for a long moment. "There's a door behind Number Nine on the Salt Quay," he says. "It'll be on the latch for anyone you send. Consider it interest." He walks away up the road, holding his wrist.`,
      `Hask watches him go. "He'll tell them everything about you," he says. "Yes," you say. "And then he'll open a door for us. Both things can be true."`
    ],
    choices:[{label:'Continue', go:'i3_ending'}]
  })},
  i3_crown:{ view: () => ({
    title:'The Lower Bridge',
    text:[
      S.flags.escort ? `Marrow's riders take Hale up behind a saddle with his hands tied. "The envoy will be very glad," the sergeant says. "He'll talk. They always talk, to her."` : `The quarantine captain takes Hale in irons, with your written statement, sealed with your own thumbprint in ink, and promises to send them both to Envoy Marrow in Corvane.`,
      `Hale doesn't argue. "The Council will close every door it has to you," he says. "Every library. Every archive. You'll never read another word in the Arcanum's keeping."`,
      `"I've read the important one," you say.`
    ],
    choices:[{label:'Continue', go:'i3_ending'}]
  })},
  i3_ending:{ view: () => {
    const f = S.flags;
    const t = [
      `Four days later, the road comes over a last rise, and there it is: Corvane on its hill, white walls and a hundred towers and the green dome of the Council House.`,
      f.aurel === 'carried' ? `Somewhere in there, in the Lantern Cathedral, Aurel is waiting for a cure.` : `Somewhere in there is the Lantern Cathedral, and the other half of the Concord.`,
      `Hask stands beside you in the road. "Big city," he says. "Lot of libraries." He means it kindly.`,
      `In your vision at the Arcanum there were three others, a swordsman, a healer and an archer, all walking toward this city. You touch the Concord through the oilcloth. You think they're here.`,
      `<em>This is the end of Ilsa's part of Act 1. In Act 2, the four meet in Corvane.</em>`
    ];
    return {title:'The Last Rise', text:t, choices:[{label:'End of chapter 3', act: () => {
      setQ('pass', 'done', 'You crossed the Hearthdeep pass.');
      setQ('pass3', 'done', f.magister === 'home' ? 'You crossed the pass and sent Magister Hale home owing you.' : 'You crossed the pass and gave Magister Hale to the Crown.');
      quest('others', 'The others from the vision', 'Find the three strangers from your vision. You think they’re in Corvane.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  i3_pass:{
    title:'The Hearthdeep Pass',
    blurb: () => `Snow, silence and hunters on the road behind you.`,
    w:340, h:250,
    nodes:[
      {id:'i3_camp', label:'The Cleft', x:55, y:205, sub:'Rest'},
      {id:'i3_snow', label:'Snowfield', x:150, y:150, sub:'Trouble', done: () => S.flags.snowDone},
      {id:'i3_chapel', label:'Ice Chapel', x:60, y:75, sub:'Optional', open: () => S.flags.snowDone, done: () => S.flags.chapelDone, lockText:'Across the snowfield'},
      {id:'i3_post', label:'Quarantine Post', x:250, y:95, sub:'The Crown', open: () => S.flags.snowDone, done: () => S.flags.postDone, lockText:'Across the snowfield'},
      {id:'i3_descend', label:'Down from the Pass', x:290, y:205, sub:'Saint Calder’s Rest', open: () => S.flags.postDone, lockText:'Past the quarantine'}
    ],
    edges:[['i3_camp','i3_snow'],['i3_snow','i3_chapel'],['i3_snow','i3_post'],['i3_post','i3_descend']]
  },
  i3_way:{
    title:'Below the Pass',
    blurb: () => `A Lantern waystation, a pine wood and a bridge over a fast black river.`,
    w:340, h:240,
    nodes:[
      {id:'i3_rest', label:'Saint Calder’s Rest', x:60, y:190, sub:'Rest'},
      {id:'i3_wood', label:'Pine Wood', x:165, y:80, sub:'The hunters’ camp', done: () => S.flags.woodDone},
      {id:'i3_bridge', label:'Lower Bridge', x:285, y:150, sub:'Magister Hale', done: () => S.flags.i3Boss}
    ],
    edges:[['i3_rest','i3_wood'],['i3_rest','i3_bridge'],['i3_wood','i3_bridge']]
  }
});

Object.assign(ENEMIES, {
  archunter:{name:'Arcanum Hunter', hp:34, dmg:[8,11], acc:72, dodge:6, armor:2, init:5, xp:40},
  // Marrow's riders put an arrow in one of the hunters before the fight
  archunterHurt:{name:'Arcanum Hunter (wounded)', hp:22, dmg:[8,11], acc:72, dodge:6, armor:2, init:5, xp:40},
  // Tuned by bot sim (150 runs): ~60–70% first-try wins at level 7 and 80–90% at level 8; ~87% at 7 with Marrow's
  // riders. Fights are short (8–10 rounds): the pressure is Hale's area Unravelling every other turn.
  leash:{name:'The Leash', hp:160, dmg:[12,15], acc:72, dodge:4, armor:3, init:4, xp:150, hollow:true, greyChance:20,
    spec:{every:3, name:'Shard Maul', windup:'{n} drops low, shards bristling along its spine.', mult:1.8}},
  // Ilsa read Hale's notes: she breaks the chain-rune early, and the Leash weakens
  leashWeak:{name:'The Leash', hp:125, dmg:[11,14], acc:70, dodge:4, armor:3, init:4, xp:150, hollow:true, greyChance:20,
    spec:{every:3, name:'Shard Maul', windup:'{n} drops low, shards bristling along its spine, the chain sagging.', mult:1.6}},
  hale:{name:'Magister Hale', hp:85, dmg:[8,11], acc:78, dodge:8, armor:1, init:6, xp:220, ranged:true, row:'back', greyChance:20,
    spec:{every:2, name:'Unravelling', windup:'{n} lifts his chained hand and begins to speak a word backwards.', mult:1.6, aoe:true, grey:2}},
  // She hid the pages: the Council wants them back badly, and Hale came with the full weight of his authority
  haleHunt:{name:'Magister Hale', hp:105, dmg:[8,11], acc:78, dodge:8, armor:1, init:6, xp:220, ranged:true, row:'back', greyChance:20,
    spec:{every:2, name:'Unravelling', windup:'{n} lifts his chained hand and begins to speak a word backwards, and the air goes thin.', mult:1.9, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  i3_snow:{title:'The Snowfield', enemies:() => S.flags.marked ? ['hound', 'hound', 'greywolf', 'greywolf'] : (iHid() ? ['archunter', 'archunter', 'adept'] : ['archunter', 'adept']), lethal:true, win:'i3_snowWin', back:'i3_snow',
    intro:'Something comes at you across the snow.'},
  i3_post:{title:'The Quarantine Post', enemies:() => otherF('tamsin').postHow === 'fight' ? ['soldier', 'soldier', 'soldier', 'sergeant'] : ['soldier', 'soldier', 'sergeant'], lethal:true, win:'i3_postWin', back:'i3_post',
    intro:'The soldiers pull up their scarves and lower their spears.'},
  // Hale, the Leash and two hunters. Read his notes → weaker Leash; Marrow's riders → a wounded hunter;
  // she hid the pages → a harder Hale.
  i3_boss:{title:'Magister Hale and the Leash', lethal:true, win:'i3_bossWin', back:'i3_bridge',
    enemies:() => {
      const f = S.flags;
      return [f.leashLore ? 'leashWeak' : 'leash', 'archunter', f.escort ? 'archunterHurt' : 'archunter', iHid() ? 'haleHunt' : 'hale'];
    },
    intro:'Hale lets the chain run out. The Leash comes across the bridge at you, and the hunters close in behind it.'}
});

// Chapter 3 echoes: Ilsa's own ending, and into Kael's, Tamsin's and Wren's
const _ilsaEchoesI3 = HEROES.ilsa.echoes, _kaelEchoesI3 = HEROES.kael.echoes, _tamsinEchoesI3 = HEROES.tamsin.echoes, _wrenEchoesI3 = HEROES.wren.echoes;
HEROES.ilsa.echoes = () => { const e = _ilsaEchoesI3(); const f = S.flags;
  if (chapterOf(S) < 3) return e;
  if (f.magister === 'home') e.push('Ilsa sent Magister Hale home owing her. She has a friend inside the Arcanum’s Corvane house, and the Arcanum knows her route.');
  if (f.magister === 'crown') e.push('Ilsa gave Magister Hale to the Crown. The Crown will hear from his own mouth that the Arcanum buys shards, and the Arcanum has shut its doors to her.');
  if (f.hermitTalk || f.hermitNotes) e.push('Ilsa knows the Lantern Order’s lost cure is the Second Lantern, and that it is written under the Cathedral.');
  if (f.aurelSent) e.push('Ilsa sent Aurel ahead to the Lantern Cathedral with Lantern pilgrims.');
  return e; };
HEROES.kael.echoes = () => { const e = _kaelEchoesI3(); const i = otherF('ilsa');
  if (i.magister === 'home') e.push('<b>Linked:</b> Ilsa sent the Arcanum’s Magister Hale home owing her. He left a door on the latch behind Number Nine.');
  if (i.magister === 'crown') e.push('<b>Linked:</b> Ilsa handed Magister Hale to the Crown. The Crown is watching Number Nine, and Voss doubled his guard.');
  return e; };
HEROES.tamsin.echoes = () => { const e = _tamsinEchoesI3(); const i = otherF('ilsa');
  if (i.aurelSent) e.push(`<b>Linked:</b> Ilsa sent Aurel ahead to the Lantern Cathedral.${i.aurelSteady ? ' The hermit Tamsin saved has held his grey back for now.' : ''}`);
  if (i.hermitTalk) e.push('<b>Linked:</b> The hermit Tamsin saved on the pass is still alive, and told Ilsa about the Second Lantern.');
  return e; };
HEROES.wren.echoes = () => { const e = _wrenEchoesI3(); const i = otherF('ilsa');
  if (i.escort) e.push('<b>Linked:</b> Because Wren gave the fragment to Envoy Marrow, Marrow sent riders to bring Ilsa safely over the pass.');
  return e; };

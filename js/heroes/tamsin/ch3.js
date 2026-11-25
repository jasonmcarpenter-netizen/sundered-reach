// ================= TAMSIN, CHAPTER 3: THE LANTERN CATHEDRAL =================
// The end of Tamsin's Act 1. Tamsin reaches the Lantern Cathedral in Corvane, gets into the archive beneath it
// (the Abbess's letter, or another way), finds the Second Lantern, and faces High Lector Saul, who is burning the
// stacks on the Crown's orders. Scene IDs use the prefix t3_. Placeholder names: Brother Ivo, High Lector Saul,
// Sister Wynn. Writes `rite` ('aurel' | 'saved' | 'ivo') and `lanternCost` (Mend the Grey is weaker).
HEROES.tamsin.chapters[3] = {title:'The Lantern Cathedral', start:'t3_intro'};

const tHoard = () => otherF('kael').hoard || null;          // 'exposed' or 'quiet'
const tAurel = () => !!otherF('ilsa').aurelSent;            // Ilsa sent Aurel ahead to the Cathedral
const tXP = (n) => { const ups = gainXP(n); return `+${n} experience${ups.length ? `. Level up! Tamsin is now level ${S.level}.` : '.'}`; };

// Performing the Second Lantern burns part of Tamsin's own light: Mend the Grey heals and burns for half
ACTIONS.mendgrey.run = function(u){
  C.used.mendgrey = true; const weak = S.hero === 'tamsin' && S.flags.lanternCost && !(typeof pairF === 'function' && pairF('west').lanternHealed); // Act 3 W2 can heal the cost
  const heal = Math.ceil((6 + sk('divine') * 2) / (weak ? 2 : 1));
  log(weak ? 'Tamsin lays her hands flat on the air. The light comes thinner than it used to, but the grey still draws back.' : 'Tamsin lays her hands flat on the air, and the grey draws back like a tide.');
  heroesAlive().forEach(x => { delete x.st.grey; x.hp = Math.min(x.max, x.hp + heal); });
  enemiesAlive().forEach(e => {
    if (e.cleanse && e.hp <= e.max * 0.6){ e.hp = 0; e.calmed = true; log(`The grey drains out of ${e.name}. They fall to their knees, weeping, themselves again.`); }
    else if (e.cleanse){ e.st.stun = 1; log(`${e.name} staggers as the grey is torn at, but it holds on. Weaken them first.`); }
    else if (e.hollow){ const d = Math.ceil((6 + sk('divine') * 2 + Math.floor(S.pc.attrs.spirit / 2)) / (weak ? 2 : 1)); log(`${e.name} burns in the light for ${d}.`); applyDmg(e, d); }
  });
};

Object.assign(SCENES, {
  t3_intro:{
    enter(){ quest('cathedral3', 'The Lantern Cathedral', S.flags.abbessLetter ? 'Take Abbess Merrow’s letter to the archive under the Lantern Cathedral, and find the Second Lantern.' : 'Get into the archive under the Lantern Cathedral, though the Abbess has barred you, and find the Second Lantern.'); },
    view: () => {
      const f = S.flags, h = tHoard();
      const t = [
        `Corvane. You come in through the Pilgrims' Gate with a crowd of Lantern pilgrims, ${f.postHow === 'fight' ? 'your hood up and your lantern hidden under your cloak, because the Crown is watching for a Lantern sister who broke a quarantine' : 'your lantern lit, because the Order still has the right to pass'}. Bracken walks so close to your leg you nearly trip over him.`,
        `The Lantern Cathedral stands at the top of the old town: black stone, a thousand candles and a great iron lantern on the roof that has burned for six hundred years. Under it, somewhere, is everything the Order ever wrote about the grey.`
      ];
      if (h === 'exposed') t.push(`The streets are full of frightened people. Someone dragged a cellar full of Wardstone shards out onto the Salt Quay two days ago, and now everyone knows what grey means, and everyone is going to the Cathedral to ask what to do.`, echo('kael', 'Kael exposed House Sarne’s shard hoard on the Salt Quay. All Corvane knows, and it’s frightened.'));
      else if (h === 'quiet') t.push(`The streets are calm. Too calm: there are Crown soldiers on every corner of the Lantern Quarter, and nobody says why.`, echo('kael', 'Kael handed House Sarne’s shard hoard to the Crown quietly. The Crown is guarding every door in Corvane that touches the Wardstones.'));
      return {title:'Corvane', text:t, choices:[{label:'Into the Lantern Quarter', act: () => toMap('t3_quarter')}]};
    }
  },

  // --- The Lantern Quarter ---
  t3_hostel:{ view: () => ({
    title:'The Pilgrims’ Hostel',
    text:[`A long room of straw pallets under the Cathedral's shadow, where the Order feeds anyone who walks in. Nobody asks your name. Bracken gets a bone.`],
    choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest. Health and spell points restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  t3_nave:{ view: () => {
    const f = S.flags, h = tHoard();
    if (f.naveDone) return {title:'The Nave', text:[h === 'exposed' ? `The nave is still full, but quieter now.` : `The nave is quiet. A thousand candles, and the soldiers at the archive stair.`], choices:[back()]};
    if (h === 'exposed') return {title:'The Nave', text:[
      `The nave is packed to the doors: hundreds of people, some grey-touched, all frightened, shouting at the priests on the altar steps, who don't know what to tell them. A man has climbed onto a pillar base and is screaming that the Hollow is coming up through the streets.`,
      `Nobody is watching the archive stair. Nobody is watching anything.`
    ], choices:[
      Object.assign({label:'Climb onto the altar steps and talk to them, the way you talked to Kell’s Rest.', act: () => { f.naveDone = true; f.naveCalmed = true; S.notice = tXP(80); chron('You calmed a frightened crowd in the Lantern Cathedral.'); go('t3_naveCalm'); }}, chk('leadership', 2)),
      {label:'Use the chaos. Slip toward the archive stair.', act: () => { f.naveDone = true; render(); }},
      back()
    ]};
    if (h === 'quiet') return {title:'The Nave', text:[
      `The nave is calm and half empty, and very beautiful. At the top of the archive stair stand two Crown soldiers in blue, with a paper nailed to the door behind them: <em>SEALED BY ORDER OF THE COUNCIL.</em>`
    ], choices:[{label:'Note it.', act: () => { f.naveDone = true; render(); }}, back()]};
    return {title:'The Nave', text:[`The nave of the Lantern Cathedral is a forest of black pillars and a thousand candles. Pilgrims kneel in the aisles. Somewhere below, the archive.`], choices:[{label:'Note the archive stair.', act: () => { f.naveDone = true; render(); }}, back()]};
  }},
  t3_naveCalm:{ view: () => ({
    title:'The Nave',
    text:[`You don't shout. You just start talking, the way you talk at a sickbed, about what grey is and what it isn't, and what to do for it, and what not to do. The front rows go quiet first, then the ones behind them. After an hour the priests are passing out bread and the man on the pillar has climbed down and is crying.`, `An old brother in archivist's black has been watching you from the stair the whole time.`],
    choices:[back()]
  })},
  t3_infirmary:{ view: () => {
    const f = S.flags, i = otherF('ilsa');
    if (!tAurel()) return {title:'The Infirmary', text:[`The Cathedral infirmary is full of grey-touched pilgrims. You work a shift because you can't not, and the sisters let you.`], choices:[back()]};
    if (!f.metAurel){ f.metAurel = true; chron('In the Lantern Cathedral’s infirmary you met Aurel, Ilsa’s mentor, grey to the jaw.'); }
    return {title:'The Infirmary', text:[
      `In the last bed in the Cathedral infirmary lies an old Sylvari man with a scholar's hands, grey to the jaw ${i.aurelSteady ? '(and not past it: something has held it back)' : 'and creeping'}. The sisters say Lantern pilgrims brought him in two days ago with a letter from a Sylvari apprentice.`,
      `"You'll be Tamsin Orlo," he says, opening his eyes. "Ilsa said you'd come. She said you'd be looking for the same thing she was, from the other end." He smiles. "I'm Aurel. I'm her teacher. I'd rather not die before I find out how she gets on."`,
      echo('ilsa', `Ilsa sent Aurel ahead to the Lantern Cathedral.${i.aurelSteady ? ' The hermit on the pass held his grey back.' : ''}`)
    ], choices:[back()]};
  }},
  t3_archive:{ view: () => {
    const f = S.flags, h = tHoard();
    if (f.inArchive) return {title:'The Archive Stair', text:[`The way down to the archive.`], choices:[{label:'Down into the archive', act: () => toMap('t3_under')}, back()]};
    const t = [`The archive stair goes down from a side chapel behind the altar, through an iron door.`];
    const ch = [];
    const enter = (how, line) => { f.inArchive = true; f.archiveHow = how; chron(line); S.notice = tXP(60); go('t3_down'); };
    if (f.abbessLetter){
      t.push(`An old man in archivist's black is waiting by the door${f.naveCalmed ? ': the one who watched you calm the crowd' : ''}. Brother Ivo reads the Abbess's letter twice, and his face softens. "Merrow," he says. "She always did know how to pick them."`);
      if (h === 'quiet'){ t.push(`"The Council has sealed my own archive against me," he says, looking at the soldiers. "But I've been archivist forty years. There are other doors." He takes you down through the ossuary.`); ch.push({label:'Follow Brother Ivo through the ossuary.', act: () => enter('ivo', 'Brother Ivo took you into the Cathedral archive through the ossuary.')}); }
      else ch.push({label:'Go down with Brother Ivo.', act: () => enter('letter', 'Brother Ivo read Abbess Merrow’s letter and took you down into the Cathedral archive.')});
    } else {
      t.push(`The archivist, an old brother called Ivo, has a letter from Abbess Merrow nailed to his door: <em>Sister Tamsin Orlo is not to be admitted.</em> He looks at you and then at the letter, and doesn't open the door.`);
      if (S.flags.order === 'warners') ch.push({label:'Find Brother Aldo’s friend among the bell-ringers.', act: () => enter('ringers', 'The Cathedral’s bell-ringers, who rang with Saint Calder’s, took you into the archive through the bell shaft.')});
      ch.push(Object.assign({label:'Find the old way in through the ossuary, by the cold air coming up the drains.', act: () => enter('ossuary', 'You found your way into the Cathedral archive through the ossuary.')}, chk('survival', 1)));
      if (h !== 'quiet' && f.naveCalmed) ch.push({label:'Ask Brother Ivo again. He saw what you did in the nave.', act: () => enter('ivo', 'Brother Ivo saw you calm the crowd, and let you into the archive against the Abbess’s orders.')});
    }
    if (h === 'quiet' && !f.abbessLetter) t.push(`The Crown soldiers at the stair look at your Lantern and step closer together.`);
    ch.push(back());
    return {title:'The Archive Stair', text:t, choices:ch};
  }},
  t3_down:{ view: () => ({
    title:'Under the Cathedral',
    text:[{letter:`Ivo takes you down a hundred and twelve steps, past the Order's dead in their niches, into the dark.`, ivo:`Ivo leads you through the ossuary, past six hundred years of Lantern sisters and brothers stacked like firewood, to a door nobody remembers.`, ringers:`Sister Wynn of the bell-ringers lowers you down the bell shaft on a rope, Bracken in a sack, swearing all the way.`, ossuary:`The cold air leads you through the ossuary, past six hundred years of the Order's dead, to a crack in an old wall.`}[S.flags.archiveHow] || `You go down into the dark.`,
      `The archive is a maze of stone rooms under the Cathedral, shelved to the vaults with books, scrolls and boxes, smelling of dust and lamp oil. Somewhere deeper in, you can smell smoke.`],
    choices:[{label:'Into the archive', act: () => toMap('t3_under')}]
  })},

  // --- The archive ---
  t3_lamp:{ view: () => ({
    title:'The Lamp Room',
    text:[`A small stone room where the archivists trim their lamps. It's quiet, and the door bars from inside.`],
    choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest. Health and spell points restored.'; render(); }} : null,
      {label:'Climb up to the Lantern Quarter', act: () => toMap('t3_quarter')},
      back()
    ].filter(Boolean)
  })},
  t3_stacks:{ view: () => S.flags.stacksDone ? ({
      title:'The Burned Stacks', text:[`Ash and ink on the floor, and nothing moving.`], choices:[back()]
    }) : ({
      title:'The Burned Stacks',
      text:[`One room has already been burned. The shelves are charcoal, and the ash on the floor is grey, not black, and it moves. Ink that was written about the Hollow for six hundred years has been set free by the fire, and it's standing up in the shapes of the people who wrote it.`],
      choices:[{label:'Fight', act: () => startCombat('t3_stacks')}, back('Back off for now')]
    })
  },
  t3_stacksWin:{ enter(){ S.flags.stacksDone = true; S.items.aether = (S.items.aether || 0) + 1; S.items.draught += 1; S.notice = 'In an archivist’s satchel you find a Healing Draught and an Aether Draught.'; }, view: () => ({
    title:'The Burned Stacks',
    text:[`When the last ink-wraith falls apart into ash, you find a satchel under a fallen shelf, and the archivist who carried it, who didn't get out. Whoever set this fire set it with people inside.`],
    choices:[back()]
  })},
  t3_reading:{ view: () => {
    const f = S.flags;
    if (f.foundRite) return {title:'The Reading Room', text:[`The book of the Second Lantern is in your pack.`], choices:[back()]};
    const t = [`The reading room is the heart of the archive: a round chamber of shelves with a reading desk in the middle and a catalogue ten volumes long. Somewhere in here is the Second Lantern, if it was ever written down.`];
    const ch = [];
    const found = (how) => { f.foundRite = true; f.riteHow = how; if (how === 'slow') f.lateFind = true; chron('You found the Second Lantern in the archive under the Cathedral.'); go('t3_rite'); };
    if (f.cureClue){
      t.push(`But you know the name. The hermit on the pass told you: <em>the Second Lantern.</em> You go straight to the catalogue.`);
      ch.push({label:'Look it up under its name.', act: () => { S.notice = tXP(80); found('clue'); }});
    } else {
      ch.push(Object.assign({label:'Search the catalogue for anything about a cure that isn’t a medicine.', act: () => { S.notice = tXP(80); found('lore'); }}, chk('lore', 1)));
      ch.push({label:'Pull books off the shelves until you find it, however long it takes.', act: () => { S.notice = tXP(40); found('slow'); }});
    }
    ch.push(back());
    return {title:'The Reading Room', text:t, choices:ch};
  }},
  t3_rite:{ view: () => ({
    title:'The Reading Room',
    text:[
      S.flags.riteHow === 'slow' ? `It takes hours. By the time you find it, the smoke is thick in the corridor, and you can hear the fire.` : `It's there, under its own name, in a thin book bound in black leather that someone has tried to cut out of the catalogue and failed.`,
      `<em>The Second Lantern.</em> Two lanterns lit from one flame: one held by a healer of the Order, one by a Warden of the Binding, or one of the Warden's blood. The grey is drawn out of the sick and into the light, and the light is fed by the healer's own. "It costs the healer dearly," the book says, "and it must be done one soul at a time."`,
      `Not a medicine. Never a medicine. That's why they never found it. And a Warden's blood: the Wardens are long gone, the book says. Unless they aren't.`,
      `The smoke is getting thicker. Someone is burning the archive room by room, and they're coming this way.`
    ],
    choices:[back()]
  })},
  t3_vault:{ view: () => {
    const f = S.flags, h = tHoard();
    const t = [`At the deepest end of the archive, in the vault where the Order keeps its oldest books, a tall man in a High Lector's red and black is feeding volumes into a brazier, one by one, carefully, as if it hurt him. Archive wardens in Lantern grey stand guard. Behind them the stacks are already burning.`,
      `"Sister," says High Lector Saul, without turning round. "I wondered whether it would be you. The Crown has asked the Order to forget certain things. The Order has agreed. I'm sorry."`];
    if (h === 'exposed') t.push(`"Half my wardens have gone up to hold the nave," he adds. "Someone has frightened the whole city. Your doing?"`);
    if (h === 'quiet') t.push(`A Crown soldier stands at his shoulder, with orders in his belt. The Council wants this done properly.`);
    if (tAurel() && !S.flags.riteFought) t.push(`Above you, in the infirmary, an old Sylvari man is dying of the grey. The book in Saul's hand might be the only other copy.`);
    if (f.lateFind) t.push(`You took too long in the reading room. The fire is everywhere, and the ink in the burned stacks is getting up.`);
    t.push(`<em>This will be a hard fight. Saul calls the fire down on everyone. His wardens are Lantern brothers following orders, and some of them might listen.</em>`);
    return {title:'The Old Vault', text:t, choices:[{label:'Stop him', act: () => startCombat('t3_boss')}, {label:'Fall back and prepare', act: () => toMap('t3_under')}]};
  }},
  t3_bossWin:{
    enter(){ if (S.flags.t3Boss) return; S.flags.t3Boss = true; },
    view: () => ({
      title:'The Old Vault',
      text:[
        `Saul goes down by his own brazier, and the wardens who are left lay down their staves. "Take it," he says from the floor, and pushes the black book toward you. "It's the only other copy. I'm glad. I've been burning things for the Crown for twenty years, and I'm so tired."`,
        `The fire is coming down the corridor toward the reading room.`,
        tAurel() ? `You have the book. You have a flame, and the lantern of Kell. Above you, Aurel is dying. And the book says the rite needs a Warden's blood for the second lantern, and you don't have one, unless you put your own light into both and pay twice.` : `You have the book. And from the reading room, through the smoke, you hear Brother Ivo calling for help: he went back for the catalogue, and the shelves have come down across the door.`
      ],
      choices:[{label:'Decide', go:'t3_choice'}]
    })
  },
  t3_choice:{ view: () => {
    const aurel = tAurel();
    return {title:'The Old Vault', text: aurel ? [
      `You could light the Second Lantern now, here, by Saul's brazier, and carry it up the stairs to Aurel, and pay for both lanterns out of your own light. It would cure him. It would cost you: whatever the rite takes from a healer, it would take twice. And while you're doing it, the fire takes the archive, and the only copy left is the one in your hand, scorched.`,
      `Or you could save the rite. Copy what matters onto your own skin and paper while the fire comes, carry the book out whole, take it to the Order and the Crown and anyone who'll listen, and find a Warden's blood to do it properly, for everyone. Aurel waits. Aurel might not have long.`
    ] : [
      `You could carry the book out whole, the Second Lantern, the cure, for everyone, and leave Ivo behind the fallen shelves. You might not have time for both.`,
      `Or you could go back for Ivo, and save the old man who's spent forty years keeping this archive, and carry out what you can of the book in your memory and a few scorched pages.`
    ], choices: aurel ? [
      {label:'Light the Second Lantern for Aurel, now.', act: () => { S.flags.rite = 'aurel'; S.flags.lanternCost = true; chron('You lit the Second Lantern for Aurel and paid for both lanterns out of your own light. Mend the Grey is weaker now.'); go('t3_aurel'); }},
      {label:'Save the rite, whole, for everyone.', act: () => { S.flags.rite = 'saved'; chron('You saved the Second Lantern from the fire, whole. Aurel will have to wait.'); go('t3_saved'); }}
    ] : [
      {label:'Save the book, whole.', act: () => { S.flags.rite = 'saved'; chron('You saved the Second Lantern from the fire. Brother Ivo did not get out.'); go('t3_saved'); }},
      {label:'Go back for Brother Ivo.', act: () => { S.flags.rite = 'ivo'; chron('You went back for Brother Ivo. The Second Lantern survives only in scorched pages and your memory.'); go('t3_ivo'); }}
    ]};
  }},
  t3_aurel:{ enter(){ S.notice = 'Mend the Grey is weaker now (half healing and half burning).'; }, view: () => ({
    title:'The Infirmary',
    text:[
      `You light the first lantern from Saul's brazier, and the second from the first, and the book is right: it takes everything. You carry them up a hundred and twelve steps with the archive burning behind you, and set them either side of Aurel's bed, and put your hands on him.`,
      `The grey comes out of him like smoke out of a chimney, into the light, and the light eats it. And then the light eats something of yours. You don't know what. Something you used to have, that warmed your hands when you prayed.`,
      `Aurel opens his eyes, clear and dark, no grey in them at all. "Oh," he says. "Oh, child. What did that cost you?" You don't answer. You don't know yet.`
    ],
    choices:[{label:'Continue', go:'t3_ending'}]
  })},
  t3_saved:{ view: () => ({
    title:'The Old Vault',
    text:[
      tAurel() ? `You carry the book up out of the fire whole, wrapped in your cloak, and give it into the Order's keeping and the Crown's knowledge both, so nobody can bury it again. Then you go to the infirmary. Aurel is asleep. The grey has reached his cheek.` : `You carry the book up out of the fire whole, wrapped in your cloak. Behind you, the reading room roof comes down. Brother Ivo's voice stops.`,
      `"A Warden's blood," you say to Bracken that night, the book in your lap. "Where in the world do I find a Warden's blood?"`
    ],
    choices:[{label:'Continue', go:'t3_ending'}]
  })},
  t3_ivo:{ view: () => ({
    title:'The Reading Room',
    text:[
      `You and Bracken drag the shelves off the door with the fire singing in the corridor, and haul Brother Ivo out by his collar. Behind you, the book of the Second Lantern burns on Saul's floor.`,
      `You have three scorched pages, and what you read, and what Ivo remembers, which is a great deal: forty years of reading. "We'll write it down again," he says, coughing. "Between us. Most of it. Not all."`
    ],
    choices:[{label:'Continue', go:'t3_ending'}]
  })},
  t3_ending:{ view: () => {
    const f = S.flags;
    const t = [
      `The fire under the Cathedral burns for a day and a night. The great iron lantern on the roof stays lit through all of it.`,
      {aurel:`Aurel is walking by the end of the week, slowly, with a stick, and asking for Ilsa every hour. Your prayers come thinner than they used to. You don't tell anyone.`, saved:`The book of the Second Lantern sits in your pack, whole. It needs a Warden's blood. You don't know where to find one.`, ivo:`Brother Ivo sits at a borrowed desk in the hostel, writing the Second Lantern down again from memory, page by slow page.`}[f.rite] || '',
      `In your vision at the shrine there were three others: a swordsman, a girl with a burning book, an archer in a dark forest. All walking toward this city. You think they're here now.`,
      `<em>This is the end of Tamsin's part of Act 1. In Act 2, the four meet in Corvane.</em>`
    ];
    return {title:'The Lantern Cathedral', text:t, choices:[{label:'End of chapter 3', act: () => {
      setQ('cathedral', 'done', 'You reached the archive under the Lantern Cathedral.');
      setQ('cathedral3', 'done', {aurel:'You lit the Second Lantern for Aurel.', saved:'You saved the Second Lantern from the fire.', ivo:'You saved Brother Ivo from the fire, and part of the Second Lantern with him.'}[f.rite]);
      if (S.quests.cure) setQ('cure', f.rite === 'aurel' ? 'done' : 'active', 'The Second Lantern: two lanterns lit from one flame, one held by a healer, one by a Warden of the Binding or one of the Warden’s blood.');
      quest('others', 'The others from the vision', 'Find the three strangers from your vision. You think they’re in Corvane.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  t3_quarter:{
    title:'The Lantern Quarter',
    blurb: () => `A thousand candles, a great iron lantern, and somewhere underneath, the archive.`,
    w:340, h:250,
    nodes:[
      {id:'t3_hostel', label:'Pilgrims’ Hostel', x:50, y:205, sub:'Rest'},
      {id:'t3_nave', label:'The Nave', x:150, y:140, sub:'The Cathedral', done: () => S.flags.naveDone},
      {id:'t3_infirmary', label:'Infirmary', x:60, y:70, sub:'The sick', done: () => S.flags.metAurel},
      {id:'t3_archive', label:'Archive Stair', x:280, y:110, sub:'Brother Ivo', open: () => S.flags.naveDone, done: () => S.flags.inArchive, lockText:'Go into the nave first'}
    ],
    edges:[['t3_hostel','t3_nave'],['t3_hostel','t3_infirmary'],['t3_infirmary','t3_nave'],['t3_nave','t3_archive']]
  },
  t3_under:{
    title:'The Archive',
    blurb: () => `Six hundred years of the Order's knowledge, and smoke in the corridors.`,
    w:340, h:250,
    nodes:[
      {id:'t3_lamp', label:'Lamp Room', x:50, y:200, sub:'Rest'},
      {id:'t3_stacks', label:'Burned Stacks', x:150, y:80, sub:'Ink-wraiths', done: () => S.flags.stacksDone},
      {id:'t3_reading', label:'Reading Room', x:170, y:190, sub:'The catalogue', done: () => S.flags.foundRite},
      {id:'t3_vault', label:'The Old Vault', x:290, y:130, sub:'High Lector Saul', open: () => S.flags.foundRite && S.flags.stacksDone, done: () => S.flags.t3Boss, lockText:'Find the rite and get past the burned stacks'}
    ],
    edges:[['t3_lamp','t3_stacks'],['t3_lamp','t3_reading'],['t3_stacks','t3_vault'],['t3_reading','t3_vault']]
  }
});

Object.assign(ENEMIES, {
  inkwraith:{name:'Ink-Wraith', hp:40, dmg:[10,13], acc:72, dodge:8, armor:0, init:6, xp:40, hollow:true, greyChance:25},
  // Lantern brothers following orders: Tamsin can Calm them
  archwarden:{name:'Archive Warden', hp:55, dmg:[13,16], acc:72, dodge:4, armor:2, init:4, xp:45, calm:true},
  // Tuned by bot sim (150 runs): ~70% first-try wins at level 7 and 85–90% at 8; ~90%+ if Kael exposed the hoard,
  // ~50–65% if Kael kept it quiet and she found the rite the slow way. Fights run 17–20 rounds (Tamsin outlasts).
  saul:{name:'High Lector Saul', hp:150, dmg:[12,15], acc:76, dodge:6, armor:1, init:5, xp:240, ranged:true, row:'back',
    spec:{every:2, name:'Pyre', windup:'{n} lifts the brazier’s light in both hands, and the fire in the stacks leans toward you.', mult:2.6, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  t3_stacks:{title:'The Burned Stacks', enemies:() => ['inkwraith', 'inkwraith', 'inkwraith'], lethal:true, win:'t3_stacksWin', back:'t3_stacks',
    intro:'The ink-wraiths come out of the ash with their pens raised like knives.'},
  // Saul, two wardens and two ink-wraiths. Kael exposed the hoard → a warden went up to hold the nave; kept it
  // quiet → a Crown soldier with Saul. Found the rite the slow way → another ink-wraith out of the fire.
  t3_boss:{title:'High Lector Saul', lethal:true, win:'t3_bossWin', back:'t3_vault',
    enemies:() => {
      const f = S.flags, h = otherF('kael').hoard; const e = ['archwarden', 'inkwraith', 'inkwraith'];
      if (h !== 'exposed') e.push('archwarden');
      if (h === 'quiet') e.push('soldier');
      if (f.lateFind) e.push('inkwraith');
      e.push('saul');
      return e;
    },
    intro:'Saul lifts the brazier. His wardens close up in front of him, and the ink in the burning stacks stands up.'}
});

// Chapter 3 echoes: Tamsin's own ending, and into Ilsa's, Wren's and Kael's
const _tamsinEchoesT3 = HEROES.tamsin.echoes, _ilsaEchoesT3 = HEROES.ilsa.echoes, _wrenEchoesT3 = HEROES.wren.echoes, _kaelEchoesT3 = HEROES.kael.echoes;
HEROES.tamsin.echoes = () => { const e = _tamsinEchoesT3(); const f = S.flags;
  if (chapterOf(S) < 3) return e;
  if (f.rite === 'aurel') e.push('Tamsin lit the Second Lantern for Aurel and cured him, and paid for both lanterns out of her own light. Mend the Grey is weaker now.');
  if (f.rite === 'saved') e.push('Tamsin carried the Second Lantern out of the fire, whole. It needs a Warden’s blood to work.');
  if (f.rite === 'ivo') e.push('Tamsin saved Brother Ivo from the fire. The Second Lantern survives in scorched pages and two memories.');
  if (f.naveCalmed) e.push('Tamsin calmed a frightened crowd in the Lantern Cathedral.');
  return e; };
HEROES.ilsa.echoes = () => { const e = _ilsaEchoesT3(); const t = otherF('tamsin');
  if (t.rite === 'aurel') e.push('<b>Linked:</b> Tamsin lit the Second Lantern for Aurel. He is cured, and it cost her.');
  else if (t.rite && S.flags.aurel === 'carried') e.push('<b>Linked:</b> Tamsin found the Second Lantern but couldn’t use it on Aurel yet. The grey is still spreading in him.');
  return e; };
HEROES.wren.echoes = () => { const e = _wrenEchoesT3(); const t = otherF('tamsin');
  if (t.foundRite && S.flags.metAunt) e.push('<b>Linked:</b> Tamsin found the Second Lantern: a cure that needs a Warden’s blood. Wren is of the Warden line.');
  return e; };
HEROES.kael.echoes = () => { const e = _kaelEchoesT3(); const t = otherF('tamsin');
  if (t.t3Boss && S.flags.hoard) e.push(S.flags.hoard === 'exposed' ? '<b>Linked:</b> Because Kael exposed the hoard, half the Cathedral’s wardens were holding the nave when Tamsin went down to the archive.' : '<b>Linked:</b> Because Kael kept the hoard quiet, a Crown soldier stood guard beside the man burning the Cathedral archive.');
  return e; };

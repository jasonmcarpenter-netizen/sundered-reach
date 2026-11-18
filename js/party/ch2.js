// ================= ACT 2, CHAPTER 2: THE KEYSTONE =================
// Under the palace to the Heartland Wardstone. Getting in (Marrow's pass by Crown standing, the pillar stair from
// Well Square, or the palace drains), the Council antechamber (Corrin, the King nobody has seen; Dario's records key
// if Kael won him), the palace records (Wren's father, "taken below at the Council's order"), the undercroft door,
// then the Binding hall (the Concord's inscription: the cage can be ended), the anchor (Wren's father in the stone)
// and the Root of the Hollow. Choice: keystone = 'released' (Tamsin's Second Lantern and Wren's blood: he goes free,
// the stone cracks faster) or 'bound' (Ilsa's Word holds the stone; he stays; the Hollow learns her voice deeper).
// Scene IDs use the prefix a22_. Party flags: way ('pass' | 'stair' | 'drains'), brokeIn, darioKey, alarm,
// recordsHow, foundFather, doorHow, endKnown, heardFather, keystone, lanternTwice, riteRisk, voiceDeep, a22Boss.
// Placeholder names: Faelan (Wren's father), the undercroft, the Binding hall, Captain Orme, the Root of the Hollow.
HEROES.party.chapters[2] = {title:'The Keystone', start:'a22_intro'};

const FATHER = 'Faelan';
const a22Seen = () => S.flags.way === 'pass' ? 'Captain Orme, at your elbow, sees all of it.' : null;

Object.assign(SCENES, {
  a22_intro:{
    enter(){ quest('keystone', 'The Keystone', 'Find out what the ward-pillars hold up under the palace, and why the Ashen Hand wants them cut.'); },
    view: () => {
      const f = S.flags, mood = crownMood(), base = f.base === 'gull' ? 'the Gull’s Rest' : 'the Pilgrims’ Hostel';
      const t = [];
      if (mood === 'cold') t.push(`Nobody from the Envoys' Court comes to ${base}. It's Tobin who brings the news, from the dockhands: Crown engineers have been down every well-shaft in the city with plumb lines and lanterns, and they've come up white.`);
      else t.push(`A runner in Crown grey finds you at ${base} before breakfast. Envoy Marrow wants you, all four, now.`,
        `In the map room, Marrow has a plan of Corvane spread across the table, and seven red marks on it in a ring. "My engineers," she says. "${f.pillar === 'told' ? 'After you showed me Well Square, I sent them looking.' : 'I sent them looking after Well Square went quiet.'} There are seven pillars under this city. Six are cracked. And every one of them leans the same way."`);
      t.push(`Toward the hill. Toward the palace.`,
        `"It's holding something up," says Ilsa, very quietly. Hask said it: <em>the legs of a table</em>. And whatever sits on the table is under the King's house.`);
      if (otherF('wren').metAunt) t.push(`Wren says nothing at all. Twenty years ago her father came to this city to warn the Crown, and never came home.`);
      return {title:'The Seven Pillars', text:t, choices:[{label:'Find a way under the palace', go:'a22_ways'}]};
    }
  },
  a22_ways:{ view: () => {
    const f = S.flags, mood = crownMood(), k = kf();
    const t = [`There are three ways under the palace that anyone in the room can think of.`];
    const ch = [];
    if (mood === 'warm'){
      t.push(`Marrow is already writing. "A pass under my seal. It will get you through the front gates and down. The palace guard will go with you." She doesn't look up. "That isn't a choice. The Council will want to know what you saw."`);
      ch.push({label:'Take Marrow’s pass.', act: () => { f.way = 'pass'; go('a22_pass'); }});
    } else if (mood === 'wary'){
      t.push(`"I can give you a pass," says Marrow, "if you give me something I can show the Council when they ask why I let four strangers under the King's house."`);
      if (k.shardProof) ch.push({label:'Kael puts the shard from Harrow’s well on her table.', tag:'Kael · the shard from Harrow’s Farm', act: () => { f.way = 'pass'; f.passHow = 'shard'; go('a22_pass'); }});
      if (k.bountyProof) ch.push({label:'Kael gives her Corrin Sarne’s sealed contract.', tag:'Kael · Corrin’s contract', act: () => { f.way = 'pass'; f.passHow = 'contract'; go('a22_pass'); }});
      ch.push(Object.assign({label:'Tell her plainly what happens to her city if the seventh pillar goes.', act: () => { f.way = 'pass'; f.passHow = 'talk'; go('a22_pass'); }}, chk('leadership', 2)));
    } else t.push(`Marrow would not give the four of you a pass. Not now, not with the warrants on her desk.`);
    t.push(`Under Well Square, the cracked pillar runs up into the dark toward the hill, and there was a stair inside it. ${f.pillar === 'told' ? 'The Crown’s engineers are on it now.' : 'Your own watch is on it.'}`,
      `And under every palace in the world there are drains.`);
    ch.push({label:'Climb the Binding stair inside the Well Square pillar.', go:'a22_stair'},
      {label:'Go in by the palace drains.', go:'a22_drains'});
    return {title:'Three Ways In', text:t, choices:ch};
  }},
  a22_pass:{ enter(){ if (!S.flags.passXP){ S.flags.passXP = true; S.notice = xpNoteParty(60); } }, view: () => ({
    title:'The Palace Gates',
    text:[
      S.flags.passHow === 'shard' ? `Marrow turns the grey shard over with a pen and doesn't touch it. "From a farmer's well," she says. "On the Salt Road." She writes the pass.` : S.flags.passHow === 'contract' ? `Marrow reads Corrin Sarne's contract twice, and her mouth goes thin. "He signed it," she says. "The fool signed it." She writes the pass.` : S.flags.passHow === 'talk' ? `Marrow hears you out, then sits for a long moment with her pen above the paper. Then she writes the pass.` : `The pass is three lines and a seal.`,
      `At the palace gates, a broad, grey-bearded man in a captain's sash reads it twice. "Captain Orme," he says. "I'm to take you wherever you're going, and see whatever you see." He doesn't smile. "This way."`
    ],
    choices:[{label:'Into the palace', act: () => toMap('a22_palace')}]
  })},
  a22_stair:{ view: () => {
    const f = S.flags;
    if (f.pillar === 'watched') return {title:'The Binding Stair', text:[
      `Under Well Square, Bracken and the watch you set are still at the cracked pillar. Nobody has come. In the back of the pillar, behind the crack, a narrow stair of Binding stone spirals up into the dark.`,
      `It's a long climb. It comes out behind a false wall in a cellar of the palace, among wine racks nobody has touched in a hundred years.`
    ], choices:[{label:'Into the palace', act: () => { f.way = 'stair'; f.stairHow = 'ours'; toMap('a22_palace'); }}, {label:'Think again', go:'a22_ways'}]};
    return {title:'The Binding Stair', text:[
      `Under Well Square, the pillar is banded with new iron, and four Crown engineers are drinking tea at the foot of the stair inside it, with a sergeant and two soldiers to keep them company.`,
      `They know your faces. You're the four who reported it.`
    ], choices:[
      Object.assign({label:'“Envoy Marrow wants to know where the stair goes. So do we. Come and hold the lantern.”', act: () => { f.way = 'stair'; f.stairHow = 'talk'; S.notice = xpNoteParty(60); toMap('a22_palace'); }}, chk('leadership', 2)),
      Object.assign({label:'Wait for the change of watch and slip up the stair behind them.', act: () => { f.way = 'stair'; f.stairHow = 'slip'; S.notice = xpNoteParty(60); toMap('a22_palace'); }}, chk('stealth', 2)),
      {label:'Think again', go:'a22_ways'}
    ]};
  }},
  a22_drains:{ view: () => ({
    title:'The Palace Drains',
    text:[
      `Where the palace's great drain comes out above the river, there's an iron grate as tall as Kael, rusted shut, and a smell that makes Bracken sneeze. The water running out of it is grey at the edges.`,
      `Something is living in there. You can hear it moving.`
    ],
    choices:[
      Object.assign({label:'Wren picks the grate’s old lock, quietly.', act: () => { S.flags.drainHow = 'quiet'; startCombat('a22_drains'); }}, chkBy('wren', 'lockpick', 1)),
      {label:'Kael takes the grate in both hands and tears it off.', act: () => { S.flags.drainHow = 'forced'; S.flags.brokeIn = true; startCombat('a22_drains'); }},
      {label:'Think again', go:'a22_ways'}
    ]
  })},
  a22_drainsWin:{ enter(){ if (S.flags.drainsDone) return; S.flags.drainsDone = true; S.flags.way = 'drains'; S.items.draught += 1; S.gold += 25; }, view: () => ({
    title:'The Palace Drains',
    text:[
      `The last of the drain-things comes apart into grey sludge. Under it, among a hundred years of the palace's dropped spoons and rings, there's a Healing Draught in a Crown flask and 25 crowns in tarnished coin.`,
      S.flags.drainHow === 'forced' ? `The grate went into the river with a sound they'll have heard on the hill. Somebody in the palace will be asking who did it. <em>Crown standing −1.</em>` : `Wren closes the grate behind you, and locks it again.`,
      `The drain climbs, and climbs, and comes out under a scullery floor.`
    ],
    choices:[{label:'Into the palace', act: () => toMap('a22_palace')}]
  })},

  // --- The palace ---
  a22_store:{ view: () => ({
    title:'A Forgotten Store-Room',
    text:[`A store-room off a back passage, full of broken chairs and rolled tapestries. Nobody has been in here for years. It's as safe as anywhere in the King's house.`],
    choices:[partyRest('You sleep in shifts among the broken chairs. Everyone’s health and spell points are restored.'), back()].filter(Boolean)
  })},
  a22_ante:{ enter(){ S.flags.anteSeen = true; if (kf().darioAlly) S.flags.darioKey = true; }, view: () => {
    const f = S.flags, k = kf();
    const t = [`The Council House joins the palace by a long gallery of portraits. Through a gap in the hangings, you can see into the antechamber: Crown clerks, Council secretaries, and a gilded door with two guards on it.`,
      `Lord Corrin Sarne comes up the gallery as you watch, in black and silver, with a sheaf of papers under his arm. He nods to the guards like an old friend. He's smiling. The gilded door closes behind him.`,
      `Two clerks, passing close: "...the King's hand again, on the Council's minute." "Have you seen the King?" "Nobody's seen the King since last winter. The Council says he's resting."`];
    if (a22Seen()) t.push(`Captain Orme's jaw is tight. He doesn't say anything.`);
    if (k.darioAlly) t.push(`A hand closes on Kael's arm from behind a hanging. It's Dario Sarne, thinner than he was at Varrow, in his brother's colours. "I knew you'd come here," he whispers. "Corrin keeps me at his side so he can watch me. I hate every minute of it." He presses an iron key into Kael's palm. "The palace records. Whatever you're looking for, it's there. Don't tell me what it is."`, echo('kael', 'Kael spared Dario Sarne at Varrow. Dario owes him his life.'), `Then he's gone, back into the gallery, smiling at a secretary.`);
    return {title:'The Council Antechamber', text:t, choices:[back()]};
  }},
  a22_records:{ view: () => {
    const f = S.flags;
    if (f.recordsIn) return {title:'The Palace Records', text:[`Shelves of ledgers, and the one on the table that you came for.`], choices:[{label:'Read it again', go:'a22_ledger'}, back()]};
    const t = [`The palace records are three locked rooms of ledgers under the clock tower: every visitor admitted to the palace for three hundred years, every order of the Council, every name.`];
    if (a22Seen()) t.push(`"These aren't for you," says Captain Orme. Then, after a moment: "But I'm told to see what you see. So I suppose I'll see this."`);
    const ch = [];
    if (f.darioKey) ch.push({label:'Use Dario’s key.', tag:'Kael · Dario’s key', act: () => { f.recordsIn = 'key'; go('a22_ledger'); }});
    ch.push(Object.assign({label:'Wren opens the door.', act: () => { f.recordsIn = 'pick'; go('a22_ledger'); }}, chkBy('wren', 'lockpick', 2)));
    if (f.way === 'pass') ch.push({label:'Ask Captain Orme for the key.', act: () => { f.recordsIn = 'orme'; go('a22_ledger'); }});
    ch.push({label:'Break the lock.', act: () => { f.recordsIn = 'broke'; f.alarm = true; f.brokeIn = true; go('a22_ledger'); }}, back());
    return {title:'The Palace Records', text:t, choices:ch};
  }},
  a22_ledger:{ view: () => {
    const f = S.flags, w = wf();
    if (f.foundFather) return {title:'The Palace Records', text:[
      `<em>Admitted: ${FATHER}, of Ardh Lirien, a Warden. To speak with His Majesty on a matter of the Wards.</em>`,
      `<em>Taken below, at the Council's order.</em>`,
      `There's no line after it. Nobody ever wrote that he left.`
    ], choices:[back()]};
    const t = [];
    if (f.recordsIn === 'broke') t.push(`The lock gives with a crack that echoes down the stair. Somewhere above, a bell starts ringing. You don't have long. <em>Crown standing −1.</em>`);
    t.push(`Twenty years ago is a whole wall of ledgers. Every visitor, every day, in a dozen clerks' hands.`);
    const ch = [
      Object.assign({label:'Ilsa reads the clerks’ shorthand the way she read the Arcanum’s.', act: () => { f.recordsHow = 'ilsa'; found(); }}, chkBy('ilsa', 'lore', 2))
    ];
    if (w.metAunt) ch.push({label:'Wren looks for the mark on her aunt’s door.', tag:'Wren · she found her aunt', act: () => { f.recordsHow = 'mark'; found(); }});
    ch.push({label:'Search the whole wall, page by page.', act: () => { f.recordsHow = 'slow'; f.alarm = true; found(); }});
    return {title:'The Palace Records', text:t, choices:ch};
    function found(){ f.foundFather = true; S.notice = xpNoteParty(f.recordsHow === 'slow' ? 40 : 80); chron(`In the palace records, the four found Wren’s father: ${FATHER}, a Warden, admitted twenty years ago and “taken below at the Council’s order”.`); go('a22_found'); }
  }},
  a22_found:{ view: () => {
    const f = S.flags, w = wf();
    const t = [];
    if (f.recordsHow === 'ilsa') t.push(`Ilsa runs a finger down the columns faster than anyone can follow, then stops.`);
    else if (f.recordsHow === 'mark') t.push(`It's in the margin: the small cut sign from Ysolde's door, a branch inside a ring. Wren finds it in under an hour, and then doesn't move.`, echo('wren', 'Wren found her aunt Ysolde in the Thornwood, and saw her father’s mark on the door.'));
    else t.push(`It takes all night. By the time Tamsin finds it, there are boots on the stair outside.`);
    t.push(`<em>Admitted: ${FATHER}, of Ardh Lirien, a Warden. To speak with His Majesty on a matter of the Wards.</em>`,
      `And a week later, in a different hand: <em>Taken below, at the Council's order.</em>`,
      `There's no line after it. Nobody ever wrote that he left.`,
      w.metAunt ? `"${FATHER}," says Wren. She's never heard her father's name in anyone's mouth but Ysolde's. "He came to warn them, and they took him below."` : `"${FATHER}," says Wren, trying the name out. Her father's name. "They took him below."`);
    if (a22Seen()) t.push(`Captain Orme reads it over her shoulder. "Below is the undercroft," he says slowly. "Nobody goes there. Council's orders. I've never asked why."`);
    if (f.alarm) t.push(`<em>The palace guard knows someone is in the records. They'll be waiting at the way down.</em>`);
    return {title:'The Palace Records', text:t, choices:[back()]};
  }},
  a22_door:{ view: () => {
    const f = S.flags;
    if (f.doorDone) return {title:'The Undercroft Door', text:[`The iron door stands open on the dark stair.`], choices:[{label:'Down to the undercroft', act: () => toMap('a22_under')}, back()]};
    const t = [`Below the oldest part of the palace, past the wine cellars, a stair ends at an iron door older than the palace itself, cut with the seven-pointed mark of the Binding.`];
    const ch = [];
    if (f.way === 'pass'){
      t.push(`Captain Orme stops in front of it. "No further," he says, almost apologetically. "Council's standing order. Nobody goes below. Not the Envoy's people, not mine, not the King's own cooks." Four of his guards come down the stair behind you.`);
      ch.push(Object.assign({label:'“Your Council took a man below twenty years ago and never brought him out. Doesn’t that worry you, Captain?”', act: () => { f.doorDone = true; f.doorHow = 'talk'; S.notice = xpNoteParty(80); go('a22_ormeOpens'); }}, chk('leadership', 2)));
    } else if (f.alarm){
      t.push(`There are torches at the door, and a grey-bearded captain in a sash with six guards. "There they are," he says. "Captain Orme, palace guard. You'll come with me." Nobody's slipping past this.`);
    } else {
      t.push(`Two guards dicing on the bottom step, and a grey-bearded captain in a sash, half-asleep in a chair.`);
      ch.push(Object.assign({label:'Wait for the dice to go badly, and slip past in the argument.', act: () => { f.doorDone = true; f.doorHow = 'slip'; S.notice = xpNoteParty(80); toMap('a22_under'); }}, chk('stealth', 2)));
    }
    ch.push({label:'Fight your way through. Nobody dies who doesn’t have to.', act: () => startCombat('a22_door')}, back());
    return {title:'The Undercroft Door', text:t, choices:ch};
  }},
  a22_ormeOpens:{ view: () => ({
    title:'The Undercroft Door',
    text:[`Orme looks at the door for a long time. Then he takes a key on a chain from around his neck. "I'll come with you," he says. "And I'll tell the Council exactly what I saw. All of it." He turns the key.`],
    choices:[{label:'Down to the undercroft', act: () => toMap('a22_under')}]
  })},
  a22_doorWin:{ enter(){ if (S.flags.doorDone) return; S.flags.doorDone = true; S.flags.doorHow = 'fight'; S.flags.brokeIn = true; }, view: () => ({
    title:'The Undercroft Door',
    text:[`Captain Orme is the last one down, on one knee, breathing hard, sword gone. Nobody is dead. "The Council will hear about this," he says. "Every word." <em>Crown standing −1.</em>`, `The key is on a chain around his neck. He doesn't stop you taking it.`],
    choices:[{label:'Down to the undercroft', act: () => toMap('a22_under')}]
  })},

  // --- The undercroft ---
  a22_niche:{ view: () => ({
    title:'The Founders’ Niche',
    text:[`A dry alcove off the stair, with stone benches and a cold lamp that Ilsa lights. Somebody slept here once, long ago: a blanket gone to dust, a cup.`],
    choices:[partyRest('You rest in the founders’ niche. Everyone’s health and spell points are restored.'), back()].filter(Boolean)
  })},
  a22_hall:{ view: () => {
    const f = S.flags, i = ilf();
    const t = [`The stair ends in a hall like the inside of a bell: round, vast, and humming. Seven black pillars come in through the walls from seven directions, and meet in the middle under the biggest Wardstone you have ever seen, as big as a house, veined with silver, held up on their ends like a table on its legs.`,
      `The Heartland stone. The keystone. Every Ward in the Reach leans on this one.`,
      `There's a crack in it from top to bottom. Grey light comes out of the crack.`,
      `The walls are carved floor to ceiling in the founders' script, the same hand as the last page of the Concord.`];
    if (i.spokeWard) t.push(`When Ilsa steps in, the hum changes, just slightly. The stone knows her voice.`, echo('ilsa', 'Ilsa spoke the Unwritten Word into the Fourth Ward at Kell’s Rest. The Hollow knows her voice.'));
    const ch = [];
    if (!f.endKnown) ch.push({label:'Ilsa opens the Concord and reads the walls against it.', act: () => { f.endKnown = true; S.notice = xpNoteParty(80); chron('In the Binding hall, Ilsa read the founders’ inscription: the Binding’s sacrifice can be released, and the Hollow ended instead of caged.'); go('a22_inscription'); }});
    else ch.push({label:'Read the inscription again', go:'a22_inscription'});
    ch.push(back());
    return {title:'The Binding Hall', text:t, choices:ch};
  }},
  a22_inscription:{ view: () => {
    const t = tf();
    return {title:'The Inscription', text:[
      `It takes Ilsa an hour, with the Concord open on her knees and her lips moving. When she finally speaks, her voice is strange.`,
      `"Every stone was anchored by a life. Someone who went into the stone willingly, to hold it. The Binding. That's what the founders did: they gave themselves to the stones." She turns a page. "And they knew it couldn't last. So they wrote down how to <em>release</em> them. Not renew the anchor. Release it. Let the life out, and close the crack behind it with light."`,
      `She looks at Tamsin. "Two lanterns from one flame. A healer's light and a Warden's blood." Tamsin has gone white. "The Second Lantern," she says. ${t.rite === 'aurel' ? '“I used it on Aurel.”' : t.rite === 'ivo' ? '“Ivo has most of it by heart.”' : '“It’s in my bag.”'}`,
      `"The Concord and the Second Lantern are two halves of one working," says Ilsa. "Done stone by stone, they don't renew the cage. They <em>end</em> it."`
    ], choices:[back()]};
  }},
  a22_anchor:{ view: () => {
    const f = S.flags, w = wf();
    const t = [`Close to, the Keystone is warm, like something breathing. Deep in the silver veins, there's a shape: not carved, not painted. A man, standing, with his arms out, as though holding something up.`,
      `Every stone was anchored by a life. The Heartland's anchor failed twenty years ago. And someone renewed it.`];
    const ch = [];
    if (!f.heardFather){
      ch.push(Object.assign({label:'Wren puts her hand on the stone.', act: () => { f.heardFather = 'wren'; go('a22_voice'); }}, chkBy('wren', 'wardlore', 1)));
      ch.push(Object.assign({label:'Kael puts his scarred hand on the stone.', act: () => { f.heardFather = 'kael'; go('a22_voice'); }}, chkBy('kael', 'wardlore', 1)));
    }
    if (!f.anchorSeen) t.push(`And curled around the foot of the Keystone, where the crack opens, something grey has grown up out of the dark like a root through a flagstone. It's gnawing at the stone. That's why the pillars are failing.`);
    ch.push({label:'Look at the thing at the foot of the stone', act: () => { f.anchorSeen = true; toMap('a22_under'); }});
    return {title:'The Keystone', text:t, choices:ch};
  }},
  a22_voice:{ enter(){ S.flags.anchorSeen = true; if (!S.flags.voiceXP){ S.flags.voiceXP = true; S.notice = xpNoteParty(80); } }, view: () => {
    const f = S.flags, w = wf();
    const t = [];
    if (f.heardFather === 'wren'){
      t.push(`The hum goes through Wren like a bowstring. And under the hum, very far away, a voice: tired, patient, Sylvari.`,
        w.metAunt ? `<em>Wren.</em> It knows her name. <em>Ysolde told you. Of course she did. Little bird, you got so tall.</em>` : `<em>Who's there? You feel like... you feel like the Thornwood.</em>`,
        `"${FATHER}," she says, and her voice cracks on it. "It's me."`,
        `<em>There's a thing at the root,</em> says the voice. <em>Eating. I can't hold the stone and fight it both. When you cut it, I'll push.</em>`);
    } else {
      t.push(`The hum goes through Kael like the stone under Varrow did. Under it, very far away, a man is holding something up with everything he has left. Kael can't hear words. He can feel the man notice him.`,
        `When Kael takes his hand away, there are tears on his face he didn't feel come.`,
        `"He's alive in there," Kael says. "And he's tired. When we go for that thing, he'll help."`);
    }
    return {title:'The Keystone', text:t, choices:[{label:'Back', act: () => toMap('a22_under')}]};
  }},
  a22_root:{ view: () => {
    const f = S.flags, t = tf();
    const txt = [`At the foot of the Keystone, the Root of the Hollow is wrapped round the crack like ivy round a well: grey, wet, thick as a man's body at the base and branching into a hundred tendrils, every one of them sunk in the stone. It pulses. Every pulse, the hall dims.`,
      `As you come close, the tendrils nearest you pull free of the stone and lift, like heads turning.`];
    if (f.heardFather) txt.push(`Deep in the stone, ${FATHER} is waiting to push.`);
    if (t.lanternCost) txt.push(`Tamsin flexes her hands. Since Aurel, her light comes thin. It will burn this thing, but not the way it used to.`, echo('tamsin', 'Tamsin paid for Aurel’s cure: Mend the Grey heals and burns for half.'));
    txt.push(`<em>A hard fight. The Root greys everyone at once; its tendrils grab one of you at a time and hold them. Mend the Grey burns it.</em>`);
    return {title:'The Root of the Hollow', text:txt, choices:[{label:'Cut it back', act: () => startCombat('a22_boss')}, {label:'Fall back and prepare', act: () => toMap('a22_under')}]};
  }},
  a22_bossWin:{
    enter(){ if (S.flags.a22Boss) return; S.flags.a22Boss = true; },
    view: () => ({
      title:'The Keystone',
      text:[
        `The Root comes away from the stone in long grey ropes, and slithers back down into the crack, and is gone. The hall goes bright again, then dim, then bright, like a lantern guttering.`,
        `The anchor is failing. You can all see it now: the man-shape in the silver veins is fainter than it was, and the crack is wider.`,
        S.flags.heardFather === 'wren' ? `<em>Wren,</em> says the voice in the stone, and now everybody can hear it. <em>I can't hold it much longer. Not alone.</em>` : `And then a voice, out of the stone, that everybody hears: <em>Is the Thornwood girl here? Is Wren here?</em> Wren goes very still. <em>I can't hold it much longer. Not alone.</em>`
      ],
      choices:[{label:'Listen', go:'a22_father'}]
    })
  },
  a22_father:{ view: () => ({
    title:'The Keystone',
    text:[
      `<em>I came to warn them,</em> says ${FATHER}. <em>The Heartland anchor was failing. They took me below and showed me the stone and said: someone has to. I said yes. I didn't know about you yet, Wren. Ysolde sent word, after. It came down the stone to me like a song.</em>`,
      `<em>The Council knew what they were doing. They've known for three hundred years. They feed the stones and tell no one.</em>`,
      `<em>Now. You have the founders' words and the healer's light, and you have my blood. You can let me go. Close the crack behind me with light, the way the founders meant. The cage would start to come apart. Slowly. The way it should. But the stone would crack faster with no one in it, and you'd have less time than you think.</em>`,
      `<em>Or the scholar can speak into the stone, the way the scholar spoke into the Fourth Ward, and it will hold. With me in it. For a long while yet.</em>`,
      `<em>It's your choice. All of yours. It's always been somebody's.</em>`
    ],
    choices:[{label:'Decide together', go:'a22_choice'}]
  })},
  a22_choice:{ view: () => {
    const t = tf();
    const cost = t.rite === 'aurel' ? `The Second Lantern took something from Tamsin when she lit it for Aurel. Lighting it again will take more.` : t.rite === 'ivo' ? `Tamsin has only Brother Ivo's memory of the rite, and some of the words are gone. It might hold. It might not.` : `Tamsin has the book of the Second Lantern whole. It will hold.`;
    return {title:'The Keystone', text:[
      `Release him, and Wren's father goes free, and the cage begins, at last, to come apart. But the Keystone will have no anchor, and it will crack faster than anyone can stop, and the end will come sooner, ready or not. ${cost}`,
      `Hold him, and Ilsa speaks the Unwritten Word into the stone, and it holds for years. But ${FATHER} stays in the stone. And the Hollow, which already ${ilf().spokeWard ? 'knows' : 'will learn'} Ilsa's voice, will know it all the way down.`
    ], choices:[
      {label:'Release him. Tamsin lights the Second Lantern with Wren’s blood.', act: () => {
        const f = S.flags; f.keystone = 'released'; if (t.rite === 'aurel') f.lanternTwice = true; if (t.rite === 'ivo') f.riteRisk = true;
        chron(`Under the palace, Tamsin lit the Second Lantern with Wren’s blood, and released ${FATHER} from the Keystone. The cage has begun to come apart.`); go('a22_released'); }},
      {label:'Hold him. Ilsa speaks the Unwritten Word into the Keystone.', act: () => {
        S.flags.keystone = 'bound'; S.flags.voiceDeep = true;
        chron(`Under the palace, Ilsa spoke the Unwritten Word into the Keystone, and it held. ${FATHER} is still in the stone.`); go('a22_bound'); }}
    ]};
  }},
  a22_released:{ view: () => {
    const f = S.flags;
    const t = [`Wren cuts her palm without being asked. Tamsin takes two lanterns from her pack, lights one, and lights the other from the first, and Wren lets her blood run down the second one's glass.`];
    if (f.riteRisk) t.push(`Tamsin says the words from Ivo's pages. Where the pages fail, she stops, and for a terrible moment nothing happens. Then she goes on in her own words, and the light catches. It holds. Barely.`);
    else if (f.lanternTwice) t.push(`Tamsin says the words. The light comes out of her the way it did for Aurel, and this time she can feel exactly what it's taking. She doesn't stop.`);
    else t.push(`Tamsin says the words from the book, steady and clear, and the light comes up out of both lanterns at once.`);
    t.push(`The man-shape in the stone turns its head. <em>Wren,</em> says ${FATHER}, and he isn't tired any more. <em>Little bird. When you get to the last stone, tell it my name.</em>`,
      `And he's gone, like a held breath let out. The crack in the Keystone fills with light, gold, not grey, and the hum of the hall changes key.`,
      `Then, from somewhere far above, a long, low groan, as all seven pillars settle, all at once.`);
    if (f.way === 'pass') t.push(`Captain Orme is staring at the stone. "What did you do?" he says. "What did you <em>do</em>?" He'll tell the Council four strangers weakened the palace stone. <em>Crown standing −1.</em>`);
    return {title:'The Keystone', text:t, choices:[{label:'Climb back up', go:'a22_end'}]};
  }},
  a22_bound:{ view: () => {
    const t = [`Ilsa puts her hand on the Keystone, beside the man-shape in the silver, and speaks the Unwritten Word.`,
      `It comes out of her like a bell rung in the dark. The crack in the stone closes, slowly, the way a wound closes. The pillars stop groaning. The hall goes steady and bright.`,
      `And somewhere very far down, under the stone, something hears her, all the way through, and remembers.`,
      `<em>Thank you,</em> says ${FATHER}, faint and steady. <em>Come back, Wren. Not soon. But come back.</em>`,
      `Wren stays with her hand on the stone a long time after the others have gone to the stair.`];
    if (S.flags.way === 'pass') t.push(`Captain Orme says nothing all the way up. At the top, he says: "The Council has a man in that stone." He doesn't sound like a man who's going to keep quiet about it.`);
    return {title:'The Keystone', text:t, choices:[{label:'Climb back up', go:'a22_end'}]};
  }},
  a22_end:{ view: () => {
    const f = S.flags, base = f.base === 'gull' ? 'the Gull’s Rest' : 'the Pilgrims’ Hostel';
    const txt = [`Back at ${base}, nobody says much. Tobin makes tea. Bracken lies across Wren's feet.`];
    txt.push(f.keystone === 'released' ? `"How long?" Kael asks finally. "Before the stone goes." "I don't know," Ilsa says. "Less than we need."` : `"How long will it hold?" Kael asks finally. "Years," says Ilsa. "Long enough to do this properly." She doesn't say what the Hollow heard.`);
    txt.push(`"The Council knew," says Tamsin. "For three hundred years. They took a man who came to help them and put him in a stone and told no one." "And Corrin Sarne walks in and out of their room smiling," says Wren.`,
      `"Then we take it to the Council," says Ilsa. "All of it, in front of everyone. The shards, the pillars, the stone, the man in it. Let them explain."`);
    if (f.lanternTwice) txt.push(`Tamsin is asleep before the tea is cold. Her hands are shaking, even asleep.`);
    return {title:'Afterwards', text:txt, choices:[{label:'End of Act 2, chapter 2', act: () => {
      setQ('keystone', 'done', f.keystone === 'released' ? `Under the palace, the four released Wren’s father from the Keystone. The cage has begun to come apart, and the stone is cracking.` : `Under the palace, Ilsa’s Word held the Keystone. Wren’s father is still in the stone.`);
      quest('ashenhand', 'The Ashen Hand', 'Find the Ashen Hand before they finish what they started, and make a plan for the Council.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  a22_palace:{
    title:'The Palace',
    blurb: () => S.flags.way === 'pass' ? `Captain Orme walks a pace behind you everywhere you go.` : `The back passages of the King's house, where nobody looks at servants.`,
    w:340, h:260,
    nodes:[
      {id:'a22_store', label:'Store-Room', x:50, y:210, sub:'Rest'},
      {id:'a22_ante', label:'Council Antechamber', x:80, y:60, sub:'The gallery of portraits', done: () => S.flags.anteSeen},
      {id:'a22_records', label:'Palace Records', x:220, y:50, sub:'Under the clock tower', open: () => S.flags.anteSeen, done: () => S.flags.foundFather, lockText:'Look into the antechamber first'},
      {id:'a22_door', label:'The Undercroft Door', x:280, y:200, sub:'The way below', open: () => S.flags.foundFather, done: () => S.flags.doorDone, lockText:'Search the records first'}
    ],
    edges:[['a22_store','a22_ante'],['a22_ante','a22_records'],['a22_records','a22_door'],['a22_store','a22_door']]
  },
  a22_under:{
    title:'The Undercroft',
    blurb: () => `Under the palace, under the cellars, under everything: the Binding.`,
    w:340, h:260,
    nodes:[
      {id:'a22_niche', label:'Founders’ Niche', x:50, y:210, sub:'Rest'},
      {id:'a22_hall', label:'The Binding Hall', x:110, y:80, sub:'The founders’ inscription', done: () => S.flags.endKnown},
      {id:'a22_anchor', label:'The Keystone', x:240, y:60, sub:'The anchor', open: () => S.flags.endKnown, done: () => S.flags.anchorSeen, lockText:'Read the inscription first'},
      {id:'a22_root', label:'The Root', x:280, y:200, sub:'At the foot of the stone', open: () => S.flags.anchorSeen, done: () => S.flags.a22Boss, lockText:'Go to the Keystone first'}
    ],
    edges:[['a22_niche','a22_hall'],['a22_hall','a22_anchor'],['a22_anchor','a22_root'],['a22_niche','a22_root']]
  }
});

Object.assign(ENEMIES, {
  // Party enemies, tuned for a level 12 party (parties reach A2·2 at 11–14; scaled by scalePartyEnemies)
  draincrawler:{name:'Drain-Crawler', hp:250, dmg:[34,40], acc:72, dodge:6, armor:1, init:6, xp:45, hollow:true, greyChance:20},
  drainmother:{name:'The Drain-Mother', hp:540, dmg:[38,44], acc:72, dodge:2, armor:2, init:3, xp:120, hollow:true,
    spec:{every:3, name:'Flood', windup:'{n} heaves, and the grey water in the drain rises toward you.', mult:1.5, aoe:true}},
  palaceguard:{name:'Palace Guard', hp:270, dmg:[34,40], acc:74, dodge:4, armor:3, init:5, xp:50, calm:true},
  palacebow:{name:'Palace Crossbowman', hp:190, dmg:[32,36], acc:74, dodge:6, armor:1, init:6, xp:50, ranged:true, row:'back'},
  orme:{name:'Captain Orme', hp:520, dmg:[38,44], acc:78, dodge:8, armor:3, init:7, xp:150,
    spec:{every:3, name:'Captain’s Cut', windup:'{n} sets his feet and raises his sword two-handed.', mult:1.8}},
  roottendril:{name:'Grasping Tendril', hp:360, dmg:[40,46], acc:76, dodge:4, armor:2, init:6, xp:80, hollow:true,
    spec:{every:2, name:'Grasp', windup:'{n} coils back, reaching for someone.', mult:1.2, stun:true}},
  greyspawn:{name:'Grey Spawn', hp:240, dmg:[36,42], acc:72, dodge:6, armor:0, init:5, xp:50, hollow:true, greyChance:25},
  root:{name:'The Root of the Hollow', hp:1550, dmg:[56,64], acc:74, dodge:0, armor:3, init:3, xp:400, hollow:true, ranged:true, row:'back', greyChance:20,
    spec:{every:2, name:'Grey Tide', windup:'{n} pulses, drawing grey up out of the Keystone’s crack, and the whole hall dims.', mult:2.2, aoe:true, grey:2}},
  // Wren's father pushes against it from inside the stone
  rootWeak:{name:'The Root of the Hollow', hp:1150, dmg:[52,60], acc:72, dodge:0, armor:3, init:3, xp:400, hollow:true, ranged:true, row:'back', greyChance:20,
    spec:{every:2, name:'Grey Tide', windup:'{n} pulses, but something in the stone pushes back, and the grey comes up thinner.', mult:1.8, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  a22_drains:{title:'The Palace Drains', level:12, lethal:true, win:'a22_drainsWin', back:'a22_drains',
    enemies:() => ['draincrawler', 'draincrawler', 'drainmother'].concat(S.flags.drainHow === 'forced' ? ['draincrawler'] : []),
    intro:'Things come up out of the grey water, many-legged and slick.'},
  a22_door:{title:'The Undercroft Door', level:12, lethal:true, win:'a22_doorWin', back:'a22_door',
    enemies:() => ['palaceguard', 'palaceguard', 'orme', 'palacebow'].concat(S.flags.alarm ? ['palaceguard'] : []),
    intro:'“Take them alive,” says Captain Orme, and draws.'},
  a22_boss:{title:'The Root of the Hollow', level:12, lethal:true, win:'a22_bossWin', back:'a22_root',
    enemies:() => ['roottendril', 'roottendril', 'greyspawn', S.flags.heardFather ? 'rootWeak' : 'root'],
    intro:'The tendrils lift from the stone, and the Root pulses.'}
});

// A2·2's echoes on the party's chapter-end screen (its Crown standing effects are in crownStanding(), party/ch1.js)
const _a21Echoes = HEROES.party.echoes;
HEROES.party.echoes = () => {
  const f = S.flags, e = _a21Echoes();
  if (f.foundFather) e.push(`Wren’s father was ${FATHER}, a Warden of Ardh Lirien, taken below the palace at the Council’s order twenty years ago.`);
  if (f.darioKey) e.push('Dario Sarne gave Kael the key to the palace records. He is at his brother’s side in Corvane, and hates it.');
  if (f.brokeIn) e.push('The palace knows the four broke in.');
  if (f.endKnown) e.push('The founders’ inscription: the Concord and the Second Lantern together can release the Binding’s anchors and end the cage.');
  if (f.keystone === 'released') e.push(`The four released ${FATHER} from the Keystone. The cage has begun to come apart, and the stone is cracking faster.${f.lanternTwice ? ' The Second Lantern cost Tamsin again.' : ''}${f.riteRisk ? ' Ivo’s pages barely held.' : ''}`);
  if (f.keystone === 'bound') e.push(`Ilsa’s Word holds the Keystone. ${FATHER} is still in the stone, and the Hollow knows Ilsa’s voice all the way down.`);
  if (f.way === 'pass' && f.keystone) e.push('Captain Orme saw everything below the palace, and will tell the Council.');
  return e;
};

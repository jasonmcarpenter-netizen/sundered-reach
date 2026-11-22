// ================= ACT 2, CHAPTER 1: STRANGERS IN CORVANE =================
// The four meet in Corvane's Lower Town on the night grey rises in the wells: Kael and Wren on the same Sarne trail,
// Ilsa and Tamsin over Aurel or the two halves of the secret. First party fight in Well Square, a base with the
// companions, Envoy Marrow and the "Crown standing" score, and Brother Gall at a cracked ward-pillar under the town.
// Scene IDs use the prefix a21_. Party flags: base, pillar ('told' | 'watched'), firstTrust, firstShown, wardRead,
// haskRead, sarneLead, cacheFound. Placeholder names: the Lower Town, Well Square, the Envoys' Court, Brother Gall.
HEROES.party.chapters[1] = {title:'Strangers in Corvane', start:'a21_intro'};

const kf = () => otherF('kael'), ilf = () => otherF('ilsa'), tf = () => otherF('tamsin'), wf = () => otherF('wren');
// How far the Crown trusts the four, from what they did in Act 1 (used by Marrow here, the palace in A2·2 and the
// betrayal in A2·4)
function crownStanding(){
  const k = kf(), i = ilf(), t = tf(), w = wf(); let n = 0;
  if (i.choice === 'report') n++; if (i.choice === 'hide') n--;
  if (k.hoard === 'quiet') n++; if (k.captain === 'handed') n++; if (k.cityHow === 'force') n--;
  if (w.fragment === 'crown') n++; if (w.barge === 'crown') n++; if (w.patrolHow3 === 'fight') n--;
  if (i.magister === 'crown') n++;
  if (t.order === 'keepers') n++; if (t.postHow === 'fight') n--;
  const f = S.flags || {};
  if (f.pillar === 'told') n++;
  // A2·2: seen breaking into the palace; releasing the Keystone's anchor in front of the Crown's captain
  if (f.brokeIn) n--; if (f.keystone === 'released' && f.way === 'pass') n--;
  if (f.evidenceTo === 'marrow') n++; // A2·3: trusted her with the evidence
  return n;
}
const crownMood = () => { const n = crownStanding(); return n >= 4 ? 'warm' : n >= 1 ? 'wary' : 'cold'; };
const wellsGrey = () => wf().barge === 'sunk';

Object.assign(SCENES, {
  a21_intro:{
    enter(){ quest('a21', 'Strangers in Corvane', 'Something is wrong in Corvane’s Lower Town tonight.'); },
    view: () => ({
      title:'Corvane, at night',
      text:[
        `Corvane at night is a hill of lamps above a dark river. The palace and the Council House on the crown of it, the Lantern Cathedral's great iron lantern a little below, and at the bottom, where the river bends, the Lower Town: tanneries, tenements, wells, and the people nobody on the hill thinks about.`,
        wellsGrey() ? `Tonight the wells of the Lower Town are coming up grey.` : `Tonight, under the Lower Town, something cracks with a sound like a bell breaking, and nobody on the hill hears it.`,
        `Four people in four different parts of the city are about to go down there, for four different reasons.`
      ],
      choices:[{label:'Kael', go:'a21_kael'}]
    })
  },
  a21_kael:{ view: () => {
    const k = kf();
    return {title:'Kael', text:[
      k.hoard === 'exposed' ? `The city is frightened, and you did that. For three days you've slept in the Gull's Rest with your sword under the pillow, because House Sarne has men looking for the pit fighter who dragged their cellar into the street.` : `The Watch Captain told you to keep your head down while the Council does things properly. For three days you've kept it down in the Gull's Rest, and the Council has done nothing at all.`,
      `Tonight Brannoc comes up the stairs fast. "Sarne men," he says. "Six of them, with a cart, going down toward the Lower Town. Crates. And they're not carrying them like salt."`,
      `You go.`
    ], choices:[{label:'Ilsa', go:'a21_ilsa'}]};
  }},
  a21_ilsa:{ view: () => {
    const i = ilf();
    return {title:'Ilsa', text:[
      i.magister === 'home' ? `Somewhere in this city, Magister Hale is opening doors for you, and you still don't know whether you trust him.` : i.magister === 'crown' ? `You spent the afternoon at the Envoys' Court giving a statement against Magister Hale, and the Arcanum's Corvane house has shut its doors to you for good.` : `You've been in Corvane four days and read nothing, which is the longest you've gone in your life.`,
      `Tonight, in Hask's rented room, the Concord goes warm against your ribs. It has only ever done that near a Ward. You take it out, and the last page, the one in the founders' own hand, is warmest at one edge, the edge that points downhill toward the river.`,
      `Hask is already putting his boots on.`
    ], choices:[{label:'Tamsin', go:'a21_tamsin'}]};
  }},
  a21_tamsin:{ view: () => {
    const t = tf();
    return {title:'Tamsin', text:[
      t.rite === 'aurel' ? `Aurel is walking now, with a stick. You aren't sleeping. Whatever the Second Lantern took from you, it hasn't given it back, and your prayers come thin.` : t.rite === 'saved' ? `The book of the Second Lantern is under your pillow in the Pilgrims' Hostel. It needs a Warden's blood. ${ilf().aurelSent ? 'Aurel is worse every day.' : ''}` : t.rite === 'ivo' ? `Brother Ivo writes the Second Lantern down from memory every morning, page by page. Most of it. Not all.` : `You've worked every shift the Cathedral infirmary will give you.`,
      `Tonight a runner comes from the Lower Town: people falling sick at the wells, all at once, grey to the elbows by morning. Grey that's not coming from any shrine.`,
      `Bracken is at the door before you are.`
    ], choices:[{label:'Wren', go:'a21_wren'}]};
  }},
  a21_wren:{ view: () => {
    const w = wf();
    return {title:'Wren', text:[
      w.barge === 'sunk' ? `You sank the Grey Heron at Corvane Reach. Three days later there's a grey sheen on every well in the Lower Town, and you know exactly why, and you've told nobody.` : w.barge === 'crown' ? `You gave the Crown a barge full of shards. Tonight, from a roof by the river, you watch two figures in ash-grey come ashore from a skiff: river-priests who got away.` : `You've been in Corvane three days, and you still haven't found where your father went twenty years ago.`,
      `Tobin, beside you: "Wren. There's a Sarne cart going down to the Lower Town. And a big man with a sword following it, who isn't Sarne."`,
      `You nock an arrow and follow the man following the cart.`
    ], choices:[{label:'Down into the Lower Town', go:'a21_meet1'}]};
  }},
  a21_meet1:{ view: () => {
    const k = kf(), w = wf();
    const t = [`In an alley behind the tanneries, the Sarne cart turns a corner, and Kael turns it after them, and there's an arrow pointing at his throat from a rooftop.`];
    if (w.key === 'sold') t.push(`"You," Kael says. He's heard about you: a half-Sylvari who sold House Sarne a key. "Voss's courier."`, echo('wren', 'Wren sold Steward Voss the founder’s key. Kael heard about it on the Salt Road.'));
    else t.push(`"Who are you?" Kael says.`);
    if (k.dario === 'killed') t.push(`"I know your face," Wren says. "Five hundred crowns, dead or alive. You killed Dario Sarne."`, echo('kael', 'Kael killed Dario Sarne. The price on his head reached the Thornwood.'));
    else t.push(`"I know your face," Wren says. "It's nailed to every waymarker on the Salt Road."`);
    t.push(`And then you both stop. Because you've seen each other before: in a vision at a cracked stone, a swordsman on bloody sand, an archer in a dark wood with a glowing crate.`, `Below you, the Sarne cart is getting away.`);
    return {title:'An Alley in the Lower Town', text:t, choices:[
      {label:'Kael lowers his sword first.', act: () => { S.flags.firstTrust = 'kael'; chron('In an alley in the Lower Town, Kael lowered his sword first.'); go('a21_meet2'); }},
      {label:'Wren lowers her bow first.', act: () => { S.flags.firstTrust = 'wren'; chron('In an alley in the Lower Town, Wren lowered her bow first. She has never done that before.'); go('a21_meet2'); }}
    ]};
  }},
  a21_meet2:{ view: () => {
    const i = ilf(), t = tf();
    const txt = [];
    if (i.aurelSent) txt.push(t.rite === 'aurel' ? `At the top of the Lower Town, by the Cathedral's back gate, a Sylvari girl with ink on her hands is running downhill, and an old man with a stick is calling after her: "Ilsa! Ilsa, slow down!" She stops dead. Aurel, walking, without a trace of grey. And beside him, a Stoneborn Lantern sister with very tired eyes.` : `At the top of the Lower Town, by the Cathedral's back gate, a Sylvari girl with ink on her hands is running downhill, and a Stoneborn Lantern sister is coming the other way with a hound. "You're Ilsa Venn," the sister says. "Aurel talks about you in his sleep. He's dying in my infirmary."`,
      echo('tamsin', t.rite === 'aurel' ? 'Tamsin lit the Second Lantern for Aurel and cured him.' : 'Tamsin found the Second Lantern but has not been able to use it on Aurel.'));
    else txt.push(`At the top of the Lower Town, by the Cathedral's back gate, a Sylvari girl with ink on her hands and a book that's glowing through its wrapper runs straight into a Stoneborn Lantern sister with a hound. The book in the sister's bag glows back.`);
    txt.push(`You've both seen each other before: a girl with a book that burns without burning; a healer kneeling in grey snow.`,
      `"The Concord," says Ilsa. "It says the cage can be ended." "The Second Lantern," says Tamsin. "It says the grey can be healed." You look at each other. Two halves of one thing.`);
    return {title:'The Cathedral’s Back Gate', text:txt, choices:[
      {label:'Ilsa shows the Concord first.', act: () => { S.flags.firstShown = 'ilsa'; go('a21_square'); }},
      {label:'Tamsin shows the Second Lantern first.', act: () => { S.flags.firstShown = 'tamsin'; go('a21_square'); }}
    ]};
  }},
  a21_square:{ view: () => ({
    title:'Well Square',
    text:[
      `You reach Well Square from opposite sides at the same moment: two from the river, two from the hill. The Sarne cart is gone. The square is full of people, and the people are wrong.`,
      wellsGrey() ? `Grey water slops over the lip of the great well. The townsfolk who drank from it are standing in a ring around it, swaying, grey to the eyes.` : `Grey light leaks up out of the great well. The townsfolk who live around it are standing in a ring, swaying, grey to the eyes.`,
      `And among them, men in ash-grey robes with silver at their collars, singing.`,
      `<em>Your first fight together. The grey-touched townsfolk can be freed with Mend the Grey once they're weakened.</em>`
    ],
    choices:[{label:'Fight together', act: () => startCombat('a21_square')}]
  })},
  a21_squareWin:{
    enter(){ if (S.flags.squareDone) return; S.flags.squareDone = true; S.flags.squareFreed = (C ? C.units : []).filter(u => u.calmed && u.cleanse).length; },
    view: () => ({
      title:'Well Square',
      text:[
        `When it's over, the four of you are standing in the middle of Well Square, breathing hard, looking at each other.`,
        S.flags.squareFreed ? `${S.flags.squareFreed} of the townsfolk are sitting on the cobbles, ordinary again, crying. Tamsin goes from one to the next.` : `Tamsin kneels by each of the fallen anyway.`,
        `"So," says Wren eventually. "Who wants to go first?" Nobody does. Then everybody does, all at once, and it takes an hour, and at the end of it you're all sitting on the edge of the great well and nobody's holding a weapon.`,
        `"We need somewhere to sleep," says Kael. "Somewhere we can all fit."`
      ],
      choices:[
        {label:'"I’ve a room at the Gull’s Rest, on the Salt Quay. Near the barges."', act: () => { S.flags.base = 'gull'; chron('The four made the Gull’s Rest on the Salt Quay their base.'); toMap('a21_lower'); }},
        {label:'"The Pilgrims’ Hostel, under the Cathedral. The sisters ask no questions."', act: () => { S.flags.base = 'hostel'; chron('The four made the Pilgrims’ Hostel under the Cathedral their base.'); toMap('a21_lower'); }}
      ]
    })
  },

  // --- The Lower Town hub ---
  a21_base:{ view: () => {
    const f = S.flags, gull = f.base === 'gull';
    const t = [gull ? `The Gull's Rest has three rooms now instead of one, over the chandler's shop on the Salt Quay. The barges creak against the quay all night.` : `The Pilgrims' Hostel gives you a corner of the long room under the Cathedral's shadow, four pallets and a curtain. The sisters bring soup and don't ask.`,
      `Brannoc has set up in the corner with his bag. Hask has found a chair that fits him. Bracken has found Hask. Tobin is making tea for everyone, very carefully.`];
    return {title: gull ? 'The Gull’s Rest' : 'The Pilgrims’ Hostel', text:t, choices:[
      partyRest(gull ? 'You sleep to the creak of barges. Everyone’s health and spell points are restored.' : 'You sleep under the Cathedral. Everyone’s health and spell points are restored.'),
      {label:'Brannoc: buy 2 Healing Draughts (20 crowns)', req: () => S.gold >= 20, tag: S.gold >= 20 ? null : 'Needs 20 crowns', act: () => { S.gold -= 20; S.items.draught += 2; S.notice = 'Brannoc sells you 2 Healing Draughts.'; render(); }},
      !f.haskRead ? {label:'Hask: ask him to read up on ward-pillars in the Corvane libraries.', act: () => { f.haskRead = true; S.notice = 'Hask will have something by tomorrow.'; go('a21_hask'); }} : null,
      !f.cacheFound ? {label:'Bracken: let him smell the robes of the cultists from Well Square.', act: () => { f.cacheFound = true; chron('Bracken tracked the Ashen Hand from Well Square to a cache in the Lower Town.'); go('a21_bracken'); }} : null,
      !f.tobinTalk ? {label:'Tobin: ask what the dockhands are saying.', act: () => { f.tobinTalk = true; S.items.tonic += 1; go('a21_tobin'); }} : null,
      back()
    ].filter(Boolean)};
  }},
  a21_hask:{ view: () => ({
    title:'Hask',
    text:[`Hask comes back the next evening with ink on his enormous fingers. "Ward-pillars," he says. "Old Binding work. Seven of them round the Heartland stone like the legs of a table. They don't hold the Hollow. They hold the <em>stone</em>. Crack one, and the stone leans. Crack seven..." He doesn't finish.`, `"There's one under the Lower Town. Under Well Square."`],
    choices:[back()]
  })},
  a21_bracken:{ view: () => ({
    title:'Bracken',
    text:[`Bracken takes one sniff of the grey robe and is off, nose down, through the Lower Town at a pace that makes Tamsin run. He stops at a bricked-up cellar door behind a dyeworks and sits, looking pleased with himself.`],
    choices:[back()]
  })},
  a21_tobin:{ view: () => ({
    title:'Tobin',
    text:[`"Dockhands say the Sarne crates go to Lord Corrin's townhouse on Lantern Hill," Tobin says. "Not to a warehouse. To his house. They say he's got a cellar there you could lose a barge in." He hands you a Bitter Tonic. "And the chandler says if the Lower Town's going grey, you'll want these."`],
    choices:[back()]
  })},
  a21_court:{ enter(){ S.flags.metMarrow2 = true; }, view: () => {
    const mood = crownMood(), i = ilf();
    const t = [`The Envoys' Court is a quiet stone building on the hill, all corridors and clerks. Envoy Lysa Marrow sees you in a room full of maps, with ink on her cuffs and no sleep in her face.`];
    if (mood === 'warm') t.push(`"All four of you," she says, and for the first time since you've known of her she smiles. "Venn's book. Dunmore's shards. The fragment from the Thornwood. The barge. I have stood in front of the Council with every one of those and said: look. And now the people who brought them are standing in my office together." She leans forward. "Whatever you need from the Crown, ask me first."`);
    else if (mood === 'wary') t.push(`"Some of you have helped the Crown," she says, "and some of you have broken its quarantines and forced its gates. I don't know what to make of you yet." She folds her hands. "Tell me what you saw in Well Square, and I'll decide."`);
    else t.push(`She doesn't offer you chairs. "A thief of the Arcanum, a man who forced the Crown's water-gate, a Lantern sister who broke a quarantine," she says. "I've a desk full of warrants with your names on them. Give me one reason not to use them."`);
    t.push(`You tell her about Well Square. She goes pale. "There are pillars under the city," she says. "Old ones. The Council says they're a legend." She looks at you. "Find out what's under Well Square. Then come back and tell me."`);
    if (i.choice === 'report') t.push(echo('ilsa', 'Ilsa reported the Concord to Envoy Marrow in Act 1, and Marrow believed her.'));
    return {title:'The Envoys’ Court', text:t, choices:[back()]};
  }},
  a21_townhouse:{ view: () => {
    const f = S.flags;
    if (f.townDone) return {title:'Lantern Hill', text:[`Lord Corrin Sarne's townhouse is lit from cellar to roof, and very well guarded.`], choices:[back()]};
    return {title:'Lord Corrin’s Townhouse', text:[
      `Lord Corrin Sarne keeps a townhouse on Lantern Hill, a little below the palace: white stone, a garden wall, and carts at the back gate after midnight. ${f.tobinTalk ? 'Tobin was right: the Sarne crates come here.' : ''}`,
      `From the garden wall, you can watch the cellar door.`
    ], choices:[
      Object.assign({label:'Read the marks on the crates as they go in.', act: () => { f.townDone = true; f.sarneLead = 'marks'; S.notice = xpNoteParty(60); chron('At Lord Corrin’s townhouse you read the marks on the crates: Wardstone, bound for the Lower Town.'); go('a21_lead'); }}, chk('lore', 2)),
      Object.assign({label:'Slip into the garden and listen at the cellar window.', act: () => { f.townDone = true; f.sarneLead = 'listened'; S.notice = xpNoteParty(60); chron('At Lord Corrin’s townhouse you overheard where the shards are going.'); go('a21_lead'); }}, chk('stealth', 2)),
      {label:'Go over the wall and take a crate.', act: () => startCombat('a21_townhouse')},
      back()
    ]};
  }},
  a21_lead:{ view: () => ({
    title:'Lord Corrin’s Townhouse',
    text:[`${S.flags.sarneLead === 'marks' ? 'The crates are stencilled with the old Binding mark for the Heartland, and under it, in fresh paint: <em>W.S.</em>' : 'Through the cellar window, a Sarne steward is complaining: “Every night, down to Well Square, and the robed lot pay in nothing but promises.”'} Corrin Sarne isn't selling the shards anymore. He's giving them to the Ashen Hand, under Well Square.`],
    choices:[back()]
  })},
  a21_townWin:{ enter(){ S.flags.townDone = true; S.flags.sarneLead = 'crate'; S.gold += 40; chron('You raided Lord Corrin’s townhouse and took a crate of shards. House Sarne knows your faces now.'); }, view: () => ({
    title:'Lord Corrin’s Townhouse',
    text:[`The crate is full of shards stencilled <em>W.S.</em>: Well Square. Corrin Sarne is feeding the Ashen Hand. And by morning, every Sarne man in Corvane will know four faces. You also find 40 crowns, which seems fair.`],
    choices:[back()]
  })},
  a21_cache:{ view: () => S.flags.cacheDone ? ({
      title:'The Dyeworks Cellar', text:[`The cellar is empty now.`], choices:[back()]
    }) : ({
      title:'The Dyeworks Cellar',
      text:[`Behind the bricked-up cellar door Bracken found, steps go down into a dyeworks cellar the Ashen Hand has made into a chapel: ash on the floor, a crude grey altar, and the robed ones' supplies. And their dogs.`],
      choices:[{label:'Go in', act: () => startCombat('a21_cache')}, back('Leave it')]
    })
  },
  a21_cacheWin:{ enter(){ S.flags.cacheDone = true; S.items.draught += 2; S.items.aether += 2; S.gold += 30; S.notice = 'You find 2 Healing Draughts, 2 Aether Draughts and 30 crowns.'; }, view: () => ({
    title:'The Dyeworks Cellar',
    text:[`On the altar, a list in a careful hand: seven names of places. Six are struck through. The seventh is <em>Well Square</em>. Under it: <em>When the seventh leg is cut, the table falls.</em>`],
    choices:[back()]
  })},
  a21_under:{ view: () => {
    const f = S.flags;
    const t = [`Under Well Square, past the well-shaft and down a stair nobody has used for a century, is a round vault of old Binding stone, and in the middle of it, a pillar of black stone veined with silver, as thick as an oak, rising into the dark toward the hill above.`,
      `It's cracked from floor to ceiling. Grey light pours out of the crack, and grey water runs from it down into the wells. A thin man in ash-grey stands in front of it with his arms raised, singing, and the crack is singing back. Brother Gall, the well-keeper.`];
    if (f.haskRead) t.push(`Hask was right. It's one of the legs of the table.`);
    if (f.sarneLead) t.push(`Crates of Sarne shards stand open all around him.`);
    const ch = [];
    if (!f.wardRead){
      ch.push(Object.assign({label:'Kael puts his scarred hand on the pillar and listens.', act: () => { f.wardRead = 'kael'; go('a21_ward'); }}, chkBy('kael', 'wardlore', 1)));
      ch.push(Object.assign({label:'Wren puts her hand on the pillar the way the crate taught her.', act: () => { f.wardRead = 'wren'; go('a21_ward'); }}, chkBy('wren', 'wardlore', 1)));
    }
    ch.push({label:'Stop him', act: () => startCombat('a21_boss')}, {label:'Fall back and prepare', act: () => toMap('a21_lower')});
    t.push(`<em>This will be a hard fight. Gall's song greys everyone at once; the thing he is calling up out of the crack hits very hard.</em>`);
    return {title:'The Pillar Vault', text:t, choices:ch};
  }},
  a21_ward:{ view: () => ({
    title:'The Pillar Vault',
    text:[
      `${S.flags.wardRead === 'kael' ? 'Kael' : 'Wren'} puts a hand on the cold black stone, and the hum goes through ${S.flags.wardRead === 'kael' ? 'him' : 'her'} like a bell. For a moment, all four of you see it: the pillar, and six others, and the great stone they hold up under the palace, and the crack running through this one, and the thing on the other side of it, pressing.`,
      `And you see where Gall's song is weakest: in the gaps between the verses, when he breathes. Whatever he's calling up will come up weaker if you hit it then.`
    ],
    choices:[{label:'Stop him', act: () => startCombat('a21_boss')}, {label:'Fall back and prepare', act: () => toMap('a21_lower')}]
  })},
  a21_bossWin:{
    enter(){ if (S.flags.a21Boss) return; S.flags.a21Boss = true; },
    view: () => ({
      title:'The Pillar Vault',
      text:[
        `The thing from the crack comes apart into grey water and runs back into the stone. Gall goes down singing and stops singing. The vault is quiet except for the drip of grey water into the wells.`,
        `The pillar is still cracked. It isn't getting worse. It isn't getting better.`,
        `"Marrow," says Ilsa. "She said to come back and tell her." "Or we tell nobody," says Wren, "and we sit on this hole and wait for his friends to come back." Everyone looks at everyone else.`
      ],
      choices:[{label:'Decide together', go:'a21_choice'}]
    })
  },
  a21_choice:{ view: () => ({
    title:'The Pillar Vault',
    text:[
      `Tell Marrow, and the Crown's engineers can shore the pillar up before more grey reaches the wells. The Crown will trust you more. But the Ashen Hand will know the four of you are working with the Crown, and they'll go to ground.`,
      `Keep it secret, and watch it yourselves, and when the cult comes back to finish the job, you'll be waiting. But until then, the grey keeps seeping into the Lower Town's wells, and Tamsin's infirmary keeps filling.`
    ],
    choices:[
      {label:'Report it to Envoy Marrow.', act: () => { S.flags.pillar = 'told'; chron('You reported the cracked ward-pillar under Well Square to Envoy Marrow. Crown engineers shored it up.'); go('a21_told'); }},
      {label:'Keep it secret, and watch it yourselves.', act: () => { S.flags.pillar = 'watched'; chron('You kept the cracked ward-pillar under Well Square secret, and set a watch on it.'); go('a21_watched'); }}
    ]
  })},
  a21_told:{ view: () => ({
    title:'The Envoys’ Court',
    text:[`Marrow listens to all of it, then sends for the Crown's engineers before you've finished talking. By noon there are timbers and iron bands around the pillar under Well Square, and soldiers at the stair. "Thank you," she says. "You've given me something the Council can't call a legend."`, `By evening, the Ashen Hand's chapel under the dyeworks is empty. Wherever they've gone, they know who sent the soldiers.`],
    choices:[{label:'Continue', go:'a21_night'}]
  })},
  a21_watched:{ view: () => ({
    title:'Well Square',
    text:[`You take turns: two of you in the vault, two in the square, Bracken at the stair. Nobody comes. The grey keeps dripping into the wells, and every morning there are more people in the infirmary, and Tamsin comes back from it a little greyer in the face.`, `But somewhere, the Ashen Hand thinks its pillar is still waiting for it.`],
    choices:[{label:'Continue', go:'a21_night'}]
  })},
  a21_night:{ view: () => {
    const f = S.flags, k = kf(), w = wf(), t = tf(), i = ilf();
    const txt = [`That night, at ${f.base === 'gull' ? 'the Gull’s Rest' : 'the Pilgrims’ Hostel'}, the four of you sit up late with the companions asleep around you.`];
    txt.push(k.toldBran ? `Kael tells the others what he saw under Varrow, all of it, the way he told Brannoc. It's easier the second time.` : `Kael tells the others what he saw under Varrow. He never told Brannoc. Brannoc, pretending to sleep in the corner, hears it now.`);
    txt.push(w.metAunt ? `Wren tells them about her father: a Warden of the line, who came to this city twenty years ago to warn the Crown and never came back. Tamsin goes very still. "A Warden's blood," she says.` : `Wren doesn't say much. She never does. But she stays, which for Wren is a speech.`);
    txt.push(t.rite === 'aurel' ? `Tamsin admits her prayers come thin now. Ilsa takes her hand without saying anything.` : `Tamsin falls asleep sitting up, with the book of the Second Lantern open in her lap.`);
    txt.push(i.spokeWard ? `Ilsa says the Hollow knows her voice now, and she doesn't know what it will do with it. Nobody has an answer.` : `Ilsa reads the Concord's last page aloud, twice, and for once nobody tells her to stop reading.`);
    txt.push(`"So," says ${f.firstTrust === 'wren' ? 'Wren' : 'Kael'}. "We're doing this. Together." Nobody says no.`);
    return {title:'Late', text:txt, choices:[{label:'End of Act 2, chapter 1', act: () => {
      setQ('a21', 'done', 'The four met in Corvane’s Lower Town and became a party.');
      quest('keystone', 'The Keystone', 'Find out what the ward-pillars hold up under the palace, and why the Ashen Hand wants them cut.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  a21_lower:{
    title:'The Lower Town',
    blurb: () => `Tanneries, tenements and wells, at the bottom of a city that doesn't look down.`,
    w:340, h:260,
    nodes:[
      {id:'a21_base', label: 'Your base', x:50, y:210, sub:'Rest and the companions'},
      {id:'a21_court', label:'Envoys’ Court', x:70, y:70, sub:'Envoy Marrow', done: () => S.flags.metMarrow2},
      {id:'a21_townhouse', label:'Lantern Hill', x:180, y:40, sub:'Lord Corrin’s house', done: () => S.flags.townDone},
      {id:'a21_cache', label:'Dyeworks Cellar', x:180, y:200, sub:'Bracken’s find', open: () => S.flags.cacheFound, done: () => S.flags.cacheDone, lockText:'Ask Bracken at your base'},
      {id:'a21_under', label:'Under Well Square', x:290, y:130, sub:'Brother Gall', open: () => S.flags.metMarrow2, done: () => S.flags.a21Boss, lockText:'See Envoy Marrow first'}
    ],
    edges:[['a21_base','a21_court'],['a21_base','a21_cache'],['a21_court','a21_townhouse'],['a21_cache','a21_under'],['a21_townhouse','a21_under'],['a21_court','a21_under']]
  }
});

Object.assign(ENEMIES, {
  // Party fights: four heroes at level 8–9 deal ~200 damage a round between them, so party enemies carry several times a
  // solo enemy's health. Tuned by bot sim (party.psim): Well Square ~100% (it teaches), Gall 83–93% first-try.
  greytown:{name:'Grey-Touched Townsfolk', hp:160, dmg:[28,32], acc:70, dodge:2, armor:0, init:3, xp:40, hollow:true, cleanse:true, greyChance:20},
  ashblade:{name:'Ashen Hand Blade', hp:220, dmg:[30,36], acc:72, dodge:6, armor:2, init:5, xp:50, calm:true},
  ashsinger:{name:'Ashen Hand Singer', hp:150, dmg:[26,30], acc:74, dodge:6, armor:0, init:5, xp:50, ranged:true, row:'back', greyChance:25},
  ashhound:{name:'Ash Hound', hp:160, dmg:[28,34], acc:74, dodge:10, armor:0, init:7, xp:40, hollow:true, greyChance:20},
  sarnewatch:{name:'Sarne Housecarl', hp:220, dmg:[30,36], acc:72, dodge:4, armor:3, init:4, xp:55},
  sarnebow:{name:'Sarne Crossbowman', hp:150, dmg:[26,30], acc:74, dodge:6, armor:1, init:6, xp:55, ranged:true, row:'back'},
  gall:{name:'Brother Gall', hp:480, dmg:[30,36], acc:76, dodge:6, armor:1, init:6, xp:300, ranged:true, row:'back', greyChance:25,
    spec:{every:2, name:'Well-Song', windup:'{n} draws breath, and the grey water in the vault rises toward his voice.', mult:1.8, aoe:true, grey:2}},
  crackthing:{name:'The Thing in the Crack', hp:1100, dmg:[55,65], acc:72, dodge:0, armor:3, init:3, xp:300, hollow:true,
    spec:{every:3, name:'Pressing Through', windup:'{n} swells out of the crack, and the whole vault leans.', mult:2.0}},
  // A Wardlore reading showed where Gall's song is weakest
  crackthingWeak:{name:'The Thing in the Crack', hp:900, dmg:[50,58], acc:70, dodge:0, armor:3, init:3, xp:300, hollow:true,
    spec:{every:3, name:'Pressing Through', windup:'{n} swells out of the crack, faltering between the verses.', mult:1.8}}
});
Object.assign(COMBATS, {
  a21_square:{title:'Well Square', enemies:() => ['greytown', 'greytown', 'greytown', 'ashblade', 'ashsinger'], lethal:true, win:'a21_squareWin', back:'a21_square',
    intro:'The grey-touched townsfolk turn toward you as one. The Ashen Hand keep singing.'},
  a21_townhouse:{title:'Lord Corrin’s Garden', enemies:() => ['sarnewatch', 'sarnewatch', 'sarnewatch', 'sarnebow'], lethal:true, win:'a21_townWin', back:'a21_townhouse',
    intro:'The housecarls come out of the dark with lanterns and swords.'},
  a21_cache:{title:'The Dyeworks Cellar', enemies:() => ['ashhound', 'ashhound', 'ashblade', 'ashsinger'], lethal:true, flee:true, win:'a21_cacheWin', back:'a21_cache',
    intro:'The hounds come first.'},
  a21_boss:{title:'Brother Gall', lethal:true, win:'a21_bossWin', back:'a21_under',
    enemies:() => [S.flags.wardRead ? 'crackthingWeak' : 'crackthing', 'ashblade', 'ashblade', 'gall'],
    intro:'Gall sings, and something huge and grey pulls itself out of the crack.'}
});

HEROES.party.echoes = () => {
  const f = S.flags, e = [];
  const mood = crownMood();
  e.push(`Crown standing: ${mood}. ${mood === 'warm' ? 'Envoy Marrow trusts the four, and will speak for them.' : mood === 'wary' ? 'Envoy Marrow is waiting to see what the four are.' : 'The Crown has warrants with the four’s names on them.'}`);
  if (f.base) e.push(f.base === 'gull' ? 'The four have made the Gull’s Rest on the Salt Quay their base.' : 'The four have made the Pilgrims’ Hostel under the Cathedral their base.');
  if (f.pillar === 'told') e.push('The cracked ward-pillar under Well Square is shored up by Crown engineers. The Ashen Hand knows the four are with the Crown, and has gone to ground.');
  if (f.pillar === 'watched') e.push('The four are secretly watching the cracked ward-pillar under Well Square. The grey still seeps into the wells, and the cult doesn’t know it’s being watched.');
  if (f.sarneLead) e.push('Lord Corrin Sarne is giving Wardstone shards to the Ashen Hand.');
  if (f.cacheDone) e.push('The Ashen Hand has cut six of the seven ward-pillars. Well Square was the seventh.');
  return e;
};

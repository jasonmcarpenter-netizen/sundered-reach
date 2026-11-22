// ================= ACT 2, CHAPTER 3: THE ASHEN HAND =================
// Nine days before the Council sits, the four find the Ashen Hand in Corvane. Leads: Orrin (Tamsin freed him), the
// cult walking into the party's watch under Well Square (pillar 'watched'), or tracing them (Corrin's carts, Bracken,
// Wren's river), and Mother Quell's people, who always sell. The Ash Market, Corrin's warehouse (corrinProof), the
// Drowned Steps; then the Cinder Vaults: the ossuary of converts, the chapter room (the plan: cut the seventh pillar's
// root on Council night; Corrin pays for it), and the Pale Cantor, the new Ashen Voice since Tamsin killed Velka.
// Choice: handPlan = 'struck' (bring the Vaults down now) or 'trap' (let them come on Council night); then
// evidenceTo = 'marrow' (+1 Crown standing) or 'kept'. Scene IDs use the prefix a23_. Party flags: lead, quellFavour,
// corrinProof, stepsDone, handFreed, ilsaListened, a23Boss, handPlan, evidenceTo. Placeholder names: the Ash Market,
// the Cinder Vaults, the Kindled, the Drowned Steps, the Pale Cantor and the Cinder Father (the cult's top leader).
HEROES.party.chapters[3] = {title:'The Ashen Hand', start:'a23_intro'};

const kindled = () => tf().orrin !== 'freed';
const a23Base = () => S.flags.base === 'gull' ? 'the Gull’s Rest' : 'the Pilgrims’ Hostel';

Object.assign(SCENES, {
  a23_intro:{
    enter(){ quest('ashenhand', 'The Ashen Hand', 'Find the Ashen Hand before they finish what they started, and make a plan for the Council.'); },
    view: () => {
      const f = S.flags, mood = crownMood();
      const t = [];
      if (f.keystone === 'released') t.push(`Every night since the Keystone, the city shudders. Not much: a cup walking across a table, a crack opening in a cellar wall in the Lower Town. Down by the wells, people in grey have started singing again, louder. To them it sounds like a god waking up.`);
      else t.push(`Since Ilsa's Word went into the Keystone, Corvane has been quiet. Too quiet, Wren says. And in Tamsin's infirmary, the grey-sick have started to murmur in their sleep. In Ilsa's voice. Her own words, in her own accent, out of strangers' mouths.`);
      t.push(mood === 'cold' ? `Tobin brings the other news from the quay: the Council sits in nine days. Every lord in the Reach is coming up the river for it.` : `A note from Envoy Marrow, in her own hand: <em>The Council sits in nine days. Whatever you mean to bring before it, bring it then.</em>`,
        `Nine days. And somewhere in this city, the Ashen Hand is still at work on the seventh pillar.`);
      const ch = [];
      if (f.keystone === 'bound' && !f.ilsaListened) ch.push({label:'Ilsa sits by a murmuring patient and listens to her own voice.', act: () => { f.ilsaListened = true; S.notice = xpNoteParty(80); chron('Ilsa listened to the Hollow speaking in her voice, and it listened back.'); go('a23_listen'); }});
      ch.push({label:'Go looking for the Ashen Hand', act: () => toMap('a23_market')});
      return {title:'Nine Days', text:t, choices:ch};
    }
  },
  a23_listen:{ view: () => ({
    title:'In Her Own Voice',
    text:[`The woman in the bed is a tanner's wife, grey to the collarbone. She doesn't open her eyes. "<em>Root</em>," she says, in Ilsa's voice, with Ilsa's careful vowels. "<em>Not the leg. The root. When the hill is full of lords. Root, root, root.</em>"`,
      `Then the voice stops, and something on the other end of it turns, the way a head turns. Ilsa feels it notice her, all the way down. She takes her hand off the bed very slowly.`,
      `"They're going to cut it from below," she says. "On Council night."`],
    choices:[{label:'Go looking for the Ashen Hand', act: () => toMap('a23_market')}]
  })},

  // --- The Ash Market ---
  a23_base:{ view: () => {
    const f = S.flags;
    return {title: f.base === 'gull' ? 'The Gull’s Rest' : 'The Pilgrims’ Hostel', text:[
      `Home, such as it is. Brannoc has his bag open. Tobin has the kettle on. Bracken is asleep across the doorway, where nobody can come in without stepping on him.`,
      f.handPlan === 'trap' ? `Tamsin comes back from the infirmary later every night.` : `Hask is reading by the window with his lips moving.`
    ], choices:[
      partyRest(`You sleep at ${a23Base()}. Everyone’s health and spell points are restored.`),
      {label:'Brannoc: buy 2 Healing Draughts (20 crowns)', req: () => S.gold >= 20, tag: S.gold >= 20 ? null : 'Needs 20 crowns', act: () => { S.gold -= 20; S.items.draught += 2; S.notice = 'Brannoc sells you 2 Healing Draughts.'; render(); }},
      back()
    ].filter(Boolean)};
  }},
  a23_leads:{ view: () => {
    const f = S.flags, t = tf();
    if (f.lead) return {title:'The Ash Market', text:[`Rag-sellers, grey charms, and lanterns hung on poles. You know where the Hand is now.`], choices:[back()]};
    const txt = [`The Ash Market sets up after dark in the burned-out square below the tanneries: rag-sellers, bone-carvers, women selling little grey charms "against the sickness". Half the Lower Town comes here. Somebody here knows where the Ashen Hand sleeps.`];
    const ch = [];
    if (t.orrin === 'freed'){
      txt.push(`At a charm-seller's stall, a thin man in a patched coat looks up and goes white. He knows Tamsin. Tamsin knows him: Deacon Orrin, whom she healed of the grey on a mountain and let go.`, echo('tamsin', 'Tamsin healed Deacon Orrin at Kell’s Rest and let him go on his oath to leave the Ashen Hand.'));
      ch.push({label:'Tamsin: “You kept your oath, Orrin. Help me keep mine.”', act: () => { f.lead = 'orrin'; S.notice = xpNoteParty(80); chron('Deacon Orrin, who Tamsin freed in Act 1, showed the four the way to the Ashen Hand.'); go('a23_orrin'); }});
    } else txt.push(`There's nobody here who owes any of you a thing. Since Orrin hanged at Kell's Rest, the Hand in Corvane has belonged to its zealots, the ones who call themselves the Kindled.`, echo('tamsin', 'Tamsin sent Deacon Orrin down to Kell’s Rest for judgment. They hanged him.'));
    if (f.pillar === 'watched') ch.push({label:'Go down to your watch under Well Square. Bracken says someone’s been at the stair.', go:'a23_watch'});
    else {
      if (f.sarneLead) ch.push({label:'Follow Corrin’s carts after midnight.', act: () => { f.lead = 'carts'; S.notice = xpNoteParty(60); go('a23_traced'); }});
      if (f.cacheDone) ch.push({label:'Give Bracken the robes from the dyeworks cellar again.', act: () => { f.lead = 'bracken'; S.notice = xpNoteParty(60); go('a23_traced'); }});
      if (wf().barge) ch.push({label:'Wren: watch the river for grey robes coming ashore.', act: () => { f.lead = 'river'; S.notice = xpNoteParty(60); go('a23_traced'); }});
    }
    const q = wf().quellHow, price = q === 'stole' ? 300 : 200;
    txt.push(`And at the back of the market, under an awning, a woman with Mother Quell's brand on her wrist is selling something that isn't charms.`);
    if (q !== 'fought') ch.push({label:`Buy what Quell’s people know (${price} crowns).`, req: () => S.gold >= price, tag: S.gold >= price ? null : `Needs ${price} crowns`, act: () => { S.gold -= price; f.lead = 'quell'; f.quellPaid = true; go('a23_quell'); }});
    ch.push({label:'Owe Mother Quell a favour for it.', act: () => { f.lead = 'quell'; f.quellFavour = true; chron('The four owe Mother Quell a favour, for the way to the Ashen Hand.'); go('a23_quell'); }});
    ch.push(back());
    return {title:'The Ash Market', text:txt, choices:ch};
  }},
  a23_orrin:{ view: () => ({
    title:'Deacon Orrin',
    text:[`Orrin takes you behind the stall, among the sacks. His hands shake. "I kept my oath," he says. "I sell charms that don't work to people who want hope. It's honest, almost."`,
      `"They're under the Ash Market. The old cinder vaults, where the city burned its dead in plague years. Down the coal-chute behind the bone-carver." He swallows. "There are good people down there, Sister. People like I was. Frightened. If you go in swinging, you'll kill them. Let me come. Some of them will listen to me."`],
    choices:[back()]
  })},
  a23_watch:{ view: () => ({
    title:'Under Well Square',
    text:[`Your watch has been patient. Tonight it pays. Down the old stair, by lantern-light, come six of the Hand with picks and chisels and a cantor singing them on, straight to the cracked pillar. Straight into you.`],
    choices:[{label:'Spring the trap', act: () => startCombat('a23_watch')}, back('Not yet')]
  })},
  a23_watchWin:{ enter(){ if (S.flags.lead) return; S.flags.lead = 'watch'; chron('The Ashen Hand walked into the four’s watch under Well Square. The cantor they caught gave up the way to the Cinder Vaults.'); }, view: () => ({
    title:'Under Well Square',
    text:[`The cantor is the only one left on his feet, and not for long. He's very young under the ash, and he talks the moment Wren's knife touches his throat: the Cinder Vaults, under the Ash Market, down the coal-chute behind the bone-carver's stall.`,
      `"You're too late anyway," he says. "Root, not leg. On the night the hill is full."`],
    choices:[back()]
  })},
  a23_traced:{ view: () => {
    const f = S.flags, w = wf();
    const t = f.lead === 'carts' ? `Corrin's carts don't go to Well Square any more. Three nights running, they go to the Ash Market, and the crates go down a coal-chute behind a bone-carver's stall.`
      : f.lead === 'bracken' ? `Bracken takes one long sniff of the old robes and sets off across the Lower Town without stopping, nose down, to a bone-carver's stall at the back of the Ash Market, and sits down in front of the coal-chute behind it.`
      : w.barge === 'sunk' ? `Wren follows the grey downstream, the slick on the water from the barge she sank, to the old burning-steps below the Ash Market, and the robed figures wading ashore there at dusk. They go up a coal-chute behind a bone-carver's stall.`
      : `Wren watches the river from a roof for two nights. On the second, a skiff comes in to the old burning-steps below the Ash Market: river-priests in ash-grey, the ones who got away from the Grey Heron. They go up a coal-chute behind a bone-carver's stall.`;
    return {title:'The Ash Market', text:[t, `Under the Ash Market are the old cinder vaults, where the city burned its dead in plague years.`].concat(f.lead === 'river' ? [echo('wren', w.barge === 'sunk' ? 'Wren sank the Grey Heron. Its grey runs downriver into Corvane.' : 'Wren steered the Grey Heron to the Crown. Some of its river-priests got away.')] : []), choices:[back()]};
  }},
  a23_quell:{ view: () => {
    const f = S.flags, q = wf().quellHow;
    const t = [q === 'fought' ? `"Mother Quell remembers you, Wren," says the woman under the awning. "She doesn't sell to people who break her men's arms. But she'll trade."` : q === 'stole' ? `"Mother Quell remembers you, Wren," says the woman under the awning. "And her marker that walked off. The price has gone up."` : `"Mother Quell sends her regards, Wren," says the woman under the awning. "You paid your debt. She likes that in a person."`];
    t.push(`"The cinder vaults, under your feet. Down the coal-chute behind the bone-carver."`);
    if (f.quellFavour) t.push(`She smiles. "And one day, Mother Quell will ask you for something. You'll say yes."`);
    return {title:'Quell’s People', text:t, choices:[back()]};
  }},
  a23_warehouse:{ view: () => {
    const f = S.flags, k = kf();
    if (f.wareDone) return {title:'Corrin’s Warehouse', text:[`The warehouse on the Salt Quay is locked up tight now, with twice the guard.`], choices:[back()]};
    const t = [`Lord Corrin Sarne has a warehouse on the Salt Quay, three doors down from Number Nine. Its ledgers are kept in an office at the back.`];
    t.push(k.hoard === 'exposed' ? `Since Kael dragged Number Nine's cellar into the street, Sarne's men here are jumpy: double watches, dogs, lanterns all night.` : k.hoard === 'quiet' ? `Since the Crown took Number Nine quietly and Corrin walked, Sarne's men here are bored and careless.` : `The watch is ordinary.`);
    if (k.hoard) t.push(echo('kael', k.hoard === 'exposed' ? 'Kael exposed House Sarne’s shard hoard to the whole city.' : 'Kael handed House Sarne’s shard hoard to the Crown quietly. Corrin walked.'));
    const ch = [];
    if (k.hoard !== 'exposed') ch.push(Object.assign({label:'Walk in like clerks and read the ledgers in the office.', act: () => { f.wareDone = true; f.corrinProof = 'ledger'; S.notice = xpNoteParty(80); go('a23_proof'); }}, chk('lore', 2)));
    ch.push(Object.assign({label:'Go in over the roof while the watch changes.', act: () => { f.wareDone = true; f.corrinProof = 'ledger'; S.notice = xpNoteParty(80); go('a23_proof'); }}, chk('stealth', 2)));
    ch.push({label:'Go in through the front.', act: () => startCombat('a23_warehouse')}, back());
    return {title:'Corrin’s Warehouse', text:t, choices:ch};
  }},
  a23_proof:{ view: () => ({
    title:'Corrin’s Warehouse',
    text:[`In the ledger, in a steward's hand, three months of deliveries: shards, by the crate, "to the Ash Market, for the Brothers." And at the foot of every page, approving the payment, a signature you've seen on a contract and a warrant: <em>C. Sarne.</em>`,
      `It's not everything. But it's his name, in his own hand, next to theirs.`],
    choices:[back()]
  })},
  a23_wareWin:{ enter(){ if (S.flags.wareDone) return; S.flags.wareDone = true; S.flags.corrinProof = 'ledger'; S.gold += 40; }, view: () => ({
    title:'Corrin’s Warehouse',
    text:[`When the housecarls are down, you take the ledger from the back office, and 40 crowns from the strongbox, which seems fair. In the ledger: three months of shards, "to the Ash Market, for the Brothers", every page signed <em>C. Sarne</em>.`, `Corrin will know by morning who took it.`],
    choices:[back()]
  })},
  a23_steps:{ view: () => S.flags.stepsDone ? ({title:'The Drowned Steps', text:[`The old burning-steps are empty, and the water lapping at them is only water.`], choices:[back()]}) : ({
    title:'The Drowned Steps',
    text:[`Below the Ash Market, worn stone steps go down into the river, where the city once floated its ashes out to sea. At dusk, skiffs come in here: river-priests of the Ashen Hand, with their lamps and their hymns, bringing the drowned grey up out of the water for the Vaults.`,
      wf().barge === 'sunk' ? `Since the Grey Heron sank, the river here is thick with grey, and the priests are fat on it.` : `There are fewer of them since the Grey Heron. But there are some.`,
      `If they're dealt with here, they won't be singing beside whatever waits below.`],
    choices:[{label:'Meet them on the steps', act: () => startCombat('a23_steps')}, back('Leave them')]
  })},
  a23_stepsWin:{ enter(){ if (S.flags.stepsDone) return; S.flags.stepsDone = true; S.items.aether += 1; S.items.tonic += 1; S.notice = 'You find an Aether Draught and a Bitter Tonic among the priests’ things.'; }, view: () => ({
    title:'The Drowned Steps',
    text:[`The last priest goes into the river, and his lamp goes out on the water. The Vaults will have one less voice tonight.`],
    choices:[back()]
  })},

  // --- The Cinder Vaults ---
  a23_cistern:{ view: () => ({
    title:'The Dry Cistern',
    text:[`An old cistern off the coal-chute, dry for a century, with a door that bars from the inside. ${S.flags.lead === 'orrin' ? 'Orrin keeps watch at it without being asked.' : 'Bracken keeps watch at it.'}`],
    choices:[partyRest('You rest in the dry cistern. Everyone’s health and spell points are restored.'), back()].filter(Boolean)
  })},
  a23_ossuary:{ view: () => {
    const f = S.flags;
    if (f.ossuaryDone) return {title:'The Ossuary', text:[f.handFreed ? `The ossuary is quiet. ${f.handFreed} of the Hand's converts are on their way up to ${a23Base()}, where Tamsin's patients are.` : `The ossuary is quiet now.`], choices:[back()]};
    const t = [`The ossuary is a long low hall where the city stacked the bones of the plague dead: skulls in rows, femurs in bundles, to the ceiling. Among them, on pallets, sleep the Ashen Hand's converts: forty or fifty people, grey to the eyes, rising one by one as your lantern-light reaches them.`];
    t.push(kindled() ? `The Kindled have been at them. There's nothing left in their eyes to talk to.` : `Some of them look frightened. Some of them look like Orrin did, on the mountain.`);
    const ch = [];
    if (f.lead === 'orrin') ch.push(Object.assign({label:'Orrin steps into the light and talks to them, one by one.', act: () => { f.ossuaryDone = true; f.handFreed = 12; S.notice = xpNoteParty(100); chron('In the Cinder Vaults, Orrin talked twelve of the Ashen Hand’s converts into walking out with Tamsin.'); go('a23_talked'); }}, chk('leadership', 2)));
    ch.push({label:'Fight your way through. Free the ones you can.', act: () => startCombat('a23_ossuary')}, back());
    t.push(`<em>Grey converts can be freed with Mend the Grey once they're weakened.</em>`);
    return {title:'The Ossuary', text:t, choices:ch};
  }},
  a23_talked:{ view: () => ({
    title:'The Ossuary',
    text:[`It takes an hour. Orrin goes from pallet to pallet, crouching, saying names, saying "I was here too." Tamsin goes behind him with her hands full of light. Twelve of them get up and follow you back toward the chute, crying, ordinary. The rest turn their backs.`,
      `"They'll be witnesses," Ilsa says quietly. "Before the Council. Twelve people who were inside."`],
    choices:[back()]
  })},
  a23_ossWin:{ enter(){ if (S.flags.ossuaryDone) return; S.flags.ossuaryDone = true; S.flags.handFreed = (C ? C.units : []).filter(u => u.calmed && u.cleanse).length; }, view: () => ({
    title:'The Ossuary',
    text:[S.flags.handFreed ? `${S.flags.handFreed} of the converts are sitting among the bones when it's over, themselves again. Tamsin sends them up the chute to ${a23Base()}. They'll be witnesses, if anyone will listen.` : `When it's over, nobody in the ossuary is themselves again. Tamsin kneels among them anyway.`],
    choices:[back()]
  })},
  a23_chapter:{ enter(){ if (!S.flags.planRead){ S.flags.planRead = true; S.notice = xpNoteParty(100); chron('In the Cinder Vaults, the four found the Ashen Hand’s plan: cut the seventh pillar’s root on Council night. Corrin Sarne pays for it.'); } }, view: () => {
    const f = S.flags;
    const t = [`The chapter room is the old furnace-hall, cold now, its great hearth swept and an altar of shards built in it. On the table: maps of the pillars, seven of them, six crossed out. Lists of names. Letters.`,
      `It's all here. The Hand believes the Hollow is a god, and the Binding a cage built by thieves to keep it from the world. Six legs of the table are cut. The seventh, under Well Square, ${f.pillar === 'told' ? 'is banded with Crown iron, so they won\'t cut the leg' : 'is watched, so they won\'t cut the leg'}. They'll cut the <em>root</em>, from below, through the old drains, on the night the Council sits, when every soldier in Corvane is on the hill guarding lords.`,
      `And the Keystone will fall.`,
      `The letters are from a steward of House Sarne. Money, shards, a promise: <em>When the Council House falls in, my lord will be the only lord left standing in Corvane, with the King's seat empty and the city on its knees. He will remember who helped.</em>`];
    if (f.ilsaListened) t.push(`"Root," says Ilsa. "Not the leg. I heard it in my own voice."`);
    if (f.keystone === 'released') t.push(`"With no anchor in the stone," says Ilsa, "it won't take much."`);
    t.push(`From the gallery above the hearth, someone is watching you: a tall figure in a coat of ash-grey and silver, face hidden. When Kael moves, it moves faster, up a stair and away. The cult's own people call him the Cinder Father. He is not the one who will stand and fight.`);
    return {title:'The Chapter Room', text:t, choices:[back()]};
  }},
  a23_voice:{ view: () => {
    const f = S.flags, ch3 = [];
    const t = [`Past the chapter room, the vaults open into the old burning-pit: a round well of black stone, forty feet across, with the city's ash a yard deep on its floor. A woman in white stands in the middle of it, singing, and the ash rises around her ankles like water.`,
      `"Velka was my teacher," she says, without stopping her song. "A Lantern sister killed her on a mountain. Is that the one?" She looks straight at Tamsin. "I am the Voice now."`,
      echo('tamsin', 'Tamsin killed Velka, the Ashen Voice, at the Fourth Ward in Hearthdeep.')];
    if (f.keystone === 'bound') t.push(`And when she sings the next line, it's in Ilsa's voice.`);
    if (f.lead === 'orrin') t.push(`Orrin, behind you: "One of her choir is my sister's boy. Leave me the boy."`);
    if (!f.stepsDone) t.push(`Under her song, faintly, you can hear the river-priests' hymn, feeding it.`);
    t.push(`<em>A hard fight. The Pale Cantor's hymn greys everyone at once; her bodyguard is Hollow-bound and hits hard.</em>`);
    ch3.push({label:'Stop her', act: () => startCombat('a23_boss')}, {label:'Fall back and prepare', act: () => toMap('a23_vaults')});
    return {title:'The Burning-Pit', text:t, choices:ch3};
  }},
  a23_bossWin:{
    enter(){ if (S.flags.a23Boss) return; S.flags.a23Boss = true; },
    view: () => ({
      title:'The Burning-Pit',
      text:[`The Pale Cantor's song breaks off in the middle of a word, and the ash settles all at once, like snow. The Hollow-bound thing falls apart into it. The pit is quiet.`,
        `Above you, in the Vaults, the Ashen Hand is running: the chapter room, the ossuary, the furnace stores where the shards are stacked, crates and crates of them, enough to bring down a hill.`,
        `"Now," says Kael. "We can end it now."`],
      choices:[{label:'Decide together', go:'a23_choice'}]
    })
  },
  a23_choice:{ view: () => ({
    title:'The Cinder Vaults',
    text:[
      `Bring it down now: fire the furnace stores, and the shards and the Vaults go up together. The Hand is broken, tonight, and the grey stops coming into the wells. But the chapter room burns with everything else, the letters and the maps. You'll go before the Council with ${S.flags.corrinProof ? 'Corrin’s ledger and little else' : 'almost nothing'}, and the Cinder Father is still out there.`,
      `Or leave it standing. Take the letters, and let the Hand think its plan is safe. On Council night, be waiting at the root, and catch Sarne's money and the Hand's knives in the act, in front of everyone. Proof no Council can wave away. But for nine days the grey keeps rising in the Lower Town's wells, and on Council night you'll be needed in two places at once.`
    ],
    choices:[
      {label:'Bring it down now.', act: () => { S.flags.handPlan = 'struck'; chron('The four burned the Cinder Vaults and the Ashen Hand’s shards. The cult is broken, but the proof burned too, and the Cinder Father escaped.'); go('a23_struck'); }},
      {label:'Leave it standing, and set a trap for Council night.', act: () => { S.flags.handPlan = 'trap'; chron('The four left the Cinder Vaults standing, took the Hand’s letters, and will be waiting at the seventh pillar’s root on Council night.'); go('a23_trap'); }}
    ]
  })},
  a23_struck:{ view: () => ({
    title:'The Cinder Vaults',
    text:[`Wren lights the first crate. You're up the coal-chute before the second one goes. Behind you the Ash Market jumps as the ground under it heaves, and a column of grey-white smoke goes up into the night that they can see from the palace.`,
      `By morning the Lower Town's wells run clearer than they have in a month. By evening, Corrin Sarne is telling anyone who will listen that he's never heard of any cult in his life, and there's nothing left in the Vaults to prove him wrong.`],
    choices:[{label:'Continue', go:'a23_evidence'}]
  })},
  a23_trap:{ view: () => ({
    title:'The Cinder Vaults',
    text:[`You take the letters and the maps, and leave the rest exactly as it was. Orrin's people, or the cantor, or Quell's, will put word about that the Voice was killed by Crown thieves after silver. The Hand will mourn her, and keep working.`,
      `Every morning for the next nine days, the wells of the Lower Town come up a little greyer, and Tamsin comes home from the infirmary a little later, and says a little less.`],
    choices:[{label:'Continue', go:'a23_evidence'}]
  })},
  a23_evidence:{ view: () => {
    const f = S.flags, mood = crownMood();
    const have = [f.corrinProof ? 'Corrin’s ledger' : null, f.handPlan === 'trap' ? 'the Hand’s letters' : null, f.handFreed ? `${f.handFreed} witnesses` : null].filter(Boolean);
    return {title:'The Envoys’ Court', text:[
      `Envoy Marrow ${mood === 'cold' ? 'agrees to see you, which surprises everyone' : 'sees you at once'}. She looks at what you've brought${have.length ? ': ' + have.join(', ') : ''}. "Give it to me," she says. "I'll keep it safe until the Council sits. I'll put it in front of them myself. They'll listen to the Crown's envoy."`,
      `Or you could keep it, and put it in front of the Council yourselves.`
    ], choices:[
      {label:'Give the evidence to Envoy Marrow.', act: () => { f.evidenceTo = 'marrow'; chron('The four gave their evidence against Corrin Sarne to Envoy Marrow, to keep until the Council sits.'); go('a23_end'); }},
      {label:'Keep it. You’ll put it before the Council yourselves.', act: () => { f.evidenceTo = 'kept'; chron('The four kept their evidence to put before the Council themselves. Envoy Marrow was not pleased.'); go('a23_end'); }}
    ]};
  }},
  a23_end:{ view: () => {
    const f = S.flags;
    const txt = [f.evidenceTo === 'marrow' ? `Marrow locks it in an iron box in her office, and thanks you, and means it.` : `"As you like," says Marrow, very coolly. You take it back to ${a23Base()} and Wren sleeps with it under her pillow.`];
    txt.push(`Eight days now. On the last night, the Council sits, and every lord in the Reach will be on the hill.`,
      f.handPlan === 'trap' ? `"Two places at once," says Kael. "The Council House and the root." Nobody says which of them goes where.` : `"Just the one place, then," says Kael. "The Council House." Nobody believes it'll be that simple.`);
    if (f.quellFavour) txt.push(`And somewhere in the city, Mother Quell is waiting to ask for her favour.`);
    return {title:'Eight Days', text:txt, choices:[{label:'End of Act 2, chapter 3', act: () => {
      setQ('ashenhand', 'done', f.handPlan === 'struck' ? 'The four burned the Cinder Vaults. The Ashen Hand in Corvane is broken; its leader escaped.' : 'The four found the Ashen Hand’s plan, and will be waiting for it on Council night.');
      quest('council', 'The Council of Corvane', 'Bring what you know before the Council of Corvane, and stop the seventh pillar falling.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  a23_market:{
    title:'The Ash Market',
    blurb: () => `The Lower Town after dark, nine days before the Council sits.`,
    w:340, h:260,
    nodes:[
      {id:'a23_base', label:'Your base', x:50, y:210, sub:'Rest and supplies'},
      {id:'a23_leads', label:'The Ash Market', x:120, y:90, sub:'Find the Ashen Hand', done: () => S.flags.lead},
      {id:'a23_warehouse', label:'Corrin’s Warehouse', x:60, y:40, sub:'On the Salt Quay', done: () => S.flags.wareDone},
      {id:'a23_steps', label:'The Drowned Steps', x:260, y:220, sub:'Where the river-priests land', done: () => S.flags.stepsDone},
      {id:'a23_down', label:'The Coal-Chute', x:280, y:70, sub:'Down to the Vaults', open: () => S.flags.lead, lockText:'Find the Ashen Hand first'}
    ],
    edges:[['a23_base','a23_leads'],['a23_base','a23_steps'],['a23_leads','a23_warehouse'],['a23_leads','a23_down'],['a23_steps','a23_down']]
  },
  a23_vaults:{
    title:'The Cinder Vaults',
    blurb: () => `Where Corvane burned its dead, and the Ashen Hand keeps its god.`,
    w:340, h:260,
    nodes:[
      {id:'a23_cistern', label:'Dry Cistern', x:50, y:210, sub:'Rest'},
      {id:'a23_ossuary', label:'The Ossuary', x:100, y:70, sub:'The converts', done: () => S.flags.ossuaryDone},
      {id:'a23_chapter', label:'The Chapter Room', x:240, y:50, sub:'The Hand’s plans', open: () => S.flags.ossuaryDone, done: () => S.flags.planRead, lockText:'Get through the ossuary first'},
      {id:'a23_voice', label:'The Burning-Pit', x:280, y:200, sub:'The Voice', open: () => S.flags.planRead, done: () => S.flags.a23Boss, lockText:'Find the chapter room first'},
      {id:'a23_up', label:'Up the Chute', x:170, y:220, sub:'Back to the market'}
    ],
    edges:[['a23_cistern','a23_ossuary'],['a23_ossuary','a23_chapter'],['a23_chapter','a23_voice'],['a23_cistern','a23_up'],['a23_up','a23_voice']]
  }
});
SCENES.a23_down = {view: () => ({title:'The Coal-Chute', text:[`Behind the bone-carver's stall, a coal-chute goes down into the dark, and warm air comes up it that smells of old smoke.`], choices:[{label:'Down into the Vaults', act: () => toMap('a23_vaults')}, back()]})};
SCENES.a23_up = {view: () => ({title:'The Coal-Chute', text:[`The chute goes up to the Ash Market.`], choices:[{label:'Up to the Ash Market', act: () => toMap('a23_market')}, back()]})};

Object.assign(ENEMIES, {
  // Party enemies, tuned for a level 16 party (parties reach A2·3 at about 14–18)
  kindler:{name:'Kindled Zealot', hp:400, dmg:[42,48], acc:74, dodge:6, armor:2, init:6, xp:55},
  handcantor:{name:'Ashen Hand Cantor', hp:270, dmg:[38,42], acc:74, dodge:6, armor:0, init:5, xp:55, ranged:true, row:'back', greyChance:25},
  handconvert:{name:'Grey Convert', hp:300, dmg:[38,42], acc:70, dodge:2, armor:0, init:3, xp:45, hollow:true, cleanse:true, greyChance:20},
  sarnecarl:{name:'Sarne Housecarl', hp:400, dmg:[42,48], acc:74, dodge:4, armor:3, init:4, xp:60},
  sarnebolt:{name:'Sarne Crossbowman', hp:270, dmg:[38,42], acc:74, dodge:6, armor:1, init:6, xp:60, ranged:true, row:'back'},
  steppriest:{name:'River-Priest', hp:380, dmg:[40,46], acc:74, dodge:4, armor:1, init:5, xp:60, greyChance:25},
  hymnist:{name:'River Cantor', hp:300, dmg:[38,42], acc:74, dodge:6, armor:0, init:5, xp:70, ranged:true, row:'back',
    spec:{every:3, name:'Drowning Hymn', windup:'{n} sings, and river water rises out of the stones toward you.', mult:1.5, aoe:true}},
  choir:{name:'Ember Choir', hp:240, dmg:[36,40], acc:74, dodge:6, armor:0, init:5, xp:60, ranged:true, row:'back', greyChance:25},
  ashbound:{name:'The Hollow-Bound', hp:820, dmg:[56,64], acc:74, dodge:2, armor:3, init:4, xp:200, hollow:true,
    spec:{every:3, name:'Ash Fall', windup:'{n} raises both arms, and the ash on the floor rises with them.', mult:2.0}},
  palecantor:{name:'The Pale Cantor', hp:1050, dmg:[52,60], acc:78, dodge:8, armor:1, init:7, xp:400, ranged:true, row:'back', greyChance:25,
    spec:{every:2, name:'Ashen Hymn', windup:'{n} draws breath, and the ash in the pit rises to her voice.', mult:2.4, aoe:true, grey:2}},
  // The river-priests on the Drowned Steps were dealt with: no river under her song
  paleWeak:{name:'The Pale Cantor', hp:1050, dmg:[52,60], acc:78, dodge:8, armor:1, init:7, xp:400, ranged:true, row:'back', greyChance:25,
    spec:{every:2, name:'Ashen Hymn', windup:'{n} draws breath, but without the river under it her song comes up thin.', mult:1.8, aoe:true, grey:2}},
  // Orrin's sister's boy, who hesitates
  choirDoubt:{name:'Hesitant Chorister', hp:120, dmg:[28,32], acc:74, dodge:6, armor:0, init:5, xp:30, ranged:true, row:'back'}
});
Object.assign(COMBATS, {
  a23_watch:{title:'Under Well Square', level:16, lethal:true, win:'a23_watchWin', back:'a23_watch',
    enemies:() => ['kindler', 'kindler', 'kindler', 'handcantor'], intro:'The Hand drop their picks and draw knives.'},
  a23_warehouse:{title:'Corrin’s Warehouse', level:16, lethal:true, win:'a23_wareWin', back:'a23_warehouse',
    enemies:() => ['sarnecarl', 'sarnecarl', 'sarnebolt'].concat(kf().hoard === 'exposed' ? ['sarnecarl'] : []), intro:'The housecarls come out of the dark with lanterns.'},
  a23_steps:{title:'The Drowned Steps', level:16, lethal:true, flee:true, win:'a23_stepsWin', back:'a23_steps',
    enemies:() => ['steppriest', 'steppriest', 'hymnist'].concat(wf().barge === 'sunk' ? ['steppriest'] : []), intro:'The priests lift their lamps, and the river lifts with them.'},
  a23_ossuary:{title:'The Ossuary', level:16, lethal:true, win:'a23_ossWin', back:'a23_ossuary',
    enemies:() => kindled() ? ['handconvert', 'handconvert', 'kindler', 'kindler', 'handcantor'] : ['handconvert', 'handconvert', 'handconvert', 'kindler', 'handcantor'],
    intro:'The converts rise from their pallets as one.'},
  a23_boss:{title:'The Pale Cantor', level:16, lethal:true, win:'a23_bossWin', back:'a23_voice',
    enemies:() => {
      // Orrin judged: a Kindled zealot instead of a chorister. Orrin leading: his sister's boy hesitates.
      // The Drowned Steps cleared: no river-priests feeding her hymn.
      const f = S.flags;
      return ['ashbound', 'choir', kindled() ? 'kindler' : f.lead === 'orrin' ? 'choirDoubt' : 'choir', f.stepsDone ? 'paleWeak' : 'palecantor'];
    },
    intro:'The Pale Cantor sings, and the ash rises.'}
});

const _a22Echoes = HEROES.party.echoes;
HEROES.party.echoes = () => {
  const f = S.flags, e = _a22Echoes();
  if (f.lead === 'orrin') e.push('Deacon Orrin kept his oath to Tamsin, and led the four to the Ashen Hand.');
  if (f.quellFavour) e.push('The four owe Mother Quell a favour.');
  if (f.corrinProof) e.push('The four have Corrin Sarne’s ledger: three months of shards to the Ashen Hand, signed in his own hand.');
  if (f.handFreed) e.push(`${f.handFreed} of the Ashen Hand’s converts were freed, and will bear witness.`);
  if (f.planRead) e.push('The Ashen Hand means to cut the seventh pillar’s root on Council night. Corrin Sarne pays for it, to be the last lord standing.');
  if (f.handPlan === 'struck') e.push('The four burned the Cinder Vaults. The Hand in Corvane is broken and the wells are clearing, but the proof burned and the Cinder Father escaped.');
  if (f.handPlan === 'trap') e.push('The four will be waiting at the seventh pillar’s root on Council night. Until then, the grey keeps rising in the wells.');
  if (f.evidenceTo === 'marrow') e.push('Envoy Marrow holds the four’s evidence until the Council sits.');
  if (f.evidenceTo === 'kept') e.push('The four kept their evidence. Envoy Marrow is not pleased.');
  return e;
};

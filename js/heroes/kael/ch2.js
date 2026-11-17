// ================= KAEL, CHAPTER 2: THE SALT ROAD =================
// Kael and Brannoc walk north through the failing Heartland on the old salt-wagon road, which turns out to be the
// shard route, with a Free Companies bounty crew behind them. Scene IDs use the prefix k2_.
// Placeholder names: Harrow's Farm, the Salt Wife, Hollin's Ford, Captain Odile Brask and the Iron Tally Company.
HEROES.kael.chapters[2] = {title:'The Salt Road', start:'k2_intro'};

const kDario = () => S.flags.dario === 'killed' ? 'killed' : S.flags.darioAlly ? 'ally' : 'hunted';
const tamsinBells = () => otherF('tamsin').order || null;   // 'warners' rang the bells, 'keepers' kept quiet
const wrenKey = () => otherF('wren').key || null;           // 'sold' to Voss, or 'kept'
const xpNote = (n) => { const ups = gainXP(n); return `+${n} experience${ups.length ? `. Level up! Kael is now level ${S.level}.` : '.'}`; };

Object.assign(SCENES, {
  k2_intro:{
    enter(){ quest('saltroad', 'The Salt Road', 'Follow the old salt-wagon road north through the Heartland toward Corvane. House Sarne has put a price on your head.'); },
    view: () => {
      const d = kDario();
      const t = [
        `A week out of the Varrow drain, the Salt Road runs north through the Heartland, straight as a spear: two ruts worn white by three hundred years of salt wagons, between fields that should be gold by now.`,
        `They aren't. The wheat stands thin and pale, and in some of the fields it's grey at the root, the same dead ash-grey you saw leaking out of the Wardstone. Brannoc doesn't say anything about it. He doesn't have to.`,
        `At the first crossroads there's a notice nailed to the waymarker. Your own face looks back at you, badly drawn. <em>KAEL DUNMORE, ARENA SLAVE, ESCAPED. FOR MURDER AND THEFT AGAINST HOUSE SARNE.</em>`
      ];
      if (d === 'killed') t.push(`Underneath, in fresh red ink: <em>DEAD OR ALIVE. FIVE HUNDRED CROWNS. Apply to any captain of the Free Companies.</em> Brannoc whistles. "Five hundred. Corrin must have loved his brother after all." He tears the notice down. There will be others.`);
      else if (d === 'ally') t.push(`Underneath: <em>ALIVE. TWO HUNDRED CROWNS.</em> That evening a rider in Sarne green catches you up on the road, and your hand goes to your sword, but she only holds out a folded note. It's from Dario. <em>"Corrin has bought the Free Companies. Ten of them, maybe fewer. They'll come at you at a river. Don't stop at inns. — D."</em>`);
      else t.push(`Underneath: <em>ALIVE. TWO HUNDRED CROWNS. The prisoner poisoned Lord Dario Sarne and is dangerous.</em> Brannoc reads it twice. "Dario thinks you poisoned him," he says. "So Corrin gets his brother angry and his arena cleared in one go. Clever lad, Corrin."`);
      return {title:'The Salt Road', text:t, choices:[{label:'North along the Salt Road', act: () => toMap('k2_salt')}]};
    }
  },

  // --- The Heartland hub ---
  k2_camp:{ view: () => ({
    title:'The Waymarker',
    text:[`A stone waymarker, a dry ditch and a fire that Brannoc builds too small to be seen from the road. He's been on the run before, you think. He's never said.`],
    choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health)', act: () => { restAll(); S.notice = 'You rest. Health restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},

  k2_farm:{ view: () => {
    const f = S.flags, bells = tamsinBells();
    if (f.farmDone) return {title:'Harrow’s Farm', text:[`The well is quiet now. The Harrow boy is sitting up in the doorway, wrapped in a blanket, watching the road.`], choices:[back()]};
    if (f.farmIn) return {title:'The Well', text:[
      `The well is old and deep, and it hums. You feel it before you hear it, in your teeth and the silver-white scar the Wardstone left in your palm.`,
      `Down in the black water, something glows faintly grey: a chunk of black stone veined with silver, the size of a fist, wedged in the stones. A shard. It must have bounced off a salt wagon and rolled into the well-head. The Salt Road is the shard road.`
    ], choices:[
      {label:'Listen to it, and lift it out the way the Wardstone taught you. (Wardlore 1)', req: () => sk('wardlore') >= 1, tag:'Wardlore 1', act: () => { f.farmHow = 'ward'; go('k2_farmDone'); }},
      {label:'Climb down and haul it out with your bare hands.', act: () => { f.farmHow = 'haul'; S.pc.hp = Math.max(1, S.pc.hp - 10); go('k2_farmDone'); }},
      back('Not yet')
    ]};
    const t = [`Harrow's Farm is the last one before the downs: a stone house, a barn, a well and forty acres of grey wheat.`];
    if (bells === 'warners') t.push(`The field nearest the house has been burned to stubble. Old Harrow meets you at the gate with a pitchfork and his two daughters behind him. "We heard the Lantern bells," he says. "We know what grey means now. My boy's got it, and we don't need some sellsword bringing more in off the road."`,
      echo('tamsin', 'Tamsin had the Lantern bells rung across the Heartland. The farmers know what the grey is, and they’re afraid of strangers.'));
    else if (bells === 'keepers') t.push(`Old Harrow waves you in like a neighbour. "Fever's going round," he says. "Ordinary fever, the Lantern sisters say. My boy's had it a week." The boy is lying by the fire, grey to the elbows, and nobody in the house knows what that means.`,
      echo('tamsin', 'Tamsin kept the Lantern Order quiet. The Harrows have been told the grey is an ordinary fever.'));
    else t.push(`Old Harrow lets you water at the trough and doesn't ask your name. His boy is sick, he says. A fever. The water's been tasting strange.`);
    const ch = [];
    if (bells === 'warners'){
      ch.push(Object.assign({label:'"I’ve seen what’s doing this, and I can stop it. Let me look at your well."', act: () => { f.farmIn = true; render(); }}, chk('leadership', 1)));
      ch.push({label:'Come back after dark and climb into the well yourself.', act: () => { f.farmIn = true; f.farmNight = true; S.pc.hp = Math.max(1, S.pc.hp - 6); S.notice = 'You scrape yourself raw on the well stones in the dark (-6 health).'; render(); }});
    } else ch.push({label:'"The water’s tasting strange? Show me the well."', act: () => { f.farmIn = true; render(); }});
    ch.push(back());
    return {title:'Harrow’s Farm', text:t, choices:ch};
  }},
  k2_farmDone:{
    enter(){ if (S.flags.farmDone) return; S.flags.farmDone = true; S.flags.shardProof = true; S.notice = xpNote(60); chron('You pulled a Wardstone shard out of a Heartland well. It had fallen off a salt wagon: the Salt Road is the shard road.'); },
    view: () => ({
      title:'The Well',
      text:[
        S.flags.farmHow === 'ward'
          ? `You put your scarred palm flat on the water and listen, the way you listened to the Wardstone. The shard is lonely. That's the only word for it. When you close your hand round it, it comes up as easily as a stone from a stream, and the hum goes quiet.`
          : `The water is so cold it hurts, and the shard is colder. When you close your fist round it, grey crawls up your arm to the elbow, and it takes everything you have to keep hold until Brannoc hauls you up by the collar (-10 health).`,
        S.flags.farmNight ? `When you climb out, Old Harrow is standing over the well with a lantern and the pitchfork. He looks at the shard in your hand for a long time. Then he puts the pitchfork down.` : `Old Harrow looks at the shard in your hand for a long time.`,
        `By morning the boy is sitting up. The grey hasn't gone, but it's stopped. You wrap the shard in a sack and put it in your pack. Proof, if anyone in Corvane will look at it.`
      ],
      choices:[back()]
    })
  },

  k2_mill:{ view: () => S.flags.millDone ? ({
      title:'The Mill Bridge', text:[`The mill wheel turns in the stream. Nobody is waiting on the bridge now.`], choices:[back()]
    }) : ({
      title:'The Mill Bridge',
      text:[
        `The road crosses a millstream on a humpbacked bridge. Two men are sitting on the parapet, too well armed for millers, with an iron tally-stick hanging from each belt: Free Companies, the Iron Tally.`,
        `One of them unfolds your face from his coat and holds it up beside you, squinting. "Huh," he says. "Better looking on paper."`
      ],
      choices:[{label:'Fight', act: () => startCombat('k2_mill')}, back('Back off for now')]
    })
  },
  k2_millWin:{ enter(){ S.flags.millDone = true; S.gold += 15; S.notice = 'You find 15 crowns and a scrap of orders.'; }, view: () => ({
    title:'The Mill Bridge',
    text:[`The scouts' orders are written on the back of your own bounty notice: <em>"Hold the mill road. Signal the captain at Hollin's Ford. O.B."</em>`, `Brannoc taps the initials. "Whoever O.B. is, she's waiting for you at the ford."`],
    choices:[back()]
  })},

  k2_inn:{ view: () => {
    const f = S.flags, i = otherF('ilsa');
    const t = [`The Salt Wife is a wayhouse at the crossroads: low roof, long tables, carters drinking in silence. Your face is on the wall by the door. Nobody looks at it, or at you, which is how you know they've all seen it.`];
    if (i.choice === 'hide') t.push(`Next to your notice is another: a Sylvari girl with ink on her hands. <em>ILSA VENN, THIEF OF THE ARCANUM.</em> Brannoc looks from one to the other. "Busy year for wanted posters."`, echo('ilsa', 'Ilsa hid the Concord’s last pages. The Arcanum has named her a thief.'));
    else if (i.choice === 'report') t.push(`A carter is complaining that the Crown has closed the coast road for an "envoy's business." Some girl from the Arcanum, he says, went straight to the Crown with a story about the Wardstones.`, echo('ilsa', 'Ilsa reported the Concord to Envoy Lysa Marrow.'));
    if (tamsinBells() === 'warners') t.push(`Every table is talking about the Lantern bells. Somebody's cousin heard them in three valleys at once. Somebody else says the Crown is looking for the sister who started it.`);
    const ch = [];
    if (!f.knowBrask) ch.push(Object.assign({label:'Buy the carters a round and ask about the Free Companies on this road.', act: () => { f.knowBrask = true; S.notice = xpNote(30); go('k2_brask'); }}, chk('leadership', 1)));
    if (!f.innTalked) ch.push({label:'Sit down with Brannoc.', act: () => { f.innTalked = true; go('k2_bran'); }});
    if (!f.innBought){
      ch.push({label:'Buy 2 Healing Draughts from the landlady (20 crowns)', req: () => S.gold >= 20, tag: S.gold >= 20 ? null : 'Needs 20 crowns', act: () => { S.gold -= 20; S.items.draught += 2; f.innBought = true; S.notice = 'You buy 2 Healing Draughts.'; render(); }});
    }
    ch.push(back());
    return {title:'The Salt Wife', text:t, choices:ch};
  }},
  k2_brask:{ view: () => ({
    title:'The Salt Wife',
    text:[
      `A carter with salt-burned hands takes your ale and talks low. "The Iron Tally. Captain's a woman called Odile Brask. Ex-Crown, they say, and she counts every crown twice. She's got ${kDario() === 'killed' ? 'six or seven' : 'five or so'} with her, crossbows mostly, and a man with a net."`,
      `"She'll take you at the ford," he says. "Everybody takes everybody at the ford. One road in, water on both sides."`
    ],
    choices:[{label:'Back', act: () => go('k2_inn')}]
  })},
  k2_bran:{ view: () => ({
    title:'The Salt Wife',
    text:[
      `Brannoc drinks half his ale in one go and looks at the grey wheat through the window.`,
      S.flags.toldBran
        ? `"Seven stones, you said. And this road's paved with pieces of one of them." He shakes his head. "I patched up fighters for twenty years so House Sarne could sell the floor out from under all of us."`
        : `"You still haven't told me what you saw down there," he says. "Fine. But you look at that wheat like you know what's wrong with it, lad. One day you'll have to tell somebody."`,
      `"Your father," he says after a while. "He'd have walked this road too. He was stubborn the same way." He doesn't say any more, and you don't ask.`
    ],
    choices:[{label:'Back', act: () => go('k2_inn')}]
  })},

  k2_wagon:{ view: () => {
    const f = S.flags, k = wrenKey();
    if (f.wagonDone) return {title:'The Wagon', text:[`Wheel ruts and a scatter of straw where the wagon stood.`], choices:[back()]};
    if (k === 'sold') return {title:'The Shard Wagon', text:[
      `In a hollow off the road, a salt wagon is drawn up for the night, too heavily guarded for salt: four men in Sarne green, and crates nailed shut with Steward Voss's seal. The shard wagons are rolling again.`,
      echo('wren', 'Wren sold Quell’s key to Steward Voss. The shard trade is moving again, and the wagons are back on the Salt Road.')
    ], choices:[{label:'Hit the wagon', act: () => startCombat('k2_wagon')}, back('Leave it')]};
    const t = [
      `In a hollow off the road, a salt wagon stands abandoned with one wheel broken. The crates in the back have Steward Voss's seal on them, and they're empty.`,
      k === 'kept' ? echo('wren', 'Wren kept Quell’s key. Without it the shard trade has stalled, and Voss’s wagons sit empty on the road.') : `Whoever was driving it left in a hurry.`
    ];
    return {title:'The Abandoned Wagon', text:t, choices:[
      Object.assign({label:'Search the driver’s box for papers.', act: () => { f.wagonDone = true; f.waybill = true; S.gold += 25; S.notice = `${xpNote(40)} You find a waybill and 25 crowns.`; chron('You found one of Steward Voss’s waybills on an abandoned shard wagon.'); go('k2_waybill'); }}, chk('lore', 1)),
      {label:'Strip it for anything useful.', act: () => { f.wagonDone = true; S.items.draught += 1; S.gold += 10; S.notice = 'You find a Healing Draught and 10 crowns.'; render(); }},
      back()
    ]};
  }},
  k2_waybill:{ view: () => ({
    title:'The Abandoned Wagon',
    text:[`The waybill is in Voss's neat hand: <em>"Varrow to Corvane by the Salt Road. Twelve crates, stone. Deliver to the Spire at the Arcanum's Corvane house. No inspection."</em> The Arcanum keeps a house in the capital, and the shards are going there.`],
    choices:[back()]
  })},
  k2_wagonWin:{ enter(){ S.flags.wagonDone = true; S.flags.wagonTaken = true; S.gold += 40; S.items.draught += 1; S.notice = 'You find 40 crowns and a Healing Draught. The crates hold shards; you smash the seals and tip them into the stream.'; chron('You hit one of Steward Voss’s shard wagons on the Salt Road.'); }, view: () => ({
    title:'The Shard Wagon',
    text:[`Twelve crates of black stone veined with silver, humming like a hive. You can't carry them. You can make sure nobody else does: you tip them into the deepest pool in the stream, and the water turns faintly grey and then goes still.`],
    choices:[back()]
  })},

  k2_pit:{ view: () => S.flags.pitDone ? ({
      title:'The Old Salt Pit', text:[`The pit is quiet. The miners are at rest.`], choices:[back()]
    }) : ({
      title:'The Old Salt Pit',
      text:[
        `An old salt working cuts into the downs: a ramp, a dark mouth and a cold wind coming out of it. Locals say it was shut forty years ago. Somebody's been using it since: the ramp is rutted with fresh wagon wheels.`,
        `Inside, white salt walls glitter in your torchlight, and men in rotted mining leathers are standing in the dark with their faces to the wall. They turn round together. Grey to the eyes.`
      ],
      choices:[{label:'Fight', act: () => startCombat('k2_pit')}, back('Back out')]
    })
  },
  k2_pitWin:{ enter(){ S.flags.pitDone = true; S.gear.armor += 1; S.items.tonic += 1; S.notice = 'You find a salt-cured miner’s hauberk (+1 armor) and a Bitter Tonic.'; }, view: () => ({
    title:'The Old Salt Pit',
    text:[`At the back of the working, a crate of shards has been stacked against the salt and forgotten. The miners must have found them, or the shards found the miners. You leave them sealed in the dark where nobody will dig them up for another forty years.`],
    choices:[back()]
  })},

  k2_onward:{ view: () => ({
    title:'North to the River',
    text:[`The Salt Road runs down off the downs to the river and Hollin's Ford, the only crossing for thirty miles. Beyond it, three days on, Corvane.`, `Once you're on the ford road, there's no doubling back.`],
    choices:[{label:'Down to Hollin’s Ford', act: () => toMap('k2_ford')}, {label:'Not yet', act: () => toMap('k2_salt')}]
  })},

  // --- Hollin's Ford hub ---
  k2_bank:{ view: () => ({
    title:'The South Bank',
    text:[`Willows, a shingle beach and the ford stretching away across the river in a long pale line of stones. On the far bank, smoke from a camp.`],
    choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest under the willows (restores health)', act: () => { restAll(); S.notice = 'You rest. Health restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  k2_toll:{ enter(){ S.flags.metReeve = true; }, view: () => ({
    title:'The Toll-House',
    text:[
      `The Crown keeps a toll-house at the ford: one reeve, an old man with a ledger and a cudgel he's never used. He looks at your face, then at the notice on his own wall, then at you.`,
      `"I don't hold with the Free Companies," he says. "Paper warrants bought by the yard. Whatever you did in Varrow is Varrow's business. If you bring me something I can write down, I'll write it down."`
    ],
    choices:[back()]
  })},
  k2_watch:{ view: () => {
    const f = S.flags;
    if (f.k2Prep) return {title:'The Reed Bed', text:[f.k2Prep === 'strings' ? `Their crossbows hang where they left them, every string cut.` : f.k2Prep === 'bottleneck' ? `You know the ford now: where it narrows, where it's deep, where a man can hold it.` : `You've seen what's waiting for you.`], choices:[back()]};
    const t = [
      `From the reeds you can see the Iron Tally's camp on the far bank: a fire, a wagon, crossbows stacked under an oilcloth, and a broad, grey-haired woman counting coins into a strongbox, twice. Captain Odile Brask.`,
      kDario() === 'killed' ? `There are a lot of them. More than five hundred crowns' worth.` : `Fewer than you feared.`
    ];
    if (kDario() === 'ally') t.push(`Dario's note was right about the river. They don't know you know.`);
    return {title:'The Reed Bed', text:t, choices:[
      Object.assign({label:'Slip into their camp at night and cut every crossbow string.', act: () => { f.k2Prep = 'strings'; chron('You cut the Iron Tally’s crossbow strings the night before the ford.'); render(); }}, chk('lockpick', 1)),
      Object.assign({label:'Walk the ford in the dark and find where it narrows. Make them come at you there.', act: () => { f.k2Prep = 'bottleneck'; chron('You found the narrows of Hollin’s Ford and made the Iron Tally come at you there.'); render(); }}, chk('survival', 1)),
      back()
    ]};
  }},
  k2_crossing:{ view: () => {
    const f = S.flags, d = kDario();
    const t = [`At dawn you walk out onto the ford. The water is knee-deep and fast. Halfway across, the Iron Tally comes down the far bank to meet you.`];
    if (d === 'ally') t.push(`But you came across an hour early, the way Dario's note warned you to, and their crossbowman is still half asleep in the wagon when Brannoc's sling-stone cracks against his skull.`);
    if (f.k2Prep === 'bottleneck') t.push(`You hold them at the narrows, where the ford is two men wide and the river does half your work. Their lead sellsword steps wrong and goes under, and comes up coughing, half-drowned.`);
    if (f.k2Prep === 'strings') t.push(`Brask's crossbowmen raise their bows, and the cut strings slap uselessly. They throw them down and draw knives. The captain swears and cranks her own heavy arbalest. That one, you didn't get to.`);
    t.push(`"Kael Dunmore," Captain Brask calls across the water, quite friendly. "Nothing personal. You're a line in a ledger. Put the sword down, and I'll see you get to Varrow alive."`, `<em>This will be a hard fight. Brask stays on the far bank and calls volleys at both of you; break through her crew to reach her.</em>`);
    return {title:'Hollin’s Ford', text:t, choices:[{label:'Fight the Iron Tally', act: () => startCombat('k2_boss')}, {label:'Fall back and prepare', act: () => toMap('k2_ford')}]};
  }},
  k2_bossWin:{
    enter(){ if (S.flags.k2Boss) return; S.flags.k2Boss = true; },
    view: () => ({
      title:'Hollin’s Ford',
      text:[
        `Brask goes down on one knee in the shallows with your sword at her throat and her arbalest floating away downstream. She doesn't beg. She looks at the river carrying off her crew's dead and her face does something complicated.`,
        `"It's only coin, Dunmore," she says. "It's always only coin. Corrin Sarne paid us four hundred up front and a hundred on delivery, and I've got the contract in my coat with his seal on it. So." She spits river water. "What's it to be?"`,
        `Brannoc stands on the bank with his arms folded, and for once he doesn't tell you what he thinks.`
      ],
      choices:[{label:'Decide', go:'k2_choice'}]
    })
  },
  k2_choice:{ view: () => ({
    title:'Hollin’s Ford',
    text:[
      `If you let her go, the Iron Tally walks away and the contract goes in the river. Brask will owe you, and her kind remember debts. But Corrin will hear which road you took, and there'll be no proof that House Sarne buys Crown-sanctioned murder.`,
      `If you hand her to the reeve with that contract, it goes into a Crown ledger with Corrin's seal on it: something to put on a table in Corvane. Her crew will scatter, and they'll hate anyone who stands next to you.`
    ],
    choices:[
      {label:'"Tear up the contract and take your people home."', act: () => { S.flags.captain = 'freed'; chron('You beat Captain Brask of the Iron Tally at Hollin’s Ford, and let her crew walk away. She owes you.'); go('k2_freed'); }},
      {label:'Hand her and the contract to the reeve.', act: () => { S.flags.captain = 'handed'; S.flags.bountyProof = true; chron('You handed Captain Brask to the Crown reeve at Hollin’s Ford, with Corrin Sarne’s sealed contract.'); go('k2_handed'); }}
    ]
  })},
  k2_freed:{ view: () => ({
    title:'Hollin’s Ford',
    text:[
      `Brask takes the contract out of her coat, looks at it, and tears it in half, and then in half again, and lets the river have it.`,
      `"The Iron Tally works the river barges in winter," she says. "If you or yours ever need a boat and no questions, say my name on the Corvane docks." She whistles, and what's left of her crew comes limping out of the reeds after her.`,
      `Brannoc watches them go. "Corrin will know where we are by the end of the week," he says. "But that's a debt you can spend." He almost sounds proud.`
    ],
    choices:[{label:'Continue', go:'k2_ending'}]
  })},
  k2_handed:{ view: () => ({
    title:'The Toll-House',
    text:[
      `The reeve reads Corrin Sarne's contract three times, then copies it into his ledger in a slow, careful hand, and signs it, and has you sign it too. "There," he says. "Now it's the Crown's business."`,
      `Brask is locked in the toll-house cellar until the Crown's riders come. Through the grating she says, quite calmly: "My people will remember your face, Dunmore. And everyone who walks beside you."`,
      `Across the river, her crew is already gone.`
    ],
    choices:[{label:'Continue', go:'k2_ending'}]
  })},
  k2_ending:{ view: () => {
    const f = S.flags;
    const t = [
      `On the far bank the Salt Road climbs out of the river valley, and from the top of the rise you can see it at last: a smudge of smoke on the horizon, towers, a wall. Corvane.`,
      f.shardProof ? `In your pack the shard from Harrow's well hums quietly against your back, like something asleep.` : `You've nothing in your pack but bread and a bounty notice.`,
      f.captain === 'handed' ? `And somewhere behind you, a Crown reeve's ledger has Corrin Sarne's seal in it.` : `And somewhere on the river behind you, a mercenary captain owes you a boat.`,
      `"Three days," Brannoc says. "Then we find out whether anybody in the capital wants to hear it."`
    ];
    return {title:'The Rise above the River', text:t, choices:[{label:'End of chapter 2', act: () => {
      setQ('saltroad', 'done', 'You walked the Salt Road north and crossed the river at Hollin’s Ford.');
      quest('corvane', 'Go north to Corvane', f.captain === 'handed' ? 'Get into the capital and put House Sarne’s sealed bounty contract, and the Wardstone shards, in front of someone who will listen.' : 'Get into the capital and find someone who will listen about the Wardstones. House Sarne knows which road you took.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  k2_salt:{
    title:'The Heartland',
    blurb: () => `Grey wheat, white road and a price on your head.`,
    w:340, h:260,
    nodes:[
      {id:'k2_camp', label:'Waymarker', x:45, y:215, sub:'Rest'},
      {id:'k2_farm', label:'Harrow’s Farm', x:60, y:95, sub:'A sick boy', done: () => S.flags.farmDone},
      {id:'k2_mill', label:'Mill Bridge', x:160, y:170, sub:'The Iron Tally', done: () => S.flags.millDone},
      {id:'k2_inn', label:'The Salt Wife', x:170, y:60, sub:'Wayhouse'},
      {id:'k2_wagon', label:'The Wagon', x:265, y:200, sub:'Optional', open: () => S.flags.millDone, done: () => S.flags.wagonDone, lockText:'Over the mill bridge'},
      {id:'k2_pit', label:'Old Salt Pit', x:280, y:40, sub:'Optional', open: () => S.flags.millDone, done: () => S.flags.pitDone, lockText:'Over the mill bridge'},
      {id:'k2_onward', label:'To the River', x:295, y:125, sub:'Hollin’s Ford', open: () => S.flags.millDone && S.flags.farmDone, lockText:'Clear the mill bridge and help at the farm'}
    ],
    edges:[['k2_camp','k2_farm'],['k2_camp','k2_mill'],['k2_farm','k2_inn'],['k2_mill','k2_inn'],['k2_mill','k2_wagon'],['k2_inn','k2_pit'],['k2_mill','k2_onward'],['k2_inn','k2_onward']]
  },
  k2_ford:{
    title:'Hollin’s Ford',
    blurb: () => `One crossing, thirty miles of river and a mercenary captain on the far bank.`,
    w:340, h:250,
    nodes:[
      {id:'k2_bank', label:'South Bank', x:55, y:200, sub:'Rest'},
      {id:'k2_toll', label:'Toll-House', x:70, y:75, sub:'The reeve', done: () => S.flags.metReeve},
      {id:'k2_watch', label:'Reed Bed', x:190, y:180, sub:'Scout the camp', done: () => S.flags.k2Prep},
      {id:'k2_crossing', label:'The Ford', x:290, y:110, sub:'Captain Brask', done: () => S.flags.k2Boss}
    ],
    edges:[['k2_bank','k2_toll'],['k2_bank','k2_watch'],['k2_toll','k2_crossing'],['k2_watch','k2_crossing']]
  }
});

Object.assign(ENEMIES, {
  tallyhand:{name:'Iron Tally Sellsword', hp:40, dmg:[9,12], acc:72, dodge:5, armor:2, init:5, xp:35},
  tallyswept:{name:'Iron Tally Sellsword (half-drowned)', hp:16, dmg:[9,12], acc:72, dodge:5, armor:2, init:5, xp:35},
  tallyxbow:{name:'Iron Tally Crossbow', hp:22, dmg:[7,10], acc:72, dodge:6, armor:0, init:6, xp:30, ranged:true, row:'back'},
  tallyhurt:{name:'Iron Tally Crossbow (wounded)', hp:10, dmg:[7,10], acc:72, dodge:6, armor:0, init:6, xp:30, ranged:true, row:'back'},
  tallyknife:{name:'Iron Tally Bowman', hp:26, dmg:[8,11], acc:70, dodge:6, armor:0, init:6, xp:30},
  tallynet:{name:'Iron Tally Netman', hp:38, dmg:[8,11], acc:74, dodge:6, armor:1, init:5, xp:40,
    spec:{every:3, name:'Weighted Net', windup:'{n} starts whirling a weighted net.', mult:0.7, stun:true}},
  greyminer:{name:'Grey Miner', hp:32, dmg:[7,10], acc:70, dodge:2, armor:1, init:3, xp:35, hollow:true, greyChance:20},
  // Tuned by bot sim (200 runs). Spared Dario, boss at level 5 with a prep: ~70–80% first-try wins (95%+ at level 6).
  // Killed Dario, boss at level 6: ~60–70%. Brask stays in the back row and calls volleys at both rows every other
  // turn, so the pressure is on Brannoc too; the fight turns on how fast Kael breaks the front.
  brask:{name:'Captain Odile Brask', hp:135, dmg:[11,14], acc:76, dodge:6, armor:2, init:6, xp:230, ranged:true, row:'back',
    spec:{every:2, name:'Volley', windup:'{n} raises her arbalest and roars, “Volley! On my mark!”', mult:1.8, aoe:true}},
  braskCut:{name:'Captain Odile Brask', hp:135, dmg:[11,14], acc:76, dodge:6, armor:2, init:6, xp:230, ranged:true, row:'back',
    spec:{every:2, name:'Arbalest Shot', windup:'{n} cranks her heavy arbalest, the one bow you didn’t get to.', mult:1.6, aoe:true}}
});
Object.assign(COMBATS, {
  k2_mill:{title:'The Mill Bridge', enemies:() => kDario() === 'killed' ? ['tallyhand', 'tallyhand', 'tallyxbow'] : ['tallyhand', 'tallyxbow'], lethal:true, win:'k2_millWin', back:'k2_mill',
    intro:'The scouts come off the parapet with their swords out.'},
  k2_wagon:{title:'The Shard Wagon', enemies:() => ['thug', 'thug', 'xbow'], lethal:true, flee:true, win:'k2_wagonWin', back:'k2_wagon',
    intro:'The guards scramble up from their fire.'},
  k2_pit:{title:'The Old Salt Pit', enemies:() => ['greyminer', 'greyminer', 'wisp'], lethal:true, flee:true, win:'k2_pitWin', back:'k2_pit',
    intro:'The miners come at you through the glittering dark.'},
  // Captain plus 3 (plus 4 if Dario died). Dario's warning wounds the crossbowman before the fight; the narrows
  // half-drown the sellsword; cut strings turn the crossbows into knife-men and weaken Brask's volley.
  k2_boss:{title:'Captain Brask and the Iron Tally', lethal:true, win:'k2_bossWin', back:'k2_crossing',
    enemies:() => {
      const f = S.flags, cut = f.k2Prep === 'strings', d = kDario();
      let e = [f.k2Prep === 'bottleneck' ? 'tallyswept' : 'tallyhand', 'tallynet', d === 'ally' ? 'tallyhurt' : 'tallyxbow'];
      if (d === 'killed') e.push('tallyxbow');
      if (cut) e = e.map(k => k === 'tallyxbow' || k === 'tallyhurt' ? 'tallyknife' : k);
      e.push(cut ? 'braskCut' : 'brask');
      return e;
    },
    intro:'The Iron Tally comes at you through the water. Captain Brask stays on the bank with her arbalest.'}
});

// Chapter 2 echoes: Kael's own ending, and into Wren's, Tamsin's and Ilsa's
const _kaelEchoesK2 = HEROES.kael.echoes, _wrenEchoesK2 = HEROES.wren.echoes, _tamsinEchoesK2 = HEROES.tamsin.echoes, _ilsaEchoesK2 = HEROES.ilsa.echoes;
HEROES.kael.echoes = () => { const e = _kaelEchoesK2(); const f = S.flags;
  if (chapterOf(S) < 2) return e;
  if (f.shardProof) e.push('Kael pulled a Wardstone shard out of a Heartland well. The Salt Road is the shard road, and he carries the proof.');
  if (f.waybill) e.push('Kael found Steward Voss’s waybill: the shards go to the Arcanum’s house in Corvane.');
  if (f.wagonTaken) e.push('Kael hit one of Voss’s shard wagons and sank its crates in a stream.');
  if (f.captain === 'freed') e.push('Kael let Captain Brask and the Iron Tally walk. She owes him a boat on the Corvane docks, and Corrin Sarne knows which road he took.');
  if (f.captain === 'handed') e.push('Kael handed Captain Brask to the Crown with Corrin Sarne’s sealed bounty contract. The Iron Tally will remember his face.');
  return e; };
HEROES.wren.echoes = () => { const e = _wrenEchoesK2(); const k = otherF('kael');
  if (k.captain === 'freed') e.push('<b>Linked:</b> Kael spared the Iron Tally at Hollin’s Ford. Captain Brask’s crew works the river barges, and they owe Kael’s friends a favour.');
  if (k.captain === 'handed') e.push('<b>Linked:</b> Kael handed Captain Brask to the Crown. Her crew works the river barges now, and they’re hunting anyone who walks beside him.');
  if (k.wagonTaken && S.flags.key === 'sold') e.push('<b>Linked:</b> The key Wren sold got Voss’s shard wagons rolling again. Kael sank one of them in a stream on the Salt Road.');
  return e; };
HEROES.tamsin.echoes = () => { const e = _tamsinEchoesK2(); const k = otherF('kael');
  if (k.farmDone && S.flags.order === 'warners') e.push('<b>Linked:</b> The Harrows heard Tamsin’s bells and burned their field. When Kael came to their farm, they nearly ran him off, but they knew the grey when they saw it.');
  if (k.farmDone && S.flags.order === 'keepers') e.push('<b>Linked:</b> Nobody had told the Harrows what the grey was. Kael found their boy grey to the elbows from a shard in the well.');
  return e; };
HEROES.ilsa.echoes = () => { const e = _ilsaEchoesK2(); const k = otherF('kael');
  if (k.waybill) e.push('<b>Linked:</b> Kael found Voss’s waybill on the Salt Road. The shards are going to the Arcanum’s house in Corvane.');
  return e; };

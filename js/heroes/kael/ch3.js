// ================= KAEL, CHAPTER 3: THE GATE OF CORVANE =================
// The end of Kael's Act 1. Corvane's gates are shut "for the fever"; Kael gets in (Crown escort, Corrin's contract,
// or the water-gate), follows the shards to the Arcanum's warehouse on the Salt Quay, and faces Steward Voss.
// Scene IDs use the prefix k3_. Placeholder names: the Shard-Bound, Factor Dask, the Salt Quay.
// Flags from chapters not built yet: Ilsa's ch3 writes `magister` ('home' | 'crown'); Wren's ch3 writes `barge`
// ('sunk' | 'crown'). Both are read here, with neutral versions when they're missing.
HEROES.kael.chapters[3] = {title:'The Gate of Corvane', start:'k3_intro'};

const kBells = () => otherF('tamsin').order || null;
const kIlsa = () => otherF('ilsa');
const kBarge = () => otherF('wren').barge || null;
const kFragment = () => otherF('wren').fragment || null;
const kXP = (n) => { const ups = gainXP(n); return `+${n} experience${ups.length ? `. Level up! Kael is now level ${S.level}.` : '.'}`; };
const kIn = (how, line) => { S.flags.inCity = true; S.flags.cityHow = how; chron(line); go('k3_through'); };

Object.assign(SCENES, {
  k3_intro:{
    enter(){ quest('gate', 'The Gate of Corvane', 'Get into Corvane and follow the shards to whoever is buying them.'); },
    view: () => {
      const b = kBells();
      const t = [
        `Corvane sits on its hill like a crown on a cushion: white walls, a hundred towers and the great green dome of the Crown's Council House. Every gate is shut. A painted board on the Salt Road gate says <em>CLOSED BY ORDER. FEVER.</em>`,
        `Outside the walls, the fever camp stretches for a mile along the river: tents, carts, cookfires and thousands of people waiting to be let in, or let out, or told anything at all.`
      ];
      if (b === 'warners') t.push(`Everyone here has heard the Lantern bells. They know what grey means, and they know the Crown lied about it. There's a crowd at the Watch Gate every morning now, and every morning it's angrier.`, echo('tamsin', 'Tamsin had the Lantern bells rung across the Heartland. The camp outside Corvane knows the truth, and it’s close to a riot.'));
      else if (b === 'keepers') t.push(`Nobody here knows what grey means. A woman with grey to her elbows asks you whether it's catching, and you don't know what to tell her.`, echo('tamsin', 'Tamsin kept the Lantern Order quiet. The fever camp outside Corvane is quiet, and sick, and doesn’t know why.'));
      t.push(`Brannoc looks up at the walls. "Well," he says. "We came to tell somebody. That's a lot of somebodies."`);
      return {title:'Outside Corvane', text:t, choices:[{label:'Into the fever camp', act: () => toMap('k3_walls')}]};
    }
  },

  // --- Outside the walls ---
  k3_camp:{ view: () => ({
    title:'Brannoc’s Fire',
    text:[`Brannoc has found a dry patch by the river wall and a family who'll share their fire for a look at your stitches. He tends a split lip, a burn and a child's cough, and doesn't charge.`],
    choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health)', act: () => { restAll(); S.notice = 'You rest. Health restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  k3_tents:{ view: () => S.flags.tentsDone ? ({
      title:'The Fever Camp', text:[`The Sarne agents are gone. The camp closes up behind them as if they'd never been.`], choices:[back()]
    }) : ({
      title:'The Fever Camp',
      text:[
        `You walk the lanes between the tents, listening. On the third lane you hear your own name, said by someone who doesn't know you're behind him: three men in plain coats with Sarne green under them, asking the sick whether they've seen a pit fighter with a scar on his palm.`,
        kBells() === 'warners' ? `The people they're asking are already furious. "Ask the Crown," someone spits. "They know all about it."` : `The people they're asking are too tired to lie.`
      ],
      choices:[{label:'Deal with them', act: () => startCombat('k3_tents')}, back('Leave them for now')]
    })
  },
  k3_tentsWin:{ enter(){ S.flags.tentsDone = true; S.gold += 20; S.notice = 'You find 20 crowns and a list of Corvane addresses.'; }, view: () => ({
    title:'The Fever Camp',
    text:[`One of them carries a list in Voss's tidy hand: a dozen addresses inside the walls. Most are Sarne townhouses. The last is <em>"The Salt Quay. Arcanum stores. Number Nine."</em>`, `Brannoc taps it. "That's where the stones go."`],
    choices:[back()]
  })},
  k3_watch:{ view: () => {
    const f = S.flags, i = kIlsa(), frag = kFragment();
    if (f.inCity) return {title:'The Watch Gate', text:[`The Watch Gate is shut again behind you.`], choices:[back()]};
    const t = [`The Watch Gate is the only gate that opens at all, a crack at dawn for carts with Crown passes. A crowd stands in front of it all day. A dozen guards in Crown blue stand behind it.`];
    const ch = [];
    if (i.choice === 'report'){
      t.push(`A sergeant in Crown blue is going through the crowd with a drawing in his hand. When he finds you, he doesn't reach for his sword. "Dunmore? Envoy Marrow sends her regards. An apprentice named Venn told her you might turn up. Come with me."`, echo('ilsa', 'Ilsa reported the Concord to Envoy Lysa Marrow, and Marrow has been watching for the people Ilsa named.'));
      ch.push({label:'Go with Marrow’s sergeant.', act: () => kIn('escort', 'Envoy Marrow’s sergeant walked you through the Watch Gate into Corvane.')});
    } else if (i.choice === 'hide'){
      t.push(`There's a drawing nailed to the gate beside yours: a Sylvari girl with ink on her hands. The guards are stopping anyone who's travelled with Sylvari. You've never met her, and that won't matter to them.`, echo('ilsa', 'Ilsa hid the Concord’s last pages. Crown soldiers are watching the gates for anyone tied to her.'));
    }
    if (frag === 'crown') t.push(`The Watch Captain is a heavy, grey-bearded man with a look you recognise: he's seen something he can't stop seeing. "The envoy put a piece of black stone on the Council table last week," he says, when you say the word <em>Wardstone</em>. "It hummed. I was there."`, echo('wren', 'Wren gave a living Wardstone fragment to Envoy Marrow. The Watch Captain has heard it hum.'));
    if (f.bountyProof){
      const free = frag === 'crown';
      ch.push(Object.assign({label:'Show the Watch Captain Corrin Sarne’s sealed bounty contract.', act: () => { S.notice = kXP(60); kIn('contract', 'You showed the Watch Captain Corrin Sarne’s sealed contract, and he let you into Corvane.'); }}, free ? {} : chk('leadership', 1)));
    }
    if (!ch.length) t.push(`Without a pass or someone to speak for you, the gate isn't going to open for a man whose face is nailed to it.`);
    ch.push(back());
    return {title:'The Watch Gate', text:t, choices:ch};
  }},
  k3_water:{ view: () => {
    const f = S.flags, k = S.flags.captain;
    if (f.inCity) return {title:'The Water-Gate', text:[`The river runs under the wall through the old water-gate.`], choices:[back()]};
    const t = [`Downriver, the city wall crosses the water on three arches, and the middle arch has an iron grate that smugglers have been paying the Watch to ignore for a hundred years. The toll-men who run it sit on a moored barge, playing dice.`];
    const ch = [];
    if (k === 'freed'){
      t.push(`One of the barges has an iron tally-stick nailed over its door. When you say Captain Brask's name, the bargeman spits in the river and laughs. "She said you'd turn up. No questions, she said. In you get."`);
      ch.push({label:'Take the Iron Tally’s barge through the grate.', act: () => kIn('brask', 'Captain Brask’s Iron Tally took you under the walls of Corvane by barge, no questions asked.')});
    }
    ch.push(Object.assign({label:'Wait for dark and pick the grate’s lock from a rowboat.', act: () => { S.notice = kXP(60); kIn('lock', 'You picked the water-gate grate in the dark and slipped into Corvane.'); }}, chk('lockpick', 1)));
    ch.push(Object.assign({label:'Watch the toll-men’s shifts and swim through when the grate goes up for a barge.', act: () => { S.notice = kXP(60); kIn('swim', 'You swam under the walls of Corvane through the water-gate.'); }}, chk('survival', 1)));
    ch.push({label:'Take the grate from the toll-men by force.', act: () => startCombat('k3_toll')});
    ch.push(back());
    return {title:'The Water-Gate', text:t, choices:ch};
  }},
  k3_tollWin:{ enter(){ S.flags.inCity = true; S.flags.cityHow = 'force'; chron('You fought the smugglers’ toll-men and forced the water-gate into Corvane.'); }, view: () => ({
    title:'The Water-Gate',
    text:[`The toll-men end up in the river, swearing. You haul the grate up yourself, with Brannoc on the chain, and slip under the walls of Corvane.`],
    choices:[{label:'Into the city', act: () => go('k3_through')}]
  })},
  k3_through:{ view: () => ({
    title:'Inside the Walls',
    text:[
      {escort:`The sergeant walks you through the Watch Gate as if you were his prisoner, and drops the act two streets later. "The envoy can't see you yet," he says. "Council business. Don't get arrested."`,
       contract:`The Watch Captain reads Corrin Sarne's contract twice, with the reeve's ledger copy beside it, then folds it into his coat. "House Sarne buys murder warrants in the Crown's name," he says, "and I'm supposed to keep the gate for them." He opens it a crack. "Go on. I'll want to talk to you again."`,
       brask:`The barge glides under the arches in the dark, and the grate goes up for it like a portcullis for a king. The bargeman drops you at a quay stair. "Tell the captain we're square," he says.`,
       lock:`The lock is old and the pick is quiet. You and Brannoc pull the rowboat under the grate and up the quay stair before the next barge comes.`,
       swim:`The water is cold enough to stop your heart. You come up on the far side of the wall gasping, with Brannoc swearing beside you, and climb out onto the Salt Quay in your wet boots.`,
       force:`You come up onto the Salt Quay dripping.`}[S.flags.cityHow] || `You're inside the walls.`,
      `Corvane. Narrow streets, tall houses leaning together over them, and the smell of salt and tar off the river. The Salt Quay runs along the water below the old town: warehouses, cranes and barges, and somewhere among them, the place the shards go.`
    ],
    choices:[{label:'Along the Salt Quay', act: () => toMap('k3_quay')}]
  })},

  // --- The Salt Quay ---
  k3_room:{ view: () => ({
    title:'The Gull’s Rest',
    text:[`A room over a chandler's shop, rented for a crown a night, no questions. Brannoc sleeps with his boots on.`],
    choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health)', act: () => { restAll(); S.notice = 'You rest. Health restored.'; render(); }} : null,
      !S.flags.chandler ? {label:'Buy 2 Healing Draughts and a Bitter Tonic from the chandler (30 crowns)', req: () => S.gold >= 30, tag: S.gold >= 30 ? null : 'Needs 30 crowns', act: () => { S.gold -= 30; S.items.draught += 2; S.items.tonic += 1; S.flags.chandler = true; S.notice = 'You buy 2 Healing Draughts and a Bitter Tonic.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  k3_find:{ view: () => {
    const f = S.flags;
    if (f.foundStore) return {title:'Number Nine', text:[`Number Nine, the Arcanum's store on the Salt Quay. You know where it is now.`], choices:[back()]};
    const t = [`The Salt Quay has two hundred warehouses, and none of them has a sign saying <em>stolen Wardstones</em>.`];
    const ch = [];
    if (f.waybill || f.tentsDone){
      t.push(f.waybill ? `But Voss's waybill says <em>"Deliver to the Spire at the Arcanum's Corvane house,"</em> and the Arcanum's house keeps its stores on the quay at Number Nine.` : `But the Sarne agent's list says <em>"The Salt Quay. Arcanum stores. Number Nine."</em>`);
      ch.push({label:'Go to Number Nine.', act: () => { f.foundStore = true; f.findHow = 'paper'; S.notice = kXP(40); render(); }});
    } else {
      t.push(`But a Sarne cart comes down the quay every evening, heavy and slow and guarded, and nobody unloads salt with four guards.`);
      ch.push(Object.assign({label:'Follow the cart at a distance, the way you’d track a fighter’s footwork.', act: () => { f.foundStore = true; f.findHow = 'tail'; S.notice = kXP(40); render(); }}, chk('survival', 1)));
      ch.push({label:'Stop the cart and ask the guards.', act: () => startCombat('k3_cart')});
    }
    ch.push(back());
    return {title:'The Salt Quay', text:t, choices:ch};
  }},
  k3_cartWin:{ enter(){ S.flags.foundStore = true; S.flags.findHow = 'cart'; }, view: () => ({
    title:'The Salt Quay',
    text:[`The cart's driver, held upside down over the river by Brannoc, remembers he was going to Number Nine. The Arcanum's stores.`],
    choices:[back()]
  })},
  k3_factor:{ view: () => {
    const f = S.flags, i = kIlsa();
    if (f.factorDone) return {title:'The Factor’s Office', text:[f.factorTip ? `Factor Dask's office is shut. He's gone to the country for his health, with a purse of your crowns.` : `Factor Dask's door is locked against you.`], choices:[back()]};
    const t = [`Number Nine's factor keeps an office on the quay above a sail-loft: Master Dask, a thin man with an ink-stained thumb and a nervous laugh.`];
    const ch = [];
    if (i.ledger){
      t.push(`You know his name before he says it. It's in the ledger Ilsa Venn took out of the Arcanum's vault: <em>"Dask, Corvane: received of Steward Voss, forty crates."</em>`, echo('ilsa', 'Ilsa carries the Arcanum’s shard ledger. Factor Dask’s name is in it.'));
      ch.push(Object.assign({label:'"Your name is in the Arcanum’s ledger, Master Dask. Tell me how to get into Number Nine, and it can fall out of it."', act: () => { f.factorDone = true; f.factorTip = true; S.notice = kXP(60); chron('You frightened Factor Dask into telling you the way into Number Nine.'); go('k3_tip'); }}, chk('leadership', 1)));
    } else t.push(`He doesn't know you, and he doesn't want to. "Stores are stores," he says. "I just count them."`);
    ch.push({label: f.factorDone ? 'Back' : 'Leave him', act: () => { if (!i.ledger) f.factorDone = true; toMap(S.map); }});
    return {title:'The Factor’s Office', text:t, choices:ch};
  }},
  k3_tip:{ view: () => ({
    title:'The Factor’s Office',
    text:[`Dask talks fast. Voss is in Number Nine himself tonight, moving the stock. There are four Sarne guards in the yard, and a thing Voss keeps in the cellar that the guards won't go near: a man who's been sleeping on the shards for a year, and has grown into them. "Through the sail-loft," Dask says. "Across the roof. The yard guards never look up."`],
    choices:[back()]
  })},
  k3_side:{ view: () => {
    const f = S.flags, m = kIlsa().magister;
    if (m === 'home') return {title:'The Side Door', text:[
      f.sideDoor ? `The side door is still on the latch.` : `In the alley behind Number Nine, a narrow door has a chalk mark on it, a Sylvari letter. It's on the latch. Someone inside the Arcanum's house has left it open for whoever Ilsa Venn sent.`,
      echo('ilsa', 'Ilsa sent the Arcanum’s magister home owing her. Someone in the Arcanum’s Corvane house has left a door open.')
    ], choices:[!f.sideDoor ? {label:'Remember it for tonight.', act: () => { f.sideDoor = true; render(); }} : null, back()].filter(Boolean)};
    if (m === 'crown') return {title:'The Alley', text:[`The alley behind Number Nine is full of Crown blue: the Crown knows the Arcanum is buying shards, because a magister told them, and they're watching. Voss has doubled the guard inside.`, echo('ilsa', 'Ilsa handed the Arcanum’s magister to the Crown. The Crown is watching Number Nine, and Voss knows it.')], choices:[back()]};
    return {title:'The Alley', text:[`A narrow alley behind Number Nine, a bolted door and a lot of rats.`], choices:[back()]};
  }},
  k3_yard:{ view: () => {
    const f = S.flags;
    if (f.yardDone) return {title:'The Yard', text:[f.k3Boss ? `The yard of Number Nine is quiet, and so is the cellar.` : `The yard of Number Nine is quiet. The cellar stair goes down into grey light.`],
      choices:[!f.k3Boss ? {label:'Down to the cellar', act: () => go('k3_cellar')} : null, back()].filter(Boolean)};
    const t = [`Number Nine's yard is cobbled and high-walled, with a crane and a cellar hatch. Sarne guards walk it in pairs.`];
    const b = kBarge();
    if (b === 'sunk') t.push(`The carts in the yard are empty. Word on the quay is that the last shard barge never arrived: some half-Sylvari girl sank it in the river. Voss has been shouting all evening.`, echo('wren', 'Wren sank Voss’s shard barge. Number Nine is half empty, and Voss is desperate.'));
    else if (b === 'crown') t.push(`Crown soldiers have the quay end of the street: Voss's last shard barge came into the Crown's water-gate instead of his, and now the Crown is watching. Voss is moving everything that's left into the cellar, fast.`, echo('wren', 'Wren steered Voss’s shard barge into the Crown’s water-gate. The Crown is watching Number Nine.'));
    const ch = [];
    if (f.factorTip || f.sideDoor) ch.push({label: f.factorTip ? 'Over the sail-loft roof, the way Dask said.' : 'In through the open side door.', act: () => { f.yardDone = true; f.yardHow = 'quiet'; S.notice = kXP(80); chron('You got into Number Nine without a fight.'); go('k3_cellar'); }});
    ch.push({label:'Go over the wall and through the guards.', act: () => startCombat('k3_yard')});
    ch.push(back());
    return {title:'Number Nine', text:t, choices:ch};
  }},
  k3_yardWin:{ enter(){ S.flags.yardDone = true; S.flags.yardHow = 'fight'; S.items.draught += 1; S.notice = 'You find a Healing Draught in the guard hut.'; }, view: () => ({
    title:'Number Nine',
    text:[`The yard is yours. Below the cellar hatch, grey light, and a hum you feel in your teeth.`],
    choices:[{label:'Down to the cellar', act: () => go('k3_cellar')}, back()]
  })},
  k3_cellar:{ view: () => {
    const b = kBarge();
    const t = [
      `The cellar of Number Nine is long and vaulted and full of crates, ${b === 'sunk' ? 'half of them empty' : 'stacked to the ceiling'}, and every crate hums. The air tastes like a thunderstorm.`,
      `Steward Voss is standing at a ledger desk with a lamp, in his good coat, counting. He looks up at you without much surprise. "Dunmore," he says. "I did tell Lord Corrin you were the kind who comes back."`,
      `Behind him, something stands up out of a nest of black stone. It was a man once. Now shards have grown through it like crystals through rock, and grey light leaks out of every seam. "We call him the Shard-Bound," Voss says. "He sleeps on the stock. He's very loyal to it."`,
      `<em>This will be a hard fight. Voss throws shard dust that greys you both; the Shard-Bound hits like a falling wall.</em>`
    ];
    return {title:'The Cellar of Number Nine', text:t, choices:[{label:'Fight Voss and the Shard-Bound', act: () => startCombat('k3_boss')}, {label:'Fall back and prepare', act: () => toMap('k3_quay')}]};
  }},
  k3_bossWin:{
    enter(){ if (S.flags.k3Boss) return; S.flags.k3Boss = true; },
    view: () => ({
      title:'The Cellar of Number Nine',
      text:[
        `The Shard-Bound comes apart all at once, like a dropped jar, and what's left on the floor is grey dust and a thin, tired man who's been dead a long time. You've seen that before, under Varrow.`,
        `Voss sits down at his ledger desk with his hands where you can see them. He's bleeding from the ear and still neat. "Well," he says. "What now? You can't sell them, and you can't eat them."`,
        `Above you, the hum of a hundred crates of Wardstone. Enough to crack another stone, or to prove to the whole city that someone already has.`
      ],
      choices:[{label:'Decide', go:'k3_choice'}]
    })
  },
  k3_choice:{ view: () => ({
    title:'The Cellar of Number Nine',
    text:[
      `You could haul it all up into the light: crates on the quay, Voss in chains on top of them, and every soul in the Salt Quay looking. By noon the whole city would know what House Sarne and the Arcanum have been doing. And the whole city would panic, and the Arcanum would burn every record it has before the Crown got to them.`,
      `Or you could keep the cellar shut and send for the Crown. Envoy Marrow, the Watch Captain: someone who'll take the stones and the steward quietly, and build a case. The city stays calm. And Corrin Sarne, who has friends on the Council, walks free until the case is built, if it ever is.`
    ],
    choices:[
      {label:'Expose it. Drag it all into the square.', act: () => { S.flags.hoard = 'exposed'; chron('You dragged House Sarne’s shard hoard and Steward Voss out onto the Salt Quay for all Corvane to see.'); go('k3_exposed'); }},
      {label:'Keep it quiet. Send for the Crown.', act: () => { S.flags.hoard = 'quiet'; chron('You handed House Sarne’s shard hoard and Steward Voss to the Crown, quietly.'); go('k3_quiet'); }}
    ]
  })},
  k3_exposed:{ view: () => ({
    title:'The Salt Quay',
    text:[
      `By dawn there are forty crates on the quay and Voss sitting on top of them in his good coat, tied to the crane. By mid-morning there are a thousand people around them. Somebody reads the Sarne seal on the crates out loud, and somebody else reads the Arcanum's mark, and then everybody is shouting.`,
      `The Watch comes, and can't get through the crowd. Across the city, smoke goes up from the Arcanum's Corvane house: they're burning their papers. In the Lantern Quarter, the Cathedral doors are open and the frightened are pouring in.`,
      `Brannoc stands beside you with his arms folded. "Well," he says. "They know now."`
    ],
    choices:[{label:'Continue', go:'k3_ending'}]
  })},
  k3_quiet:{ view: () => ({
    title:'The Salt Quay',
    text:[
      `The Watch Captain comes himself, with twenty men and a covered wagon, before dawn. They take Voss up the cellar stair in a hood. They take the crates out by the back door, one by one, and nobody on the Salt Quay sees a thing.`,
      `"The Council will hear of this," the captain says. "In the proper way, at the proper time." He doesn't look happy about it. "Corrin Sarne sits on that Council. The proper time may be a while."`,
      `By noon, Crown soldiers are posted on every door in the city that has anything to do with the Wardstones, including the stair down to the Lantern Cathedral's archive.`
    ],
    choices:[{label:'Continue', go:'k3_ending'}]
  })},
  k3_ending:{ view: () => {
    const f = S.flags;
    const t = [
      `That evening you climb to the top of the old town wall with Brannoc and look out over Corvane: the river, the dome of the Council House, the smoke from the Arcanum, the Lantern Cathedral's great dark bulk.`,
      f.toldBran ? `"Seven stones," Brannoc says. "And one city that knows it now." He passes you the flask.` : `"You're going to tell me now," Brannoc says. "What you saw under Varrow." And you do, finally, all of it. He listens to the end and then passes you the flask without a word.`,
      `In your vision there were three others on three roads, all walking toward this city. You think they're here now. Somewhere down there, among the towers.`,
      `<em>This is the end of Kael's part of Act 1. In Act 2, the four meet in Corvane.</em>`
    ];
    return {title:'The Old Town Wall', text:t, choices:[{label:'End of chapter 3', act: () => {
      setQ('gate', 'done', f.hoard === 'exposed' ? 'You got into Corvane and showed the whole city House Sarne’s shard hoard.' : 'You got into Corvane and gave House Sarne’s shard hoard to the Crown.');
      setQ('corvane', 'done', 'You reached Corvane.');
      quest('others', 'The others from the vision', 'Find the three strangers from your vision at the Wardstone. You think they’re in Corvane.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  k3_walls:{
    title:'Outside Corvane',
    blurb: () => `A shut city, a mile of tents and a river running under the wall.`,
    w:340, h:250,
    nodes:[
      {id:'k3_camp', label:'Brannoc’s Fire', x:50, y:200, sub:'Rest'},
      {id:'k3_tents', label:'Fever Camp', x:150, y:150, sub:'Sarne agents', done: () => S.flags.tentsDone},
      {id:'k3_watch', label:'Watch Gate', x:120, y:50, sub:'The Crown', done: () => S.flags.inCity},
      {id:'k3_water', label:'Water-Gate', x:285, y:190, sub:'Under the wall', done: () => S.flags.inCity},
      {id:'k3_enter', label:'Into Corvane', x:280, y:60, sub:'The Salt Quay', open: () => S.flags.inCity, lockText:'Find a way through the walls'}
    ],
    edges:[['k3_camp','k3_tents'],['k3_tents','k3_watch'],['k3_tents','k3_water'],['k3_watch','k3_enter'],['k3_water','k3_enter']]
  },
  k3_quay:{
    title:'The Salt Quay',
    blurb: () => `Warehouses, cranes and barges, and one cellar that hums.`,
    w:340, h:260,
    nodes:[
      {id:'k3_room', label:'The Gull’s Rest', x:50, y:210, sub:'Rest'},
      {id:'k3_find', label:'The Quay', x:140, y:150, sub:'Find the store', done: () => S.flags.foundStore},
      {id:'k3_factor', label:'Factor’s Office', x:60, y:80, sub:'Master Dask', open: () => S.flags.foundStore, done: () => S.flags.factorDone, lockText:'Find the store first'},
      {id:'k3_side', label:'The Alley', x:270, y:215, sub:'Behind Number Nine', open: () => S.flags.foundStore, lockText:'Find the store first'},
      {id:'k3_yard', label:'Number Nine', x:270, y:90, sub:'Steward Voss', open: () => S.flags.foundStore, done: () => S.flags.k3Boss, lockText:'Find the store first'}
    ],
    edges:[['k3_room','k3_find'],['k3_find','k3_factor'],['k3_find','k3_side'],['k3_find','k3_yard'],['k3_side','k3_yard']]
  }
});
SCENES.k3_enter = { view: () => ({title:'Inside the Walls', text:[`The Salt Quay is through the next street.`], choices:[{label:'Along the Salt Quay', act: () => toMap('k3_quay')}, back()]}) };

Object.assign(ENEMIES, {
  sarneagent:{name:'Sarne Agent', hp:34, dmg:[8,11], acc:72, dodge:6, armor:1, init:5, xp:40},
  tollman:{name:'Toll-Man', hp:34, dmg:[8,11], acc:70, dodge:4, armor:2, init:4, xp:40},
  sarneguard:{name:'Sarne Guard', hp:42, dmg:[9,12], acc:72, dodge:4, armor:3, init:4, xp:45},
  // Tuned by bot sim (150 runs): ~80% first-try wins at level 7 and ~93% at level 8 (the Dario-killed path arrives
  // at 8), the same for each of Wren's barge outcomes. Fights run 20–25 rounds.
  shardbound:{name:'The Shard-Bound', hp:170, dmg:[14,17], acc:70, dodge:0, armor:3, init:2, xp:200, hollow:true, greyChance:20,
    spec:{every:3, name:'Shard Crush', windup:'{n} raises both shard-grown fists, and grey light pours out of the seams.', mult:2.0, grey:2}},
  // Wren brought the barge to the Crown: Voss kept his full stock, and the Shard-Bound has been sleeping on all of it
  shardboundFull:{name:'The Shard-Bound', hp:200, dmg:[14,17], acc:70, dodge:0, armor:3, init:2, xp:200, hollow:true, greyChance:20,
    spec:{every:3, name:'Shard Crush', windup:'{n} raises both shard-grown fists, and grey light pours out of the seams.', mult:2.0, grey:2}},
  voss:{name:'Steward Voss', hp:80, dmg:[8,11], acc:76, dodge:8, armor:1, init:6, xp:200, ranged:true, row:'back',
    spec:{every:3, name:'Shard Dust', windup:'{n} opens a crate and scoops up a handful of glittering black dust.', mult:1.5, aoe:true, grey:2}},
  // Wren sank the barge: half the stock gone, Voss desperate, the dust comes faster
  vossDesperate:{name:'Steward Voss', hp:80, dmg:[8,11], acc:76, dodge:8, armor:1, init:6, xp:200, ranged:true, row:'back',
    spec:{every:2, name:'Shard Dust', windup:'{n} tears open a crate with shaking hands and scoops up the dust.', mult:1.4, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  k3_tents:{title:'The Fever Camp', enemies:() => ['sarneagent', 'sarneagent', 'xbow'], lethal:true, win:'k3_tentsWin', back:'k3_tents',
    intro:'The Sarne agents throw back their coats.'},
  k3_toll:{title:'The Water-Gate', enemies:() => ['tollman', 'tollman', 'tollman'], lethal:true, win:'k3_tollWin', back:'k3_water',
    intro:'The toll-men put down their dice and pick up their boathooks.'},
  k3_cart:{title:'The Sarne Cart', enemies:() => ['sarneguard', 'sarneguard'], lethal:true, win:'k3_cartWin', back:'k3_find',
    intro:'The cart guards draw.'},
  k3_yard:{title:'The Yard of Number Nine', enemies:() => otherF('ilsa').magister === 'crown' ? ['sarneguard', 'sarneguard', 'sarneguard', 'xbow'] : ['sarneguard', 'sarneguard', 'xbow'], lethal:true, win:'k3_yardWin', back:'k3_yard',
    intro:'The yard guards shout for the others.'},
  // Voss, the Shard-Bound and two guards. Wren's barge: sunk → Voss desperate (dust every 2) but only one guard
  // left; brought to the Crown → the Shard-Bound has the full stock to feed on.
  k3_boss:{title:'Steward Voss and the Shard-Bound', lethal:true, win:'k3_bossWin', back:'k3_cellar',
    enemies:() => {
      const b = otherF('wren').barge; const e = [b === 'crown' ? 'shardboundFull' : 'shardbound', 'sarneguard'];
      if (b !== 'sunk') e.push('sarneguard');
      e.push(b === 'sunk' ? 'vossDesperate' : 'voss');
      return e;
    },
    intro:'The Shard-Bound lurches out of its nest of stone. Voss steps back behind his desk.'}
});

// Chapter 3 echoes: Kael's own ending, and into Tamsin's, Ilsa's and Wren's
const _kaelEchoesK3 = HEROES.kael.echoes, _tamsinEchoesK3 = HEROES.tamsin.echoes, _ilsaEchoesK3 = HEROES.ilsa.echoes, _wrenEchoesK3 = HEROES.wren.echoes;
HEROES.kael.echoes = () => { const e = _kaelEchoesK3(); const f = S.flags;
  if (chapterOf(S) < 3) return e;
  if (f.cityHow) e.push({escort:'Kael came into Corvane under Envoy Marrow’s protection.', contract:'Kael showed the Watch Captain Corrin Sarne’s contract. The Watch knows what House Sarne buys.', brask:'Kael came into Corvane on the Iron Tally’s barge. Brask’s debt is paid.', lock:'Kael slipped into Corvane through the water-gate.', swim:'Kael swam into Corvane under the wall.', force:'Kael forced the water-gate into Corvane.'}[f.cityHow]);
  if (f.hoard === 'exposed') e.push('Kael dragged House Sarne’s shard hoard into the light. All Corvane knows, the Arcanum burned its records, and the city is frightened.');
  if (f.hoard === 'quiet') e.push('Kael gave House Sarne’s shard hoard and Steward Voss to the Crown, quietly. The city is calm, and Corrin Sarne is still on the Council.');
  return e; };
HEROES.tamsin.echoes = () => { const e = _tamsinEchoesK3(); const k = otherF('kael');
  if (k.hoard === 'exposed') e.push('<b>Linked:</b> Kael exposed the shard hoard on the Salt Quay. Corvane is frightened, and the Lantern Cathedral is full of people looking for answers.');
  if (k.hoard === 'quiet') e.push('<b>Linked:</b> Kael gave the shard hoard to the Crown quietly. Crown soldiers now guard every door in Corvane that touches the Wardstones, the Cathedral archive among them.');
  return e; };
HEROES.ilsa.echoes = () => { const e = _ilsaEchoesK3(); const k = otherF('kael');
  if (k.hoard === 'exposed' && S.flags.ledger) e.push('<b>Linked:</b> Kael exposed the shards on the Salt Quay, and the Arcanum burned its Corvane records. Ilsa’s ledger may be the only copy left.');
  if (k.factorTip) e.push('<b>Linked:</b> Kael used the name in Ilsa’s ledger to get into the Arcanum’s store.');
  return e; };
HEROES.wren.echoes = () => { const e = _wrenEchoesK3(); const k = otherF('kael');
  if (k.k3Boss) e.push('<b>Linked:</b> Kael beat Steward Voss in the cellar of Number Nine. Voss won’t be collecting any more keys.');
  return e; };

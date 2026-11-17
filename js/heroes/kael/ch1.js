// ---------- scenes ----------
// Each scene: { enter?(), view() -> {title, text:[html], choices:[{label, go?, act?, req?, tag?}]} }
const back = (label) => ({label: label || 'Back to the map', act: () => toMap(S.map)});
const SCENES = {
  intro:{ view: () => ({
    title:'Varrow, Before Sundown',
    text:[
      `Varrow never sleeps in summer. The heat sits on the city like a hand, and every night forty thousand people pack the Grand Arena to watch someone bleed.`,
      `Tonight it's supposed to be you.`,
      `Six years ago your father, Joren Dunmore, borrowed three thousand crowns from House Sarne to save a failing forge. The forge failed anyway. Then the fever took him, and the debt became yours. The arena pays by the bout. You have paid down everything but the last 340 crowns.`,
      `Tonight is a blood bout against a fighter from House Sarne itself. Win, and the purse clears the debt. Lose, and you may not need to worry about debts at all.`
    ],
    choices:[{label:'Continue', go:'build'}]
  })},
  build:{ view: () => ({
    title:'Kael Dunmore',
    text:[
      `You are <em>Kael Dunmore</em>: human, swordsman, twenty-six years old and level 1. You hit hard, you wear heavy armor well, and you have never once asked anyone for help.`,
      `Humans can learn any skill at the same cost and earn an extra skill point every level. <em>You have ${S.skillPts} unspent skill point${S.skillPts === 1 ? '' : 's'}.</em> Some things ahead can only be done with the right skill: reading old writing, picking a lock, talking a guard down. A choice that needs a skill shows a tag like <span class="tag ok">Lore 1</span>.`,
      `Spend your points now, or save them for later. Open the character sheet any time from the top bar.`
    ],
    choices:[
      {label:'Open the character sheet', act: () => openSheet()},
      {label:'Go down to the arena warrens', act: () => { quest('debt', 'Pay the last of the debt', 'Win tonight’s blood bout. The purse clears the last 340 crowns your father owed House Sarne.'); toMap('arena'); }}
    ]
  })},

  // --- Arena hub spots ---
  barracks:{ view: () => ({
    title:'The Fighters’ Barracks',
    text:[
      `Your bunk sits at the end of a long room that smells of sweat and liniment. Under the straw is the only thing you own worth stealing: your father's signet ring, a hammer over an anvil.`,
      `He was a smith, not a fighter. You never let yourself forget that you became the second thing because he failed at the first.`,
      S.pc.hp < pcMax() ? `You could lie down for an hour. The bout isn't until sundown.` : `You're rested and ready. There's nothing to do here but wait.`
    ],
    choices:[
      S.pc.hp < pcMax() ? {label:'Rest a while (restores health)', act: () => { S.pc.hp = pcMax(); S.notice = 'You rest. Your health is fully restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  yard:{ view: () => S.flags.sparred ? ({
      title:'The Training Yard',
      text:[`Tarrek is coiling his net in the shade. "Go win your bout, Dunmore. Then buy me a drink."`],
      choices:[back()]
    }) : ({
      title:'The Training Yard',
      text:[
        `Tarrek the Net is working the practice posts, his weighted net hissing through the air. He's a Varrow lifer, older than you, with a grin that's missing two teeth.`,
        `"Warm up with me? Wooden blades, blunt net. First to yield." He tosses you a practice sword. "Unless you're saving yourself for the Sarne boy."`
      ],
      choices:[
        {label:'Spar with Tarrek (a practice fight, no real danger)', act: () => startCombat('spar')},
        {label:'Not now', act: () => toMap('arena')}
      ]
    })
  },
  sparWin:{ view: () => ({
    title:'The Training Yard',
    text:[
      `Tarrek sits down hard in the sand and laughs. "Fine, fine. You're ready."`,
      `As you help him up, he lowers his voice. "Something for free. Every good fighter shows you the big swing a breath before it lands. A shift of the feet, a step back into high guard. When you see it, get your shield up. <em>Defend</em>, and the worst of it slides off."`
    ],
    choices:[back()]
  })},
  sparLose:{ view: () => ({
    title:'The Training Yard',
    text:[
      `You taste sand. Tarrek stands over you, grinning, and offers a hand.`,
      `"Lucky for you I'm not Dario Sarne. Here's the trick: every good fighter shows you the big swing a breath before it lands. When you see it coming, <em>Defend</em>, and the worst of it slides off your shield."`,
      `You can rest in the barracks before the bout.`
    ],
    choices:[back()]
  })},
  infirmary:{
    enter(){ if (!S.flags.metBran){ S.flags.metBran = true; S.items.draught += 2; S.notice = 'Brannoc gives you 2 Healing Draughts.'; } },
    view: () => ({
      title:'The Infirmary',
      text: S.flags.branTalked ? [
        `Brannoc is rolling bandages. "Anything else, or are you going to stand there and make me nervous?"`
      ] : [
        `Brannoc has patched you up after every bout for three years. He was a soldier before that, in the Crown's wars up north, and he still stands like one: straight-backed, grey-bearded, unimpressed.`,
        `He presses two stoppered bottles into your hands without being asked. "Healing draughts. Drink one when you're bleeding, not after you're dead. You'd be amazed how many of you get that backwards."`
      ],
      choices:[
        {label:'"What do you know about House Sarne?"', go:'branSarne'},
        {label:'"Is it true there are tunnels under the arena?"', go:'branTunnels'},
        S.flags.askedTunnels ? Object.assign({label:'"You said the stone hums. What stone?"', go:'branStone'}, chk('lore', 1)) : null,
        back()
      ].filter(Boolean)
    })
  },
  branSarne:{ enter(){ S.flags.branTalked = true; }, view: () => ({
    title:'The Infirmary',
    text:[
      `"Old Lord Sarne is dying, and everyone knows it. Two sons. Corrin, the elder, runs the money. Dario, the younger, wants to be a hero in a song." He snorts. "Guess which one is fighting you tonight."`,
      `"Here's what bothers me. Lords' sons don't fight blood bouts. Somebody wanted Dario out on that sand, and I doubt it was his mother."`
    ],
    choices:[{label:'Ask something else', go:'infirmary'}, back()]
  })},
  branTunnels:{ enter(){ S.flags.branTalked = true; S.flags.askedTunnels = true; }, view: () => ({
    title:'The Infirmary',
    text:[
      `"Tunnels, cisterns, old drains. The arena sits on top of a city older than Varrow. Most of it's flooded or full of rats the size of dogs."`,
      `He hesitates. "And the deepest part hums. The stone itself. You put your hand on the wall and you can feel it in your teeth. Don't laugh."`
    ],
    choices:[{label:'Ask something else', go:'infirmary'}, back()]
  })},
  branStone:{ enter(){ S.flags.heardWard = true; }, view: () => ({
    title:'The Infirmary',
    text:[
      `You remember the old stories. Seven stones, raised by every race together, to hold something down under the land. The Wardstones.`,
      `Brannoc looks at you sharply. "Priests' tales. That's what I told myself in the army, too, until I saw one up north. Grey all around it, for a mile. Nothing grew." He goes back to his bandages. "If the arena's built on one of those, I'd rather not know."`
    ],
    choices:[{label:'Ask something else', go:'infirmary'}, back()]
  })},
  office:{ view: () => {
    if (S.flags.dealDone) return {
      title:'The Fight-master’s Office',
      text:[`The office is empty now. Voss's chair is pushed back, and the ledger on the desk is open to tonight's bout. Someone has written the result in already: <em>Dunmore</em>.`],
      choices:[back()]
    };
    const deal = [
      {label:'Take the deal, and the Sarne blade.', act: () => { S.flags.dealDone = true; S.flags.tookBlade = true; S.gear.sword = 1; S.gear.swordName = 'Sarne blade'; chron('You took Steward Voss’s deal and fought with a Sarne blade.'); go('officeAfter'); }},
      {label:'Take the deal, but fight with your father’s sword.', act: () => { S.flags.dealDone = true; S.flags.keptSword = true; chron('You took Steward Voss’s deal but kept your father’s sword.'); go('officeAfter'); }},
      {label:'Refuse. You’ll win this bout on your own terms.', act: () => { S.flags.dealDone = true; S.flags.keptSword = true; S.flags.refusedDeal = true; chron('You refused Steward Voss’s deal.'); go('officeAfter'); }}
    ];
    return {
      title:'The Fight-master’s Office',
      text:[
        `Fight-master Oszin isn't at his desk. Instead, a thin man in Sarne green sits there with his fingers steepled, as if he owns the room. Maybe he does.`,
        `"Kael Dunmore. I am Voss, steward to Lord Corrin Sarne." He slides a paper across the desk. It's your father's debt, signed, with the last 340 crowns circled. "My lord makes you an offer. Give his brother a good show. Let Dario land a few blows and look like a hero for the crowd. Then win. Do that, and this debt is cleared tonight, whatever happens."`,
        `He lifts a long bundle from beside the chair and unwraps it: a beautiful sword, Sarne green on the grip. "Also, my lord insists both fighters use house steel tonight. For the look of the thing."`,
        S.flags.probed ? `<em>He still hasn't explained why a lord would pay you to beat his own brother.</em>` : ''
      ].filter(Boolean),
      choices: S.flags.probed ? deal : [Object.assign({label:'"Why would Corrin pay me to beat his own brother?"', act: () => { S.flags.probed = true; go('officeProbe'); }}, chk('leadership', 1))].concat(deal)
    };
  }},
  officeProbe:{ view: () => ({
    title:'The Fight-master’s Office',
    text:[
      `You lean on the desk and let the silence stretch the way your father did with customers who were lying about their payment dates.`,
      `Voss's smile doesn't move, but his eyes flick to the door. "Lord Corrin wishes his brother to learn humility. Publicly." A pause, a beat too long. "And Lord Corrin is very generous to people who don't ask questions."`,
      `<em>He's lying, or at least he's not telling you all of it.</em>`
    ],
    choices:[{label:'Decide on the offer', go:'office'}]
  })},
  officeAfter:{ view: () => ({
    title:'The Fight-master’s Office',
    text:[
      S.flags.refusedDeal
        ? `Voss rolls the paper up slowly. "Then may the sand be kind to you, Dunmore." He leaves the Sarne blade on the desk as he goes, as if he expects you to change your mind.`
        : S.flags.tookBlade
          ? `"Excellent." Voss hands you the Sarne blade hilt-first. It's lighter than your father's sword and keener. You'd never afford steel like this in a lifetime of bouts. "Sundown, then. Make it a good show."`
          : `Voss's smile thins. "As you wish. Your old sword, then." He rolls up the paper. "Sundown. Make it a good show."`,
      `The bout is ready. When you're prepared, go to the <em>Sand Gate</em>.`
    ],
    choices:[back()]
  })},
  gate:{ view: () => ({
    title:'The Sand Gate',
    text:[
      `Beyond the iron gate, forty thousand people are already chanting. The sound comes through the stone like weather.`,
      `Once you walk out, there is no coming back to the warrens tonight.`,
      S.pc.hp < pcMax() ? `<em>You're not at full health. You can rest in the barracks first.</em>` : '',
      S.skillPts > 0 ? `<em>You have unspent skill points.</em>` : ''
    ].filter(Boolean),
    choices:[
      {label:'Go to the arming room', go:'arming'},
      {label:'Not yet', act: () => toMap('arena')}
    ]
  })},
  arming:{ view: () => {
    const sarne = S.flags.tookBlade && !S.flags.bladeChecked;
    const own = !S.flags.tookBlade && !S.flags.bladeChecked;
    const text = [`In the arming room under the Sand Gate, an attendant buckles your armor and hands you your shield.`];
    if (S.flags.tookBlade && !S.flags.bladeChecked) text.push(`The Sarne blade lies across the rack, gleaming. In the torchlight there's something dull along the fuller, like a thumbprint on glass.`);
    if (!S.flags.tookBlade && !S.flags.bladeChecked) text.push(`Your father's sword hangs on the rack. It isn't quite where you left it. Somebody has moved it.`);
    if (S.flags.bladeChecked) text.push(`Your father's sword is clean and sharp. You know exactly what's on it now: nothing.`);
    text.push(`Above you, a horn sounds. The crowd goes quiet for exactly one breath, then roars.`);
    const choices = [];
    if (sarne) choices.push(Object.assign({label:'Look closely at the Sarne blade.', go:'bladePoison'}, chk('lore', 1)));
    if (own) choices.push({label:'Check your sword.', go:'swordPoison', req: () => sk('survival') >= 1 || sk('lore') >= 1, tag:'Survival 1 or Lore 1'});
    choices.push({label:'Walk out onto the sand.', act: () => { S.flags.poisonedBlade = !S.flags.bladeChecked; startCombat('bout'); }});
    return {title:'The Arming Room', text, choices};
  }},
  bladePoison:{ view: () => ({
    title:'The Arming Room',
    text:[
      `You tilt the blade to the torch. Along the fuller is an oily sheen, and up close it smells like burnt licorice.`,
      `<em>Blackroot.</em> You've read about it in Brannoc's old herbal. A nick is enough, and it takes an hour to work. Long enough for the bout to end, and for forty thousand people to watch you win.`
    ],
    choices:[{label:'Leave the Sarne blade. Fight with your father’s sword.', act: () => { S.flags.bladeChecked = true; S.gear.sword = 0; S.gear.swordName = "Father's sword"; chron('You found blackroot poison on the Sarne blade and left it behind.'); go('arming'); }}]
  })},
  swordPoison:{ view: () => ({
    title:'The Arming Room',
    text:[
      `You take the sword down and run a thumb along the flat. It comes away greasy and dark, and it smells like burnt licorice.`,
      `<em>Blackroot.</em> A nick is enough, and it takes an hour to work. Somebody wanted whoever you cut tonight to die after the bout, with your blade to blame.`
    ],
    choices:[{label:'Scrub the blade clean with lamp oil and a rag.', act: () => { S.flags.bladeChecked = true; chron('You found blackroot poison on your own sword and cleaned it off.'); go('arming'); }}]
  })},
  boutEnd:{ view: () => ({
    title:'The Sands of Varrow',
    text:[
      `Dario goes down on one knee, his sword arm hanging, gilded armor dented and dusty. He looks up at you, and for the first time tonight he looks his age, which is about twenty.`,
      `The crowd is on its feet, screaming for it to end the old way. In the Sarne box, a pale man in green leans forward on the rail: Corrin Sarne. Voss stands at his shoulder. Neither of them looks worried.`,
      `The arena master waits for your choice.`
    ],
    choices:[
      {label:'Lower your blade. Let him yield.', act: () => { S.flags.dario = 'spared'; go('aftermath'); }},
      {label:'Finish it. The crowd wants it, and House Sarne already owns you.', act: () => { S.flags.dario = 'killed'; go('aftermath'); }}
    ]
  })},
  aftermath:{
    enter(){
      setQ('debt', 'failed', 'The debt doesn’t matter anymore. House Sarne framed you.');
      quest('escape', 'Escape the arena', 'You are locked in the deep cells beneath the Grand Arena, to be hanged at dawn.');
      const f = S.flags;
      if (f.dario === 'killed'){ chron('You killed Dario Sarne in the blood bout.'); }
      else if (f.poisonedBlade){ f.darioPoisoned = true; chron('You spared Dario Sarne, but the blackroot on your blade nearly killed him.'); }
      else { f.darioAlly = true; chron('You spared Dario Sarne. He knows you didn’t poison him.'); }
    },
    view: () => {
      const f = S.flags; let text;
      if (f.dario === 'killed') text = [
        `It's over in a heartbeat. The roar that follows is the loudest thing you've ever heard.`,
        `It turns into screaming. Guards pour onto the sand. Voss is at the rail of the Sarne box, pointing at you. "Murder! He was paid to kill Lord Sarne's brother! Check his belt!"`,
        `There is a purse of gold on your belt that you did not put there. They take your sword, they take your shield, and they drag you down into the dark.`
      ];
      else if (f.darioPoisoned) text = [
        `You step back and lower your blade. Dario stares at you, then laughs, a little shakily, and raises his hand to yield. The crowd boos.`,
        `Then he coughs. Black foam at his lips. The cut on his arm, from your blade, has gone dark at the edges. <em>Blackroot.</em>`,
        `"Poison!" Voss is already shouting from the Sarne box, as if he'd been waiting. "The Dunmore boy poisoned my lord's brother!" Healers carry Dario off the sand, still breathing. Guards drag you the other way, down into the dark.`
      ];
      else text = [
        `You step back and lower your blade. Dario stares at you, then grins, and raises his hand to yield. The crowd boos. You don't care.`,
        `As you turn away, he staggers. His face is grey. He drank something before the bout, from a cup Voss handed him. "Poison!" Voss shouts, right on time. "The Dunmore boy poisoned my lord's brother!"`,
        `The guards reach you first. As they drag you past, Dario grabs your wrist, hard. "Not you," he gasps. "It was in my cup. <em>Corrin</em>..." Then healers are carrying him one way and guards are hauling you the other, down into the dark.`
      ];
      return {title:'The Sands of Varrow', text, choices:[{label:'Continue', go:'cell'}]};
    }
  },
  cell:{ view: () => {
    const f = S.flags;
    const text = [
      `The deep cells are older than the arena: rough stone, iron bars gone orange with rust, water dripping somewhere you can't see. You'll hang at dawn, before the morning bouts, so the crowd can watch.`,
      `Hours pass. Then a shadow at the bars: Brannoc. "I'm too old to watch another good fighter hang," he mutters. He presses a bent iron pin into your hand. "Guard changes at third bell. Get yourself out of that cell. I'll be waiting at the bend past the guard room." Then he's gone.`
    ];
    if (f.darioAlly) text.push(`Later, a girl in Sarne livery creeps down the stairs, trembling, and slips a heavy key through the bars. "From Lord Dario," she whispers. "He says he owes you his life."`);
    text.push(`The only guard left is a boy named Pell, sixteen at most, pretending not to watch you.`);
    const ch = [];
    if (f.darioAlly) ch.push({label:'Use Dario’s key.', act: () => { f.escape = 'key'; go('cellOut'); }});
    ch.push(Object.assign({label:'Pick the lock with Brannoc’s pin.', act: () => { f.escape = 'pick'; go('cellOut'); }}, chk('lockpick', 1)));
    ch.push(Object.assign({label:'Talk to Pell.', act: () => { f.escape = 'pell'; go('cellOut'); }}, chk('leadership', 1)));
    ch.push({label:'Wrench the rusted bars loose. (Loud, and it will hurt.)', act: () => { f.escape = 'bars'; f.noisy = true; S.pc.hp = Math.max(1, S.pc.hp - 8); go('cellOut'); }});
    return {title:'The Deep Cells', text, choices:ch};
  }},
  cellOut:{
    enter(){
      S.ally.joined = true; S.ally.hp = allyMax();
      S.notice = 'Brannoc joins you. He fights from the back row with a sling and can Bandage wounds.';
      setQ('escape', 'active', 'Get through the tunnels beneath the arena and out of Varrow before dawn.');
      const e = S.flags.escape;
      chron(e === 'key' ? 'You escaped your cell with Dario Sarne’s key.' : e === 'pick' ? 'You picked the lock of your cell.' : e === 'pell' ? 'You talked the young guard Pell into letting you go.' : 'You tore the bars of your cell loose. Everyone heard.');
    },
    view: () => {
      const e = S.flags.escape; let first;
      if (e === 'key') first = `The key turns as if it's been oiled. Maybe it has. You slip out while Pell is looking the other way.`;
      else if (e === 'pick') first = `Brannoc's pin is bent just right. It takes four tries and a lot of quiet swearing, then the lock gives with a click you feel in your wrist.`;
      else if (e === 'pell') first = `You talk to Pell about nothing for a while: his mother, the heat, the bouts. Then about your father, and the debt, and the purse somebody else put on your belt. Pell is quiet for a long time. Then he unlocks the door, drops the keys and runs.`;
      else first = `You brace a foot against the wall and pull. Rust grinds. Something in your shoulder screams. With a shriek of iron the bars tear free from the rotten stone, and the noise rolls down every corridor in the place. <em>(You lose 8 health.)</em>`;
      return {
        title:'The Deep Cells',
        text:[first,
          `Brannoc is waiting at the bend past the guard room, an old soldier's sling looped through his belt and a satchel of bandages over his shoulder. "Took you long enough. They'll find the cell empty in an hour. The only way out is down."`
        ],
        choices:[{label:'Into the tunnels', act: () => toMap('tunnels')}]
      };
    }
  },

  // --- Tunnels hub spots ---
  cells:{ view: () => ({title:'The Deep Cells', text:[`Your empty cell. Nothing here but rust and a bad night's memories.`], choices:[back()]}) },
  guard:{ view: () => S.flags.guardDone ? ({
      title:'The Guard Room', text:[`Overturned chairs and a spilled game of dice. Your old cell keys hang on the wall, no use to anyone now.`], choices:[back()]
    }) : ({
      title:'The Guard Room',
      text:[
        S.flags.noisy ? `The guard room door is already open, and the jailers are on their feet with a crossbow loaded. They heard the bars.`
          : S.flags.escape === 'pell' ? `Lamplight spills from the guard room. Pell's stool is empty, so there's one fewer of them than there should be. The rest are dicing at the table.`
          : `Lamplight spills from the guard room. Jailers are dicing at the table, a crossbow leaning against the wall beside them.`,
        `Your sword and shield hang on a peg behind them. The only way to the lower tunnels is through that room.`
      ],
      choices:[{label:'Fight your way through', act: () => startCombat('guard')}, back('Back off for now')]
    })
  },
  guardWin:{ enter(){ S.flags.guardDone = true; S.items.draught += 1; S.notice = 'You find 1 Healing Draught in the jailers’ cupboard.'; }, view: () => ({
    title:'The Guard Room',
    text:[`You take your sword and shield back from the peg. Brannoc rifles the jailers' cupboard and comes up with a bottle. "Prison healers' stock. Better than nothing."`, `Beyond the guard room, the tunnels open up into the old city under Varrow.`],
    choices:[back()]
  })},
  junction:{ view: () => ({
    title:'The Junction',
    text:[
      `Five tunnels meet under a dome of old brick, older than anything above. Water drips. Deep down, below your feet, the stone hums. You can feel it in your teeth, just like Brannoc said.`,
      `It's quiet here. A good place to catch your breath.`
    ],
    choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest while Brannoc patches you up (restores health)', act: () => { S.pc.hp = pcMax(); S.ally.hp = allyMax(); S.notice = 'Brannoc patches you both up. Your health is fully restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  cistern:{ view: () => S.flags.cisternDone ? ({
      title:'The Flooded Cistern', text:[`Black water, still now. Nothing moves in it anymore.`], choices:[back()]
    }) : ({
      title:'The Flooded Cistern',
      text:[
        `Steps lead down into black water, waist deep. Something glints at the bottom: bronze, maybe. Something else moves near the far wall.`,
        `Rats, the size of dogs. Their eyes are filmed grey, like the eyes of something sick.`
      ],
      choices:[{label:'Wade in', act: () => startCombat('rats')}, back('Leave it')]
    })
  },
  cisternWin:{ enter(){ S.flags.cisternDone = true; S.gear.armor += 1; S.gear.shieldName = 'Old Varrow shield'; S.items.tonic += 1; S.notice = 'You found the Old Varrow shield (+1 armor) and a Bitter Tonic.'; }, view: () => ({
    title:'The Flooded Cistern',
    text:[
      `Half sunk in the silt is a gladiator's shield of old Varrow bronze, heavier and better than yours. Brannoc fishes a sealed bottle out of a dead smuggler's pack.`,
      `"Bitter Tonic," he says, sniffing it. "Burns out poison, bleeding, and whatever that grey sickness is the rats had. Keep it."`
    ],
    choices:[back()]
  })},
  cache:{ view: () => S.flags.cacheDone ? ({
      title:'The Smugglers’ Cache', text:[`Empty crates and straw. The green tower of House Sarne is stamped on every lid.`], choices:[back()]
    }) : ({
      title:'The Smugglers’ Cache',
      text:[
        `A side passage ends at a stout door with a new lock on old hinges. Smugglers. Through the boards you can hear two men arguing about money.`
      ],
      choices:[
        Object.assign({label:'Pick the lock quietly and slip in while they’re distracted.', act: () => { S.flags.cacheQuiet = true; go('cacheIn'); }}, chk('lockpick', 1)),
        {label:'Kick the door in.', act: () => startCombat('thugs')},
        back('Leave it')
      ]
    })
  },
  cacheIn:{
    enter(){
      if (S.flags.cacheDone) return;
      S.flags.cacheDone = true; S.flags.shards = true; S.items.draught += 2; S.gold += 30;
      S.notice = 'You found 2 Healing Draughts and 30 crowns.';
      quest('sarne', 'Expose House Sarne', 'House Sarne is chipping pieces off the Wardstone under the arena and smuggling them out. Find out who is buying, and prove it.');
      chron('You found House Sarne’s crates of Wardstone shards beneath the arena.');
    },
    view: () => ({
      title:'The Smugglers’ Cache',
      text:[
        S.flags.cacheQuiet ? `You ease the door open. The smugglers are in a back room, still arguing. You have the cache to yourself.` : `When it's over, you have the cache to yourselves.`,
        `Crates line the walls, stamped with the green tower of House Sarne. Inside, packed in straw, are shards of black stone veined with silver. They're cold enough to sting your fingers, and they give off a faint grey light.`,
        `Someone has been chipping pieces off something old and selling them.`,
        S.flags.darioAlly ? `<em>This is what Corrin has been hiding. Dario would want to know.</em>` : `Brannoc picks one up and drops it fast, shaking his hand. "That's not ordinary stone, lad."`
      ],
      choices:[back()]
    })
  },
  sealed:{ view: () => ({
    title:'The Sealed Door',
    text:[
      `At the bottom of the lowest tunnel is a round door of black stone, standing open a hand's width. Fresh chisel marks scar its edge. Someone forced it, recently, from this side.`,
      `The humming is loud here. Beyond the gap, grey light moves like smoke.`,
      S.flags.readCarving ? `<em>THIRD OF SEVEN. HERE THE WARD HOLDS.</em> And scratched underneath: <em>S. 40 crowns a shard.</em>` : `Letters are carved in a ring around the door, worn almost smooth.`
    ],
    choices:[
      !S.flags.readCarving ? Object.assign({label:'Read the carving.', act: () => { S.flags.readCarving = true; chron('You read the carving: this is the Third of Seven Wardstones, and someone is paying 40 crowns a shard.'); render(); }}, chk('lore', 1)) : null,
      {label:'Squeeze through the door.', go:'chamber'},
      back()
    ].filter(Boolean)
  })},
  chamber:{ enter(){ S.flags.sealedDone = true; }, view: () => ({
    title:'The Wardstone',
    text:[
      `Past the door is a round chamber. In the middle stands a pillar of black stone taller than two men, veined with silver, split by a crack you could fit your hand into. Grey light leaks from the crack like smoke. Chunks have been chiseled off its base.`,
      `Something stands in front of it. It was a man once, an arena slave, by the iron collar. Now his skin is the color of ash and his eyes are empty grey. Two smaller lights drift around him like moths around a lamp.`,
      `He turns toward you. He doesn't blink.`,
      `<em>This will be a hard fight. You can back away and rest at the junction first.</em>`
    ],
    choices:[
      {label:'Fight the Grey Warden', act: () => startCombat('boss')},
      {label:'Back away and prepare', act: () => toMap('tunnels')}
    ]
  })},
  vision:{
    enter(){ S.flags.bossDone = true; S.pc.skills.wardlore = 1; S.notice = 'You learned Wardlore 1.'; },
    view: () => ({
      title:'The Wardstone',
      text:[
        `The Warden falls, and the grey drains out of him like water out of cloth. What's left is only a thin, tired man who has been dead for a long time.`,
        `You don't decide to touch the Wardstone. Your hand is just there, on the cold silver vein, and the hum goes through you like a bell.`,
        `You see the whole Reach from above, the way a hawk would. A girl with ink-stained hands holding a book that burns without burning. A stone-skinned healer kneeling in grey snow. An archer in the dark of a forest, guarding a crate that glows.`,
        `And under all of it, under everything, something vast and patient and hungry, turning over in its sleep.`,
        `You come back gasping on the floor. Brannoc is gripping your shoulder. "You've gone white as milk, lad. What did you see?"`
      ],
      choices:[
        {label:'Tell him everything.', act: () => { S.flags.toldBran = true; chron('You told Brannoc about your vision at the Wardstone.'); go('ending'); }},
        {label:'"Nothing. Let’s go."', act: () => { S.flags.toldBran = false; chron('You kept your vision at the Wardstone to yourself.'); go('ending'); }}
      ]
    })
  },
  ending:{ view: () => ({
    title:'The Old Drain',
    text:[
      S.flags.toldBran
        ? `Brannoc listens to all of it without interrupting. When you finish, he's quiet a long time. "Seven stones," he says finally. "And somebody's selling this one by the pound."`
        : `Brannoc doesn't push. He just watches you sidelong the whole way up the drain, the way he watches a fighter who's hiding a wound.`,
      `The old drain empties into the river below the city walls. You climb out into dawn. Behind you, the bells of Varrow ring for an execution that isn't going to happen.`,
      `"North," Brannoc says. "Corvane. If that stone's cracking and House Sarne is selling the pieces, the Crown needs to know." He spits into the river. "Or somebody does."`
    ],
    choices:[{label:'End of Kael’s chapter', act: () => { setQ('escape', 'done', 'You escaped Varrow through the old drain.'); quest('corvane', 'Go north to Corvane', 'Find someone in the capital who will listen about the Wardstone.'); S.mode = 'end'; save(); render(); }}]
  })}
};

// ---------- maps ----------
const MAPS = {
  arena:{
    title:'The Grand Arena of Varrow',
    blurb: () => `The blood bout starts at sundown. Until then, the warrens beneath the stands are yours.`,
    w:340, h:240,
    nodes:[
      {id:'barracks', label:'Barracks', x:60, y:60, sub:'Rest'},
      {id:'yard', label:'Training Yard', x:170, y:40, sub:'Tarrek', done: () => S.flags.sparred},
      {id:'infirmary', label:'Infirmary', x:285, y:60, sub:'Brannoc', done: () => S.flags.metBran},
      {id:'office', label:'Fight-master’s Office', x:95, y:170, sub:'A visitor', done: () => S.flags.dealDone},
      {id:'gate', label:'The Sand Gate', x:250, y:175, sub:'The bout', open: () => S.flags.dealDone, lockText:'Visit the office first'}
    ],
    edges:[['barracks','yard'],['yard','infirmary'],['barracks','office'],['office','gate'],['infirmary','gate'],['yard','gate']]
  },
  tunnels:{
    title:'Beneath the Arena',
    blurb: () => `Somewhere below, the stone hums. Dawn is coming, and so are the guards.`,
    w:340, h:270,
    nodes:[
      {id:'cells', label:'Deep Cells', x:45, y:40, sub:'Where you started', done: () => true},
      {id:'guard', label:'Guard Room', x:150, y:40, sub:'Jailers', done: () => S.flags.guardDone},
      {id:'junction', label:'The Junction', x:190, y:120, sub:'Rest', open: () => S.flags.guardDone, lockText:'Past the guard room'},
      {id:'cistern', label:'Flooded Cistern', x:65, y:160, sub:'Optional', open: () => S.flags.guardDone, done: () => S.flags.cisternDone, lockText:'Past the guard room'},
      {id:'cache', label:'Smugglers’ Cache', x:275, y:55, sub:'Optional', open: () => S.flags.guardDone, done: () => S.flags.cacheDone, lockText:'Past the guard room'},
      {id:'sealed', label:'Sealed Door', x:185, y:215, sub:'The way down', open: () => S.flags.guardDone, lockText:'Past the guard room'},
      {id:'chamber', label:'Wardstone', x:290, y:200, sub:'Something waits', open: () => S.flags.sealedDone, done: () => S.flags.bossDone, lockText:'Through the sealed door'}
    ],
    edges:[['cells','guard'],['guard','junction'],['junction','cistern'],['junction','cache'],['junction','sealed'],['sealed','chamber']]
  }
};


// ---------- Kael's fights ----------
const ENEMIES = {
  tarrek:{name:'Tarrek the Net', hp:26, dmg:[5,8], acc:72, dodge:6, armor:1, init:5, xp:40,
    spec:{every:3, name:'Net Throw', windup:'{n} starts whirling his net overhead.', mult:0.6, stun:true}},
  dario:{name:'Dario Sarne', hp:50, dmg:[8,12], acc:76, dodge:10, armor:2, init:7, xp:90,
    spec:{every:3, name:'Falcon Strike', windup:'{n} steps back into a high guard, blade raised.', mult:1.8}},
  jailer:{name:'Jailer', hp:28, dmg:[7,10], acc:70, dodge:4, armor:2, init:4, xp:30},
  xbow:{name:'Crossbowman', hp:16, dmg:[6,9], acc:72, dodge:6, armor:0, init:6, xp:30, ranged:true, row:'back'},
  rat:{name:'Tunnel Rat', hp:10, dmg:[4,6], acc:75, dodge:15, armor:0, init:8, xp:12, bleed:25},
  thug:{name:'Sarne Thug', hp:26, dmg:[6,9], acc:70, dodge:5, armor:1, init:4, xp:25,
    spec:{every:4, name:'Haymaker', windup:'{n} winds up a huge swing.', mult:1.7}},
  warden:{name:'Grey Warden', hp:115, dmg:[10,14], acc:72, dodge:4, armor:3, init:3, xp:150,
    spec:{every:3, name:'Grey Crush', windup:'{n} draws grey light into its fists.', mult:2.1, grey:3}},
  wisp:{name:'Grey Wisp', hp:15, dmg:[3,5], acc:78, dodge:20, armor:0, init:9, xp:20, ranged:true, row:'back', greyChance:35}
};
const COMBATS = {
  spar:{title:'Sparring: Tarrek the Net', enemies:() => ['tarrek'], lethal:false, win:'sparWin', lose:'sparLose', loseXP:20, back:'yard', done: () => { S.flags.sparred = true; },
    intro:'Wooden blades and a blunt net. First to yield.'},
  bout:{title:'Blood Bout: Dario Sarne', enemies:() => ['dario'], lethal:true, win:'boutEnd', back:'arming',
    intro:'Dario Sarne strides out in gilded armor, grinning like a man who has never lost. The crowd chants his name.'},
  guard:{title:'The Guard Room', enemies:() => { const e = ['jailer', 'jailer', 'xbow']; if (S.flags.noisy) e.unshift('jailer'); if (S.flags.escape === 'pell') e.shift(); return e; }, lethal:true, win:'guardWin', back:'guard',
    intro:'The jailers come at you with clubs. The crossbowman stays back.'},
  rats:{title:'The Flooded Cistern', enemies:() => ['rat', 'rat', 'rat'], lethal:true, flee:true, win:'cisternWin', back:'cistern',
    intro:'The rats come through the water fast, low and silent.'},
  thugs:{title:'The Smugglers’ Cache', enemies:() => ['thug', 'thug'], lethal:true, flee:true, win:'cacheIn', back:'cache',
    intro:'The door bangs open. Two big men in Sarne green grab for their cudgels.'},
  boss:{title:'The Grey Warden', enemies:() => ['warden', 'wisp', 'wisp', 'wisp'], lethal:true, win:'vision', back:'chamber',
    intro:'The Warden steps forward. The wisps drift behind it, out of reach of your sword while it stands.'}
};
HEROES.kael.echoes = () => {
  const f = S.flags; const e = [];
  if (f.dario === 'killed') e.push('Kael is a murderer in Varrow now. House Sarne will spare no coin hunting him, and Wren will hear the price on his head.');
  else if (f.darioAlly) e.push('Dario Sarne lives, and he knows his own brother poisoned him. He owes Kael his life, and he may become a secret ally inside House Sarne.');
  else if (f.darioPoisoned) e.push('Dario Sarne lives, but he believes Kael poisoned him. House Sarne wants Kael’s head.');
  if (f.shards) e.push('Kael carries proof that House Sarne is selling Wardstone shards. Someone in Corvane will want to see it, and someone else will kill to stop that.');
  else e.push('House Sarne’s smuggling stays hidden. The shards will keep moving.');
  if (f.readCarving) e.push('Kael knows this was the Third of Seven Wardstones.');
  e.push(f.toldBran ? 'Brannoc knows about the vision, and believes it.' : 'Kael kept the vision to himself. Brannoc is watching him.');
  const i = otherF('ilsa');
  if (i.ledger && f.shards) e.push('<b>Linked:</b> Ilsa holds the Arcanum’s ledger and Kael holds Sarne’s crates. Together they have both ends of the shard trade.');
  if (i.choice === 'report') e.push('<b>Linked:</b> Ilsa reported the Concord to a Crown envoy. In Corvane, Crown soldiers may help Kael instead of arresting him.');
  if (i.choice === 'hide') e.push('<b>Linked:</b> Ilsa is wanted as a thief. In Corvane, Crown soldiers will be hunting anyone travelling with her.');
  return e;
};
HEROES.ilsa.echoes = () => {
  const f = S.flags; const e = [];
  if (f.choice === 'report') e.push('Envoy Lysa Marrow of Corvane knows Ilsa’s name and heard her out. In Corvane, the Crown may stand with the party.');
  else e.push('The Arcanum has named Ilsa a thief, but she kept the Concord’s last pages. Crown soldiers in Corvane will be watching for her.');
  if (f.ledger) e.push('Ilsa carries the ledger: House Sarne sells the shards, the Arcanum buys them, and Steward Voss carries them.');
  else e.push('Ilsa never opened the shard vault. The trade’s paper trail stays buried under the Arcanum.');
  if (f.fullReading || f.aurelTold) e.push('Ilsa knows the bargain can be ended, not just sealed. The Lantern Order holds the other half, and Tamsin is one of their healers.');
  if (f.aurel === 'carried') e.push('Aurel is alive, barely, and travelling with Ilsa. Someone will have to cure the grey in him.');
  else if (f.aurel === 'stayed') e.push('Aurel stayed behind to hold the stair. Nobody knows whether he got out.');
  else e.push('Ilsa never found Aurel. He is still somewhere under the Arcanum.');
  const k = otherF('kael');
  if (k.shards && f.ledger) e.push('<b>Linked:</b> Kael found Sarne’s crates beneath Varrow. Together they have both ends of the shard trade.');
  if (k.dario === 'killed') e.push('<b>Linked:</b> Kael killed Dario Sarne. Whoever travels with Kael travels with a man House Sarne wants dead.');
  else if (k.darioAlly) e.push('<b>Linked:</b> Dario Sarne owes Kael his life, and Dario can name the steward who carried the shards.');
  return e;
};



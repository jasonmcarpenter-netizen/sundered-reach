// ================= WREN'S CHAPTER: THE THORNWOOD =================
HEROES.wren = {name:'Wren', full:'Wren', race:'Half-Sylvari', role:'rogue', ptsPerLevel:5, row:'back', start:'w_intro',
  skillList:['bows','daggers','stealth','lockpick','survival','leadership','lore','armor','tough','wardlore'],
  cost: () => 1,
  costNote:'Half-bloods take the cheap skills of both parents and the expensive skills of neither, so every skill costs Wren 1 point a rank. She earns 5 points a level and has no racial trait.',
  signature:['Vanish', 'Once per fight, Wren drops out of sight until her next turn. Nothing can target her, and her next attack can’t miss and always lands a critical hit.'],
  actions:['shoot','aimed','hamstring','knife','vanish','defend','swap','flee'],
  blurb:'A poacher and smuggler hired to move a sealed crate through the Thornwood, no questions asked.',
  roleLine:'Rogue and archer · Half-Sylvari', home:'The Thornwood'};
ALLIES.tobin = {name:'Tobin', max: () => 32 + S.level * 3, armor:2, init:4, dodge:4, row:'front', dmg: () => [5 + Math.floor(S.level / 2), 9 + Math.floor(S.level / 2)], actions:['haft','cover','defend','swap','flee']};
Object.assign(SKILLS, {
  bows:{name:'Bows', desc:'Hit chance and damage with a bow. Aimed Shot and Hamstring.'}
});
function wrenState(){
  const s = baseState('wren'); s.gold = 15;
  s.pc = {hp:0, sp:0, attrs:{might:2, grace:5, mind:2, spirit:2, endur:3},
    skills:{bows:2, daggers:1, stealth:1, survival:1, lockpick:0, leadership:0, lore:0, armor:0, tough:0, wardlore:0}};
  s.ally = {id:'tobin', joined:false, hp:0};
  s.items = {draught:1, tonic:0, aether:0};
  s.gear = {armor:0, sword:0, focus:0, bow:0, swordName:'Skinning knife', shieldName:'None', bowName:'Yew longbow'};
  return s;
}
function bowDmg(){ const b = S.pc.attrs.grace + sk('bows') + (S.gear.bow || 0); return [2 + b, 5 + b]; }
function bowAcc(){ return 66 + S.pc.attrs.grace * 3 + sk('bows') * 3; }

Object.assign(ACTIONS, {
  shoot:{label:'Shoot', sub:'Any target', target:'any', known: u => isPc(u, 'wren'), can: () => true,
    run(u, t){ strike(u, t, {bow:true, label:'arrow'}); }},
  aimed:{label:'Aimed Shot', sub:'1.7× damage', target:'any', cd:2, known: u => isPc(u, 'wren') && sk('bows') >= 1, can: () => true,
    run(u, t){ strike(u, t, {bow:true, mult:1.7, accMod:-10, label:'Aimed Shot'}); }},
  hamstring:{label:'Hamstring', sub:'Can stun', target:'any', cd:3, known: u => isPc(u, 'wren') && sk('bows') >= 2, can: () => true,
    run(u, t){ if (strike(u, t, {bow:true, mult:0.6, label:'Hamstring shot'}) && t.hp > 0 && rand(100) < 35 + sk('bows') * 8){ t.st.stun = 1; breakWind(t); } }},
  knife:{label:'Knife', sub:'Melee', target:'melee', known: u => isPc(u, 'wren'), can: front, why:'Front row only', run(u, t){ strike(u, t, {label:'knife'}); }},
  vanish:{label:'Vanish', sub:'Once per fight', target:null, known: u => isPc(u, 'wren'), can: () => !C.used.vanish, why:'Used',
    run(u){ C.used.vanish = true; u.st.hidden = 1; u.st.poised = true; log('Wren is simply not there anymore. Her next shot won’t miss.'); }},
  // Tobin
  haft:{label:'Boathook', sub:'Melee', target:'melee', known: u => isAlly(u, 'tobin'), can: front, why:'Front row only', run(u, t){ strike(u, t, {label:'boathook'}); }},
  cover:{label:'Cover', sub:'Take her hits', target:null, cd:3, known: u => isAlly(u, 'tobin'), can: () => U('pc').hp > 0,
    run(u){ u.st.guard = 2; log('Tobin plants himself between Wren and the enemy. Blows meant for her will hit him instead.'); }}
});

// Linked choices read from the other heroes
const kaelSarne = () => { const k = otherF('kael'); return k.darioAlly ? 'warn' : k.dario === 'killed' ? 'trap' : null; };
const ilsaNews = () => { const i = otherF('ilsa'); return i.choice === 'hide' ? 'a Sylvari apprentice stole the Arcanum’s oldest book and vanished off the Spire Coast. The Crown is stopping every Sylvari on the roads'
  : i.choice === 'report' ? 'an Arcanum apprentice stood up in front of the masters and called the founders liars. They threw her out, and a Crown envoy walked her to the boat' : null; };

Object.assign(SCENES, {
  w_intro:{ view: () => ({
    title:'The Thornwood',
    text:[
      `The Thornwood is older than the kingdoms around it. Its oaks were saplings when the Wardstones were raised, and the Sylvari enclaves inside it don't answer to any crown. Everyone else who lives in the wood is running from something.`,
      `You were born on its edge, to a human mother who never said much about your father except that he was Sylvari and he left. You have his ears and his eyes, and in the enclaves they call you <em>half</em> as if it were your name. In the human towns they don't call you anything. They just watch their purses.`,
      `So you learned the wood instead. Which deer trails the rangers watch. Which streams carry a scent away. You poach for meat and smuggle for money, and you don't owe anybody anything. You've made very sure of that.`,
      `Tonight Mother Quell sent for you. Quell doesn't send for people. People go to Quell.`
    ],
    choices:[{label:'Continue', go:'w_build'}]
  })},
  w_build:{ view: () => ({
    title:'Wren',
    text:[
      `You are <em>Wren</em>: half-Sylvari, poacher, smuggler, twenty-two years old and level 1. You shoot better than anyone at Gallows Ford, and you leave before anyone can find out what else you're good at.`,
      `You fight from the back row with a bow. <em>Aimed Shot</em> hits hard, <em>Hamstring</em> can stop a big blow before it lands, and <em>Vanish</em> takes you out of sight for a turn so that your next shot can't miss.`,
      `As a half-blood, every skill costs you 1 point a rank. <em>You have ${S.skillPts} unspent skill point${S.skillPts === 1 ? '' : 's'}.</em> Choices that need a skill show a tag like <span class="tag ok">Stealth 1</span>.`
    ],
    choices:[
      {label:'Open the character sheet', act: () => openSheet()},
      {label:'Walk into Gallows Ford', act: () => { quest('quell', 'Answer Mother Quell', 'The broker who runs Gallows Ford has sent for you. Quell only sends for people when the money is very good or the job is very bad.'); toMap('ford'); }}
    ]
  })},

  // --- Gallows Ford hub ---
  w_tent:{ view: () => ({
    title:'The Cook Tent',
    text:[
      `The cook tent is the warmest place in Gallows Ford and the only one where nobody asks your business. Old Nan ladles stew for anyone with a copper and lets you sleep on the flour sacks if you don't snore.`,
      (S.pc.hp < pcMax() || (S.ally.joined && S.ally.hp < allyMax())) ? `You could sleep for an hour. The wood will still be there.` : `You're rested. The stew is mostly turnip.`
    ],
    choices:[
      (S.pc.hp < pcMax() || (S.ally.joined && S.ally.hp < allyMax())) ? {label:'Sleep on the flour sacks (restores health)', act: () => { restAll(); S.notice = 'You sleep an hour by the cookfire. Health restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  w_butts:{ view: () => S.flags.sparred ? ({
      title:'The Archery Butts', text:[`Nell is pulling arrows out of the straw targets, still muttering about your last shot.`], choices:[back()]
    }) : ({
      title:'The Archery Butts',
      text:[
        `Behind the stables, the Free Companies keep a row of straw targets shot to rags. Nell Kestrel is working through a quiver, and every arrow lands in the same hand-wide circle. She's the best archer in Gallows Ford, or she was until you turned up, and she has never forgiven you.`,
        `"Wren." She doesn't look round. "Blunt arrows, twenty paces, first to three hits. Loser buys. Unless half a Sylvari is only half as good."`
      ],
      choices:[{label:'Take her on (a practice match, no real danger)', act: () => startCombat('w_spar')}, {label:'Not now', act: () => toMap('ford')}]
    })
  },
  w_sparWin:{ view: () => ({
    title:'The Archery Butts',
    text:[
      `Nell rubs a welt on her shoulder and swears, almost fondly. "Fine. Next round's mine."`,
      `She jerks her chin at your quiver. "One thing. When somebody nocks three at once, they're telling you it's coming. <em>Hamstring</em> them before they loose, or get out of sight. You're good at getting out of sight." She means it as an insult. It's also good advice.`
    ],
    choices:[back()]
  })},
  w_sparLose:{ view: () => ({
    title:'The Archery Butts',
    text:[
      `A blunt arrow takes you square in the ribs, and you sit down hard in the mud. Nell grins and offers a hand.`,
      `"When somebody nocks three at once, they're telling you it's coming. <em>Hamstring</em> them before they loose, or get out of sight." You can sleep it off in the cook tent.`
    ],
    choices:[back()]
  })},
  w_fence:{
    enter(){ if (!S.flags.metPike){ S.flags.metPike = true; S.items.draught += 1; S.items.tonic += 1; S.notice = 'Pike sells you a Healing Draught and a Bitter Tonic, on credit.'; } },
    view: () => {
      const kn = kaelNews(), inews = ilsaNews();
      return {
        title:'The Fence',
        text:[
          `Pike runs his business out of a barge that hasn't floated in years. He'll buy anything and sell anything, and he's the only person at the ford who's never once tried to cheat you. You've never worked out why.`,
          `He slides a draught and a tonic across the counter. "On credit. You'll want them, if it's Quell's job you're taking." He lowers his voice. "Rumors, if you want them. Free."`
        ],
        choices:[
          {label:'"What do you know about Quell’s job?"', go:'w_pikeJob'},
          kn ? {label:'"What’s the news out of Varrow?"', go:'w_pikeKael'} : null,
          inews ? {label:'"Anything off the coast road?"', go:'w_pikeIlsa'} : null,
          back()
        ].filter(Boolean)
      };
    }
  },
  w_pikeJob:{ view: () => ({
    title:'The Fence',
    text:[
      `"A crate came in on a Crown supply wagon that never reached its fort. Quell bought it off the men who robbed the wagon, and two of them are dead now. Fever, they're saying. Grey fever." He taps the counter. "Somebody wants it carried through the wood to a buyer. Nobody wants to carry it."`,
      `"And there's a man from House Sarne in the pavilion by the ford, asking after it. Sarne's a long way from home."`
    ],
    choices:[{label:'Ask something else', go:'w_fence'}, back()]
  })},
  w_pikeKael:{ view: () => ({
    title:'The Fence',
    text:[
      `"Varrow. A pit fighter there ${kaelNews().replace('a pit fighter ', '')}. House Sarne has put three hundred crowns on his head, and every knife in the Free Companies wants it."`,
      echo('kael', 'That pit fighter is Kael Dunmore. Rumors from one hero’s chapter reach the others.')
    ],
    choices:[{label:'Ask something else', go:'w_fence'}, back()]
  })},
  w_pikeIlsa:{ view: () => ({
    title:'The Fence',
    text:[
      `"Word off the coast road: ${ilsaNews()}." Pike shrugs. "Mages. They'd sooner burn the world than admit they were wrong about it."`,
      echo('ilsa', otherF('ilsa').choice === 'hide' ? 'That apprentice is Ilsa Venn. Because she hid the Concord’s pages, the Crown is stopping Sylvari on the roads, and that will matter in the wood.' : 'That apprentice is Ilsa Venn. Because she reported the Concord, a Crown envoy knows her name.')
    ],
    choices:[{label:'Ask something else', go:'w_fence'}, back()]
  })},
  w_broker:{ view: () => S.flags.jobTaken ? ({
      title:'Quell’s Wagon', text:[`Quell's wagon is shut up tight. A lamp burns behind the shutters, and you can hear her counting.`], choices:[back()]
    }) : ({
      title:'Quell’s Wagon',
      text:[
        `Mother Quell's wagon is painted green and gold, and nobody at Gallows Ford remembers it ever moving. Quell herself is small and soft-spoken and wears more rings than fingers. She has had people killed for interrupting her.`,
        `"Wren. Sit." On the table between you is a crate the size of a small coffin, lead-lined, sealed with wax and iron bands. It's cold. You can feel it from across the table, and under the cold, something like a pulse.`,
        `"Carry this to the old Sylvari waystation in the deep wood, three days in. A buyer will meet you there. Two hundred crowns on delivery." She sets an iron key beside the crate, long and old and strangely heavy. "The key travels separately, with you. You will not use it. You will not open the crate. You will not ask what's in it."`
      ],
      choices:[
        {label:'"Two hundred crowns. Done."', act: () => go('w_job')},
        Object.assign({label:'"Two hundred for a crate that kills the men who carry it? Make it three."', act: () => { S.flags.haggled = true; go('w_job'); }}, chk('leadership', 1))
      ]
    })
  },
  w_job:{
    enter(){
      if (S.flags.jobTaken) return;
      S.flags.jobTaken = true;
      S.ally.joined = true; S.ally.hp = allyMax();
      S.notice = 'Tobin Marsh joins you. He fights in the front row with a boathook and can Cover you, taking blows meant for you.';
      setQ('quell', 'done', 'You took Quell’s job.');
      quest('crate', 'Carry the crate', `Take the sealed crate to the old Sylvari waystation in the deep wood. ${S.flags.haggled ? 'Three' : 'Two'} hundred crowns on delivery. Don’t open it.`);
      chron('You took Mother Quell’s job: a sealed crate, carried through the Thornwood.');
    },
    view: () => ({
      title:'Quell’s Wagon',
      text:[
        S.flags.haggled ? `Quell looks at you for a long moment. Then she smiles, which is worse. "Three. You've grown teeth, Wren."` : `"Good girl," Quell says, and you hate it.`,
        `She raps on the wagon wall, and a man ducks in: huge, sunburned, with a ferryman's boathook over his shoulder and the look of someone who owes Quell more than he'll ever pay. "Tobin Marsh," Quell says. "He'll carry the crate. You'll carry the key and keep him alive. He's worth more to me alive than you are."`,
        `Tobin gives you a nod that's almost an apology. Outside, someone in Sarne green is watching the wagon from the pavilion by the ford.`
      ],
      choices:[back()]
    })
  },
  w_pavilion:{ view: () => S.flags.metVoss ? ({
      title:'The Sarne Pavilion', text:[`The pavilion is empty now, except for a smell of good wine. Voss said he'd find you. You believe him.`], choices:[back()]
    }) : ({
      title:'The Sarne Pavilion',
      text:[
        `Under a green awning by the ford, a thin man sits at a folding table as if he owns the river. Two guards in Sarne green stand behind him. He doesn't get up.`,
        `"Wren. I am Voss, steward to Lord Corrin Sarne of Varrow." He pours a second cup of wine and doesn't offer it. "You carry a key for Mother Quell. My lord would like that key. Not the crate, which is a crude thing. The key."`,
        `"It's a founder's key. It opens doors that were sealed nine hundred years ago, and my lord has a door in mind. Deliver your crate. Then bring the key to me instead of back to Quell, and I will pay you three hundred crowns and a bow worth more than your life." He smiles. "Think about it on the road. I'll be at the crossing when you come out of the wood."`
      ].concat(otherF('ilsa').ledger ? [echo('ilsa', 'Voss is the steward named in the Arcanum’s ledger, the one who carried House Sarne’s Wardstone shards to the Spire Coast.')] : []),
      choices:[{label:'Say nothing, and leave.', act: () => { S.flags.metVoss = true; quest('key', 'Voss’s offer', 'Steward Voss of House Sarne will pay three hundred crowns for the founder’s key. He’ll be waiting at the crossing when you leave the wood.'); chron('Steward Voss offered to buy the founder’s key for House Sarne.'); toMap('ford'); }}]
    })
  },
  w_gate:{ view: () => ({
    title:'The Ford',
    text:[
      `Tobin has the crate on a pole across his shoulders, and he's sweating in the cold. Beyond the ford, the Thornwood starts all at once, like a wall.`,
      `Once you cross, Gallows Ford is behind you.`,
      S.skillPts > 0 ? `<em>You have unspent skill points.</em>` : ''
    ].filter(Boolean),
    choices:[{label:'Cross into the Thornwood', act: () => toMap('thornwood')}, {label:'Not yet', act: () => toMap('ford')}]
  })},

  // --- Thornwood hub ---
  w_ford:{ view: () => ({title:'The Ford', text:[`The river, and Gallows Ford beyond it. No going back until the job's done.`], choices:[back()]}) },
  w_trail:{ view: () => {
    if (S.flags.trailDone) return {title:'The Deer Trail', text:[`The deer trail winds on into the dark. Nothing waits on it now.`], choices:[back()]};
    const s = kaelSarne();
    if (s === 'trap') return {
      title:'The Deer Trail',
      text:[
        `A mile in, the deer trail narrows between two fallen oaks, and every bird has stopped singing. Somebody's waiting.`,
        `You're right. Three men step out of the bracken in Sarne green, cudgels out, a crossbow behind them. "Voss sends his regards," one says. "He'll take the key off your body. Cheaper than paying."`,
        echo('kael', 'Kael killed Dario Sarne. House Sarne is out for blood, and its agents in the Thornwood would rather kill than bargain.')
      ],
      choices:[{label:'Fight', act: () => startCombat('w_trap')}, back('Back off for now')]
    };
    if (s === 'warn') return {
      title:'The Deer Trail',
      text:[
        `A mile in, a rider in Sarne green is waiting for you at the trail's fork, alone, with her hands where you can see them. She's young and frightened and trying not to show it.`,
        `"I serve Lord Dario, not his brother. Kael Dunmore spared his life in the arena." She hands down a pouch. "My lord says Voss means to have your throat cut the moment he holds that key. Get your money first and don't turn your back on him." Then she's gone.`,
        echo('kael', 'Kael spared Dario Sarne and Dario knows it. A Sarne contact feeds Wren information instead of setting a trap.')
      ],
      choices:[{label:'Open the pouch', act: () => { if (!S.flags.warned){ S.flags.warned = true; S.items.draught += 1; S.gold += 20; chron('A servant of Dario Sarne warned you that Voss means to kill you.'); } S.notice = 'The pouch holds 20 crowns and a Healing Draught.'; go('w_wolves'); }}]
    };
    return {
      title:'The Deer Trail',
      text:[
        `The deer trail winds under oaks so old their roots have roots. A doe watches you from the bracken and doesn't run. Nothing here has seen a hunter in a long time.`,
        sk('survival') >= 1 ? `There are boot prints on the trail ahead, though. Crown-issue hobnails, a dozen men, two days old. Heading the same way you are.` : `It's quiet. Too quiet, Tobin says, and then looks embarrassed for saying it.`
      ],
      choices:[{label:'Go on', go:'w_wolves'}]
    };
  }},
  w_wolves:{ view: () => ({
    title:'The Deer Trail',
    text:[
      `Further on, the doe is lying across the trail with its throat torn out, and there's no blood. Grey has crept through its hide like frost. Two wolves lift their heads from it, silent, eyes filmed white.`,
      `They've caught the crate's scent. Or the crate has caught theirs.`
    ],
    choices:[{label:'Fight', act: () => startCombat('w_wolves')}]
  })},
  w_wolvesWin:{ enter(){ S.flags.trailDone = true; }, view: () => ({
    title:'The Deer Trail',
    text:[`Tobin prods one grey carcass with his boathook. "Wolves don't come this far in. Not since my grandda's time." He looks at the crate on his back. "They were coming for <em>that</em>."`],
    choices:[back()]
  })},
  w_trapWin:{ enter(){ S.flags.trailDone = true; S.items.draught += 1; S.notice = 'One of the Sarne men carried a Healing Draught.'; chron('Sarne agents ambushed you on the deer trail.'); }, view: () => ({
    title:'The Deer Trail',
    text:[`Tobin leans on his boathook, breathing hard, and looks down at the green coats. "Sarne men. In the Thornwood." He wipes his face. "What's in this thing, Wren?"`, `You don't answer. You're starting to want to know too.`],
    choices:[back()]
  })},
  w_hide:{ view: () => ({
    title:'The Poacher’s Hide',
    text:[
      `Your hide is a hollow under a fallen oak, roofed with turf, that nobody knows about but you. Now Tobin knows too. You try not to mind.`,
      S.flags.opened ? `The crate sits in the corner with its lid loose. Even closed, it lights the hollow a faint, cold grey.` : `Tobin sets the crate down in the corner with great care. It hums, very faintly, like a hive.`
    ],
    choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health)', act: () => { restAll(); S.notice = 'You rest in the hide. Health restored.'; render(); }} : null,
      !S.flags.opened ? Object.assign({label:'Pick the crate’s lock. Quell said not to use the key. She didn’t say anything about picks.', go:'w_crate'}, chk('lockpick', 1)) : null,
      back()
    ].filter(Boolean)
  })},
  w_crate:{
    enter(){ if (S.flags.opened) return; S.flags.opened = true; chron('You opened Quell’s crate and saw what was inside: a living piece of a Wardstone.'); },
    view: () => ({
      title:'The Poacher’s Hide',
      text:[
        `The lock gives. You lift the lid, and grey light comes up out of the straw like breath on a cold morning.`,
        `Inside is a piece of black stone the size of a man's head, veined with silver. It's warm. It's <em>moving</em>, very slowly, the silver veins pulsing like something with a heartbeat. You've heard the old stories everybody's heard: seven stones, holding something down.`,
        `Tobin backs away until he hits the wall. "That's a piece of a Wardstone," he whispers. "That's a piece of a <em>living</em> Wardstone. Who breaks a piece off a Wardstone?"`,
        `You close the lid. Your hands are shaking, and you don't let him see it.`
      ],
      choices:[back()]
    })
  },
  w_waystone:{ view: () => S.flags.waystoneDone ? ({
      title:'The Sylvari Waystone',
      text:[`The ring of white stones stands quiet in the clearing. ${S.flags.parentHint ? 'You don’t look at the name again. You don’t need to.' : 'The writing on the tallest stone is too old for you to read.'}`],
      choices:[back()]
    }) : ({
      title:'The Sylvari Waystone',
      text:[
        `Off the trail, a ring of white standing stones marks an old Sylvari waystone, the kind the enclaves raised before the Sundering. Grey thorn-vines have grown over half of it, and something moves in them: knots of briar the size of dogs, pulling themselves along on roots.`,
        `Thornlings. The grey has got into the wood itself.`
      ],
      choices:[{label:'Clear them out', act: () => startCombat('w_thorns')}, back('Leave it')]
    })
  },
  w_thornsWin:{
    enter(){ if (S.flags.waystoneDone) return; S.flags.waystoneDone = true; S.items.tonic += 1; S.notice = 'Tucked in a hollow of the stone is an old offering: a Bitter Tonic, still sealed.'; },
    view: () => ({
      title:'The Sylvari Waystone',
      text:[
        `The last thornling falls apart into dead grey twigs. Up close the waystone is carved all over in Sylvari script, worn almost smooth.`,
        `On the tallest stone, someone has cut a list of names, very old, and under the oldest of them a single sign you've seen once before: scratched into the back of the bone comb your mother kept, the one thing your father left.`
      ],
      choices:[
        Object.assign({label:'Read the names.', act: () => { S.flags.parentHint = true; quest('father', 'Your father’s sign', 'The sign on your mother’s comb is carved on a Sylvari waystone, under a list of the Wardens who stood at the Binding. Whoever your father was, his line goes back to the Binding itself.'); chron('At the waystone you found your father’s sign under the names of the Binding’s Wardens.'); go('w_names'); }}, chk('lore', 1)),
        back()
      ]
    })
  },
  w_names:{ view: () => ({
    title:'The Sylvari Waystone',
    text:[
      `The script is old, but Sylvari letters haven't changed much in a thousand years. Neither have the Sylvari. <em>"Here stood the Wardens of the Binding, who gave themselves so that the stones would hold."</em>`,
      `And under the last Warden's name, in the same hand, your father's sign. Not a name. A family mark, the kind the enclaves carve over doors.`,
      `You stand there a long time. Tobin doesn't ask. You find you're grateful.`
    ],
    choices:[back()]
  })},
  w_patrol:{ view: () => {
    if (S.flags.patrolDone) return {title:'The Crown Road', text:[`Hoofprints and a cold campfire. The patrol is gone, one way or another.`], choices:[back()]};
    const i = otherF('ilsa');
    const t = [
      `The only way to the waystation crosses the old Crown road, and the Crown is on it: a patrol of soldiers in blue under a grizzled sergeant, camped across the road with a fire going. They're searching every wagon and every traveller.`,
      `"Crate," the sergeant calls when he sees Tobin's load. "Lead-lined, iron-banded, stolen off a Crown wagon. That'll be the one. Set it down."`
    ];
    if (i.choice === 'hide') t.push(`He looks at your ears, and his eyes narrow. "And a Sylvari, too. We've orders about Sylvari. There's a thief off the Spire Coast with a stolen book." He signals, and a fourth soldier comes out of the trees.`, echo('ilsa', 'Ilsa hid the Concord’s pages, so the Crown is hunting a Sylvari thief. To this patrol, any Sylvari face is a suspect.'));
    if (i.choice === 'report') t.push(echo('ilsa', 'Ilsa reported the Concord to Envoy Lysa Marrow. The Crown knows that name on this road, and the envoy is said to be gathering anything touched by the Wardstones.'));
    return {title:'The Crown Road', text:t, choices:[
      Object.assign({label:'Slip past through the undergrowth while they argue over a wagon.', act: () => { S.flags.patrolHow = 'sneak'; go('w_patrolPast'); }}, chk('stealth', 2)),
      i.choice !== 'hide' ? Object.assign({label:'"It’s bound for Corvane, for the Crown’s own envoy. Hold it up and you can explain the delay to her."', act: () => { S.flags.patrolHow = 'bluff'; go('w_patrolPast'); }}, i.choice === 'report' ? {} : chk('leadership', 1)) : null,
      {label:'Fight your way through', act: () => startCombat('w_patrol')},
      back('Back off for now')
    ].filter(Boolean)};
  }},
  w_patrolPast:{
    enter(){ if (S.flags.patrolDone) return; S.flags.patrolDone = true; const ups = gainXP(100); S.notice = `+100 experience${ups.length ? `. Level up! Wren is now level ${S.level}.` : '.'}`; chron(S.flags.patrolHow === 'sneak' ? 'You slipped the crate past a Crown patrol.' : 'You bluffed a Crown patrol with the name of the Crown’s own envoy.'); },
    view: () => ({
      title:'The Crown Road',
      text:[
        S.flags.patrolHow === 'sneak'
          ? `It takes an hour on your bellies in the bracken, with Tobin breathing like a bellows and the crate humming against his back. Then the road is behind you, and nobody shouted.`
          : `The sergeant hesitates, which is all you need. "Envoy Marrow," he says slowly. "She's been asking after anything that glows." He waves you on, and you can feel him watching all the way into the trees.`,
        `Beyond the road the wood gets older and darker, and the grey thickens in it. The waystation can't be far.`
      ],
      choices:[back()]
    })
  },
  w_patrolWin:{ enter(){ S.flags.patrolDone = true; S.flags.patrolHow = 'fight'; S.items.draught += 1; S.gold += 15; S.notice = 'You found a Healing Draught and 15 crowns in the patrol’s baggage.'; chron('You fought your way past a Crown patrol. The Crown will remember.'); }, view: () => ({
    title:'The Crown Road',
    text:[`The sergeant is the last to go down, and he isn't dead, only out cold. Tobin binds him and props him against a tree. "They'll say we killed Crown soldiers," he says. "Whatever we did."`, `The road is clear. Beyond it, the wood gets older and darker, and the grey thickens.`],
    choices:[back()]
  })},
  w_meet:{ view: () => {
    const t = otherF('tamsin');
    const text = [
      `The old Sylvari waystation is a ruin of white stone swallowed by grey briars, and the buyers are waiting in it. Not merchants. Robed figures in ash-grey, with silver at their collars: the Ashen Hand.`,
      `At their head stands a tall woman with briars growing out of her arms, as if the wood had planted itself in her. Behind her, something huge and thorned strains at a chain. "I am Sable, mother of thorns," she says. "You've brought the god a piece of its own cage. Open it, child. Let it breathe."`,
      `Quell's buyer was never going to pay. The crate was the offering, and so are the people who carried it.`
    ];
    if (t.orrin === 'freed') text.push(`One of the robed cultists catches your eye and shakes his head, very slightly. When Sable turns, he steps back into the briars and is gone, taking his knife with him.`, echo('tamsin', 'Tamsin healed Deacon Orrin and let him go. He kept his oath to leave the Ashen Hand, and one fewer cultist stands with Sable.'));
    else if (t.orrin === 'judged') text.push(echo('tamsin', 'In Kell’s Rest, Tamsin let the village hang Deacon Orrin. The Ashen Hand here know his name, and they are angrier for it.'));
    text.push(`<em>This will be a hard fight. Sable stays behind her beast, out of reach of melee. You can go back to the hide and rest first.</em>`);
    return {title:'The Old Waystation', text, choices:[{label:'Fight Sable', act: () => startCombat('w_boss')}, {label:'Back away and prepare', act: () => toMap('thornwood')}]};
  }},
  w_bossWin:{
    enter(){ if (S.flags.bossDone) return; S.flags.bossDone = true; S.pc.skills.wardlore = Math.max(1, S.pc.skills.wardlore || 0); S.notice = 'You learned Wardlore 1.'; },
    view: () => {
      const k = otherF('kael'), i = otherF('ilsa'), tm = otherF('tamsin');
      const t = [
        `Sable falls among her briars, and the thorns go grey and brittle all at once and crumble. Her beast lies still. The cultists who are left run into the dark.`,
        `In the quiet afterward, the crate is humming so loud you can hear it. You don't decide to touch it. Your hand is just there, on the cold iron, and the hum goes through you like a bell.`,
        `You see the whole Reach from above. A swordsman on bloody sand. A girl with ink-stained hands and a book that burns without burning. A stone-skinned healer kneeling in grey snow. All three of them, on three roads, walking toward the same city.`,
        `And under all of it, something vast and patient, turning over in its sleep.`
      ];
      if (k.bossDone || i.bossDone || tm.bossDone) t.push(echo(k.bossDone ? 'kael' : i.bossDone ? 'ilsa' : 'tamsin', 'The others saw you too: an archer in the dark of a forest, guarding a crate that glows.'));
      t.push(`You come back to yourself on your knees. Tobin is holding your shoulders, his big face white. "Wren? Wren. Say something." For once in your life, you don't run.`);
      return {title:'The Old Waystation', text:t, choices:[{label:'Head for the edge of the wood', go:'w_crossing'}]};
    }
  },
  w_crossing:{ view: () => ({
    title:'The Crossing',
    text:[
      `Where the Thornwood ends at the river crossing, Voss is waiting under a green awning with two of his guards, exactly as he promised. Quell's buyer is dead. Nobody is going to pay you for the crate.`,
      `"Wren." Voss stands, for the first time. "The key, if you please. Three hundred crowns, and a Sarne recurve that will outshoot anything in the Free Companies." He sets a heavy purse on the table and lays a fine bow beside it.`,
      S.flags.warned ? `<em>Lord Dario's warning: Voss means to have your throat cut the moment he holds that key.</em>` : `His guards are watching your hands, not your face.`
    ],
    choices:[
      {label:'Sell him the key.', act: () => { S.flags.key = 'sold'; chron('You sold the founder’s key to House Sarne.'); go(S.flags.warned ? 'w_soldSafe' : 'w_soldTrap'); }},
      {label:'Keep it. Whatever door Sarne wants opened can stay shut.', act: () => { S.flags.key = 'kept'; chron('You refused Voss and kept the founder’s key. House Sarne will hunt you for it.'); go('w_kept'); }}
    ]
  })},
  w_soldSafe:{
    enter(){ if (S.flags.paid) return; S.flags.paid = true; S.gold += 300; S.gear.bow = 2; S.gear.bowName = 'Sarne recurve'; S.notice = 'You got 300 crowns and the Sarne recurve (+2 bow damage).'; },
    view: () => ({
      title:'The Crossing',
      text:[
        `You nock an arrow before you're within reach of his guards, and you keep it nocked. "Purse and bow on the stump. Then step back. Then I throw you the key."`,
        `Voss's smile goes thin as wire. He knows what you know, and he wonders who told you. But he does it. You throw the key, and you're across the river and into the reeds before his guards finish drawing.`
      ],
      choices:[{label:'Continue', go:'w_ending'}]
    })
  },
  w_soldTrap:{ view: () => ({
    title:'The Crossing',
    text:[
      `You hand him the key. He weighs it in his palm, satisfied, and steps back. "Pay her," he tells his guards.`,
      `They pay you with cudgels.`
    ],
    choices:[{label:'Fight', act: () => startCombat('w_knives')}]
  })},
  w_knivesWin:{
    enter(){ if (S.flags.paid) return; S.flags.paid = true; S.gold += 300; S.gear.bow = 2; S.gear.bowName = 'Sarne recurve'; S.notice = 'You took the 300 crowns and the Sarne recurve (+2 bow damage) off the table.'; },
    view: () => ({
      title:'The Crossing',
      text:[`When it's over, Voss is gone, and so is the key. The purse and the bow are still on the table. You take both. You earned them.`],
      choices:[{label:'Continue', go:'w_ending'}]
    })
  },
  w_kept:{ view: () => ({
    title:'The Crossing',
    text:[
      `You put the key back inside your shirt, where it sits cold against your skin. "No."`,
      `Voss looks at you the way a man looks at weather. "Then House Sarne will collect it another way, and it will cost you more than three hundred crowns." He picks up his purse and his bow. "We will see each other again, Wren." He doesn't sound angry. That's what frightens you.`
    ],
    choices:[{label:'Continue', go:'w_ending'}]
  })},
  w_ending:{ view: () => {
    const f = S.flags;
    const t = [
      `You and Tobin camp that night on the far bank, with the crate between you and a fire you don't usually risk. Neither of you is going back to Gallows Ford. Quell will want her crate, or her money, or your skin.`,
      f.key === 'sold' ? `Sarne has the key now. You keep telling yourself it's only a key.` : `The key is a cold weight inside your shirt. Somewhere south, House Sarne is already deciding what you're worth.`,
      f.parentHint ? `You turn your mother's bone comb over and over in your fingers, tracing your father's sign.` : `You think about the waystone you didn't stop at, and you don't know why it bothers you.`,
      `"Where now?" Tobin asks. You think of the three strangers on three roads in your vision, all walking toward the same city. You've run from everything your whole life. For once, you want to run toward something. "Corvane," you say.`
    ];
    return {title:'The Far Bank', text:t, choices:[{label:'End of Wren’s chapter', act: () => {
      setQ('crate', 'done', 'The buyer was the Ashen Hand. You kept the crate and the fragment inside it.');
      if (S.quests.key) setQ('key', 'done', f.key === 'sold' ? 'You sold the founder’s key to House Sarne.' : 'You kept the founder’s key. House Sarne will come for it.');
      quest('corvane', 'Go north to Corvane', 'Find out who wants the fragment, and why. Find the three strangers from your vision.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  ford:{
    title:'Gallows Ford',
    blurb: () => `A Free Companies camp at the edge of the Thornwood: wagons, tents, a barge that doesn't float, and nobody using their real name.`,
    w:340, h:240,
    nodes:[
      {id:'w_tent', label:'Cook Tent', x:60, y:60, sub:'Rest'},
      {id:'w_butts', label:'Archery Butts', x:170, y:40, sub:'Nell Kestrel', done: () => S.flags.sparred},
      {id:'w_fence', label:'The Fence', x:282, y:60, sub:'Pike', done: () => S.flags.metPike},
      {id:'w_broker', label:'Quell’s Wagon', x:95, y:170, sub:'The job', done: () => S.flags.jobTaken},
      {id:'w_pavilion', label:'Sarne Pavilion', x:200, y:200, sub:'A visitor', open: () => S.flags.jobTaken, done: () => S.flags.metVoss, lockText:'Take the job first'},
      {id:'w_gate', label:'The Ford', x:290, y:160, sub:'Into the wood', open: () => S.flags.metVoss, lockText:'Someone wants a word first'}
    ],
    edges:[['w_tent','w_butts'],['w_butts','w_fence'],['w_tent','w_broker'],['w_broker','w_pavilion'],['w_pavilion','w_gate'],['w_fence','w_gate']]
  },
  thornwood:{
    title:'The Thornwood',
    blurb: () => `Three days of old forest between Gallows Ford and the waystation. Somewhere in here, the grey has got into the trees.`,
    w:340, h:270,
    nodes:[
      {id:'w_ford', label:'The Ford', x:45, y:225, sub:'Where you crossed', done: () => true},
      {id:'w_trail', label:'Deer Trail', x:110, y:150, sub:'The way in', done: () => S.flags.trailDone},
      {id:'w_hide', label:'Poacher’s Hide', x:45, y:70, sub:'Rest', open: () => S.flags.trailDone, lockText:'Down the trail'},
      {id:'w_waystone', label:'Sylvari Waystone', x:200, y:200, sub:'Optional', open: () => S.flags.trailDone, done: () => S.flags.waystoneDone, lockText:'Down the trail'},
      {id:'w_patrol', label:'Crown Road', x:180, y:95, sub:'A patrol', open: () => S.flags.trailDone, done: () => S.flags.patrolDone, lockText:'Down the trail'},
      {id:'w_meet', label:'Old Waystation', x:285, y:40, sub:'The buyer', open: () => S.flags.patrolDone, done: () => S.flags.bossDone, lockText:'Past the Crown road'}
    ],
    edges:[['w_ford','w_trail'],['w_trail','w_hide'],['w_trail','w_waystone'],['w_trail','w_patrol'],['w_patrol','w_meet']]
  }
});

Object.assign(ENEMIES, {
  nell:{name:'Nell Kestrel', hp:42, dmg:[4,7], acc:72, dodge:10, armor:0, init:7, xp:40, ranged:true,
    spec:{every:2, name:'Triple Nock', windup:'{n} nocks three blunt arrows at once.', mult:1.8}},
  thornling:{name:'Thornling', hp:16, dmg:[4,6], acc:72, dodge:8, armor:1, init:5, xp:18, hollow:true, bleed:20},
  soldier:{name:'Crown Soldier', hp:28, dmg:[6,9], acc:70, dodge:5, armor:2, init:4, xp:30},
  sergeant:{name:'Patrol Sergeant', hp:40, dmg:[7,10], acc:72, dodge:6, armor:3, init:5, xp:45,
    spec:{every:3, name:'Shield Rush', windup:'{n} lowers his shield and sets his feet to charge.', mult:1.6, stun:true}},
  thornbeast:{name:'Thornbeast', hp:70, dmg:[8,12], acc:70, dodge:4, armor:2, init:4, xp:90, hollow:true, bleed:25,
    spec:{every:3, name:'Briar Charge', windup:'{n} lowers its thorned head and paws the ground.', mult:1.9}},
  sable:{name:'Sable, Mother of Thorns', hp:66, dmg:[6,9], acc:74, dodge:8, armor:1, init:6, xp:170, ranged:true, row:'back', hollow:true, greyChance:25,
    spec:{every:3, name:'Briar Storm', windup:'{n} spreads her thorned arms, and the briars all around begin to writhe.', mult:1.2, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  w_spar:{title:'Practice: Nell Kestrel', enemies:() => ['nell'], lethal:false, win:'w_sparWin', lose:'w_sparLose', loseXP:20, back:'w_butts',
    done: () => { S.flags.sparred = true; }, intro:'Blunt arrows, twenty paces. Nell grins and draws.'},
  w_wolves:{title:'The Deer Trail', enemies:() => ['greywolf', 'greywolf'], lethal:true, win:'w_wolvesWin', back:'w_wolves',
    intro:'The grey wolves come down the trail at you without a sound.'},
  w_trap:{title:'The Deer Trail', enemies:() => ['thug', 'thug', 'xbow'], lethal:true, win:'w_trapWin', back:'w_trail',
    intro:'The Sarne men spread out. The crossbowman stays back in the bracken.'},
  w_thorns:{title:'The Sylvari Waystone', enemies:() => ['thornling', 'thornling', 'thornling'], lethal:true, flee:true, win:'w_thornsWin', back:'w_waystone',
    intro:'The thornlings drag themselves out of the vines toward you.'},
  w_patrol:{title:'The Crown Road', enemies:() => otherF('ilsa').choice === 'hide' ? ['soldier', 'soldier', 'soldier', 'sergeant'] : ['soldier', 'soldier', 'sergeant'], lethal:true, win:'w_patrolWin', back:'w_patrol',
    intro:'The soldiers lock shields across the road. The sergeant bellows for you to drop your weapons.'},
  w_boss:{title:'Sable, Mother of Thorns', enemies:() => otherF('tamsin').orrin === 'freed' ? ['thornbeast', 'cultist', 'sable'] : ['thornbeast', 'cultist', 'cultist', 'sable'], lethal:true, win:'w_bossWin', back:'w_meet',
    intro:'Sable lets the chain go. The Thornbeast comes at you through the briars, and the cultists draw their knives.'},
  w_knives:{title:'The Crossing', enemies:() => ['thug', 'thug'], lethal:true, win:'w_knivesWin', back:'w_soldTrap',
    intro:'Voss steps back under his awning to watch. His guards come at you with cudgels.'}
});

HEROES.wren.echoes = () => {
  const f = S.flags; const e = [];
  if (f.key === 'sold') e.push('House Sarne holds the founder’s key now. Whatever door Lord Corrin wants opened, he can open it.');
  else e.push('Wren kept the founder’s key. House Sarne will hunt her for it, and Voss does not forget.');
  e.push(f.opened ? 'Wren has seen what is in the crate: a living piece of a Wardstone. She knows what she is carrying.' : 'Wren never opened the crate. She is carrying a piece of a Wardstone and only half believes it.');
  if (f.patrolHow === 'fight') e.push('Wren fought Crown soldiers on the Crown road. In Corvane, the Crown will be looking for a half-Sylvari archer.');
  else if (f.patrolHow === 'bluff') e.push('Wren used Envoy Marrow’s name to get past a Crown patrol. The envoy will hear of it.');
  else if (f.patrolHow === 'sneak') e.push('Wren slipped past the Crown patrol unseen. As far as the Crown knows, the crate simply vanished in the Thornwood.');
  if (f.parentHint) e.push('Wren found her father’s sign under the names of the Wardens of the Binding. Whoever he was, his line goes back to the Binding itself.');
  e.push('Tobin Marsh broke with Mother Quell to stay with Wren. Gallows Ford is closed to them both.');
  const k = otherF('kael'), i = otherF('ilsa'), t = otherF('tamsin');
  if (f.warned) e.push('<b>Linked:</b> Kael spared Dario Sarne, and Dario’s servant warned Wren about Voss in time.');
  if (k.dario === 'killed') e.push('<b>Linked:</b> Kael killed Dario Sarne, so House Sarne sent knives instead of offers.');
  if (i.ledger) e.push('<b>Linked:</b> Ilsa holds the ledger that names Voss as Sarne’s courier, and Wren has met him face to face.');
  if (t.orrin === 'freed') e.push('<b>Linked:</b> Deacon Orrin, whom Tamsin spared, kept his oath and walked away from Sable’s cult.');
  return e;
};
// Wren's choices echo back into the other three endings
const _kaelEchoesW = HEROES.kael.echoes, _ilsaEchoesW = HEROES.ilsa.echoes, _tamsinEchoesW = HEROES.tamsin.echoes;
HEROES.kael.echoes = () => { const e = _kaelEchoesW(); const w = otherF('wren');
  if (w.key === 'sold') e.push('<b>Linked:</b> Wren sold House Sarne a founder’s key. The vault under the Varrow arena will be open to Sarne.');
  if (w.key === 'kept') e.push('<b>Linked:</b> Wren kept the founder’s key. Whatever Sarne locked under the Varrow arena will have to be broken into.');
  if (w.bossDone) e.push('<b>Linked:</b> Wren saw Kael in her vision too: a swordsman on bloody sand, walking toward Corvane.');
  return e; };
HEROES.ilsa.echoes = () => { const e = _ilsaEchoesW(); const w = otherF('wren');
  if (w.patrolHow === 'bluff' && S.flags.choice === 'report') e.push('<b>Linked:</b> Wren talked her way past a Crown patrol using Envoy Marrow’s name. The envoy will be curious about both of you.');
  if (w.patrolHow && S.flags.choice === 'hide') e.push('<b>Linked:</b> The Crown is stopping every Sylvari on the roads because of Ilsa. Wren, half-Sylvari, already ran into it.');
  if (w.opened) e.push('<b>Linked:</b> Wren is carrying a living Wardstone fragment. The Concord may say what it can do.');
  return e; };
HEROES.tamsin.echoes = () => { const e = _tamsinEchoesW(); const w = otherF('wren');
  if (w.bossDone && S.flags.orrin === 'freed') e.push('<b>Linked:</b> Orrin kept his oath. Wren saw him walk away from the Ashen Hand in the Thornwood.');
  if (w.bossDone) e.push('<b>Linked:</b> The archer in Tamsin’s vision is Wren, and the crate she guards holds a living piece of a Wardstone.');
  return e; };

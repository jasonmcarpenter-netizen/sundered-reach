// ================= ILSA'S CHAPTER: THE SPIRE COAST =================
const kaelNews = () => {
  const f = otherF('kael');
  if (f.dario === 'killed') return 'a pit fighter killed a Sarne lord’s son in the Varrow arena, then vanished from his cell the night before his hanging';
  if (f.dario === 'spared') return 'a pit fighter poisoned a Sarne lord’s son in the Varrow arena, then vanished from his cell the night before his hanging';
  return null;
};
Object.assign(SCENES, {
  i_intro:{ view: () => ({
    title:'The Spire Coast',
    text:[
      `The Arcanum clings to the cliffs of the Spire Coast like something that grew there: nine towers of pale stone, salt-stained, wrapped in sea fog nine days out of ten.`,
      `You came here at fourteen, the first Sylvari apprentice in a generation. Seven years later you're still the only one, and you can still feel the other apprentices looking at your ears.`,
      `Nine days ago your mentor, Magister Aurel Thane, didn't come to his morning lecture. The Archmagister says he was called away on Arcanum business. Aurel never went anywhere without telling you. Aurel never went anywhere at all.`,
      `Tonight someone slid a note under your door, in Aurel's cramped hand. It says only: <em>My study. The blue book. Don't trust the Proctor.</em>`
    ],
    choices:[{label:'Continue', go:'i_build'}]
  })},
  i_build:{ view: () => ({
    title:'Ilsa Venn',
    text:[
      `You are <em>Ilsa Venn</em>: Sylvari, apprentice mage, twenty-one years old and level 1. You know more about the old texts than half the magisters, and you are very bad at pretending you don't.`,
      `Your spells cost <em>spell points</em> (SP). You get them back by resting, or by Channeling in the middle of a fight. You fight best from the back row, behind someone sturdier. Tonight, there's nobody sturdier.`,
      `Sylvari pay double for Heavy Armor and Toughness, and earn 5 skill points a level. <em>You have ${S.skillPts} unspent skill point${S.skillPts === 1 ? '' : 's'}.</em> Choices that need a skill show a tag like <span class="tag ok">Lore 1</span>.`
    ],
    choices:[
      {label:'Open the character sheet', act: () => openSheet()},
      {label:'Slip out into the Arcanum', act: () => { quest('aurel', 'Find Magister Aurel', 'Your mentor vanished nine days ago. His note says: My study. The blue book. Don’t trust the Proctor.'); toMap('arcanum'); }}
    ]
  })},

  // --- Arcanum hub ---
  i_dorm:{ view: () => ({
    title:'The Nest',
    text:[
      `Your room is at the top of the Gull Tower: small, cold, with a window that rattles in every wind off the sea. The other apprentices call it the nest. You call it the only place in the Arcanum where nobody watches you.`,
      (S.pc.hp < pcMax() || S.pc.sp < spMax()) ? `You could sleep for an hour. The fog isn't going anywhere.` : `You're rested. There's nothing to do here but worry.`
    ],
    choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax()) ? {label:'Rest a while (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest. Health and spell points restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  i_hall:{ view: () => S.flags.sparred ? ({
      title:'The Lecture Hall', text:[`Magister Quill is picking scorched gears out of his construct, humming. He waves a screwdriver at you without looking up.`], choices:[back()]
    }) : ({
      title:'The Lecture Hall',
      text:[
        `The Lecture Hall is empty except for Magister Quill, who is coaxing a brass training construct back to life with a screwdriver and a great deal of muttering.`,
        `"Venn! Perfect. It needs testing, and I need a volunteer who can actually aim. Firebolt, Frost Shackles, whatever you like. It hits back, but softly." He considers. "Mostly."`
      ],
      choices:[{label:'Test the construct (a practice fight, no real danger)', act: () => startCombat('i_spar')}, {label:'Not now', act: () => toMap('arcanum')}]
    })
  },
  i_sparWin:{ view: () => ({
    title:'The Lecture Hall',
    text:[
      `"Good. Better than good." Quill pats the smoking construct. "One thing. Big things telegraph. When it draws back for the big blow, <em>Shackle</em> it, or <em>Defend</em>. Mages who trade blows with constructs do not become old mages."`,
      `He hesitates, then adds, more quietly: "And Ilsa. Whatever Aurel was looking into, leave it alone. Please."`
    ],
    choices:[back()]
  })},
  i_sparLose:{ view: () => ({
    title:'The Lecture Hall',
    text:[
      `You land on your back with your ears ringing. Quill is fanning smoke out of your face. "Softly, I said. Mostly."`,
      `"Big things telegraph. When it draws back for the big blow, <em>Shackle</em> it, or <em>Defend</em>." You can rest in your room before you go anywhere dangerous.`
    ],
    choices:[back()]
  })},
  i_library:{
    enter(){ if (!S.flags.metHask){ S.flags.metHask = true; S.items.draught += 2; S.items.aether += 1; S.notice = 'Hask gives you 2 Healing Draughts and an Aether Draught.'; } },
    view: () => {
      const news = kaelNews();
      return {
        title:'The Great Library',
        text: S.flags.haskTalked ? [`Hask is back up his ladder. "More questions, apprentice?"`] : [
          `The Great Library is three stories of shelves around a well of salt-damp air. Hask the porter is up a ladder, reshelving with hands like shovels. He's Stoneborn, grey-skinned and broad as a door, and he has been here longer than any of the masters.`,
          `He climbs down when he sees you. "Apprentice Venn. You look like you haven't slept." He fishes bottles from his apron. "Healing draughts. And an aether draught, for when your head runs dry. Don't tell the bursar."`
        ],
        choices:[
          {label:'"Have you seen Magister Aurel?"', go:'i_haskAurel'},
          {label:'"What do you know about Proctor Graff?"', go:'i_haskGraff'},
          S.flags.askedAurel ? Object.assign({label:'"Hask, what is the Concord of Binding?"', go:'i_haskConcord'}, chk('lore', 1)) : null,
          news ? {label:'"Any news off the ships?"', go:'i_haskNews'} : null,
          back()
        ].filter(Boolean)
      };
    }
  },
  i_haskAurel:{ enter(){ S.flags.haskTalked = true; S.flags.askedAurel = true; }, view: () => ({
    title:'The Great Library',
    text:[
      `"He was in the restricted stacks every night for a month. Then the Proctor changed the wards on the Sealed Archive, and Aurel came down here white with anger. That was the last time I saw him."`,
      `Hask turns a book over in his big hands. "His study's been sealed since. I have keys to every room in this place, you know. Nobody ever thinks about who has the keys."`
    ],
    choices:[{label:'Ask something else', go:'i_library'}, back()]
  })},
  i_haskGraff:{ enter(){ S.flags.haskTalked = true; }, view: () => ({
    title:'The Great Library',
    text:[
      `"Proctor Graff came from Corvane three years ago, and inside a month the Archmagister made him master of discipline. He wears a grey stone on a chain under his collar. I've seen him touch it when he thinks nobody's looking."`,
      `"Apprentices who cross him get expelled, or transferred. They don't write."`
    ],
    choices:[{label:'Ask something else', go:'i_library'}, back()]
  })},
  i_haskConcord:{ enter(){ S.flags.heardConcord = true; }, view: () => ({
    title:'The Great Library',
    text:[
      `"The Concord of Binding." He says it carefully, as if it might break. "The founders' charter, written when the Wardstones were raised. Lost in the Sundering, supposedly."`,
      `He looks at you for a long moment. "Aurel asked me the same thing. I told him I didn't know where it was. Then he told me."`
    ],
    choices:[{label:'Ask something else', go:'i_library'}, back()]
  })},
  i_haskNews:{ view: () => ({
    title:'The Great Library',
    text:[
      `"Rumor off the Varrow grain ship: ${kaelNews()}." Hask shakes his head. "Varrow. They'd hang a man for looking at a lord wrong."`,
      echo('kael', 'That pit fighter is Kael Dunmore. Rumors from one hero’s chapter reach the others.')
    ],
    choices:[{label:'Ask something else', go:'i_library'}, back()]
  })},
  i_study:{ view: () => S.flags.studyDone ? ({
      title:'Aurel’s Study', text:[`Aurel's study, still a mess. You've taken everything that mattered.`], choices:[back()]
    }) : ({
      title:'Aurel’s Study',
      text:[`Aurel's study is at the end of the Magisters' Gallery. Its door is sealed with a ward that crawls with faint blue light. A new ward. Someone locked this room after he disappeared.`],
      choices:[
        Object.assign({label:'Unpick the ward, thread by thread.', act: () => { S.flags.studyHow = 'ward'; go('i_studyIn'); }}, chk('arcane', 2)),
        Object.assign({label:'The ward covers the door, not the old lock under it. Pick the lock.', act: () => { S.flags.studyHow = 'pick'; go('i_studyIn'); }}, chk('lockpick', 1)),
        S.flags.askedAurel ? {label:'Fetch Hask and his keys.', act: () => { S.flags.studyHow = 'hask'; go('i_studyIn'); }} : null,
        back('Leave')
      ].filter(Boolean)
    })
  },
  i_studyIn:{
    enter(){
      if (S.flags.studyDone) return;
      S.flags.studyDone = true;
      setQ('aurel', 'active', 'Aurel was investigating the Arcanum’s shard trade. His journal says to find the Concord in the Sealed Archive.');
      quest('concord', 'Find the Concord of Binding', 'Aurel’s journal says it’s in the Sealed Archive, behind the Lantern Stair. The door answers to the word Sorrowmere.');
      chron('You found Aurel’s hidden journal.');
    },
    view: () => {
      const kf = otherF('kael');
      const t = [
        S.flags.studyHow === 'hask' ? `Hask lets you in with a key the size of a soup ladle, then goes to watch the gallery.` : `The ward comes apart in your hands. The door swings in.`,
        `Aurel's study looks like a storm went through it. Someone searched it, hard. They missed the blue book, because it isn't blue: it's a cookbook with a blue ribbon, and Aurel's notes are written between the recipes in lemon juice. You warm the pages over a candle until the writing comes up brown.`,
        `<em>"Graff buys shards of the Third Ward from a Varrow house, forty crowns a shard. He burns them in a furnace under the Undercliff to make grey fire. The Archmagister knows."</em>`,
        `<em>"The Concord is in the Sealed Archive, behind the Lantern Stair. The door answers to the founders' word: Sorrowmere."</em>`,
        `<em>"If I am gone, Ilsa, don't come looking for me. Find the Concord. Read the last page. Then run."</em>`
      ];
      if (kf.readCarving) t.push(echo('kael', 'Kael read <em>Third of Seven</em> carved around a door beneath Varrow, with <em>40 crowns a shard</em> scratched underneath. Graff is the buyer.'));
      return {title:'Aurel’s Study', text:t, choices:[back()]};
    }
  },
  i_archive:{ view: () => ({
    title:'The Sealed Archive',
    text:[
      `The Lantern Stair winds down into the cliff, past landings where lamps have burned for six hundred years. At the bottom is a disc of bronze set into the rock.`,
      `You say the word: <em>Sorrowmere</em>. The disc turns, grinding, and opens.`,
      `Inside are shelves in the dark, and something stirring among them: an Archive Sentinel, a suit of runed armor with nobody in it, made to guard this place against exactly you.`,
      `<em>You'll face it alone. Rest first if you need to.</em>`
    ],
    choices:[{label:'Face the Sentinel', act: () => startCombat('i_sentinel')}, {label:'Back away and prepare', act: () => toMap('arcanum')}]
  })},
  i_concord:{
    enter(){
      if (S.flags.word) return;
      S.flags.word = true;
      S.notice = 'You learned the Unwritten Word. Once per fight, it hits for huge damage through any armor, but the Hollow will notice.';
      setQ('concord', 'done', 'You found the Concord of Binding.');
      chron('You read the Concord of Binding: the founders bargained with the Hollow.');
    },
    view: () => ({
      title:'The Concord of Binding',
      text:[
        `On a lectern at the heart of the archive lies a book bound in grey leather, colder than the room. <em>The Concord of Binding.</em>`,
        `You read standing up, too fast, the way you read everything. The founders didn't defeat the Hollow. They <em>bargained</em> with it. Seven Wardstones, seven bargains: the Hollow sleeps, and in return the founding magisters could draw on its fire. Grey fire. Every great work of the Arcanum was paid for with it.`,
        `One word in the text burns itself into you as you read. You don't know how to say it. You just know that you can.`,
        S.flags.fullReading ? `<em>"It need not be sealed forever. It can be ended."</em>` : ''
      ].filter(Boolean),
      choices:[
        !S.flags.fullReading ? Object.assign({label:'Read the last page, the one Aurel wanted you to read.', act: () => { S.flags.fullReading = true; chron('You read the Concord’s last page: the bargain can be ended, not just sealed.'); go('i_lastPage'); }}, chk('lore', 2)) : null,
        {label:'Boots on the stair. Someone is coming.', go:'i_caught'}
      ].filter(Boolean)
    })
  },
  i_lastPage:{ view: () => ({
    title:'The Concord of Binding',
    text:[
      `The last page is in a different hand, smaller, cramped, as if written in a hurry: <em>"A bargain is a binding of two wills. What is bound by will may be unbound by will. It need not be sealed forever. It can be ended."</em>`,
      `Under it, in pencil, in Aurel's handwriting: <em>Yes. But how?</em>`
    ],
    choices:[{label:'Boots on the stair. Someone is coming.', go:'i_caught'}]
  })},
  i_caught:{ view: () => ({
    title:'The Sealed Archive',
    text:[
      `Proctor Graff stands in the doorway with two acolytes behind him, lamps raised. He's a tall, narrow man, and the grey stone at his throat is glowing faintly.`,
      `He looks at the broken Sentinel. Then at the book in your hands. He smiles like a man who's been proven right. "Apprentice Venn. Give me the book."`
    ],
    choices:[
      {label:'Give it up. Then tell the whole Arcanum what’s in it.', act: () => { S.flags.choice = 'report'; go('i_report'); }},
      {label:'Slip the last pages into your sleeve and hand him the rest.', act: () => { S.flags.choice = 'hide'; go('i_hide'); }}
    ]
  })},
  i_report:{
    enter(){ S.flags.envoyToken = true; chron('You reported the Concord before the masters and the Crown’s envoy. You were expelled.'); },
    view: () => ({
      title:'The Hall of Tides',
      text:[
        `In the morning you stand before the masters in the Hall of Tides and tell them everything: the shards, the furnace, the bargain. At the back of the hall stands a woman in Crown blue: Envoy Lysa Marrow, sent from Corvane about missing tax ships. She listens to every word.`,
        `Archmagister Morn listens too, with no expression at all. Then she says: "The Concord is a forgery. Apprentice Venn is expelled for trespass. She leaves on the dawn boat."`,
        `As guards lead you out, the envoy falls into step beside you for three paces. "If you ever want to say that again," she murmurs, "say it in Corvane. Ask for me." She presses a brass token into your hand: a crown over a tower.`,
        `They lock you in the nest "for your safety." Near midnight, the lock turns. It's Hask. "There are acolytes on the tower stair with knives," he says. "Expelled apprentices don't always make the morning boat."`
      ],
      choices:[{label:'Continue', go:'i_haskJoins'}]
    })
  },
  i_hide:{
    enter(){ S.flags.hunted = true; chron('You hid the Concord’s last pages and kept them. The Arcanum has named you a thief.'); },
    view: () => ({
      title:'The Sealed Archive',
      text:[
        sk('stealth') >= 1 ? `You're quick. The pages are in your sleeve before Graff has finished his sentence, and he never sees them go.` : `Your hands shake, but the archive is dark and the acolytes' lamps swing. Graff never sees the pages go.`,
        `He takes the book without counting the pages. They lock you in the nest "pending questioning." Through the door you hear Graff tell an acolyte to pack your things, because you won't be needing them.`,
        `By midnight, word has gone around the towers: Apprentice Venn stole from the Archive. Thieves on the Spire Coast have a habit of falling off cliffs.`,
        `Near midnight, the lock turns. It's Hask. "They're coming for you tonight," he says. "I'd rather they didn't find you."`
      ],
      choices:[{label:'Continue', go:'i_haskJoins'}]
    })
  },
  i_haskJoins:{
    enter(){
      if (S.ally.joined) return;
      S.ally.joined = true; S.ally.hp = allyMax();
      S.notice = 'Hask joins you. He fights in the front row with a hammer and can Guard you, taking blows meant for you.';
      setQ('aurel', 'active', 'Hask thinks Aurel is being held somewhere in the Undercliff.');
      quest('escape', 'Escape the Arcanum', 'Get down through the Undercliff to the sea caves, where Hask has a boat.');
    },
    view: () => ({
      title:'The Nest',
      text:[
        `Hask has a hammer in his fist, the one he uses on the library's stuck shelves. It's clearly not only for shelves.`,
        `"The tower stair is watched. So we go down: the Undercliff, under the Arcanum, out through the sea caves. I keep a boat there." He hesitates. "And there's something down there you should see. I think I know where they've put Aurel."`
      ],
      choices:[{label:'Down into the Undercliff', act: () => toMap('undercliff')}]
    })
  },

  // --- Undercliff hub ---
  i_tower:{ view: () => ({title:'The Nest', text:[`Your room. The window rattles. There's nothing here to come back for.`], choices:[back()]}) },
  i_stair:{ view: () => S.flags.stairDone ? ({
      title:'The Lantern Stair', text:[`Spent lamps and scuff marks. The way down is clear.`], choices:[back()]
    }) : ({
      title:'The Lantern Stair',
      text:[
        `The stair spirals down into the cliff. Lamplight below, and voices: acolytes in grey robes, and one of them wearing a grey stone like Graff's.`,
        S.flags.hunted ? `There are more of them than there should be. They aren't guarding the stair. They're hunting you.` : `They're waiting on the landing, between you and the way down.`
      ],
      choices:[{label:'Fight your way down', act: () => startCombat('i_stair')}, back('Back off for now')]
    })
  },
  i_stairWin:{ enter(){ S.flags.stairDone = true; S.items.aether += 1; S.notice = 'One of the acolytes was carrying an Aether Draught.'; }, view: () => ({
    title:'The Lantern Stair',
    text:[`Hask leans on his hammer, breathing hard. "That's the noise made. Quick, now. Below is the landing, then the Undercliff proper."`],
    choices:[back()]
  })},
  i_landing:{ view: () => ({
    title:'The Landing',
    text:[`A wide ledge in the cliff where the stair forks three ways. Somewhere below, the sea booms against the rock. Hask keeps watch while you catch your breath.`],
    choices:[
      (S.pc.hp < pcMax() || S.pc.sp < spMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health and spell points)', act: () => { restAll(); S.notice = 'You rest on the landing. Health and spell points restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  i_vault:{ view: () => S.flags.vaultDone ? ({
      title:'The Shard Vault', text:[`Empty crates and straw, and the cold grey smell of the shards.`], choices:[back()]
    }) : ({
      title:'The Shard Vault',
      text:[`A round vault door, warded and locked, set into the cliff. Through the crack around it comes a cold grey light. Something heavy shifts its weight on the other side.`],
      choices:[
        Object.assign({label:'Pick the lock and slip in past whatever is guarding it.', act: () => { S.flags.vaultQuiet = true; go('i_vaultIn'); }}, chk('lockpick', 1)),
        Object.assign({label:'Unweave the ward and put its guardian to sleep.', act: () => { S.flags.vaultQuiet = true; go('i_vaultIn'); }}, chk('arcane', 4)),
        {label:'Force the door.', act: () => startCombat('i_golem')},
        back('Leave it')
      ]
    })
  },
  i_vaultIn:{
    enter(){
      if (S.flags.vaultDone) return;
      S.flags.vaultDone = true; S.flags.ledger = true; S.items.aether += 2; S.items.draught += 1; S.gold += 40;
      S.notice = 'You found 2 Aether Draughts, a Healing Draught and 40 crowns.';
      quest('trade', 'Follow the shard trade', 'The Arcanum buys Wardstone shards from House Sarne in Varrow, through a steward named Voss. You have the ledger to prove it.');
      chron('You took the Arcanum’s ledger: shards bought from House Sarne through Steward Voss.');
    },
    view: () => {
      const kf = otherF('kael');
      const t = [
        S.flags.vaultQuiet ? `You slip inside. The vault golem stands motionless in the corner, its runes dark, and doesn't turn its head.` : `The golem lies in pieces across the floor.`,
        `Crates line the walls, stamped with a green tower: the crest of House Sarne. Inside, packed in straw, are shards of black stone veined with silver, cold enough to sting.`,
        `On a shelf is a ledger. The last entry reads: <em>Received of House Sarne, Varrow, by the hand of Steward Voss: sixty shards, Third Ward. 2,400 crowns.</em>`
      ];
      if (kf.shards) t.push(echo('kael', 'Kael found the other end of this trade: Sarne crates of the same shards, beneath the Varrow arena.'));
      if (kf.dealDone) t.push(echo('kael', 'Steward Voss is the man who offered Kael his deal before the blood bout.'));
      return {title:'The Shard Vault', text:t, choices:[back()]};
    }
  },
  i_cell:{ view: () => S.flags.aurelDone ? ({
      title:'Aurel’s Cell', text:[`The pillar of shards is dark now. The chains hang empty.`], choices:[back()]
    }) : ({
      title:'Aurel’s Cell',
      text:[
        `A narrow cell cut into the rock, lit grey. Magister Aurel hangs in chains from a pillar of black stone studded with silver shards. He is thin as a rake, and the grey has crept up his arms past the elbows.`,
        `He opens his eyes. "Ilsa." His voice is a dry whisper. "I told you not to come."`
      ],
      choices:[{label:'Break him free.', go:'i_aurel'}, back()]
    })
  },
  i_aurel:{
    enter(){ if (S.flags.ringGiven) return; S.flags.ringGiven = true; S.gear.focus = 2; S.gear.focusName = 'Aurel’s ring'; S.notice = 'Aurel gives you his focus ring. Your spells do 2 more damage.'; },
    view: () => ({
      title:'Aurel’s Cell',
      text:[
        `The chains are only iron. It's the shards that hold him, drinking from him and feeding the furnace above. When you pull him free he sags into Hask's arms.`,
        S.flags.fullReading
          ? `"Did you read it?" he whispers. "The last page?" You tell him yes. He closes his eyes. "Good. Then you know. It can be ended."`
          : `"Did you read it? The last page?" You tell him there wasn't time. He grips your wrist with surprising strength. "A bargain can be broken, Ilsa. Not sealed again. <em>Ended.</em>"`,
        `"The Lantern Order has the other half: the cure for the grey, and maybe the way to end it. Find their healers. Go north." He presses a silver ring into your palm: his focus, the one he's worn as long as you've known him.`,
        `He tries to stand, and can't. "Leave me at the landing. I'll hold the stair behind you. I still know a few spells Graff doesn't."`
      ],
      choices:[
        {label:'Do as he asks.', act: () => { S.flags.aurelDone = true; S.flags.aurel = 'stayed'; S.flags.aurelTold = true; chron('You freed Aurel. He stayed behind to hold the stair.'); toMap('undercliff'); }},
        Object.assign({label:'"No. Hask can carry you, and you’re coming."', act: () => { S.flags.aurelDone = true; S.flags.aurel = 'carried'; S.flags.aurelTold = true; chron('You freed Aurel and refused to leave him behind.'); toMap('undercliff'); }}, chk('leadership', 1))
      ]
    })
  },
  i_furnace:{ view: () => ({
    title:'The Grey Furnace',
    text:[
      `At the bottom of the Undercliff, in a cavern above the sea, the Arcanum's secret furnace burns with pale grey fire. Shards crackle in it like kindling.`,
      `Proctor Graff stands at its controls, the stone at his throat blazing. Beside him looms a furnace thrall, a huge figure in an iron apron, grey to the eyes. A grey adept waits behind them.`,
      `"Venn," Graff says. "You should have taken the boat."`,
      `<em>This will be a hard fight. Graff stays behind the thrall, out of reach of melee. You can go back up to the landing to rest first.</em>`
    ],
    choices:[{label:'Fight Proctor Graff', act: () => startCombat('i_boss')}, {label:'Back away and prepare', act: () => toMap('undercliff')}]
  })},
  i_furnaceWin:{
    enter(){ if (S.flags.bossDone) return; S.flags.bossDone = true; S.pc.skills.wardlore = Math.max(1, S.pc.skills.wardlore || 0); S.notice = 'You learned Wardlore 1.'; },
    view: () => ({
      title:'The Grey Furnace',
      text:[
        `Graff falls, and the grey stone at his throat cracks in two. For a moment you feel it, far away and under everything: something vast that noticed the crack, and turned toward it, and then lost interest.`,
        `Hask hauls on a lever. Seawater roars into the furnace, and the cavern fills with steam that smells of salt and ash. When it clears, the grey fire is out.`,
        `Behind the furnace a passage leads down to the sea cave, and Hask's boat.`
      ],
      choices:[{label:'Down to the sea', go:'i_ending'}]
    })
  },
  i_ending:{ view: () => {
    const f = S.flags; const t = [
      `Hask rows you out of the sea cave as the sun comes up. The fog is lifting off the water, and behind you the nine towers of the Arcanum shrink into the cliffs.`,
      f.aurel === 'carried' ? `Aurel sleeps in the bottom of the boat, wrapped in Hask's coat. He's grey to the shoulders, but he's breathing.`
        : f.aurel === 'stayed' ? `Somewhere in the cliff behind you, a light flares once and goes out. You don't know what it means. You decide it means he's still fighting.`
        : `You never found Aurel. You'll wonder about that for a long time.`,
      f.choice === 'report' ? `You turn the envoy's brass token over and over in your fingers.` : `The stolen pages are dry in your satchel, wrapped in oilcloth.`,
      `"Where to?" Hask asks. You already know. Everything in this story is pointing at one place. "Corvane," you say.`
    ];
    return {title:'The Open Sea', text:t, choices:[{label:'End of Ilsa’s chapter', act: () => { setQ('escape', 'done', 'You escaped the Arcanum by sea.'); quest('corvane', 'Go north to Corvane', f.choice === 'report' ? 'Find Envoy Lysa Marrow.' : 'Find someone who will believe the Concord.'); S.mode = 'end'; save(); render(true); }}]};
  }}
});

Object.assign(MAPS, {
  arcanum:{
    title:'The Arcanum',
    blurb: () => `Midnight on the Spire Coast. The fog is in, and the Proctor's acolytes walk the galleries.`,
    w:340, h:240,
    nodes:[
      {id:'i_dorm', label:'The Nest', x:60, y:60, sub:'Your room · rest'},
      {id:'i_hall', label:'Lecture Hall', x:170, y:40, sub:'Magister Quill', done: () => S.flags.sparred},
      {id:'i_library', label:'Great Library', x:282, y:60, sub:'Hask', done: () => S.flags.metHask},
      {id:'i_study', label:'Aurel’s Study', x:95, y:170, sub:'The blue book', done: () => S.flags.studyDone},
      {id:'i_archive', label:'Sealed Archive', x:250, y:175, sub:'The Concord', open: () => S.flags.studyDone, done: () => S.flags.word, lockText:'Find the way in first'}
    ],
    edges:[['i_dorm','i_hall'],['i_hall','i_library'],['i_dorm','i_study'],['i_study','i_archive'],['i_library','i_archive'],['i_hall','i_study']]
  },
  undercliff:{
    title:'The Undercliff',
    blurb: () => `Below the Arcanum, the cliff is hollow. Somewhere down here is a furnace, and maybe Aurel.`,
    w:340, h:270,
    nodes:[
      {id:'i_tower', label:'The Nest', x:45, y:40, sub:'Where you started', done: () => true},
      {id:'i_stair', label:'Lantern Stair', x:150, y:40, sub:'Acolytes', done: () => S.flags.stairDone},
      {id:'i_landing', label:'The Landing', x:190, y:120, sub:'Rest', open: () => S.flags.stairDone, lockText:'Down the stair'},
      {id:'i_cell', label:'Aurel’s Cell', x:62, y:165, sub:'Optional', open: () => S.flags.stairDone, done: () => S.flags.aurelDone, lockText:'Down the stair'},
      {id:'i_vault', label:'Shard Vault', x:278, y:55, sub:'Optional', open: () => S.flags.stairDone, done: () => S.flags.vaultDone, lockText:'Down the stair'},
      {id:'i_furnace', label:'Grey Furnace', x:255, y:205, sub:'Graff', open: () => S.flags.stairDone, done: () => S.flags.bossDone, lockText:'Down the stair'}
    ],
    edges:[['i_tower','i_stair'],['i_stair','i_landing'],['i_landing','i_cell'],['i_landing','i_vault'],['i_landing','i_furnace']]
  }
});

Object.assign(ENEMIES, {
  construct:{name:'Training Construct', hp:30, dmg:[4,7], acc:70, dodge:0, armor:3, init:2, xp:40,
    spec:{every:3, name:'Piston Slam', windup:'{n} draws its brass arm back, gears whining.', mult:1.8}},
  sentinel:{name:'Archive Sentinel', hp:46, dmg:[5,8], acc:72, dodge:4, armor:3, init:3, xp:90,
    spec:{every:3, name:'Ward Lash', windup:'The runes on {n} flare white.', mult:1.9}},
  acolyte:{name:'Acolyte', hp:26, dmg:[5,8], acc:70, dodge:6, armor:1, init:5, xp:25},
  adept:{name:'Grey Adept', hp:22, dmg:[5,8], acc:72, dodge:8, armor:0, init:6, xp:35, ranged:true, row:'back', greyChance:40},
  golem:{name:'Vault Golem', hp:70, dmg:[7,11], acc:68, dodge:0, armor:4, init:1, xp:70,
    spec:{every:3, name:'Crushing Fist', windup:'{n} raises both stone fists high.', mult:1.8}},
  thrall:{name:'Furnace Thrall', hp:75, dmg:[8,12], acc:70, dodge:2, armor:3, init:2, xp:90,
    spec:{every:4, name:'Furnace Grip', windup:'{n} opens its huge grey hands.', mult:1.5, stun:true}},
  graff:{name:'Proctor Graff', hp:64, dmg:[6,9], acc:74, dodge:8, armor:1, init:6, xp:170, ranged:true, row:'back', greyChance:30,
    spec:{every:3, name:'Grey Inferno', windup:'{n} lifts his grey stone, and pale fire gathers around it.', mult:1.15, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  i_spar:{title:'Practice: the Training Construct', enemies:() => ['construct'], lethal:false, win:'i_sparWin', lose:'i_sparLose', loseXP:20, back:'i_hall',
    done: () => { S.flags.sparred = true; }, intro:'Quill steps well back. The construct’s eyes glow amber.'},
  i_sentinel:{title:'The Archive Sentinel', enemies:() => ['sentinel'], lethal:true, win:'i_concord', back:'i_archive',
    intro:'The empty armor turns toward you, runes kindling along its arms.'},
  i_stair:{title:'The Lantern Stair', enemies:() => S.flags.hunted ? ['acolyte', 'acolyte', 'acolyte', 'adept', 'adept'] : ['acolyte', 'acolyte', 'acolyte', 'adept'], lethal:true, win:'i_stairWin', back:'i_stair',
    intro:'The acolytes draw knives. The adept hangs back, grey light in his hands.'},
  i_golem:{title:'The Shard Vault', enemies:() => ['golem'], lethal:true, flee:true, win:'i_vaultIn', back:'i_vault',
    intro:'The door gives. A golem of carved stone grinds toward you.'},
  i_boss:{title:'Proctor Graff', enemies:() => ['thrall', 'graff', 'adept'], lethal:true, win:'i_furnaceWin', back:'i_furnace',
    intro:'The thrall lumbers forward. Behind it, Graff’s grey stone begins to burn.'}
});



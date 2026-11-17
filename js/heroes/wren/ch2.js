// ================= WREN, CHAPTER 2: THE ENCLAVES =================
// Wren and Tobin go north along the eastern Thornwood to a Sylvari enclave, following her father's sign, with
// Quell's knives and (if she kept the key) House Sarne behind her, and the Crown's envoy waiting at the gate.
// Scene IDs use the prefix w2_. Placeholder names: Ardh Lirien, Ysolde, Gant the Hook, the Founder's Door.
HEROES.wren.chapters[2] = {title:'The Enclaves', start:'w2_intro'};

const wKept = () => S.flags.key === 'kept';
const ilsaMarrow = () => otherF('ilsa').choice || null;          // 'report' or 'hide'
const ilsaWard = () => { const i = otherF('ilsa'); return i.spokeWard ? 'spoke' : i.wardEaterDone ? 'silent' : null; };
const gateShut = () => otherF('tamsin').order === 'warners';
const wXP = (n) => { const ups = gainXP(n); return `+${n} experience${ups.length ? `. Level up! Wren is now level ${S.level}.` : '.'}`; };

Object.assign(SCENES, {
  w2_intro:{
    enter(){ quest('enclave', 'The enclave road', S.flags.parentHint ? 'Follow your father’s sign north along the eastern Thornwood to the Sylvari enclave of Ardh Lirien.' : 'Take the enclave road north along the eastern Thornwood, the one road Quell and House Sarne both avoid.'); },
    view: () => ({
      title:'The Enclave Road',
      text:[
        `North of the river, the Thornwood bends east, and the road bends with it: a green tunnel of oak and holly older than any kingdom, with Sylvari boundary stones every mile, cut with signs that say <em>not yours</em> in a language you only half read.`,
        S.flags.parentHint
          ? `You know what you're looking for now. Your father's sign isn't a name; it's a family mark, the kind the enclaves carve over doors. Somewhere up this road is a door with your mother's comb carved over it.`
          : `It's the one road north that Quell's people won't take and House Sarne can't buy. That's the reason you give Tobin. The other reason is the crate: since the waystation, it hums louder every mile you walk north, as if it knows where it's going.`,
        `Tobin carries the crate on his back and doesn't complain. "Sylvari don't like humans," he says, "and they don't like half-bloods, and they really don't like boxes that glow. This is going to be a good week."`
      ],
      choices:[{label:'North along the enclave road', act: () => toMap('w2_east')}]
    })
  },

  // --- The Eastern Thornwood hub ---
  w2_camp:{ view: () => ({
    title:'A Holly Thicket',
    text:[`A dry hollow under a holly thicket, with a fire small enough to cup in your hands. Tobin sets the crate down where he can see it and falls asleep sitting up.`],
    choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest (restores health)', act: () => { restAll(); S.notice = 'You rest. Health restored.'; render(); }} : null,
      back()
    ].filter(Boolean)
  })},
  w2_hut:{ enter(){ S.flags.metTrapper = true; }, view: () => {
    const f = S.flags, k = otherF('kael');
    const t = [
      `A trapper's hut stands where the enclave road crosses a stream, hung with furs and bundled herbs. The trapper is a human woman as old as the hills, who looks at your ears and then at Tobin's crate and says, "Hm."`,
      `"Nell Kestrel was through two days back," she says. "With five of Quell's knives and a big lump with a hook for a hand. Asking after a half-Sylvari with a glowing box." She sniffs. "I said I'd never seen a half-Sylvari. They paid me anyway."`
    ];
    if (k.captain) t.push(`"And there's a swordsman loose in the Heartland with a price on him," she adds. "Beat a whole Free Company at Hollin's Ford, they say. ${k.captain === 'freed' ? 'Let the captain walk, too. Daft or decent, can’t tell which.' : 'Handed the captain to the Crown with a Sarne contract in her coat.'}"`,
      echo('kael', k.captain === 'freed' ? 'Kael beat the Iron Tally at Hollin’s Ford and let Captain Brask walk.' : 'Kael beat the Iron Tally at Hollin’s Ford and handed Captain Brask to the Crown.'));
    else if (k.dario === 'killed') t.push(`"And a pit fighter killed a Sarne lord in Varrow," she says. "Five hundred crowns, dead or alive. You're not him, are you? No. Too short."`);
    return {title:'The Trapper’s Hut', text:t, choices:[
      !f.hutBought ? {label:'Buy 2 Healing Draughts (20 crowns)', req: () => S.gold >= 20, tag: S.gold >= 20 ? null : 'Needs 20 crowns', act: () => { S.gold -= 20; S.items.draught += 2; f.hutBought = true; S.notice = 'You buy 2 Healing Draughts.'; render(); }} : null,
      back()
    ].filter(Boolean)};
  }},
  w2_sarne:{ view: () => {
    const f = S.flags;
    if (f.sarneDone) return {title: wKept() ? 'The Hunters’ Trail' : 'The Burned Camp', text:[wKept() ? `Trampled bracken, and Sarne green rotting in the ditch.` : `Ash and broken crates. The wood is already growing over it.`], choices:[back()]};
    if (wKept()) return {title:'The Hunters’ Trail', text:[
      `Tobin stops dead. Across the road ahead, too neat to be natural, a deadfall has been dragged into place, and the bracken beside it is full of Sarne green.`,
      `Steward Voss said he'd collect the key another way. This is the other way.`
    ], choices:[{label:'Fight', act: () => startCombat('w2_hunters')}, back('Back off for now')]};
    return {title:'The Burned Camp', text:[
      `Off the road, a Sarne camp has been burned out: tents, a wagon, a dozen crates smashed open. Whoever burned it wore Sylvari arrows; they're still in the ground, fletched in white.`,
      `The crates were full of Sylvari things. Lamps. Books bound in bark. A carved door-lintel, wrenched off its wall. The founder's key opened a door somewhere up this road, and House Sarne emptied what was behind it, and the enclave caught up with them here.`
    ], choices:[
      Object.assign({label:'Read the bark books for what was taken.', act: () => { f.sarneDone = true; f.lootRead = true; S.notice = wXP(40); chron('You found the loot from a Sylvari vault in a burned Sarne camp. House Sarne used the key you sold.'); go('w2_loot'); }}, chk('lore', 1)),
      {label:'Pick through the wreck for anything useful.', act: () => { f.sarneDone = true; S.items.draught += 1; S.gold += 15; S.notice = 'You find a Healing Draught and 15 crowns.'; render(); }},
      back()
    ]};
  }},
  w2_loot:{ view: () => ({
    title:'The Burned Camp',
    text:[`The bark books are an inventory, Sylvari-neat: <em>the Wardens' records, the founder's lamp, the second key, the bow of the line.</em> The last two lines are crossed out in fresh ink, in a human hand. Sarne took the second key and the bow, and left the books behind as if they didn't matter.`, `Tobin reads over your shoulder, moving his lips. "Second key," he says. "So there's more than one door."`],
    choices:[back()]
  })},
  w2_huntersWin:{ enter(){ S.flags.sarneDone = true; S.gold += 20; S.items.draught += 1; S.notice = 'You find 20 crowns and a Healing Draught on the hunters.'; chron('You fought off House Sarne’s hunters on the enclave road. Voss wants the key back.'); }, view: () => ({
    title:'The Hunters’ Trail',
    text:[`One of the hunters carries a note in Voss's tidy hand: <em>"The girl will make for the enclave. The key opens the Founder's Door there. Take it before she reaches it."</em>`, `So that's the door Lord Corrin had in mind. And it's ahead of you.`],
    choices:[back()]
  })},
  w2_glade:{ view: () => S.flags.gladeDone ? ({
      title:'The Grey Glade', text:[`The glade is quiet. The grey is already fading from the grass.`], choices:[back()]
    }) : ({
      title:'The Grey Glade',
      text:[`Off the road, a glade where the grass has gone grey and brittle as ash. In the middle stands a stag with its antlers grown into a crown of grey thorn, and around its feet the briars are moving.`, `It looks at the crate on Tobin's back as if it's hungry.`],
      choices:[{label:'Fight', act: () => startCombat('w2_glade')}, back('Leave it')]
    })
  },
  w2_gladeWin:{ enter(){ S.flags.gladeDone = true; S.gear.armor += 1; S.items.tonic += 1; S.notice = 'Under the stag’s tree you find a dead ranger’s brigandine (+1 armor) and a Bitter Tonic.'; }, view: () => ({
    title:'The Grey Glade',
    text:[`The stag goes down, and the thorn-crown crumbles off its head, and it's only a deer again: old, thin, dead a long time. Under its tree are the bones of an enclave ranger who must have tried before you.`],
    choices:[back()]
  })},
  w2_onward:{ view: () => ({
    title:'The Boundary',
    text:[`The road climbs to a ridge of white boundary stones, and beyond them the trees are taller than towers and hung with lamps. Ardh Lirien.`, `Once you're past the stones, you're the enclave's guest, or its prisoner.`],
    choices:[{label:'Into the enclave', act: () => toMap('w2_enclave')}, {label:'Not yet', act: () => toMap('w2_east')}]
  })},

  // --- Ardh Lirien hub ---
  w2_gate:{ view: () => {
    const f = S.flags;
    if (f.inside) return {title:'The Lamp Gate', text:[`The lamp gate stands ${gateShut() ? 'barred, but the wardens nod you through' : 'open'}.`], choices:[back()]};
    if (gateShut()) return {title:'The Lamp Gate', text:[
      `The enclave's gate is two living trees grown together, and it's barred. A warden in white looks down at you from the branches. "Lantern bells have been ringing in the human lands," she says. "The grey is loose. Nobody from outside comes in. Not humans. Not half-bloods. Not boxes."`,
      echo('tamsin', 'Tamsin had the Lantern bells rung across the Heartland. The news reached the enclaves, and they have shut their gates.')
    ], choices:[
      Object.assign({label:'"I’m not outside. I’m one of yours, and I can prove it."', act: () => { f.inside = true; f.gateHow = 'talk'; S.notice = wXP(40); go('w2_in'); }}, chk('leadership', 1)),
      Object.assign({label:'Wait for dark and go over the wall through the branches.', act: () => { f.inside = true; f.gateHow = 'climb'; S.notice = wXP(40); go('w2_in'); }}, chk('stealth', 1)),
      {label:'Go to the Crown envoy’s camp and come in as her guest.', act: () => { f.inside = true; f.gateHow = 'guest'; f.asGuest = true; chron('You entered Ardh Lirien as the Crown envoy’s guest. The enclave treats you as the Crown’s.'); go('w2_in'); }},
      back()
    ]};
    const t = [`The enclave's gate is two living trees grown together, and it stands open. Lamps hang in the branches like fruit.`];
    if (otherF('tamsin').order === 'keepers') t.push(`Inside, a long shelter under the trees is full of humans from the Heartland: refugees from the grey fever, grey to the wrists, and nobody has told them what it is.`, echo('tamsin', 'Tamsin kept the Lantern Order quiet. The grey-sick have come to the enclaves for shelter, and nobody has warned them.'));
    return {title:'The Lamp Gate', text:t, choices:[{label:'Walk in', act: () => { f.inside = true; f.gateHow = 'open'; go('w2_in'); }}, back()]};
  }},
  w2_in:{ view: () => ({
    title:'Ardh Lirien',
    text:[{talk:`The warden listens, then looks at your ears and your eyes for a long moment, and lets the bar down herself.`, climb:`You go up through the gate-trees in the dark like a squirrel, with Tobin wheezing behind you, and drop down into a lamplit lane before anyone looks up.`, guest:`The envoy's sergeant walks you to the gate with a Crown seal in his hand, and the wardens let you through. They look at you as if you've chosen a side.`, open:`You walk in under the lamps.`}[S.flags.gateHow] || `You walk in under the lamps.`,
      `Ardh Lirien is a town built in and under the trees: halls in the hollows of oaks, bridges of living root, and everywhere doors, carved with family marks.`],
    choices:[back()]
  })},
  w2_hall:{ view: () => {
    const f = S.flags;
    if (f.metAunt) return {title:'The Hall of Doors', text:[`Your father's door. Ysolde's lamp burns in the window, and there's a bed made up for you inside${f.asGuest ? ', even if she won’t look at you' : ''}.`], choices:[
      (S.pc.hp < pcMax() || S.ally.hp < allyMax()) ? {label:'Rest at Ysolde’s (restores health)', act: () => { restAll(); S.notice = 'You sleep under your father’s roof. Health restored.'; render(); }} : null,
      back()
    ].filter(Boolean)};
    const t = [`The Hall of Doors is a long avenue of oaks, each with a door carved into its trunk and a family mark over the lintel. Hundreds of them. The oldest are worn almost smooth.`];
    const ch = [];
    if (f.parentHint) ch.push({label:'Look for your father’s sign.', act: () => { f.signHow = 'sign'; go('w2_aunt'); }});
    else {
      ch.push(Object.assign({label:'Read the oldest marks for the Warden families from the waystone.', act: () => { f.signHow = 'lore'; go('w2_aunt'); }}, chk('lore', 1)));
      ch.push({label:'Walk the avenue holding up your mother’s bone comb, and see who stares.', act: () => { f.signHow = 'comb'; go('w2_aunt'); }});
    }
    ch.push(back());
    return {title:'The Hall of Doors', text:t, choices:ch};
  }},
  w2_aunt:{
    enter(){ if (S.flags.metAunt) return; S.flags.metAunt = true; S.notice = wXP(50); chron('In Ardh Lirien you found your father’s door, and your aunt Ysolde. He was of the Warden line, and he went to Corvane twenty years ago and never came back.'); quest('father', 'Your father’s sign', 'Your father was of the Warden line of Ardh Lirien. Twenty years ago he went to Corvane to warn the Crown about the Wardstones, and never came back. Your aunt Ysolde keeps his door.'); },
    view: () => ({
      title:'The Hall of Doors',
      text:[
        {sign:`It's near the end of the avenue, very old: your father's sign, cut deep over a door of black oak. Your hand goes to the comb in your pocket before you know it.`, lore:`The waystone listed the Wardens of the Binding, and their families still keep doors here. You follow the oldest marks to the end of the avenue, and there it is: your father's sign, over a door of black oak.`, comb:`You walk the whole avenue with the comb held up like a fool. At the very end, an old woman on the step of a black oak door goes white and stands up. Over her door is the sign on your comb.`}[S.flags.signHow],
        `The woman who opens the door is grey-haired and straight-backed, with your eyes. She looks at you for a long time. "Ysolde," she says finally. "I'm his sister. You have his face, child. He'd have hated that, he was so vain about it."`,
        `"He was of the Warden line, the last of it to stand watch. Twenty years ago the stones started humming, and he went to Corvane to tell the Crown. He never came back. We had a letter, once, from a human woman on the Thornwood edge." She stops. "Your mother."`,
        S.flags.asGuest ? `"And now you come back to us with a Crown seal on you." Her mouth tightens. "Our wardens won't stand with the Crown's people, Wren. Not even for his daughter."` : `"Whatever is coming for you," she says, "the wardens of this house will stand at the gate for you. That's what the line is for."`
      ],
      choices:[back()]
    })
  },
  w2_door:{ view: () => {
    const f = S.flags;
    if (f.founderDoor) return {title:'The Founder’s Door', text:[f.founderDoor === 'opened' ? `The Founder's Door stands open on an empty vault. You took what was yours.` : `The Founder's Door hangs off its hinges.`], choices:[back()]};
    if (wKept()) return {title:'The Founder’s Door', text:[
      `At the roots of the oldest tree in the enclave is a door of white stone with no handle and no lock you can see, only a keyhole shaped like a leaf. It's been sealed for nine hundred years. The key inside your shirt has gone warm.`
    ], choices:[{label:'Open it with the founder’s key.', act: () => { f.founderDoor = 'opened'; f.fatherBow = true; S.gear.bow = Math.max(S.gear.bow || 0, 2); S.gear.bowName = 'Warden’s longbow'; S.notice = `${wXP(40)} You take the Warden’s longbow (+2 bow damage).`; chron('You opened the Founder’s Door with the key you kept, and took the Warden’s longbow.'); go('w2_vault'); }}, back()]};
    return {title:'The Founder’s Door', text:[
      `At the roots of the oldest tree in the enclave is a door of white stone. It hangs off its hinges. The vault behind it is empty except for dust, and the shape of a bow on the wall where a bow hung for nine hundred years.`,
      `An enclave warden stands guard over the nothing. "Humans with a key," he says, not looking at you. "Their half-blood carried it as far as the river. That's what they say." He spits.`,
      `You sold that key. You don't say so.`
    ], choices:[{label:'Leave', act: () => { f.founderDoor = 'looted'; chron('You saw the Founder’s Door broken open. House Sarne used the key you sold.'); render(); }}]};
  }},
  w2_vault:{ view: () => ({
    title:'The Founder’s Vault',
    text:[
      `Behind the door: a round stone room, dry as bone. Records in bark, a lamp that lights itself when you step in, and on the wall a longbow of white wood, strung, as if somebody meant to come back for it.`,
      `The records name the Wardens of the Binding, one to a stone, seven stones. And the last of them, the Warden of the Third Stone, signed with your father's sign. The Third Stone, under Varrow.`,
      `Tobin whistles. "That's the one cracking," he says. "Isn't it."`
    ],
    choices:[back()]
  })},
  w2_well:{ enter(){ S.flags.metSeer = true; if (ilsaWard() === 'spoke') S.flags.fragmentSong = true; }, view: () => {
    const w = ilsaWard();
    const t = [`The Moonwell is a pool of black water in a ring of white stones, and the enclave's seer is an ancient Sylvari man who sits beside it with his feet in the water. He asks to see the crate. Tobin opens it.`];
    if (w === 'spoke') t.push(`The fragment is singing. Not humming: singing, one long clear note, and the water in the well rings with it. The seer's eyes fill. "Someone has spoken to the cage," he says. "Far west, a Sylvari voice spoke the old Word into a broken Ward and closed it, and every piece of the cage felt it. Do you hear? It's in tune again. It can be <em>mended</em>, not just broken."`, echo('ilsa', 'Ilsa spoke the Unwritten Word into the Fourth Ward. Every piece of the cage felt it, and the fragment sings in tune.'));
    else if (w === 'silent') t.push(`The fragment hums, low and uneasy. The seer listens a long time. "A Sylvari girl stood at the Fourth Ward with the old Word in her mouth," he says, "and didn't speak it. The cage felt her there. It's waiting."`, echo('ilsa', 'Ilsa reached the Fourth Ward and chose not to speak the Word.'));
    else t.push(`The fragment hums, low and uneasy. "A piece of the cage," the seer says. "Alive, as all of it is alive. It wants to go home."`);
    t.push(`"Whoever carries this carries a piece of the Binding," he says. "The Crown will want it. The Ashen Hand will want it. Your aunt will say it belongs to your line. All of them are a little right."`);
    return {title:'The Moonwell', text:t, choices:[back()]};
  }},
  w2_marrow:{ enter(){ S.flags.metMarrow = true; }, view: () => {
    const m = ilsaMarrow();
    const t = [`Outside the enclave's boundary stones, the Crown has pitched a camp: blue tents, a dozen soldiers and a tall, tired woman in a travelling coat with ink on her cuffs. Envoy Lysa Marrow.`];
    if (m === 'report') t.push(`"You're the one with the fragment," she says, and offers you a chair instead of an order. "An apprentice called Ilsa Venn walked into my office with the Concord and told me what the Wardstones are. I believed her. That makes me the only person in the Crown's service who does." She leans forward. "I'm gathering every piece of the Binding I can find before the Ashen Hand does. Let me protect it. Let me protect <em>you</em>."`, echo('ilsa', 'Ilsa reported the Concord to Envoy Lysa Marrow, and Marrow believed her.'));
    else if (m === 'hide') t.push(`She doesn't offer you a chair. A sergeant puts a paper in your hand: a Crown requisition for <em>"all objects of Wardstone origin, by order of the Envoy."</em> "The Arcanum says one of its apprentices stole a book that explains all this," Marrow says. "Nobody will tell me the truth, so I'm collecting the evidence. Yours is in that crate."`, echo('ilsa', 'Ilsa hid the Concord’s last pages. The Crown’s envoy is collecting evidence by force.'));
    else t.push(`"You're the one with the fragment," she says. "I'm gathering every piece of the Binding I can find before the Ashen Hand does. I'd rather you gave it to me than made me take it."`);
    if (otherF('kael').shardProof) t.push(`"Shards are turning up all over the Heartland," she adds. "A farmer on the Salt Road says a swordsman pulled one out of his well with his bare hand. Somebody is spilling the cage across the kingdom by the cartload."`);
    return {title:'The Envoy’s Camp', text:t, choices:[back()]};
  }},
  w2_watch:{ view: () => {
    const f = S.flags;
    if (f.quiverTaken) return {title:'Nell’s Camp', text:[`Nell's quiver is under your bed in Ysolde's house. She'll be short of the good arrows.`], choices:[back()]};
    return {title:'Nell’s Camp', text:[
      `You find them from the trapper's description: a camp in a gully half a mile outside the boundary stones, with Nell Kestrel sitting on a log fletching arrows, a huge man with an iron hook for a left hand sharpening it on a stone, and knives. They're coming tonight.`,
      `Nell's good arrows, the long black-fletched ones she saves for the shots that matter, are in a quiver by her bedroll.`
    ], choices:[
      Object.assign({label:'Wait until she sleeps, and steal the quiver.', act: () => { f.quiverTaken = true; chron('You stole Nell Kestrel’s quiver from under her nose.'); S.notice = wXP(40); render(); }}, chk('stealth', 2)),
      back()
    ]};
  }},
  w2_night:{ view: () => {
    const f = S.flags, wardens = f.metAunt && !f.asGuest;
    const t = [`They come at moonset, over the boundary stones and straight for Ysolde's door, where the crate is.`];
    if (wardens) t.push(`Ysolde's wardens are waiting at the gate-trees. White arrows come out of the dark, and one of Quell's knives goes down before he's past the stones.`);
    else if (f.asGuest) t.push(`The enclave's wardens watch from the branches, and do nothing. You came in as the Crown's.`);
    if (f.quiverTaken) t.push(`Nell reaches for her black-fletched arrows and finds an empty hip. She swears so loud the whole enclave hears.`);
    t.push(`"Wren!" Nell calls, nocking. "Nothing personal. Quell wants her crate or its worth, and I want to be the one who brought it in." Behind her, Gant the Hook grins and flexes his hook.`, `<em>This will be a hard fight. Nell's Marked Shot hits one target very hard. Watch for it, and Vanish or have Tobin cover you.</em>`);
    return {title:'Moonset', text:t, choices:[{label:'Fight Nell Kestrel', act: () => startCombat('w2_boss')}, {label:'Fall back and prepare', act: () => toMap('w2_enclave')}]};
  }},
  w2_bossWin:{
    enter(){ if (S.flags.w2Boss) return; S.flags.w2Boss = true; },
    view: () => ({
      title:'Moonset',
      text:[
        `Nell is the last one standing, with an empty bowstring and blood in her eyes. Then she isn't. She sits down hard in the leaf-litter and laughs, which is the most Nell thing she could do. "You were always better," she says. "Never told you. Don't you dare tell Quell."`,
        `By morning she's gone, limping south. And by morning, two people are waiting for you at Ysolde's door: Envoy Marrow with her sergeant, and your aunt with her arms folded.`
      ],
      choices:[{label:'Hear them out', go:'w2_choice'}]
    })
  },
  w2_choice:{ view: () => ({
    title:'Ysolde’s Door',
    text:[
      `"Give it to me," Marrow says. "The Crown needs to see it, hold it, hear it hum. A fragment on the Council table in Corvane is worth more than every report I've ever written. With it, I can make them believe."`,
      `"It belongs to the line," Ysolde says. "To the Wardens who made the cage. Your father died trying to make the Crown listen. Hand it to them and you hand them his life's work. Keep it, and this house stands with you."`,
      S.flags.fragmentSong ? `In the crate, the fragment is still singing its one clear note.` : `In the crate, the fragment hums.`
    ],
    choices:[
      {label:'Give the fragment to Envoy Marrow.', act: () => { S.flags.fragment = 'crown'; chron('You gave the Wardstone fragment to Envoy Lysa Marrow, to put before the Crown. Ysolde shut her door on you.'); go('w2_crown'); }},
      {label:'Keep it. It stays with the line.', act: () => { S.flags.fragment = 'kept'; chron('You kept the Wardstone fragment for your father’s line. The Crown has marked you a thief.'); go('w2_keep'); }}
    ]
  })},
  w2_crown:{ view: () => ({
    title:'Ysolde’s Door',
    text:[
      `Marrow takes the crate from Tobin herself, with both arms, as if it were a sleeping child. "Thank you," she says, and means it. "When you reach Corvane, ask for me at the Envoys' Court. You'll be let in."`,
      `Ysolde doesn't say anything. She goes inside and shuts the black oak door, very quietly, and the bar goes across.`,
      `Tobin, after a while: "Well. Box is gone. My back thanks you." He doesn't look at you.`
    ],
    choices:[{label:'Continue', go:'w2_ending'}]
  })},
  w2_keep:{ view: () => ({
    title:'Ysolde’s Door',
    text:[
      `"No," you tell Marrow. "Not yet."`,
      `The envoy is quiet a moment. Then she nods to her sergeant, and he writes something down. "Then I have to report a Wardstone fragment in private hands," she says. "I'm sorry. You'll be a thief in the Crown's books by the time you reach the river."`,
      `Ysolde puts a hand on your shoulder, the first time anyone of your father's blood has touched you. "The line stands with you," she says. "Whatever that's worth out there."`
    ],
    choices:[{label:'Continue', go:'w2_ending'}]
  })},
  w2_ending:{ view: () => {
    const f = S.flags;
    const t = [
      `You leave Ardh Lirien two days later, by the river road, where the barges go down to Corvane.`,
      f.fragment === 'crown' ? `Tobin's back is lighter, and so, you keep telling yourself, is yours.` : `Tobin carries the crate, and it hums against his back like a second heart.`,
      f.metAunt ? `In your pocket, your mother's comb. On your back, ${f.fatherBow ? 'your father’s bow' : 'your own old bow'}. Somewhere in Corvane, twenty years cold, your father's trail.` : `In your pocket, your mother's comb.`,
      `"Corvane," Tobin says, looking downriver. "Big city. Lots of people. Bet none of them want to kill us yet."`
    ];
    return {title:'The River Road', text:t, choices:[{label:'End of chapter 2', act: () => {
      setQ('enclave', 'done', 'You reached Ardh Lirien and faced Nell Kestrel at moonset.');
      quest('corvane', 'Go north to Corvane', f.fragment === 'crown' ? 'Take the river barges to Corvane. Envoy Marrow says you will be let into the Envoys’ Court.' : 'Take the river barges to Corvane, with the fragment. The Crown has marked you a thief.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  w2_east:{
    title:'The Eastern Thornwood',
    blurb: () => `Boundary stones every mile, and a crate that hums louder the further north you go.`,
    w:340, h:260,
    nodes:[
      {id:'w2_camp', label:'Holly Thicket', x:45, y:215, sub:'Rest'},
      {id:'w2_hut', label:'Trapper’s Hut', x:75, y:90, sub:'News', done: () => S.flags.metTrapper},
      {id:'w2_sarne', label: 'Sarne Trail', x:170, y:165, sub: 'Trouble', done: () => S.flags.sarneDone},
      {id:'w2_glade', label:'Grey Glade', x:265, y:215, sub:'Optional', open: () => S.flags.sarneDone, done: () => S.flags.gladeDone, lockText:'Past the Sarne trail'},
      {id:'w2_onward', label:'The Boundary', x:285, y:75, sub:'Ardh Lirien', open: () => S.flags.sarneDone && S.flags.metTrapper, lockText:'Visit the trapper and get past the Sarne trail'}
    ],
    edges:[['w2_camp','w2_hut'],['w2_camp','w2_sarne'],['w2_hut','w2_onward'],['w2_sarne','w2_glade'],['w2_sarne','w2_onward']]
  },
  w2_enclave:{
    title:'Ardh Lirien',
    blurb: () => `A Sylvari town in the trees: halls in the oaks, lamps in the branches and a door for every family.`,
    w:340, h:270,
    nodes:[
      {id:'w2_gate', label:'Lamp Gate', x:45, y:220, sub:'The way in', done: () => S.flags.inside},
      {id:'w2_marrow', label:'Envoy’s Camp', x:45, y:110, sub:'Lysa Marrow', done: () => S.flags.metMarrow},
      {id:'w2_hall', label:'Hall of Doors', x:150, y:175, sub:'Your father’s sign', open: () => S.flags.inside, done: () => S.flags.metAunt, lockText:'Get through the gate'},
      {id:'w2_door', label:'Founder’s Door', x:255, y:225, sub:'Sealed', open: () => S.flags.inside, done: () => S.flags.founderDoor, lockText:'Get through the gate'},
      {id:'w2_well', label:'Moonwell', x:165, y:65, sub:'The seer', open: () => S.flags.inside, done: () => S.flags.metSeer, lockText:'Get through the gate'},
      {id:'w2_watch', label:'Nell’s Camp', x:285, y:40, sub:'Optional', open: () => S.flags.metAunt, done: () => S.flags.quiverTaken, lockText:'Find your father’s door first'},
      {id:'w2_night', label:'Moonset', x:290, y:135, sub:'Nell Kestrel', open: () => S.flags.metAunt && S.flags.metMarrow, done: () => S.flags.w2Boss, lockText:'Find your father’s door and meet the envoy'}
    ],
    edges:[['w2_gate','w2_marrow'],['w2_gate','w2_hall'],['w2_hall','w2_door'],['w2_hall','w2_well'],['w2_well','w2_watch'],['w2_hall','w2_night'],['w2_well','w2_night']]
  }
});

Object.assign(ENEMIES, {
  sarnehunter:{name:'Sarne Hunter', hp:28, dmg:[7,10], acc:72, dodge:6, armor:1, init:5, xp:30},
  greystag:{name:'Thorn-Crowned Stag', hp:60, dmg:[8,12], acc:70, dodge:6, armor:2, init:5, xp:80, hollow:true, greyChance:20,
    spec:{every:3, name:'Thorn Crown', windup:'{n} lowers its grey antlers and scrapes the ash.', mult:1.8}},
  qknife:{name:'Quell’s Knife', hp:34, dmg:[8,11], acc:74, dodge:8, armor:1, init:6, xp:30, bleed:30},
  gant:{name:'Gant the Hook', hp:125, dmg:[11,14], acc:72, dodge:3, armor:3, init:3, xp:80,
    spec:{every:3, name:'Hook', windup:'{n} swings his iron hook in a slow, wide circle.', mult:1.0, stun:true}},
  // Tuned by bot sim (150 runs): with Ysolde's wardens, ~60% first-try wins at level 4 and ~90% at 5. As the
  // Crown's guest (no wardens, one more knife), ~55% at 5 and ~90% at 6.
  // Nell's Marked Shot is one huge single-target hit, telegraphed: Wren's answer is Vanish, or Tobin's Cover.
  nellBoss:{name:'Nell Kestrel', hp:100, dmg:[9,12], acc:76, dodge:10, armor:1, init:7, xp:200, ranged:true, row:'back',
    spec:{every:3, name:'Marked Shot', windup:'{n} draws a long black-fletched arrow and sights down it, very still.', mult:2.4}},
  nellLow:{name:'Nell Kestrel', hp:100, dmg:[9,12], acc:76, dodge:10, armor:1, init:7, xp:200, ranged:true, row:'back',
    spec:{every:4, name:'Marked Shot', windup:'{n} reaches for a black-fletched arrow, finds none, and sights down an ordinary one.', mult:2.0}}
});
Object.assign(COMBATS, {
  w2_hunters:{title:'The Hunters’ Trail', enemies:() => ['sarnehunter', 'sarnehunter', 'xbow'], lethal:true, win:'w2_huntersWin', back:'w2_sarne',
    intro:'The Sarne hunters come up out of the bracken.'},
  w2_glade:{title:'The Grey Glade', enemies:() => ['thornling', 'thornling', 'greystag'], lethal:true, flee:true, win:'w2_gladeWin', back:'w2_glade',
    intro:'The briars drag themselves toward you, and the stag lowers its crown.'},
  // Quell's knives: Gant, three knives and Nell. Ysolde's wardens (met her, not the Crown's guest) drop a knife;
  // stealing the quiver makes the Marked Shot rarer and weaker.
  w2_boss:{title:'Nell Kestrel and Quell’s Knives', lethal:true, win:'w2_bossWin', back:'w2_night',
    enemies:() => {
      const f = S.flags; const e = ['gant', 'qknife', 'qknife'];
      if (!(f.metAunt && !f.asGuest)) e.push('qknife');
      e.push(f.quiverTaken ? 'nellLow' : 'nellBoss');
      return e;
    },
    intro:'Gant comes through the lamps with his hook up. The knives fan out. Nell stays back and nocks.'}
});

// Chapter 2 echoes: Wren's own ending, and into Ilsa's, Kael's and Tamsin's
const _wrenEchoesW2 = HEROES.wren.echoes, _ilsaEchoesW2 = HEROES.ilsa.echoes, _kaelEchoesW2 = HEROES.kael.echoes, _tamsinEchoesW2 = HEROES.tamsin.echoes;
HEROES.wren.echoes = () => { const e = _wrenEchoesW2(); const f = S.flags;
  if (chapterOf(S) < 2) return e;
  if (f.metAunt) e.push('Wren found her father’s door in Ardh Lirien. He was a Warden of the line, and he went to Corvane twenty years ago and never came back.');
  if (f.founderDoor === 'opened') e.push('Wren opened the Founder’s Door with the key she kept, and carries the Warden’s longbow.');
  if (f.founderDoor === 'looted' || f.lootRead) e.push('House Sarne used the key Wren sold to loot the Founder’s Door, and took a second key.');
  if (f.fragment === 'crown') e.push('Wren gave the Wardstone fragment to Envoy Lysa Marrow. Her aunt shut the door on her.');
  if (f.fragment === 'kept') e.push('Wren kept the Wardstone fragment for her father’s line. The Crown has marked her a thief.');
  return e; };
HEROES.ilsa.echoes = () => { const e = _ilsaEchoesW2(); const w = otherF('wren');
  if (w.fragment === 'crown') e.push('<b>Linked:</b> Wren gave Envoy Marrow a living Wardstone fragment. The Crown’s envoy now holds proof that the Concord is true.');
  if (w.fragment === 'kept') e.push('<b>Linked:</b> Wren kept her Wardstone fragment. Envoy Marrow is still hunting for proof, and the Crown calls Wren a thief.');
  if (w.fragmentSong && S.flags.spokeWard) e.push('<b>Linked:</b> When Ilsa spoke the Word into the Fourth Ward, Wren’s fragment began to sing in tune. The cage can be mended.');
  return e; };
HEROES.kael.echoes = () => { const e = _kaelEchoesW2(); const w = otherF('wren');
  if (w.fragment === 'crown') e.push('<b>Linked:</b> Wren gave a Wardstone fragment to the Crown’s envoy. In Corvane, someone on the Council has held a piece of the cage.');
  if (w.founderDoor === 'opened') e.push('<b>Linked:</b> Wren found the Wardens’ records. The Third Stone, under Varrow, was her father’s line’s to keep.');
  return e; };
HEROES.tamsin.echoes = () => { const e = _tamsinEchoesW2(); const w = otherF('wren');
  if (w.gateHow && S.flags.order === 'warners') e.push('<b>Linked:</b> Tamsin’s bells reached the Sylvari enclaves. Ardh Lirien shut its gates against the grey, and Wren had to find another way in.');
  if (w.gateHow && S.flags.order === 'keepers') e.push('<b>Linked:</b> The grey-sick of the Heartland have gone to the Sylvari enclaves for shelter, and nobody has warned them. Wren saw them.');
  return e; };

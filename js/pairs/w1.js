// ================= ACT 3, WEST 1: THE NINTH TOWER =================
// Ilsa and Tamsin (with Hask and Bracken) go back to the Arcanum on the Spire Coast, after the founders' full text,
// which Archmagister Morn keeps in the Ninth Tower under the cliffs. Tamsin carries a vial of Wren's blood (`vial`, 2
// to start; a Warden's blood opens founders' seals and the finale will want it). Spire Coast map: the Gull and Anchor
// (rest; Tobin arrives with House Sarne's ledger if the south sent it, `spireProof`), Magister Quill (the way to the
// Ninth Tower), the Sea Gate (Ilsa's ch1 report/hide: expelled → Hask talks the porters round; hunted → Stealth 2 or a
// fight), the relit Grey Furnace (optional: grey-sick prisoners, `freedSpire`). Ninth Tower map: the drowned reading
// room (rest), the founders' seal (the vial, Ilsa's Word → `voiceSpire`, or Lore 3 and the alarm), Morn. Linked choice:
// w1Arcanum = 'exposed' (the whole Arcanum hears the text; Morn's people flee south to House Sarne, for S2) or 'deal'
// (Quill becomes Archmagister and keeps it quiet; an Arcanum envoy goes south to help Kael and Wren in S2).
// Scene IDs use the prefix a3w1_. West flags: vial, spireProof, quillWay, gateHow, freedSpire, sealHow, alarm, w1Boss,
// w1Arcanum. Names: the Gull and Anchor, the Ninth Tower, Warden-Captain Iselde, Archmagister Morn (from Ilsa's ch1).
HEROES.west.chapters[1] = {title:'The Ninth Tower', start:'a3w1_intro'};

const w1Hunted = () => ilf().choice === 'hide';
const vialNote = () => { const n = S.flags.vial; return n >= 2 ? 'Tamsin touches the vial of Wren’s blood at her throat. Still two good measures in it.' : n === 1 ? 'There is one measure of Wren’s blood left in the vial.' : 'The vial of Wren’s blood is empty.'; };

Object.assign(SCENES, {
  a3w1_intro:{
    enter(){ if (S.flags.vial == null) S.flags.vial = 2; quest('w1', 'The Ninth Tower', 'Find the founders’ full text in the Arcanum, wherever Archmagister Morn has hidden it.'); },
    view: () => {
      const i = ilf(), p = partyF();
      const t = [`The Spire Coast comes out of the fog the way it always did: nine pale towers on black cliffs, salt-stained, with the sea grinding at their feet. Ilsa stands at the rail of the coaster and watches them come, and doesn't say anything for a long time.`,
        i.choice === 'hide' ? `The last time she saw them she was running from them, with stolen pages in her sleeve and the Proctor's acolytes on the stair.` : `The last time she saw them she was being put on the dawn boat, expelled, with the Archmagister's voice in her ears: <em>the Concord is a forgery</em>.`,
        `Tamsin has a little glass vial on a cord round her neck, stoppered with wax: Wren's blood, given on the quay at Corvane. "Two lanterns from one flame," Wren said. "And a Warden's blood. You'll need it more than I will." Tamsin keeps touching it.`];
      if (p.betrayer === 'hale') t.push(`Somewhere in those towers is Magister Hale, who stood up in the Council House and called Ilsa a thief.`);
      t.push(`Hask, at the bow, sniffs the sea air. "Fog's in," he says, satisfied. "Good. Nobody sees anything in the fog."`);
      return {title:'The Spire Coast', text:t, choices:[{label:'Ashore', act: () => toMap('a3w1_coast')}]};
    }
  },
  a3w1_inn:{ view: () => {
    const f = S.flags, s = pairF('south');
    const t = [`The Gull and Anchor is a fishers' inn at the foot of the cliffs, all tar and wet wool and fish soup. Nobody from the Arcanum has ever been in it, which is why Hask likes it.`];
    const ch = [partyRest('You sleep at the Gull and Anchor, to the sound of the sea. Everyone’s health and spell points are restored.')];
    if (s.s1Ledger === 'west' && !f.spireProof){
      t.push(`And at a corner table, with a bowl of soup and a package in oilcloth on the bench beside him, a young man with river-mud on his boots: Tobin Marsh.`, echo('wren', 'Wren and Kael sent Tobin west from Varrow with House Sarne’s ledger.'));
      ch.push({label:'Sit down with Tobin.', act: () => { f.spireProof = true; S.notice = xpNoteParty(80); chron('Tobin brought House Sarne’s ledger west to the Spire Coast: twenty years of shards, sold to the Spire.'); go('a3w1_tobin'); }});
    }
    ch.push(back());
    return {title:'The Gull and Anchor', text:t, choices:ch.filter(Boolean)};
  }},
  a3w1_tobin:{ view: () => ({title:'The Gull and Anchor', text:[`"Wren said not to do anything brave," Tobin says, "so I came by the river roads and slept under boats." He unwraps the ledger. "Kael found it under Varrow. Read the buyer's name."`,
    `Ilsa reads it. <em>The Spire.</em> Every quarter, for twenty years, at the highest price in the book. Her face doesn't change, which with Ilsa means a great deal.`,
    `"Graff wasn't the buyer," she says. "Graff was the hand. The Arcanum's been buying the grey since before I was an apprentice." She closes the ledger. "Quill will want to see this. So will everyone else."`,
    `Tobin stays, to carry it back.`], choices:[back()]})},
  a3w1_quill:{ view: () => {
    const f = S.flags;
    if (f.quillWay) return {title:'Magister Quill', text:[`Quill's house is shuttered. He's gone up to the towers, to be seen being ordinary.`], choices:[back()]};
    const t = [`Magister Quill lives in a crooked house on the Scholars' Stair, half outside the Arcanum's walls, because he likes the view and the Archmagister doesn't like him. He opens the door, sees Ilsa, and closes his eyes for a second as if he's been hit.`,
      `"Venn," he says. "I told Aurel you'd come back. I didn't think it would be with a Lantern sister and a hound." He lets you in.`,
      `"What you want isn't in the Sealed Archive. It never was. The founders' own text, the whole of it, is in the Ninth Tower." He smiles thinly. "Yes. The Arcanum has eight towers. Everyone counts them. The ninth is the one that goes <em>down</em>, into the cliff, under the sea. The Archmagister has the only way in."`];
    if (f.spireProof) t.push(`Ilsa puts House Sarne's ledger on his table. Quill reads it in silence, page after page. When he looks up he's a different man. "I'll take you to the door myself."`);
    const ch = [];
    if (f.spireProof) ch.push({label:'“Then take us.”', act: () => { f.quillWay = 'led'; S.notice = xpNoteParty(100); chron('Magister Quill read House Sarne’s ledger, and offered to lead Ilsa and Tamsin to the Ninth Tower himself.'); go('a3w1_quillYes'); }});
    ch.push(Object.assign({label:'Ilsa: “You told Aurel I’d come back. Tell me how to get in.”', act: () => { f.quillWay = 'told'; S.notice = xpNoteParty(80); go('a3w1_quillYes'); }}, chkBy('ilsa', 'leadership', 1)));
    ch.push({label:'Ask him for anything he can give you.', act: () => { f.quillWay = 'hint'; go('a3w1_quillYes'); }});
    ch.push(back());
    return {title:'Magister Quill', text:t, choices:ch};
  }},
  a3w1_quillYes:{ view: () => {
    const w = S.flags.quillWay;
    return {title:'Magister Quill', text:[w === 'led' ? `"The Archmagister walks down to the Ninth every night at the second bell," Quill says. "There's a stair behind the Grey Furnace. I'll be on it, with a lamp, looking lost."` : w === 'told' ? `Quill sighs. "There's a stair behind the old Grey Furnace, in the Undercliff. It goes down a long way. At the bottom there's a door with the founders' seal on it. I can't help you with that."` : `Quill won't say much. "The Undercliff," he says at the door. "Behind the furnace. And Venn: the Archmagister relit it."`],
      choices:[back()]};
  }},
  a3w1_gate:{ view: () => {
    const f = S.flags, p = partyF();
    if (f.gateHow) return {title:'The Sea Gate', text:[`The Sea Gate is behind you. The Arcanum's lower galleries are quiet in the fog.`], choices:[back()]};
    const t = [`The Sea Gate is the Arcanum's water-door: a stone arch over a landing, where the supply boats come in, with porters in grey and a pair of Spire Wardens with staves.`];
    const ch = [];
    if (!w1Hunted()){
      t.push(`The porters know Ilsa. Expelled apprentices don't come back, and they stare. But they know Hask better. He carried their crates for eleven years.`);
      ch.push({label:'Let Hask talk to the porters.', act: () => { f.gateHow = 'hask'; S.notice = xpNoteParty(60); chron('At the Arcanum’s Sea Gate, the porters let Hask’s friends in without a word to the Wardens.'); go('a3w1_gateIn'); }});
    } else {
      t.push(`There's a sketch of Ilsa's face nailed to the arch, a bad one, with <em>THIEF</em> under it. The porters look at it, and at her, and away.`, echo('ilsa', 'Ilsa hid the Concord’s last pages and fled the Arcanum. She is hunted on the Spire Coast.'));
      ch.push(Object.assign({label:'Wait for a supply boat and slip in among the crates.', act: () => { f.gateHow = 'stealth'; S.notice = xpNoteParty(80); go('a3w1_gateIn'); }}, chk('stealth', 2)));
    }
    if (p.betrayer === 'hale') t.push(`One of the Wardens wears Magister Hale's badge. The Archmagister has taken him back.`);
    ch.push({label:'Go through the Wardens.', act: () => startCombat('a3w1_gate')}, back());
    return {title:'The Sea Gate', text:t, choices:ch};
  }},
  a3w1_gateIn:{ view: () => ({title:'The Sea Gate', text:[S.flags.gateHow === 'hask' ? `Hask has a word with an old porter, and the old porter has a word with the Wardens about a crate that's gone in the sea, and by the time they've stopped shouting you're inside.` : `You come in under a tarpaulin among crates of lamp-oil, and Bracken, to his lasting offence, in a fish barrel.`], choices:[back()]})},
  a3w1_gateWin:{ enter(){ if (!S.flags.gateHow){ S.flags.gateHow = 'force'; S.flags.alarm = true; } }, view: () => ({title:'The Sea Gate', text:[`The Wardens are down. Bells start ringing in the towers above. The Arcanum knows someone is inside.`], choices:[back()]})},
  a3w1_furnace:{ view: () => {
    const f = S.flags, t = tf();
    if (f.furnaceDone) return {title:'The Grey Furnace', text:[f.freedSpire ? `The furnace is cold. The people who were chained to it are up at the Gull and Anchor, eating soup.` : `The furnace burns on, grey.`], choices:[back()]};
    const txt = [`Down in the Undercliff, Graff's Grey Furnace is burning again: a squat iron thing the size of a house, roaring, with grey fire behind its grille. Ilsa killed the man who fed it. Someone has started feeding it again.`,
      `And this time it isn't only shards. Along the wall, chained by the ankle, a dozen people in fishers' clothes sit grey to the eyes, and an adept in grey robes is drawing something out of them, thread by thread, into the fire.`];
    if (t.lanternCost || partyF().lanternTwice) txt.push(`Tamsin's hands are already moving. Whatever the Lantern has cost her, she'll spend more of it here.`);
    return {title:'The Grey Furnace', text:txt, choices:[
      {label:'Stop them, and get those people out.', act: () => startCombat('a3w1_furnace')},
      back('Leave it, for now')
    ]};
  }},
  a3w1_furnWin:{ enter(){ if (S.flags.furnaceDone) return; S.flags.furnaceDone = true; S.flags.freedSpire = 12; S.items.aether += 2; chron('In the Undercliff, Ilsa and Tamsin put out the Grey Furnace and freed twelve fisherfolk it was feeding on.'); }, view: () => ({title:'The Grey Furnace', text:[`Tamsin goes along the wall with her hands full of light, one by one, and the grey goes out of twelve fisherfolk like water out of a sponge. Hask breaks the chains. Bracken herds them all up the stair toward the fog and the sea and the Gull and Anchor.`, `On the adept's table there are two Aether Draughts and a book of notes in Morn's own hand. Behind the furnace, a stair goes down into the dark.`], choices:[back()]})},
  a3w1_down:{ view: () => ({title:'Behind the Furnace', text:[`Behind the Grey Furnace, a stair cut in the living rock goes down, and down, and down, past the level of the sea. You can hear it through the stone. ${S.flags.quillWay === 'led' ? 'Quill is waiting at the top with a shuttered lamp, looking lost, as promised.' : ''}`], choices:[{label:'Down into the Ninth Tower', act: () => toMap('a3w1_ninth')}, back()]})},

  // --- The Ninth Tower ---
  a3w1_reading:{ view: () => ({title:'The Drowned Reading Room', text:[`A round reading room with a ceiling of green glass, and above the glass, the sea. Fish go by over your head. The desks are dry, and the lamps still burn. Nobody has read here for a very long time.`], choices:[partyRest('You rest under the sea. Everyone’s health and spell points are restored.'), back()].filter(Boolean)})},
  a3w1_seal:{ view: () => {
    const f = S.flags;
    if (f.sealHow) return {title:'The Founders’ Seal', text:[`The great door stands open.`], choices:[back()]};
    const t = [`At the bottom of the Ninth Tower is a door of black stone, and on it, cut deep and filled with silver, a seal: seven stones in a ring around an eighth, the founders' mark. It's warm. It hums. It wants something.`,
      `Ilsa puts her hand near it, not on it. "It's a Warden's lock," she says. "The founders keyed it to a Warden's blood. Or to the Word." She looks at Tamsin's throat. "Or I can unpick it the long way. It'll take hours, and it'll ring every bell in the Arcanum."`,
      vialNote()];
    const ch = [];
    if (f.vial > 0) ch.push({label:'Tamsin lets one drop of Wren’s blood fall on the seal.', act: () => { f.vial--; f.sealHow = 'blood'; chron('In the Ninth Tower, Tamsin opened the founders’ seal with a drop of Wren’s blood.'); go('a3w1_open'); }});
    ch.push({label:'Ilsa speaks the Unwritten Word into the seal.', act: () => { f.sealHow = 'word'; f.voiceSpire = true; chron('In the Ninth Tower, Ilsa spoke the Unwritten Word into the founders’ seal. Something far below heard her.'); go('a3w1_open'); }});
    ch.push(Object.assign({label:'Unpick it the long way.', act: () => { f.sealHow = 'lore'; f.alarm = true; S.notice = xpNoteParty(100); go('a3w1_open'); }}, chkBy('ilsa', 'lore', 3)));
    ch.push(back());
    return {title:'The Founders’ Seal', text:t, choices:ch};
  }},
  a3w1_open:{ view: () => {
    const h = S.flags.sealHow;
    return {title:'The Founders’ Seal', text:[h === 'blood' ? `One drop. The silver in the seal runs red, then gold, and the door sighs open like a held breath let out.` : h === 'word' ? `Ilsa speaks, and the seal answers, and the door opens. And far, far below the sea and the cliff and everything, something turns over in its sleep and says her name back, in her own voice. Ilsa goes white and doesn't stop walking.` : `It takes Ilsa four hours, with her ear against the stone and her fingers moving. By the time the door gives, every bell in the Arcanum is ringing.`,
      `Beyond the door, lamplight. And a voice: "Apprentice Venn. I wondered which of us would get here first."`], choices:[back()]};
  }},
  a3w1_morn:{ view: () => {
    const f = S.flags, p = partyF();
    const t = [`The founders' vault is a small round room, very old, lined with shelves of slate tablets. In the middle, on a reading stand, lies a book of beaten silver pages: the whole of what Ilsa has a few torn leaves of.`,
      `Archmagister Morn stands beside it, grey-haired, straight-backed, with a grey stone on a chain at her throat like the one Graff wore, only larger, and glowing. Behind her, a Furnace-Thrall in an iron apron, and Spire Wardens with their staves.`,
      `"You think we bought the grey to sell it," Morn says. "We bought it to <em>learn</em> it. The founders made a bargain with that thing, Venn, and wrote down the terms, and then their heirs spent nine hundred years pretending it was a victory. Someone has to be ready to make the next one. Someone who understands what it wants."`,
      `She touches the stone at her throat. "It speaks to me now. As it speaks to you."`];
    if (p.betrayer === 'hale') t.push(`Magister Hale is at her shoulder, with the Leash coiled at his feet. He doesn't look at Ilsa either.`);
    if (f.spireProof && f.quillWay === 'led') t.push(`Quill comes down the stair behind you with his shuttered lamp, and two of the Wardens see him, and the ledger in his hand, and lower their staves.`);
    if (f.alarm) t.push(`Every grey lamp in the vault is burning toward her: the Arcanum's bells have woken the whole Ninth Tower.`);
    t.push(`<em>A hard fight. Morn's grey fire burns everyone at once; the Thrall hits harder than anything you've met.</em>`);
    return {title:'The Founders’ Vault', text:t, choices:[{label:'Fight the Archmagister', act: () => startCombat('a3w1_boss')}, {label:'Fall back and prepare', act: () => toMap('a3w1_ninth')}]};
  }},
  a3w1_bossWin:{ enter(){ if (S.flags.w1Boss) return; S.flags.w1Boss = true; }, view: () => ({
    title:'The Founders’ Vault',
    text:[`Morn's grey stone cracks, the way Graff's did, and she sits down on the floor of the vault with her back to the shelves, suddenly very old. "Read it, then," she says. "Read it and tell me I was wrong."`,
      `Ilsa reads it. All of it. It takes the rest of the night, with Tamsin holding the lamp, and when she's finished she closes the silver book very gently, as if it might wake up.`,
      `"She wasn't wrong about the bargain," Ilsa says at last. Her voice is steady. Her hands aren't. "She was wrong about everything else."`],
    choices:[{label:'What now', go:'a3w1_choice'}]
  })},
  a3w1_choice:{ view: () => ({
    title:'The Founders’ Vault',
    text:[`By morning the whole Arcanum knows the Archmagister has fallen. The magisters are gathering in the Great Library, frightened, arguing. Quill comes down to the vault with his lamp and looks at the silver book for a long time.`,
      `"You could read it to them," he says. "All of them. Today. The Arcanum would never be the same. Half of Morn's people would run, and I can guess where to: House Sarne has always paid well for what the Spire knows."`,
      `"Or you could let me be Archmagister, and keep it quiet, and let me send someone south to help your friends with the last of the shards. The Arcanum has been watching Sarne for twenty years. We know where they keep things." He smiles, tiredly. "And we'd go on studying the grey. More carefully. I won't pretend otherwise."`],
    choices:[
      {label:'Read it to the whole Arcanum.', act: () => { S.flags.w1Arcanum = 'exposed'; chron('Ilsa read the founders’ full text to the whole Arcanum. Morn’s people fled, south, to House Sarne.'); go('a3w1_end'); }},
      {label:'Make Quill Archmagister, and send help south.', act: () => { S.flags.w1Arcanum = 'deal'; chron('Ilsa and Tamsin made Quill Archmagister. The Arcanum keeps its secret, and an envoy goes south to help Kael and Wren.'); go('a3w1_end'); }}
    ]
  })},
  a3w1_end:{ view: () => {
    const f = S.flags;
    const t = [f.w1Arcanum === 'exposed' ? `Ilsa stands at the lectern of the Great Library, where she sat exams, and reads the founders' words to four hundred magisters and apprentices. Some of them weep. Some of them walk out. By nightfall a dozen boats have left the Sea Gate, heading south and east, and Morn's chair is empty.` : `Quill is made Archmagister in the Great Library at noon, in borrowed robes. That evening a quiet woman in travelling grey takes a coaster south, with a letter for Kael Dunmore in her satchel.`,
      `The silver book goes into Hask's pack, wrapped in three blankets. "Heavier than it looks," he says. "Like most books."`,
      f.freedSpire ? `At the Gull and Anchor, the fisherfolk from the furnace stand up when Tamsin comes in, all of them, and nobody says anything.` : `The Grey Furnace is still burning when you leave.`,
      vialNote()];
    return {title:'The Spire Coast', text:t, choices:[{label:'End of chapter', act: () => {
      setQ('w1', 'done', 'Ilsa and Tamsin took the founders’ full text from the Ninth Tower under the Arcanum.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  a3w1_coast:{
    title:'The Spire Coast',
    blurb: () => `Nine pale towers in the fog, and the sea at their feet.`,
    w:340, h:260,
    nodes:[
      {id:'a3w1_inn', label:'The Gull and Anchor', x:50, y:210, sub:'Rest'},
      {id:'a3w1_quill', label:'Magister Quill', x:60, y:60, sub:'The Scholars’ Stair', done: () => S.flags.quillWay},
      {id:'a3w1_gate', label:'The Sea Gate', x:190, y:200, sub:'Into the Arcanum', done: () => S.flags.gateHow},
      {id:'a3w1_furnace', label:'The Grey Furnace', x:200, y:70, sub:'The Undercliff', open: () => S.flags.gateHow, done: () => S.flags.furnaceDone, lockText:'Get inside first'},
      {id:'a3w1_down', label:'The Stair Down', x:295, y:140, sub:'Behind the furnace', open: () => S.flags.gateHow && S.flags.quillWay, lockText:'Get inside, and find the way'}
    ],
    edges:[['a3w1_inn','a3w1_quill'],['a3w1_inn','a3w1_gate'],['a3w1_quill','a3w1_gate'],['a3w1_gate','a3w1_furnace'],['a3w1_furnace','a3w1_down'],['a3w1_gate','a3w1_down']]
  },
  a3w1_ninth:{
    title:'The Ninth Tower',
    blurb: () => `The tower that goes down, under the cliff and the sea.`,
    w:340, h:260,
    nodes:[
      {id:'a3w1_reading', label:'Drowned Reading Room', x:60, y:200, sub:'Rest'},
      {id:'a3w1_seal', label:'The Founders’ Seal', x:170, y:70, sub:'A Warden’s lock', done: () => S.flags.sealHow},
      {id:'a3w1_morn', label:'The Founders’ Vault', x:290, y:150, sub:'Archmagister Morn', open: () => S.flags.sealHow, done: () => S.flags.w1Boss, lockText:'Open the seal first'},
      {id:'a3w1_up', label:'Up the Stair', x:170, y:220, sub:'Back to the Undercliff'}
    ],
    edges:[['a3w1_reading','a3w1_seal'],['a3w1_seal','a3w1_morn'],['a3w1_reading','a3w1_up']]
  }
});
SCENES.a3w1_up = {view: () => ({title:'The Stair', text:[`The long stair up to the Undercliff.`], choices:[{label:'Up to the Spire Coast', act: () => toMap('a3w1_coast')}, back()]})};

Object.assign(ENEMIES, {
  // Pair enemies: two heroes and their two companions, tuned for level 16
  spirewarden:{name:'Spire Warden', hp:380, dmg:[40,46], acc:76, dodge:6, armor:2, init:5, xp:55},
  spireadept:{name:'Grey Adept', hp:300, dmg:[36,40], acc:78, dodge:8, armor:0, init:6, xp:55, ranged:true, row:'back', greyChance:30},
  furnacegrey:{name:'Furnace-Grey', hp:400, dmg:[40,46], acc:72, dodge:4, armor:1, init:4, xp:45, hollow:true, cleanse:true, greyChance:25},
  halePair:{name:'Magister Hale', hp:160, dmg:[28,32], acc:78, dodge:8, armor:1, init:7, xp:120, ranged:true, row:'back'},
  bigthrall:{name:'Furnace-Thrall', hp:720, dmg:[50,58], acc:72, dodge:0, armor:4, init:3, xp:150, hollow:true,
    spec:{every:3, name:'Furnace Blow', windup:'{n} raises both iron fists over its head.', mult:1.9}},
  morn:{name:'Archmagister Morn', hp:620, dmg:[40,46], acc:80, dodge:8, armor:1, init:7, xp:300, ranged:true, row:'back', greyChance:25,
    spec:{every:2, name:'Grey Fire', windup:'{n} closes her hand on the stone at her throat, and grey fire gathers in the air.', mult:2.3, aoe:true, grey:2}},
  // the bells brought the whole Arcanum's grey to her hand
  mornAlarm:{name:'Archmagister Morn', hp:620, dmg:[40,46], acc:80, dodge:8, armor:1, init:7, xp:300, ranged:true, row:'back', greyChance:25,
    spec:{every:2, name:'Grey Fire', windup:'{n} closes her hand on the stone, and every grey lamp in the Ninth Tower flares toward her.', mult:2.6, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  a3w1_gate:{title:'The Sea Gate', level:16, lethal:true, win:'a3w1_gateWin', back:'a3w1_gate',
    enemies:() => ['spirewarden', 'spirewarden', 'spireadept'], intro:'The Wardens level their staves.'},
  a3w1_furnace:{title:'The Grey Furnace', level:16, lethal:true, win:'a3w1_furnWin', back:'a3w1_furnace',
    enemies:() => ['furnacegrey', 'furnacegrey', 'spireadept'], intro:'The adept looks up from the chains, and the chained ones stand.'},
  a3w1_boss:{title:'Archmagister Morn', level:16, lethal:true, win:'a3w1_bossWin', back:'a3w1_morn',
    enemies:() => {
      const f = S.flags, e = ['bigthrall'];
      if (!(f.spireProof && f.quillWay === 'led')) e.push('spirewarden');        // Quill and the ledger turn the Wardens
      if (partyF().betrayer === 'hale') e.push('halePair');                     // Hale at her shoulder
      return e.concat([f.alarm ? 'mornAlarm' : 'morn']);                       // the bells brought the Arcanum's grey to her
    },
    intro:'Morn closes her hand on the stone at her throat.'}
});

HEROES.west.echoes = () => {
  const f = S.flags, e = [];
  if (f.spireProof) e.push('Tobin brought House Sarne’s ledger west. The Arcanum has been buying the grey for twenty years.');
  if (f.gateHow) e.push(f.gateHow === 'hask' ? 'The Arcanum’s porters let Hask’s friends in.' : f.gateHow === 'stealth' ? 'Ilsa and Tamsin slipped into the Arcanum among the supply crates.' : 'Ilsa and Tamsin fought their way in at the Sea Gate.');
  if (f.freedSpire) e.push(`Tamsin freed ${f.freedSpire} fisherfolk the Grey Furnace was feeding on.`);
  if (f.sealHow) e.push(f.sealHow === 'blood' ? 'A drop of Wren’s blood opened the founders’ seal.' : f.sealHow === 'word' ? 'Ilsa’s Word opened the founders’ seal, and something far below heard her.' : 'Ilsa unpicked the founders’ seal the long way, and every bell in the Arcanum rang.');
  if (f.w1Boss) e.push('Archmagister Morn has fallen. Ilsa has read the founders’ full text.');
  if (f.w1Arcanum === 'exposed') e.push('Ilsa read the text to the whole Arcanum. Morn’s people fled south, to House Sarne.');
  if (f.w1Arcanum === 'deal') e.push('Quill is Archmagister. The Arcanum keeps its secret, and an envoy has gone south to help Kael and Wren.');
  if (f.vial != null) e.push(`Wren’s blood: ${['the vial is empty', 'one measure left', 'two measures left'][Math.max(0, Math.min(2, f.vial))]}.`);
  return e;
};

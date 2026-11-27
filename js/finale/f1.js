// ================= THE FINALE, PART 1: THE KINDLED NIGHT =================
// Party chapter 5 (FINALE_CHAPTER): the two pairs meet again in Corvane on the night the Ashen Hand moves on the
// Keystone. All four heroes, no companions in fights (as in Act 2). The city by the Council choice (`council`); the
// Kindled in Well Square (more of them if the west let their carts through, `roadDone2`). Corvane map: the base (rest;
// Brannoc; Hask reads the silver book's last page → `haskPage`), Corrin's cell (the south's prisoner: Kael frees him for
// the Cinder Father's road, `corrinDeal` = 'freed' → `routeKnown`; with the kept ledger he talks anyway; or he stays
// held), the Lord Binder (who the Cinder Father is → `knowSeverin`), the Envoys' Court (the King's guard if `kingSpoke`,
// Quill's adepts if W1 was a deal → `quillWards`), Well Square (the way down: Corrin's road, the Iron Tally holding the
// square, or a fight). Under Corvane map: the old cistern (rest), the Grey Stair (the lantern, the vial, Ilsa's Lore 3
// with the silver book, or a fight), the Pick-Gallery: Tavish the Kindler and the Kindled with Wardstone picks at the
// seventh pillar's root. Choice: f1Pillar = 'held' (light spent, or Tamsin's own: `tamsinPaid`) or 'fallen' (Well Square
// goes into the undercity; they reach the Keystone sooner, `sooner`). Scene IDs use the prefix a3f1_.
// Party flags: lantern (the south's, carried on), haskPage, corrinDeal, routeKnown, knowSeverin, crownHelp, quillWards,
// squareHow, stairHow, f1Boss, f1Pillar, lightUsed, tamsinPaid, sooner.
HEROES.party.chapters[5] = {title:'The Kindled Night', start:'a3f1_intro'};

// The light the four can bring to the Keystone: the first flame carried whole (2), the founder's lamp kept and burning
// (1), Tamsin's second lantern still lit (1), Ysolde's wardens and their lamps (1); less whatever the night has spent
function finaleLightParts(){
  const s = pairF('south'), w = pairF('west'), f = S.flags, out = [];
  if (w.w2Flame === 'carried') out.push(['the first flame, whole', 2]);
  if (s.s2Lamp === 'kept') out.push(['the founder’s lamp', 1]);
  if ((f.lantern != null ? f.lantern : s.lantern || 0) > 0) out.push(['Tamsin’s second lantern', 1]);
  if (s.ysolde === 'key') out.push(['the lamps of Ysolde’s wardens', 1]);
  return out;
}
const finaleLight = () => Math.max(0, finaleLightParts().reduce((n, p) => n + p[1], 0) - (S.flags.lightUsed || 0));
const lightNote = () => { const n = finaleLight(); return n >= 4 ? 'You carry a great deal of light.' : n === 3 ? 'You carry enough light, if nothing else goes wrong.' : n === 2 ? 'You carry some light. Not as much as you would like.' : n === 1 ? 'You carry a little light.' : 'You carry no light at all.'; };
const f1Kindled = () => !pairF('west').roadDone2; // the west let the Kindled carts through: more of them, with Wardstone picks
const SEVERIN = 'Severin Calloway';

Object.assign(SCENES, {
  a3f1_intro:{
    enter(){
      const f = S.flags, s = pairF('south');
      if (f.lantern == null) f.lantern = s.lantern || 0;
      quest('f1', 'The Kindled Night', 'The four are together again in Corvane. Stop the Ashen Hand before it reaches the Keystone.');
    },
    view: () => {
      const f = S.flags, s = pairF('south'), w = pairF('west');
      const t = [`They come into Corvane on the same evening, by different gates, and neither pair knows the other is there until Bracken, in the yard of ${f.base === 'gull' ? 'the Gull’s Rest' : 'the Pilgrims’ Hostel'}, stands up, sniffs, and goes off down the lane like a loosed arrow, and comes back with Tobin's sleeve in his mouth and Tobin attached.`,
        `Then the four of them are in the yard, all talking at once. Wren hugs Tamsin hard enough to lift her off the ground. Kael and Ilsa shake hands, which makes Wren laugh so hard she has to sit down.`];
      t.push(f.council === 'broken' ? `Corvane has not settled since the night they broke the Council. Half the Lower Town's windows are boarded. The Watch walks in fours. On the gate where they came in, someone has painted the four of them, badly, as saints, and someone else has painted a noose over it.` : `Corvane is calm, the way a held breath is calm. The Council still sits, smaller and quieter. Their writs under its seal still get them through any gate in the city, and nobody at those gates will meet their eyes.`);
      t.push(f.keystone === 'released' ? `And under it all, every hour or so, the city shudders. The Keystone is cracking, the way Ilsa said it would.` : `And under it all, faintly, in every well and drain, something is murmuring in Ilsa's voice.`);
      t.push(`The Kindled came in ahead of them: hundreds of grey robes, all through the Lower Town, singing. They have taken Well Square, where the seventh pillar goes down.${f1Kindled() ? ' They brought carts. Something under the tarpaulins glows grey.' : ''}`);
      return {title:'Corvane, Again', text:t, choices:[{label:'Tell each other everything', go:'a3f1_reunion'}]};
    }
  },
  a3f1_reunion:{ view: () => {
    const f = S.flags, s = pairF('south'), w = pairF('west'), parts = finaleLightParts();
    const t = [`It takes most of the night.`];
    t.push(`Kael and Wren have the shards: ${s.shardsVarrow ? 'two hundred and twelve from under Varrow’s arena, ' : ''}and the last of them, cut out of the Third Stone itself. And in the cellar under the inn, in his own housecarls' chains, they have Lord Corrin Sarne.`, echo('south', 'Kael and Wren took the last of House Sarne’s shards from the Third Stone, and Corrin Sarne with them.'));
    t.push(`Ilsa and Tamsin have the silver book, the founders' whole text, in Hask's pack. ${w.heardTerms ? 'And Ilsa has something she will not say yet: she asked the Hollow, under the Fourth Ward, what it wanted, and it told her.' : 'Ilsa does not talk about what happened under the Fourth Ward. Tamsin watches her not talk about it.'}`,
      echo('west', w.w2Flame === 'carried' ? 'Tamsin carried the first flame of the Lantern to Corvane, whole and unspent.' : 'Tamsin spent the first flame healing Kell’s Rest.'));
    if (w.lanternHealed) t.push(`Tamsin holds up her hands to show Wren. They're steady. "It gave it back," she says. "All of it."`);
    t.push(parts.length ? `They lay the lights out on the table to count them: ${parts.map(p => p[0]).join(', ')}. The founders wrote that a crack is closed with light. Nobody knows how much.` : `There's no light to lay on the table. The lantern is out, and the flame is spent. The founders wrote that a crack is closed with light. Ilsa doesn't say what that means for them.`, lightNote());
    return {title:'The Four', text:t, choices:[{label:'Dawn', act: () => { chron('The four met again in Corvane, on the night the Ashen Hand moved on the Keystone.'); toMap('a3f1_city'); }}]};
  }},
  a3f1_base:{ view: () => {
    const f = S.flags;
    return {title: f.base === 'gull' ? 'The Gull’s Rest' : 'The Pilgrims’ Hostel', text:[
      `All four companions in one room again: Brannoc counting draughts, Hask with the silver book open across his knees, Bracken asleep across the door, Tobin asleep across Bracken.`
    ], choices:[
      partyRest('You sleep, all four of you, for the first time in weeks. Everyone’s health and spell points are restored.'),
      {label:'Brannoc: buy 2 Healing Draughts (20 crowns)', req: () => S.gold >= 20, tag: S.gold >= 20 ? null : 'Needs 20 crowns', act: () => { S.gold -= 20; S.items.draught += 2; S.notice = 'Brannoc sells you 2 Healing Draughts.'; render(); }},
      !f.haskPage ? {label:'Hask: ask what the last page says.', act: () => { f.haskPage = true; S.items.aether += 1; S.notice = xpNoteParty(60); go('a3f1_hask'); }} : null,
      back()
    ].filter(Boolean)};
  }},
  a3f1_hask:{ view: () => ({title:'Hask', text:[`"The last page," says Hask, "is not the founders'. It's in a different hand, later." He reads it slowly, a finger under each word. "<em>The crack is not closed by light alone. Light shows the stone where it was whole. A name tells it who it held. Then it remembers how to stand by itself.</em>"`,
    `He closes the book. "A name," he says, and looks at Wren. Wren looks at the floor.`, `He gives Ilsa an Aether Draught from the bottom of his pack, which he has apparently been saving for a year.`], choices:[back()]})},
  a3f1_cell:{ view: () => {
    const f = S.flags, s = pairF('south');
    if (f.corrinDeal) return {title:'The Cellar', text:[f.corrinDeal === 'freed' ? `The cellar is empty. Corrin Sarne went out of the river gate before dawn in a fishing boat, with nothing but his life, which he seemed to think was enough.` : `Corrin Sarne sits in his chains in the dark and doesn't look up.`], choices:[back()]};
    const t = [`Corrin Sarne in a cellar is still Corrin Sarne. He's had them bring him a chair. He watches Kael come down the steps as if Kael were a servant late with the wine.`,
      `"You want to know about the Cinder Father," he says, before anyone asks. "Of course you do. I paid him for three years. I know his face. I know his name. And I know the road he'll take to your Keystone tonight, because I paid for that too."`,
      `"And you'll tell us," says Kael, "because?"`,
      `"Because I'd like to leave Corvane alive." He smiles. "Let me walk out of the river gate, and I'll draw you his road."`];
    const ch = [{label:'Kael: “Draw it. Then go, and never come back.”', act: () => { f.corrinDeal = 'freed'; f.routeKnown = true; f.knowSeverin = true; S.notice = xpNoteParty(80); chron('Kael let Corrin Sarne go free in exchange for the Cinder Father’s road under Corvane.'); go('a3f1_corrinFreed'); }}];
    if (s.s1Ledger === 'kept') ch.push({label:'Kael puts the green ledger on the table in front of him.', act: () => { f.corrinDeal = 'held'; f.routeKnown = true; f.knowSeverin = true; S.notice = xpNoteParty(100); chron('Kael showed Corrin Sarne his own ledger, and Corrin gave up the Cinder Father’s road to save his house.'); go('a3f1_corrinLedger'); }});
    ch.push({label:'“No. You’ll stand trial.” Leave him in his chains.', act: () => { f.corrinDeal = 'held'; chron('Kael left Corrin Sarne in chains for the city to judge.'); go('a3f1_cell'); }}, back());
    return {title:'The Cellar', text:t, choices:ch};
  }},
  a3f1_corrinFreed:{ view: () => ({title:'The Cellar', text:[`Corrin draws it on the back of a bill of lading with a stub of charcoal, quickly and well: down through the old Sarne wine-cellars under Lantern Hill, along a Founders' drain, and out under Well Square behind the Kindled.`,
    `"His name is ${SEVERIN}," he says, dusting his hands. "He was the Second Binder for thirty years. He put more Wardens in the stones than the Lord Binder did. Then the Council asked him for his daughter." He shrugs. "Grief makes men very cheap to hire. Good luck, Dunmore."`,
    `Tobin takes him to the river gate. Kael doesn't watch him go.`], choices:[back()]})},
  a3f1_corrinLedger:{ view: () => ({title:'The Cellar', text:[`Corrin looks at the ledger for a long time. It's his own hand, twenty years of it. "If I talk," he says finally, "my house survives this. Not me. My house." Kael says nothing. That's answer enough.`,
    `He draws the road: down through the old Sarne wine-cellars under Lantern Hill, along a Founders' drain, out under Well Square behind the Kindled. Then he tells them the name. "${SEVERIN}. Second Binder, thirty years. Then the Council asked him for his daughter."`,
    `He stays in his chains. He doesn't ask again.`, echo('south', 'Kael kept House Sarne’s ledger, for leverage against Sarne.')], choices:[back()]})},
  a3f1_binder:{ view: () => {
    const f = S.flags;
    const t = [f.council === 'broken' ? `The Lord Binder is in the city cells, in a room with a window, which is the most the new Watch-captains could agree on. He's thinner. His chain is gone.` : `The Lord Binder is still the Lord Binder, in the Council's keeping, in a cold room behind the chamber. He sits with his chain across his knees and doesn't get up.`];
    if (f.knowSeverin){
      t.push(`"${SEVERIN}," he says, when they tell him. "Yes. I wondered. My second, for thirty years. The best I ever had." He looks at his hands. "The Council needed an anchor for the Fifth Stone. He had a daughter of the right line. Elin. I signed the order. He walked her down himself." A long silence. "He thinks if the stones break, the people in them come out. Some of them would. And then the Hollow would come up through every crack in the Reach, and there would be nobody left for them to come out to."`);
      if (!f.binderTold){ f.binderTold = true; S.notice = xpNoteParty(60); }
    } else {
      t.push(`"The Cinder Father," he says, when they ask. "I've heard the name. I don't know whose face is under it." He looks at the floor. "I could guess. I'd rather not."`, `<em>Someone in the city knows the Cinder Father's name. Corrin Sarne paid him.</em>`);
    }
    return {title:'The Lord Binder', text:t, choices:[back()]};
  }},
  a3f1_court:{ view: () => {
    const f = S.flags, w = pairF('west'), ch = [];
    const t = [`The Envoys' Court is full of people packing.`];
    if (f.kingSpoke){
      t.push(`But in the map room, sitting very upright in a chair with a blanket over his knees, there's the King. Grey only at the fingertips. "I said no one else goes into a stone," he says. "I meant it. Take my guard. Forty men. They'll hold the streets round Well Square, so the Kindled can't bring more down behind you."`);
      if (!f.crownHelp) ch.push({label:'Take the King’s guard.', act: () => { f.crownHelp = 'king'; S.notice = xpNoteParty(60); chron('The King gave the four his guard to hold the streets round Well Square.'); go('a3f1_court'); }});
    } else if (crownMood() !== 'cold' && f.betrayer !== 'marrow'){
      t.push(`Envoy Marrow is in the map room, alone. "The Crown can spare you a company of the Watch," she says. "To hold the streets. Not to go down. Nobody's going down there but you."`);
      if (!f.crownHelp) ch.push({label:'Take the Watch company.', act: () => { f.crownHelp = 'crown'; S.notice = xpNoteParty(40); chron('Envoy Marrow lent the four a company of the Watch.'); go('a3f1_court'); }});
    } else t.push(`Nobody in the Envoys' Court has anything for you but a long look.`);
    if (w.w1Arcanum === 'deal'){
      t.push(`In the courtyard, a dozen Arcanum adepts in travelling grey, with Hesper Vane at their head. "Archmagister Quill's compliments," she says. "We came to ward the Lower Town's wells, whatever happens under them."`, echo('west', 'Ilsa and Tamsin made Quill Archmagister, and he kept the founders’ text quiet.'));
      if (!f.quillWards) ch.push({label:'“Ward the wells.”', act: () => { f.quillWards = true; S.notice = xpNoteParty(40); chron('Quill’s adepts set wards on the Lower Town’s wells.'); go('a3f1_court'); }});
    }
    ch.push(back());
    return {title:'The Envoys’ Court', text:t, choices:ch};
  }},
  a3f1_square:{ view: () => {
    const f = S.flags, k = kf();
    if (f.squareHow) return {title:'Well Square', text:[`The way down under Well Square is open.`], choices:[{label:'Down under Corvane', act: () => toMap('a3f1_under')}, back()]};
    const t = [`Well Square is grey robes from wall to wall. The Kindled have built a fire on the well-head over the seventh pillar and are singing round it, a slow, rising hymn that makes the cobbles hum. Every few minutes a group of them goes down the Binding stair, carrying picks.`];
    if (f1Kindled()) t.push(`Their picks glow grey. Wardstone pick-heads, from the carts on the old road. Sharp enough to cut a Keystone's root.`, echo('west', 'Ilsa and Tamsin let the Kindled march west from Hearthdeep with their carts.'));
    else t.push(`Their picks are iron. The Wardstone pick-heads went into a ravine in Hearthdeep.`, echo('west', 'Ilsa and Tamsin broke the Kindled rearguard on the old road and burned their carts.'));
    if (f.crownHelp) t.push(`At the square's mouths, ${f.crownHelp === 'king' ? 'the King’s guard' : 'Marrow’s Watch company'} have shut the streets. Nothing more is coming in.`);
    const ch = [];
    if (f.routeKnown) ch.push({label:'Take the Cinder Father’s own road, under Lantern Hill.', act: () => { f.squareHow = 'route'; S.notice = xpNoteParty(60); chron('The four went under Corvane by the Cinder Father’s own road, through the old Sarne cellars.'); go('a3f1_square'); }});
    if (k.captain === 'freed') ch.push({label:'Send word to the Iron Tally.', act: () => { f.squareHow = 'tally'; S.notice = xpNoteParty(60); chron('Captain Brask and the Iron Tally cleared Well Square for the four.'); go('a3f1_tally'); }});
    ch.push({label:'Go through them.', act: () => startCombat('a3f1_square')}, back());
    return {title:'Well Square', text:t, choices:ch};
  }},
  a3f1_tally:{ view: () => ({title:'Well Square', text:[`They come at noon, down the river road, twenty of them in Iron Tally grey with Captain Odile Brask at their head and her crossbows on their backs. "I owe you a boat," she says to Kael. "This is bigger than a boat. Call it square."`,
    `They don't fight the Kindled. They just walk into the square in a block, crossbows up, and the hymn falters, and the Kindled at the well-head look at the crossbows and look at each other and, slowly, back away down the side streets.`,
    echo('kael', 'Kael freed Captain Brask at Hollin’s Ford. The Iron Tally owe him.')], choices:[back()]})},
  a3f1_squareWin:{ enter(){ if (!S.flags.squareHow) S.flags.squareHow = 'fight'; }, view: () => ({title:'Well Square', text:[`The hymn breaks. The Kindled scatter into the lanes, and the fire on the well-head sinks to embers. The Binding stair stands open.`], choices:[{label:'Down under Corvane', act: () => toMap('a3f1_under')}]})},

  // --- Under Corvane ---
  a3f1_cistern:{ view: () => ({title:'The Old Cistern', text:[`A dry cistern under the Lower Town, vaulted like a church, with old lamp-hooks in the walls and a sound of water somewhere far off. ${S.flags.squareHow === 'route' ? 'Corrin’s drain comes out here. Somebody has slept here recently: a blanket, a cold brazier, a child’s wooden horse.' : 'Somebody has slept here recently: a blanket, a cold brazier, a child’s wooden horse.'}`],
    choices:[partyRest('You rest in the cistern. Everyone’s health and spell points are restored.'), back()].filter(Boolean)})},
  a3f1_stair:{ view: () => {
    const f = S.flags, s = pairF('south'), w = pairF('west');
    if (f.stairHow) return {title:'The Grey Stair', text:[`The grey on the stair has settled.`], choices:[back()]};
    const t = [`Below the cistern a stair goes down toward the seventh pillar's root, and the grey is coming up it like water up a well: thick, slow, full of shapes. People, once. The Kindled who went down first and didn't come back up.`];
    const ch = [];
    if (f.lantern > 0) ch.push({label:'Wren unhoods the lantern.', act: () => { if (s.s2Lamp !== 'kept') f.lantern--; f.stairHow = 'lantern'; chron(`Under Corvane, Wren walked the grey stair in Tamsin’s lantern-light.${s.s2Lamp === 'kept' ? ' The founder’s lamp relit it.' : ''}`); go('a3f1_stairLit'); }});
    if (w.vial > 0) ch.push({label:'Tamsin breaks the vial of Wren’s blood on the top step.', act: () => { f.stairHow = 'blood'; chron('Under Corvane, Tamsin broke the last of Wren’s blood on the grey stair, and the grey fell back from a Warden’s blood.'); go('a3f1_stairBlood'); }});
    ch.push(Object.assign({label:'Ilsa reads the founders’ ward-words from the silver book.', act: () => { f.stairHow = 'lore'; S.notice = xpNoteParty(80); chron('Under Corvane, Ilsa read the founders’ own ward-words down the grey stair.'); go('a3f1_stairLore'); }}, chkBy('ilsa', 'lore', 3)));
    ch.push({label:'Go down through it.', act: () => { f.stairHow = 'fight'; startCombat('a3f1_stair'); }}, back());
    t.push(lightNote());
    return {title:'The Grey Stair', text:t, choices:ch};
  }},
  a3f1_stairLit:{ view: () => ({title:'The Grey Stair', text:[`The grey draws back from the lantern like a tide going out, and the shapes in it draw back with it. ${pairF('south').s2Lamp === 'kept' ? 'Wren touches the founder’s lamp to it at the bottom, and it burns up full again.' : 'At the bottom Wren hoods it. It’s lower.'}`], choices:[back()]})},
  a3f1_stairBlood:{ view: () => ({title:'The Grey Stair', text:[`The glass breaks. The blood runs down the step, dark, and the grey stops where it starts, as if it had found a wall. It knows a Warden's blood. It doesn't like it.`, `Wren looks at the stain for a long moment. "Huh," she says.`], choices:[back()]})},
  a3f1_stairLore:{ view: () => ({title:'The Grey Stair', text:[`Ilsa reads in the founders' old tongue, very carefully, a word at a time. The words aren't magic, exactly. They're instructions, and the grey, it turns out, still remembers being told what to do. It parts.`], choices:[back()]})},
  a3f1_stairWin:{ view: () => ({title:'The Grey Stair', text:[`The shapes come apart. The four of you go down the rest of the stair with your eyes streaming and grey in your hair.`], choices:[back()]})},
  a3f1_gallery:{ view: () => {
    const f = S.flags;
    const t = [`The seventh pillar's root goes down through a long gallery of old black stone, and the Kindled are cutting it. A dozen of them on scaffolds with picks, ringing on the stone like bells, and the cut already a foot deep and grey light pouring out of it.`,
      `On the scaffold's top, conducting them like a choir, a bald man with burn scars up both arms and a voice like a forge-bellows: Tavish the Kindler, the Ashen Hand's war-leader. "Sing," he roars. "Sing it open!"`];
    t.push(f1Kindled() ? `The picks glow grey. Every stroke bites deep.` : `The picks are iron, and the black stone turns most of them. Tavish is screaming at them to strike harder.`);
    t.push(f.squareHow === 'route' ? `You came out behind them, by the Cinder Father's own road. Nobody's looking your way.` : `They know you're coming. Half the picks have turned your way.`);
    t.push(`Of the Cinder Father there's no sign. ${f.knowSeverin ? `${SEVERIN} is already deeper down, toward the Keystone.` : 'Wherever he is, it isn’t here.'}`,
      `<em>A hard fight. Tavish leads from the scaffold, and his Kindling burns all of you at once; the pickmen hit hard.</em>`);
    return {title:'The Pick-Gallery', text:t, choices:[{label:'Fight Tavish the Kindler', act: () => startCombat('a3f1_boss')}, {label:'Fall back and prepare', act: () => toMap('a3f1_under')}]};
  }},
  a3f1_bossWin:{ enter(){ if (S.flags.f1Boss) return; S.flags.f1Boss = true; chron('Under Corvane, the four broke Tavish the Kindler and his pickmen at the seventh pillar’s root.'); }, view: () => {
    const t = [`Tavish comes down off his scaffold the hard way, and doesn't get up. The picks are on the floor. The hymn is over.`,
      `But the cut in the root is deep, and getting deeper by itself now, cracking along the grain with a sound like ice on a river. Above you, very faintly, Well Square groans.`,
      `And from below, from much further down, from the Keystone itself, comes a new sound: a man's voice, singing. Alone. ${S.flags.knowSeverin ? SEVERIN + '.' : 'The Cinder Father.'}`];
    return {title:'The Pick-Gallery', text:t, choices:[{label:'The root', go:'a3f1_choice'}]};
  }},
  a3f1_choice:{ view: () => {
    const f = S.flags, light = finaleLight();
    const t = [`The root will go within the hour. When it does, Well Square goes into the undercity, and every well in the Lower Town with it, and the grey comes up through all of them.`,
      `It can be held. Light into the crack, and Tamsin's hands on it, and it'll close, the way a wound closes. That's light you won't have at the Keystone.`,
      `Or let it go, and run. Down is the Cinder Father, singing. The longer he sings, the worse it'll be when you get there.`, lightNote()];
    if (f.quillWards) t.push(`Quill's adepts have warded the Lower Town's wells. If the square goes, the grey will come up slower.`);
    const ch = [];
    if (light > 0) ch.push({label:'Hold it with light.', act: () => { f.f1Pillar = 'held'; f.lightUsed = (f.lightUsed || 0) + 1; chron('Under Corvane, the four held the seventh pillar with light they will not have at the Keystone.'); go('a3f1_held'); }});
    ch.push({label:'Tamsin holds it with her own light.', act: () => { f.f1Pillar = 'held'; f.tamsinPaid = true; asHeroState('tamsin', () => { S.pc.hp = Math.max(1, S.pc.hp - Math.ceil(pcMax() * 0.3)); }); chron('Under Corvane, Tamsin held the seventh pillar with her own light. It cost her.'); go('a3f1_held'); }});
    ch.push({label:'Let it go. Run for the Keystone.', act: () => { f.f1Pillar = 'fallen'; f.sooner = true; chron(`Under Corvane, the four let the seventh pillar fall and ran for the Keystone. Well Square went into the undercity.${f.quillWards ? ' Quill’s wards slowed the grey in the wells.' : ''}`); go('a3f1_fallen'); }});
    return {title:'The Seventh Pillar', text:t, choices:ch};
  }},
  a3f1_held:{ view: () => ({title:'The Seventh Pillar', text:[S.flags.tamsinPaid && S.flags.f1Pillar === 'held' && !S.flags.lightUsed ? `Tamsin puts both hands flat on the root and gives it what she has. It comes out of her slowly, gold, and the crack fills and closes along its length like a seam being sewn. When it's done she has to be helped up. "Fine," she says. "I'm fine." She isn't.` : `Tamsin opens the light and lays it in the crack, and the crack fills gold and closes along its length like a seam being sewn. The root is whole. The light is gone into it.`,
    `Above you, Well Square goes quiet.`, `Below, the singing goes on.`], choices:[{label:'Down', go:'a3f1_end'}]})},
  a3f1_fallen:{ view: () => ({title:'The Seventh Pillar', text:[`You run. Behind you the root goes with a crack like the sky breaking, and the gallery fills with dust, and somewhere far above, Well Square drops forty feet into the dark with the Kindled's fire still burning on it.`,
    S.flags.quillWards ? `The grey comes up through the Lower Town's wells, slow and thin, against Quill's wards.` : `The grey comes up through every well in the Lower Town.`, `Below, the singing falters for a moment, as if surprised. Then it goes on, louder.`], choices:[{label:'Down', go:'a3f1_end'}]})},
  a3f1_end:{ view: () => {
    const f = S.flags;
    return {title:'Down', text:[`The last stair goes down into the old Founders' road, the one that runs under the whole city to the Binding hall and the Keystone.`,
      `Ilsa stops at the top. "It knows I'm coming," she says. "It's been saying my name all night." Kael puts a hand on her shoulder, and keeps it there, and they go down.`, lightNote()],
      choices:[{label:'End of chapter', act: () => { setQ('f1', 'done', `The four broke the Kindled at the seventh pillar's root. ${f.f1Pillar === 'held' ? 'The pillar holds.' : 'The pillar fell, and Well Square with it.'}`); S.mode = 'end'; save(); render(true); }}]};
  }}
});

Object.assign(MAPS, {
  a3f1_city:{
    title:'Corvane, the Kindled Night',
    blurb: () => `The city on the last night: grey robes in the Lower Town and a hymn under the cobbles.`,
    w:340, h:260,
    nodes:[
      {id:'a3f1_base', label:'Your base', x:50, y:210, sub:'Rest and the companions'},
      {id:'a3f1_cell', label:'The Cellar', x:60, y:70, sub:'Corrin Sarne', done: () => S.flags.corrinDeal},
      {id:'a3f1_binder', label:'The Lord Binder', x:170, y:40, sub:'Optional', done: () => S.flags.binderTold},
      {id:'a3f1_court', label:'Envoys’ Court', x:180, y:200, sub:'The Crown'},
      {id:'a3f1_square', label:'Well Square', x:295, y:120, sub:'The Kindled', done: () => S.flags.squareHow}
    ],
    edges:[['a3f1_base','a3f1_cell'],['a3f1_cell','a3f1_binder'],['a3f1_base','a3f1_court'],['a3f1_binder','a3f1_square'],['a3f1_court','a3f1_square']]
  },
  a3f1_under:{
    title:'Under Corvane',
    blurb: () => `The old works under the Lower Town, going down toward the seventh pillar's root.`,
    w:340, h:260,
    nodes:[
      {id:'a3f1_cistern', label:'The Old Cistern', x:60, y:200, sub:'Rest'},
      {id:'a3f1_stair', label:'The Grey Stair', x:150, y:70, sub:'Going down', done: () => S.flags.stairHow},
      {id:'a3f1_gallery', label:'The Pick-Gallery', x:290, y:150, sub:'The seventh pillar’s root', open: () => S.flags.stairHow, done: () => S.flags.f1Boss, lockText:'Get down the stair first'},
      {id:'a3f1_upst', label:'Up to the City', x:170, y:220, sub:'Back to Corvane'}
    ],
    edges:[['a3f1_cistern','a3f1_stair'],['a3f1_stair','a3f1_gallery'],['a3f1_cistern','a3f1_upst']]
  }
});
SCENES.a3f1_upst = {view: () => ({title:'The Stair Up', text:[`The way back up into the city.`], choices:[{label:'Up into Corvane', act: () => toMap('a3f1_city')}, back()]})};

Object.assign(ENEMIES, {
  // Party enemies for the finale: all four heroes, tuned for level 20, the cap (pairs finish their roads at about 17–20; past level 14 heroes gain little, so tuning at the cap keeps a party that's ahead from meeting tougher enemies)
  kindled:{name:'Kindled Zealot', hp:400, dmg:[44,50], acc:76, dodge:4, armor:2, init:5, xp:60, calm:true},
  kindledpick:{name:'Kindled Pickman', hp:500, dmg:[52,60], acc:74, dodge:2, armor:2, init:4, xp:70},
  kindledpickW:{name:'Kindled Pickman', hp:540, dmg:[56,64], acc:74, dodge:2, armor:2, init:4, xp:80, greyChance:25}, // a Wardstone pick-head
  kindledsinger:{name:'Kindled Cantor', hp:300, dmg:[40,44], acc:78, dodge:6, armor:0, init:6, xp:60, ranged:true, row:'back', greyChance:30},
  stairshade:{name:'Grey Shape', hp:440, dmg:[44,50], acc:74, dodge:4, armor:1, init:5, xp:55, hollow:true, cleanse:true, greyChance:30},
  tavish:{name:'Tavish the Kindler', hp:1200, dmg:[54,62], acc:78, dodge:4, armor:3, init:5, xp:450, ranged:true, row:'back', greyChance:20,
    spec:{every:2, name:'Kindling', windup:'{n} spreads his scarred arms, and the air in the gallery catches.', mult:1.8, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  a3f1_square:{title:'Well Square', level:20, lethal:true, flee:true, win:'a3f1_squareWin', back:'a3f1_square',
    // the Crown holding the streets: nothing more comes in behind them
    enemies:() => [f1Kindled() ? 'kindledpickW' : 'kindledpick', 'kindled', 'kindledsinger'].concat(S.flags.crownHelp ? [] : ['kindled']),
    intro:'The hymn turns into a roar. The Kindled come at you across the square.'},
  a3f1_stair:{title:'The Grey Stair', level:20, lethal:true, win:'a3f1_stairWin', back:'a3f1_stair',
    enemies:() => ['stairshade', 'stairshade', 'stairshade'], intro:'The grey on the stair stands up.'},
  a3f1_boss:{title:'Tavish the Kindler', level:20, lethal:true, win:'a3f1_bossWin', back:'a3f1_gallery',
    enemies:() => {
      // Wardstone picks if the west let the carts through; coming out behind them by the Cinder Father's road, a cantor
      // doesn't see you in time
      const f = S.flags, pick = f1Kindled() ? 'kindledpickW' : 'kindledpick';
      return [pick, pick].concat(f.squareHow === 'route' ? [] : ['kindledsinger'], ['tavish']);
    },
    intro:'Tavish the Kindler points his scarred arm at you. "Sing them down!"'}
});

const _a24Echoes = HEROES.party.echoes;
HEROES.party.echoes = () => {
  const f = S.flags, e = _a24Echoes();
  if (f.corrinDeal === 'freed') e.push('Kael let Corrin Sarne go free, for the Cinder Father’s road.');
  if (f.corrinDeal === 'held') e.push('Corrin Sarne is in chains, for the city to judge.');
  if (f.knowSeverin) e.push(`The Cinder Father is ${SEVERIN}, once the Second Binder.`);
  if (f.crownHelp) e.push(f.crownHelp === 'king' ? 'The King lent the four his guard.' : 'Envoy Marrow lent the four a company of the Watch.');
  if (f.quillWards) e.push('Quill’s adepts warded the Lower Town’s wells.');
  if (f.squareHow === 'tally') e.push('The Iron Tally cleared Well Square for the four.');
  if (f.f1Pillar === 'held') e.push(`The seventh pillar holds.${f.tamsinPaid ? ' Tamsin held it with her own light.' : ''}`);
  if (f.f1Pillar === 'fallen') e.push('The seventh pillar fell, and Well Square with it.');
  return e;
};

// ================= ACT 2, CHAPTER 4: THE COUNCIL OF CORVANE =================
// The end of Act 2. Eight days of preparation (the case, the companions, the clock), then Council night: the party
// puts its evidence before the Council, someone they trusted turns on them (betrayer: Marrow if Crown standing is
// warm, else Magister Hale if Ilsa sent him home, else Dario if Kael won him, else Mother Quell), and the Council's
// secret comes out: it puts Wardens in the stones, and it wants Wren. If the party set the trap in A2·3 it is split:
// Kael and Wren at the seventh pillar's root, Ilsa and Tamsin in the chamber (two-hero fights, def.members). Below:
// the grey King, then the Lord Binder at the Keystone. Choice: council = 'broken' | 'bargain'; then the four split,
// Kael and Wren south, Ilsa and Tamsin west. Scene IDs use the prefix a24_. Party flags: ormeTestify, kingLaw,
// greyBelow, boatReady, shown (evidence presented), caseScore, betrayer, kingSpoke, lanternThrice, a24Boss, council.
// Placeholder names: the Lord Binder, the Council chamber, the King (unnamed), the Cinder Father.
HEROES.party.chapters[4] = {title:'The Council of Corvane', start:'a24_intro'};

// Who turns on them: the first that applies
function a24Betrayer(){
  if (crownMood() === 'warm') return 'marrow';
  if (ilf().magister === 'home') return 'hale';
  if (kf().darioAlly) return 'dario';
  return 'quell';
}
const BETRAYER_NAME = {marrow:'Envoy Marrow', hale:'Magister Hale', dario:'Dario Sarne', quell:'Mother Quell'};
const a24Split = () => S.flags.handPlan === 'trap';
// Evidence the Council actually hears (Marrow, if she's the betrayer, never produces what she was given)
const EVIDENCE = {
  trail:{label:'Kael lays out the shard trail, from Varrow to the Salt Road to Number Nine.', who:'kael', weight:1,
    text:`Kael tells it plainly, the way he'd tell a fight: the shards under Varrow's arena, the farmer's well on the Salt Road, Number Nine, the crates going up Lantern Hill. Some of the lords have heard pieces of it. None of them have heard all of it.`},
  father:{label:'Ilsa reads out the palace record of Wren’s father.', who:'ilsa', weight:1, need: f => f.foundFather,
    text:`Ilsa reads it in her clear Arcanum voice: <em>Admitted: Faelan, of Ardh Lirien, a Warden. Taken below, at the Council's order.</em> In the silence after it, Wren says, "He was my father," and nobody on the Council looks at her.`},
  ledger:{label:'Put Corrin Sarne’s ledger before the Council.', weight:2, need: f => f.corrinProof,
    text:`The ledger goes from hand to hand along the Council's table: three months of shards to the Ash Market, every page signed <em>C. Sarne</em>. Corrin smiles at it as if it were a child's drawing. His hands are very still.`},
  letters:{label:'Put the Ashen Hand’s letters before the Council.', weight:2, need: f => f.handPlan === 'trap',
    text:`The letters from Sarne's steward to the Ashen Hand are read out by a clerk whose voice gets smaller with every line: <em>my lord will be the only lord left standing in Corvane.</em> Lords turn in their seats to look at Corrin.`},
  witnesses:{label:'Tamsin brings the freed converts forward.', who:'tamsin', weight:1, need: f => f.handFreed > 0,
    text:`Tamsin brings them in from the gallery, the people she pulled out of the grey in the Cinder Vaults. A tanner. A girl of fifteen. They tell the Council what they were promised, and who paid for the candles.`},
  orme:{label:'Captain Orme testifies to what he saw below the palace.', weight:2, need: f => f.ormeTestify,
    text:`Captain Orme stands at attention and tells it all, like a report: the undercroft, the Binding hall, the man in the stone. "I've served this palace twenty-two years," he says. "I never asked what was below. I'm asking now."`}
};
function caseScore(){
  const f = S.flags; let n = 0;
  (f.shown || []).forEach(id => { n += EVIDENCE[id].weight; });
  if (f.betrayer === 'marrow' && f.evidenceTo === 'marrow') n -= ['ledger', 'letters'].filter(id => (f.shown || []).includes(id)).length * 2;
  return n;
}
const caseStrong = () => (S.flags.caseScore || 0) >= 5;

Object.assign(SCENES, {
  a24_intro:{
    enter(){ quest('council', 'The Council of Corvane', 'Bring what you know before the Council of Corvane, and stop the seventh pillar falling.'); },
    view: () => {
      const f = S.flags;
      const t = [`Eight days until the Council sits.`];
      if (f.keystone === 'released') t.push(`Every night the city shudders. On the fifth night a tenement in the Lower Town folds in on itself like wet paper, and they dig eleven people out of it, and four of them are alive. Ilsa stops sleeping.`);
      else t.push(`The city is quiet. In Tamsin's infirmary the grey-sick murmur in Ilsa's voice, all night, all together, like a congregation. Ilsa stops visiting.`);
      t.push(f.handPlan === 'trap' ? `And every morning the wells of the Lower Town come up greyer. By the sixth day Tamsin has patients on the floor, and Bracken sleeps across the infirmary door to keep the frightened out.` : `Since the Vaults burned, the wells are clearing. The Lower Town has started, cautiously, to drink again.`);
      t.push(`There's a case to put together, and four companions who want to help.`);
      return {title:'Eight Days', text:t, choices:[{label:'Get ready', act: () => toMap('a24_city')}]};
    }
  },
  a24_base:{ view: () => {
    const f = S.flags;
    return {title: f.base === 'gull' ? 'The Gull’s Rest' : 'The Pilgrims’ Hostel', text:[
      `Brannoc has bought a new coat for the Council, and keeps not wearing it. Hask is reading the city's laws. Bracken is watching the door. Tobin is watching the river.`
    ], choices:[
      partyRest('You sleep. Everyone’s health and spell points are restored.'),
      {label:'Brannoc: buy 2 Healing Draughts (20 crowns)', req: () => S.gold >= 20, tag: S.gold >= 20 ? null : 'Needs 20 crowns', act: () => { S.gold -= 20; S.items.draught += 2; S.notice = 'Brannoc sells you 2 Healing Draughts.'; render(); }},
      !f.kingLaw ? {label:'Hask: ask what he’s found in the laws.', act: () => { f.kingLaw = true; S.notice = xpNoteParty(60); go('a24_hask'); }} : null,
      !f.greyBelow ? {label:'Bracken: take him past the Council House at night.', act: () => { f.greyBelow = true; go('a24_bracken'); }} : null,
      !f.boatReady ? {label:'Tobin: ask him to have a boat ready, after.', act: () => { f.boatReady = true; S.items.tonic += 1; go('a24_tobin'); }} : null,
      back()
    ].filter(Boolean)};
  }},
  a24_hask:{ view: () => ({title:'Hask', text:[`"Old law," says Hask, tapping a page with a finger like a tent-peg. "Older than the Council. Any lord of the Reach may stand in the Council House and demand to see the King's face. If the King does not come, the Council's seal is void until he does." He looks up. "Nobody's used it in two hundred years. Nobody's needed to."`], choices:[back()]})},
  a24_bracken:{ view: () => ({title:'Bracken', text:[`Bracken walks the length of the Council House's wall with his nose down and his hackles up, and at the corner by the old well-house he stops and growls at the ground. Tamsin kneels and puts her hand on the flagstones. They're cold, and under the cold, faintly, there's grey.`, `"Something under the Council House is sick," she says.`], choices:[back()]})},
  a24_tobin:{ view: () => ({title:'Tobin', text:[`"After," says Tobin. "Right." He doesn't ask after what. "There's a fishing boat at the river gate that'll take four and a dog. I'll have her ready from Council night on." He gives you a Bitter Tonic. "For before."`], choices:[back()]})},
  a24_orme:{ view: () => {
    const f = S.flags;
    if (f.way === 'pass' || f.doorHow === 'talk'){
      return {title:'Captain Orme', text:[`You find Captain Orme in the palace guardroom, polishing a sword that doesn't need it. He listens. Then he puts the sword down.`,
        `"I saw what I saw," he says. "${f.keystone === 'released' ? 'I saw you let a man out of a stone, and I saw the stone start to crack. I said that to the Council and I won\'t take it back.' : 'I saw a man in a stone, put there by the Council.'} But I'll say all of it. The whole thing. Not just the part they want."`],
        choices:[{label:'“Then say it in front of everyone.”', act: () => { f.ormeTestify = true; S.notice = xpNoteParty(80); chron('Captain Orme agreed to testify before the Council to what he saw below the palace.'); go('a24_ormeYes'); }}, back()]};
    }
    return {title:'The Palace Guardroom', text:[`The palace guard won't let you near the guardroom. ${f.doorHow === 'fight' ? 'Captain Orme, they say, is still nursing the arm you broke, and he has nothing to say to you.' : 'Captain Orme, they say, has never heard of you.'}`], choices:[back()]};
  }},
  a24_ormeYes:{ view: () => ({title:'Captain Orme', text:[`"Council night, then," says Orme. "I'll be in the gallery. When you need me, say my name."`], choices:[back()]})},
  a24_court:{ view: () => {
    const f = S.flags, mood = crownMood();
    const t = [`Envoy Marrow's map room. She's lost weight.`];
    if (mood === 'warm') t.push(`"Everything's ready," she says. "When you've said your piece, I'll stand and say mine. The Crown will stand with you." She means it, or she's very good.`);
    else if (mood === 'wary') t.push(`"I'll be there," she says. "I'll listen. That's all I can promise."`);
    else t.push(`"I'll be there," she says, "because I have to be. Don't look to me."`);
    if (f.evidenceTo === 'marrow') t.push(`"And what you gave me is locked in my office. I'll bring it."`);
    return {title:'The Envoys’ Court', text:t, choices:[back()]};
  }},

  // --- Council night ---
  a24_house:{ view: () => {
    const f = S.flags;
    const t = [`Council night. The Council House is packed to the rafters: every lord of the Reach in the benches, their retinues in the galleries, the city pressed against the doors outside. At the long table at the front sit the nine of the Council in black, and at their right hand, in black and silver, Lord Corrin Sarne.`,
      `The King's chair, at the head of the table, is empty.`];
    if (a24Split()) t.push(`Kael and Wren aren't with you. When the bell for the session rang, they went down through the drains toward the seventh pillar's root, where the Ashen Hand will come tonight. It's Ilsa and Tamsin who walk up the aisle.`);
    else t.push(`The four of you walk up the aisle together. Corrin watches you all the way.`);
    return {title:'The Council House', text:t, choices:[{label:'Put your case', act: () => { f.shown = f.shown || []; go('a24_session'); }}]};
  }},
  a24_session:{ view: () => {
    const f = S.flags, shown = f.shown || [], last = shown[shown.length - 1];
    const t = [];
    if (last) t.push(EVIDENCE[last].text);
    else t.push(`The First of the Council, an old woman with a voice like a dry hinge, gives you the floor. "Say what you came to say."`);
    const ch = [];
    Object.keys(EVIDENCE).forEach(id => {
      const e = EVIDENCE[id];
      if (shown.includes(id) || (e.need && !e.need(f))) return;
      if (a24Split() && (e.who === 'kael')) return;
      if (id === 'ledger' && f.evidenceTo === 'marrow'){ ch.push({label:'Ask Envoy Marrow to produce Corrin’s ledger.', act: () => present(id)}); return; }
      if (id === 'letters' && f.evidenceTo === 'marrow'){ ch.push({label:'Ask Envoy Marrow to produce the Ashen Hand’s letters.', act: () => present(id)}); return; }
      const c = {label:e.label, act: () => present(id)};
      if (id === 'father') Object.assign(c, chkBy('ilsa', 'lore', 2));
      if (id === 'witnesses') Object.assign(c, chkBy('tamsin', 'leadership', 1));
      ch.push(c);
    });
    if (f.kingLaw && !f.kingDemand) ch.push({label:'Invoke the old law: demand to see the King’s face.', act: () => { f.kingDemand = true; go('a24_demand'); }});
    ch.push({label: shown.length ? 'Rest your case' : 'Say nothing more', act: () => { f.betrayer = a24Betrayer(); f.caseScore = caseScore(); chron(`Before the Council of Corvane, the four put their case against Corrin Sarne.`); go('a24_betray'); }});
    return {title:'The Council House', text:t, choices:ch};
    function present(id){
      f.shown = shown.concat([id]);
      if ((id === 'ledger' || id === 'letters') && f.evidenceTo === 'marrow' && a24Betrayer() === 'marrow'){ f.betrayer = 'marrow'; f.caseScore = caseScore(); go('a24_betray'); return; }
      render(true);
    }
  }},
  a24_demand:{ view: () => ({title:'The Council House', text:[`Ilsa stands and says the words of the old law, the way Hask wrote them out. The hall goes so quiet you can hear the lamps.`, `"The King is resting," says the First of the Council, after much too long. "His Majesty will see no one." The lords look at each other. Someone at the back says, "Then the seal is void," and someone else says, "Hush," and nobody hushes.`], choices:[{label:'Go on', go:'a24_session'}]})},
  a24_betray:{ view: () => {
    const f = S.flags, b = f.betrayer;
    const t = [caseStrong() ? `The hall is turning. Lords are on their feet. The First of the Council calls for order and doesn't get it, and Corrin Sarne, for the first time, isn't smiling.` : `It isn't enough. The Council listens with folded hands, and when you're done, Corrin Sarne laughs, and some of the lords laugh with him.`];
    if (b === 'marrow') t.push(`Then Envoy Lysa Marrow rises from the Crown's bench, and the hall quiets for her, because everyone knows she's been speaking for you.`,
      f.evidenceTo === 'marrow' ? `"The evidence these four gave me," she says, "I have read. It proves nothing. I've burned it." A noise goes through the hall like wind.` : `"I have listened to these four for a month," she says.`,
      `"And I've told the Council everything they told me. Everything they did under the palace. ${f.keystone === 'released' ? 'They let the anchor out of the Keystone. The city is shaking because of them.' : 'Ilsa Venn has the Hollow\'s ear. It speaks in her voice.'} I'm sorry. The Crown comes first. It has to."`);
    else if (b === 'hale') t.push(`Then a man in Arcanum grey stands in the lords' gallery: Magister Hale, whom Ilsa spared at the bridge and sent home owing her.`, echo('ilsa', 'Ilsa sent Magister Hale home owing her, instead of handing him to the Crown.'),
      `"The Arcanum lays a charge before the Council," he says. "Ilsa Venn stole a forbidden text from our vault. She carries it now. She has been reading it into the Wardstones." He doesn't look at her. "The Arcanum asks that it be seized. I'm sorry, Venn. The side door was never free."`);
    else if (b === 'dario') t.push(`Then Dario Sarne stands, at his brother's shoulder. He's pale and steady.`, echo('kael', 'Kael spared Dario Sarne at Varrow, and Dario gave him the key to the palace records.'),
      `"I was poisoned at Varrow," he says. "Everyone knows it. I said it wasn't Kael Dunmore. I lied, because I was afraid of him." He swallows. "It was him. And he's lying now." Corrin puts a hand on his shoulder. Dario flinches, very slightly, and doesn't move.`);
    else t.push(`Then a door at the side of the hall opens, and a broad woman with a brand on her wrist and a cane she doesn't need comes in and sits down in the merchants' bench as if she owns it. Mother Quell.`, echo('wren', 'Wren crossed paths with Mother Quell at Gallows Ford and on the river.'),
      f.quellFavour ? `"I said I'd ask a favour one day," she says to Wren, across the hall. "I asked Lord Corrin what yours was worth. He paid well." She spreads her hands. "Business."` : `"You paid me for where the Hand was," she says to Wren, across the hall. "Lord Corrin paid me more for where you'd be tonight." She spreads her hands. "Business."`);
    if (b === 'quell' && a24Split()) t.push(`<em>Corrin knows the trap at the root. Kael and Wren will be walking into more than the Hand.</em>`);
    chron(`At the Council of Corvane, ${BETRAYER_NAME[b]} turned on the four.`);
    return {title:'The Betrayal', text:t, choices:[{label:'Go on', go:'a24_secret'}]};
  }},
  a24_secret:{ view: () => {
    const f = S.flags;
    const t = [`The First of the Council stands. "Enough," she says, and for the first time she sounds tired. "You want the truth? Here it is."`,
      `"Every Wardstone in the Reach holds because someone is inside it. The founders did it first. We've done it since. When an anchor fails, the Council puts a Warden in. Quietly. For three hundred years. It's the price of the world, and somebody has to pay it, and somebody has to decide who."`,
      f.keystone === 'released' ? `"You let the Heartland anchor go. The Keystone has nobody in it. It is cracking tonight." She looks at Wren. "There's one Warden of the Ardh Lirien line left in this city."` : `"You let a scholar speak into the Keystone instead of a Warden. It holds, for now. And the thing on the other side has her voice." She looks at Wren. "When it fails, there's one Warden of the Ardh Lirien line left."`,
      `Behind the Council's table, a door opens on a stair going down, and out of it comes a tall man in a robe of grey iron links, carrying a chain: the Lord Binder, keeper of the stones. He's old. He was old twenty years ago, when he took Faelan below.`,
      `"Seize them," says the First of the Council. "And bring the girl."`];
    return {title:'The Council’s Secret', text:t, choices:[{label: a24Split() ? 'Ilsa and Tamsin fight' : 'Fight', go: a24Split() ? 'a24_chamberFight' : 'a24_hallFight'}]};
  }},
  a24_hallFight:{ view: () => ({title:'The Council House', text:[`Council guards come over the table. The lords scatter. ${BETRAYER_NAME[S.flags.betrayer]}'s people come with them. The Lord Binder goes back down his stair, unhurried, as if he knows where you'll have to come.`], choices:[{label:'Fight', act: () => startCombat('a24_hall')}]})},
  a24_chamberFight:{ view: () => ({title:'The Council House', text:[`It's Ilsa and Tamsin against the Council's guard, in front of every lord in the Reach. Bracken comes over the gallery rail in one bound.`, `Somewhere below, the Lord Binder has gone down his stair, toward the root, toward Wren.`, `<em>A two-hero fight: Ilsa and Tamsin only.</em>`], choices:[{label:'Fight', act: () => startCombat('a24_chamber')}]})},
  a24_chamberWin:{ view: () => ({title:'The Council House', text:[`The last guard goes down. The Council has fled through its own door. The lords are on their feet, and nobody, for once, is laughing.`, `"Below," says Tamsin. "Kael and Wren."`], choices:[{label:'Meanwhile, at the root', go:'a24_rootStart'}]})},
  a24_rootStart:{ view: () => {
    const f = S.flags;
    return {title:'The Seventh Pillar’s Root', text:[`Under Well Square, through the drains, where the seventh pillar's root goes down into old black stone: Kael and Wren, in the dark, waiting.`,
      `The Ashen Hand comes at midnight with picks and a cantor. ${f.betrayer === 'quell' ? 'And with them, a dozen Sarne housecarls, who know exactly where you\'re hiding, because Mother Quell sold it.' : 'They don\'t know you\'re there.'} Last of all, on the stair, a tall figure in ash-grey and silver: the Cinder Father.`,
      `<em>A two-hero fight: Kael and Wren only.</em>`], choices:[{label:'Stop them', act: () => startCombat('a24_root')}]};
  }},
  a24_rootWin:{ view: () => ({title:'The Seventh Pillar’s Root', text:[`The picks are on the floor. The cantor is down. The root is whole. The Cinder Father is gone, back up the stair, the way he always goes. "Every time," says Kael.`,
      `Then running feet in the drain behind you: Ilsa and Tamsin, out of breath. "The Binder," says Tamsin. "He's gone down to the Keystone. They want Wren in it." The drains under Well Square run into the Binder's stair.`],
    choices:[{label:'Down to the Keystone', act: () => toMap('a24_below')}]})},
  a24_hallWin:{ view: () => ({title:'The Council House', text:[`When it's over, the Council has fled through its own door and down the Binder's stair, and the lords of the Reach are standing on their benches, staring at you.`, `"After them," says Wren. "Before they decide which of us goes in the stone."`],
    choices:[{label:'Down the Binder’s stair', act: () => toMap('a24_below')}]})},

  // --- Below the Council House ---
  a24_cell:{ view: () => ({title:'A Guard-Post', text:[`An empty guard-post on the stair down, with a brazier still warm. Nobody will come back up this stair tonight.`], choices:[partyRest('You catch your breath in the guard-post. Everyone’s health and spell points are restored.'), back()].filter(Boolean)})},
  a24_king:{ view: () => {
    const f = S.flags, t = tf();
    if (f.kingDone) return {title:'The King’s Room', text:[f.kingSpoke ? `The King sits up in his bed, grey only at the fingertips now, with Brannoc's coat round his shoulders.` : `The King sleeps, grey to the throat. You'll come back for him.`], choices:[back()]};
    const txt = [`Off the stair, behind a door with a Council seal, there's a bedroom: a good bed, a fire, a table with untouched food. And in the bed, grey to the throat, eyes open and seeing nothing, a man of fifty in a nightshirt with a gold ring on his finger.`,
      `The King. Not resting. Hidden. For a year, the grey has been climbing him, and the Council has been ruling in his name.`];
    if (f.greyBelow) txt.push(`Bracken was right. Something under the Council House was sick.`);
    const ch = [];
    if (f.lanternTwice) txt.push(`Tamsin looks at him for a long time. She has lit the Second Lantern twice. She knows what a third time will take.`);
    else if (t.lanternCost) txt.push(`Tamsin flexes her hands. Since Aurel, her light comes thin.`);
    ch.push({label:'Tamsin lays her hands on him.', act: () => { f.kingDone = true; f.kingSpoke = true; if (f.lanternTwice) f.lanternThrice = true; S.notice = xpNoteParty(100); chron(`Below the Council House, Tamsin drew the grey back from the King.${f.lanternThrice ? ' It cost her a third time.' : ''}`); go('a24_kingWakes'); }});
    ch.push({label:'No time. Leave him, and come back.', act: () => { f.kingDone = true; toMap('a24_below'); }});
    return {title:'The King’s Room', text:txt, choices:ch};
  }},
  a24_kingWakes:{ view: () => ({title:'The King’s Room', text:[
    S.flags.lanternThrice ? `The light comes out of Tamsin slowly, like the last of the oil in a lamp. When it's done she sits down on the floor and doesn't get up for a while.` : `The light comes out of Tamsin's hands and into the King, and the grey draws back down his throat, his chest, his arms, to his fingertips, and stops there.`,
    `He blinks. He looks at you. "Who are you?" he says, and then, in a different voice, the voice of a man who has been listening from very far away for a year: "No. I know. I heard them. They thought I couldn't."`,
    `He tries to stand and can't. "Tell the Binder," he says, "that the King says no. No one else goes in a stone. Not in my name."`
  ], choices:[back()]})},
  a24_binder:{ view: () => {
    const f = S.flags;
    const t = [`The stair ends in the Binding hall, under the Keystone. ${f.keystone === 'released' ? 'The crack in the stone is wider than when you left it, and the hall hums like a struck bell that won\'t stop.' : 'The stone holds, steady and bright, and under the hum, faintly, something says your names in Ilsa\'s voice.'}`,
      `The Lord Binder stands at the foot of the stone with his chain, and the Council's wardens around him in their iron-link robes${f.betrayer === 'marrow' ? ', and Crown soldiers with Marrow\'s badge' : f.betrayer === 'hale' ? ', and Arcanum hunters with the Leash remade' : f.betrayer === 'dario' ? ', and Sarne housecarls' : ', and Quell\'s knives'}.`,
      `"I put your father in this stone, girl," he says to Wren, not unkindly. "He went willingly. You'll understand, after."`];
    if (f.kingSpoke) t.push(`"The King says no," says Kael. The Binder's wardens look at each other. One of them puts down his chain.`);
    t.push(`<em>The last fight of Act 2. The Binder's Seal strikes everyone at once; his wardens' chains drag one of you toward the stone.</em>`);
    return {title:'The Binding Hall', text:t, choices:[{label:'Fight the Lord Binder', act: () => startCombat('a24_boss')}, {label:'Fall back and prepare', act: () => toMap('a24_below')}]};
  }},
  a24_bossWin:{
    enter(){ if (S.flags.a24Boss) return; S.flags.a24Boss = true; },
    view: () => ({title:'The Binding Hall', text:[
      `The Lord Binder goes down on one knee at the foot of the Keystone, and his chain rattles out of his hand across the stone floor. He's very old. "Then who?" he says. "When it fails. Who?"`,
      `"Nobody," says Ilsa. "That's the point. The founders wrote it down. Release them, one stone at a time, and close the cracks with light. End the cage. Nobody goes in again."`,
      `Above you, the Council is waiting to hear what you'll do with it.`
    ], choices:[{label:'Decide together', go:'a24_choice'}]})
  },
  a24_choice:{ view: () => {
    const f = S.flags;
    return {title:'The Council of Corvane', text:[
      `Break it: go back up into the Council House, throw open the doors, and tell the city everything. The stones, the anchors, the King in his bed. Corrin falls, and the Council with him. But Corvane will riot, the Crown ${f.kingSpoke ? 'has a King too weak to stand' : 'has no one to lead it'}, and the four of you will leave as heroes to some and outlaws to others.`,
      `Or bargain: the Council keeps its secret, and you keep yours, and in return you get writs under the Council's seal to go to every Wardstone in the Reach, and the Council's word that no one goes into a stone again. The city stays calm. But Corrin walks, and the Council will always know what it could tell about you.`
    ], choices:[
      {label:'Break the Council. Tell the city everything.', act: () => { f.council = 'broken'; chron('The four broke the Council of Corvane and told the city everything. Corrin Sarne fell. Corvane rioted.'); go('a24_broken'); }},
      {label:'Bargain. Writs for the stones, and no one goes in again.', act: () => { f.council = 'bargain'; chron('The four struck a bargain with the Council of Corvane: its secret kept, and writs to every Wardstone in the Reach. Corrin Sarne walked.'); go('a24_bargain'); }}
    ]};
  }},
  a24_broken:{ view: () => {
    const f = S.flags;
    return {title:'The Council House', text:[`You come up the Binder's stair into a hall full of lords, and Kael opens the great doors onto the square, where half the city is waiting in the dark, and Ilsa tells them. All of it. It takes an hour. Nobody leaves.`,
      f.kingSpoke ? `At the end, Brannoc and Hask carry the King out onto the steps in a chair, and he lifts one grey hand, and the square goes silent.` : `At the end, the square is silent, and then it isn't.`,
      `By dawn the Council House is burning, Corrin Sarne is in a cell${f.caseScore >= 5 ? ' with half the lords of the Reach swearing against him' : ', and his housecarls are fighting the Watch in the streets to get him out'}, and Corvane is two cities: one that thinks you saved it, and one that wants you hanged.`],
      choices:[{label:'To the river gate', go:'a24_end'}]};
  }},
  a24_bargain:{ view: () => ({title:'The Council House', text:[`The First of the Council signs the writs herself, four of them, in a small room behind the chamber, without looking at you. "Every Wardstone in the Reach," she says. "Go where you like. Do what you like. Nobody goes in again. You have my word, for what it's worth to you."`,
    `Corrin Sarne leaves the Council House by the front door, smiling, with his brother at his side.`,
    S.flags.kingSpoke ? `The King is carried back to his rooms by palace guard who now know what's in them. That, at least, the Council can't take back.` : `Nobody mentions the King.`],
    choices:[{label:'To the river gate', go:'a24_end'}]})},
  a24_end:{ view: () => {
    const f = S.flags;
    const txt = [`The plan, when you make it at dawn in ${f.base === 'gull' ? 'the Gull’s Rest' : 'the Pilgrims’ Hostel'}, is simple and impossible. The Keystone has to hold, and it can't hold the way it is. Two things are missing: the shards House Sarne carried off over the years, which belong in the stone, and the rest of what the founders wrote, which the Arcanum has kept locked away since the Sundering, with the healing the Lantern Order lost. There are four of you.`,
      `Kael and Wren go south, to Varrow and House Sarne's own country, after the shards, with Brannoc and Tobin. Ilsa and Tamsin go west, to the Spire Coast and the Arcanum, after the founders' words and the lost cure, with Hask and Bracken.`,
      f.boatReady ? `Tobin's fishing boat is waiting at the river gate, as promised, for the two going south.` : `There's a fishing boat at the river gate that'll take two and a dog, for a price.`,
      `On the quay, before the boat goes, Wren kneels and puts her hand in the river and says, quietly, "Faelan." The water takes it downstream, toward the sea.`,
      `"When we come back," says Ilsa, "we'll tell the Keystone his name."`];
    return {title:'The River Gate', text:txt, choices:[{label:'End of Act 2', act: () => {
      setQ('council', 'done', f.council === 'broken' ? 'The four broke the Council of Corvane. The city knows everything.' : 'The four bargained with the Council of Corvane for writs to every Wardstone.');
      quest('split', 'Two Roads', 'Kael and Wren go south after House Sarne’s shards. Ilsa and Tamsin go west to the Arcanum, for the founders’ full text and the lost cure. Then back to Corvane, before the Keystone breaks.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  a24_city:{
    title:'Corvane, Eight Days Out',
    blurb: () => `The city, waiting for the Council to sit.`,
    w:340, h:260,
    nodes:[
      {id:'a24_base', label:'Your base', x:50, y:210, sub:'Rest and the companions'},
      {id:'a24_orme', label:'Palace Guardroom', x:90, y:60, sub:'Captain Orme', done: () => S.flags.ormeTestify},
      {id:'a24_court', label:'Envoys’ Court', x:200, y:200, sub:'Envoy Marrow'},
      {id:'a24_house', label:'The Council House', x:280, y:70, sub:'Council night'}
    ],
    edges:[['a24_base','a24_orme'],['a24_base','a24_court'],['a24_orme','a24_house'],['a24_court','a24_house']]
  },
  a24_below:{
    title:'Below the Council House',
    blurb: () => `The Binder's stair, going down to the Keystone.`,
    w:340, h:260,
    nodes:[
      {id:'a24_cell', label:'Guard-Post', x:60, y:200, sub:'Rest'},
      {id:'a24_king', label:'A Sealed Door', x:120, y:60, sub:'Behind the Council seal', done: () => S.flags.kingDone},
      {id:'a24_binder', label:'The Binding Hall', x:280, y:150, sub:'The Lord Binder', done: () => S.flags.a24Boss}
    ],
    edges:[['a24_cell','a24_king'],['a24_cell','a24_binder'],['a24_king','a24_binder']]
  }
});

Object.assign(ENEMIES, {
  // Party enemies, tuned for a level 15 party (parties reach A2·4 at about 13–17). The two-hero fights are their own size.
  councilguard:{name:'Council Guard', hp:340, dmg:[40,46], acc:76, dodge:4, armor:3, init:5, xp:60, calm:true},
  councilbow:{name:'Council Crossbowman', hp:200, dmg:[32,36], acc:76, dodge:6, armor:1, init:6, xp:60, ranged:true, row:'back'},
  crownsoldier:{name:'Crown Soldier', hp:260, dmg:[34,40], acc:76, dodge:4, armor:3, init:5, xp:60},
  arcleash:{name:'The Leash, Remade', hp:340, dmg:[40,46], acc:74, dodge:2, armor:2, init:4, xp:90, hollow:true},
  arcseeker:{name:'Arcanum Hunter', hp:200, dmg:[32,38], acc:78, dodge:8, armor:1, init:7, xp:60, ranged:true, row:'back'},
  housecarl:{name:'Sarne Housecarl', hp:260, dmg:[34,40], acc:74, dodge:4, armor:3, init:4, xp:60},
  quellknife:{name:'Quell’s Knife', hp:200, dmg:[32,38], acc:80, dodge:12, armor:1, init:9, xp:60, bleed:30},
  gallerybow:{name:'Gallery Crossbowman', hp:140, dmg:[28,32], acc:74, dodge:6, armor:0, init:6, xp:40, ranged:true, row:'back'},
  rootpick:{name:'Ashen Hand Digger', hp:240, dmg:[34,40], acc:72, dodge:4, armor:1, init:4, xp:45},
  rootcantor:{name:'Ashen Hand Cantor', hp:220, dmg:[32,36], acc:74, dodge:6, armor:0, init:5, xp:55, ranged:true, row:'back', greyChance:25,
    spec:{every:3, name:'Root-Song', windup:'{n} sings, and the black stone under you shivers.', mult:1.5, aoe:true, grey:2}},
  chainwarden:{name:'Warden of the Chain', hp:360, dmg:[40,46], acc:78, dodge:4, armor:3, init:6, xp:80,
    spec:{every:3, name:'Binding Chain', windup:'{n} swings his chain, measuring one of you for the stone.', mult:1.4, stun:true}},
  binder:{name:'The Lord Binder', hp:1000, dmg:[50,58], acc:78, dodge:6, armor:3, init:5, xp:500, ranged:true, row:'back',
    spec:{every:2, name:'The Seal', windup:'{n} raises his chain, and the Keystone’s light bends toward him.', mult:1.9, aoe:true}}
});
const a24Allies = b => b === 'marrow' ? ['crownsoldier', 'crownsoldier'] : b === 'hale' ? ['arcleash', 'arcseeker'] : b === 'dario' ? ['housecarl', 'housecarl'] : ['quellknife', 'quellknife'];
Object.assign(COMBATS, {
  // All four, in the Council House (they burned the Vaults)
  a24_hall:{title:'The Council House', level:15, lethal:true, win:'a24_hallWin', back:'a24_hallFight',
    enemies:() => ['councilguard', 'councilguard', 'councilbow'].concat(a24Allies(S.flags.betrayer).slice(0, caseStrong() ? 1 : 2)),
    intro:'Council guards come over the table.'},
  // Split: Ilsa and Tamsin in the chamber, Kael and Wren at the root (two-hero fights, tuned a level higher so they don't spike)
  a24_chamber:{title:'The Council House', level:16, lethal:true, win:'a24_chamberWin', back:'a24_chamberFight', members: () => ['ilsa', 'tamsin'],
    enemies:() => caseStrong() ? ['councilguard', 'councilbow'] : ['councilguard', 'councilbow', 'gallerybow'],
    intro:'Council guards come over the table at Ilsa and Tamsin.'},
  a24_root:{title:'The Seventh Pillar’s Root', level:16, lethal:true, win:'a24_rootWin', back:'a24_rootStart', members: () => ['kael', 'wren'],
    enemies:() => [S.flags.betrayer === 'quell' ? 'quellknife' : 'rootpick', 'rootpick', 'rootcantor'], // Quell sold the trap: one of her knives is waiting
    intro:'The Ashen Hand comes down to the root with picks.'},
  a24_boss:{title:'The Lord Binder', level:15, lethal:true, win:'a24_bossWin', back:'a24_binder',
    enemies:() => {
      const f = S.flags, e = ['chainwarden'];
      if (!f.kingSpoke) e.push('chainwarden');                             // the King's word: a warden puts down his chain
      return e.concat(a24Allies(f.betrayer).slice(0, caseStrong() ? 1 : 2), ['binder']); // a strong case: fewer of the betrayer's people stand with him
    },
    intro:'The Lord Binder lets out his chain.'}
});

const _a23Echoes = HEROES.party.echoes;
HEROES.party.echoes = () => {
  const f = S.flags, e = _a23Echoes();
  if (f.caseScore != null) e.push(caseStrong() ? 'The four’s case turned the Council House against Corrin Sarne.' : 'The four’s case before the Council was laughed down.');
  if (f.betrayer) e.push(`${BETRAYER_NAME[f.betrayer]} betrayed the four before the Council.`);
  if (f.kingSpoke) e.push(`Tamsin drew the grey back from the King, who had been hidden for a year. He says no one else goes in a stone.${f.lanternThrice ? ' It cost her a third time.' : ''}`);
  else if (f.kingDone) e.push('The four found the King, grey and hidden under the Council House, and left him.');
  if (f.council === 'broken') e.push('The four broke the Council of Corvane. The city knows everything; half of it calls them heroes and half wants them hanged.');
  if (f.council === 'bargain') e.push('The four hold writs to every Wardstone in the Reach under the Council’s seal. The Council keeps its secret, and Corrin Sarne walked free.');
  if (f.a24Boss) e.push('Kael and Wren have gone south after House Sarne’s shards; Ilsa and Tamsin west to the Arcanum, for the founders’ full text and the lost cure.');
  return e;
};

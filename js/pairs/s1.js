// ================= ACT 3, SOUTH 1: THE SANDS OF VARROW =================
// Kael and Wren (with Brannoc and Tobin) go back to Varrow, where Kael's story began, after the shard stock House
// Sarne keeps under the Grand Arena. Tamsin's second lantern rides with them (`lantern`, 3 to start; it shields them
// from the shards' grey and has to last to the finale). Varrow map: Brannoc's old infirmary (rest), the Sand Gate
// (the Council echo: a writ and Captain Rane, or Sarne loyalists under Steward Crell; the Iron Tally by Kael's
// `captain`), the Sarne counting house (the ledger), Fight-master Oszin. Under the Sands map: the Deep Cells (rest),
// the grey tunnels (spend the lantern or take the grey), the old stone and Sarne's cache: Garran Holt, the Bull of
// Varrow, Steward Crell and a Shard-Bound. Linked choice: s1Ledger = 'west' (Tobin carries the ledger to Ilsa and
// Tamsin, and misses S2's first half) or 'kept' (leverage against Sarne in S2). Scene IDs use the prefix a3s1_.
// South flags: lantern, gateHow, tallyHelp, ledger, oszinTold, tunnelHow, shardsVarrow, s1Boss, s1Ledger.
HEROES.south.chapters[1] = {title:'The Sands of Varrow', start:'a3s1_intro'};

const s1Corrin = () => partyF().council === 'bargain'; // the bargain held: Corrin is home, and untouchable
const lanternNote = () => { const n = S.flags.lantern; return n >= 3 ? 'The lantern burns steady.' : n === 2 ? 'The lantern burns a little lower than it did.' : n === 1 ? 'The lantern is down to a blue bead of flame.' : 'The lantern is out.'; };

Object.assign(SCENES, {
  a3s1_intro:{
    enter(){ if (S.flags.lantern == null) S.flags.lantern = 3; quest('s1', 'The Sands of Varrow', 'Find the shards House Sarne keeps in Varrow, and bring them back for the Keystone.'); },
    view: () => {
      const p = partyF(), k = kf();
      const t = [`Varrow comes up out of the heat-haze at the end of the third day on the river: red walls, red dust, and in the middle of it all the Grand Arena, like a cracked bowl someone set down on the city.`,
        `Kael hasn't seen it since the night he ran from it with a sword he didn't use and a murder he didn't do.`,
        `Wren carries the lantern Tamsin lit for her in Corvane, hooded, on a strap across her chest. Its flame doesn't flicker in the wind off the water. "It's warm," she says, to nobody. "Like holding a hand."`];
      t.push(p.council === 'bargain' ? `In Kael's coat is a writ under the Council's seal. In Varrow, Tobin says, House Sarne is the Council. "Lord Corrin came home a week ago. Rode in through the Sand Gate like a king."` : `In Varrow, the news from Corvane got here first. Half the city thinks the four of you are heroes. The half that takes Sarne coin has put up posters.`);
      if (k.dario === 'killed') t.push(`On the dock there's a stone for Dario Sarne, with fresh flowers on it. Kael looks at it for a long time.`);
      return {title:'Varrow', text:t, choices:[{label:'Into the city', act: () => toMap('a3s1_city')}]};
    }
  },
  a3s1_infirmary:{ view: () => {
    const f = S.flags;
    const t = [`Brannoc's old infirmary is behind the fighters' barracks, and it's somebody else's now: a girl of nineteen with a burn scar and very steady hands, who takes one look at Brannoc and bursts into tears. "They said you were dead."`,
      `She lets you sleep in the back, among the clean bandages, and doesn't tell anyone you're there.`];
    if (!f.branHome){ t.push(`Brannoc goes round the room touching things, a jar, a splint, a chair. "Thirty years," he says. "Thirty years putting boys back together so they could go out and get broken again." He doesn't sound sorry.`); }
    return {title:'The Infirmary', text:t, choices:[
      partyRest('You sleep among the clean bandages. Everyone’s health and spell points are restored.'),
      !f.branHome ? {label:'Let Brannoc show the girl what he knows about shard-grey.', act: () => { f.branHome = true; S.items.draught += 2; S.notice = 'She gives you 2 Healing Draughts in return.'; render(); }} : null,
      back()
    ].filter(Boolean)};
  }},
  a3s1_gate:{ view: () => {
    const f = S.flags, k = kf();
    if (f.gateHow) return {title:'The Sand Gate', text:[f.gateHow === 'writ' ? `Captain Rane's Watch hold the Sand Gate. They nod you through.` : `The Sand Gate is yours now, for what that's worth.`], choices:[back()]};
    const t = [`The Sand Gate is the fighters' way into the Grand Arena: an iron portcullis, a tunnel, and at the end of it, light and sand.`];
    const ch = [];
    if (s1Corrin()){
      t.push(`Captain Hollis Rane of the Varrow Watch reads the Council's writ twice, slowly, with her lips moving. "Every Wardstone in the Reach," she says. "And there's one under the sand. Lord Corrin won't like it." She looks up at the arena's high box, where a figure in black and silver is watching the gate. "Lord Corrin can take it up with the Council."`,
        `Corrin Sarne lifts a hand to Kael from the box, the way you'd wave to an old friend. There's nothing Kael can do about him. The writ cuts both ways.`);
      ch.push({label:'Go through on the writ.', act: () => { f.gateHow = 'writ'; S.notice = xpNoteParty(80); chron('In Varrow, the Watch honoured the Council’s writ and opened the Sand Gate. Corrin Sarne watched from the high box.'); go('a3s1_gate'); }});
    } else {
      t.push(`It's held by Sarne loyalists in green, a dozen of them, under a soft-handed man with a ledger on a chain: Steward Mattias Crell, Corrin's man in Varrow while Corrin sits in a cell in Corvane.`,
        `But the fighters lounging in the shade by the gate are watching Kael, not Crell. Some of them knew him. All of them know the name.`);
      ch.push(Object.assign({label:'Kael walks into the shade and talks to the fighters.', act: () => { f.gateHow = 'fighters'; S.notice = xpNoteParty(80); chron('In Varrow, the arena’s fighters remembered Kael Dunmore, and turned the Sand Gate over to him.'); go('a3s1_fighters'); }}, chkBy('kael', 'leadership', 2)));
      ch.push({label:'Take the gate.', act: () => startCombat('a3s1_gate')});
    }
    if (k.captain && !f.gateHow){
      t.push(k.captain === 'freed' ? `And by the gate-house, in a Sarne surcoat that doesn't fit her, Captain Odile Brask of the Iron Tally, who owes Kael a boat. She catches his eye and very slightly shakes her head: <em>not here</em>.` : `And by the gate-house, in Sarne surcoats, the Iron Tally Company, hired by the day. Brask isn't with them. She's in a Crown cell, because of Kael, and they know it.`,
        echo('kael', k.captain === 'freed' ? 'Kael let Captain Brask of the Iron Tally go free at Hollin’s Ford.' : 'Kael handed Captain Brask of the Iron Tally to the Crown at Hollin’s Ford.'));
      if (k.captain === 'freed') f.tallyHelp = true;
    }
    ch.push(back());
    return {title:'The Sand Gate', text:t, choices:ch};
  }},
  a3s1_fighters:{ view: () => ({title:'The Sand Gate', text:[`"The Dunmore," says an old fighter with one ear, and spits in the sand. "They said you poisoned the Sarne boy. Nobody believed it who'd ever seen you fight." He looks at Crell's men, and then at his own. "Steward. I think you'd best go and count something."`, `Crell goes, white-faced, with his ledger clutched to his chest. The gate is Kael's.`], choices:[back()]})},
  a3s1_gateWin:{ enter(){ if (S.flags.gateHow) return; S.flags.gateHow = 'force'; chron('In Varrow, Kael and Wren took the Sand Gate from Sarne’s loyalists by force.'); }, view: () => ({title:'The Sand Gate', text:[`The loyalists scatter into the city. Steward Crell is gone, ledger and all, toward the counting house. The fighters in the shade watch you with new interest.`], choices:[back()]})},
  a3s1_counting:{ view: () => {
    const f = S.flags, w = wf();
    if (f.ledger) return {title:'The Counting House', text:[`The Sarne counting house has been turned upside down, mostly by you.`], choices:[back()]};
    const t = [`House Sarne's counting house in Varrow is a narrow tower of red stone with barred windows, where every crown and every crate the House ever moved was written down. Every crate. Including the ones that glowed.`];
    if (w.lootRead) t.push(`Wren remembers the burned Sarne camp in the Thornwood, and the second key the Sarne men took from it. If there's a record of where that key went, it's in here.`, echo('wren', 'In the Thornwood, Wren found that House Sarne took a second key from the enclaves.'));
    return {title:'The Counting House', text:t, choices:[
      Object.assign({label:'Wren picks the strong-room lock while Tobin talks to the porter about boats.', act: () => { f.ledger = 'quiet'; S.notice = xpNoteParty(100); go('a3s1_ledger'); }}, chkBy('wren', 'lockpick', 2)),
      Object.assign({label:'Walk in like Crown auditors and ask for the books.', act: () => { f.ledger = 'bluff'; S.notice = xpNoteParty(100); go('a3s1_ledger'); }}, chk('leadership', 2)),
      {label:'Go in hard.', act: () => startCombat('a3s1_counting')},
      back()
    ]};
  }},
  a3s1_countWin:{ enter(){ if (!S.flags.ledger){ S.flags.ledger = 'force'; S.gold += 60; } }, view: () => ({title:'The Counting House', text:[`The clerks are under their desks. The strong-room is open. There are 60 crowns in a cash box, which you take, and a ledger bound in green leather, which you take more carefully.`], choices:[{label:'Read it', go:'a3s1_ledger'}]})},
  a3s1_ledger:{ enter(){ chron('In Varrow’s counting house, Kael and Wren took House Sarne’s ledger of the shard trade.'); }, view: () => ({title:'The Sarne Ledger', text:[
    `It's all here, in a clerk's tidy hand, twenty years of it. Shards dug out from under the arena, crated, sold. Sold to Steward Voss, who sold them on. Sold to the Ashen Hand, at a loss, on Corrin's personal order.`,
    `And sold, every quarter for twenty years, at the highest price in the book, to a buyer listed only as <em>the Spire</em>.`,
    `"The Arcanum," says Kael. "Ilsa's Arcanum. They've been buying the grey."`,
    `The last page is this month's. <em>Remaining stock: held at the old stone, under the Sands. Two hundred and twelve pieces.</em>`
  ], choices:[back()]})},
  a3s1_oszin:{ view: () => {
    const f = S.flags;
    if (f.oszinTold) return {title:'The Fight-master’s Office', text:[`Oszin has gone back to his books. He doesn't look up.`], choices:[back()]};
    return {title:'The Fight-master’s Office', text:[`Fight-master Oszin is older and smaller than Kael remembers. He's at the same desk where Steward Voss once sat with his fingers steepled and offered Kael a deal, and when he sees who's in the doorway he goes the colour of old paper.`,
      `"I knew," he says, before anyone asks. "Not all of it. I knew the Sarnes were digging under my sand. I knew the boy wasn't poisoned by you. I said nothing, because I like being alive." He opens a drawer and takes out a map, very old, of the tunnels under the arena. "There. That's the only brave thing I've ever done. Don't make me do another."`],
      choices:[{label:'Take the map.', act: () => { f.oszinTold = true; S.notice = xpNoteParty(60); chron('Fight-master Oszin gave Kael a map of the tunnels under the Grand Arena, and an apology twenty years late.'); go('a3s1_oszin'); }}, back()]};
  }},
  a3s1_down:{ view: () => ({title:'The Sands', text:[`The arena floor at night is a great dim bowl of sand with the stars over it. In the middle, where the fighters' blood soaks in, there's a trapdoor Kael knows very well.`, lanternNote()], choices:[{label:'Down under the Sands', act: () => toMap('a3s1_under')}, back()]})},

  // --- Under the Sands ---
  a3s1_cells:{ view: () => ({title:'The Deep Cells', text:[`The deep cells where Kael waited to be hanged. The door of his is still off its hinges. Tobin looks at the scratches on the wall, the days counted, and doesn't say anything.`], choices:[partyRest('You rest in the deep cells, which is a strange thing to do. Everyone’s health and spell points are restored.'), back()].filter(Boolean)})},
  a3s1_tunnels:{ view: () => {
    const f = S.flags;
    if (f.tunnelHow) return {title:'The Grey Tunnels', text:[`The tunnels toward the old stone are grey to the ceiling now. ${lanternNote()}`], choices:[back()]};
    const t = [`Below the cells, the tunnels Kael ran through on the night he escaped have gone grey: walls, floor, the water in the channels. The air tastes of ash. Two hundred and twelve shards will do that to a place.`];
    if (f.oszinTold) t.push(`Oszin's map shows a dry way round, through the old drains. It's longer.`);
    t.push(lanternNote());
    const ch = [];
    if (S.flags.lantern > 0) ch.push({label:'Unhood the lantern and walk through in its light.', act: () => { f.tunnelHow = 'lantern'; f.lantern--; chron('Under the Sands, Wren unhooded Tamsin’s lantern to walk the grey tunnels. It burns lower.'); go('a3s1_lit'); }});
    if (f.oszinTold) ch.push({label:'Go the long way round, by Oszin’s map.', act: () => { f.tunnelHow = 'map'; S.notice = xpNoteParty(60); go('a3s1_tunnelsMap'); }});
    ch.push({label:'Push straight through the grey, and keep the lantern hooded.', act: () => { f.tunnelHow = 'grey'; startCombat('a3s1_tunnels'); }});
    ch.push(back());
    return {title:'The Grey Tunnels', text:t, choices:ch};
  }},
  a3s1_lit:{ view: () => ({title:'The Grey Tunnels', text:[`In the lantern's light, the grey draws back off the walls like a tide going out, and the things moving in it draw back with it. Nobody touches you. Wren hoods it again on the far side, and it's lower than it was.`], choices:[back()]})},
  a3s1_tunnelsMap:{ view: () => ({title:'The Old Drains', text:[`Oszin's way is dry, cramped and very long, and it comes out exactly where he said it would, behind the old stone. Kael says something about Oszin that isn't quite thanks.`], choices:[back()]})},
  a3s1_tunnelsWin:{ view: () => ({title:'The Grey Tunnels', text:[`Grey things come apart into grey dust. You come out the far side coughing, with ash in your hair.`], choices:[back()]})},
  a3s1_stone:{ view: () => {
    const f = S.flags, p = partyF();
    const t = [`At the bottom of everything, in the round cave where Kael fought the Grey Warden on the night he escaped, the old Varrow stone stands cracked from crown to foot. Around it, stacked in crates like a merchant's warehouse, are two hundred and twelve shards of it, glowing grey through the slats.`,
      `And between you and them: Steward Crell with his ledger-chain, three Sarne guards, something huge and grey that used to be a man and now has shards growing out of its shoulders, and a fighter Kael knows.`,
      `Garran Holt, the Bull of Varrow. He was the arena's second-best fighter for six years, when Kael was the best. He's the best now.`,
      `"They said you'd come back," Holt says, rolling his neck. "I hoped they were right."`];
    if (f.tallyHelp) t.push(`Behind you in the tunnel, boots: Brask and four of the Iron Tally, in Sarne surcoats with the badges torn off. "We owed you a boat," she says. "Will this do?"`);
    if (p.betrayer === 'dario') t.push(`At the back of the cave, Dario Sarne, very pale, not armed. He's here to watch. He can't look at Kael.`);
    t.push(lanternNote());
    t.push(`<em>A hard fight. Holt charges whoever he can reach and knocks them flat; Crell throws shard-dust over everyone.</em>`);
    return {title:'The Old Stone', text:t, choices:[{label:'Fight', act: () => startCombat('a3s1_boss')}, {label:'Fall back and prepare', act: () => toMap('a3s1_under')}]};
  }},
  a3s1_bossWin:{ enter(){ if (S.flags.s1Boss) return; S.flags.s1Boss = true; }, view: () => {
    const f = S.flags, p = partyF();
    const t = [`Holt goes down hard, and laughs, flat on his back in the grey sand. "Still," he says. "Still the best." Crell is on his knees with his hands up and his ledger-chain round his own neck. The grey thing is grey dust.`];
    if (p.betrayer === 'dario') t.push(`Dario Sarne is still at the back of the cave. "I'm sorry," he says to Kael. "I'm sorry. He's my brother." He doesn't run. Kael lets him walk out.`);
    t.push(`That leaves the shards.`);
    return {title:'The Old Stone', text:t, choices:[{label:'The shards', go:'a3s1_shards'}]};
  }},
  a3s1_shards:{ view: () => {
    const f = S.flags;
    const t = [`Two hundred and twelve shards of the Varrow stone, which belong back in it, or in the Keystone, or anywhere but here. Close to, the crates hum and the grey crawls out of them across the sand toward your boots.`];
    const ch = [];
    if (f.lantern > 0) ch.push({label:'Set the lantern on the crates while you load them.', act: () => { f.lantern--; f.shardsVarrow = 'lantern'; chron('Under the Sands, Kael and Wren loaded House Sarne’s two hundred and twelve shards in the light of Tamsin’s lantern.'); go('a3s1_loaded'); }});
    ch.push(Object.assign({label:'Kael lays his scarred hand on each crate and quiets it, one by one.', act: () => { f.shardsVarrow = 'ward'; asHeroState('kael', () => { S.pc.hp = Math.max(1, S.pc.hp - Math.ceil(pcMax() * 0.25)); }); chron('Under the Sands, Kael quieted House Sarne’s shards with his own hand, crate by crate. It cost him.'); go('a3s1_loaded'); }}, chkBy('kael', 'wardlore', 1)));
    ch.push({label:'Load them as they are, and let the grey take what it takes.', act: () => { f.shardsVarrow = 'grey'; chron('Under the Sands, Kael and Wren loaded House Sarne’s shards bare-handed, and the grey bit them for it.'); go('a3s1_loaded'); }});
    t.push(lanternNote());
    return {title:'The Old Stone', text:t, choices:ch};
  }},
  a3s1_loaded:{ view: () => {
    const f = S.flags;
    const t = [f.shardsVarrow === 'lantern' ? `In the lantern's light the crates go quiet, like animals settling. It takes the night to load them. When Wren hoods the lantern again, it's lower than it was.` : f.shardsVarrow === 'ward' ? `Kael goes from crate to crate with his hand flat on the slats, and each one goes still under it, and each one leaves him a little greyer and a little slower. Wren doesn't let him do the last ten. She does them, badly, with Tobin's help.` : `You load them as they are. By the end everyone's hands are grey to the wrist, and Brannoc is quietly furious, and nobody sleeps much.`,
      `Then there's the ledger, with <em>the Spire</em> on every page.`,
      `"Ilsa needs to see this," says Wren. "Before she walks into the Arcanum. They've been buying the grey for twenty years, and she doesn't know it."`,
      `"And Corrin needs to see it," says Kael, "${s1Corrin() ? 'sitting in his high box, thinking nothing can touch him.' : 'whoever\'s running his house while he\'s in a cell.'} We'll need everything we've got against Sarne, where we're going next."`,
      `Tobin, who has been very quiet: "I could take it west. I know the river roads. I'd be gone a while."`];
    return {title:'The Old Stone', text:t, choices:[
      {label:'Send Tobin west with the ledger, to Ilsa and Tamsin.', act: () => { f.s1Ledger = 'west'; chron('Kael and Wren sent Tobin west with House Sarne’s ledger, to warn Ilsa and Tamsin about the Arcanum.'); go('a3s1_end'); }},
      {label:'Keep it. You’ll need it against Sarne.', act: () => { f.s1Ledger = 'kept'; chron('Kael and Wren kept House Sarne’s ledger, to use against Sarne.'); go('a3s1_end'); }}
    ]};
  }},
  a3s1_end:{ view: () => {
    const f = S.flags;
    const t = [f.s1Ledger === 'west' ? `Tobin goes at dawn, on a salt barge headed downriver, with the ledger wrapped in oilcloth inside his shirt. "Don't do anything brave till I'm back," he tells Wren. She says she won't. They both know she will.` : `The ledger goes into the bottom of Kael's pack, under his spare shirt, where he can feel the corner of it against his back.`,
      `The shards go onto a Sarne barge you have, after a short conversation with its crew, borrowed. Two hundred and twelve of them, with ${f.shardsVarrow === 'lantern' ? 'a hooded lantern burning on top' : 'a tarpaulin over them and a lot of hoping'}.`,
      `Kael stands on the sand of the Grand Arena one last time, at dawn, with nobody in the seats. Then he goes.`];
    t.push(lanternNote());
    return {title:'Varrow, at Dawn', text:t, choices:[{label:'End of chapter', act: () => {
      setQ('s1', 'done', `Kael and Wren took House Sarne’s shard stock from under the Grand Arena of Varrow.`);
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  a3s1_city:{
    title:'Varrow',
    blurb: () => `Red walls, red dust, and the Grand Arena in the middle of it all.`,
    w:340, h:260,
    nodes:[
      {id:'a3s1_infirmary', label:'The Infirmary', x:50, y:210, sub:'Rest'},
      {id:'a3s1_gate', label:'The Sand Gate', x:170, y:60, sub:'Into the arena', done: () => S.flags.gateHow},
      {id:'a3s1_counting', label:'The Counting House', x:60, y:70, sub:'House Sarne’s books', done: () => S.flags.ledger},
      {id:'a3s1_oszin', label:'The Fight-master', x:180, y:200, sub:'Oszin’s office', done: () => S.flags.oszinTold},
      {id:'a3s1_down', label:'The Sands', x:290, y:130, sub:'Down under the arena', open: () => S.flags.gateHow && S.flags.ledger, lockText:'Open the gate and find the books first'}
    ],
    edges:[['a3s1_infirmary','a3s1_counting'],['a3s1_infirmary','a3s1_oszin'],['a3s1_counting','a3s1_gate'],['a3s1_oszin','a3s1_gate'],['a3s1_gate','a3s1_down'],['a3s1_oszin','a3s1_down']]
  },
  a3s1_under:{
    title:'Under the Sands',
    blurb: () => `The tunnels Kael escaped through, gone grey.`,
    w:340, h:260,
    nodes:[
      {id:'a3s1_cells', label:'The Deep Cells', x:50, y:200, sub:'Rest'},
      {id:'a3s1_tunnels', label:'The Grey Tunnels', x:150, y:70, sub:'Toward the old stone', done: () => S.flags.tunnelHow},
      {id:'a3s1_stone', label:'The Old Stone', x:290, y:150, sub:'Sarne’s cache', open: () => S.flags.tunnelHow, done: () => S.flags.s1Boss, lockText:'Get through the tunnels first'},
      {id:'a3s1_upSands', label:'Up to the Sands', x:160, y:220, sub:'Back to the city'}
    ],
    edges:[['a3s1_cells','a3s1_tunnels'],['a3s1_tunnels','a3s1_stone'],['a3s1_cells','a3s1_upSands']]
  }
});
SCENES.a3s1_upSands = {view: () => ({title:'The Sands', text:[`The trapdoor up to the arena floor.`], choices:[{label:'Up to the city', act: () => toMap('a3s1_city')}, back()]})};

Object.assign(ENEMIES, {
  // Pair enemies: two heroes and their two companions, tuned for level 16
  sarneloyal:{name:'Sarne Loyalist', hp:340, dmg:[38,44], acc:74, dodge:4, armor:3, init:4, xp:55},
  tallymerc:{name:'Iron Tally Sellsword', hp:280, dmg:[36,42], acc:76, dodge:6, armor:2, init:5, xp:60},
  sarneclerk:{name:'Counting-House Guard', hp:320, dmg:[36,42], acc:74, dodge:4, armor:2, init:4, xp:50},
  sarneshot:{name:'Sarne Crossbowman', hp:180, dmg:[30,34], acc:76, dodge:6, armor:1, init:6, xp:50, ranged:true, row:'back'},
  tunnelgrey:{name:'Tunnel-Grey', hp:300, dmg:[36,42], acc:72, dodge:6, armor:0, init:5, xp:45, hollow:true, greyChance:30},
  shardhulk:{name:'Shard-Bound', hp:420, dmg:[44,52], acc:72, dodge:0, armor:3, init:3, xp:150, hollow:true, greyChance:20},
  holt:{name:'Garran Holt, the Bull of Varrow', hp:560, dmg:[42,48], acc:78, dodge:6, armor:3, init:6, xp:250,
    spec:{every:3, name:'Bull Rush', windup:'{n} lowers his head and paws the sand.', mult:1.8, stun:true}},
  crell:{name:'Steward Crell', hp:300, dmg:[30,36], acc:76, dodge:8, armor:1, init:6, xp:200, ranged:true, row:'back',
    spec:{every:2, name:'Shard-Dust', windup:'{n} tears open a sack, and grey dust lifts off the crates.', mult:1.3, aoe:true, grey:2}},
  // the grey followed them down the tunnels
  crellGrey:{name:'Steward Crell', hp:300, dmg:[30,36], acc:76, dodge:8, armor:1, init:6, xp:200, ranged:true, row:'back',
    spec:{every:2, name:'Shard-Dust', windup:'{n} tears open a sack, and the grey you dragged down the tunnels rises to meet the dust.', mult:1.6, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  a3s1_gate:{title:'The Sand Gate', level:16, lethal:true, win:'a3s1_gateWin', back:'a3s1_gate',
    enemies:() => ['sarneloyal', 'sarneloyal', 'sarneshot'].concat(kf().captain === 'handed' ? ['tallymerc'] : []),
    intro:'Crell’s loyalists close up in front of the portcullis.'},
  a3s1_counting:{title:'The Counting House', level:16, lethal:true, win:'a3s1_countWin', back:'a3s1_counting',
    enemies:() => ['sarneclerk', 'sarneclerk', 'sarneshot'], intro:'The counting-house guards come down the stairs.'},
  a3s1_tunnels:{title:'The Grey Tunnels', level:16, lethal:true, win:'a3s1_tunnelsWin', back:'a3s1_tunnels',
    enemies:() => ['tunnelgrey', 'tunnelgrey', 'tunnelgrey'], intro:'The grey on the walls gets up and walks.'},
  a3s1_boss:{title:'The Bull of Varrow', level:16, lethal:true, win:'a3s1_bossWin', back:'a3s1_stone',
    enemies:() => {
      const f = S.flags, e = ['holt', 'shardhulk'];
      if (!f.tallyHelp) e.push('sarneshot');                                     // the Iron Tally hold the tunnel mouth
      return e.concat([f.tunnelHow === 'grey' ? 'crellGrey' : 'crell']);         // the grey followed you down
    },
    intro:'Holt laughs, and comes across the sand.'}
});

HEROES.south.echoes = () => {
  const f = S.flags, e = [];
  if (f.gateHow) e.push(f.gateHow === 'writ' ? 'The Varrow Watch honoured the Council’s writ. Corrin Sarne is home, and untouchable.' : f.gateHow === 'fighters' ? 'The fighters of Varrow remembered Kael, and turned the Sand Gate over to him.' : 'Kael and Wren took Varrow’s Sand Gate by force.');
  if (f.tallyHelp) e.push('Captain Brask and the Iron Tally fought beside Kael under the Sands. The debt is paid.');
  if (f.ledger) e.push('House Sarne’s ledger: twenty years of shards sold, the best of them to a buyer called the Spire.');
  if (f.shardsVarrow) e.push(`House Sarne’s 212 shards are on a barge with Kael and Wren${f.shardsVarrow === 'ward' ? ', quieted by Kael’s own hand' : f.shardsVarrow === 'grey' ? ', and the grey bit everyone who carried them' : ''}.`);
  if (f.lantern != null) e.push(`Tamsin’s lantern: ${['out', 'a blue bead of flame', 'burning a little low', 'burning steady'][Math.max(0, Math.min(3, f.lantern))]}.`);
  if (f.s1Ledger === 'west') e.push('Tobin has gone west with the ledger, to Ilsa and Tamsin.');
  if (f.s1Ledger === 'kept') e.push('Kael carries the ledger, to use against Sarne.');
  return e;
};

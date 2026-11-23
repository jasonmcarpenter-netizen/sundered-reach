// ================= ACT 3, SOUTH 2: THE THIRD STONE =================
// Kael and Wren go into the Thornwood after the last of House Sarne's shards: with the second key it took from the
// Founder's Door, Sarne has been quarrying the Third Stone itself, Wren's own line's stone, under Ardh Lirien. Corrin
// Sarne has come to see it done (with the Council bargain he rode in under his writ; with the Council broken his
// housecarls broke him out of his cell). Thornwood map: Ardh Lirien (Ysolde by Wren's `metAunt` and `fragment`), the
// Trapper's Hut (Tobin comes back here if S1 sent him west; until then he's away, `awayAllies`), the Sarne Road
// (teamsters, and Morn's fled adepts if W1 exposed the Arcanum), the Arcanum envoy (W1 'deal': Hesper Vane knows the
// quarry's back way), the quarry gate. Quarry map: the old Warden shrine (rest), the cut face (the lantern, Wren's
// Wardlore, or the grey), the quarry floor: the Stonewight, Quarrymaster Brennick and Corrin. They recover the shards
// and the founder's lamp Sarne stole with the key. Linked choice: s2Lamp = 'west' (sent to Tamsin for the cure, W2) or
// 'kept' (relights Tamsin's lantern for the finale). Scene IDs use the prefix a3s2_. South flags: tobinBack, ysolde,
// envoyPath, roadDone, quarryHow, faceHow, heardLine, s2Boss, corrinTaken, s2Lamp.
HEROES.south.chapters[2] = {title:'The Third Stone', start:'a3s2_intro'};

const s2Lantern = () => { const n = S.flags.lantern; return n >= 3 ? 'The lantern burns steady.' : n === 2 ? 'The lantern burns a little lower than it did.' : n === 1 ? 'The lantern is down to a blue bead of flame.' : 'The lantern is out.'; };
const s2Exposed = () => pairF('west').w1Arcanum === 'exposed';
const s2Deal = () => pairF('west').w1Arcanum === 'deal';

Object.assign(SCENES, {
  a3s2_intro:{
    enter(){
      quest('s2', 'The Third Stone', 'Find the last of House Sarne’s shards, wherever Sarne took the second key.');
      if (S.flags.s1Ledger === 'west' && !S.flags.tobinBack) S.awayAllies = ['wren'];
    },
    view: () => {
      const f = S.flags, p = partyF();
      const t = [`The shard barge goes north up the river to Corvane with a Varrow crew on it, paid well and frightened, and Kael and Wren go east on foot, into the Thornwood.`,
        `It was in the counting house that Wren found it, on the last page but one of the ledger: a column headed <em>the Second Key</em>, and under it a place she knows. Ardh Lirien. The Founder's Door. Her father's line's door. And under it, in a fresh hand: <em>quarry opened. yield excellent.</em>`,
        `"They're not buying shards any more," Wren says. "They're cutting them. Out of our stone."`];
      t.push(p.council === 'bargain' ? `The talk on the river is that Corrin Sarne rode east three days ago under the Council's writ, to see the work for himself.` : `The talk on the river is that Corrin Sarne didn't stay in his cell in Corvane. Twenty housecarls with Sarne green under their cloaks took him out of it, and rode east.`);
      if (f.s1Ledger === 'west') t.push(`Tobin isn't here. He went west with the ledger. Wren keeps looking round for him anyway.`);
      t.push(s2Lantern());
      return {title:'The Thornwood', text:t, choices:[{label:'Into the Thornwood', act: () => toMap('a3s2_wood')}]};
    }
  },
  a3s2_enclave:{ view: () => {
    const f = S.flags, w = wf();
    const t = [];
    const ch = [];
    if (w.metAunt && w.fragment !== 'crown'){
      t.push(`Ysolde is waiting at the Lamp Gate as if she knew. She takes Wren's face in both hands and looks at her for a long time, and then at Kael. "You're the swordsman," she says. "She wrote about you. Not kindly." Wren goes red.`,
        `"They're under us," Ysolde says. "Under the Hall of Doors. We hear the picks at night. Our wardens tried, twice. The second time they didn't come back." She gives Wren a key on a cord: an old one, iron, the twin of the one Wren once sold. "The wardens' way. It comes out above the quarry."`,
        echo('wren', 'Wren found her aunt Ysolde in Ardh Lirien, and kept the Wardstone fragment for her line.'));
      if (!f.ysolde){ f.ysolde = 'key'; S.notice = xpNoteParty(80); chron('Ysolde gave Wren the wardens’ key to the way above Sarne’s quarry.'); }
    } else if (w.metAunt){
      t.push(`Ysolde's door in the Hall of Doors is shut. She speaks to Wren through it, which is something. "You gave our fragment to the Crown," she says. "And now you want our help." A long silence. "The picks are under the Hall. Find your own way down."`,
        echo('wren', 'Wren gave the Wardstone fragment to Envoy Marrow. Ysolde shut her door.'));
      if (!f.ysolde) f.ysolde = 'shut';
    } else {
      t.push(`The Lamp Gate of Ardh Lirien opens for Wren, because of her face, which is half of somebody's they remember. Nobody here knows her, quite. But at night you can hear it, from under the Hall of Doors: picks, and something that isn't picks.`);
      if (!f.ysolde) f.ysolde = 'none';
    }
    ch.push(partyRest('You sleep in Ardh Lirien, under the hanging lamps. Everyone’s health and spell points are restored.'), back());
    return {title:'Ardh Lirien', text:t, choices:ch.filter(Boolean)};
  }},
  a3s2_hut:{ view: () => {
    const f = S.flags, w = pairF('west');
    if (f.s1Ledger === 'west' && !f.tobinBack){
      return {title:'The Trapper’s Hut', text:[`The trapper's hut on the deer trail, where Wren first heard about Nell's crew. There's smoke from the chimney, and a young man on the step with his boots off and a bowl of the trapper's stew: Tobin Marsh, back from the west.`,
        w.w1Boss ? `"They got it," he says, before anyone asks. "The book. Ilsa read it. She went white, Wren. I've never seen her go white." ${w.w1Arcanum === 'deal' ? '"There\'s a new Archmagister, and he\'s sending somebody to find you."' : w.w1Arcanum === 'exposed' ? '"And she read it to the whole Arcanum, and half of them ran. South. Towards Sarne, they said."' : ''}` : `"The ledger's with Ilsa," he says. "She was going into the Arcanum when I left."`],
        choices:[{label:'Welcome him back.', act: () => { f.tobinBack = true; delete S.awayAllies; S.notice = 'Tobin is back. He’ll fight beside Wren again.'; chron('Tobin came back from the west to the Trapper’s Hut, with news of Ilsa and Tamsin.'); go('a3s2_hut'); }}, back()]};
    }
    return {title:'The Trapper’s Hut', text:[f.tobinBack ? `Tobin and the trapper are arguing about stew.` : `The trapper on the deer trail hasn't seen Sarne men in a month. "They go by the river now," he says. "Barges. Heavy going down, empty coming back."`], choices:[partyRest('You rest at the trapper’s hut. Everyone’s health and spell points are restored.'), back()].filter(Boolean)};
  }},
  a3s2_road:{ view: () => {
    const f = S.flags;
    if (f.roadDone) return {title:'The Sarne Road', text:[`The Sarne road is quiet. The carts are burned.`], choices:[back()]};
    const t = [`House Sarne has cut a road through the Thornwood: raw stumps, ruts deep enough to lose a boot in, and a cart-train coming down it with Sarne teamsters walking beside the oxen, crossbows on their backs.`];
    if (s2Exposed()) t.push(`Walking with them, in Arcanum grey with the badges torn off, are two of Morn's adepts. They came south quickly.`, echo('ilsa', 'Ilsa read the founders’ text to the whole Arcanum. Morn’s people fled south to House Sarne.'));
    return {title:'The Sarne Road', text:t, choices:[{label:'Stop the carts', act: () => startCombat('a3s2_road')}, back('Let them pass')]};
  }},
  a3s2_roadWin:{ enter(){ if (S.flags.roadDone) return; S.flags.roadDone = true; S.gold += 50; S.items.draught += 1; }, view: () => ({title:'The Sarne Road', text:[`The carts are full of shards, cut clean and new, still warm from the stone. On the lead teamster there's a purse of 50 crowns and a Healing Draught, and a pass in Corrin's own hand: <em>to the quarry gate. Let the bearer through.</em>`], choices:[back()]})},
  a3s2_envoy:{ view: () => {
    const f = S.flags;
    if (f.envoyPath) return {title:'The Envoy’s Fire', text:[`Hesper Vane's fire is cold. She's gone ahead to watch the quarry.`], choices:[back()]};
    return {title:'The Envoy’s Fire', text:[`At a small careful fire by the deer trail, a quiet woman in travelling grey is reading. She looks up as you come, and closes her book on one finger. "Kael Dunmore," she says. "I have a letter for you, from Archmagister Quill. And a map, which is more use."`,
      `The letter is short and the handwriting is terrible. The map is beautiful. "The Arcanum has watched House Sarne for twenty years," Hesper Vane says. "We know where they cut. There's an old drain from the quarry floor that comes out in a ravine a mile east. They don't guard it. They don't know it's there."`,
      echo('ilsa', 'Ilsa and Tamsin made Quill Archmagister, and he sent help south.')],
      choices:[{label:'Take the map.', act: () => { f.envoyPath = true; S.notice = xpNoteParty(80); chron('Hesper Vane, the Arcanum’s envoy, gave Kael and Wren a map of the drain under Sarne’s quarry.'); go('a3s2_envoy'); }}, back()]};
  }},
  a3s2_gate:{ enter(){ if (S.flags.s1Ledger === 'west' && !S.flags.tobinBack){ S.flags.tobinBack = true; delete S.awayAllies; S.notice = 'Tobin catches up with you at the quarry, out of breath, with news from the west.'; } }, view: () => {
    const f = S.flags;
    if (f.quarryHow) return {title:'The Quarry', text:[`The way down into the quarry is open.`], choices:[{label:'Down into the quarry', act: () => toMap('a3s2_quarry')}, back()]};
    const t = [`Under Ardh Lirien, where the Hall of Doors sits on the hill, House Sarne has cut a hole in the world: a pit, raw and pale, two hundred feet deep, with ramps spiralling down and lamps on poles, and at the bottom, glowing grey through the dust, the exposed flank of a Wardstone.`,
      `The Third Stone. Wren's line's stone. They've been cutting it like a quarry cuts marble.`,
      `The gate at the top of the ramps has a palisade and a dozen Sarne men.`];
    const ch = [];
    if (f.ysolde === 'key') ch.push({label:'Take the wardens’ way, with Ysolde’s key.', act: () => { f.quarryHow = 'wardens'; S.notice = xpNoteParty(60); go('a3s2_gate'); }});
    if (f.envoyPath) ch.push({label:'Go round to Hesper Vane’s drain.', act: () => { f.quarryHow = 'drain'; S.notice = xpNoteParty(60); go('a3s2_gate'); }});
    if (f.roadDone) ch.push({label:'Walk up to the gate with Corrin’s pass, as teamsters.', act: () => { f.quarryHow = 'pass'; S.notice = xpNoteParty(60); go('a3s2_gate'); }});
    ch.push(Object.assign({label:'Find a way down the cliff in the dark.', act: () => { f.quarryHow = 'climb'; S.notice = xpNoteParty(60); go('a3s2_gate'); }}, chk('survival', 2)));
    ch.push({label:'Take the gate.', act: () => startCombat('a3s2_gate')}, back());
    return {title:'The Quarry Gate', text:t, choices:ch};
  }},
  a3s2_gateWin:{ enter(){ if (!S.flags.quarryHow){ S.flags.quarryHow = 'force'; S.flags.quarryAlarm = true; } }, view: () => ({title:'The Quarry Gate', text:[`The gate is down. Horns are sounding all the way down the ramps. Whoever is at the bottom knows you're coming.`], choices:[{label:'Down into the quarry', act: () => toMap('a3s2_quarry')}]})},

  // --- The quarry ---
  a3s2_shrine:{ view: () => ({title:'The Old Shrine', text:[`Halfway down the ramps, cut into the rock, there's a tiny shrine older than the quarry: a niche, a worn carving of a branch inside a ring, a cold lamp. Sarne's men have been using it to store picks. Wren puts the picks outside, one by one, very carefully, and then sits down.`],
    choices:[partyRest('You rest in the old shrine. Everyone’s health and spell points are restored.'), back()].filter(Boolean)})},
  a3s2_face:{ view: () => {
    const f = S.flags;
    if (f.faceHow) return {title:'The Cut Face', text:[f.heardLine ? `The cut face of the Third Stone hums, low and steady, as if it's listening.` : `The cut face of the Third Stone bleeds grey into the dust.`], choices:[back()]};
    const t = [`Where the ramps reach the bottom, the Third Stone's flank is laid bare: a wall of silver-veined black stone, cut in great raw steps, bleeding grey into the air like smoke from a wound. Nobody could cross the quarry floor through that without paying for it.`, s2Lantern()];
    const ch = [];
    if (f.lantern > 0) ch.push({label:'Unhood the lantern, and cross in its light.', act: () => { f.lantern--; f.faceHow = 'lantern'; chron('In Sarne’s quarry, Wren crossed the bleeding face of the Third Stone in the light of Tamsin’s lantern.'); go('a3s2_crossed'); }});
    ch.push(Object.assign({label:'Wren puts her hand on the stone. It’s her line’s.', act: () => { f.faceHow = 'line'; f.heardLine = true; S.notice = xpNoteParty(100); chron('Wren laid her hand on the Third Stone, her own line’s stone, and something in it knew her.'); go('a3s2_line'); }}, chkBy('wren', 'wardlore', 1)));
    ch.push({label:'Cross as you are, and fight whatever the grey sends.', act: () => { f.faceHow = 'grey'; startCombat('a3s2_face'); }});
    ch.push(back());
    return {title:'The Cut Face', text:t, choices:ch};
  }},
  a3s2_crossed:{ view: () => ({title:'The Cut Face', text:[`In the lantern's light the grey settles back into the stone like dust after a door slams. Wren hoods it on the far side. It's lower.`], choices:[back()]})},
  a3s2_line:{ view: () => ({title:'The Cut Face', text:[`The stone is warm. Under Wren's hand it hums, and under the hum, very far in, someone is holding it up, the way Faelan held the Keystone. Someone old. A woman, Wren thinks, though she couldn't say how she knows.`,
    `<em>Little one,</em> says nobody, in a voice like wind through the Thornwood. <em>Faelan's girl. They are cutting me. Make them stop.</em>`,
    `The grey on the cut face draws back from Wren's hand, and from the path in front of her, like a crowd stepping aside.`], choices:[back()]})},
  a3s2_faceWin:{ view: () => ({title:'The Cut Face', text:[`The grey things come apart against the stone. You cross the quarry floor coughing, with your eyes streaming.`], choices:[back()]})},
  a3s2_floor:{ view: () => {
    const f = S.flags, p = partyF();
    const t = [`At the very bottom of the pit, a work-camp: tents, a cook-fire, crates of cut shards stacked like bricks, and the great raw wound in the Third Stone where the picks have been at it for a year.`,
      `Quarrymaster Brennick Holloway, a slab of a man with a pick over his shoulder, stands in front of the crates. Behind him, something has come out of the wound in the stone: a shape of grey rock and silver veins, as tall as a barn door, that moves like a man who's forgotten how. The Stonewight. It's what happens when you cut a Wardstone, Wren thinks. It bleeds, and the blood gets up.`,
      `And on a camp chair under an awning, in black and silver, with a cup of wine, Lord Corrin Sarne.`,
      `"Dunmore," he says pleasantly. "I did wonder. Do you know what this stone is worth, cut? More than the Crown. More than the Council. When the Keystone falls, and it will, everyone in the Reach will want a piece of a Wardstone to hold back the grey. I'll be the only man selling."`];
    if (f.s1Ledger === 'kept') t.push(`Kael takes the green ledger out of his pack and holds it up so the quarrymen at the crates can see it. "Twenty years," he says to them, not to Corrin. "Your wages are in here too. What he paid you. What he wrote down he paid you." Some of the quarrymen look at each other, and put down their picks.`);
    if (s2Exposed()) t.push(`At Corrin's throat, on a silver chain, there's a grey stone like Archmagister Morn's. Her people came south, and they brought gifts.`);
    if (f.quarryAlarm) t.push(`Every Sarne man in the quarry is down here, waiting. The horns gave them plenty of time.`);
    t.push(s2Lantern(), `<em>A hard fight. The Stonewight is slow and enormous; Corrin hangs back behind his men.</em>`);
    return {title:'The Quarry Floor', text:t, choices:[{label:'Fight', act: () => startCombat('a3s2_boss')}, {label:'Fall back and prepare', act: () => toMap('a3s2_quarry')}]};
  }},
  a3s2_bossWin:{ enter(){ if (S.flags.s2Boss) return; S.flags.s2Boss = true; S.flags.corrinTaken = true; chron('In the quarry under Ardh Lirien, Kael and Wren took Lord Corrin Sarne.'); }, view: () => {
    const f = S.flags;
    return {title:'The Quarry Floor', text:[
      `The Stonewight goes down in a slide of grey gravel, and doesn't get up. Brennick drops his pick. And Lord Corrin Sarne, for the first time in his life, has nowhere to go.`,
      `Kael puts his sword point an inch from Corrin's throat and holds it there a long time. Then he lowers it. "No," he says. "You're coming back to Corvane, in chains, so everyone can see you."`,
      `In Corrin's tent, in a velvet-lined case among his papers, Wren finds something that isn't a shard. A lamp: old, plain, bronze, with a branch-and-ring cut into its foot. The founder's lamp, from the Founder's Door, that Sarne took with the second key.`,
      `It's cold. But when Wren holds it next to Tamsin's lantern, the flame in Tamsin's lantern leans toward it, the way a plant leans toward a window.`],
      choices:[{label:'The lamp', go:'a3s2_lamp'}]};
  }},
  a3s2_lamp:{ view: () => {
    const f = S.flags, w = pairF('west');
    const t = [`"Two lanterns from one flame," says Wren slowly. "Tamsin said the rite starts with the first lantern. The founders' lantern." She turns it over. "This is it. This is what the Order lost."`,
      `"Then Tamsin needs it," says Kael. "Now. Wherever she's got to."`,
      `"Or we keep it," says Wren, "and light it from her lantern, and we'll never run out of light again. Not under the Keystone. Not when it counts." She looks at the lantern on her chest, burning low. "We're going to need light, down there."`,
      `Tobin, quietly: "${f.tobinBack || f.s1Ledger !== 'west' ? 'I could take it west. Again.' : 'Somebody could take it west.'}"`, s2Lantern()];
    return {title:'The Founder’s Lamp', text:t, choices:[
      {label:'Send the founder’s lamp west, to Tamsin.', act: () => { f.s2Lamp = 'west'; chron('Kael and Wren sent the founder’s lamp west to Tamsin, for the lost cure.'); go('a3s2_end'); }},
      {label:'Keep it, and light it from Tamsin’s lantern.', act: () => { f.s2Lamp = 'kept'; f.lantern = 3; chron('Wren lit the founder’s lamp from Tamsin’s lantern. Its light won’t run out.'); go('a3s2_end'); }}
    ]};
  }},
  a3s2_end:{ view: () => {
    const f = S.flags;
    const t = [f.s2Lamp === 'west' ? `Tobin goes west again, with the founder's lamp wrapped in his good shirt, and Wren watches him go until the trees take him. "He'll be fine," says Kael. "He's always fine." Wren doesn't answer.` : `Wren holds the founder's lamp to Tamsin's lantern, and the flame goes across like a spark jumping, and the old bronze lamp fills up with light that doesn't flicker, and Tamsin's lantern burns up steady and bright again beside it.`,
      `The last of the shards go into crates on the Sarne carts, with Corrin Sarne walking behind them in his own housecarls' chains.`,
      f.heardLine ? `Before they go, Wren goes back down to the cut face and puts her hand on it once more. <em>They've stopped,</em> she tells it. The hum, under her hand, sounds like somebody breathing out.` : `Before they go, the quarrymen fill the worst of the cuts with rubble. It's not much. It's something.`,
      `Then north. To Corvane. To the others.`, s2Lantern()];
    return {title:'Leaving the Thornwood', text:t, choices:[{label:'End of chapter', act: () => {
      setQ('s2', 'done', 'Kael and Wren took the last of House Sarne’s shards from the Third Stone, and Corrin Sarne with them.');
      S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  a3s2_wood:{
    title:'The Thornwood',
    blurb: () => `Old trees, deer trails, and a raw new road with Sarne ruts in it.`,
    w:340, h:260,
    nodes:[
      {id:'a3s2_hut', label:'The Trapper’s Hut', x:50, y:210, sub:'Rest', done: () => S.flags.s1Ledger === 'west' ? S.flags.tobinBack : false},
      {id:'a3s2_enclave', label:'Ardh Lirien', x:70, y:60, sub:'The Lamp Gate', done: () => S.flags.ysolde},
      {id:'a3s2_road', label:'The Sarne Road', x:180, y:200, sub:'Cart-trains', done: () => S.flags.roadDone},
      {id:'a3s2_envoy', label:'A Small Fire', x:190, y:60, sub:'Someone waiting', open: () => s2Deal(), done: () => S.flags.envoyPath, lockText:'Nobody there'},
      {id:'a3s2_gate', label:'The Quarry', x:295, y:130, sub:'Under the Hall of Doors', open: () => S.flags.ysolde, done: () => S.flags.quarryHow, lockText:'Go to Ardh Lirien first'}
    ],
    edges:[['a3s2_hut','a3s2_enclave'],['a3s2_hut','a3s2_road'],['a3s2_enclave','a3s2_envoy'],['a3s2_road','a3s2_gate'],['a3s2_envoy','a3s2_gate'],['a3s2_enclave','a3s2_gate']]
  },
  a3s2_quarry:{
    title:'Sarne’s Quarry',
    blurb: () => `A pit cut into the Third Stone, two hundred feet deep.`,
    w:340, h:260,
    nodes:[
      {id:'a3s2_shrine', label:'The Old Shrine', x:60, y:200, sub:'Rest'},
      {id:'a3s2_face', label:'The Cut Face', x:160, y:70, sub:'The stone, bleeding', done: () => S.flags.faceHow},
      {id:'a3s2_floor', label:'The Quarry Floor', x:290, y:150, sub:'Corrin Sarne', open: () => S.flags.faceHow, done: () => S.flags.s2Boss, lockText:'Cross the cut face first'},
      {id:'a3s2_out', label:'Up the Ramps', x:170, y:220, sub:'Back to the wood'}
    ],
    edges:[['a3s2_shrine','a3s2_face'],['a3s2_face','a3s2_floor'],['a3s2_shrine','a3s2_out']]
  }
});
SCENES.a3s2_out = {view: () => ({title:'The Ramps', text:[`The long ramps up out of the quarry.`], choices:[{label:'Up to the Thornwood', act: () => toMap('a3s2_wood')}, back()]})};

Object.assign(ENEMIES, {
  // Pair enemies: two heroes and their two companions (Wren alone until Tobin is back), tuned for level 17
  teamster:{name:'Sarne Teamster', hp:340, dmg:[38,44], acc:74, dodge:4, armor:2, init:4, xp:55},
  teamshot:{name:'Sarne Crossbowman', hp:240, dmg:[34,38], acc:76, dodge:6, armor:1, init:6, xp:55, ranged:true, row:'back'},
  fledadept:{name:'Fled Adept', hp:260, dmg:[34,38], acc:78, dodge:8, armor:0, init:6, xp:60, ranged:true, row:'back', greyChance:30},
  quarryguard:{name:'Quarry Guard', hp:360, dmg:[40,46], acc:74, dodge:4, armor:3, init:4, xp:60},
  stonebleed:{name:'Stone-Bleed', hp:320, dmg:[38,44], acc:72, dodge:2, armor:2, init:4, xp:50, hollow:true, greyChance:30},
  brennick:{name:'Quarrymaster Brennick', hp:480, dmg:[44,50], acc:76, dodge:4, armor:3, init:5, xp:150},
  stonewight:{name:'The Stonewight', hp:720, dmg:[52,60], acc:70, dodge:0, armor:4, init:2, xp:300, hollow:true,
    spec:{every:3, name:'Avalanche', windup:'{n} rears up, and the quarry wall above it groans.', mult:1.6, aoe:true}},
  corrin:{name:'Lord Corrin Sarne', hp:320, dmg:[32,38], acc:80, dodge:10, armor:2, init:7, xp:250, ranged:true, row:'back',
    spec:{every:3, name:'Marked for Death', windup:'{n} points at one of you with his cup, and his crossbowmen take aim.', mult:2.0}},
  // Kael's ledger turned the quarrymen; Brennick fights half-hearted
  brennickDoubt:{name:'Quarrymaster Brennick', hp:400, dmg:[38,44], acc:76, dodge:4, armor:3, init:5, xp:150},
  // the horns gave him time to set his crossbowmen; Morn's fled adepts gave him a grey stone like hers
  corrinAlarm:{name:'Lord Corrin Sarne', hp:320, dmg:[32,38], acc:80, dodge:10, armor:2, init:7, xp:250, ranged:true, row:'back',
    spec:{every:2, name:'Marked for Death', windup:'{n} points at one of you with his cup, and every crossbow on the ramps takes aim.', mult:1.7}},
  corrinGrey:{name:'Lord Corrin Sarne', hp:320, dmg:[32,38], acc:80, dodge:10, armor:2, init:7, xp:250, ranged:true, row:'back', greyChance:35,
    spec:{every:3, name:'Marked for Death', windup:'{n} touches the grey stone at his throat and points at one of you.', mult:2.0, grey:2}},
  corrinBoth:{name:'Lord Corrin Sarne', hp:320, dmg:[32,38], acc:80, dodge:10, armor:2, init:7, xp:250, ranged:true, row:'back', greyChance:35,
    spec:{every:2, name:'Marked for Death', windup:'{n} touches the grey stone at his throat, and every crossbow on the ramps takes aim.', mult:1.7, grey:2}}
});
Object.assign(COMBATS, {
  a3s2_road:{title:'The Sarne Road', level:17, lethal:true, flee:true, win:'a3s2_roadWin', back:'a3s2_road',
    enemies:() => ['teamster', 'teamster', s2Exposed() ? 'fledadept' : 'teamshot'], intro:'The teamsters unsling their crossbows.'},
  a3s2_gate:{title:'The Quarry Gate', level:17, lethal:true, win:'a3s2_gateWin', back:'a3s2_gate',
    enemies:() => ['quarryguard', 'quarryguard', 'teamshot'], intro:'The palisade gate swings open, and Sarne men pour out.'},
  a3s2_face:{title:'The Cut Face', level:17, lethal:true, win:'a3s2_faceWin', back:'a3s2_face',
    enemies:() => ['stonebleed', 'stonebleed', 'stonebleed'], intro:'The grey bleeding off the stone stands up.'},
  a3s2_boss:{title:'Corrin Sarne', level:17, lethal:true, win:'a3s2_bossWin', back:'a3s2_floor',
    enemies:() => {
      // Kael's kept ledger turns Brennick's quarrymen; the horns (a forced gate) set Corrin's crossbows; Morn's fled
      // adepts (W1 exposed) gave him a grey stone
      const f = S.flags, ex = s2Exposed();
      return ['stonewight', f.s1Ledger === 'kept' ? 'brennickDoubt' : 'brennick', f.quarryAlarm ? (ex ? 'corrinBoth' : 'corrinAlarm') : (ex ? 'corrinGrey' : 'corrin')];
    },
    intro:'Corrin sets down his cup. The Stonewight turns its head.'}
});

const _s1Echoes = HEROES.south.echoes;
HEROES.south.echoes = () => {
  const f = S.flags, e = _s1Echoes();
  if (f.ysolde === 'key') e.push('Ysolde gave Wren the wardens’ key.');
  if (f.tobinBack) e.push('Tobin came back from the west.');
  if (f.envoyPath) e.push('The Arcanum’s envoy, Hesper Vane, guided Kael and Wren into Sarne’s quarry.');
  if (f.heardLine) e.push('Wren heard the anchor of the Third Stone, her own line’s stone.');
  if (f.corrinTaken) e.push('Lord Corrin Sarne is Kael’s prisoner, bound for Corvane.');
  if (f.s2Lamp === 'west') e.push('The founder’s lamp has gone west to Tamsin.');
  if (f.s2Lamp === 'kept') e.push('Wren lit the founder’s lamp from Tamsin’s lantern. Its light won’t run out.');
  return e;
};

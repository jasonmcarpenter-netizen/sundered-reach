// ================= THE FINALE, PART 2: THE LAST LANTERN =================
// Party chapter 6, the end of Game 1. Down the Founders' road to the Binding hall, where the Cinder Father (Severin
// Calloway, once the Second Binder, whose daughter the Council put in the Fifth Stone) is singing the Keystone open.
// The Founders' road map: the old guard-post (rest), the muster (who comes down with the four: the allies of Acts 1–3,
// `f2Allies()`), the Binder's stair (the Kindled rearguard, unless the Iron Tally or the Crown hold it), the Keystone's
// face (Wren and her father: Wardlore 1 → `heardStone`, the Hollow's Hand is weaker). Boss: Severin and the Hollow's
// Hand, rising through the crack. Ilsa's `heardTerms` or Faelan's free name can make him doubt (`severinDoubt`).
// Then the last choice, `f2End`: 'mended' (light and Faelan's name close the crack, nobody in the stone; short of light
// Tamsin and Ilsa make up the rest: `tamsinSpent`, `wordGone`), 'bargain' (Ilsa's new terms, only if she heard them;
// she is bound to the Hollow from now on) or 'anchor' (Severin goes into the stone, as he asks; the cage stands).
// Scene IDs use the prefix a3f2_. Party flags: f2Allies (list), stairHeld, heardStone, severinDoubt, f2Boss, f2End,
// tamsinSpent, wordGone, faelanOut, gameOver.
HEROES.party.chapters[6] = {title:'The Last Lantern', start:'a3f2_intro'};

// Who comes down the Founders' road with the four. Order is the order they arrive in.
const F2_ALLIES = {
  tally:{name:'Captain Brask and the Iron Tally', on: () => kf().captain === 'freed', from:'kael', why:'Kael freed Captain Brask at Hollin’s Ford.'},
  wardens:{name:'Ysolde and the wardens of Ardh Lirien', on: () => pairF('south').ysolde === 'key', from:'south', why:'Ysolde gave Wren the wardens’ key.'},
  quill:{name:'Hesper Vane and Quill’s adepts', on: () => pairF('west').w1Arcanum === 'deal', from:'west', why:'Ilsa and Tamsin made Quill Archmagister.'},
  orme:{name:'Captain Orme', on: () => !!S.flags.ormeTestify, from:'party', why:'Captain Orme testified before the Council.'},
  king:{name:'the King’s guard', on: () => S.flags.crownHelp === 'king', from:'party', why:'Tamsin drew the grey back from the King.'},
  orrin:{name:'Deacon Orrin', on: () => tf().orrin === 'freed', from:'tamsin', why:'Tamsin healed Orrin and let him go.'},
  aurel:{name:'Magister Aurel', on: () => !!pairF('west').aurelHelp, from:'west', why:'Tamsin lit the Second Lantern for Aurel.'},
  dario:{name:'Dario Sarne', on: () => !!kf().darioAlly && S.flags.betrayer !== 'dario', from:'kael', why:'Kael spared Dario Sarne at Varrow.'}
};
const f2AllyIds = () => Object.keys(F2_ALLIES).filter(id => F2_ALLIES[id].on());
const f2Has = id => (S.flags.f2Allies || []).includes(id);
// Severin's hall guard: three, less one for each ally who takes one off the four
const f2Guard = () => Math.max(0, 3 - ['wardens', 'orme', 'aurel', 'dario'].filter(f2Has).length);
const listOf = xs => xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
// The light the mend needs; short of it, Tamsin and Ilsa can make up one each
const MEND_LIGHT = 3;
const f2Short = () => Math.max(0, MEND_LIGHT - finaleLight());
const f2Payers = () => (S.flags.tamsinPaid ? [] : ['tamsin']).concat(['ilsa']);

Object.assign(SCENES, {
  a3f2_intro:{
    enter(){ quest('f2', 'The Last Lantern', `Reach the Keystone before the Cinder Father sings it open.`); },
    view: () => {
      const f = S.flags;
      const t = [`The Founders' road is older than Corvane. It runs under the whole city, straight as a ruled line, through rock the colour of soot, with niches every fifty paces for lamps nobody has lit in nine hundred years.`,
        f.f1Pillar === 'fallen' ? `Behind you, the dust of Well Square is still coming down. Ahead, the singing.` : `Behind you, the seventh pillar holds. Ahead, the singing.`,
        `Ilsa walks in the middle, because the voice that keeps saying her name is coming from in front of you, and from below, and from everywhere.`,
        `And behind you, on the road, footsteps. More than four people's.`];
      return {title:'The Founders’ Road', text:t, choices:[{label:'Look back', go:'a3f2_muster'}]};
    }
  },
  a3f2_muster:{
    enter(){ const f = S.flags; if (!f.f2Allies){ f.f2Allies = f2AllyIds(); chron(f.f2Allies.length ? `On the Founders’ road, ${listOf(f.f2Allies.map(id => F2_ALLIES[id].name))} came down after the four.` : 'On the Founders’ road, nobody came after the four.'); } },
    view: () => {
      const f = S.flags, a = f.f2Allies || [];
      const t = [];
      if (!a.length) t.push(`It's only the companions: Brannoc, Hask, Bracken and Tobin, who were told to stay at the inn and didn't. "Somebody's got to carry the draughts," says Brannoc.`, `Nobody else is coming. You knew that. It's still a long road.`);
      else {
        t.push(`It's the companions first, Brannoc, Hask, Bracken and Tobin, who were told to stay at the inn and didn't. And behind them, one by one, others.`);
        a.forEach(id => {
          const x = F2_ALLIES[id];
          t.push(id === 'tally' ? `Captain Odile Brask and a dozen of the Iron Tally, crossbows on their backs. "I said square," she says. "I meant it."`
            : id === 'wardens' ? `Ysolde, with six wardens of Ardh Lirien, each carrying a hanging lamp from the Lamp Gate. "Faelan's girl," she says to Wren, "does not go into the dark alone."`
            : id === 'quill' ? `Hesper Vane and four of Quill's adepts, quiet women and men in grey with books under their arms. "The Archmagister would like the founders' text to have a happy ending," Hesper says. "He was very specific."`
            : id === 'orme' ? `Captain Orme of the palace guard, in full harness, alone. "I never asked what was below," he says. "I'm going to see."`
            : id === 'king' ? `Twenty of the King's guard, in the King's colours, who were told to hold the streets and have decided the streets are held.`
            : id === 'orrin' ? `A thin man in an old grey robe with the ash-mark scrubbed off it: Deacon Orrin, whom Tamsin healed and let go a lifetime ago. "I knew the Hand," he says. "I knew the hymns. Let me talk to them."`
            : id === 'aurel' ? `Magister Aurel, cured, with a walking stick and a satchel of notes on the Wards. "Thirty years I studied these stones," he says to Ilsa. "I'm not missing this."`
            : `Dario Sarne, pale and steady, with a sword he doesn't hold well. "My brother paid for this," he says. "Somebody of our house should help pay it back."`,
            echo(x.from, x.why));
        });
      }
      return {title:'The Founders’ Road', text:t, choices:[{label:'Go on together', act: () => toMap('a3f2_road')}]};
    }
  },
  a3f2_post:{ view: () => ({title:'The Old Guard-Post', text:[`A founders' guard-post cut into the road's wall: stone benches, a stone table, and on the table, laid out as neatly as if someone meant to come back for them, nine hundred years of dust and a set of dice.`, `Brannoc lights a lamp in one of the niches. It's the first light on the Founders' road in nine centuries, and everyone stops to look at it.`],
    choices:[partyRest('You rest in the old guard-post. Everyone’s health and spell points are restored.'), {label:'Brannoc: buy 2 Healing Draughts (20 crowns)', req: () => S.gold >= 20, tag: S.gold >= 20 ? null : 'Needs 20 crowns', act: () => { S.gold -= 20; S.items.draught += 2; S.notice = 'Brannoc sells you 2 Healing Draughts.'; render(); }}, back()].filter(Boolean)})},
  a3f2_stair:{ view: () => {
    const f = S.flags;
    if (f.stairHeld) return {title:'The Binder’s Stair', text:[`The stair down to the Binding hall is clear.`], choices:[back()]};
    const t = [`The Founders' road comes out on the Binder's stair, halfway down, and the stair is full of Kindled: the Cinder Father's last guard, a ring of grey robes holding the way down while he sings.`];
    const ch = [];
    if (f2Has('tally') || f2Has('king')) ch.push({label: f2Has('tally') ? 'Brask: “Leave them to us.”' : 'The King’s guard: “Leave them to us.”', act: () => { f.stairHeld = f2Has('tally') ? 'tally' : 'king'; S.notice = xpNoteParty(60); go('a3f2_stairHeld'); }});
    if (f2Has('orrin')) ch.push({label:'Let Orrin talk to them.', act: () => { f.stairHeld = 'orrin'; S.notice = xpNoteParty(80); chron('On the Binder’s stair, Deacon Orrin talked the Cinder Father’s last guard into laying down their picks.'); go('a3f2_stairOrrin'); }});
    ch.push({label:'Cut through them.', act: () => startCombat('a3f2_stair')}, back());
    return {title:'The Binder’s Stair', text:t, choices:ch};
  }},
  a3f2_stairHeld:{ view: () => ({title:'The Binder’s Stair', text:[`${S.flags.stairHeld === 'tally' ? 'The Iron Tally' : 'The King’s guard'} go down the stair in a block, shields up, and the Kindled give way in front of them a step at a time. "Go round," shouts ${S.flags.stairHeld === 'tally' ? 'Brask' : 'their sergeant'}. "Go round, we'll hold them here!"`, `You go round.`], choices:[back()]})},
  a3f2_stairOrrin:{ view: () => ({title:'The Binder’s Stair', text:[`Orrin walks down the stair toward the picks with his hands open, and starts to sing, very quietly, the old hymn of the Ashen Hand, the one they all know. Only he sings the last verse differently.`, `One by one, the Kindled stop singing with him. Then they put down their picks, and sit down on the stair, and some of them are crying.`, echo('tamsin', 'Tamsin healed Deacon Orrin and let him go, and he kept his oath.')], choices:[back()]})},
  a3f2_stairWin:{ enter(){ if (!S.flags.stairHeld) S.flags.stairHeld = 'fight'; }, view: () => ({title:'The Binder’s Stair', text:[`The last guard breaks. The stair down is open. From below, the singing is very loud now.`], choices:[back()]})},
  a3f2_face:{ view: () => {
    const f = S.flags;
    if (f.faceDone) return {title:'The Keystone’s Flank', text:[f.heardStone ? `The stone hums under Wren's hand, low and steady.` : `The stone is cold.`], choices:[back()]};
    const t = [`Where the Founders' road meets the Binding hall there's a place where the Keystone's own flank comes through the wall: black stone, silver-veined, warm, cracked, the crack lit grey.`];
    t.push(f.keystone === 'released' ? `Nobody is in it. Wren can feel that, the way you feel an empty house. It's holding itself up by habit, and the habit is failing.` : `${FATHER} is in it. Wren can feel him, tired and very far in, holding.`);
    const ch = [Object.assign({label:'Wren puts her hand on the stone.', act: () => { f.faceDone = true; f.heardStone = true; S.notice = xpNoteParty(100); chron(f.keystone === 'released' ? 'At the Keystone’s flank, Wren heard the empty stone, and the anchors of the other stones answering.' : `At the Keystone’s flank, Wren spoke with ${FATHER}, through the stone.`); go('a3f2_heard'); }}, chkBy('wren', 'wardlore', 1)),
      {label:'No time. On to the hall.', act: () => { f.faceDone = true; toMap('a3f2_road'); }}];
    return {title:'The Keystone’s Flank', text:t, choices:ch};
  }},
  a3f2_heard:{ view: () => {
    const f = S.flags, s = pairF('south');
    const t = f.keystone === 'released' ? [`Under Wren's hand, the stone is empty, and the emptiness is huge. But far off, at the edges of it, other stones are humming back: six of them, all round the Reach, each with someone in it.`,
      s.heardLine ? `One of them she knows. <em>Faelan's girl,</em> says the old woman in the Third Stone, from very far away. <em>We feel it, the crack. When it closes, close it with his name.</em>` : `None of them speaks. But they're listening.`]
      : [`<em>Little bird,</em> says ${FATHER}, very faint. <em>You came back.</em>`, `"Hold on," says Wren, into the stone. "Just a bit longer. I'm going to get you out." Her voice doesn't shake at all. Kael, watching, has never seen anybody so frightened.`, `<em>I know,</em> he says. <em>I can feel it. All that light you've brought.</em>`];
    t.push(`Where Wren's hand is, the grey in the crack draws back, and stays back. Whatever is coming up through the crack, it will come up weaker on this side.`);
    return {title:'The Keystone’s Flank', text:t, choices:[back()]};
  }},
  a3f2_hall:{ view: () => {
    const f = S.flags, w = pairF('west');
    const t = [`The Binding hall, under the Keystone. ${f.sooner ? 'You are here sooner than he expected.' : 'You are later than you wanted to be.'}`,
      `The Keystone stands in the middle of it, cracked from crown to root, and grey light comes out of the crack like smoke out of a chimney. Something is coming up through it: an arm, a shoulder, the shape of a hand as big as a cart, grey and many-jointed, feeling for the edges of the crack.`,
      `And at the foot of the stone, singing, a tall man in ash-grey and silver with his hood down: grey-haired, grey-eyed, a face like a closed door. The Cinder Father. ${f.knowSeverin ? SEVERIN + ', once the Second Binder.' : 'He looks, Ilsa thinks, like a man who has been a priest.'}`];
    t.push(`He stops singing when he sees you. "${f.knowSeverin ? 'So you know my name. Then you know why.' : `My name was ${SEVERIN}. I was the Second Binder. I put forty-one people in the stones.`}" His voice is perfectly calm. "The last was my daughter. Elin. She's in the Fifth Stone. She was nineteen. Every stone in the Reach has someone in it, screaming very slowly, so that the rest of us can sleep."`,
      `"When the Keystone breaks, the cage breaks. They come out. All of them."`);
    if (w.heardTerms) t.push(`"And so does the Hollow," says Ilsa. "I talked to it. It told me what it wants. It isn't what you think. There's another way."`);
    if (f.keystone === 'released') t.push(`"We let one out," says Wren. "${FATHER}. My father. Twenty years he was in there. We did it without breaking anything."`);
    if (f2Has('wardens')) t.push(`Ysolde's wardens spread out round the hall's edge, lifting their lamps. The grey in the crack flinches from them.`);
    if (f2Has('quill')) t.push(`Hesper Vane's adepts take their places at the founders' marks on the floor and open their books. "We can blunt him," Hesper says. "Not stop him."`);
    if (f2Has('aurel')) t.push(`Aurel, at Ilsa's shoulder: "The joints of it, where it comes through the crack. The stone's edge cuts it there."`);
    const g = f2Guard();
    t.push(g === 3 ? `Round him, three of his hall guard.` : g ? `Round him, ${g === 2 ? 'two' : 'one'} of his hall guard. The rest are busy with your friends.` : `His hall guard are all busy with your friends.`);
    t.push(`<em>The last fight. ${SEVERIN} unbinds the hall around all of you; the Hollow's Hand grabs and pins.</em>`);
    const ch = [];
    if (!f.severinTalk && (w.heardTerms || f.keystone === 'released')) ch.push({label: w.heardTerms ? 'Ilsa: “Listen to me. Just for a minute.”' : 'Wren: “Listen. There’s another way out of a stone.”', act: () => { f.severinTalk = true; f.severinDoubt = true; chron(`At the Keystone, ${w.heardTerms ? 'Ilsa' : 'Wren'} made ${SEVERIN} doubt.`); go('a3f2_doubt'); }});
    ch.push({label:`Fight ${SEVERIN}`, act: () => startCombat('a3f2_boss')}, {label:'Fall back and prepare', act: () => toMap('a3f2_road')});
    return {title:'The Binding Hall', text:t, choices:ch};
  }},
  a3f2_doubt:{ view: () => {
    const w = pairF('west');
    return {title:'The Binding Hall', text:[w.heardTerms ? `Ilsa tells him. Not everything. Enough. That the Hollow doesn't want to be fed. That it wants to be asked. That there are terms.` : `Wren tells him about ${FATHER}: the lanterns, the blood, the light filling the crack instead of grey, her father's voice saying <em>little bird</em> and going out like a breath.`,
      `${SEVERIN} listens. His face doesn't change. But his hands do; they shake, very slightly, and he looks at them as if they belong to someone else.`,
      `"Too late," he says at last. "It's already coming." Behind him the Hand closes on the edge of the crack and pulls. But when he begins to sing again, his voice catches.`], choices:[{label:`Fight ${SEVERIN}`, act: () => startCombat('a3f2_boss')}, {label:'Fall back and prepare', act: () => toMap('a3f2_road')}]};
  }},
  a3f2_bossWin:{ enter(){ if (S.flags.f2Boss) return; S.flags.f2Boss = true; chron(`At the Keystone, the four brought down ${SEVERIN}, the Cinder Father, and drove the Hollow’s Hand back into the crack.`); }, view: () => {
    const t = [`The Hand lets go of the crack's edge all at once and slides back into the grey like a drowned man going under. ${SEVERIN} is on his knees at the foot of the stone, his hood torn, his hands bleeding. He doesn't get up. He doesn't try.`,
      `The crack is still open. The grey still pours out of it. And out of it, very close now, a voice: Ilsa's voice, patient and enormous.`,
      `"<em>Ilsa,</em>" it says. "<em>You came. Good. Now. What are you going to do?</em>"`];
    return {title:'The Keystone', text:t, choices:[{label:'Decide', go:'a3f2_choice'}]};
  }},
  a3f2_choice:{ view: () => {
    const f = S.flags, w = pairF('west'), light = finaleLight(), short = f2Short(), pay = f2Payers();
    const parts = finaleLightParts();
    const t = [`It comes down to this, the way Hask's last page said it would: three ways to close a crack in the world.`];
    const ch = [];
    // Mend: light and a name. Short of light, Tamsin and Ilsa make up one each, and it costs them for good.
    t.push(`<b>Mend it.</b> Light into the crack to show the stone where it was whole, and a name to tell it who it held: ${FATHER}'s. Then nobody is in the Keystone, ever again, and it stands by itself. ${parts.length ? `You have ${parts.map(p => p[0]).join(', ')}${f.lightUsed ? ', less what the seventh pillar took' : ''}.` : 'You have no light of your own.'} ${lightNote()}`);
    if (short === 0) ch.push({label:'Mend it, with light and his name.', act: () => mend([])});
    else if (short <= pay.length){
      const who = pay.slice(0, short);
      t.push(`It isn't enough. ${who.includes('tamsin') ? 'Tamsin can give the rest of her own light: all of it, and her healing with it, for good.' : ''} ${who.includes('ilsa') ? 'Ilsa can give the Unwritten Word into the crack, and never speak it again.' : ''}`);
      ch.push({label:`Mend it. ${who.map(h => HEROES[h].name).join(' and ')} ${who.length > 1 ? 'pay' : 'pays'} what's missing.`, act: () => mend(who)});
    } else t.push(`It isn't enough. Not nearly. Not even if Tamsin and Ilsa gave everything they have.`);
    if (w.heardTerms){
      t.push(`<b>Make a new bargain.</b> Ilsa knows its terms. It doesn't want lives. It wants to be asked, and answered: a voice that comes down to it and talks to it, freely, for as long as the voice lives. Ilsa's. It will sleep under the Heartland as long as she keeps faith. Nobody goes in the stone. But it will be in her head for the rest of her life.`);
      ch.push({label:'Ilsa makes the Hollow a new bargain.', act: () => { f.f2End = 'bargain'; if (f.keystone !== 'released') f.faelanOut = true; chron('At the Keystone, Ilsa made the Hollow a new bargain, in her own voice. It sleeps under the Heartland as long as she keeps faith with it.'); go('a3f2_bargain'); }});
    }
    t.push(`<b>Bind it again, the old way.</b> ${SEVERIN} lifts his head. "Put me in," he says. "I've put forty-one in. Let me be the forty-second. I know how it's done." ${f.keystone === 'released' ? 'The stone would hold. The cage would stand, as it has for nine hundred years.' : `${FATHER} could come out, and ${SEVERIN} take his place. The cage would stand, as it has for nine hundred years.`}`);
    ch.push({label:`Let ${SEVERIN} go into the stone.`, act: () => { f.f2End = 'anchor'; if (f.keystone !== 'released') f.faelanOut = true; chron(`At the Keystone, ${SEVERIN} went into the stone as its anchor, by his own choice. The cage stands.`); go('a3f2_anchor'); }});
    return {title:'The Keystone', text:t, choices:ch};
    function mend(who){
      f.f2End = 'mended'; if (who.includes('tamsin')) f.tamsinSpent = true; if (who.includes('ilsa')) f.wordGone = true; if (f.keystone !== 'released') f.faelanOut = true;
      chron(`At the Keystone, the four closed the crack with light and ${FATHER}’s name. Nobody is in the Heartland stone.${f.tamsinSpent ? ' Tamsin gave the last of her own light to it.' : ''}${f.wordGone ? ' Ilsa gave it the Unwritten Word.' : ''}`);
      go('a3f2_mended');
    }
  }},
  a3f2_mended:{ view: () => {
    const f = S.flags;
    const t = [`Tamsin opens the light. ${pairF('west').w2Flame === 'carried' ? 'The first flame goes into the crack first, nine hundred years old and steady as a held breath, and the grey falls back from it like a crowd from a fire.' : 'What light there is goes into the crack, and the grey falls back from it.'}`];
    if (f.tamsinSpent) t.push(`It isn't enough, and Tamsin knew it wouldn't be. She puts both hands on the stone and gives it the rest: everything that was ever in her hands, all of it, gold. When it's gone, she sits down on the floor of the hall and looks at her palms, and they're only palms.`);
    if (f.wordGone) t.push(`Ilsa says the Unwritten Word into the crack, one last time, and feels it leave her, like a tooth. She opens her mouth afterward, to try, and there's nothing there. Only her own voice.`);
    t.push(`Then Wren puts her hand flat on the Keystone, in the light, and says it. "${FATHER}." And again, louder. "${FATHER}, of Ardh Lirien, a Warden. He held you twenty years. You can stand by yourself now."`,
      `The crack closes. Not like a wound. Like a door, shut gently from the inside.`,
      `"<em>Later,</em>" says the Hollow, in Ilsa's voice, very far down. It doesn't sound angry. It sounds like it is going to wait.`);
    if (f.faelanOut) t.push(`And at the foot of the stone, where the silver was, there's a man lying on the floor of the hall: thin, grey-haired, blinking at the light as if he's never seen it. Wren gets to him first. Nobody else even tries.`);
    return {title:'The Keystone', text:t, choices:[{label:'After', go:'a3f2_epilogue'}]};
  }},
  a3f2_bargain:{ view: () => {
    const f = S.flags;
    const t = [`Ilsa walks up to the crack and puts her face close to the grey, close enough to feel it on her skin, and speaks to it. Not the Word. Just talking. Her own voice, answering her own voice.`,
      `Nobody hears what she says. It takes a long time. The grey goes still while she does it, and then, slowly, it goes back down into the crack, the way the tide goes out, and the crack doesn't close but it goes dark, and quiet, and stays that way.`,
      `When she comes back to the others she is white to the lips and perfectly steady. "It's asleep," she says. "Properly asleep. Not fed." She touches her temple. "And it's here. It'll always be here now. That was the price." She tries to smile. "It's very polite. It says thank you."`];
    if (f.faelanOut) t.push(`At the foot of the stone, where the silver was, there's a man lying on the floor of the hall, thin and grey-haired and blinking. The Hollow let go of the anchor, too, when it stopped needing one. Wren gets to him first.`);
    return {title:'The Keystone', text:t, choices:[{label:'After', go:'a3f2_epilogue'}]};
  }},
  a3f2_anchor:{ view: () => {
    const f = S.flags;
    const t = [`${SEVERIN} gets up by himself. He walks to the stone, and puts his hands flat on it, and says the Binder's words, which he knows better than anyone alive.`,
      `"Tell Elin," he says, over his shoulder, to nobody in particular. "If you ever get to the Fifth Stone. Tell her I'm sorry, and that I tried." Then the silver comes up over his hands, and his arms, and his face, and he's gone into it.`,
      `The crack closes. Grey to black. The hall is quiet. The Keystone holds, the way it always has: with someone in it.`,
      `"<em>Thank you,</em>" says the Hollow, in Ilsa's voice, very far down. "<em>That will do. For now.</em>"`];
    if (f.faelanOut) t.push(`And at the foot of the stone, where ${FATHER}'s silver shape was, there's a man lying on the floor of the hall, thin and grey-haired and blinking. Wren gets to him first. She doesn't look at the stone again.`);
    return {title:'The Keystone', text:t, choices:[{label:'After', go:'a3f2_epilogue'}]};
  }},
  a3f2_epilogue:{ view: () => {
    const f = S.flags, s = pairF('south'), w = pairF('west'), end = f.f2End;
    const t = [];
    // The city
    t.push(f.f1Pillar === 'fallen' ? `Well Square is a hole in the Lower Town forty feet deep, and it takes the city a year to fill it. ${f.quillWards ? 'The wells come back clear by spring, behind Quill’s wards.' : 'The Lower Town drinks from the river all winter.'}` : `Well Square is still there, with a new well-head and a crack in the cobbles nobody fills in.`);
    t.push(f.council === 'broken' ? `Corvane stays two cities for a long time: one that thinks the four saved it, and one that thinks they nearly ended it. Both are right.` : `The Council keeps its secret, and keeps its word about the stones, and keeps very carefully out of the four's way.`);
    t.push(f.corrinDeal === 'freed' ? `Corrin Sarne is somewhere out in the Reach, alive, with a long memory.` : `Corrin Sarne stands trial in the spring. ${pairF('south').s1Ledger === 'kept' ? 'House Sarne survives him, just.' : 'It goes badly for him.'}`);
    if (f.kingSpoke) t.push(`The King walks out onto the palace steps on the first day of spring, on his own feet, and says to the whole city that nobody will go into a stone again in his name.`);
    // The four
    t.push(`Kael ${f.corrinDeal === 'freed' ? 'doesn’t talk about Corrin' : 'goes to Corrin’s trial every day, and sits at the back'}. He's offered three commands in a month and turns them all down. "Not yet," he says, when Wren asks. "There's six more stones."`);
    t.push(end === 'bargain' ? `Ilsa goes down to the Keystone on the first night of every month, alone, and talks. She doesn't say what about. She sleeps better than she has in years, which frightens Tamsin more than anything.` : f.wordGone ? `Ilsa doesn't have the Unwritten Word any more. She finds, to her surprise, that she has a great many others.` : `Ilsa reads the silver book again, all of it, and starts writing in the margins.`);
    t.push(f.tamsinSpent ? `Tamsin has no light left in her hands. She keeps the infirmary anyway, with herbs and bandages and Bracken, and finds she's still a healer, the ordinary kind. It's enough. Most days it's enough.` : w.lanternHealed ? `Tamsin's hands are steady, and her light is whole, and she keeps both lanterns burning in the infirmary window.` : `Tamsin keeps both lanterns burning in the infirmary window.`);
    t.push(f.faelanOut ? `Wren takes her father home to Ardh Lirien. It's a slow road; he has to learn to walk again. Ysolde is waiting at the Lamp Gate, and doesn't say anything at all, for a long time.` : `Wren goes back to the Keystone sometimes, and puts her hand on it, and says his name. ${end === 'mended' ? 'It hums back.' : 'It doesn’t answer. She says it anyway.'}`);
    // The Hollow, and Game 2
    t.push(end === 'mended' ? `The Heartland stone stands by itself, with nobody in it, for the first time in nine hundred years.` : end === 'bargain' ? `The Heartland stone stands, with nobody in it, and under it the Hollow sleeps by its own consent, for the first time in nine hundred years.` : `The Heartland stone stands, with ${SEVERIN} in it. The cage holds.`,
      `But there are six more Wardstones in the Reach, and someone is in every one of them. In the Fifth, a girl called Elin. In the Third, an old woman who knows Wren's name.`,
      `And very far down, under all of them, something is waiting. It said so. <em>Later.</em>`);
    return {title:'After', text:t, choices:[{label:'The end', act: () => {
      setQ('f2', 'done', end === 'mended' ? 'The four mended the Keystone with light and Faelan’s name. Nobody is in the Heartland stone.' : end === 'bargain' ? 'Ilsa made the Hollow a new bargain. It sleeps under the Heartland by its own consent.' : `${SEVERIN} went into the Keystone as its anchor. The cage holds.`);
      quest('next', 'Six More Stones', 'There are six more Wardstones in the Reach, and someone is in every one of them.');
      f.gameOver = true; S.mode = 'end'; save(); render(true);
    }}]};
  }}
});

Object.assign(MAPS, {
  a3f2_road:{
    title:'The Founders’ Road',
    blurb: () => `The old road under Corvane, straight as a ruled line, to the Binding hall.`,
    w:340, h:260,
    nodes:[
      {id:'a3f2_post', label:'The Old Guard-Post', x:50, y:210, sub:'Rest'},
      {id:'a3f2_face', label:'The Keystone’s Flank', x:90, y:60, sub:'Through the wall', done: () => S.flags.faceDone},
      {id:'a3f2_stair', label:'The Binder’s Stair', x:200, y:190, sub:'The last guard', done: () => S.flags.stairHeld},
      {id:'a3f2_hall', label:'The Binding Hall', x:290, y:80, sub:'The Keystone', open: () => S.flags.stairHeld, done: () => S.flags.f2Boss, lockText:'Get down the Binder’s stair first'}
    ],
    edges:[['a3f2_post','a3f2_face'],['a3f2_post','a3f2_stair'],['a3f2_face','a3f2_hall'],['a3f2_stair','a3f2_hall']]
  }
});

Object.assign(ENEMIES, {
  // Party enemies for the finale, tuned for level 20 (see f1.js)
  cinderguard:{name:'Cinder Guard', hp:400, dmg:[44,50], acc:78, dodge:4, armor:3, init:5, xp:70, calm:true},
  cindercantor:{name:'Cinder Cantor', hp:320, dmg:[42,46], acc:78, dodge:6, armor:0, init:6, xp:70, ranged:true, row:'back', greyChance:30,
    spec:{every:3, name:'Ash-Hymn', windup:'{n} lifts the hymn, and ash begins to fall out of the air.', mult:1.4, aoe:true, grey:2}},
  // Severin's hall guard at the Keystone: lighter, so the allies who take them off the four help without deciding the fight
  hallguard:{name:'Hall Guard', hp:260, dmg:[32,36], acc:76, dodge:4, armor:2, init:5, xp:50, calm:true},
  hallcantor:{name:'Hall Cantor', hp:220, dmg:[30,34], acc:76, dodge:6, armor:0, init:6, xp:50, ranged:true, row:'back', greyChance:25},
  hollowhand:{name:'The Hollow’s Hand', hp:1300, dmg:[64,70], acc:76, dodge:0, armor:4, init:3, xp:400, hollow:true, greyChance:25,
    spec:{every:3, name:'The Grasp', windup:'{n} spreads its grey fingers over one of you.', mult:1.6, stun:true, grey:2}},
  // Wren held the grey back at the stone's flank; the stone's edge cuts it
  hollowhandWeak:{name:'The Hollow’s Hand', hp:1000, dmg:[58,64], acc:72, dodge:0, armor:3, init:3, xp:400, hollow:true,
    spec:{every:3, name:'The Grasp', windup:'{n} spreads its grey fingers over one of you.', mult:1.5, stun:true, grey:2}},
  severin:{name:'Severin Calloway', hp:2000, dmg:[70,78], acc:80, dodge:6, armor:3, init:6, xp:600, ranged:true, row:'back',
    spec:{every:2, name:'The Unbinding', windup:'{n} sings a Binder’s word backwards, and every seam in the hall starts to come apart.', mult:2.0, aoe:true, grey:2}},
  // blunted by Quill's adepts, or doubting
  severinDoubt:{name:'Severin Calloway', hp:1700, dmg:[64,72], acc:78, dodge:6, armor:3, init:6, xp:600, ranged:true, row:'back',
    spec:{every:2, name:'The Unbinding', windup:'{n} sings a Binder’s word backwards, and his voice catches on it.', mult:1.7, aoe:true, grey:2}}
});
Object.assign(COMBATS, {
  a3f2_stair:{title:'The Binder’s Stair', level:20, lethal:true, win:'a3f2_stairWin', back:'a3f2_stair',
    enemies:() => ['cinderguard', 'cinderguard', 'cindercantor'], intro:'The Cinder Father’s last guard lock their shields across the stair.'},
  a3f2_boss:{title:'The Cinder Father', level:20, lethal:true, win:'a3f2_bossWin', back:'a3f2_hall',
    enemies:() => {
      // Wren's hand on the stone weakens the Hand; Quill's adepts or doubt blunt Severin; each of the wardens, Orme,
      // Aurel and Dario takes one of his hall guard off you
      const f = S.flags;
      const guard = ['hallguard', 'hallcantor', 'hallguard'];
      const adds = guard.slice(0, f2Guard());
      return [f.heardStone ? 'hollowhandWeak' : 'hollowhand'].concat(adds, [(f2Has('quill') || f.severinDoubt) ? 'severinDoubt' : 'severin']);
    },
    intro:'The Hollow’s Hand comes up out of the crack, and Severin Calloway begins to sing.'}
});

const _f1Echoes = HEROES.party.echoes;
HEROES.party.echoes = () => {
  const f = S.flags, e = _f1Echoes();
  if (f.f2Allies && f.f2Allies.length) e.push(`${listOf(f.f2Allies.map(id => F2_ALLIES[id].name)).replace(/^./, c => c.toUpperCase())} came down the Founders’ road with the four.`);
  if (f.heardStone) e.push(f.keystone === 'released' ? 'Wren heard the empty Keystone, and the other stones answering.' : `Wren spoke with ${FATHER} through the Keystone.`);
  if (f.severinDoubt) e.push(`${SEVERIN} doubted, at the end.`);
  if (f.f2End === 'mended') e.push(`The four mended the Keystone with light and ${FATHER}’s name. Nobody is in the Heartland stone.${f.tamsinSpent ? ' Tamsin’s light is gone.' : ''}${f.wordGone ? ' Ilsa gave up the Unwritten Word.' : ''}`);
  if (f.f2End === 'bargain') e.push('Ilsa made the Hollow a new bargain. It sleeps under the Heartland, and it lives in her head.');
  if (f.f2End === 'anchor') e.push(`${SEVERIN} went into the Keystone as its anchor. The cage stands.`);
  if (f.faelanOut) e.push(`${FATHER} came out of the Keystone alive.`);
  return e;
};

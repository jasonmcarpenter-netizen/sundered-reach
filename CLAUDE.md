# The Sundered Reach: project guide for Claude

A turn-based, story-heavy browser RPG in the Spiderweb Software tradition (Avernum, Geneforge, Avadon, Queen's Wish). This is Game 1 of a planned series. Owner: Jason. Full world and design doc: https://claude.ai/artifact/YVQGu9C4ys1ubYidV6PCSg. That doc is the source of truth for story and systems. This file is the short version, plus how the code works.

## Locked decisions (don't change without asking)
- **Platform:** browser game in plain HTML/CSS/JavaScript, playable on phone and desktop. No framework and no build step.
- **Combat:** menu-based and turn-based, with front and back rows and no grid movement. Actions are Attack, Skill/Spell, Item, Defend, Swap Row and Flee. Turn order comes from Grace plus a little randomness, and it's shown on screen. Some enemies telegraph big attacks a turn ahead.
- **Look:** mostly rich text, with simple clickable maps for travel and locations. Torchlit-stone theme.
- **Heroes:** Kael Dunmore (Human swordsman, Varrow), Ilsa Venn (Sylvari mage, Spire Coast), Tamsin Orlo (Stoneborn healer, Hearthdeep) and Wren (half-Sylvari rogue/archer, Thornwood). Keep these names. A Vessh hero is saved for Game 2.
- **Tone:** grim but hopeful. The world is dark and choices have real costs, but the heroes can make things better.
- **Length:** about 20 hours for Game 1.
- **Signature abilities:** Kael has Last Stand, Ilsa has The Unwritten Word, Tamsin has Mend the Grey and Wren has Vanish.

## Design rules
- **Classless:** any hero can learn any skill. Race changes the cost (cheap skills are 1 point per rank, expensive ones 2) but never whether a skill can be learned.
- **Linked choices are the signature mechanic.** Every Act 1 chapter needs at least one choice that echoes into another hero's story. Echoes change *how* a problem gets solved, never *whether* it can be, so there are no dead ends. Both options must cost something.
- **World flags:** each hero's scripts can read any hero's flags but only write their own. Read another hero's flags with `otherF('hero')`.
- **Switching:** a hero can't get more than one chapter ahead of the others. XP isn't shared, but catch-up XP keeps heroes within 2 levels of each other.
- **Writing style:** Spiderweb-style paragraphs, numbered replies, and gated replies marked with their requirement. Prose should be vivid but not purple.
- **Solo fights are built around the hero's role.** For example, Tamsin wins by stalling and warding, not brawling.

## Where the build is
- **Done:** Act 1 opening chapters for **Kael** (Varrow arena, frame-up, escape, the Grey Warden), **Ilsa** (Arcanum, forbidden text, vault, Proctor Graff) and **Tamsin** (Kell's Rest, grey sickness, evacuate-or-defend, companion Bracken). Hero select, cross-hero echoes, journal, character sheet and saves all work.
- **Next:** Wren's opening chapter in the Thornwood (sealed crate, the sell-or-keep-the-key choice, a Free Companies vibe). After that, wire Wren's echoes into the other three, add her to `BUILT` in `js/core.js`, and turn her "coming soon" card on hero select (`js/ui.js`) into a playable one.
- **Still open:** names for the Ashen Hand leaders and major NPCs.

## Code layout
These are plain `<script>` files that share one global scope, and **load order matters** (see `index.html`):

| File | What's in it |
|---|---|
| `js/cloudsave.js` | `CloudSave`, which saves to the Claude artifact database when it's running inside Claude. Anywhere else, including GitHub Pages, it falls back to `localStorage` (status `'local'`). Also has the save-code helpers. |
| `js/core.js` | Save state (`M` is the whole save, `S` the active hero, `C` combat), helpers (`h()` for DOM), rules (`ATTRS`, `SKILLS`, `HEROES`, `ALLIES`, `BUILT`, XP table) and `save()`. |
| `js/heroes/kael.js` | The base `SCENES`, `MAPS`, `ENEMIES` and `COMBATS` (Kael's), plus the Kael and Ilsa echoes. |
| `js/heroes/ilsa.js` | Ilsa's chapter, added with `Object.assign` into the shared tables. |
| `js/combat.js` | Navigation (`go`, `toMap`) and the combat engine: `ACTIONS`, `ITEMS`, enemy AI, retry and step-back. |
| `js/ui.js` | Rendering, modals (sheet, journal, menu), title, hero select and chapter end. |
| `js/saves.js` | Save codes and cloud sync. |
| `js/heroes/tamsin.js` | Tamsin's chapter, her skills and actions, Bracken, and her echoes into Kael and Ilsa. |
| `js/main.js` | Start-up. |

Scene shape: `{ enter?(), view() -> {title, text:[html], choices:[{label, go?, act?, req?, tag?}]} }`. Text starting with `@echo:` renders as a cross-hero echo box. Each hero's scene IDs use a prefix (Ilsa's start with `i_`, Tamsin's with `t_`), so new heroes need their own prefix too (Wren's would be `w_`).

**New hero pattern:** create `js/heroes/<name>.js` and load it after `saves.js` and before `main.js`. In it, add the hero to `HEROES` and `Object.assign` scenes, maps, enemies, combats and any new skills or actions. Define `HEROES.<name>.echoes`, then wrap the other heroes' echo functions the way `tamsin.js` does.

## Saves (don't break them)
- Save key: `sundered-reach-v2`. The save shape is `{v, cur, heroes:{kael, ilsa, tamsin, …}}`.
- Never rename or remove saved fields. If the shape has to change, add a migration (see how `OLD_KEY` is handled) and bump the key only as a last resort.
- Players can move progress between devices or hosts with **Menu → save code**.

## Working rules
- Run it locally with `python3 -m http.server`, then open http://localhost:8000.
- After any change, smoke-test by playing through each built chapter's main path, including its boss, and check for console errors.
- **Balance target:** each chapter's boss should sometimes take a retry, and no single spell should end group fights in a turn or two (Arc Lightning was nerfed for exactly this). When tuning, write a quick headless sim and play each chapter about 30 times rather than guessing.
- Keep files under about 1,000 lines. If a hero file grows past that, split it into `scenes`, `data` and `combat` files.
- Commit in small, clearly named steps. Update this file's "Where the build is" section when a chapter lands.

# Test tools

A bot that plays the game through its own functions, a balance simulator, and a page that tests the cloud-save
logic against a stand-in database. Nothing here is loaded by the game itself.

| File | What it does |
|---|---|
| `bot.js` | The bot: picks choices by label and clicks the real buttons, visits map spots, spends skill points, fights with a simple per-hero tactic, and records errors. Makes combat run synchronously. |
| `paths.js` | Scripted routes through each chapter (`BOT.kael`, `BOT.ilsa`, `BOT.tamsin`, `BOT.wren`, `BOT.ilsa2`, `BOT.tamsin2`, `BOT.kael2`, `BOT.wren2`, `BOT.ilsa3`, `BOT.kael3`, `BOT.tamsin3`, `BOT.wren3`, and `BOT.partyTest`, which checks the Act 2 party engine, `BOT.party1` to `BOT.party4` for Act 2 chapters 1–4 (`party4` can restart its chapter with a forced betrayer); `BOT.psim(xp, combatId, runs, flags, heroFlags)` simulates a party fight), the boss simulator (`BOT.sim`), and `BOT.suite()`, the standard check. |
| `mocktest.html` | The game with a fake in-memory Firebase, for testing sign-in and sync without a Google account. |

## Run the standard check

1. Serve the repo root on localhost, for example `python3 -m http.server 8000`, and open http://localhost:8000.
2. In the browser console (or a browser-automation tool), run:

```js
const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src + '?' + Date.now(); s.onload = ok; s.onerror = no; document.head.append(s); });
await load('/tools/test/bot.js'); await load('/tools/test/paths.js');
console.log(await BOT.suite());
```

`BOT.suite()` plays every built chapter twice, once taking the hostile branch at each choice and once the
friendly one, so the cross-hero echoes in both directions get exercised. It then fights each boss 100 times at
the levels players reach it and reports first-try win rates. It takes a few seconds and **erases the game's
saved progress in that browser**, so run it on localhost, not on the live site.

What passing looks like: every play-through says PASS, the report ends with "No errors", and each boss's
first-try win rate sits roughly in the 70–90% range at the typical level (the balance target in CLAUDE.md:
a boss should sometimes take a retry).

## When you add a chapter

Add a route for it to `paths.js` (copy `BOT.ilsa2`), call it from both play-throughs in `BOT.suite()`, and add
its boss to the `sims` list. Also add the chapter's script to `mocktest.html`, in the same order as in
`index.html`. Choice labels are matched by substring, so a route breaks loudly if a choice it
uses is renamed.

## Cloud-save logic

Open http://localhost:8000/tools/test/mocktest.html. `window.SR_FIREBASE` there is an in-memory fake with a
`signIn()` that signs in a test user immediately, so you can check that the newer save wins, that progress is
uploaded on sign-in, and that "Erase and start over" deletes the online copy. Watch `MOCKDB` and `MOCKLOG` in
the console. Real Google sign-in can only be tested by a person.

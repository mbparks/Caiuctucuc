# CAIUCTUCUC

A single player, top down, open world supernatural mystery set in Cumberland, Maryland, in the 1850s. Ultima meets Grand Theft Auto, period appropriate: keyword conversation, hue and cry instead of a wanted meter, horses instead of cars, and a mountain that watches the town.

Part of the MBPARKS ARCADE collection.

**Version: 0.22.2** (shared-hosting boot diagnostics and deployment hardening)

## What changed in v0.22.2

This release fixes the confusing hosted-site failure where the page shell loaded but the game reported only that the main script never ran. The browser now starts through `src/boot.js`, which dynamically imports the game and catches module-loading failures. On shared hosting, that means the page should now report the exact missing or blocked module instead of `unknown error`.

The Trail helper now loads only after the main game module boots successfully, so a broken deployment no longer shows a half-working Trail strip on a dead canvas. The build script now stamps the current version with a regex instead of looking for one old hard-coded comment. It also copies `.htaccess`, which adds Apache MIME hints for `.js`, `.mjs`, `.json`, `.png`, and `.svg` files on x10hosting-style deployments.

## What changed in v0.22.1

This release fixes a regression caused by the doorway-blocking protection. Some scheduled NPCs had destination spots placed on the same approach tiles used by building doors. The doorway safety code correctly pushed them away, but the schedule code immediately sent them back, which made them bounce in place.

The fix changes slow scheduled movement so townsfolk settle near their destination instead of trying to stand on the exact doorway pixel. Faster movement, including pursuit and fleeing, still closes all the way. A new regression test in `tests/pursuit_no_bounce.js` protects that behavior.

## What changed in v0.22.0

This release is a gameplay-first cleanup pass. The game had many systems, but too much of the useful direction lived inside the journal or behind prior knowledge. v0.22.0 adds a live Trail strip, a collapsible Trail panel, a T shortcut, phase-based objective logic, pressure warnings, and action feedback so button presses feel acknowledged.

The new Trail model is pure logic in `src/game/trail.js`, with tests in `tests/trail.js`. It derives the current lead from the existing save flags, so it does not require a save format bump. It also warns the player when health is low, when heat is dangerous, or when an active job is already in hand.

## Running it

The game MUST be served over http; opening index.html straight from the disk (double-clicking it) leaves a dark screen, because browsers refuse module scripts and map data over file://. The game now detects this and says so on screen. From the repo root:

    python3 -m http.server 8000

Then visit http://localhost:8000. The build script produces a deployable snapshot in dist/:

    python3 tools/build.py

Upload the contents of `dist/` to the public web folder on x10hosting, including `.htaccess`, `src/`, and `assets/`. Do not upload only `index.html`; the module files and map JSON must remain in their folders.

The build stamps the version, copies src and assets, copies `.htaccess` when present, and fails if any em dash or en dash is found anywhere in the tree.

## Running tests

    npm test

or directly:

    node tests/run.js
    node tests/trail.js
    node tests/pursuit_no_bounce.js

Pure logic tests (save round trip, keyword gating, hue and cry decay, trail objectives, no-bounce movement) run in Node with no dependencies. The same modules load in the browser.

For a browser boot smoke test, install the optional jsdom dependency and run:

    npm install
    node tools/boot_smoke.mjs

## Repository layout

- src/ engine and game code (ES modules, no framework, Canvas 2D)
- src/data/ the game's content as JSON: NPC roster, keyword matrix, item list
- assets/ art and audio (see assets/README.md for the pipeline)
- docs/ the full design document set, including the 1800 plat map
- tests/ the test harness
- tools/ build.py, the build-time static generator
- blog/ release post drafts
- releases/ per-release file snapshots

## Roadmap

ROADMAP.md tracks the milestone path from the current version to the v1.0 MVP, with exit criteria per milestone.

## Design documents

The complete paper design lives in docs/: design document, main quest beat sheet, town map layout, keyword vocabulary matrix, side quest sketches, and the surveyor's plat (SVG). Code and content changes must keep these documents in sync.

## Standards

This project follows the standing MBPARKS web app standards: local first with full save export and import, night default theme, WCAG AA in all themes plus a High Contrast theme, fluid sizing, collapsible menus, mute button, visible version display, debug flagged console logging, per-release snapshots, and a blog post draft with each release.

## Controls

- Arrow keys or WASD: walk
- E: interact, speak, enter, examine, or use the nearby object
- T: open the Trail panel for the next useful objective
- J: open the full case file
- I: open the satchel
- F: commit a direct crime against a nearby NPC, when possible
- Q: surrender when cornered
- Backtick: open the cheat terminal

## Cheat codes

Press the backtick key (`` ` ``) to open the terminal, type a code, and press Enter.

- SNAKEOIL: restore health to full
- SPECIE: gain 25 silver
- PARDON: clear all heat and pursuit
- LANTERNS: banish the darkness permanently
- ACT1 / ACT2 / ACT3 / ACT4: skip to the start of that act with a coherent case file (aliases ACTONE, ACTTWO, ACTTHREE, ACTFOUR also work)

The act skips are cumulative and grant every clue and flag the player would have gathered, so the case file and the next-step hint read correctly on arrival. Intended for playtesting the later acts without replaying the whole story.

## Known Limitations

- The default test suite is `npm test`, which runs `node tests/run.js`, `node tests/trail.js`, and `node tests/pursuit_no_bounce.js`. The optional browser boot smoke test is `node tools/boot_smoke.mjs` after `npm install`.
- v0.0.2 renders placeholder colors keyed by gid; real tilesheets are not wired yet.
- The art is generated, third generation (the overworld pass, NES-bold); the final art decision is still open (docs/art_decision.md) and any option drops into the documented slots.
- Named NPCs share two generic sprites; per-character sheets follow the art decision.
- Interiors are single rooms; the courthouse's three chambers and the Mule's upstairs arrive with final art.
- NPCs walk only the town map; ducking indoors pauses pursuit, which players will exploit and which is acceptable for now.
- Gossip changes greetings for Peg and Beall only; the other ten react in a later pass.
- Trust rises through surrender and kept promises, but several trust gates still need more obvious quest paths.
- The constable still pursues by straight seek with wall sliding; buildings can be circled.
- Consumables print flavor text, and healing works. Hunger only matters on hard survival.
- Wear accrues through the API and tests but no in-game action yet inflicts it; combat and hard use land later.
- The coat rack and coat items coexist; the rack will retire once wearables fully replace it.
- Act I closes with a banner; later act content is playable but still needs more presentation polish.
- Marks are recorded and gossiped in Brahm's CROSSED response; their mechanical flavors (the slower sprint, the ringing ear) apply in a later pass.
- The Brahm favor path replaces the trust gate from the keyword matrix until quest-driven trust is fully balanced.
- Rank 2 murmurs exist at three placed sites; the general murmur field waits for Act IV.
- The revival fires as a scripted beat; Crane's debunk/recruit choice is deferred to the polish pass.
- Mrs. Lamar's house stands but she does not yet; the Winona thread opens through prose for now.
- Militia and bounty pursuers reuse the constable's sprite and seek; checkpoints as fixed posts come with final maps.
- Benchmark, Sealed Record, Chainman's Widow, Beall's Bottle, Anatomy List, No Questions, Sign Painter, The Cabin Kept, The Collection Plate, and The Magistrate's Ledger are all in.
- The character creator is in with all mechanical effects; cosmetic appearance options wait on final art.
- All four Burden quests are in. The debt cannot yet be discovered as sold to Cresap; that fold arrives post-1.0.
- Cave-Aged and The Excise Man's Arithmetic wait on Marsh and Pyle, who are post-1.0 NPCs; the caves carry their foreshadowing (the horseshoe, the casks).
- Nan appears in the chamber as prose; her sprite and the Trent farm scenes come with final art.
- Dialog, hue and cry, SIGHT, and Trail exist as tested logic modules and are wired to the browser build.
- Saves are localStorage plus JSON export. v0.22.2 does not change the save format.

## License

GPL-3.0

# CAIUCTUCUC

A single player, top down, open world supernatural mystery set in Cumberland, Maryland, in the 1850s. Ultima meets Grand Theft Auto, period appropriate: keyword conversation, hue and cry instead of a wanted meter, horses instead of cars, and a mountain that watches the town.

Part of the MBPARKS ARCADE collection.

**Version: 0.23.0** (Interior Life: buildings now load with occupants)

## What changed in v0.23.0

This release starts the Interior Life milestone. Building interiors are no longer empty rooms. The map loader now decorates interiors with named NPCs and ambient occupants when the player enters them. The Blue Mule has Peg and working patrons, the courthouse has civic occupants, the survey office has Gantt and a chainman, the surgery has Ward and a patient, and other key interiors now have their expected people.

Ambient occupants also have simple keyword dialog. They give local flavor about roads, canal work, rail work, ledgers, the survey office, and everyday life in Cumberland.

The new logic lives in `src/game/interior_life.js`, is applied by `src/engine/tiledmap.js`, and is covered by `tests/interior_life.js`.

## Earlier v0.22 fixes

v0.22.5 moved scheduled NPCs into street-side standing lanes near doors. v0.22.4 added separate scheduled standing spots for shared targets. v0.22.3 added module contract tests and cache-control hints for shared hosting. v0.22.2 added the catchable browser boot loader.

## Running it

The game MUST be served over http. Opening index.html straight from disk can leave a dark screen because browsers refuse module scripts and map data over file://. From the repo root:

    python3 -m http.server 8000

Then visit http://localhost:8000. The build script produces a deployable snapshot in dist/:

    python3 tools/build.py

Upload the contents of `dist/` to the public web folder on x10hosting, including `.htaccess`, `src/`, and `assets/`. Do not upload only `index.html`; the module files and map JSON must remain in their folders.

The build stamps the version, copies src and assets, copies `.htaccess` when present, and fails if any forbidden long dash is found anywhere in the tree.

## Running tests

    npm test

or directly:

    node tests/run.js
    node tests/trail.js
    node tests/pursuit_no_bounce.js
    node tests/module_contracts.js
    node tests/interior_life.js

Pure logic tests run in Node with no dependencies. The same modules load in the browser.

For a browser boot smoke test, install the optional jsdom dependency and run:

    npm install
    node tools/boot_smoke.mjs

## Repository layout

- src/ engine and game code (ES modules, no framework, Canvas 2D)
- src/data/ game content as JSON: NPC roster, keyword matrix, item list, dialogs
- assets/ art and audio
- docs/ design documents
- tests/ test harness
- tools/ build.py, the build-time static generator

## Controls

- Arrow keys or WASD: walk
- E: interact, speak, enter, examine, or use the nearby object
- T: open the Trail panel for the next useful objective
- J: open the full case file
- I: open the satchel
- F: commit a direct crime against a nearby NPC, when possible
- Q: surrender when cornered
- Backtick: open the cheat terminal

## Known limitations

- v0.23.0 gives interiors occupants, but the deeper hourly interior schedule and room-specific patrol logic still need a later pass.
- Interiors are still single-room maps. Multi-room courthouse, Mule upstairs, private office, and back-door routes are future map work.
- Named NPCs still share generic sprites until final character sheets are ready.
- NPCs walk only the town map. Ducking indoors pauses pursuit for now.
- Saves are localStorage plus JSON export. v0.23.0 does not change the save format.

## License

GPL-3.0

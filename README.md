# CAIUCTUCUC

A single player, top down, open world supernatural mystery set in Cumberland, Maryland, in the 1850s. Ultima meets Grand Theft Auto, period appropriate: keyword conversation, hue and cry instead of a wanted meter, horses instead of cars, and a mountain that watches the town.

Part of the MBPARKS ARCADE collection.

**Version: 0.29.1** (cohesive UI skin and HUD cleanup)

## What changed in v0.29.1

This release cleans up the interface so it feels like one game instead of several feature layers bolted together. A new `src/ui_cohesion.js` module loads after the main game, Trail helper, and world expansion UI. It normalizes the header, buttons, Trail strip, Trail deck, Districts, Case Board, Law panel, Mountain status, toast messages, journal, dialog, menu, action panel, terminal, canvas frame, and footer under one frontier-ledger visual language.

The design keeps two intentional surfaces: dark brass-and-wood chrome for HUD, menus, law, travel, dialog, and action panels, and parchment paper for the journal and Trail deck. Spacing, borders, shadows, typography, button hierarchy, modal positions, and mobile wrapping now follow the same rules.

## What changed from v0.24 to v0.29

This release built the planned gameplay expansion as real playable systems.

- v0.24 Cumberland Expansion: the map loader now supports generated Tiled-compatible districts. New playable districts include Canal Basin and Wills Creek, B&O Rail Yard, Quarry Deep Cut, Wills Mountain, Marked Caves, and the Cold Cathedral.
- v0.25 Investigation Upgrade: the Case Board groups evidence cards by thread, lists open leads, and reports trial readiness from the actual evidence score.
- v0.26 Crime and Law Upgrade: the Law panel explains the current heat stage, witness coat memory, and offers real actions such as paying a runner, changing coats, and hiding on the towpath.
- v0.27 Quarry and Gantt Pressure: the quarry map now contains the singing stone, calm bootprints, gentleman boot nail, sealed seam murmur, benchmark, and Gantt presence.
- v0.28 Supernatural Systems: Mountain Attention reacts to SIGHT, night, sealed maps, benchmark progress, Nan, and the chamber.
- v0.29 Final Act Expansion: Wills Mountain, cave chain, and Cold Cathedral maps provide the marked path to Nan and the ending chamber.

The expansion UI loads after the main game and adds Districts, Case Board, Law, and Mountain status controls to the header. The normal map loader, object parser, dialog system, clue system, job system, benchmark system, wisp system, and chamber ending are used for the new districts.

## What changed in v0.23.0

This release started the Interior Life milestone. Building interiors are no longer empty rooms. The map loader decorates interiors with named NPCs and ambient occupants when the player enters them. Ambient occupants have simple keyword dialog.

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
    node tests/world_expansion.js
    node tests/ui_cohesion.js

Pure logic tests run in Node with no dependencies. The same modules load in the browser.

For a browser boot smoke test, install the optional jsdom dependency and run:

    npm install
    node tools/boot_smoke.mjs

## Repository layout

- src/ engine and game code (ES modules, no framework, Canvas 2D)
- src/game/ gameplay logic including generated districts, case board, law, and mountain attention
- src/ui_cohesion.js/ unified interface skin loaded last in the browser boot path
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
- Districts: travel to the expanded world maps
- Case Board: review evidence and open leads
- Law: manage heat, coat memory, and hiding actions
- Backtick: open the cheat terminal

## Known limitations

- The generated districts are real playable maps, but hand-authored art layouts can still make them prettier.
- District travel is header-driven for now. Later map art should add physical town exits that point to these districts.
- Interior life has occupants, but deep room-specific hourly patrols still need a later pass.
- Named NPCs still share generic sprites until final character sheets are ready.
- Saves are localStorage plus JSON export. v0.29.1 does not change the save format.

## License

GPL-3.0

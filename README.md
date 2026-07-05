# CAIUCTUCUC

A single player, top down, open world supernatural mystery set in Cumberland, Maryland, in the 1850s. Ultima meets Grand Theft Auto, period appropriate: keyword conversation, hue and cry instead of a wanted meter, horses instead of cars, and a mountain that watches the town.

Part of the MBPARKS ARCADE collection.

**Version: 0.40.0** (unified Case File)

## What changed in v0.40.0

This release removes the split between **Case Board** and **Case File**. There is now one investigation surface: **Case File**.

Keyboard **J** still opens the Case File. The Commands entry is now **Case File**, not Case Board. The old standalone Case Board modal is retired. Its deduction content now lives inside the Case File as a **Board** tab with contradictions, legal proof, true-but-not-proof supernatural material, accusation logic, evidence threads, and open leads.

This keeps notes, suspects, words, standing, and deduction in the same place, which better matches how a player thinks about the investigation.

## What changed in v0.39.0

New games now have a three-step opening flow:

1. The postcard opening screen.
2. A new backstory screen explaining Cumberland, Tam Hollis, Constable Beall, the human murder case, and the older haunting under the mountain.
3. The character creator, where the player chooses who walks into town.

The backstory screen appears only for new games, after the postcard fades and before the character creator becomes playable. Existing saves skip it. The screen is implemented in `src/opening_story.js`, loaded before `src/main.js` so it can observe the splash flow and defer the creator panel until the player continues.

## What changed in v0.38.0

This release replaces invented district labels with real Cumberland-area place names where the game has enough geographic grounding.

- The former quarry district is now **Cumberland Quarry** in the Places panel and map text.
- The quarry clue language now refers to the **Wills Creek Formation**.
- The final cave district is now **Cumberland Bone Cave**.
- The cave approach refers to **Keyser limestone**.
- The Districts button is now **Places**, and the travel modal is titled **Cumberland Places**.

Internal map ids are unchanged for save compatibility. For example, `quarry` and `cathedral` still exist as internal map keys, but visible player-facing labels now use real place names.

## What changed in v0.37.3

This release removes the remaining scheduled-NPC doorway feedback loop. Scheduled NPCs near their authored destination now settle instead of correcting back toward the exact door coordinate after doorway cleanup nudges them away.

## What changed in v0.37.2

This release fixes two map-polish problems from the street screenshot. Scheduled NPCs use a wider street-side arrival zone and a more generous settle radius so they stop pacing in tiny correction loops near door targets. Map loading also normalizes interactable placement. If an interactable prompt or icon is authored on a solid collision tile such as a roof, wall, or building mass, the loader moves it to the nearest reachable ground tile and records the original location.

## What changed in v0.37.1

This release fixes the fullscreen freeze when pressing E to talk. Fullscreen requests for `#stage` redirect to `#wrap`, keeping the canvas and every gameplay overlay inside the fullscreen element.

## What changed in v0.37.0

This release replaces the piecemeal Trail/Commands behavior with a clearer UI rule set. The Trail strip is now the only visible Trail opener and remains the current objective surface. Commands focuses on immediate actions and system/story panels.

## What changed in v0.36

The v0.36 series consolidated the command UI, restored fullscreen keyboard help, and added one-active-overlay behavior so panels do not stack on top of each other.

## What changed from v0.30 to v0.35

This release deepened the systems added in v0.23 through v0.29 and made them work together as story experience.

- v0.30 World Connections: town receives physical road exits to the canal, rail yard, Cumberland Quarry, and Wills Mountain.
- v0.31 Time-Based Interiors and Eavesdropping: key interiors gain hour-sensitive overheard conversations.
- v0.32 Case Board 2.0: the Board tab separates contradictions, legal proof, supernatural truth, accusation logic, evidence threads, and open leads inside the unified Case File.
- v0.33 Gantt Pressure: Prosper Gantt reacts to evidence weight.
- v0.34 Dog and Mountain Systems: the dog points toward the next investigative place, while Mountain Attention gains readable world effects.
- v0.35 Story Set Pieces: the records room, Coombs's grave, Tam's dry boots, the true survey line, Nan's ribbon, and trial access became physical interactables.

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
    node tests/render_integrity.js
    node tests/story_world.js
    node tests/command_center.js
    node tests/map_placement.js
    node tests/real_places.js
    node tests/opening_story.js
    node tests/case_file_unified.js

Pure logic tests run in Node with no dependencies. The same modules load in the browser.

For a browser boot smoke test, install the optional jsdom dependency and run:

    npm install
    node tools/boot_smoke.mjs

## Repository layout

- src/ engine and game code, ES modules, no framework, Canvas 2D
- src/game/ gameplay logic including generated districts, case board, law, mountain attention, and story world decoration
- src/game/generated_maps.js/ generated playable districts with real Cumberland place naming in visible labels and text
- src/game/story_world.js/ physical travel, eavesdropping, Gantt pressure, dog leads, mountain effects, and set pieces
- src/opening_story.js/ new-game backstory screen between postcard and character creator
- src/case_file_unified.js/ adds the Board tab and retires the separate Case Board modal
- src/command_center.js/ one consolidated command structure for immediate, story, and system actions
- src/ui_overlay_manager.js/ one-active-overlay coordination across panels
- src/ui_cohesion.js/ unified interface skin loaded last in the browser boot path
- src/render_integrity.js/ pixel-snapping, render artifact cleanup, fullscreen keyboard legend handling, and fullscreen overlay root handling
- src/engine/tiledmap.js/ map loading plus interactable placement normalization
- src/data/ game content as JSON: NPC roster, keyword matrix, item list, dialogs
- assets/ art and audio
- docs/ design documents
- tests/ test harness
- tools/ build.py, the build-time static generator

## Controls

- Trail strip: shows the current lead and opens the Trail deck with View Trail
- Commands: opens the unified command center outside fullscreen
- Use / Talk: interact with the nearest useful person or object
- Rob / Crime: open crime actions for a nearby NPC
- Satchel: open or close inventory
- Surrender: surrender when cornered
- Case File: one investigation file with evidence, suspects, words, standing, and Board tabs
- Places: travel to the expanded world maps
- Law: manage heat, coat memory, and hiding actions
- Mountain: review mountain attention, dog leads, and Gantt pressure
- Fullscreen, Sound, and Menu: system controls
- Arrow keys or WASD: walk
- Keyboard shortcuts still work: E, F, I, Q, T, J, and Backtick
- In fullscreen, the canvas HUD shows the keyboard legend and overlays remain visible

## Known limitations

- The generated districts are real playable maps, but hand-authored art layouts can still make them prettier.
- Real place names are now used for the quarry and final cave locations, but the mystery events themselves remain fictionalized.
- Interior life and eavesdropping are hour-sensitive, but room-specific patrol paths still need a later pass.
- Named NPCs still share generic sprites until final character sheets are ready.
- Saves are localStorage plus JSON export. v0.40.0 does not change the save format.

## License

GPL-3.0

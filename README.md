# CAIUCTUCUC

A single player, top down, open world supernatural mystery set in Cumberland, Maryland, in the year 1800. Ultima meets Grand Theft Auto, period appropriate: keyword conversation, hue and cry instead of a wanted meter, horses instead of cars, and a mountain that watches the town.

Part of the MBPARKS ARCADE collection.

**Version: 0.4.0** (pockets and workbenches: sixty items, satchel and stash, condition and repair, crafting, the counter)

## Running it

No build step is required to play the development version. Serve the repo root with any static server and open index.html:

    python3 -m http.server 8000

Then visit http://localhost:8000. The build script produces a deployable snapshot in dist/:

    python3 tools/build.py

The build stamps the version, copies src and assets, and fails if any em dash is found anywhere in the tree.

## Running tests

    node tests/run.js

Pure logic tests (save round trip, keyword gating, hue and cry decay) run in Node with no dependencies. The same modules load in the browser.

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

## Known Limitations

- v0.0.2 renders placeholder colors keyed by gid; real tilesheets are not wired yet.
- The art is generated placeholder-plus, proving the pipeline; the final art decision is open (docs/art_decision.md).
- Named NPCs share two generic sprites; per-character sheets follow the art decision.
- Interiors are single rooms; the courthouse's three chambers and the Mule's upstairs arrive with final art.
- NPCs walk only the town map; ducking indoors pauses pursuit, which players will exploit and which is acceptable for now.
- Gossip changes greetings for Peg and Beall only; the other ten react in a later pass.
- Trust rises through surrender and (soon) kept promises; most dialog trust gates are reachable only by save editing until quests land in v0.5.0.
- The constable still pursues by straight seek with wall sliding; buildings can be circled.
- The ambience is procedural wind; real audio waits for the polish pass.
- Consumables print flavor text; healing and hunger arrive with the difficulty sliders in v0.6.0.
- Wear accrues through the API and tests but no in-game action yet inflicts it; combat and hard use land later.
- The coat rack and coat items coexist; the rack will retire once wearables fully replace it.
- Trust changes from conversation choices are not implemented; gates read state but nothing raises it in play yet.
- Dialog, hue and cry, and SIGHT exist as tested logic modules but are not yet wired to the world.
- No audio yet; the mute button is present and persistent but has nothing to silence.
- Saves are localStorage plus JSON export; save format will break without migration until v0.1.0.

## License

GPL-3.0

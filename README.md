# CAIUCTUCUC

A single player, top down, open world supernatural mystery set in Cumberland, Maryland, in the year 1800. Ultima meets Grand Theft Auto, period appropriate: keyword conversation, hue and cry instead of a wanted meter, horses instead of cars, and a mountain that watches the town.

Part of the MBPARKS ARCADE collection.

**Version: 0.11.0** (the overworld pass: NES-bold palette, Zelda-grammar tiles, the in-canvas band with minimap and hearts)

## Running it

The game MUST be served over http; opening index.html straight from the disk (double-clicking it) leaves a dark screen, because browsers refuse module scripts and map data over file://. The game now detects this and says so on screen. From the repo root:

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
- The art is generated, third generation (the overworld pass, NES-bold); the final art decision is still open (docs/art_decision.md) and any option drops into the documented slots.
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
- The drover's cur sits beside its owner and goes nowhere; the dog companion arrives in v0.8.0.
- Act I closes with a banner; Act II content begins in v0.7.0.
- SNAKEOIL now heals for real; health exists, damaged by deep water, wisp snares, and hunger on hard survival.
- Marks are recorded and gossiped in Brahm's CROSSED response; their mechanical flavors (the slower sprint, the ringing ear) apply in a later pass.
- The Brahm favor path replaces the trust gate from the keyword matrix until quest-driven trust arrives in v0.7.0.
- Rank 2 murmurs exist at three placed sites; the general murmur field waits for Act IV.
- The revival fires as a scripted beat; Crane's debunk/recruit choice is deferred to the polish pass.
- Mrs. Lamar's house stands but she does not yet; the Winona thread opens in v0.8.0.
- Militia and bounty pursuers reuse the constable's sprite and seek; checkpoints as fixed posts come with final maps.
- Benchmark, Sealed Record, Chainman's Widow, Beall's Bottle, Anatomy List, No Questions, Sign Painter, The Cabin Kept, The Collection Plate, and The Magistrate's Ledger are all in.
- The character creator is in with all mechanical effects; cosmetic appearance options wait on final art.
- All four Burden quests are in. The debt cannot yet be discovered as sold to Cresap; that fold arrives post-1.0.
- Cave-Aged and The Excise Man's Arithmetic wait on Marsh and Pyle, who are post-1.0 NPCs; the caves carry their foreshadowing (the horseshoe, the casks).
- Nan appears in the chamber as prose; her sprite and the Trent farm scenes come with final art.
- Trust changes from conversation choices are not implemented; gates read state but nothing raises it in play yet.
- Dialog, hue and cry, and SIGHT exist as tested logic modules but are not yet wired to the world.
- No audio yet; the mute button is present and persistent but has nothing to silence.
- Saves are localStorage plus JSON export; save format will break without migration until v0.1.0.

## License

GPL-3.0

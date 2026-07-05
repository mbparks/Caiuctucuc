# CAIUCTUCUC Roadmap

Current: **v0.19.0**. Buildings finally read as buildings: a shingled roof with a ridge line on top, a facade with the door and windows on the ground floor, no more door floating mid-wall. Interiors are furnished with substantial two-tile pieces: rope beds under pieced quilts, writing desks, shop counters with scales, cast kitchen ranges, walnut armoires, horsehair settles, and set dining tables.

## Now, next, later

- **Now (done):** engine, Tiled pipeline, keyword dialog, hue and cry loop on Baltimore Street.
- **Next:** finish the slice's missing verbs (disguise, day and night), then grow the town and its people.
- **Later:** the case, the SIGHT, the mountain, and the ship date.

Versions are milestones, not calendar promises. Each has exit criteria; a milestone is done when its criteria pass, not when its list is merely attempted. Build to v1.0, then stop.

---

## v0.1.0, Slice Complete

The one street becomes a complete statement of the game.

- Disguise: coats as equipment, recognition profiles, changing coats drops pursuit recognition (the second escape route)
- Day and night as palette state with a world clock; lay low advances it
- NPC schedules: Peg and Beall move between post, tavern, and home by hour
- Surrender: getting caught offers surrender before the collar; gaol scene stub
- Audio stub behind the mute button: one street ambience, one tavern loop
- Save format v2 with migration from v1 (the last free format break)

**Exit criteria:** a player can commit the theft and escape three different ways (room, patience, coat); tests cover recognition math and schedule lookup; save v1 imports cleanly.

## v0.2.0, The Town

The full town proper from docs/town_map.md, still in placeholder art.

- Town map: all seven districts walkable, 22 interiors from the interior budget
- The 12 MVP NPCs placed with schedules and dialog files (Peg, Beall, Cresap, Ward, Feig, Gantt, Rood, McTeague, Coombs, Fenwick, Shanks, Bright)
- Trust as a live system: promises, deliveries, and discretion move it; the gossip network shares what it should
- Reputation displayed in the journal; prices react
- The jobs board: two honest jobs (freight, survey assist) and one dishonest (a night delivery)

**Exit criteria:** every named NPC findable by schedule at any hour; a lie to one tavern regular reaches Peg within a game day; tests cover trust deltas and gossip propagation.

## v0.3.0, First Art Pass

The art spike answered, then applied.

- Decision recorded: hand drawn, commissioned, or licensed base with custom characters
- Town tileset and the 12 NPC sprites at spec (16x16 tiles, 16x24 or 24x32 characters, 4 frame walks, idle fidgets)
- The 64 color master palette with day, dusk, night, and fog swaps
- Dithered lantern light and the parallax mountain with the quarry scar

**Exit criteria:** coats and hats distinguishable at a glance in every palette; WCAG AA contrast holds in night and High Contrast; the mountain is visible from every town screen.

## v0.4.0, Pockets and Workbenches

The material game from docs/design_doc.md Sections 12 to 14.

- Inventory: satchel slots, equip slots, the stash at the Blue Mule
- The item list implemented from src/data/items.json
- Crafting: hearth, apothecary bench, smithy; recipes as data
- Condition (Sound, Worn, Broke), field repair, craftsman restoration
- Economy pass: prices, barter, whiskey as money

**Exit criteria:** a flintlock can be worn to Broke, field patched, and restored by Feig; a meal can be cooked and a poultice crafted; tests cover wear, repair tiers, and recipe resolution.

## v0.5.0, The Drowned Man

Act I from docs/beat_sheet.md, playable start to act break.

- Quest flag engine and the journal as case file (keywords, clues, people)
- Beats P1 to 1.4: arrival, the drover (dog vignette placeholder), Tam's body, three threads, the gossip turn, Coombs
- Evidence items exist and connect: the plat scrap, the letter, the bootprints
- Cheat terminal (backtick): SNAKEOIL, SPECIE, PARDON, LANTERNS

**Exit criteria:** Act I completable at Rank 0 through any of the three threads; the journal shows the case growing; tests cover flag ordering and thread independence.

## v0.6.0, The Glimmer and the Grave

SIGHT ranks 0 to 2 and the death system.

- Rank 1 (fort sleep), Rank 2 (Brahm's ritual with its stated cost)
- Wisps with the seeded ledger table; murmurs at graves and murder sites
- Marks of the Crossing: death flow through Ward's surgery, the five Mark pool, CROSSED keyword
- Difficulty sliders live: Combat, Survival, Hue and Cry
- Hex signs and salt lines as placeable wards

**Exit criteria:** a skeptic run through Act I sees nothing supernatural and misses nothing required; a Rank 2 run hears PAPER at Coombs's grave; dying twice yields two distinct Marks and one new conversation.

## v0.7.0, Hue and Cry (the Act)

Acts II and III playable.

- Beats 2.1 to 3.4: the two investigations, the Lamar house, the Rood midpoint (savable), the revival, naming Gantt by evidence or provocation, the trial or the deal
- Trial system: evidence quality plus witness trust against Kent's disposition
- Full hue and cry: militia checkpoints at level 3, bounty men at level 4, the ferry and jurisdiction
- Side quests that feed the trial: Benchmark, The Sealed Record, The Chainman's Widow, plus The Anatomy List and Beall's Bottle

**Exit criteria:** Gantt convictable at Rank 0 by the evidence route; Rood's survival branches the back half; the deal ending reachable and poisonous; tests cover verdict math.

## v0.8.0, Under the Mountain

Act IV and the shippable endings.

- The Narrows, quarry, and cave maps; the descent with lantern and warding play
- Dog and cat companions with their vignettes and their tells
- Endings one and two: The Ledger Closed, The Buried Truth, with epilogue free roam
- Remaining v1.0 side quests: Cave-Aged, No Questions, The Excise Man's Arithmetic, The Magistrate's Ledger, Sign Painter, The Cabin Kept, Wisp Ledger, The Collection Plate, and the four Burden quests

**Exit criteria:** both endings reachable from a single save's branch point; the cat walks ahead in the caves; No Questions plays with the gravity it was written to carry.

## v0.9.0, The Polish Pass

- Audio: ambience per district, the mill wheel that stops, mute honored everywhere
- Accessibility audit against the standards: AA in all themes, focus order, reduced motion
- Difficulty and balance pass across all three sliders
- Performance: 60 fps on modest hardware, load under three seconds
- README, Known Limitations, and all docs synced; release blog post drafted

**Exit criteria:** a stranger can finish Act I without asking a question the game did not answer; the full test suite passes; the em dash count remains zero.

## v1.0.0, Ship

MVP scope from the design doc, complete: town, fort, Narrows, the mystery through Rank 2, hue and cry at all four levels, inventory and crafting, condition and repair, Marks, 12 NPCs with live trust, dog and cat, two endings. Tag, snapshot to releases/v1.0.0, publish the blog post, then stop. Cleanup pass. Archive, never delete.

---

## Post 1.0 (unordered until v1.0 ships)

- SIGHT Ranks 3 and 4, Pryor, the Parley Kept and the Opened Eye endings
- Braddock's Road, the Virginia shore band, Old Keys's dwelling, Vachon's camp
- The remaining 12 NPCs with dialog; raven and mule companions
- Upgrades (trust gated craftsman work), the silvered blade quest
- Remaining side quests: Wrong-Sized Traps, Bright's Lost Man, The Tinker's Route
- The true name, and what is actually in the chamber

## Standing risks

1. **Pixel art volume** is the schedule's long pole; v0.3.0 exists to size it early, and the licensed-base fallback stays open.
2. **Dialog writing volume**: 24 voices at 8 to 15 entries each is a book. Mitigation: the 12 MVP NPCs first, deflections before answers, and the beat sheet as the outline.
3. **Scope gravity**: the design docs describe the whole game; the roadmap ships half of it on purpose. When in doubt, the MVP cut in the design doc wins.
4. **One developer**: milestones are sized to be droppable at any exit criteria line without stranding the build.

## Working agreements (standing)

Zero em dashes, enforced by build and CI. Tests before merge. Docs synced with code. Per release snapshots. GPL-3.0 plain text. Blog draft with every release. Build to v1.0, then stop.

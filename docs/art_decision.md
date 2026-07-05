# Art Direction Decision Record

**Status at v0.3.0:** the pipeline is built and proven with generated placeholder-plus art. The final art decision (design doc Section 19) remains open with three options, and the engine is now indifferent to which is chosen: every asset is a PNG in a known slot with known dimensions.

## What the pipeline expects

- assets/tiles/tileset_{day,dusk,night,fog}.png: one row of 16x16 tiles in gid order (grass, water, treeline, ford, street, wall, stall, door, interior floor, interior wall, ruin, dock). Four files, same art, period palettes. tools/genart.py shows the LUT approach if final art is authored once and swapped programmatically.
- assets/sprites/player_{drover,frock,preacher}.png: 64x24, four 16x24 walk frames, transparent background. Facing left is a horizontal flip.
- assets/sprites/npc.png and constable.png: same format. Named NPC sheets will follow the same convention (npc_doyle.png etc.) when authored.
- assets/sprites/lantern.png: 128x128 grayscale, white where light punches through darkness, ordered dithering per the 16-bit language rule.
- assets/sprites/ridge.png: 512x28 RGBA silhouette strip, tiling horizontally, with the quarry scar.

If any file is missing the renderer falls back to flat rectangles, so partial art drops are safe.

## The open decision

1. **Hand drawn** in Aseprite: full control, slowest; the generator's palette (tools/genart.py, dict P) is the starting master palette.
2. **Commissioned**: fastest to quality; this document plus the design doc Section 19 is the commission brief.
3. **Licensed base tileset** with custom characters: cheapest; the loader is agnostic, but the palette LUTs should be re-derived from the licensed art's palette to keep period swaps coherent.

Decision owner: M.B. Parks. Record the choice here when made.

## v0.10.0 addendum: the postcard pass

The generated art moved from placeholder-plus to presentable: 16 tiles in two
animation rows (water and flowers alternate on the half second), building
facades carry window tiles whose glass is a keyed color that the night and
dusk LUTs remap to lamplight, and characters gained 1px outlines, two-tone
coat shading, a walk bob, and five hat shapes (tricorn, slouch, flat, cap,
bonnet). The splash is a generated hand-tinted postcard of the stone bridge
in the Narrows (tools/gensplash.py), after a c.1920 linen card of the same
view. The three-way final art decision REMAINS OPEN; the bar any option must
clear is simply higher now, and the slot specs above gained: tilesheets are
256x32 (16 tiles, 2 rows), and assets/splash.png is 960x640.

## v0.11.0 addendum: the overworld pass

Direction sharpened by playtest feedback with a first-quest NES screenshot on
the table: the look now speaks 1986 with an 1800 accent. Flat saturated
fields (Zelda-tan streets, vivid greens, brick red for Cumberland's walls),
trees as rounded clumps sitting on black gaps, sparse texture instead of
dense speckle, and townsfolk in bold poster cloth. The HUD moved INTO the
canvas as a 48px black band: gray minimap with a green player dot, heat word,
gold coin counter, day and hour, coat and controls, and HALE in red pixel
hearts drawn rect by rect. The band is part of the game screen the way the
NES band was, and the camera viewport shrinks to honor it. Final art decision
STILL OPEN; any hand-drawn or licensed replacement should keep this palette
discipline and the band.

## v0.12.0 addendum: the mood pass

Playtest verdict: too bright and cheery, wrong for a supernatural mystery in
1800 Cumberland, and every NPC was a recolored clone. Corrected. The palette
moved from NES-saturated to an overcast river-valley dusk: muted sage greens,
wet-earth streets, weathered brick, a cool slate creek, and a day LUT that is
itself overcast. Characters gained real silhouette variation: five builds
(broad, lean, tall, stoop, short) plus hair color and a carried prop (cane,
satchel, apron, book, pipe, staff), so all sixteen townsfolk now have unique
shapes, verified by an alpha-decode test in the boot harness. Each reads as
their trade: the surgeon's satchel, the smith's cap and heavy build, the
magistrate's stovepipe and cane, the widow's bonnet and besom. The player's
three trade forms (drover, frock, preacher) also differ in build and prop.
Final art decision STILL OPEN; this is the mood any replacement should hold.

## v0.13.0 addendum: furnished interiors

The interiors were empty boxes. Now they carry decor: sixteen new furnishing
tiles (gids 17 to 32, transparent-backed so the floor shows through) placed on
a per-interior decor tile layer, chosen by building type. Each piece also
plants an examinable "oddity" interactable with a line of Mountain Maryland
flavor, the weird and beautiful non-interactive detail: two-headed trout in
the surgeon's jars, the anvil that rings on the right wind, the widow's hex
signs and dangling roots, quartz from the mountain that stays cold in the
hand, the overshot coverlet on the loom. Functional objects always outrank
oddities in the proximity picker. The hanging tin lantern flickers on the
animation row. Final art decision STILL OPEN; the decor slots follow the same
drop-in convention.

## v0.13.1 addendum: the peopled world

Three complaints, three fixes. (1) The outdoor world was empty and repetitive:
sixteen new outdoor decor tiles (gids 33 to 48: well, market cross, fences,
gardens, gravestones, signpost, cartwheel, barrels, woodpile, crates, bush,
pump, lamppost, trough, stump) now scatter across a town decor layer, with
hand-placed landmarks (the market well and cross, the churchyard graves, the
wagon-yard clutter, garden plots behind the houses) and deterministic scatter
elsewhere. (2) Every building read the same: each shop now hangs a
distinguishing sign by its door (anvil at the smithy, jars at the surgery,
altar at the kirk, barrels at the inn). (3) Interactables were generic yellow
squares: twenty-four hand-drawn 16x16 icons now render per type, so a clue
looks like a sealed letter, a purse like a purse, a station like crossed
tools, the ferry like a boat, a benchmark like a brass disk. Final art
decision STILL OPEN.

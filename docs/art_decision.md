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

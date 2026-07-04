# Asset Pipeline

- Sprites: Aseprite, exported as PNG sheets. Characters 16x24 (24x32 for named NPCs if hats demand it), 4 frame walk cycles minimum plus idle fidgets.
- Tiles: 16x16 base tiles, authored in Aseprite, mapped in Tiled, exported as JSON.
- Palette: master palette of 64 colors, see docs design doc Section 19. Day, dusk, night, and fog are palette swaps. Every effect must be expressible in the 16 bit visual language.
- Audio: OGG, short loops, mute button honored everywhere.

Nothing binary is committed yet; this file holds the contract.

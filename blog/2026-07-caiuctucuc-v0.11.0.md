# CAIUCTUCUC v0.11.0: The Overworld Pass

*Draft for greenshoegarage.com, with release v0.11.0*

My playtester put a screenshot of the first quest of The Legend of Zelda on the table and said: this, but obviously 1800 Cumberland. Which is one of the great art directions of all time, because the 1986 overworld is a masterclass with a four-color budget: flat saturated fields, shapes so chunky they read from across a room, black used as a color, and a HUD that is not chrome around the game but part of the screen itself.

So the palette went bold. Streets are Zelda-tan. Grass is vivid green with the speckle count cut to a whisper, because NES fields are flat and confident, not busy. Trees became rounded clumps sitting on pools of black shadow, two lobes and a crown highlight, and a row of them now reads exactly like the forest edge that taught a generation what a forest edge looks like. Cumberland's buildings went brick red with mortar courses and a hard black base shadow, which is both the Zelda dungeon-brick move and, conveniently, what the actual town was building with in 1800. The creek is bright blue with white wave ticks. The townsfolk traded their homespun for poster cloth: Doyle in tavern red, Beall in constable blue, Cresap in magistrate purple, Fenwick in a plum you can see coming, which, if you know Fenwick, is characterization.

And the HUD finally moved where it always belonged: into the screen. A 48 pixel black band across the top of the canvas, drawn rectangle by rectangle every frame: the county as a gray field with you as a green dot, your heat as a word that shades from QUIET green to BOUNTY red, your silver behind a little gold coin, the day and the hour, your current coat, and on the right, in red, the word HALE above two rows of pixel hearts, filled and hollow. They are real hearts, six fillRects each, and the camera viewport shrinks to honor the band exactly the way the NES did it. The old HTML status bar is retired with a comment thanking it for its service.

The splash postcard stays; a game can open on 1920 and play in 1986 and be set in 1800, and honestly that sentence is the whole project.

One hundred eleven tests, including one that confirms the minimap dot cannot escape the county. The final art decision remains open on record, but the direction is no longer in question.

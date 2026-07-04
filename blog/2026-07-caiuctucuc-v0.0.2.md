# CAIUCTUCUC v0.0.2: The Map Learns to Read

*Draft for greenshoegarage.com, with release v0.0.2*

Small release, big hinge. The game no longer carries its world around as a hardcoded array; it reads Tiled JSON exports. Ground and collision are separate layers, spawn points and NPCs are map objects with properties, flip flags are masked, infinite maps are politely refused, and out of bounds is always solid so no map ever needs a wall of trees to be safe.

The same little fellow in the red hat crosses the same creek at the same ford, but now the ford exists because a map file says so, which means the next town I draw in Tiled just works. Peg Doyle stands in the test field as a beige rectangle, waiting for the dialog system. Sixteen tests, all green, including one that will fail the build if the map format ever lies to us.

Next: keyword dialog, and Peg gets her voice.

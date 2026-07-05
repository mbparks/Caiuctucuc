# CAIUCTUCUC v0.10.0: The Postcard Pass

*Draft for greenshoegarage.com, with release v0.10.0*

My playtester's verdict on v0.9 was direct: a visual mess, bland, tiny, nothing like a video game. The playtester is me from twenty minutes earlier, and also right. So this release is entirely about the eyes, and it starts with a postcard.

There is a c.1920 linen postcard of the old stone bridge carrying the National Highway over Wills Creek in the Narrows: hand-tinted sky going peach at the horizon, hazy blue canyon wall, a dark little horse and gig crossing the deck, red letterpress caption. The game now opens on a generated homage to it, cream border and linen texture and all, with the title set in postcard red across the top and PRESS ANY KEY where the postage instructions would go. One Python script paints the whole card: gradient sky, blurred cloud masses, two canyon walls, three arches with their reflections, seven hundred flecks of stonework. It is the best thing a generator has produced for this project and it sets the tone before a single tile draws.

Then the tiles earned the tone. The set doubled to sixteen with a second animation row: the creek actually moves now, wildflowers sway on the half second, the meadows scatter tufts and tall grass by position hash so no two fields repeat, trees are proper canopies with trunks and highlights, and buildings stand on stone foundations with framed windows along their facades. The windows are the trick I am proudest of: the glass is one keyed color, and the night and dusk palette LUTs remap exactly that color to lamplight. Walk Baltimore Street at dusk and the town lights up, for free, through the same SNES palette-swap machinery that has been there since v0.3.

The sprites got the Zelda treatment: a one pixel outline so every figure pops off the ground, coats shaded light-to-dark with buttons, a walk bob, and five hat shapes, so Brahm finally wears her bonnet, Feig his fur cap, the preacher his flat brim, and Beall stopped borrowing the generic sprite and got his own blue coat and tricorn. The HUD became a proper engraved plaque, double-ruled, with your health as a row of diamond pips and the hue and cry badge shading from hedge green through bounty red.

And the play area: the default scale mode is now Fill the Room, using every pixel the stage offers, with Crisp Pixels one menu tap away for the integer-scaling purists, which is to say, for me on alternating days.

One hundred nine tests, including one that measures the postcard. The final art question stays open on the record, but the bar just moved.

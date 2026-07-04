# CAIUCTUCUC v0.0.3: Peg Gets Her Voice

*Draft for greenshoegarage.com, with release v0.0.3*

The game can now hold a conversation, which in this design is most of what a game is.

Walk up to Peg Doyle in the test field, press E, and the Blue Mule's keeper looks up from the taps. You ask in words, Ultima style: tap a keyword from your journal or type one cold. Ask her about the TOWN and she mentions the FORT and the CREEK, and both words drop into your journal, because in this game any capitalized word an NPC speaks is yours to keep. The journal is the case file. Conversation is collection.

The gates work too. Ask Peg about a certain GENTLEMAN as a stranger and you get a look that says not to you, not today. Earn a little standing with the road trade and the same word costs two silver, because Peg sells information the way she sells beer, and the price does not come down at closing.

Under the hood the dialog engine is pure functions with no DOM in them, so the same code that runs the tavern runs in the test harness. Twenty two tests, all green, including one that makes sure Peg refuses an empty purse.

Next: the vertical slice. One street, one crime, one chase, one change of coat.

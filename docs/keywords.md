# CAIUCTUCUC
## Keyword Vocabulary Matrix

**Companion to Design Document v0.3.0, Beat Sheet v0.1.0, Map Layout v0.1.0**
Keyword Matrix v0.1.0
Author: M.B. Parks
Date: July 2026

---

## 1. System Rules

**How keywords work.** Conversation is Ultima-style: the player selects (or types, on desktop) a keyword, and the NPC responds from their vocabulary. Keywords are learned by hearing them: any capitalized term an NPC speaks is added to the journal's keyword list automatically, so the journal is also the case file. Every NPC answers NAME, JOB, and BYE. Beyond that, silence is information: what someone refuses to discuss is a clue.

**Gate types.** Each keyword response per NPC has one gate:

- **Open.** Answers freely.
- **Trust.** Answers only above a personal trust threshold (three bands: stranger, known, trusted).
- **Reputation.** Answers only above a faction standing (Town, Kirk, Hills, Road).
- **SIGHT.** The keyword itself only exists for the player at the given rank.
- **Flag.** Requires a quest flag (LEDGER, SEAM, WARRANT, WINONA, or a beat-specific flag).

**Deflections teach.** A gated response is never a dead "I don't know." It deflects toward the source: "That's Peg's business to tell," or "Ask the widow, if she'll have you." The gossip network doubles as the hint system.

**The lie mechanic.** A handful of NPCs answer certain keywords falsely at low trust (marked LIE below). The false answer is consistent and checkable against other sources, which is how the player learns who lies.

**Budget.** Roughly 40 world keywords plus per-NPC signatures. Named NPCs carry 8 to 15 responses each; generic townsfolk share a district pool of 5.

---

## 2. Keyword Glossary

### Tier 1: Universal and Town (open to all, learned in the Prologue)

| Keyword | What it opens | Notes |
|---|---|---|
| NAME | Introduction | Marked players hear comments on scars at 2+ Marks |
| JOB | Their work, and the jobs board hook | Merchants quote reputation-tinted prices here |
| TOWN | Local color, current mood | Response text shifts with the town Fear meter |
| FORT | The ruins | Everyone deflects slightly; Beall deflects hard |
| MOUNTAIN | Wills Mountain | Hills folk answer, town folk change the subject |
| CREEK | Wills Creek, fords | Ferrymen and dock folk detail the fords |
| QUARRY | The workings | Open until Beat 1.1, then trust-shaded |
| ROAD | Braddock's Road, the wagon trade | Bright's domain |

### Tier 2: Investigation (learned in Acts I and II, flag-gated by case progress)

| Keyword | What it opens | Key responders |
|---|---|---|
| TAM | The drowned man | McTeague (trust), Peg (open), Coombs (until 1.4) |
| DROWNED | The impossible detail: dry boots | Ward (open, clinical), Beall (trust) |
| SINGING | What the quarrymen heard | McTeague (trust, launches the phrase), quarry workers (drunk only) |
| PLAT | The survey line | Rood (trust), Gantt (LIE), Kent (flag: WARRANT) |
| SURVEY | Gantt's work and history | Gantt (LIE, smooth), Freeman (open, remembers the chainmen) |
| LEDGER | The fort ledger and erasures | Rood (trust), Pryor (Rank 3) |
| PAPER | The murmured word at Coombs's grave | SIGHT Rank 2 to learn; Fenwick (trust) knows what paper |
| GENTLEMAN | Tam's letter phrase | Peg (Road rep), his sister by post (TONGUE) |
| GRAVES | Coombs's trade, the empty ones | Coombs (LIE until trusted), Fenwick (flag), Ezra's murmur (Rank 2) |
| LIST | Fenwick's procurement list | Fenwick (trust or theft), Rood is on it |
| MEASURES | Rood's dying clue | Rank 2 if Rood dies; narrows suspects to two |
| BOOTS | The calm prints at the deep cut | WOODSMAN 2+ to learn; Feig can match maker's nails (trust) |

### Tier 3: Supernatural (SIGHT-gated; the second conversation layer)

| Keyword | Gate | What it opens |
|---|---|---|
| SEEN | Rank 1 | Asks anyone what they have seen and won't say. Beall breaks slowly here. Crane panics. |
| MURMUR | Rank 2 | Discuss the voices. Brahm teaches, Lamar confirms, Nan Trent goes silent in the wrong way. |
| HEX | Open, deepens at Rank 2 | Brahm (open), Trent (guilt), the farm pattern |
| SALT | Open | Warding basics; Brahm and, surprisingly, Marsh (cave lore) |
| WARD | Rank 2 | The doctor's name is also the verb. Deliberate. Lamar uses the pun bitterly. |
| WINONA | Flag: token | The legend inverted. Lamar (source), Old Keys (trust), Leap site itself |
| LEAP | Open | The tourist version of the legend from anyone; the true version lives under WINONA |
| SPRING | Rank 2 + flag: SEAM | The Rank 3 threshold choice, named |
| RITUAL | Trust with Brahm | The Rank 2 offer and its stated cost |
| CROSSED | First death | Hills faction recognition; Brahm, Old Keys, Lamar respond; town folk hear nonsense |
| KEYS | Open | The elder's settler name; his deflections at low trust are the game's best writing budget |
| 1755 | Flag: LEDGER + Rank 2 | The garrison year. Kent flinches. Pryor answers fully at Rank 3. |
| ELEVEN | Rank 3 | The lost men. Pryor's count. Speaking it to Kent unseals him or breaks him, by trust. |

### Tier 4: Underworld and Faction (reputation-gated)

| Keyword | Gate | What it opens |
|---|---|---|
| WHISKEY | Road rep | Trade talk shading into Marsh's still at higher standing |
| STILL | Road trusted | Location, and eventually the caves |
| EXCISE | Open | Pyle's job; at Road rep, Pyle's skimming |
| FREIGHT | Open | Honest hauling; at Road rep, the other manifests |
| FERRY | Open | Schedules; at Road rep, NIGHT |
| NIGHT | Road rep with Shanks | No-questions crossings |
| PAPERS | Trust with Freeman | The forgery thread; a warrant-Burden player unlocks this fastest |
| REVIVAL | Open in Act II | Crane's meetings; Kirk rep shifts by the player's stated stance |
| BOUNTY | Hue and Cry 4 | Manhunter talk; usable to mislead them at high TONGUE |

### Tier 5: Endgame (Act IV; listed for completeness, content reserved)

TOKEN, SEAM, GARRISON, PRYOR, NAN, and the elder's true name (redacted in all documents; it is learned only in play, spoken only in the chamber, and deliberately never written in the journal).

---

## 3. Signature Keywords by NPC

The one keyword per named NPC that unlocks their secret, with its gate:

| NPC | Signature keyword | Gate |
|---|---|---|
| Cresap | LEDGER (his own bribe ledger, a homonym trap with the fort ledger) | Flag: WARRANT + evidence |
| Beall | SEEN | Rank 1 + trust |
| Peg Doyle | GENTLEMAN | Road rep + coin |
| Shanks | NIGHT | Road rep |
| Feig | IRON | Trust (the previous cold iron customer) |
| Ward | WARD | Rank 2 (the pun confrontation) |
| Lamar | WINONA | Flag: token |
| Crane | SEEN | Trust after the revival beat |
| Old Keys | KEYS, then his true name | Highest trust in the game |
| Brahm | RITUAL | Trust |
| Gantt | PLAT | He lies; the keyword exists to catch the lie |
| Fenwick | LIST | Trust or theft |
| Pyle | EXCISE | Road rep |
| Marsh | STILL, then CAVES | Road trusted |
| Coombs | GRAVES | Trust (window closes at Beat 1.4) |
| Freeman | PAPERS | Trust |
| McTeague | SINGING | Trust or shared drink |
| Rood | LEDGER | Trust |
| Josiah Trent | HEX | Guilt, opens after second livestock loss |
| Nan Trent | MURMUR | Rank 2, and gently |
| Bright | ROAD, then the name of the man he lost | Trust |
| Kent | 1755 | Flag + trust, or pressure via his sealed record |
| Vachon | TRAPS | Trust, or presenting what one caught |
| Pryor | Any Tier 3 keyword | Rank 3; he is the vocabulary's floor rising to meet you |

---

## 4. Design Notes

- **Homonyms are load-bearing.** LEDGER means two documents, WARD is a doctor and a verb, KEYS is a man and, in the chamber, not. The keyword system can do wordplay that menu dialog cannot, and the mystery leans on it.
- **The journal is the detective board.** Learned keywords sort by tier and gray out when exhausted per NPC, so completing the case reads as literally filling a vocabulary.
- **Rank 0 completability check.** Tiers 1, 2, and 4 suffice to catch Gantt: SINGING, PLAT, BOOTS, GENTLEMAN, LIST, and GRAVES form the mundane evidence chain with no Tier 3 keyword required.
- **Voice budget.** Deflection lines are where character lives. Budget more writing for refusals than for answers.

---

## License

GPL-3.0

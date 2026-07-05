# CAIUCTUCUC

**Era note (v0.14.0):** the setting is deliberately vague mid-1850s Cumberland, not a hard 1800. The C&O Canal has reached the town (1850) and the B&O Railroad has run through for a decade (1842), so canal boats, a lock, rail sidings, and coal sit alongside the older fort-and-quarry history in living memory. Keep player-facing dates soft; the fort backstory (1755) and other historical anchors remain fixed.

## A Cumberland Supernatural Mystery

**Design Document v0.3.0**
Working titles: CAIUCTUCUC, WILLS CREEK, THE NARROWS
Candidate for the MBPARKS ARCADE collection
Author: M.B. Parks
Date: July 2026

Changelog:
- v0.3.0: Added Death and the Marks of the Crossing (Section 6), Condition, Repair, and Upgrades (Section 13), and Art Direction (Section 19). Death no longer reloads a save on any difficulty. Threaded the CROSSED keyword and Mark awareness through SIGHT and NPC sections. Renumbered later sections.
- v0.2.0: Added Pets and the NPC, Trust, and Reputation systems with the full named roster.
- v0.1.0: Initial compilation from brainstorming sessions.

---

## 1. Concept

A single player, top down, open world exploration game set in Cumberland, Maryland in the year 1800. A supernatural mystery drives the main plot while systemic freedom drives everything else. The design target is Ultima meets Grand Theft Auto, translated into period appropriate mechanics: keyword driven conversation, a living town with crime and consequence, horses instead of cars, and a hue and cry system instead of a police wanted meter.

Unlike the interactive paintings elsewhere in the ARCADE, this is a real game with real systems. Combat exists but is mostly avoidable. The player sets their own difficulty across three independent sliders and can change them at any time without penalty.

### Design pillars

1. **The mystery is solvable at any level of belief.** A pure skeptic can finish the game as a crime story. A believer gets the full picture. The SIGHT system is the dial.
2. **Every system offers a nonviolent verb.** Talk, sneak, flee, bribe, disguise, or surrender are always on the table. Difficulty changes the cost of failure, never the availability of options.
3. **Small inventories, meaningful items.** More Zelda than Skyrim. Every item is usable, tradeable, or readable. Nothing exists only to sell.
4. **Place is the protagonist.** Real Cumberland geography, real 1800 texture: the ruined fort, the Narrows, Wills Creek, the Potomac, German hexerei, Shawnee memory, and the frontier economy of a town staging wagons for the Ohio country.
5. **People remember.** Heat fades; reputation and trust do not. You can bribe away a wanted level. You cannot bribe away being known as an oathbreaker.
6. **The story always continues.** Death is a cost and a mark, never a reload. The world in 1800 does not offer second drafts, only scars.

---

## 2. Setting and Tone

Cumberland, the 1850s. Fort Cumberland is long gone, its logs scavenged, only Washington's old headquarters cabin still standing on the rise. The town is the great gateway west: Braddock's Road (1755) and after it the National Road (reaching Cumberland in 1818) both begin here, the C&O Canal ends here at its basin (1850), and the B&O Railroad has run coal to Baltimore for a decade. Wagons, canal boats, and coal cars all meet in one valley. German and Scots-Irish folk beliefs collide with Shawnee legends the settlers half remember and fully misunderstand. Fog rolls off the Potomac, and something older than any road stirs under the mountain.

Supernatural register: theatrical and uncanny in the Melies tradition. Hand tinted, lantern lit, strange rather than gory.

### The mystery arc

Something old under Wills Mountain is waking as the town digs, quarries, and clears land. Three factions read it differently:

- **The town elders** want it buried and forgotten.
- **A traveling revivalist** wants to exploit it.
- **A Shawnee elder** still living in the hills knows what it actually is.

Keyword conversation (CREEK, FIRE, WINONA, SURVEY, SEEN, CROSSED, and so on) lets the player pull threads from anyone in town. The mundane ending is reachable at SIGHT Rank 0. The full picture requires Rank 2. The true ending branch requires Rank 3 or higher.

---

## 3. Character Creator

Three choices at creation, each mechanically meaningful.

### Origin (gates dialog keywords and starting reputation)

- Tidewater gentry fallen on hard times
- German immigrant craftsman
- Freed Black tradesman
- Continental Army veteran
- Scots-Irish drover

### Trade (starting skills and tools)

- Surveyor
- Apothecary
- Gunsmith
- Preacher
- Trapper

### Burden (seeds the personal thread into the main mystery)

- Debt
- A warrant back east
- Second sight (starts at SIGHT Rank 1)
- A dead sibling's unfinished letter

Cosmetic appearance options ride on top: build, face, hair, and starting coat and hat (which matter, see Disguise). The creator also displays any Marks of the Crossing earned in play, since scars become part of the character's face and gait.

---

## 4. The World

One contiguous top down map.

- **Town proper.** Baltimore Street taverns, market square, courthouse, docks on Wills Creek.
- **Fort Cumberland ruins.** Haunted centerpiece. Washington's old cabin stands intact. Sleeping here can awaken SIGHT.
- **The Narrows and Wills Mountain.** Lovers Leap, cliff caves, will o wisps, and the thing beneath.
- **Outlying farms and mills.** German hex signs, missing livestock, the hexerei widow.
- **The Potomac and the Virginia shore.** Crossing the river drops the hue and cry, since Maryland constables have no jurisdiction. This is the period appropriate leave the city mechanic.
- **Braddock's Road west.** The wild edge of the map, where the mystery goes underground.

---

## 5. Difficulty

Three independent sliders, set at creation, changeable anytime in settings, no penalty.

### Combat

- **Storied.** Enemies telegraph heavily. The player cannot die, only get knocked senseless, waking at the tavern minus some coin. No Marks are earned on Storied.
- **Frontier.** Standard. Death is possible and leaves a Mark (Section 6).
- **Perilous.** Scarce ammo. Wounds linger and need an apothecary or poultice. Death carries a steeper fee and a longer recovery debuff.

Death never reloads a save on any setting. The story always continues.

### Survival

- **Off.** Food, sleep, and cold do not matter.
- **Buffs.** They grant bonuses when tended.
- **Hard.** They are requirements.

### Hue and Cry

Controls how fast heat builds and decays, how sharp constable memory is, and whether bounty hunters pursue across the river (hardest setting only).

---

## 6. Death and the Marks of the Crossing

On Frontier and Perilous, dying means waking at Dr. Ward's surgery, minus his fee and a day of game time. Perilous makes the fee steeper and adds a longer recovery debuff. There is no save reload and no fail state.

### The Marks

Each death leaves one permanent scar, drawn from a small pool:

- A limp (slightly slower sprint)
- A tremor in the off hand (slightly slower reload)
- A white streak in the hair (cosmetic, gossiped about)
- A visible scar (cosmetic, shown in the character creator)
- An ear that rings near cold spots (accidentally a weak ghost detector)

Each Mark has a tiny mechanical flavor, nothing build breaking. Marks cap at five. After the fifth, deaths still cost fee and time but scar nothing new. SNAKEOIL heals fully but never removes Marks. Cheats touch health, money, and heat only.

### The dead know

The thematic payoff. At SIGHT Rank 2 and above, the murmurs single out a player who has died. The cat stares at them for a full day after each death. Ghosts at Rank 3 address a marked player differently, and Corporal Pryor knows a much-marked player's name before they give it.

A new keyword, CROSSED, opens with certain NPCs after the first death. Widow Brahm, Old Keys, and Mrs. Lamar all recognize someone who has been to the far bank of the river. A much-killed player paradoxically earns trust with the Hills faction, while the town gossips that they never look quite well anymore. Death is a minor cost and a minor identity, never a punishment spiral.

---

## 7. Crime and Consequence: Hue and Cry

Crime raises HUE AND CRY through four levels:

1. **Gossip.** Prices worsen, doors close.
2. **The constable.** Active pursuit in town.
3. **Militia muster.** Armed groups sweep the district.
4. **Posted bounty.** Professional manhunters take the contract.

Reduction methods: lay low in a tavern, bribe the magistrate, change coat and hat, tear down your own wanted bills, or ford the Potomac.

Hue and cry is hot, temporary, legal heat. Reputation and trust (Section 11) are the cold, permanent ledger underneath it.

### Disguise

Every coat and hat combination has a recognition profile. Changing clothes drops recognition during hue and cry, making the inventory itself a gameplay verb. A stolen militia coat is an instant disguise with its own risks.

### Surrender

Surrendering is a real option leading to jail gameplay rather than a fail state, with an escape or trial sequence. Trial outcomes depend on witness trust (Section 11).

---

## 8. Combat (When Chosen)

Deliberate and readable. Turn based or pause and act, never twitchy. Flintlocks take realistic seconds to reload, so every shot is a decision. Melee is mostly shoves and brawls, and knocking someone down usually ends the fight. Reaction checks driven by reputation and origin let a preacher defuse a drunk mob or a veteran stare down a highwayman. Terrain escapes: lose pursuers in the Narrows caves or by swimming Wills Creek. Lantern and sightline stealth suits the top down view.

---

## 9. Economy

Spanish silver dollars plus barter. Whiskey is currency, bribe material, and firestarter all at once.

**Honest work.** Surveying plots, hauling freight, fishing, foraging, smithing repairs.
**Dishonest work.** Whiskey smuggling past excise men, forging excise stamps, grave robbing for a Philadelphia anatomist.

Horses replace cars: stealable, each with its own temperament, and a horse adds saddlebag inventory slots.

---

## 10. Pets (Optional Companion)

Entirely optional, with zero penalty for playing petless. No pet is handed to the player. Each is found through a small vignette in the world, so choosing one (or none) is a story moment. One pet accompanies the player at a time; the others remain in the world and remember whether they were fed.

### The four companions

- **Dog.** A drover's cur, orphaned when its owner dies in the opening act. Tracking assist, growls when hostiles or wisps are near, can be sent to fetch small items. The all-rounder.
- **Cat.** Haunts the fort ruins and adopts the player if they sleep there. Worthless at commands, but rats and revenants alike keep their distance. Quietly the best warding item in the game, and the only pet that perceives things at SIGHT ranks above the player's own. Stares at the player for a full day after each of their deaths.
- **Raven.** Freed from the trapper Mal Vachon's cage. Scouts ahead to reveal map fog, and steals one small shiny item per day, which is occasionally a crime the player gets blamed for.
- **Mule.** Bought or won at cards. Not affectionate, but doubles saddlebag capacity and refuses to walk into supernatural danger, which observant players learn to read as a detector.

### Design rules

- Pets cannot die. When hurt they flee and return to the player's stash location, Storied-style regardless of difficulty setting.
- Pets never solve puzzles. They only hint.
- Pet reactions are a cheap, readable tell for the mystery: the dog will not enter a certain barn, the cat stares at a blank wall in the courthouse.

---

## 11. NPCs, Trust, and Reputation

How people feel about the player is split into three layered systems, each doing one job.

### 11.1 Reputation (public, factional)

Four tracked standings:

- **Town.** Elders, merchants, the court.
- **Kirk.** The revivalist's flock.
- **Hills.** The Shawnee elder, the hexerei widow, trappers, and the folk who live outside town order.
- **The Road.** Smugglers, drovers, the tavern underworld.

Deeds move standings, often in opposition: busting a still pleases Town and burns The Road. Reputation gates prices, job offers, dialog keywords, and which ending factions will deal with the player. Generic townsfolk react to the player's reputation tier rather than knowing them personally.

### 11.2 Trustworthiness (personal, per NPC)

A hidden per-character value for each named NPC. It moves on kept promises, returned property, honest testimony, discretion with secrets, and whether the player was seen doing what they claimed. Lying works, until the person lied to compares notes with someone else. NPCs share information along realistic gossip lines: tavern regulars talk to each other, the widow talks to no one.

### 11.3 Mechanical hooks

- High trust with a witness gets testimony at trial (ties into the surrender and jail system).
- Low Town reputation makes the constable escalate hue and cry faster.
- The Rank 3 SIGHT problem (knowing who the killer is but being unable to prove it) becomes a trust problem: only NPCs who trust the player will act on claims without evidence.
- Some keywords only unlock at high trust. The Shawnee elder's true name is one of them.
- Master-tier upgrades (Section 13) are trust-gated. Craftsmen do their best work only for people they trust.
- The CROSSED keyword (Section 6) shifts trust with the Hills faction after the player's first death.

### 11.4 Named NPC roster (24)

Each named NPC has a keyword vocabulary, a daily schedule (home, work, tavern, kirk), and one secret.

1. **Magistrate Ezekiel Cresap.** Takes bribes. Secret: keeps a ledger of every bribe, including who paid.
2. **Constable Amos Beall.** Dogged, tired. Secret: saw something at the fort years ago and drinks to forget. A potential Rank 1 witness.
3. **Peg Doyle,** keeper of the Blue Mule tavern. Secret: runs the gossip network deliberately and sells information in both directions.
4. **Old Toby Shanks,** ferryman. Secret: smuggles people across the Potomac at night, no questions asked.
5. **Gunther Feig,** blacksmith. Secret: forged a cold iron blade once before, for a customer who died.
6. **Dr. Silas Ward,** physician and apothecary. The player wakes at his surgery after death. Secret: the one dosing a patient with laudanum to keep her blind.
7. **Mrs. Charity Lamar,** widow of the quarry owner. Secret: has involuntary SIGHT at Rank 3. Dr. Ward keeps her sedated for her own good, he says.
8. **Brother Jubal Crane,** traveling revivalist. Secret: a fraud who has genuinely seen the thing and is privately terrified.
9. **The Shawnee elder,** called Old Keys by the settlers. Secret: his true name, shared only at the highest trust, is a keyword that matters under the mountain.
10. **Widow Adelheid Brahm,** hexerei practitioner. Teaches the Rank 2 ritual. Secret: the ritual costs her memory too, and she is slowly forgetting her husband.
11. **Prosper Gantt,** surveyor. Secret: falsified a plat line that put the quarry on the mountain in the first place.
12. **Lyle Fenwick,** the anatomist's agent. Secret: his procurement list includes a name belonging to someone not yet dead.
13. **Officer Nathaniel Pyle,** excise man. Secret: skims from seizures and resells through The Road.
14. **"Uncle" Robey Marsh,** still operator. Secret: ages his whiskey in the cliff caves and knows the tunnel network better than anyone living.
15. **Ezra Coombs,** gravedigger. Secret: some graves are empty, and not because of Fenwick.
16. **Isaiah Freeman,** cooper, a freed tradesman. His warrant trouble mirrors the player's burden. Secret: forges freedom papers for others passing through.
17. **Duncan McTeague,** quarry foreman. Secret: ordered digging past the platted line after his men reported singing in the rock.
18. **Pelham Rood,** schoolmaster and part-time court clerk. Secret: transcribing the old fort ledger and finding deliberate erasures.
19. **Josiah Trent,** miller. Secret: painted over his mill's hex sign to look modern; the livestock losses started after.
20. **Nan Trent,** the miller's daughter. Secret: hears the murmurs (untrained SIGHT) and tells no one.
21. **Captain Hosea Bright,** wagon master. Secret: refuses Braddock's Road after dark; lost a man out there once and lied about how.
22. **Judge Aurelius Kent.** Secret: presided over an old case tied to the fort, and the record is sealed by his own hand.
23. **Marie-Louise "Mal" Vachon,** trapper. The raven's former captor. Secret: her traps in the high hollows are not sized for fur animals.
24. **Corporal Enoch Pryor,** deceased, author of the dead man's daybook. Speakable only at SIGHT Rank 3. Secret: what the garrison buried, and why the ledger pages were torn. Knows a much-marked player's name before they give it.

---

## 12. Inventory

A satchel of 12 to 16 slots plus dedicated equip slots: weapon, coat, hat, boots, lantern. No weight math, no grid puzzles. A rented room or homestead chest serves as the stash. Target item count for the whole game: roughly 60.

### Item list

**Weapons and tools (10)**
Flintlock pistol, fowling piece, Pennsylvania rifle (slow, precise), belt knife, tomahawk, walking stick or cudgel, silvered blade (crafted, quest), surveyor's compass, fishing line, lockpicks (bent awl).

**Wearables (12)**
Coats: drover's duster, gentleman's frock, preacher's black, trade smock, militia coat. Hats: tricorn, slouch hat, clergy hat, fur cap. Boots: riding boots, moccasins (quieter), work boots.

**Consumables (14)**
Johnnycake, salt pork, stew, apple brandy, whiskey, poultice, tonic, laudanum (heals big, blurs SIGHT visions for a day), coffee (shakes off laudanum or drunkenness), tallow candle, lantern oil, powder and shot, salt pouch, dried sassafras.

**Warding and supernatural (10)**
Hex sign (painted, placeable on buildings), salt line (consumable barrier), cold iron nail, silver dollar (currency and improvised shot when desperate), witch bottle, grave dirt, rowan sprig, blessed water, spirit board fragment (quest), the Winona token (main quest).

**Quest and world (14)**
Deeds, letters, survey plats, a dead man's daybook, fort ledger pages, keys, wanted bills, Shawnee wampum record, anatomy list, excise stamps, and several mystery objects defined in the quest outline.

---

## 13. Condition, Repair, and Upgrades

### Condition: three states, no durability math

Every tool and weapon is **Sound**, **Worn**, or **Broke**. Worn imposes one small penalty (misfire chance, dull edge, sticky lock picks). Broke means unusable but never destroyed, consistent with archive-not-delete as a design philosophy. Wear accrues from use; hard use (rain on a flintlock, prying with the belt knife) accelerates it. The UI shows state with a simple icon, no numbers.

### Repair: two tiers

- **Field repair.** A small tool roll (whetstone, oil rag, awl) restores Broke to Worn anywhere. Quality is gated by HANDS rank.
- **Full restoration** to Sound requires the right craftsman: Feig for metal, the trade smock crowd for leather and wood, and Dr. Ward, oddly enough, for the surveyor's compass. A wilderness expedition can limp home but cannot stay pristine, which gently pulls players back to town and its NPCs.

### Upgrades: done by people, not menus

One or two tiers per item, each performed by a specific craftsman:

- Feig can rifle the fowling piece's sights, fit a set trigger to the Pennsylvania rifle, or hone the belt knife.
- A leatherworker can oil a coat against weather or reinforce the satchel for two extra slots.
- A tinker can fit a reflector to the lantern for a wider beam.
- Moccasins can be resoled quieter.

Each upgrade costs coin plus one specific material, a quest hook in miniature. Master-tier work is trust-gated: Feig will not do his best work for someone he does not trust, threading the upgrade system directly into Section 11. The silvered blade remains special, the one upgrade that is a full quest.

**HANDS** is the connective ladder: higher ranks mean better field repairs, slower wear, and a discount haggle keyword with craftsmen.

---

## 14. Crafting

Recipes, not systems. Two or three ingredients maximum. Known recipes are shown plainly. No crafting skill grind. Each station is tied to a place, so crafting pulls the player around the map.

- **Hearth** (any tavern or camp): meals, poultices, tallow candles.
- **Apothecary bench**: tonics, laudanum, remedies.
- **Smithy**: gear repair, cast shot, forged tools, one quest critical cold iron item.
- **Still** (hidden): whiskey.

The supernatural thread gets a light touch: hex signs painted from recipes the hexerei widow teaches, salt lines, a silvered blade. Crafting warding items is how a noncombat player fights the mystery.

---

## 15. Skill Ladders

Short tracks of 4 to 5 ranks each. Rank up by doing, never by spending points from a menu.

- **WOODSMAN.** Tracking, foraging, quiet movement.
- **TONGUE.** Persuasion, barter, new dialog keywords.
- **HANDS.** Crafting quality, lockpicking, reload speed, repair quality, wear rate.
- **SIGHT.** The supernatural sense. Advances only through story choices and burdens (see below).

---

## 16. SIGHT Progression

SIGHT never ranks up by grinding. Each rank is a threshold crossed by an explicit story choice, and each asks the player to confirm. It is the horror dial the player turns voluntarily.

**Rank 0, Unawakened.** Wisps look like swamp gas. Ghosts are drafts and creaking wood. The mystery is fully investigable as a crime story.

**Rank 1, The Glimmer.** Gained by sleeping in the fort ruins, or from the second sight burden. Wisps become visible and lead somewhere, treasure or trap, even odds. Cold spots shimmer faintly. New dialog keyword: SEEN.

**Rank 2, The Listening.** Gained by performing a folk ritual Widow Brahm teaches, at a cost: a night of the character's memory and one small stat scar. The dead murmur near graves and murder sites, each murmur a quest breadcrumb. Salt lines and hex signs visibly glow when active. The murmurs single out a player who has died (Section 6).

**Rank 3, The Parley.** Gained mid mystery by a major choice: drink from the spring under Wills Mountain, or accept the Shawnee elder's rite. Speak with specific dead NPCs (including Corporal Pryor) through keyword dialog. Ghosts address a marked player differently. Unlocks alternate solutions to most quests and testimony no court will hear, creating the game's best problem: the player knows who the killer is, but proving it is a trust problem.

**Rank 4, The Opened Eye.** Endgame, optional, irreversible, and the game warns twice. See the thing under the mountain as it truly is. Unlocks the true ending branch with permanent consequences: some NPCs distrust the player on sight, taverns cost more, hue and cry builds faster. Power at social cost.

**Suppression.** Laudanum temporarily suppresses SIGHT: a mercy mechanic for overwhelmed players and a story hook (Dr. Ward is dosing Mrs. Lamar to keep her blind).

**Gating logic.** Main mystery completable at Rank 0 (mundane ending). Rank 2 reveals the full picture. Rank 3 and above reach the true endings.

---

## 17. Cheat Codes

Entered at a typed prompt (backtick terminal pattern). Difficulty agnostic, they always work.

- `SNAKEOIL` restores and boosts health (never removes Marks)
- `SPECIE` grants a purse of silver dollars
- `PARDON` clears the hue and cry
- `LANTERNS` grants permanent night vision

Using a cheat on Perilous quietly sets a SNAKE OIL SALESMAN flag that changes one ending line as a wink. No other penalty. Cheats never affect reputation, trust, or Marks.

---

## 18. Endings (Sketch)

- **The Ledger Closed.** Rank 0 to 1. The crimes are solved as human crimes. The town moves on. Something under the mountain does not.
- **The Buried Truth.** Rank 2. The player understands what is happening and chooses a faction's answer: bury it, exploit it, or honor it.
- **The Parley Kept.** Rank 3. A negotiated ending only possible by speaking with the dead and the elder both, and only if both trust the player.
- **The Opened Eye.** Rank 4. The true ending branch, with permanent cost, in either triumph or ruin depending on choices made along the way.

---

## 19. Art Direction

**Target: Super Nintendo quality as the floor.** The reference register is Chrono Trigger's readable tiles and expressive small sprites, A Link to the Past's density of interactive detail, and Final Fantasy VI's mood lighting on limited hardware.

### Visual specification

- **16x16 base tiles** on a 32x32 logical grid for objects.
- **Characters at 16x24 or 24x32** so coats and hats read clearly at a glance, a requirement since disguise is a mechanic.
- **Constrained palette.** A master palette of roughly 64 colors with per-scene sub-palettes. Day, dusk, night, and fog are palette swaps.
- **4-frame walk cycles minimum,** plus idle fidgets for named NPCs so the town feels alive.
- **Parallax layers** for the mountain ridges and fog banks behind town.
- **Dithered lantern light.** Radial gradients with ordered dithering rather than smooth alpha, keeping period-appropriate crunch while making lantern-and-sightline stealth readable.

### The 16-bit language rule

Every visual effect must be achievable in the 16-bit visual language (palette swaps, dithering, sprite flicker, mosaic transitions) even where the implementation is modern. The browser is allowed to cheat above real SNES hardware in real-time light occlusion for line of sight, sprite count, smooth camera, and full-screen palette shifts, but never in visual vocabulary.

SIGHT maps directly onto palette manipulation: each rank shifts the world's palette slightly, and Rank 4 renders certain scenes in a wrong, inverted scheme. Melies hand-tinting becomes literal palette work.

### Pipeline

Aseprite for sprites, Tiled for maps, Canvas 2D rendering (WebGL only if the lighting demands it). The pixel art budget (24 named NPC sprites, four pets, town tilesets, interiors, the Narrows, the fort) is the single largest content cost in the project. Decide early: hand-drawn, commissioned, or a licensed 16-bit tileset base with custom characters layered on top.

---

## 20. Technical Notes and Standards

Built to the standing web app development standards for all ARCADE titles:

- Browser based, local first, with full export and import of saves
- Night default theme, WCAG AA in all themes, High Contrast theme included
- Fluid sizing, collapsible menus, mute button
- Version display in the UI, per release file snapshots
- GitHub repository from day one
- Debug flagged console logging
- Test harness required
- Build to v1.0 MVP, then stop; cleanup passes; archive rather than delete
- README with Known Limitations section
- Blog post draft accompanies each release

Suggested MVP scope for v1.0: town proper plus the fort ruins and the Narrows, the main mystery through Rank 2, the hue and cry system at all four levels, full inventory and crafting, condition and repair (upgrades post 1.0), the Marks of the Crossing death system, twelve of the twenty-four named NPCs with the trust system live, the dog and cat companions, and two of the four endings. Rank 3 and 4 content, Braddock's Road, the raven and mule, upgrades, the remaining NPCs, and the remaining endings land in post 1.0 releases.

---

## License

GPL-3.0

## v0.15.0 addendum: the canal town grows and the roads remembered

Added Ansel Pyle, lockkeeper of the last C&O lock, who works the basin by day,
drinks at the Blue Mule, and sleeps in the lock house. He offers canal cargo
as honest towpath work (five silver, a point of Road standing) and seeds the
supernatural thread: the coal crews that load after dark come back strange,
and the mules balk at the deep cut. Two new enterable interiors: the B&O
Depot and the Lock House, both furnished. The jobs board now presents a choice
of available work rather than a fixed order.

The roads that made Cumberland are now present and remembered. National Road
milestones (cast-iron mile markers) stand at the west gate (mile zero, where
the great pike west begins) and along the main street. Braddock's Road climbs
northwest toward the fort hill, its marker recalling that Washington buried
General Braddock in the roadbed in 1755 so the wagons would hide the grave.
Both roads, and Washington himself, are learnable conversation subjects
(Bright the wagoner on ROADS and the NATIONAL road, Doyle on WASHINGTON).
Washington's headquarters cabin, already a safe-rest vigil site, is now a
furnished landmark with his campaign table and a French musket ball in the
sill, both examinable, both quietly uncanny. Era anchors: Braddock's Road
1755, National Road reaching Cumberland 1818, canal 1850, railroad 1842.

## v0.16.0 addendum: atmosphere and the case file

Two pillars, one visual and one gameplay, plus the beat that joins them.

Atmosphere: a new engine (src/engine/atmosphere.js) adds a motion layer the
static world lacked. Drifting river fog (denser and bluer at night), chimney
smoke rising from every lit building, floating motes (dust by day, faint
spirits by night), and a soft radial vignette that frames the scene like aged
glass. The fog answers the design doc's old promise that fog rolls off the
Potomac. All of it is a few dozen particles, cheap to run.

The case file: the plain journal became a tabbed detective's notebook on aged
paper. EVIDENCE shows every clue as a pinned, slightly-askew card grouped by
thread. SUSPECTS is a board that fills in fact by fact as you learn about
Gantt, Cresap, Beall, and Ward, showing how many things you still do not know
about each. WORDS is your growing vocabulary with the newest highlighted.
STANDING keeps reputation, confidences, work, and the hour.

The discovery beat: finding a new clue triggers a gold flash and a soft
two-note chime; waking the Glimmer triggers a green flash and a brighter
three-note chime. Investigation now feels like something happens when you
succeed.

## v0.17.0 addendum: deduction, reactive townsfolk, quest markers

The trial is no longer a submit button. Before the verdict math runs, the
player assembles the accusation across three panels: WHO (the culprit), WHY
(the motive), and PROOF (drawn only from clues actually held). scoreDeduction
(src/game/deduction.js) grades it: naming Gantt, the quarry seam, and the
re-inked plat is a clean case worth +3 conviction weight; the right man with
loose framing still helps but less; blaming the curse, the town's favorite
escape, actively collapses the case. A clean deduction is remembered
(deductionClean) for the ending.

Reactive townsfolk (src/game/remarks.js): NPCs may open a conversation with an
aside about the hour (dawn mist, the four o'clock packet, lamps wanting
lighting), the weather (rain off the Potomac, fog that gets into the head),
your standing (mistrust when low, welcome when high), or your coat (a
gentleman's frock worn like it is borrowed). Deterministic per npc and hour so
it does not flicker, and silent about two conversations in three.

Quest markers: the in-canvas minimap now draws every building door as a faint
mark and pulses an amber target at the door of wherever the current lead
points (hintTarget in hints.js maps each story phase to a building). The open
world is navigable at a glance without breaking immersion.

## v0.18.0 addendum: a city of stone, brick, and timber

Buildings were identical brick with doors rendering mid-facade. Rebuilt. Seven
wall materials now exist (three bricks in different reds and browns, two cut
stones in gray and blue-gray, two timber clapboards), each generated with its
own pattern (brick courses, irregular ashlar, horizontal siding) and its own
roof color, and each with a matching window and door tile. Buildings are
assigned materials by function: civic halls (courthouse, chambers, kirk, gaol)
in cut stone, trades in brick, dwellings in timber. The door bug is fixed at
the source: doors are now always placed on the building's bottom row, never a
middle course, and the generator forces this regardless of the authored door
coordinate.

Canal boats now float ON the basin water (forced onto water tiles) with canal
mules standing on the towpath bank beside each, the way the C&O actually
worked, mule hauls boat. A new mule tile joins the decor set.

Massive landscape features give the valley scale: four large solid terrain
tiles (mossy boulder, dense pine, craggy rock face, giant cut stump) placed in
clusters, two pine stands (northeast corner and south edge), a boulder field
on the west slope, and a cliff formation at the northwest fort-hill toes.
These are solid: the player walks around them, so they shape the space as well
as fill it. The material index is exported from genart to materials.json and
read by genmaps, so tile-order changes never desync the two.

## v0.19.0 addendum: roofed buildings and big furniture

The door-in-the-middle bug is finally solved at its true cause. Buildings were
drawn as a solid block of one wall tile, and each wall tile carried a roof band
on top, so a tall building looked like stacked horizontal strips with the door
graphic floating partway up. Rebuilt: each material now has five tiles (roof
body, roof ridge/peak, plain facade, window facade, door facade). Buildings
render a peak ridge on the top row, roof body on the middle rows, and the
facade (with door and windows) only on the bottom row. The door now sits
unmistakably on the ground floor with grass or street directly below it. A test
walks every building door and confirms a roof sits above it and open ground
below.

Big furniture: interiors were furnished with small single-tile props. Added
seven substantial two-tile pieces (bed, desk, shop counter, kitchen range,
armoire, couch, dining table), each drawn as abutting left and right halves,
and rewrote every interior's furnishing to build rooms around them: the
magistrate's chambers get a desk, an armoire, and a settle; the inn gets a
counter and two tables; the surgery a bed; the widow's cottage a cast kitchen.
Each big piece carries its own examinable oddity line. The furniture index is
exported to bigfurn.json so tile-order changes never desync placement.

## v0.21.0 addendum: the ambient haunting

The supernatural was gated behind story unlocks and delivered as toast text, so
during normal play the world felt mundane despite being a supernatural mystery.
Fixed with a new engine (src/engine/haunting.js) that makes the uncanny ambient
and always present. Spectral wisps drift against the wind, cold spots shimmer as
wrong-colored air, and a Watcher, a tall still silhouette with pale eyes, may
cross the far treeline on a dark night. Intensity (dread, 0..1) scales with the
player's SIGHT rank, the hour (night), and proximity to charged ground: the
churchyard, the north edge under the mountain, and the caves. It is never wholly
absent (baseline ~0.12), so even the unawakened catch things at the edge of
vision, brighter and more legible as SIGHT opens.

Dread also drives audio: a detuned low drone (55 / 55.7 Hz, slow beating,
lowpass) in ambience.js whose gain follows the dread level, so charged places
are heard as well as seen. The Watcher carries one light, non-punishing hook, a
soft chime and, the first time only, a murmured first-sighting line (different
for the seeing and the unawakened). True to the project's north star, this is
atmosphere, not challenge: the haunting never damages or chases, it unsettles.

## v0.21.1 addendum: the cave mouth and full-size canal boats

Two fixes from playtest. The cave entrance (the Act Four descent, gated behind
nanMissing) existed only as an invisible door hotspot on bare grass at tile
(31, 7), so players could not find it. Now it is a clear landmark: a solid rock
bluff rises behind it, a dark two-tile cave mouth opens on the door row (drawn
on the decor layer so the door tile stays walkable), and a nailed horseshoe and
a marker post flag it. The nanMissing hint was rewritten to guide the player up
the north road to the bluff, and the minimap objective marker now points at the
cave door during Act Four.

Canal boats were single 16px tiles, no bigger than the player. Replaced with
proper multi-tile vessels: a new "big scenery" tile group holds a four-tile
vertical canal boat (pointed bow, cargo hold, after-cabin with stovepipe,
blunt stern with tiller) that runs the length of the north-south river, roughly
2.7x the player's height and the full width of the channel. Two boats are
moored on the water with mules hauling from the towpath. The big-scenery tile
index is exported to bigscene.json and read by genmaps, consistent with the
materials and big-furniture pipelines.

## v0.21.2 addendum: doorways always clear

Townsfolk kept blocking doors. The interaction-priority fix (a door under the
player wins over a nearby NPC) was not enough on its own, because most NPC home
and work spots sit on the very tile in front of a building's door, so a
townsperson would physically park in the threshold and the player could not
reach the door tile past them.

Fixed at the position level: on map load, the game computes doorwayTiles, the
set of every door tile plus the walkable approach tile directly in front of it.
A keepOffDoorways helper slides any NPC resting on one of those tiles to the
nearest open, non-doorway tile. It runs after each NPC's scheduled move, at
spawn time, and as a per-frame safety net over all non-pursuers, so a doorway
is always clear no matter how an NPC arrived there. Pursuers are exempt (they
are supposed to close on the player). The result: every door is always
reachable.

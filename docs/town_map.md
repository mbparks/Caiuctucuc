# CAIUCTUCUC
## Town Map Layout

**Companion to Design Document v0.3.0 and Beat Sheet v0.1.0**
Map Layout v0.1.0
Author: M.B. Parks
Date: July 2026

Grounded in real 1800 Cumberland geography, stylized for play: Wills Creek flows out of the Narrows southeast to meet the Potomac, the town sits on the east bank at the confluence, and the fort ruins hold the bluff between creek mouth and river. North is up throughout.

---

## 1. World Overview

```
                W I L L S   M O U N T A I N
        /\  /\  /\  /\  /\  /\  /\  /\  /\  /\
       /   LOVERS LEAP        HIGH HOLLOWS     \
      /      (west face)     (Vachon's camp)    \
     ||  T H E   N A R R O W S  ||   THE QUARRY
      \   cliff caves (still)   /   (deep cut, SE flank)
       \        creek gap      /       |
        \                     /   quarry road
         \                   /         |
   BRADDOCK'S      W I L L S        NORTH FARMS
   ROAD WEST        C R E E K      Trent Mill (creek)
   (ford + toll) ~~~~~ | ~~~~~     Brahm cottage
        |              |           hex-sign farms
        +---- ford ----+                |
                       |          east farm road
              SHANTY ROW & DOCKS        |
              MECHANIC STREET           |
              BALTIMORE STREET =========+===> EAST ROAD
              MARKET SQUARE                  (to Oldtown)
              GREENE STREET
                       |
                 FORT HILL
              (ruins, graveyard)
                       |
              THE POINT (ferry)
   ~~~~~~~~ P O T O M A C   R I V E R ~~~~~~~~
              VIRGINIA SHORE
        (jurisdiction line, wild bank)
```

**World map budget:** roughly 256 x 256 tiles at 16 px (a 4096 px square world). Town proper occupies about 96 x 96 tiles of that. Target walk time corner to corner of town: 60 to 90 seconds, so the whole world crosses in about four minutes on foot, half that mounted.

---

## 2. Districts

### 2.1 Market Square and Baltimore Street (civic heart)

The stage for hue and cry, gossip, and the trial. Baltimore Street runs east from the creek bridge; the square opens off it, ringed by the town's institutional buildings.

- **Courthouse.** Judge Kent's courtroom, Cresap's office, and the records room where Rood works nights and where Beat 2.4 happens. The re-inked plat lives here. The sealed 1755-adjacent record is in Kent's chambers, behind the game's best lock.
- **Jail.** Beall's desk, two cells, the surrender and escape gameplay. A loose stone in cell two is known to The Road faction.
- **The Blue Mule tavern.** Peg Doyle. The social hub: jobs board, gossip network center, rented bed (stash), hearth crafting station, card table (win the mule here). Tavern regulars are the gossip web's core nodes.
- **Ward's surgery and apothecary.** Where the player wakes after death. Apothecary bench station. Mrs. Lamar's laudanum ledger is in the back room.
- **Gantt's survey office.** Neat, prosperous, and lying. Plat copies on the walls, one subtly wrong for players who compare.
- **The kirk.** A modest church whose pulpit Crane borrows, to the resident parson's quiet fury. Revival crowds spill into the square in Act II.
- **General store and gunsmith's counter.** Powder, shot, tools, and the town's price gauge for reputation.

### 2.2 Mechanic Street (trades row)

One street west of the square, running toward the creek. The upgrade economy lives here.

- **Feig's smithy.** Repair and upgrade station, the cold iron quest, and the anvil rhythm that stops when strangers walk in.
- **Freeman's cooperage.** Isaiah Freeman. Barrels for Marsh's still move through here, which both men would prefer unexamined. The forged-papers thread starts in the loft.
- **Leatherworker and tinker.** Satchel reinforcement, coat oiling, lantern reflector. The tinker's cart relocates weekly, teaching players to read schedules.
- **Stables and wagon yard.** Captain Bright. Horses for sale, hire, or theft; the wagon train that opens and can close the game.

### 2.3 Docks and Shanty Row (Wills Creek waterfront)

The Road faction's turf. Lantern-lit, crate-stacked, the best stealth geometry in town.

- **The docks and warehouse.** Freight jobs, smuggling jobs, and Pyle's excise office positioned where he can watch everything and skim quietly.
- **Fenwick's rented rooms.** Above a chandlery. The anatomy list is here, and later the plat stone rubbings.
- **Shanty Row.** Poorest housing, no locks worth the name, and the townsfolk most willing to talk to a player the square distrusts.
- **The creek bridge.** The only dry crossing in town. Militia checkpoints appear here at Hue and Cry 3+, making the fords matter.

### 2.4 Fort Hill (the ruins)

South of Greene Street on the bluff. The game's haunted centerpiece and its Rank 1 threshold.

- **The fort ruins.** Collapsed palisade, standing chimneys, the powder magazine (dark, cold, and the entrance the 1755 garrison used). Sleeping here triggers the Glimmer.
- **Washington's cabin.** Intact, kept by no one, always unlocked, never robbed. Townsfolk will not say why.
- **The graveyard.** Coombs's territory, Beat 1.4's scene, and the densest murmur field in the game at Rank 2.
- **The glacis.** Open slope between fort and town: exposed ground for chases, torchlit for the Act II revival.

### 2.5 The Point and the Ferry (Potomac shore)

- **Ferry landing.** Old Toby Shanks. The jurisdiction mechanic made physical: board, pay, and watch the constable stop at the waterline. Night crossings, no questions, at Road reputation.
- **Virginia shore.** A thin playable band: a rough tavern, a smugglers' beach, and wilderness. Heat decays fast here; on the hardest Hue and Cry setting, bounty men do cross.

### 2.6 North Farms and Trent Mill

The creek road north out of town, toward the mountain.

- **Trent Mill.** Josiah and Nan Trent, the painted-over hex sign, and the finale's emotional launch point. The mill wheel is audible two screens away, until the night it stops.
- **Brahm cottage.** Off the road, marked by an intact hex sign and a garden of things that are not vegetables. The Rank 2 ritual happens here.
- **Hex-sign farms.** Four farms forming the pattern players can map: losses follow the missing signs.

### 2.7 Wills Mountain, the Narrows, and the Quarry

The wild north and west. Vertical, foggy, and where every thread points.

- **The quarry.** SE flank, up the quarry road. McTeague's office shack, the workings, and the deep cut, roped off and avoided by every worker. Tam's death site and the bootprint scene.
- **The Narrows.** The creek's gap through the mountain. Braddock's Road ford and toll house on the west approach. The corridor west out of the world.
- **Lovers Leap.** The west-face overlook. The Winona legend's site, the token's destination, and the scripted Act III ambush ground.
- **Cliff caves.** Marsh's still hidden in the lower galleries, the whiskey aging in the dark, and the Act IV route down. The cave network connects, eventually, to the powder magazine and the seam. Marsh knows every fork.
- **High hollows.** Mal Vachon's camp and her wrong-sized traps. Old Keys's dwelling is beyond it, findable only by players the Hills already half-trust, or by following the cat.

---

## 3. Gameplay Geography Rules

- **Chase logic.** Every district has one escape seam: dock crates and creek fords (Shanty Row), the glacis into ruin cover (Fort Hill), alley loops (square), the caves (mountain). Hue and Cry escalation is really a geography lesson.
- **The two rivers do different jobs.** Wills Creek is tactical (fordable, cold, breaks pursuit and scent). The Potomac is strategic (jurisdiction, the ferry, the game's pressure valve).
- **Sightlines are honest.** Lantern radii, window light, and moonlight define stealth. The docks are dark, the square is not, and the glacis is deadly open.
- **Schedules anchor to districts.** Every named NPC touches the square or the Blue Mule once daily, so a patient player can find anyone, but their secrets live in their home districts after dark.
- **The mountain watches the town.** From nearly every screen in town, the parallax ridge of Wills Mountain is visible in the north, with the quarry scar on it. The finale's location is on screen from minute one.

---

## 4. Interior Budget

Roughly 22 interiors for v1.0: courthouse (3 rooms), jail, Blue Mule (2), surgery (2), survey office, kirk, store, smithy, cooperage (plus loft), stable, warehouse, excise office, Fenwick's rooms, Washington's cabin, Lamar house (2), Trent Mill (2), Brahm cottage, McTeague's shack, toll house, ferry tavern. Cave and seam interiors are Act IV's separate tileset. Post 1.0 adds Vachon's camp, Old Keys's dwelling, and the Virginia band's interiors.

---

## License

GPL-3.0

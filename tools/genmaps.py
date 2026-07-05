#!/usr/bin/env python3
"""Generate the town map and its interiors from the layout document.

Gids: 1 grass, 2 water, 3 treeline, 4 ford, 5 street, 6 building wall,
7 stall, 8 door, 9 interior floor, 10 interior wall, 11 ruin, 12 dock.
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "maps"
W, H, T = 96, 64, 16

import json as _json
from pathlib import Path as _Path
_matpath = _Path(__file__).parent.parent / "assets" / "tiles" / "materials.json"
MAT = _json.loads(_matpath.read_text()) if _matpath.exists() else {"brickA": 54}
_bfpath = _Path(__file__).parent.parent / "assets" / "tiles" / "bigfurn.json"
BIGFURN = _json.loads(_bfpath.read_text()) if _bfpath.exists() else {}
_bspath = _Path(__file__).parent.parent / "assets" / "tiles" / "bigscene.json"
BIGSCENE = _json.loads(_bspath.read_text()) if _bspath.exists() else {}
def big(name): return BIGFURN.get(name, 0)   # left gid; right is +1
def mat_roof(m):   return MAT.get(m, 59) + 0
def mat_peak(m):   return MAT.get(m, 59) + 1
def mat_facade(m): return MAT.get(m, 59) + 2
def mat_window(m): return MAT.get(m, 59) + 3
def mat_door(m):   return MAT.get(m, 59) + 4

GRASS, WATER, TREE, FORD, STREET, WALL, STALL, DOOR = 1, 2, 3, 4, 5, 6, 7, 8
IFLOOR, IWALL, RUIN, DOCK = 9, 10, 11, 12
HEARTH, ANVIL, JARS, SHELF, PEW, ALTAR, BARRELS, LOOM, DESK, BED, ROPES, HIDES, WARDS, CRYSTALS, STOVE, HANGLANTERN = range(17, 33)
WELL, XCROSS, FENCE_H, FENCE_V, GARDEN, GRAVE, SIGNPOST, CARTWHEEL, OBARREL, WOODPILE, CRATES, BUSH, PUMP, LAMPPOST, TROUGH, STUMP = range(33, 49)
RAIL_H, CANALBOAT, LOCK, COALPILE, MILESTONE, MULE = range(49, 55)
BOULDER, PINE, ROCKFACE, BIGSTUMP = range(55, 59)

TUFTS, FLOWERS, TALLGRASS, WINDOW = 13, 14, 15, 16
def grass_at(x, y):
    h = (x * 73856093 ^ y * 19349663) % 100
    if h < 8: return TUFTS
    if h < 12: return FLOWERS
    if h < 18: return TALLGRASS
    return GRASS
ground = [[grass_at(x, y) for x in range(W)] for y in range(H)]
solid = [[0] * W for _ in range(H)]


def fill(x0, y0, x1, y1, gid, is_solid):
    for y in range(y0, y1):
        for x in range(x0, x1):
            ground[y][x] = gid
            solid[y][x] = gid if is_solid else 0


# border treeline
fill(0, 0, W, 1, TREE, True); fill(0, H - 1, W, H, TREE, True)
fill(0, 0, 1, H, TREE, True); fill(W - 1, 0, W, H, TREE, True)

# Wills Creek down the west side, with the Baltimore Street bridge and a ford
fill(4, 1, 7, H - 1, WATER, True)
fill(4, 30, 7, 33, STREET, False)          # the bridge
fill(4, 50, 7, 52, FORD, False)            # the lower ford

# streets: Baltimore (east-west), Mechanic and Greene (north-south)
fill(7, 30, W - 1, 33, STREET, False)      # Baltimore Street
fill(24, 12, 27, 52, STREET, False)        # Mechanic Street
fill(56, 30, 59, 56, STREET, False)        # Greene Street
fill(60, 24, 74, 30, STREET, False)        # Market Square
fill(30, 8, 33, 30, STREET, False)         # quarry road stub north
fill(7, 20, 24, 23, STREET, False)         # dock lane

# fort hill ruin and the glacis
fill(40, 52, 54, 58, RUIN, False)
for x in range(40, 54, 3):
    solid[52][x] = RUIN                     # broken palisade posts
    ground[52][x] = RUIN
# docks on the creek
fill(7, 24, 9, 28, DOCK, False)
fill(7, 40, 9, 44, DOCK, False)

BUILDINGS = [
    # name, x0, y0, x1, y1, door(x, y), interior id
    ("Blue Mule",        34, 22, 44, 29, (39, 28), "int_bluemule"),
    ("General Store",    46, 23, 53, 29, (49, 28), "int_store"),
    ("Courthouse",       60, 16, 74, 24, (67, 23), "int_courthouse"),
    ("The Kirk",         78, 20, 86, 29, (82, 28), "int_kirk"),
    ("Survey Office",    88, 24, 94, 29, (90, 28), "int_survey"),
    ("Ward's Surgery",   34, 34, 41, 40, (37, 34), "int_surgery"),
    ("The Gaol",         62, 34, 68, 40, (65, 34), "int_gaol"),
    ("Freeman Cooperage",28, 34, 33, 41, (30, 34), "int_cooperage"),
    ("Wagon Yard",       70, 34, 80, 42, (74, 34), "int_stable"),
    ("Lamar House",      84, 34, 91, 41, (87, 34), "int_lamar"),
    ("Feig's Smithy",    18, 12, 24, 19, (23, 15), "int_smithy"),
    ("Leatherworker",    18, 44, 24, 50, (23, 46), "int_leather"),
    ("Warehouse",        10, 14, 18, 20, (14, 19), "int_warehouse"),
    ("Excise Office",    10, 24, 15, 28, (14, 26), "int_excise"),
    ("Fenwick's Rooms",  10, 34, 16, 40, (15, 37), "int_fenwick"),
    ("Shanty Row",       10, 44, 15, 48, (14, 46), "int_shanty"),
    ("Washington's Cabin",46, 46, 50, 50, (48, 49), "int_cabin"),
    ("Ferry House",      54, 58, 59, 62, (56, 58), "int_ferry"),
    ("Trent Mill",       34, 8, 40, 13, (36, 12), "int_mill"),
    ("Rood's School",    50, 8, 56, 13, (52, 12), "int_school"),
    ("Cresap Chambers",  76, 8, 84, 14, (79, 13), "int_cresap"),
    ("McTeague Shack",   88, 8, 93, 12, (90, 11), "int_shack"),
    ("Brahm Cottage",    60, 8, 68, 13, (63, 12), "int_brahm"),
    ("B&O Depot",        15, 23, 22, 28, (18, 27), "int_depot"),
    ("Lock House",       11, 50, 15, 54, (13, 53), "int_lockhouse"),
]

# overlap check
seen = set()
for name, x0, y0, x1, y1, door, iid in BUILDINGS:
    for y in range(y0, y1):
        for x in range(x0, x1):
            assert (x, y) not in seen, f"overlap at {(x, y)} in {name}"
            seen.add((x, y))

# each building's material: civic in cut stone, trade in brick, dwellings in timber
BUILDING_MATERIAL = {
    "int_courthouse": "stoneA", "int_cresap": "stoneA", "int_kirk": "stoneB",
    "int_gaol": "stoneB", "int_survey": "stoneA", "int_excise": "stoneB",
    "int_bluemule": "brickA", "int_store": "brickB", "int_smithy": "brickC",
    "int_surgery": "brickB", "int_warehouse": "brickC", "int_depot": "brickC",
    "int_cooperage": "brickA", "int_leather": "brickC", "int_school": "brickA",
    "int_lamar": "brickB", "int_fenwick": "brickA",
    "int_cabin": "woodA", "int_ferry": "woodB", "int_shanty": "woodB",
    "int_stable": "woodA", "int_lockhouse": "woodB", "int_mill": "woodA",
    "int_shack": "woodB", "int_brahm": "woodA",
}
def material_for(iid): return BUILDING_MATERIAL.get(iid, "brickA")

doors = []
# a signboard hung by each door tells you what the building is at a glance
BUILDING_SIGN = {
    "int_bluemule": OBARREL, "int_store": CRATES, "int_smithy": ANVIL,
    "int_surgery": JARS, "int_kirk": ALTAR, "int_courthouse": DESK,
    "int_gaol": ROPES, "int_cooperage": OBARREL, "int_stable": CARTWHEEL,
    "int_ferry": ROPES, "int_leather": HIDES, "int_survey": SIGNPOST,
    "int_excise": SIGNPOST, "int_warehouse": CRATES,
    "int_depot": CRATES, "int_lockhouse": ROPES, "int_cabin": SIGNPOST,
}
for name, x0, y0, x1, y1, (dx, dy), iid in BUILDINGS:
    m = material_for(iid)
    ROOF, PEAK, FACE, WIN_T, DOOR_T = mat_roof(m), mat_peak(m), mat_facade(m), mat_window(m), mat_door(m)
    wy = y1 - 1                      # the facade row (ground floor)
    for y in range(y0, y1):
        for x in range(x0, x1):
            if y == y0:
                ground[y][x] = PEAK  # ridge line on the very top
            elif y < wy:
                ground[y][x] = ROOF  # roof body for all middle rows
            else:
                ground[y][x] = FACE  # the facade only on the bottom row
            solid[y][x] = ROOF       # whole footprint is solid
    # the door on the facade row, near the given column
    ddx = min(max(dx, x0 + 1), x1 - 2)
    for wx in range(x0 + 1, x1 - 1):
        if (wx - x0) % 3 == 1 and wx != ddx:
            ground[wy][wx] = WIN_T
    ground[wy][ddx] = DOOR_T
    solid[wy][ddx] = 0
    doors.append((name, ddx, wy, iid))

# NPC spots: work near door, tavern near the Mule, homes scattered
def walkable_neighbor(dx, dy):
    """The first non-solid, non-building tile touching a door, in tile coords.
    Doors sit in the bottom wall course, so the walkable side is usually above."""
    for ndx, ndy in [(0, -1), (0, 1), (-1, 0), (1, 0), (-1, -1), (1, -1)]:
        nx, ny = dx + ndx, dy + ndy
        if 0 <= nx < W and 0 <= ny < H and solid[ny][nx] == 0 and ground[ny][nx] not in (WALL, WINDOW, DOOR):
            return nx, ny
    return dx, dy   # last resort: the door tile itself

def door_of(iid):
    for name, dx, dy, i in doors:
        if i == iid:
            nx, ny = walkable_neighbor(dx, dy)
            return nx * T, ny * T
    raise KeyError(iid)

mule_x, mule_y = door_of("int_bluemule")
spots = {
    "doyle_bar": (mule_x, mule_y), "doyle_home": (mule_x + 32, mule_y),
    "beall_post": door_of("int_courthouse"), "beall_tavern": (mule_x + 16, mule_y), "beall_home": door_of("int_gaol"),
    "cresap_work": door_of("int_cresap"), "cresap_tavern": (mule_x - 16, mule_y), "cresap_home": door_of("int_cresap"),
    "ward_work": door_of("int_surgery"), "ward_home": door_of("int_surgery"),
    "feig_work": door_of("int_smithy"), "feig_tavern": (mule_x + 48, mule_y), "feig_home": door_of("int_smithy"),
    "gantt_work": door_of("int_survey"), "gantt_home": door_of("int_lamar"),
    "rood_work": door_of("int_school"), "rood_court": door_of("int_courthouse"), "rood_home": door_of("int_school"),
    "mcteague_work": door_of("int_shack"), "mcteague_tavern": (mule_x - 32, mule_y), "mcteague_home": door_of("int_shack"),
    "coombs_work": (47 * T, 53 * T), "coombs_home": door_of("int_shanty"),
    "fenwick_work": door_of("int_fenwick"), "fenwick_court": door_of("int_courthouse"), "fenwick_home": door_of("int_fenwick"),
    "shanks_work": (56 * T, 62 * T), "shanks_tavern": (mule_x + 64, mule_y), "shanks_home": door_of("int_ferry"),
    "brahm_home": door_of("int_brahm"),
    "pyle_work": (11 * T, 55 * T), "pyle_tavern": (mule_x - 64, mule_y), "pyle_home": door_of("int_lockhouse"),
    "bright_work": door_of("int_stable"), "bright_tavern": (mule_x - 48, mule_y), "bright_home": door_of("int_stable"),
    "gaol": door_of("int_gaol"),
}

NPCS = ["doyle", "beall", "cresap", "ward", "feig", "gantt",
        "rood", "mcteague", "coombs", "fenwick", "shanks", "bright", "brahm", "pyle"]

npc_objects, oid = [], 100
for npc in NPCS:
    key = npc + "_work" if npc + "_work" in spots else npc + "_bar"
    sx, sy = spots.get(key, spots.get(npc + "_post", spots["doyle_bar"]))
    if npc == "beall":
        sx, sy = spots["beall_post"]
    props = [{"name": "npcId", "type": "string", "value": npc}]
    if npc == "beall":
        props.append({"name": "pursuer", "type": "bool", "value": True})
    npc_objects.append({"id": oid, "name": npc, "type": "npc",
                        "x": sx, "y": sy, "width": T, "height": T, "properties": props})
    oid += 1

spot_objects = [{"id": oid + i, "name": k, "type": "spot", "x": v[0], "y": v[1],
                 "width": T, "height": T} for i, (k, v) in enumerate(spots.items())]

# interactables: market stall, coat rack, jobs board, and job waypoints
ground[26][62] = STALL
interact = [
    {"id": 300, "name": "market purse", "type": "steal", "x": 62 * T, "y": 26 * T, "width": T, "height": T,
     "properties": [{"name": "coin", "type": "int", "value": 6},
                    {"name": "heat", "type": "int", "value": 35},
                    {"name": "once", "type": "bool", "value": True}]},
    {"id": 301, "name": "coat rack", "type": "coat", "x": (mule_x // T + 3) * T, "y": mule_y, "width": T, "height": T, "properties": []},
    {"id": 302, "name": "jobs board", "type": "board", "x": (mule_x // T - 2) * T, "y": mule_y, "width": T, "height": T, "properties": []},
    {"id": 303, "name": "warehouse crate", "type": "job", "x": 14 * T, "y": 20 * T, "width": T, "height": T,
     "properties": [{"name": "job", "type": "string", "value": "freight"}, {"name": "stage", "type": "string", "value": "pickup"}]},
    {"id": 304, "name": "wagon yard gate", "type": "job", "x": 74 * T, "y": 35 * T, "width": T, "height": T,
     "properties": [{"name": "job", "type": "string", "value": "freight"}, {"name": "stage", "type": "string", "value": "dropoff"}]},
    {"id": 305, "name": "survey stake", "type": "job", "x": 90 * T, "y": 52 * T, "width": T, "height": T,
     "properties": [{"name": "job", "type": "string", "value": "survey"}, {"name": "stage", "type": "string", "value": "dropoff"}]},
    {"id": 306, "name": "unmarked cask", "type": "job", "x": 12 * T, "y": 48 * T, "width": T, "height": T,
     "properties": [{"name": "job", "type": "string", "value": "nightrun"}, {"name": "stage", "type": "string", "value": "pickup"}]},
    {"id": 307, "name": "ferry landing", "type": "job", "x": 57 * T, "y": 62 * T, "width": T, "height": T,
     "properties": [{"name": "job", "type": "string", "value": "nightrun"}, {"name": "stage", "type": "string", "value": "dropoff"}]},
]

door_objects, from_spawns = [], []
for i, (name, dx, dy, iid) in enumerate(doors):
    door_objects.append({"id": 400 + i, "name": name, "type": "door",
                         "x": dx * T, "y": dy * T, "width": T, "height": T,
                         "properties": [{"name": "target", "type": "string", "value": iid},
                                         {"name": "spawn", "type": "string", "value": "entry"}]})
    sx, sy = walkable_neighbor(dx, dy)
    from_spawns.append({"id": 500 + i, "name": "from_" + iid, "type": "spawn",
                        "x": sx * T, "y": sy * T, "width": T, "height": T})

def tiled(width, height, g, c, layers_extra):
    return {
        "type": "map", "version": "1.10", "tiledversion": "1.10.2",
        "orientation": "orthogonal", "renderorder": "right-down",
        "infinite": False, "width": width, "height": height,
        "tilewidth": T, "tileheight": T,
        "tilesets": [{"firstgid": 1, "name": "placeholder", "tilewidth": T,
                      "tileheight": T, "tilecount": 12, "columns": 12}],
        "layers": [
            {"type": "tilelayer", "name": "ground", "width": width, "height": height,
             "x": 0, "y": 0, "opacity": 1, "visible": True,
             "data": [v for row in g for v in row]},
            {"type": "tilelayer", "name": "collision", "width": width, "height": height,
             "x": 0, "y": 0, "opacity": 1, "visible": False,
             "data": [v for row in c for v in row]},
        ] + layers_extra,
    }

zones = [
    {"id": 700, "name": "market", "type": "zone", "x": 60 * T, "y": 24 * T, "width": 14 * T, "height": 7 * T,
     "properties": [{"name": "flag", "type": "string", "value": "enteredMarket"}]},
    {"id": 701, "name": "fortruin", "type": "zone", "x": 40 * T, "y": 50 * T, "width": 16 * T, "height": 9 * T,
     "properties": [{"name": "flag", "type": "string", "value": "enteredFort"}]}
]
benchmarks = [
    {"id": 340 + i, "name": "brass benchmark " + str(i + 1), "type": "benchmark",
     "x": bx * T, "y": by * T, "width": T, "height": T, "properties": []}
    for i, (bx, by) in enumerate([(9, 10), (90, 6), (92, 46), (20, 58), (38, 44)])
]
cave_mouth = [
    {"id": 360, "name": "the cave mouth", "type": "door", "x": 31 * T, "y": 7 * T, "width": T, "height": T,
     "properties": [{"name": "target", "type": "string", "value": "caves"},
                     {"name": "spawn", "type": "string", "value": "entry"},
                     {"name": "requires", "type": "string", "value": "nanMissing"}]}
]
pets_and_quests = [
    {"id": 370, "name": "the drover's cur", "type": "dog", "x": 66 * T, "y": 27 * T, "width": T, "height": T, "properties": []},
    {"id": 371, "name": "a fort cat", "type": "cat", "x": 45 * T, "y": 53 * T, "width": T, "height": T, "properties": []},
    {"id": 372, "name": "a hex-stripped barn", "type": "signfarm", "x": 88 * T, "y": 16 * T, "width": T, "height": T, "properties": []},
    {"id": 373, "name": "a hex-stripped barn", "type": "signfarm", "x": 12 * T, "y": 6 * T, "width": T, "height": T, "properties": []},
    {"id": 374, "name": "a hex-stripped barn", "type": "signfarm", "x": 84 * T, "y": 52 * T, "width": T, "height": T, "properties": []},
    {"id": 375, "name": "a hex-stripped barn", "type": "signfarm", "x": 46 * T, "y": 6 * T, "width": T, "height": T, "properties": []},
    {"id": 376, "name": "the night crossing", "type": "noquestions", "x": 58 * T, "y": 61 * T, "width": T, "height": T, "properties": []},
    {"id": 377, "name": "the Lamar house door", "type": "letterquest", "x": 87 * T, "y": 33 * T, "width": T, "height": T, "properties": []}
]
ferrying = [
    {"id": 350, "name": "the ferry flat", "type": "ferry", "x": 56 * T, "y": 61 * T, "width": T, "height": T, "properties": []}
]
supernatural = [
    {"id": 320, "name": "sleep rough in the ruins", "type": "sleeprough", "x": 44 * T, "y": 54 * T, "width": T, "height": T, "properties": []},
    {"id": 321, "name": "a fresh grave", "type": "murmur", "x": 47 * T, "y": 54 * T, "width": T, "height": T,
     "properties": [{"name": "rank", "type": "int", "value": 2},
                     {"name": "requires", "type": "string", "value": "coombsDead"},
                     {"name": "teaches", "type": "string", "value": "PAPER"},
                     {"name": "text", "type": "string", "value": "You stand at Coombs's grave and the Listening opens. One word, in his gap-toothed voice, patient as a man with all the time there is: PAPER."}]},
    {"id": 322, "name": "the powder magazine", "type": "murmur", "x": 52 * T, "y": 56 * T, "width": T, "height": T,
     "properties": [{"name": "rank", "type": "int", "value": 2},
                     {"name": "text", "type": "string", "value": "Low voices below the stone, taking a count that never finishes. Eleven, someone keeps starting. Eleven. Eleven."}]},
    {"id": 330, "name": "a pale light by the creek", "type": "wisp", "x": 12 * T, "y": 54 * T, "width": T, "height": T, "properties": []},
    {"id": 331, "name": "a light on the glacis", "type": "wisp", "x": 46 * T, "y": 48 * T, "width": T, "height": T, "properties": []},
    {"id": 332, "name": "a light up the quarry road", "type": "wisp", "x": 32 * T, "y": 14 * T, "width": T, "height": T, "properties": []}
]
clue_interact = [
    {"id": 310, "name": "the deep cut prints", "type": "clue", "x": 31 * T, "y": 9 * T, "width": T, "height": T,
     "properties": [{"name": "clue", "type": "string", "value": "calm_bootprints"},
                     {"name": "requires", "type": "string", "value": "bodyFound"},
                     {"name": "text", "type": "string", "value": "Up the quarry road, at the mouth of the deep cut: a second set of bootprints beside Tam's. Human, even-spaced, unhurried. Whoever made them walked away calm."}]},
    {"id": 311, "name": "Tam's bedroll", "type": "clue", "x": 47 * T, "y": 55 * T, "width": T, "height": T,
     "properties": [{"name": "clue", "type": "string", "value": "gentleman_letter"},
                     {"name": "requires", "type": "string", "value": "bodyFound"},
                     {"name": "gives", "type": "string", "value": "tams_cache_letter"},
                     {"name": "teaches", "type": "string", "value": "GENTLEMAN"},
                     {"name": "text", "type": "string", "value": "Tam slept rough in the ruins to save wages. Under a loose hearthstone: his savings, and a letter to his sister. He found something worth money, and a gentleman offered to buy his silence."}]}
]
# town decor layer: landmarks and scattered detail on walkable ground only
tdecor = [[0] * W for _ in range(H)]
def place_dec(gid, x, y):
    if 0 <= x < W and 0 <= y < H and solid[y][x] == 0 and ground[y][x] in (GRASS, TUFTS, FLOWERS, TALLGRASS, 5):
        tdecor[y][x] = gid
# landmarks
place_dec(WELL, 62, 28)          # the market well
place_dec(XCROSS, 66, 27)        # market cross beside the square
place_dec(PUMP, 48, 33)          # a street pump
place_dec(LAMPPOST, 58, 25); place_dec(LAMPPOST, 70, 25)
place_dec(SIGNPOST, 55, 31)      # the Baltimore Street signpost
# the churchyard: a cluster of graves west of the kirk
for gx, gy in [(76,22),(77,23),(76,24),(78,22),(77,25),(75,23)]: place_dec(GRAVE, gx, gy)
# gardens and fences behind the residential row
for fx in range(84, 92): place_dec(FENCE_H, fx, 33)
place_dec(GARDEN, 85, 31); place_dec(GARDEN, 88, 31)
# the wagon yard clutter
place_dec(CARTWHEEL, 72, 33); place_dec(WOODPILE, 78, 33); place_dec(CRATES, 76, 32)
place_dec(TROUGH, 73, 32)
# the cooperage and smithy yards
place_dec(OBARREL, 27, 34); place_dec(OBARREL, 32, 34); place_dec(WOODPILE, 26, 33)
place_dec(STUMP, 21, 20); place_dec(WOODPILE, 20, 19)
# the ferry landing
place_dec(CRATES, 55, 60); place_dec(OBARREL, 57, 60)
# a hanging sign beside each shop door, so no two buildings read the same
for bname, bx0, by0, bx1, by1, (bdx, bdy), biid in BUILDINGS:
    sgid = BUILDING_SIGN.get(biid)
    if not sgid: continue
    # place the sign on a walkable tile just left or right of the door
    for sxx in (bdx - 1, bdx + 1):
        if 0 <= sxx < W and solid[bdy][sxx] == 0 and tdecor[bdy][sxx] == 0:
            tdecor[bdy][sxx] = sgid
            break

# the C&O canal basin: carve a widened basin off the west river and moor boats
for by in range(51, 62):
    for bx in range(7, 10):
        if ground[by][bx] == GRASS or ground[by][bx] in (TUFTS, FLOWERS, TALLGRASS):
            ground[by][bx] = WATER; solid[by][bx] = 0
# big canal boats float ON the basin water, each a 4-tile vessel running down
# the river (bow, hold, cabin, stern); mules on the towpath bank haul them
BOAT_BOW = BIGSCENE.get("boat_bow", CANALBOAT)
BOAT_MID = BIGSCENE.get("boat_mid", CANALBOAT)
BOAT_CABIN = BIGSCENE.get("boat_cabin", CANALBOAT)
BOAT_STERN = BIGSCENE.get("boat_stern", CANALBOAT)
def place_boat(col, top):
    # a boat occupies four vertical water tiles; only place where all are water
    if all(0 <= top + k < H and ground[top + k][col] == WATER for k in range(4)):
        tdecor[top][col] = BOAT_BOW
        tdecor[top + 1][col] = BOAT_MID
        tdecor[top + 2][col] = BOAT_CABIN
        tdecor[top + 3][col] = BOAT_STERN
        return True
    return False
place_boat(8, 51)   # a boat mid-river
place_boat(8, 57)   # a second boat downstream
tdecor[55][10] = MULE          # mules on the bank hauling
tdecor[59][10] = MULE
tdecor[52][10] = MULE
tdecor[61][7] = LOCK            # the lock gate at the basin foot
tdecor[54][11] = CRATES; tdecor[57][11] = WOODPILE
tdecor[56][12] = SIGNPOST   # a towpath marker

# ---- the cave mouth: a clear, unmissable entrance in the rock at the door ----
# the door lives at tile (31, 7); frame it with a dark cave opening in a rock
# face and a nailed horseshoe, so the player can actually find the way in.
CAVE_L = BIGSCENE.get("cave_l")
CAVE_R = BIGSCENE.get("cave_r")
if CAVE_L and CAVE_R:
    # rock face rising behind the door (rows 4-6), solid so it reads as a bluff
    for ry in range(4, 7):
        for rx in range(29, 34):
            if ground[ry][rx] in (GRASS, TUFTS, FLOWERS, TALLGRASS) and solid[ry][rx] == 0:
                tdecor[ry][rx] = ROCKFACE
                solid[ry][rx] = ROCKFACE
    # the dark mouth itself, two tiles on the door row, on the decor layer so it
    # reads as an opening you step into (the door tile stays walkable underneath)
    tdecor[7][30] = CAVE_L
    tdecor[7][31] = CAVE_R
    solid[7][30] = 0            # keep the mouth walkable so you can reach the door
    tdecor[6][33] = SIGNPOST    # a marker post beside it
    tdecor[8][32] = XCROSS      # a nailed horseshoe / mark at the mouth
# the B&O siding: rail and coal near the warehouse and depot
for rx in range(8, 20): place_dec(RAIL_H, rx, 22)
place_dec(COALPILE, 16, 21); place_dec(COALPILE, 18, 21); place_dec(CRATES, 12, 21)
place_dec(SIGNPOST, 9, 21)

# National Road milestones: the great pike begins at Cumberland. Markers along
# the west road out and one at the eastern edge of the square (mile zero).
place_dec(MILESTONE, 3, 30)     # the "0 miles to Cumberland" stone, west gate
place_dec(MILESTONE, 30, 30)    # a milestone along the main street
place_dec(SIGNPOST, 5, 29)      # a signpost: roads west
# Braddock's Road heading northwest toward the fort hill and the cabin
place_dec(MILESTONE, 44, 45)
place_dec(SIGNPOST, 45, 44)

# examinable landmarks: the milestones and the roads they mark
road_oddities = [
    {"id": 390, "name": "the mile marker", "type": "oddity", "x": 3 * T, "y": 31 * T, "width": T, "height": T,
     "properties": [{"name": "text", "type": "string", "value": "A cast-iron marker at the head of the National Road. The great pike west begins here at Cumberland and runs to the Ohio country, the first road the young republic ever built with its own hands. Men leave from this stone and do not come back east."}]},
    {"id": 391, "name": "the Braddock stone", "type": "oddity", "x": 44 * T, "y": 46 * T, "width": T, "height": T,
     "properties": [{"name": "text", "type": "string", "value": "Where Braddock's Road climbs northwest toward the fort hill. General Braddock cut this trace in 1755 and died on it, and a young Colonel Washington buried him in the roadbed so the wagons would grind the grave flat and hide it from the French. The wagons still pass over him. Everyone here knows, and no one marks the spot."}]},
]

# canal cargo job waypoints
job_waypoints = [
    {"id": 380, "name": "canal cargo", "type": "job", "x": 11 * T, "y": 51 * T, "width": T, "height": T,
     "properties": [{"name": "job", "type": "string", "value": "canalcargo"}, {"name": "stage", "type": "string", "value": "pickup"}]},
    {"id": 381, "name": "the depot dock", "type": "job", "x": 18 * T, "y": 29 * T, "width": T, "height": T,
     "properties": [{"name": "job", "type": "string", "value": "canalcargo"}, {"name": "stage", "type": "string", "value": "dropoff"}]},
]

# ---- massive landscape features: forests, boulder fields, a rock formation ----
def place_solid(gid, x, y):
    if 0 <= x < W and 0 <= y < H and solid[y][x] == 0 and ground[y][x] in (GRASS, TUFTS, FLOWERS, TALLGRASS):
        # the feature goes on the DECOR layer so its transparent pixels show the
        # grass beneath; the ground keeps its grass, and collision makes it solid
        tdecor[y][x] = gid
        solid[y][x] = gid   # blocks movement: you walk around it
        return True
    return False

# a small pine forest in the northeast corner
for fx in range(84, 94):
    for fy in range(14, 22):
        h = (fx * 13 + fy * 7) % 5
        if h < 3: place_solid(PINE, fx, fy)
# a second stand along the south edge
for fx in range(60, 72):
    for fy in range(58, 63):
        if (fx * 7 + fy * 11) % 4 < 2: place_solid(PINE, fx, fy)
# a boulder field / rock formation on the west slope below the creek
for bx in range(2, 9):
    for by in range(38, 46):
        h = (bx * 17 + by * 5) % 7
        if h < 2: place_solid(BOULDER, bx, by)
        elif h == 6: place_solid(BIGSTUMP, bx, by)
# a rock formation (cliff face) at the northwest, the fort-hill toes
for rx in range(2, 8):
    for ry in range(2, 8):
        if (rx + ry) % 2 == 0 or rx < 4: place_solid(ROCKFACE, rx, ry)
# deadfall and boulders scattered at the treeline edges
for sx, sy in [(30, 4), (44, 5), (52, 5), (58, 60), (74, 60), (20, 55), (90, 40)]:
    place_solid(BIGSTUMP, sx, sy)
for sx, sy in [(28, 6), (48, 4), (82, 58), (18, 52), (92, 44), (14, 6)]:
    place_solid(BOULDER, sx, sy)

# scattered bushes and stumps in the open, deterministic
import hashlib
scatter = [(WELL,-1)]  # unused sentinel
for x in range(2, W-2, 3):
    for y in range(2, H-2, 3):
        if solid[y][x] or ground[y][x] not in (GRASS, TUFTS, FLOWERS, TALLGRASS): continue
        if tdecor[y][x]: continue
        h = int(hashlib.md5(f"{x},{y}".encode()).hexdigest(), 16)
        if h % 23 == 0: place_dec(BUSH, x, y)
        elif h % 37 == 0: place_dec(STUMP, x, y)
        elif h % 41 == 0: place_dec(GARDEN, x, y)

town = tiled(W, H, ground, solid, [
    {"type": "tilelayer", "name": "decor", "width": W, "height": H,
     "data": [tdecor[y][x] for y in range(H) for x in range(W)]},
    {"type": "objectgroup", "name": "spawns", "objects":
        [{"id": 99, "name": "player", "type": "spawn", "x": 10 * T, "y": 31 * T, "width": T, "height": T}]
        + npc_objects + from_spawns},
    {"type": "objectgroup", "name": "spots", "objects": spot_objects},
    {"type": "objectgroup", "name": "interact", "objects": interact + clue_interact + supernatural + benchmarks + ferrying + pets_and_quests + job_waypoints + road_oddities},
    {"type": "objectgroup", "name": "doors", "objects": door_objects + cave_mouth},
    {"type": "objectgroup", "name": "zones", "objects": zones},
])
OUT.joinpath("town.json").write_text(json.dumps(town, indent=1))

# interiors: one room each, exit door bottom center back to town
INTERIOR_EXTRAS = {
    "int_bluemule": [
        {"id": 601, "name": "the corner room", "type": "laylow", "x": 3 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "hours", "type": "int", "value": 6}, {"name": "price", "type": "int", "value": 1}]},
        {"id": 602, "name": "the hearth", "type": "station", "x": 10 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "station", "type": "string", "value": "hearth"}]},
        {"id": 603, "name": "your chest", "type": "stash", "x": 4 * T, "y": 2 * T, "width": T, "height": T, "properties": []},
        {"id": 615, "name": "a woman by the cold hearth", "type": "widow", "x": 12 * T, "y": 5 * T, "width": T, "height": T, "properties": []},
        {"id": 616, "name": "a man with a ledger and no malice", "type": "creditor", "x": 2 * T, "y": 5 * T, "width": T, "height": T, "properties": []},
        {"id": 617, "name": "a traveler who keeps looking at you", "type": "manhunter", "x": 8 * T, "y": 6 * T, "width": T, "height": T, "properties": []}
    ],
    "int_surgery": [
        {"id": 604, "name": "the apothecary bench", "type": "station", "x": 10 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "station", "type": "string", "value": "apothecary"}]},
        {"id": 611, "name": "Tam's effects", "type": "clue", "x": 3 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "requires", "type": "string", "value": "bodyFound"},
                         {"name": "gives", "type": "string", "value": "survey_plat"},
                         {"name": "sets", "type": "string", "value": "hasPlatScrap"},
                         {"name": "text", "type": "string", "value": "Tam's effects on Ward's back table: a survey chain, dry boots, and a folded scrap of plat with a line on it. Worth carrying to the courthouse plat book."}]}
    ],
    "int_smithy": [
        {"id": 605, "name": "the anvil", "type": "station", "x": 10 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "station", "type": "string", "value": "smithy"}]},
        {"id": 606, "name": "Feig's counter", "type": "restore", "x": 3 * T, "y": 2 * T, "width": T, "height": T, "properties": []}
    ],
    "int_surgery_extra_marker": [],
    "int_courthouse": [
        {"id": 612, "name": "the bench of Judge Kent", "type": "accuse", "x": 7 * T, "y": 2 * T, "width": T, "height": T, "properties": []},
        {"id": 613, "name": "Kent's chambers", "type": "chambers", "x": 10 * T, "y": 2 * T, "width": T, "height": T, "properties": []},
        {"id": 614, "name": "the records room", "type": "murmur", "x": 12 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "rank", "type": "int", "value": 2},
                         {"name": "requires", "type": "string", "value": "roodDead"},
                         {"name": "teaches", "type": "string", "value": "MEASURES"},
                         {"name": "clue", "type": "string", "value": "he_measures"},
                         {"name": "text", "type": "string", "value": "The records room is cold in a way the season cannot claim. Two words, in a voice still surprised about it, precise to the last: HE MEASURES."}]},
        {"id": 610, "name": "the plat book", "type": "clue", "x": 4 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "clue", "type": "string", "value": "plat_mismatch"},
                         {"name": "requires", "type": "string", "value": "hasPlatScrap"},
                         {"name": "text", "type": "string", "value": "The county plat book, open to the mountain. Against Tam's scrap the line disagrees with itself: the record has been re-inked, and beautifully. People do love a mystery where there is only mathematics."}]}
    ],
    "int_cabin": [
        {"id": 620, "name": "the swept hearth", "type": "cabinkept", "x": 7 * T, "y": 2 * T, "width": T, "height": T, "properties": []},
        {"id": 623, "name": "the campaign table", "type": "oddity", "x": 3 * T, "y": 3 * T, "width": T, "height": T,
         "properties": [{"name": "text", "type": "string", "value": "The table where a young Colonel Washington kept his headquarters in 1755, when this cabin stood inside Fort Cumberland and the fort still had a reason. The wood is scarred where a map was pinned and repinned. Someone keeps it dusted. Someone always has."}]},
        {"id": 624, "name": "a musket ball in the sill", "type": "oddity", "x": 11 * T, "y": 6 * T, "width": T, "height": T,
         "properties": [{"name": "text", "type": "string", "value": "A lead ball buried in the window sill, French by its cast, left where it struck a hundred years ago. Children dare each other to touch it. The oldest say it is still warm, and the oldest are not always lying."}]}
    ],
    "int_kirk": [
        {"id": 621, "name": "the collection box", "type": "plate", "x": 7 * T, "y": 2 * T, "width": T, "height": T, "properties": []}
    ],
    "int_cresap": [
        {"id": 622, "name": "the magistrate's strongbox", "type": "cresapledger", "x": 7 * T, "y": 2 * T, "width": T, "height": T, "properties": []}
    ],
    "int_store": [
        {"id": 607, "name": "the counter", "type": "vendor", "x": 7 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "stock", "type": "string",
                          "value": "johnnycake,salt_pork,whiskey,coffee,powder_and_shot,salt_pouch,dried_sassafras,lantern_oil,whetstone,oil_rag,tricorn,slouch_hat,work_boots,gentleman_frock,preacher_black"}]}
    ]
}
# decor gids (17..32 on the tilesheet): non-solid oddities placed on a decor layer

# each interior gets a list of (gid, x, y) furnishings. Coordinates are inside
# the 14x10 room, avoiding the walls (1..12 x, 1..8 y) and the exit column.
FURNISH = {
    # each interior: mix of big furniture (as ("BIG","name",x,y)) and small decor (gid,x,y)
    "int_bluemule":  [("BIG","counter",7,2),("BIG","table",3,6),("BIG","table",8,6),(HEARTH,11,2),(BARRELS,2,2),(HANGLANTERN,7,1)],
    "int_store":     [("BIG","counter",6,2),(SHELF,2,1),(SHELF,10,1),(BARRELS,2,6),(CRATES,11,6)],
    "int_courthouse":[("BIG","desk",6,2),(PEW,3,6),(PEW,7,6),(PEW,10,6),(HANGLANTERN,7,1)],
    "int_kirk":      [(ALTAR,7,1),(PEW,3,5),(PEW,7,5),(PEW,10,5),(PEW,3,7),(PEW,7,7),(PEW,10,7),(HANGLANTERN,3,1),(HANGLANTERN,11,1)],
    "int_survey":    [("BIG","desk",3,6),(CRYSTALS,10,6),(SHELF,10,1),(SHELF,2,1)],
    "int_surgery":   [("BIG","bed",9,6),(JARS,2,1),(JARS,5,1),(SHELF,10,1),(HIDES,2,6)],
    "int_gaol":      [("BIG","bed",2,6),(STOVE,10,2),(SHELF,10,6),(ROPES,11,1)],
    "int_cooperage": [("BIG","counter",6,2),(BARRELS,2,6),(BARRELS,11,6),(ROPES,2,1)],
    "int_stable":    [("BIG","armoire",10,4),(HIDES,3,2),(BARRELS,11,6),(HANGLANTERN,7,1)],
    "int_lamar":     [("BIG","bed",2,6),("BIG","armoire",10,5),(LOOM,10,1),(JARS,2,1)],
    "int_smithy":    [(ANVIL,10,5),(HEARTH,2,2),("BIG","counter",5,2),(BARRELS,11,2),(HIDES,3,6)],
    "int_leather":   [("BIG","counter",5,2),(HIDES,3,6),(HIDES,10,6),(ROPES,11,1),(HANGLANTERN,7,1)],
    "int_warehouse": [(BARRELS,2,2),(BARRELS,5,2),(BARRELS,8,2),(BARRELS,11,2),("BIG","counter",4,6),(ROPES,2,6)],
    "int_excise":    [("BIG","desk",3,6),(STOVE,10,2),(SHELF,10,6)],
    "int_fenwick":   [("BIG","bed",2,6),("BIG","couch",9,5),(SHELF,2,1),(JARS,6,1),(HANGLANTERN,7,1)],
    "int_shanty":    [("BIG","bed",3,6),(STOVE,10,5),(HIDES,3,2)],
    "int_cabin":     [("BIG","bed",2,6),("BIG","table",9,6),(HEARTH,11,2),(DESK,2,2),(HANGLANTERN,7,1)],
    "int_cresap":    [("BIG","desk",3,6),("BIG","armoire",10,4),("BIG","couch",3,2),(SHELF,11,1),(HANGLANTERN,7,1)],
    "int_school":    [("BIG","desk",3,6),(PEW,7,6),(PEW,10,6),(SHELF,2,1),(SHELF,11,1)],
    "int_shack":     [("BIG","bed",3,6),(HEARTH,10,2),(HIDES,3,2)],
    "int_ferry":     [("BIG","counter",5,2),(ROPES,2,6),(ROPES,11,6),(HIDES,3,2),(BARRELS,11,1)],
    "int_brahm":     [(WARDS,3,1),(WARDS,10,1),(HEARTH,7,2),("BIG","kitchen",2,6),(LOOM,11,5),(HANGLANTERN,7,3)],
    "int_depot":     [("BIG","counter",6,2),(CRATES,2,6),(BARRELS,11,6),(STOVE,2,2),(HANGLANTERN,7,1)],
    "int_lockhouse": [("BIG","bed",2,6),("BIG","kitchen",9,2),(ROPES,11,6),(DESK,3,2)],
}

for name, dx, dy, iid in doors:
    iw, ih = 14, 10
    g = [[IWALL if (x in (0, iw - 1) or y in (0, ih - 1)) else IFLOOR for x in range(iw)] for y in range(ih)]
    c = [[g[y][x] if g[y][x] == IWALL else 0 for x in range(iw)] for y in range(ih)]
    ex = iw // 2
    g[ih - 1][ex] = DOOR; c[ih - 1][ex] = 0
    # decor layer: non-solid furnishings, floor shows through transparent pixels
    decor = [[0] * iw for _ in range(ih)]
    oddities = []
    ODDITY_TEXT = {
        HEARTH: "A fieldstone hearth, the mortar packed with river clay and, if you look, one child's marble set in for luck.",
        ANVIL: "Feig's anvil rings faintly when the wind is right, a note the whole street knows and no one explains.",
        JARS: "Jars of things in spirits: a two-headed trout from the Youghiogheny, a caul, a knot of hair labeled only with a date.",
        SHELF: "Almanacs, a ledger of debts, a hymnal, and a jar of buttons sorted by a hand with too much time and too much grief.",
        PEW: "The pew backs are carved with initials going back three generations, and one set nobody will claim.",
        ALTAR: "Beeswax candles and a plain brass cross, and beneath the cloth, older marks the whitewash never quite covered.",
        BARRELS: "Barrels of cider going hard, apple butter, and one unmarked cask that hums against your palm.",
        LOOM: "A coverlet on the loom in the overshot pattern they call Wandering Vine, half-finished for a wedding or a burying.",
        DESK: "A writing desk gone amber with lamp smoke, the blotter a palimpsest of every letter this town confessed to paper.",
        BED: "A rope bed strung tight, a corn-shuck tick, and a Bible on the sill open to a page somebody reads and rereads.",
        ROPES: "Coils of canal-boat line and mule harness, hide scrapers, and the good clean smell of tar and animal and work.",
        HIDES: "Pelts on the wall: fox, catamount, a bear that took two men, and one small hide nobody names.",
        WARDS: "Hex signs in the widow's mother's patterns, and dried roots on strings that turn when no door has opened.",
        CRYSTALS: "Quartz points and a geode split open, brought down from the mountain, cold long after your hand should have warmed them.",
        STOVE: "A pot-belly stove ticking as it cools, and a stack of excise stamps for canal freight, weighted with a stone that is not from here.",
        HANGLANTERN: "A tin lantern on a chain, its punched holes throwing a constellation on the ceiling that is almost, not quite, ours.",
    }
    oid_dec = 700
    for piece in FURNISH.get(iid, []):
        if piece[0] == "BIG":
            _, bname, fx, fy = piece
            lg = big(bname)
            if lg and 0 < fx < iw - 2 and 0 < fy < ih - 1:
                # do not cover the exit column on the bottom row
                if not (fy == ih - 1 and (fx == ex or fx + 1 == ex)):
                    decor[fy][fx] = lg
                    decor[fy][fx + 1] = lg + 1
                    BIG_ODDITY = {
                        "bed": "A rope bed strung tight under a pieced quilt, the batting flat where the same body has lain for years.",
                        "desk": "A writing desk gone amber with lamp smoke, every drawer a nest of receipts and half-finished letters.",
                        "counter": "A shop counter worn to a shine, the scale beam trued a hair light, the way every honest merchant swears it is not.",
                        "kitchen": "A cast range, still ticking with heat, and a dresser of blue-glazed crockery, one plate short of a set.",
                        "armoire": "A wardrobe of black walnut, too fine for the room, with a lock and no key on the hook where the key should hang.",
                        "couch": "A horsehair settle worn smooth, the kind of seat where confidences are traded and regretted.",
                        "table": "A plank table set for a meal that never quite happens, a candle guttered to a stub.",
                    }
                    if bname in BIG_ODDITY:
                        oddities.append({"id": oid_dec, "name": "an oddity", "type": "oddity",
                                         "x": fx * T, "y": (fy + 1) * T, "width": 2 * T, "height": T,
                                         "properties": [{"name": "text", "type": "string", "value": BIG_ODDITY[bname]}]})
                        oid_dec += 1
            continue
        gid, fx, fy = piece
        if 0 < fx < iw - 1 and 0 < fy < ih - 1 and not (fy == ih - 1 and fx == ex):
            decor[fy][fx] = gid
            if gid in ODDITY_TEXT:
                oddities.append({"id": oid_dec, "name": "an oddity", "type": "oddity",
                                 "x": fx * T, "y": (fy + 1) * T, "width": T, "height": T,
                                 "properties": [{"name": "text", "type": "string", "value": ODDITY_TEXT[gid]}]})
                oid_dec += 1
    interior = tiled(iw, ih, g, c, [
        {"type": "tilelayer", "name": "decor", "width": iw, "height": ih,
         "data": [decor[y][x] for y in range(ih) for x in range(iw)]},
        {"type": "objectgroup", "name": "spawns", "objects": [
            {"id": 1, "name": "entry", "type": "spawn", "x": ex * T, "y": (ih - 2) * T, "width": T, "height": T}]},
        {"type": "objectgroup", "name": "interact", "objects": INTERIOR_EXTRAS.get(iid, []) + oddities},
        {"type": "objectgroup", "name": "doors", "objects": [
            {"id": 2, "name": "out", "type": "door", "x": ex * T, "y": (ih - 1) * T, "width": T, "height": T,
             "properties": [{"name": "target", "type": "string", "value": "town"},
                             {"name": "spawn", "type": "string", "value": "from_" + iid}]}]},
    ])
    OUT.joinpath(iid + ".json").write_text(json.dumps(interior, indent=1))

# ---- the caves ----
CW2, CH2 = 48, 32
cg = [[IWALL] * CW2 for _ in range(CH2)]
cc = [[IWALL] * CW2 for _ in range(CH2)]

def carve(x0, y0, x1, y1):
    for y in range(min(y0, y1), max(y0, y1) + 1):
        for x in range(min(x0, x1), max(x0, x1) + 1):
            for dy in (0, 1):
                for dx in (0, 1):
                    yy, xx = min(CH2 - 1, y + dy), min(CW2 - 1, x + dx)
                    cg[yy][xx] = RUIN
                    cc[yy][xx] = 0

# the descent: switchbacks toward the chamber
carve(4, 1, 4, 8); carve(4, 8, 16, 8); carve(16, 8, 16, 3); carve(16, 3, 28, 3)
carve(28, 3, 28, 14); carve(28, 14, 10, 14); carve(10, 14, 10, 22); carve(10, 22, 24, 22)
carve(24, 22, 24, 18); carve(24, 18, 36, 18); carve(36, 18, 36, 27); carve(36, 27, 43, 27)
# side pockets
carve(20, 8, 20, 11); carve(32, 3, 32, 7); carve(16, 22, 16, 26)
# the chamber
for y in range(24, 31):
    for x in range(38, 47):
        cg[y][x] = RUIN; cc[y][x] = 0
# a cold pool
for y in range(25, 28):
    for x in range(39, 42):
        cg[y][x] = WATER; cc[y][x] = 0
cg[1][4] = DOOR; cc[1][4] = 0

caves = tiled(CW2, CH2, cg, cc, [
    {"type": "objectgroup", "name": "spawns", "objects": [
        {"id": 1, "name": "entry", "type": "spawn", "x": 4 * T, "y": 2 * T, "width": T, "height": T}]},
    {"type": "objectgroup", "name": "interact", "objects": [
        {"id": 2, "name": "a nailed horseshoe", "type": "clue", "x": 20 * T, "y": 10 * T, "width": T, "height": T,
         "properties": [{"name": "text", "type": "string", "value": "A horseshoe nailed at the fork, Marsh's mark. Behind it, casks aging in the dark: the still's whole cellar. You leave it be, and note the fork it guards."}]},
        {"id": 3, "name": "a whiskey cask", "type": "clue", "x": 32 * T, "y": 5 * T, "width": T, "height": T,
         "properties": [{"name": "gives", "type": "string", "value": "whiskey"},
                         {"name": "text", "type": "string", "value": "Cave-aged, cool as the stone. One bottle will not be missed, and Marsh would call it a toll."}]},
        {"id": 4, "name": "a pale light in the dark", "type": "wisp", "x": 14 * T, "y": 14 * T, "width": T, "height": T, "properties": []},
        {"id": 5, "name": "a pale light by the pool", "type": "wisp", "x": 16 * T, "y": 25 * T, "width": T, "height": T, "properties": []},
        {"id": 6, "name": "the chamber", "type": "chamber", "x": 44 * T, "y": 28 * T, "width": T, "height": T, "properties": []}]},
    {"type": "objectgroup", "name": "doors", "objects": [
        {"id": 7, "name": "daylight", "type": "door", "x": 4 * T, "y": 1 * T, "width": T, "height": T,
         "properties": [{"name": "target", "type": "string", "value": "town"},
                         {"name": "spawn", "type": "string", "value": "from_caves"}]}]}
])
OUT.joinpath("caves.json").write_text(json.dumps(caves, indent=1))

# the return spawn on the town side of the cave mouth
for layer in town["layers"]:
    if layer.get("name") == "spawns":
        layer["objects"].append({"id": 599, "name": "from_caves", "type": "spawn",
                                  "x": 31 * T, "y": 8 * T, "width": T, "height": T})
OUT.joinpath("town.json").write_text(json.dumps(town, indent=1))

print(f"town.json ({W}x{H}), caves.json ({CW2}x{CH2}), and {len(doors)} interiors generated")

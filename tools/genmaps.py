#!/usr/bin/env python3
"""Generate the town map and its interiors from the layout document.

Gids: 1 grass, 2 water, 3 treeline, 4 ford, 5 street, 6 building wall,
7 stall, 8 door, 9 interior floor, 10 interior wall, 11 ruin, 12 dock.
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "maps"
W, H, T = 96, 64, 16

GRASS, WATER, TREE, FORD, STREET, WALL, STALL, DOOR = 1, 2, 3, 4, 5, 6, 7, 8
IFLOOR, IWALL, RUIN, DOCK = 9, 10, 11, 12

ground = [[GRASS] * W for _ in range(H)]
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
]

# overlap check
seen = set()
for name, x0, y0, x1, y1, door, iid in BUILDINGS:
    for y in range(y0, y1):
        for x in range(x0, x1):
            assert (x, y) not in seen, f"overlap at {(x, y)} in {name}"
            seen.add((x, y))

doors = []
for name, x0, y0, x1, y1, (dx, dy), iid in BUILDINGS:
    fill(x0, y0, x1, y1, WALL, True)
    ground[dy][dx] = DOOR
    solid[dy][dx] = 0
    doors.append((name, dx, dy, iid))

# NPC spots: work near door, tavern near the Mule, homes scattered
def door_of(iid):
    for name, dx, dy, i in doors:
        if i == iid:
            return dx * T, (dy + 1) * T
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
    "bright_work": door_of("int_stable"), "bright_tavern": (mule_x - 48, mule_y), "bright_home": door_of("int_stable"),
    "gaol": door_of("int_gaol"),
}

NPCS = ["doyle", "beall", "cresap", "ward", "feig", "gantt",
        "rood", "mcteague", "coombs", "fenwick", "shanks", "bright"]

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
    from_spawns.append({"id": 500 + i, "name": "from_" + iid, "type": "spawn",
                        "x": dx * T, "y": (dy + 1) * T, "width": T, "height": T})

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

town = tiled(W, H, ground, solid, [
    {"type": "objectgroup", "name": "spawns", "objects":
        [{"id": 99, "name": "player", "type": "spawn", "x": 10 * T, "y": 31 * T, "width": T, "height": T}]
        + npc_objects + from_spawns},
    {"type": "objectgroup", "name": "spots", "objects": spot_objects},
    {"type": "objectgroup", "name": "interact", "objects": interact},
    {"type": "objectgroup", "name": "doors", "objects": door_objects},
])
OUT.joinpath("town.json").write_text(json.dumps(town, indent=1))

# interiors: one room each, exit door bottom center back to town
INTERIOR_EXTRAS = {
    "int_bluemule": [
        {"id": 601, "name": "the corner room", "type": "laylow", "x": 3 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "hours", "type": "int", "value": 6}, {"name": "price", "type": "int", "value": 1}]},
        {"id": 602, "name": "the hearth", "type": "station", "x": 10 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "station", "type": "string", "value": "hearth"}]},
        {"id": 603, "name": "your chest", "type": "stash", "x": 4 * T, "y": 2 * T, "width": T, "height": T, "properties": []}
    ],
    "int_surgery": [
        {"id": 604, "name": "the apothecary bench", "type": "station", "x": 10 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "station", "type": "string", "value": "apothecary"}]}
    ],
    "int_smithy": [
        {"id": 605, "name": "the anvil", "type": "station", "x": 10 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "station", "type": "string", "value": "smithy"}]},
        {"id": 606, "name": "Feig's counter", "type": "restore", "x": 3 * T, "y": 2 * T, "width": T, "height": T, "properties": []}
    ],
    "int_store": [
        {"id": 607, "name": "the counter", "type": "vendor", "x": 7 * T, "y": 2 * T, "width": T, "height": T,
         "properties": [{"name": "stock", "type": "string",
                          "value": "johnnycake,salt_pork,whiskey,coffee,powder_and_shot,salt_pouch,dried_sassafras,lantern_oil,whetstone,oil_rag,tricorn,slouch_hat,work_boots,gentleman_frock,preacher_black"}]}
    ]
}
for name, dx, dy, iid in doors:
    iw, ih = 14, 10
    g = [[IWALL if (x in (0, iw - 1) or y in (0, ih - 1)) else IFLOOR for x in range(iw)] for y in range(ih)]
    c = [[g[y][x] if g[y][x] == IWALL else 0 for x in range(iw)] for y in range(ih)]
    ex = iw // 2
    g[ih - 1][ex] = DOOR; c[ih - 1][ex] = 0
    interior = tiled(iw, ih, g, c, [
        {"type": "objectgroup", "name": "spawns", "objects": [
            {"id": 1, "name": "entry", "type": "spawn", "x": ex * T, "y": (ih - 2) * T, "width": T, "height": T}]},
        {"type": "objectgroup", "name": "interact", "objects": INTERIOR_EXTRAS.get(iid, [])},
        {"type": "objectgroup", "name": "doors", "objects": [
            {"id": 2, "name": "out", "type": "door", "x": ex * T, "y": (ih - 1) * T, "width": T, "height": T,
             "properties": [{"name": "target", "type": "string", "value": "town"},
                             {"name": "spawn", "type": "string", "value": "from_" + iid}]}]},
    ])
    OUT.joinpath(iid + ".json").write_text(json.dumps(interior, indent=1))

print(f"town.json ({W}x{H}) and {len(doors)} interiors generated")

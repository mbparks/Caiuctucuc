#!/usr/bin/env python3
"""Generate the placeholder-plus art: tileset in four palette periods,
character sheets per coat, the dithered lantern, and the parallax ridge.

This is pipeline-proving art. Final art (hand drawn, commissioned, or
licensed base) replaces these PNGs without code changes. Palette swaps are
done the SNES way: the same indexed art rendered through four period LUTs.
"""
import random
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "assets"
T = 16
rng = random.Random(1800)

# ---- the master palette (subset of the 64; named for sanity) ----
P = {
    "grass1": (64, 148, 64), "grass2": (48, 120, 48), "grass3": (36, 96, 40),
    "water1": (58, 108, 196), "water2": (120, 168, 232), "water3": (36, 76, 156),
    "tree1": (32, 112, 40), "tree2": (16, 72, 24),
    "dirt1": (232, 200, 144), "dirt2": (214, 180, 124), "dirt3": (188, 152, 100),
    "stone1": (176, 172, 160), "stone2": (132, 128, 118),
    "timber1": (168, 84, 56), "timber2": (120, 52, 36), "timber3": (196, 108, 72),
    "roof": (88, 40, 28),
    "plank1": (200, 156, 92), "plank2": (168, 124, 68),
    "door": (72, 44, 24), "doordk": (40, 24, 12),
    "ifloor1": (200, 156, 92), "ifloor2": (176, 132, 76),
    "iwall": (56, 32, 20),
    "ruin1": (156, 148, 132), "ruin2": (112, 106, 94),
    "skin": (232, 176, 128), "skindk": (188, 132, 92),
    "hatred": (200, 44, 32),
    "drover": (224, 196, 140), "droverdk": (180, 152, 100),
    "frock": (60, 88, 200), "frockdk": (40, 60, 152),
    "preacher": (52, 52, 60), "preacherdk": (32, 32, 40),
    "npc": (176, 144, 92), "npcdk": (140, 110, 66),
    "blue": (56, 116, 176), "bluedk": (36, 84, 136),
    "boots": (72, 44, 24),
    "outline": (10, 8, 8),
    "grasslt": (104, 188, 88),
    "flower1": (244, 208, 96), "flower2": (224, 96, 120),
    "trunk": (120, 72, 40), "canopy_hi": (96, 180, 80),
    "glass": (24, 30, 38), "frame": (232, 216, 180),
    "stone_found": (132, 128, 118),
    "black": (8, 8, 8),
}

def lut_day(c): return c
def lut_dusk(c):
    if c == (24, 30, 38): return (196, 142, 76)
    r, g, b = c
    return (min(255, int(r * 1.02 + 14)), int(g * 0.80), int(b * 0.88 + 8))
GLASS = (24, 30, 38)
def lut_night(c):
    if c == GLASS: return (232, 178, 92)
    r, g, b = c
    return (int(r * 0.42), int(g * 0.48), min(255, int(b * 0.72 + 22)))
def lut_fog(c):
    r, g, b = c
    gray = (r + g + b) // 3
    return (int(gray * 0.7 + r * 0.25), int(gray * 0.7 + g * 0.28), int(gray * 0.7 + b * 0.25))

PERIODS = {"day": lut_day, "dusk": lut_dusk, "night": lut_night, "fog": lut_fog}

# ---- tiles: paint each gid at 16x16 in master colors ----
def blank(): return [[P["grass1"]] * T for _ in range(T)]

def speckle(px, base, fleck, n):
    for y in range(T):
        for x in range(T):
            px[y][x] = base
    for _ in range(n):
        px[rng.randrange(T)][rng.randrange(T)] = fleck
    return px

def tile_grass():
    px = speckle(blank(), P["grass1"], P["grass2"], 7)
    for _ in range(3):
        x, y = rng.randrange(1, 15), rng.randrange(1, 15)
        px[y][x] = P["grasslt"]
    return px

def tile_grass_tufts():
    px = tile_grass()
    for _ in range(4):
        x, y = rng.randrange(2, 14), rng.randrange(3, 14)
        px[y][x] = P["grasslt"]; px[y - 1][x] = P["grasslt"]
        px[y - 2][x] = P["grass2"]; px[y - 1][x - 1] = P["grasslt"]
    return px

def tile_flowers(phase=0):
    px = tile_grass()
    for i, (x, y) in enumerate([(3, 4), (9, 3), (13, 8), (5, 11), (11, 13)]):
        c = P["flower1"] if i % 2 == 0 else P["flower2"]
        sway = phase if i % 2 == 0 else 0
        px[y][min(15, x + sway)] = c
        px[y - 1][min(15, x + sway)] = c
        px[y][max(0, x + sway - 1)] = P["grasslt"]
    return px

def tile_tall_grass():
    px = tile_grass()
    for x in range(1, 15, 2):
        h = 3 + (x * 7) % 4
        for i in range(h):
            px[15 - i][x] = P["grasslt"] if i > h - 3 else P["grass2"]
    return px

def tile_water():
    px = [[P["water1"]] * T for _ in range(T)]
    for y in range(2, T, 5):
        for x in range(2, T - 2, 5):
            px[y][x] = P["water2"]; px[y][x + 1] = P["water2"]
            px[y + 1][x + 1] = P["water3"]
    return px

def tile_tree():
    px = [[P["black"]] * T for _ in range(T)]
    def lobe(cx, cy, r):
        for y in range(T):
            for x in range(T):
                if (x - cx) ** 2 + (y - cy) ** 2 < r:
                    px[y][x] = P["tree1"]
    lobe(5, 6, 22); lobe(11, 6, 22); lobe(8, 10, 26)
    for y in range(T):
        for x in range(T):
            if px[y][x] == P["tree1"]:
                if y < 5 or ((x + y * 2) % 6 == 0 and y < 9): px[y][x] = P["canopy_hi"]
                elif y > 11 and (x + y) % 3 == 0: px[y][x] = P["tree2"]
    for x in (4, 5, 10, 11):
        px[14][x] = P["tree2"]
    return px

def tile_ford():
    px = tile_water()
    for (cx, cy) in [(3, 4), (8, 7), (12, 3), (5, 11), (11, 12)]:
        for dy in range(-1, 2):
            for dx in range(-1, 2):
                if abs(dx) + abs(dy) < 2: px[(cy+dy) % T][(cx+dx) % T] = P["stone1"]
        px[cy][cx] = P["stone2"]
    return px

def tile_street():
    px = speckle(blank(), P["dirt1"], P["dirt2"], 6)
    for _ in range(3): px[rng.randrange(T)][rng.randrange(T)] = P["dirt3"]
    return px

def tile_wall():
    px = [[P["timber1"]] * T for _ in range(T)]
    for y in range(T):
        for x in range(T):
            if y % 4 == 3: px[y][x] = P["timber2"]
            elif (x + (y // 4) * 4) % 8 == 0: px[y][x] = P["timber2"]
            elif (x + y) % 9 == 0: px[y][x] = P["timber3"]
    for x in range(T):
        px[0][x] = P["roof"]
        px[1][x] = P["roof"] if x % 4 else P["timber2"]
        px[14][x] = P["stone_found"] if x % 3 else P["stone2"]
        px[15][x] = P["black"]
    return px

def tile_window_wall():
    px = tile_wall()
    for y in range(4, 11):
        for x in range(4, 12):
            px[y][x] = P["frame"] if (x in (4, 11) or y in (4, 10) or x == 7 or x == 8 or y == 7) else P["glass"]
    return px

def tile_stall():
    px = tile_street()
    for x in range(2, 14): px[4][x] = P["plank1"]; px[5][x] = P["plank2"]
    for y in range(4, 12): px[y][3] = P["timber2"]; px[y][12] = P["timber2"]
    return px

def tile_door():
    px = tile_wall()
    for y in range(4, 16):
        for x in range(5, 11):
            px[y][x] = P["door"] if (x + y) % 2 else P["doordk"]
    px[10][9] = P["stone1"]
    return px

def tile_ifloor():
    px = [[P["ifloor1"]] * T for _ in range(T)]
    for y in range(T):
        for x in range(T):
            if x % 4 == 3: px[y][x] = P["ifloor2"]
    return px

def tile_iwall():
    px = [[P["iwall"]] * T for _ in range(T)]
    for x in range(T):
        if x % 3 == 0: px[T-2][x] = P["timber2"]
    return px

def tile_ruin():
    px = speckle(blank(), P["ruin2"], P["ruin1"], 26)
    for (cx, cy) in [(4, 5), (11, 9), (8, 3)]:
        px[cy][cx] = P["stone1"]; px[cy][(cx+1) % T] = P["stone2"]
    return px

def tile_dock():
    px = [[P["plank2"]] * T for _ in range(T)]
    for y in range(T):
        for x in range(T):
            if y % 4 == 0: px[y][x] = P["timber2"]
            elif x % 6 == 2: px[y][x] = P["plank1"]
    return px

def tile_water2():
    px = [[P["water1"]] * T for _ in range(T)]
    for y in range(4, T, 5):
        for x in range(4, T - 1, 5):
            px[y][x] = P["water2"]; px[y][x - 1] = P["water2"]
            px[y - 1][x - 1] = P["water3"]
    return px

TILES = [tile_grass(), tile_water(), tile_tree(), tile_ford(), tile_street(),
         tile_wall(), tile_stall(), tile_door(), tile_ifloor(), tile_iwall(),
         tile_ruin(), tile_dock(), tile_grass_tufts(), tile_flowers(0),
         tile_tall_grass(), tile_window_wall()]
TILES_F2 = list(TILES)
TILES_F2[1] = tile_water2()
TILES_F2[13] = tile_flowers(1)

def write_tilesheet(period, lut):
    img = Image.new("RGB", (T * len(TILES), T * 2))
    for row, tiles in enumerate([TILES, TILES_F2]):
        for i, tile in enumerate(tiles):
            for y in range(T):
                for x in range(T):
                    img.putpixel((i * T + x, row * T + y), lut(tile[y][x]))
    (OUT / "tiles").mkdir(parents=True, exist_ok=True)
    img.save(OUT / "tiles" / f"tileset_{period}.png")

for period, lut in PERIODS.items():
    write_tilesheet(period, lut)

# ---- characters: 16x24, 4 walk frames, per coat ----
CW, CH = 16, 24

def coat_light(c):
    return tuple(min(255, int(v * 1.25 + 12)) for v in c)

def draw_char(coat, coatdk, hat, frame, hat_shape="tricorn"):
    px = [[None] * CW for _ in range(CH)]
    swing = [0, 1, 0, -1][frame]
    bob = 1 if frame % 2 == 1 else 0
    def put(y, x, c):
        if 0 <= y - bob < CH and 0 <= x < CW: px[y - bob][x] = c
    # head and face, brim shadow across the brow
    for y in range(4, 9):
        for x in range(5, 11):
            put(y, x, P["skin"])
    for x in range(5, 11): put(4, x, P["skindk"])
    put(6, 6, P["outline"]); put(6, 9, P["outline"])
    put(8, 7, P["skindk"]); put(8, 8, P["skindk"])
    # hats by shape
    if hat_shape == "tricorn":
        for x in range(3, 13): put(3, x, hat)
        for x in range(5, 11): put(2, x, hat)
        for x in range(6, 10): put(1, x, coat_light(hat))
        put(3, 3, P["outline"]); put(3, 12, P["outline"])
    elif hat_shape == "slouch":
        for x in range(3, 13): put(3, x, hat)
        put(4, 3, hat); put(4, 12, hat)
        for x in range(5, 11): put(2, x, hat)
    elif hat_shape == "flat":
        for x in range(4, 12): put(3, x, hat)
        for x in range(5, 11): put(2, x, hat)
    elif hat_shape == "cap":
        for x in range(5, 11): put(3, x, hat); put(2, x, hat)
        put(3, 4, hat); put(3, 11, hat); put(1, 7, coat_light(hat)); put(1, 8, coat_light(hat))
    elif hat_shape == "bonnet":
        for x in range(4, 12): put(3, x, hat); put(2, x, hat)
        put(4, 4, hat); put(5, 4, hat); put(4, 11, hat); put(5, 11, hat)
        for x in range(5, 11): put(1, x, hat)
    # coat: lit left, shaded right, buttons down the front
    for y in range(9, 19):
        for x in range(4, 12):
            put(y, x, coat_light(coat) if x <= 6 else (coat if x <= 9 else coatdk))
    for y in range(10, 17, 2): put(y, 8, P["outline"])
    for y in range(17, 20):
        for x in range(4, 12): put(y, x, coatdk)
    put(9, 7, P["skin"]); put(9, 8, P["skin"])   # collar gap
    # arms swing
    for y in range(10, 16):
        put(y, 3 if swing >= 0 else 2, coatdk)
        put(y, 12 if swing <= 0 else 13, coat)
    # legs alternate with boots
    la, lb = (20, 22) if frame % 2 == 0 else (21, 21)
    for y in range(19, 24):
        if y <= la + 2: put(y, 6, P["boots"]); put(y, 5, P["boots"] if y > 21 else None)
        if y <= lb + 2: put(y, 9, P["boots"]); put(y, 10, P["boots"] if y > 21 else None)
    if frame == 1: put(23, 4, P["boots"])
    if frame == 3: put(23, 11, P["boots"])
    # the outline: every filled pixel bordering emptiness gets the dark edge
    src = [row[:] for row in px]
    for y in range(CH):
        for x in range(CW):
            if src[y][x] is None:
                for dy, dx in ((-1,0),(1,0),(0,-1),(0,1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < CH and 0 <= xx < CW and src[yy][xx] is not None and src[yy][xx] != P["outline"]:
                        px[y][x] = P["outline"]
                        break
    return px

def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)

NPC_COLORS = {
    "doyle":   ((208, 72, 56), (160, 48, 40), (72, 40, 28), "slouch"),
    "cresap":  ((116, 88, 192), (84, 60, 148), (32, 24, 56), "tricorn"),
    "ward":    ((64, 152, 108), (44, 116, 80), (24, 56, 40), "flat"),
    "feig":    ((196, 116, 48), (152, 84, 32), (88, 48, 20), "cap"),
    "gantt":   ((188, 172, 120), (148, 132, 88), (72, 60, 36), "tricorn"),
    "rood":    ((96, 140, 200), (64, 104, 160), (36, 52, 84), "flat"),
    "mcteague":((160, 128, 80), (124, 96, 56), (56, 40, 24), "slouch"),
    "coombs":  ((124, 116, 100), (92, 86, 72), (44, 40, 32), "slouch"),
    "fenwick": ((184, 96, 176), (140, 64, 132), (68, 32, 64), "tricorn"),
    "shanks":  ((72, 160, 168), (48, 120, 128), (24, 60, 64), "cap"),
    "bright":  ((216, 156, 60), (172, 116, 40), (92, 60, 24), "slouch"),
    "beall":   ((56, 116, 208), (36, 84, 160), (24, 20, 48), "tricorn"),
    "brahm":   ((140, 96, 172), (104, 68, 132), (232, 220, 196), "bonnet"),
}

SHEETS = {
    "player_drover": (P["drover"], P["droverdk"], P["hatred"], "tricorn"),
    "player_frock": (P["frock"], P["frockdk"], P["hatred"], "tricorn"),
    "player_preacher": (P["preacher"], P["preacherdk"], P["hatred"], "flat"),
    "npc": (P["npc"], P["npcdk"], P["timber2"], "slouch"),
    "constable": (P["blue"], P["bluedk"], P["iwall"], "tricorn"),
}
for nid, (c, cdk, hat, shape) in NPC_COLORS.items():
    SHEETS["npc_" + nid] = (c, cdk, hat, shape)
(OUT / "sprites").mkdir(parents=True, exist_ok=True)
for name, (c, cdk, hat, shape) in SHEETS.items():
    img = Image.new("RGBA", (CW * 4, CH), (0, 0, 0, 0))
    for f in range(4):
        px = draw_char(c, cdk, hat, f, shape)
        for y in range(CH):
            for x in range(CW):
                if px[y][x]: img.putpixel((f * CW + x, y), (*px[y][x], 255))
    img.save(OUT / "sprites" / f"{name}.png")

# ---- pets: 10x8, two frames ----
def draw_pet(body, dark, tail_up, cat):
    img = Image.new("RGBA", (20, 8), (0, 0, 0, 0))
    for f, tu in enumerate([tail_up, not tail_up]):
        ox = f * 10
        for y in range(3, 7):
            for x in range(2, 8):
                img.putpixel((ox + x, y), (*body, 255))
        img.putpixel((ox + 8, 3), (*body, 255))          # head
        img.putpixel((ox + 8, 2), (*body, 255))
        if cat:
            img.putpixel((ox + 7, 1), (*dark, 255))       # ears
            img.putpixel((ox + 9, 1), (*dark, 255))
        img.putpixel((ox + 1, 2 if tu else 4), (*dark, 255))  # tail
        img.putpixel((ox + 3, 7), (*dark, 255))          # legs
        img.putpixel((ox + 6, 7), (*dark, 255))
    return img

draw_pet((122, 92, 58), (86, 64, 40), True, False).save(OUT / "sprites" / "dog.png")
draw_pet((104, 104, 110), (70, 70, 76), False, True).save(OUT / "sprites" / "cat.png")

# ---- lantern: radial glow with 4x4 ordered (Bayer) dithered alpha ----
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
L = 128
lantern = Image.new("L", (L, L), 0)
for y in range(L):
    for x in range(L):
        d = ((x - L/2) ** 2 + (y - L/2) ** 2) ** 0.5 / (L / 2)
        strength = max(0.0, 1.0 - d) ** 1.4
        lantern.putpixel((x, y), 255 if strength * 16 > BAYER[y % 4][x % 4] else 0)
lantern.save(OUT / "sprites" / "lantern.png")

# ---- the parallax ridge: Wills Mountain with the quarry scar ----
RW, RH = 512, 28
ridge = Image.new("RGBA", (RW, RH), (0, 0, 0, 0))
heights = []
h = 14
for x in range(RW):
    h += rng.choice([-1, 0, 0, 1])
    h = max(6, min(22, h))
    heights.append(h)
for x in range(RW):
    for y in range(RH - heights[x], RH):
        shade = (26, 30, 24, 255) if y > RH - heights[x] + 2 else (36, 42, 34, 255)
        ridge.putpixel((x, y), shade)
# the quarry scar, pale against the ridge
for x in range(330, 352):
    for y in range(RH - heights[x] + 2, RH - heights[x] + 7):
        if 0 <= y < RH: ridge.putpixel((x, y), (96, 90, 78, 255))
ridge.save(OUT / "sprites" / "ridge.png")

print(f"art generated: 4 tilesheets, {len(SHEETS)} character sheets, lantern, ridge")

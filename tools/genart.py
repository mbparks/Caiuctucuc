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
    "grass1": (44, 48, 32), "grass2": (52, 58, 38), "grass3": (38, 42, 28),
    "water1": (61, 74, 82), "water2": (74, 90, 99), "water3": (50, 62, 70),
    "tree1": (28, 32, 22), "tree2": (20, 24, 16),
    "dirt1": (74, 68, 54), "dirt2": (84, 78, 62), "dirt3": (64, 58, 46),
    "stone1": (90, 88, 82), "stone2": (72, 70, 65),
    "timber1": (52, 42, 30), "timber2": (40, 32, 23), "timber3": (62, 51, 37),
    "roof": (36, 31, 24),
    "plank1": (86, 70, 46), "plank2": (74, 60, 39),
    "door": (90, 64, 40), "doordk": (60, 42, 26),
    "ifloor1": (58, 49, 40), "ifloor2": (50, 42, 34),
    "iwall": (23, 19, 14),
    "ruin1": (63, 58, 48), "ruin2": (50, 46, 38),
    "skin": (196, 154, 116), "skindk": (150, 112, 82),
    "hatred": (154, 74, 50),
    "drover": (196, 182, 150), "droverdk": (160, 148, 120),
    "frock": (122, 106, 143), "frockdk": (95, 82, 114),
    "preacher": (58, 58, 58), "preacherdk": (40, 40, 40),
    "npc": (138, 127, 95), "npcdk": (110, 101, 75),
    "blue": (95, 122, 138), "bluedk": (72, 95, 110),
    "boots": (48, 38, 28),
}

def lut_day(c): return c
def lut_dusk(c):
    r, g, b = c
    return (min(255, int(r * 1.02 + 14)), int(g * 0.80), int(b * 0.88 + 8))
def lut_night(c):
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
    px = speckle(blank(), P["grass1"], P["grass2"], 22)
    for _ in range(8): px[rng.randrange(T)][rng.randrange(T)] = P["grass3"]
    return px

def tile_water():
    px = [[P["water1"]] * T for _ in range(T)]
    for y in range(2, T, 4):
        for x in range(T):
            if (x + y) % 7 < 4: px[y][x] = P["water2"]
            if (x + y) % 11 == 0: px[min(T-1, y+1)][x] = P["water3"]
    return px

def tile_tree():
    px = speckle(blank(), P["tree1"], P["tree2"], 40)
    for _ in range(10): px[rng.randrange(T)][rng.randrange(T)] = P["grass3"]
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
    px = speckle(blank(), P["dirt1"], P["dirt2"], 18)
    for x in range(T):
        if 4 <= x <= 5 or 10 <= x <= 11: px[rng.randrange(T)][x] = P["dirt3"]
    for y in range(T): px[y][4] = P["dirt3"]; px[y][11] = P["dirt3"]
    return px

def tile_wall():
    px = [[P["timber1"]] * T for _ in range(T)]
    for y in range(T):
        for x in range(T):
            if y % 5 == 0: px[y][x] = P["timber2"]
            elif x % 8 == 0: px[y][x] = P["timber3"]
    for x in range(T): px[0][x] = P["roof"]; px[1][x] = P["roof"]
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

TILES = [tile_grass(), tile_water(), tile_tree(), tile_ford(), tile_street(),
         tile_wall(), tile_stall(), tile_door(), tile_ifloor(), tile_iwall(),
         tile_ruin(), tile_dock()]

def write_tilesheet(period, lut):
    img = Image.new("RGB", (T * len(TILES), T))
    for i, tile in enumerate(TILES):
        for y in range(T):
            for x in range(T):
                img.putpixel((i * T + x, y), lut(tile[y][x]))
    (OUT / "tiles").mkdir(parents=True, exist_ok=True)
    img.save(OUT / "tiles" / f"tileset_{period}.png")

for period, lut in PERIODS.items():
    write_tilesheet(period, lut)

# ---- characters: 16x24, 4 walk frames, per coat ----
CW, CH = 16, 24

def draw_char(coat, coatdk, hat, frame):
    px = [[None] * CW for _ in range(CH)]
    swing = [0, 1, 0, -1][frame]
    # head and face
    for y in range(4, 9):
        for x in range(5, 11):
            px[y][x] = P["skin"]
    px[7][6] = P["skindk"]; px[7][9] = P["skindk"]
    # hat: tricorn-ish brim
    for x in range(4, 12): px[3][x] = hat
    for x in range(5, 11): px[2][x] = hat
    px[3][3] = hat; px[3][12] = hat
    # coat body
    for y in range(9, 18):
        for x in range(4, 12):
            px[y][x] = coat if (x + y) % 9 else coatdk
    # coat skirts
    for y in range(18, 20):
        for x in range(4, 12):
            px[y][x] = coatdk
    # arms swing
    for y in range(10, 16):
        px[y][3 if swing >= 0 else 2] = coatdk
        px[y][12 if swing <= 0 else 13] = coatdk
    # legs alternate
    la, lb = (20, 22) if frame % 2 == 0 else (21, 21)
    for y in range(20, 24):
        px[y][6] = P["boots"] if y <= la + 2 else None
        px[y][9] = P["boots"] if y <= lb + 2 else None
    if frame == 1: px[23][5] = P["boots"]
    if frame == 3: px[23][10] = P["boots"]
    return px

SHEETS = {
    "player_drover": (P["drover"], P["droverdk"], P["hatred"]),
    "player_frock": (P["frock"], P["frockdk"], P["hatred"]),
    "player_preacher": (P["preacher"], P["preacherdk"], P["hatred"]),
    "npc": (P["npc"], P["npcdk"], P["timber2"]),
    "constable": (P["blue"], P["bluedk"], P["iwall"]),
}
(OUT / "sprites").mkdir(parents=True, exist_ok=True)
for name, (c, cdk, hat) in SHEETS.items():
    img = Image.new("RGBA", (CW * 4, CH), (0, 0, 0, 0))
    for f in range(4):
        px = draw_char(c, cdk, hat, f)
        for y in range(CH):
            for x in range(CW):
                if px[y][x]: img.putpixel((f * CW + x, y), (*px[y][x], 255))
    img.save(OUT / "sprites" / f"{name}.png")

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

print("art generated: 4 tilesheets, 5 character sheets, lantern, ridge")

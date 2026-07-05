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
    # a river-valley dusk: muted sage greens, wet earth, weathered brick
    "grass1": (74, 96, 62), "grass2": (60, 82, 52), "grass3": (50, 70, 46),
    "water1": (52, 74, 96), "water2": (78, 104, 124), "water3": (38, 56, 74),
    "tree1": (44, 66, 44), "tree2": (28, 46, 32),
    "dirt1": (150, 130, 100), "dirt2": (132, 112, 84), "dirt3": (110, 92, 68),
    "stone1": (140, 136, 126), "stone2": (104, 100, 92),
    "timber1": (132, 72, 54), "timber2": (94, 50, 38), "timber3": (150, 88, 66),
    "roof": (66, 36, 28),
    "plank1": (150, 116, 76), "plank2": (124, 94, 60),
    "door": (54, 34, 22), "doordk": (30, 18, 12),
    "ifloor1": (120, 96, 66), "ifloor2": (100, 80, 54),
    "iwall": (44, 30, 22),
    "ruin1": (120, 114, 102), "ruin2": (88, 84, 74),
    "skin": (206, 158, 120), "skindk": (162, 116, 84),
    "hatred": (150, 44, 38),
    "drover": (176, 152, 112), "droverdk": (138, 118, 84),
    "frock": (66, 78, 120), "frockdk": (44, 54, 88),
    "preacher": (40, 40, 48), "preacherdk": (26, 26, 34),
    "npc": (140, 116, 80), "npcdk": (108, 88, 58),
    "blue": (60, 88, 120), "bluedk": (40, 62, 90),
    "boots": (52, 34, 22),
    "outline": (12, 10, 12),
    "grasslt": (92, 114, 74),
    "flower1": (196, 176, 92), "flower2": (150, 92, 108),
    "trunk": (78, 54, 36), "canopy_hi": (86, 108, 70),
    "glass": (24, 30, 38), "frame": (168, 158, 138),
    "stone_found": (104, 100, 92),
    "black": (14, 12, 14),
    "skin2": (188, 150, 140), "skin3": (150, 118, 88),
    "hair1": (60, 44, 30), "hair2": (40, 34, 30), "hair3": (150, 150, 150),
    "cane": (90, 66, 42), "satchel": (86, 62, 40), "apron": (170, 158, 132),
    "book": (120, 40, 36), "pipe": (60, 48, 40),
    "iron": (72, 72, 80), "irondk": (48, 48, 56), "ember": (210, 96, 40), "emberhi": (240, 170, 70),
    "brass": (150, 122, 66), "brassdk": (110, 88, 46),
    "glassjar": (120, 150, 150), "jarlid": (90, 80, 60), "specimen": (140, 90, 100),
    "wood": (110, 82, 52), "wooddk": (80, 58, 36), "woodhi": (140, 110, 74),
    "cloth": (150, 60, 52), "clothdk": (110, 44, 38),
    "candle": (230, 220, 170), "flame": (250, 200, 90),
    "bone": (200, 192, 168), "bonedk": (150, 142, 120),
    "green_glass": (90, 130, 96), "quilt1": (140, 80, 70), "quilt2": (80, 100, 110),
    "paper": (196, 186, 158), "ink": (40, 36, 44),
    "hide": (120, 96, 64), "rope": (150, 130, 90),
    "root": (110, 84, 56), "moss": (86, 108, 70), "crystal": (150, 170, 180),
    # building materials: brick reds/browns, cut stone grays, timber woods
    "brickA1": (132, 72, 54), "brickA2": (94, 50, 38), "brickA3": (150, 88, 66),
    "brickB1": (150, 96, 70), "brickB2": (110, 68, 48), "brickB3": (168, 116, 86),
    "brickC1": (110, 84, 64), "brickC2": (80, 58, 42), "brickC3": (128, 100, 76),
    "stoneA1": (140, 136, 126), "stoneA2": (104, 100, 92), "stoneA3": (160, 156, 146),
    "stoneB1": (120, 124, 128), "stoneB2": (88, 92, 96), "stoneB3": (140, 144, 148),
    "woodA1": (120, 88, 56), "woodA2": (88, 62, 38), "woodA3": (144, 110, 74),
    "woodB1": (96, 74, 52), "woodB2": (70, 52, 34), "woodB3": (120, 96, 68),
    "roofA": (66, 36, 28), "roofB": (54, 58, 66), "roofC": (72, 60, 40),
    "mortar": (150, 142, 128), "founddk": (60, 56, 50), "hay": (168, 140, 74),
}

def lut_day(c):
    # even daylight in the Narrows is overcast and cool
    r, g, b = c
    return (int(r * 0.82 + 6), int(g * 0.86 + 8), int(b * 0.90 + 14))
def lut_dusk(c):
    if c == (24, 30, 38): return (190, 136, 72)
    r, g, b = c
    return (int(r * 0.66 + 20), int(g * 0.58 + 10), int(b * 0.72 + 30))
GLASS = (24, 30, 38)
def lut_night(c):
    if c == GLASS: return (232, 178, 92)
    r, g, b = c
    return (int(r * 0.42), int(g * 0.48), min(255, int(b * 0.72 + 22)))
def lut_fog(c):
    r, g, b = c
    gray = (r + g + b) // 3
    return (int(gray * 0.62 + r * 0.14 + 30), int(gray * 0.64 + g * 0.16 + 34), int(gray * 0.66 + b * 0.18 + 42))

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
    px = [[P["grass1"]] * T for _ in range(T)]
    for _ in range(6):
        px[rng.randrange(1, 15)][rng.randrange(1, 15)] = P["grass2"]
    for _ in range(2):
        px[rng.randrange(2, 14)][rng.randrange(2, 14)] = P["grasslt"]
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
    blades = [(3, 4), (6, 3), (9, 5), (12, 3)]   # inset, staggered, never at x=0 or x=15
    for bx, bh in blades:
        for i in range(bh):
            px[14 - i][bx] = P["grasslt"] if i >= bh - 2 else P["grass2"]
        px[14][bx - 1] = P["grass2"]
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
    px = [[P["dirt1"]] * T for _ in range(T)]
    for _ in range(10):
        px[rng.randrange(1, 15)][rng.randrange(1, 15)] = P["dirt2"]
    for _ in range(4):
        px[rng.randrange(2, 14)][rng.randrange(2, 14)] = P["dirt3"]
    return px

def roof_tile(roof, roofdk):
    px = [[roof] * T for _ in range(T)]
    # shingled roof: overlapping rows of tiles
    for y in range(T):
        for x in range(T):
            if y % 4 == 0: px[y][x] = roofdk
            elif (x + (y // 4)) % 5 == 0: px[y][x] = roofdk
            elif (x * 2 + y) % 7 == 0: px[y][x] = shade(roof, 1.15)
    return px

def roof_peak(roof, roofdk):
    # the top row: a ridge line with a bit of sky-facing highlight
    px = roof_tile(roof, roofdk)
    for x in range(T): px[0][x] = shade(roof, 1.3); px[1][x] = shade(roof, 1.2)
    return px

def facade(c1, c2, c3, kind):
    # a wall face WITHOUT the roof band (that lives in the roof tiles above)
    px = [[c1] * T for _ in range(T)]
    if kind == "brick":
        for y in range(T):
            for x in range(T):
                if y % 4 == 3: px[y][x] = P["mortar"]
                elif (x + (y // 4) * 4) % 8 == 0: px[y][x] = P["mortar"]
                elif (x + y) % 9 == 0: px[y][x] = c3
                elif (x * 3 + y) % 7 == 0: px[y][x] = c2
    elif kind == "stone":
        blocks = [(0,1,5),(5,1,5),(10,1,6),(2,5,5),(7,5,6),(0,9,4),(4,9,5),(9,9,5),(2,13,6),(8,13,6)]
        for bx, by, bw in blocks:
            for y in range(by, min(by+4, 16)):
                for x in range(bx, min(bx+bw, T)):
                    px[y][x] = c2 if (x == bx or y == by) else (c3 if (x+y) % 5 == 0 else c1)
    elif kind == "wood":
        for y in range(T):
            shd = c2 if y % 3 == 2 else (c3 if y % 3 == 0 else c1)
            for x in range(T): px[y][x] = shd
        for x in range(0, T, 5):
            for y in range(T): px[y][x] = c2
    for x in range(T): px[15][x] = P["founddk"] if x % 3 else P["black"]   # foundation
    return px

def wall_brick(c1, c2, c3, roof):
    px = [[c1] * T for _ in range(T)]
    for y in range(T):
        for x in range(T):
            # brick courses with mortar lines every 4px, offset each course
            if y % 4 == 3: px[y][x] = P["mortar"]
            elif (x + (y // 4) * 4) % 8 == 0: px[y][x] = P["mortar"]
            elif (x + y) % 9 == 0: px[y][x] = c3
            elif (x * 3 + y) % 7 == 0: px[y][x] = c2
    for x in range(T):
        px[0][x] = roof
        px[1][x] = roof if x % 4 else c2
        px[14][x] = P["founddk"] if x % 3 else P["stone2"]
        px[15][x] = P["black"]
    return px

def wall_stone(c1, c2, c3, roof):
    px = [[c1] * T for _ in range(T)]
    # irregular ashlar blocks with heavy mortar
    blocks = [(0,2,5),(5,2,5),(10,2,6),(2,6,5),(7,6,6),(0,10,4),(4,10,5),(9,10,5)]
    for bx, by, bw in blocks:
        for y in range(by, min(by+4, 14)):
            for x in range(bx, min(bx+bw, T)):
                px[y][x] = c2 if (x == bx or y == by) else (c3 if (x+y) % 5 == 0 else c1)
    for y in range(T):
        px[y][0] = P["mortar"] if y % 4 else c2
    for x in range(T):
        px[0][x] = roof
        px[1][x] = roof if x % 3 else c2
        px[14][x] = P["founddk"]
        px[15][x] = P["black"]
    return px

def wall_wood(c1, c2, c3, roof):
    px = [[c1] * T for _ in range(T)]
    # horizontal clapboard siding
    for y in range(2, 14):
        shade = c2 if y % 3 == 2 else (c3 if y % 3 == 0 else c1)
        for x in range(T): px[y][x] = shade
        px[13 if y == 13 else y][0] = c2
    for x in range(0, T, 5): 
        for y in range(2, 14): px[y][x] = c2   # plank seams
    for x in range(T):
        px[0][x] = roof
        px[1][x] = roof if x % 4 else c2
        px[14][x] = P["founddk"]
        px[15][x] = P["black"]
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

# ---- decor: transparent-background oddities, gids 17..32 ----
def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)


def D():
    return [[None] * T for _ in range(T)]

def dec_hearth():
    px = D()
    for y in range(4, 14):
        for x in range(2, 14):
            px[y][x] = P["timber2"] if (x in (2,13) or y in (4,13)) else None
    for y in range(9, 13):
        for x in range(4, 12):
            px[y][x] = P["ember"] if (x+y)%2 else P["emberhi"]
    for x in range(5, 11):
        if x % 2: px[8][x] = P["emberhi"]
    for y in range(5, 9): px[y][7] = P["irondk"]; px[y][8] = P["irondk"]   # crane
    return px

def dec_anvil():
    px = D()
    for x in range(3, 13): px[9][x] = P["iron"]
    for x in range(4, 12): px[10][x] = P["irondk"]
    px[8][11] = P["iron"]; px[8][12] = P["iron"]                          # horn
    for y in range(11, 14): px[y][6] = P["wooddk"]; px[y][9] = P["wooddk"]  # stump
    px[7][5] = P["emberhi"]                                                # a spark
    return px

def dec_jars():
    px = D()
    for jx in (2, 6, 10):
        for y in range(4, 12):
            px[y][jx] = P["glassjar"]; px[y][jx+3] = P["glassjar"]
        for x in range(jx, jx+4): px[3][x] = P["jarlid"]; px[11][x] = P["glassjar"]
        for y in range(6, 11):
            for x in range(jx+1, jx+3): px[y][x] = P["specimen"] if (x+y)%2 else P["green_glass"]
    return px

def dec_shelf():
    px = D()
    for x in range(1, 15): px[7][x] = P["wooddk"]; px[13][x] = P["wooddk"]
    for i, x in enumerate(range(2, 14, 2)):
        c = [P["book"], P["green_glass"], P["brass"], P["cloth"], P["bone"], P["paper"]][i % 6]
        for y in range(3, 7): px[y][x] = c; px[y][x+1] = shade(c, 0.7)
        for y in range(9, 13): px[y][x] = shade(c, 0.85)
    return px

def dec_pew():
    px = D()
    for x in range(2, 14): px[8][x] = P["wood"]; px[9][x] = P["wooddk"]
    for y in range(9, 13): px[y][2] = P["wooddk"]; px[y][13] = P["wooddk"]
    for x in range(2, 14): px[6][x] = P["wooddk"]                          # back
    return px

def dec_altar():
    px = D()
    for y in range(6, 13):
        for x in range(4, 12): px[y][x] = P["cloth"] if y < 8 else P["clothdk"]
    px[3][6] = P["flame"]; px[3][10] = P["flame"]                          # two candles
    for y in range(4, 7): px[y][6] = P["candle"]; px[y][10] = P["candle"]
    for x in range(5, 11): px[8][x] = P["brass"]                           # a cross bar
    px[6][7] = P["brass"]; px[7][7] = P["brass"]; px[6][8] = P["brass"]; px[7][8] = P["brass"]
    return px

def dec_barrels():
    px = D()
    for cx in (4, 10):
        for y in range(4, 13):
            for x in range(cx-2, cx+2): px[y][x] = P["wood"] if x in (cx-2,cx+1) else P["woodhi"]
        px[6][cx-2] = P["iron"]; px[6][cx+1] = P["iron"]                   # hoops
        px[10][cx-2] = P["iron"]; px[10][cx+1] = P["iron"]
    return px

def dec_loom():
    px = D()
    for y in range(2, 14): px[y][3] = P["wooddk"]; px[y][12] = P["wooddk"]
    for x in range(3, 13):
        if x % 2: px[3][x] = P["rope"]
    for y in range(5, 12):
        for x in range(4, 12): px[y][x] = P["quilt1"] if (x+y)%3 else P["quilt2"]
    return px

def dec_desk():
    px = D()
    for y in range(8, 13):
        for x in range(2, 13): px[y][x] = P["wood"] if y == 8 else P["wooddk"]
    for x in range(3, 8): px[7][x] = P["paper"]                            # papers
    px[6][10] = P["ink"]; px[7][10] = P["brass"]                           # inkwell and quill
    px[5][10] = P["bonedk"]
    return px

def dec_bed():
    px = D()
    for y in range(6, 13):
        for x in range(2, 9): px[y][x] = P["quilt1"] if (x+y)%2 else P["quilt2"]
    for x in range(2, 9): px[5][x] = P["wooddk"]
    for y in range(6, 9):
        for x in range(9, 12): px[y][x] = P["paper"]                       # pillow
    return px

def dec_ropes():
    px = D()
    for x in range(2, 14):
        yy = 4 + (x % 3)
        px[yy][x] = P["rope"]; px[yy+1][x] = P["hide"]
    for y in range(8, 14): px[y][4] = P["rope"]; px[y][11] = P["rope"]     # coils
    px[11][3] = P["rope"]; px[11][12] = P["rope"]
    return px

def dec_hides():
    px = D()
    for y in range(3, 13):
        for x in range(3, 13):
            d = abs(x-8) + abs(y-8)
            if d < 6: px[y][x] = P["hide"] if d % 2 else shade(P["hide"], 0.8)
    px[4][5] = P["bonedk"]; px[4][11] = P["bonedk"]                        # antlers up top
    px[3][5] = P["bone"]; px[3][11] = P["bone"]
    return px

def dec_wards():
    # a wall of hex signs and dangling roots: the widow's cottage
    px = D()
    for cx, cy in [(4,4),(11,4),(8,7)]:
        for a in range(-2,3):
            px[cy][cx+a] = P["brass"]; px[cy+a][cx] = P["brass"]
        px[cy][cx] = P["ember"]
    for x in range(2, 14, 3):
        for y in range(9, 13): px[y][x] = P["root"]
        px[12][x] = P["moss"]
    return px

def dec_crystals():
    # cave-mouth oddity: quartz and moss for the survey/excise oddments
    px = D()
    for cx, cy, h in [(4,11,5),(8,12,6),(11,10,4)]:
        for i in range(h):
            px[cy-i][cx] = P["crystal"] if i < h-1 else P["frame"]
            if i < h-2: px[cy-i][cx-1] = shade(P["crystal"], 0.7)
    for x in range(2, 14):
        if x % 2: px[13][x] = P["moss"]
    return px

def dec_stove():
    # excise office: a pot-belly stove and stacked stamps
    px = D()
    for y in range(4, 13):
        for x in range(5, 11): px[y][x] = P["iron"] if (x in (5,10) or y in (4,12)) else P["irondk"]
    for y in range(7, 10):
        for x in range(6, 10): px[y][x] = P["ember"] if (x+y)%2 else P["emberhi"]
    px[3][7] = P["irondk"]; px[2][7] = P["irondk"]                         # flue
    for x in range(2, 5): px[11][x] = P["paper"]; px[10][x] = P["paper"]   # stamp stacks
    return px

# ---- LARGE FURNITURE: multi-tile pieces that read as substantial objects ----
# Each returns a full 16x16; big pieces come in L/R (and optionally top/bottom) halves.

def big_bed_L():
    px = D()
    # headboard on the left, mattress extending right
    for y in range(3, 14): px[y][2] = P["wooddk"]; px[y][3] = P["wood"]   # headboard
    for y in range(5, 13):
        for x in range(4, 16): px[y][x] = P["quilt1"] if (x+y)%2 else P["quilt2"]
    for x in range(4, 16): px[5][x] = P["woodhi"]
    for y in range(6, 10):
        for x in range(4, 8): px[y][x] = P["paper"]   # pillow
    return px
def big_bed_R():
    px = D()
    for y in range(5, 13):
        for x in range(0, 13): px[y][x] = P["quilt1"] if (x+y)%2 else P["quilt2"]
    for x in range(0, 13): px[5][x] = P["woodhi"]
    for y in range(3, 14): px[y][13] = P["wood"]; px[y][14] = P["wooddk"]  # footboard
    return px

def big_desk_L():
    px = D()
    for y in range(7, 13):
        for x in range(2, 16): px[y][x] = P["wood"] if y == 7 else P["wooddk"]
    for x in range(3, 10): px[6][x] = P["paper"]        # papers on top
    px[5][6] = P["ink"]; px[6][8] = P["book"]
    for y in range(13, 15): px[y][3] = P["wooddk"]      # legs
    return px
def big_desk_R():
    px = D()
    for y in range(7, 13):
        for x in range(0, 14): px[y][x] = P["wood"] if y == 7 else P["wooddk"]
    px[6][3] = P["ink"]; px[5][3] = P["brass"]          # inkwell + quill
    for y in range(8, 13):
        px[y][2] = P["black"]; px[y][7] = P["black"]    # drawers
    for y in range(13, 15): px[y][11] = P["wooddk"]     # legs
    return px

def big_counter_L():
    px = D()
    # a shop counter: heavy wooden top, panelled front
    for x in range(2, 16): px[5][x] = P["woodhi"]; px[6][x] = P["wood"]
    for y in range(7, 15):
        for x in range(2, 16): px[y][x] = P["wooddk"] if (x % 4) else P["wood"]
    for x in range(3, 15, 4): 
        for y in range(8, 14): px[y][x] = P["woodA2"]   # panel seams
    return px
def big_counter_R():
    px = D()
    for x in range(0, 14): px[5][x] = P["woodhi"]; px[6][x] = P["wood"]
    for y in range(7, 15):
        for x in range(0, 14): px[y][x] = P["wooddk"] if (x % 4) else P["wood"]
    # scales on the counter
    px[3][8] = P["brass"]; px[4][7] = P["brass"]; px[4][9] = P["brass"]; px[4][8] = P["brassdk"]
    return px

def big_kitchen_L():
    px = D()
    # a cast range with a pot, and a work top
    for y in range(4, 14):
        for x in range(3, 13): px[y][x] = P["iron"] if (x in (3,12) or y in (4,13)) else P["irondk"]
    for y in range(7, 10):
        for x in range(5, 11): px[y][x] = P["ember"] if (x+y)%2 else P["emberhi"]
    px[3][6] = P["irondk"]; px[2][6] = P["irondk"]      # flue
    px[3][8] = P["stone1"]; px[3][9] = P["stone2"]      # a pot
    px[2][8] = P["stone1"]
    return px
def big_kitchen_R():
    px = D()
    # a dresser of crockery beside the range
    for y in range(2, 15): px[y][2] = P["wooddk"]; px[y][13] = P["wooddk"]
    for shelf in (4, 8, 12): 
        for x in range(2, 14): px[shelf][x] = P["wood"]
    for x in range(3, 13, 3):
        px[3][x] = P["stone1"]; px[7][x] = P["green_glass"]; px[11][x] = P["stone2"]
    return px

def big_armoire_L():
    px = D()
    # a tall wardrobe, left door
    for y in range(1, 15): px[y][2] = P["wooddk"]
    for y in range(2, 14):
        for x in range(3, 16): px[y][x] = P["woodA1"] if (x+y)%3 else P["woodA2"]
    for y in range(2, 14): px[y][14] = P["woodhi"]      # door edge
    px[8][13] = P["brass"]                               # handle
    for x in range(2, 16): px[1][x] = P["woodA3"]        # cornice
    return px
def big_armoire_R():
    px = D()
    for y in range(1, 15): px[y][13] = P["wooddk"]
    for y in range(2, 14):
        for x in range(0, 13): px[y][x] = P["woodA1"] if (x+y)%3 else P["woodA2"]
    for y in range(2, 14): px[y][1] = P["woodhi"]
    px[8][2] = P["brass"]
    for x in range(0, 14): px[1][x] = P["woodA3"]
    return px

def big_couch_L():
    px = D()
    # a settle / couch, upholstered
    for y in range(4, 8): px[y][2] = P["clothdk"]        # left arm
    for y in range(4, 13): px[y][3] = P["clothdk"]
    for y in range(5, 9):
        for x in range(4, 16): px[y][x] = P["cloth"]     # back cushion
    for y in range(9, 13):
        for x in range(3, 16): px[y][x] = P["clothdk"] if (x+y)%2 else P["cloth"]
    for x in range(3, 16): px[13][x] = P["wooddk"]       # base
    return px
def big_couch_R():
    px = D()
    for y in range(5, 9):
        for x in range(0, 12): px[y][x] = P["cloth"]
    for y in range(9, 13):
        for x in range(0, 13): px[y][x] = P["clothdk"] if (x+y)%2 else P["cloth"]
    for y in range(4, 13): px[y][12] = P["clothdk"]      # right arm
    for y in range(4, 8): px[y][13] = P["clothdk"]
    for x in range(0, 13): px[13][x] = P["wooddk"]
    return px

def big_table_L():
    px = D()
    # a dining table with a chair
    for x in range(4, 16): px[6][x] = P["woodhi"]; px[7][x] = P["wood"]
    for y in range(8, 13): px[y][5] = P["wooddk"]        # leg
    # a chair at the left
    for y in range(4, 9): px[y][2] = P["wooddk"]         # chair back
    for x in range(2, 5): px[8][x] = P["wood"]           # seat
    for y in range(9, 13): px[y][2] = P["wooddk"]; px[y][4] = P["wooddk"]
    return px
def big_table_R():
    px = D()
    for x in range(0, 12): px[6][x] = P["woodhi"]; px[7][x] = P["wood"]
    for y in range(8, 13): px[y][10] = P["wooddk"]
    px[5][4] = P["candle"]; px[4][4] = P["flame"]        # a candlestick
    px[6][7] = P["stone1"]                                # a plate
    return px

DECOR = [dec_hearth(), dec_anvil(), dec_jars(), dec_shelf(), dec_pew(), dec_altar(),
         dec_barrels(), dec_loom(), dec_desk(), dec_bed(), dec_ropes(), dec_hides(),
         dec_wards(), dec_crystals(), dec_stove(),
         # 32nd slot: a hanging lantern that flickers (animated)
         None]

def dec_lantern(frame=0):
    px = D()
    for y in range(2, 5): px[y][8] = P["irondk"]                          # chain
    for y in range(5, 10):
        for x in range(6, 11): px[y][x] = P["iron"] if (x in (6,10) or y in (5,9)) else None
    glow = P["flame"] if frame == 0 else P["emberhi"]
    for y in range(6, 9):
        for x in range(7, 10): px[y][x] = glow
    return px

DECOR[15] = dec_lantern(0)

# ---- outdoor world decor: gids 33..48 ----
def rect_fill(px, x0, y0, x1, y1, c):
    for y in range(y0, y1+1):
        for x in range(x0, x1+1):
            if 0 <= x < T and 0 <= y < T: px[y][x] = c

def dec_well():
    px = D()
    for y in range(6, 14):
        for x in range(4, 12): px[y][x] = P["stone2"] if (x in (4,11) or (x+y)%2) else P["stone1"]
    for x in range(3, 13): px[5][x] = P["wooddk"]                  # roof beam
    px[4][7] = P["wooddk"]; px[4][8] = P["wooddk"]
    px[9][7] = P["water2"]; px[9][8] = P["water2"]; px[10][7] = P["water3"]
    return px
def dec_cross():
    px = D()   # a market cross / stone monument
    for y in range(3, 14): px[y][7] = P["stone1"]; px[y][8] = P["stone2"]
    for x in range(4, 12): px[5][x] = P["stone1"]                  # arms
    rect_fill(px, 5, 12, 10, 13, P["stone2"]); return px
def dec_fence_h():
    px = D()
    for x in range(0, 16): px[8][x] = P["wooddk"]; px[10][x] = P["wooddk"]
    for x in range(1, 16, 4): 
        for y in range(6, 13): px[y][x] = P["wood"]
    return px
def dec_fence_v():
    px = D()
    for y in range(0, 16): px[y][7] = P["wooddk"]; px[y][9] = P["wooddk"]
    for y in range(1, 16, 4):
        for x in range(5, 12): px[y][x] = P["wood"]
    return px
def dec_garden():
    px = D()
    for y in range(3, 14, 3):
        for x in range(2, 14): px[y][x] = P["dirt3"]
        for x in range(2, 14, 2): px[y-1][x] = P["moss"]; px[y-1][x+1] = P["grasslt"]
    px[4][4] = P["flower1"]; px[7][9] = P["flower2"]; px[10][6] = P["flower1"]
    return px
def dec_grave():
    px = D()
    rect_fill(px, 6, 3, 9, 11, P["stone2"])
    px[3][6] = P["stone1"]; px[3][9] = P["stone1"]; px[2][7] = P["stone1"]; px[2][8] = P["stone1"]  # rounded top
    px[6][7] = P["stone1"]; px[7][7] = P["stone1"]                # a faint cross
    rect_fill(px, 4, 12, 11, 13, P["grass3"]); return px
def dec_signpost():
    px = D()
    for y in range(4, 14): px[y][8] = P["wooddk"]
    rect_fill(px, 3, 4, 12, 7, P["wood"])
    px[5][5] = P["ink"]; px[5][7] = P["ink"]; px[5][9] = P["ink"]  # lettering hint
    return px
def dec_cartwheel():
    px = D()
    cx, cy = 8, 9
    for a in range(0, 360, 45):
        import math
        for r in range(1, 5):
            x = cx + int(r*math.cos(math.radians(a))); y = cy + int(r*math.sin(math.radians(a)))
            px[y][x] = P["wooddk"]
    for a in range(0, 360, 20):
        import math
        x = cx + int(4*math.cos(math.radians(a))); y = cy + int(4*math.sin(math.radians(a)))
        px[y][x] = P["wood"]
    px[cy][cx] = P["iron"]; return px
def dec_barrel1():
    px = D()
    for y in range(4, 13):
        for x in range(5, 11): px[y][x] = P["wood"] if x in (5,10) else P["woodhi"]
    px[6][5] = P["iron"]; px[6][10] = P["iron"]; px[10][5] = P["iron"]; px[10][10] = P["iron"]
    return px
def dec_woodpile():
    px = D()
    for y in range(8, 13):
        for x in range(2, 14):
            px[y][x] = P["wood"] if (x+y)%2 else P["wooddk"]
    for x in range(2, 14, 2): px[7][x] = P["woodhi"]
    return px
def dec_crates():
    px = D()
    rect_fill(px, 3, 6, 8, 12, P["wood"]); rect_fill(px, 8, 8, 13, 13, P["wooddk"])
    for x in range(3, 9): px[6][x] = P["woodhi"]
    px[9][10] = P["woodhi"]; return px
def dec_bush():
    px = D()
    for y in range(5, 13):
        for x in range(3, 13):
            if (x-8)**2 + (y-9)**2 < 20: px[y][x] = P["tree1"] if (x+y)%2 else P["tree2"]
    px[6][6] = P["canopy_hi"]; px[7][10] = P["canopy_hi"]; return px
def dec_pump():
    px = D()
    for y in range(4, 13): px[y][7] = P["iron"]; px[y][8] = P["irondk"]
    rect_fill(px, 8, 4, 12, 6, P["iron"])                          # spout arm
    px[13][6] = P["water2"]; px[13][7] = P["water3"]; return px
def dec_lamppost():
    px = D()
    for y in range(3, 14): px[y][8] = P["irondk"]
    rect_fill(px, 6, 2, 10, 5, P["iron"]); px[3][8] = P["flame"]; px[4][8] = P["emberhi"]
    return px
def dec_troughs():
    px = D()
    rect_fill(px, 2, 8, 13, 12, P["wooddk"]); rect_fill(px, 3, 9, 12, 10, P["water2"])
    px[9][5] = P["water3"]; px[9][9] = P["water3"]; return px
def dec_stump():
    px = D()
    for y in range(6, 13):
        for x in range(5, 11): px[y][x] = P["wooddk"]
    for x in range(5, 11): px[6][x] = P["wood"]
    px[6][7] = P["woodhi"]; px[6][8] = P["woodhi"]                 # rings
    return px

def dec_rail_h():   # a length of B&O track, horizontal
    px = D()
    for x in range(0, 16): px[6][x] = P["iron"]; px[10][x] = P["iron"]
    for x in range(0, 16, 3):
        for y in range(6, 11): px[y][x] = P["wooddk"]   # ties
    for x in range(0, 16): px[6][x] = P["stone1"]; px[10][x] = P["stone1"]  # rail shine
    return px
def dec_canalboat():   # a C&O canal boat prow
    px = D()
    rect_fill(px, 1, 7, 14, 12, P["wood"])
    px[6][2] = P["wood"]; px[6][13] = P["wood"]
    rect_fill(px, 2, 8, 13, 11, P["wooddk"])
    rect_fill(px, 9, 4, 13, 7, P["cloth"])              # a cabin
    px[3][11] = P["wooddk"]                              # tiller
    for x in range(2, 8): px[13][x] = P["water3"]        # waterline
    return px
def dec_lock():   # a canal lock gate
    px = D()
    rect_fill(px, 2, 3, 4, 13, P["wooddk"])
    rect_fill(px, 11, 3, 13, 13, P["wooddk"])
    for y in range(4, 13, 2): px[y][2] = P["iron"]; px[y][13] = P["iron"]
    rect_fill(px, 5, 6, 10, 12, P["water1"])
    px[8][7] = P["water2"]; px[9][9] = P["water3"]; return px
def dec_coalpile():   # coal for the railroad, black and glinting
    px = D()
    for y in range(7, 13):
        for x in range(3, 13):
            if (x-8)**2 + (y-11)**2 < 26: px[y][x] = P["black"] if (x+y)%2 else P["irondk"]
    px[8][6] = P["stone1"]; px[9][10] = P["stone2"]      # glints
    return px

def tile_boulder():   # a mossy boulder, solid
    px = [[None]*T for _ in range(T)]
    for y in range(2, 15):
        for x in range(1, 15):
            d = (x-8)**2 + ((y-9)*1.2)**2
            if d < 42: px[y][x] = P["stone1"] if (x+y)%3 else P["stone2"]
            elif d < 55: px[y][x] = P["stone2"]
    # moss on top, shadow at base
    for x in range(4, 12):
        if (x*3)%5 < 2: px[4][x] = P["moss"]; px[5][x] = P["moss"]
    for x in range(2, 14): px[14][x] = P["black"]
    return px

def tile_pine():   # a tall dark pine, solid, denser than the clump tree
    px = [[None]*T for _ in range(T)]
    for y in range(0, 13):
        w = int((y) * 0.5) + 1
        for x in range(8-w, 8+w+1):
            if 0 <= x < T:
                px[y][x] = P["tree2"] if (x+y)%3 else P["tree1"]
        if y % 3 == 0:
            px[y][max(0,8-w)] = P["canopy_hi"]
    for y in range(13, 16): px[y][7] = P["trunk"]; px[y][8] = P["trunk"]
    return px

def tile_rockface():   # a craggy rock wall/cliff face, solid
    px = [[P["stone2"]]*T for _ in range(T)]
    for y in range(T):
        for x in range(T):
            n = (x*7 + y*13) % 11
            if n < 3: px[y][x] = P["stoneA2"]
            elif n < 6: px[y][x] = P["stone1"]
            elif n == 10: px[y][x] = P["founddk"]
    # vertical cracks
    for cx in (4, 9, 13):
        for y in range(2, 14): 
            if (y+cx)%3: px[y][cx] = P["black"]
    return px

def tile_stump_big():   # a huge cut stump / deadfall
    px = [[None]*T for _ in range(T)]
    for y in range(5, 15):
        for x in range(2, 14):
            if (x-8)**2+(y-10)**2 < 30: px[y][x] = P["woodA2"] if (x+y)%2 else P["woodA1"]
    for x in range(4, 12):
        if (x-8)**2 < 9: px[6][x] = P["woodA3"]   # rings
    px[7][8] = P["wooddk"]
    return px

def dec_mule():   # a canal mule, the engine of the towpath
    px = D()
    # body
    for y in range(6, 11):
        for x in range(4, 12): px[y][x] = P["woodA2"] if (x+y)%3 else P["hide"]
    # head and neck
    px[5][11] = P["hide"]; px[4][12] = P["hide"]; px[4][13] = P["hide"]; px[5][12] = P["woodA2"]
    px[3][13] = P["bonedk"]; px[3][12] = P["bonedk"]   # long ears
    # legs
    for lx in (5, 7, 9, 11): 
        px[11][lx] = P["woodA2"]; px[12][lx] = P["irondk"]
    px[7][4] = P["rope"]   # a trace line
    return px

def dec_milestone():   # a National Road cast-iron mile marker
    px = D()
    for y in range(4, 14): px[y][7] = P["iron"]; px[y][8] = P["irondk"]
    rect_fill(px, 5, 3, 10, 6, P["iron"])          # the head
    px[4][6] = P["stone1"]; px[4][9] = P["stone1"]  # cast lettering hint
    px[5][6] = P["black"]; px[5][9] = P["black"]
    rect_fill(px, 4, 13, 11, 13, P["grass3"])       # set in the verge
    return px

OUTDECOR = [dec_well(), dec_cross(), dec_fence_h(), dec_fence_v(), dec_garden(),
            dec_grave(), dec_signpost(), dec_cartwheel(), dec_barrel1(), dec_woodpile(),
            dec_crates(), dec_bush(), dec_pump(), dec_lamppost(), dec_troughs(), dec_stump(),
            dec_rail_h(), dec_canalboat(), dec_lock(), dec_coalpile(), dec_milestone(), dec_mule(),
            tile_boulder(), tile_pine(), tile_rockface(), tile_stump_big()]

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
# ---- building materials: 6 palettes, each with wall, window, and door ----
def add_window(base, frame=None):
    px = [row[:] for row in base]
    fr = frame or P["frame"]
    for y in range(4, 11):
        for x in range(4, 12):
            px[y][x] = fr if (x in (4, 11) or y in (4, 10) or x in (7, 8) or y == 7) else P["glass"]
    return px

def add_door(base):
    px = [row[:] for row in base]
    # a full-height doorway: dark recessed frame from near the top of the tile
    # down to the threshold, so it reads unmistakably as a ground-floor entrance
    for y in range(2, 15):
        for x in range(4, 12):
            if x in (4, 11) or y == 2:
                px[y][x] = P["doordk"]        # frame
            else:
                px[y][x] = P["door"]          # the door itself
    # plank seams down the door
    for y in range(3, 14):
        px[y][7] = P["doordk"]
    px[9][9] = P["brass"]                     # a handle
    for x in range(4, 12): px[15][x] = P["black"]   # threshold shadow
    return px

# each material: (name, kind, c1, c2, c3, roof, roofdk)
MATERIALS = [
    ("brickA", "brick", P["brickA1"], P["brickA2"], P["brickA3"], P["roofA"], shade(P["roofA"], 0.7)),
    ("brickB", "brick", P["brickB1"], P["brickB2"], P["brickB3"], P["roofC"], shade(P["roofC"], 0.7)),
    ("brickC", "brick", P["brickC1"], P["brickC2"], P["brickC3"], P["roofA"], shade(P["roofA"], 0.7)),
    ("stoneA", "stone", P["stoneA1"], P["stoneA2"], P["stoneA3"], P["roofB"], shade(P["roofB"], 0.7)),
    ("stoneB", "stone", P["stoneB1"], P["stoneB2"], P["stoneB3"], P["roofB"], shade(P["roofB"], 0.6)),
    ("woodA",  "wood",  P["woodA1"], P["woodA2"], P["woodA3"], P["roofC"], shade(P["roofC"], 0.7)),
    ("woodB",  "wood",  P["woodB1"], P["woodB2"], P["woodB3"], P["roofA"], shade(P["roofA"], 0.6)),
]
# 5 tiles per material: roof, roof-peak, facade, window-facade, door-facade
MATERIAL_TILES = []
MATERIAL_INDEX = {}
_mat_base = 1 + len(TILES) + len(DECOR) + len(OUTDECOR)
for i, (name, kind, c1, c2, c3, roof, roofdk) in enumerate(MATERIALS):
    base_gid = _mat_base + i * 5
    MATERIAL_INDEX[name] = base_gid
    face = facade(c1, c2, c3, kind)
    MATERIAL_TILES += [
        roof_tile(roof, roofdk),        # +0 roof body
        roof_peak(roof, roofdk),        # +1 roof ridge (top row)
        face,                            # +2 plain facade
        add_window(face),                # +3 window facade
        add_door(face),                  # +4 door facade
    ]

BIGFURN = [
    ("bed", big_bed_L(), big_bed_R()),
    ("desk", big_desk_L(), big_desk_R()),
    ("counter", big_counter_L(), big_counter_R()),
    ("kitchen", big_kitchen_L(), big_kitchen_R()),
    ("armoire", big_armoire_L(), big_armoire_R()),
    ("couch", big_couch_L(), big_couch_R()),
    ("table", big_table_L(), big_table_R()),
]
BIGFURN_TILES = []
BIGFURN_INDEX = {}
_bf_base = 1 + len(TILES) + len(DECOR) + len(OUTDECOR) + len(MATERIAL_TILES)
for i, (name, l, r) in enumerate(BIGFURN):
    BIGFURN_INDEX[name] = _bf_base + i * 2   # left gid; right is +1
    BIGFURN_TILES += [l, r]

# ---- BIG SCENERY: multi-tile world objects (a proper canal boat, a cave mouth) ----
def boat_bow():        # the pointed prow, TOP end, boat runs vertically down the river
    px = D()
    for x in range(4, 12):
        taper = abs(8 - x)
        y0 = 2 + taper
        for y in range(y0, 16):
            px[y][x] = P["wooddk"] if x in (4, 11) else P["wood"]
    for y in range(6, 16): px[y][5] = P["woodhi"]     # gunwale highlight
    px[3][8] = P["woodhi"]                             # prow point
    return px
def boat_mid():        # midship cargo hold
    px = D()
    for x in range(4, 12):
        for y in range(0, 16):
            px[y][x] = P["wooddk"] if x in (4, 11) else P["wood"]
    for y in range(0, 16): px[y][5] = P["woodhi"]
    for y in range(1, 15):
        for x in range(5, 11):
            if (x + y) % 2: px[y][x] = P["irondk"] if y < 8 else P["hay"]
    return px
def boat_cabin():      # after-cabin with roof and stovepipe
    px = D()
    for x in range(4, 12):
        for y in range(0, 16):
            px[y][x] = P["wooddk"] if x in (4, 11) else P["wood"]
    for y in range(0, 16): px[y][5] = P["woodhi"]
    rect_fill(px, 5, 3, 10, 12, P["clothdk"])          # cabin roof
    for y in range(3, 13): px[y][4] = P["cloth"]
    px[6][2] = P["iron"]; px[6][1] = P["iron"]         # stovepipe out the side
    px[9][10] = P["glass"]                             # a little window
    return px
def boat_stern():      # blunt stern, BOTTOM end, with tiller
    px = D()
    for x in range(4, 12):
        y1 = 14 - abs(8 - x)
        for y in range(0, y1):
            px[y][x] = P["wooddk"] if x in (4, 11) else P["wood"]
    for y in range(0, 12): px[y][5] = P["woodhi"]
    px[13][8] = P["wooddk"]; px[14][7] = P["wooddk"]   # tiller
    return px

def cave_mouth_L():    # left half of a dark cave entrance in the rock
    px = D()
    for y in range(0, 16):
        for x in range(0, 16):
            # rock face
            n = (x * 7 + y * 13) % 11
            px[y][x] = P["stoneB2"] if n < 4 else (P["stone1"] if n < 7 else P["stoneB1"])
    # the dark opening, right side of this tile (continues into R)
    for y in range(5, 16):
        for x in range(9, 16):
            if (x - 9) + abs(10 - y) < 8: px[y][x] = P["black"]
    return px
def cave_mouth_R():
    px = D()
    for y in range(0, 16):
        for x in range(0, 16):
            n = (x * 7 + y * 13) % 11
            px[y][x] = P["stoneB2"] if n < 4 else (P["stone1"] if n < 7 else P["stoneB1"])
    for y in range(5, 16):
        for x in range(0, 8):
            if (7 - x) + abs(10 - y) < 8: px[y][x] = P["black"]
    px[9][4] = P["ember"]; px[10][5] = P["emberhi"]   # a faint glow within
    return px

BIGSCENE = [
    ("boat_bow", boat_bow()), ("boat_mid", boat_mid()),
    ("boat_cabin", boat_cabin()), ("boat_stern", boat_stern()),
    ("cave_l", cave_mouth_L()), ("cave_r", cave_mouth_R()),
]
BIGSCENE_TILES = []
BIGSCENE_INDEX = {}
_bs_base = _bf_base + len(BIGFURN_TILES)
for i, (name, tile) in enumerate(BIGSCENE):
    BIGSCENE_INDEX[name] = _bs_base + i
    BIGSCENE_TILES.append(tile)

TILES = TILES + DECOR + OUTDECOR + MATERIAL_TILES + BIGFURN_TILES + BIGSCENE_TILES
import json as _json
(OUT / "tiles").mkdir(parents=True, exist_ok=True)
(OUT / "tiles" / "materials.json").write_text(_json.dumps(MATERIAL_INDEX))
(OUT / "tiles" / "bigfurn.json").write_text(_json.dumps(BIGFURN_INDEX))
(OUT / "tiles" / "bigscene.json").write_text(_json.dumps(BIGSCENE_INDEX))
TILES_F2 = list(TILES)
TILES_F2[1] = tile_water2()
TILES_F2[13] = tile_flowers(1)
TILES_F2[31] = dec_lantern(1)   # gid 32 lantern flicker

def write_tilesheet(period, lut):
    img = Image.new("RGBA", (T * len(TILES), T * 2), (0, 0, 0, 0))
    for row, tiles in enumerate([TILES, TILES_F2]):
        for i, tile in enumerate(tiles):
            for y in range(T):
                for x in range(T):
                    c = tile[y][x]
                    if c is None:
                        continue   # transparent: floor shows through for decor
                    img.putpixel((i * T + x, row * T + y), (*lut(c), 255))
    (OUT / "tiles").mkdir(parents=True, exist_ok=True)
    img.save(OUT / "tiles" / f"tileset_{period}.png")

for period, lut in PERIODS.items():
    write_tilesheet(period, lut)

# ---- characters: 16x24, 4 walk frames, per coat ----
CW, CH = 16, 24

def coat_light(c):
    return tuple(min(255, int(v * 1.25 + 12)) for v in c)

def draw_char(coat, coatdk, hat, frame, hat_shape="tricorn",
              build="avg", hair="hair1", prop=None, skin="skin"):
    px = [[None] * CW for _ in range(CH)]
    swing = [0, 1, 0, -1][frame]
    bob = 1 if frame % 2 == 1 else 0
    def put(y, x, c):
        if 0 <= y - bob < CH and 0 <= x < CW: px[y - bob][x] = c
    # build controls shoulder width, height, and posture
    if build == "broad":   L, R, top, foot, lean = 3, 12, 9, 24, 0
    elif build == "lean":  L, R, top, foot, lean = 5, 10, 9, 24, 0
    elif build == "tall":  L, R, top, foot, lean = 4, 11, 8, 24, 0
    elif build == "stoop": L, R, top, foot, lean = 4, 11, 10, 23, 1
    elif build == "short": L, R, top, foot, lean = 4, 11, 11, 23, 0
    else:                  L, R, top, foot, lean = 4, 11, 9, 24, 0
    hc = (L + R) // 2
    # head and face
    for y in range(top - 5, top):
        for x in range(hc - 2, hc + 3):
            put(y, x, P[skin])
    for x in range(hc - 2, hc + 3): put(top - 5, x, P["skindk"])
    put(top - 3, hc - 1, P["outline"]); put(top - 3, hc + 2, P["outline"])
    put(top - 1, hc, P["skindk"]); put(top - 1, hc + 1, P["skindk"])
    # hair peeking under the hat, at the nape and sides
    hcol = P[hair]
    put(top - 5, hc - 3, hcol); put(top - 4, hc - 3, hcol)
    put(top - 5, hc + 3, hcol); put(top - 4, hc + 3, hcol)
    if hair == "hair3":   # gray, longer
        put(top - 2, hc - 3, hcol); put(top - 2, hc + 3, hcol)
    # hats by shape, anchored to the head center
    if hat_shape == "tricorn":
        for x in range(hc - 4, hc + 5): put(top - 6, x, hat)
        for x in range(hc - 2, hc + 3): put(top - 7, x, hat)
        put(top - 6, hc - 4, P["outline"]); put(top - 6, hc + 4, P["outline"])
    elif hat_shape == "slouch":
        for x in range(hc - 4, hc + 5): put(top - 6, x, hat)
        put(top - 5, hc - 4, hat); put(top - 5, hc + 4, hat)
        for x in range(hc - 2, hc + 3): put(top - 7, x, hat)
    elif hat_shape == "flat":
        for x in range(hc - 3, hc + 4): put(top - 6, x, hat)
        for x in range(hc - 2, hc + 3): put(top - 7, x, hat)
    elif hat_shape == "cap":
        for x in range(hc - 2, hc + 3): put(top - 6, x, hat); put(top - 7, x, hat)
        put(top - 6, hc - 3, hat); put(top - 6, hc + 3, hat)
    elif hat_shape == "bonnet":
        for x in range(hc - 3, hc + 4): put(top - 6, x, hat); put(top - 7, x, hat)
        put(top - 5, hc - 3, hat); put(top - 4, hc - 3, hat)
        put(top - 5, hc + 3, hat); put(top - 4, hc + 3, hat)
    elif hat_shape == "tall":   # stovepipe, the parson or the magistrate
        for x in range(hc - 3, hc + 4): put(top - 6, x, hat)
        for x in range(hc - 2, hc + 3):
            put(top - 7, x, hat); put(top - 8, x, hat); put(top - 9, x, hat)
    elif hat_shape == "bare":
        for x in range(hc - 2, hc + 3): put(top - 5, x, hcol)
        put(top - 6, hc - 1, hcol); put(top - 6, hc + 1, hcol)
    # torso: shoulders at top, lean applies a horizontal shift up high
    for y in range(top, 19):
        sh = lean if y < top + 3 else 0
        for x in range(L, R):
            xx = x + sh
            put(y, xx, coat_light(coat) if x <= L + 2 else (coat if x <= R - 2 else coatdk))
    for y in range(top + 1, 17, 2): put(y, hc, P["outline"])
    for y in range(19, foot - 4):
        for x in range(L, R): put(y, x, coatdk)
    put(top, hc, P[skin]); put(top, hc + 1, P[skin])   # collar gap
    # arms
    for y in range(top + 1, top + 7):
        put(y, (L - 1) if swing >= 0 else (L - 2), coatdk)
        put(y, (R) if swing <= 0 else (R + 1), coat)
    # a prop in the off hand or on the body
    if prop == "cane":
        for y in range(top + 2, foot): put(y, R + 2, P["cane"])
        put(foot - 1, R + 3, P["cane"])
    elif prop == "satchel":
        for y in range(top + 4, top + 9):
            for x in range(L - 2, L + 1): put(y, x, P["satchel"])
        put(top + 3, L - 1, P["satchel"]); put(top + 2, L, P["satchel"])
    elif prop == "apron":
        for y in range(top + 4, 19):
            for x in range(L + 1, R - 1): put(y, x, P["apron"])
    elif prop == "book":
        for y in range(top + 5, top + 9):
            for x in range(R, R + 3): put(y, x, P["book"])
    elif prop == "pipe":
        put(top - 2, hc + 3, P["pipe"]); put(top - 2, hc + 4, P["pipe"])
        put(top - 3, hc + 4, P["skin3"])
    elif prop == "staff":
        for y in range(top - 2, foot): put(y, R + 2, P["cane"])
        put(top - 3, R + 2, P["hair3"]); put(top - 3, R + 1, P["hair3"]); put(top - 3, R + 3, P["hair3"])
    # legs
    la, lb = (foot - 4, foot - 2) if frame % 2 == 0 else (foot - 3, foot - 3)
    for y in range(foot - 5, foot):
        if y <= la + 2: put(y, hc - 2, P["boots"]); put(y, hc - 3, P["boots"] if y > foot - 3 else None)
        if y <= lb + 2: put(y, hc + 1, P["boots"]); put(y, hc + 2, P["boots"] if y > foot - 3 else None)
    if frame == 1: put(foot - 1, hc - 4, P["boots"])
    if frame == 3: put(foot - 1, hc + 3, P["boots"])
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

# coat, coatdk, hat, hat_shape, build, hair, prop, skin
NPC_COLORS = {
    # Doyle the innkeeper: broad, red-faced, aproned, pipe
    "doyle":   ((150, 62, 50), (112, 44, 36), (70, 40, 28), "slouch", "broad", "hair1", "apron", "skin"),
    # Cresap the magistrate: tall, severe, stovepipe, cane
    "cresap":  ((58, 54, 78), (40, 38, 56), (28, 26, 40), "tall", "tall", "hair2", "cane", "skin"),
    # Ward the surgeon: lean, aproned, satchel
    "ward":    ((74, 92, 84), (52, 68, 62), (30, 44, 40), "flat", "lean", "hair1", "satchel", "skin"),
    # Feig the smith: broad, capped, no coat frills
    "feig":    ((128, 92, 58), (98, 68, 42), (64, 44, 26), "cap", "broad", "hair2", None, "skin3"),
    # Gantt the surveyor: avg, tricorn, carries his instrument staff
    "gantt":   ((120, 112, 84), (92, 86, 62), (60, 52, 34), "tricorn", "avg", "hair1", "staff", "skin"),
    # Rood the schoolmaster: stooped, flat hat, book
    "rood":    ((70, 84, 108), (48, 60, 80), (34, 44, 62), "flat", "stoop", "hair3", "book", "skin"),
    # McTeague the quarryman: broad, slouch, weathered
    "mcteague":((110, 92, 62), (84, 68, 44), (54, 40, 24), "cap", "broad", "hair2", "pipe", "skin3"),
    # Coombs the gravedigger: stooped, slouch, spade-worn
    "coombs":  ((92, 86, 74), (68, 64, 54), (44, 40, 32), "slouch", "stoop", "hair2", "cane", "skin3"),
    # Fenwick the ferry-fence: lean, tricorn, satchel of goods
    "fenwick": ((104, 72, 104), (78, 52, 78), (52, 32, 52), "tricorn", "avg", "hair2", "pipe", "skin"),
    # Shanks the ferryman: broad, cap, staff (his pole)
    "shanks":  ((60, 100, 104), (42, 74, 78), (28, 52, 56), "cap", "broad", "hair2", "staff", "skin3"),
    # Bright the wagoner: tall, slouch, whip-thin
    "bright":  ((132, 104, 60), (100, 78, 44), (60, 44, 24), "slouch", "tall", "hair1", None, "skin"),
    # Beall the constable: avg, tricorn, cane of office
    "beall":   ((60, 88, 120), (40, 62, 90), (26, 24, 44), "tricorn", "avg", "hair1", "cane", "skin"),
    # Brahm the widow: short, bonnet, gray, staff (a besom)
    "brahm":   ((92, 74, 104), (68, 54, 80), (150, 142, 128), "bonnet", "short", "hair3", "staff", "skin2"),
    # Pyle the lockkeeper: broad, weathered, cap, carries his lock pole
    "pyle":    ((78, 96, 100), (54, 70, 74), (44, 40, 32), "cap", "broad", "hair3", "staff", "skin3"),
}

SHEETS = {
    # the player, by trade: each a distinct build so you read as yourself
    "player_drover":   (P["drover"], P["droverdk"], (70, 52, 34), "slouch", "avg", "hair1", None, "skin"),
    "player_frock":    (P["frock"], P["frockdk"], (34, 40, 60), "tricorn", "lean", "hair1", None, "skin"),
    "player_preacher": (P["preacher"], P["preacherdk"], (30, 30, 38), "tall", "tall", "hair1", "book", "skin"),
    "npc": (P["npc"], P["npcdk"], (54, 40, 28), "slouch", "avg", "hair1", None, "skin"),
    "constable": (P["blue"], P["bluedk"], (26, 24, 44), "tricorn", "avg", "hair1", "cane", "skin"),
}
for nid, tup in NPC_COLORS.items():
    SHEETS["npc_" + nid] = tup
(OUT / "sprites").mkdir(parents=True, exist_ok=True)
for name, (c, cdk, hat, shape, build, hair, prop, skin) in SHEETS.items():
    img = Image.new("RGBA", (CW * 4, CH), (0, 0, 0, 0))
    for f in range(4):
        px = draw_char(c, cdk, hat, f, shape, build, hair, prop, skin)
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

# ---- interactable icons: 16x16, transparent, each looks like the thing ----
(OUT / "icons").mkdir(parents=True, exist_ok=True)
def IC(): return Image.new("RGBA", (16, 16), (0, 0, 0, 0))
def px(img, x, y, c): 
    if 0 <= x < 16 and 0 <= y < 16: img.putpixel((x, y), (*c, 255))
def rect(img, x0, y0, x1, y1, c):
    for y in range(y0, y1+1):
        for x in range(x0, x1+1): px(img, x, y, c)

def icon_clue():   # a folded paper with a wax seal
    i = IC(); rect(i, 4, 3, 12, 13, P["paper"]); rect(i, 4, 3, 12, 3, P["bonedk"])
    for y in range(5, 12, 2): rect(i, 5, y, 11, y, P["ink"])
    px(i, 8, 10, P["hatred"]); px(i, 8, 11, P["hatred"]); return i
def icon_steal():  # a coin purse
    i = IC(); rect(i, 4, 6, 12, 13, P["satchel"]); rect(i, 5, 4, 11, 6, P["wooddk"])
    px(i, 8, 3, P["rope"]); px(i, 7, 9, P["brass"]); px(i, 9, 9, P["brass"]); return i
def icon_station(): # hammer and tongs crossed on a block
    i = IC()
    for k in range(-4, 5):
        px(i, 8+k, 8+k, P["iron"]); px(i, 8+k+1, 8+k, P["irondk"])
        px(i, 8+k, 8-k, P["wooddk"]); px(i, 8+k+1, 8-k, P["wood"])
    rect(i, 3, 11, 13, 13, P["stone2"])   # the block
    px(i, 4, 4, P["emberhi"]); px(i, 12, 4, P["emberhi"]); return i
def icon_vendor(): # scales
    i = IC(); rect(i, 7, 3, 8, 11, P["brass"]); rect(i, 3, 5, 13, 5, P["brassdk"])
    rect(i, 2, 6, 5, 7, P["brass"]); rect(i, 10, 6, 13, 7, P["brass"]); rect(i, 5, 12, 10, 13, P["wooddk"]); return i
def icon_board():  # a notice board with a bill
    i = IC(); rect(i, 3, 3, 13, 12, P["wooddk"]); rect(i, 5, 5, 11, 10, P["paper"])
    for y in range(6, 10): px(i, 6, y, P["ink"]); px(i, 8, y, P["ink"]); return i
def icon_stash():  # a chest
    i = IC(); rect(i, 3, 6, 13, 13, P["wood"]); rect(i, 3, 6, 13, 8, P["woodhi"])
    rect(i, 3, 6, 13, 6, P["irondk"]); px(i, 8, 9, P["brass"]); px(i, 8, 10, P["brass"]); return i
def icon_bench():  # a judge's gavel
    i = IC(); rect(i, 4, 4, 9, 7, P["wood"]); 
    for k in range(5): px(i, 9+k, 8+k, P["wooddk"]); rect(i, 4, 12, 12, 13, P["wooddk"]); return i
def icon_body():   # a grave with a cross
    i = IC(); rect(i, 3, 8, 13, 13, P["grass3"]); rect(i, 7, 3, 8, 9, P["stone1"]); rect(i, 5, 5, 10, 6, P["stone1"]); return i
def icon_ferry():  # a boat
    i = IC(); rect(i, 2, 9, 13, 11, P["wood"]); px(i, 2, 8, P["wood"]); px(i, 13, 8, P["wood"])
    rect(i, 7, 3, 8, 9, P["wooddk"]); rect(i, 8, 4, 11, 7, P["cloth"]); return i
def icon_bench2(): # brass benchmark disk
    i = IC(); rect(i, 4, 4, 11, 11, P["brass"]); rect(i, 6, 6, 9, 9, P["brassdk"])
    for k in range(-3, 4): px(i, 8, 8+0, P["brassdk"]); return i
def icon_book():   # a ledger
    i = IC(); rect(i, 4, 3, 12, 13, P["book"]); rect(i, 4, 3, 5, 13, P["ink"])
    for y in range(5, 12, 2): px(i, 8, y, P["paper"]); return i
def icon_star():   # a keyhole with a glow, for sealed things
    i = IC(); rect(i, 5, 3, 10, 12, P["irondk"]); rect(i, 6, 4, 9, 11, P["iron"])
    rect(i, 7, 6, 8, 7, P["black"]); rect(i, 7, 7, 8, 10, P["black"])
    px(i, 4, 2, P["emberhi"]); px(i, 11, 2, P["emberhi"]); px(i, 8, 1, P["flame"]); return i
def icon_person(): # a waiting figure for widow/creditor/manhunter
    i = IC(); rect(i, 6, 3, 9, 6, P["skin"]); rect(i, 5, 7, 10, 13, P["frockdk"]); return i

ICONS = {
    "clue": icon_clue(), "steal": icon_steal(), "station": icon_station(),
    "vendor": icon_vendor(), "board": icon_board(), "stash": icon_stash(),
    "accuse": icon_bench(), "restore": icon_station(), "ferry": icon_ferry(),
    "benchmark": icon_bench2(), "cresapledger": icon_book(), "chambers": icon_star(),
    "plate": icon_star(), "widow": icon_person(), "creditor": icon_person(),
    "manhunter": icon_person(), "letterquest": icon_clue(), "signfarm": icon_star(),
    "cabinkept": icon_star(), "noquestions": icon_ferry(), "chamber": icon_star(),
    "laylow": icon_stash(), "coat": icon_person(), "job": icon_board(),
}
for name, img in ICONS.items():
    img.save(OUT / "icons" / (name + ".png"))
print(f"{len(ICONS)} interactable icons generated")

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

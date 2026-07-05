#!/usr/bin/env python3
"""The title postcard: the stone bridge in the Narrows of Wills Creek,
hand-tinted linen-postcard style, generated. 960x640."""
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

W, H = 960, 640
BORDER = 34
rng = random.Random(1800)
img = Image.new("RGB", (W, H), (214, 202, 176))   # aged, tea-stained card stock
d = ImageDraw.Draw(img)

SX0, SY0, SX1, SY1 = BORDER, BORDER + 26, W - BORDER, H - BORDER - 30
SW, SH = SX1 - SX0, SY1 - SY0

# sky: peach horizon rising into powder blue
for y in range(SY0, SY0 + int(SH * 0.62)):
    t = (y - SY0) / (SH * 0.62)
    r = int(120 + (196 - 120) * t)
    g = int(140 + (170 - 140) * t)
    b = int(150 + (150 - 150) * t)
    d.line([(SX0, y), (SX1, y)], fill=(r, g, b))

# clouds: soft tinted masses
cloud = Image.new("L", (W, H), 0)
cd = ImageDraw.Draw(cloud)
for cx, cy, cw, ch in [(240, 120, 180, 40), (300, 100, 120, 30), (620, 90, 220, 44),
                        (700, 130, 150, 30), (460, 150, 130, 26), (150, 170, 110, 24)]:
    for i in range(5):
        ox, oy = rng.randint(-30, 30), rng.randint(-8, 8)
        cd.ellipse([cx - cw//2 + ox, cy - ch//2 + oy, cx + cw//2 + ox, cy + ch//2 + oy], fill=110)
cloud = cloud.filter(ImageFilter.GaussianBlur(9))
img.paste(Image.new("RGB", (W, H), (246, 244, 236)), (0, 0), cloud)

# the far wall of the Narrows: hazy blue-lavender, right side
far = [(int(SX0 + SW * 0.44), SY0 + int(SH * 0.62))]
x = SX0 + SW * 0.44
yy = SY0 + SH * 0.30
while x < SX1:
    x += rng.randint(24, 44)
    yy += rng.randint(-26, 20)
    yy = max(SY0 + SH * 0.10, min(SY0 + SH * 0.44, yy))
    far.append((int(min(x, SX1)), int(yy)))
far += [(SX1, SY0 + int(SH * 0.62))]
d.polygon(far, fill=(148, 158, 186))
d.polygon([(p[0], p[1] + 14) if 0 < i < len(far) - 1 else p for i, p in enumerate(far)],
          fill=(134, 146, 176))

# the near wall: wooded, autumn-flecked, left side
near = [(SX0, SY0 + int(SH * 0.62))]
x, yy = SX0, SY0 + SH * 0.12
while x < SX0 + SW * 0.46:
    x += rng.randint(18, 34)
    yy += rng.randint(-16, 22)
    yy = max(SY0 + SH * 0.02, min(SY0 + SH * 0.40, yy))
    near.append((int(x), int(yy)))
near += [(int(SX0 + SW * 0.46), SY0 + int(SH * 0.62))]
d.polygon(near, fill=(58, 84, 52))
for _ in range(1400):
    px = rng.randint(SX0, int(SX0 + SW * 0.46))
    py = rng.randint(SY0, SY0 + int(SH * 0.62)) 
    inside = d._image.getpixel((px, py)) == (58, 84, 52) if 0 <= px < W and 0 <= py < H else False
    if inside:
        c = rng.choice([(74, 104, 62), (88, 116, 66), (46, 66, 42), (152, 96, 44),
                        (170, 74, 40), (120, 110, 52), (160, 120, 50)])
        d.ellipse([px - 3, py - 2, px + 3, py + 2], fill=c)

# water: teal, laid in before the bridge
WATER_Y = SY0 + int(SH * 0.62)
for y in range(WATER_Y, SY1):
    t = (y - WATER_Y) / max(1, (SY1 - WATER_Y))
    d.line([(SX0, y), (SX1, y)], fill=(int(70 + 22 * t), int(96 + 16 * t), int(112 + 12 * t)))
for _ in range(240):
    wx = rng.randint(SX0, SX1 - 60)
    wy = rng.randint(WATER_Y + 6, SY1 - 6)
    lw = rng.randint(24, 90)
    d.line([(wx, wy), (wx + lw, wy)], fill=(196, 218, 220) if rng.random() < 0.6 else (76, 118, 128))

# the stone bridge: deck, parapet, three arches
DECK_Y = WATER_Y - int(SH * 0.10)
STONE, STONE_D, STONE_L = (168, 158, 142), (128, 120, 106), (196, 188, 172)
d.rectangle([SX0 + 20, DECK_Y, SX1 - 20, WATER_Y + 26], fill=STONE)
d.rectangle([SX0 + 20, DECK_Y - 12, SX1 - 20, DECK_Y], fill=STONE_L)     # parapet
d.line([(SX0 + 20, DECK_Y - 12), (SX1 - 20, DECK_Y - 12)], fill=STONE_D, width=2)
d.line([(SX0 + 20, DECK_Y), (SX1 - 20, DECK_Y)], fill=STONE_D, width=2)
for ax, aw in [(int(W * 0.30), 130), (int(W * 0.52), 170), (int(W * 0.74), 130)]:
    top = DECK_Y + 10
    d.pieslice([ax - aw//2, top, ax + aw//2, top + 150], 180, 360, fill=(52, 74, 84))
    d.arc([ax - aw//2 - 6, top - 6, ax + aw//2 + 6, top + 156], 180, 360, fill=STONE_D, width=7)
    d.ellipse([ax - aw//2 + 14, WATER_Y + 34, ax + aw//2 - 14, WATER_Y + 70], fill=(60, 88, 96))
for _ in range(700):                                                      # stonework
    px = rng.randint(SX0 + 20, SX1 - 20)
    py = rng.randint(DECK_Y - 12, WATER_Y + 24)
    if img.getpixel((px, py)) in (STONE, STONE_L):
        d.point((px, py), fill=rng.choice([STONE_D, STONE_L, (150, 140, 124)]))
# piers into the water
for px_ in [int(W * 0.30) - 80, int(W * 0.52) - 100, int(W * 0.52) + 100, int(W * 0.74) + 80]:
    d.rectangle([px_ - 14, WATER_Y + 20, px_ + 14, WATER_Y + 58], fill=STONE_D)

# the horse and carriage, small and dark on the deck
hx, hy = int(W * 0.44), DECK_Y - 13
d.ellipse([hx, hy - 8, hx + 22, hy + 2], fill=(38, 32, 28))               # horse body
d.polygon([(hx + 20, hy - 8), (hx + 30, hy - 14), (hx + 30, hy - 4)], fill=(38, 32, 28))
for lx in (hx + 3, hx + 16):
    d.line([(lx, hy), (lx, hy + 11)], fill=(38, 32, 28), width=2)
d.ellipse([hx + 36, hy - 16, hx + 62, hy + 4], fill=(38, 32, 28))         # covered gig
d.ellipse([hx + 40, hy - 2, hx + 54, hy + 12], outline=(38, 32, 28), width=3)
d.line([(hx + 24, hy - 4), (hx + 40, hy - 4)], fill=(38, 32, 28), width=2)

# foreground bank, lower right, with autumn shrubs
d.polygon([(int(W * 0.62), SY1), (SX1, SY1), (SX1, WATER_Y + 40),
           (int(W * 0.80), WATER_Y + 52), (int(W * 0.68), SY1 - 24)], fill=(120, 104, 78))
for _ in range(160):
    px = rng.randint(int(W * 0.66), SX1 - 4)
    py = rng.randint(WATER_Y + 46, SY1 - 4)
    d.ellipse([px - 4, py - 3, px + 4, py + 3],
              fill=rng.choice([(150, 84, 42), (96, 110, 54), (168, 118, 52), (76, 90, 48)]))

# linen texture over the scene
for y in range(SY0, SY1, 3):
    d.line([(SX0, y), (SX1, y)], fill=(255, 255, 255, 0))
linen = Image.new("L", (W, H), 0)
ld = ImageDraw.Draw(linen)
for y in range(0, H, 3): ld.line([(0, y), (W, y)], fill=10)
for x in range(0, W, 3): ld.line([(x, 0), (x, H)], fill=8)
img.paste(Image.new("RGB", (W, H), (255, 253, 246)), (0, 0), linen)

# lettering, postcard red
RED = (168, 44, 34)
serif_b = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 30)
serif_s = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 17)
serif_t = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 15)
title = "C A I U C T U C U C"
tw = d.textlength(title, font=serif_b)
d.text(((W - tw) / 2 + 1, 21), title, font=serif_b, fill=(120, 100, 80))
d.text(((W - tw) / 2, 20), title, font=serif_b, fill=RED)
cap = "A SUPERNATURAL MYSTERY WHERE THE TOWPATH MEETS THE RAILS"
cw = d.textlength(cap, font=serif_t)
d.text(((W - cw) / 2, SY0 + 8), cap, font=serif_t, fill=(88, 70, 56))
foot = 'IN "THE NARROWS", CUMBERLAND, MD.  WHERE CANAL MEETS RAIL'
d.text((SX0 + 4, SY1 + 7), foot, font=serif_s, fill=RED)
press = "PRESS ANY KEY"
pw = d.textlength(press, font=serif_s)
d.text((W - BORDER - pw - 4, SY1 + 7), press, font=serif_s, fill=(110, 96, 74))

# card edge
d.rectangle([SX0 - 1, SY0 - 1, SX1, SY1], outline=(150, 134, 106), width=1)

Path(__file__).resolve().parent.parent.joinpath("assets", "splash.png").parent.mkdir(exist_ok=True)
img.save(Path(__file__).resolve().parent.parent / "assets" / "splash.png")
print("splash postcard generated 960x640")

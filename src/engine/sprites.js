// Sprite and tilesheet loading plus the walk-cycle math. Pure frame logic
// lives in frameFor so the harness can test animation without a canvas.
export function frameFor(distance, stride = 10) {
  return Math.floor(distance / stride) % 4;
}

export function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);   // art is optional; fallback rectangles remain
    img.src = url;
  });
}

export async function loadArt() {
  const periods = ['day', 'dusk', 'night', 'fog'];
  const tiles = {};
  for (const p of periods) tiles[p] = await loadImage('assets/tiles/tileset_' + p + '.png');
  const sprites = {};
  for (const n of ['player_drover', 'player_frock', 'player_preacher', 'npc', 'constable', 'lantern', 'ridge'])
    sprites[n] = await loadImage('assets/sprites/' + n + '.png');
  return { tiles, sprites, ready: Boolean(tiles.day) };
}

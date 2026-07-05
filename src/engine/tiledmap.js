// Loader for Tiled JSON map exports (orthogonal, finite, CSV-encoded).
// Pure functions: runs identically in the browser and in Node tests.
import { staticInteriorNpcObjects } from '../game/interior_life.js';
import { generatedMapJson } from '../game/generated_maps.js';
import { decorateStoryWorld } from '../game/story_world.js';

// Tiled stores flip state in the top three bits of each gid.
const FLIP_MASK = 0x1fffffff;

function normalizeProps(list) {
  const props = {};
  for (const p of list || []) props[p.name] = p.value;
  return props;
}

export function parseMap(json) {
  if (json.orientation !== 'orthogonal') throw new Error('only orthogonal maps are supported');
  if (json.infinite) throw new Error('infinite maps are not supported');

  const map = {
    width: json.width,
    height: json.height,
    tileWidth: json.tilewidth,
    tileHeight: json.tileheight,
    layers: {},
    objects: {}
  };

  const seen = new Set();
  for (const layer of json.layers) {
    if (seen.has(layer.name)) throw new Error('duplicate layer name: ' + layer.name);
    seen.add(layer.name);
    if (layer.type === 'tilelayer') {
      if (typeof layer.data === 'string') throw new Error('layer "' + layer.name + '" must use CSV encoding');
      map.layers[layer.name] = layer.data.map(g => g & FLIP_MASK);
    } else if (layer.type === 'objectgroup') {
      map.objects[layer.name] = layer.objects.map(o => ({
        id: o.id || 0,
        name: o.name,
        type: o.type || o.class || '',
        x: o.x, y: o.y,
        width: o.width || 0, height: o.height || 0,
        props: normalizeProps(o.properties)
      }));
    }
  }

  map.gidAt = (layerName, tx, ty) => {
    const data = map.layers[layerName];
    if (!data || tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return 0;
    return data[ty * map.width + tx];
  };

  map.hasLayer = (layerName) => Boolean(map.layers[layerName]);

  // Convention: any nonzero gid on the "collision" layer is solid.
  // Out-of-bounds is solid, so maps do not need a wall of trees to be safe.
  map.solidAt = (tx, ty) => {
    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return true;
    return map.gidAt('collision', tx, ty) !== 0;
  };

  map.findObject = (layerName, name) =>
    (map.objects[layerName] || []).find(o => o.name === name) || null;

  return map;
}

function mapIdFromUrl(url) {
  const file = String(url).split('/').pop() || '';
  return file.replace(/\.json(?:\?.*)?$/, '');
}

function objectTile(map, o) {
  return {
    tx: Math.floor((o.x + Math.min(8, Math.max(0, o.width / 2 || 8))) / map.tileWidth),
    ty: Math.floor((o.y + Math.min(8, Math.max(0, o.height / 2 || 8))) / map.tileHeight)
  };
}

function clearObjectTile(map, tx, ty) {
  return tx >= 0 && ty >= 0 && tx < map.width && ty < map.height && !map.solidAt(tx, ty);
}

function nearestClearObjectPosition(map, o) {
  const start = objectTile(map, o);
  if (clearObjectTile(map, start.tx, start.ty)) return o;
  for (let r = 1; r <= 5; r++) {
    const candidates = [];
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) === r) candidates.push({ tx: start.tx + dx, ty: start.ty + dy });
    }
    candidates.sort((a, b) => Math.abs(a.tx - start.tx) + Math.abs(a.ty - start.ty) - (Math.abs(b.tx - start.tx) + Math.abs(b.ty - start.ty)));
    const found = candidates.find(c => clearObjectTile(map, c.tx, c.ty));
    if (found) {
      return { ...o, x: found.tx * map.tileWidth, y: found.ty * map.tileHeight,
        props: { ...o.props, placedFromX: o.x, placedFromY: o.y } };
    }
  }
  return o;
}

function normalizeInteractablePlacement(map) {
  // Hand-authored and generated story objects occasionally land on building or
  // roof collision tiles. They are still useful interactables, but their icons
  // must not render on top of buildings. Move those prompts to the nearest
  // reachable ground tile so the visual layer stays coherent.
  if (!map.objects.interact) return map;
  map.objects.interact = map.objects.interact.map(o => nearestClearObjectPosition(map, o));
  return map;
}

function finishMap(mapId, map) {
  const extraNpcs = staticInteriorNpcObjects(mapId, map);
  if (extraNpcs.length) map.objects.spawns = [...(map.objects.spawns || []), ...extraNpcs];
  return normalizeInteractablePlacement(decorateStoryWorld(mapId, map));
}

export async function loadMap(url) {
  const mapId = mapIdFromUrl(url);
  const generated = generatedMapJson(mapId);
  if (generated) return finishMap(mapId, parseMap(generated));

  const res = await fetch(url);
  if (!res.ok) throw new Error('map fetch failed: ' + res.status + ' ' + url);
  return finishMap(mapId, parseMap(await res.json()));
}

// Loader for Tiled JSON map exports (orthogonal, finite, CSV-encoded).
// Pure functions: runs identically in the browser and in Node tests.

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

  for (const layer of json.layers) {
    if (layer.type === 'tilelayer') {
      if (typeof layer.data === 'string') throw new Error('layer "' + layer.name + '" must use CSV encoding');
      map.layers[layer.name] = layer.data.map(g => g & FLIP_MASK);
    } else if (layer.type === 'objectgroup') {
      map.objects[layer.name] = layer.objects.map(o => ({
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

export async function loadMap(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('map fetch failed: ' + res.status + ' ' + url);
  return parseMap(await res.json());
}

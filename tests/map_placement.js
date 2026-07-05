// Map placement tests: interactable icons should not live on solid roofs/walls.
import { loadMap } from '../src/engine/tiledmap.js';

let pass = 0, fail = 0;
async function test(name, fn) {
  try { await fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('map placement');

const customMap = {
  type: 'map', version: '1.10', tiledversion: '1.10.2', orientation: 'orthogonal',
  renderorder: 'right-down', infinite: false, width: 5, height: 5, tilewidth: 16, tileheight: 16,
  layers: [
    { type: 'tilelayer', name: 'ground', width: 5, height: 5, data: Array(25).fill(9) },
    { type: 'tilelayer', name: 'collision', width: 5, height: 5, data: [
      0,0,0,0,0,
      0,0,0,0,0,
      0,0,10,0,0,
      0,0,0,0,0,
      0,0,0,0,0
    ] },
    { type: 'objectgroup', name: 'spawns', objects: [] },
    { type: 'objectgroup', name: 'interact', objects: [
      { id: 1, name: 'bad roof prompt', type: 'clue', x: 32, y: 32, width: 16, height: 16, properties: [] },
      { id: 2, name: 'good street prompt', type: 'clue', x: 16, y: 16, width: 16, height: 16, properties: [] }
    ] },
    { type: 'objectgroup', name: 'doors', objects: [] },
    { type: 'objectgroup', name: 'zones', objects: [] }
  ]
};

await test('interactable prompts are moved off solid tiles', async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => customMap });
  try {
    const map = await loadMap('assets/maps/testplacement.json');
    const moved = map.objects.interact.find(o => o.name === 'bad roof prompt');
    const kept = map.objects.interact.find(o => o.name === 'good street prompt');
    assert(moved.x !== 32 || moved.y !== 32, 'solid-tile prompt was not moved');
    assert(!map.solidAt(Math.floor((moved.x + 8) / 16), Math.floor((moved.y + 8) / 16)), 'moved prompt is still on a solid tile');
    assert(moved.props.placedFromX === 32 && moved.props.placedFromY === 32, 'original position was not recorded');
    assert(kept.x === 16 && kept.y === 16, 'clear prompt should not move');
  } finally {
    globalThis.fetch = oldFetch;
  }
});

if (fail) {
  console.error('\n' + fail + ' map placement test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('map placement tests passed: ' + pass);

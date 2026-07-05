// Generated, Tiled-compatible district maps. These are real playable maps with
// collision, doors, NPCs, clues, jobs, benchmarks, wisps, and final-act content.

function prop(name, value, type) {
  return { name, type: type || (Number.isInteger(value) ? 'int' : typeof value === 'boolean' ? 'bool' : 'string'), value };
}

function obj(id, name, type, x, y, width = 16, height = 16, properties = []) {
  return { id, name, type, x, y, width, height, properties };
}

function door(id, name, x, y, target, spawn) {
  return obj(id, name, 'door', x, y, 16, 16, [prop('target', target), prop('spawn', spawn)]);
}

function npc(id, npcId, name, x, y) {
  return obj(id, name, 'npc', x, y, 16, 16, [prop('npcId', npcId)]);
}

function makeMap(width, height, groundId, waterRects, decor, spawns, npcs, doors, interact) {
  const wallId = 10;
  const ground = [];
  const collision = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const wall = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      let gid = wall ? wallId : groundId;
      let solid = wall ? wallId : 0;
      for (const r of waterRects || []) {
        if (x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3]) {
          gid = r[4];
          solid = 0;
        }
      }
      ground.push(gid);
      collision.push(solid);
    }
  }
  const deco = Array(width * height).fill(0);
  for (const d of decor || []) {
    const [x, y, gid] = d;
    if (x >= 0 && y >= 0 && x < width && y < height) deco[y * width + x] = gid;
  }
  return {
    type: 'map', version: '1.10', tiledversion: '1.10.2', orientation: 'orthogonal',
    renderorder: 'right-down', infinite: false, width, height, tilewidth: 16, tileheight: 16,
    tilesets: [{ firstgid: 1, name: 'placeholder', tilewidth: 16, tileheight: 16, tilecount: 128, columns: 16 }],
    layers: [
      { type: 'tilelayer', name: 'ground', width, height, x: 0, y: 0, opacity: 1, visible: true, data: ground },
      { type: 'tilelayer', name: 'collision', width, height, x: 0, y: 0, opacity: 1, visible: false, data: collision },
      { type: 'tilelayer', name: 'decor', width, height, data: deco },
      { type: 'objectgroup', name: 'spawns', objects: [...spawns, ...npcs] },
      { type: 'objectgroup', name: 'interact', objects: interact },
      { type: 'objectgroup', name: 'doors', objects: doors },
      { type: 'objectgroup', name: 'zones', objects: [] }
    ]
  };
}

function canal() {
  return makeMap(42, 26, 9, [[0, 15, 42, 5, 2], [4, 5, 34, 2, 2]], [[5, 4, 32], [20, 4, 23], [30, 9, 106], [12, 10, 107]],
    [obj(1, 'player', 'spawn', 48, 96), obj(2, 'from_town', 'spawn', 48, 96), obj(3, 'from_rail_yard', 'spawn', 608, 96), obj(4, 'from_quarry', 'spawn', 336, 64)],
    [npc(100, 'shanks', 'Shanks', 96, 112), npc(101, 'canal_patron', 'canal hand', 160, 120), npc(102, 'bright', 'Bright', 560, 112)],
    [door(200, 'road back to town', 32, 96, 'town', 'from_canal'), door(201, 'B&O rail yard', 608, 96, 'rail_yard', 'from_canal'), door(202, 'quarry road', 336, 32, 'quarry', 'from_canal')],
    [
      obj(300, 'Tam Hollis on the creek stones', 'clue', 208, 224, 16, 16, [prop('clue', 'tam_drowned'), prop('sets', 'bodyFound'), prop('teaches', 'CREEK,TAM'), prop('text', 'Tam Hollis lies where the creek gives him back. Lungs full of water. Boots dry as church dust. This was not a drowning here.')]),
      obj(301, 'lockkeeper cargo', 'job', 112, 80, 16, 16, [prop('job', 'canalcargo'), prop('stage', 'pickup')]),
      obj(302, 'lockkeeper ledger', 'clue', 128, 80, 16, 16, [prop('clue', 'gentleman_letter'), prop('teaches', 'GENTLEMAN'), prop('text', 'A folded letter, kept from rain under a lock receipt: Tam wrote of a gentleman buying silence about something found under old fort stone.')]),
      obj(303, 'the lock gates', 'oddity', 320, 80, 32, 16, [prop('text', 'The lock gates breathe water in and out like the town has lungs. Every boatman here knows a secret and calls it freight.')]),
      obj(304, 'far bank crossing', 'ferry', 80, 256)
    ]);
}

function railYard() {
  return makeMap(44, 24, 11, [], [[8, 8, 98], [9, 8, 99], [20, 8, 98], [21, 8, 99], [32, 8, 98], [33, 8, 99]],
    [obj(1, 'player', 'spawn', 48, 96), obj(2, 'from_canal', 'spawn', 48, 96), obj(3, 'from_quarry', 'spawn', 608, 96)],
    [npc(100, 'rail_patron', 'rail worker', 160, 112), npc(101, 'bright', 'Bright', 352, 112)],
    [door(200, 'canal basin', 32, 96, 'canal', 'from_rail_yard'), door(201, 'quarry spur', 640, 96, 'quarry', 'from_rail_yard')],
    [
      obj(300, 'depot scale', 'job', 352, 96, 16, 16, [prop('job', 'canalcargo'), prop('stage', 'dropoff')]),
      obj(301, 'coal manifest', 'clue', 192, 96, 16, 16, [prop('clue', 'plat_mismatch'), prop('teaches', 'PLAT'), prop('text', 'A rail manifest matches quarry lots that the courthouse plat says do not exist. The paper disagrees with the stone coming down from the mountain.')]),
      obj(302, 'brakeman warning', 'oddity', 240, 128, 32, 16, [prop('text', 'A brakeman has chalked MOUNTAIN WATCHES on a coal car, then rubbed it out with his sleeve until only WATCHES remains.')]),
      obj(303, 'benchmark by the depot', 'benchmark', 560, 80)
    ]);
}

function quarry() {
  return makeMap(46, 28, 12, [[6, 20, 16, 2, 2]], [[12, 7, 23], [15, 7, 23], [18, 7, 23], [22, 8, 32], [30, 14, 106], [31, 14, 107]],
    [obj(1, 'player', 'spawn', 48, 96), obj(2, 'from_canal', 'spawn', 48, 96), obj(3, 'from_rail_yard', 'spawn', 80, 96), obj(4, 'from_wills_mountain', 'spawn', 656, 160)],
    [npc(100, 'mcteague', 'McTeague', 192, 128), npc(101, 'gantt', 'Prosper Gantt', 528, 128), npc(102, 'chainman_patron', 'chainman', 336, 160)],
    [door(200, 'canal road', 32, 96, 'canal', 'from_quarry'), door(201, 'rail spur', 80, 80, 'rail_yard', 'from_quarry'), door(202, 'marked mountain path', 688, 160, 'wills_mountain', 'from_quarry')],
    [
      obj(300, 'singing rock face', 'clue', 240, 112, 16, 16, [prop('clue', 'singing_confession'), prop('teaches', 'QUARRY,SINGING'), prop('text', 'Your palm on the cut stone finds a vibration too even for wind. Men heard it singing before Tam went missing.')]),
      obj(301, 'calm bootprints', 'clue', 288, 160, 16, 16, [prop('clue', 'calm_bootprints'), prop('teaches', 'BOOTPRINTS'), prop('text', 'A second set of bootprints crosses the mud: heel clean, pace calm, no hurry in or out.')]),
      obj(302, 'gentleman boot nail', 'clue', 352, 176, 16, 16, [prop('clue', 'boots_matched'), prop('teaches', 'GANTT'), prop('text', "A shoe nail in the spoil matches Feig's gentleman last: town-made, Gantt's size, resoled twice.")]),
      obj(303, 'sealed seam', 'murmur', 544, 112, 16, 16, [prop('rank', 2), prop('teaches', 'SEAM'), prop('text', 'The seam is colder than the air. A voice inside the stone counts links of chain and stops when you breathe.')]),
      obj(304, 'benchmark in the cut', 'benchmark', 608, 176),
      obj(305, 'powder shed', 'oddity', 448, 176, 32, 16, [prop('text', 'Powder casks, survey stakes, and a new lock. This quarry is a business pretending not to be a crime scene.')])
    ]);
}

function willsMountain() {
  return makeMap(44, 30, 13, [[0, 24, 44, 2, 2]], [[10, 10, 32], [18, 12, 32], [24, 7, 32], [28, 16, 23], [34, 20, 23]],
    [obj(1, 'player', 'spawn', 48, 96), obj(2, 'from_quarry', 'spawn', 48, 96), obj(3, 'from_cave_chain', 'spawn', 600, 120)],
    [npc(100, 'brahm', 'Brahm', 160, 144), npc(101, 'patient_patron', 'lost child', 288, 176)],
    [door(200, 'quarry road', 32, 96, 'quarry', 'from_wills_mountain'), door(201, 'horseshoe-marked cave', 640, 128, 'cave_chain', 'from_wills_mountain')],
    [
      obj(300, 'animal track convergence', 'clue', 208, 128, 16, 16, [prop('requires', 'act3Complete'), prop('clue', 'nan_missing'), prop('sets', 'nanMissing'), prop('teaches', 'NAN,MOUNTAIN'), prop('text', 'Every hoofprint and pawmark points north. The animals knew before the town did: Nan Trent has gone where the mountain listens.')]),
      obj(301, 'mountain light', 'wisp', 352, 96),
      obj(302, 'old fort bivouac', 'sleeprough', 128, 192),
      obj(303, 'first mountain benchmark', 'benchmark', 480, 160),
      obj(304, 'wind in the laurel', 'murmur', 400, 208, 16, 16, [prop('rank', 1), prop('teaches', 'HE MEASURES'), prop('text', 'The laurel moves without wind: HE MEASURES, HE MEASURES, HE MEASURES.')])
    ]);
}

function caveChain() {
  return makeMap(36, 24, 14, [[10, 10, 16, 2, 2]], [[12, 8, 23], [18, 8, 23], [24, 8, 23], [20, 16, 32]],
    [obj(1, 'player', 'spawn', 48, 80), obj(2, 'from_wills_mountain', 'spawn', 48, 80), obj(3, 'from_cathedral', 'spawn', 496, 240)],
    [npc(100, 'chainman_patron', 'echo of a chainman', 192, 128)],
    [door(200, 'mountain mouth', 32, 80, 'wills_mountain', 'from_cave_chain'), door(201, 'cold cathedral', 512, 240, 'cathedral', 'from_cave_chain')],
    [
      obj(300, 'horseshoe over the cave mouth', 'oddity', 64, 80, 16, 16, [prop('text', 'A horseshoe nailed open-end down. Robey Marsh knew enough to mark the way and not enough to close it.')]),
      obj(301, 'old fort seam', 'murmur', 256, 128, 16, 16, [prop('rank', 2), prop('teaches', 'SEAL,WINONA'), prop('text', 'A sealed seam under Cumberland. Names older than deeds press their hands against the dark.')]),
      obj(302, 'second mountain benchmark', 'benchmark', 320, 176),
      obj(303, 'deep water without reflection', 'wisp', 400, 160)
    ]);
}

function cathedral() {
  return makeMap(34, 22, 15, [[8, 16, 18, 2, 2]], [[12, 6, 32], [18, 6, 32], [22, 6, 32], [17, 10, 23]],
    [obj(1, 'player', 'spawn', 48, 80), obj(2, 'from_cave_chain', 'spawn', 48, 80)],
    [npc(100, 'patient_patron', 'Nan Trent', 272, 144)],
    [door(200, 'the way back up', 32, 80, 'cave_chain', 'from_cathedral')],
    [
      obj(300, 'Nan at the center', 'chamber', 272, 144),
      obj(301, 'cold cathedral dark', 'clue', 240, 112, 16, 16, [prop('requires', 'nanMissing'), prop('clue', 'the_chamber'), prop('teaches', 'NAN,SEAL'), prop('text', 'Nan sits unharmed in a dark too large for the mountain. She is listening, and what answers her is older than the county.')]),
      obj(302, 'the oldest voice', 'murmur', 336, 96, 16, 16, [prop('rank', 2), prop('teaches', 'BURIED TRUTH'), prop('text', 'Not a curse. Not a murder. A seal, neglected, then sold for stone.')])
    ]);
}

const MAPS = { canal, rail_yard: railYard, quarry, wills_mountain: willsMountain, cave_chain: caveChain, cathedral };

export function generatedMapJson(mapId) {
  return MAPS[mapId] ? MAPS[mapId]() : null;
}

export const GENERATED_MAP_IDS = Object.freeze(Object.keys(MAPS));

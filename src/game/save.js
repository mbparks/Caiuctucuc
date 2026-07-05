// Local-first save: localStorage plus JSON export and import.
// Pure functions here so the same module runs in Node for tests.
export const SAVE_KEY = 'caiuctucuc-save';
export const SAVE_FORMAT = 7;

export function newGame() {
  return {
    format: SAVE_FORMAT,
    version: '0.29.2',
    player: { x: 12, y: 10, marks: [], sight: 0, coin: 8, coat: 'drover', equip: {}, health: 10, maxHealth: 10, fedAbs: 0 },
    difficulty: { combat: 'frontier', survival: 'buffs', huecry: 'standard' },
    wards: [],
    pet: null,
    clock: { day: 1, hour: 18 },
    hueCry: { level: 0, heat: 0, witnessedCoat: null },
    flags: {},
    trust: {},
    reputation: { town: 0, kirk: 0, hills: 0, road: 0 },
    keywordsLearned: ['NAME', 'JOB', 'TOWN'],
    inventory: [
      { id: 'belt_knife', qty: 1, cond: 'sound', wear: 0 },
      { id: 'johnnycake', qty: 2 },
      { id: 'whiskey', qty: 1 },
      { id: 'whetstone', qty: 1 }
    ],
    stash: [],
    clues: [],
    rumors: [],
    job: null,
    map: 'town'
  };
}

export function serialize(state) { return JSON.stringify(state, null, 2); }

function migrate(s) {
  if (s.format === 1) {
    s.format = 2;
    s.player.coat = s.player.coat || 'drover';
    s.clock = s.clock || { day: 1, hour: 18 };
    s.hueCry.witnessedCoat = s.hueCry.witnessedCoat ?? null;
  }
  if (s.format === 2) {
    s.format = 3;
    s.rumors = s.rumors || [];
    s.job = s.job || null;
    s.map = s.map || 'town';
    delete s.player.mapX;
    delete s.player.mapY;
  }
  if (s.format === 3) {
    s.format = 4;
    s.player.equip = s.player.equip || {};
    s.stash = s.stash || [];
    s.inventory = (s.inventory || []).map(e =>
      typeof e === 'string' ? { id: e, qty: 1 } : e);
  }
  if (s.format === 4) {
    s.format = 5;
    s.clues = s.clues || [];
  }
  if (s.format === 5) {
    s.format = 6;
    s.player.health = s.player.health ?? 10;
    s.player.maxHealth = s.player.maxHealth ?? 10;
    s.player.fedAbs = s.player.fedAbs ?? 0;
    s.difficulty = s.difficulty || { combat: 'frontier', survival: 'buffs', huecry: 'standard' };
    s.wards = s.wards || [];
  }
  if (s.format === 6) {
    s.format = 7;
    s.pet = s.pet || null;
  }
  return s;
}

export function deserialize(text) {
  let s = JSON.parse(text);
  if (typeof s !== 'object' || s === null) throw new Error('Save is not an object');
  if (s.format < SAVE_FORMAT) s = migrate(s);
  if (s.format !== SAVE_FORMAT) throw new Error('Save format ' + s.format + ' is not supported');
  return s;
}

export function storeLocal(state, storage) { storage.setItem(SAVE_KEY, serialize(state)); }

export function loadLocal(storage) {
  const raw = storage.getItem(SAVE_KEY);
  return raw ? deserialize(raw) : null;
}

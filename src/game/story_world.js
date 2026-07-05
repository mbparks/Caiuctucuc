// Story world systems for v0.30 through v0.35.
// These make maps feel connected and story-reactive without adding more header buttons.
import { evidenceScore } from './quest.js';
import { mountainAttention, attentionBand } from './mountain_attention.js';

const SAVE_KEY = 'caiuctucuc-save';

function propBag(props) { return props || {}; }
function nextId(map, base = 7000) {
  const all = Object.values(map.objects || {}).flat();
  return Math.max(base, ...all.map(o => o.id || 0)) + 1;
}
function obj(id, name, type, x, y, width = 16, height = 16, props = {}) {
  return { id, name, type, x, y, width, height, props: propBag(props) };
}
function spawn(id, name, x, y) { return obj(id, name, 'spawn', x, y); }
function door(id, name, x, y, target, spawnName, requires = null) {
  const props = { target, spawn: spawnName };
  if (requires) props.requires = requires;
  return obj(id, name, 'door', x, y, 16, 16, props);
}
function clue(id, name, x, y, clueId, text, extra = {}) {
  return obj(id, name, 'clue', x, y, 16, 16, { clue: clueId, text, ...extra });
}
function oddity(id, name, x, y, text, extra = {}) {
  return obj(id, name, 'oddity', x, y, 16, 16, { text, ...extra });
}
function murmur(id, name, x, y, text, rank = 1, extra = {}) {
  return obj(id, name, 'murmur', x, y, 16, 16, { rank, text, ...extra });
}

export function savedStoryState() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function has(state, key) { return Boolean(state?.flags?.[key] || state?.clues?.includes(key)); }
function hour(state) { return Math.floor(state?.clock?.hour ?? 12); }
function wh(map, pxFromRight = 0, pyFromBottom = 0) {
  return { x: map.width * map.tileWidth - pxFromRight, y: map.height * map.tileHeight - pyFromBottom };
}

export function physicalConnections(mapId, map) {
  const id = nextId(map, 7100);
  const midX = Math.floor(map.width * map.tileWidth / 2);
  const nearBottom = wh(map, 96, 72);
  const nearRight = wh(map, 64, 112);
  if (mapId !== 'town') return [];
  return [
    spawn(id, 'from_canal', 72, nearBottom.y),
    spawn(id + 1, 'from_rail_yard', nearRight.x, nearBottom.y),
    spawn(id + 2, 'from_quarry', nearRight.x, 96),
    spawn(id + 3, 'from_wills_mountain', midX, 56),
    door(id + 4, 'canal basin road', 72, nearBottom.y, 'canal', 'from_town'),
    door(id + 5, 'rail yard road', nearRight.x, nearBottom.y, 'rail_yard', 'from_town'),
    door(id + 6, 'quarry road', nearRight.x, 96, 'quarry', 'from_town'),
    door(id + 7, 'north road to Wills Mountain', midX, 56, 'wills_mountain', 'from_town'),
    oddity(id + 8, 'road fingerpost', midX - 24, 72, 'The fingerpost has four hands: CANAL, RAIL, QUARRY, MOUNTAIN. Cumberland is not one place. It is the knot where all roads pull tight.')
  ];
}

const EAVESDROP = {
  int_bluemule: [
    { hours: [6, 12], text: 'Breakfast talk: a drover swears Tam Hollis was dry-footed when they carried him in, then remembers he never said it.', teaches: 'TAM,CREEK' },
    { hours: [12, 18], text: 'Afternoon talk: Peg lowers her voice. A gentleman paid for a back room and asked after quarry men by name.', teaches: 'GENTLEMAN,QUARRY' },
    { hours: [18, 24], text: 'Evening talk: Beall drinks slow and says a haunted town still has human hands in it.', teaches: 'BEALL,GANTT' },
    { hours: [0, 6], text: 'After midnight, the room goes quiet when the mountain wind presses against the shutters. Someone whispers: he measures.', teaches: 'HE MEASURES' }
  ],
  int_courthouse: [
    { hours: [8, 17], text: 'Clerks argue over a missing ledger leaf. One insists it was razored clean, not torn.', clue: 'ledger_cut', teaches: 'LEDGER' },
    { hours: [17, 24], text: 'After closing, Fenwick says the plat ink is newer than the hand that signed it.', clue: 'plat_mismatch', teaches: 'PLAT,FENWICK' }
  ],
  int_survey: [
    { hours: [8, 18], text: 'A chainman recites numbers from Gantt\'s desk, then stops when he notices they do not match the brass pins.', teaches: 'BENCHMARK,GANTT' },
    { hours: [18, 24], text: 'The office is empty, but the lamp is warm. A fresh line on the county plat tries to be older than it is.', clue: 'plat_mismatch', teaches: 'PLAT' }
  ],
  int_surgery: [
    { hours: [8, 20], text: 'Ward tells a patient that visions are a fever. The patient says the curtains have been counting survey links all morning.', teaches: 'SIGHT,HE MEASURES' }
  ]
};
function inHours(h, range) {
  const [a, b] = range;
  return a <= b ? h >= a && h < b : h >= a || h < b;
}

export function eavesdropObjects(mapId, map, state = savedStoryState()) {
  const rows = (EAVESDROP[mapId] || []).filter(r => inHours(hour(state), r.hours));
  const id = nextId(map, 7300);
  const centerX = Math.floor(map.width * map.tileWidth / 2);
  return rows.map((r, i) => {
    const props = { text: r.text };
    if (r.clue) props.clue = r.clue;
    if (r.teaches) props.teaches = r.teaches;
    if (r.clue) return clue(id + i, 'overheard conversation', centerX + i * 18, 48 + i * 20, r.clue, r.text, props);
    return oddity(id + i, 'overheard conversation', centerX + i * 18, 48 + i * 20, r.text, props);
  });
}

export function pressureStage(state) {
  const score = evidenceScore(state || { clues: [], flags: {} });
  if (has(state, 'verdict')) return { id: 'closed', level: 0, label: 'Closed', text: 'The court has taken the matter from the street.' };
  if (score >= 7 || has(state, 'true_line')) return { id: 'desperate', level: 4, label: 'Desperate', text: 'Gantt is out of time and knows it.' };
  if (score >= 5 || has(state, 'boots_matched')) return { id: 'cornered', level: 3, label: 'Cornered', text: 'Gantt has begun moving men, paper, and blame.' };
  if (score >= 3 || has(state, 'plat_mismatch')) return { id: 'watching', level: 2, label: 'Watching', text: 'A polite surveyor has noticed your questions.' };
  if (score >= 1) return { id: 'aware', level: 1, label: 'Aware', text: 'One death can be weather. Two questions are not weather.' };
  return { id: 'calm', level: 0, label: 'Calm', text: 'Gantt still thinks fear will do his work for him.' };
}

export function ganttPressureObjects(mapId, map, state = savedStoryState()) {
  const p = pressureStage(state);
  if (p.level < 2) return [];
  const id = nextId(map, 7500);
  const out = [];
  if (['town', 'canal', 'rail_yard', 'quarry'].includes(mapId)) {
    const pos = wh(map, 128, 96);
    out.push(obj(id, 'Gantt\'s chainman', 'npc', pos.x, pos.y, 16, 16, { npcId: 'gantt_agent', pressure: p.id }));
  }
  if (mapId === 'quarry' && p.level >= 3) {
    out.push(oddity(id + 1, 'freshly moved powder', 420, 128, 'Powder casks have been shifted since morning. Someone wants the deep cut noisy, confused, and unsafe.'));
  }
  if (mapId === 'int_survey' && p.level >= 4) {
    out.push(clue(id + 2, 'hurried ash in the stove', 64, 64, 'gantt_burned_notes', 'Half-burned notes curl in the stove. Gantt wrote T.H., C., and BENCHMARK before the fire took the rest.', { teaches: 'GANTT,BENCHMARK' }));
  }
  return out;
}

export function dogLead(state) {
  if (state?.pet !== 'dog') return { active: false, text: 'The stray dog is still only a possibility. The market death leaves him with nowhere to go.' };
  if (!has(state, 'tam_drowned')) return { active: true, target: 'canal', text: 'The dog keeps pulling toward Wills Creek. He has the dead man\'s scent before you have the case.' };
  if (!has(state, 'calm_bootprints')) return { active: true, target: 'quarry', text: 'The dog noses mud from the creek road, then faces the quarry and refuses to look away.' };
  if (!has(state, 'plat_mismatch')) return { active: true, target: 'rail_yard', text: 'Coal dust makes the dog sneeze. He paws at freight paper, not stone.' };
  if (state.flags?.act3Complete && !has(state, 'the_chamber')) return { active: true, target: 'wills_mountain', text: 'The dog will not bark now. He only walks north and waits for you to follow.' };
  return { active: true, target: state.map || 'town', text: 'The dog stays close. Whatever comes next, he has chosen your shadow.' };
}

export function mountainWorldEffects(state) {
  const score = mountainAttention(state || {});
  const band = attentionBand(score);
  return {
    score,
    band,
    effects: [
      score >= 12 ? 'Whispers begin using survey words.' : null,
      score >= 30 ? 'Animals avoid the road before people understand why.' : null,
      score >= 55 ? 'Doors are found open and lamps burn blue around sealed stone.' : null,
      score >= 80 ? 'The mountain is no longer background. It is a participant.' : null
    ].filter(Boolean)
  };
}

export function dogAndMountainObjects(mapId, map, state = savedStoryState()) {
  const id = nextId(map, 7700);
  const out = [];
  const dog = dogLead(state);
  if (dog.active && dog.target === mapId && state?.pet === 'dog') {
    out.push(oddity(id, 'dog scent trail', 96, 96, dog.text));
  }
  const m = mountainWorldEffects(state);
  if (m.score >= 30 && ['wills_mountain', 'quarry', 'cave_chain'].includes(mapId)) {
    out.push(murmur(id + 1, 'wrong wind', 160, 112, m.band.text, m.score >= 55 ? 2 : 1, { teaches: 'MOUNTAIN,SIGHT' }));
  }
  return out;
}

export function setPieceObjects(mapId, map, state = savedStoryState()) {
  const id = nextId(map, 7900);
  const out = [];
  if (mapId === 'town') {
    out.push(clue(id, 'courthouse records room', 180, 96, 'ledger_cut', 'The record leaf was razored from the binding. A clumsy thief tears. A careful one leaves a clean wound.', { teaches: 'LEDGER,HE MEASURES' }));
    out.push(clue(id + 1, 'Coombs\'s open grave', 128, 244, 'coombs_grave', 'Coombs lies where Tam should have rested. No investigator, no thief. He opened the wrong coffin looking for stone rubbings.', { requires: 'act1Complete', sets: 'coombsDead', teaches: 'COOMBS,RUBBINGS' }));
    out.push(obj(id + 2, 'bench trial', 'accuse', 248, 96, 16, 16, {}));
  }
  if (mapId === 'canal') {
    out.push(clue(id + 3, 'Tam\'s dry boots', 228, 224, 'dry_boots', 'The leather is dusty under the creek mud. He drowned, yes, but not where the water found him.', { teaches: 'TAM,CREEK,BOOTS' }));
  }
  if (mapId === 'quarry') {
    out.push(clue(id + 4, 'survey stake line', 496, 144, 'true_line', 'Five bearings agree against the re-inked plat. Mathematics does not perjure.', { requires: 'benchmarksAll', teaches: 'TRUE LINE,GANTT' }));
  }
  if (mapId === 'wills_mountain' && state?.flags?.act3Complete) {
    out.push(clue(id + 5, 'Nan\'s ribbon on laurel', 416, 176, 'nan_trail', 'A torn ribbon catches on the laurel. The animals did not flee from Nan. They followed her path after she vanished.', { sets: 'nanMissing', teaches: 'NAN,MOUNTAIN' }));
  }
  return out;
}

export function decorateStoryWorld(mapId, map, state = savedStoryState()) {
  const additions = [
    ...physicalConnections(mapId, map),
    ...eavesdropObjects(mapId, map, state),
    ...ganttPressureObjects(mapId, map, state),
    ...dogAndMountainObjects(mapId, map, state),
    ...setPieceObjects(mapId, map, state)
  ];
  if (!additions.length) return map;
  map.objects.spawns = [...(map.objects.spawns || []), ...additions.filter(o => o.type === 'spawn' || o.type === 'npc')];
  map.objects.doors = [...(map.objects.doors || []), ...additions.filter(o => o.type === 'door')];
  map.objects.interact = [...(map.objects.interact || []), ...additions.filter(o => o.type !== 'spawn' && o.type !== 'npc' && o.type !== 'door')];
  return map;
}

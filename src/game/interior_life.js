// Interior life: map scheduled outdoor spots to building interiors so the town
// feels occupied when the player steps through a door.
import { spotFor, SCHEDULES } from './schedule.js';

export const SPOT_INTERIORS = {
  doyle_bar: 'int_bluemule',
  beall_tavern: 'int_bluemule',
  cresap_tavern: 'int_bluemule',
  feig_tavern: 'int_bluemule',
  mcteague_tavern: 'int_bluemule',
  shanks_tavern: 'int_bluemule',
  bright_tavern: 'int_bluemule',
  pyle_tavern: 'int_bluemule',

  beall_post: 'int_courthouse',
  rood_court: 'int_courthouse',
  fenwick_court: 'int_courthouse',

  gantt_work: 'int_survey',
  ward_work: 'int_surgery',
  feig_work: 'int_smithy',
  cresap_work: 'int_cresap',
  rood_work: 'int_school',
  mcteague_work: 'int_shack',
  shanks_work: 'int_ferry',
  bright_work: 'int_stable',
  pyle_work: 'int_lockhouse',
  coombs_work: 'int_shanty',
  fenwick_work: 'int_fenwick',
  brahm_home: 'int_brahm',

  doyle_home: 'int_bluemule',
  beall_home: 'int_gaol',
  cresap_home: 'int_cresap',
  ward_home: 'int_surgery',
  feig_home: 'int_smithy',
  gantt_home: 'int_lamar',
  rood_home: 'int_school',
  mcteague_home: 'int_shack',
  coombs_home: 'int_shanty',
  fenwick_home: 'int_fenwick',
  shanks_home: 'int_ferry',
  bright_home: 'int_stable',
  pyle_home: 'int_lockhouse'
};

const INTERIOR_CROWDS = {
  int_bluemule: [
    { id: 'drover_patron', name: 'drover', hours: [6, 24] },
    { id: 'canal_patron', name: 'canal hand', hours: [17, 24] },
    { id: 'rail_patron', name: 'rail worker', hours: [18, 23] }
  ],
  int_courthouse: [
    { id: 'clerk_patron', name: 'court clerk', hours: [8, 18] }
  ],
  int_store: [
    { id: 'shopper_patron', name: 'shopper', hours: [9, 18] }
  ],
  int_gaol: [
    { id: 'gaol_patron', name: 'gaol inmate', hours: [0, 24] }
  ],
  int_surgery: [
    { id: 'patient_patron', name: 'patient', hours: [8, 20] }
  ],
  int_survey: [
    { id: 'chainman_patron', name: 'chainman', hours: [8, 18] }
  ]
};

const STATIC_INTERIORS = {
  int_bluemule: ['doyle', 'drover_patron', 'canal_patron', 'rail_patron'],
  int_courthouse: ['beall', 'rood', 'fenwick', 'clerk_patron'],
  int_store: ['shopper_patron'],
  int_survey: ['gantt', 'chainman_patron'],
  int_surgery: ['ward', 'patient_patron'],
  int_gaol: ['beall', 'gaol_patron'],
  int_smithy: ['feig'],
  int_cresap: ['cresap'],
  int_school: ['rood'],
  int_shack: ['mcteague'],
  int_fenwick: ['fenwick'],
  int_shanty: ['coombs'],
  int_ferry: ['shanks'],
  int_stable: ['bright'],
  int_brahm: ['brahm'],
  int_lockhouse: ['pyle']
};

const DISPLAY_NAMES = {
  doyle: 'Peg Doyle', beall: 'Beall', rood: 'Pelham Rood', fenwick: 'Fenwick',
  gantt: 'Prosper Gantt', ward: 'Ward', feig: 'Feig', cresap: 'Cresap',
  mcteague: 'McTeague', coombs: 'Coombs', shanks: 'Shanks', bright: 'Bright',
  brahm: 'Brahm', pyle: 'Pyle',
  drover_patron: 'drover', canal_patron: 'canal hand', rail_patron: 'rail worker',
  clerk_patron: 'court clerk', shopper_patron: 'shopper', gaol_patron: 'gaol inmate',
  patient_patron: 'patient', chainman_patron: 'chainman'
};

function inHours(hour, range) {
  const [from, to] = range;
  return from <= to ? hour >= from && hour < to : hour >= from || hour < to;
}

function unique(list) {
  const out = [];
  const seen = new Set();
  for (const item of list) {
    const key = item.id || item;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function currentInteriorForNpc(npcId, hour, schedules = SCHEDULES) {
  const schedule = schedules[npcId];
  if (!schedule) return null;
  return SPOT_INTERIORS[spotFor(schedule, hour)] || null;
}

export function scheduledNpcIdsForInterior(mapId, hour, schedules = SCHEDULES, flags = {}) {
  const ids = [];
  for (const npcId of Object.keys(schedules)) {
    if (flags.coombsDead && npcId === 'coombs') continue;
    if (currentInteriorForNpc(npcId, hour, schedules) === mapId) ids.push(npcId);
  }
  return ids;
}

export function ambientInteriorCrowd(mapId, hour) {
  return unique((INTERIOR_CROWDS[mapId] || []).filter(p => inHours(hour, p.hours)));
}

export function interiorNpcEntries(mapId, hour, flags = {}, schedules = SCHEDULES) {
  const named = scheduledNpcIdsForInterior(mapId, hour, schedules, flags)
    .map(id => ({ id, name: id, scheduled: true }));
  return unique([...named, ...ambientInteriorCrowd(mapId, hour)]);
}

export function interiorStandPosition(mapWidth, mapHeight, index) {
  const cols = Math.max(1, mapWidth - 4);
  const left = 2;
  const top = 2;
  const usableRows = Math.max(1, mapHeight - 4);
  const xTile = left + (index * 3) % cols;
  const yTile = top + Math.floor((index * 3) / cols) % usableRows;
  return { x: xTile * 16, y: yTile * 16 };
}

export function staticInteriorNpcObjects(mapId, map) {
  const ids = STATIC_INTERIORS[mapId] || [];
  return ids.map((npcId, index) => {
    const pos = interiorStandPosition(map.width, map.height, index);
    return {
      name: DISPLAY_NAMES[npcId] || npcId,
      type: 'npc',
      x: pos.x,
      y: pos.y,
      width: 16,
      height: 16,
      props: { npcId, interior: true }
    };
  });
}

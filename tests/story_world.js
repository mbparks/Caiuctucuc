// Story world tests: v0.30 through v0.35 systems.
import { generatedMapJson } from '../src/game/generated_maps.js';
import { parseMap } from '../src/engine/tiledmap.js';
import {
  physicalConnections,
  eavesdropObjects,
  pressureStage,
  ganttPressureObjects,
  dogLead,
  mountainWorldEffects,
  setPieceObjects,
  decorateStoryWorld
} from '../src/game/story_world.js';
import { contradictions, legalProof, supernaturalTruths, trialReadiness } from '../src/game/case_board.js';
import { addClue, evidenceScore } from '../src/game/quest.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('story world');
const baseState = {
  player: { coin: 8, coat: 'drover', sight: 0 },
  clock: { day: 1, hour: 20 },
  hueCry: { level: 0, heat: 0, witnessedCoat: null },
  flags: {}, clues: [], wards: [], map: 'town', pet: null,
  reputation: { town: 0, kirk: 0, hills: 0, road: 0 }
};
function map(id) { return parseMap(generatedMapJson(id)); }

test('physical town exits connect to expanded districts', () => {
  const m = map('canal');
  const town = { ...m, objects: { spawns: [], doors: [], interact: [] } };
  const links = physicalConnections('town', town);
  const targets = links.filter(o => o.type === 'door').map(o => o.props.target);
  for (const target of ['canal', 'rail_yard', 'quarry', 'wills_mountain']) assert(targets.includes(target), 'missing target ' + target);
});

test('time-based eavesdropping creates interior story objects', () => {
  const m = { width: 14, height: 10, tileWidth: 16, tileHeight: 16, objects: { interact: [], spawns: [] } };
  const rows = eavesdropObjects('int_bluemule', m, { ...baseState, clock: { day: 1, hour: 21 } });
  assert(rows.length >= 1, 'no Blue Mule evening eavesdrop');
  assert(rows[0].props.text.includes('Beall') || rows[0].props.text.includes('mountain'), 'wrong eavesdrop text');
});

test('Gantt pressure rises with evidence and adds agents', () => {
  const state = { ...baseState, clues: ['plat_mismatch', 'calm_bootprints'] };
  assert(pressureStage(state).level >= 2, 'pressure did not rise');
  const agents = ganttPressureObjects('quarry', map('quarry'), state).filter(o => o.type === 'npc');
  assert(agents.some(o => o.props.npcId === 'gantt_agent'), 'no Gantt agent created');
});

test('dog lead moves the player through the investigation', () => {
  assert(dogLead({ ...baseState, pet: 'dog' }).target === 'canal', 'dog should start at creek lead');
  assert(dogLead({ ...baseState, pet: 'dog', clues: ['tam_drowned'] }).target === 'quarry', 'dog should move to quarry after body');
});

test('mountain effects scale with attention', () => {
  const quiet = mountainWorldEffects(baseState);
  const loud = mountainWorldEffects({ ...baseState, map: 'cathedral', player: { ...baseState.player, sight: 2 }, flags: { nanMissing: true, inChamber: true } });
  assert(loud.score > quiet.score, 'mountain score did not rise');
  assert(loud.effects.length > quiet.effects.length, 'mountain effects did not expand');
});

test('set pieces use registered clues', () => {
  const state = { ...baseState, flags: { act1Complete: true } };
  const pieces = setPieceObjects('town', map('canal'), state).filter(o => o.type === 'clue');
  let s = { ...baseState };
  for (const p of pieces) s = addClue(s, p.props.clue);
  assert(s.clues.includes('ledger_cut'), 'records room clue not added');
  assert(s.clues.includes('coombs_grave'), 'Coombs clue not added');
});

test('case board separates contradictions, legal proof, and supernatural truth', () => {
  const state = { ...baseState, clues: ['tam_drowned', 'dry_boots', 'plat_mismatch', 'singing_confession', 'true_line'] };
  assert(contradictions(state).length >= 2, 'contradictions missing');
  assert(legalProof(state).some(p => p.id === 'true_line'), 'true line proof missing');
  assert(supernaturalTruths(state).some(s => s.id === 'singing_confession'), 'supernatural truth missing');
  assert(trialReadiness(state).proofs.length >= 2, 'readiness did not include proof');
});

test('decorated maps contain story additions in normal object layers', () => {
  const m = decorateStoryWorld('quarry', map('quarry'), { ...baseState, clues: ['tam_drowned', 'boots_matched'], pet: 'dog' });
  assert((m.objects.spawns || []).some(o => o.props?.npcId === 'gantt_agent'), 'decorated quarry missing agent');
  assert((m.objects.interact || []).some(o => o.name === 'dog scent trail'), 'decorated quarry missing dog trail');
  assert(evidenceScore({ ...baseState, clues: ['dry_boots', 'ledger_cut'] }) === 2, 'new evidence not scored');
});

if (fail) {
  console.error('\n' + fail + ' story world test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('story world tests passed: ' + pass);

// World expansion tests: maps, case board, law actions, and mountain attention.
import { generatedMapJson, GENERATED_MAP_IDS } from '../src/game/generated_maps.js';
import { parseMap } from '../src/engine/tiledmap.js';
import { boardThreads, openLeads, trialReadiness } from '../src/game/case_board.js';
import { lawStage, bribeRunner, changeCoatAction } from '../src/game/law.js';
import { mountainAttention, attentionBand } from '../src/game/mountain_attention.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('world expansion');

const baseState = {
  player: { coin: 8, coat: 'drover', sight: 0 },
  clock: { day: 1, hour: 12 },
  hueCry: { level: 0, heat: 0, witnessedCoat: null },
  flags: {}, clues: [], wards: [], map: 'town'
};

test('all generated maps parse and have doors or playable interactables', () => {
  assert(GENERATED_MAP_IDS.length >= 6, 'expected multiple districts');
  for (const id of GENERATED_MAP_IDS) {
    const map = parseMap(generatedMapJson(id));
    assert(map.width > 20 && map.height > 15, id + ' too small');
    assert((map.objects.spawns || []).some(o => o.type === 'spawn'), id + ' missing player spawn');
    assert((map.objects.interact || []).length > 0, id + ' missing interactables');
  }
});

test('new districts carry real investigation content', () => {
  const quarry = parseMap(generatedMapJson('quarry'));
  const clues = quarry.objects.interact.filter(o => o.type === 'clue').map(o => o.props.clue);
  assert(clues.includes('singing_confession'), 'quarry missing singing clue');
  assert(clues.includes('calm_bootprints'), 'quarry missing bootprints clue');
  assert(clues.includes('boots_matched'), 'quarry missing boot match clue');
  const cathedral = parseMap(generatedMapJson('cathedral'));
  assert(cathedral.objects.interact.some(o => o.type === 'chamber'), 'cathedral missing ending chamber');
});

test('case board groups evidence and reports open leads', () => {
  const state = { ...baseState, clues: ['tam_drowned', 'calm_bootprints'] };
  assert(boardThreads(state).length >= 2, 'board did not group clue threads');
  assert(openLeads(state).some(l => l.includes('quarry')), 'open leads did not point to quarry work');
});

test('trial readiness improves with hard evidence', () => {
  const state = { ...baseState, clues: ['tam_drowned','calm_bootprints','plat_mismatch','boots_matched','rubbings_matched','true_line'] };
  const ready = trialReadiness(state);
  assert(ready.score >= 6, 'evidence score too low');
  assert(ready.ready, 'trial should be ready with physical proof');
});

test('law actions mutate heat, coin, and coat', () => {
  const hot = { ...baseState, hueCry: { level: 2, heat: 14, witnessedCoat: 'drover' } };
  assert(lawStage(hot).id === 'constable', 'expected constable stage');
  const bribe = bribeRunner(hot);
  assert(bribe.ok && bribe.state.player.coin === 6, 'bribe did not cost coin');
  assert(bribe.state.hueCry.heat < hot.hueCry.heat, 'bribe did not cool heat');
  const coat = changeCoatAction(hot);
  assert(coat.state.player.coat !== 'drover', 'coat did not change');
});

test('mountain attention rises with SIGHT and sealed maps', () => {
  const quiet = mountainAttention(baseState);
  const loud = mountainAttention({ ...baseState, map: 'cathedral', player: { ...baseState.player, sight: 2 }, flags: { nanMissing: true, inChamber: true } });
  assert(loud > quiet, 'attention did not rise');
  assert(attentionBand(loud).id !== 'quiet', 'attention band stayed quiet');
});

if (fail) {
  console.error('\n' + fail + ' world expansion test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('world expansion tests passed: ' + pass);

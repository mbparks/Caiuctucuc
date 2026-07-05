// Interior life tests: buildings should no longer load as empty rooms.
import {
  currentInteriorForNpc,
  interiorNpcEntries,
  staticInteriorNpcObjects
} from '../src/game/interior_life.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('interior life');

test('scheduled NPCs resolve to building interiors', () => {
  assert(currentInteriorForNpc('doyle', 20) === 'int_bluemule', 'Doyle should be in the Blue Mule');
  assert(currentInteriorForNpc('beall', 10) === 'int_courthouse', 'Beall should be in the courthouse by day');
  assert(currentInteriorForNpc('gantt', 12) === 'int_survey', 'Gantt should be in the survey office by day');
});

test('Blue Mule has named and ambient occupants', () => {
  const ids = interiorNpcEntries('int_bluemule', 20).map(e => e.id);
  assert(ids.includes('doyle'), 'missing Doyle');
  assert(ids.includes('beall'), 'missing Beall evening tavern visit');
  assert(ids.includes('drover_patron'), 'missing drover patron');
  assert(ids.includes('canal_patron'), 'missing canal patron');
});

test('static interior NPCs match map object shape', () => {
  const map = { width: 14, height: 10 };
  const npcs = staticInteriorNpcObjects('int_courthouse', map);
  assert(npcs.length >= 3, 'courthouse should have several occupants');
  assert(npcs.every(n => n.type === 'npc'), 'all occupants must be npc objects');
  assert(npcs.every(n => n.props && n.props.npcId), 'all occupants need npcId props');
  assert(npcs.every(n => n.x >= 0 && n.y >= 0), 'occupants must have valid positions');
});

if (fail) {
  console.error('\n' + fail + ' interior life test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('interior life tests passed: ' + pass);

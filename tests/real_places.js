// Real-place naming tests: district labels should prefer real Cumberland-area names.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('real place names');
const world = readFileSync('src/world_expansion.js', 'utf8');
const maps = readFileSync('src/game/generated_maps.js', 'utf8');
const readme = readFileSync('README.md', 'utf8');
const combined = world + '\n' + maps + '\n' + readme;

test('district UI uses Cumberland Quarry and Cumberland Bone Cave', () => {
  assert(world.includes("quarry: 'Cumberland Quarry'"), 'world label must name Cumberland Quarry');
  assert(world.includes("cathedral: 'Cumberland Bone Cave'"), 'world label must name Cumberland Bone Cave');
  assert(world.includes('CUMBERLAND PLACES'), 'district modal should be framed as places');
});

test('generated map text uses real place names', () => {
  assert(maps.includes('Wills Creek Formation face'), 'quarry evidence should reference Wills Creek Formation');
  assert(maps.includes('Cumberland Bone Cave dark'), 'final chamber should use Cumberland Bone Cave naming');
  assert(maps.includes('Keyser limestone seam'), 'cave approach should reference Keyser limestone');
});

test('fictional district names do not reappear as visible labels', () => {
  assert(!combined.includes('Quarry Deep Cut'), 'fictional label Quarry Deep Cut should not be visible');
  assert(!combined.includes('Cold Cathedral'), 'fictional label Cold Cathedral should not be visible');
});

if (fail) {
  console.error('\n' + fail + ' real place naming test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('real place naming tests passed: ' + pass);

// Browser module contract tests. These catch stale or mismatched exports before deployment.
import { fitScale, fmtHour, miniPos } from '../src/engine/scale.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('module contracts');

test('scale.js exports the functions imported by main.js', () => {
  assert(typeof fitScale === 'function', 'fitScale missing');
  assert(typeof fmtHour === 'function', 'fmtHour missing');
  assert(typeof miniPos === 'function', 'miniPos missing');
});

test('miniPos maps world coordinates into a minimap box', () => {
  const p = miniPos(50, 25, 100, 100, 20, 10);
  assert(p.x === 10 && p.y === 2, 'unexpected miniPos result: ' + JSON.stringify(p));
});

if (fail) {
  console.error('\n' + fail + ' module contract test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('module contract tests passed: ' + pass);

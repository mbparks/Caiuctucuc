// Regression tests for doorway bounce behavior.
import { seekStep } from '../src/game/pursuit.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('pursuit no-bounce');
const open = () => false;

test('scheduled townsfolk stop near their target instead of standing exactly on it', () => {
  const n = seekStep({ x: 0, y: 0 }, { x: 12, y: 0 }, 40, 1, open);
  assert(n.x === 0 && n.y === 0, 'slow schedule movement kept chasing a nearby target');
});

test('scheduled townsfolk approach but settle short of a far target', () => {
  const n = seekStep({ x: 0, y: 0 }, { x: 100, y: 0 }, 40, 10, open);
  assert(n.x === 82 && n.y === 0, 'slow schedule movement did not settle 18 pixels short: ' + JSON.stringify(n));
});

test('pursuers still close all the way', () => {
  const n = seekStep({ x: 0, y: 0 }, { x: 12, y: 0 }, 54, 1, open);
  assert(n.x === 12 && n.y === 0, 'pursuit stopped short: ' + JSON.stringify(n));
});

if (fail) {
  console.error('\n' + fail + ' no-bounce pursuit test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('no-bounce pursuit tests passed: ' + pass);

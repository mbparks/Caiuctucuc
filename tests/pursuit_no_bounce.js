// Regression tests for doorway bounce and NPC stacking behavior.
import { seekStep } from '../src/game/pursuit.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

console.log('pursuit no-bounce');
const open = () => false;

test('scheduled townsfolk move off exact doorway targets', () => {
  const target = { x: 12, y: 0 };
  const n = seekStep({ name: 'doyle', x: 12, y: 0, props: { npcId: 'doyle' } }, target, 40, 1, open);
  assert(dist(n, target) > 1, 'slow schedule movement remained on the exact target');
});

test('scheduled townsfolk sharing a target choose separate standing spots', () => {
  const target = { x: 100, y: 100 };
  const a = seekStep({ name: 'doyle', x: 100, y: 100, props: { npcId: 'doyle' } }, target, 40, 10, open);
  const b = seekStep({ name: 'beall', x: 100, y: 100, props: { npcId: 'beall' } }, target, 40, 10, open);
  assert(dist(a, b) > 14, 'shared scheduled target collapsed into a stack: ' + JSON.stringify({ a, b }));
});

test('scheduled townsfolk do not require exact-pixel arrival', () => {
  const target = { x: 100, y: 0 };
  const n = seekStep({ name: 'ward', x: 0, y: 0, props: { npcId: 'ward' } }, target, 40, 10, open);
  assert(dist(n, target) > 2, 'scheduled movement still tried to occupy the original target exactly');
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

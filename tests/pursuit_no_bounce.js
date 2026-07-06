// Regression tests for doorway bounce and NPC stacking behavior.
import { seekStep, resetCrowdMemory } from '../src/game/pursuit.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { resetCrowdMemory(); fn(); pass++; console.log('  ok  ' + name); }
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
  assert(dist(a, b) > 18, 'shared scheduled target collapsed into a stack: ' + JSON.stringify({ a, b }));
});

test('scheduled townsfolk hold still after they are near a doorway spot', () => {
  const target = { x: 160, y: 80 };
  const mover = { name: 'doyle', x: 160, y: 120, home: { x: 160, y: 120 }, props: { npcId: 'doyle' } };
  let current = { ...mover };
  for (let frame = 0; frame < 12; frame++) {
    const next = seekStep(current, target, 40, 0.2, open);
    assert(dist(next, current) < 0.01, 'settled NPC drifted on frame ' + frame + ': ' + JSON.stringify({ next, current }));
    current = { ...current, x: next.x, y: next.y };
  }
});

test('scheduled townsfolk settle instead of taking tiny corrective doorway steps', () => {
  const target = { x: 160, y: 80 };
  const alreadyNearLane = { name: 'beall', x: 128, y: 152, home: { x: 160, y: 120 }, props: { npcId: 'beall' } };
  const next = seekStep(alreadyNearLane, target, 40, 0.2, open);
  assert(dist(next, alreadyNearLane) < 0.01, 'nearby scheduled NPC should settle, not pace: ' + JSON.stringify({ next, alreadyNearLane }));
});

test('door cleaner nudge does not get pulled back next frame', () => {
  const doorTarget = { x: 320, y: 160 };
  const cleanedOffDoorway = { name: 'doyle', x: 336, y: 176, home: { x: 320, y: 160 }, props: { npcId: 'doyle' } };
  const next = seekStep(cleanedOffDoorway, doorTarget, 40, 0.16, open);
  assert(dist(next, cleanedOffDoorway) < 0.01, 'schedule pulled NPC back toward doorway after cleanup: ' + JSON.stringify({ next, cleanedOffDoorway }));
});

test('separation respects collision while townsfolk are moving', () => {
  const wall = (px, py) => px < 90 || py < 90;
  const target = { x: 180, y: 180 };
  const a = seekStep({ name: 'a', x: 100, y: 100, props: { npcId: 'a' } }, target, 40, 1, wall);
  const b = seekStep({ name: 'b', x: 100, y: 100, props: { npcId: 'b' } }, target, 40, 1, wall);
  assert(a.x >= 90 && a.y >= 90 && b.x >= 90 && b.y >= 90, 'separation shoved an NPC into collision: ' + JSON.stringify({ a, b }));
});

test('scheduled townsfolk do not require exact-pixel arrival', () => {
  const target = { x: 100, y: 0 };
  const n = seekStep({ name: 'ward', x: 0, y: 0, props: { npcId: 'ward' } }, target, 40, 10, open);
  assert(dist(n, target) > 2, 'scheduled movement still tried to occupy the original target exactly');
});

test('pursuers still close all the way', () => {
  const n = seekStep({ x: 0, y: 0, props: { npcId: 'pursuer' } }, { x: 12, y: 0 }, 54, 1, open);
  assert(n.x === 12 && n.y === 0, 'pursuit stopped short: ' + JSON.stringify(n));
});

if (fail) {
  console.error('\n' + fail + ' no-bounce pursuit test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('no-bounce pursuit tests passed: ' + pass);

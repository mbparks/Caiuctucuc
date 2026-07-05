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

function closestPair(list) {
  let best = Infinity;
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) best = Math.min(best, dist(list[i], list[j]));
  return best;
}

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

test('live crowd separation breaks a tavern doorway clump', () => {
  const target = { x: 160, y: 80 };
  const movers = ['doyle', 'beall', 'cresap', 'gantt', 'ward'].map((id, i) => ({
    name: id,
    x: 160 + (i % 2),
    y: 120 + (i % 2),
    home: { x: 160, y: 120 },
    props: { npcId: id }
  }));
  let positions = movers.map(m => seekStep(m, target, 40, 0.2, open));
  for (let frame = 0; frame < 8; frame++) {
    positions = positions.map((p, i) => seekStep({ ...movers[i], x: p.x, y: p.y }, target, 40, 0.2, open));
  }
  assert(closestPair(positions) > 17, 'NPCs still form an interaction-blocking clump: ' + JSON.stringify(positions));
});

test('scheduled townsfolk settle instead of taking tiny corrective doorway steps', () => {
  const target = { x: 160, y: 80 };
  const alreadyNearLane = { name: 'beall', x: 128, y: 152, home: { x: 160, y: 120 }, props: { npcId: 'beall' } };
  const next = seekStep(alreadyNearLane, target, 40, 0.2, open);
  assert(dist(next, alreadyNearLane) < 0.01, 'nearby scheduled NPC should settle, not pace: ' + JSON.stringify({ next, alreadyNearLane }));
});

test('separation respects collision and does not shove into walls', () => {
  const wall = (px, py) => px < 90 || py < 90;
  const target = { x: 120, y: 120 };
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

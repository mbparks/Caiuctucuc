// Trail model tests. Run through npm test.
import { newGame } from '../src/game/save.js';
import { phaseFor, pressureFor, trailFor, TRAIL_MODEL_VERSION } from '../src/game/trail.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('trail model v' + TRAIL_MODEL_VERSION);

test('new game starts on the arrival trail', () => {
  const s = newGame();
  const t = trailFor(s);
  assert(phaseFor(s) === 'arrival', 'wrong phase');
  assert(t.objective.includes('Learn the town'), 'weak opening objective');
  assert(t.steps.length >= 3, 'not enough short steps');
});

test('hired by Beall exposes the three trails', () => {
  const s = newGame();
  s.flags.hiredByBeall = true;
  const t = trailFor(s);
  assert(t.phase === 'three_trails', 'wrong phase: ' + t.phase);
  assert(t.steps.some(x => x.includes('surgery')), 'missing surgery trail');
  assert(t.steps.some(x => x.includes('quarry')), 'missing quarry trail');
});

test('act two points at Kent and accusation play', () => {
  const s = newGame();
  s.flags.act2Complete = true;
  const t = trailFor(s);
  assert(t.phase === 'accuse', 'wrong phase: ' + t.phase);
  assert(t.target.includes('Courthouse'), 'wrong target');
  assert(t.steps.some(x => x.includes('culprit') || x.includes('proof')), 'missing deduction step');
});

test('pressure notes react to low health and heat', () => {
  const s = newGame();
  s.player.health = 2;
  s.hueCry.level = 3;
  const p = pressureFor(s).join(' ');
  assert(p.includes('Health is low'), 'missing health pressure');
  assert(p.includes('constable'), 'missing heat pressure');
});

if (fail) {
  console.error('\n' + fail + ' trail test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('trail tests passed: ' + pass);

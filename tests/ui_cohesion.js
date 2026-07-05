// UI cohesion contract tests. These guard the unified skin and boot order.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('ui cohesion');
const skin = readFileSync('src/ui_cohesion.js', 'utf8');
const boot = readFileSync('src/boot.js', 'utf8');

test('cohesive skin covers the major bolted-on surfaces', () => {
  for (const selector of ['#trailPulse', '#trailDeck', '.world-modal', '#panel', '#dialog', '#journal', '#dreadPip']) {
    assert(skin.includes(selector), 'missing selector ' + selector);
  }
});

test('cohesive skin defines shared UI tokens', () => {
  for (const token of ['--ui-bg', '--ui-line', '--ui-paper', '--ui-shadow']) {
    assert(skin.includes(token), 'missing token ' + token);
  }
});

test('boot imports cohesion after gameplay and world expansion modules', () => {
  const a = boot.indexOf("import('./gameplay_boost.js')");
  const b = boot.indexOf("import('./world_expansion.js')");
  const c = boot.indexOf("import('./ui_cohesion.js')");
  assert(a > 0 && b > a && c > b, 'ui cohesion is not loaded last');
});

if (fail) {
  console.error('\n' + fail + ' ui cohesion test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('ui cohesion tests passed: ' + pass);

// Command center tests: one command structure, no duplicate canvas command menu.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('command center');
const center = readFileSync('src/command_center.js', 'utf8');
const boot = readFileSync('src/boot.js', 'utf8');
const render = readFileSync('src/render_integrity.js', 'utf8');

test('command center preserves immediate keyboard actions', () => {
  for (const code of ['KeyE', 'KeyF', 'KeyI', 'KeyQ']) assert(center.includes(code), 'missing action ' + code);
  for (const label of ['Use / Talk', 'Rob / Crime', 'Satchel', 'Surrender']) assert(center.includes(label), 'missing label ' + label);
});

test('command center moves existing feature buttons rather than duplicating them', () => {
  for (const id of ['trailBtn', 'caseBtn', 'worldBtn', 'lawBtn', 'dreadPip', 'fullBtn', 'muteBtn', 'menuBtn']) {
    assert(center.includes("move('" + id + "')"), 'missing moved button ' + id);
  }
});

test('canvas command prompt is suppressed', () => {
  assert(render.includes("E TALK  F ROB  I SATCHEL  J CASE"), 'duplicate canvas command text not suppressed');
  assert(render.includes('patchedFillText'), 'fillText suppression patch missing');
});

test('command center loads after world expansion and UI cohesion', () => {
  const world = boot.indexOf("import('./world_expansion.js')");
  const ui = boot.indexOf("import('./ui_cohesion.js')");
  const cc = boot.indexOf("import('./command_center.js')");
  assert(world > 0 && ui > world && cc > ui, 'command center must load after feature UI and cohesion skin');
});

if (fail) {
  console.error('\n' + fail + ' command center test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('command center tests passed: ' + pass);

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
const overlay = readFileSync('src/ui_overlay_manager.js', 'utf8');

test('command center preserves immediate keyboard actions', () => {
  for (const code of ['KeyE', 'KeyF', 'KeyI', 'KeyQ']) assert(center.includes(code), 'missing action ' + code);
  for (const label of ['Use / Talk', 'Rob / Crime', 'Satchel', 'Surrender']) assert(center.includes(label), 'missing label ' + label);
});

test('command center moves existing feature buttons rather than duplicating them', () => {
  for (const id of ['trailBtn', 'caseBtn', 'worldBtn', 'lawBtn', 'dreadPip', 'fullBtn', 'muteBtn', 'menuBtn']) {
    assert(center.includes("move('" + id + "')"), 'missing moved button ' + id);
  }
});

test('command drawer is temporary and does not push the HUD layout', () => {
  assert(center.includes('position: absolute'), 'command drawer should not expand the header layout');
  assert(center.includes('max-height'), 'command drawer should be scrollable instead of covering everything');
  assert(center.includes('closeCommands();'), 'command drawer should close before launching actions');
  assert(center.includes("e.key === 'Escape'"), 'Escape close behavior missing');
  assert(center.includes('pointerdown'), 'outside-click close behavior missing');
});

test('one-overlay manager closes competing feature panels', () => {
  for (const selector of ['#panel', '#menu', '#journal', '#trailDeck', '#term', '.world-modal']) {
    assert(overlay.includes(selector), 'overlay manager missing ' + selector);
  }
  assert(overlay.includes('window.CAIUCTUCUC_CLOSE_OVERLAYS'), 'global overlay close hook missing');
  assert(overlay.includes("['KeyT', 'KeyI', 'KeyJ']"), 'keyboard overlay cleanup missing');
  assert(center.includes('CAIUCTUCUC_CLOSE_OVERLAYS'), 'command center does not call overlay manager');
});

test('canvas command prompt is suppressed', () => {
  assert(render.includes("E TALK  F ROB  I SATCHEL  J CASE"), 'duplicate canvas command text not suppressed');
  assert(render.includes('patchedFillText'), 'fillText suppression patch missing');
});

test('overlay manager loads before command center', () => {
  const world = boot.indexOf("import('./world_expansion.js')");
  const ui = boot.indexOf("import('./ui_cohesion.js')");
  const om = boot.indexOf("import('./ui_overlay_manager.js')");
  const cc = boot.indexOf("import('./command_center.js')");
  assert(world > 0 && ui > world && om > ui && cc > om, 'overlay manager must load before command center');
});

if (fail) {
  console.error('\n' + fail + ' command center test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('command center tests passed: ' + pass);

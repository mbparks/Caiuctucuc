// Storage control tests: users need a visible way to clear app localStorage.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('storage control');
const boot = readFileSync('src/boot.js', 'utf8');
const storage = readFileSync('src/storage_control.js', 'utf8');

test('storage control adds a visible menu button', () => {
  assert(storage.includes('clearStorageBtn'), 'clear storage button id missing');
  assert(storage.includes('Clear local storage'), 'clear storage button label missing');
  assert(storage.includes('menu.insertBefore'), 'button should be inserted into the menu');
});

test('clear storage uses a deliberate two-press confirmation', () => {
  assert(storage.includes('Clear everything?'), 'confirmation label missing');
  assert(storage.includes('armed'), 'two-press arm flag missing');
  assert(storage.includes('setTimeout'), 'confirmation should expire');
});

test('clear storage removes only app namespaced browser keys', () => {
  assert(storage.includes("APP_KEY_PREFIXES = ['caiuctucuc']"), 'app key namespace missing');
  assert(storage.includes('key.startsWith(prefix)'), 'storage clear must be namespace-scoped');
  assert(storage.includes('localStorage'), 'localStorage clear missing');
  assert(storage.includes('sessionStorage'), 'sessionStorage app-state clear missing');
  assert(!storage.includes('localStorage.clear()'), 'must not clear unrelated site storage');
});

test('storage control loads after the main UI modules', () => {
  const main = boot.indexOf("import('./main.js')");
  const storageImport = boot.indexOf("import('./storage_control.js')");
  assert(main > 0 && storageImport > main, 'storage control must load after main creates the menu and toast');
});

if (fail) {
  console.error('\n' + fail + ' storage control test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('storage control tests passed: ' + pass);

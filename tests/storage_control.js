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
const moduleOrder = name => boot.indexOf("loadModule('./" + name + "')");

test('storage control adds a visible menu button', () => {
  assert(storage.includes('clearStorageBtn'), 'button id missing');
  assert(storage.includes('Clear local storage'), 'button label missing');
  assert(storage.includes('menu.insertBefore'), 'button should be inserted into the menu');
});

test('clear storage uses deliberate confirmation', () => {
  assert(storage.includes('Clear everything?'), 'confirmation label missing');
  assert(storage.includes('armed'), 'arm flag missing');
  assert(storage.includes('setTimeout'), 'confirmation should expire');
});

test('clear storage is namespace-scoped', () => {
  assert(storage.includes("APP_KEY_PREFIXES = ['caiuctucuc']"), 'app key namespace missing');
  assert(storage.includes('key.startsWith(prefix)'), 'namespace check missing');
  assert(storage.includes('localStorage'), 'local storage removal missing');
  assert(storage.includes('sessionStorage'), 'session state removal missing');
});

test('storage control loads after main', () => {
  const main = moduleOrder('main.js');
  const storageImport = moduleOrder('storage_control.js');
  assert(main > 0 && storageImport > main, 'storage control must load after main creates the menu and toast');
});

if (fail) {
  console.error('\n' + fail + ' storage control test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('storage control tests passed: ' + pass);

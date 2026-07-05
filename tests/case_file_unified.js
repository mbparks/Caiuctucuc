// Unified Case File tests: Case Board content must live inside Case File.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('unified case file');
const boot = readFileSync('src/boot.js', 'utf8');
const world = readFileSync('src/world_expansion.js', 'utf8');
const unified = readFileSync('src/case_file_unified.js', 'utf8');
const command = readFileSync('src/command_center.js', 'utf8');

test('standalone Case Board modal is retired', () => {
  assert(!world.includes('showCase'), 'world expansion should not define a separate Case Board modal');
  assert(!world.includes("modal('caseModal'"), 'caseModal should not be created as a separate surface');
  assert(!world.includes("'CASE BOARD'"), 'visible Case Board modal title should be gone');
});

test('case button opens the unified Case File', () => {
  assert(world.includes("el('button', '', 'Case File')"), 'case button should be labeled Case File');
  assert(world.includes('caiuctucuc:open-case-file'), 'case button should dispatch unified Case File event');
  assert(command.includes("move('caseBtn')"), 'Commands must preserve the Case File button by moving caseBtn');
});

test('Case File receives a Board tab with old board content', () => {
  assert(unified.includes("data-tab=\"board\""), 'Board tab markup missing');
  for (const name of ['boardThreads', 'openLeads', 'trialReadiness', 'contradictions', 'supernaturalTruths', 'legalProof']) {
    assert(unified.includes(name), 'unified file missing board function ' + name);
  }
  for (const label of ['Contradictions', 'Legal proof', 'True but not proof', 'Accusation logic', 'Open leads']) {
    assert(unified.includes(label), 'unified board section missing ' + label);
  }
});

test('unified Case File loads after command center', () => {
  const cc = boot.indexOf("import('./command_center.js')");
  const cf = boot.indexOf("import('./case_file_unified.js')");
  assert(cc > 0 && cf > cc, 'unified Case File must load after command center moves the button');
});

if (fail) {
  console.error('\n' + fail + ' unified Case File test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('unified Case File tests passed: ' + pass);

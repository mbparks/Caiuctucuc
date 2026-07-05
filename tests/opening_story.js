// Opening story tests: postcard must be followed by backstory before control returns.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('opening story');
const boot = readFileSync('src/boot.js', 'utf8');
const story = readFileSync('src/opening_story.js', 'utf8');
const moduleOrder = name => boot.indexOf("loadModule('./" + name + "')");

test('opening story loads between render guard and main game', () => {
  const render = moduleOrder('render_integrity.js');
  const opening = moduleOrder('opening_story.js');
  const main = moduleOrder('main.js');
  assert(render > 0 && opening > render && main > opening, 'opening story must load before main to observe the splash flow');
});

test('opening story follows the postcard even when a save exists', () => {
  assert(!story.includes('localStorage.getItem(SAVE_KEY)'), 'opening story must not skip just because localStorage has a save');
  assert(story.includes("document.getElementById('splash')"), 'opening story must attach to postcard splash');
  assert(story.includes("splash.classList.contains('gone')"), 'opening story must wait for postcard dismissal');
  assert(story.includes('getComputedStyle(splash).display'), 'opening story should catch already-hidden splash state');
  assert(story.includes('setTimeout(maybeShowStory, 900)'), 'opening story should retry after main has manipulated the splash');
});

test('opening story defers creator until story is continued', () => {
  assert(story.includes("WHO WALKS INTO CUMBERLAND"), 'creator panel detection missing');
  assert(story.includes('deferredCreator'), 'creator deferral flag missing');
  assert(story.includes("panel.classList.remove('open')"), 'creator should be hidden while story is open');
  assert(story.includes("if (deferredCreator) panel.classList.add('open')"), 'creator should reopen only if it was deferred');
});

test('opening story explains the game thesis', () => {
  for (const phrase of ['This is a murder mystery and a haunting', 'The human crime can be proven', 'ordinary greed', 'Constable Beall']) {
    assert(story.includes(phrase), 'missing story phrase: ' + phrase);
  }
});

if (fail) {
  console.error('\n' + fail + ' opening story test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('opening story tests passed: ' + pass);

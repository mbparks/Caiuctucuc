// Opening story tests: new games must see postcard, then backstory, then creator.
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

test('opening story loads between render guard and main game', () => {
  const render = boot.indexOf("import('./render_integrity.js')");
  const opening = boot.indexOf("import('./opening_story.js')");
  const main = boot.indexOf("import('./main.js')");
  assert(render > 0 && opening > render && main > opening, 'opening story must load before main to observe the splash flow');
});

test('opening story is new-game only and follows the postcard', () => {
  assert(story.includes("localStorage.getItem(SAVE_KEY)"), 'opening story must skip existing saves');
  assert(story.includes("document.getElementById('splash')"), 'opening story must attach to postcard splash');
  assert(story.includes("splash.classList.contains('gone')"), 'opening story must wait for postcard dismissal');
  assert(story.includes('setTimeout(showStory, 680)'), 'opening story should appear after the postcard fade');
});

test('opening story defers creator until story is continued', () => {
  assert(story.includes("WHO WALKS INTO CUMBERLAND"), 'creator panel detection missing');
  assert(story.includes('deferredCreator'), 'creator deferral flag missing');
  assert(story.includes("panel.classList.remove('open')"), 'creator should be hidden while story is open');
  assert(story.includes("panel.classList.add('open')"), 'creator should reopen after story continues');
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

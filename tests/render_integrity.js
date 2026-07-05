// Render integrity tests: prevent subpixel tile seams and visible stage grid artifacts.
import { readFileSync } from 'node:fs';
import { createCamera } from '../src/engine/camera.js';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('render integrity');
const boot = readFileSync('src/boot.js', 'utf8');
const guard = readFileSync('src/render_integrity.js', 'utf8');

test('camera follows on integer pixels only', () => {
  const cam = createCamera(301, 211, 1000, 1000);
  cam.follow(123.4, 456.7);
  assert(Number.isInteger(cam.x), 'camera x is fractional: ' + cam.x);
  assert(Number.isInteger(cam.y), 'camera y is fractional: ' + cam.y);
});

test('render integrity loads before main game', () => {
  const r = boot.indexOf("import('./render_integrity.js')");
  const m = boot.indexOf("import('./main.js')");
  assert(r > 0 && m > r, 'render integrity must load before main');
});

test('stage grid is explicitly disabled', () => {
  assert(guard.includes('background-image: none !important'), 'stage grid override missing');
  assert(guard.includes('image-rendering: pixelated'), 'pixelated canvas rendering missing');
});

test('canvas draw calls are snapped', () => {
  assert(guard.includes('patchedDrawImage'), 'drawImage patch missing');
  assert(guard.includes('patchedFillRect'), 'fillRect patch missing');
  assert(guard.includes('Math.round'), 'snap-to-pixel rounding missing');
});

if (fail) {
  console.error('\n' + fail + ' render integrity test(s) failed, ' + pass + ' passed.');
  process.exit(1);
}
console.log('render integrity tests passed: ' + pass);

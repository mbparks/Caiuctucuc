// Headless boot: jsdom shell, recording canvas, real main.js.
// Simulates standing at the store's exit door, pressing E, and walking
// into town, then reports every player-sheet draw with its coordinates.
import { readFileSync } from 'node:fs';
import zlib from 'node:zlib';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost:8000/', pretendToBeVisual: false });
const { window } = dom;

// ---- recording 2d context ----
const frames = { game: [], dark: [] };
function makeCtx(tag) {
  const log = frames[tag];
  const noop = () => {};
  const ctx = {
    canvas: null,
    fillStyle: '#000', strokeStyle: '#000', globalAlpha: 1, font: '',
    textBaseline: 'top', imageSmoothingEnabled: false, globalCompositeOperation: 'source-over',
    save: noop, restore: noop, beginPath: noop, closePath: noop, clip: noop,
    rect: noop, arc: noop, fill: noop, stroke: noop, strokeRect: noop,
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop }),
    clearRect: noop, fillText: noop, translate: noop, scale: noop,
    fillRect(x, y, w, h) {
      // frame delimiter: only the opaque black background clear starts a frame,
      // not translucent overlays (vignette, tints) that also cover the canvas
      if (tag === 'game' && x === 0 && y === 0 && w === 480 && h === 320
          && this.fillStyle === '#000') log.push([]);
    },
    drawImage(img, ...a) {
      if (!log.length) log.push([]);
      log[log.length - 1].push({ src: (img && img.__src) || '<canvas>', a });
    }
  };
  return ctx;
}
let canvasCount = 0;
window.HTMLCanvasElement.prototype.getContext = function () {
  const tag = this.id === 'game' ? 'game' : 'dark';
  const ctx = makeCtx(tag);
  ctx.canvas = this;
  return ctx;
};

// ---- Image that reads PNG headers from disk ----
class FakeImage {
  set src(v) {
    this.__src = v;
    try {
      const buf = readFileSync(join(ROOT, v));
      this.width = buf.readUInt32BE(16);
      this.height = buf.readUInt32BE(20);
      queueMicrotask(() => this.onload && this.onload());
    } catch {
      queueMicrotask(() => this.onerror && this.onerror());
    }
  }
}

// ---- fetch from disk ----
async function fakeFetch(path) {
  const body = readFileSync(join(ROOT, path), 'utf8');
  return { ok: true, status: 200, json: async () => JSON.parse(body), text: async () => body };
}

// ---- rAF pump ----
let rafCb = null;
window.requestAnimationFrame = cb => { rafCb = cb; return 1; };
let now = 0;
async function pump(n) {
  for (let i = 0; i < n; i++) {
    now += 16;
    const cb = rafCb; rafCb = null;
    if (cb) cb(now);
    await new Promise(r => setTimeout(r, 0));
  }
}

class FakeAudioNode { connect(n) { return n; } start() {} stop() {} }
class FakeAudioCtx {
  constructor() { this.currentTime = 0; this.destination = new FakeAudioNode(); this.sampleRate = 44100; }
  createGain() { const n = new FakeAudioNode(); n.gain = { value: 0, setValueAtTime(){}, exponentialRampToValueAtTime(){} }; return n; }
  createOscillator() { const n = new FakeAudioNode(); n.type = ''; n.frequency = { value: 0, setValueAtTime(){}, exponentialRampToValueAtTime(){} }; return n; }
  createBiquadFilter() { const n = new FakeAudioNode(); n.type = ''; n.frequency = { value: 0 }; return n; }
  createBufferSource() { const n = new FakeAudioNode(); n.buffer = null; n.loop = false; return n; }
  createBuffer(ch, len, rate) { return { getChannelData: () => new Float32Array(len) }; }
  resume() { return Promise.resolve(); }
}

// ---- globals main.js expects ----
globalThis.window = window;
globalThis.document = window.document;
globalThis.location = window.location;
globalThis.localStorage = window.localStorage;
globalThis.Image = FakeImage;
globalThis.fetch = fakeFetch;
globalThis.requestAnimationFrame = window.requestAnimationFrame;
globalThis.AudioContext = FakeAudioCtx;
globalThis.setInterval = () => 0;
window.setInterval = globalThis.setInterval;
globalThis.alert = msg => { throw new Error('ALERT: ' + msg); };
window.alert = globalThis.alert;
window.AudioContext = FakeAudioCtx;

// ---- a save standing on the store's exit door ----
const { newGame, serialize } = await import(join(ROOT, 'src/game/save.js'));
const s = newGame();
s.map = 'int_store';
s.player.x = 112; s.player.y = 144;   // the exit door
s.clock = { day: 2, hour: 14 };        // daylight, no darkness in the way
window.localStorage.setItem('caiuctucuc_save_v1', serialize(s));
// the key name is read from save.js to be safe
const saveSrc = readFileSync(join(ROOT, 'src/game/save.js'), 'utf8');
const keyMatch = saveSrc.match(/SAVE_KEY = '([^']+)'/);
if (keyMatch) window.localStorage.setItem(keyMatch[1], serialize(s));

await import(join(ROOT, 'src/main.js'));
await new Promise(r => setTimeout(r, 20));
await pump(4);

function lastFramePlayerDraws(tag = 'game') {
  const fs = frames[tag];
  if (!fs.length) return { frame: -1, draws: [] };
  const last = fs[fs.length - 1];
  return { frame: fs.length - 1, draws: last.filter(d => d.src.includes('player_')) };
}
function lastFrameTileSample() {
  const fs = frames.game;
  const last = fs[fs.length - 1] || [];
  return last.filter(d => d.src.includes('tileset')).slice(0, 3).map(d => d.a);
}

console.log('IN THE STORE, frame count:', frames.game.length);
console.log('  player draws:', JSON.stringify(lastFramePlayerDraws().draws));
console.log('  tile sample dest coords:', JSON.stringify(lastFrameTileSample()));

// press E on the door
window.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'KeyE', bubbles: true }));
await new Promise(r => setTimeout(r, 30));
await pump(6);

const after = lastFramePlayerDraws();
let failures = 0;
function check(cond, msg) { if (!cond) { console.error('  FAIL ' + msg); failures++; } else console.log('  ok  ' + msg); }
check(after.draws.length === 1, 'the player is drawn exactly once after exiting a building');
if (after.draws.length) {
  const [, , , , dx, dy] = after.draws[0].a;
  check(dx >= 0 && dx <= 480 - 16, 'the player sits inside the viewport horizontally (x=' + dx + ')');
  check(dy >= 0 && dy <= 320, 'the player sits inside the viewport vertically (y=' + dy + ')');
}
const lastAll = frames.game[frames.game.length - 1] || [];
check(lastAll.some(d => d.src.includes('tileset')), 'the town ground is drawn after exit');

// ---- silhouette uniqueness: decode each sprite's frame-0 alpha, compare shapes ----
function decodeAlphaShape(path) {
  const buf = readFileSync(join(ROOT, path));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  let p = 8; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    if (type === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + len));
    p += 12 + len;
    if (type === 'IEND') break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4, stride = w * bpp + 1;
  const out = Buffer.alloc(w * h * bpp);
  for (let y = 0; y < h; y++) {
    const filter = raw[y * stride];
    for (let x = 0; x < w * bpp; x++) {
      const rb = raw[y * stride + 1 + x];
      const a = x >= bpp ? out[y * w * bpp + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * w * bpp + x] : 0;
      const c = (x >= bpp && y > 0) ? out[(y - 1) * w * bpp + x - bpp] : 0;
      let v = rb;
      if (filter === 1) v = (rb + a) & 255;
      else if (filter === 2) v = (rb + b) & 255;
      else if (filter === 3) v = (rb + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v = (rb + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
      out[y * w * bpp + x] = v;
    }
  }
  let sig = '';
  for (let y = 0; y < h; y++)
    for (let x = 0; x < 16; x++)
      sig += out[(y * w + x) * bpp + 3] > 0 ? '1' : '0';
  return sig;
}
{
  const roster = ['player_drover', 'player_frock', 'player_preacher', 'npc_doyle', 'npc_cresap',
    'npc_ward', 'npc_feig', 'npc_gantt', 'npc_rood', 'npc_mcteague', 'npc_coombs', 'npc_fenwick',
    'npc_shanks', 'npc_bright', 'npc_beall', 'npc_brahm', 'npc_pyle'];
  const seen = new Map();
  let clones = 0;
  for (const n of roster) {
    const sig = decodeAlphaShape('assets/sprites/' + n + '.png');
    if (seen.has(sig)) { console.error('  FAIL ' + n + ' shares a silhouette with ' + seen.get(sig)); clones++; }
    else seen.set(sig, n);
  }
  if (clones === 0) console.log('  ok  all ' + roster.length + ' character silhouettes are unique');
  failures += clones;
}

console.log(failures ? ('\nBOOT SMOKE: ' + failures + ' failed') : '\nBOOT SMOKE: all passed');
process.exit(failures ? 1 : 0);

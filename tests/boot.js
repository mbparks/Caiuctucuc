// The boot test: stub a browser, import main.js, run frames, and assert the
// game actually starts. Catches the class of failure node --check cannot.
import { readFileSync } from 'node:fs';

const alerts = [];
const rafQueue = [];
const elements = {};

function makeClassList() {
  const set = new Set();
  return {
    add: c => set.add(c), remove: c => set.delete(c),
    toggle: c => set.has(c) ? (set.delete(c), false) : (set.add(c), true),
    contains: c => set.has(c)
  };
}
function makeEl(id) {
  const el = {
    id, textContent: '', innerHTML: '', value: 'frontier', children: [],
    classList: makeClassList(), dataset: {}, style: {},
    width: 480, height: 320, files: [],
    listeners: {},
    addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
    setAttribute() {}, focus() {}, click() {},
    appendChild(c) { this.children.push(c); return c; },
    replaceChildren() { this.children = []; },
    getContext() {
      return new Proxy({}, { get: (t, k) => (k === 'canvas' ? el : () => {}) , set: () => true });
    }
  };
  return el;
}

globalThis.location = { search: '' };
globalThis.performance = { now: () => Date.now() };
globalThis.alert = m => alerts.push(String(m));
globalThis.requestAnimationFrame = cb => { rafQueue.push(cb); return rafQueue.length; };
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
})();
globalThis.window = {
  listeners: {},
  addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
  AudioContext: undefined
};
globalThis.document = {
  documentElement: { dataset: {} },
  getElementById: id => (elements[id] = elements[id] || makeEl(id)),
  createElement: tag => makeEl('anon-' + tag),
  addEventListener() {}
};
globalThis.Image = class {
  set src(_) { setTimeout(() => this.onload && this.onload(), 0); }
};
globalThis.Blob = class { constructor() {} };
globalThis.URL = { createObjectURL: () => 'blob:', revokeObjectURL: () => {} };
globalThis.fetch = async (path) => {
  try {
    const data = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
    return { ok: true, json: async () => JSON.parse(data), text: async () => data };
  } catch {
    return { ok: false, status: 404, json: async () => { throw new Error('404 ' + path); } };
  }
};

const fails = [];
try {
  await import('../src/main.js');
  await new Promise(r => setTimeout(r, 50));   // let start() settle

  if (!elements.version || !elements.version.textContent.startsWith('v'))
    fails.push('the version never reached the header: module died early');
  if (alerts.length)
    fails.push('start() alerted: ' + alerts[0]);
  if (!rafQueue.length)
    fails.push('the loop never started');
  if (!elements.panel || !elements.panel.classList.contains('open'))
    fails.push('the character creator never opened on a fresh start');

  // run a few frames
  let t = 16;
  for (let i = 0; i < 10 && rafQueue.length; i++) {
    const cb = rafQueue.shift();
    cb(t); t += 16;
  }
} catch (err) {
  fails.push('boot threw: ' + err.stack.split('\n').slice(0, 3).join(' | '));
}

if (fails.length) {
  console.error('BOOT FAILED');
  for (const f of fails) console.error('  ' + f);
  process.exit(1);
}
console.log('boot ok: version ' + elements.version.textContent + ', creator open, loop running');

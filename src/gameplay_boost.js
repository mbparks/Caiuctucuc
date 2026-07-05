import { loadLocal } from './game/save.js';
import { trailFor } from './game/trail.js';

const header = document.querySelector('header');
const menuBtn = document.getElementById('menuBtn');
const panel = document.getElementById('panel');
const journal = document.getElementById('journal');
const dialog = document.getElementById('dialog');
const wrap = document.getElementById('wrap');

const style = document.createElement('style');
style.textContent = `
  #trailBtn { border-color: var(--accent); }
  #trailPulse {
    margin: 0 .9rem .35rem;
    padding: .35rem .65rem;
    border: 1px solid rgba(154, 74, 50, .55);
    background: linear-gradient(90deg, rgba(154, 74, 50, .22), rgba(29, 26, 20, .74));
    color: var(--ink);
    font-size: .78rem;
    display: flex;
    gap: .65rem;
    align-items: center;
    justify-content: space-between;
  }
  #trailPulse b { color: var(--accent); letter-spacing: .12em; font-weight: normal; }
  #trailPulse span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  #trailPulse button { padding: .15rem .45rem; font-size: .75rem; white-space: nowrap; }
  #trailDeck {
    position: absolute;
    right: 1rem;
    top: 4.3rem;
    width: min(26rem, 92vw);
    max-height: 74vh;
    overflow: auto;
    z-index: 35;
    display: none;
    background: linear-gradient(180deg, #d8cdb0 0%, #c8ba98 100%);
    color: #24180f;
    border: 2px solid #4a3c28;
    box-shadow: 0 12px 36px rgba(0,0,0,.55);
  }
  #trailDeck.open { display: block; }
  #trailDeck .trail-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px solid #8a7a58;
    padding: .7rem .9rem .5rem;
  }
  #trailDeck h2 {
    margin: 0;
    color: #6a2a1a;
    font-size: .86rem;
    letter-spacing: .22em;
    font-weight: normal;
  }
  #trailDeck .close {
    background: #e6ddc4;
    color: #2a2118;
    border-color: #8a7a58;
  }
  #trailDeck .trail-body { padding: .8rem 1rem 1rem; }
  #trailDeck .label {
    color: #7a5a3a;
    letter-spacing: .16em;
    font-size: .68rem;
    margin-top: .85rem;
    text-transform: uppercase;
  }
  #trailDeck p { margin: .28rem 0 .5rem; line-height: 1.38; }
  #trailDeck ol { margin: .35rem 0 .6rem 1.2rem; padding: 0; }
  #trailDeck li { margin: .35rem 0; line-height: 1.35; }
  #trailDeck .pressure {
    border-left: 3px solid #8a2a1a;
    background: rgba(255,255,255,.22);
    padding: .45rem .55rem;
    margin: .4rem 0;
  }
  #boostToast {
    position: absolute;
    left: 50%;
    top: 6.4rem;
    transform: translateX(-50%);
    width: min(28rem, 88vw);
    z-index: 34;
    background: #1d1a14;
    color: var(--ink);
    border: 1px solid var(--accent);
    padding: .45rem .7rem;
    font-size: .82rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity .25s ease;
  }
  #boostToast.show { opacity: 1; }
  #panel.action-ack { box-shadow: 0 0 0 2px rgba(154,74,50,.7), 0 8px 30px rgba(0,0,0,.55); }
  @media (max-width: 640px) {
    header { flex-wrap: wrap; gap: .45rem; }
    #trailPulse { margin: 0 .5rem .25rem; align-items: flex-start; }
    #trailDeck { right: .5rem; left: .5rem; width: auto; top: 5.8rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    #boostToast { transition: none; }
  }
`;
document.head.appendChild(style);

const trailBtn = document.createElement('button');
trailBtn.id = 'trailBtn';
trailBtn.type = 'button';
trailBtn.textContent = 'Trail';
trailBtn.setAttribute('aria-expanded', 'false');
if (header && menuBtn) header.insertBefore(trailBtn, menuBtn);

const pulse = document.createElement('div');
pulse.id = 'trailPulse';
pulse.innerHTML = '<span><b>TRAIL</b> Loading the next lead...</span><button type="button">Open</button>';
if (wrap) wrap.insertBefore(pulse, document.getElementById('stage'));

const deck = document.createElement('div');
deck.id = 'trailDeck';
deck.setAttribute('role', 'dialog');
deck.setAttribute('aria-label', 'Trail');
deck.setAttribute('aria-hidden', 'true');
wrap.appendChild(deck);

const boostToast = document.createElement('div');
boostToast.id = 'boostToast';
boostToast.setAttribute('role', 'status');
boostToast.setAttribute('aria-live', 'polite');
wrap.appendChild(boostToast);

function readState() {
  try { return loadLocal(localStorage); }
  catch { return null; }
}

function esc(text) {
  return String(text || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function currentTrail() {
  const s = readState();
  if (!s) return {
    phase: 'creator',
    title: 'Choose Your Stranger',
    objective: 'Finish the character prompt, then use Trail any time you lose the thread.',
    why: 'A mystery needs friction, but not confusion. Trail keeps the next useful move visible.',
    target: 'Opening prompt',
    steps: ['Dismiss the splash.', 'Choose an origin, trade, and burden.', 'Press Walk in, then follow the first lead.'],
    pressure: [],
    payoff: 'You begin with a concrete reason to explore.'
  };
  return trailFor(s);
}

function renderPulse() {
  const t = currentTrail();
  pulse.querySelector('span').innerHTML = '<b>TRAIL</b> ' + esc(t.objective) + ' <span style="color:var(--dim)">Target: ' + esc(t.target) + '</span>';
}

function renderDeck() {
  const t = currentTrail();
  const pressure = t.pressure.length
    ? '<div class="label">Pressure</div>' + t.pressure.map(p => '<p class="pressure">' + esc(p) + '</p>').join('')
    : '';
  deck.innerHTML =
    '<div class="trail-head"><h2>THE TRAIL</h2><button class="close" type="button">Close</button></div>' +
    '<div class="trail-body">' +
    '<div class="label">Lead</div><p><b>' + esc(t.title) + '</b></p>' +
    '<div class="label">Do next</div><p>' + esc(t.objective) + '</p>' +
    '<div class="label">Why this matters</div><p>' + esc(t.why) + '</p>' +
    '<div class="label">Steps</div><ol>' + t.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' +
    pressure +
    '<div class="label">Payoff</div><p>' + esc(t.payoff) + '</p>' +
    '<p style="font-size:.78rem;color:#6a5a3a">Shortcut: T toggles this panel. J opens the full case file.</p>' +
    '</div>';
  deck.querySelector('.close').addEventListener('click', closeDeck);
}

function openDeck() {
  renderDeck();
  deck.classList.add('open');
  deck.setAttribute('aria-hidden', 'false');
  trailBtn.setAttribute('aria-expanded', 'true');
}

function closeDeck() {
  deck.classList.remove('open');
  deck.setAttribute('aria-hidden', 'true');
  trailBtn.setAttribute('aria-expanded', 'false');
}

function toggleDeck() { deck.classList.contains('open') ? closeDeck() : openDeck(); }

trailBtn.addEventListener('click', toggleDeck);
pulse.querySelector('button').addEventListener('click', openDeck);

document.addEventListener('keydown', e => {
  const tag = (e.target && e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
  if (e.code === 'KeyT') { e.preventDefault(); toggleDeck(); }
  if (e.code === 'Escape') closeDeck();
});

let boostTimer = null;
function showBoostToast(text) {
  boostToast.textContent = text;
  boostToast.classList.add('show');
  clearTimeout(boostTimer);
  boostTimer = setTimeout(() => boostToast.classList.remove('show'), 2600);
}

if (panel) {
  panel.addEventListener('click', e => {
    if (!(e.target instanceof HTMLButtonElement)) return;
    if (e.target.id === 'panelClose') return;
    panel.classList.add('action-ack');
    setTimeout(() => panel.classList.remove('action-ack'), 220);
    setTimeout(renderPulse, 160);
  }, true);
}

let lastPhase = null;
function tick() {
  const t = currentTrail();
  renderPulse();
  if (lastPhase && t.phase !== lastPhase) showBoostToast('New lead: ' + t.title);
  lastPhase = t.phase;
  if (deck.classList.contains('open')) renderDeck();
}

const whispers = [
  'A shutter clicks shut somewhere off Baltimore Street.',
  'The canal bell carries farther than it should.',
  'Somebody says your coat color too quietly, then stops.',
  'A dog barks once toward the mountain and thinks better of a second bark.',
  'The street is ordinary for almost a full minute. That is the worst part.'
];
let whisperClock = 0;
setInterval(() => {
  tick();
  whisperClock += 1;
  const blocked = deck.classList.contains('open') || (panel && panel.classList.contains('open')) ||
    (journal && journal.classList.contains('open')) || (dialog && dialog.classList.contains('open')) || document.hidden;
  if (!blocked && whisperClock > 55 && Math.random() < 0.18) {
    whisperClock = 0;
    showBoostToast(whispers[Math.floor(Math.random() * whispers.length)]);
  }
}, 1000);

tick();

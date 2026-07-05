window.__CAIUCTUCUC_BOOTED = true;
// CAIUCTUCUC entry point: the vertical slice on Baltimore Street.
import { VERSION } from './version.js';
import { createLoop } from './engine/loop.js';
import { createInput, isEditable } from './engine/input.js';
import { createCamera } from './engine/camera.js';
import { loadMap } from './engine/tiledmap.js';
import { newGame, storeLocal, loadLocal, serialize, deserialize } from './game/save.js';
import { ask } from './game/dialog.js';
import { addHeat, decay, LEVELS } from './game/huecry.js';
import { seekStep, caught } from './game/pursuit.js';
import { advance, periodFor } from './game/clock.js';
import { nextCoat, effectiveLevel, COATS } from './game/disguise.js';
import { spotFor, SCHEDULES } from './game/schedule.js';
import { createAmbience } from './engine/ambience.js';
import { loadArt, frameFor } from './engine/sprites.js';
import { fitScale, fmtHour, miniPos } from './engine/scale.js';
import { acceptJob, workJob, JOBS } from './game/jobs.js';
import { newRumor, knows } from './game/gossip.js';
import { applyTrust } from './game/trust.js';
import { addItem, removeItem, equip, toStash, fromStash, countOf, SATCHEL_SIZE } from './game/inventory.js';
import { wearItem, fieldRepair, restore, restoreFee } from './game/condition.js';
import { RECIPES, craft, canCraft } from './game/crafting.js';
import { buyPrice, sellPrice } from './game/economy.js';
import { advanceCase, cluesFromFlags, addClue, CLUES, evidenceScore, EVIDENCE, chooseEnding, adoptPet } from './game/quest.js';
import { verdict, witnessScore, kentScore, GUILTY_AT, HUNG_AT } from './game/trial.js';
import { applyCheat } from './game/cheats.js';
import { applyDeath } from './game/death.js';
import { buildCharacter, ORIGINS, TRADES, BURDENS } from './game/creator.js';
import { nextHint } from './game/hints.js';
import { wardedResolve } from './game/wisps.js';
import { attemptRank } from './game/sight.js';

const DEBUG = new URLSearchParams(location.search).has('debug');
const log = (...a) => { if (DEBUG) console.log('[caiuctucuc]', ...a); };

document.getElementById('version').textContent = 'v' + VERSION;

// ---- settings ----
const settings = JSON.parse(localStorage.getItem('caiuctucuc-settings') || '{"muted":false,"theme":"night"}');
function saveSettings() { localStorage.setItem('caiuctucuc-settings', JSON.stringify(settings)); }

const muteBtn = document.getElementById('muteBtn');
function reflectMute() {
  muteBtn.textContent = settings.muted ? 'Sound: off' : 'Sound: on';
  muteBtn.setAttribute('aria-pressed', String(settings.muted));
}
const ambience = createAmbience();
window.addEventListener('pointerdown', () => ambience.boot(), { once: true });
window.addEventListener('keydown', () => ambience.boot(), { once: true });
muteBtn.addEventListener('click', () => {
  settings.muted = !settings.muted; saveSettings(); reflectMute();
  ambience.setMuted(settings.muted);
});
reflectMute();
ambience.setMuted(settings.muted);

const themeBtn = document.getElementById('themeBtn');
function reflectTheme() {
  document.documentElement.dataset.theme = settings.theme === 'high-contrast' ? 'high-contrast' : '';
  themeBtn.textContent = settings.theme === 'high-contrast' ? 'High Contrast' : 'Night';
}
themeBtn.addEventListener('click', () => {
  settings.theme = settings.theme === 'high-contrast' ? 'night' : 'high-contrast';
  saveSettings(); reflectTheme();
});
reflectTheme();

const menu = document.getElementById('menu');
const menuBtn = document.getElementById('menuBtn');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

// ---- game state ----
let state = loadLocal(localStorage) || newGame();
let creatorOpen = !loadLocal(localStorage);
let splashOpen = false;
log('state loaded', state);

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([serialize(state)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'caiuctucuc-save.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
const importFile = document.getElementById('importFile');
document.getElementById('importBtn').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  try {
    state = deserialize(await importFile.files[0].text());
    storeLocal(state, localStorage);
    log('save imported');
  } catch (err) {
    alert('That save could not be read: ' + err.message);
  }
});

// ---- HUD ----
const hudHeat = document.getElementById('hudHeat');
const hudCoin = document.getElementById('hudCoin');
const hudClock = document.getElementById('hudClock');
const hudCoat = document.getElementById('hudCoat');
const hudHealth = document.getElementById('hudHealth');
function refreshHud() {
  const eff = effectiveLevel(state.hueCry, state.player.coat);
  hudHeat.textContent = LEVELS[eff].toUpperCase();
  hudHeat.dataset.hot = eff >= 2 ? '1' : '';
  hudHealth.textContent = '\u25c6'.repeat(state.player.health) + '\u25c7'.repeat(Math.max(0, state.player.maxHealth - state.player.health));
  hudHealth.title = state.player.health + ' of ' + state.player.maxHealth + ' hale';
  hudHeat.className = 'heat-' + effectiveLevel(state.hueCry, state.player.coat);
  hudCoin.textContent = state.player.coin + ' silver';
  hudClock.textContent = 'day ' + state.clock.day + ', ' + fmtHour(state.clock.hour);
  hudCoat.textContent = state.player.coat + ' coat';
}

// ---- toast ----
const toastEl = document.getElementById('toast');
let toastTimer = null;
const toastQueue = [];
function showToast(text, ms) {
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
    if (toastQueue.length) setTimeout(() => showToast(toastQueue.shift(), 5200), 350);
  }, ms);
}
function toast(text) {
  if (toastEl.classList.contains('show')) toastQueue.push(text);
  else showToast(text, 3600);
}

// ---- conversation ----
const dialogEl = document.getElementById('dialog');
const dialogName = document.getElementById('dialogName');
const dialogText = document.getElementById('dialogText');
const dialogWords = document.getElementById('dialogWords');
const dialogInput = document.getElementById('dialogInput');
const hintEl = document.getElementById('hint');

let allKeywords = [];
const dialogCache = {};
let talking = null;

async function loadDialog(npcId) {
  if (!(npcId in dialogCache)) {
    const res = await fetch('src/data/dialogs/' + npcId + '.json');
    dialogCache[npcId] = res.ok ? await res.json() : null;
  }
  return dialogCache[npcId];
}

function refreshWords() {
  dialogWords.replaceChildren();
  for (const k of state.keywordsLearned) {
    const b = document.createElement('button');
    b.textContent = k;
    b.addEventListener('click', () => askWord(k));
    dialogWords.appendChild(b);
  }
}

function askWord(word) {
  if (!talking || !word) return;
  const before = state.keywordsLearned.length;
  const result = ask(talking, word.toUpperCase(), state, allKeywords);
  state = result.state;
  dialogText.textContent = result.text;
  if (state.keywordsLearned.length !== before) refreshWords();
  if (state.flags.ritualOffered && !state.flags.brahmRitual && state.player.sight === 1) {
    closeDialog();
    openPanel('THE LISTENING', body => {
      const par = document.createElement('p');
      par.textContent = 'The widow\u2019s ritual will open the second door. The price is plain and paid in advance: a night of your memory, gone entire, and a small scar on what you are. She pays too. Say it plainly.';
      body.appendChild(par);
      row(body, '', '', [['I am certain', () => {
        state.flags.brahmRitual = true;
        state.flags.ritualScar = true;
        state.clock = advance(state.clock, 10);
        state.flags.sleepCount = (state.flags.sleepCount || 0) + 1;
        const r = attemptRank(state, 2);
        if (r.ok) {
          state = r.state;
          if (!state.flags.burdenSecondSight) {
            state.player.maxHealth = Math.max(6, state.player.maxHealth - 1);
            state.player.health = Math.min(state.player.health, state.player.maxHealth);
            toast('THE LISTENING. You wake in her garden at dusk with a day you will never get back and a quiet that is not quiet anymore. The graves have been talking this whole time.');
          } else {
            toast('THE LISTENING. For you the door was never fully shut, and it opens at a discount: the night is gone, but the scar finds nothing new to mark. Brahm looks at you and says only: "Your grandmother\u2019s eyes. I wondered."');
          }
        }
        panelEl.classList.remove('open');
        runCase(); refreshHud(); storeLocal(state, localStorage);
      }], ['Not tonight', () => {
        toast('She nods as if you passed a different test. "The door keeps."');
        panelEl.classList.remove('open');
      }]]);
    });
  }
  runCase();
  refreshHud();
  storeLocal(state, localStorage);
  dialogInput.value = '';
  dialogInput.focus();
}

function openDialog(dlg) {
  talking = dlg;
  dialogName.textContent = dlg.displayName;
  let greeting = dlg.greeting;
  const theft = (state.rumors || []).find(r => r.id === 'markettheft');
  if (theft && knows(dlg.npcId, theft, absHour(state.clock))) {
    if (dlg.npcId === 'beall') {
      greeting = 'The constable looks at your hands before your face. "Word came off the market quick. Mind yourself, stranger."';
    } else if (dlg.npcId === 'doyle') {
      greeting = 'Peg does not look up. "Word about the market got here before you did, friend. Everything comes to the Mule eventually." Then, as if the ledger just balanced: "Sit or ask."';
    }
  }
  dialogText.textContent = greeting;
  refreshWords();
  dialogEl.classList.add('open');
  hintEl.classList.remove('show');
  dialogInput.focus();
}

function closeDialog() {
  talking = null;
  dialogEl.classList.remove('open');
  document.getElementById('game').focus();
}

document.getElementById('dialogGo').addEventListener('click', () => askWord(dialogInput.value.trim()));
document.getElementById('dialogBye').addEventListener('click', closeDialog);
dialogInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') askWord(dialogInput.value.trim());
  if (e.key === 'Escape') closeDialog();
});

// ---- journal ----
const journalEl = document.getElementById('journal');
const journalBody = document.getElementById('journalBody');
function renderJournal() {
  const rep = state.reputation;
  const trustLines = Object.entries(state.trust)
    .map(([k, v]) => k + ': ' + (v >= 2 ? 'trusted' : v >= 1 ? 'known' : 'stranger'))
    .join(', ') || 'no one owes you their confidence yet';
  const jobLine = state.job
    ? JOBS[state.job.id].name + ' (' + JOBS[state.job.id].stages[state.job.stage] + ' next)'
    : 'none in hand';
  const byThread = {};
  for (const id of state.clues) {
    const c = CLUES[id];
    (byThread[c.thread] = byThread[c.thread] || []).push(c);
  }
  const caseHtml = Object.keys(byThread).length
    ? Object.entries(byThread).map(([t, cs]) =>
        '<p class="dim">' + t.toUpperCase() + '</p>' +
        cs.map(c => '<p><b>' + c.name + '.</b> ' + c.text + '</p>').join('')).join('')
    : '<p>No case yet. Cumberland is quiet, or pretending to be.</p>';
  journalBody.innerHTML =
    '<h3>THE TRAIL</h3><p>' + nextHint(state) + '</p>' +
    '<h3>THE CASE</h3>' + caseHtml +
    '<h3>WORDS</h3>' + state.keywordsLearned.map(k => '<span class="kw">' + k + '</span>').join('') +
    '<h3>STANDING</h3><p>town ' + rep.town + ', kirk ' + rep.kirk + ', hills ' + rep.hills + ', road ' + rep.road + '</p>' +
    '<h3>CONFIDENCES</h3><p>' + trustLines + '</p>' +
    '<h3>WORK</h3><p>' + jobLine + '</p>' +
    '<h3>THE HOUR</h3><p>day ' + state.clock.day + ', ' + fmtHour(state.clock.hour) + ', wearing the ' + state.player.coat + ' coat</p>';
}
window.addEventListener('keydown', e => {
  if (isEditable(e.target)) return;
  if (e.code === 'KeyJ' && !talking) {
    if (!journalEl.classList.contains('open')) renderJournal();
    journalEl.classList.toggle('open');
  }
  if (e.code === 'Escape') journalEl.classList.remove('open');
});

// ---- difficulty ----
for (const [id, key] of [['diffCombat', 'combat'], ['diffSurvival', 'survival'], ['diffHuecry', 'huecry']]) {
  const el = document.getElementById(id);
  el.addEventListener('change', () => {
    state.difficulty[key] = el.value;
    storeLocal(state, localStorage);
    toast('Difficulty is yours to set, always, no penalty: ' + key + ' is now ' + el.value + '.');
  });
}
function reflectDifficulty() {
  document.getElementById('diffCombat').value = state.difficulty.combat;
  document.getElementById('diffSurvival').value = state.difficulty.survival;
  document.getElementById('diffHuecry').value = state.difficulty.huecry;
}
reflectDifficulty();
const HUECRY_RATE = { lenient: 0.6, standard: 1, sharp: 1.6 };
function heatRate() { return HUECRY_RATE[state.difficulty.huecry] || 1; }

// ---- the case ----
function runCase() {
  state = cluesFromFlags(state);
  if (evidenceScore(state) >= 2 && !state.flags.caseStrong) state.flags.caseStrong = true;
  if (state.flags.beallHelped && !state.flags.beallHelpedApplied) {
    state = applyTrust(state, 'beall', 'promiseKept');
    state = applyTrust(state, 'beall', 'promiseKept');
    state.flags.beallHelpedApplied = true;
  }
  const r = advanceCase(state);
  state = r.state;
  for (const t of r.toasts) { toast(t); }
  if (r.toasts.length) storeLocal(state, localStorage);
}

// ---- action panel ----
const panelEl = document.getElementById('panel');
const panelTitle = document.getElementById('panelTitle');
const panelBody = document.getElementById('panelBody');
document.getElementById('panelClose').addEventListener('click', () => panelEl.classList.remove('open'));
function openPanel(title, build) {
  panelTitle.textContent = title;
  panelBody.replaceChildren();
  build(panelBody);
  panelEl.classList.add('open');
}
function row(body, label, note, buttons) {
  const div = document.createElement('div');
  div.className = 'row';
  const span = document.createElement('span');
  span.textContent = label;
  if (note) {
    const d = document.createElement('span');
    d.className = 'dim'; d.textContent = ' ' + note;
    span.appendChild(d);
  }
  div.appendChild(span);
  const right = document.createElement('span');
  for (const [text, fn] of buttons) {
    const b = document.createElement('button');
    b.textContent = text;
    b.addEventListener('click', fn);
    right.appendChild(b);
  }
  div.appendChild(right);
  body.appendChild(div);
}

// ---- the typed prompt ----
const termEl = document.getElementById('term');
const termInput = document.getElementById('termInput');
window.addEventListener('keydown', e => {
  if (e.code === 'Backquote' && !isEditable(e.target)) {
    e.preventDefault();
    termEl.classList.toggle('open');
    if (termEl.classList.contains('open')) termInput.focus();
    else document.getElementById('game').focus();
  }
});
termInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') { termEl.classList.remove('open'); document.getElementById('game').focus(); }
  if (e.key === 'Enter') {
    const r = applyCheat(state, termInput.value);
    state = r.state;
    toast(r.text);
    termInput.value = '';
    termEl.classList.remove('open');
    refreshHud();
    storeLocal(state, localStorage);
    document.getElementById('game').focus();
  }
});

// ---- world ----
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.focus();

// pixel-perfect presentation: internal 480x320, scaled by whole integers
const stage = document.getElementById('stage');
let scaleMode = localStorage.getItem('caiuctucuc_scale') || 'fill';
function fitCanvas() {
  const s = fitScale(stage.clientWidth, stage.clientHeight, canvas.width, canvas.height, scaleMode);
  canvas.style.width = Math.floor(canvas.width * s) + 'px';
  canvas.style.height = Math.floor(canvas.height * s) + 'px';
}
const scaleBtn = document.getElementById('scaleBtn');
function reflectScale() { scaleBtn.textContent = scaleMode === 'fill' ? 'Fill the room' : 'Crisp pixels'; }
scaleBtn.addEventListener('click', () => {
  scaleMode = scaleMode === 'fill' ? 'crisp' : 'fill';
  localStorage.setItem('caiuctucuc_scale', scaleMode);
  reflectScale(); fitCanvas();
});
reflectScale();
window.addEventListener('resize', fitCanvas);
document.addEventListener('fullscreenchange', fitCanvas);
fitCanvas();

document.getElementById('fullBtn').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else stage.requestFullscreen().catch(() => {});
  setTimeout(fitCanvas, 60);
});
const input = createInput(window);

// Placeholder gid colors: grass, creek, treeline, ford, street, building, stall, door.
const GID_COLORS = {
  1: '#2c3020', 2: '#3d4a52', 3: '#1c2016', 4: '#4a4436',
  5: '#4a4436', 6: '#241f18', 7: '#6e5a35', 8: '#5a4028',
  9: '#3a3128', 10: '#17130e', 11: '#3f3a30', 12: '#54452e'
};

// One real game hour passes per 30 seconds of quiet play, for heat decay.
const HOURS_PER_SECOND = 1 / 30;
const absHour = c => (c.day - 1) * 24 + c.hour;

async function start() {
  const art = await loadArt();
  const darkCanvas = document.createElement('canvas');
  darkCanvas.width = canvas.width; darkCanvas.height = canvas.height;
  const dctx = darkCanvas.getContext('2d');
  const tiers = await (await fetch('src/data/keywords.json')).json();
  allKeywords = Object.values(tiers).flat();
  const REG = await (await fetch('src/data/items.json')).json();

  const HUD_H = 48;
  let map, TILE, cam, spawn, npcs, interactables, spots, doorObjects, zoneObjects = [];
  const player = { x: 0, y: 0, speed: 70, walked: 0, flip: false };
  const trail = [];
  const pet = { x: 0, y: 0 };
  let growlCooldown = 0;
  let surrenderable = false;

  async function switchMap(target, spawnName) {
    map = await loadMap('assets/maps/' + target + '.json');
    TILE = map.tileWidth;
    cam = createCamera(canvas.width, canvas.height - HUD_H, map.width * TILE, map.height * TILE);
    spawn = map.findObject('spawns', spawnName || 'player')
         || map.findObject('spawns', 'player')
         || map.findObject('spawns', 'entry')
         || { x: TILE * 2, y: TILE * 2 };
    npcs = (map.objects.spawns || []).filter(o => o.type === 'npc')
      .filter(o => !(state.flags.coombsDead && o.props.npcId === 'coombs'))
      .map(o => ({ ...o, home: { x: o.x, y: o.y } }));
    interactables = (map.objects.interact || []).map(o => ({ ...o, used: (o.props.once || o.type === 'clue' || o.type === 'benchmark' || o.type === 'wisp') ? Boolean(state.flags['used_' + o.id]) : false }));
    doorObjects = (map.objects.doors || []);
    zoneObjects = (map.objects.zones || []);
    spots = {};
    for (const s of (map.objects.spots || [])) spots[s.name] = { x: s.x, y: s.y };
    player.x = spawn.x; player.y = spawn.y;
    state.map = target;
    surrenderable = false;
    log('map', target, map.width + 'x' + map.height, 'npcs', npcs.length);
  }

  await switchMap(state.map || 'town', null);

  function solidAtPx(px, py) {
    return map.solidAt(Math.floor(px / TILE), Math.floor(py / TILE));
  }
  function tryMove(dx, dy) {
    const nx = player.x + dx, ny = player.y + dy, w = 12, h = 12;
    if (![[nx, ny], [nx + w, ny], [nx, ny + h], [nx + w, ny + h]].some(([px, py]) => solidAtPx(px, py))) {
      player.x = nx; player.y = ny;
    }
  }

  function near(list, radius) {
    let best = null, bestD = radius * radius;
    for (const o of list) {
      const dx = o.x - player.x, dy = o.y - player.y;
      const d = dx * dx + dy * dy;
      if (d < bestD) { best = o; bestD = d; }
    }
    return best;
  }

  function hintFor() {
    const n = near(npcs, 28);
    if (n) return 'Press E to talk';
    const d = near(doorObjects, 20);
    if (d) return (d.props.requires && !state.flags[d.props.requires]) ? null : 'Press E to enter ' + d.name;
    const it = near(interactables.filter(o => !o.used && (o.type !== 'wisp' || state.player.sight >= 1)), 24);
    if (!it) return null;
    if (it.type === 'steal') return 'Press E to take the ' + it.name.split(' ').pop();
    if (it.type === 'coat') return 'Press E to change coats';
    if (it.type === 'board') return 'Press E to read the jobs board';
    if (it.type === 'job') return 'Press E: ' + it.name;
    if (it.type === 'door') return 'Press E to enter ' + it.name;
    if (it.type === 'station') return 'Press E to use ' + it.name;
    if (it.type === 'vendor') return 'Press E to trade at ' + it.name;
    if (it.type === 'restore') return 'Press E: repairs at ' + it.name;
    if (it.type === 'stash') return 'Press E to open ' + it.name;
    if (it.type === 'clue') return 'Press E to examine ' + it.name;
    if (it.type === 'sleeprough') return 'Press E to ' + it.name;
    if (it.type === 'murmur') return state.player.sight >= 2 ? 'Press E to listen at ' + it.name : 'Press E: ' + it.name;
    if (it.type === 'wisp') return state.player.sight >= 1 ? 'Press E to follow ' + it.name : null;
    if (it.type === 'accuse') return 'Press E to approach ' + it.name;
    if (it.type === 'chambers') return 'Press E: ' + it.name;
    if (it.type === 'widow') return 'Press E to speak with ' + it.name;
    if (it.type === 'ferry') return 'Press E to cross on ' + it.name + ' (1 silver)';
    if (it.type === 'benchmark') return 'Press E to clear the moss from ' + it.name;
    if (it.type === 'dog') return state.flags.droverDied && state.pet !== 'dog' ? 'Press E: ' + it.name : null;
    if (it.type === 'cat') return state.player.sight >= 1 && state.pet !== 'cat' ? 'Press E: ' + it.name : null;
    if (it.type === 'chamber') return 'Press E to enter ' + it.name;
    if (it.type === 'noquestions') return state.flags.knowsNightRuns && !state.flags.noQuestionsDone ? 'Press E: ' + it.name : null;
    if (it.type === 'signfarm') return 'Press E to repaint ' + it.name;
    if (it.type === 'cabinkept') return 'Press E to keep vigil at ' + it.name;
    if (it.type === 'plate') return 'Press E to examine ' + it.name;
    if (it.type === 'cresapledger') return 'Press E: ' + it.name;
    if (it.type === 'creditor') return state.flags.burdenDebt && !state.flags.burdenResolved ? 'Press E: ' + it.name : null;
    if (it.type === 'manhunter') return state.flags.burdenWarrant && state.flags.gossipTurn && !state.flags.burdenResolved ? 'Press E: ' + it.name : null;
    if (it.type === 'letterquest') return state.flags.burdenLetter && !state.flags.burdenResolved ? 'Press E: ' + it.name : 'Press E: ' + it.name;
    if (it.type === 'laylow') return 'Press E to lay low at ' + it.name;
    return 'Press E';
  }

  function doInteract() {
    const n = near(npcs, 28);
    if (n) { loadDialog(n.props.npcId).then(d => d && openDialog(d)); return; }
    const d = near(doorObjects, 20);
    if (d) {
      if (d.props.requires && !state.flags[d.props.requires]) { toast('Sealed rock, or as good as. Nothing here opens yet.'); return; }
      switchMap(d.props.target, d.props.spawn).then(() => { refreshHud(); storeLocal(state, localStorage); });
      return;
    }
    const it = near(interactables.filter(o => !o.used), 24);
    if (!it) return;
    if (it.type === 'steal') {
      if (it.props.once) { it.used = true; state.flags['used_' + it.id] = true; }
      state.player.coin += it.props.coin || 0;
      state.hueCry = { ...addHeat(state.hueCry, it.props.heat || 0, heatRate()), witnessedCoat: state.player.coat };
      state.flags.stoleInMarket = true;
      state.rumors = [...(state.rumors || []), newRumor('markettheft', 'market', absHour(state.clock))];
      toast('You palm the ' + it.name.split(' ').pop() + '. Heads turn. The word is already moving.');
      log('crime', state.hueCry);
    } else if (it.type === 'coat') {
      state.player.coat = nextCoat(state.player.coat);
      toast('You shrug into the ' + state.player.coat + ' coat. Different man entirely, to a hurried eye.');
    } else if (it.type === 'board') {
      if (state.job) { toast('One job at a time. Finish the ' + JOBS[state.job.id].name.toLowerCase() + ' first.'); return; }
      const order = ['freight', 'survey', 'nightrun'];
      const nextId = order.find(j => !state.flags['job_' + j]) || 'freight';
      const r = acceptJob(state, nextId);
      if (r.ok) {
        state = r.state;
        toast(JOBS[nextId].name + ': ' + JOBS[nextId].offer);
      }
    } else if (it.type === 'job' && state.flags.ending && it.props.job === 'freight' && it.props.stage === 'dropoff') {
      openPanel('THE ROAD OUT, OR NOT', body => {
        const par = document.createElement('p');
        par.textContent = 'Bright\u2019s train is loading for the Ohio country. You could go with it. The game does not mind which.';
        body.appendChild(par);
        row(body, '', '', [['Leave with the wagons', () => {
          const f = state.flags;
          const lines = [
            'CAIUCTUCUC: ' + (f.ending === 'buried_truth' ? 'The Buried Truth' : 'The Ledger Closed'),
            'Gantt: ' + (f.verdict === 'guilty' ? (f.forcedTrial ? 'hanged, by mathematics and fear' : 'hanged, by mathematics') : f.verdict === 'deal' ? 'walked, by arrangement' : 'walked, for want of weight'),
            'Pelham Rood: ' + (f.roodAlive ? 'alive, and owes you the rest of his life' : 'buried with the county\u2019s papers'),
            'Marks carried: ' + state.player.marks.length + (f.snakeOilSalesman ? ', and one bottle of snake oil on the ledger' : ''),
            'Companion: ' + (state.pet || 'your own footsteps'),
            f.noQuestionsDone ? 'And three people you will never see again reached the far bank because you walked beside them and said nothing.' : ''
          ].filter(Boolean);
          panelBody.replaceChildren();
          panelTitle.textContent = 'THE ROAD WEST';
          for (const l of lines) { const pp = document.createElement('p'); pp.textContent = l; panelBody.appendChild(pp); }
          storeLocal(state, localStorage);
        }], ['Stay', () => panelEl.classList.remove('open')]]);
      });
    } else if (it.type === 'job') {
      if (!state.job || state.job.id !== it.props.job) { toast('Not your errand, presently.'); refreshHud(); return; }
      const r = workJob(state, it.props.job, it.props.stage, state.clock.hour);
      state = r.state;
      if (r.heat) state.hueCry = { ...addHeat(state.hueCry, r.heat, heatRate()), witnessedCoat: state.player.coat };
      if (!state.job) state.flags['job_' + it.props.job] = true;
      toast(r.text);
    } else if (it.type === 'clue') {
      if (it.props.requires && !state.flags[it.props.requires]) { toast('Nothing here asks your attention yet.'); return; }
      it.used = true;
      state.flags['used_' + it.id] = true;
      if (it.props.clue) state = addClue(state, it.props.clue);
      if (it.props.sets) state.flags[it.props.sets] = true;
      if (it.props.gives) { const r = addItem(state, it.props.gives, REG); if (r.ok) state = r.state; }
      if (it.props.teaches) for (const k of it.props.teaches.split(',')) state.keywordsLearned = [...new Set([...state.keywordsLearned, k.trim()])];
      toast(it.props.text || 'Noted.');
      runCase();
    } else if (it.type === 'sleeprough') {
      state.flags.sleepCount = (state.flags.sleepCount || 0) + 1;
      state.clock = advance(state.clock, 8);
      state.hueCry = decay(state.hueCry, 8);
      if (state.player.sight === 0 && !state.flags.sleptInFort) {
        openPanel('THE RUINS AT NIGHT', body => {
          const par = document.createElement('p');
          par.textContent = 'Sleep comes strange here. Something at the edge of it waits to be let in: a glimmer, a way of seeing that will not close again once opened. Cross this threshold?';
          body.appendChild(par);
          row(body, '', '', [['Open the eye', () => {
            state.flags.sleptInFort = true;
            const r = attemptRank(state, 1);
            if (r.ok) {
              state = r.state;
              toast('THE GLIMMER. The morning fog is full of things that were always there. Wisps burn where you took them for swamp gas. A new word sits behind your teeth: SEEN.');
              state.keywordsLearned = [...new Set([...state.keywordsLearned, 'SEEN'])];
            }
            panelEl.classList.remove('open');
            runCase(); refreshHud(); storeLocal(state, localStorage);
          }], ['Sleep plainly', () => {
            toast('You sleep, and whatever waited, waits on.');
            panelEl.classList.remove('open');
            runCase(); storeLocal(state, localStorage);
          }]]);
        });
      } else {
        toast('A rough night among the stones. The ruins mutter, or the wind does.');
        runCase();
      }
      refreshHud();
    } else if (it.type === 'murmur') {
      if (state.player.sight < (it.props.rank || 2)) { toast('Cold ground. A draft finds your neck and moves on.'); return; }
      if (it.props.requires && !state.flags[it.props.requires]) { toast('The ground here is quiet, for now.'); return; }
      if (it.props.teaches) state.keywordsLearned = [...new Set([...state.keywordsLearned, ...it.props.teaches.split(',')])];
      if (it.props.clue) { state = addClue(state, it.props.clue); runCase(); }
      toast(it.props.text);
      storeLocal(state, localStorage);
    } else if (it.type === 'wisp') {
      if (state.player.sight < 1) { toast('Swamp gas, surely. It is gone when you look straight at it.'); return; }
      it.used = true;
      state.flags['used_' + it.id] = true;
      const warded = (state.wards || []).some(w => w.map === state.map && Math.hypot(w.x - it.x, w.y - it.y) < 3 * TILE);
      const r = wardedResolve(it.name, warded);
      if (r.kind === 'cache') { state.player.coin += r.coin; toast(r.text); }
      else if (r.kind === 'warded') toast(r.text);
      else { toast(r.text); hurt(r.hurt); }
      refreshHud();
      storeLocal(state, localStorage);
    } else if (it.type === 'accuse') {
      if (!state.flags.act2Complete) { toast('Kent hears cases, not suspicions. The town is not ready and neither is the file.'); return; }
      if (state.flags.verdict === 'guilty' || state.flags.verdict === 'deal') { toast('The matter is closed, one way or the other.'); return; }
      const ev = evidenceScore(state);
      if (state.flags.acquittedAt !== undefined && ev <= state.flags.acquittedAt) { toast('Kent will not rehear the case on the same file. Bring more.'); return; }
      const wit = witnessScore(state);
      const kent = kentScore(state);
      openPanel('THE CASE AGAINST PROSPER GANTT', body => {
        for (const c of state.clues) {
          if (EVIDENCE[c]) row(body, CLUES[c].name, 'weight ' + EVIDENCE[c], []);
        }
        row(body, 'Witnesses', wit >= 2 ? 'Beall, sober and certain' + (wit > 2 ? '; the chainman\u2019s widow' : '') : wit === 1 ? 'the chainman\u2019s widow' : 'none the court will hear', []);
        row(body, 'The bench', state.flags.kentAlly ? 'Kent, in atonement' : state.flags.kentPressured ? 'Kent, under your thumb' : 'Kent, unread', []);
        row(body, 'The file weighs ' + (ev + wit + kent) + '. Conviction wants ' + GUILTY_AT + '.', '', [['Lay the case', () => {
          const r = verdict(ev, wit, kent);
          panelEl.classList.remove('open');
          if (r.verdict === 'guilty') {
            state.flags.verdict = 'guilty';
            toast('Kent hears it all, and the file holds. GUILTY. The gavel sounds like a quarry hammer.');
          } else if (r.verdict === 'hung') {
            openPanel('THE JURY HANGS', body2 => {
              const par = document.createElement('p');
              par.textContent = 'The file weighed ' + r.total + ': enough to frighten, not enough to hang. Cresap appears at your elbow with the elders\u2019 offer already drafted: bury the case, Gantt re-surveys the line, the quarry stays legal, the town stays fed. Nobody says the word innocent.';
              body2.appendChild(par);
              if (state.flags.cresapLedger) row(body2, 'The magistrate\u2019s ledger', 'three copied pages, heavy as shot', [['Produce it', () => {
                state.flags.verdict = 'guilty';
                state.flags.forcedTrial = true;
                panelEl.classList.remove('open');
                toast('You lay the copied pages beside the file, and Cresap goes the color of old suet. The offer evaporates. The trial proceeds, and holds. GUILTY, by mathematics and by fear, and only you know the ratio.');
                runCase(); refreshHud(); storeLocal(state, localStorage);
              }]]);
              row(body2, '', '', [['Let them bury it', () => {
                state.flags.verdict = 'deal';
                state.reputation.town += 1;
                panelEl.classList.remove('open');
                runCase(); refreshHud(); storeLocal(state, localStorage);
              }], ['Withdraw and dig deeper', () => {
                toast('You pull the file before the offer can close over it. The case keeps. So does Gantt.');
                panelEl.classList.remove('open');
              }]]);
            });
            return;
          } else {
            state.flags.verdict = undefined;
            state.flags.acquittedAt = ev;
            toast('ACQUITTED for want of weight: the file made ' + r.total + '. Gantt shakes hands on the steps. Bring a heavier file.');
          }
          runCase(); refreshHud(); storeLocal(state, localStorage);
        }]]);
      });
    } else if (it.type === 'chambers') {
      if (!state.flags.act2Complete) { toast('The judge\u2019s chambers, and the best lock in the county. No reason to test it yet.'); return; }
      if (state.flags.kentAlly || state.flags.kentPressured) { toast('You have Kent\u2019s measure already.'); return; }
      if (countOf(state, 'lockpicks') < 1) { toast('The best lock in the county. It wants better tools than fingers.'); return; }
      openPanel('THE SEALED RECORD', body => {
        const par = document.createElement('p');
        par.textContent = 'Behind the lock: an inquest, quashed by Kent as a young clerk. A quarry death, the same seam, ruled accident against the evidence because the founders demanded it. He has spent a career atoning in secret. What do you do with a judge\u2019s oldest wound?';
        body.appendChild(par);
        row(body, '', '', [['Absolve him quietly', () => {
          state.flags.kentAlly = true;
          toast('You return the record unsealed and say only that some accidents deserve second inquests. Kent ages ten years and stands ten inches straighter. An ally in atonement.');
          panelEl.classList.remove('open'); storeLocal(state, localStorage);
        }], ['Keep it as leverage', () => {
          state.flags.kentPressured = true;
          toast('You keep the record. Kent will rule as you need, brittle as old glass, and both of you will always know it.');
          panelEl.classList.remove('open'); storeLocal(state, localStorage);
        }]]);
      });
    } else if (it.type === 'widow') {
      if (!state.flags.clue_gentleman_letter) { toast('A traveler by the cold hearth, waiting on someone who is not you yet.'); return; }
      if (state.flags.widowResolved) { toast('She has taken her room. The Mule is quieter around her.'); return; }
      openPanel('THE CHAINMAN\u2019S WIDOW', body => {
        const par = document.createElement('p');
        par.textContent = 'Tam Hollis\u2019s sister, come from Hagerstown for his effects. You hold his savings and his letter. She cannot check what you hand her. The gossip network can.';
        body.appendChild(par);
        row(body, '', '', [['Give it over complete', () => {
          state.flags.widowResolved = true;
          state.flags.widowTestimony = true;
          toast('She reads the letter twice and folds it like something breakable. "He wrote me about a gentleman. I will say so to any judge you like." Nothing else changes hands, which is the point.');
          panelEl.classList.remove('open'); runCase(); storeLocal(state, localStorage);
        }], ['Skim the savings first', () => {
          state.flags.widowResolved = true;
          state.flags.skimmedWidow = true;
          state.player.coin += 4;
          state.rumors = [...(state.rumors || []), newRumor('skimmed', 'doyle', absHour(state.clock))];
          toast('Four silver lighter, the packet still looks whole. She thanks you with wet eyes. Peg watches you across the taps without expression at all.');
          panelEl.classList.remove('open'); refreshHud(); storeLocal(state, localStorage);
        }]]);
      });
    } else if (it.type === 'ferry') {
      if (state.player.coin < 1) { toast('"Crossing is a penny." The river does not extend credit.'); return; }
      state.player.coin -= 1;
      state.clock = advance(state.clock, 3);
      state.hueCry = decay(state.hueCry, 3, 1, true);
      toast('Shanks poles you across and asks nothing. Three hours on the Virginia bank, where Maryland law gets seasick, and the heat bleeds off six times as fast.');
      runCase(); refreshHud(); storeLocal(state, localStorage);
    } else if (it.type === 'benchmark') {
      it.used = true;
      state.flags['used_' + it.id] = true;
      state.flags.benchmarkCount = (state.flags.benchmarkCount || 0) + 1;
      if (state.flags.benchmarkCount >= 5) {
        state.flags.benchmarksAll = true;
        toast('The fifth brass benchmark, old Crane\u2019s own stamp. Five points make a line no witness can shake: the true boundary, re-derived. Mathematics does not perjure.');
      } else {
        toast('A brass benchmark, half-swallowed by moss, stamped A.C. ' + state.flags.benchmarkCount + ' of 5 found. Gantt was buying these as scrap for a reason.');
      }
      runCase(); storeLocal(state, localStorage);
    } else if (it.type === 'dog') {
      if (!state.flags.droverDied) { toast('A drover\u2019s cur, minding its own business for now.'); return; }
      const r = adoptPet(state, 'dog');
      if (!r.ok) { toast('The dog is ' + r.reason + '.'); return; }
      state = r.state;
      pet.x = player.x; pet.y = player.y;
      toast(state.pet === 'dog' && 'The cur looks at the place its drover fell, then at you, and makes the only decision left to it. It falls in at your heel like it was always there.');
      storeLocal(state, localStorage);
    } else if (it.type === 'cat') {
      if (state.player.sight < 1) { toast('A fort cat regards you without result. You have not been introduced.'); return; }
      const r = adoptPet(state, 'cat');
      if (!r.ok) { toast('The cat is ' + r.reason + ', insofar as a cat is anywhere.'); return; }
      state = r.state;
      pet.x = player.x; pet.y = player.y;
      toast('The cat does not adopt you so much as file the paperwork retroactively. It has been yours since the night you slept here, and rats and worse keep their distance now.');
      storeLocal(state, localStorage);
    } else if (it.type === 'chamber') {
      state.flags.inChamber = true;
      openPanel('THE CHAMBER', body => {
        const par = document.createElement('p');
        par.textContent = 'A cold cathedral dark, and the singing very quiet now, like a thing aware it is being visited. Nan Trent sits at the center, unharmed, listening. She does not want to be interrupted. She does want to go home. What is done here is done for good.';
        body.appendChild(par);
        const options = [['Carry her out and seal the cave', () => {
          const r = chooseEnding(state, 'ledger_closed');
          if (r.ok) { state = r.state; runCase(); }
          panelEl.classList.remove('open');
          refreshHud(); storeLocal(state, localStorage);
        }]];
        if (state.player.sight >= 2) options.push(['Bury it properly, with rites', () => {
          const r = chooseEnding(state, 'buried_truth');
          if (r.ok) { state = r.state; runCase(); } else toast(r.reason);
          panelEl.classList.remove('open');
          refreshHud(); storeLocal(state, localStorage);
        }]);
        options.push(['Not yet', () => panelEl.classList.remove('open')]);
        row(body, '', '', options);
      });
    } else if (it.type === 'noquestions') {
      if (!state.flags.knowsNightRuns) { toast('The landing at night. The river keeps its own counsel.'); return; }
      if (periodFor(state.clock.hour) !== 'night') { toast('Not by daylight. Daylight is a gossip.'); return; }
      if (state.flags.noQuestionsDone) { toast('The far bank keeps them now. That is all you will ever know, and it is enough.'); return; }
      openPanel('NO QUESTIONS', body => {
        const par = document.createElement('p');
        par.textContent = 'Shanks asks you to walk beside a crossing and say nothing, whatever happens. The passengers are a family moving north with papers from Freeman\u2019s loft: Ruth, Samuel, and a baby they have not named yet, in case. A rider with a Virginia warrant is watching the landing. There is no coin at the end of this. There is only the getting of three people from this shore to Bright\u2019s departing wagons.';
        body.appendChild(par);
        row(body, '', '', [['Walk them through the shanty lanes you know', () => {
          state.flags.noQuestionsDone = true;
          state = applyTrust(applyTrust(state, 'shanks', 'testimonyHonest'), 'freeman', 'testimonyHonest');
          state.reputation.hills += 1;
          toast('You know the lanes the rider does not. Forty minutes of ordinary walking, three heartbeats of a lantern swinging your way, and then the wagon gate, and Ruth\u2019s hand on your arm for exactly one second. Nobody says thank you out loud. Nobody has to.');
          panelEl.classList.remove('open'); refreshHud(); storeLocal(state, localStorage);
        }], ['Draw the rider off yourself', () => {
          state.flags.noQuestionsDone = true;
          state = applyTrust(applyTrust(state, 'shanks', 'testimonyHonest'), 'freeman', 'testimonyHonest');
          state.reputation.hills += 1;
          state.hueCry = { ...addHeat(state.hueCry, 12, heatRate()), witnessedCoat: state.player.coat };
          toast('You walk the wrong way looking exactly guilty enough, and the rider follows you for an hour of nothing while the flat crosses dark behind him. The heat you carry tonight is the cheapest thing you will ever buy.');
          panelEl.classList.remove('open'); refreshHud(); storeLocal(state, localStorage);
        }]]);
      });
    } else if (it.type === 'signfarm') {
      if (countOf(state, 'hex_sign') < 1) { toast('The ghost of a painted circle under new whitewash. It wants a sign, and you have none to give.'); return; }
      it.used = true;
      state.flags['used_' + it.id] = true;
      state = removeItem(state, 'hex_sign', 1).state;
      state.flags.farmsSigned = (state.flags.farmsSigned || 0) + 1;
      if (state.flags.farmsSigned >= 4) {
        state.reputation.hills += 2;
        toast('The fourth sign dries in Brahm\u2019s pattern, and the county is measurably quieter tonight, one farm at a time. The Hills know whose hands did the work.');
      } else {
        toast('You paint the sign where it can watch the approach. ' + state.flags.farmsSigned + ' of 4 farms restored.');
      }
      refreshHud(); storeLocal(state, localStorage);
    } else if (it.type === 'cabinkept') {
      if (state.flags.cabinKept) { toast('The broom has moved again. You have stopped checking why.'); return; }
      openPanel('THE CABIN KEPT', body => {
        const par = document.createElement('p');
        par.textContent = 'Washington\u2019s cabin: always swept, never entered, and nobody is paid to do it. Watch a full night?';
        body.appendChild(par);
        row(body, '', '', [['Watch', () => {
          state.clock = advance(state.clock, 8);
          state.flags.sleepCount = (state.flags.sleepCount || 0) + 1;
          state.flags.cabinKept = true;
          toast(state.player.sight >= 2
            ? 'Nothing comes, all night. At dawn the broom has moved, and one murmur, in the oldest voice in the game: still on duty. The cabin is a safe rest now, and you know one true quiet thing about the town.'
            : 'Nothing comes, all night. At dawn the broom has moved. That is all, and it is somehow enough. The cabin is a safe rest now.');
          panelEl.classList.remove('open'); runCase(); refreshHud(); storeLocal(state, localStorage);
        }]]);
      });
    } else if (it.type === 'plate') {
      if (state.flags.plateResolved) { toast('The collection box, whole again, more or less.'); return; }
      if (!state.flags.act2Complete) { toast('A collection box. Fuller than a town this size should manage.'); return; }
      openPanel('THE COLLECTION PLATE', body => {
        const par = document.createElement('p');
        par.textContent = 'The revival\u2019s funds have vanished and Crane needs it quiet. The thief is the Hartsell family, one bad season from Fenwick\u2019s list, and they took it to pay a debt to Cresap of all people.';
        body.appendChild(par);
        row(body, '', '', [['Expose them', () => {
          state.flags.plateResolved = true;
          state.reputation.kirk += 1;
          toast('The Hartsells are named from the pulpit and made whole an example. The Kirk rises. Something in the town dies a little, and you helped.');
          panelEl.classList.remove('open'); refreshHud(); storeLocal(state, localStorage);
        }], ['Arrange quiet restitution (3 silver)', () => {
          if (state.player.coin < 3) { toast('Restitution wants 3 silver you do not have.'); return; }
          state.player.coin -= 3;
          state.flags.plateResolved = true;
          state.reputation.kirk += 1;
          state.reputation.hills += 1;
          toast('The box is made whole and nobody is named. The Hartsells will never know who. Crane, counting it twice, decides not to ask.');
          panelEl.classList.remove('open'); refreshHud(); storeLocal(state, localStorage);
        }], ['Show Crane the arithmetic', () => {
          state.flags.plateResolved = true;
          state.flags.craneShown = true;
          toast('You lay the Hartsells\u2019 debt against his own collection totals and watch the fraud do sums. He empties the box into your hands and says take it to them, and do not tell me where it went. His choice, not yours, and worth remembering in an act to come.');
          panelEl.classList.remove('open'); storeLocal(state, localStorage);
        }]]);
      });
    } else if (it.type === 'cresapledger') {
      if (state.flags.cresapLedger) { toast('You have the copy. He has the original and the fear.'); return; }
      if (countOf(state, 'lockpicks') < 1) { toast('A strongbox with a magistrate\u2019s taste in locks. Fingers will not do.'); return; }
      state.flags.cresapLedger = true;
      toast('The bribe ledger, in Cresap\u2019s own careful hand: every payment, every payer, dates and amounts. You copy three pages and leave the book exactly as found. Leverage now, for the day the elders waver.');
      storeLocal(state, localStorage);
    } else if (it.type === 'creditor') {
      if (!state.flags.burdenDebt) { toast('A traveling factor totting a ledger. None of the columns are yours.'); return; }
      if (state.flags.burdenResolved) { toast('The factor nods, ledger closed. Paid is paid.'); return; }
      openPanel('THE DEBT', body => {
        const par = document.createElement('p');
        par.textContent = 'The creditor\u2019s agent, arrived with legal paper and no malice, just arithmetic. Six silver settles it entire.';
        body.appendChild(par);
        row(body, '', '', [['Pay it (6 silver)', () => {
          if (state.player.coin < 6) { toast('Arithmetic is patient. Six silver, whenever you have it.'); return; }
          state.player.coin -= 6;
          state.flags.burdenResolved = true;
          state.reputation.town += 1;
          toast('Paid entire, receipted, done. The lightness lasts all day, and the town notices a settler of debts.');
          panelEl.classList.remove('open'); refreshHud(); storeLocal(state, localStorage);
        }], ['Not today', () => {
          toast('"No hurry," he says, in the tone of a man for whom there is only hurry.');
          panelEl.classList.remove('open');
        }]]);
      });
    } else if (it.type === 'manhunter') {
      if (!state.flags.burdenWarrant || !state.flags.gossipTurn) { toast('A traveler nursing a pint and minding, apparently, his own business.'); return; }
      if (state.flags.burdenResolved) { toast('The traveler left on the morning stage, lighter one warrant.'); return; }
      openPanel('THE WARRANT', body => {
        const par = document.createElement('p');
        par.textContent = 'He has been looking at you for two days and now he stops pretending: a manhunter, with your paper from back east. And Isaiah Freeman, two tables over, has been looking at him.';
        body.appendChild(par);
        const opts = [];
        if ((state.trust.freeman || 0) >= 2 || state.flags.noQuestionsDone) opts.push(['Let Freeman handle it', () => {
          state.flags.burdenResolved = true;
          toast('Freeman crosses the room and speaks to the manhunter quietly, at length, about papers, and the checking of papers, and how easily a checker of papers becomes a man whose own papers get checked. The hunter settles his bill and takes the morning stage. Freeman never mentions it again, which is how you know what it cost him.');
          panelEl.classList.remove('open'); storeLocal(state, localStorage);
        }]);
        opts.push(['Buy the warrant (8 silver)', () => {
          if (state.player.coin < 8) { toast('He names eight silver and waits. Hunters are patient.'); return; }
          state.player.coin -= 8;
          state.flags.burdenResolved = true;
          toast('Eight silver buys your own paper, which you burn in the Mule\u2019s hearth while he watches without expression. Business is business, apparently, in both directions.');
          panelEl.classList.remove('open'); refreshHud(); storeLocal(state, localStorage);
        }]);
        opts.push(['Walk out ahead of it', () => {
          state.hueCry = { ...addHeat(state.hueCry, 20, heatRate()), witnessedCoat: state.player.coat };
          toast('You leave by the back and he follows by the front, and now the whole street knows somebody is worth following. The warrant stands, and the heat is real.');
          panelEl.classList.remove('open'); refreshHud(); storeLocal(state, localStorage);
        }]);
        row(body, '', '', opts);
      });
    } else if (it.type === 'letterquest') {
      if (!state.flags.burdenLetter) { toast('The Lamar house, shuttered at noon. The doctor\u2019s orders, the town says.'); return; }
      if (state.flags.burdenResolved) { toast('The house is quiet. The token in your satchel is warm, or you imagine it is.'); return; }
      openPanel('THE UNFINISHED LETTER', body => {
        const par = document.createElement('p');
        par.textContent = 'The address on your dead sibling\u2019s letter is this door. Your sibling was the chainman on Gantt\u2019s survey two years back, working the day Mr. Lamar died at the quarry. The final page is in Mrs. Lamar\u2019s keeping, and the woman at the window, lucid for one hard-bought hour, will trade it for nothing but the truth of why you came.';
        body.appendChild(par);
        row(body, '', '', [['Tell her everything', () => {
          state.flags.burdenResolved = true;
          state.reputation.hills += 1;
          const r = addItem(state, 'winona_token', REG);
          if (r.ok) state = r.state;
          toast('She reads your face longer than the letter. Then she gives you the last page, and something else: her husband\u2019s find from the deep cut, a worn token. "The girl who leapt was not fleeing," she says. "She was leading it away. Finish your brother\u2019s letter and mine both." The word WINONA settles into your journal like a stone into a pool.');
          state.keywordsLearned = [...new Set([...state.keywordsLearned, 'WINONA'])];
          panelEl.classList.remove('open'); runCase(); refreshHud(); storeLocal(state, localStorage);
        }]]);
      });
    } else if (it.type === 'station') {
      const st = it.props.station;
      openPanel(it.name.toUpperCase(), body => {
        for (const [rid, r] of Object.entries(RECIPES)) {
          if (r.station !== st) continue;
          const needs = Object.entries(r.inputs).map(([id, n]) => n + ' ' + REG[id].name).join(', ');
          row(body, REG[r.output].name + (r.qty > 1 ? ' x' + r.qty : ''), 'needs ' + needs,
            canCraft(state, rid) ? [['Craft', () => {
              const res = craft(state, rid, st, REG);
              if (res.ok) { state = res.state; toast('Made: ' + REG[r.output].name + (r.qty > 1 ? ' x' + r.qty : '') + '.'); storeLocal(state, localStorage); }
              else toast(res.reason);
            }]] : []);
        }
      });
    } else if (it.type === 'vendor') {
      const stock = it.props.stock.split(',');
      openPanel('THE COUNTER', body => {
        for (const id of stock) {
          const def = REG[id];
          row(body, def.name, buyPrice(def) + ' silver',
            state.player.coin >= buyPrice(def) ? [['Buy', () => {
              const r = addItem(state, id, REG);
              if (r.ok) {
                state = { ...r.state, player: { ...r.state.player, coin: r.state.player.coin - buyPrice(def) } };
                refreshHud(); storeLocal(state, localStorage);
              } else toast(r.reason);
            }]] : []);
        }
        for (const entry of [...state.inventory]) {
          const def = REG[entry.id];
          if (def.quest || sellPrice(def) < 1) continue;
          row(body, 'sell ' + def.name, sellPrice(def) + ' silver' + (def.currency ? ', full rate' : ''),
            [['Sell', () => {
              state = removeItem(state, entry.id, 1).state;
              state.player.coin += sellPrice(def);
              refreshHud(); storeLocal(state, localStorage);
            }]]);
        }
      });
    } else if (it.type === 'restore') {
      openPanel("FEIG'S COUNTER", body => {
        let any = false;
        state.inventory.forEach((entry, i) => {
          if (!entry.cond || entry.cond === 'sound') return;
          any = true;
          const fee = restoreFee(entry, REG[entry.id].price || 4);
          row(body, REG[entry.id].name, entry.cond + ', ' + fee + ' silver to make sound',
            state.player.coin >= fee ? [['Restore', () => {
              state.inventory[i] = restore(entry);
              state.player.coin -= fee;
              toast('Feig turns it over twice, grunts, and makes it right.');
              refreshHud(); storeLocal(state, localStorage);
            }]] : []);
        });
        if (!any) row(body, '"Nothing here needs me. Rare compliment."', '', []);
      });
    } else if (it.type === 'stash') {
      openPanel('YOUR CHEST', body => {
        state.inventory.forEach((entry, i) =>
          row(body, REG[entry.id].name, entry.qty > 1 ? 'x' + entry.qty : '',
            [['Store', () => { const r = toStash(state, i); if (r.ok) { state = r.state; storeLocal(state, localStorage); } }]]));
        state.stash.forEach((entry, i) =>
          row(body, REG[entry.id].name, 'in the chest' + (entry.qty > 1 ? ', x' + entry.qty : ''),
            [['Take', () => { const r = fromStash(state, i); if (r.ok) { state = r.state; storeLocal(state, localStorage); } else toast(r.reason); }]]));
        if (!state.inventory.length && !state.stash.length) row(body, 'Empty, like a good conscience.', '', []);
      });
    } else if (it.type === 'laylow') {
      const price = it.props.price || 0;
      if (state.player.coin < price) { toast('Peg wants ' + price + ' silver for the corner room.'); return; }
      state.player.coin -= price;
      state.hueCry = decay(state.hueCry, it.props.hours || 6);
      state.clock = advance(state.clock, it.props.hours || 6);
      state.flags.sleepCount = (state.flags.sleepCount || 0) + 1;
      ambience.setScene(periodFor(state.clock.hour));
      toast('You take the corner room and let ' + (it.props.hours || 6) + ' hours pass. The street cools.');
      runCase();
      log('laylow', state.hueCry);
    }
    refreshHud();
    storeLocal(state, localStorage);
  }

  function openSatchel() {
    openPanel('SATCHEL (' + state.inventory.length + '/' + SATCHEL_SIZE + ')', body => {
      for (const [slot, entry] of Object.entries(state.player.equip || {})) {
        if (entry) row(body, REG[entry.id].name, 'worn as ' + slot + (entry.cond ? ', ' + entry.cond : ''), []);
      }
      state.inventory.forEach((entry, i) => {
        const def = REG[entry.id];
        const note = (entry.qty > 1 ? 'x' + entry.qty + ' ' : '') + (entry.cond ? entry.cond : '');
        const buttons = [];
        if (def.consume) buttons.push(['Use', () => {
          state = removeItem(state, entry.id, 1).state;
          if (def.category === 'food' || def.category === 'remedy') {
            let heal = def.category === 'remedy' ? 4 : 2;
            if (state.difficulty.combat === 'perilous' && def.category === 'food') heal = 1;
            state.player.health = Math.min(state.player.maxHealth, state.player.health + heal);
            state.player.fedAbs = absHour(state.clock);
            refreshHud();
          }
          toast(def.consume);
          storeLocal(state, localStorage);
          openSatchel();
        }]);
        if (entry.id === 'hex_sign' || entry.id === 'salt_line') buttons.push(['Place', () => {
          state = removeItem(state, entry.id, 1).state;
          state.wards = [...(state.wards || []), { map: state.map, x: Math.round(player.x), y: Math.round(player.y), id: entry.id }];
          toast(entry.id === 'hex_sign' ? 'You paint the sign where it can watch the approach. Old pattern, new paint.' : 'You lay the salt in an unbroken line and step over it carefully.');
          storeLocal(state, localStorage);
          openSatchel();
        }]);
        if (def.slot) buttons.push(['Equip', () => {
          const r = equip(state, i, REG);
          if (r.ok) { state = r.state; refreshHud(); storeLocal(state, localStorage); openSatchel(); }
          else toast(r.reason);
        }]);
        if (entry.cond === 'broke' && countOf(state, 'whetstone') > 0) buttons.push(['Patch', () => {
          const r = fieldRepair(entry, 0);
          if (r.ok) {
            state.inventory[i] = r.entry;
            toast('You work the whetstone and the oil rag. It will serve, barely.');
            storeLocal(state, localStorage);
            openSatchel();
          } else toast(r.reason);
        }]);
        row(body, def.name, note, buttons);
      });
      if (!state.inventory.length) row(body, 'An empty satchel and honest pockets.', '', []);
    });
  }

  window.addEventListener('keydown', e => {
    if (isEditable(e.target)) return;
    if (e.code === 'KeyE' && !talking) doInteract();
    if (e.code === 'KeyI' && !talking) {
      panelEl.classList.contains('open') ? panelEl.classList.remove('open') : openSatchel();
    }
    if (e.code === 'KeyQ' && !talking && surrenderable) onSurrender();
  });

  function onSurrender() {
    const fine = Math.min(3, state.player.coin);
    state.player.coin -= fine;
    state.hueCry = { level: 0, heat: 0, witnessedCoat: null };
    state.flags.surrendered = true;
    const g = spots.gaol || spawn;
    player.x = g.x; player.y = g.y;
    toast('You put your hands out. A night in the gaol, ' + (fine ? fine + ' silver, ' : '') + 'and Beall notes that you came quiet. He remembers that kind of thing.');
    state = applyTrust(state, 'beall', 'surrenderedQuietly');
    state.clock = advance(state.clock, 10);
    state.flags.sleepCount = (state.flags.sleepCount || 0) + 1;
    refreshHud();
    storeLocal(state, localStorage);
  }

  function onCaught() {
    const fine = Math.min(5, state.player.coin);
    state.player.coin -= fine;
    state.hueCry = { level: 0, heat: 0, witnessedCoat: null };
    player.x = spawn.x; player.y = spawn.y;
    toast('Beall collars you by the courthouse. ' + (fine ? fine + ' silver fine, and a warning.' : 'No coin for the fine, so you sweep the gaol steps instead.'));
    refreshHud();
    storeLocal(state, localStorage);
  }

  function hurt(amount, why) {
    state.player.health = Math.max(0, state.player.health - amount);
    refreshHud();
    if (state.player.health <= 0) {
      const r = applyDeath(state);
      state = r.state;
      const spot = spots[r.moveTo] || spawn;
      player.x = spot.x; player.y = spot.y;
      toast(r.toast);
      runCase();
      refreshHud();
      storeLocal(state, localStorage);
    } else if (why) toast(why);
  }

  let saveTimer = 0;
  let clockAcc = 0;
  let drownAcc = 0;
  let hungerAcc = 0;
  function update(dt) {
    if (talking || creatorOpen || splashOpen) return;
    const h = surrenderable ? 'Press Q to surrender' : hintFor();
    hintEl.textContent = h || '';
    hintEl.classList.toggle('show', Boolean(h));

    const fedBuff = state.difficulty.survival === 'buffs' && (absHour(state.clock) - (state.player.fedAbs || 0)) < 12 ? 1.1 : 1;
    const v = player.speed * fedBuff * dt;
    const ox = player.x, oy = player.y;
    if (input.has('up')) tryMove(0, -v);
    if (input.has('down')) tryMove(0, v);
    if (input.has('left')) { tryMove(-v, 0); player.flip = true; }
    if (input.has('right')) { tryMove(v, 0); player.flip = false; }
    player.walked += Math.abs(player.x - ox) + Math.abs(player.y - oy);

    // zones fire flags; the case watches everything
    for (const z of zoneObjects) {
      const f = z.props.flag;
      if (f && !state.flags[f] &&
          player.x >= z.x && player.x < z.x + z.width &&
          player.y >= z.y && player.y < z.y + z.height) {
        state.flags[f] = true;
        runCase();
        if (state.flags.coombsDead) {
          const i = npcs.findIndex(n => n.props.npcId === 'coombs');
          if (i >= 0) npcs.splice(i, 1);
        }
      }
    }

    // the clock turns; heat cools slowly with time on the street
    clockAcc += dt * HOURS_PER_SECOND;
    if (clockAcc >= 0.25) {
      state.clock = advance(state.clock, clockAcc);
      clockAcc = 0;
      ambience.setScene(periodFor(state.clock.hour), state.map === 'caves' ? 'caves' : state.map === 'town' ? 'town' : 'indoor');
      runCase();
      if (state.flags.coombsDead) {
        const ci = npcs.findIndex(n => n.props.npcId === 'coombs');
        if (ci >= 0) npcs.splice(ci, 1);
      }
      refreshHud();
    }
    if (state.hueCry.heat > 0) {
      const cooled = decay(state.hueCry, dt * HOURS_PER_SECOND);
      if (cooled.level !== state.hueCry.level) refreshHud();
      state.hueCry = cooled;
    }

    // schedules move the town; the constable acts on what the street can recognize
    const eff = effectiveLevel(state.hueCry, state.player.coat);
    if (state.map === 'town') {
      const hasExtra = id => npcs.some(n => n.props.extra === id);
      if (eff >= 3 && !hasExtra('militia') && spots.gaol) {
        npcs.push({ name: 'militiaman', x: spots.gaol.x, y: spots.gaol.y, props: { npcId: 'militia', pursuer: true, extra: 'militia' }, home: { ...spots.gaol } });
        toast('Drums off the square: the militia musters. Two pairs of boots on your trail now.');
      }
      if (eff >= 4 && !hasExtra('bounty') && spots.shanks_work) {
        npcs.push({ name: 'bounty man', x: spots.shanks_work.x, y: spots.shanks_work.y, props: { npcId: 'bounty', pursuer: true, extra: 'bounty' }, home: { ...spots.shanks_work } });
        toast('A posted bill with your coat on it, and a professional reading it. The bounty men do not muster. They just start.');
      }
      if (eff < 3) {
        for (let i = npcs.length - 1; i >= 0; i--) if (npcs[i].props.extra) npcs.splice(i, 1);
      }
    }
    for (const n of npcs) {
      if (n.props.pursuer && eff >= 2) {
        const next = seekStep(n, player, 62, dt, solidAtPx);
        n.x = next.x; n.y = next.y;
        surrenderable = caught(n, player, 44);
        if (caught(n, player)) onCaught();
        continue;
      }
      const sched = SCHEDULES[n.props.npcId];
      if (!sched) continue;
      const spot = spots[spotFor(sched, state.clock.hour)];
      if (spot && Math.hypot(spot.x - n.x, spot.y - n.y) > 2) {
        const next = seekStep(n, spot, 40, dt, solidAtPx);
        n.x = next.x; n.y = next.y;
      }
    }
    if (!npcs.some(n => n.props.pursuer && eff >= 2)) surrenderable = false;

    // deep water drowns; fords and bridges do not
    const underfoot = map.gidAt('ground', Math.floor((player.x + 8) / TILE), Math.floor((player.y + 8) / TILE));
    if (underfoot === 2) {
      drownAcc += dt;
      if (drownAcc > 1.2) { drownAcc = 0; hurt(2, 'The creek is colder and stronger than it looks. 2 hurt.'); }
    } else drownAcc = 0;

    // hunger, per the survival slider
    if (state.difficulty.survival === 'hard') {
      hungerAcc += dt;
      if (hungerAcc > 4) {
        hungerAcc = 0;
        if (absHour(state.clock) - (state.player.fedAbs || 0) > 24) hurt(1, 'Hunger has opinions. Eat something.');
      }
    }

    // the companion keeps pace, or leads
    if (state.pet) {
      trail.push({ x: player.x, y: player.y });
      if (trail.length > 14) trail.shift();
      if (state.pet === 'cat' && state.map === 'caves') {
        const ahead = player.flip ? -20 : 20;
        pet.x += ((player.x + ahead) - pet.x) * Math.min(1, dt * 6);
        pet.y += (player.y - pet.y) * Math.min(1, dt * 6);
      } else {
        const back = trail[0];
        pet.x += (back.x - pet.x) * Math.min(1, dt * 8);
        pet.y += (back.y - pet.y) * Math.min(1, dt * 8);
      }
      if (state.pet === 'dog') {
        growlCooldown -= dt;
        const w = interactables.find(o => o.type === 'wisp' && !o.used && Math.hypot(o.x - player.x, o.y - player.y) < 48);
        if (w && growlCooldown <= 0) { growlCooldown = 12; toast('The dog stops dead and growls at nothing you can see. Yet.'); }
      }
    }

    // the mill wheel, heard from the north road, until the night it stops
    if (state.map === 'town' && !state.flags.nanMissing && spots.doyle_bar) {
      const mill = { x: 36 * TILE, y: 12 * TILE };
      const d = Math.hypot(mill.x - player.x, mill.y - player.y);
      ambience.setMill(Math.max(0, 1 - d / (18 * TILE)));
    } else ambience.setMill(0);

    cam.follow(player.x + 8, player.y + 8);
    saveTimer += dt;
    if (saveTimer > 5) {
      saveTimer = 0;
      storeLocal(state, localStorage);
    }
  }

  function drawChar(sheet, x, y, frame, flip, fallback) {
    const sx = Math.round(x - cam.x), sy = Math.round(y - cam.y) - 8;
    if (art.ready && sheet) {
      ctx.save();
      if (flip) { ctx.translate(sx + 16, sy); ctx.scale(-1, 1); ctx.drawImage(sheet, frame * 16, 0, 16, 24, 0, 0, 16, 24); }
      else ctx.drawImage(sheet, frame * 16, 0, 16, 24, sx, sy, 16, 24);
      ctx.restore();
    } else {
      ctx.fillStyle = fallback;
      ctx.fillRect(sx + 2, sy + 10, 12, 12);
    }
  }

  function drawHeart(x, y, filled) {
    ctx.fillStyle = filled ? '#d82820' : '#3a1410';
    ctx.fillRect(x + 1, y, 2, 1); ctx.fillRect(x + 4, y, 2, 1);
    ctx.fillRect(x, y + 1, 7, 2);
    ctx.fillRect(x + 1, y + 3, 5, 1);
    ctx.fillRect(x + 2, y + 4, 3, 1);
    ctx.fillRect(x + 3, y + 5, 1, 1);
  }

  const HEAT_WORDS = ['QUIET', 'GOSSIP', 'WATCHED', 'MILITIA', 'BOUNTY'];
  const HEAT_COLORS = ['#6cbc50', '#d8c050', '#e08838', '#d84838', '#f03020'];
  function drawHud() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, HUD_H);
    // minimap: the county in gray, you in green
    ctx.fillStyle = '#7c7c7c';
    ctx.fillRect(8, 7, 72, 34);
    const mp = miniPos(player.x, player.y, map.width * TILE, map.height * TILE, 72, 34);
    ctx.fillStyle = '#80d010';
    ctx.fillRect(8 + mp.x, 7 + mp.y, 3, 3);
    const eff = effectiveLevel(state.hueCry, state.player.coat);
    ctx.font = '8px monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = HEAT_COLORS[eff] || '#6cbc50';
    ctx.fillText(HEAT_WORDS[eff] || 'QUIET', 8, 41 - 8 + 8);
    // silver: a coin pictograph and a count
    ctx.fillStyle = '#f8b800';
    ctx.beginPath(); ctx.arc(108, 14, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a87000';
    ctx.fillRect(106, 12, 1, 1);
    ctx.fillStyle = '#fff';
    ctx.fillText('x' + state.player.coin, 116, 10);
    ctx.fillText('DAY ' + state.clock.day, 104, 24);
    ctx.fillText(fmtHour(state.clock.hour), 104, 34);
    // the word and the coat, center
    ctx.fillStyle = '#88b8f8';
    ctx.fillText((state.player.coat || 'drover').toUpperCase() + ' COAT', 170, 10);
    ctx.fillStyle = '#8c8c8c';
    ctx.fillText('E TALK  I SATCHEL  J JOURNAL', 170, 24);
    if (state.player.sight > 0) { ctx.fillStyle = '#a0e8c0'; ctx.fillText('SIGHT ' + state.player.sight, 170, 34); }
    // -HALE- and the hearts, right, two rows of five
    ctx.fillStyle = '#d82820';
    ctx.fillText('-HALE-', 388, 6);
    for (let i = 0; i < state.player.maxHealth; i++) {
      drawHeart(372 + (i % 5) * 9, 17 + Math.floor(i / 5) * 8, i < state.player.health);
    }
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, HUD_H - 1, canvas.width, 1);
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, HUD_H);
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height - HUD_H);
    ctx.clip();
    const period = periodFor(state.clock.hour);
    const sheet = art.ready ? (art.tiles[period] || art.tiles.day) : null;
    const x0 = Math.floor(cam.x / TILE), y0 = Math.floor(cam.y / TILE);
    const x1 = Math.min(map.width, x0 + Math.ceil(canvas.width / TILE) + 1);
    const y1 = Math.min(map.height, y0 + Math.ceil(canvas.height / TILE) + 1);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const gid = map.gidAt('ground', x, y);
      if (!gid) continue;
      if (sheet) {
        const sy = (gid === 2 || gid === 14) && Math.floor(performance.now() / 600) % 2 ? TILE : 0;
        ctx.drawImage(sheet, (gid - 1) * TILE, sy, TILE, TILE, x * TILE - cam.x, y * TILE - cam.y, TILE, TILE);
      }
      else { ctx.fillStyle = GID_COLORS[gid] || '#333'; ctx.fillRect(x * TILE - cam.x, y * TILE - cam.y, TILE, TILE); }
    }
    for (const it of interactables) {
      if (it.used) continue;
      if (it.type === 'wisp') {
        if (state.player.sight >= 1) {
          const pulse = 3 + Math.sin(performance.now() / 180 + it.id) * 1.5;
          ctx.fillStyle = 'rgba(180,220,200,0.9)';
          ctx.beginPath();
          ctx.arc(it.x - cam.x + 8, it.y - cam.y + 8, pulse, 0, Math.PI * 2);
          ctx.fill();
        }
        continue;
      }
      if (it.type === 'murmur' || it.type === 'sleeprough') continue;
      ctx.fillStyle = '#b09a4f';
      ctx.fillRect(it.x - cam.x + 5, it.y - cam.y + 5, 6, 6);
    }
    for (const w of (state.wards || [])) {
      if (w.map !== state.map) continue;
      ctx.strokeStyle = state.player.sight >= 2 ? '#9fd8b0' : '#6e5a35';
      ctx.strokeRect(w.x - cam.x + 3, w.y - cam.y + 3, 10, 10);
    }
    for (const n of npcs) {
      const nsheet = n.props.pursuer ? art.sprites.constable
        : (art.sprites['npc_' + n.props.npcId] || art.sprites.npc);
      drawChar(nsheet, n.x, n.y, 0, false, n.props.pursuer ? '#5f7a8a' : '#8a7f5f');
    }
    if (state.pet && art.sprites[state.pet]) {
      ctx.drawImage(art.sprites[state.pet], (Math.floor(performance.now() / 300) % 2) * 10, 0, 10, 8,
                    Math.round(pet.x - cam.x + 3), Math.round(pet.y - cam.y + 8), 10, 8);
    }
    const psheet = art.sprites['player_' + state.player.coat] || art.sprites.player_drover;
    drawChar(psheet, player.x, player.y, frameFor(player.walked), player.flip, '#d8cfb8');

    ctx.restore();
    // the mountain watches the town: parallax ridge along the north edge, under the band
    if (state.map === 'town' && art.sprites.ridge) {
      ctx.save();
      ctx.translate(0, HUD_H);
      const r = art.sprites.ridge;
      const off = Math.floor(cam.x * 0.25) % r.width;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(r, -off, 0);
      ctx.drawImage(r, -off + r.width, 0);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // dithered lantern darkness after dusk, outdoors
    const caveDark = state.map === 'caves';
    if ((caveDark || ((period === 'night' || period === 'dusk') && state.map === 'town')) && art.sprites.lantern && !state.flags.cheatLanterns) {
      dctx.clearRect(0, 0, darkCanvas.width, darkCanvas.height);
      dctx.fillStyle = caveDark ? 'rgba(4,4,10,0.80)' : period === 'night' ? 'rgba(8,10,30,0.62)' : 'rgba(30,16,36,0.30)';
      dctx.fillRect(0, HUD_H, darkCanvas.width, darkCanvas.height - HUD_H);
      dctx.globalCompositeOperation = 'destination-out';
      dctx.drawImage(art.sprites.lantern, Math.round(player.x - cam.x) - 56, HUD_H + Math.round(player.y - cam.y) - 52);
      dctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(darkCanvas, 0, 0);
    } else {
      const TINTS = { dawn: 'rgba(200,140,90,0.10)', day: null, dusk: null, night: null };
      const tint = TINTS[period];
      if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, HUD_H, canvas.width, canvas.height - HUD_H); }
    }
    drawHud();
  }

  function openCreator() {
    openPanel('WHO WALKS INTO CUMBERLAND', body => {
      const picks = { origin: 'drover', trade: 'surveyor', burden: 'debt' };
      for (const [key, defs] of [['origin', ORIGINS], ['trade', TRADES], ['burden', BURDENS]]) {
        const div = document.createElement('div');
        div.className = 'row';
        const label = document.createElement('span');
        label.textContent = key.toUpperCase();
        const sel = document.createElement('select');
        for (const [id, d] of Object.entries(defs)) {
          const opt = document.createElement('option');
          opt.value = id; opt.textContent = d.name;
          sel.appendChild(opt);
        }
        sel.value = picks[key];
        sel.addEventListener('change', () => { picks[key] = sel.value; });
        div.appendChild(label); div.appendChild(sel);
        body.appendChild(div);
      }
      row(body, 'Every choice is mechanical: standing, tools, words, and one weight to carry.', '', [['Walk in', () => {
        state = buildCharacter(state, picks, REG);
        creatorOpen = false;
        panelEl.classList.remove('open');
        refreshHud();
        storeLocal(state, localStorage);
        toast('Cumberland, 1800, at dusk. Arrows or WASD walk, E speaks and touches, I is your satchel, J your journal. The journal keeps THE TRAIL if you lose the thread.');
        if (state.player.sight >= 1) toast('And you were born with the Glimmer. The lights in the fog are not swamp gas, and never were.');
      }]]);
    });
  }

  refreshHud();
  createLoop(update, render).start();

  const splashEl = document.getElementById('splash');
  splashOpen = true;
  function dismissSplash() {
    if (!splashOpen) return;
    splashOpen = false;
    splashEl.classList.add('gone');
    ambience.boot();
    window.removeEventListener('keydown', dismissSplash, true);
    splashEl.removeEventListener('click', dismissSplash);
    setTimeout(() => { splashEl.style.display = 'none'; if (creatorOpen) openCreator(); }, 650);
  }
  window.addEventListener('keydown', dismissSplash, true);
  splashEl.addEventListener('click', dismissSplash);
  log('slice started, version', VERSION);
}

start().catch(err => {
  console.error(err);
  alert('The game could not start: ' + err.message);
});

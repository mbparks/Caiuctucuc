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
import { fitScale, fmtHour } from './engine/scale.js';
import { acceptJob, workJob, JOBS } from './game/jobs.js';
import { newRumor, knows } from './game/gossip.js';
import { applyTrust } from './game/trust.js';
import { addItem, removeItem, equip, toStash, fromStash, countOf, SATCHEL_SIZE } from './game/inventory.js';
import { wearItem, fieldRepair, restore, restoreFee } from './game/condition.js';
import { RECIPES, craft, canCraft } from './game/crafting.js';
import { buyPrice, sellPrice } from './game/economy.js';

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
function refreshHud() {
  const eff = effectiveLevel(state.hueCry, state.player.coat);
  hudHeat.textContent = LEVELS[eff].toUpperCase();
  hudHeat.dataset.hot = eff >= 2 ? '1' : '';
  hudCoin.textContent = state.player.coin + ' silver';
  hudClock.textContent = 'day ' + state.clock.day + ', ' + fmtHour(state.clock.hour);
  hudCoat.textContent = state.player.coat + ' coat';
}

// ---- toast ----
const toastEl = document.getElementById('toast');
let toastTimer = null;
function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
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
  journalBody.innerHTML =
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

// ---- world ----
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.focus();

// pixel-perfect presentation: internal 480x320, scaled by whole integers
const stage = document.getElementById('stage');
function fitCanvas() {
  const s = fitScale(stage.clientWidth, stage.clientHeight, canvas.width, canvas.height);
  canvas.style.width = Math.floor(canvas.width * s) + 'px';
  canvas.style.height = Math.floor(canvas.height * s) + 'px';
}
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

  let map, TILE, cam, spawn, npcs, interactables, spots, doorObjects;
  const player = { x: 0, y: 0, speed: 70, walked: 0, flip: false };
  let surrenderable = false;

  async function switchMap(target, spawnName) {
    map = await loadMap('assets/maps/' + target + '.json');
    TILE = map.tileWidth;
    cam = createCamera(canvas.width, canvas.height, map.width * TILE, map.height * TILE);
    spawn = map.findObject('spawns', spawnName || 'player')
         || map.findObject('spawns', 'player')
         || map.findObject('spawns', 'entry')
         || { x: TILE * 2, y: TILE * 2 };
    npcs = (map.objects.spawns || []).filter(o => o.type === 'npc')
      .map(o => ({ ...o, home: { x: o.x, y: o.y } }));
    interactables = (map.objects.interact || []).map(o => ({ ...o, used: o.props.once ? Boolean(state.flags['used_' + o.id]) : false }));
    doorObjects = (map.objects.doors || []);
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
    if (d) return 'Press E to enter ' + d.name;
    const it = near(interactables.filter(o => !o.used), 24);
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
    if (it.type === 'laylow') return 'Press E to lay low at ' + it.name;
    return 'Press E';
  }

  function doInteract() {
    const n = near(npcs, 28);
    if (n) { loadDialog(n.props.npcId).then(d => d && openDialog(d)); return; }
    const d = near(doorObjects, 20);
    if (d) { switchMap(d.props.target, d.props.spawn).then(() => { refreshHud(); storeLocal(state, localStorage); }); return; }
    const it = near(interactables.filter(o => !o.used), 24);
    if (!it) return;
    if (it.type === 'steal') {
      if (it.props.once) { it.used = true; state.flags['used_' + it.id] = true; }
      state.player.coin += it.props.coin || 0;
      state.hueCry = { ...addHeat(state.hueCry, it.props.heat || 0), witnessedCoat: state.player.coat };
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
    } else if (it.type === 'job') {
      if (!state.job || state.job.id !== it.props.job) { toast('Not your errand, presently.'); refreshHud(); return; }
      const r = workJob(state, it.props.job, it.props.stage, state.clock.hour);
      state = r.state;
      if (r.heat) state.hueCry = { ...addHeat(state.hueCry, r.heat), witnessedCoat: state.player.coat };
      if (!state.job) state.flags['job_' + it.props.job] = true;
      toast(r.text);
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
      ambience.setScene(periodFor(state.clock.hour));
      toast('You take the corner room and let ' + (it.props.hours || 6) + ' hours pass. The street cools.');
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
          toast(def.consume);
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

  let saveTimer = 0;
  let clockAcc = 0;
  function update(dt) {
    if (talking) return;
    const h = surrenderable ? 'Press Q to surrender' : hintFor();
    hintEl.textContent = h || '';
    hintEl.classList.toggle('show', Boolean(h));

    const v = player.speed * dt;
    const ox = player.x, oy = player.y;
    if (input.has('up')) tryMove(0, -v);
    if (input.has('down')) tryMove(0, v);
    if (input.has('left')) { tryMove(-v, 0); player.flip = true; }
    if (input.has('right')) { tryMove(v, 0); player.flip = false; }
    player.walked += Math.abs(player.x - ox) + Math.abs(player.y - oy);

    // the clock turns; heat cools slowly with time on the street
    clockAcc += dt * HOURS_PER_SECOND;
    if (clockAcc >= 0.25) {
      state.clock = advance(state.clock, clockAcc);
      clockAcc = 0;
      ambience.setScene(periodFor(state.clock.hour));
      refreshHud();
    }
    if (state.hueCry.heat > 0) {
      const cooled = decay(state.hueCry, dt * HOURS_PER_SECOND);
      if (cooled.level !== state.hueCry.level) refreshHud();
      state.hueCry = cooled;
    }

    // schedules move the town; the constable acts on what the street can recognize
    const eff = effectiveLevel(state.hueCry, state.player.coat);
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

  function render() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const period = periodFor(state.clock.hour);
    const sheet = art.ready ? (art.tiles[period] || art.tiles.day) : null;
    const x0 = Math.floor(cam.x / TILE), y0 = Math.floor(cam.y / TILE);
    const x1 = Math.min(map.width, x0 + Math.ceil(canvas.width / TILE) + 1);
    const y1 = Math.min(map.height, y0 + Math.ceil(canvas.height / TILE) + 1);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const gid = map.gidAt('ground', x, y);
      if (!gid) continue;
      if (sheet) ctx.drawImage(sheet, (gid - 1) * TILE, 0, TILE, TILE, x * TILE - cam.x, y * TILE - cam.y, TILE, TILE);
      else { ctx.fillStyle = GID_COLORS[gid] || '#333'; ctx.fillRect(x * TILE - cam.x, y * TILE - cam.y, TILE, TILE); }
    }
    for (const it of interactables) {
      if (it.used) continue;
      ctx.fillStyle = '#b09a4f';
      ctx.fillRect(it.x - cam.x + 5, it.y - cam.y + 5, 6, 6);
    }
    for (const n of npcs) {
      const nsheet = n.props.pursuer ? art.sprites.constable : art.sprites.npc;
      drawChar(nsheet, n.x, n.y, 0, false, n.props.pursuer ? '#5f7a8a' : '#8a7f5f');
    }
    const psheet = art.sprites['player_' + state.player.coat] || art.sprites.player_drover;
    drawChar(psheet, player.x, player.y, frameFor(player.walked), player.flip, '#d8cfb8');

    // the mountain watches the town: parallax ridge along the north edge
    if (state.map === 'town' && art.sprites.ridge) {
      const r = art.sprites.ridge;
      const off = Math.floor(cam.x * 0.25) % r.width;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(r, -off, 0);
      ctx.drawImage(r, -off + r.width, 0);
      ctx.globalAlpha = 1;
    }

    // dithered lantern darkness after dusk, outdoors
    if ((period === 'night' || period === 'dusk') && state.map === 'town' && art.sprites.lantern) {
      dctx.clearRect(0, 0, darkCanvas.width, darkCanvas.height);
      dctx.fillStyle = period === 'night' ? 'rgba(8,10,30,0.62)' : 'rgba(30,16,36,0.30)';
      dctx.fillRect(0, 0, darkCanvas.width, darkCanvas.height);
      dctx.globalCompositeOperation = 'destination-out';
      dctx.drawImage(art.sprites.lantern, Math.round(player.x - cam.x) - 56, Math.round(player.y - cam.y) - 52);
      dctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(darkCanvas, 0, 0);
    } else {
      const TINTS = { dawn: 'rgba(200,140,90,0.10)', day: null, dusk: null, night: null };
      const tint = TINTS[period];
      if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    }
  }

  refreshHud();
  createLoop(update, render).start();
  log('slice started, version', VERSION);
}

start().catch(err => {
  console.error(err);
  alert('The game could not start: ' + err.message);
});

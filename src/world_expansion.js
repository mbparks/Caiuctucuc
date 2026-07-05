// World expansion UI: district travel, case board, law actions, mountain attention, and story pressure.
import { SAVE_KEY, deserialize, storeLocal } from './game/save.js';
import { GENERATED_MAP_IDS } from './game/generated_maps.js';
import { boardThreads, openLeads, trialReadiness, contradictions, supernaturalTruths, legalProof } from './game/case_board.js';
import { lawStage, witnessMemory, bribeRunner, changeCoatAction, hideOnTowpath } from './game/law.js';
import { mountainAttention, attentionBand, mountainEvent } from './game/mountain_attention.js';
import { dogLead, mountainWorldEffects, pressureStage } from './game/story_world.js';

const MAP_LABELS = {
  town: 'Baltimore Street', canal: 'Canal Basin and Wills Creek', rail_yard: 'B&O Rail Yard',
  quarry: 'Cumberland Quarry', wills_mountain: 'Wills Mountain', cave_chain: 'Cumberland Bone Cave Approach',
  cathedral: 'Cumberland Bone Cave'
};

const MAP_TEXT = {
  town: 'Market, courthouse, tavern, jobs, law, gossip, and physical roads outward.',
  canal: 'Waterfront freight, Tam Hollis, towpath work, and escape across water.',
  rail_yard: 'Coal cars, depot scale, manifest clues, and industrial danger.',
  quarry: 'The Wills Creek Formation quarry: singing stone, bootprints, Gantt pressure, seam clues, and benchmarks.',
  wills_mountain: 'Animal signs, lights, folk wards, SIGHT tests, and the cave path.',
  cave_chain: 'The marked way toward the real Bone Cave: echoes, water, old fort stone, and sealed limestone.',
  cathedral: 'The Cumberland Bone Cave, reimagined as Nan Trent and the final choice.'
};

function readState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? deserialize(raw) : null;
  } catch {
    return null;
  }
}

function writeState(state) {
  storeLocal(state, localStorage);
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function addStyle() {
  if (document.getElementById('worldExpansionCss')) return;
  const style = document.createElement('style');
  style.id = 'worldExpansionCss';
  style.textContent = `
    #worldBtn,#caseBtn,#lawBtn{border-color:#9a4a32}#dreadPip{font-size:.78rem;color:#d8cfb8;border:1px solid #7a715c;padding:.22rem .5rem;background:#1d1a14;cursor:pointer}
    .world-modal{position:absolute;z-index:62;left:50%;top:4.2rem;transform:translateX(-50%);width:min(46rem,94vw);max-height:78vh;overflow:auto;background:#1d1a14;border:1px solid #7a715c;color:#d8cfb8;box-shadow:0 14px 50px rgba(0,0,0,.65);padding:1rem 1.2rem;display:none}.world-modal.open{display:block}
    .world-modal h2{margin:.2rem 0 .8rem;color:#9a4a32;font-weight:normal;letter-spacing:.22em;font-size:.9rem}.world-modal p{line-height:1.45}.world-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:.65rem}.world-card{border:1px solid #7a715c;background:#14120e;padding:.7rem}.world-card b{display:block;margin-bottom:.25rem}.world-card button{margin-top:.45rem}.world-thread{border-left:3px solid #9a4a32;background:#14120e;margin:.55rem 0;padding:.55rem .7rem}.world-card small,.world-thread small{color:#aaa087}.world-close{float:right}`;
  document.head.appendChild(style);
}

function modal(id, title) {
  let box = document.getElementById(id);
  if (!box) {
    box = el('div', 'world-modal');
    box.id = id;
    document.getElementById('wrap').appendChild(box);
  }
  box.replaceChildren();
  const close = el('button', 'world-close', 'Close');
  close.addEventListener('click', () => box.classList.remove('open'));
  box.appendChild(close);
  box.appendChild(el('h2', '', title));
  return box;
}

function card(title, text) {
  const c = el('div', 'world-card');
  c.appendChild(el('b', '', title));
  c.appendChild(el('small', '', text));
  return c;
}

function section(box, title, rows, empty) {
  const div = el('div', 'world-thread');
  div.appendChild(el('b', '', title));
  if (!rows.length) div.appendChild(el('small', '', empty));
  for (const row of rows) div.appendChild(el('p', '', typeof row === 'string' ? row : row.text || row.label || row.name));
  box.appendChild(div);
}

function reloadTo(mapId) {
  const state = readState();
  if (!state) return;
  state.map = mapId;
  writeState(state);
  location.reload();
}

function showWorld() {
  const state = readState();
  const box = modal('worldModal', 'CUMBERLAND PLACES');
  box.appendChild(el('p', '', 'The primary route is physical: road signs and map-edge exits connect Baltimore Street, the canal, rail yard, Cumberland Quarry, Wills Mountain, and Cumberland Bone Cave. The names here now favor real Cumberland-area places over invented district titles.'));
  const grid = el('div', 'world-grid');
  for (const mapId of ['town', ...GENERATED_MAP_IDS]) {
    const c = card(MAP_LABELS[mapId] || mapId, MAP_TEXT[mapId] || 'A road not yet written down.');
    const button = el('button', '', state?.map === mapId ? 'Here now' : 'Travel');
    button.disabled = state?.map === mapId;
    button.addEventListener('click', () => reloadTo(mapId));
    c.appendChild(document.createElement('br'));
    c.appendChild(button);
    grid.appendChild(c);
  }
  box.appendChild(grid);
  box.classList.add('open');
}

function showCase() {
  const state = readState();
  const box = modal('caseModal', 'CASE BOARD');
  if (!state) { box.appendChild(el('p', '', 'No save loaded.')); box.classList.add('open'); return; }
  const ready = trialReadiness(state);
  box.appendChild(el('p', '', 'Evidence score: ' + ready.score + '. ' + ready.advice));
  section(box, 'Contradictions', contradictions(state), 'No contradictions established yet. Find facts that cannot all be true.');
  section(box, 'Legal proof', legalProof(state), 'No hard proof yet. The town will believe fear before it believes you.');
  section(box, 'True but not proof', supernaturalTruths(state), 'No supernatural file yet, or nothing you can separate from rumor.');
  const preview = ready.preview;
  section(box, 'Accusation logic', [preview.cleanText, preview.supernaturalText], 'No accusation can be tested yet.');
  for (const thread of boardThreads(state)) {
    const div = el('div', 'world-thread');
    div.appendChild(el('b', '', thread.label));
    for (const c of thread.cards) div.appendChild(el('p', '', c.name + ': ' + c.text));
    box.appendChild(div);
  }
  section(box, 'Open leads', openLeads(state), 'No obvious leads remain. Lay the case or follow the mountain.');
  box.classList.add('open');
}

function applyLawAction(action) {
  const state = readState();
  if (!state) return;
  const result = action(state);
  const box = document.getElementById('lawModal');
  if (result.ok) writeState(result.state);
  if (box) box.appendChild(el('p', '', result.text));
  setTimeout(() => location.reload(), 650);
}

function showLaw() {
  const state = readState();
  const box = modal('lawModal', 'LAW AND HEAT');
  if (!state) { box.appendChild(el('p', '', 'No save loaded.')); box.classList.add('open'); return; }
  const stage = lawStage(state);
  box.appendChild(el('p', '', stage.label + ': ' + stage.text));
  box.appendChild(el('p', '', witnessMemory(state)));
  const p = pressureStage(state);
  box.appendChild(el('p', '', 'Gantt pressure: ' + p.label + '. ' + p.text));
  const actions = el('div', 'world-grid');
  const bribe = card('Pay a street runner', 'Costs 2 silver and cools the story.');
  const bb = el('button', '', 'Pay 2 silver'); bb.addEventListener('click', () => applyLawAction(bribeRunner)); bribe.appendChild(document.createElement('br')); bribe.appendChild(bb);
  const coat = card('Change coat', 'Shift what witnesses are looking for.');
  const cb = el('button', '', 'Change coat'); cb.addEventListener('click', () => applyLawAction(changeCoatAction)); coat.appendChild(document.createElement('br')); coat.appendChild(cb);
  const hide = card('Hide on the towpath', 'Lose two hours and cool heat.');
  const hb = el('button', '', 'Hide two hours'); hb.addEventListener('click', () => applyLawAction(hideOnTowpath)); hide.appendChild(document.createElement('br')); hide.appendChild(hb);
  actions.appendChild(bribe); actions.appendChild(coat); actions.appendChild(hide);
  box.appendChild(actions);
  box.classList.add('open');
}

function showMountain() {
  const state = readState();
  const box = modal('mountainModal', 'MOUNTAIN AND COMPANION');
  if (!state) { box.appendChild(el('p', '', 'No save loaded.')); box.classList.add('open'); return; }
  const m = mountainWorldEffects(state);
  box.appendChild(el('p', '', 'Mountain Attention ' + m.score + ': ' + m.band.label + '. ' + m.band.text));
  section(box, 'World effects', m.effects, 'The mountain is quiet enough to pass for scenery.');
  const dog = dogLead(state);
  section(box, 'Dog lead', [dog.text], 'No companion lead.');
  const p = pressureStage(state);
  section(box, 'Gantt pressure', [p.text], 'No pressure yet.');
  box.classList.add('open');
}

function updateDread() {
  const state = readState();
  const pip = document.getElementById('dreadPip');
  if (!state || !pip) return;
  const score = mountainAttention(state);
  const band = attentionBand(score);
  pip.textContent = 'Mountain: ' + band.label;
  pip.title = band.text + ' Click for mountain, dog, and Gantt pressure.';
}

function maybeToastOnce(key, text, ms = 5200) {
  if (!text || sessionStorage.getItem(key) === text) return;
  sessionStorage.setItem(key, text);
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), ms);
  }
}

function maybeStoryToasts() {
  const state = readState();
  if (!state) return;
  maybeToastOnce('caiuctucuc-mountain-event', mountainEvent(state));
  const p = pressureStage(state);
  if (p.level >= 2) maybeToastOnce('caiuctucuc-gantt-pressure', 'Gantt pressure: ' + p.text);
  const dog = dogLead(state);
  if (dog.active && state.pet === 'dog') maybeToastOnce('caiuctucuc-dog-lead', dog.text, 4200);
}

function init() {
  addStyle();
  const header = document.querySelector('header');
  const menuBtn = document.getElementById('menuBtn');
  if (!header || document.getElementById('worldBtn')) return;
  const worldBtn = el('button', '', 'Places'); worldBtn.id = 'worldBtn'; worldBtn.addEventListener('click', showWorld);
  const caseBtn = el('button', '', 'Case Board'); caseBtn.id = 'caseBtn'; caseBtn.addEventListener('click', showCase);
  const lawBtn = el('button', '', 'Law'); lawBtn.id = 'lawBtn'; lawBtn.addEventListener('click', showLaw);
  const dread = el('span', '', 'Mountain'); dread.id = 'dreadPip'; dread.addEventListener('click', showMountain);
  header.insertBefore(worldBtn, menuBtn);
  header.insertBefore(caseBtn, menuBtn);
  header.insertBefore(lawBtn, menuBtn);
  header.insertBefore(dread, menuBtn);
  updateDread();
  setInterval(updateDread, 3000);
  setTimeout(maybeStoryToasts, 2000);
}

init();

// World expansion UI: district travel, case board, law actions, and mountain attention.
import { SAVE_KEY, deserialize, storeLocal } from './game/save.js';
import { GENERATED_MAP_IDS } from './game/generated_maps.js';
import { boardThreads, openLeads, trialReadiness } from './game/case_board.js';
import { lawStage, witnessMemory, bribeRunner, changeCoatAction, hideOnTowpath } from './game/law.js';
import { mountainAttention, attentionBand, mountainEvent } from './game/mountain_attention.js';

const MAP_LABELS = {
  town: 'Baltimore Street', canal: 'Canal Basin and Wills Creek', rail_yard: 'B&O Rail Yard',
  quarry: 'Quarry Deep Cut', wills_mountain: 'Wills Mountain', cave_chain: 'Marked Caves',
  cathedral: 'Cold Cathedral'
};

const MAP_TEXT = {
  town: 'Market, courthouse, tavern, jobs, law, and gossip.',
  canal: 'Waterfront freight, Tam Hollis, towpath work, and escape across water.',
  rail_yard: 'Coal cars, depot scale, manifest clues, and industrial danger.',
  quarry: 'Singing stone, bootprints, Gantt pressure, seam clues, and benchmarks.',
  wills_mountain: 'Animal signs, lights, folk wards, SIGHT tests, and the cave mouth.',
  cave_chain: 'The sealed way under the mountain, echoes, water, and old fort stone.',
  cathedral: 'Nan Trent and the final choice.'
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
    #worldBtn,#caseBtn,#lawBtn{border-color:#9a4a32}#dreadPip{font-size:.78rem;color:#d8cfb8;border:1px solid #7a715c;padding:.22rem .5rem;background:#1d1a14}
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

function reloadTo(mapId) {
  const state = readState();
  if (!state) return;
  state.map = mapId;
  writeState(state);
  location.reload();
}

function showWorld() {
  const state = readState();
  const box = modal('worldModal', 'CUMBERLAND DISTRICTS');
  const intro = el('p', '', 'Travel by road, towpath, rail spur, and mountain track. Districts are full maps with NPCs, doors, clues, jobs, and hazards.');
  box.appendChild(intro);
  const grid = el('div', 'world-grid');
  for (const mapId of ['town', ...GENERATED_MAP_IDS]) {
    const card = el('div', 'world-card');
    card.appendChild(el('b', '', MAP_LABELS[mapId] || mapId));
    card.appendChild(el('small', '', MAP_TEXT[mapId] || 'A road not yet written down.'));
    const button = el('button', '', state?.map === mapId ? 'Here now' : 'Travel');
    button.disabled = state?.map === mapId;
    button.addEventListener('click', () => reloadTo(mapId));
    card.appendChild(document.createElement('br'));
    card.appendChild(button);
    grid.appendChild(card);
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
  for (const thread of boardThreads(state)) {
    const div = el('div', 'world-thread');
    div.appendChild(el('b', '', thread.label));
    for (const c of thread.cards) div.appendChild(el('p', '', c.name + ': ' + c.text));
    box.appendChild(div);
  }
  const leads = openLeads(state);
  const leadBox = el('div', 'world-card');
  leadBox.appendChild(el('b', '', 'Open leads'));
  if (!leads.length) leadBox.appendChild(el('small', '', 'No obvious leads remain. Lay the case or follow the mountain.'));
  for (const lead of leads) leadBox.appendChild(el('p', '', lead));
  box.appendChild(leadBox);
  box.classList.add('open');
}

function applyLawAction(action) {
  const state = readState();
  if (!state) return;
  const result = action(state);
  const box = document.getElementById('lawModal');
  if (result.ok) writeState(result.state);
  if (box) {
    const msg = el('p', '', result.text);
    box.appendChild(msg);
  }
  setTimeout(() => location.reload(), 650);
}

function showLaw() {
  const state = readState();
  const box = modal('lawModal', 'LAW AND HEAT');
  if (!state) { box.appendChild(el('p', '', 'No save loaded.')); box.classList.add('open'); return; }
  const stage = lawStage(state);
  box.appendChild(el('p', '', stage.label + ': ' + stage.text));
  box.appendChild(el('p', '', witnessMemory(state)));
  const actions = el('div', 'world-grid');
  const bribe = el('div', 'world-card'); bribe.appendChild(el('b', '', 'Pay a street runner')); bribe.appendChild(el('small', '', 'Costs 2 silver and cools the story.'));
  const bb = el('button', '', 'Pay 2 silver'); bb.addEventListener('click', () => applyLawAction(bribeRunner)); bribe.appendChild(document.createElement('br')); bribe.appendChild(bb);
  const coat = el('div', 'world-card'); coat.appendChild(el('b', '', 'Change coat')); coat.appendChild(el('small', '', 'Shift what witnesses are looking for.'));
  const cb = el('button', '', 'Change coat'); cb.addEventListener('click', () => applyLawAction(changeCoatAction)); coat.appendChild(document.createElement('br')); coat.appendChild(cb);
  const hide = el('div', 'world-card'); hide.appendChild(el('b', '', 'Hide on the towpath')); hide.appendChild(el('small', '', 'Lose two hours and cool heat.'));
  const hb = el('button', '', 'Hide two hours'); hb.addEventListener('click', () => applyLawAction(hideOnTowpath)); hide.appendChild(document.createElement('br')); hide.appendChild(hb);
  actions.appendChild(bribe); actions.appendChild(coat); actions.appendChild(hide);
  box.appendChild(actions);
  box.classList.add('open');
}

function updateDread() {
  const state = readState();
  const pip = document.getElementById('dreadPip');
  if (!state || !pip) return;
  const score = mountainAttention(state);
  const band = attentionBand(score);
  pip.textContent = 'Mountain: ' + band.label;
  pip.title = band.text;
}

function maybeMountainToast() {
  const state = readState();
  if (!state) return;
  const text = mountainEvent(state);
  if (!text || sessionStorage.getItem('caiuctucuc-mountain-event') === text) return;
  sessionStorage.setItem('caiuctucuc-mountain-event', text);
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5200);
  }
}

function init() {
  addStyle();
  const header = document.querySelector('header');
  const menuBtn = document.getElementById('menuBtn');
  if (!header || document.getElementById('worldBtn')) return;
  const worldBtn = el('button', '', 'Districts'); worldBtn.id = 'worldBtn'; worldBtn.addEventListener('click', showWorld);
  const caseBtn = el('button', '', 'Case Board'); caseBtn.id = 'caseBtn'; caseBtn.addEventListener('click', showCase);
  const lawBtn = el('button', '', 'Law'); lawBtn.id = 'lawBtn'; lawBtn.addEventListener('click', showLaw);
  const dread = el('span', '', 'Mountain'); dread.id = 'dreadPip';
  header.insertBefore(worldBtn, menuBtn);
  header.insertBefore(caseBtn, menuBtn);
  header.insertBefore(lawBtn, menuBtn);
  header.insertBefore(dread, menuBtn);
  updateDread();
  setInterval(updateDread, 3000);
  setTimeout(maybeMountainToast, 2000);
}

init();

// Unified Case File. The player now has one investigation surface: J opens the
// Case File, and the old Case Board content lives inside it as the Board tab.
import { SAVE_KEY, deserialize } from './game/save.js';
import { boardThreads, openLeads, trialReadiness, contradictions, supernaturalTruths, legalProof } from './game/case_board.js';

const HOOKED = Symbol.for('caiuctucuc.caseFileHooked');
let renderingBoard = false;

function readState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? deserialize(raw) : null;
  } catch {
    return null;
  }
}

function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function addStyle() {
  if (document.getElementById('caseFileUnifiedCss')) return;
  const style = document.createElement('style');
  style.id = 'caseFileUnifiedCss';
  style.textContent = `
    #journal .jtab[data-tab="board"] {
      color: #5a2a1a;
    }
    #journal .case-board-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      gap: .5rem;
      margin-bottom: .75rem;
    }
    #journal .case-meter {
      background: #e6ddc4;
      border: 1px solid #a89870;
      border-left: 3px solid #7a3a2a;
      padding: .5rem .6rem;
    }
    #journal .case-meter b {
      display: block;
      color: #5a2a1a;
      letter-spacing: .12em;
      text-transform: uppercase;
      font-size: .68rem;
      margin-bottom: .2rem;
    }
    #journal .case-meter span {
      display: block;
      font-size: .8rem;
      line-height: 1.35;
    }
    #journal .board-section {
      border-left: 3px solid #7a3a2a;
      background: rgba(230,221,196,.62);
      padding: .55rem .65rem;
      margin: .48rem 0;
    }
    #journal .board-section b {
      display: block;
      color: #5a2a1a;
      letter-spacing: .16em;
      text-transform: uppercase;
      font-size: .68rem;
      margin-bottom: .28rem;
    }
    #journal .board-section p,
    #journal .board-section li {
      font-size: .82rem;
      line-height: 1.35;
    }
    #journal .board-section p {
      margin: .28rem 0;
    }
    #journal .board-section ol,
    #journal .board-section ul {
      margin: .3rem 0 .2rem 1.1rem;
      padding: 0;
    }
  `;
  document.head.appendChild(style);
}

function section(title, rows, empty) {
  const items = rows.length
    ? rows.map(row => '<p>' + esc(typeof row === 'string' ? row : row.text || row.label || row.name || '') + '</p>').join('')
    : '<p class="empty">' + esc(empty) + '</p>';
  return '<div class="board-section"><b>' + esc(title) + '</b>' + items + '</div>';
}

function threadSection(thread) {
  const cards = thread.cards.length
    ? '<ol>' + thread.cards.map(c => '<li><b style="display:inline;letter-spacing:0;text-transform:none;font-size:.82rem">' + esc(c.name) + '</b>: ' + esc(c.text) + '</li>').join('') + '</ol>'
    : '<p class="empty">No evidence filed here.</p>';
  return '<div class="board-section"><b>' + esc(thread.label) + '</b>' + cards + '</div>';
}

function renderBoard() {
  const journal = document.getElementById('journal');
  const body = journal?.querySelector('.jbody');
  if (!journal || !body) return;
  const state = readState();
  renderingBoard = true;
  journal.dataset.unifiedTab = 'board';
  ensureBoardTab();
  journal.querySelectorAll('.jtab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'board'));

  if (!state) {
    body.innerHTML = '<p class="empty">No case file is loaded yet.</p>';
    renderingBoard = false;
    return;
  }

  const ready = trialReadiness(state);
  const preview = ready.preview;
  const threads = boardThreads(state);
  body.innerHTML =
    '<div class="case-board-summary">' +
      '<div class="case-meter"><b>Evidence weight</b><span>' + esc(String(ready.score)) + '</span></div>' +
      '<div class="case-meter"><b>Trial advice</b><span>' + esc(ready.advice) + '</span></div>' +
      '<div class="case-meter"><b>Case posture</b><span>' + esc(ready.ready ? 'Court-ready if you keep the accusation human.' : 'Not court-ready yet.') + '</span></div>' +
    '</div>' +
    section('Contradictions', contradictions(state), 'No contradictions established yet. Find facts that cannot all be true.') +
    section('Legal proof', legalProof(state), 'No hard proof yet. The town will believe fear before it believes you.') +
    section('True but not proof', supernaturalTruths(state), 'No supernatural file yet, or nothing you can separate from rumor.') +
    section('Accusation logic', [preview.cleanText, preview.supernaturalText], 'No accusation can be tested yet.') +
    (threads.length ? threads.map(threadSection).join('') : section('Evidence threads', [], 'No evidence cards filed yet.')) +
    section('Open leads', openLeads(state), 'No obvious leads remain. Lay the case or follow the mountain.');
  renderingBoard = false;
}

function ensureBoardTab() {
  const journal = document.getElementById('journal');
  const tabs = journal?.querySelector('.jtabs');
  if (!journal || !tabs) return;
  if (!tabs.querySelector('.jtab[data-tab="board"]')) {
    const tab = document.createElement('div');
    tab.className = 'jtab';
    tab.dataset.tab = 'board';
    tab.textContent = 'BOARD';
    tab.addEventListener('click', renderBoard);
    tabs.prepend(tab);
  }
  tabs.querySelectorAll('.jtab:not([data-tab="board"])').forEach(tab => {
    if (tab[HOOKED]) return;
    tab[HOOKED] = true;
    tab.addEventListener('click', () => { delete journal.dataset.unifiedTab; }, true);
  });
}

function enhanceJournal() {
  if (renderingBoard) return;
  ensureBoardTab();
  const journal = document.getElementById('journal');
  if (journal?.dataset.unifiedTab === 'board') renderBoard();
}

function openCaseFile(tab = 'board') {
  const journal = document.getElementById('journal');
  if (!journal) return;
  if (window.CAIUCTUCUC_CLOSE_OVERLAYS) window.CAIUCTUCUC_CLOSE_OVERLAYS('#journal');
  if (!journal.classList.contains('open')) {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ', key: 'j', bubbles: true, cancelable: true }));
  }
  setTimeout(() => {
    enhanceJournal();
    if (tab === 'board') renderBoard();
  }, 0);
}

function wireCaseButton() {
  const btn = document.getElementById('caseBtn');
  if (!btn || btn[HOOKED]) return;
  btn[HOOKED] = true;
  btn.textContent = 'Case File';
  btn.title = 'Open the unified investigation file';
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    openCaseFile('board');
  }, true);
}

function init() {
  addStyle();
  wireCaseButton();
  const journal = document.getElementById('journal');
  if (journal) {
    const observer = new MutationObserver(enhanceJournal);
    observer.observe(journal, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  window.addEventListener('caiuctucuc:open-case-file', e => openCaseFile(e.detail?.tab || 'board'));
  window.CAIUCTUCUC_OPEN_CASE_FILE = openCaseFile;
}

init();

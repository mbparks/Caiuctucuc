// One-overlay HUD manager. Feature modules were built independently, so this
// module coordinates them at the DOM level: opening one major panel closes the
// rest before it can stack on top.

const OVERLAY_SELECTORS = [
  '#panel', '#menu', '#journal', '#trailDeck', '#term', '.world-modal'
];

const TRIGGER_SELECTORS = [
  '#trailBtn', '#caseBtn', '#worldBtn', '#lawBtn', '#dreadPip', '#menuBtn',
  '#trailPulse button', '#commandCenter .cc-action'
];

function matchesAny(node, selectors) {
  return selectors.some(sel => node?.matches?.(sel));
}

function overlayId(node) {
  if (!node) return '';
  if (node.id) return '#' + node.id;
  return node.classList?.contains('world-modal') ? '.world-modal' : '';
}

function setExpanded(id, expanded) {
  const btn = document.getElementById(id);
  if (btn) btn.setAttribute('aria-expanded', String(expanded));
}

export function closeOverlays(except = null) {
  const exceptNode = typeof except === 'string' ? document.querySelector(except) : except;
  for (const node of document.querySelectorAll(OVERLAY_SELECTORS.join(','))) {
    if (!node || node === exceptNode || node.contains(exceptNode)) continue;
    node.classList.remove('open');
    node.setAttribute('aria-hidden', 'true');
  }
  setExpanded('trailBtn', false);
  const commandCenter = document.getElementById('commandCenter');
  const commandToggle = document.getElementById('commandToggle');
  if (commandCenter && commandCenter !== exceptNode && !commandCenter.contains(exceptNode)) {
    commandCenter.classList.remove('open');
    document.documentElement.classList.remove('commands-open');
    if (commandToggle) {
      commandToggle.setAttribute('aria-expanded', 'false');
      commandToggle.textContent = 'Commands';
    }
  }
}

export function closeCommandDrawer() {
  const commandCenter = document.getElementById('commandCenter');
  const commandToggle = document.getElementById('commandToggle');
  if (!commandCenter || !commandToggle) return;
  commandCenter.classList.remove('open');
  document.documentElement.classList.remove('commands-open');
  commandToggle.setAttribute('aria-expanded', 'false');
  commandToggle.textContent = 'Commands';
}

if (typeof window !== 'undefined') {
  window.CAIUCTUCUC_CLOSE_OVERLAYS = closeOverlays;
  window.CAIUCTUCUC_CLOSE_COMMANDS = closeCommandDrawer;
}

document.addEventListener('click', e => {
  const target = e.target instanceof Element ? e.target.closest(TRIGGER_SELECTORS.join(',')) : null;
  if (!target) return;
  if (target.id === 'commandToggle') return;
  // Let close buttons only close their own panel; they should not unexpectedly
  // clear the entire HUD state.
  if (target.classList.contains('world-close') || target.classList.contains('close')) return;
  closeOverlays();
}, true);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOverlays();
  if (['KeyT', 'KeyI', 'KeyJ'].includes(e.code)) closeOverlays();
}, true);

// Defensive cleanup for any already-stacked page after hot reload or cached UI.
setTimeout(() => {
  const open = [...document.querySelectorAll(OVERLAY_SELECTORS.join(','))].filter(n => n.classList.contains('open'));
  if (open.length <= 1) return;
  for (const node of open.slice(0, -1)) {
    node.classList.remove('open');
    node.setAttribute('aria-hidden', 'true');
  }
}, 0);

// Opening backstory screen. New games show postcard first, then this case
// introduction, then the character creator. Existing saves skip it.

const SAVE_KEY = 'caiuctucuc-save';
const STORY_FLAG = Symbol.for('caiuctucuc.openingStory');

function hasSave() {
  try { return Boolean(localStorage.getItem(SAVE_KEY)); }
  catch { return false; }
}

function addStyle() {
  if (document.getElementById('openingStoryCss')) return;
  const style = document.createElement('style');
  style.id = 'openingStoryCss';
  style.textContent = `
    #openingStory {
      position: absolute;
      inset: 0;
      z-index: 46;
      display: none;
      place-items: center;
      padding: min(4vw, 2rem);
      background:
        radial-gradient(circle at 20% 18%, rgba(154,74,50,.22), transparent 28rem),
        radial-gradient(circle at 80% 12%, rgba(216,207,184,.10), transparent 24rem),
        linear-gradient(180deg, rgba(18,15,10,.98), rgba(8,8,7,.99));
      color: var(--ink);
    }
    #openingStory.open { display: grid; }
    #openingStory .story-card {
      width: min(48rem, 94vw);
      max-height: min(84vh, 46rem);
      overflow: auto;
      border: 1px solid rgba(122,113,92,.95);
      background:
        linear-gradient(180deg, rgba(35,30,22,.98), rgba(17,15,11,.98));
      box-shadow: 0 24px 72px rgba(0,0,0,.76), inset 0 0 0 1px rgba(216,207,184,.08);
      padding: clamp(1rem, 3vw, 2rem);
    }
    #openingStory .eyebrow {
      margin: 0 0 .55rem;
      color: var(--accent);
      letter-spacing: .22em;
      text-transform: uppercase;
      font-size: .74rem;
    }
    #openingStory h2 {
      margin: 0 0 .85rem;
      color: #e6ddc4;
      font-weight: normal;
      letter-spacing: .18em;
      text-transform: uppercase;
      font-size: clamp(1.05rem, 4vw, 1.85rem);
      line-height: 1.15;
    }
    #openingStory p {
      margin: .65rem 0;
      line-height: 1.55;
      font-size: clamp(.92rem, 2vw, 1.05rem);
    }
    #openingStory .story-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: .65rem;
      margin: 1rem 0;
    }
    #openingStory .story-note {
      border-left: 3px solid var(--accent);
      background: rgba(10,9,7,.58);
      padding: .7rem .8rem;
      min-height: 5rem;
    }
    #openingStory .story-note b {
      display: block;
      color: #e6ddc4;
      letter-spacing: .12em;
      text-transform: uppercase;
      font-size: .72rem;
      margin-bottom: .35rem;
    }
    #openingStory .story-note span {
      color: #c8bea4;
      font-size: .9rem;
      line-height: 1.35;
    }
    #openingStory .story-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-top: 1.15rem;
      padding-top: .9rem;
      border-top: 1px solid rgba(122,113,92,.55);
    }
    #openingStory .story-actions small { color: var(--dim); line-height: 1.35; }
    #openingStory button {
      min-height: 2.2rem;
      text-transform: uppercase;
      letter-spacing: .16em;
      border-color: rgba(154,74,50,.88);
    }
    @media (max-width: 640px) {
      #openingStory { padding: .6rem; align-items: start; }
      #openingStory .story-card { max-height: 94vh; }
      #openingStory .story-actions { align-items: stretch; flex-direction: column; }
      #openingStory button { width: 100%; }
    }
  `;
  document.head.appendChild(style);
}

function makeNote(title, text) {
  const note = document.createElement('div');
  note.className = 'story-note';
  const b = document.createElement('b');
  b.textContent = title;
  const span = document.createElement('span');
  span.textContent = text;
  note.appendChild(b);
  note.appendChild(span);
  return note;
}

function createOverlay() {
  const wrap = document.getElementById('wrap');
  if (!wrap || document.getElementById('openingStory')) return null;
  addStyle();
  const overlay = document.createElement('div');
  overlay.id = 'openingStory';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Story introduction');
  overlay.setAttribute('aria-hidden', 'true');

  const card = document.createElement('div');
  card.className = 'story-card';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'Before the first question';
  const title = document.createElement('h2');
  title.textContent = 'Cumberland, Maryland, 1850s';

  const p1 = document.createElement('p');
  p1.textContent = 'You arrive in a rough gateway town where roads, canal water, railroad iron, and mountain stone all meet in the Narrows of Wills Creek. Fort Cumberland is mostly scavenged away, but Washington\'s old headquarters cabin still stands, and people still speak carefully after dark.';
  const p2 = document.createElement('p');
  p2.textContent = 'At first the trouble is small and strange: a drover drops dead in the market, a stray dog refuses to leave, and a light moves on Wills Mountain that nobody will admit to seeing. Then Tam Hollis is found in Wills Creek with water in his lungs and dry boots on his feet.';
  const p3 = document.createElement('p');
  p3.textContent = 'Constable Beall asks you to look into the death quietly. The trail runs through quarry mud, courthouse paper, missing survey lines, and people who have learned that a haunted place is useful cover for ordinary greed.';
  const p4 = document.createElement('p');
  p4.textContent = 'This is a murder mystery and a haunting. The human crime can be proven. The older darkness can only be faced if you are willing to keep looking after the legal answer is already clear.';

  const grid = document.createElement('div');
  grid.className = 'story-grid';
  grid.appendChild(makeNote('The case', 'Follow contradictions. Boots, ledgers, plats, witnesses, and survey marks matter more than rumor.'));
  grid.appendChild(makeNote('The town', 'Talk with keywords, earn trust, manage heat, change coats, and keep your satchel useful.'));
  grid.appendChild(makeNote('The mountain', 'Fear is not proof, but the supernatural is not decoration. Your SIGHT changes what you can carry home.'));

  const actions = document.createElement('div');
  actions.className = 'story-actions';
  const hint = document.createElement('small');
  hint.textContent = 'Next: choose who walks into Cumberland. Keyboard: Enter continues, T opens Trail, J opens the case file once play begins.';
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'openingStoryContinue';
  button.textContent = 'Choose your stranger';
  actions.appendChild(hint);
  actions.appendChild(button);

  card.appendChild(eyebrow);
  card.appendChild(title);
  card.appendChild(p1);
  card.appendChild(p2);
  card.appendChild(p3);
  card.appendChild(p4);
  card.appendChild(grid);
  card.appendChild(actions);
  overlay.appendChild(card);
  wrap.appendChild(overlay);
  return overlay;
}

function install() {
  if (document.documentElement[STORY_FLAG] || hasSave()) return;
  document.documentElement[STORY_FLAG] = true;
  const overlay = createOverlay();
  const splash = document.getElementById('splash');
  const panel = document.getElementById('panel');
  const panelTitle = document.getElementById('panelTitle');
  const game = document.getElementById('game');
  if (!overlay || !splash || !panel || !panelTitle) return;

  let shown = false;
  let deferredCreator = false;

  function creatorPanelIsOpen() {
    return panel.classList.contains('open') && panelTitle.textContent === 'WHO WALKS INTO CUMBERLAND';
  }

  function hideCreatorIfNeeded() {
    if (!overlay.classList.contains('open')) return;
    if (!creatorPanelIsOpen()) return;
    deferredCreator = true;
    panel.classList.remove('open');
  }

  function showStory() {
    if (shown) return;
    shown = true;
    hideCreatorIfNeeded();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    window.__CAIUCTUCUC_OPENING_STORY_OPEN = true;
    setTimeout(() => document.getElementById('openingStoryContinue')?.focus(), 0);
  }

  function continueStory() {
    if (!overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    window.__CAIUCTUCUC_OPENING_STORY_OPEN = false;
    if (deferredCreator || panelTitle.textContent === 'WHO WALKS INTO CUMBERLAND') {
      panel.classList.add('open');
    }
    game?.focus();
  }

  document.getElementById('openingStoryContinue').addEventListener('click', continueStory);
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); continueStory(); }
  });
  window.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Enter' || e.key === ' ') return;
    e.preventDefault();
    e.stopPropagation();
  }, true);

  const panelObserver = new MutationObserver(hideCreatorIfNeeded);
  panelObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });

  const splashObserver = new MutationObserver(() => {
    if (splash.classList.contains('gone') || splash.style.display === 'none') {
      setTimeout(showStory, 680);
    }
  });
  splashObserver.observe(splash, { attributes: true, attributeFilter: ['class', 'style'] });
}

install();

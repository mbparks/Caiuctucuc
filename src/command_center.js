// Unified command center. This replaces the scattered page buttons plus the
// command text inside the canvas HUD with one coherent command structure.

function commandCenter() {
  return document.getElementById('commandCenter');
}

function commandToggle() {
  return document.getElementById('commandToggle');
}

function setOpen(open) {
  const center = commandCenter();
  const toggle = commandToggle();
  if (!center || !toggle) return;
  center.classList.toggle('open', open);
  document.documentElement.classList.toggle('commands-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close Commands' : 'Commands';
}

function closeCommands() {
  setOpen(false);
}

function press(code) {
  closeCommands();
  const key = code.replace(/^Key/, '').toLowerCase();
  const target = window;
  const down = new KeyboardEvent('keydown', { code, key, bubbles: true, cancelable: true });
  target.dispatchEvent(down);
  setTimeout(() => target.dispatchEvent(new KeyboardEvent('keyup', { code, key, bubbles: true, cancelable: true })), 60);
  const game = document.getElementById('game');
  if (game) game.focus();
}

function makeButton(label, code, title) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cc-action';
  btn.textContent = label;
  if (title) btn.title = title;
  btn.addEventListener('click', () => press(code));
  return btn;
}

function group(title, nodes) {
  const section = document.createElement('section');
  section.className = 'cc-group';
  const label = document.createElement('span');
  label.className = 'cc-label';
  label.textContent = title;
  section.appendChild(label);
  for (const node of nodes.filter(Boolean)) section.appendChild(node);
  return section;
}

function move(id) {
  const node = document.getElementById(id);
  if (!node) return null;
  node.classList.add('cc-action');
  node.addEventListener('click', closeCommands, { capture: true });
  return node;
}

function addStyle() {
  if (document.getElementById('commandCenterCss')) return;
  const style = document.createElement('style');
  style.id = 'commandCenterCss';
  style.textContent = `
    header.command-shell {
      display: grid !important;
      grid-template-columns: minmax(10rem, 1fr) auto auto;
      align-items: center;
      gap: .4rem .6rem;
      min-height: 2.55rem;
      overflow: visible;
    }
    header.command-shell h1 {
      grid-column: 1;
      margin: 0;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    header.command-shell .ver {
      grid-column: 2;
      justify-self: end;
      white-space: nowrap;
    }
    #commandToggle {
      grid-column: 3;
      min-height: 2rem;
      padding: .25rem .75rem;
      text-transform: uppercase;
      letter-spacing: .16em;
      border-color: rgba(180,95,63,.72);
      white-space: nowrap;
    }
    #commandCenter {
      position: absolute;
      z-index: 90;
      top: calc(100% + .35rem);
      right: .5rem;
      width: min(44rem, calc(100vw - 1rem));
      max-height: min(72vh, 32rem);
      overflow: auto;
      display: none;
      gap: .5rem;
      padding: .7rem;
      border: 1px solid rgba(117,107,86,.9);
      background: linear-gradient(180deg, rgba(29,25,18,.98), rgba(12,11,8,.98));
      box-shadow: 0 18px 56px rgba(0,0,0,.72);
    }
    #commandCenter.open { display: grid; }
    #commandCenter::before {
      content: 'Commands';
      display: block;
      color: #d8c69d;
      letter-spacing: .18em;
      text-transform: uppercase;
      font-size: .72rem;
      padding: .1rem 0 .45rem;
      border-bottom: 1px solid rgba(117,107,86,.45);
    }
    .cc-group {
      display: grid;
      grid-template-columns: 6rem repeat(auto-fit, minmax(7.5rem, 1fr));
      gap: .38rem;
      align-items: stretch;
    }
    .cc-label {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      color: #9a4a32;
      letter-spacing: .18em;
      text-transform: uppercase;
      font-size: .68rem;
      padding: .2rem .35rem;
      border-left: 2px solid #9a4a32;
      background: rgba(10,9,7,.35);
    }
    .cc-action {
      min-height: 2rem !important;
      text-transform: uppercase;
      letter-spacing: .1em;
      font-size: .68rem !important;
      width: auto;
      margin: 0 !important;
    }
    #dreadPip.cc-action {
      display: inline-flex !important;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
    #trailPulse {
      margin-top: 0 !important;
      border-top: 1px solid rgba(117,107,86,.35) !important;
    }
    html.commands-open #panel,
    html.commands-open #menu,
    html.commands-open #journal,
    html.commands-open #trailDeck,
    html.commands-open .world-modal {
      z-index: 40;
    }
    @media (max-width: 760px) {
      header.command-shell {
        grid-template-columns: 1fr auto;
        gap: .35rem;
      }
      header.command-shell h1 { grid-column: 1 / -1; }
      header.command-shell .ver {
        grid-column: 1;
        justify-self: start;
        border-left: 0;
        padding-left: 0;
      }
      #commandToggle { grid-column: 2; }
      #commandCenter {
        left: .5rem;
        right: .5rem;
        width: auto;
        max-height: min(72vh, 34rem);
      }
      .cc-group { grid-template-columns: 1fr 1fr; }
      .cc-label { grid-column: 1 / -1; }
    }
  `;
  document.head.appendChild(style);
}

function build() {
  const header = document.querySelector('header');
  if (!header || document.getElementById('commandCenter')) return;
  addStyle();
  header.classList.add('command-shell');

  const toggle = document.createElement('button');
  toggle.id = 'commandToggle';
  toggle.type = 'button';
  toggle.textContent = 'Commands';
  toggle.setAttribute('aria-expanded', 'false');

  const center = document.createElement('div');
  center.id = 'commandCenter';
  center.setAttribute('aria-label', 'Game commands');

  center.appendChild(group('Immediate', [
    makeButton('Use / Talk', 'KeyE', 'Interact with the nearest useful person or object'),
    makeButton('Rob / Crime', 'KeyF', 'Open the crime action panel for the nearest NPC'),
    makeButton('Satchel', 'KeyI', 'Open or close the satchel'),
    makeButton('Surrender', 'KeyQ', 'Surrender when cornered')
  ]));
  center.appendChild(group('Story', [move('trailBtn'), move('caseBtn'), move('worldBtn'), move('lawBtn'), move('dreadPip')]));
  center.appendChild(group('System', [move('fullBtn'), move('muteBtn'), move('menuBtn')])) ;

  toggle.addEventListener('click', () => setOpen(!center.classList.contains('open')));
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCommands();
  });
  document.addEventListener('pointerdown', e => {
    if (!center.classList.contains('open')) return;
    if (center.contains(e.target) || toggle.contains(e.target)) return;
    closeCommands();
  }, true);

  header.appendChild(toggle);
  header.appendChild(center);
}

build();

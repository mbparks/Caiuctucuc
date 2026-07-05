// Unified command center. This replaces the scattered page buttons plus the
// command text inside the canvas HUD with one coherent command structure.

function press(code) {
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
  return node;
}

function addStyle() {
  if (document.getElementById('commandCenterCss')) return;
  const style = document.createElement('style');
  style.id = 'commandCenterCss';
  style.textContent = `
    header.command-shell {
      display: grid !important;
      grid-template-columns: 1fr auto auto;
      align-items: center;
      gap: .45rem .6rem;
    }
    header.command-shell h1 { grid-column: 1; margin: 0; }
    header.command-shell .ver { grid-column: 2; justify-self: end; }
    #commandToggle {
      grid-column: 3;
      min-height: 2rem;
      text-transform: uppercase;
      letter-spacing: .16em;
      border-color: rgba(180,95,63,.72);
    }
    #commandCenter {
      grid-column: 1 / -1;
      display: none;
      gap: .55rem;
      padding-top: .45rem;
      border-top: 1px solid rgba(117,107,86,.45);
    }
    #commandCenter.open { display: grid; }
    .cc-group {
      display: grid;
      grid-template-columns: minmax(5.5rem, auto) repeat(auto-fit, minmax(7rem, 1fr));
      gap: .35rem;
      align-items: stretch;
    }
    .cc-label {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      color: #9a4a32;
      letter-spacing: .18em;
      text-transform: uppercase;
      font-size: .7rem;
      padding: .2rem .35rem;
      border-left: 2px solid #9a4a32;
      background: rgba(10,9,7,.35);
    }
    .cc-action {
      min-height: 2rem !important;
      text-transform: uppercase;
      letter-spacing: .11em;
      font-size: .7rem !important;
      width: auto;
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
    @media (max-width: 760px) {
      header.command-shell {
        grid-template-columns: 1fr auto;
      }
      header.command-shell h1 { grid-column: 1 / -1; }
      header.command-shell .ver { grid-column: 1; justify-self: start; border-left: 0; padding-left: 0; }
      #commandToggle { grid-column: 2; }
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
  center.appendChild(group('System', [move('fullBtn'), move('muteBtn'), move('menuBtn')]));

  toggle.addEventListener('click', () => {
    const open = center.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close Commands' : 'Commands';
  });

  header.appendChild(toggle);
  header.appendChild(center);
}

build();

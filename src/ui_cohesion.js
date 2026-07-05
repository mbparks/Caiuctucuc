// Unified UI skin loaded after the game and expansion modules. This normalizes
// the HUD, overlays, buttons, cards, and status strips into one visual language.

const css = `
:root {
  --paper: #11100c;
  --ink: #e7dcc2;
  --dim: #8a806a;
  --accent: #b45f3f;
  --panel: #1b1812;
  --ui-bg: rgba(17, 16, 12, .96);
  --ui-bg-2: rgba(29, 25, 18, .97);
  --ui-line: #756b56;
  --ui-line-soft: rgba(117, 107, 86, .55);
  --ui-warm: #d8c69d;
  --ui-paper: #d8c9a8;
  --ui-paper-2: #c8b98f;
  --ui-ink-dark: #23190f;
  --ui-shadow: 0 16px 46px rgba(0,0,0,.62);
  --ui-radius: 0;
  --ui-gap: .55rem;
  --ui-font-small: .76rem;
}

html, body {
  background: radial-gradient(circle at 50% 18%, #1e1a14 0%, #100f0b 52%, #070706 100%);
  color: var(--ink);
}

#wrap { background: linear-gradient(180deg, rgba(180,95,63,.05), transparent 10rem); }

header {
  align-items: center;
  gap: .5rem;
  padding: .42rem .65rem;
  border-bottom: 1px solid rgba(180,95,63,.35);
  background: linear-gradient(180deg, rgba(31,27,20,.98), rgba(12,11,8,.96));
  box-shadow: 0 6px 24px rgba(0,0,0,.42);
  position: relative;
  z-index: 65;
}

header h1 {
  color: #f0e5ca;
  text-shadow: 0 1px 0 #000, 0 0 14px rgba(180,95,63,.18);
  letter-spacing: .34em;
  margin-right: .35rem;
}

header .ver {
  color: var(--ui-warm);
  border-left: 1px solid var(--ui-line-soft);
  padding-left: .6rem;
  margin-right: .25rem;
  font-size: .74rem;
}

button, select, input {
  border-radius: var(--ui-radius);
}

button {
  background: linear-gradient(180deg, #242018, #15120d);
  color: var(--ink);
  border: 1px solid var(--ui-line);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 1px 0 rgba(0,0,0,.55);
  letter-spacing: .03em;
  min-height: 2rem;
}

button:hover:not(:disabled) {
  color: #fff3d2;
  border-color: var(--accent);
  background: linear-gradient(180deg, #2c2418, #17120c);
}

button:disabled { opacity: .55; cursor: default; }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

select, input {
  background: #0f0e0a;
  color: var(--ink);
  border: 1px solid var(--ui-line);
  padding: .28rem .45rem;
}

#fullBtn, #muteBtn, #trailBtn, #worldBtn, #caseBtn, #lawBtn, #menuBtn {
  font-size: .76rem;
  text-transform: uppercase;
  letter-spacing: .12em;
  padding: .28rem .55rem;
  min-height: 1.95rem;
  white-space: nowrap;
}

#trailBtn, #worldBtn, #caseBtn, #lawBtn { border-color: rgba(180,95,63,.72); }
#menuBtn { margin-left: auto; }

#dreadPip {
  min-height: 1.95rem;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--ui-line);
  padding: .18rem .55rem;
  background: #14120d;
  color: var(--ui-warm);
  font-size: .72rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.07);
}

#stage {
  background:
    linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255,255,255,.014) 1px, transparent 1px),
    #070706;
  background-size: 16px 16px, 16px 16px, auto;
  padding: .45rem;
}

canvas {
  border: 1px solid rgba(216,198,157,.32);
  box-shadow: 0 0 0 2px #050504, 0 16px 42px rgba(0,0,0,.72);
}

footer {
  border-top: 1px solid rgba(117,107,86,.35);
  background: rgba(8,7,5,.78);
  padding: .38rem .75rem;
  color: #9b9178;
  letter-spacing: .02em;
}

#trailPulse {
  margin: 0;
  padding: .42rem .7rem;
  border: 0;
  border-bottom: 1px solid rgba(180,95,63,.32);
  background: linear-gradient(90deg, rgba(47,35,25,.95), rgba(20,17,12,.95));
  color: var(--ink);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
}

#trailPulse b {
  color: var(--accent);
  letter-spacing: .18em;
  font-size: .72rem;
}

#trailPulse button { min-height: 1.7rem; font-size: .7rem; }

#panel, #dialog, #menu, #term, .world-modal {
  background: linear-gradient(180deg, var(--ui-bg-2), var(--ui-bg));
  border: 1px solid var(--ui-line);
  box-shadow: var(--ui-shadow);
  color: var(--ink);
  backdrop-filter: blur(2px);
}

#panel, .world-modal, #menu {
  top: 4.15rem;
}

#panel h2, #dialog h2, #menu h2, .world-modal h2 {
  color: var(--accent);
  font-size: .78rem;
  letter-spacing: .22em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--ui-line-soft);
  padding-bottom: .45rem;
  margin-bottom: .65rem;
}

#panel .row, #menu .row {
  border-bottom: 1px solid rgba(117,107,86,.18);
  padding: .35rem 0;
}

#panel .row:last-child, #menu .row:last-child { border-bottom: 0; }
#panel .dim { color: #aaa087; }

#dialog {
  bottom: 2.6rem;
  width: min(40rem, 94vw);
}

#dialogText { color: #efe3c6; }
#dialogWords button { text-transform: uppercase; font-size: .72rem; }
#hint { background: var(--ui-bg); border-color: var(--ui-line); color: var(--ui-warm); box-shadow: var(--ui-shadow); }

#toast, #boostToast {
  background: linear-gradient(180deg, #211c13, #14110c);
  border: 1px solid rgba(180,95,63,.68);
  color: var(--ink);
  box-shadow: var(--ui-shadow);
  letter-spacing: .02em;
}

#boostToast { top: 6rem; }

#journal, #trailDeck {
  background: linear-gradient(180deg, var(--ui-paper), var(--ui-paper-2));
  color: var(--ui-ink-dark);
  border: 1px solid #5d4c32;
  box-shadow: var(--ui-shadow);
  border-radius: 0;
}

#journal { top: 4.35rem; width: min(42rem, 94vw); }
#trailDeck { top: 4.35rem; right: .85rem; width: min(31rem, 94vw); }

#journal .jhead, #trailDeck .trail-head {
  background: rgba(255,255,255,.16);
  border-bottom: 1px solid #887754;
}

#journal h2, #trailDeck h2 {
  color: #65321f;
  text-transform: uppercase;
  letter-spacing: .24em;
}

#journal .jtabs {
  background: rgba(216,201,168,.92);
  border-bottom: 1px solid #887754;
}

#journal .jtab { color: #665537; text-transform: uppercase; }
#journal .jtab.active { color: #2b1b0d; border-bottom-color: #8d3f29; }
#journal .card, #journal .suspect, #journal .kw, .world-card, .world-thread, #trailDeck .pressure {
  border: 1px solid rgba(117,107,86,.72);
  border-left: 3px solid var(--accent);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}

#journal .card, #journal .suspect, #journal .kw {
  background: rgba(245,232,196,.42);
  transform: none;
}

#journal .card:nth-child(even) { transform: none; }

#trailDeck .close {
  background: rgba(255,255,255,.18);
  color: #24180f;
  border-color: #887754;
}

#trailDeck .label {
  color: #6b5530;
  letter-spacing: .16em;
  text-transform: uppercase;
}

#trailDeck p, #trailDeck li { line-height: 1.45; }
#trailDeck .pressure { background: rgba(255,255,255,.18); color: #2d1b10; }

.world-modal {
  width: min(48rem, 94vw);
  max-height: 78vh;
  z-index: 62;
}

.world-grid { gap: .65rem; }
.world-card, .world-thread {
  background: rgba(10,9,7,.38);
  padding: .7rem;
}

.world-card b, .world-thread b {
  color: #f0e5ca;
  letter-spacing: .04em;
}

.world-card small, .world-thread small { color: #aaa087; }
.world-close { text-transform: uppercase; font-size: .7rem; }

#term {
  background: #050403;
  border-color: var(--accent);
}

#term input { color: #ff9a68; }

#panel.action-ack {
  box-shadow: 0 0 0 2px rgba(180,95,63,.72), var(--ui-shadow);
}

@media (max-width: 760px) {
  header { align-items: stretch; flex-wrap: wrap; gap: .38rem; padding: .42rem; }
  header h1 { flex: 1 0 100%; font-size: 1rem; }
  header .ver { border-left: 0; padding-left: 0; }
  #menuBtn { margin-left: 0; }
  #fullBtn, #muteBtn, #trailBtn, #worldBtn, #caseBtn, #lawBtn, #menuBtn { flex: 1 1 auto; font-size: .68rem; padding: .2rem .35rem; }
  #dreadPip { flex: 1 1 100%; justify-content: center; }
  #trailPulse { align-items: flex-start; gap: .4rem; }
  #panel, #dialog, #menu, #journal, #trailDeck, .world-modal { left: .5rem; right: .5rem; width: auto; transform: none; top: 7.2rem; }
  #dialog { top: auto; bottom: .6rem; }
  #stage { padding: .2rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
}
`;

if (!document.getElementById('uiCohesionCss')) {
  const style = document.createElement('style');
  style.id = 'uiCohesionCss';
  style.textContent = css;
  document.head.appendChild(style);
}

document.documentElement.dataset.ui = 'cohesive';

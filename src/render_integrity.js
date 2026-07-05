// Render integrity guard. Loaded before the game renderer so canvas draws land
// on whole pixels, and late enough CSS cleanup removes decorative stage grids.

const PATCH_FLAG = Symbol.for('caiuctucuc.renderIntegrity');
const FULLSCREEN_FLAG = Symbol.for('caiuctucuc.fullscreenRoot');
const HUD_COMMAND_TEXT = 'E TALK  F ROB  I SATCHEL  J CASE';

function snap(v) {
  return Number.isFinite(v) ? Math.round(v) : v;
}

function fullscreenActive() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function patchFullscreenRoot() {
  if (typeof HTMLElement === 'undefined') return;
  const proto = HTMLElement.prototype;
  if (proto[FULLSCREEN_FLAG]) return;
  proto[FULLSCREEN_FLAG] = true;

  const request = proto.requestFullscreen;
  if (!request) return;
  proto.requestFullscreen = function patchedRequestFullscreen(...args) {
    // main.js asks #stage to fullscreen. That hides dialog/panel/menu because
    // they live beside #stage in #wrap. Redirect to #wrap so fullscreen keeps
    // every gameplay overlay visible and interactive.
    if (this?.id === 'stage') {
      const wrap = document.getElementById('wrap');
      if (wrap && wrap !== this) return request.apply(wrap, args);
    }
    return request.apply(this, args);
  };
}

function patchCanvas() {
  if (typeof CanvasRenderingContext2D === 'undefined') return;
  const proto = CanvasRenderingContext2D.prototype;
  if (proto[PATCH_FLAG]) return;
  proto[PATCH_FLAG] = true;

  const drawImage = proto.drawImage;
  proto.drawImage = function patchedDrawImage(...args) {
    if (args.length === 3) {
      args[1] = snap(args[1]);
      args[2] = snap(args[2]);
    } else if (args.length === 5) {
      args[1] = snap(args[1]);
      args[2] = snap(args[2]);
      args[3] = snap(args[3]);
      args[4] = snap(args[4]);
    } else if (args.length === 9) {
      args[5] = snap(args[5]);
      args[6] = snap(args[6]);
      args[7] = snap(args[7]);
      args[8] = snap(args[8]);
    }
    this.imageSmoothingEnabled = false;
    return drawImage.apply(this, args);
  };

  const fillRect = proto.fillRect;
  proto.fillRect = function patchedFillRect(x, y, w, h) {
    return fillRect.call(this, snap(x), snap(y), snap(w), snap(h));
  };

  const strokeRect = proto.strokeRect;
  proto.strokeRect = function patchedStrokeRect(x, y, w, h) {
    return strokeRect.call(this, snap(x), snap(y), snap(w), snap(h));
  };

  const fillText = proto.fillText;
  proto.fillText = function patchedFillText(text, x, y, ...rest) {
    if (String(text) === HUD_COMMAND_TEXT && !fullscreenActive()) return;
    return fillText.call(this, text, snap(x), snap(y), ...rest);
  };
}

function injectCss() {
  if (typeof document === 'undefined') return;
  const old = document.getElementById('renderIntegrityCss');
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = 'renderIntegrityCss';
  style.textContent = `
    #stage {
      background: #070706 !important;
      background-image: none !important;
    }
    #wrap:fullscreen,
    #wrap:-webkit-full-screen {
      background: #070706 !important;
      color: var(--ink);
    }
    #wrap:fullscreen #stage,
    #wrap:-webkit-full-screen #stage {
      min-height: 0;
      flex: 1 1 auto;
    }
    #wrap:fullscreen #dialog,
    #wrap:fullscreen #panel,
    #wrap:fullscreen #menu,
    #wrap:fullscreen #journal,
    #wrap:fullscreen #term,
    #wrap:fullscreen #trailDeck,
    #wrap:fullscreen .world-modal,
    #wrap:-webkit-full-screen #dialog,
    #wrap:-webkit-full-screen #panel,
    #wrap:-webkit-full-screen #menu,
    #wrap:-webkit-full-screen #journal,
    #wrap:-webkit-full-screen #term,
    #wrap:-webkit-full-screen #trailDeck,
    #wrap:-webkit-full-screen .world-modal {
      z-index: 95 !important;
    }
    canvas {
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      background: #000 !important;
    }
  `;
  document.head.appendChild(style);
}

patchFullscreenRoot();
patchCanvas();
injectCss();
setTimeout(injectCss, 0);
setTimeout(injectCss, 120);
setTimeout(injectCss, 800);

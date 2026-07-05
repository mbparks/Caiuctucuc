// Render integrity guard. Loaded before the game renderer so canvas draws land
// on whole pixels, and late enough CSS cleanup removes decorative stage grids.

const PATCH_FLAG = Symbol.for('caiuctucuc.renderIntegrity');

function snap(v) {
  return Number.isFinite(v) ? Math.round(v) : v;
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
    canvas {
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      background: #000 !important;
    }
  `;
  document.head.appendChild(style);
}

patchCanvas();
injectCss();
setTimeout(injectCss, 0);
setTimeout(injectCss, 120);
setTimeout(injectCss, 800);

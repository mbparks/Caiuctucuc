// Fixed-step game loop. update(dt) runs at a stable simulation rate,
// render(alpha) runs once per animation frame.
export function createLoop(update, render, step = 1 / 60) {
  let last = 0, acc = 0, running = false;
  function frame(t) {
    if (!running) return;
    const now = t / 1000;
    acc += Math.min(now - last, 0.25);
    last = now;
    while (acc >= step) { update(step); acc -= step; }
    render(acc / step);
    requestAnimationFrame(frame);
  }
  return {
    start() { running = true; last = performance.now() / 1000; requestAnimationFrame(frame); },
    stop() { running = false; }
  };
}

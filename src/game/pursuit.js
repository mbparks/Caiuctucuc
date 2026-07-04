// Constable pursuit: a simple collision-aware seek step. Pure, testable.
// solidAtPx(x, y) answers for the pursuer's corner points.
export function seekStep(from, target, speed, dt, solidAtPx, size = 12) {
  const dx = target.x - from.x, dy = target.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const step = speed * dt;
  const move = (nx, ny) => {
    const pts = [[nx, ny], [nx + size, ny], [nx, ny + size], [nx + size, ny + size]];
    return pts.some(([px, py]) => solidAtPx(px, py)) ? null : { x: nx, y: ny };
  };
  // Try the direct step, then axis-aligned slides, so walls corner rather than stop him.
  return move(from.x + (dx / dist) * step, from.y + (dy / dist) * step)
      || move(from.x + Math.sign(dx) * step, from.y)
      || move(from.x, from.y + Math.sign(dy) * step)
      || from;
}

export function caught(a, b, radius = 14) {
  return Math.hypot(a.x - b.x, a.y - b.y) < radius;
}

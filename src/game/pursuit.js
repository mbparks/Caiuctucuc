// Constable pursuit: a simple collision-aware seek step. Pure, testable.
// solidAtPx(x, y) answers for the mover's corner points.

function clearAt(px, py, solidAtPx, size) {
  const pts = [[px, py], [px + size, py], [px, py + size], [px + size, py + size]];
  return !pts.some(([x, y]) => solidAtPx(x, y));
}

function hashMover(mover) {
  const id = mover?.props?.npcId || mover?.props?.extra || mover?.name || 'wanderer';
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function scheduledTargetFor(mover, target, solidAtPx, size) {
  // Scheduled spots are often door thresholds. Give every named NPC a stable
  // nearby standing place so they do not fight the doorway cleaner or stack on
  // top of another actor who shares the same shop, tavern, court, or home spot.
  const ring = [
    [0, 22], [22, 0], [-22, 0], [0, -22],
    [18, 18], [-18, 18], [18, -18], [-18, -18],
    [0, 32], [32, 0], [-32, 0], [0, -32],
    [28, 28], [-28, 28], [28, -28], [-28, -28]
  ];
  const start = hashMover(mover) % ring.length;
  for (let i = 0; i < ring.length; i++) {
    const [ox, oy] = ring[(start + i) % ring.length];
    const candidate = { x: target.x + ox, y: target.y + oy };
    if (clearAt(candidate.x, candidate.y, solidAtPx, size)) return candidate;
  }
  return target;
}

export function seekStep(from, target, speed, dt, solidAtPx, size = 12) {
  const scheduled = speed <= 40;
  const goal = scheduled ? scheduledTargetFor(from, target, solidAtPx, size) : target;
  const dx = goal.x - from.x, dy = goal.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Scheduled townsfolk do not need to hit one exact pixel. They should look
  // settled in a doorway crowd, not vibrate against collision cleanup forever.
  // Faster uses of seekStep are pursuit and fleeing, and still close all the way.
  const settleRadius = scheduled ? Math.max(size * 0.5, 6) : 0;
  if (dist <= settleRadius) return from;

  const step = Math.min(speed * dt, Math.max(0, dist - settleRadius));
  if (step <= 0) return from;

  const move = (nx, ny) => clearAt(nx, ny, solidAtPx, size) ? { x: nx, y: ny } : null;
  // Try the direct step, then axis-aligned slides, so walls corner rather than stop him.
  return move(from.x + (dx / dist) * step, from.y + (dy / dist) * step)
      || move(from.x + Math.sign(dx) * step, from.y)
      || move(from.x, from.y + Math.sign(dy) * step)
      || from;
}

export function caught(a, b, radius = 14) {
  return Math.hypot(a.x - b.x, a.y - b.y) < radius;
}

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
  // Scheduled spots are often placed on the door approach tile. The old logic
  // allowed same-row offsets, then the doorway cleaner shoved everyone into the
  // same legal tile. Scheduled townsfolk now prefer a street-side standing lane
  // below the destination, with stable per-NPC horizontal offsets.
  const h = hashMover(mover);
  const lane = ((h % 7) - 3) * 16;
  const side = h % 2 === 0 ? 1 : -1;
  const candidates = [
    [lane, 42], [lane, 58], [lane, 74],
    [lane + side * 18, 42], [lane - side * 18, 42],
    [lane + side * 18, 58], [lane - side * 18, 58],
    [side * 34, 42], [-side * 34, 42],
    [side * 50, 58], [-side * 50, 58],
    [0, 42], [0, 58], [0, 74]
  ];
  for (const [ox, oy] of candidates) {
    const candidate = { x: target.x + ox, y: target.y + oy };
    if (clearAt(candidate.x, candidate.y, solidAtPx, size)) return candidate;
  }
  // Last resort: stay where you are rather than walk back onto a threshold.
  if (clearAt(mover.x, mover.y, solidAtPx, size)) return { x: mover.x, y: mover.y };
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

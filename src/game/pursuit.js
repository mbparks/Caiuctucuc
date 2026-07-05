// Constable pursuit: a collision-aware seek step with live crowd separation.
// solidAtPx(x, y) answers for the mover's corner points.

const crowdMemory = new Map();
let crowdTick = 0;

function clearAt(px, py, solidAtPx, size) {
  const pts = [[px, py], [px + size, py], [px, py + size], [px + size, py + size]];
  return !pts.some(([x, y]) => solidAtPx(x, y));
}

function moverId(mover) {
  return mover?.props?.npcId || mover?.props?.extra || mover?.name || 'wanderer';
}

function hashText(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function hashMover(mover) {
  return hashText(moverId(mover));
}

function crowdKey(mover) {
  const id = moverId(mover);
  const home = mover?.home ? ':' + Math.round(mover.home.x) + ',' + Math.round(mover.home.y) : '';
  return id + home;
}

export function resetCrowdMemory() {
  crowdMemory.clear();
  crowdTick = 0;
}

function rememberCrowd(key, pos) {
  crowdTick += 1;
  crowdMemory.set(key, { x: pos.x, y: pos.y, tick: crowdTick });
  for (const [k, v] of crowdMemory) {
    if (crowdTick - v.tick > 160) crowdMemory.delete(k);
  }
}

function separationVector(key, pos, minDistance) {
  let vx = 0, vy = 0;
  for (const [otherKey, other] of crowdMemory) {
    if (otherKey === key) continue;
    const dx = pos.x - other.x, dy = pos.y - other.y;
    const d = Math.hypot(dx, dy);
    if (d >= minDistance) continue;
    if (d < 0.001) {
      const angle = ((hashText(key + '|' + otherKey) % 628) / 100);
      vx += Math.cos(angle) * minDistance;
      vy += Math.sin(angle) * minDistance;
    } else {
      const push = (minDistance - d) / minDistance;
      vx += (dx / d) * push * minDistance;
      vy += (dy / d) * push * minDistance;
    }
  }
  return { x: vx, y: vy };
}

function applySeparation(mover, pos, solidAtPx, size) {
  const key = crowdKey(mover);
  const minDistance = Math.max(size + 8, 22);
  let out = { x: pos.x, y: pos.y };
  for (let pass = 0; pass < 2; pass++) {
    const v = separationVector(key, out, minDistance);
    if (Math.hypot(v.x, v.y) < 0.01) break;
    const scale = pass === 0 ? 0.65 : 0.35;
    const candidates = [
      { x: out.x + v.x * scale, y: out.y + v.y * scale },
      { x: out.x + v.x * scale, y: out.y },
      { x: out.x, y: out.y + v.y * scale }
    ];
    const next = candidates.find(c => clearAt(c.x, c.y, solidAtPx, size));
    if (!next) break;
    out = next;
  }
  rememberCrowd(key, out);
  return out;
}

function scheduledTargetFor(mover, target, solidAtPx, size) {
  // Scheduled spots are often placed on the door approach tile. The old logic
  // allowed same-row offsets, then the doorway cleaner shoved everyone into the
  // same legal tile. Scheduled townsfolk now prefer a street-side standing lane
  // below the destination, with stable per-NPC horizontal offsets.
  const h = hashMover(mover);
  const lane = ((h % 9) - 4) * 18;
  const side = h % 2 === 0 ? 1 : -1;
  const candidates = [
    [lane, 46], [lane, 64], [lane, 82],
    [lane + side * 22, 46], [lane - side * 22, 46],
    [lane + side * 22, 64], [lane - side * 22, 64],
    [side * 42, 46], [-side * 42, 46],
    [side * 60, 64], [-side * 60, 64],
    [0, 46], [0, 64], [0, 82]
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
  if (dist <= settleRadius) return applySeparation(from, from, solidAtPx, size);

  const step = Math.min(speed * dt, Math.max(0, dist - settleRadius));
  if (step <= 0) return applySeparation(from, from, solidAtPx, size);

  const move = (nx, ny) => clearAt(nx, ny, solidAtPx, size) ? { x: nx, y: ny } : null;
  // Try the direct step, then axis-aligned slides, so walls corner rather than stop him.
  const moved = move(from.x + (dx / dist) * step, from.y + (dy / dist) * step)
      || move(from.x + Math.sign(dx) * step, from.y)
      || move(from.x, from.y + Math.sign(dy) * step)
      || from;
  return applySeparation(from, moved, solidAtPx, size);
}

export function caught(a, b, radius = 14) {
  return Math.hypot(a.x - b.x, a.y - b.y) < radius;
}

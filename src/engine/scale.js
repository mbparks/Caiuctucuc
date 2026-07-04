// Pixel-perfect presentation: the game renders at a fixed internal
// resolution and scales up by whole integers so pixels stay square and
// crisp. Below 1x it falls back to a fractional fit rather than clipping.
export function fitScale(stageW, stageH, gameW, gameH) {
  const s = Math.min(stageW / gameW, stageH / gameH);
  return s >= 1 ? Math.floor(s) : s;
}

export function fmtHour(hour) {
  return String(Math.floor(hour)).padStart(2, '0') + ':00';
}

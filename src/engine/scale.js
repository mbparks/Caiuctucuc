// Pixel-perfect presentation: the game renders at a fixed internal
// resolution and scales up by whole integers so pixels stay square and
// crisp. Below 1x it falls back to a fractional fit rather than clipping.
export function fitScale(stageW, stageH, gameW, gameH, mode = 'crisp') {
  const s = Math.min(stageW / gameW, stageH / gameH);
  if (mode === 'fill') return s;
  return s >= 1 ? Math.floor(s) : s;
}

export function fmtHour(hour) {
  return String(Math.floor(hour)).padStart(2, '0') + ':00';
}

// The minimap dot: world position into a small gray field, Zelda-style.
export function miniPos(px, py, worldW, worldH, boxW, boxH) {
  return {
    x: Math.max(0, Math.min(boxW - 2, Math.floor(px / worldW * boxW))),
    y: Math.max(0, Math.min(boxH - 2, Math.floor(py / worldH * boxH)))
  };
}

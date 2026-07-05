// Camera that follows a target and clamps to the map edge.
// The camera must land on whole pixels. Fractional camera positions make tile
// edges draw between pixels, which causes dark seam artifacts while walking.
export function createCamera(viewW, viewH, mapW, mapH) {
  const cam = { x: 0, y: 0 };
  cam.follow = (tx, ty) => {
    const maxX = Math.max(0, mapW - viewW);
    const maxY = Math.max(0, mapH - viewH);
    const x = Math.max(0, Math.min(tx - viewW / 2, maxX));
    const y = Math.max(0, Math.min(ty - viewH / 2, maxY));
    cam.x = Math.round(x);
    cam.y = Math.round(y);
  };
  return cam;
}

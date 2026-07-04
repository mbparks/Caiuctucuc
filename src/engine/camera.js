// Camera that follows a target and clamps to the map edge.
export function createCamera(viewW, viewH, mapW, mapH) {
  const cam = { x: 0, y: 0 };
  cam.follow = (tx, ty) => {
    cam.x = Math.max(0, Math.min(tx - viewW / 2, mapW - viewW));
    cam.y = Math.max(0, Math.min(ty - viewH / 2, mapH - viewH));
  };
  return cam;
}

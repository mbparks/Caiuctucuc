// Keyboard state. Arrows and WASD both walk.
export function createInput(target) {
  const down = new Set();
  const map = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right'
  };
  target.addEventListener('keydown', e => { const a = map[e.code]; if (a) { down.add(a); e.preventDefault(); } });
  target.addEventListener('keyup', e => { const a = map[e.code]; if (a) down.delete(a); });
  return { has: a => down.has(a) };
}

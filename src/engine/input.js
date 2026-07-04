// Keyboard state. Arrows and WASD both walk.
// Typing always wins: when focus is in an editable element, movement keys
// are ignored entirely so preventDefault never eats a letter.
export function isEditable(target) {
  if (!target) return false;
  const tag = (target.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable === true;
}

export function createInput(target) {
  const down = new Set();
  const map = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right'
  };
  target.addEventListener('keydown', e => {
    if (isEditable(e.target)) return;
    const a = map[e.code];
    if (a) { down.add(a); e.preventDefault(); }
  });
  target.addEventListener('keyup', e => {
    if (isEditable(e.target)) { down.clear(); return; }
    const a = map[e.code];
    if (a) down.delete(a);
  });
  // leaving the window or losing focus releases every key, so nobody
  // walks into the creek because a dialog stole the keyup
  target.addEventListener('blur', () => down.clear(), true);
  return { has: a => down.has(a) };
}

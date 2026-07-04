// The satchel: slots, stacks, equipment, and the stash.
// Entries: { id, qty, cond?, wear? }. Condition items never stack.
export const SATCHEL_SIZE = 16;
export const EQUIP_SLOTS = ['weapon', 'coat', 'hat', 'boots', 'lantern'];

export function findEntry(list, id) { return list.find(e => e.id === id); }

export function addItem(state, id, registry, qty = 1) {
  const def = registry[id];
  if (!def) throw new Error('no such item: ' + id);
  const inv = state.inventory.map(e => ({ ...e }));
  if (!def.condition) {
    const e = findEntry(inv, id);
    if (e) { e.qty += qty; return { ok: true, state: { ...state, inventory: inv } }; }
  }
  if (inv.length + (def.condition ? qty : 1) > SATCHEL_SIZE)
    return { ok: false, reason: 'the satchel is full', state };
  if (def.condition) {
    for (let i = 0; i < qty; i++) inv.push({ id, qty: 1, cond: 'sound', wear: 0 });
  } else {
    inv.push({ id, qty });
  }
  return { ok: true, state: { ...state, inventory: inv } };
}

export function removeItem(state, id, qty = 1) {
  const inv = state.inventory.map(e => ({ ...e }));
  const i = inv.findIndex(e => e.id === id);
  if (i < 0 || inv[i].qty < qty) return { ok: false, reason: 'not in the satchel', state };
  inv[i].qty -= qty;
  if (inv[i].qty <= 0) inv.splice(i, 1);
  return { ok: true, state: { ...state, inventory: inv } };
}

export function countOf(state, id) {
  return state.inventory.filter(e => e.id === id).reduce((n, e) => n + e.qty, 0);
}

export function equip(state, index, registry) {
  const entry = state.inventory[index];
  if (!entry) return { ok: false, reason: 'nothing there', state };
  const def = registry[entry.id];
  if (!def.slot) return { ok: false, reason: 'that is not worn or wielded', state };
  const inv = state.inventory.map(e => ({ ...e }));
  const equipn = { ...state.player.equip };
  const removed = inv.splice(index, 1)[0];
  if (equipn[def.slot]) inv.push(equipn[def.slot]);
  equipn[def.slot] = removed;
  let player = { ...state.player, equip: equipn };
  if (def.slot === 'coat' && def.coat) player.coat = def.coat;   // disguise follows the coat
  return { ok: true, state: { ...state, inventory: inv, player } };
}

export function toStash(state, index) {
  const inv = state.inventory.map(e => ({ ...e }));
  const item = inv.splice(index, 1)[0];
  if (!item) return { ok: false, state };
  return { ok: true, state: { ...state, inventory: inv, stash: [...state.stash, item] } };
}

export function fromStash(state, index) {
  if (state.inventory.length >= SATCHEL_SIZE) return { ok: false, reason: 'the satchel is full', state };
  const stash = state.stash.map(e => ({ ...e }));
  const item = stash.splice(index, 1)[0];
  if (!item) return { ok: false, state };
  return { ok: true, state: { ...state, stash, inventory: [...state.inventory, item] } };
}

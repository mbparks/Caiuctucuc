// Sound, Worn, Broke. No durability math shown; thresholds under the hood.
// Design doc Section 13.
export const WORN_AT = 10;
export const BROKE_AT = 25;

export function condFor(wear) {
  if (wear >= BROKE_AT) return 'broke';
  if (wear >= WORN_AT) return 'worn';
  return 'sound';
}

export function wearItem(entry, amount, hard = false) {
  const wear = entry.wear + amount * (hard ? 2 : 1);
  return { ...entry, wear, cond: condFor(wear) };
}

// Field repair: a Broke thing becomes Worn, never Sound. HANDS rank
// reduces how deep in the Worn band it lands.
export function fieldRepair(entry, handsRank = 0) {
  if (entry.cond !== 'broke') return { ok: false, reason: 'it holds together as it is', entry };
  const wear = Math.max(WORN_AT, BROKE_AT - 3 - handsRank * 3);
  return { ok: true, entry: { ...entry, wear, cond: condFor(wear) } };
}

// A craftsman restores to Sound. Costs scale with how far gone it is.
export function restoreFee(entry, basePrice) {
  return Math.max(1, Math.ceil(basePrice * (entry.cond === 'broke' ? 0.5 : 0.25)));
}

export function restore(entry) {
  return { ...entry, wear: 0, cond: 'sound' };
}

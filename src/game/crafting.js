// Recipes, not systems. Two ingredients at most, stations tied to places.
import { addItem, removeItem, countOf } from './inventory.js';

export const RECIPES = {
  stew:          { station: 'hearth', inputs: { salt_pork: 1, johnnycake: 1 }, output: 'stew', qty: 1 },
  poultice:      { station: 'hearth', inputs: { dried_sassafras: 1, whiskey: 1 }, output: 'poultice', qty: 1 },
  tallow_candle: { station: 'hearth', inputs: { salt_pork: 1 }, output: 'tallow_candle', qty: 2 },
  tonic:         { station: 'apothecary', inputs: { dried_sassafras: 2 }, output: 'tonic', qty: 1 },
  salt_line:     { station: 'apothecary', inputs: { salt_pouch: 1 }, output: 'salt_line', qty: 2 },
  cast_shot:     { station: 'smithy', inputs: { silver_dollar: 1 }, output: 'powder_and_shot', qty: 3 },
  cold_iron_nail:{ station: 'smithy', inputs: { salt_pouch: 1, whiskey: 1 }, output: 'cold_iron_nail', qty: 1 }
};

export function canCraft(state, recipeId) {
  const r = RECIPES[recipeId];
  return Object.entries(r.inputs).every(([id, n]) => countOf(state, id) >= n);
}

export function craft(state, recipeId, station, registry) {
  const r = RECIPES[recipeId];
  if (!r) throw new Error('no such recipe: ' + recipeId);
  if (r.station !== station) return { ok: false, reason: 'wrong bench for that work', state };
  if (!canCraft(state, recipeId)) return { ok: false, reason: 'you lack the makings', state };
  let s = state;
  for (const [id, n] of Object.entries(r.inputs)) s = removeItem(s, id, n).state;
  const added = addItem(s, r.output, registry, r.qty);
  if (!added.ok) return { ok: false, reason: added.reason, state };
  return { ok: true, state: added.state };
}

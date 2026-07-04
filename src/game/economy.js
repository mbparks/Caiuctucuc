// Prices and barter. Selling fetches half; whiskey and silver dollars are
// money and fetch full, because on this frontier they are.
export function buyPrice(def) { return def.price; }
export function sellPrice(def) { return def.currency ? def.price : Math.max(0, Math.floor(def.price / 2)); }

// Disguise: the hue and cry remembers what you were wearing.
// Changing coats drops the effective pursuit level by one, never below gossip
// while heat remains. Design doc Section 7.
export const COATS = ['drover', 'frock', 'preacher'];

export function nextCoat(coat) {
  return COATS[(COATS.indexOf(coat) + 1) % COATS.length];
}

// effectiveLevel: what the street can act on, given what the witnesses saw.
export function effectiveLevel(hueCry, currentCoat) {
  if (!hueCry.witnessedCoat || hueCry.level === 0) return hueCry.level;
  return currentCoat === hueCry.witnessedCoat ? hueCry.level : Math.max(1, hueCry.level - 1);
}

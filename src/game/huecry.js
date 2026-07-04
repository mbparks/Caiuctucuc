// Hue and cry: heat accrues from crimes, decays with time and distance,
// and quantizes into four public levels. Design doc Section 7.
export const LEVELS = ['quiet', 'gossip', 'constable', 'militia', 'bounty'];
export const THRESHOLDS = [0, 10, 30, 60, 100];

export function levelFor(heat) {
  let lvl = 0;
  for (let i = 0; i < THRESHOLDS.length; i++) if (heat >= THRESHOLDS[i]) lvl = i;
  return lvl;
}

export function addHeat(state, amount, sliderRate = 1) {
  const heat = Math.min(150, state.heat + amount * sliderRate);
  return { ...state, heat, level: levelFor(heat) };
}

// decayPerHour halves roughly every six game hours at rate 1; crossing the
// Potomac (jurisdiction) multiplies decay by 6 while on the Virginia shore.
export function decay(state, hours, sliderRate = 1, acrossRiver = false) {
  const factor = acrossRiver ? 6 : 1;
  const heat = Math.max(0, state.heat - hours * 2 * sliderRate * factor);
  return { ...state, heat, level: levelFor(heat) };
}

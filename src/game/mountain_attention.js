// Mountain attention: the supernatural system that reacts to SIGHT, night,
// sealed places, evidence, and final-act progress.
const SEALED_MAPS = new Set(['quarry', 'wills_mountain', 'cave_chain', 'cathedral', 'caves']);

export function mountainAttention(state) {
  let score = 0;
  score += (state.player?.sight || 0) * 12;
  const hour = state.clock?.hour || 12;
  if (hour >= 21 || hour < 5) score += 8;
  if (SEALED_MAPS.has(state.map)) score += 12;
  if (state.flags?.sawLight) score += 4;
  if (state.flags?.sleptInFort) score += 8;
  if (state.flags?.benchmarksAll) score += 8;
  if (state.flags?.act3Complete) score += 10;
  if (state.flags?.nanMissing) score += 18;
  if (state.flags?.inChamber) score += 20;
  if ((state.wards || []).length) score += Math.min(10, state.wards.length * 2);
  return Math.max(0, Math.min(100, score));
}

export function attentionBand(score) {
  if (score >= 80) return { id: 'awake', label: 'Awake', text: 'The mountain is not scenery now. It is attention.' };
  if (score >= 55) return { id: 'listening', label: 'Listening', text: 'Animals refuse paths. Doors are found open. The mill sounds wrong.' };
  if (score >= 30) return { id: 'stirring', label: 'Stirring', text: 'The fog has opinions and the dog watches the treeline.' };
  if (score >= 12) return { id: 'murmur', label: 'Murmur', text: 'Something older than the roads has noticed the roads.' };
  return { id: 'quiet', label: 'Quiet', text: 'The mountain waits under its own name.' };
}

export function mountainEvent(state) {
  const score = mountainAttention(state);
  const band = attentionBand(score);
  const hour = state.clock?.hour || 12;
  if (band.id === 'awake') return 'Every animal sound stops at once. In the pause, the mountain seems nearer than the street.';
  if (band.id === 'listening' && (hour >= 21 || hour < 5)) return 'A light moves where there is no path, pauses as if counting you, and goes on.';
  if (band.id === 'stirring' && SEALED_MAPS.has(state.map)) return 'The stone underfoot gives a low note, too steady for thunder.';
  if (band.id === 'murmur') return 'Someone behind you whispers HE MEASURES. No one is behind you.';
  return null;
}

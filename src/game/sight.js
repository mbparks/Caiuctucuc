// SIGHT is threshold-crossed by story choice, never ground. Section 16.
export const RANKS = ['Unawakened', 'The Glimmer', 'The Listening', 'The Parley', 'The Opened Eye'];

const GATES = {
  1: s => Boolean(s.flags.sleptInFort || s.flags.burdenSecondSight),
  2: s => Boolean(s.flags.brahmRitual),
  3: s => Boolean(s.flags.drankTheSpring || s.flags.eldersRite),
  4: s => Boolean(s.flags.openedEye)
};

export function attemptRank(state, rank) {
  if (rank !== state.player.sight + 1) return { ok: false, reason: 'ranks are crossed in order' };
  const gate = GATES[rank];
  if (!gate || !gate(state)) return { ok: false, reason: 'the threshold has not been crossed' };
  return { ok: true, state: { ...state, player: { ...state.player, sight: rank } } };
}

// Trust moves on conduct, never on charm alone. Design doc Section 11.2.
export const TRUST_DELTAS = {
  promiseKept: 1,
  promiseBroken: -2,
  returnedProperty: 1,
  caughtLying: -2,
  discretion: 1,
  surrenderedQuietly: 1,
  testimonyHonest: 2
};

export function applyTrust(state, npcId, kind) {
  const delta = TRUST_DELTAS[kind];
  if (delta === undefined) throw new Error('unknown trust event: ' + kind);
  const current = state.trust[npcId] || 0;
  return { ...state, trust: { ...state.trust, [npcId]: current + delta } };
}

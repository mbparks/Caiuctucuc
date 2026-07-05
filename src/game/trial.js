// The trial: evidence quality plus witness trust against Kent's disposition.
// Beat sheet 3.4. Mathematics does not perjure; people are another matter.
export function witnessScore(state) {
  let n = 0;
  if ((state.trust.beall || 0) >= 2 || state.flags.beallCertain) n += 2;
  if (state.flags.widowTestimony) n += 1;
  return n;
}

export function kentScore(state) {
  if (state.flags.kentAlly) return 1;
  if (state.flags.kentPressured) return 1;
  return 0;
}

export const GUILTY_AT = 6;
export const HUNG_AT = 4;

export function verdict(evidence, witnesses, kent) {
  const total = evidence + witnesses + kent;
  if (total >= GUILTY_AT) return { verdict: 'guilty', total };
  if (total >= HUNG_AT) return { verdict: 'hung', total };
  return { verdict: 'acquitted', total };
}

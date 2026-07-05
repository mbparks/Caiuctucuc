// Death and the Marks of the Crossing. Design doc Section 6.
// Never a reload. The story continues, scarred.
export const MARK_POOL = [
  { id: 'limp', name: 'a limp', note: 'the sprint is a half-step slower' },
  { id: 'tremor', name: 'a tremor in the off hand', note: 'the reload is a hair slower' },
  { id: 'white_streak', name: 'a white streak in the hair', note: 'the town gossips' },
  { id: 'scar', name: 'a visible scar', note: 'worn on the face now' },
  { id: 'ringing_ear', name: 'an ear that rings near cold spots', note: 'accidentally a weak ghost detector' }
];

export function applyDeath(state) {
  const combat = state.difficulty?.combat || 'frontier';
  if (combat === 'storied') {
    const loss = Math.min(2, state.player.coin);
    return {
      state: { ...state, player: { ...state.player, health: state.player.maxHealth, coin: state.player.coin - loss } },
      toast: 'The world goes sideways, then resumes. Knocked senseless, you wake at the tavern minus ' + loss + ' silver. Storied keeps its promise: no scar, no crossing.',
      moveTo: 'doyle_bar'
    };
  }
  const fee = Math.min(combat === 'perilous' ? 8 : 4, state.player.coin);
  const worn = new Set(state.player.marks);
  const mark = MARK_POOL.find(m => !worn.has(m.id));
  const marks = mark ? [...state.player.marks, mark.id] : state.player.marks;
  const learned = state.keywordsLearned.includes('CROSSED')
    ? state.keywordsLearned : [...state.keywordsLearned, 'CROSSED'];
  const clock = { day: state.clock.day + 1, hour: 9 };
  const player = { ...state.player, health: state.player.maxHealth, coin: state.player.coin - fee, marks };
  const flags = { ...state.flags, crossed: true, sleepCount: (state.flags.sleepCount || 0) + 1 };
  const toast = 'You wake at Ward\u2019s surgery a day later, ' + fee + ' silver lighter.'
    + (mark ? ' The crossing left ' + mark.name + ': ' + mark.note + '.' : ' The crossing left nothing new; you are marked enough.')
    + (state.player.marks.length === 0 ? ' A word surfaces with you: CROSSED.' : '');
  return { state: { ...state, player, clock, flags, keywordsLearned: learned }, toast, moveTo: 'ward_work' };
}

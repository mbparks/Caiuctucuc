// Act I: The Drowned Man. Pure case logic from docs/beat_sheet.md.
// Beats fire on flags and the clock; clues accumulate in the case file.

export const CLUES = {
  drover_died:       { name: 'The drover', thread: 'prologue', text: 'A drover dropped dead in the market, natural as weather. His cur has nowhere to go.' },
  light_on_mountain: { name: 'A light on the mountain', thread: 'prologue', text: 'A light moved on Wills Mountain that nobody else would own to seeing.' },
  tam_drowned:       { name: 'Tam Hollis, drowned dry', thread: 'body', text: 'A quarryman drowned in Wills Creek, lungs full, boots dry. Beall wants unofficial legs on it.' },
  dry_boots:         { name: 'Tam\'s dry boots', thread: 'body', text: 'The creek gave Tam back, but the boots remember dry dust. He drowned somewhere else.' },
  singing_confession:{ name: 'The rock was singing', thread: 'quarry', text: 'McTeague heard it too: singing from the deep cut where no one worked. Tam went to listen.' },
  calm_bootprints:   { name: 'Calm bootprints', thread: 'quarry', text: 'A second set of prints at the deep cut. Human, unhurried, leaving.' },
  razored_ledger:    { name: 'The razored ledger', thread: 'plat', text: 'Rood found pages razored and entries inked over in the old fort ledger. A careful hand.' },
  ledger_cut:        { name: 'The clean-cut ledger leaf', thread: 'plat', text: 'The missing leaf was razored from the binding. Care, not panic, removed it.' },
  plat_mismatch:     { name: 'The plat does not match', thread: 'plat', text: 'Tam carried a plat scrap. The courthouse copy has been re-inked to disagree with it.' },
  gentleman_letter:  { name: 'The gentleman', thread: 'fort', text: 'Tam wrote his sister: he found something worth money, and a gentleman offered to buy his silence.' },
  coombs_grave:      { name: 'Coombs in the grave', thread: 'turn', text: 'The gravedigger, dead at the bottom of Tam\'s own grave. Ruled a fall. He was no investigator.' },
  boots_matched:     { name: 'The maker\'s nails', thread: 'case', text: 'Feig matched the deep cut prints to a boot he has resoled twice: town-made, gentleman\'s last, Gantt\'s size.' },
  rubbings_matched:  { name: 'The plat stone rubbings', thread: 'case', text: 'Coombs had opened the wrong coffin. Fenwick sold you what was in it: rubbings of the original plat stones, and they agree with Tam\'s scrap against the courthouse book.' },
  he_measures:       { name: 'HE MEASURES', thread: 'case', text: 'Rood\'s murmur in the records room gave two words, and they narrow the county to two men, and only one of them measures for a living.' },
  true_line:         { name: 'The true line', thread: 'case', text: 'Five brass benchmarks, old Crane\'s own, re-derive the boundary with no witness needed. Mathematics does not perjure.' },
  gantt_burned_notes:{ name: 'Gantt\'s burned notes', thread: 'case', text: 'Half-burned notes in Gantt\'s stove name Tam, Coombs, and the benchmark line before the fire eats the rest.' },
  rood_attacked:     { name: 'The records room', thread: 'case', text: 'Someone came for Pelham Rood at night among the court papers, and for the re-inked page in particular.' },
  nan_missing:       { name: 'Nan Trent is gone', thread: 'mountain', text: 'Livestock first, then the miller\'s daughter, in one night. Every animal in the county points north. Robey Marsh, sober for the first time in living memory, has marked the way into the caves.' },
  nan_trail:         { name: 'Nan\'s ribbon', thread: 'mountain', text: 'Nan\'s ribbon catches on laurel on the marked way. The animals did not flee randomly. They followed her path.' },
  the_chamber:       { name: 'The chamber', thread: 'mountain', text: 'At the bottom of everything: a cold cathedral dark, and Nan Trent sitting in it, unharmed, listening.' }
};

export function addClue(state, id) {
  if (!CLUES[id]) throw new Error('no such clue: ' + id);
  if (state.clues.includes(id)) return state;
  return { ...state, clues: [...state.clues, id],
           flags: { ...state.flags, ['clue_' + id]: true } };
}

// Evidence a court can weigh. Physical carries double.
export const EVIDENCE = {
  plat_mismatch: 2, boots_matched: 2, rubbings_matched: 2, true_line: 2,
  dry_boots: 1, calm_bootprints: 1, razored_ledger: 1, ledger_cut: 1,
  gentleman_letter: 1, he_measures: 1, gantt_burned_notes: 1
};
export function evidenceScore(state) {
  return state.clues.reduce((n, c) => n + (EVIDENCE[c] || 0), 0);
}

export function threadDone(state) {
  const has = id => state.clues.includes(id);
  if (has('singing_confession') && has('calm_bootprints')) return 'quarry';
  if ((has('razored_ledger') || has('ledger_cut')) && has('plat_mismatch')) return 'plat';
  if (has('gentleman_letter')) return 'fort';
  return null;
}

const abs = c => (c.day - 1) * 24 + c.hour;

// Beats: when() gates on state, apply() returns { state, toast }.
export const BEATS = [
  {
    id: 'drover',
    when: s => s.flags.enteredMarket && !s.flags.droverDied,
    apply: s => ({
      state: addClue({ ...s, flags: { ...s.flags, droverDied: true, droverAbs: abs(s.clock) } }, 'drover_died'),
      toast: 'A drover ahead of you folds mid-sentence and is gone before he lands. Half the town sees it. His cur sits down beside him and does not move.'
    })
  },
  {
    id: 'firstlight',
    when: s => s.flags.droverDied && !s.flags.sawLight && (s.clock.hour >= 21 || s.clock.hour < 5),
    apply: s => ({
      state: addClue({ ...s, flags: { ...s.flags, sawLight: true } }, 'light_on_mountain'),
      toast: 'Fog off the Potomac. On Wills Mountain, a light moves where no road runs. A dock hand follows your eyes and looks away hard.'
    })
  },
  {
    id: 'body',
    when: s => s.flags.droverDied && !s.flags.bodyFound && abs(s.clock) >= (s.flags.droverAbs || 0) + 14,
    apply: s => ({
      state: addClue({ ...s, flags: { ...s.flags, bodyFound: true } }, 'tam_drowned'),
      toast: 'Shouting from the creek at first light: Tam Hollis, quarryman, drowned upstream of the workings. Lungs full of water. Boots dry as a sermon. Beall is asking for you by name.'
    })
  },
  {
    id: 'gossipturn',
    when: s => !s.flags.gossipTurn && s.clues.filter(c => ['singing_confession','calm_bootprints','razored_ledger','ledger_cut','plat_mismatch','gentleman_letter'].includes(c)).length >= 2,
    apply: s => ({
      state: { ...s, flags: { ...s.flags, gossipTurn: true }, reputation: { ...s.reputation, kirk: s.reputation.kirk + 1 } },
      toast: 'Brother Crane preaches the drowning as a judgment, and the square listens harder than it should. Whatever you are pulling at, Peg has noticed you pulling.'
    })
  },
  {
    id: 'threaddone',
    when: s => !s.flags.threadDone && threadDone(s) !== null,
    apply: s => ({
      state: { ...s, flags: { ...s.flags, threadDone: threadDone(s), threadSleepMark: s.flags.sleepCount || 0 } },
      toast: 'The ' + threadDone(s) + ' thread pulls taut. You know enough now to be dangerous to somebody. Sleep on it.'
    })
  },
  {
    id: 'coombs',
    when: s => s.flags.threadDone && !s.flags.coombsDead && (s.flags.sleepCount || 0) > (s.flags.threadSleepMark ?? 1e9),
    apply: s => ({
      state: addClue({ ...s, flags: { ...s.flags, coombsDead: true } }, 'coombs_grave'),
      toast: 'Morning brings it: Ezra Coombs, dead at the bottom of Tam Hollis\'s fresh grave, neck broken, ruled a fall. He was not investigating anything. The town\'s fear stops being particular.'
    })
  },
  {
    id: 'roodattack',
    when: s => s.flags.act1Complete && !s.flags.roodResolved && (s.flags.sleepCount || 0) > (s.flags.act1SleepMark ?? 1e9),
    apply: s => {
      const alive = Boolean(s.flags.warnedRood);
      const flags = { ...s.flags, roodResolved: true, roodAlive: alive, roodDead: !alive, roodSleepMark: s.flags.sleepCount || 0 };
      const next = addClue({ ...s, flags }, 'rood_attacked');
      return {
        state: next,
        toast: alive
          ? 'Night, the records room: a shape with a razor, and Pelham Rood awake and ready because somebody warned him. He is scared, hunted, alive, and suddenly very cooperative.'
          : 'Morning finds the records room wrecked and Pelham Rood dead in it, the re-inked plat page in his hand. The court has lost its clerk and you have lost a witness.'
      };
    }
  },
  {
    id: 'revival',
    when: s => s.flags.roodResolved && !s.flags.act2Complete && (s.flags.sleepCount || 0) > (s.flags.roodSleepMark ?? ((s.flags.sleepCount || 0) - 1)),
    apply: s => ({
      state: { ...s, flags: { ...s.flags, act2Complete: true, act2SleepMark: s.flags.sleepCount || 0 },
               reputation: { ...s.reputation, kirk: s.reputation.kirk + 1 } },
      toast: 'Crane holds his torchlit revival at the fort, and mid-sermon the ground under the ruins audibly groans. Every soul present hears it. Deniability is over, and the town begins to choose fear. ACT III: the case wants laying before Judge Kent.'
    })
  },
  {
    id: 'beallpulls',
    when: s => s.flags.act2Complete && !s.flags.beallPulled && evidenceScore(s) >= 6,
    apply: s => ({
      state: { ...s, flags: { ...s.flags, beallPulled: true } },
      toast: 'Beall meets you where the gaslight thins. "If you mean to lay this, lay it clean. The curse will not stand up in Kent\'s room. Paper might."'
    })
  },
  {
    id: 'act3complete',
    when: s => (s.flags.verdict === 'guilty' || s.flags.verdict === 'deal') && !s.flags.act3Complete,
    apply: s => ({
      state: { ...s, flags: { ...s.flags, act3Complete: true, act3SleepMark: s.flags.sleepCount || 0 } },
      toast: 'The human ledger closes, or pretends to. That night every animal in Cumberland turns north. ACT IV: Nan Trent is missing.'
    })
  }
];

export function advanceCase(state) {
  let s = state;
  const toasts = [];
  for (const beat of BEATS) {
    if (beat.when(s)) {
      const r = beat.apply(s);
      s = r.state;
      toasts.push(r.toast);
    }
  }
  return { state: s, toasts };
}

export function cluesFromFlags(state) {
  let s = state;
  if (s.flags.sawLight) s = addClue(s, 'light_on_mountain');
  if (s.flags.bodyFound) s = addClue(s, 'tam_drowned');
  if (s.flags.quarrySang) s = addClue(s, 'singing_confession');
  if (s.flags.bootprints) s = addClue(s, 'calm_bootprints');
  if (s.flags.ledgerCut) s = addClue(s, 'razored_ledger');
  if (s.flags.platMismatch) s = addClue(s, 'plat_mismatch');
  if (s.flags.gentlemanLetter) s = addClue(s, 'gentleman_letter');
  if (s.flags.coombsDead) s = addClue(s, 'coombs_grave');
  if (s.flags.bootsMatched) s = addClue(s, 'boots_matched');
  if (s.flags.rubbingsMatched) s = addClue(s, 'rubbings_matched');
  if (s.flags.heMeasures) s = addClue(s, 'he_measures');
  if (s.flags.benchmarksAll) s = addClue(s, 'true_line');
  if (s.flags.nanMissing) s = addClue(s, 'nan_missing');
  if (s.flags.inChamber) s = addClue(s, 'the_chamber');
  return s;
}

export function chooseEnding(state) {
  const buried = state.player.sight >= 2 && state.clues.includes('the_chamber');
  return { ...state, flags: { ...state.flags, ending: buried ? 'buried_truth' : 'ledger_closed' } };
}

export function adoptPet(state, kind) {
  return { ...state, pet: kind };
}

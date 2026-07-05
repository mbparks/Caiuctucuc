// The deduction: before the verdict math, the player must ASSEMBLE the
// accusation from what they have gathered. Culprit, motive, and proof.
// Getting it right is the difference between a case that holds and one that
// leaks. The truth is fixed (Gantt, the quarry on the sealed seam, the plat);
// the wrong answers are the plausible ones the town would rather believe.

export const DEDUCTION = {
  culprit: {
    question: 'Who killed Tam Hollis, and Coombs after him?',
    correct: 'gantt',
    options: [
      { id: 'gantt', label: 'Prosper Gantt, the surveyor' },
      { id: 'curse', label: 'The thing in the deep cut. No hand at all' },
      { id: 'mcteague', label: 'McTeague, the last man to see Tam alive' },
      { id: 'cresap', label: 'Cresap, to protect his bribes' }
    ]
  },
  motive: {
    question: 'Why?',
    correct: 'quarry',
    options: [
      { id: 'quarry', label: 'To hide a quarry he opened on the sealed fort seam' },
      { id: 'debt', label: 'Gambling debts to the canal men' },
      { id: 'jealousy', label: 'A woman, the oldest reason there is' },
      { id: 'madness', label: 'The singing drove him to it' }
    ]
  },
  proof: {
    question: 'What proof will you set before the bench?',
    correct: 'plat_mismatch',
    // proof options are the clue ids the player may hold; only the plat is decisive
    options: [
      { id: 'plat_mismatch', label: 'The plat book, re-inked to disagree with Tam\u2019s scrap' },
      { id: 'calm_bootprints', label: 'The calm second bootprints at the cut' },
      { id: 'singing_confession', label: 'That the rock was heard singing' },
      { id: 'gentleman_letter', label: 'Tam\u2019s letter about a gentleman buyer' }
    ]
  }
};

// Score a full accusation. Returns a conviction modifier (-2..+3) and a note.
export function scoreDeduction(pick) {
  let mod = 0;
  const right = {};
  right.culprit = pick.culprit === DEDUCTION.culprit.correct;
  right.motive = pick.motive === DEDUCTION.motive.correct;
  right.proof = pick.proof === DEDUCTION.proof.correct;

  if (right.culprit) mod += 1; else mod -= 2;
  if (right.motive) mod += 1;
  if (right.proof) mod += 1;

  // naming the curse as the killer is the town's favorite escape; it collapses the case
  if (pick.culprit === 'curse') mod -= 1;

  let note;
  if (right.culprit && right.motive && right.proof)
    note = 'clean';
  else if (right.culprit && right.proof)
    note = 'sound';
  else if (right.culprit)
    note = 'thin';
  else
    note = 'wrong';

  return { mod, note, right };
}

// Which proof options the player actually holds (to show only real evidence).
export function availableProof(state) {
  return DEDUCTION.proof.options.filter(o => state.clues.includes(o.id));
}

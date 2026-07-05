// Case board: turns clues into a readable investigation board and trial-ready advice.
import { CLUES, evidenceScore } from './quest.js';
import { DEDUCTION, availableProof, scoreDeduction } from './deduction.js';

const THREAD_LABELS = {
  prologue: 'Opening Signs', body: 'The Drowned Man', quarry: 'The Quarry',
  plat: 'Paper Trail', fort: 'Fort Seam', turn: 'Coombs', case: 'Against Gantt',
  mountain: 'The Mountain', unknown: 'Unfiled'
};

const CONTRADICTIONS = [
  { id: 'dry_boots', needs: ['tam_drowned'], text: 'Tam drowned, but his boots were dry. The creek did not kill him where it found him.' },
  { id: 'ledger_cut', needs: ['ledger_cut'], text: 'A razored ledger page is deliberate. Someone needed absence to read as accident.' },
  { id: 'plat_mismatch', needs: ['plat_mismatch'], text: 'The plat book disagrees with freight and stone. Paper is trying to overrule ground.' },
  { id: 'bootprints', needs: ['calm_bootprints'], text: 'A second set of calm bootprints leaves a staged death, not a panic.' },
  { id: 'curse_cover', needs: ['singing_confession', 'boots_matched'], text: 'The haunting is real, but the boot nail is human. Fear became camouflage.' },
  { id: 'true_line', needs: ['true_line'], text: 'The benchmark line re-derives the boundary without asking any liar for permission.' }
];

const SUPERNATURAL = [
  { id: 'singing_confession', text: 'The rock sings, but a court will not hang a man on a song.' },
  { id: 'he_measures', text: 'HE MEASURES points toward a surveyor, but the phrase itself is not legal proof.' },
  { id: 'the_chamber', text: 'The chamber explains the seal. It does not replace the murder file.' },
  { id: 'nan_trail', text: 'Nan proves the mountain is awake. Gantt still needs a human case against him.' }
];

function has(state, id) { return Boolean((state.clues || []).includes(id) || state.flags?.[id] || state.flags?.['clue_' + id]); }

export function evidenceCards(state) {
  const clues = state.clues || [];
  return clues.map(id => ({ id, ...(CLUES[id] || { name: id, thread: 'unknown', text: '' }) }));
}

export function boardThreads(state) {
  const groups = {};
  for (const card of evidenceCards(state)) {
    const thread = card.thread || 'unknown';
    if (!groups[thread]) groups[thread] = { id: thread, label: THREAD_LABELS[thread] || thread, cards: [] };
    groups[thread].cards.push(card);
  }
  return Object.values(groups);
}

export function contradictions(state) {
  return CONTRADICTIONS.filter(c => c.needs.every(id => has(state, id)));
}

export function supernaturalTruths(state) {
  return SUPERNATURAL.filter(s => has(state, s.id));
}

export function legalProof(state) {
  const proofs = availableProof(state);
  const extras = [];
  if (has(state, 'boots_matched')) extras.push({ id: 'boots_matched', label: 'The gentleman boot nail ties the quarry scene to Gantt.' });
  if (has(state, 'true_line')) extras.push({ id: 'true_line', label: 'The benchmark line proves the re-inked boundary is false.' });
  if (has(state, 'ledger_cut')) extras.push({ id: 'ledger_cut', label: 'The razored ledger shows deliberate record tampering.' });
  return [...proofs, ...extras];
}

export function accusationPreview(state) {
  const proofId = availableProof(state).find(p => p.id === 'plat_mismatch')?.id || availableProof(state)[0]?.id || 'none';
  const clean = scoreDeduction({ culprit: 'gantt', motive: 'quarry', proof: proofId });
  const supernatural = scoreDeduction({ culprit: 'curse', motive: 'madness', proof: has(state, 'singing_confession') ? 'singing_confession' : 'none' });
  return {
    clean,
    supernatural,
    cleanText: clean.note === 'clean'
      ? 'Clean accusation: Gantt, sealed seam quarry, re-inked plat. This is the case that holds.'
      : 'The intended accusation is visible, but it still needs the decisive plat or equivalent hard proof.',
    supernaturalText: supernatural.note === 'wrong'
      ? 'Blaming the curse collapses the murder case. The haunting is context, not culprit.'
      : 'The supernatural file explains why the town looked away, not who used the fear.'
  };
}

export function openLeads(state) {
  const leads = [];
  if (!has(state, 'tam_drowned')) leads.push('Find the body at Wills Creek and establish the impossible drowning.');
  if (!has(state, 'dry_boots')) leads.push('Inspect Tam\'s boots closely enough to separate creek truth from murder staging.');
  if (!has(state, 'singing_confession')) leads.push('Go to the quarry and learn why the stone is said to sing.');
  if (!has(state, 'calm_bootprints')) leads.push('Search the deep cut for the second set of calm bootprints.');
  if (!has(state, 'gentleman_letter')) leads.push('Find Tam Hollis\'s letter about the gentleman who offered money for silence.');
  if (!has(state, 'plat_mismatch')) leads.push('Compare quarry traffic against the courthouse plat.');
  if (!has(state, 'boots_matched')) leads.push('Tie the gentleman\'s boot to a named man.');
  if (!has(state, 'true_line')) leads.push('Find five brass benchmarks and re-derive the true boundary.');
  if (state.flags?.act3Complete && !has(state, 'the_chamber')) leads.push('Follow the marked way under Wills Mountain and find Nan.');
  return leads;
}

export function trialReadiness(state) {
  const score = evidenceScore(state);
  const proofs = legalProof(state);
  const preview = accusationPreview(state);
  return {
    score,
    proofs,
    contradictions: contradictions(state),
    supernatural: supernaturalTruths(state),
    preview,
    ready: score >= 6 && proofs.length > 0,
    cleanNote: preview.clean.note,
    advice: score >= 6
      ? 'The file has enough weight for court. Name Gantt, name the sealed seam, and use hard proof.'
      : 'The file is still light. The court needs physical proof: plat mismatch, boot match, benchmark line, or rubbings.'
  };
}

export function accusationOptions() {
  return DEDUCTION;
}

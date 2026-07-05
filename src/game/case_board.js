// Case board: turns clues into a readable investigation board and trial-ready advice.
import { CLUES, evidenceScore } from './quest.js';
import { DEDUCTION, availableProof, scoreDeduction } from './deduction.js';

const THREAD_LABELS = {
  prologue: 'Opening Signs', body: 'The Drowned Man', quarry: 'The Quarry',
  plat: 'Paper Trail', fort: 'Fort Seam', turn: 'Coombs', case: 'Against Gantt',
  mountain: 'The Mountain'
};

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

export function openLeads(state) {
  const has = id => (state.clues || []).includes(id);
  const leads = [];
  if (!has('tam_drowned')) leads.push('Find the body at Wills Creek and establish the impossible drowning.');
  if (!has('singing_confession')) leads.push('Go to the quarry and learn why the stone is said to sing.');
  if (!has('calm_bootprints')) leads.push('Search the deep cut for the second set of calm bootprints.');
  if (!has('gentleman_letter')) leads.push('Find Tam Hollis\'s letter about the gentleman who offered money for silence.');
  if (!has('plat_mismatch')) leads.push('Compare quarry traffic against the courthouse plat.');
  if (!has('boots_matched')) leads.push('Tie the gentleman\'s boot to a named man.');
  if (!has('true_line')) leads.push('Find five brass benchmarks and re-derive the true boundary.');
  if (state.flags?.act3Complete && !has('the_chamber')) leads.push('Follow the marked way under Wills Mountain and find Nan.');
  return leads;
}

export function trialReadiness(state) {
  const score = evidenceScore(state);
  const proofs = availableProof(state);
  const clean = scoreDeduction({ culprit: 'gantt', motive: 'sealed_seam', proof: proofs.includes('plat') ? 'plat' : proofs[0]?.id || 'none' });
  return {
    score,
    proofs,
    ready: score >= 6 && proofs.length > 0,
    cleanNote: clean.note,
    advice: score >= 6
      ? 'The file has enough weight for court. Name Gantt, name the sealed seam, and use hard proof.'
      : 'The file is still light. The court needs physical proof: plat mismatch, boot match, benchmark line, or rubbings.'
  };
}

export function accusationOptions() {
  return DEDUCTION;
}

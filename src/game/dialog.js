// Keyword conversation engine. Ultima style: the player asks words,
// the NPC answers, deflects, or shrugs. Pure logic, testable in Node.
import { canAsk, learn } from './keywords.js';

export const DEFAULT_SHRUG = 'A shrug. Try another word.';
export const DEFAULT_DEFLECT = 'A look that says: not to you, not today.';

// Any capitalized token an NPC speaks joins the journal, per the design.
// allKeywords is the flat global vocabulary; teaches may add explicitly.
export function extractTaught(text, allKeywords) {
  const spoken = text.match(/\b[A-Z][A-Z0-9]{2,}\b/g) || [];
  return spoken.filter(w => allKeywords.includes(w));
}

export function buildCtx(state) {
  return {
    trust: state.trust,
    reputation: state.reputation,
    sight: state.player.sight,
    flags: state.flags
  };
}

// ask() never mutates; it returns the response and a new state.
export function ask(dialog, keyword, state, allKeywords) {
  const entry = (dialog.entries || []).find(e => e.keyword === keyword);
  if (!entry) return { text: dialog.shrug || DEFAULT_SHRUG, state };

  const ctx = buildCtx(state);
  if (!canAsk(entry, ctx)) {
    return { text: entry.deflect || dialog.deflect || DEFAULT_DEFLECT, state };
  }
  if (entry.cost && state.player.coin < entry.cost) {
    return { text: entry.broke || 'Coin first. That is the house rule.', state };
  }

  let next = state;
  if (entry.cost) {
    next = { ...next, player: { ...next.player, coin: next.player.coin - entry.cost } };
  }
  const taught = [
    ...(entry.teaches || []),
    ...extractTaught(entry.text, allKeywords)
  ];
  let learned = next.keywordsLearned;
  for (const k of taught) learned = learn(learned, k);
  if (learned !== next.keywordsLearned) next = { ...next, keywordsLearned: learned };

  if (entry.sets) {
    next = { ...next, flags: { ...next.flags, ...entry.sets } };
  }
  return { text: entry.text, state: next, newWords: taught.filter(k => !state.keywordsLearned.includes(k)) };
}

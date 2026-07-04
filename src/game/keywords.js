// Keyword gating, from the Keyword Matrix companion document.
// A response entry: { gate: 'open' | 'trust' | 'reputation' | 'sight' | 'flag', ...params }
export function canAsk(entry, ctx) {
  switch (entry.gate) {
    case 'open': return true;
    case 'trust': return (ctx.trust[entry.npc] || 0) >= entry.min;
    case 'reputation': return (ctx.reputation[entry.faction] || 0) >= entry.min;
    case 'sight': return ctx.sight >= entry.min;
    case 'flag': return Boolean(ctx.flags[entry.flag]);
    default: return false;
  }
}

// Learning: any capitalized keyword an NPC speaks joins the journal once.
export function learn(learned, keyword) {
  return learned.includes(keyword) ? learned : [...learned, keyword];
}

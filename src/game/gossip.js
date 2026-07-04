// The gossip network: who tells whom, and how long the telling takes.
// Rumors travel edges with hour delays; Peg is the hub by design.
export const NETWORK = [
  // sources into the tavern
  { from: 'market', to: 'doyle', hours: 6 },
  { from: 'market', to: 'beall', hours: 1 },
  { from: 'shanks', to: 'doyle', hours: 12 },
  { from: 'bright', to: 'doyle', hours: 8 },
  { from: 'mcteague', to: 'doyle', hours: 10 },
  { from: 'feig', to: 'doyle', hours: 10 },
  { from: 'beall', to: 'doyle', hours: 4 },
  // Peg redistributes, for a price or a purpose
  { from: 'doyle', to: 'cresap', hours: 12 },
  { from: 'doyle', to: 'fenwick', hours: 12 },
  { from: 'doyle', to: 'bright', hours: 8 },
  // quiet lines
  { from: 'rood', to: 'kent', hours: 24 },
  // the widow talks to no one: no edges from brahm, by design
];

export function newRumor(id, source, hourAbs) {
  return { id, source, hourAbs };
}

// Earliest hour each node hears a rumor: shortest-path over hour delays.
export function arrivalTimes(rumor, network = NETWORK) {
  const best = { [rumor.source]: rumor.hourAbs };
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of network) {
      if (best[e.from] === undefined) continue;
      const t = best[e.from] + e.hours;
      if (best[e.to] === undefined || t < best[e.to]) { best[e.to] = t; changed = true; }
    }
  }
  return best;
}

export function knows(npcId, rumor, nowAbs, network = NETWORK) {
  const t = arrivalTimes(rumor, network)[npcId];
  return t !== undefined && t <= nowAbs;
}

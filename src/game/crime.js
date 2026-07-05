// Free-form crime: the GTA loop. The player can act on any NPC, unprompted,
// anywhere. Witnesses within sight raise the hue and cry; an unseen crime
// raises almost none. This is what makes the world reactive rather than scripted.

// Who can see the player right now? An NPC witnesses if they are within sight
// range and not blocked by a wall. Disguise (a coat that doesn't match your
// reputation) reduces the effective witness count.
export function witnessesOf(player, npcs, solidAtPx, sightRange = 90) {
  const seers = [];
  for (const n of npcs) {
    const dx = n.x - player.x, dy = n.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > sightRange) continue;
    if (lineBlocked(player, n, solidAtPx)) continue;
    seers.push(n);
  }
  return seers;
}

// crude line-of-sight: sample points along the segment; if any is solid, blocked
function lineBlocked(a, b, solidAtPx) {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (solidAtPx(a.x + (b.x - a.x) * t + 8, a.y + (b.y - a.y) * t + 8)) return true;
  }
  return false;
}

// The catalogue of things you can just DO to a person.
export const CRIMES = {
  pickpocket: {
    label: 'Pick their pocket', heatSeen: 8, heatUnseen: 1,
    coinMin: 1, coinMax: 4, needsUnseen: false,
    okText: 'Your fingers find their purse. A few coins, and they none the wiser, if no one saw.',
    caughtText: 'Your hand closes on the purse just as their hand closes on your wrist.'
  },
  rob: {
    label: 'Rob them at knifepoint', heatSeen: 22, heatUnseen: 10,
    coinMin: 3, coinMax: 9, needsUnseen: false,
    okText: 'They give up their purse with shaking hands. This will be told and retold by nightfall.',
    caughtText: 'They give up the purse, but three people watched you take it.'
  },
  shove: {
    label: 'Shove them down', heatSeen: 6, heatUnseen: 2,
    coinMin: 0, coinMax: 0, needsUnseen: false,
    okText: 'You put them in the mud. Cheap satisfaction, and a witness or two.',
    caughtText: 'You put them down hard, in front of half the street.'
  }
};

// Resolve a crime against a victim, given the witness list.
export function commitCrime(state, crimeId, victim, witnesses, rng = Math.random) {
  const c = CRIMES[crimeId];
  if (!c) return { ok: false, text: 'Nothing to do.', state };
  const seen = witnesses.length > 0;
  const heat = seen ? c.heatSeen * Math.min(3, witnesses.length) : c.heatUnseen;
  const coin = c.coinMax ? Math.floor(c.coinMin + rng() * (c.coinMax - c.coinMin + 1)) : 0;

  // honor / reputation cost: crime in view of the town lowers standing
  const townHit = seen ? (crimeId === 'rob' ? 2 : 1) : 0;

  return {
    ok: true,
    seen,
    heat,
    coin,
    townHit,
    text: (seen ? c.caughtText : c.okText) +
      (coin ? ' (+' + coin + ' silver)' : '') +
      (seen ? ' [' + witnesses.length + ' saw you]' : ' [unseen]')
  };
}

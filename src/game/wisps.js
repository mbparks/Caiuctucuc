// The wisp ledger: every light resolves from a seeded table.
// Treasure or trap, even odds across the seed. Design doc Section 16 rank 1.
export function resolveWisp(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  if (h % 2 === 0) {
    const coin = 2 + (h % 5);
    return { kind: 'cache', coin, text: 'The light sinks into the ground and goes out over a buried tin: ' + coin + ' silver, waiting for whoever followed.' };
  }
  const hurt = 2 + (h % 3);
  return { kind: 'snare', hurt, text: 'The light goes out an arm\u2019s length ahead and the ground was never there. You take the fall hard: ' + hurt + ' hurt.' };
}

// A placed ward within reach pulls the teeth from a snare.
export function wardedResolve(name, warded) {
  const r = resolveWisp(name);
  if (r.kind === 'snare' && warded)
    return { kind: 'warded', hurt: 0, text: 'The light lunges and breaks against the ward line like water on a stone. Old paint, still working.' };
  return r;
}

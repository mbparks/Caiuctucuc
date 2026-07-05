// The typed prompt. Difficulty agnostic; they always work. Design doc 17.

// Act skips grant every prerequisite flag AND the clues the player would have
// gathered, so the case file and the next hint make sense on arrival. Each is
// cumulative: ACT2 includes everything ACT1 set, and so on.
const ACT_CLUES = {
  1: ['drover_died', 'light_on_mountain', 'tam_drowned', 'singing_confession',
      'calm_bootprints', 'razored_ledger', 'plat_mismatch', 'gentleman_letter', 'coombs_grave'],
  2: ['boots_matched', 'rubbings_matched', 'he_measures', 'true_line', 'rood_attacked'],
  3: [],
  4: ['nan_missing']
};

function grantClues(state, ids) {
  const have = new Set(state.clues);
  const clues = [...state.clues];
  const flags = { ...state.flags };
  for (const id of ids) if (!have.has(id)) { clues.push(id); flags['clue_' + id] = true; }
  return { ...state, clues, flags };
}

function skipToAct(state, act) {
  // gather the clue set cumulatively up to and including this act
  let ids = [];
  for (let a = 1; a <= act; a++) ids = ids.concat(ACT_CLUES[a] || []);
  let s = grantClues(state, ids);
  const f = { ...s.flags };
  // the flag chain, set cumulatively so each act's gate and hint resolve
  const base = { enteredMarket: true, droverDied: true, sawLight: true,
                 bodyFound: true, hiredByBeall: true, droverAbs: 0 };
  Object.assign(f, base);
  if (act >= 1) { f.threadDone = 'case'; f.coombsDead = true; f.act1Complete = true; f.act1SleepMark = 0; }
  if (act >= 2) { f.roodResolved = true; f.roodAlive = true; f.act2Complete = true; f.act2SleepMark = 0; }
  if (act >= 3) { f.verdict = f.verdict || 'guilty'; f.act3Complete = true; f.act3SleepMark = 0; }
  if (act >= 4) { f.nanMissing = true; }
  // sleepCount high enough that no gated advance re-fires unexpectedly
  f.sleepCount = Math.max(f.sleepCount || 0, 12);
  const labels = {
    1: 'ACT ONE. The drover is buried, Coombs is dead in Tam\u2019s grave, and the case is a live thing. Sleep resolves Rood.',
    2: 'ACT TWO. The file is built: boots, rubbings, the true line, HE MEASURES. Lay the case before Kent at the courthouse.',
    3: 'ACT THREE. The verdict stands. The mountain is not finished, and neither is the town. Sleep.',
    4: 'ACT FOUR. Nan Trent is gone and the way into the caves is marked with a horseshoe on the quarry road.'
  };
  return { ok: true, text: labels[act], state: { ...s, flags: f } };
}

export function applyCheat(state, code) {
  switch (code.trim().toUpperCase()) {
    case 'SNAKEOIL':
      return { ok: true, text: 'A warmth like the label promised. Health restored and then some.',
               state: { ...state,
                        player: { ...state.player, health: state.player.maxHealth },
                        flags: { ...state.flags, snakeOilSalesman: true } } };
    case 'SPECIE':
      return { ok: true, text: 'A purse of silver dollars appears with no provenance whatsoever. 25 silver.',
               state: { ...state, player: { ...state.player, coin: state.player.coin + 25 } } };
    case 'PARDON':
      return { ok: true, text: 'The street forgets you entire. Papers, apparently, were in order.',
               state: { ...state, hueCry: { level: 0, heat: 0, witnessedCoat: null } } };
    case 'LANTERNS':
      return { ok: true, text: 'The dark agrees to keep its distance from now on.',
               state: { ...state, flags: { ...state.flags, cheatLanterns: true } } };
    case 'ACT1': case 'ACTONE':
      return skipToAct(state, 1);
    case 'ACT2': case 'ACTTWO':
      return skipToAct(state, 2);
    case 'ACT3': case 'ACTTHREE':
      return skipToAct(state, 3);
    case 'ACT4': case 'ACTFOUR':
      return skipToAct(state, 4);
    default:
      return { ok: false, text: 'The word means nothing. Or it means something and refuses you.', state };
  }
}

// The typed prompt. Difficulty agnostic; they always work. Design doc 17.
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
    default:
      return { ok: false, text: 'The word means nothing. Or it means something and refuses you.', state };
  }
}

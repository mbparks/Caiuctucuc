// Expanded law model helpers. These complement the existing hue-and-cry meter
// with readable stage labels and player actions that work from the world panel.
import { decay } from './huecry.js';
import { nextCoat } from './disguise.js';

export function lawStage(state) {
  const heat = state.hueCry?.heat || 0;
  const level = state.hueCry?.level || 0;
  if (level >= 4 || heat >= 36) return { id: 'lockdown', label: 'Lockdown', text: 'Printed bills, hard eyes, and men paid to recognize a coat.' };
  if (level >= 3 || heat >= 24) return { id: 'militia', label: 'Militia Watch', text: 'Patrols gather around bridges, taverns, and the courthouse steps.' };
  if (level >= 2 || heat >= 12) return { id: 'constable', label: 'Constable Alert', text: 'Beall has heard enough to come looking.' };
  if (level >= 1 || heat >= 4) return { id: 'gossip', label: 'Gossip', text: 'The town is repeating a version of you.' };
  return { id: 'quiet', label: 'Quiet', text: 'No one important is looking for you yet.' };
}

export function witnessMemory(state) {
  const coat = state.hueCry?.witnessedCoat;
  if (!coat) return 'No coat has been named in the street talk.';
  return 'Witnesses are repeating the ' + coat + ' coat.';
}

export function bribeRunner(state, cost = 2) {
  if ((state.player?.coin || 0) < cost) return { ok: false, state, text: 'A runner wants ' + cost + ' silver, and you do not have it.' };
  return {
    ok: true,
    state: {
      ...state,
      player: { ...state.player, coin: state.player.coin - cost },
      hueCry: decay(state.hueCry || { level: 0, heat: 0, witnessedCoat: null }, 4)
    },
    text: 'Two silver moves through small hands. By supper, the story has acquired a different hat and a worse memory.'
  };
}

export function changeCoatAction(state) {
  const coat = nextCoat(state.player?.coat || 'drover');
  return {
    ok: true,
    state: { ...state, player: { ...state.player, coat } },
    text: 'You change into the ' + coat + ' coat. A hurried witness may now be looking for yesterday.'
  };
}

export function hideOnTowpath(state) {
  return {
    ok: true,
    state: { ...state, clock: { ...state.clock, hour: (state.clock.hour + 2) % 24 }, hueCry: decay(state.hueCry || { level: 0, heat: 0, witnessedCoat: null }, 3) },
    text: 'Two hours under canal stone and towpath fog. The law cools because it has feet and you have stillness.'
  };
}

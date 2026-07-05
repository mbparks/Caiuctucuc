// Ambient remarks: the small lines that make a town feel lived in. An NPC may
// open with a comment on the hour, the weather, your standing, or your coat
// before the scripted greeting. Flavor only; never gates anything.

function period(hour) {
  if (hour < 5) return 'deepnight';
  if (hour < 8) return 'dawn';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 20) return 'dusk';
  return 'night';
}

const BY_TIME = {
  deepnight: [
    'You keep strange hours, friend.',
    'Nothing honest walks at this hour, so which are you?',
    'Late, or early. Hard to say which is worse in this town.'
  ],
  dawn: [
    'You are up with the mist. Good.',
    'The fog has not lifted off the creek yet. It rarely hurries.'
  ],
  morning: [
    'Fair morning, or as fair as the Narrows allows.',
    'The wagons are already moving. Always are.'
  ],
  afternoon: [
    'Warm enough, if the mountain lets it be.',
    'The packet boat is due on the four o\u2019clock. You can set a watch by it.'
  ],
  dusk: [
    'Light\u2019s going. It goes quick in a valley this deep.',
    'The lamps will want lighting soon.'
  ],
  night: [
    'Dark early down here, between the ridges.',
    'You will want a lantern past the last house.'
  ]
};

const BY_WEATHER = {
  rain: [
    'Filthy weather off the Potomac. Come in out of it.',
    'Rain on the towpath and every mule in a temper. Fitting.'
  ],
  fog: [
    'This fog gets into everything. Into the head, some say.',
    'A man could lose the road in a fog like this. Men have.'
  ]
};

// standing: keyed to town reputation bands
function standingRemark(rep) {
  const t = rep.town || 0;
  if (t <= -2) return ['Folk are talking about you, and not kindly.',
                       'You have a look the town has learned to mistrust.'];
  if (t >= 3) return ['You have friends here now, whether you wanted them.',
                      'The square speaks well of you, for what that is worth.'];
  return null;
}

const BY_COAT = {
  frock: ['A gentleman\u2019s coat. You wear it like it is borrowed.'],
  preacher: ['A preacher\u2019s black. The kirk could use the help, if you are what you dress as.'],
  drover: null
};

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

// Returns an aside string, or null. Deterministic per (npc, hour) so it does
// not flicker if you reopen the same conversation in the same beat.
export function ambientRemark(state, npcId) {
  const hour = state.clock.hour;
  const seed = (npcId.charCodeAt(0) + npcId.charCodeAt(npcId.length - 1) + hour * 7);
  // roughly one conversation in three opens with an aside
  if (seed % 3 !== 0) return null;

  const pools = [];
  if (state.weather && BY_WEATHER[state.weather]) pools.push(BY_WEATHER[state.weather]);
  const st = standingRemark(state.reputation || {});
  if (st) pools.push(st);
  const coat = BY_COAT[state.player.coat];
  if (coat) pools.push(coat);
  pools.push(BY_TIME[period(hour)]);

  // prefer the rarer, more specific pools when present
  const chosen = pools[seed % pools.length];
  return pick(chosen, seed);
}

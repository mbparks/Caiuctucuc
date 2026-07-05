// The jobs board: two honest livings and one that is not.
export const JOBS = {
  freight: {
    name: 'Freight haul', honest: true, pay: 4,
    stages: ['pickup', 'dropoff'],
    offer: 'Haul a crate from the warehouse to the wagon yard. Four silver on delivery.'
  },
  survey: {
    name: 'Survey assist', honest: true, pay: 3,
    stages: ['dropoff'],
    offer: 'Plant a boundary stake past the fort hill for the survey office. Three silver.'
  },
  nightrun: {
    name: 'A night delivery', honest: false, pay: 8,
    stages: ['pickup', 'dropoff'], nightOnly: true, dayHeat: 20,
    offer: 'A cask from Shanty Row to the ferry, after dark, no questions. Eight silver.'
  }
};

export function acceptJob(state, jobId) {
  if (!JOBS[jobId]) throw new Error('no such job: ' + jobId);
  if (state.job) return { ok: false, reason: 'a job is already in hand' };
  return { ok: true, state: { ...state, job: { id: jobId, stage: 0 } } };
}

// Interacting with a job waypoint. Returns text plus new state.
export function workJob(state, jobId, stage, hour) {
  const def = JOBS[jobId];
  if (!state.job || state.job.id !== jobId) return { text: 'Not your errand.', state };
  const expected = def.stages[state.job.stage];
  if (stage !== expected) return { text: 'Wrong end of the job. The ' + expected + ' comes first.', state };

  let next = { ...state, job: { ...state.job, stage: state.job.stage + 1 } };
  let text = expected === 'pickup' ? 'You shoulder the load.' : '';
  let heat = 0;

  if (next.job.stage >= def.stages.length) {
    next = { ...next, job: null, player: { ...next.player, coin: next.player.coin + def.pay } };
    if (!def.honest) next = { ...next, reputation: { ...next.reputation, road: next.reputation.road + 2 } };
    text = 'Done and paid: ' + def.pay + ' silver.' + (!def.honest ? ' The Road remembers who carries without asking.' : '');
    if (def.nightOnly && hour >= 6 && hour < 20) {
      heat = def.dayHeat;
      text += ' Done in daylight, though, and daylight has eyes.';
    }
  }
  return { text, state: next, heat };
}

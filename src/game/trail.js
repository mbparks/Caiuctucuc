// Clear short term direction for the player.
// Kept pure so the browser overlay and the Node tests use the same objective logic.

export const TRAIL_MODEL_VERSION = '0.22.0';

function flagsOf(s) { return (s && s.flags) || {}; }
function playerOf(s) { return (s && s.player) || {}; }

export function phaseFor(s = {}) {
  const f = flagsOf(s);
  if (f.ending) return 'epilogue';
  if (f.nanMissing) return 'mountain';
  if (f.act3Complete) return 'reckoning';
  if (f.act2Complete) return 'accuse';
  if (f.roodResolved) return 'sleep_after_rood';
  if (f.act1Complete) return 'paper_trail';
  if (f.threadDone) return 'sleep_on_thread';
  if (f.bodyFound && !f.hiredByBeall) return 'beall';
  if (f.hiredByBeall) return 'three_trails';
  if (f.droverDied) return 'morning_news';
  return 'arrival';
}

const TRAILS = {
  arrival: {
    title: 'Arrival on Baltimore Street',
    objective: 'Learn the town before the town learns you.',
    why: 'This is a mystery game, but the first minutes should feel like a foothold, not a fog bank.',
    target: 'The Blue Mule and the market square',
    steps: [
      'Walk east and west until you can recognize the street shape.',
      'Talk to Peg Doyle at the Blue Mule and ask NAME, JOB, and TOWN.',
      'Open the case file with J when you feel lost.'
    ],
    payoff: 'You will get words, places, and a safer reason to care about Cumberland.'
  },
  morning_news: {
    title: 'Morning News',
    objective: 'Let the town move, then listen for what changed.',
    why: 'The case starts when routine breaks. Resting or waiting lets that break reach you.',
    target: 'The Blue Mule or any safe bedroll',
    steps: [
      'Rest at the Blue Mule or let the hours turn outside.',
      'Watch for new talk in the tavern and on the street.',
      'Keep your heat low while the rumor moves.'
    ],
    payoff: 'The first real lead opens when the town has had time to gossip.'
  },
  beall: {
    title: 'The Constable Asks',
    objective: 'Find Beall and ask about TAM.',
    why: 'The investigation needs an official reason to touch locked rooms and old stories.',
    target: 'The gaol or courthouse square',
    steps: [
      'Find Beall near the gaol, courthouse, or tavern depending on the hour.',
      'Ask him about TAM.',
      'Check the case file after the conversation.'
    ],
    payoff: 'Beall opens the investigation and names the first three trails.'
  },
  three_trails: {
    title: 'Three Trails',
    objective: 'Work the quarry, surgery, and sleeping-place trails.',
    why: 'A good mystery is not one locked door. It is three doors that disagree with each other.',
    target: 'Surgery, quarry road, and the place Tam slept',
    steps: [
      'Search Tam\'s effects at the surgery.',
      'Walk the quarry road and look for what does not fit the official story.',
      'Find where a saving man slept and who knew it.'
    ],
    payoff: 'Each trail turns into a clue, a keyword, or a suspect pressure point.'
  },
  sleep_on_thread: {
    title: 'The Thread Is Taut',
    objective: 'Sleep and let the case change shape.',
    why: 'The town reacts to solved threads. Rest is a turn button, not a pause button.',
    target: 'Blue Mule, cabin, fort, or bedroll',
    steps: [
      'Find a safe place to sleep.',
      'Check the case file as soon as you wake.',
      'Expect the next act to arrive through people, not a menu.'
    ],
    payoff: 'The next phase begins with new pressure on the street.'
  },
  paper_trail: {
    title: 'The Paper Trail',
    objective: 'Find who is protecting the plat fraud.',
    why: 'The first case answer is not enough. Somebody made the false map useful.',
    target: 'Fenwick, Feig, and Rood',
    steps: [
      'Ask Fenwick about PAPER.',
      'Ask Feig about BOOTS.',
      'Tell Rood about Fenwick\'s LIST.'
    ],
    payoff: 'The paper trail turns a strange death into a civic conspiracy.'
  },
  sleep_after_rood: {
    title: 'After Rood',
    objective: 'Rest and watch what Crane does next.',
    why: 'When a town absorbs a confession, its institutions try to own the meaning.',
    target: 'Any safe rest point',
    steps: [
      'Rest until the next public movement begins.',
      'Go where Crane draws the crowd.',
      'Keep notes on who benefits from the new story.'
    ],
    payoff: 'The revival and the old record begin to matter.'
  },
  accuse: {
    title: 'Lay the Case',
    objective: 'Bring the accusation to Judge Kent.',
    why: 'The game should reward deduction, not just item collection.',
    target: 'Courthouse bench',
    steps: [
      'Review evidence in the case file.',
      'Bring proof, testimony, and a clear theory.',
      'Name the culprit, motive, and proof carefully.'
    ],
    payoff: 'A clean accusation can convict. A thin one leaves you digging.'
  },
  reckoning: {
    title: 'Unfinished Mountain',
    objective: 'Sleep. The mountain is not finished.',
    why: 'The legal truth is only one layer of the place.',
    target: 'Any rest point',
    steps: [
      'Sleep when ready.',
      'Watch for the mill and the north road to change.',
      'Carry food or remedies before leaving town.'
    ],
    payoff: 'The supernatural case takes the lead.'
  },
  mountain: {
    title: 'The Cave Mouth',
    objective: 'Follow the north road to the rock bluff and go down.',
    why: 'The town mystery now has a physical throat.',
    target: 'North road cave mouth',
    steps: [
      'Leave town by the north road.',
      'Look for the nailed horseshoe near the bluff.',
      'Enter with health, food, and whatever courage remains.'
    ],
    payoff: 'The final chamber waits below the town.'
  },
  epilogue: {
    title: 'The Road West',
    objective: 'Decide whether to leave with Bright\'s wagons.',
    why: 'A finished mystery still asks what kind of witness you became.',
    target: 'Stable yard',
    steps: [
      'Visit Bright\'s wagons when you want an ending card.',
      'Stay in Cumberland if you want to clean up side business.',
      'Export your save before experimenting with endings.'
    ],
    payoff: 'The game records the shape of your choices.'
  }
};

export function pressureFor(s = {}) {
  const p = playerOf(s);
  const heat = (s.hueCry && (s.hueCry.level || 0)) || 0;
  const notes = [];
  if ((p.health || 0) > 0 && p.health <= 3) notes.push('Health is low. Use food, whiskey, or snake oil before taking risks.');
  if (heat >= 4) notes.push('Bounty pressure is active. Change coats, cross the river, or lie low.');
  else if (heat >= 2) notes.push('The constable can recognize you. Do not loiter in open streets.');
  if (s.job) notes.push('You have active work: finish ' + s.job.id + ' before taking another job.');
  return notes;
}

export function trailFor(s = {}) {
  const phase = phaseFor(s);
  const t = TRAILS[phase] || TRAILS.arrival;
  const pressure = pressureFor(s);
  return {
    phase,
    title: t.title,
    objective: t.objective,
    why: t.why,
    target: t.target,
    steps: [...t.steps],
    pressure,
    payoff: t.payoff
  };
}

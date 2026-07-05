// The trail: one plain sentence about where the case wants you next.
// A stranger should finish Act I without asking a question the game
// did not answer. Roadmap v0.9.0 exit criterion.
export function nextHint(s) {
  const f = s.flags;
  if (f.ending) return 'The story is told. Bright\u2019s wagons load at the yard, whenever you are ready, or never.';
  if (f.nanMissing) return 'The mill wheel has stopped. The cave mouth on the quarry road is marked with a horseshoe.';
  if (f.act3Complete) return 'Sleep. The mountain is not finished, and neither is the town.';
  if (f.act2Complete) return 'Lay the case before Judge Kent at the courthouse bench. Conviction wants a file that weighs six.';
  if (f.roodResolved) return 'The town needs a night to absorb it. Rest, and attend what Crane does at the fort.';
  if (f.act1Complete) return 'Someone is protecting the plat fraud. Fenwick trades in PAPER, Feig knows BOOTS, and Rood should hear about Fenwick\u2019s LIST.';
  if (f.threadDone) return 'The thread is taut. Sleep on it, anywhere a bed or a bedroll will have you.';
  if (f.bodyFound && !f.hiredByBeall) return 'Beall is asking for you by name. Find the constable and ask him about TAM.';
  if (f.hiredByBeall) return 'Three trails: the QUARRY road and its deep cut, Tam\u2019s effects at the SURGERY, and wherever a saving man SLEPT.';
  if (f.droverDied) return 'Mornings bring news in a town this size. Rest at the Blue Mule, or walk and let the hours turn.';
  return 'Baltimore Street runs east to the market square, and everything in Cumberland passes through one or the other.';
}

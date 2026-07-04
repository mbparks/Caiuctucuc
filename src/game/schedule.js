// NPC schedules: hour ranges mapped to named spots on the map.
// A range may wrap midnight: { from: 20, to: 8, spot: 'home' }.
export function spotFor(schedule, hour) {
  for (const s of schedule) {
    if (s.from <= s.to ? (hour >= s.from && hour < s.to)
                       : (hour >= s.from || hour < s.to)) return s.spot;
  }
  return schedule[0].spot;
}

const day = (spot, tavern, home, open = 8, close = 19, last = 23) => [
  { from: open, to: close, spot },
  { from: close, to: last, spot: tavern },
  { from: last, to: open, spot: home }
];

export const SCHEDULES = {
  doyle: [{ from: 6, to: 24, spot: 'doyle_bar' }, { from: 0, to: 6, spot: 'doyle_home' }],
  beall: [{ from: 8, to: 20, spot: 'beall_post' }, { from: 20, to: 24, spot: 'beall_tavern' }, { from: 0, to: 8, spot: 'beall_home' }],
  cresap: day('cresap_work', 'cresap_tavern', 'cresap_home', 9, 17, 21),
  ward: [{ from: 7, to: 22, spot: 'ward_work' }, { from: 22, to: 7, spot: 'ward_home' }],
  feig: day('feig_work', 'feig_tavern', 'feig_home', 6, 18, 22),
  gantt: [{ from: 8, to: 18, spot: 'gantt_work' }, { from: 18, to: 8, spot: 'gantt_home' }],
  rood: [{ from: 8, to: 16, spot: 'rood_work' }, { from: 16, to: 23, spot: 'rood_court' }, { from: 23, to: 8, spot: 'rood_home' }],
  mcteague: day('mcteague_work', 'mcteague_tavern', 'mcteague_home', 6, 17, 22),
  coombs: [{ from: 20, to: 5, spot: 'coombs_work' }, { from: 5, to: 20, spot: 'coombs_home' }],
  fenwick: [{ from: 10, to: 15, spot: 'fenwick_court' }, { from: 15, to: 24, spot: 'fenwick_work' }, { from: 0, to: 10, spot: 'fenwick_home' }],
  shanks: [{ from: 6, to: 20, spot: 'shanks_work' }, { from: 20, to: 23, spot: 'shanks_tavern' }, { from: 23, to: 6, spot: 'shanks_home' }],
  bright: day('bright_work', 'bright_tavern', 'bright_home', 7, 19, 22)
};

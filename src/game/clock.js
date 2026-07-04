// The world clock. Hours are 0 to 23; the slice starts at dusk.
export function newClock() { return { day: 1, hour: 18 }; }

export function advance(clock, hours) {
  const total = clock.hour + hours;
  return { day: clock.day + Math.floor(total / 24), hour: total % 24 };
}

export function periodFor(hour) {
  if (hour >= 6 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
}

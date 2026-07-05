// The haunting: the supernatural made ambient and always present, felt moment
// to moment rather than gated behind a story unlock. Spectral wisps drift, cold
// spots shimmer, and at night a Watcher may cross the far treeline. Intensity
// scales with the player's SIGHT rank, with the hour, and with proximity to
// charged places (the churchyard, the mountain, the deep cut), but it is never
// wholly absent: even the unawakened catch things at the edge of vision.

export function createHaunting() {
  let wisps = [];
  let coldspots = [];
  let watcher = null;
  let seeded = false;
  let dread = 0;          // 0..1 ambient unease, drives audio and vignette pulse

  function seed(w, h) {
    wisps = [];
    for (let i = 0; i < 10; i++) wisps.push(spawnWisp(w, h));
    coldspots = [];
    for (let i = 0; i < 4; i++)
      coldspots.push({ x: Math.random() * w, y: 60 + Math.random() * (h - 60),
                       r: 24 + Math.random() * 30, ph: Math.random() * 6.28 });
    seeded = true;
  }

  function spawnWisp(w, h) {
    return {
      x: Math.random() * w, y: 60 + Math.random() * (h - 60),
      vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
      ph: Math.random() * 6.28, drift: 0.3 + Math.random() * 0.7,
      hue: Math.random() < 0.5 ? '150,210,190' : '170,180,220'
    };
  }

  // ctx-free update. sight 0..4, hour 0..23, charged 0..1 (place intensity)
  function update(dt, w, h, sight, hour, charged) {
    if (!seeded) seed(w, h);
    const s = dt / 16.67;
    const night = hour >= 20 || hour < 5;
    // target dread from the inputs, eased
    const target = Math.min(1, 0.12 + sight * 0.16 + (night ? 0.25 : 0) + charged * 0.4);
    dread += (target - dread) * 0.02 * s;

    for (const wsp of wisps) {
      wsp.x += wsp.vx * wsp.drift * s * 0.1;
      wsp.y += wsp.vy * wsp.drift * s * 0.1;
      wsp.ph += 0.04 * s;
      if (wsp.x < -20) wsp.x = w + 20; if (wsp.x > w + 20) wsp.x = -20;
      if (wsp.y < 40) wsp.y = h; if (wsp.y > h + 20) wsp.y = 40;
      // occasional direction change, so they wander unnaturally
      if (Math.random() < 0.004 * s) { wsp.vx = (Math.random() - 0.5) * 10; wsp.vy = (Math.random() - 0.5) * 10; }
    }
    for (const c of coldspots) c.ph += 0.02 * s;

    // the Watcher: at night, with dread high, a figure may cross the far edge
    if (night && dread > 0.5 && !watcher && Math.random() < 0.0008 * s) {
      watcher = { x: -30, y: 60 + Math.random() * 40, speed: 0.3 + Math.random() * 0.3, dir: 1 };
    }
    if (watcher) {
      watcher.x += watcher.speed * watcher.dir * s;
      if (watcher.x > w + 40 || watcher.x < -40) watcher = null;
    }
  }

  // The wisps and cold spots are drawn faintly for everyone; brighter with SIGHT.
  function draw(ctx, w, h, sight) {
    const vis = 0.15 + sight * 0.2;   // even sight 0 sees a hint
    // cold spots: a shimmer of wrong-colored air
    for (const c of coldspots) {
      const a = (0.04 + 0.03 * Math.sin(c.ph)) * (0.4 + vis);
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      g.addColorStop(0, 'rgba(150,180,200,' + a.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(150,180,200,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 6.283); ctx.fill();
    }
    // drifting wisps: soft glowing motes that wander against the wind
    for (const wsp of wisps) {
      const tw = 0.5 + 0.5 * Math.sin(wsp.ph);
      const a = vis * (0.4 + tw * 0.6);
      const r = 2 + tw * 2;
      const g = ctx.createRadialGradient(wsp.x, wsp.y, 0, wsp.x, wsp.y, r * 3);
      g.addColorStop(0, 'rgba(' + wsp.hue + ',' + a.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + wsp.hue + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wsp.x, wsp.y, r * 3, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(' + wsp.hue + ',' + Math.min(1, a * 1.5).toFixed(3) + ')';
      ctx.fillRect(Math.round(wsp.x), Math.round(wsp.y), 1, 1);
    }
    // the Watcher: a tall dark silhouette, only ever a suggestion
    if (watcher) {
      const a = 0.25 + sight * 0.12;
      ctx.fillStyle = 'rgba(10,8,16,' + a.toFixed(3) + ')';
      ctx.fillRect(Math.round(watcher.x), Math.round(watcher.y), 5, 14);
      ctx.fillRect(Math.round(watcher.x + 1), Math.round(watcher.y - 3), 3, 3);
      // two faint eyes if the SIGHT is open
      if (sight >= 1) {
        ctx.fillStyle = 'rgba(200,230,210,' + (a + 0.2).toFixed(3) + ')';
        ctx.fillRect(Math.round(watcher.x + 1), Math.round(watcher.y - 2), 1, 1);
        ctx.fillRect(Math.round(watcher.x + 3), Math.round(watcher.y - 2), 1, 1);
      }
    }
  }

  function getDread() { return dread; }
  function watcherPresent() { return Boolean(watcher); }

  return { seed, update, draw, getDread, watcherPresent };
}

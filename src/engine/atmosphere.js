// Environmental motion: drifting river fog, chimney smoke, water shimmer.
// Pure and deterministic-ish; costs a few dozen particles, transforms the mood.

export function createAtmosphere() {
  let fog = [], smoke = [], motes = [];
  let seeded = false;
  let flash = 0, flashHue = '210,180,110';

  function seed(w, h) {
    fog = [];
    for (let i = 0; i < 14; i++) {
      fog.push({
        x: Math.random() * w, y: HUD_pad + Math.random() * (h - HUD_pad),
        r: 40 + Math.random() * 70, spd: 4 + Math.random() * 8,
        a: 0.03 + Math.random() * 0.05
      });
    }
    motes = [];
    for (let i = 0; i < 22; i++) {
      motes.push({
        x: Math.random() * w, y: HUD_pad + Math.random() * (h - HUD_pad),
        vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
        r: Math.random() < 0.5 ? 1 : 2, ph: Math.random() * 6.28
      });
    }
    seeded = true;
  }

  const HUD_pad = 48;

  // chimney sources are supplied each frame by the caller (lit buildings)
  function discover(hue) { flash = 1; flashHue = hue || '210,180,110'; }

  function emitSmoke(sx, sy) {
    if (smoke.length > 90) return;
    if (Math.random() < 0.10)
      smoke.push({ x: sx, y: sy, vy: -6 - Math.random() * 6, vx: (Math.random() - 0.5) * 4,
                   r: 2, life: 0, max: 90 + Math.random() * 60, a: 0.18 });
  }

  // period: 'dawn'|'day'|'dusk'|'night', intensity 0..1 for fog (weather/night)
  function update(dt, w, h) {
    if (!seeded) seed(w, h);
    const s = dt / 16.67;
    for (const f of fog) {
      f.x += f.spd * s * 0.1;
      if (f.x - f.r > w) { f.x = -f.r; f.y = HUD_pad + Math.random() * (h - HUD_pad); }
    }
    for (const m of motes) {
      m.x += m.vx * s * 0.1; m.y += m.vy * s * 0.1; m.ph += 0.03 * s;
      if (m.x < 0) m.x = w; if (m.x > w) m.x = 0;
      if (m.y < HUD_pad) m.y = h; if (m.y > h) m.y = HUD_pad;
    }
    if (flash > 0) flash = Math.max(0, flash - 0.02 * s);
    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i];
      p.x += p.vx * s * 0.1; p.y += p.vy * s * 0.1; p.life += s;
      p.r += 0.03 * s; p.a *= 0.992;
      if (p.life > p.max || p.a < 0.01) smoke.splice(i, 1);
    }
  }

  // draw fog + motes as a soft overlay; period tints them
  function drawAmbient(ctx, w, h, period, fogBoost) {
    const nightish = period === 'night' || period === 'dusk';
    const fogA = (nightish ? 1.4 : 0.7) * (1 + (fogBoost || 0));
    ctx.save();
    for (const f of fog) {
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      const tint = nightish ? '120,130,150' : '200,205,210';
      g.addColorStop(0, `rgba(${tint},${(f.a * fogA).toFixed(3)})`);
      g.addColorStop(1, `rgba(${tint},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
    }
    // drifting motes: dust by day, faint spirits by night
    for (const m of motes) {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(m.ph));
      ctx.fillStyle = nightish
        ? `rgba(150,200,180,${(0.18 * tw).toFixed(3)})`
        : `rgba(230,225,200,${(0.14 * tw).toFixed(3)})`;
      ctx.fillRect(Math.round(m.x), Math.round(m.y), m.r, m.r);
    }
    ctx.restore();
  }

  function drawSmoke(ctx) {
    ctx.save();
    for (const p of smoke) {
      ctx.fillStyle = `rgba(70,66,64,${p.a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }

  // a soft vignette to frame the scene like aged glass
  function drawFlash(ctx, w, h) {
    if (flash <= 0) return;
    ctx.fillStyle = `rgba(${flashHue},${(flash * 0.22).toFixed(3)})`;
    ctx.fillRect(0, 0, w, h);
  }

  function drawVignette(ctx, w, h) {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(8,6,10,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  return { seed, update, emitSmoke, discover, drawAmbient, drawSmoke, drawFlash, drawVignette };
}

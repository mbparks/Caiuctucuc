// Procedural ambience: brown-noise wind through a lowpass, and a faint
// tavern hum indoors. No assets, starts on first user gesture, honors mute.
export function createAmbience() {
  let ctx = null, gain = null, filter = null, started = false, muted = false;

  function boot() {
    if (started) return;
    started = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const seconds = 4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;   // brown noise
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer; src.loop = true;
    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 320;
    gain = ctx.createGain();
    gain.gain.value = muted ? 0 : 0.05;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
  }

  // the mill wheel: a slow wooden thump, until the night it stops
  let millTimer = null, millGain = null;
  let dreadGain = null, dreadOsc = null, dreadOsc2 = null;
  function ensureDread() {
    if (!ctx || dreadGain) return;
    dreadGain = ctx.createGain(); dreadGain.gain.value = 0; dreadGain.connect(ctx.destination);
    dreadOsc = ctx.createOscillator(); dreadOsc.type = 'sine'; dreadOsc.frequency.value = 55;
    dreadOsc2 = ctx.createOscillator(); dreadOsc2.type = 'sine'; dreadOsc2.frequency.value = 55.7;  // slow beating
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180;
    dreadOsc.connect(f); dreadOsc2.connect(f); f.connect(dreadGain);
    dreadOsc.start(); dreadOsc2.start();
  }
  function setDread(level) {
    if (muted) { if (dreadGain) dreadGain.gain.value = 0; return; }
    ensureDread();
    if (dreadGain) dreadGain.gain.value = Math.max(0, Math.min(0.06, level * 0.06));
  }

  function chime(kind) {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    const notes = kind === 'sight' ? [523.25, 783.99, 1046.5] : [659.25, 987.77];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      o.connect(g); g.connect(ctx.destination);
      const t = now + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.start(t); o.stop(t + 0.55);
    });
  }

  function millThump() {
    if (!ctx || muted || !millGain) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + 0.22);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    osc.connect(g).connect(millGain);
    osc.start(); osc.stop(ctx.currentTime + 0.32);
  }

  return {
    boot() {
      boot();
      if (ctx && !millGain) {
        millGain = ctx.createGain();
        millGain.gain.value = 0;
        millGain.connect(ctx.destination);
        millTimer = setInterval(millThump, 1400);
      }
    },
    setMuted(m) { muted = m; if (gain) gain.gain.value = m ? 0 : 0.05; },
    chime(kind) { chime(kind); },
    setDread(level) { setDread(level); },
    // scenes: outdoor periods, indoors, and the caves each have a voice
    setScene(period, place = 'town') {
      if (!filter) return;
      if (place === 'caves') {
        filter.frequency.value = 140;
        if (gain && !muted) gain.gain.value = 0.09;
      } else if (place === 'indoor') {
        filter.frequency.value = 200;
        if (gain && !muted) gain.gain.value = 0.03;
      } else {
        filter.frequency.value = period === 'night' ? 240 : 380;
        if (gain && !muted) gain.gain.value = period === 'night' ? 0.07 : 0.05;
      }
    },
    // 0 = silent (far or stopped), up to 1 = at the millpond
    setMill(nearness) {
      if (millGain) millGain.gain.value = muted ? 0 : nearness * 0.6;
    }
  };
}

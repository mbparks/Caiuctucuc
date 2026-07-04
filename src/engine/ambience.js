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

  return {
    boot,
    setMuted(m) { muted = m; if (gain) gain.gain.value = m ? 0 : 0.05; },
    // night wind blows harder; the tavern muffles it
    setScene(period) {
      if (!filter) return;
      filter.frequency.value = period === 'night' ? 240 : 380;
      if (gain && !muted) gain.gain.value = period === 'night' ? 0.07 : 0.05;
    }
  };
}

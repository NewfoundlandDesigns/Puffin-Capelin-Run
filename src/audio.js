/* ================= SOUND ================= */
const Snd = (() => {
  let ac = null, master = null, noiseBuf = null, ambFilter = null;
  let muted = store.get('capelin-run-muted') === '1';
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = muted ? 0 : 0.75; master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // ambient surf
      const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      ambFilter = ac.createBiquadFilter(); ambFilter.type = 'lowpass'; ambFilter.frequency.value = 520;
      const ag = ac.createGain(); ag.gain.value = 0.05;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.13;
      const lg = ac.createGain(); lg.gain.value = 0.035;
      lfo.connect(lg).connect(ag.gain);
      src.connect(ambFilter).connect(ag).connect(master);
      src.start(); lfo.start();
    } catch (e) { ac = null; }
  }
  function tone(freq, dur, o = {}) {
    if (!ac || muted) return;
    const t = ac.currentTime + (o.delay || 0);
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(master); osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise(dur, o = {}) {
    if (!ac || muted) return;
    const t = ac.currentTime + (o.delay || 0);
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = o.filter || 'bandpass'; f.Q.value = o.q || 0.9;
    f.frequency.setValueAtTime(o.freq || 1000, t);
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }
  const semi = (base, s) => base * Math.pow(2, s / 12);
  return {
    init,
    get muted() { return muted; },
    toggle() {
      muted = !muted; store.set('capelin-run-muted', muted ? '1' : '0');
      if (master) master.gain.setTargetAtTime(muted ? 0 : 0.75, ac.currentTime, 0.05);
      return muted;
    },
    setUnder(u) { if (ambFilter) ambFilter.frequency.setTargetAtTime(u ? 220 : 520, ac.currentTime, 0.08); },
    splash(v) { noise(0.35, { vol: 0.22 * v, freq: 1400, sweepTo: 350, q: 0.7 }); },
    catchFish(n) { tone(560 + n * 42, 0.11, { type: 'triangle', vol: 0.18, slideTo: 900 + n * 55 }); },
    golden() { [0, 4, 7, 12, 16].forEach((s, i) => tone(semi(1046.5, s), 0.22, { type: 'triangle', vol: 0.13, delay: i * 0.05 })); },
    full() { tone(330, 0.1, { type: 'square', vol: 0.06 }); tone(262, 0.14, { type: 'square', vol: 0.06, delay: 0.1 }); },
    deliver(n, mult) {
      const steps = [0, 4, 7, 12, 16, 19, 24];
      const k = Math.min(steps.length, 2 + Math.ceil(n / 2.5));
      for (let i = 0; i < k; i++) tone(semi(523.25, steps[i]), 0.4, { type: 'sine', vol: 0.18, delay: i * 0.065 });
      if (mult > 1) for (let i = 0; i < 6; i++) tone(semi(2093, [0, 7, 12, 7, 12, 19][i]), 0.12, { type: 'triangle', vol: 0.06, delay: 0.25 + i * 0.05 });
    },
    gullCry(vol = 0.05) { tone(1250, 0.18, { type: 'sawtooth', vol, slideTo: 800 }); tone(1150, 0.22, { type: 'sawtooth', vol: vol * 0.8, slideTo: 700, delay: 0.2 }); },
    gullHit() { noise(0.12, { vol: 0.25, freq: 500, filter: 'lowpass' }); tone(1300, 0.25, { type: 'sawtooth', vol: 0.09, slideTo: 600 }); },
    sealBark(vol = 0.12) { tone(210, 0.16, { type: 'sawtooth', vol, slideTo: 140 }); tone(230, 0.18, { type: 'sawtooth', vol, slideTo: 150, delay: 0.22 }); },
    sealHit() { noise(0.18, { vol: 0.3, freq: 250, filter: 'lowpass' }); tone(160, 0.3, { type: 'triangle', vol: 0.2, slideTo: 90 }); },
    chomp() { noise(0.06, { vol: 0.12, freq: 600 }); },
    drop() { [0, -3, -7].forEach((s, i) => tone(semi(440, s), 0.14, { type: 'triangle', vol: 0.12, delay: i * 0.08 })); },
    air() { tone(420, 0.5, { type: 'triangle', vol: 0.16, slideTo: 140 }); },
    flutter() { noise(0.05, { vol: 0.035, freq: 2600, q: 1.2 }); },
    thud() { noise(0.16, { vol: 0.35, freq: 280, filter: 'lowpass' }); tone(130, 0.16, { type: 'sine', vol: 0.25, slideTo: 55 }); },
    boing() { tone(240, 0.28, { type: 'sine', vol: 0.1, slideTo: 480 }); },
    step() { noise(0.035, { vol: 0.06, freq: 900, q: 2 }); },
    growl() { tone(92, 0.32, { type: 'sawtooth', vol: 0.06, slideTo: 78 }); tone(120, 0.26, { type: 'sawtooth', vol: 0.05, slideTo: 96, delay: 0.3 }); },
    whoosh() { noise(0.35, { vol: 0.12, freq: 450, sweepTo: 2600, q: 0.8 }); },
    hunterCry() {
      tone(1050, 0.26, { type: 'sawtooth', vol: 0.1, slideTo: 520 });
      tone(960, 0.3, { type: 'sawtooth', vol: 0.09, slideTo: 480, delay: 0.3 });
    },
    swoop() { noise(0.7, { vol: 0.1, freq: 3200, sweepTo: 700, q: 1 }); tone(1400, 0.6, { type: 'sine', vol: 0.035, slideTo: 500 }); },
    chirp() { tone(1900, 0.07, { type: 'sine', vol: 0.07, slideTo: 2500 }); tone(2000, 0.08, { type: 'sine', vol: 0.06, slideTo: 2700, delay: 0.1 }); },
    hungry() { [0, -2, -5].forEach((s, i) => tone(semi(1800, s), 0.14, { type: 'sine', vol: 0.07, slideTo: semi(1500, s), delay: i * 0.16 })); },
    fanfare() {
      [0, 4, 7, 12].forEach((s, i) => tone(semi(523.25, s), 0.22, { type: 'triangle', vol: 0.14, delay: i * 0.08 }));
      [0, 4, 7, 12].forEach(s => tone(semi(523.25, s), 0.9, { type: 'sine', vol: 0.07, delay: 0.34 }));
      noise(0.25, { vol: 0.12, freq: 3000, q: 0.6, delay: 0.02 });
    },
    bubbles() { for (let i = 0; i < 9; i++) tone(rand(180, 420), 0.08, { type: 'sine', vol: 0.06, slideTo: rand(420, 700), delay: i * 0.13 + rand(0, 0.05) }); },
    whaleLunge() { noise(0.7, { vol: 0.2, freq: 220, sweepTo: 900, filter: 'lowpass' }); tone(70, 0.8, { type: 'sine', vol: 0.18, slideTo: 110 }); },
    gulpFish(i, gold) {                  // the puffling swallowing one fish; climbs with each one
      tone(semi(330, Math.min(i, 14)), 0.08, { type: 'sine', vol: 0.12, slideTo: semi(520, Math.min(i, 14)) });
      if (gold) tone(semi(1568, Math.min(i, 14)), 0.12, { type: 'triangle', vol: 0.06, delay: 0.03 });
    },
    gulp() { tone(220, 0.25, { type: 'sine', vol: 0.18, slideTo: 90 }); },
    gannetCall() { tone(520, 0.12, { type: 'sawtooth', vol: 0.05, slideTo: 380 }); tone(480, 0.14, { type: 'sawtooth', vol: 0.05, slideTo: 340, delay: 0.14 }); },
    gannetDive() { tone(2200, 0.42, { type: 'sine', vol: 0.06, slideTo: 700 }); noise(0.4, { vol: 0.06, freq: 2500, sweepTo: 900, q: 1 }); },
    gannetHit() { noise(0.14, { vol: 0.28, freq: 600, filter: 'lowpass' }); tone(300, 0.2, { type: 'triangle', vol: 0.12, slideTo: 150 }); },
    jaegerCall() { tone(1500, 0.16, { type: 'square', vol: 0.05, slideTo: 1100 }); tone(1600, 0.2, { type: 'square', vol: 0.05, slideTo: 1000, delay: 0.18 }); },
    jaegerSteal() { noise(0.1, { vol: 0.2, freq: 900 }); [0, -4, -7].forEach((s, i) => tone(semi(880, s), 0.1, { type: 'square', vol: 0.05, delay: i * 0.07 })); },
    bergBump() { noise(0.1, { vol: 0.22, freq: 400, filter: 'lowpass' }); tone(2400, 0.25, { type: 'triangle', vol: 0.07, slideTo: 2000 }); tone(3100, 0.2, { type: 'sine', vol: 0.05, delay: 0.03 }); },
    tick() { tone(1500, 0.04, { type: 'square', vol: 0.04 }); },
    phase() { [0, 7, 12].forEach((s, i) => tone(semi(392, s), 0.6, { type: 'sine', vol: 0.09, delay: i * 0.14 })); },
    start() { [0, 4, 7].forEach((s, i) => tone(semi(523.25, s), 0.16, { type: 'triangle', vol: 0.12, delay: i * 0.07 })); },
    end() { [12, 7, 4, 7, 12].forEach((s, i) => tone(semi(392, s), 0.5, { type: 'sine', vol: 0.12, delay: i * 0.16 })); }
  };
})();

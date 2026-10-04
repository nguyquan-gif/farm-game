const getAudioContext = (() => {
  let ctx = null;
  return () => {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  };
})();

/* ─── Cozy Country Farm BGM Sequencer ─── */
let bgmTimer = null;
let currentBgmStep = 0;

// Cozy Kalimba / Music Box Melody in C Major
const BGM_PATTERN = [
  // Bar 1: C
  { note: 261.63, bass: 130.81, dur: 0.35 },
  { note: 329.63, bass: null, dur: 0.35 },
  { note: 392.0, bass: null, dur: 0.35 },
  { note: 523.25, bass: null, dur: 0.35 },
  // Bar 2: G
  { note: 392.0, bass: 98.0, dur: 0.35 },
  { note: 493.88, bass: null, dur: 0.35 },
  { note: 587.33, bass: null, dur: 0.35 },
  { note: 493.88, bass: null, dur: 0.35 },
  // Bar 3: Am
  { note: 440.0, bass: 110.0, dur: 0.35 },
  { note: 329.63, bass: null, dur: 0.35 },
  { note: 523.25, bass: null, dur: 0.35 },
  { note: 440.0, bass: null, dur: 0.35 },
  // Bar 4: F
  { note: 349.23, bass: 87.31, dur: 0.35 },
  { note: 440.0, bass: null, dur: 0.35 },
  { note: 523.25, bass: null, dur: 0.35 },
  { note: 659.25, bass: null, dur: 0.35 },
  // Bar 5: Em
  { note: 329.63, bass: 82.41, dur: 0.35 },
  { note: 392.0, bass: null, dur: 0.35 },
  { note: 493.88, bass: null, dur: 0.35 },
  { note: 392.0, bass: null, dur: 0.35 },
  // Bar 6: Dm
  { note: 293.66, bass: 73.42, dur: 0.35 },
  { note: 349.23, bass: null, dur: 0.35 },
  { note: 440.0, bass: null, dur: 0.35 },
  { note: 349.23, bass: null, dur: 0.35 },
  // Bar 7: G7
  { note: 392.0, bass: 98.0, dur: 0.35 },
  { note: 493.88, bass: null, dur: 0.35 },
  { note: 349.23, bass: null, dur: 0.35 },
  { note: 293.66, bass: null, dur: 0.35 },
  // Bar 8: C Resolution
  { note: 261.63, bass: 130.81, dur: 0.5 },
  { note: 329.63, bass: null, dur: 0.3 },
  { note: 392.0, bass: null, dur: 0.3 },
  { note: 523.25, bass: null, dur: 0.6 },
];

const playBgmStep = () => {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") return;
  const step = BGM_PATTERN[currentBgmStep];
  const t = ctx.currentTime;

  // 1. Kalimba-like Melody Note
  if (step.note) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(step.note, t);

    // Soft warm envelope
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.045, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + step.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + step.dur);
  }

  // 2. Warm Bass Note (on downbeats)
  if (step.bass) {
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(step.bass, t);

    bassGain.gain.setValueAtTime(0.001, t);
    bassGain.gain.linearRampToValueAtTime(0.035, t + 0.03);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(t);
    bassOsc.stop(t + 0.6);
  }

  currentBgmStep = (currentBgmStep + 1) % BGM_PATTERN.length;
};

export const startBgm = () => {
  if (bgmTimer) return;
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") ctx.resume();
  playBgmStep();
  bgmTimer = setInterval(playBgmStep, 360); // ~104 BPM relaxing tempo
};

export const stopBgm = () => {
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
};

export const playSound = (type, enabled = true) => {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === "click") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(550, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.08);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t);
    osc.stop(t + 0.08);
  } else if (type === "coin") {
    osc.type = "square";
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.setValueAtTime(1318.51, t + 0.08);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
  } else if (type === "harvest") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.linearRampToValueAtTime(700, t + 0.15);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.15);
  } else if (type === "levelup") {
    osc.type = "triangle";
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
    });
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.4);
    osc.start(t);
    osc.stop(t + 0.4);
  } else if (type === "sleep") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
  } else if (type === "error") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.18);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.18);
    osc.start(t);
    osc.stop(t + 0.18);
  }
};

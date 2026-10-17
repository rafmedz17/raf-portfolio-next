// Procedural sound design: every sound is synthesized with the Web Audio
// API, so there are no audio files to download.
//
// Sound is on by default. It plays once the browser has unlocked audio
// (browsers require a click or key press first). Visitors can mute with
// the speaker button in the nav; that lasts for the current visit only.

const PREF = "sound";
let ctx = null;
let master = null;
let reverb = null;
let noise = null;
let lastKey = 0;

// ── Preference ────────────────────────────────────────────────

// Muting is remembered for this visit (tab) only; every new visit has sound.
export function isSoundOn() {
  try {
    return sessionStorage.getItem(PREF) !== "off";
  } catch {
    return true;
  }
}

export function setSound(on) {
  try {
    sessionStorage.setItem(PREF, on ? "on" : "off");
  } catch {}
  if (on) unlockAudio();
  window.dispatchEvent(new CustomEvent("soundchange", { detail: on }));
}

export function subscribeSound(callback) {
  window.addEventListener("soundchange", callback);
  return () => window.removeEventListener("soundchange", callback);
}

// ── Audio graph ───────────────────────────────────────────────

function impulse(c, seconds, decay) {
  const length = c.sampleRate * seconds;
  const buffer = c.createBuffer(2, length, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return buffer;
}

// Call from a click/keydown handler: browsers only allow audio after one.
export function unlockAudio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();

    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(compressor);

    reverb = ctx.createConvolver();
    reverb.buffer = impulse(ctx, 2.4, 3);
    const reverbOut = ctx.createGain();
    reverbOut.gain.value = 0.4;
    reverb.connect(reverbOut);
    reverbOut.connect(master);

    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export const audioReady = () => ctx?.state === "running";

// Returns the context only when sound is on and allowed to play.
function ready() {
  return isSoundOn() && ctx?.state === "running" ? ctx : null;
}

function output(node, wet = 0, pan = 0) {
  let last = node;
  if (pan && ctx.createStereoPanner) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    node.connect(panner);
    last = panner;
  }
  last.connect(master);
  if (wet) {
    const send = ctx.createGain();
    send.gain.value = wet;
    last.connect(send);
    send.connect(reverb);
  }
}

function envelope(param, at, { attack = 0.004, peak = 0.3, decay = 0.1 }) {
  param.setValueAtTime(0.0001, at);
  param.exponentialRampToValueAtTime(Math.max(peak, 0.0002), at + attack);
  param.exponentialRampToValueAtTime(0.0001, at + attack + decay);
}

// One oscillator note with an optional pitch slide and filter.
function tone({ type = "sine", freq, to, at, dur, gain = 0.1, attack = 0.004, lowpass, wet = 0, pan = 0 }) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + dur);
  const amp = ctx.createGain();
  envelope(amp.gain, at, { attack, peak: gain, decay: dur });
  let node = osc;
  if (lowpass) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lowpass;
    osc.connect(filter);
    node = filter;
  }
  node.connect(amp);
  output(amp, wet, pan);
  osc.start(at);
  osc.stop(at + attack + dur + 0.05);
}

// A filtered burst of noise.
function noiseHit({ at, dur, gain = 0.2, type = "bandpass", freq = 2000, to, q = 1, attack = 0.002, wet = 0, pan = 0, rate = 1 }) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  src.playbackRate.value = rate;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freq, at);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, at + dur);
  const amp = ctx.createGain();
  envelope(amp.gain, at, { attack, peak: gain, decay: dur });
  src.connect(filter);
  filter.connect(amp);
  output(amp, wet, pan);
  src.start(at, Math.random() * 0.8);
  src.stop(at + attack + dur + 0.05);
}

// ── Typing ────────────────────────────────────────────────────

// Mechanical-keyboard click: a bright "tick" plus a soft "thock".
// `volume` scales it (e.g. 0.3 for quiet background typing).
export function key(kind = "key", volume = 1) {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  if (at - lastKey < 0.018) return; // don't stack on key repeat
  lastKey = at;

  const vary = 1 + (Math.random() - 0.5) * 0.18;
  const pan = (Math.random() - 0.5) * 0.3;
  const heavy = kind === "enter" || kind === "space";

  if (kind === "soft") {
    noiseHit({ at, dur: 0.025, gain: 0.08 * volume, freq: 4200 * vary, q: 2, pan });
    return;
  }
  noiseHit({ at, dur: heavy ? 0.05 : 0.03, gain: (heavy ? 0.32 : 0.24) * volume, freq: (heavy ? 1700 : kind === "back" ? 3800 : 3000) * vary, q: 1.4, pan, rate: vary });
  tone({ type: "triangle", freq: (kind === "enter" ? 130 : heavy ? 150 : kind === "back" ? 260 : 210) * vary, to: 60, at, dur: heavy ? 0.09 : 0.06, gain: (heavy ? 0.3 : 0.16) * volume, attack: 0.002, pan });
}

// Plays the right key sound for a keyboard event.
export function keySound(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "Enter") key("enter");
  else if (e.key === "Backspace" || e.key === "Delete") key("back");
  else if (e.key === " ") key("space");
  else if (e.key.length === 1) key();
  else if (e.key.startsWith("Arrow") || e.key === "Tab") key("soft");
}

// ── UI feedback ───────────────────────────────────────────────

export function tick() {
  const c = ready();
  if (!c) return;
  tone({ type: "square", freq: 1400 + Math.random() * 500, at: c.currentTime, dur: 0.025, gain: 0.05, lowpass: 4000 });
}

export function blip(freq = 880) {
  const c = ready();
  if (!c) return;
  tone({ type: "square", freq, to: freq * 1.5, at: c.currentTime, dur: 0.06, gain: 0.06, lowpass: 3000 });
}

export function error() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  tone({ type: "square", freq: 196, at, dur: 0.08, gain: 0.07, lowpass: 1100 });
  tone({ type: "square", freq: 147, at: at + 0.1, dur: 0.14, gain: 0.07, lowpass: 1100 });
}

export function success() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
    tone({ type: "triangle", freq, at: at + i * 0.07, dur: 0.3, gain: 0.07, wet: 0.35 })
  );
}

export function achievement() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  [783.99, 1046.5, 1318.5, 1567.98, 2093].forEach((freq, i) =>
    tone({ type: i % 2 ? "sine" : "triangle", freq, at: at + i * 0.055, dur: 0.5, gain: 0.05, wet: 0.6, pan: (i - 2) * 0.2 })
  );
}

// Soft UI click for buttons.
export function click() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  noiseHit({ at, dur: 0.02, gain: 0.12, freq: 2600, q: 1.5 });
  tone({ type: "sine", freq: 900, to: 600, at, dur: 0.04, gain: 0.05 });
}

// Short downward whoosh for jumping to a section on the page.
export function navigate() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  noiseHit({ at, dur: 0.35, gain: 0.12, type: "lowpass", freq: 1800, to: 300, q: 0.8, wet: 0.2 });
  tone({ type: "sine", freq: 520, to: 260, at, dur: 0.2, gain: 0.04 });
}

// Rising "launch" sweep with a sparkle, for links that open elsewhere.
export function launch() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  tone({ type: "sine", freq: 300, to: 1600, at, dur: 0.35, gain: 0.08, wet: 0.3 });
  noiseHit({ at, dur: 0.35, gain: 0.1, freq: 600, to: 4000, q: 1.2, wet: 0.3 });
  tone({ type: "triangle", freq: 1760, at: at + 0.28, dur: 0.4, gain: 0.04, wet: 0.8, pan: -0.2 });
  tone({ type: "triangle", freq: 2349.3, at: at + 0.33, dur: 0.45, gain: 0.035, wet: 0.8, pan: 0.2 });
}

// Two-tone "ding" for email links.
export function mail() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  tone({ type: "sine", freq: 1046.5, at, dur: 0.35, gain: 0.07, wet: 0.5 });
  tone({ type: "sine", freq: 1568, at: at + 0.09, dur: 0.5, gain: 0.06, wet: 0.5 });
}

// Paper rustle + airy swoosh + soft chord: opening a document.
export function open() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  noiseHit({ at, dur: 0.14, gain: 0.08, type: "highpass", freq: 3200, q: 0.7, rate: 0.6 });
  noiseHit({ at: at + 0.03, dur: 0.32, gain: 0.13, freq: 400, to: 2400, q: 1.2, wet: 0.3 });
  [392, 587.33, 783.99].forEach((freq, i) =>
    tone({ type: "sine", freq, at: at + 0.08 + i * 0.035, dur: 0.6, gain: 0.035, wet: 0.6 })
  );
}

// Reverse swoosh: closing a document.
export function close() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  noiseHit({ at, dur: 0.22, gain: 0.1, freq: 2000, to: 400, q: 1.2, wet: 0.2 });
  tone({ type: "sine", freq: 587.33, to: 392, at, dur: 0.2, gain: 0.04 });
}

// Descending "data transfer" blips landing with a soft thud.
export function download() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  [1318.5, 987.77, 783.99].forEach((freq, i) =>
    tone({ type: "triangle", freq, at: at + i * 0.06, dur: 0.08, gain: 0.05, wet: 0.2 })
  );
  tone({ type: "sine", freq: 160, to: 70, at: at + 0.2, dur: 0.22, gain: 0.22 });
  tone({ type: "sine", freq: 1568, at: at + 0.24, dur: 0.4, gain: 0.03, wet: 0.7 });
}

export function gameOver() {
  const c = ready();
  if (!c) return;
  tone({ type: "sawtooth", freq: 440, to: 90, at: c.currentTime, dur: 0.55, gain: 0.08, lowpass: 1400 });
}

export function soundOnChime() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  tone({ type: "sine", freq: 659.25, at, dur: 0.18, gain: 0.08, wet: 0.3 });
  tone({ type: "sine", freq: 987.77, at: at + 0.08, dur: 0.3, gain: 0.08, wet: 0.3 });
}

// ── Cinematic intro ───────────────────────────────────────────

// Low drone that rises and opens up; returns { stop() }.
export function hum(seconds = 2) {
  const c = ready();
  if (!c) return { stop() {} };
  const at = c.currentTime;
  const amp = c.createGain();
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(0.14, at + 0.9);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 7;
  filter.frequency.setValueAtTime(90, at);
  filter.frequency.exponentialRampToValueAtTime(1600, at + seconds);
  const oscs = [
    ["sawtooth", 55],
    ["sawtooth", 55.45],
    ["sine", 27.5],
    ["sine", 440],
  ].map(([type, freq], i) => {
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    osc.frequency.exponentialRampToValueAtTime(freq * (i === 3 ? 4 : 2), at + seconds);
    if (i === 3) {
      const quiet = c.createGain();
      quiet.gain.value = 0.05;
      osc.connect(quiet);
      quiet.connect(filter);
    } else {
      osc.connect(filter);
    }
    osc.start(at);
    return osc;
  });
  filter.connect(amp);
  output(amp, 0.35);

  let stopped = false;
  return {
    stop(fade = 0.35) {
      if (stopped) return;
      stopped = true;
      const now = c.currentTime;
      amp.gain.cancelScheduledValues(now);
      amp.gain.setValueAtTime(Math.max(amp.gain.value, 0.0001), now);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + fade);
      oscs.forEach((osc) => osc.stop(now + fade + 0.05));
    },
  };
}

// Rapid "data" chatter while the name decrypts.
export function chatter(seconds = 1) {
  const c = ready();
  if (!c) return;
  const start = c.currentTime;
  for (let t = start; t < start + seconds; t += 0.028 + Math.random() * 0.04) {
    const fade = 1 - (t - start) / seconds;
    tone({ type: "square", freq: 900 + Math.random() * 2600, at: t, dur: 0.016, gain: 0.03 * fade + 0.005, lowpass: 5200, pan: (Math.random() - 0.5) * 0.8 });
  }
}

// Cinematic hit: sub drop + noise burst + shimmering tail.
export function impact() {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  tone({ type: "sine", freq: 120, to: 30, at, dur: 1.6, gain: 0.85, attack: 0.004, wet: 0.15 });
  noiseHit({ at, dur: 0.8, gain: 0.32, type: "lowpass", freq: 1800, to: 180, q: 0.7, wet: 0.7 });
  tone({ type: "triangle", freq: 880, at, dur: 2.2, gain: 0.04, wet: 1, pan: -0.3 });
  tone({ type: "sine", freq: 1318.5, at: at + 0.012, dur: 2.4, gain: 0.03, wet: 1, pan: 0.3 });
}

// Curtain whoosh sweeping left → right.
export function whoosh(seconds = 1) {
  const c = ready();
  if (!c) return;
  const at = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.6;
  filter.frequency.setValueAtTime(250, at);
  filter.frequency.exponentialRampToValueAtTime(2800, at + seconds * 0.45);
  filter.frequency.exponentialRampToValueAtTime(500, at + seconds);
  const amp = c.createGain();
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(0.32, at + seconds * 0.4);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
  src.connect(filter);
  filter.connect(amp);
  let last = amp;
  if (c.createStereoPanner) {
    const panner = c.createStereoPanner();
    panner.pan.setValueAtTime(-0.7, at);
    panner.pan.linearRampToValueAtTime(0.7, at + seconds);
    amp.connect(panner);
    last = panner;
  }
  last.connect(master);
  const send = c.createGain();
  send.gain.value = 0.4;
  last.connect(send);
  send.connect(reverb);
  src.start(at);
  src.stop(at + seconds + 0.05);
}

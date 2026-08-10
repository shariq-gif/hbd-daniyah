/* ----------------------------------------------------------------------------
 * Tiny Web-Audio synth for subtle UI sounds — no audio files needed.
 * Every sound is generated on the fly, so nothing to download and nothing to
 * miss. All sounds respect a global mute flag set by the AudioProvider.
 * -------------------------------------------------------------------------- */

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function setMuted(value: boolean) {
  muted = value;
}

type ToneOpts = {
  freq: number;
  duration?: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  glideTo?: number;
  delay?: number;
};

function tone({
  freq,
  duration = 0.18,
  type = "sine",
  gain = 0.08,
  attack = 0.005,
  glideTo,
  delay = 0,
}: ToneOpts) {
  const audio = getCtx();
  if (!audio || muted) return;
  const now = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, now + duration);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(g).connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export type SoundName =
  | "hover"
  | "click"
  | "pop"
  | "flip"
  | "envelope"
  | "gift"
  | "catch"
  | "sparkle"
  | "whoosh"
  | "chime"
  | "reveal"
  | "meow"
  | "purr";

export function playSound(name: SoundName) {
  switch (name) {
    case "hover":
      tone({ freq: 880, duration: 0.06, gain: 0.02, type: "sine" });
      break;
    case "click":
      tone({ freq: 520, duration: 0.09, gain: 0.05, type: "triangle" });
      break;
    case "pop":
      tone({ freq: 420, glideTo: 720, duration: 0.12, gain: 0.06, type: "sine" });
      break;
    case "flip":
      tone({ freq: 300, glideTo: 500, duration: 0.1, gain: 0.04, type: "square" });
      break;
    case "catch":
      tone({ freq: 700, glideTo: 1100, duration: 0.1, gain: 0.05, type: "sine" });
      tone({ freq: 1000, duration: 0.08, gain: 0.03, type: "sine", delay: 0.04 });
      break;
    case "envelope":
      tone({ freq: 240, glideTo: 380, duration: 0.22, gain: 0.05, type: "sine" });
      break;
    case "gift":
      tone({ freq: 330, duration: 0.1, gain: 0.06, type: "triangle" });
      tone({ freq: 494, duration: 0.12, gain: 0.05, type: "triangle", delay: 0.08 });
      tone({ freq: 660, duration: 0.16, gain: 0.05, type: "triangle", delay: 0.16 });
      break;
    case "sparkle":
      tone({ freq: 1200, duration: 0.08, gain: 0.03, type: "sine" });
      tone({ freq: 1600, duration: 0.07, gain: 0.02, type: "sine", delay: 0.05 });
      break;
    case "whoosh":
      tone({ freq: 600, glideTo: 200, duration: 0.3, gain: 0.03, type: "sine" });
      break;
    case "chime":
      [523, 659, 784, 1047].forEach((f, i) =>
        tone({ freq: f, duration: 0.5, gain: 0.045, type: "sine", delay: i * 0.09 })
      );
      break;
    case "reveal":
      [392, 523, 659, 784, 1047].forEach((f, i) =>
        tone({ freq: f, duration: 0.6, gain: 0.05, type: "triangle", delay: i * 0.12 })
      );
      break;
    case "meow":
      meow();
      break;
    case "purr":
      purr();
      break;
  }
}

/* A more cat-like "meow": a sawtooth source (rich harmonics) shaped by a
 * band-pass filter that sweeps like a vowel (mee→ow), with a pitch contour
 * that rises then falls and a little vibrato. Approximates a real meow far
 * better than a plain tone; the real thing can still be dropped in as an mp3. */
function meow() {
  const audio = getCtx();
  if (!audio || muted) return;
  const now = audio.currentTime;
  const dur = 0.5 + Math.random() * 0.2;
  const base = 380 + Math.random() * 90;

  const osc = audio.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(base, now);
  osc.frequency.linearRampToValueAtTime(base * 1.35, now + dur * 0.28);
  osc.frequency.exponentialRampToValueAtTime(base * 0.82, now + dur);

  // vibrato
  const lfo = audio.createOscillator();
  const lfoGain = audio.createGain();
  lfo.frequency.value = 26;
  lfoGain.gain.value = base * 0.03;
  lfo.connect(lfoGain).connect(osc.frequency);

  // formant-ish band-pass sweep = the "eee → ow" vowel movement
  const bp = audio.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 6;
  bp.frequency.setValueAtTime(1100, now);
  bp.frequency.linearRampToValueAtTime(1500, now + dur * 0.3);
  bp.frequency.exponentialRampToValueAtTime(650, now + dur);

  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.09, now + 0.05);
  g.gain.setValueAtTime(0.09, now + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(bp).connect(g).connect(audio.destination);
  osc.start(now);
  lfo.start(now);
  osc.stop(now + dur + 0.05);
  lfo.stop(now + dur + 0.05);
}

function purr() {
  const audio = getCtx();
  if (!audio || muted) return;
  const now = audio.currentTime;
  const dur = 0.7;
  const osc = audio.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = 30;
  // amplitude "rattle" ~25Hz
  const trem = audio.createOscillator();
  const tremGain = audio.createGain();
  trem.frequency.value = 25;
  tremGain.gain.value = 0.04;
  const g = audio.createGain();
  g.gain.setValueAtTime(0.05, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  trem.connect(tremGain).connect(g.gain);
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 200;
  osc.connect(lp).connect(g).connect(audio.destination);
  osc.start(now);
  trem.start(now);
  osc.stop(now + dur);
  trem.stop(now + dur);
}

/**
 * Web Audio API Sound Synthesizer for Coin Drops and Completion Chimes.
 * Generates pure crystalline metallic sound effects without requiring external audio assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn("Web Audio API not supported:", e);
    return null;
  }
}

/**
 * Plays a metallic coin clink ("tung-tang" acoustic chime)
 * Simulates high-density gold/metal coin collision
 */
export function playCoinClink(pitchMultiplier: number = 1.0) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Base fundamental frequencies for metallic coin resonance
  const f1 = 1850 * pitchMultiplier;
  const f2 = 2950 * pitchMultiplier;
  const f3 = 4200 * pitchMultiplier;

  [f1, f2, f3].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    // Slight micro-pitch drop on impact
    osc.frequency.exponentialRampToValueAtTime(freq * 0.96, now + 0.12);

    const initialVol = idx === 0 ? 0.35 : idx === 1 ? 0.22 : 0.12;
    gain.gain.setValueAtTime(initialVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  });
}

/**
 * Plays randomized multi-bounce coin clatter for the 10-second animation
 */
export function playCoinDropRhythm() {
  const pitches = [0.95, 1.05, 1.15, 0.88, 1.2];
  const randPitch = pitches[Math.floor(Math.random() * pitches.length)];
  playCoinClink(randPitch);

  // Occasional double micro-bounce
  if (Math.random() > 0.4) {
    setTimeout(() => {
      playCoinClink(randPitch * 1.12);
    }, 70 + Math.random() * 50);
  }
}

/**
 * Plays a vibrant victory / coin cash-in chime upon order completion
 */
export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major Arpeggio)
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    const noteStart = now + idx * 0.08;
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.linearRampToValueAtTime(0.28, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + 0.48);
  });
}

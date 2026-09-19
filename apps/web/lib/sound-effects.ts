/**
 * sound-effects.ts
 * Synthesizes instantaneous, zero-latency Web Audio API sound effects & ambient audio.
 * No external MP3 assets needed.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Pavlovian Dopamine Reward Chime
   * Ascending harmonic pentatonic chime (E6, G#6, B6, E7) with crystalline overtones
   * Designed for immediate positive reinforcement.
   */
  public playRewardChime(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [1318.51, 1661.22, 1975.53, 2637.02]; // E6, G#6, B6, E7
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.07);

      // Bell envelope
      gain.gain.setValueAtTime(0.001, now + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.5);
    });
  }

  /**
   * Milestone Fanfare
   * Triggered on tier unlocks (Bronze, Silver, Gold, Diamond, Platinum).
   * Rich brass/synth celebratory chord cadence with shimmer.
   */
  public playMilestoneFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [
      { notes: [523.25, 659.25, 783.99], delay: 0 },       // C5 major
      { notes: [587.33, 739.99, 880.00], delay: 0.15 },    // D5 major
      { notes: [659.25, 830.61, 987.77], delay: 0.32 },    // E5 major
      { notes: [1046.50, 1318.51, 1567.98], delay: 0.52 } // C6 high shimmer chord
    ];

    const now = ctx.currentTime;

    chords.forEach(({ notes, delay }) => {
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = delay === 0.52 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.12, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + (delay === 0.52 ? 0.9 : 0.35));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + (delay === 0.52 ? 1.0 : 0.4));
      });
    });
  }

  /**
   * Gentle, warm synthesized ambient drone (lo-fi meditation vibe)
   * Perfect for cozy focus during trivia.
   */
  // ── Jazzy Chill & Acid Instrumental Lo-Fi Beat Engine ──
  private isAmbientPlaying: boolean = false;
  private isMuted: boolean = true;
  private musicGain: GainNode | null = null;
  private schedulerTimer: any = null;
  private currentStep: number = 0;
  private nextStepTime: number = 0;
  private tempoBpm: number = 84; // Chill jazzy tempo

  /**
   * Generates a soft lo-fi kick drum with subtle pitch bend
   */
  private playKick(ctx: AudioContext, time: number, gainNode: GainNode): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(gain);
    gain.connect(gainNode);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  /**
   * Generates a crisp, warm rimshot / jazz snare
   */
  private playSnare(ctx: AudioContext, time: number, gainNode: GainNode): void {
    // Tone body
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.07);
    oscGain.gain.setValueAtTime(0.08, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(oscGain);
    oscGain.connect(gainNode);
    osc.start(time);
    osc.stop(time + 0.09);

    // Noise brush/rim
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, time);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.09, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(gainNode);
    noise.start(time);
  }

  /**
   * Swing Hi-Hat / Soft Brush
   */
  private playHat(ctx: AudioContext, time: number, gainNode: GainNode, accent: boolean = false): void {
    const bufferSize = ctx.sampleRate * 0.035;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, time);
    const gain = ctx.createGain();
    const vol = accent ? 0.045 : 0.022;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(gainNode);
    noise.start(time);
  }

  /**
   * Warm Rhodes EP 7th/9th Chord Strum (FM Tine Synthesis)
   */
  private playRhodesChord(ctx: AudioContext, freqs: number[], time: number, gainNode: GainNode, duration: number = 1.1): void {
    freqs.forEach((freq, i) => {
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const noteGain = ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, time);

      // FM Bell tine modulator (ratio 2:1)
      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(freq * 2, time);
      modGain.gain.setValueAtTime(freq * 1.2, time);
      modGain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
      modulator.connect(carrier.frequency);

      // Note envelope
      const vel = 0.035 / (1 + i * 0.15);
      noteGain.gain.setValueAtTime(0.001, time);
      noteGain.gain.exponentialRampToValueAtTime(vel, time + 0.025);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      carrier.connect(noteGain);
      noteGain.connect(gainNode);

      modulator.start(time);
      carrier.start(time);
      modulator.stop(time + duration + 0.05);
      carrier.stop(time + duration + 0.05);
    });
  }

  /**
   * Warm jazzy walking bass note
   */
  private playBass(ctx: AudioContext, freq: number, time: number, gainNode: GainNode, duration: number = 0.35): void {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.12, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(gainNode);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  /**
   * Playful Acid Lead Riff (Resonant 303-style filter sweep, subtle & jazzy)
   */
  private playAcidNote(ctx: AudioContext, freq: number, time: number, gainNode: GainNode, duration: number = 0.18, slideTo?: number): void {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, time + duration * 0.9);
    }

    // High resonance TB-303 style filter sweep
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(6.5, time);
    filter.frequency.setValueAtTime(1600, time);
    filter.frequency.exponentialRampToValueAtTime(380, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.045, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(gainNode);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  /**
   * Lookahead Beat Scheduler (Chris Wilson pattern)
   * Schedules rhythmic jazzy chord progressions, walking bass, lo-fi drum groove & acid melody
   */
  private scheduleStep(step: number, time: number, ctx: AudioContext, master: GainNode): void {
    const stepInBar = step % 16;
    const bar = Math.floor((step % 64) / 16);

    // 1. Lo-Fi Drums (Kick, Snare, Swung Hi-Hats)
    const isKick = stepInBar === 0 || stepInBar === 6 || (bar % 2 === 1 && stepInBar === 10);
    if (isKick) this.playKick(ctx, time, master);

    const isSnare = stepInBar === 4 || stepInBar === 12;
    if (isSnare) this.playSnare(ctx, time, master);

    // Swung 16th hats
    const isEven16th = stepInBar % 2 === 1;
    const swingOffset = isEven16th ? 0.025 : 0;
    this.playHat(ctx, time + swingOffset, master, stepInBar % 4 === 0);

    // 2. Jazzy Neo-Soul Rhodes Progressions: Dm9 -> G13 -> Cmaj9 -> A7(#9)
    const chords: Record<number, number[]> = {
      0: [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
      1: [98.00, 174.61, 246.94, 329.63, 440.00],  // G13
      2: [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
      3: [110.00, 196.00, 277.18, 349.23, 415.30]  // A7alt
    };

    // Strum chord on beat 1 (step 0) and syncopated upbeat (step 10)
    if (stepInBar === 1 || stepInBar === 10) {
      const chordNotes = chords[bar] || chords[0];
      this.playRhodesChord(ctx, chordNotes, time, master, stepInBar === 1 ? 1.4 : 0.8);
    }

    // 3. Walking Jazzy Bass Notes
    const bassLines: Record<number, number[]> = {
      0: [73.42, 82.41, 87.31, 92.50],   // D2, E2, F2, F#2
      1: [98.00, 110.00, 123.47, 127.00], // G2, A2, B2, C3
      2: [65.41, 82.41, 98.00, 110.00],   // C2, E2, G2, A2
      3: [110.00, 103.83, 98.00, 77.78]   // A2, Ab2, G2, Eb2
    };
    if (stepInBar % 4 === 0) {
      const quarterIndex = Math.floor(stepInBar / 4);
      const note = bassLines[bar]?.[quarterIndex] || 73.42;
      this.playBass(ctx, note, time, master, 0.38);
    }

    // 4. Acid Lofi Micro-Riffs (Subtle TB-303 flourishes on Bar 2 & 4)
    if (bar === 1 || bar === 3) {
      const acidNotes: Record<number, number> = {
        6: 440.00,  // A4
        8: 493.88,  // B4
        11: 587.33, // D5
        14: 523.25  // C5
      };
      if (acidNotes[stepInBar]) {
        const slide = stepInBar === 11 ? 523.25 : undefined;
        this.playAcidNote(ctx, acidNotes[stepInBar], time, master, 0.16, slide);
      }
    }
  }

  /**
   * Starts the Jazzy Acid Instrumental Lo-Fi Beat
   */
  public startAmbientLoop(): void {
    if (this.isAmbientPlaying || this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (!this.musicGain) {
      this.musicGain = ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.musicGain.connect(ctx.destination);
    }

    // Smooth fade in
    this.musicGain.gain.cancelScheduledValues(ctx.currentTime);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value || 0.001, ctx.currentTime);
    this.musicGain.gain.exponentialRampToValueAtTime(0.75, ctx.currentTime + 1.2);

    this.isAmbientPlaying = true;
    this.currentStep = 0;
    this.nextStepTime = ctx.currentTime + 0.05;

    const secondsPer16th = 60 / (this.tempoBpm * 4);

    if (this.schedulerTimer) clearInterval(this.schedulerTimer);
    this.schedulerTimer = setInterval(() => {
      if (!this.isAmbientPlaying || !this.ctx) return;
      // Schedule ahead by 150ms
      while (this.nextStepTime < this.ctx.currentTime + 0.15) {
        this.scheduleStep(this.currentStep, this.nextStepTime, this.ctx, this.musicGain!);
        this.nextStepTime += secondsPer16th;
        this.currentStep = (this.currentStep + 1) % 64; // 4-bar loop (64 steps)
      }
    }, 40);
  }

  /**
   * Stops the instrumental music with a smooth fade-out
   */
  public stopAmbientLoop(): void {
    if (!this.isAmbientPlaying) return;
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    const ctx = this.ctx;
    if (ctx && this.musicGain) {
      try {
        this.musicGain.gain.cancelScheduledValues(ctx.currentTime);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, ctx.currentTime);
        this.musicGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      } catch {}
    }
    this.isAmbientPlaying = false;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbientLoop();
    } else {
      this.startAmbientLoop();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying;
  }
}

export const soundEngine = new SoundEngine();

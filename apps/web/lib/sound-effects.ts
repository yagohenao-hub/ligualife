/**
 * sound-effects.ts
 * Synthesizes instantaneous, zero-latency Web Audio API sound effects & ambient audio.
 * No external MP3 assets needed.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isAmbientPlaying: boolean = false;
  private isMuted: boolean = false;

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
  public startAmbientLoop(): void {
    if (this.isAmbientPlaying || this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const baseFreqs = [110.00, 164.81, 220.00, 277.18]; // A2, E3, A3, C#4 (Warm A major pad)
    this.ambientOscillators = [];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 2.0); // Gentle background volume
    masterGain.connect(ctx.destination);
    this.ambientGain = masterGain;

    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Subtle LFO detune for cozy warmth
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.15 + i * 0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      osc.connect(masterGain);
      osc.start();
      this.ambientOscillators.push(osc, lfo);
    });

    this.isAmbientPlaying = true;
  }

  public stopAmbientLoop(): void {
    if (!this.isAmbientPlaying) return;
    const ctx = this.ctx;
    if (ctx && this.ambientGain) {
      try {
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, ctx.currentTime);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
        setTimeout(() => {
          this.ambientOscillators.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch {}
          });
          this.ambientOscillators = [];
          this.isAmbientPlaying = false;
        }, 1100);
      } catch {
        this.isAmbientPlaying = false;
      }
    } else {
      this.isAmbientPlaying = false;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbientLoop();
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

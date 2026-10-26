/**
 * Procedural Web Audio API sound generator for Home Repair Tools.
 * No external audio files needed; guarantees 100% availability and zero latency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgOscillator: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;

  private initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.bgGain) {
      this.bgGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  // 鐵鎚敲擊聲：金屬撞擊 + 低頻木板共鳴
  public playHammer(power: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      // 金屬清脆高頻
      const metalOsc = ctx.createOscillator();
      const metalGain = ctx.createGain();
      metalOsc.type = 'triangle';
      metalOsc.frequency.setValueAtTime(1200 * power, t);
      metalOsc.frequency.exponentialRampToValueAtTime(300, t + 0.08);

      metalGain.gain.setValueAtTime(0.4 * power, t);
      metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      metalOsc.connect(metalGain);
      metalGain.connect(ctx.destination);
      metalOsc.start(t);
      metalOsc.stop(t + 0.1);

      // 低頻沉重打擊感
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(180, t);
      thudOsc.frequency.exponentialRampToValueAtTime(45, t + 0.15);

      thudGain.gain.setValueAtTime(0.6 * power, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(t);
      thudOsc.stop(t + 0.16);
    } catch {
      // Audio fallback
    }
  }

  // 橡皮鎚打擊聲：柔和沉悶的鈍擊，無金屬尖銳聲
  public playMallet() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    } catch {}
  }

  // 螺絲批轉動棘輪聲：高頻短促「喀、喀、喀」
  public playScrewdriver(pitchMod: number = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900 * pitchMod, t);
      osc.frequency.exponentialRampToValueAtTime(1600 * pitchMod, t + 0.03);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch {}
  }

  // 活動扳手擰轉金屬聲 / 齒輪調節滾動聲
  public playWrench() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(580, t + 0.06);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch {}
  }

  // 捲尺拉出嘶嘶聲 & 回縮卡嗒聲
  public playTapePull() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3500, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t);
    } catch {}
  }

  public playTapeSnap() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    } catch {}
  }

  // 水平尺氣泡居中清脆叮咚聲 (Harmonic Chime)
  public playLevelSuccess() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.2, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.45);
      });
    } catch {}
  }

  // 尖嘴鉗/老虎鉗 剪切或夾住金屬清脆聲
  public playPliersSnip() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch {}
  }

  // 止洩帶/生料帶滑順纏繞聲
  public playWrapTape() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.08);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch {}
  }

  // 成功完成大任務的勝利號角
  public playVictoryFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const chords = [
        { freqs: [261.63, 329.63, 392.00], time: 0, dur: 0.15 },
        { freqs: [329.63, 392.00, 523.25], time: 0.18, dur: 0.15 },
        { freqs: [392.00, 523.25, 659.25], time: 0.36, dur: 0.2 },
        { freqs: [523.25, 659.25, 783.99, 1046.50], time: 0.60, dur: 0.6 },
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + chord.time);

          gain.gain.setValueAtTime(0.15, t + chord.time);
          gain.gain.exponentialRampToValueAtTime(0.001, t + chord.time + chord.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + chord.time);
          osc.stop(t + chord.time + chord.dur + 0.05);
        });
      });
    } catch {}
  }

  // 選錯工具警報聲
  public playError() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.setValueAtTime(110, t + 0.08);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch {}
  }

  // 介面按鈕點擊
  public playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.02);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.03);
    } catch {}
  }
}

export const sound = new SoundEngine();

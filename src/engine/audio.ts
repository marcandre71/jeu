/**
 * Synthétiseur audio Web Audio API pour "Sol, Nouvelle Ère"
 * Génère des effets sonores procéduraux rétro-futuristes sans aucun fichier externe.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx ? this.ctx.currentTime : 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Clic de touche mécanique de terminal
   */
  public playKeyClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400 + Math.random() * 300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  /**
   * Bip de confirmation de terminal
   */
  public playConfirm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1320, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  /**
   * Son de lancer de dés D100 (roulement tactile)
   */
  public playDiceRoll() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    for (let i = 0; i < 5; i++) {
      const delay = i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 + Math.random() * 200, this.ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + delay + 0.03);

      gain.gain.setValueAtTime(0.08 - i * 0.012, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + 0.05);
    }
  }

  /**
   * Réussite critique (accord glorieux rétro)
   */
  public playCriticalSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const start = this.ctx!.currentTime + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(start);
      osc.stop(start + 0.32);
    });
  }

  /**
   * Échec critique / Alarme
   */
  public playCriticalFailure() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.32);
  }

  /**
   * Tir de pistolet frangible (étouffé, basse pression)
   */
  public playGunshot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Bruit blanc + percussion basse
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    // Impact basse
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, this.ctx.currentTime);
    sub.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);
    subGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    sub.connect(subGain);
    subGain.connect(this.ctx.destination);

    noise.start();
    sub.start();
    noise.stop(this.ctx.currentTime + 0.15);
    sub.stop(this.ctx.currentTime + 0.18);
  }

  /**
   * Alerte de dépressurisation / température
   */
  public playWarningBeep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  /**
   * Souffle pneumatique / Rustine / Medkit
   */
  public playPneumaticHiss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.25);
  }

  /**
   * Démarrer le bourdonnement spatial d'ambiance
   */
  public startAmbient() {
    if (this.isAmbientPlaying || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const drone = this.ctx.createOscillator();
      const drone2 = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      drone.type = 'sine';
      drone.frequency.setValueAtTime(55, this.ctx.currentTime); // 55 Hz hum

      drone2.type = 'triangle';
      drone2.frequency.setValueAtTime(110, this.ctx.currentTime);

      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.03, this.ctx.currentTime);

      drone.connect(this.ambientGain);
      drone2.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      drone.start();
      drone2.start();
      this.isAmbientPlaying = true;
    } catch {
      // Ignorer si audio bloqué avant interaction
    }
  }
}

export const soundFx = new SoundSystem();

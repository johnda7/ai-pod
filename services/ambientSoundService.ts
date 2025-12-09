/**
 * 🎵 AMBIENT SOUND SERVICE — Web Audio API
 * 
 * Замена YouTube для звуков в Чилл-зоне.
 * Работает в России и офлайн!
 * 
 * Использует Web Audio API для генерации ambient звуков:
 * - Дождь (white noise + filters)
 * - Лес (birds + leaves)
 * - Океан (waves)
 * - Костёр (crackling)
 * - Ветер (wind)
 * - и др.
 */

type SoundType = 'RAIN' | 'FOREST' | 'OCEAN' | 'FIRE' | 'WIND' | 'CAFE' | 'THUNDER' | 'NIGHT';

interface AmbientSound {
  type: SoundType;
  audioContext: AudioContext | null;
  nodes: AudioNode[];
  isPlaying: boolean;
}

class AmbientSoundService {
  private audioContext: AudioContext | null = null;
  private currentSound: AmbientSound | null = null;
  private gainNode: GainNode | null = null;
  private volume: number = 0.5;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  /**
   * Установить громкость (0-1)
   */
  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  /**
   * Воспроизвести ambient звук
   */
  async play(soundType: SoundType): Promise<void> {
    // Остановить текущий звук
    this.stop();

    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (!this.audioContext) {
      console.warn('AudioContext not available');
      return;
    }

    // Возобновить контекст если приостановлен
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Создать звук в зависимости от типа
    switch (soundType) {
      case 'RAIN':
        this.createRainSound();
        break;
      case 'FOREST':
        this.createForestSound();
        break;
      case 'OCEAN':
        this.createOceanSound();
        break;
      case 'FIRE':
        this.createFireSound();
        break;
      case 'WIND':
        this.createWindSound();
        break;
      case 'CAFE':
        this.createCafeSound();
        break;
      case 'THUNDER':
        this.createThunderSound();
        break;
      case 'NIGHT':
        this.createNightSound();
        break;
    }

    this.currentSound = {
      type: soundType,
      audioContext: this.audioContext,
      nodes: [],
      isPlaying: true,
    };
  }

  /**
   * Остановить звук
   */
  stop() {
    if (this.currentSound) {
      this.currentSound.isPlaying = false;
      this.currentSound.nodes.forEach(node => {
        try {
          node.disconnect();
        } catch (e) {
          // Игнорируем ошибки отключения
        }
      });
      this.currentSound = null;
    }
  }

  /**
   * Проверить играет ли звук
   */
  isPlaying(): boolean {
    return this.currentSound?.isPlaying ?? false;
  }

  /**
   * Получить текущий тип звука
   */
  getCurrentSoundType(): SoundType | null {
    return this.currentSound?.type ?? null;
  }

  // ===== ГЕНЕРАТОРЫ ЗВУКОВ =====

  /**
   * 🌧️ ДОЖДЬ — filtered white noise
   */
  private createRainSound() {
    if (!this.audioContext || !this.gainNode) return;

    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Low-pass filter for rain-like sound
    const lowPass = this.audioContext.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 400;
    lowPass.Q.value = 1;

    // High-pass to remove rumble
    const highPass = this.audioContext.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 40;

    // Connect
    whiteNoise.connect(lowPass);
    lowPass.connect(highPass);
    highPass.connect(this.gainNode);

    whiteNoise.start();

    if (this.currentSound) {
      this.currentSound.nodes = [whiteNoise, lowPass, highPass];
    }
  }

  /**
   * 🌲 ЛЕС — bird-like sounds + wind
   */
  private createForestSound() {
    if (!this.audioContext || !this.gainNode) return;

    // Wind base (filtered noise)
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 0.5;

    const windGain = this.audioContext.createGain();
    windGain.gain.value = 0.3;

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.gainNode);

    whiteNoise.start();

    // Bird-like oscillations (simple tones)
    const birdScheduler = setInterval(() => {
      if (!this.currentSound?.isPlaying) {
        clearInterval(birdScheduler);
        return;
      }
      this.playBirdChirp();
    }, 3000 + Math.random() * 5000);

    if (this.currentSound) {
      this.currentSound.nodes = [whiteNoise, filter, windGain];
    }
  }

  private playBirdChirp() {
    if (!this.audioContext || !this.gainNode) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.value = 1500 + Math.random() * 1000;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.gainNode);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * 🌊 ОКЕАН — wave-like modulated noise
   */
  private createOceanSound() {
    if (!this.audioContext || !this.gainNode) return;

    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;

    // LFO for wave effect
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 0.1; // Very slow wave
    lfoGain.gain.value = 200;
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.8;

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(this.gainNode);

    whiteNoise.start();
    lfo.start();

    if (this.currentSound) {
      this.currentSound.nodes = [whiteNoise, filter, lfo, lfoGain, masterGain];
    }
  }

  /**
   * 🔥 КОСТЁР — crackling noise
   */
  private createFireSound() {
    if (!this.audioContext || !this.gainNode) return;

    const bufferSize = this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Create crackling pattern
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() > 0.99 ? (Math.random() * 2 - 1) : output[Math.max(0, i-1)] * 0.99;
    }

    const crackle = this.audioContext.createBufferSource();
    crackle.buffer = noiseBuffer;
    crackle.loop = true;

    const highPass = this.audioContext.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 200;

    const lowPass = this.audioContext.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 2000;

    const fireGain = this.audioContext.createGain();
    fireGain.gain.value = 0.7;

    crackle.connect(highPass);
    highPass.connect(lowPass);
    lowPass.connect(fireGain);
    fireGain.connect(this.gainNode);

    crackle.start();

    if (this.currentSound) {
      this.currentSound.nodes = [crackle, highPass, lowPass, fireGain];
    }
  }

  /**
   * 💨 ВЕТЕР — filtered noise with modulation
   */
  private createWindSound() {
    if (!this.audioContext || !this.gainNode) return;

    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 300;
    filter.Q.value = 0.5;

    // LFO for wind gusts
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 150;
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const windGain = this.audioContext.createGain();
    windGain.gain.value = 0.6;

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.gainNode);

    whiteNoise.start();
    lfo.start();

    if (this.currentSound) {
      this.currentSound.nodes = [whiteNoise, filter, lfo, lfoGain, windGain];
    }
  }

  /**
   * ☕ КОФЕЙНЯ — low murmur + occasional clinks
   */
  private createCafeSound() {
    if (!this.audioContext || !this.gainNode) return;

    // Background murmur
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.Q.value = 0.3;

    const cafeGain = this.audioContext.createGain();
    cafeGain.gain.value = 0.3;

    whiteNoise.connect(filter);
    filter.connect(cafeGain);
    cafeGain.connect(this.gainNode);

    whiteNoise.start();

    if (this.currentSound) {
      this.currentSound.nodes = [whiteNoise, filter, cafeGain];
    }
  }

  /**
   * ⛈️ ГРОЗА — rain + thunder
   */
  private createThunderSound() {
    if (!this.audioContext || !this.gainNode) return;

    // Rain base
    this.createRainSound();

    // Thunder at random intervals
    const thunderScheduler = setInterval(() => {
      if (!this.currentSound?.isPlaying) {
        clearInterval(thunderScheduler);
        return;
      }
      this.playThunderClap();
    }, 8000 + Math.random() * 15000);
  }

  private playThunderClap() {
    if (!this.audioContext || !this.gainNode) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.frequency.value = 40 + Math.random() * 30;
    osc.type = 'sawtooth';
    
    filter.type = 'lowpass';
    filter.frequency.value = 100;
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 2);
  }

  /**
   * 🌙 НОЧЬ — crickets + soft wind
   */
  private createNightSound() {
    if (!this.audioContext || !this.gainNode) return;

    // Soft wind
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;

    const windGain = this.audioContext.createGain();
    windGain.gain.value = 0.15;

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.gainNode);

    whiteNoise.start();

    // Crickets
    const cricketScheduler = setInterval(() => {
      if (!this.currentSound?.isPlaying) {
        clearInterval(cricketScheduler);
        return;
      }
      this.playCricket();
    }, 500 + Math.random() * 1000);

    if (this.currentSound) {
      this.currentSound.nodes = [whiteNoise, filter, windGain];
    }
  }

  private playCricket() {
    if (!this.audioContext || !this.gainNode) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.value = 4000 + Math.random() * 1000;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.gainNode);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }
}

// Singleton instance
export const ambientSoundService = new AmbientSoundService();
export type { SoundType };

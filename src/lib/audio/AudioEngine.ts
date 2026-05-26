let audioContextInstance: AudioContext | null = null;
let analyzerNodeInstance: AnalyserNode | null = null;
let filterNodeInstance: BiquadFilterNode | null = null;

const ACCENT_FREQUENCY = 1000;
const NORMAL_FREQUENCY = 800;
const ACCENT_DECAY = 0.1;
const NORMAL_DECAY = 0.05;

class AudioEngineClass {
  private accentGainNode: GainNode | null = null;
  private normalGainNode: GainNode | null = null;

  async getContext(): Promise<AudioContext> {
    if (!audioContextInstance) {
      audioContextInstance = new AudioContext();
    }
    return audioContextInstance;
  }

  async getAnalyzer(): Promise<AnalyserNode> {
    if (analyzerNodeInstance) {
      return analyzerNodeInstance;
    }

    const ctx = await this.getContext();
    analyzerNodeInstance = ctx.createAnalyser();
    // 16384 é o máximo e oferece a melhor resolução de frequência possível (approx 2.7Hz por bin a 44.1kHz)
    analyzerNodeInstance.fftSize = 16384;
    analyzerNodeInstance.smoothingTimeConstant = 0.85;
    
    return analyzerNodeInstance;
  }

  async getFilter(minFreq = 40, maxFreq = 2000): Promise<BiquadFilterNode> {
    if (filterNodeInstance) {
      return filterNodeInstance;
    }

    const ctx = await this.getContext();
    filterNodeInstance = ctx.createBiquadFilter();
    filterNodeInstance.type = 'bandpass';
    filterNodeInstance.frequency.value = (minFreq + maxFreq) / 2;
    filterNodeInstance.Q.value = 1;

    return filterNodeInstance;
  }

  async connectStream(stream: MediaStream): Promise<void> {
    const ctx = await this.getContext();
    const filter = await this.getFilter();
    const analyzer = await this.getAnalyzer();
    
    const source = ctx.createMediaStreamSource(stream);
    source.connect(filter);
    filter.connect(analyzer);
  }

  async setupMetronomeOscillators(): Promise<void> {
    const ctx = await this.getContext();
    
    this.accentGainNode = ctx.createGain();
    this.accentGainNode.gain.value = 0;
    this.accentGainNode.connect(ctx.destination);
    
    this.normalGainNode = ctx.createGain();
    this.normalGainNode.gain.value = 0;
    this.normalGainNode.connect(ctx.destination);
  }

  playClick(time: number, isAccent: boolean): void {
    const ctx = audioContextInstance;
    if (!ctx || !this.accentGainNode || !this.normalGainNode) return;

    const frequency = isAccent ? ACCENT_FREQUENCY : NORMAL_FREQUENCY;
    const decay = isAccent ? ACCENT_DECAY : NORMAL_DECAY;
    const gainNode = isAccent ? this.accentGainNode : this.normalGainNode;

    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.5, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);

    oscillator.start(time);
    oscillator.stop(time + decay + 0.01);
  }

  async resume(): Promise<void> {
    const ctx = await this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  async suspend(): Promise<void> {
    const ctx = await this.getContext();
    if (ctx.state === 'running') {
      await ctx.suspend();
    }
  }

  getState(): string | null {
    return audioContextInstance?.state ?? null;
  }

  async close(): Promise<void> {
    if (audioContextInstance) {
      await audioContextInstance.close();
      audioContextInstance = null;
      analyzerNodeInstance = null;
      filterNodeInstance = null;
    }
  }
}

export const audioEngine = new AudioEngineClass();
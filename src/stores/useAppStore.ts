import { create } from 'zustand';
import { InstrumentType, TuningConfig, INSTRUMENT_CONFIGS } from '@/lib/audio/instrumentConfigs';

export type Language = 'pt' | 'en';

interface TunerState {
  pitch: number | null;
  clarity: number;
  volume: number;
  note: string;
  octave: number;
  cents: number; // Agora suporta decimais para suavidade extrema
  isTuned: boolean;
  targetFrequency: number;
}

interface MetronomeState {
  bpm: number;
  isPlaying: boolean;
  timeSignature: [number, number];
  currentBeat: number;
}

interface AppState {
  language: Language;
  instrument: InstrumentType;
  tuning: TuningConfig;
  audioPermission: 'idle' | 'requesting' | 'granted' | 'denied' | 'error';
  tuner: TunerState;
  metronome: MetronomeState;
  setLanguage: (language: Language) => void;
  setInstrument: (instrument: InstrumentType) => void;
  setTuning: (tuning: TuningConfig) => void;
  setAudioPermission: (status: AppState['audioPermission']) => void;
  updateTuner: (pitch: number | null, clarity: number, volume: number, note: string, octave: number, cents: number, targetFrequency: number) => void;
  updateMetronome: (bpm?: number, isPlaying?: boolean, timeSignature?: [number, number], currentBeat?: number) => void;
}

const defaultTuning = INSTRUMENT_CONFIGS.guitar[0];

export const useAppStore = create<AppState>((set) => ({
  language: 'pt',
  instrument: 'guitar',
  tuning: defaultTuning,
  audioPermission: 'idle',

  tuner: {
    pitch: null,
    clarity: 0,
    volume: 0,
    note: '-',
    octave: 4,
    cents: 0,
    isTuned: false,
    targetFrequency: 440,
  },

  metronome: {
    bpm: 120,
    isPlaying: false,
    timeSignature: [4, 4],
    currentBeat: 0,
  },

  setLanguage: (language) => set({ language }),

  setInstrument: (instrument) =>
    set((state) => ({
      instrument,
      tuning: INSTRUMENT_CONFIGS[instrument][0],
    })),

  setTuning: (tuning) => set({ tuning }),

  setAudioPermission: (audioPermission) => set({ audioPermission }),

  updateTuner: (pitch, clarity, volume, note, octave, cents, targetFrequency) =>
    set((state) => ({
      tuner: {
        ...state.tuner,
        pitch,
        clarity,
        volume,
        note,
        octave,
        cents,
        isTuned: Math.abs(cents) <= 3.5, // Tolerância levemente maior para facilitar a afinação visual
        targetFrequency,
      },
    })),

  updateMetronome: (bpm, isPlaying, timeSignature, currentBeat) =>
    set((state) => ({
      metronome: {
        ...state.metronome,
        ...(bpm !== undefined && { bpm }),
        ...(isPlaying !== undefined && { isPlaying }),
        ...(timeSignature !== undefined && { timeSignature }),
        ...(currentBeat !== undefined && { currentBeat }),
      },
    })),
}));
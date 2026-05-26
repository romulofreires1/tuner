export type InstrumentType = 'guitar' | 'bass' | 'ukulele' | 'violin';

export interface TuningConfig {
  name: string;
  notes: { note: string; octave: number; frequency: number }[];
}

export const INSTRUMENT_CONFIGS: Record<InstrumentType, TuningConfig[]> = {
  guitar: [
    { name: 'Standard', notes: [
      { note: 'E', octave: 2, frequency: 82.41 },
      { note: 'A', octave: 2, frequency: 110.00 },
      { note: 'D', octave: 3, frequency: 146.83 },
      { note: 'G', octave: 3, frequency: 196.00 },
      { note: 'B', octave: 3, frequency: 246.94 },
      { note: 'E', octave: 4, frequency: 329.63 },
    ]},
    { name: 'Drop D', notes: [
      { note: 'D', octave: 2, frequency: 73.42 },
      { note: 'A', octave: 2, frequency: 110.00 },
      { note: 'D', octave: 3, frequency: 146.83 },
      { note: 'G', octave: 3, frequency: 196.00 },
      { note: 'B', octave: 3, frequency: 246.94 },
      { note: 'E', octave: 4, frequency: 329.63 },
    ]},
    { name: 'Open G', notes: [
      { note: 'D', octave: 2, frequency: 73.42 },
      { note: 'G', octave: 2, frequency: 98.00 },
      { note: 'D', octave: 3, frequency: 146.83 },
      { note: 'G', octave: 3, frequency: 196.00 },
      { note: 'B', octave: 3, frequency: 246.94 },
      { note: 'D', octave: 4, frequency: 293.66 },
    ]},
  ],
  bass: [
    { name: 'Standard', notes: [
      { note: 'E', octave: 1, frequency: 41.20 },
      { note: 'A', octave: 1, frequency: 55.00 },
      { note: 'D', octave: 2, frequency: 73.42 },
      { note: 'G', octave: 2, frequency: 98.00 },
    ]},
    { name: 'Drop D', notes: [
      { note: 'D', octave: 1, frequency: 36.71 },
      { note: 'A', octave: 1, frequency: 55.00 },
      { note: 'D', octave: 2, frequency: 73.42 },
      { note: 'G', octave: 2, frequency: 98.00 },
    ]},
  ],
  ukulele: [
    { name: 'Standard', notes: [
      { note: 'G', octave: 4, frequency: 392.00 },
      { note: 'C', octave: 4, frequency: 261.63 },
      { note: 'E', octave: 4, frequency: 329.63 },
      { note: 'A', octave: 4, frequency: 440.00 },
    ]},
    { name: 'Baritone', notes: [
      { note: 'D', octave: 3, frequency: 146.83 },
      { note: 'G', octave: 3, frequency: 196.00 },
      { note: 'B', octave: 3, frequency: 246.94 },
      { note: 'E', octave: 4, frequency: 329.63 },
    ]},
  ],
  violin: [
    { name: 'Standard', notes: [
      { note: 'G', octave: 3, frequency: 196.00 },
      { note: 'D', octave: 4, frequency: 293.66 },
      { note: 'A', octave: 4, frequency: 440.00 },
      { note: 'E', octave: 5, frequency: 659.26 },
    ]},
  ],
};

export function getDefaultTuning(instrument: InstrumentType): TuningConfig {
  return INSTRUMENT_CONFIGS[instrument][0];
}

export function getTuningFrequency(instrument: InstrumentType, stringIndex: number): number {
  const tuning = getDefaultTuning(instrument);
  return tuning.notes[stringIndex]?.frequency ?? 440;
}
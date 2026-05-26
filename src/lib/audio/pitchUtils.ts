import { PitchDetector } from 'pitchy';

const A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface PitchResult {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
  clarity: number;
  volume: number;
}

let detector: PitchDetector<Float32Array> | null = null;

function getDetector(inputLength: number): PitchDetector<Float32Array> {
  if (!detector || detector.inputLength !== inputLength) {
    detector = PitchDetector.forFloat32Array(inputLength);
  }
  return detector;
}

export function frequencyToNote(frequency: number): { note: string; octave: number; cents: number } {
  const midiNumber = A4_MIDI_NUMBER + 12 * Math.log2(frequency / A4_FREQUENCY);
  const roundedMidi = Math.round(midiNumber);
  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  const octave = Math.floor(roundedMidi / 12) - 1;
  const cents = Math.round((midiNumber - roundedMidi) * 100);
  
  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    cents,
  };
}

function calculateRMS(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

export function detectPitch(data: Float32Array, sampleRate: number): PitchResult | null {
  const volume = calculateRMS(data);
  
  // Se o volume estiver muito baixo (ruído de fundo ou interferência fraca), desconsidera
  // 0.01 é um valor baixo mas que filtra silêncio e ruído de ventoinha
  if (volume < 0.01) {
    return null;
  }

  const detector = getDetector(data.length);
  const [frequency, clarity] = detector.findPitch(data, sampleRate);
  
  // Aumentando a exigência de claridade se o volume for baixo
  const clarityThreshold = volume < 0.05 ? 0.85 : 0.7;

  if (clarity < clarityThreshold || frequency < 30 || frequency > 4000) {
    return null;
  }

  const { note, octave, cents } = frequencyToNote(frequency);
  
  return {
    frequency,
    note,
    octave,
    cents,
    clarity,
    volume,
  };
}

export function getFrequencyData(analyzer: AnalyserNode): Float32Array {
  const bufferLength = analyzer.fftSize;
  const dataArray = new Float32Array(bufferLength);
  analyzer.getFloatTimeDomainData(dataArray);
  return dataArray;
}

export function calculateDiff(detectedFreq: number, targetFreq: number): number {
  return 1200 * Math.log2(detectedFreq / targetFreq);
}

export function isTuned(cents: number, threshold = 3): boolean {
  return Math.abs(cents) <= threshold;
}

export function smoothValue(current: number, target: number, smoothingFactor = 0.3): number {
  return current + (target - current) * smoothingFactor;
}
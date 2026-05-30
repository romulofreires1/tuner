import { useCallback, useEffect, useRef } from 'react';
import { audioEngine } from '@/lib/audio/AudioEngine';
import { detectPitch, getFrequencyData, PitchResult } from '@/lib/audio/pitchUtils';
import { useAppStore } from '@/stores/useAppStore';
import { InstrumentType } from '@/lib/audio/instrumentConfigs';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const A4 = 440;
function getNoteFrequency(midi: number): number {
  return A4 * Math.pow(2, (midi - 69) / 12);
}

// Notas que são frequentemente confundidas por serem harmônicos fortes (Quintas)
const HARMONIC_RELATIONS: Record<string, string> = {
  'D': 'G', // Ré é o 3º harmônico do Sol
  'B': 'E', // Si é o 3º harmônico do Mi
  'A': 'D', // Lá é o 3º harmônico do Ré
};

export function useTuner() {
  const animationRef = useRef<number | null>(null);
  const smoothedCentsRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const consecutiveLowClarityRef = useRef<number>(0);
  const centsHistoryRef = useRef<number[]>([]);
  
  // Estabilização de nota avançada
  const noteHistoryRef = useRef<string[]>([]);
  const stableNoteRef = useRef<string>('-');
  const stableOctaveRef = useRef<number>(4);
  const lastConfidentNoteRef = useRef<string>('-');

  const instrumentRef = useRef<InstrumentType>('guitar');
  const { tuner, updateTuner } = useAppStore();
  
  const tunerRef = useRef(tuner);
  useEffect(() => {
    tunerRef.current = tuner;
  }, [tuner]);

  const analyzeAudio = useCallback(async () => {
    const now = performance.now();
    if (now - lastUpdateRef.current < 16) { 
      animationRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }
    lastUpdateRef.current = now;

    const analyzer = await audioEngine.getAnalyzer();
    const ctx = await audioEngine.getContext();
    const data = getFrequencyData(analyzer);
    const pitchResult: PitchResult | null = detectPitch(data, ctx.sampleRate);

    if (pitchResult && pitchResult.clarity > 0.6) {
      consecutiveLowClarityRef.current = 0;
      
      let detectedNote = pitchResult.note;
      let detectedOctave = pitchResult.octave;

      // LÓGICA ANTI-HARMÔNICO (VETO DE QUINTA)
      // Se detectarmos D mas estávamos confiantes no G, ou se o volume for alto (ataque),
      // verificamos se não é apenas o harmônico do G.
      if (HARMONIC_RELATIONS[detectedNote] === lastConfidentNoteRef.current) {
        // Se a oitava for maior que a esperada para a fundamental, é quase certo que é harmônico
        if (detectedOctave > stableOctaveRef.current) { 
            // Mantemos a nota anterior para evitar o pulo visual
            detectedNote = lastConfidentNoteRef.current;
            detectedOctave = stableOctaveRef.current;
            // Ajustamos a oitava para a fundamental provável se necessário
        }
      }

      const currentNoteKey = `${detectedNote}${detectedOctave}`;
      noteHistoryRef.current.push(currentNoteKey);
      if (noteHistoryRef.current.length > 6) { // Janela maior para mais estabilidade
        noteHistoryRef.current.shift();
      }

      const counts: Record<string, number> = {};
      let maxCount = 0;
      let mostFrequentNoteKey = currentNoteKey;

      for (const n of noteHistoryRef.current) {
        counts[n] = (counts[n] || 0) + 1;
        if (counts[n] > maxCount) {
          maxCount = counts[n];
          mostFrequentNoteKey = n;
        }
      }

      // Exige 60% de dominância no histórico
      if (maxCount >= 4) {
        const match = mostFrequentNoteKey.match(/^([A-G]#?)(\d+)$/);
        if (match) {
          stableNoteRef.current = match[1];
          stableOctaveRef.current = parseInt(match[2], 10);
          lastConfidentNoteRef.current = stableNoteRef.current;
        }
      }
      
      centsHistoryRef.current.push(pitchResult.cents);
      if (centsHistoryRef.current.length > 5) {
        centsHistoryRef.current.shift();
      }
      
      let targetCents = getMedian(centsHistoryRef.current);
      if (Math.abs(targetCents) < 1) targetCents = 0;

      const diff = Math.abs(targetCents - smoothedCentsRef.current);
      let lerpFactor = 0.15;
      if (diff < 1) lerpFactor = 0.06;
      if (diff > 10) lerpFactor = 0.3;
      
      smoothedCentsRef.current = lerp(smoothedCentsRef.current, targetCents, lerpFactor);

      const midiNumber = 69 + 12 * Math.log2(pitchResult.frequency / 440);
      const targetFreq = getNoteFrequency(Math.round(midiNumber));

      updateTuner(
        pitchResult.frequency,
        pitchResult.clarity,
        pitchResult.volume,
        stableNoteRef.current,
        stableOctaveRef.current,
        smoothedCentsRef.current,
        targetFreq
      );
    } else {
      consecutiveLowClarityRef.current++;
      
      if (consecutiveLowClarityRef.current > 4) {
        centsHistoryRef.current = [];
        noteHistoryRef.current = [];
        lastConfidentNoteRef.current = '-';
        smoothedCentsRef.current = lerp(smoothedCentsRef.current, 0, 0.1);
        
        if (tunerRef.current.pitch !== null || Math.abs(smoothedCentsRef.current) > 0.1) {
          updateTuner(
            null, 0, 0, '-', 4, 
            smoothedCentsRef.current, 440
          );
        }
      }
    }

    animationRef.current = requestAnimationFrame(analyzeAudio);
  }, [updateTuner]);

  const startTuner = useCallback(async () => {
    if (animationRef.current) return;
    animationRef.current = requestAnimationFrame(analyzeAudio);
  }, [analyzeAudio]);

  const stopTuner = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    const currentInstrument = useAppStore.getState().instrument;
    instrumentRef.current = currentInstrument;
  });

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    ...tuner,
    startTuner,
    stopTuner,
  };
}
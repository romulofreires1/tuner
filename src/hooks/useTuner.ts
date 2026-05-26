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

export function useTuner() {
  const animationRef = useRef<number | null>(null);
  const smoothedCentsRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const consecutiveLowClarityRef = useRef<number>(0);
  const centsHistoryRef = useRef<number[]>([]);
  const instrumentRef = useRef<InstrumentType>('guitar');
  const { tuner, updateTuner } = useAppStore();
  
  // Use a ref for tuner state to avoid callback recreation
  const tunerRef = useRef(tuner);
  useEffect(() => {
    tunerRef.current = tuner;
  }, [tuner]);

  const analyzeAudio = useCallback(async () => {
    const now = performance.now();
    if (now - lastUpdateRef.current < 45) { // Ligeiramente mais lento para média mais estável
      animationRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }
    lastUpdateRef.current = now;

    const analyzer = await audioEngine.getAnalyzer();
    const ctx = await audioEngine.getContext();
    const data = getFrequencyData(analyzer);
    const pitchResult: PitchResult | null = detectPitch(data, ctx.sampleRate);

    if (pitchResult && pitchResult.clarity > 0.8) {
      consecutiveLowClarityRef.current = 0;
      
      // Histórico maior (7) para eliminar mais jitter
      centsHistoryRef.current.push(pitchResult.cents);
      if (centsHistoryRef.current.length > 7) {
        centsHistoryRef.current.shift();
      }
      
      let targetCents = getMedian(centsHistoryRef.current);
      
      // Efeito "Magnético": se estiver a menos de 1 cent do centro, trava no zero.
      if (Math.abs(targetCents) < 1) {
        targetCents = 0;
      }

      const diff = Math.abs(targetCents - smoothedCentsRef.current);
      
      // Suavização ultra-agressiva para mudanças pequenas (estabilização)
      // e resposta mais rápida para mudanças grandes (nova nota)
      let lerpFactor = 0.08;
      if (diff < 1) lerpFactor = 0.03;
      if (diff > 10) lerpFactor = 0.2;
      
      smoothedCentsRef.current = lerp(smoothedCentsRef.current, targetCents, lerpFactor);

      const midiNumber = 69 + 12 * Math.log2(pitchResult.frequency / 440);
      const targetFreq = getNoteFrequency(Math.round(midiNumber));

      updateTuner(
        pitchResult.frequency,
        pitchResult.clarity,
        pitchResult.volume,
        pitchResult.note,
        pitchResult.octave,
        smoothedCentsRef.current,
        targetFreq
      );
    } else {
      consecutiveLowClarityRef.current++;
      
      if (consecutiveLowClarityRef.current > 6) {
        centsHistoryRef.current = [];
        smoothedCentsRef.current = lerp(smoothedCentsRef.current, 0, 0.03);
        
        if (tunerRef.current.pitch !== null || Math.abs(smoothedCentsRef.current) > 0.1) {
          updateTuner(
            null, 
            0, 
            0,
            '-', 
            4, 
            smoothedCentsRef.current, 
            440
          );
        }
      }
    }

    animationRef.current = requestAnimationFrame(analyzeAudio);
  }, [updateTuner]); // Removed tuner.pitch dependency

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
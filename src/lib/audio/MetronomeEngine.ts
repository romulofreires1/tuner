import { audioEngine } from './AudioEngine';
import { useAppStore } from '@/stores/useAppStore';

export interface MetronomeEngine {
  start: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  getStatus: () => { isPlaying: boolean; bpm: number };
}

const LOOKAHEAD = 0.1; // Segundos

export function createMetronomeEngine(): MetronomeEngine {
  let worker: Worker | null = null;
  let isPlaying = false;
  let currentBpm = 120;
  let nextNoteTime = 0;
  let beatNumber = 0;

  const scheduler = async () => {
    const ctx = await audioEngine.getContext();
    const { timeSignature } = useAppStore.getState().metronome;
    const beatsPerMeasure = timeSignature[0];

    while (nextNoteTime < ctx.currentTime + LOOKAHEAD) {
      const isAccent = beatNumber === 0;
      audioEngine.playClick(nextNoteTime, isAccent);
      
      // Sincronizar UI com o tempo da nota
      const timeUntilNote = (nextNoteTime - ctx.currentTime) * 1000;
      const currentBeat = beatNumber;
      setTimeout(() => {
        if (isPlaying) {
          useAppStore.getState().updateMetronome(undefined, undefined, undefined, currentBeat);
        }
      }, Math.max(0, timeUntilNote));

      advanceNote(beatsPerMeasure);
    }
  };

  const advanceNote = (beatsPerMeasure: number) => {
    const secondsPerBeat = 60.0 / currentBpm;
    nextNoteTime += secondsPerBeat;
    beatNumber = (beatNumber + 1) % beatsPerMeasure;
  };

  const handleWorkerMessage = (e: MessageEvent) => {
    if (e.data === 'tick') {
      scheduler();
    }
  };

  return {
    start: () => {
      if (isPlaying) return;
      
      audioEngine.setupMetronomeOscillators().then(async () => {
        const ctx = await audioEngine.getContext();
        isPlaying = true;
        beatNumber = 0;
        nextNoteTime = ctx.currentTime + 0.05;
        
        worker = new Worker(new URL('./metronome.worker.ts', import.meta.url));
        worker.onmessage = handleWorkerMessage;
        worker.postMessage({ type: 'start' });
      });
    },

    stop: () => {
      if (!isPlaying || !worker) return;
      worker.postMessage({ type: 'stop' });
      worker.terminate();
      worker = null;
      isPlaying = false;
      useAppStore.getState().updateMetronome(undefined, false, undefined, 0);
    },

    setBpm: (bpm: number) => {
      currentBpm = bpm;
    },

    getStatus: () => ({ isPlaying, bpm: currentBpm }),
  };
}

export const metronomeEngine = createMetronomeEngine();
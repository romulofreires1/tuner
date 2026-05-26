'use client';

import { useAppStore } from '@/stores/useAppStore';

const TIME_SIGNATURES: [number, number][] = [
  [2, 4],
  [3, 4],
  [4, 4],
  [6, 8],
];

export function TimeSignatureSelector() {
  const { metronome, updateMetronome } = useAppStore();
  const [currentNumerator, currentDenominator] = metronome.timeSignature;

  return (
    <div className="flex gap-2 bg-background-primary/30 p-1.5 rounded-2xl border border-indicator-border/50">
      {TIME_SIGNATURES.map(([num, den]) => {
        const isActive = num === currentNumerator && den === currentDenominator;
        return (
          <button
            key={`${num}/${den}`}
            onClick={() => updateMetronome(undefined, undefined, [num, den])}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all duration-300 ${
              isActive
                ? 'bg-accent-magenta text-foreground-primary shadow-lg shadow-accent-magenta/20'
                : 'text-foreground-muted hover:text-foreground-secondary hover:bg-background-elevated'
            }`}
          >
            {num}/{den}
          </button>
        );
      })}
    </div>
  );
}
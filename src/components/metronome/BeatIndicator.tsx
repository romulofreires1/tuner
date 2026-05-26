'use client';

import { useAppStore } from '@/stores/useAppStore';

export function BeatIndicator() {
  const { metronome } = useAppStore();
  const [beats] = metronome.timeSignature;

  return (
    <div className="flex justify-center gap-5">
      {Array.from({ length: beats }).map((_, i) => (
        <div
          key={i}
          className={`relative w-4 h-4 rounded-full transition-all duration-300 ${
            metronome.isPlaying && metronome.currentBeat === i
              ? 'scale-150'
              : 'scale-100'
          }`}
        >
          {/* Active indicator with glow */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-200 border-2 ${
              metronome.isPlaying && metronome.currentBeat === i
                ? 'bg-accent-mint border-accent-mint shadow-[0_0_20px_oklch(82%_0.16_150)] opacity-100'
                : i === 0 
                  ? 'bg-foreground-muted border-indicator-border opacity-100' // Accent for first beat
                  : 'bg-foreground-muted/30 border-indicator-border opacity-100'
            }`}
          />
          
          {/* Subtle ring for the first beat when inactive */}
          {i === 0 && !metronome.isPlaying && (
            <div className="absolute -inset-1 border border-accent-magenta/30 rounded-full animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
}
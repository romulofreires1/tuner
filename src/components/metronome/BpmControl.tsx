'use client';

import { useAppStore } from '@/stores/useAppStore';
import { translations } from '@/lib/translations';

interface BpmControlProps {
  onBpmChange: (bpm: number) => void;
}

export function BpmControl({ onBpmChange }: BpmControlProps) {
  const { metronome, language } = useAppStore();
  const t = translations[language];

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(30, Math.min(300, metronome.bpm + delta));
    onBpmChange(newBpm);
  };

  return (
    <div className="w-full flex flex-col items-center gap-10">
      <div className="flex items-center justify-between w-full max-w-[260px]">
        <button
          onClick={() => adjustBpm(-1)}
          onContextMenu={(e) => { e.preventDefault(); adjustBpm(-5); }}
          className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-background-elevated border-2 border-indicator-border text-foreground-primary hover:bg-accent-magenta hover:border-accent-magenta hover:text-foreground-primary active:scale-90 transition-all duration-300 shadow-lg"
          title={t.decreaseBpm}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-5xl font-black tabular-nums tracking-tighter text-foreground-primary leading-none drop-shadow-2xl">
            {metronome.bpm}
          </span>
        </div>

        <button
          onClick={() => adjustBpm(1)}
          onContextMenu={(e) => { e.preventDefault(); adjustBpm(5); }}
          className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-background-elevated border-2 border-indicator-border text-foreground-primary hover:bg-accent-magenta hover:border-accent-magenta hover:text-foreground-primary active:scale-90 transition-all duration-300 shadow-lg"
          title={t.increaseBpm}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <div className="w-full group px-2">
        <input
          type="range"
          min="30"
          max="300"
          value={metronome.bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value))}
          className="w-full h-2.5 bg-indicator-track rounded-full appearance-none cursor-pointer accent-accent-mint transition-all group-hover:h-3
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-[24px] 
            [&::-webkit-slider-thumb]:h-[24px] 
            [&::-webkit-slider-thumb]:bg-foreground-primary 
            [&::-webkit-slider-thumb]:border-[4px] 
            [&::-webkit-slider-thumb]:border-accent-mint 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:shadow-[0_0_20px_oklch(82%_0.16_150_/_0.5)] 
            [&::-webkit-slider-thumb]:transition-all 
            [&::-webkit-slider-thumb]:duration-300
            [&::-webkit-slider-thumb]:hover:scale-125
          "
        />
      </div>
    </div>
  );
}
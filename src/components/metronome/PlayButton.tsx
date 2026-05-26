'use client';

import { useAppStore } from '@/stores/useAppStore';

interface PlayButtonProps {
  onToggle: () => void;
}

export function PlayButton({ onToggle }: PlayButtonProps) {
  const { metronome } = useAppStore();

  return (
    <button
      onClick={onToggle}
      className={`relative group flex items-center justify-center w-24 h-24 transition-all duration-300 active:scale-90`}
    >
      <div className={`absolute inset-0 rounded-full transition-all duration-700 blur-[30px] ${
        metronome.isPlaying ? 'bg-accent-magenta/40 scale-125' : 'bg-foreground-primary/5 scale-100'
      }`} />
      
      <div className={`relative z-10 w-full h-full rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border-4 ${
        metronome.isPlaying 
          ? 'bg-accent-magenta border-foreground-primary/20 text-foreground-primary' 
          : 'bg-foreground-primary border-foreground-primary/20 text-background-primary'
      }`}>
        {metronome.isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="ml-1.5"><path d="M5 3l14 9-14 9V3z"/></svg>
        )}
      </div>
    </button>
  );
}
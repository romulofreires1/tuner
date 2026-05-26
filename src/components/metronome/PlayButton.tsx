'use client';

import { useAppStore } from '@/stores/useAppStore';
import { translations } from '@/lib/translations';

interface PlayButtonProps {
  onToggle: () => void;
}

export function PlayButton({ onToggle }: PlayButtonProps) {
  const { metronome, language } = useAppStore();
  const t = translations[language];

  return (
    <button
      onClick={onToggle}
      title={metronome.isPlaying ? t.stopMetronome : t.startMetronome}
      className={`relative group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300 active:scale-90`}
    >
      <div className={`absolute inset-0 rounded-full transition-all duration-700 blur-[15px] sm:blur-[20px] ${
        metronome.isPlaying ? 'bg-accent-magenta/40 scale-125' : 'bg-foreground-primary/5 scale-100'
      }`} />
      
      <div className={`relative z-10 w-full h-full rounded-full flex items-center justify-center shadow-xl transition-all duration-500 border-[3px] sm:border-4 ${
        metronome.isPlaying 
          ? 'bg-accent-magenta border-foreground-primary/20 text-foreground-primary' 
          : 'bg-foreground-primary border-foreground-primary/20 text-background-primary'
      }`}>
        {metronome.isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[26px] sm:h-[26px]"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 sm:w-[26px] sm:h-[26px] sm:ml-1"><path d="M5 3l14 9-14 9V3z"/></svg>
        )}
      </div>
    </button>
  );
}
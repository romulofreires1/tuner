'use client';

import { useAppStore } from '@/stores/useAppStore';
import { translations } from '@/lib/translations';

export function MetronomeDisplay() {
  const { metronome, language } = useAppStore();
  const t = translations[language];

  const getTempoName = (bpm: number) => {
    // Italian tempo markings are universal in music, but we can localize them if needed.
    // For now, keeping the markings but ensuring the status text is translated.
    if (bpm <= 40) return 'Grave';
    if (bpm <= 60) return 'Largo';
    if (bpm <= 66) return 'Larghetto';
    if (bpm <= 76) return 'Adagio';
    if (bpm <= 108) return 'Andante';
    if (bpm <= 120) return 'Moderato';
    if (bpm <= 156) return 'Allegro';
    if (bpm <= 176) return 'Vivace';
    if (bpm <= 200) return 'Presto';
    return 'Prestissimo';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`text-[11px] font-black uppercase tracking-[0.5em] mb-3 transition-colors duration-500 ${
        metronome.isPlaying ? 'text-accent-mint animate-pulse' : 'text-accent-magenta'
      }`}>
        {metronome.isPlaying ? t.running : t.ready}
      </div>
      <div className="text-base font-black text-foreground-secondary tracking-[0.2em] uppercase">
        {getTempoName(metronome.bpm)}
      </div>
    </div>
  );
}
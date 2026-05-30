'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { translations } from '@/lib/translations';

interface TunerGaugeProps {
  cents: number;
  note: string;
  octave: number;
  clarity: number;
  isTuned: boolean;
}

export function TunerGauge({ cents, note, octave, clarity, isTuned }: TunerGaugeProps) {
  const [mounted, setMounted] = useState(false);
  const { language } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Clamp cents for visual display (-50 to 50)
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const position = ((clampedCents + 50) / 100) * 100;
  
  const isActive = clarity > 0.5;
  const tunedColor = 'oklch(82% 0.16 150)'; // Vivid Mint
  const activeColor = 'oklch(75% 0.14 320)'; // Vibrant Magenta
  const neutralColor = 'oklch(98% 0.01 270)'; // Pristine
  const mutedColor = 'oklch(30% 0.08 270)'; // Dark Track

  const showNote = note !== '-';

  return (
    <div className="w-full flex flex-col items-center gap-10 py-2 overflow-hidden">
      {/* Note Display Area - Fixed dimensions to prevent layout shifts */}
      <div className="relative flex flex-col items-center justify-center h-40 w-full">
        <div 
          className={`text-[clamp(5rem,20vw,8rem)] font-black tracking-tighter leading-none transition-all duration-500 ease-soft-overshoot flex items-baseline justify-center select-none ${
            isTuned ? 'scale-110' : 'scale-100'
          }`}
          style={{ 
            color: isTuned ? tunedColor : isActive ? neutralColor : mutedColor,
            textShadow: isTuned 
              ? `0 0 80px oklch(82% 0.16 150 / 0.4)` 
              : isActive 
                ? `0 0 40px ${activeColor}20` 
                : 'none'
          }}
        >
          {showNote ? (
            <>
              <span className="min-w-[1.2em] text-center">
                {note}
              </span>
              <span className="text-[0.4em] font-black ml-1 opacity-30 tabular-nums w-8">
                {octave}
              </span>
            </>
          ) : (
            <span className="text-center opacity-20">
              –
            </span>
          )}
        </div>
        
        {/* Status Label */}
        <div className="absolute -bottom-4 left-0 right-0 flex justify-center h-4 overflow-hidden pointer-events-none">
          <span 
            className={`text-[11px] font-black uppercase tracking-[0.5em] transition-all duration-700 ease-soft-overshoot ${
              isTuned ? 'translate-y-0 opacity-100 text-accent-mint' : 'translate-y-full opacity-0 text-foreground-muted'
            }`}
          >
            {t.perfectPitch}
          </span>
        </div>
      </div>

      {/* Linear Gauge Container */}
      <div className="w-full max-w-sm space-y-10 mt-4">
        <div className="relative h-16 flex items-center">
          {/* Background Track */}
          <div className="absolute inset-0 h-[2px] bg-indicator-track top-1/2 -translate-y-1/2 w-full rounded-full overflow-hidden">
            {/* Gloss effect on track */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground-primary/5 to-transparent animate-shimmer" />
            {/* Center target indicator background */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-foreground-muted/30 -translate-x-1/2" />
          </div>

          {/* Scale Markers */}
          <div className="absolute inset-0 flex justify-between items-center px-0 text-[10px] font-black text-foreground-muted/60 font-mono tracking-tighter pointer-events-none">
            <span>-50</span>
            <span className="opacity-0">0</span>
            <span>+50</span>
          </div>

          {/* Guidance Labels - Fixed positions */}
          <div className="absolute -top-8 inset-x-0 flex justify-between text-[11px] font-black uppercase tracking-[0.3em] pointer-events-none">
            <span className={`transition-all duration-300 w-20 text-left ${cents < -3.5 ? 'text-accent-magenta scale-110' : 'text-foreground-muted/40 opacity-50'}`}>{t.tighten}</span>
            <span className={`transition-all duration-300 w-20 text-right ${cents > 3.5 ? 'text-accent-magenta scale-110' : 'text-foreground-muted/40 opacity-50'}`}>{t.loosen}</span>
          </div>

          {/* Dynamic Marker (The "Needle") */}
          <div 
            className="absolute top-0 bottom-0 w-[3px] transition-all duration-75 ease-out z-10 rounded-full"
            style={{ 
              left: `${mounted ? position : 50}%`,
              opacity: isActive ? 1 : 0.1,
              backgroundColor: isTuned ? tunedColor : isActive ? activeColor : neutralColor,
              boxShadow: isTuned 
                ? `0 0 30px ${tunedColor}` 
                : isActive 
                  ? `0 0 20px ${activeColor}` 
                  : `0 0 10px ${neutralColor}40`,
              transform: `translateX(-50%) ${isActive ? 'scaleY(1.1)' : 'scaleY(0.4)'}`
            }}
          >
            {/* Inner glow for needle */}
            <div className="absolute inset-0 blur-[2px] bg-white/40 rounded-full" />
          </div>

          {/* Fixed Center Target "Crosshair" */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className={`w-[2px] h-10 rounded-full transition-all duration-500 ease-soft-overshoot ${
              isTuned ? 'bg-accent-mint shadow-[0_0_20px_oklch(82%_0.16_150)] scale-y-125' : 'bg-foreground-muted/50 scale-y-100'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
}
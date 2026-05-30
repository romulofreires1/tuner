'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TunerGauge } from '@/components/tuner/TunerGauge';
import { MetronomeDisplay } from '@/components/metronome/MetronomeDisplay';
import { BpmControl } from '@/components/metronome/BpmControl';
import { PlayButton } from '@/components/metronome/PlayButton';
import { BeatIndicator } from '@/components/metronome/BeatIndicator';
import { TimeSignatureSelector } from '@/components/metronome/TimeSignatureSelector';
import { useAppStore } from '@/stores/useAppStore';
import { useTuner } from '@/hooks/useTuner';
import { useAudioPermissions } from '@/hooks/useAudioPermissions';
import { metronomeEngine } from '@/lib/audio/MetronomeEngine';
import { translations } from '@/lib/translations';

type Tab = 'tuner' | 'metronome';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('tuner');
  const { tuner, metronome, updateMetronome, language, setLanguage } = useAppStore();
  const { startTuner, stopTuner } = useTuner();
  const { permissionStatus, errorMessage, requestPermission } = useAudioPermissions();
  
  const t = translations[language] as any;

  const handleStartTuner = useCallback(async () => {
    const stream = await requestPermission();
    if (stream) {
      startTuner();
    }
  }, [requestPermission, startTuner]);

  useEffect(() => {
    if (activeTab === 'tuner') {
      handleStartTuner();
    } else {
      stopTuner();
    }

    if (activeTab !== 'metronome' && metronome.isPlaying) {
      metronomeEngine.stop();
    }
  }, [activeTab, handleStartTuner, stopTuner, metronome.isPlaying]);

  const handleToggleMetronome = () => {
    if (metronome.isPlaying) {
      metronomeEngine.stop();
      updateMetronome(undefined, false);
    } else {
      metronomeEngine.start();
      updateMetronome(undefined, true);
    }
  };

  const handleBpmChange = (bpm: number) => {
    metronomeEngine.setBpm(bpm);
    updateMetronome(bpm);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  return (
    <main className="min-h-screen bg-background-primary text-foreground-primary font-sans selection:bg-accent-mint/30 overflow-x-hidden">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col min-h-screen">
        <header className="flex flex-col items-center mb-8 sm:mb-12">
          <div className="w-full flex justify-between items-center mb-8 sm:mb-10">
            <img src="/logo-full.svg" alt="TUNER Logo" className="h-7 sm:h-8 w-auto" />
            <button 
              onClick={toggleLanguage}
              className="px-3 sm:px-4 py-1.5 rounded-full border border-indicator-border text-[10px] sm:text-[11px] font-black tracking-[0.2em] hover:bg-foreground-primary hover:text-background-primary transition-all duration-300 shadow-lg"
            >
              {language === 'pt' ? 'PORTUGUÊS' : 'ENGLISH'}
            </button>
          </div>
          
          <div className="flex bg-background-elevated p-1 rounded-full border border-indicator-border w-full shadow-2xl">
            <button
              onClick={() => setActiveTab('tuner')}
              className={`flex-1 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-black tracking-widest transition-all duration-300 ${
                activeTab === 'tuner'
                  ? 'bg-foreground-primary text-background-primary shadow-lg scale-[1.02]'
                  : 'text-foreground-muted hover:text-foreground-secondary'
              }`}
            >
              {t.tuner}
            </button>
            <button
              onClick={() => setActiveTab('metronome')}
              className={`flex-1 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-black tracking-widest transition-all duration-300 ${
                activeTab === 'metronome'
                  ? 'bg-foreground-primary text-background-primary shadow-lg scale-[1.02]'
                  : 'text-foreground-muted hover:text-foreground-secondary'
              }`}
            >
              {t.metronome}
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center">
          {activeTab === 'tuner' ? (
            <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section className="flex flex-col items-center justify-center min-h-[360px] sm:min-h-[400px]">
                {permissionStatus === 'granted' ? (
                  <div className="w-full relative bg-background-elevated rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-indicator-border overflow-hidden">
                    <TunerGauge
                      cents={tuner.cents}
                      note={tuner.note}
                      octave={tuner.octave}
                      clarity={tuner.clarity}
                      isTuned={tuner.isTuned}
                    />
                  </div>
                ) : permissionStatus === 'denied' || permissionStatus === 'error' ? (
                  <div className="flex flex-col items-center py-12 text-center px-4">
                    <p className="text-accent-magenta text-sm mb-10 font-bold tracking-wide leading-relaxed">
                      {errorMessage || t.microphoneError}
                    </p>
                    <button
                      onClick={handleStartTuner}
                      className="px-8 py-4 bg-foreground-primary text-background-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground-primary/10"
                    >
                      {t.tryAgain}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12">
                    <div className="w-12 h-12 border-4 border-foreground-primary/20 border-t-foreground-primary rounded-full animate-spin mb-8" />
                    <p className="text-foreground-secondary text-sm text-center max-w-[240px] font-bold tracking-wide leading-relaxed">
                      {t.playString}
                    </p>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section className="bg-background-elevated rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-indicator-border flex flex-col items-center gap-8 sm:gap-12">
                <div className="flex flex-col items-center gap-6 w-full">
                  <BeatIndicator />
                  <TimeSignatureSelector />
                </div>
                
                <div className="flex flex-col items-center">
                  <MetronomeDisplay />
                  <span className="text-[10px] font-black tracking-[0.4em] text-foreground-muted mt-2 uppercase">{t.bpm}</span>
                </div>
                
                <BpmControl onBpmChange={handleBpmChange} />
                
                <PlayButton onToggle={handleToggleMetronome} />
              </section>
            </div>
          )}
        </div>

        <footer className="mt-auto py-8 sm:py-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a 
              href="https://www.instagram.com/tuner.appsrom/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.2em] uppercase text-foreground-muted hover:text-foreground-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              Instagram
            </a>
            <span className="w-1 h-1 rounded-full bg-foreground-muted/30" />
            <a 
              href="https://buymeacoffee.com/romulofreil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground-muted hover:text-foreground-primary transition-colors"
            >
              Apoie o Projeto
            </a>
            <span className="w-1 h-1 rounded-full bg-foreground-muted/30 hidden sm:block" />
            <a 
              href="https://buymeacoffee.com/romulofreil" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-[#FFDD00] text-black rounded-full text-[9px] font-black uppercase tracking-wider hover:scale-105 transition-all shadow-lg"
            >
              Compre um café
            </a>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <img src="/logo-mark.svg" alt="" className="w-6 h-6 opacity-20 grayscale" />
            <p className="text-[9px] sm:text-[10px] font-black text-foreground-muted/50 tracking-[0.3em] sm:tracking-[0.5em] uppercase text-center">
              Precisão Profissional • Studio Grade
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

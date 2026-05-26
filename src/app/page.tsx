'use client';

import { useState } from 'react';
import { TunerGauge } from '@/components/tuner/TunerGauge';
import { StartButton } from '@/components/tuner/StartButton';
import { MetronomeDisplay } from '@/components/metronome/MetronomeDisplay';
import { BpmControl } from '@/components/metronome/BpmControl';
import { PlayButton } from '@/components/metronome/PlayButton';
import { BeatIndicator } from '@/components/metronome/BeatIndicator';
import { TimeSignatureSelector } from '@/components/metronome/TimeSignatureSelector';
import { useAppStore } from '@/stores/useAppStore';
import { useTuner } from '@/hooks/useTuner';
import { metronomeEngine } from '@/lib/audio/MetronomeEngine';

type Tab = 'tuner' | 'metronome';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('tuner');
  const [isTunerActive, setIsTunerActive] = useState(false);
  const { tuner, metronome, updateMetronome } = useAppStore();
  const { startTuner, stopTuner } = useTuner();

  const handleStartTuner = () => {
    setIsTunerActive(true);
    startTuner();
  };

  const handleStopTuner = () => {
    setIsTunerActive(false);
    stopTuner();
  };

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

  return (
    <main className="min-h-screen bg-background-primary text-foreground-primary font-sans selection:bg-accent-mint/30">
      <div className="max-w-md mx-auto px-6 py-12 flex flex-col min-h-screen">
        <header className="flex flex-col items-center mb-12">
          <img src="/logo-full.svg" alt="TUNER Logo" className="h-10 w-auto mb-10" />
          
          <div className="flex bg-background-elevated p-1 rounded-full border border-indicator-border w-full shadow-2xl">
            <button
              onClick={() => setActiveTab('tuner')}
              className={`flex-1 py-3 rounded-full text-xs font-black tracking-widest transition-all duration-300 ${
                activeTab === 'tuner'
                  ? 'bg-foreground-primary text-background-primary shadow-lg scale-[1.02]'
                  : 'text-foreground-muted hover:text-foreground-secondary'
              }`}
            >
              AFINADOR
            </button>
            <button
              onClick={() => setActiveTab('metronome')}
              className={`flex-1 py-3 rounded-full text-xs font-black tracking-widest transition-all duration-300 ${
                activeTab === 'metronome'
                  ? 'bg-foreground-primary text-background-primary shadow-lg scale-[1.02]'
                  : 'text-foreground-muted hover:text-foreground-secondary'
              }`}
            >
              METRÔNOMO
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center">
          {activeTab === 'tuner' ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section className="flex flex-col items-center justify-center min-h-[360px]">
                {isTunerActive ? (
                  <div className="w-full relative bg-background-elevated rounded-[2.5rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-indicator-border">
                    <button
                      onClick={handleStopTuner}
                      className="absolute top-6 right-6 p-2 text-foreground-muted hover:text-accent-magenta transition-colors"
                      title="Parar afinador"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                    <TunerGauge
                      cents={tuner.cents}
                      note={tuner.note}
                      octave={tuner.octave}
                      clarity={tuner.clarity}
                      isTuned={tuner.isTuned}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12">
                    <p className="text-foreground-secondary text-sm mb-10 text-center max-w-[240px] font-bold tracking-wide leading-relaxed">
                      Toque uma corda para começar a afinar seu instrumento
                    </p>
                    <StartButton onStart={handleStartTuner} />
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section className="bg-background-elevated rounded-[2.5rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-indicator-border flex flex-col items-center gap-12">
                <div className="flex flex-col items-center gap-6 w-full">
                  <BeatIndicator />
                  <TimeSignatureSelector />
                </div>
                
                <div className="flex flex-col items-center">
                  <MetronomeDisplay />
                  <span className="text-[10px] font-black tracking-[0.4em] text-foreground-muted mt-2 uppercase">BPM</span>
                </div>
                
                <BpmControl onBpmChange={handleBpmChange} />
                
                <PlayButton onToggle={handleToggleMetronome} />
              </section>
            </div>
          )}
        </div>

        <footer className="mt-auto py-12 flex flex-col items-center gap-4">
          <img src="/logo-mark.svg" alt="" className="w-6 h-6 opacity-20 grayscale" />
          <p className="text-[10px] font-black text-foreground-muted/50 tracking-[0.5em] uppercase">
            Precisão Profissional • Studio Grade
          </p>
        </footer>
      </div>
    </main>
  );
}
'use client';

import { useAudioPermissions } from '@/hooks/useAudioPermissions';

interface StartButtonProps {
  onStart: () => void;
}

export function StartButton({ onStart }: StartButtonProps) {
  const { permissionStatus, errorMessage, requestPermission } = useAudioPermissions();

  const handleStart = async () => {
    const stream = await requestPermission();
    if (stream) {
      onStart();
    }
  };

  if (permissionStatus === 'denied' || permissionStatus === 'error') {
    return (
      <div className="flex flex-col items-center gap-6 max-w-xs text-center">
        <p className="text-sm text-accent-magenta font-black leading-relaxed drop-shadow-sm">{errorMessage}</p>
        <button
          onClick={handleStart}
          className="px-8 py-4 bg-foreground-primary text-background-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground-primary/10"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={permissionStatus === 'requesting'}
      className="group relative flex items-center justify-center w-36 h-36"
    >
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-accent-magenta/30 rounded-full blur-[40px] group-hover:bg-accent-magenta/50 transition-all duration-700 animate-pulse" />
      
      {/* Main Button Body */}
      <div className="relative z-10 w-full h-full bg-gradient-to-br from-accent-magenta to-accent-magenta/80 text-foreground-primary rounded-full flex flex-col items-center justify-center gap-2 shadow-[0_20px_40px_-10px_oklch(75%_0.14_320_/_0.5)] group-hover:scale-110 active:scale-95 transition-all duration-500 border-4 border-foreground-primary/20">
        {permissionStatus === 'requesting' ? (
          <div className="w-8 h-8 border-4 border-foreground-primary/20 border-t-foreground-primary rounded-full animate-spin" />
        ) : (
          <>
            <div className="bg-background-primary/20 p-3 rounded-full mb-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="28" height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Ativar</span>
          </>
        )}
      </div>
    </button>
  );
}
import { useState, useCallback } from 'react';
import { audioEngine } from '@/lib/audio/AudioEngine';
import { useAppStore } from '@/stores/useAppStore';
import { translations } from '@/lib/translations';

export type PermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

interface UseAudioPermissionsReturn {
  permissionStatus: PermissionStatus;
  errorMessage: string | null;
  requestPermission: () => Promise<MediaStream | null>;
  resetPermission: () => void;
}

export function useAudioPermissions(): UseAudioPermissionsReturn {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { language } = useAppStore();
  const t = translations[language];

  const requestPermission = useCallback(async (): Promise<MediaStream | null> => {
    setPermissionStatus('requesting');
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      await audioEngine.connectStream(stream);
      await audioEngine.resume();
      setPermissionStatus('granted');
      return stream;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
        setErrorMessage(t.microphoneDenied);
        setPermissionStatus('denied');
      } else if (errorMsg.includes('NotFoundError')) {
        setErrorMessage(t.microphoneNotFound);
        setPermissionStatus('error');
      } else {
        setErrorMessage(`${t.microphoneError}: ${errorMsg}`);
        setPermissionStatus('error');
      }
      return null;
    }
  }, [t]);

  const resetPermission = useCallback(() => {
    setPermissionStatus('idle');
    setErrorMessage(null);
  }, []);

  return {
    permissionStatus,
    errorMessage,
    requestPermission,
    resetPermission,
  };
}
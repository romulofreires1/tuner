import { useState, useCallback } from 'react';
import { audioEngine } from '@/lib/audio/AudioEngine';

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
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
        setErrorMessage('Permissão do microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador.');
        setPermissionStatus('denied');
      } else if (errorMsg.includes('NotFoundError')) {
        setErrorMessage('Nenhum microfone encontrado. Verifique se o dispositivo de áudio está conectado.');
        setPermissionStatus('error');
      } else {
        setErrorMessage(`Erro ao acessar o microfone: ${errorMsg}`);
        setPermissionStatus('error');
      }
      return null;
    }
  }, []);

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
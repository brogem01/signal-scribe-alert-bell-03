
import { useSignalState } from './useSignalState';
import { useAntidelayManager } from './useAntidelayManager';
import { useSaveTsManager } from './useSaveTsManager';

export const useSignalTracker = () => {
  const {
    signalsText,
    setSignalsText,
    savedSignals,
    antidelaySeconds,
    setAntidelaySeconds,
    saveButtonPressed,
    handleSaveSignals,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleClear
  } = useSignalState();

  const {
    showAntidelayDialog,
    antidelayInput,
    setAntidelayInput,
    handleAntidelaySubmit,
    handleAntidelayCancel
  } = useAntidelayManager(savedSignals, antidelaySeconds, setAntidelaySeconds);

  const {
    showSaveTsDialog,
    antidelayInput: saveTsAntidelayInput,
    setAntidelayInput: setSaveTsAntidelayInput,
    saveTsButtonPressed,
    handleSaveTsMouseDown,
    handleSaveTsMouseUp,
    handleSaveTsMouseLeave,
    handleSaveTsSubmit: originalHandleSaveTsSubmit,
    handleSaveTsCancel
  } = useSaveTsManager();

  // Wrapper functions to pass signalsText to handlers
  const handleSaveTsMouseDownWithSignals = (e: React.MouseEvent | React.TouchEvent) => {
    handleSaveTsMouseDown(e);
  };

  const handleSaveTsMouseUpWithSignals = (e: React.MouseEvent | React.TouchEvent) => {
    handleSaveTsMouseUp(e, signalsText);
  };


  const handleRingOff = () => {
    // Stop all media playback on the device
    try {
      // Get all audio and video elements and pause them
      const audioElements = document.querySelectorAll('audio');
      const videoElements = document.querySelectorAll('video');
      
      audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      
      videoElements.forEach(video => {
        video.pause();
        video.currentTime = 0;
      });

      // Use MediaSession API to handle system-level media controls
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }

      // For Capacitor apps, try to use native functionality
      if ((window as any).Capacitor && (window as any).Capacitor.isNativePlatform()) {
        // Send a broadcast intent to pause all media (Android specific)
        if ((window as any).Capacitor.getPlatform() === 'android') {
          try {
            // This will attempt to send a media button press event
            const audioManager = {
              sendMediaButtonEvent: () => {
                // Simulate media pause button press
                const event = new KeyboardEvent('keydown', {
                  key: 'MediaPause',
                  code: 'MediaPause'
                });
                document.dispatchEvent(event);
              }
            };
            audioManager.sendMediaButtonEvent();
          } catch (error) {
            console.log('Native media control not available:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error stopping media playback:', error);
    }
  };

  return {
    signalsText,
    setSignalsText,
    saveButtonPressed,
    saveTsButtonPressed,
    showAntidelayDialog,
    antidelayInput,
    setAntidelayInput,
    antidelaySeconds,
    showSaveTsDialog,
    saveTsAntidelayInput,
    setSaveTsAntidelayInput,
    handleSaveSignals,
    handleSaveTsMouseDown: handleSaveTsMouseDownWithSignals,
    handleSaveTsMouseUp: handleSaveTsMouseUpWithSignals,
    handleSaveTsMouseLeave,
    handleSaveTsSubmit: originalHandleSaveTsSubmit,
    handleSaveTsCancel,
    handleAntidelaySubmit,
    handleAntidelayCancel,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleClear,
    handleRingOff
  };
};


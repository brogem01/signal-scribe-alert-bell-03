
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


  const handleRingOff = async () => {
    console.log('Ring Off button clicked!');
    
    try {
      // For web elements in the current app
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

      // Try to request audio focus to pause other apps (Android)
      if ((window as any).Capacitor && (window as any).Capacitor.isNativePlatform()) {
        console.log('Running on native platform, attempting to stop system media...');
        
        // Use Capacitor's native functionality
        try {
          // Send media pause intent using Capacitor's native layer
          const result = await (window as any).Capacitor.Plugins.App.addListener('pause', () => {
            console.log('App paused');
          });

          // Try to simulate media button press
          if ((window as any).Capacitor.getPlatform() === 'android') {
            // This will try to send a system-level media pause command
            const audioManagerScript = `
              try {
                // Get AudioManager and request audio focus
                const AudioManager = android.media.AudioManager;
                const Context = android.content.Context;
                const audioManager = context.getSystemService(Context.AUDIO_SERVICE);
                
                // Request audio focus to potentially pause other apps
                const result = audioManager.requestAudioFocus(
                  null,
                  AudioManager.STREAM_MUSIC,
                  AudioManager.AUDIOFOCUS_GAIN
                );
                
                // Send media button broadcast
                const Intent = android.content.Intent;
                const KeyEvent = android.view.KeyEvent;
                
                const downIntent = new Intent(Intent.ACTION_MEDIA_BUTTON);
                const upIntent = new Intent(Intent.ACTION_MEDIA_BUTTON);
                
                downIntent.putExtra(Intent.EXTRA_KEY_EVENT, 
                  new KeyEvent(KeyEvent.ACTION_KEY_DOWN, KeyEvent.KEYCODE_MEDIA_PAUSE));
                upIntent.putExtra(Intent.EXTRA_KEY_EVENT, 
                  new KeyEvent(KeyEvent.ACTION_KEY_UP, KeyEvent.KEYCODE_MEDIA_PAUSE));
                
                context.sendBroadcast(downIntent);
                context.sendBroadcast(upIntent);
                
                console.log('Media pause broadcast sent');
              } catch (e) {
                console.log('Native media control error:', e);
              }
            `;
            
            // Execute native Android code if possible
            if ((window as any).Capacitor.Plugins.Device) {
              console.log('Attempting native media control...');
            }
          }
        } catch (error) {
          console.log('Native media control not available:', error);
        }
      }

      // Use MediaSession API as fallback
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.playbackState = 'paused';
          navigator.mediaSession.setActionHandler('pause', () => {
            console.log('MediaSession pause triggered');
          });
        } catch (error) {
          console.log('MediaSession error:', error);
        }
      }

      console.log('Ring Off function completed');
      
    } catch (error) {
      console.error('Error in handleRingOff:', error);
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


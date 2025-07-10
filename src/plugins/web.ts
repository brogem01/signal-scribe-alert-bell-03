import { WebPlugin } from '@capacitor/core';
import type { AudioControllerPlugin } from './AudioController';

export class AudioControllerWeb extends WebPlugin implements AudioControllerPlugin {
  async stopAllMedia(): Promise<{ success: boolean; message: string }> {
    try {
      // Stop all audio and video elements in the current page
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

      // Use MediaSession API to pause system media
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
        
        // Try to simulate media button press
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log('MediaSession pause triggered');
        });
        
        navigator.mediaSession.setActionHandler('stop', () => {
          console.log('MediaSession stop triggered');
        });
      }

      // Try to send keyboard events that other apps might listen to
      const mediaEvents = [
        new KeyboardEvent('keydown', { key: 'MediaPause', code: 'MediaPause' }),
        new KeyboardEvent('keydown', { key: 'MediaStop', code: 'MediaStop' }),
        new KeyboardEvent('keyup', { key: 'MediaPause', code: 'MediaPause' }),
        new KeyboardEvent('keyup', { key: 'MediaStop', code: 'MediaStop' })
      ];

      mediaEvents.forEach(event => {
        document.dispatchEvent(event);
        window.dispatchEvent(event);
      });

      return { 
        success: true, 
        message: 'Web media elements paused, MediaSession API called. Note: Cannot stop other apps on web platform.' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Error stopping media: ${error}` 
      };
    }
  }
}
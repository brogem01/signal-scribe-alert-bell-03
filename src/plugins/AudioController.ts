import { registerPlugin } from '@capacitor/core';

export interface AudioControllerPlugin {
  stopAllMedia(): Promise<{ success: boolean; message: string }>;
}

const AudioController = registerPlugin<AudioControllerPlugin>('AudioController', {
  web: () => import('./web').then(m => new m.AudioControllerWeb()),
});

export default AudioController;
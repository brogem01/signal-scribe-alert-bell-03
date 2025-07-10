package app.lovable.signal_scribe_alert_bell_05;

import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.view.KeyEvent;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AudioController")
public class AudioControllerPlugin extends Plugin {

    @PluginMethod
    public void stopAllMedia(PluginCall call) {
        try {
            Context context = getContext();
            AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            
            // Request audio focus to potentially pause other apps
            int result = audioManager.requestAudioFocus(
                null, // OnAudioFocusChangeListener
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN
            );
            
            // Send media button broadcast to pause other media players
            sendMediaButtonEvent(context, KeyEvent.KEYCODE_MEDIA_PAUSE);
            sendMediaButtonEvent(context, KeyEvent.KEYCODE_MEDIA_STOP);
            
            // Release audio focus immediately since we don't need it
            audioManager.abandonAudioFocus(null);
            
            String message = "Audio focus requested and media pause broadcast sent";
            if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                message += " (Audio focus granted)";
            } else {
                message += " (Audio focus denied)";
            }
            
            call.resolve(new com.getcapacitor.JSObject()
                .put("success", true)
                .put("message", message));
                
        } catch (Exception e) {
            call.resolve(new com.getcapacitor.JSObject()
                .put("success", false)
                .put("message", "Error: " + e.getMessage()));
        }
    }
    
    private void sendMediaButtonEvent(Context context, int keyCode) {
        try {
            Intent downIntent = new Intent(Intent.ACTION_MEDIA_BUTTON);
            KeyEvent downEvent = new KeyEvent(KeyEvent.ACTION_KEY_DOWN, keyCode);
            downIntent.putExtra(Intent.EXTRA_KEY_EVENT, downEvent);
            context.sendBroadcast(downIntent);
            
            Intent upIntent = new Intent(Intent.ACTION_MEDIA_BUTTON);
            KeyEvent upEvent = new KeyEvent(KeyEvent.ACTION_KEY_UP, keyCode);
            upIntent.putExtra(Intent.EXTRA_KEY_EVENT, upEvent);
            context.sendBroadcast(upIntent);
        } catch (Exception e) {
            android.util.Log.e("AudioController", "Error sending media button event", e);
        }
    }
}
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import { DIR } from '../utils/storage';
import { SPEEDS } from '../theme';
import type { Note } from '../types';

export type Player = ReturnType<typeof usePlayer>;

// Hook state and refs for active Audio.Sound instance, selected note ID, playback telemetry, and speed multiplier
export default function usePlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pb, setPb] = useState({ playing: false, pos: 0, dur: 0 });
  const [rate, setRateState] = useState(1);

  // Release the active Audio.Sound instance when the hook unmounts to prevent memory or audio leaks
   useEffect(() => () => { soundRef.current?.unloadAsync(); }, []);

   // Stop playback, unload the active sound instance, and reset active note and progress state
    const stop = async () => {
    const s = soundRef.current;
    // Clear ref first so concurrent or unmount cleanup does not double-unload
    soundRef.current = null;
    if (s) { try { await s.unloadAsync(); } catch {} }
    setActiveId(null); setPb({ playing: false, pos: 0, dur: 0 });
  };

  // Toggle play/pause on the active note (restarting from 0 if at the end) or load and play a new note
  const play = async (note: Note) => {
    if (activeId === note.id && soundRef.current) {
      const st = await soundRef.current.getStatusAsync();
      if (st.isLoaded) {
        // Restart from the beginning if the user taps play right after completion
        if (st.positionMillis >= (st.durationMillis || 0) - 50) await soundRef.current.setPositionAsync(0);
        return st.isPlaying ? soundRef.current.pauseAsync() : soundRef.current.playAsync();
      }
    }
    // Unload any previously loaded note before opening a new audio file
    await stop();
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: DIR + note.file },
        { shouldPlay: true, rate, shouldCorrectPitch: true, progressUpdateIntervalMillis: 100 },
        (st) => {
          if (!st.isLoaded) return;
          setPb({ playing: st.isPlaying, pos: st.positionMillis, dur: st.durationMillis || note.duration });
          // Reset playhead to start when playback finishes without unloading the sound instance
          if (st.didJustFinish) { sound.pauseAsync(); sound.setPositionAsync(0); }
        });
      soundRef.current = sound; setActiveId(note.id);
    } catch {
      Alert.alert('Cannot play this note', 'The audio file could not be opened.');
    }
  };
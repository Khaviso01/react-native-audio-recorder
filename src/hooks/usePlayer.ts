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

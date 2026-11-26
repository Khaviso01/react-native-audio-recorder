import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as store from '../utils/storage';
import { notify } from '../utils/dialog';
import { SPEEDS } from '../theme';
import type { Note } from '../types';

export type Player = ReturnType<typeof usePlayer>;

export default function usePlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pb, setPb] = useState({ playing: false, pos: 0, dur: 0 });
  const [rate, setRateState] = useState(1);

  useEffect(() => () => { soundRef.current?.unloadAsync(); }, []);

  const stop = async () => {
    const s = soundRef.current; soundRef.current = null;
    if (s) { try { await s.unloadAsync(); } catch {} }
    setActiveId(null); setPb({ playing: false, pos: 0, dur: 0 });
  };

  const play = async (note: Note) => {
    if (activeId === note.id && soundRef.current) {
      const st = await soundRef.current.getStatusAsync();
      if (st.isLoaded) {
        if (st.positionMillis >= (st.durationMillis || 0) - 50) await soundRef.current.setPositionAsync(0);
        return st.isPlaying ? soundRef.current.pauseAsync() : soundRef.current.playAsync();
      }
    }
    await stop();
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const uri = await store.getUri(note);
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, rate, shouldCorrectPitch: true, progressUpdateIntervalMillis: 100 },
        (st) => {
          if (!st.isLoaded) return;
          setPb({ playing: st.isPlaying, pos: st.positionMillis, dur: st.durationMillis && Number.isFinite(st.durationMillis) ? st.durationMillis : note.duration });
          if (st.didJustFinish) { sound.pauseAsync(); sound.setPositionAsync(0); }
        });
      soundRef.current = sound; setActiveId(note.id);
    } catch {
      notify('Cannot play this note', 'The audio file could not be opened.');
    }
  };

  const seek = (ms: number) => soundRef.current?.setPositionAsync(Math.max(0, Math.min(pb.dur, ms)));
  const setRate = (v: number) => { setRateState(v); soundRef.current?.setRateAsync(v, true); };
  const cycleRate = (): number => { const n = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length]; setRate(n); return n; };

  return { activeId, pb, rate, play, stop, seek, setRate, cycleRate };
}
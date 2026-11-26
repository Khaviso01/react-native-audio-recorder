import { useEffect, useRef, useState } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as store from '../utils/storage';
import { notify } from '../utils/dialog';
import { SPEEDS } from '../theme';
import type { Note } from '../types';

export type Player = ReturnType<typeof usePlayer>;

// Handles playback of one voice note at a time (play, pause, seek, speed).
export default function usePlayer() {
  const playerRef = useRef<AudioPlayer | null>(null);
  const subRef = useRef<{ remove: () => void } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pb, setPb] = useState({ playing: false, pos: 0, dur: 0 });
  const [rate, setRateState] = useState(1);

  // Release the player when the screen closes
  useEffect(() => () => { release(); }, []);

  // Stops listening to the current player and frees its memory
  const release = () => {
    subRef.current?.remove(); subRef.current = null;
    const p = playerRef.current; playerRef.current = null;
    if (p) { try { p.pause(); p.remove(); } catch {} }
  };

  const stop = async () => {
    release();
    setActiveId(null); setPb({ playing: false, pos: 0, dur: 0 });
  };

  const play = async (note: Note) => {
    // Same note tapped again: toggle pause/resume
    const current = playerRef.current;
    if (activeId === note.id && current) {
      if (current.playing) { current.pause(); return; }
      if (current.duration > 0 && current.currentTime >= current.duration - 0.05) await current.seekTo(0);
      current.play();
      return;
    }
    // Different note: stop the old one and start the new one
    await stop();
    try {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const uri = await store.getUri(note);
      const player = createAudioPlayer({ uri }, { updateInterval: 100 });
      player.setPlaybackRate(rate);
      subRef.current = player.addListener('playbackStatusUpdate', (st) => {
        const durMs = st.duration && Number.isFinite(st.duration) && st.duration > 0 ? st.duration * 1000 : note.duration;
        setPb({ playing: st.playing, pos: st.currentTime * 1000, dur: durMs });
        // expo-audio stays at the end when finished, so rewind it
        if (st.didJustFinish) { player.pause(); player.seekTo(0); }
      });
      playerRef.current = player; setActiveId(note.id);
      player.play();
    } catch {
      notify('Cannot play this note', 'The audio file could not be opened.');
    }
  };

  const seek = (ms: number) => {
    const clamped = Math.max(0, Math.min(pb.dur, ms));
    playerRef.current?.seekTo(clamped / 1000);
  };
  const setRate = (v: number) => { setRateState(v); playerRef.current?.setPlaybackRate(v); };
  const cycleRate = (): number => { const n = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length]; setRate(n); return n; };

  return { activeId, pb, rate, play, stop, seek, setRate, cycleRate };
}
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenTop from '../components/ScreenTop';
import Waveform from '../components/Waveform';
import { C, F } from '../theme';
import { fmt } from '../utils/format';
import type { Quality, RecordingResult } from '../types';

// Props for RecordingScreen: target audio quality, cancel handler, and save callback with recording result
interface Props { quality: Quality; onCancel: () => void; onSave: (r: RecordingResult) => void }

// RecordingScreen component managing live audio capture, elapsed duration
export default function RecordingScreen({ quality, onCancel, onSave }: Props) {
  const insets = useSafeAreaInsets();
  // Refs keep recording instance and elapsed milliseconds accessible across async callbacks and cleanup
  const recRef = useRef<Audio.Recording | null>(null);
  const msRef = useRef<number>(0);
  // UI state for elapsed time (ms), pause toggle, and normalized waveform bar heights
  const [ms, setMs] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(41).fill(0.04));

  // // Configure iOS audio session, prepare recording with selected quality and metering, and stream live waveform levels
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const preset = quality === 'high' ? Audio.RecordingOptionsPresets.HIGH_QUALITY : Audio.RecordingOptionsPresets.LOW_QUALITY;
        const rec = new Audio.Recording();
        // Enable metering so status callbacks report decibel levels for the waveform
        await rec.prepareToRecordAsync({ ...preset, isMeteringEnabled: true });
        rec.setProgressUpdateInterval(90);
        rec.setOnRecordingStatusUpdate((st) => {
          if (dead) return;
          msRef.current = st.durationMillis; setMs(st.durationMillis);
          // Normalize dB metering (-55 to 0 dBFS) into a clamped 0.04..1.0 bar height and shift the window
          if (st.isRecording && typeof st.metering === 'number') {
            const lvl = Math.max(0.04, Math.min(1, (st.metering + 55) / 55));
            setBars((b) => [...b.slice(1), lvl]);
          }
        });
        recRef.current = rec;
        if (dead) { await rec.stopAndUnloadAsync().catch(() => {}); return; }
        await rec.startAsync();
      } catch {
        Alert.alert('Recording failed', 'Could not start the microphone.');
        onCancel();
      }
    })();
    return () => { dead = true; recRef.current?.stopAndUnloadAsync().catch(() => {}); };
  }, []);

  // Resume or pause the active recording session and update UI state
  const toggle = async () => {
    const r = recRef.current; if (!r) return;
    if (paused) { await r.startAsync(); setPaused(false); } else { await r.pauseAsync(); setPaused(true); }
  };

  // Finalize recording, restore playback audio mode, read output URI, and pass result to onSave
  const save = async () => {
    const r = recRef.current; if (!r) return;
    // Clear ref early so unmount cleanup does not double-unload the recording
    recRef.current = null;
    const st = await r.getStatusAsync();
    await r.stopAndUnloadAsync();
    // Switch iOS audio mode back to playback-only after recording finishes
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
    const uri = r.getURI();
    if (!uri) return onCancel();
    onSave({ uri, duration: st.durationMillis || msRef.current });
  };
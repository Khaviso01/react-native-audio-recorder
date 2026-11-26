import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenTop from '../components/ScreenTop';
import Waveform from '../components/Waveform';
import { C, F } from '../theme';
import { fmt } from '../utils/format';
import { notify } from '../utils/dialog';
import { discardTemp } from '../utils/storage';
import type { Quality, RecordingResult } from '../types';

interface Props { quality: Quality; onCancel: () => void; onSave: (r: RecordingResult) => void }

export default function RecordingScreen({ quality, onCancel, onSave }: Props) {
  const insets = useSafeAreaInsets();
  // The recorder uses the chosen quality preset, with metering on so we can draw the waveform
  const preset = quality === 'high' ? RecordingPresets.HIGH_QUALITY : RecordingPresets.LOW_QUALITY;
  const recorder = useAudioRecorder({ ...preset, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 100); // refreshes ~10 times a second
  const [paused, setPaused] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(41).fill(0.04));
  const msRef = useRef<number>(0);
  const ms = state.durationMillis;
  msRef.current = ms;

  // Start recording as soon as the screen opens
  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
      } catch {
        notify('Recording failed', 'Could not start the microphone.');
        onCancel();
      }
    })();
  }, []);

  // Turn the microphone loudness (dB) into a bar height and push it into the waveform
  useEffect(() => {
    if (!state.isRecording || typeof state.metering !== 'number') return;
    const lvl = Math.max(0.04, Math.min(1, (state.metering + 55) / 55));
    setBars((b) => [...b.slice(1), lvl]);
  }, [state.metering, state.isRecording]);

  const toggle = () => {
    if (paused) { recorder.record(); setPaused(false); } else { recorder.pause(); setPaused(true); }
  };
  const save = async () => {
    const duration = msRef.current;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    const uri = recorder.uri;
    if (!uri) return onCancel();
    onSave({ uri, duration });
  };
  const discard = async () => {
    try { await recorder.stop(); const u = recorder.uri; if (u) await discardTemp(u); } catch {}
    await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    onCancel();
  };

  return (
    <LinearGradient colors={[C.deep, C.blue]} style={[s.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }]}>
      <StatusBar style="light" />
      <ScreenTop light title="Recording" left={{ onPress: discard, icon: <Ionicons name="chevron-back" size={26} color="#fff" /> }} />
      <Text style={s.msg}>{paused ? 'Paused.\nResume when you are ready.' : 'You are now recording.\nEvery word matters!'}</Text>
      <Waveform bars={bars} />
      <Text style={s.timer}>{fmt(ms, true)}</Text>
      <View style={s.btns}>
        <View style={s.col}>
          <Pressable onPress={toggle} style={s.sm}><Ionicons name={paused ? 'mic' : 'pause'} size={24} color="#fff" /></Pressable>
          <Text style={s.lbl}>{paused ? 'Resume' : 'Pause'}</Text>
        </View>
        <View style={s.col}>
          <Pressable onPress={save} style={s.big}><Ionicons name="checkmark" size={44} color={C.deep} /></Pressable>
          <Text style={s.lbl}>Save</Text>
        </View>
        <View style={s.col}>
          <Pressable onPress={discard} style={s.sm}><Ionicons name="close" size={26} color="#fff" /></Pressable>
          <Text style={s.lbl}>Discard</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 4 },
  msg: { fontFamily: F.r, fontSize: 22, lineHeight: 32, color: '#fff', textAlign: 'center', marginTop: 40 },
  timer: { fontFamily: F.r, fontSize: 52, color: '#fff', textAlign: 'center', marginTop: 50, letterSpacing: 1 },
  btns: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 'auto', paddingHorizontal: 20 },
  col: { alignItems: 'center', width: 90, gap: 10 },
  sm: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(27,68,104,0.55)', alignItems: 'center', justifyContent: 'center' },
  big: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  lbl: { fontFamily: F.m, fontSize: 12, letterSpacing: 1, color: '#fff', textTransform: 'uppercase' },
});
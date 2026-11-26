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
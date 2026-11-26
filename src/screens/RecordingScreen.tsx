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
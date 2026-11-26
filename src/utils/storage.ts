import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import type { Note, RecordingResult, Settings } from '../types';

// / Directory inside the app's sandboxed document folder where saved audio recordings reside
export const DIR = FileSystem.documentDirectory + 'recordings/';
const KEY = 'voice-journal:notes:v1';
const KEY_SET = 'voice-journal:settings:v1';
export const DEFAULT_SETTINGS: Settings = { quality: 'high', speed: 1 };
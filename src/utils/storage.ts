import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import type { Note, RecordingResult, Settings } from '../types';

// / Directory inside the app's sandboxed document folder where saved audio recordings reside
export const DIR = FileSystem.documentDirectory + 'recordings/';
const KEY = 'voice-journal:notes:v1';
const KEY_SET = 'voice-journal:settings:v1';
export const DEFAULT_SETTINGS: Settings = { quality: 'high', speed: 1 };

// Ensure the recordings directory exists, load saved notes, and filter out entries whose audio files are missing
export async function loadNotes(): Promise<Note[]> {
  await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => {});
  const raw = await AsyncStorage.getItem(KEY);
  const list: Note[] = raw ? JSON.parse(raw) : [];
  const ok: Note[] = [];
  // Verify each note's audio file still exists on disk before returning it
  for (const n of list) if ((await FileSystem.getInfoAsync(DIR + n.file)).exists) ok.push(n);
  return ok;
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
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

// Persist the notes array to AsyncStorage
export const saveNotes = (list: Note[]) => AsyncStorage.setItem(KEY, JSON.stringify(list));

// Load persisted settings from AsyncStorage, merging with DEFAULT_SETTINGS for any missing fields
export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(KEY_SET);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

// Persist user settings to AsyncStorage
export const saveSettings = (s: Settings) => AsyncStorage.setItem(KEY_SET, JSON.stringify(s));

// Moves a freshly recorded temp file into permanent storage and returns the note record.
export async function importRecording({ uri, duration }: RecordingResult, name: string): Promise<Note> {
  const ext = (uri.split('.').pop() ?? 'm4a').split('?')[0] || 'm4a';
  const id = Date.now().toString();
  const file = `${id}.${ext}`;
  // Ensure target directory exists in case it was cleared or moved
  await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => {});
  await FileSystem.moveAsync({ from: uri, to: DIR + file });
  return { id, name, file, duration, createdAt: Date.now() };
}

// Delete an audio file from the recordings directory without failing if already absent
export const deleteFile = (file: string) => FileSystem.deleteAsync(DIR + file, { idempotent: true });
export const getUri = async (note: Note): Promise<string> => DIR + note.file;
export const deleteAudio = (note: Note): Promise<void> => FileSystem.deleteAsync(DIR + note.file, { idempotent: true });
export const discardTemp = (uri: string): Promise<void> => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});

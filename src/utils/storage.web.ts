import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Note, RecordingResult, Settings } from '../types';

// Keys used to save the notes list and settings in AsyncStorage.
const KEY = 'voice-journal:notes:v1';
const KEY_SET = 'voice-journal:settings:v1';

// Name of the "table" inside IndexedDB that holds the audio blobs.
const STORE = 'audio';

// Settings used the first time the app opens (before the user changes anything).
export const DEFAULT_SETTINGS: Settings = { quality: 'high', speed: 1 };

// IndexedDB callbacks, wrap it in a Promise to use async/await.
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('voice-journal', 1);

    req.onupgradeneeded = () => req.result.createObjectStore(STORE);

    req.onsuccess = () => resolve(req.result); // database is ready
    req.onerror = () => reject(req.error);     // something went wrong
  });
}

// Runs a single database operation (put, get, delete, count...) and returns its result.
async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Remembers playable links we've already created for each audio file,
const urls = new Map<string, string>();

// Loads the saved notes when the app starts.
export async function loadNotes(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(KEY);
  const list: Note[] = raw ? JSON.parse(raw) : [];
  const ok: Note[] = [];
  for (const n of list) {
    // count() returns 1 if the audio file exists, 0 if it doesn't
    if ((await run('readonly', (s) => s.count(n.file))) > 0) ok.push(n);
  }
  return ok;
}

// Saves the whole notes list (names, dates, durations, file names).
// Called after adding, renaming, or deleting a note.
export const saveNotes = (list: Note[]) => AsyncStorage.setItem(KEY, JSON.stringify(list));

// Loads the user's settings (recording quality, playback speed).
// If nothing has been saved yet, the defaults are used.
export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(KEY_SET);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

// Saves the settings so they are remembered next time.
export const saveSettings = (s: Settings) => AsyncStorage.setItem(KEY_SET, JSON.stringify(s));

// Call when the user taps Save on the recording screen.
export async function importRecording({ uri, duration }: RecordingResult, name: string): Promise<Note> {
  const blob = await (await fetch(uri)).blob();  // turn the temp link into real audio data
  const id = Date.now().toString();              // unique id based on the current time
  const file = `${id}.webm`;                     // browsers record in .webm format
  await run('readwrite', (s) => s.put(blob, file)); // save the audio under that file name
  URL.revokeObjectURL(uri);                      // free the temporary link, we don't need it now
  return { id, name, file, duration, createdAt: Date.now() };
}

// The audio player needs a link it can play. This builds one from the
// stored blob. On the phone version this returns a file path instead.
export async function getUri(note: Note): Promise<string> {
  // If we already made a link for this note, reuse it
  const cached = urls.get(note.file);
  if (cached) return cached;

  // Otherwise read the audio out of IndexedDB
  const blob = await run<Blob | undefined>('readonly', (s) => s.get(note.file));
  if (!blob) throw new Error('Audio not found');

  // Turn the blob into a temporary playable link and remember it
  const url = URL.createObjectURL(blob);
  urls.set(note.file, url);
  return url;
}

// Deletes a note's audio from IndexedDB and cleans up its playable link.
export async function deleteAudio(note: Note): Promise<void> {
  await run('readwrite', (s) => s.delete(note.file));
  const url = urls.get(note.file);
  if (url) URL.revokeObjectURL(url); // release the memory used by the link
  urls.delete(note.file);
}

// Called when the user discards a recording instead of saving it.
export const discardTemp = async (uri: string): Promise<void> => {
  try { URL.revokeObjectURL(uri); } catch {}
};
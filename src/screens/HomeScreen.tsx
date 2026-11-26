import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenTop from '../components/ScreenTop';
import RecordButton from '../components/RecordButton';
import SearchBar from '../components/SearchBar';
import NoteItem from '../components/NoteItem';
import RenameDialog from '../components/RenameDialog';
import SettingsSheet from '../components/SettingsSheet';
import RecordingScreen from './RecordingScreen';
import usePlayer from '../hooks/usePlayer';
import { C, F, SUPPORT_EMAIL } from '../theme';
import * as store from '../utils/storage';
import type { Note, RecordingResult, Settings } from '../types';

// HomeScreen state setup managing playback, stored notes, search filter, settings modal, rename dialog, and recording mod
export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const player = usePlayer();

    // Persistent state for saved recordings and app preferences
    const [notes, setNotes] = useState<Note[]>([]);
    const [ready, setReady] = useState(false);

    // UI state for search filtering and modal visibility
    const [query, setQuery] = useState('');
    const [settings, setSettings] = useState<Settings>(store.DEFAULT_SETTINGS);
    const [showSettings, setShowSettings] = useState(false);
    const [renaming, setRenaming] = useState<Note | null>(null);
    const [recording, setRecording] = useState(false);

    // Hydrate persisted notes and settings on mount, sync initial playback rate
    useEffect(() => {
        (async () => {
            try {
                const [n, st] = await Promise.all([store.loadNotes(), store.loadSettings()]);
                setNotes(n); setSettings(st); player.setRate(st.speed);
            } catch (e) { console.warn(e); }
            setReady(true);
        })();
    }, []);

    // Update notes state and persist changes to storage
    const persist = useCallback((list: Note[]) => { setNotes(list); store.saveNotes(list); }, []);

    // Merge setting changes, persist preferences, and sync playback speed if modified
    const updateSettings = (patch: Partial<Settings>) => {
        const next = { ...settings, ...patch };
        setSettings(next); store.saveSettings(next);
        if (patch.speed) player.setRate(patch.speed);
    };

    // Request microphone permission, stop active playback, and open the recording screen if granted
    const startRecording = async () => {
    const { status, canAskAgain } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Microphone access needed', 'Allow microphone access to record voice notes.',
        canAskAgain ? [{ text: 'OK' }] : [{ text: 'Not now', style: 'cancel' }, { text: 'Open settings', onPress: () => Linking.openSettings() }]);
    }
    await player.stop();
    setRecording(true);
  };

  // Close recording view, import the recorded audio file, and prepend the new note
  const onSaved = async (rec: RecordingResult) => {
    setRecording(false);
    const note = await store.importRecording(rec, `Voice note ${notes.length + 1}`);
    persist([note, ...notes]);
  };

  // Confirm deletion, stop playback if active, remove the audio file, and update note list
  const remove = (note: Note) => Alert.alert('Delete voice note?', `“${note.name}” will be removed from this device.`, [
    { text: 'Keep', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      if (player.activeId === note.id) await player.stop();
      await store.deleteFile(note.file);
      persist(notes.filter((n) => n.id !== note.id));
    } },
  ]);

  // Filter saved notes case-insensitively by trimmed search query
   const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => n.name.toLowerCase().includes(q)) : notes;
  }, [notes, query]);

  // List header combining the primary record button, total recording count, and search input
   const Header = (
    <View>
      <RecordButton onPress={startRecording} />
      <View style={s.sectionRow}>
        <Text style={s.section}>Previous Recordings</Text>
        <Text style={s.count}>{notes.length}</Text>
      </View>
      <SearchBar value={query} onChangeText={setQuery} />
    </View>
  );

   return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScreenTop title="Record"
        left={{ onPress: () => setShowSettings(true), icon: <Ionicons name="options" size={24} color={C.ink} /> }}
        right={{ onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Voice%20Journal%20feedback`), icon: <Ionicons name="chatbubble-ellipses-outline" size={23} color={C.ink} /> }} />
      <FlatList
        data={filtered} keyExtractor={(n) => n.id} keyboardShouldPersistTaps="handled"
        ListHeaderComponent={Header}
        renderItem={({ item }) => <NoteItem note={item} player={player} onRename={() => setRenaming(item)} onDelete={() => remove(item)} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
        ListEmptyComponent={ready ? <Text style={s.empty}>{query ? `No notes match “${query}”.` : 'No recordings yet. Tap the mic to make your first note.'}</Text> : null}
      />
      <LinearGradient colors={['rgba(238,241,248,0)', C.bg]} style={[s.fade, { height: insets.bottom + 110 }]} pointerEvents="none" />
      <Pressable onPress={startRecording} style={[s.newBtn, { bottom: insets.bottom + 24 }]}>
        <Ionicons name="add" size={22} color={C.ink} /><Text style={s.newTxt}>New</Text>
      </Pressable>

      <Modal visible={recording} animationType="slide" onRequestClose={() => {}}>
        <RecordingScreen quality={settings.quality} onCancel={() => setRecording(false)} onSave={onSaved} />
      </Modal>
      <RenameDialog note={renaming} onClose={() => setRenaming(null)}
        onSave={(name) => { if (!renaming) return; persist(notes.map((n) => (n.id === renaming.id ? { ...n, name } : n))); setRenaming(null); }} />
      <SettingsSheet visible={showSettings} settings={settings} onChange={updateSettings} onClose={() => setShowSettings(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 12 },
  section: { fontFamily: F.s, fontSize: 18, color: C.ink },
  count: { fontFamily: F.m, fontSize: 13, color: C.blue },
  empty: { fontFamily: F.r, fontSize: 14, color: C.mute, textAlign: 'center', marginTop: 20, lineHeight: 20 },
  // Non-interactive gradient overlay softening list items behind the floating action button
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  // Centered pill CTA with iOS shadow and Android elevation
  newBtn: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.sky,
    paddingHorizontal: 30, height: 52, borderRadius: 26, shadowColor: C.sky, shadowOpacity: 0.5, shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  newTxt: { fontFamily: F.s, fontSize: 16, color: C.ink, letterSpacing: 0.5 },
});

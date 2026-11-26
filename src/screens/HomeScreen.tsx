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
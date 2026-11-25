import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F } from '../theme';
import { fmt, when } from '../utils/format';
import type { Note } from '../types';
import type { Player } from '../hooks/usePlayer';

// Props accepted by NoteCard to display a note, control audio playback, and trigger rename or delete actions.
interface Props { note: Note; player: Player; onRename: () => void; onDelete: () => void }

// Note item component handling audio scrubber track measurement, active playback state, duration, and progress ratio.
export default function NoteItem({ note, player, onRename, onDelete }: Props) {
  const trackW = useRef<number>(1); // rendered width of progess scrubber
  const open = player.activeId === note.id; // check if note shows active player
  const { pb, rate } = player; // Destructure playback state and playback speed rate from player
  const dur = open && pb.dur ? pb.dur : note.duration; // Use live player duration when active, otherwise fall back to stored note duration
  const pct = open && pb.dur ? pb.pos / pb.dur : 0; // Compute normalized playback progress (0 to 1) when active
  const playing = open && pb.playing;

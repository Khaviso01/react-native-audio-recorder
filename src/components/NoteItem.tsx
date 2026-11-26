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

 return (
    <View style={s.item}>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{note.name}</Text>
          <Text style={s.sub}>{when(note.createdAt)}</Text>
        </View>
        <Text style={s.dur}>{fmt(open ? pb.pos : dur)}{open ? ` / ${fmt(dur)}` : ''}</Text>
        <Pressable onPress={() => player.play(note)} style={s.play} hitSlop={8} accessibilityLabel={playing ? 'Pause' : 'Play'}>
          <Ionicons name={playing ? 'pause' : 'play'} size={16} color={C.blue} style={{ marginLeft: playing ? 0 : 2 }} />
        </Pressable>
      </View>

      {open && (
        <View style={{ marginTop: 14 }}>
          <Pressable style={s.track} onLayout={(e) => (trackW.current = e.nativeEvent.layout.width)}
            onPress={(e) => player.seek((e.nativeEvent.locationX / trackW.current) * pb.dur)}>
            <View pointerEvents="none" style={s.bar} />
            <View pointerEvents="none" style={[s.fill, { width: `${pct * 100}%` }]} />
          </Pressable>
          <View style={s.ctrls}>
            <Pressable onPress={() => player.cycleRate()} style={s.chip}><Text style={s.chipTxt}>{rate}×</Text></Pressable>
            <Pressable onPress={() => player.seek(pb.pos - 10000)} hitSlop={8}><Ionicons name="play-back" size={22} color={C.navy} /></Pressable>
            <Pressable onPress={() => player.seek(pb.pos + 10000)} hitSlop={8}><Ionicons name="play-forward" size={22} color={C.navy} /></Pressable>
            <Pressable onPress={player.stop} hitSlop={8}><Ionicons name="stop" size={22} color={C.navy} /></Pressable>
          </View>
        </View>
      )}

      <View style={s.actions}>
        <Pressable onPress={onRename} style={s.act}><Ionicons name="pencil" size={14} color={C.mute} /><Text style={s.actTxt}>Rename</Text></Pressable>
        <Pressable onPress={onDelete} style={s.act}><Ionicons name="trash-outline" size={15} color={C.danger} /><Text style={[s.actTxt, { color: C.danger }]}>Delete</Text></Pressable>
      </View>
    </View>
  );
}
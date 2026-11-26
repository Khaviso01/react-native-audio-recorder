import React from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, SPEEDS, SUPPORT_EMAIL } from '../theme';
import type { Quality, Settings } from '../types';

// props contract for a segmented option selector
interface SegmentProps<T> { options: [T, string][]; value: T; onChange: (v: T) => void }

// segmented control component for selecting between string or number options
function Segment<T extends string | number>({ options, value, onChange }: SegmentProps<T>) {
    return (
        <View style={s.seg}>
            {options.map(([v, label]) => (
                <Pressable key={String(v)} onPress={() => onChange(v)} style={[s.btn, value === v && s.on]}>
                    <Text style={[s.txt, value === v && { color: '#fff' }]}>{label}</Text>
                </Pressable>
            ))}
        </View>
    );
}

// Props contract for the Settings modal controlling visibility, partial setting updates, and dismissal
interface Props { visible: boolean; settings: Settings; onChange: (patch: Partial<Settings>) => void; onClose: () => void }

// selector component rendering option buttons inside a segmented container.
function Segment<T extends string | number>({ options, value, onChange }: SegmentProps<T>) {
    return (
        <View style={s.seg}>
            {options.map(([v, label]) => (
                <Pressable key={String(v)} onPress={() => onChange(v)} style={[s.btn, value === v && s.on]}>
                    <Text style={[s.txt, value === v && { color: '#fff' }]}>{label}</Text>
                </Pressable>
            ))}
        </View>
    );
}

// Props interface for Settings modal with visibility state, current settings, partial updater, and close callback
interface Props { visible: boolean; settings: Settings; onChange: (patch: Partial<Settings>) => void; onClose: () => void }

// Bottom-sheet style Settings modal using safe area insets and slide animation
export default function SettingsSheet({ visible, settings, onChange, onClose }: Props) {
    const insets = useSafeAreaInsets();
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={s.back} onPress={onClose}>
                <Pressable style={[s.sheet, { paddingBottom: insets.bottom + 20 }]}>
                    <Text style={s.title}>Settings</Text>
                    <Text style={s.label}>Recording quality</Text>
                    <Segment<Quality> value={settings.quality} onChange={(quality) => onChange({ quality })} options={[['high', 'High'], ['low', 'Small file']]} />
                    <Text style={s.label}>Default playback speed</Text>
                    <Segment<number> value={settings.speed} onChange={(speed) => onChange({ speed })} options={SPEEDS.map((v): [number, string] => [v, `${v}×`])} />
                    <Pressable onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Voice%20Journal%20support`)} style={s.support}>
                        <Ionicons name="help-circle-outline" size={20} color={C.navy} />
                        <Text style={s.supportTxt}>Send feedback or get support</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const s = StyleSheet.create({
  back: { flex: 1, backgroundColor: 'rgba(15,25,40,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22 },
  title: { fontFamily: F.s, fontSize: 19, color: C.ink, marginBottom: 14 },
  label: { fontFamily: F.m, fontSize: 13, color: C.mute, marginTop: 10, marginBottom: 8 },
  seg: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, padding: 3 },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  on: { backgroundColor: C.navy },
});
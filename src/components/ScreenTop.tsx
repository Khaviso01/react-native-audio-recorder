import React from 'react';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, F } from '../theme';

// Header slot and component prop interfaces for a configurable top bar
// with optional left/right actions and light/dark styling
interface Slot { onPress: () => void; icon: ReactNode }
interface Props { title: string; left?: Slot; right?: Slot; light?: boolean }

// 
export default function ScreenTop({ title, left, right, light }: Props) {
    // pressable icon slot with expanded hitSlop
    const slot = (x?: Slot) => (x ? <Pressable onPress={x.onPress} hitSlop={10}>{x.icon}</Pressable> : <View style={{ width: 26 }} />);
    return (
        <View style={s.top}>
            {slot(left)}
            <Text style={[s.title, light && { color: '#fff' }]}>{title}</Text>
            {slot(right)}
        </View>
    );
}

// Stylesheet for ScreenTop layout bar and uppercase tracking title
const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 48 },
  title: { fontFamily: F.s, fontSize: 17, letterSpacing: 1.2, color: C.ink, textTransform: 'uppercase' },
});
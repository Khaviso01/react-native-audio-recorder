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
   
  );
}
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F } from '../theme';

export default function RecordButton({ onPress }: { onPress: () => void }) {
  return (
    <View>
    <Text style={s.prompt}>Tap the button to{'\n'}start recording</Text>
      <Pressable onPress={onPress} style={s.wrap} accessibilityLabel="Start recording">
        <View style={[s.ring, { width: 230, height: 230, backgroundColor: '#F2F7FD' }]} />
        <View style={[s.ring, { width: 188, height: 188, backgroundColor: C.tint }]} />
        <View style={s.mic}><Ionicons name="mic" size={52} color="#fff" /></View>
      </Pressable>
    </View>
  );
}
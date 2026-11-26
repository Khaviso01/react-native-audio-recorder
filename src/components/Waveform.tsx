import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Waveform({ bars }: { bars: number[] }) {
  const mid = (bars.length - 1) / 2;
  return (
    <View style={s.wave}>
      {bars.map((b, i) => (
        <View key={i} style={{ width: 3, borderRadius: 2, height: 6 + b * 130, backgroundColor: '#fff',
          opacity: 0.25 + 0.7 * (1 - Math.abs(i - mid) / mid) }} />
      ))}
    </View>
  );
}

// Horizontal bar container for the waveform visualization with centered vertical alignment
const s = StyleSheet.create({ wave: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 150, marginTop: 40 } });
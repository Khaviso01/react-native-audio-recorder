import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Waveform({ bars }: { bars: number[] }) {
  const mid = (bars.length - 1) / 2;
  return (
   
  );
}

const s = StyleSheet.create({ wave: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 150, marginTop: 40 } });
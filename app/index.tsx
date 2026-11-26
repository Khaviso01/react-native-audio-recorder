import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts, Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from '@expo-google-fonts/geist';
import HomeScreen from '../src/screens/HomeScreen';

// expo-router shows this file as the home route.
export default function Index() {
  const [loaded] = useFonts({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold });
  if (!loaded) return null;
  return (
    <View style={s.outer}>
      <View style={s.inner}>
        <HomeScreen />
      </View>
    </View>
  );
}

// On wide browser windows the app is centred at phone width; on phones it fills the screen.
const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#E3E8F0', alignItems: 'center' },
  inner: { flex: 1, width: '100%', maxWidth: 480 },
});
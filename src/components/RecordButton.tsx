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

const s = StyleSheet.create({
    prompt: { fontFamily: F.r, fontSize: 24, lineHeight: 32, textAlign: 'center', color: C.ink, marginTop: 24 },
    wrap: { alignItems: 'center', justifyContent: 'center', height: 250, marginTop: 8 },
    ring: { position: 'absolute', borderRadius: 200 },
    mic: {
        width: 140, height: 140, borderRadius: 70, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center',
        shadowColor: C.navy, shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 10
    },
});
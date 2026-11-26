import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F } from '../theme';

// Props contract for a controlled text input component
interface Props { value: string; onChangeText: (t: string) => void }

// Controlled searchbar with leading search icon
export default function SearchBar({ value, onChangeText }: Props) {
    return (
        <View style={s.box}>
            <Ionicons name="search" size={16} color={C.mute} />
            <TextInput value={value} onChangeText={onChangeText} placeholder="Search by name" placeholderTextColor={C.mute} style={s.input} />
            {!!value && <Pressable onPress={() => onChangeText('')}><Ionicons name="close-circle" size={16} color={C.mute} /></Pressable>}
        </View>
    );
}

// 
const s = StyleSheet.create({
    box: {
        flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
        borderColor: C.line, paddingHorizontal: 12, height: 44, marginBottom: 12
    },
});

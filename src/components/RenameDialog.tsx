import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { C, F } from '../theme';
import type { Note } from '../types';

// Props and Modal wrapper for RenameDialog, rendering Body only when a target note is selected.
interface Props { note: Note | null; onClose: () => void; onSave: (name: string) => void }


export default function RenameDialog({ note, onClose, onSave }: Props) {
    return (
        <Modal visible={!!note} transparent animationType="fade" onRequestClose={onClose}>
            {note && <Body note={note} onClose={onClose} onSave={onSave} />}
        </Modal>
    );
}

// Inner dialog body managing draft name state initialized from the active note.
function Body({ note, onClose, onSave }: Props & { note: Note }) {
    // Controlled text state for renaming the selected note
    const [v, setV] = useState(note.name);
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.back}>
            <View style={s.dialog}>
                <Text style={s.title}>Rename voice note</Text>
                <TextInput value={v} onChangeText={setV} autoFocus selectTextOnFocus style={s.input} maxLength={60} />
                <View style={s.row}>
                    <Pressable onPress={onClose} style={s.btn}><Text style={s.txt}>Cancel</Text></Pressable>
                    <Pressable onPress={() => v.trim() && onSave(v.trim())} style={[s.btn, { backgroundColor: C.navy }]}>
                        <Text style={[s.txt, { color: '#fff' }]}>Save</Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
} 


// Stylesheet for RenameDialog modal backdrop, card surface, text input, and action buttons
const s = StyleSheet.create({
    back: { flex: 1, backgroundColor: 'rgba(15,25,40,0.45)', justifyContent: 'center', padding: 24 },
    dialog: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    title: { fontFamily: F.s, fontSize: 19, color: C.ink, marginBottom: 14 },
    input: { fontFamily: F.r, fontSize: 16, color: C.ink, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, height: 46 },
    row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
    btn: { paddingHorizontal: 20, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    txt: { fontFamily: F.s, fontSize: 15, color: C.navy },
});
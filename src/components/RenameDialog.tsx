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
            
        </KeyboardAvoidingView>
    );
}
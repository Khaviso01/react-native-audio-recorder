import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F } from '../theme';

// Props contract for a controlled text input component
interface Props { value: string; onChangeText: (t: string) => void }
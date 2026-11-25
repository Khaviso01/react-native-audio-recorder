import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F } from '../theme';
import { fmt, when } from '../utils/format';
import type { Note } from '../types';
import type { Player } from '../hooks/usePlayer';
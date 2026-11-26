import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import { DIR } from '../utils/storage';
import { SPEEDS } from '../theme';
import type { Note } from '../types';


export type Player = ReturnType<typeof usePlayer>;
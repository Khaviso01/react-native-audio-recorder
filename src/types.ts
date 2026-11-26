// Core TypeScript definitions for audio quality, voice notes, user settings, and recording output
export type Quality = 'high' | 'low';

export interface Note {
  id: string;
  name: string;
  file: string;
  duration: number;
  createdAt: number;
}

export interface Settings {
  quality: Quality;
  speed: number;
}

export interface RecordingResult {
  uri: string;
  duration: number;
}

Bash

git add .
git commit -m "feat(types): define Quality, Note, Settings, and RecordingResult interfaces"
git push
export type Quality = 'high' | 'low';

export interface Note {
  id: string;
  name: string;
  file: string;
  duration: number;
  createdAt: number;
}

export interface Settings {
  quality: Quality;
  speed: number;
}

export interface RecordingResult {
  uri: string;
  duration: number;
}
# Voice Journal

A voice-notes app built with React Native (Expo) and TypeScript. Record audio, play it back, rename and delete notes, and search them by name. Notes are saved on the device, so they are still there after you close and reopen the app. It runs on Android, iOS (via Expo Go) and the web.

## Features

- Record audio with pause, resume, save and discard, plus a live waveform and timer
- List of voice notes with date, time and duration
- Playback with play/pause, seek bar, 10-second skip, stop and speed control (0.75x to 2x)
- Rename and delete notes
- Search notes by name
- Settings for recording quality and default playback speed
- Microphone permission handling
- Works offline, with notes saved across restarts
- Feedback and support link
- Geist font and a design based on the supplied UI

## Tech stack

| Area | Library |
|------|---------|
| Framework | Expo SDK 58, React Native, TypeScript |
| Navigation / entry | expo-router |
| Recording and playback | expo-audio |
| Storage | expo-file-system (phone files), IndexedDB (web), AsyncStorage (note details and settings) |
| UI | expo-linear-gradient, @expo/vector-icons, Geist font |

## Prerequisites

- [Node.js](https://nodejs.org) 20 or newer (check with `node -v`)
- [Git](https://git-scm.com)
- To test on a phone: the **Expo Go** app from the Play Store or App Store. It must support Expo SDK 58, and your phone and computer must be on the same Wi-Fi.
- To test on the web: Google Chrome

## Getting started

### 1. Clone the project

```bash
git clone <your-repository-url>
cd react-native-audio-recorder
```

### 2. Install dependencies

```bash
npm install
```

If Expo reports mismatched package versions, fix them with:

```bash
npx expo install --fix
```

### 3. Start the app

```bash
npx expo start -c
```

The `-c` flag clears the cache. You can leave it off on later runs.

### 4. Open it

- **Web:** press `w` in the terminal. Click **Allow** when Chrome asks for the microphone. The web version must run on `localhost` or https.
- **Phone:** scan the QR code with Expo Go. On Android, use the scanner inside Expo Go. On iPhone, use the Camera app. If it won't connect, stop the server with `Ctrl+C` and run `npx expo start --tunnel`.
- **Android emulator:** with Android Studio set up, press `a` in the terminal.

## Build an installable app (Android APK)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

When the build finishes, EAS gives you a link to download the `.apk` and install it on your phone. For iOS you need an Apple Developer account.

## Project structure

```
app/
  _layout.tsx           Router layout (header hidden)
  index.tsx             Home route: loads fonts, renders HomeScreen
src/
  screens/              HomeScreen (list, search, settings), RecordingScreen
  components/           NoteItem, RecordButton, SearchBar, RenameDialog,
                        SettingsSheet, Waveform, ScreenTop
  hooks/usePlayer.ts    Playback logic (play, pause, seek, speed)
  utils/
    storage.ts          Phone storage (files on disk)
    storage.web.ts      Web storage (IndexedDB)
    dialog.ts           Alerts that also work on web
    format.ts           Time and date formatting
  theme.ts              Colours, Geist font names, support email
  types.ts              Shared TypeScript types
```

## How storage works

Expo automatically picks the right storage file for the platform:

- **Phone:** the recording is moved into the app's document folder (`recordings/`). Note details (name, date, duration) are saved in AsyncStorage.
- **Web:** the recording is saved in the browser's IndexedDB. Note details are saved in localStorage. Web notes stay in that browser only, and clearing browser data removes them.

## Permissions

The app asks for microphone access the first time you record. If you deny it on a phone, the app offers a shortcut to the settings. The permission text is set in `app.json` through the `expo-audio` plugin.

## Testing checklist

1. Record a note, pause and resume, then save it.
2. Check the note shows its date, time and duration.
3. Play it, then try the speed chip, the skip arrows, the stop button and the seek bar.
4. Rename it, then search for the new name.
5. Delete it and confirm.
6. Record another note, close the app completely and reopen it. The note should still be there.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Requiring unknown module` error | Stop the server and run `npx expo start -c` |
| `expo-asset` or other package not found | Delete `node_modules` and `package-lock.json`, then run `npm install` |
| `Cannot find module 'expo-av'` | `expo-av` is no longer used. Make sure every file imports from `expo-audio` instead |
| Phone can't connect | Same Wi-Fi on both devices, or use `npx expo start --tunnel` |
| No microphone on web | Use Chrome on `localhost` and allow the permission from the address bar |
| Red errors in VS Code after an install | Run **TypeScript: Restart TS Server** from the command palette |

## Scripts

| Command | What it does |
|---------|--------------|
| `npm start` | Start the Expo dev server |
| `npx expo start -c` | Start with a cleared cache |
| `npx expo install --check` | List packages that don't match your Expo version |
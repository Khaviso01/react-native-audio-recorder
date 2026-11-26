import { Stack } from 'expo-router';

// No header bar: the screens draw their own top bar.
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
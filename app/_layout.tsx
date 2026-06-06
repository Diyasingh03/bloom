import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GeminiProvider } from '../src/ai/context/GeminiContext';

export default function RootLayout() {
  return (
    <GeminiProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </GeminiProvider>
  );
}

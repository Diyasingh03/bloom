import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GeminiProvider } from '../src/ai/context/GeminiContext';
import { DisclaimerModal } from '../src/components/DisclaimerModal';
import { storageGet, storageSet, STORAGE_KEYS } from '../src/lib/storage';

export default function RootLayout() {
  const [disclaimerReady, setDisclaimerReady] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    storageGet<boolean>(STORAGE_KEYS.DISCLAIMER_ACCEPTED).then(accepted => {
      setDisclaimerAccepted(!!accepted);
      setDisclaimerReady(true);
    });
  }, []);

  const handleAccept = async () => {
    await storageSet(STORAGE_KEYS.DISCLAIMER_ACCEPTED, true);
    setDisclaimerAccepted(true);
  };

  return (
    <GeminiProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      {disclaimerReady && (
        <DisclaimerModal
          visible={!disclaimerAccepted}
          onAccept={handleAccept}
        />
      )}
    </GeminiProvider>
  );
}

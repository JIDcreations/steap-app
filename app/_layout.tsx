// app/_layout.tsx
import { Slot, useRouter, useSegments, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getCurrentUser } from '../data/auth';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();

      // eerste segment = route group, bv. "(auth)" of "(tabs)"
      const inAuthGroup = segments[0] === '(auth)';

      if (!user && !inAuthGroup) {
        // geen user → altijd naar login
        router.replace('/login' as Href);
        setReady(true);
        return;
      }

      if (user && inAuthGroup) {
        // al ingelogd maar nog in auth → naar hoofdapp
        router.replace('/' as Href);
        setReady(true);
        return;
      }

      setReady(true);
    }

    checkAuth();
  }, [segments, router]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
}

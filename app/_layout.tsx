// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getCurrentUser } from '../data/auth';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Load all custom fonts before showing UI
  const [fontsLoaded] = useFonts({
    'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      const inAuthGroup = segments[0] === '(auth)';

      if (!user && !inAuthGroup) {
        router.replace('/login' as Href);
        setReady(true);
        return;
      }

      if (user && inAuthGroup) {
        router.replace('/' as Href);
        setReady(true);
        return;
      }

      setReady(true);
    }

    checkAuth();
  }, [segments, router]);

  // WAIT for fonts + auth check
  if (!ready || !fontsLoaded) {
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

// app/_layout.tsx
import { Stack } from "expo-router"
import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"
import { View } from "react-native"
import { useFonts, Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter"
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    PlayfairDisplay_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    // shows blank screen until fonts are ready
    return <View style={{ flex: 1, backgroundColor: "black" }} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}

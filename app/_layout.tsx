import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="tabs">
      {/* Tabs = main navigation */}
      <Stack.Screen name="tabs" options={{ headerShown: false }} />

      {/* Home (feed) */}
      <Stack.Screen name="home" options={{ title: "Home" }} />

      {/* Extra screens (example) */}
      <Stack.Screen name="details" options={{ title: "Details" }} />
    </Stack>
  );
}

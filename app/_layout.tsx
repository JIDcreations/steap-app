import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="(home)">
      {/* Tabs live inside the (home) group */}
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
      {/* We’ll add other screens later like details */}
    </Stack>
  );
}

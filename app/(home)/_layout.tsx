import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { COLORS } from "../../styles/theme";

export default function HomeTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.primaryDark,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#FFFFFF",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color="#ffffff"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="post"
        options={{
          title: "Post Tea",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={size}
              color="#ffffff"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "albums" : "albums-outline"}
              size={size}
              color="#ffffff"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color="#ffffff"
            />
          ),
        }}
      />

      {/* Verborgen detailpagina (geen tabbar item) */}
      <Tabs.Screen
        name="tea/[id]"
        options={{
          href: null, // ← Hiermee verdwijnt hij uit de navbar
        }}
      />

      {/* Verborgen settings pagina (geen tabbar item) */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // ← Hiermee verdwijnt hij uit de navbar
        }}
      />
    </Tabs>
  );
}


/**
 * AI-based code assistance was used during development
 * for guidance, explanation and debugging.
 */
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { COLORS } from "../theme"; // zelfde pad als bij login/register

export default function HomeTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: COLORS.primaryDark, // jouw primary navbar kleur
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
              name={focused ? "home" : "home-outline"} // filled vs outline
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
    </Tabs>
  );
}

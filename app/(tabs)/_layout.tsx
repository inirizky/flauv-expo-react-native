import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React from "react";


export default function TabLayout() {

  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: "#727272",
        // animation: "shift"
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Tombol ADD di tengah, tampil seperti tab */}
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarLabel: "Add",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-sharp" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // jangan ganti tab
            router.push("/create"); // navigasi ke halaman lain
          },
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="file-tray-stacked"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

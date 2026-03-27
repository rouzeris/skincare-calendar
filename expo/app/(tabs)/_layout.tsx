import { Tabs } from "expo-router";
import { Calendar, SprayCan, Settings } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

import { useTheme } from "@/context/theme";

const getTabBarHeight = () => {
  if (Platform.OS === 'ios') return 88;
  if (Platform.OS === 'web') return 70;
  return 60;
};

const getTabBarPaddingBottom = () => {
  if (Platform.OS === 'ios') return 28;
  if (Platform.OS === 'web') return 12;
  return 8;
};

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: getTabBarHeight(),
          paddingBottom: getTabBarPaddingBottom(),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.select({ ios: "System", android: "Roboto", web: "system-ui" }),
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Routine",
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="shelf"
        options={{
          title: "Shelf",
          tabBarIcon: ({ color }) => <SprayCan color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

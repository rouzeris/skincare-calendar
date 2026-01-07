import { Stack } from "expo-router";
import { useTheme } from "@/context/theme";

export default function SettingsLayout() {
  const { colors } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        title: "Settings",
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}

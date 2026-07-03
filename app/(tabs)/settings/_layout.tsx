import { Stack } from "expo-router";
import { useTheme } from "@/context/theme";
import { useIntl } from "@/context/intl";

export default function SettingsLayout() {
  const { colors } = useTheme();
  const { t } = useIntl();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        title: t("tabs.settings"),
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}

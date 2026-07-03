import { Link, Stack } from "expo-router";
import { YStack, Text, Anchor } from "tamagui";
import { useTheme } from "@/context/theme";
import { useIntl } from "@/context/intl";

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const { t } = useIntl();

  return (
    <>
      <Stack.Screen options={{ title: t("common.oops") }} />
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding={20}
        backgroundColor={colors.background}
      >
        <Text fontSize={20} fontWeight="bold" color={colors.text}>
          {t("notFound.body")}
        </Text>
        <Link href="/(tabs)" asChild>
          <Anchor
            marginTop={15}
            paddingVertical={15}
            fontSize={14}
            color={colors.tint}
          >
            {t("notFound.home")}
          </Anchor>
        </Link>
      </YStack>
    </>
  );
}

import { Link, Stack } from 'expo-router';
import { YStack, Text, Anchor } from 'tamagui';
import { useTheme } from '@/context/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding={20}
        backgroundColor={colors.background}
      >
        <Text fontSize={20} fontWeight="bold" color={colors.text}>
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/(tabs)" asChild>
          <Anchor marginTop={15} paddingVertical={15} fontSize={14} color={colors.tint}>
            Go to home screen!
          </Anchor>
        </Link>
      </YStack>
    </>
  );
}

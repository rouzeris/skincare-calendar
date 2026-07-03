import { XStack, Text, YStack } from "tamagui";
import { useTheme } from "@/context/theme";

type Props = {
  title: string;
  rightElement?: React.ReactNode;
};

export function PageTitleBar({ title, rightElement }: Props) {
  const { colors } = useTheme();

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={20}
      paddingVertical={15}
      minHeight={70}
    >
      <Text
        fontSize={28}
        fontWeight="bold"
        letterSpacing={-0.5}
        color={colors.text}
      >
        {title}
      </Text>
      <YStack
        width={40}
        height={40}
        alignItems="center"
        justifyContent="center"
      >
        {rightElement}
      </YStack>
    </XStack>
  );
}

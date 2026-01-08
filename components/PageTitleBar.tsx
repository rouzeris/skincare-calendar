import { XStack, Text } from 'tamagui';
import { useTheme } from '@/context/theme';

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
    >
      <Text
        fontSize={28}
        fontWeight="bold"
        letterSpacing={-0.5}
        color={colors.text}
      >
        {title}
      </Text>
      {rightElement}
    </XStack>
  );
}

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/theme';

type Props = {
  title: string;
  rightElement?: React.ReactNode;
};

export function PageTitleBar({ title, rightElement }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});


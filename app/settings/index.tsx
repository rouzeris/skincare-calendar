import React from 'react';
import { Platform } from 'react-native';
import { YStack, XStack, Text, Separator } from 'tamagui';
import { useTheme } from '@/context/theme';
import { Crown, Moon, Sun, Monitor, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Purchases from 'react-native-purchases';
import { useQuery } from '@tanstack/react-query';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setTheme, colors } = useTheme();

  const { data: customerInfo } = useQuery({
    queryKey: ['customerInfo'],
    queryFn: async () => {
      if (Platform.OS === 'web') {
        console.log('[Settings] getCustomerInfo skipped on web');
        return null;
      }
      return await Purchases.getCustomerInfo();
    },
  });

  const isPro = customerInfo?.entitlements.active['club'] !== undefined;

  return (
    <YStack flex={1} padding={20} backgroundColor={colors.background}>
      {/* Club Section */}
      <YStack marginBottom={32}>
        <Text
          fontSize={14}
          fontWeight="600"
          marginBottom={12}
          textTransform="uppercase"
          letterSpacing={0.5}
          color={colors.subtext}
        >
          Membership
        </Text>
        <XStack
          borderRadius={20}
          padding={20}
          alignItems="center"
          justifyContent="space-between"
          borderWidth={1}
          backgroundColor={isPro ? colors.tint : colors.card}
          borderColor={isPro ? colors.tint : colors.border}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.05}
          shadowRadius={8}
          elevation={2}
          pressStyle={{ opacity: isPro ? 1 : 0.7 }}
          onPress={() => !isPro && router.push('/paywall')}
        >
          <XStack alignItems="center">
            <YStack
              width={48}
              height={48}
              borderRadius={24}
              alignItems="center"
              justifyContent="center"
              marginRight={16}
              backgroundColor={isPro ? 'rgba(255,255,255,0.2)' : colors.background}
            >
              <Crown size={24} color={isPro ? "#FFF" : colors.tint} />
            </YStack>
            <YStack>
              <Text fontSize={18} fontWeight="bold" color={isPro ? '#FFFFFF' : colors.text}>
                {isPro ? "You are a Club Member" : "Join the Club"}
              </Text>
              <Text fontSize={14} color={isPro ? 'rgba(255,255,255,0.9)' : colors.subtext}>
                {isPro ? "Thank you for your support!" : "Unlock sync & unlimited history"}
              </Text>
            </YStack>
          </XStack>
          {!isPro && <ChevronRight size={20} color={colors.subtext} />}
        </XStack>
      </YStack>

      {/* Appearance Section */}
      <YStack marginBottom={32}>
        <Text
          fontSize={14}
          fontWeight="600"
          marginBottom={12}
          textTransform="uppercase"
          letterSpacing={0.5}
          color={colors.subtext}
        >
          Appearance
        </Text>
        <YStack borderRadius={16} borderWidth={1} overflow="hidden" backgroundColor={colors.card} borderColor={colors.border}>
          <XStack
            alignItems="center"
            padding={16}
            backgroundColor={themeMode === 'light' ? colors.border : colors.card}
            onPress={() => setTheme('light')}
          >
            <YStack marginRight={12}>
              <Sun size={20} color={themeMode === 'light' ? colors.tint : colors.text} />
            </YStack>
            <Text
              fontSize={16}
              color={themeMode === 'light' ? colors.tint : colors.text}
              fontWeight={themeMode === 'light' ? '600' : '500'}
            >
              Light
            </Text>
          </XStack>
          <Separator marginLeft={48} backgroundColor={colors.border} />
          <XStack
            alignItems="center"
            padding={16}
            backgroundColor={themeMode === 'dark' ? colors.border : colors.card}
            onPress={() => setTheme('dark')}
          >
            <YStack marginRight={12}>
              <Moon size={20} color={themeMode === 'dark' ? colors.tint : colors.text} />
            </YStack>
            <Text
              fontSize={16}
              color={themeMode === 'dark' ? colors.tint : colors.text}
              fontWeight={themeMode === 'dark' ? '600' : '500'}
            >
              Dark
            </Text>
          </XStack>
          <Separator marginLeft={48} backgroundColor={colors.border} />
          <XStack
            alignItems="center"
            padding={16}
            backgroundColor={themeMode === 'auto' ? colors.border : colors.card}
            onPress={() => setTheme('auto')}
          >
            <YStack marginRight={12}>
              <Monitor size={20} color={themeMode === 'auto' ? colors.tint : colors.text} />
            </YStack>
            <Text
              fontSize={16}
              color={themeMode === 'auto' ? colors.tint : colors.text}
              fontWeight={themeMode === 'auto' ? '600' : '500'}
            >
              Auto
            </Text>
          </XStack>
        </YStack>
      </YStack>

      <YStack marginTop="auto" alignItems="center">
        <Text fontSize={12} color={colors.subtext}>Version 1.0.0</Text>
      </YStack>
    </YStack>
  );
}

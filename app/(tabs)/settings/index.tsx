import React, { useState } from 'react';
import { Platform, Alert, Share } from 'react-native';
import { YStack, XStack, Text, Separator, ScrollView } from 'tamagui';
import { useTheme } from '@/context/theme';
import { useCosmetics } from '@/context/cosmetics';
import { useRoutine } from '@/context/routine';
import {
  Crown,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  FileText,
  Shield,
  Mail,
  Star,
  Download,
  Trash2,
  FlaskConical,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Purchases from 'react-native-purchases';
import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIVACY_POLICY_URL = 'https://rork.com/privacy';
const TERMS_URL = 'https://rork.com/terms';
const SUPPORT_EMAIL = 'support@rork.com';
const APP_STORE_URL = 'https://apps.apple.com/app/id0000000000'; // Replace with actual ID

// TODO: Replace with actual feature flag from backend/auth system
const useIsDeveloper = () => {
  // This will come from your auth context / feature flags
  // e.g., return useAuth().user?.role === 'developer'
  // e.g., return useFeatureFlags().isDeveloper
  return false;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setTheme, colors, showDetailedConflicts, setAppSettings } = useTheme();
  const { products } = useCosmetics();
  const { routineConfig, routineHistory } = useRoutine();
  const [_isExporting, setIsExporting] = useState(false);
  const isDeveloper = useIsDeveloper();

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

  const handleOpenURL = async (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Skincare Calendar Support');
    const body = encodeURIComponent(`\n\n---\nApp Version: 1.0.0\nPlatform: ${Platform.OS}`);
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleRateApp = () => {
    if (Platform.OS === 'ios') {
      void Linking.openURL(APP_STORE_URL);
    } else if (Platform.OS === 'android') {
      void Linking.openURL('market://details?id=app.rork.kalendarz_kosmetykow_twarz');
    } else {
      Alert.alert('Rate Us', 'Thank you for your interest! Rating is available on mobile apps.');
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        products,
        routineConfig,
        routineHistory,
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skincare-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({
          message: jsonString,
          title: 'Skincare Calendar Backup',
        });
      }
    } catch {
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your products, routines, and history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'cosmetics_shelf',
              'routine_config',
              'routine_history',
            ]);
            // Reload the app
            if (Platform.OS === 'web') {
              window.location.reload();
            }
          },
        },
      ]
    );
  };

  const SettingsRow = ({
    icon,
    label,
    onPress,
    showChevron = true,
    danger = false,
    subtitle,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    showChevron?: boolean;
    danger?: boolean;
    subtitle?: string;
  }) => (
    <XStack
      alignItems="center"
      padding={16}
      pressStyle={{ opacity: 0.7 }}
      onPress={onPress}
    >
      <YStack marginRight={12}>{icon}</YStack>
      <YStack flex={1}>
        <Text
          fontSize={16}
          color={danger ? colors.error : colors.text}
          fontWeight="500"
        >
          {label}
        </Text>
        {subtitle && (
          <Text fontSize={13} color={colors.subtext} marginTop={2}>
            {subtitle}
          </Text>
        )}
      </YStack>
      {showChevron && <ChevronRight size={18} color={colors.subtext} />}
    </XStack>
  );

  return (
    <ScrollView flex={1} backgroundColor={colors.background}>
      <YStack padding={20} paddingBottom={40}>
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
                <Crown size={24} color={isPro ? '#FFF' : colors.tint} />
              </YStack>
              <YStack>
                <Text
                  fontSize={18}
                  fontWeight="bold"
                  color={isPro ? '#FFFFFF' : colors.text}
                >
                  {isPro ? 'You are a Club Member' : 'Join the Club'}
                </Text>
                <Text
                  fontSize={14}
                  color={isPro ? 'rgba(255,255,255,0.9)' : colors.subtext}
                >
                  {isPro ? 'Thank you for your support!' : 'Unlock sync & unlimited history'}
                </Text>
              </YStack>
            </XStack>
            {!isPro && <ChevronRight size={20} color={colors.subtext} />}
          </XStack>
        </YStack>

        {/* Ingredient Analysis Section */}
        <YStack marginBottom={32}>
          <Text
            fontSize={14}
            fontWeight="600"
            marginBottom={12}
            textTransform="uppercase"
            letterSpacing={0.5}
            color={colors.subtext}
          >
            Ingredient Analysis
          </Text>
          <YStack
            borderRadius={16}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.card}
            borderColor={colors.border}
          >
            <XStack
              alignItems="center"
              padding={16}
              onPress={() => setAppSettings({ showDetailedConflicts: !showDetailedConflicts })}
            >
              <YStack marginRight={12}>
                <FlaskConical size={20} color={colors.text} />
              </YStack>
              <YStack flex={1}>
                <Text fontSize={16} color={colors.text} fontWeight="500">
                  Detailed Explanations
                </Text>
                <Text fontSize={13} color={colors.subtext} marginTop={2}>
                  Show why ingredients conflict. Warnings are always visible.
                </Text>
              </YStack>
              <YStack
                width={50}
                height={30}
                borderRadius={15}
                justifyContent="center"
                paddingHorizontal={3}
                backgroundColor={showDetailedConflicts ? colors.tint : colors.border}
              >
                <YStack
                  width={24}
                  height={24}
                  borderRadius={12}
                  backgroundColor="#FFFFFF"
                  alignSelf={showDetailedConflicts ? 'flex-end' : 'flex-start'}
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.15}
                  shadowRadius={2}
                  elevation={2}
                />
              </YStack>
            </XStack>
          </YStack>
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
          <YStack
            borderRadius={16}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.card}
            borderColor={colors.border}
          >
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

        {/* Data Section - Developer Only */}
        {isDeveloper && (
          <YStack marginBottom={32}>
            <Text
              fontSize={14}
              fontWeight="600"
              marginBottom={12}
              textTransform="uppercase"
              letterSpacing={0.5}
              color={colors.subtext}
            >
              Developer
            </Text>
            <YStack
              borderRadius={16}
              borderWidth={1}
              overflow="hidden"
              backgroundColor={colors.card}
              borderColor={colors.border}
            >
              <SettingsRow
                icon={<Download size={20} color={colors.text} />}
                label="Export Data"
                subtitle={`${products.length} products`}
                onPress={handleExportData}
              />
              <Separator marginLeft={48} backgroundColor={colors.border} />
              <SettingsRow
                icon={<Trash2 size={20} color={colors.error} />}
                label="Delete All Data"
                onPress={handleDeleteAllData}
                showChevron={false}
                danger
              />
            </YStack>
          </YStack>
        )}

        {/* Support Section */}
        <YStack marginBottom={32}>
          <Text
            fontSize={14}
            fontWeight="600"
            marginBottom={12}
            textTransform="uppercase"
            letterSpacing={0.5}
            color={colors.subtext}
          >
            Support
          </Text>
          <YStack
            borderRadius={16}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.card}
            borderColor={colors.border}
          >
            <SettingsRow
              icon={<Mail size={20} color={colors.text} />}
              label="Contact Support"
              subtitle={SUPPORT_EMAIL}
              onPress={handleContactSupport}
            />
            <Separator marginLeft={48} backgroundColor={colors.border} />
            <SettingsRow
              icon={<Star size={20} color={colors.text} />}
              label="Rate the App"
              onPress={handleRateApp}
            />
          </YStack>
        </YStack>

        {/* Legal Section */}
        <YStack marginBottom={32}>
          <Text
            fontSize={14}
            fontWeight="600"
            marginBottom={12}
            textTransform="uppercase"
            letterSpacing={0.5}
            color={colors.subtext}
          >
            Legal
          </Text>
          <YStack
            borderRadius={16}
            borderWidth={1}
            overflow="hidden"
            backgroundColor={colors.card}
            borderColor={colors.border}
          >
            <SettingsRow
              icon={<Shield size={20} color={colors.text} />}
              label="Privacy Policy"
              onPress={() => handleOpenURL(PRIVACY_POLICY_URL)}
            />
            <Separator marginLeft={48} backgroundColor={colors.border} />
            <SettingsRow
              icon={<FileText size={20} color={colors.text} />}
              label="Terms of Service"
              onPress={() => handleOpenURL(TERMS_URL)}
            />
          </YStack>
        </YStack>

        {/* Version */}
        <YStack alignItems="center" marginTop={20}>
          <Text fontSize={12} color={colors.subtext}>
            Version 1.0.0
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

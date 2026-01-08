import React from 'react';
import { Alert, Platform } from 'react-native';
import { YStack, XStack, Text, ScrollView, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/theme';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaywallScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { data: offerings, isLoading, error } = useQuery({
    queryKey: ['offerings'],
    queryFn: async () => {
      if (Platform.OS === 'web') {
        console.log('[RevenueCat] getOfferings skipped on web');
        return null;
      }

      const res = await Purchases.getOfferings();
      return res.current;
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      if (Platform.OS === 'web') {
        throw new Error('In-app purchases are not available on web.');
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      if (customerInfo.entitlements.active['club']) {
        Alert.alert("Success", "Welcome to the club!");
        router.back();
      }
    },
    onError: (error: any) => {
      if (!error.userCancelled) {
        Alert.alert("Error", error.message);
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (Platform.OS === 'web') {
        throw new Error('Restore purchases is not available on web.');
      }
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      if (customerInfo.entitlements.active['club']) {
        Alert.alert("Success", "Purchases restored!");
        router.back();
      } else {
        Alert.alert("Info", "No active subscription found to restore.");
      }
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message);
    },
  });

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <XStack padding={16} justifyContent="flex-end">
          <YStack
            padding={8}
            borderRadius={20}
            backgroundColor={colors.card}
            onPress={() => router.back()}
          >
            <X size={24} color={colors.text} />
          </YStack>
        </XStack>
        <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={24}>
          <Text
            fontSize={32}
            fontWeight="800"
            marginBottom={12}
            textAlign="left"
            alignSelf="stretch"
            color={colors.text}
          >
            Club
          </Text>
          <Text
            fontSize={16}
            textAlign="left"
            alignSelf="stretch"
            lineHeight={24}
            color={colors.subtext}
          >
            Subskrypcje działają tylko w aplikacji mobilnej (iOS/Android). Na webie nie da się kupić ani przywrócić zakupów.
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={colors.background}>
        <Spinner size="large" color={colors.tint} />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} backgroundColor={colors.background}>
        <Text fontSize={16} textAlign="center" color={colors.error}>Failed to load offerings</Text>
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <XStack padding={16} justifyContent="flex-end">
        <YStack
          padding={8}
          borderRadius={20}
          backgroundColor={colors.card}
          onPress={() => router.back()}
        >
          <X size={24} color={colors.text} />
        </YStack>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <YStack marginBottom={40} alignItems="center">
          <Text
            fontSize={32}
            fontWeight="800"
            marginBottom={12}
            textAlign="center"
            color={colors.text}
          >
            Join the Club
          </Text>
          <Text fontSize={16} textAlign="center" lineHeight={24} color={colors.subtext}>
            Unlock premium features and sync your routine across devices.
          </Text>
        </YStack>

        <YStack marginBottom={48}>
          <FeatureItem text="Sync routine between devices" color={colors.text} tint={colors.tint} />
          <FeatureItem text="Unlimited product history" color={colors.text} tint={colors.tint} />
          <FeatureItem text="Support independent development" color={colors.text} tint={colors.tint} isLast />
        </YStack>

        <YStack marginBottom={24}>
          {offerings?.availablePackages.map((pkg, index) => (
            <YStack
              key={pkg.identifier}
              marginBottom={index < (offerings?.availablePackages.length ?? 0) - 1 ? 16 : 0}
            >
              <XStack
                padding={20}
                borderRadius={20}
                borderWidth={1}
                alignItems="center"
                justifyContent="space-between"
                backgroundColor={colors.card}
                borderColor={colors.border}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.05}
                shadowRadius={8}
                elevation={2}
                opacity={purchaseMutation.isPending ? 0.7 : 1}
                onPress={() => purchaseMutation.mutate(pkg)}
                disabled={purchaseMutation.isPending}
              >
                <YStack>
                  <Text fontSize={16} fontWeight="600" marginBottom={4} color={colors.text}>
                    {pkg.product.title}
                  </Text>
                  <Text fontSize={20} fontWeight="bold" color={colors.tint}>
                    {pkg.product.priceString}
                  </Text>
                </YStack>
                <YStack paddingHorizontal={16} paddingVertical={8} borderRadius={12} backgroundColor={colors.background}>
                  <Text fontSize={14} fontWeight="600" color={colors.text}>
                    {purchaseMutation.isPending ? "..." : "Subscribe"}
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          ))}
        </YStack>

        <YStack
          alignItems="center"
          padding={16}
          opacity={restoreMutation.isPending ? 0.7 : 1}
          onPress={() => restoreMutation.mutate()}
          disabled={restoreMutation.isPending}
        >
          <Text fontSize={14} fontWeight="500" color={colors.subtext}>
            {restoreMutation.isPending ? "Restoring..." : "Restore Purchases"}
          </Text>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ text, color, tint, isLast }: { text: string, color: string, tint: string, isLast?: boolean }) {
  return (
    <XStack alignItems="center" marginBottom={isLast ? 0 : 16}>
      <YStack
        width={24}
        height={24}
        borderRadius={12}
        alignItems="center"
        justifyContent="center"
        marginRight={12}
        backgroundColor={tint}
      >
        <Check size={14} color="#FFF" strokeWidth={3} />
      </YStack>
      <Text fontSize={16} fontWeight="500" color={color}>{text}</Text>
    </XStack>
  );
}

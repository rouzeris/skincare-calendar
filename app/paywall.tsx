import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: colors.card }]}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={[styles.loadingContainer, { paddingHorizontal: 24 }]}> 
          <Text style={[styles.title, { color: colors.text, textAlign: 'left', alignSelf: 'stretch' }]}>Club</Text>
          <Text style={[styles.subtitle, { color: colors.subtext, textAlign: 'left', alignSelf: 'stretch' }]}>Subskrypcje działają tylko w aplikacji mobilnej (iOS/Android). Na webie nie da się kupić ani przywrócić zakupów.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Failed to load offerings</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: colors.card }]}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={[styles.title, { color: colors.text }]}>Join the Club</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Unlock premium features and sync your routine across devices.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem text="Sync routine between devices" color={colors.text} tint={colors.tint} />
          <FeatureItem text="Unlimited product history" color={colors.text} tint={colors.tint} />
          <FeatureItem text="Support independent development" color={colors.text} tint={colors.tint} />
        </View>

        <View style={styles.packages}>
          {offerings?.availablePackages.map((pkg) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={[styles.packageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => purchaseMutation.mutate(pkg)}
              disabled={purchaseMutation.isPending}
            >
              <View>
                <Text style={[styles.packageTitle, { color: colors.text }]}>{pkg.product.title}</Text>
                <Text style={[styles.packagePrice, { color: colors.tint }]}>{pkg.product.priceString}</Text>
              </View>
              <View style={[styles.priceButton, { backgroundColor: colors.background }]}>
                 <Text style={[styles.priceButtonText, { color: colors.text }]}>
                   {purchaseMutation.isPending ? "..." : "Subscribe"}
                 </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.restoreButton} 
          onPress={() => restoreMutation.mutate()}
          disabled={restoreMutation.isPending}
        >
          <Text style={[styles.restoreText, { color: colors.subtext }]}>
             {restoreMutation.isPending ? "Restoring..." : "Restore Purchases"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ text, color, tint }: { text: string, color: string, tint: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.checkCircle, { backgroundColor: tint }]}>
        <Check size={14} color="#FFF" strokeWidth={3} />
      </View>
      <Text style={[styles.featureText, { color: color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    padding: 24,
  },
  hero: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: 16,
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  packages: {
    gap: 16,
    marginBottom: 24,
  },
  packageCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  priceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  restoreButton: {
    alignItems: 'center',
    padding: 16,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

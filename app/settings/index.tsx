import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Club Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Membership</Text>
        <TouchableOpacity 
          style={[
            styles.clubCard, 
            { backgroundColor: colors.card, borderColor: colors.border },
            isPro && { backgroundColor: colors.tint, borderColor: colors.tint }
          ]}
          onPress={() => !isPro && router.push('/paywall')}
          activeOpacity={isPro ? 1 : 0.7}
        >
          <View style={styles.clubContent}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: isPro ? 'rgba(255,255,255,0.2)' : colors.background } // Using background as light rose alternative or just plain background
            ]}>
              <Crown size={24} color={isPro ? "#FFF" : colors.tint} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[
                styles.cardTitle, 
                { color: colors.text },
                isPro && styles.textWhite
              ]}>
                {isPro ? "You are a Club Member" : "Join the Club"}
              </Text>
              <Text style={[
                styles.cardSubtitle, 
                { color: colors.subtext },
                isPro && styles.textWhiteOpacity
              ]}>
                {isPro ? "Thank you for your support!" : "Unlock sync & unlimited history"}
              </Text>
            </View>
          </View>
          {!isPro && <ChevronRight size={20} color={colors.subtext} />}
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Appearance</Text>
        <View style={[styles.optionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[
              styles.option, 
              { backgroundColor: colors.card },
              themeMode === 'light' && { backgroundColor: colors.border } // Using border color as selection bg
            ]}
            onPress={() => setTheme('light')}
          >
            <Sun size={20} color={themeMode === 'light' ? colors.tint : colors.text} />
            <Text style={[
              styles.optionText, 
              { color: colors.text },
              themeMode === 'light' && { color: colors.tint, fontWeight: '600' }
            ]}>Light</Text>
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <TouchableOpacity 
            style={[
              styles.option, 
              { backgroundColor: colors.card },
              themeMode === 'dark' && { backgroundColor: colors.border }
            ]}
            onPress={() => setTheme('dark')}
          >
            <Moon size={20} color={themeMode === 'dark' ? colors.tint : colors.text} />
            <Text style={[
              styles.optionText, 
              { color: colors.text },
              themeMode === 'dark' && { color: colors.tint, fontWeight: '600' }
            ]}>Dark</Text>
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <TouchableOpacity 
            style={[
              styles.option, 
              { backgroundColor: colors.card },
              themeMode === 'auto' && { backgroundColor: colors.border }
            ]}
            onPress={() => setTheme('auto')}
          >
            <Monitor size={20} color={themeMode === 'auto' ? colors.tint : colors.text} />
            <Text style={[
              styles.optionText, 
              { color: colors.text },
              themeMode === 'auto' && { color: colors.tint, fontWeight: '600' }
            ]}>Auto</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: colors.subtext }]}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clubCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  clubContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textWhiteOpacity: {
    color: 'rgba(255,255,255,0.9)',
  },
  optionsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginLeft: 48,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
  },
});

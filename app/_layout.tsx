import { CosmeticsProvider } from "@/context/cosmetics";
import { RoutineProvider } from "@/context/routine";
import { ThemeProvider, useTheme } from "@/context/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Purchases from "react-native-purchases";
import { Platform, useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { StatusBar } from "expo-status-bar";
import { tamaguiConfig } from "../tamagui.config";

import "../tamagui-web.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function getRevenueCatApiKey(): { apiKey: string | null; useTestStore: boolean } {
  const testApiKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? null;
  
  if (Platform.OS === "web") {
    return { apiKey: testApiKey, useTestStore: true };
  }
  
  if (Platform.OS === "ios") {
    return { apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? testApiKey, useTestStore: false };
  }
  
  if (Platform.OS === "android") {
    return { apiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? testApiKey, useTestStore: false };
  }

  return { apiKey: null, useTestStore: false };
}

function RootNavigator() {
  const { colors, colorScheme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-product"
          options={{
            presentation: "modal",
            title: "Add Product",
            headerShown: false
          }}
        />
        <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [errorKey, setErrorKey] = useState(0);
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log("[RevenueCat] skipping configuration on web");
      return;
    }

    const { apiKey, useTestStore } = getRevenueCatApiKey();

    console.log("[RevenueCat] init", {
      platform: Platform.OS,
      hasApiKey: Boolean(apiKey),
      useTestStore,
    });

    if (!apiKey) {
      console.log("[RevenueCat] missing apiKey for platform", Platform.OS);
      return;
    }

    const configureRevenueCat = async () => {
      try {
        await Purchases.configure({ apiKey });
        console.log("[RevenueCat] configured successfully");
      } catch (e: any) {
        console.log("[RevenueCat] configure failed, trying test store", e?.message);
        
        const testKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
        if (testKey && testKey !== apiKey) {
          try {
            await Purchases.configure({ apiKey: testKey });
            console.log("[RevenueCat] configured with test store key");
          } catch (e2: any) {
            console.log("[RevenueCat] test store configure also failed", e2?.message);
          }
        }
      }
    };

    configureRevenueCat();
  }, []);

  const handleErrorReset = () => {
    setErrorKey(prev => prev + 1);
  };

  return (
    <ErrorBoundary key={errorKey} onReset={handleErrorReset}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? "light"}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <CosmeticsProvider>
              <RoutineProvider>
                <RootNavigator />
              </RoutineProvider>
            </CosmeticsProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </TamaguiProvider>
    </ErrorBoundary>
  );
}

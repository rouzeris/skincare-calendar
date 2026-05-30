import { CosmeticsProvider } from "@/context/cosmetics";
import { RoutineProvider } from "@/context/routine";
import { ThemeProvider, useTheme } from "@/context/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "react-native";
import { TamaguiProvider } from "tamagui";
import { StatusBar } from "expo-status-bar";
import { tamaguiConfig } from "../tamagui.config";

import "../tamagui-web.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
          name="add-product"
          options={{
            presentation: "modal",
            title: "Add Product",
            headerShown: false
          }}
        />
        <Stack.Screen
          name="calendar"
          options={{
            presentation: "modal",
            title: "Calendar",
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

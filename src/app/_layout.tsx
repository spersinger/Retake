"use client";
import { useEffect } from "react";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { DarkTheme, ThemeProvider } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";

import { MatchDetailsProvider } from "@/hooks/use-match-details";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function MainLayout() {
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    Notifications.getDevicePushTokenAsync().catch(() => {});
  }, []);

  return (
    <>
      <AnimatedSplashOverlay />
      <AppTabs />
    </>
  );
}

export default function TabLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <FavoritesProvider>
      <GestureHandlerRootView style={styles.gestureRoot}>
        <MatchDetailsProvider>
          <MainLayout />
        </MatchDetailsProvider>
      </GestureHandlerRootView>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});

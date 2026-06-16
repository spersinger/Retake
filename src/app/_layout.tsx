"use client";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { MatchDetailsProvider } from "@/hooks/use-match-details";

function MainLayout() {
  return (
    <>
      <AnimatedSplashOverlay />
      <AppTabs />
    </>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
  container: {
    flex: 1,
    width: "100%",
    maxWidth: "100%",
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

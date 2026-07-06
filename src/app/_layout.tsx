"use client";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { MatchDetailsProvider } from "@/hooks/use-match-details";

function MainLayout() {
  return (
    <>
      <LinearGradient
        colors={["#0a0e1f", "#000000"]}
        style={styles.gradientBackground}
        pointerEvents="none"
      />
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
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

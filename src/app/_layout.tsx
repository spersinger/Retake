import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <FavoritesProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </FavoritesProvider>
    </ThemeProvider>
  );
}

import { version } from "expo/package.json";
import { Image } from "expo-image";
import { useColorScheme, StyleSheet, Pressable } from "react-native";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

import { Spacing } from "@/constants/theme";

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="code"
        themeColor="textSecondary"
        style={styles.versionText}
      >
        v{version}
      </ThemedText>
      <a href="https://www.pandascore.co/" target="_blank" rel="noopener">
        <Image
          source={
            scheme === "dark"
              ? require("@/assets/images/expo-badge-white.png")
              : require("@/assets/images/expo-badge.png")
          }
          style={styles.badgeImage}
        />
      </a>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    alignItems: "center",
    gap: Spacing.two,
  },
  versionText: {
    textAlign: "center",
  },
  badgeImage: {
    width: 123,
    aspectRatio: 123 / 24,
  },
});

import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ExternalLink } from "@/components/external-link";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function AboutScreen() {
  const theme = useTheme();

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="title" style={styles.title}>
            About
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Samuel Persinger
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.cardSubtitle}>
            Full-stack Developer · 22
          </ThemedText>
          <ThemedText style={styles.bodyText}>
            Building live esports tracking because I got tired of checking my PC
            for game scores.
          </ThemedText>
        </ThemedView>

        {/*
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Running Costs
          </ThemedText>
          <View style={styles.costRow}>
            <ThemedText style={styles.costLabel}>
              PandaScore API (Pro Live)
            </ThemedText>
            <ThemedText style={styles.costValue}>$1200 / mo</ThemedText>
          </View>
          <View style={styles.costRow}>
            <ThemedText style={styles.costLabel}>Expo EAS Build</ThemedText>
            <ThemedText style={styles.costValue}>$19 / mo</ThemedText>
          </View>
          <View style={styles.costRow}>
            <ThemedText style={styles.costLabel}>Server Costs</ThemedText>
            <ThemedText style={styles.costValue}>$10 / mo</ThemedText>
          </View>
          <View style={[styles.costRow, styles.costTotalRow]}>
            <ThemedText style={styles.costTotalLabel}>Total</ThemedText>
            <ThemedText style={styles.costTotalValue}>$1229 / mo</ThemedText>
          </View>
        </ThemedView>
        */}

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Support the Project
          </ThemedText>
          <ThemedText style={styles.bodyText}>
            If this app saves you any time, consider buying me a coffee.
          </ThemedText>
          <ExternalLink
            href="https://ko-fi.com/sampersinger"
            style={styles.kofiButton}
          >
            <ThemedView type="backgroundSelected" style={styles.kofiInner}>
              <ThemedText style={styles.kofiText}>
                ☕ Buy me a coffee
              </ThemedText>
            </ThemedView>
          </ExternalLink>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignSelf: "center",
    marginTop: 80,
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    gap: Spacing.three,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  heroSection: {
    alignItems: "center",
    gap: Spacing.four,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.three,
  },
  title: {
    textAlign: "center",
  },
  card: {
    alignSelf: "stretch",
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  cardTitle: {
    marginBottom: Spacing.one,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.one,
  },
  bodyText: {
    lineHeight: 22,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.one,
  },
  costLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  costValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  costTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.3)",
    marginTop: Spacing.one,
    paddingTop: Spacing.two,
  },
  costTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  costTotalValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  kofiButton: {
    marginTop: Spacing.one,
    alignSelf: "center",
  },
  kofiInner: {
    backgroundColor: "#fada5e",
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
  },
  kofiText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});

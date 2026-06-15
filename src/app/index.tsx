import { Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedIcon } from "@/components/animated-icon";
import { HintRow } from "@/components/hint-row";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { Team } from "@/components/ui/team-view";
import { useFavorites } from "@/hooks/use-favorites";
import { useTheme } from "@/hooks/use-theme";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { ExternalLink } from "@/components/external-link";
import { Link } from "expo-router/build/react-navigation";
import { navigate } from "expo-router/build/react-navigation/routers/CommonActions";
import { getGames } from "@/api/pandascore";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const { favorites, loaded } = useFavorites();
  const [games, setGames] = useState();
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
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Retake
          </ThemedText>
          <ThemedText>The place for live CS2 stats and updates</ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <ThemedView type="backgroundElement" style={styles.favoritesList}>
            {
              current_games
              //test
            }
          </ThemedView>
        </ThemedView>

        <ThemedText type="title" style={styles.title}>
          Followed Teams
        </ThemedText>
        {loaded && favorites.length > 0 ? (
          <ThemedView type="backgroundElement" style={styles.favoritesList}>
            {favorites.map((team) => (
              <Team key={team.id} team={team} />
            ))}
          </ThemedView>
        ) : (
          <ThemedView type="backgroundElement" style={styles.stepContainer}>
            <Link href="/teams" action={navigate("teams")}>
              <ThemedText>Go to teams tab and follow teams!</ThemedText>
            </Link>
          </ThemedView>
        )}

        {Platform.OS === "web" && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    marginTop: 80,
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  title: {
    textAlign: "center",
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  favoritesList: {
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
});

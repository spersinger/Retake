import { Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedIcon } from "@/components/animated-icon";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { useFavorites } from "@/hooks/use-favorites";
import { useTheme } from "@/hooks/use-theme";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { getGames } from "@/api/pandascore";
import { useEffect, useState, useCallback } from "react";
import { TeamData } from "@/components/ui/team-view";
import { MatchView } from "@/components/ui/MatchView";

const PER_PAGE = 25;

export default function HomeScreen() {
  const { favorites, loaded } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<any[]>();
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

  const fetchGames = useCallback(
    async (pageNum: number, favoriteIds: number[]) => {
      const data: any = await getGames({
        page: pageNum,
        perPage: PER_PAGE,
        team_ids: favoriteIds,
      });

      setGames(data);
    },
    [],
  );

  useEffect(() => {
    // Guard clause: Do nothing if the favorites haven't finished loading
    setLoading(true);
    if (!loaded) return;

    const favoriteIds: number[] = favorites.map((team: TeamData) => team.id);
    console.log("Loaded Favorite IDs:", favoriteIds);

    // Only fetch games if the user actually has favorites
    if (favoriteIds.length > 0) {
      fetchGames(1, favoriteIds);
      setLoading(false);
    }
  }, [favorites, loaded]); // Re-run whenever favorites or loaded state changes

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
            Today's Matches
          </ThemedText>
        </ThemedView>

        <MatchView games={games} loading={loading}></MatchView>

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
    borderRadius: Spacing.four,
  },
  favoritesList: {
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
});

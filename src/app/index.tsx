import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { useFavorites } from "@/hooks/use-favorites";
import { useTheme } from "@/hooks/use-theme";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { getGames } from "@/api/pandascore";
import { useEffect, useState, useCallback, useMemo } from "react";
import { TeamData } from "@/components/ui/team-view";
import { MatchView } from "@/components/ui/MatchView";

const PER_PAGE = 25;
type TabType = "Yesterday" | "Today" | "Upcoming";

export default function HomeScreen() {
  const { favorites, loaded } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<any[]>();
  const [dateFilter, setDateFilter] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<TabType>("Today");
  const theme = useTheme();

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const fetchGames = useCallback(
    async (pageNum: number, favoriteIds: number[], currentTab: TabType) => {
      setLoading(true);
      switch (currentTab) {
        case "Yesterday":
          setDateFilter(-1);
          break;
        case "Today":
          setDateFilter(0);
          break;
        case "Upcoming":
          setDateFilter(1);
          break;
        default:
          setDateFilter(0);
          break;
      }

      const data: any = await getGames({
        page: pageNum,
        perPage: PER_PAGE,
        team_ids: favoriteIds,
        // Passes standard PandaScore date range query parameter configuration
        day: dateFilter,
      });

      setGames(data);
      setLoading(false);
    },
    [dateFilter],
  );

  // Trigger data synchronization whenever favorites materialize or user swaps views
  useEffect(() => {
    if (!loaded) return;

    const favoriteIds: number[] = favorites.map((team: TeamData) => team.id);

    if (favoriteIds.length > 0) {
      fetchGames(1, favoriteIds, activeTab);
    } else {
      setGames([]);
      setLoading(false);
    }
  }, [favorites, loaded, activeTab, fetchGames]);

  const contentPlatformStyle: Record<string, any> | undefined = Platform.select(
    {
      android: {
        flexDirection: "column",
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
      },
      ios: {
        flexDirection: "column",
      },
      web: {
        flexDirection: "row",
        justifyContent: "center",
        paddingTop: Spacing.six,
        paddingBottom: Spacing.four,
      },
    },
  );

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        <View style={styles.tabContainer}>
          {(["Yesterday", "Today", "Upcoming"] as TabType[]).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
                style={[
                  styles.tabButton,
                  isSelected && { borderBottomColor: theme.text },
                ]}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    isSelected ? styles.activeTabText : styles.inactiveTabText,
                  ]}
                >
                  {tab}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <MatchView games={games} loading={loading} />

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
    marginTop: 20,
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    gap: Spacing.three,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: Spacing.two,
    gap: Spacing.six,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  activeTabText: {
    opacity: 1,
  },
  inactiveTabText: {
    opacity: 0.4,
  },
});

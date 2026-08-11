import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  const [refreshing, setRefreshing] = useState(false);
  const [games, setGames] = useState<any[]>();
  const [activeTab, setActiveTab] = useState<TabType>("Today");
  const theme = useTheme();

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const fetchGames = useCallback(
    async (
      pageNum: number,
      favoriteIds: number[],
      currentTab: TabType,
      skipCache = false,
    ) => {
      setLoading(true);

      let day = 0;
      switch (currentTab) {
        case "Yesterday":
          day = -1;
          break;
        case "Today":
          day = 0;
          break;
        case "Upcoming":
          day = 1;
          break;
      }

      const data: any = await getGames({
        page: pageNum,
        perPage: PER_PAGE,
        team_ids: favoriteIds,
        day,
        skipCache,
      });

      setGames(data);
      setLoading(false);
      setRefreshing(false);
    },
    [],
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const favoriteIds: number[] = favorites.map((team: TeamData) => team.id);
    fetchGames(1, favoriteIds, activeTab, true);
  }, [favorites, activeTab, fetchGames]);

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
    <View style={styles.screenRoot}>
      <LinearGradient
        colors={["#0a0e1f", "#000000"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <ScrollView
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="never"
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      >
      <ThemedView style={[styles.container, { backgroundColor: "#0000" }]}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Matches
          </ThemedText>
        </View>
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

        {
          //Platform.OS === "web" && <WebBadge />}
        }
      </ThemedView>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    marginTop: 20,
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  title: {},
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

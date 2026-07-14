import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useState, useCallback, useRef } from "react";
import { getTeams } from "@/api/pandascore";
import { Team, TeamData, FavoriteCard } from "@/components/ui/team-view";

import AntDesign from "@expo/vector-icons/AntDesign";
import { useFavorites } from "@/hooks/use-favorites";

const PER_PAGE = 25;

export default function TeamTabScreen() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { favorites } = useFavorites();

  const fetchTeams = useCallback(
    async (pageNum: number, search: string, append: boolean) => {
      setLoading(true);
      const data: TeamData[] = await getTeams({
        page: pageNum,
        perPage: PER_PAGE,
        search,
      });
      setTeams((prev) => (append ? [...prev, ...data] : data));
      setHasMore(data.length === PER_PAGE);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    fetchTeams(1, "", false);
  }, [fetchTeams]);

  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const t = setTimeout(() => {
      setPage(1);
      setSubmittedQuery(query);
      fetchTeams(1, query, false);
    }, 350);
    return () => clearTimeout(t);
  }, [query, fetchTeams]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTeams(nextPage, submittedQuery, true);
  };

  const clearSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    inputRef.current?.blur();
    fetchTeams(1, "", false);
  };

  const cancelSearch = () => {
    setQuery("");
    setSubmittedQuery("");
    setFocused(false);
    inputRef.current?.blur();
    fetchTeams(1, "", false);
  };

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

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

  const showCancel = focused || query.length > 0;

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
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } =
            nativeEvent;
          const paddingToBottom = 40;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Teams
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Follow teams to keep track of their matches
            </ThemedText>
          </View>

          <View style={styles.searchRow}>
            <View
              style={[styles.searchField, focused && styles.searchFieldFocused]}
            >
              <AntDesign
                name="search"
                size={18}
                color={theme.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                ref={inputRef}
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search teams"
                placeholderTextColor={theme.textSecondary}
                value={query}
                onChangeText={setQuery}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                returnKeyType="search"
                onSubmitEditing={cancelSearch}
              />
              {query.length > 0 && (
                <Pressable onPress={clearSearch} hitSlop={8}>
                  <AntDesign
                    name="close-circle"
                    size={18}
                    color={theme.textSecondary}
                  />
                </Pressable>
              )}
            </View>
            {showCancel && (
              <Pressable onPress={cancelSearch} style={styles.cancelButton}>
                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText themeColor="textSecondary" style={styles.sectionHeader}>
              Favorites
            </ThemedText>
            {favorites.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.favScroll}
              >
                {favorites.map((team) => (
                  <FavoriteCard key={team.id} team={team} />
                ))}
              </ScrollView>
            ) : (
              <ThemedView type="backgroundElement" style={styles.emptyHint}>
                <AntDesign
                  name="heart"
                  size={18}
                  color={theme.textSecondary}
                />
                <ThemedText
                  themeColor="textSecondary"
                  style={styles.emptyHintText}
                >
                  Tap the heart on any team to add them here.
                </ThemedText>
              </ThemedView>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText themeColor="textSecondary" style={styles.sectionHeader}>
              {query.length > 0 ? "Results" : "All Teams"}
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.groupedCard}>
              {loading && teams.length === 0 ? (
                <ActivityIndicator style={styles.status} />
              ) : teams.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.status}>
                  {query.length > 0
                    ? `No teams found for "${submittedQuery}"`
                    : "No teams available"}
                </ThemedText>
              ) : (
                <View>
                  {teams.map((team, i) => (
                    <View key={team.id}>
                      <Team team={team} />
                      {i < teams.length - 1 && <View style={styles.divider} />}
                    </View>
                  ))}
                  {loading && teams.length > 0 && (
                    <ActivityIndicator style={styles.status} />
                  )}
                </View>
              )}
            </ThemedView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    backgroundColor: "transparent",
    gap: Spacing.five,
    paddingBottom: Spacing.five,
  },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  title: {},
  subtitle: {},
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchFieldFocused: {
    borderWidth: 1,
    borderColor: "#3c87f7",
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  cancelButton: { paddingVertical: Spacing.two },
  cancelText: { fontSize: 16, fontWeight: "600" },
  section: { gap: Spacing.two },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  favScroll: {
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  emptyHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  emptyHintText: { fontSize: 14, flexShrink: 1 },
  groupedCard: {
    borderRadius: Spacing.four,
    overflow: "hidden",
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 0,
  },
  status: { padding: Spacing.three, textAlign: "center" },
  pressed: { opacity: 0.6 },
});

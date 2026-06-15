import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useState, useCallback, useRef } from "react";
import { getTeams } from "@/api/pandascore";
import { Team, TeamData } from "@/components/ui/team-view";

import AntDesign from "@expo/vector-icons/AntDesign";

interface Team {
  id: number;
  name: string;
}

const PER_PAGE = 25;

export default function TeamTabScreen() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [focused, borderAnim]);

  const fetchTeams = useCallback(
    async (pageNum: number, search: string, append: boolean) => {
      setLoading(true);
      const data: Team[] = await getTeams({
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

  // Initial load
  useEffect(() => {
    fetchTeams(1, "", false);
  }, [fetchTeams]);

  const handleSearch = () => {
    setPage(1);
    setSubmittedQuery(query);
    fetchTeams(1, query, false);
  };

  const loadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTeams(nextPage, submittedQuery, true);
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

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - 150;
        if (isCloseToBottom) loadMore();
      }}
      scrollEventThrottle={400}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Teams</ThemedText>
          <ThemedView
            type="backgroundElement"
            style={styles.searchRow}
          >
            <Animated.View
              style={[
                styles.searchBorder,
                { transform: [{ scaleX: borderAnim }] },
              ]}
              pointerEvents="none"
            />
            <TextInput
              placeholder="Search teams..."
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={[styles.searchInput, { color: theme.text }, Platform.select({ web: { outlineStyle: "none" as any } })]}
            />
            <Pressable
              onPress={handleSearch}
              style={styles.searchButton}
            >
              <ThemedText style={styles.searchButtonText}>Search</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          {teams.length === 0 && loading ? (
            <ActivityIndicator />
          ) : (
            <>
              {teams.map((team) => (
                <Team key={team.id} team={team} />
              ))}
              {loading && teams.length > 0 && (
                <ActivityIndicator style={{ marginVertical: Spacing.three }} />
              )}
            </>
          )}
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
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: "center",
    gap: Spacing.one,
    alignItems: "center",
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: "center",
  },
  imageTutorial: {
    width: "100%",
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  searchRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    overflow: "hidden",
    paddingLeft: Spacing.five,
  },
  searchBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(128,128,128,0.5)",
  },
  searchInput: {
    flex: 5,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  searchButton: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(128,128,128,0.3)",
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

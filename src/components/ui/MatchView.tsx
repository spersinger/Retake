import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Spacing, MaxContentWidth } from "@/constants/theme";
import { MatchData } from "./match";
import { Match } from "./match";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

interface MatchViewTypes {
  games: any;
  loading: boolean;
}

export const MatchView = ({ games, loading }: MatchViewTypes) => {
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : games && games.length > 0 ? (
        <>
          {games?.map((game: MatchData, index: number) => (
            <View key={game.id}>
              <Match match={game} />
              {index < games.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            No matches found for this day
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    maxWidth: MaxContentWidth,
    width: "100%",
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});

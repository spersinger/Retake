import { ThemedView } from "../themed-view";
import { Spacing } from "@/constants/theme";

import { ActivityIndicator } from "react-native";
import { MatchData } from "./match";
import { useTheme } from "@/hooks/use-theme";
import { Match } from "./match";
import { StyleSheet } from "react-native";

interface MatchViewTypes {
  games: any;
  loading: boolean;
}

export const MatchView = ({ games, loading }: MatchViewTypes) => {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedView
        style={[
          styles.matchViewContainer,
          { backgroundColor: theme.backgroundElement },
        ]}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            {games?.map((game: MatchData) => (
              <ThemedView
                style={{ backgroundColor: theme.backgroundElement }}
                key={game.id}
              >
                <Match match={game} />
              </ThemedView>
            ))}
          </>
        )}
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    alignSelf: "stretch",
    borderRadius: Spacing.four,
  },
  matchViewContainer: {
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
});

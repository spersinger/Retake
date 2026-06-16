import { Image as ExpoImage } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { useMatchDetails } from "@/hooks/use-match-details";

// Relying on a clean structure for the match data from Pandascore
export interface MatchData {
  id: number;
  name: string;
  status: "running" | "not_started" | "finished" | "postponed" | "canceled";
  begin_at: string;
  league?: {
    name: string;
    image_url: string | null;
  } | null;
  serie?: {
    name: string;
  } | null;
}

interface MatchProps {
  match: MatchData;
}

export const Match = ({ match }: MatchProps) => {
  const theme = useTheme();
  const leagueLogoUri = match.league?.image_url;

  const { openMatchDetails, matchId, closeMatchDetails } = useMatchDetails();

  const isLive = match.status === "running";
  const handleGamePress = () => {
    openMatchDetails(match.id);
  };

  // Formats the UTC timestamp into local hours/dates cleanly
  const formattedTime = new Date(match.begin_at).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      onPress={handleGamePress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <ThemedView
        style={[styles.row, { backgroundColor: theme.backgroundElement }]}
      >
        {/* League Logo / Fallback */}
        {leagueLogoUri ? (
          <ExpoImage
            source={{ uri: leagueLogoUri }}
            style={styles.logo}
            contentFit="contain"
          />
        ) : (
          <View
            style={[styles.logoFallback, { backgroundColor: theme.background }]}
          >
            <ThemedText style={styles.logoFallbackText}>
              {match.league?.name.slice(0, 2) ?? "VS"}
            </ThemedText>
          </View>
        )}

        {/* Match Details */}
        <ThemedView style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {match.name}
          </ThemedText>

          <ThemedView style={styles.metaRow}>
            {match.league?.name ? (
              <ThemedText themeColor="textSecondary" style={styles.meta}>
                {match.league.name}
              </ThemedText>
            ) : null}

            {match.serie?.name ? (
              <ThemedText themeColor="textSecondary" style={styles.meta}>
                • {match.serie.name}
              </ThemedText>
            ) : null}
          </ThemedView>

          {isLive ? (
            <ThemedView style={styles.liveBadge}>
              <ThemedText style={styles.liveText}>• LIVE</ThemedText>
            </ThemedView>
          ) : (
            <ThemedText themeColor="textSecondary" style={styles.timeText}>
              {formattedTime}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: Spacing.two,
  },
  logoFallback: {
    width: 40,
    height: 40,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  info: {
    backgroundColor: "#0000",
    flex: 1,
    gap: Spacing.one,
  },
  name: {
    fontWeight: "600",
    fontSize: 15,
  },
  metaRow: {
    backgroundColor: "#0000",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  meta: {
    fontSize: 12,
  },
  timeText: {
    fontSize: 12,
    marginTop: Spacing.half,
  },
  liveBadge: {
    backgroundColor: "#ff3144",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.one,
    marginTop: Spacing.half,
  },
  liveText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});

import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

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
  onPress?: (match: MatchData) => void;
}

export const Match = ({ match, onPress }: MatchProps) => {
  const theme = useTheme();
  const leagueLogoUri = match.league?.image_url;
  const isLive = match.status === "running";

  // Formats the UTC timestamp into local hours/dates cleanly
  const formattedTime = new Date(match.begin_at).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      onPress={() => onPress?.(match)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {/* League Logo / Fallback */}
      {leagueLogoUri ? (
        <Image
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
      </ThemedView>

      {/* Status & Time Container */}
      <ThemedView style={styles.statusContainer}>
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
  statusContainer: {
    backgroundColor: "#0000",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: Spacing.two,
  },
  timeText: {
    fontSize: 12,
    textAlign: "right",
  },
  liveBadge: {
    backgroundColor: "#ff3144", // Matches your heart container visual accents
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.one,
  },
  liveText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});

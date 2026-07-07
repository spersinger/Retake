import { Image as ExpoImage } from "expo-image";
import { Pressable, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useMatchDetails } from "@/hooks/use-match-details";
import { useLiveActivity } from "@/hooks/use-live-activity";

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

const getLeagueColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 35%)`;
};

export const Match = ({ match }: MatchProps) => {
  const leagueLogoUri = match.league?.image_url;

  const { openMatchDetails, matchId, closeMatchDetails } = useMatchDetails();

  const isLive = match.status === "running" || __DEV__;
  const handleGamePress = () => {
    openMatchDetails(match.id);
  };

  const {
    activeMatchId,
    isStarting,
    startActivity,
    stopActivity,
  } = useLiveActivity();

  const isLiveActivityActive = activeMatchId === match.id;

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
      <View style={[styles.row, styles.rowInner]}>
        {/* League Logo / Fallback */}
        {leagueLogoUri ? (
          <ExpoImage
            source={{ uri: leagueLogoUri }}
            style={styles.logo}
            contentFit="contain"
          />
        ) : (
          <View
            style={[
              styles.logoFallback,
              {
                backgroundColor: getLeagueColor(
                  match.league?.name ?? "VS",
                ),
              },
            ]}
          >
            <ThemedText style={styles.logoFallbackText}>
              {match.league?.name.slice(0, 2) ?? "VS"}
            </ThemedText>
          </View>
        )}

        {/* Match Details */}
        <View style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {match.name}
          </ThemedText>

          <View style={styles.metaRow}>
            {match.league?.name ? (
              <ThemedText style={styles.meta} themeColor="textSecondary">
                {match.league.name}
              </ThemedText>
            ) : null}

            {match.serie?.name ? (
              <ThemedText style={styles.meta} themeColor="textSecondary">
                • {match.serie.name}
              </ThemedText>
            ) : null}
          </View>

          {isLive ? (
            <View style={styles.liveBadge}>
              <ThemedText style={styles.liveText}>• LIVE</ThemedText>
            </View>
          ) : (
            <ThemedText themeColor="textSecondary" style={styles.timeText}>
              {formattedTime}
            </ThemedText>
          )}
          {__DEV__ && (
            <TouchableOpacity
              style={[
                styles.debugLIVEButton,
                isLiveActivityActive && styles.debugLIVEButtonActive,
              ]}
              onPress={() =>
                isLiveActivityActive
                  ? stopActivity()
                  : startActivity(match.id)
              }
              disabled={isStarting}
            >
              <Text style={styles.debugLIVEButtonText}>
                {isStarting ? "..." : isLiveActivityActive ? "● LA" : "○ LA"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    alignSelf: "stretch",
  },
  rowInner: {
    flex: 1,
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
  debugLIVEButton: {
    alignSelf: "flex-start",
    marginTop: Spacing.half,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  debugLIVEButtonActive: {
    backgroundColor: "rgba(255,70,60,0.3)",
  },
  debugLIVEButtonText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "700",
  },
});

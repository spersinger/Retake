import { Image as ExpoImage } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useMatchDetails } from "@/hooks/use-match-details";
import { getTeamVisuals } from "@/utils/get-team-visuals";

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
  opponents?: {
    opponent: {
      id: number;
      name: string;
      dark_mode_image_url?: string | null;
      image_url?: string | null;
    };
    type: "Player" | "Team";
  }[];
  tournament?: {
    name: string;
  } | null;
  results?: {
    score: number;
    team_id: number;
  }[];
}

interface MatchProps {
  match: MatchData;
}

const TeamColumn = ({
  name,
  dark_mode_image_url,
  image_url,
  defaultColor,
}: {
  name: string;
  dark_mode_image_url?: string | null;
  image_url?: string | null;
  defaultColor: string;
}) => {
  const visuals = getTeamVisuals(name, defaultColor);
  const logoUri = dark_mode_image_url || image_url || visuals.logo;

  return (
    <View style={styles.teamColumn}>
      {logoUri ? (
        <ExpoImage
          source={{ uri: logoUri }}
          style={styles.teamLogo}
          contentFit="contain"
        />
      ) : (
        <View style={[styles.teamLogoFallback, { backgroundColor: visuals.color }]}>
          <ThemedText style={styles.teamLogoFallbackText}>
            {name.slice(0, 2)}
          </ThemedText>
        </View>
      )}
      <ThemedText style={styles.teamName} numberOfLines={1}>
        {name}
      </ThemedText>
    </View>
  );
};

export const Match = ({ match }: MatchProps) => {
  const { openMatchDetails } = useMatchDetails();

  const handleGamePress = () => {
    openMatchDetails(match.id);
  };

  const teamA = match.opponents?.[0]?.opponent;
  const teamB = match.opponents?.[1]?.opponent;

  const tournamentName =
    match.tournament?.name || match.league?.name || null;

  const scoreText = (() => {
    if (match.status !== "finished" || !match.results || !teamA || !teamB) return null;
    const scoreA = match.results.find((r) => r.team_id === teamA.id)?.score;
    const scoreB = match.results.find((r) => r.team_id === teamB.id)?.score;
    if (scoreA == null || scoreB == null) return null;
    return `${scoreA} - ${scoreB}`;
  })();

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
      {teamA && teamB ? (
        <View style={styles.teamsRow}>
          <TeamColumn
            name={teamA.name}
            dark_mode_image_url={teamA.dark_mode_image_url}
            image_url={teamA.image_url}
            defaultColor="hsl(25, 100%, 45%)"
          />
          <View style={styles.centerColumn}>
            {tournamentName ? (
              <ThemedText style={styles.tournamentName} numberOfLines={2}>
                {tournamentName}
              </ThemedText>
            ) : null}
            {scoreText ? (
              <ThemedText style={styles.scoreText}>{scoreText}</ThemedText>
            ) : null}
            {match.status === "running" ? (
              <View style={styles.liveBadge}>
                <ThemedText style={styles.liveText}>LIVE</ThemedText>
              </View>
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.timeText}>
                {formattedTime}
              </ThemedText>
            )}
          </View>
          <TeamColumn
            name={teamB.name}
            dark_mode_image_url={teamB.dark_mode_image_url}
            image_url={teamB.image_url}
            defaultColor="hsl(215, 100%, 55%)"
          />
        </View>
      ) : (
        <View style={styles.fallbackRow}>
          <ThemedText style={styles.fallbackName} numberOfLines={1}>
            {match.name}
          </ThemedText>
          {match.status === "running" ? (
            <View style={styles.liveBadge}>
              <ThemedText style={styles.liveText}>LIVE</ThemedText>
            </View>
          ) : (
            <ThemedText themeColor="textSecondary" style={styles.timeText}>
              {formattedTime}
            </ThemedText>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.three,
    alignSelf: "stretch",
  },
  pressed: {
    opacity: 0.6,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamColumn: {
    alignItems: "center",
    width: 72,
  },
  teamLogo: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  teamLogoFallback: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  teamLogoFallbackText: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  teamName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  centerColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
  },
  tournamentName: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.5,
    textAlign: "center",
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
  },
  liveBadge: {
    backgroundColor: "#ff3144",
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Spacing.one,
  },
  liveText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  fallbackRow: {
    alignItems: "center",
    gap: Spacing.two,
  },
  fallbackName: {
    fontWeight: "600",
    fontSize: 15,
  },
});

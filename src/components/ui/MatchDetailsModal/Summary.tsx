import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { CSMatchResponse } from "@/api/pandascore-types";

interface SummaryProps {
  match: CSMatchResponse | null | undefined;
}

// Helper to format seconds into readable duration strings
const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds || seconds <= 0) return "--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m ${s}s`;
};

export const Summary = ({ match }: SummaryProps) => {
  if (!match) {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>Loading match data...</Text>
      </View>
    );
  }

  const teamA = match.opponents?.[0]?.opponent;
  const teamB = match.opponents?.[1]?.opponent;

  // Compute the scoreboard values safely from the core results metadata
  const scoreboard = useMemo(() => {
    if (!teamA || !teamB || !match.results) return { scoreA: 0, scoreB: 0 };

    const scoreA =
      match.results.find((r) => r.team_id === teamA.id)?.score ?? 0;
    const scoreB =
      match.results.find((r) => r.team_id === teamB.id)?.score ?? 0;

    return { scoreA, scoreB };
  }, [match.results, teamA?.id, teamB?.id]);

  // Compute total playtime across all finished maps
  const totalDuration = useMemo(() => {
    if (!match.games) return 0;
    return match.games.reduce((acc, game) => acc + (game.length ?? 0), 0);
  }, [match.games]);

  if (!teamA || !teamB) {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>Teams information missing.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* SERIES INFOCARD OVERVIEW */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Series Overview</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Tournament</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {match.league?.name ?? "Unknown"} - {match.tournament?.name}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Format</Text>
          <Text style={styles.metaValue}>
            {match.match_type === "best_of"
              ? `Best of ${match.number_of_games}`
              : match.match_type}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Total Playtime</Text>
          <Text style={styles.metaValue}>
            {totalDuration > 0 ? formatDuration(totalDuration) : "Not started"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Status</Text>
          <Text
            style={[
              styles.metaValue,
              match.status === "running" && styles.liveText,
            ]}
          >
            {match.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* SERIES SCOREBOARD CARD */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Match Results</Text>
        <View style={styles.scoreRow}>
          <View style={styles.teamContainer}>
            <Text style={[styles.teamName, styles.leftAlign]} numberOfLines={1}>
              {teamA.name}
            </Text>
            <Text style={[styles.acronym, styles.leftAlign]}>
              {teamA.acronym}
            </Text>
          </View>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>
              {scoreboard.scoreA} : {scoreboard.scoreB}
            </Text>
          </View>

          <View style={styles.teamContainer}>
            <Text
              style={[styles.teamName, styles.rightAlign]}
              numberOfLines={1}
            >
              {teamB.name}
            </Text>
            <Text style={[styles.acronym, styles.rightAlign]}>
              {teamB.acronym}
            </Text>
          </View>
        </View>
      </View>

      {/* INDIVIDUAL GAME LOGS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Game Outcomes</Text>
        {match.games && match.games.length > 0 ? (
          match.games.map((game) => {
            let winnerName = "TBD";
            if (game.winner?.id === teamA.id)
              winnerName = teamA.acronym || teamA.name;
            if (game.winner?.id === teamB.id)
              winnerName = teamB.acronym || teamB.name;

            return (
              <View key={game.id} style={styles.gameLogRow}>
                <View>
                  <Text style={styles.gameLabel}>Game {game.position}</Text>
                  {game.length ? (
                    <Text style={styles.gameDuration}>
                      {formatDuration(game.length)}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.winnerBadge}>
                  <Text style={styles.winnerLabel}>
                    {game.status === "finished"
                      ? `Winner: ${winnerName}`
                      : game.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No game sequence logs found.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 24,
  },
  placeholderCard: {
    backgroundColor: "rgba(28,28,30,0.7)",
    borderRadius: 18,
    width: "90%",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: "rgba(28,28,30,0.7)",
    borderRadius: 18,
    width: "90%",
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignSelf: "center",
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  metaLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  metaValue: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "65%",
  },
  liveText: {
    color: "#FF453A",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  teamContainer: {
    flex: 1,
  },
  teamName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  acronym: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 12,
  },
  scoreText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  gameLogRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  gameLabel: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  gameDuration: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    marginTop: 2,
  },
  winnerBadge: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  winnerLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  leftAlign: {
    textAlign: "left",
  },
  rightAlign: {
    textAlign: "right",
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
  },
});

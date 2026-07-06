import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { CSMatchResponse } from "@/api/pandascore-types";
import { Match as HLTVMatch, HeadToHeadEntry } from "@/api/hltv-types";
import { formatMapName } from "@/utils/maps";

interface SummaryProps {
  match: CSMatchResponse | null | undefined;
  HLTVData?: HLTVMatch | null;
  teamAColor?: string;
  teamBColor?: string;
}

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

export const Summary = ({ match, HLTVData, teamAColor = "#3C9FFE", teamBColor = "#3C9FFE" }: SummaryProps) => {
  if (!match) {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>Loading match data...</Text>
      </View>
    );
  }

  const teamA = match.opponents?.[0]?.opponent;
  const teamB = match.opponents?.[1]?.opponent;

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
    <View style={styles.container}>
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

            let roundScoreA = 0;
            let roundScoreB = 0;

            if (game.rounds_score && game.rounds_score.length > 0) {
              roundScoreA =
                game.rounds_score.find((r) => r.team_id === teamA.id)?.score ??
                0;
              roundScoreB =
                game.rounds_score.find((r) => r.team_id === teamB.id)?.score ??
                0;
            }

            const hltvMap = HLTVData?.maps?.[game.position - 1];
            if (!game.rounds_score?.length && hltvMap?.result && HLTVData) {
              const normalize = (s: string) =>
                s.toLowerCase().replace(/[^a-z0-9]/g, "");
              const aName = normalize(teamA.name ?? "");
              const t1Name = normalize(HLTVData.team1?.name ?? "");
              const t2Name = normalize(HLTVData.team2?.name ?? "");
              const teamAIsTeam1 =
                aName === t1Name ||
                aName.includes(t1Name) ||
                t1Name.includes(aName);
              const teamAIsTeam2 =
                aName === t2Name ||
                aName.includes(t2Name) ||
                t2Name.includes(aName);
              if (teamAIsTeam1 && !teamAIsTeam2) {
                roundScoreA = hltvMap.result.team1TotalRounds;
                roundScoreB = hltvMap.result.team2TotalRounds;
              } else if (teamAIsTeam2) {
                roundScoreA = hltvMap.result.team2TotalRounds;
                roundScoreB = hltvMap.result.team1TotalRounds;
              }
            }
            const mapName =
              formatMapName(hltvMap?.name) || `Game ${game.position}`;
            return (
              <View key={game.id} style={styles.gameLogRow}>
                <View style={styles.gameMapColumn}>
                  <View style={styles.mapRow}>
                    <View style={styles.mapNumberBadge}>
                      <Text style={styles.mapNumberText}>{game.position}</Text>
                    </View>
                    <View style={styles.mapNameContainer}>
                      <Text
                        style={styles.gameLabel}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {mapName}
                      </Text>
                      {game.length ? (
                        <Text style={styles.gameDuration}>
                          {formatDuration(game.length)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
                <Text style={styles.gameScoreColumn}>
                  {roundScoreA} - {roundScoreB}
                </Text>
                <View style={styles.gameWinnerColumn}>
                  <View style={styles.winnerBadge}>
                    <Text
                      style={styles.winnerLabel}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {game.status === "finished"
                        ? `Winner: ${winnerName}`
                        : game.status
                          ? game.status
                              .replace(/_/g, " ")
                              .charAt(0)
                              .toUpperCase() +
                            game.status.replace(/_/g, " ").slice(1).toLowerCase()
                          : ""}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No game sequence logs found.</Text>
        )}
      </View>

      {/* MAP VETOES CARD */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Map Vetoes</Text>
        {HLTVData?.vetoes && HLTVData.vetoes.length > 0 ? (
          HLTVData.vetoes.map((veto, idx) => (
            <View key={idx} style={styles.gameLogRow}>
              <View style={{ flexShrink: 1 }}>
                <Text
                  style={styles.gameLabel}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatMapName(veto.map)}
                </Text>
                {veto.team ? (
                  <Text
                    style={styles.gameDuration}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {veto.team.name}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.vetoBadge,
                  veto.type === "picked" && styles.vetoPickedBadge,
                  veto.type === "removed" && styles.vetoBannedBadge,
                  veto.type === "leftover" && styles.vetoDeciderBadge,
                  { marginLeft: "auto" },
                ]}
              >
                <Text
                  style={[
                    styles.vetoLabel,
                    veto.type === "picked" && styles.vetoPickedLabel,
                    veto.type === "removed" && styles.vetoBannedLabel,
                    veto.type === "leftover" && styles.vetoDeciderLabel,
                  ]}
                >
                  {veto.type === "leftover"
                    ? "Decider"
                    : veto.type === "removed"
                      ? "Banned"
                      : "Picked"}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No map veto data available.</Text>
        )}
      </View>

      {/* FEATURED PLAYERS CARD */}
      {HLTVData?.highlightedPlayers?.team1 && HLTVData?.highlightedPlayers?.team2 ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Featured Players</Text>
          <View style={styles.featuredRow}>
            <View style={styles.featuredPlayer}>
              <Text style={styles.featuredPlayerName}>
                {HLTVData.highlightedPlayers.team1.name}
              </Text>
              {HLTVData.highlightedPlayers.team1.stats ? (
                <View style={styles.featuredStats}>
                  <View style={styles.featuredStat}>
                    <Text style={styles.featuredStatValue}>
                      {HLTVData.highlightedPlayers.team1.stats.killsPerRound?.toFixed(2) ?? "-"}
                    </Text>
                    <Text style={styles.featuredStatLabel}>KPR</Text>
                  </View>
                  <View style={styles.featuredStat}>
                    <Text style={styles.featuredStatValue}>
                      {HLTVData.highlightedPlayers.team1.stats.deathsPerRound?.toFixed(2) ?? "-"}
                    </Text>
                    <Text style={styles.featuredStatLabel}>DPR</Text>
                  </View>
                  <View style={styles.featuredStat}>
                    <Text style={styles.featuredStatValue}>
                      {HLTVData.highlightedPlayers.team1.stats.impact?.toFixed(2) ?? "-"}
                    </Text>
                    <Text style={styles.featuredStatLabel}>Impact</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.featuredNoStats}>No stats available</Text>
              )}
            </View>
            <Text style={styles.featuredVS}>VS</Text>
            <View style={styles.featuredPlayer}>
              <Text style={styles.featuredPlayerName}>
                {HLTVData.highlightedPlayers.team2.name}
              </Text>
              {HLTVData.highlightedPlayers.team2.stats ? (
                <View style={styles.featuredStats}>
                  <View style={styles.featuredStat}>
                    <Text style={styles.featuredStatValue}>
                      {HLTVData.highlightedPlayers.team2.stats.killsPerRound?.toFixed(2) ?? "-"}
                    </Text>
                    <Text style={styles.featuredStatLabel}>KPR</Text>
                  </View>
                  <View style={styles.featuredStat}>
                    <Text style={styles.featuredStatValue}>
                      {HLTVData.highlightedPlayers.team2.stats.deathsPerRound?.toFixed(2) ?? "-"}
                    </Text>
                    <Text style={styles.featuredStatLabel}>DPR</Text>
                  </View>
                  <View style={styles.featuredStat}>
                    <Text style={styles.featuredStatValue}>
                      {HLTVData.highlightedPlayers.team2.stats.impact?.toFixed(2) ?? "-"}
                    </Text>
                    <Text style={styles.featuredStatLabel}>Impact</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.featuredNoStats}>No stats available</Text>
              )}
            </View>
          </View>
        </View>
      ) : null}

      {/* POTENTIAL OUTCOMES CARD */}
      {HLTVData?.headToHead && HLTVData.headToHead.length > 0 && (() => {
        const normalize = (s: string) =>
          s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const hltvT1Name = HLTVData.team1?.name ?? "Team 1";
        const hltvT2Name = HLTVData.team2?.name ?? "Team 2";
        const nt1 = normalize(hltvT1Name);
        const nt2 = normalize(hltvT2Name);

        let weightedT1Wins = 0;
        let weightedTotal = 0;
        for (const h2h of HLTVData.headToHead) {
          const parts = h2h.result?.split("-").map((s: string) => parseInt(s.trim(), 10));
          if (!parts || parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) continue;
          const [s1, s2] = parts;
          const total = s1 + s2;
          if (total === 0) continue;
          const winnerName = h2h.winner?.name;
          if (!winnerName) continue;
          const nw = normalize(winnerName);

          const diff = Math.abs(s1 - s2);
          const weight = diff / total;
          weightedTotal += weight;

          const winnerIsT1 = nw === nt1 || nw.includes(nt1) || nt1.includes(nw);
          if (winnerIsT1) {
            weightedT1Wins += weight;
            console.log(`[H2H] ${hltvT1Name} won ${s1}-${s2} (weight: ${weight.toFixed(2)})`);
          } else {
            console.log(`[H2H] ${hltvT2Name} won ${s1}-${s2} (weight: ${weight.toFixed(2)})`);
          }
        }
        const t1Pct = weightedTotal > 0 ? (weightedT1Wins / weightedTotal) * 100 : 50;
        const t2Pct = 100 - t1Pct;
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Historical Win Data</Text>
            <View style={styles.h2hRow}>
              <View style={styles.h2hTeamCol}>
                <Text style={styles.h2hTeamName} numberOfLines={1}>{hltvT1Name}</Text>
                <Text style={styles.h2hPct}>{t1Pct.toFixed(0)}%</Text>
              </View>
              <View style={[styles.h2hBarOuter, { backgroundColor: teamBColor }]}>
                <View style={[styles.h2hBarFill, { width: `${t1Pct}%`, backgroundColor: teamAColor }]} />
              </View>
              <View style={styles.h2hTeamCol}>
                <Text style={styles.h2hTeamName} numberOfLines={1}>{hltvT2Name}</Text>
                <Text style={styles.h2hPct}>{t2Pct.toFixed(0)}%</Text>
              </View>
            </View>
            <Text style={styles.h2hMeta}>
              Based on {HLTVData.headToHead.length} previous match{HLTVData.headToHead.length !== 1 ? "es" : ""}
            </Text>
          </View>
        );
      })()}

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
            {match.status
              ? match.status.replace(/_/g, " ").charAt(0).toUpperCase() +
                match.status.replace(/_/g, " ").slice(1).toLowerCase()
              : ""}
          </Text>
        </View>
      </View>
    </View>
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
    flexShrink: 1,
    textAlign: "right",
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
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  gameMapColumn: {
    width: "40%",
  },
  mapRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  mapNumberText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
  },
  mapNameContainer: {
    flexShrink: 1,
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
  gameScoreColumn: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    width: 64,
    textAlign: "center",
  },
  gameWinnerColumn: {
    flex: 1,
    alignItems: "flex-end",
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
  vetoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vetoLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  vetoPickedBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.2)",
  },
  vetoPickedLabel: {
    color: "#34C759",
  },
  vetoBannedBadge: {
    backgroundColor: "rgba(255, 69, 58, 0.2)",
  },
  vetoBannedLabel: {
    color: "#FF453A",
  },
  vetoDeciderBadge: {
    backgroundColor: "rgba(255, 204, 0, 0.15)",
  },
  vetoDeciderLabel: {
    color: "#FFCC00",
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
  featuredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featuredPlayer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  featuredPlayerName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  featuredStats: {
    alignItems: "center",
    gap: 4,
  },
  featuredStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featuredStatValue: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  featuredStatLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "500",
  },
  featuredVS: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    fontWeight: "700",
  },
  featuredNoStats: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    fontStyle: "italic",
  },
  h2hRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  h2hTeamCol: {
    alignItems: "center",
    minWidth: 80,
  },
  h2hTeamName: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  h2hPct: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  h2hBarOuter: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  h2hBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#3C9FFE",
  },
  h2hMeta: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    textAlign: "center",
  },
});

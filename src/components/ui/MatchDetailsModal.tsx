import React, { useState, useMemo, useCallback } from "react";
import teamDictionaryRaw from "@/constants/team-dictionary.json";

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Spacing } from "@/constants/theme";
import { CSMatchResponse, Game } from "@/api/pandascore-types";
import { Summary } from "./MatchDetailsModal/Summary";
import { PlayByPlay } from "./MatchDetailsModal/PlayByPlay";
import { StreamView } from "./MatchDetailsModal/StreamView";
import { useScrollViewOffset } from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface MatchDetailModalProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  matchData: CSMatchResponse | null | undefined;
  gamesData?: Game[] | null;
}

const SEGMENTS = 30;

// Type definition matching the output of your pagination scraper script
interface TeamDictionaryEntry {
  color: string;
  logo: string | null;
}

const teamLookup = teamDictionaryRaw as Record<
  string,
  TeamDictionaryEntry | undefined
>;

// Safe lookup utility supporting strict matching and lower-case fuzzy falling back
const getTeamVisuals = (teamName: string, defaultColor: string) => {
  if (!teamName) return { color: defaultColor, logo: null };

  // 1. Direct exact key lookup
  const exactMatch = teamLookup[teamName];
  if (exactMatch) {
    return {
      color: exactMatch.color,
      logo: exactMatch.logo,
    };
  }

  // 2. Case-insensitive fuzzy scanning
  const normalizedInput = teamName.toLowerCase().trim();
  const foundKey = Object.keys(teamLookup).find(
    (key) =>
      key.toLowerCase().trim() === normalizedInput ||
      normalizedInput.includes(key.toLowerCase()),
  );

  if (foundKey && teamLookup[foundKey]) {
    return {
      color: teamLookup[foundKey]!.color,
      logo: teamLookup[foundKey]!.logo,
    };
  }

  // 3. Fallback values if team isn't stored inside the local file yet
  return { color: defaultColor, logo: null };
};

// Parses a string like "hsl(120, 75%, 50%)" into raw numeric values
const parseHsl = (hslString: string) => {
  const defaultHsl = { h: 22, s: 12, l: 7 };
  if (typeof hslString !== "string") return defaultHsl;

  const matches = hslString.match(/\d+/g);
  if (!matches || matches.length < 3) return defaultHsl;

  return {
    h: parseInt(matches[0], 10),
    s: parseInt(matches[1], 10),
    l: parseInt(matches[2], 10),
  };
};

// Blends two HSL colors together step-by-step
const interpolateHslColor = (color1: string, color2: string, ratio: number) => {
  const c1 = parseHsl(color1);
  const c2 = parseHsl(color2);

  let h1 = c1.h;
  let h2 = c2.h;
  const diff = h2 - h1;

  if (diff > 180) {
    h2 -= 360;
  } else if (diff < -180) {
    h2 += 360;
  }

  let h = Math.round(h1 + (h2 - h1) * ratio);
  const s = Math.round(c1.s + (c2.s - c1.s) * ratio);
  const l = Math.round(c1.l + (c2.l - c1.l) * ratio);

  if (h < 0) h += 360;

  return `hsl(${h}, ${s}%, ${l}%)`;
};

export default function MatchDetailModal({
  bottomSheetModalRef,
  matchData,
  gamesData,
}: MatchDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    "Summary" | "Play-By-Play" | "Live Stream"
  >("Summary");

  const teamA = matchData?.opponents?.[0]?.opponent || {
    id: -1,
    name: "Team A",
    image_url: null,
  };
  const teamB = matchData?.opponents?.[1]?.opponent || {
    id: -2,
    name: "Team B",
    image_url: null,
  };

  const scoreA = matchData?.results?.[0]?.score ?? 4;
  const scoreB = matchData?.results?.[1]?.score ?? 4;

  // Resolve visual configuration values using useMemo
  const teamAVisuals = useMemo(
    () => getTeamVisuals(teamA.name, "hsl(25, 100%, 45%)"),
    [teamA.name],
  );
  const teamBVisuals = useMemo(
    () => getTeamVisuals(teamB.name, "hsl(215, 100%, 55%)"),
    [teamB.name],
  );

  const teamAColor = teamAVisuals.color;
  const teamBColor = teamBVisuals.color;

  // Prefer your dictionary fallback image links over live panda API results if overridden
  const teamALogo = teamAVisuals.logo || teamA.image_url;
  const teamBLogo = teamBVisuals.logo || teamB.image_url;

  // Safely map background segment elements matching generated HSL color configurations
  const gradientSegments = useMemo(
    () =>
      Array.from({ length: SEGMENTS }, (_, i) => ({
        flex: 1,
        backgroundColor: interpolateHslColor(
          teamAColor,
          teamBColor,
          i / (SEGMENTS - 1),
        ),
      })),
    [teamAColor, teamBColor],
  );

  const Background = useCallback(
    (props: { style?: any }) => {
      return (
        <View style={[props.style, styles.modalBackground]}>
          <View style={styles.gradientContainer}>
            {gradientSegments.map((seg, i) => (
              <View key={i} style={seg} />
            ))}
            <View style={styles.darkGradientOverlay} />
          </View>
        </View>
      );
    },
    [gradientSegments],
  );
  // 1. Find the active game (currently running) or fallback to the last game played/playing
  const currentGame = useMemo(() => {
    const source = gamesData ?? matchData?.games;
    if (!source || source.length === 0) return null;

    // Try to find the one actively being played
    const runningGame = source.find((g) => g.status === "running");
    if (runningGame) return runningGame;

    // If none are running (e.g. finished or scheduled), grab the last available game element
    return source[source.length - 1];
  }, [gamesData, matchData?.games]);

  // 2. Extract map name/number info
  const mapLabel = useMemo(() => {
    if (!currentGame) return "MAP 1";
    return `MAP ${currentGame.position}`;
  }, [currentGame]);

  // 3. Extract the round-by-round score for this specific map
  const currentMapScores = useMemo(() => {
    const defaultScores = { scoreA: 0, scoreB: 0 };
    if (!currentGame?.rounds_score || currentGame.rounds_score.length === 0) {
      return defaultScores;
    }

    // Match round scores to team IDs using the order defined in opponents
    const idA = matchData?.opponents?.[0]?.opponent?.id;
    const idB = matchData?.opponents?.[1]?.opponent?.id;

    const roundScoreA =
      currentGame.rounds_score.find((r) => r.team_id === idA)?.score ?? 0;
    const roundScoreB =
      currentGame.rounds_score.find((r) => r.team_id === idB)?.score ?? 0;

    return {
      scoreA: roundScoreA,
      scoreB: roundScoreB,
    };
  }, [currentGame, matchData?.opponents]);

  // 4. Derive per-round winner indicators for the live ticker
  const roundIndicators = useMemo(() => {
    if (!currentGame?.rounds) return [];
    const idA = matchData?.opponents?.[0]?.opponent?.id;
    return currentGame.rounds.map((r) => ({
      key: r.number,
      isTeamA: r.winner_team_id === idA,
      isTeamB: r.winner_team_id !== idA && r.winner_team_id != null,
    }));
  }, [currentGame, matchData?.opponents]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={["65%", "100%"]}
      index={0}
      backgroundComponent={Background}
      handleIndicatorStyle={styles.modalHandle}
    >
      <BottomSheetView style={styles.modalContent}>
        {/* --- HEADER: Game Info --- */}
        <Text style={styles.gameStatusText}>
          {matchData?.status === "running"
            ? "• LIVE"
            : matchData?.status?.toUpperCase() || "LIVE"}
        </Text>
        <Text style={styles.leagueText}>
          {matchData?.league?.name || "Counter Strike"}
        </Text>

        {/* --- SCOREBOARD ROW WITH TEAM LOGOS --- */}
        <View style={styles.scoreboardRow}>
          <View style={styles.teamContainer}>
            <Text style={styles.scoreText}>{scoreA}</Text>
            {teamALogo ? (
              <Image source={{ uri: teamALogo }} style={styles.teamLogo} />
            ) : (
              <View
                style={[
                  styles.teamLogoFallback,
                  { backgroundColor: teamAColor },
                ]}
              >
                <Text style={styles.teamLogoFallbackText}>
                  {teamA.name.slice(0, 2)}
                </Text>
              </View>
            )}
            <Text style={styles.teamName} numberOfLines={1}>
              {teamA.name}
            </Text>
          </View>

          <View style={styles.middleMeta}>
            {/* Displays "MAP 1", "MAP 2", etc. */}
            <Text style={styles.vsText}>{mapLabel}</Text>

            {/* Displays the round score for this map (e.g., "11-9") */}
            <View style={styles.diamondIndicator}>
              <Text style={styles.countText}>
                {`${currentMapScores.scoreA}-${currentMapScores.scoreB}`}
              </Text>
            </View>

            {/* Live round ticker — colored dots showing each round's winner */}
            {roundIndicators.length > 0 && (
              <View style={styles.roundTicker}>
                {roundIndicators.map((r) => (
                  <View
                    key={r.key}
                    style={[
                      styles.roundDot,
                      {
                        backgroundColor: r.isTeamA
                          ? teamAColor
                          : r.isTeamB
                            ? teamBColor
                            : "rgba(255,255,255,0.15)",
                      },
                    ]}
                  />
                ))}
              </View>
            )}

            <Text style={styles.matchTypeText}>
              {matchData?.match_type?.replace("_", " ").toUpperCase() +
                " " +
                (matchData?.number_of_games || "0") || "Best of 3"}
            </Text>
          </View>

          <View style={styles.teamContainer}>
            <Text style={styles.scoreText}>{scoreB}</Text>
            {teamBLogo ? (
              <Image source={{ uri: teamBLogo }} style={styles.teamLogo} />
            ) : (
              <View
                style={[
                  styles.teamLogoFallback,
                  { backgroundColor: teamBColor },
                ]}
              >
                <Text style={styles.teamLogoFallbackText}>
                  {teamB.name.slice(0, 2)}
                </Text>
              </View>
            )}
            <Text style={styles.teamName} numberOfLines={1}>
              {teamB.name}
            </Text>
          </View>
        </View>

        {/* --- TABS SYSTEM --- */}
        <View style={styles.tabContainer}>
          {(["Summary", "Play-By-Play", "Live Stream"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- CONDITIONALLY RENDERED SEGMENT TABS CONTENT --- */}
        {activeTab === "Summary" && <Summary match={matchData} />}

        {activeTab === "Play-By-Play" && <PlayByPlay match={matchData} />}
        {activeTab === "Live Stream" && <StreamView match={matchData} />}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: "#161210",
    borderRadius: 32,
    overflow: "hidden",
  },
  modalHandle: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    width: 36,
    height: 4,
    marginTop: 4,
    zIndex: 10, // Places indicator bar on top of background panels
  },
  modalContent: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  gradientContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // Changed from fixed height to absolute full container dimensions
    flexDirection: "row",
    opacity: 0.16, // Dropped slightly for contrast so text remains readable against bright tones
  },
  darkGradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(22, 18, 16, 0.25)", // Dark overlay layer to guarantee card legibility
  },
  innerContent: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: "center",
  },
  gameStatusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  leagueText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    opacity: 0.7,
  },
  scoreboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  teamContainer: {
    alignItems: "center",
    width: "35%",
  },
  teamLogo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginVertical: 6,
  },
  teamLogoFallback: {
    width: 40,
    height: 40,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  teamLogoFallbackText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 58,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
  },
  teamName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  middleMeta: {
    alignItems: "center",
    width: "30%",
  },
  vsText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  diamondIndicator: {
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 6,
  },
  countText: {
    color: "#8A8A8F",
    fontSize: 11,
    fontWeight: "600",
  },
  matchTypeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.6,
  },
  roundTicker: {
    flexDirection: "row",
    gap: 3,
    marginVertical: 4,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  roundDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  tabButton: {
    paddingVertical: 10,
    marginRight: 24,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  tabText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  placeholderCard: {
    backgroundColor: "rgba(28,28,30,0.7)",
    borderRadius: 18,
    width: "100%",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
});

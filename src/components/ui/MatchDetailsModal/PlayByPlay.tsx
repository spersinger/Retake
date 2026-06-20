import { CSMatchResponse } from "@/api/pandascore-types";
import { Match as HLTVMatch } from "@/api/hltv-types";
import { View, Text, StyleSheet } from "react-native";

interface PlayByPlayProps {
  match: CSMatchResponse | null | undefined;
  HLTVData?: HLTVMatch | null;
}

export const PlayByPlay = ({ match, HLTVData }: PlayByPlayProps) => {
  if (!match) {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>Play by play coming soon.</Text>
      </View>
    );
  }

  return (
    <View style={styles.placeholderCard}>
      <Text style={styles.placeholderText}>Play by play coming soon.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { useRef, useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { useFavorites } from "@/hooks/use-favorites";
import { Spacing } from "@/constants/theme";

import AntDesign from "@expo/vector-icons/AntDesign";

export interface Player {
  id: number;
  name: string;
  active: boolean;
}

export interface TeamData {
  id: number;
  name: string;
  acronym: string | null;
  location: string | null;
  image_url: string | null;
  dark_mode_image_url: string | null;
  current_videogame: {
    id: number;
    name: string;
    slug: string;
  } | null;
  players: Player[];
}

interface TeamProps {
  team: TeamData;
  onPress?: (team: TeamData) => void;
}

export const Team = ({ team, onPress }: TeamProps) => {
  const theme = useTheme();
  const logoUri = team.dark_mode_image_url ?? team.image_url;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const favorite = isFavorite(team.id);

  const handleFavoritePress = () => {
    toggleFavorite(team);
    if (!favorite) {
      setIsAnimating(true);
    }
  };

  return (
    <Pressable
      onPress={() => onPress?.(team)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {logoUri ? (
        <Image
          source={{ uri: logoUri }}
          style={styles.logo}
          contentFit="contain"
        />
      ) : (
        <View
          style={[
            styles.logoFallback,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <ThemedText style={styles.logoFallbackText}>
            {team.acronym?.slice(0, 2) ?? team.name.slice(0, 2)}
          </ThemedText>
        </View>
      )}

      <ThemedView style={styles.info}>
        <ThemedText style={styles.name}>{team.name}</ThemedText>
        <ThemedView style={styles.metaRow}>
          {team.acronym ? (
            <ThemedText themeColor="textSecondary" style={styles.meta}>
              {team.acronym}
            </ThemedText>
          ) : null}

          {team.location ? (
            <ThemedText themeColor="textSecondary" style={styles.meta}>
              {team.location}
            </ThemedText>
          ) : null}

          {team.players.length > 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.meta}>
              {team.players.length} player{team.players.length === 1 ? "" : "s"}
            </ThemedText>
          ) : null}
        </ThemedView>
      </ThemedView>

      <Pressable onPress={handleFavoritePress}>
        <ThemedView style={styles.heartContainer}>
          {!isAnimating ? (
            <AntDesign
              name="heart"
              size={24}
              color={favorite ? "#ff3144" : "white"}
            />
          ) : (
            <LottieView
              source={require("../../lottie/heart-anim.json")}
              loop={false}
              autoPlay
              onAnimationFinish={() => setIsAnimating(false)}
            />
          )}
        </ThemedView>
      </Pressable>
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
  },
  info: {
    backgroundColor: "#0000",
    flex: 1,
    gap: Spacing.one,
  },
  name: {
    fontWeight: "600",
  },
  metaRow: {
    backgroundColor: "#0000",
    flexDirection: "row",
    gap: Spacing.two,
  },
  meta: {
    fontSize: 12,
  },
  heartContainer: {
    backgroundColor: "#0000",
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
});

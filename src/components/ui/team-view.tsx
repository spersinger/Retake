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

export const FavoriteCard = ({ team, onPress }: TeamProps) => {
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
      style={({ pressed }) => [styles.favCard, pressed && styles.pressed]}
    >
      <View style={styles.favLogoWrap}>
        {logoUri ? (
          <Image
            source={{ uri: logoUri }}
            style={styles.favLogo}
            contentFit="contain"
          />
        ) : (
          <View
            style={[
              styles.favLogoFallback,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <ThemedText style={styles.favLogoFallbackText}>
              {team.acronym?.slice(0, 2) ?? team.name.slice(0, 2)}
            </ThemedText>
          </View>
        )}
        <Pressable onPress={handleFavoritePress} style={styles.favHeartBadge}>
          {!isAnimating ? (
            <AntDesign
              name="heart"
              size={14}
              color={favorite ? "#ff3144" : "#ffffff"}
            />
          ) : (
            <LottieView
              source={require("../../lottie/heart-anim.json")}
              loop={false}
              autoPlay
              style={styles.favHeartLottie}
              onAnimationFinish={() => setIsAnimating(false)}
            />
          )}
        </Pressable>
      </View>
      <ThemedText numberOfLines={1} style={styles.favName}>
        {team.name}
      </ThemedText>
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
  favCard: {
    width: 96,
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.two,
  },
  favLogoWrap: {
    position: "relative",
    width: 64,
    height: 64,
  },
  favLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  favLogoFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  favLogoFallbackText: {
    fontSize: 18,
    fontWeight: "700",
  },
  favHeartBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1b2440",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0a0e1f",
  },
  favHeartLottie: {
    width: 26,
    height: 26,
  },
  favName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 96,
  },
});

import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { useFavorites } from "@/hooks/use-favorites";
import { Spacing } from "@/constants/theme";

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
  const favorite = isFavorite(team.id);

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

      <Pressable
        onPress={() => toggleFavorite(team)}
        style={[
          styles.subscribeButton,
          favorite ? styles.subscribeButtonActive : styles.subscribeButtonInactive,
        ]}
      >
        <ThemedText
          style={[
            styles.subscribeText,
            favorite ? styles.subscribeTextActive : styles.subscribeTextInactive,
          ]}
        >
          {favorite ? "Subscribed" : "Subscribe"}
        </ThemedText>
      </Pressable>
    </Pressable>
  );
};

export const FavoriteCard = ({ team, onPress }: TeamProps) => {
  const theme = useTheme();
  const logoUri = team.dark_mode_image_url ?? team.image_url;
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(team.id);

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
      </View>
      <ThemedText numberOfLines={1} style={styles.favName}>
        {team.name}
      </ThemedText>
      <Pressable
        onPress={() => toggleFavorite(team)}
        style={[
          styles.favSubscribeButton,
          favorite ? styles.subscribeButtonActive : styles.subscribeButtonInactive,
        ]}
      >
        <ThemedText
          style={[
            styles.favSubscribeText,
            favorite ? styles.subscribeTextActive : styles.subscribeTextInactive,
          ]}
        >
          {favorite ? "Unsubscribe" : "Subscribe"}
        </ThemedText>
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
  subscribeButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  subscribeButtonActive: {
    backgroundColor: "rgba(255, 49, 68, 0.15)",
    borderColor: "#ff3144",
  },
  subscribeButtonInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  subscribeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  subscribeTextActive: {
    color: "#ff3144",
  },
  subscribeTextInactive: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  favCard: {
    width: 108,
    alignItems: "center",
    gap: 6,
    padding: Spacing.two,
  },
  favLogoWrap: {
    width: 64,
    height: 64,
  },
  favLogo: {
    width: 64,
    height: 64,
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
  favSubscribeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  favSubscribeText: {
    fontSize: 9,
    fontWeight: "600",
  },
  favName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 96,
  },
});

import { CSMatchResponse, LiveStream } from "@/api/pandascore-types";
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";

// If you aren't using Expo or target Web exclusively, you can conditionally import this
// or keep it safe with a try/catch. React Native Web safely ignores WebView if not rendered.
let WebView: any;
try {
  WebView = require("react-native-webview").WebView;
} catch (e) {
  // Fallback for environment systems where native modules aren't linked
}

interface StreamViewProps {
  match: CSMatchResponse | null | undefined;
}

export const StreamView = ({ match }: StreamViewProps) => {
  // 1. Extract the best stream from the array
  // Create a safe date object from the API string
  const matchStartDate = match?.begin_at ? new Date(match.begin_at) : null;
  const currentDate = new Date(); // Right now

  // 1. If the match is scheduled for the FUTURE (e.g., June 17, 2026)
  if (matchStartDate && matchStartDate > currentDate) {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>Match has not started yet.</Text>
      </View>
    );
  }

  // 2. If you want to check if it already ended based on your API status
  if (match?.status === "finished") {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>
          Game ended, no live stream available.
        </Text>
      </View>
    );
  }
  const activeStream = useMemo((): LiveStream | null => {
    if (!match?.streams_list || match.streams_list.length === 0) return null;

    // Priority 1: Main English stream
    const mainEnglish = match.streams_list.find(
      (s) => s.main && s.language === "en",
    );
    if (mainEnglish) return mainEnglish;

    // Priority 2: Any main stream
    const anyMain = match.streams_list.find((s) => s.main);
    if (anyMain) return anyMain;

    // Priority 3: First official broadcast stream available
    const officialStream = match.streams_list.find((s) => s.official);
    if (officialStream) return officialStream;

    // Priority 4: Fallback to whatever stream is listed first
    return match.streams_list[0];
  }, [match?.streams_list]);

  // Handle a scenario where no stream data is provided by PandaScore
  if (!match || !activeStream) {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>
          No live streams found for this match.
        </Text>
      </View>
    );
  }

  const handleOpenRawUrl = () => {
    if (activeStream.raw_url) {
      Linking.openURL(activeStream.raw_url).catch((err) =>
        console.error("Failed to open stream URL:", err),
      );
    }
  };

  // 2. Render optimized player layout depending on target deployment platform
  if (Platform.OS === "web") {
    if (!activeStream.embed_url) {
      return (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Embedded player unavailable.
          </Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleOpenRawUrl}
          >
            <Text style={styles.linkButtonText}>
              Watch on External Platform ↗
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.videoContainer}>
        {/* Standard safe iframe embed configuration for web browsers */}
        <iframe
          src={activeStream.embed_url}
          style={styles.webPlayer}
          allowFullScreen
          scrolling="no"
          frameBorder="0"
        />
        <Text style={styles.streamMetaText}>
          Language: {activeStream.language.toUpperCase()}{" "}
          {activeStream.official ? "• Official" : ""}
        </Text>
      </View>
    );
  }

  // 3. Native Platform Output (iOS/Android Mobile UI)
  return (
    <View style={styles.nativeContainer}>
      {WebView && activeStream.embed_url ? (
        <View style={styles.nativePlayerWrapper}>
          <WebView
            source={{ uri: activeStream.embed_url }}
            style={styles.nativePlayer}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      ) : (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Live broadcast available in {activeStream.language.toUpperCase()}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.linkButton} onPress={handleOpenRawUrl}>
        <Text style={styles.linkButtonText}>Open Stream App ↗</Text>
      </TouchableOpacity>
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
  videoContainer: {
    width: "80%",
    aspectRatio: 16 / 9, // Forces responsive HD frame layouts
    backgroundColor: "#000000",
    borderRadius: 16,
    overflow: "hidden",
  },
  webPlayer: {
    width: "100%",
    height: "100%",
    border: "none",
  },
  nativeContainer: {
    width: "100%",
    alignItems: "center",
  },
  nativePlayerWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  nativePlayer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  linkButton: {
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  linkButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  streamMetaText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 4,
  },
});

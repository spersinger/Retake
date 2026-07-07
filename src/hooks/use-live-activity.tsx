import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { requestLiveActivity } from "@/api/notifications";
import MatchActivity, {
  type MatchActivityProps,
} from "@/widgets/MatchActivity";
import { addPushToStartTokenListener, type LiveActivity } from "expo-widgets";

export function useLiveActivity() {
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const pushTokenRef = useRef<string | null>(null);
  const activityRef = useRef<LiveActivity<MatchActivityProps> | null>(null);

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    async function setup() {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      pushTokenRef.current = tokenData.data;
    }
    setup();

    // App-wide token, lets the backend start a Live Activity remotely via APNs
    const pushToStartSubscription = addPushToStartTokenListener((event) => {
      console.log("Push-to-start token:", event.activityPushToStartToken);
    });

    return () => {
      pushToStartSubscription.remove();
    };
  }, []);

  const startActivity = useCallback(async (matchId: number) => {
    setIsStarting(true);

    // Start the Live Activity locally, regardless of backend/push result
    try {
      const instance = MatchActivity.start({
        team1: "Team 1",
        team2: "Team 2",
        team1Score: 0,
        team2Score: 0,
        round: 1,
        totalRounds: 24,
        status: "live",
        map: "Inferno",
      });
      activityRef.current = instance;
      setActiveMatchId(matchId);

      // Best-effort: grab the per-activity push token for remote updates later
      instance
        .getPushToken()
        .then((pushToken) => {
          if (pushToken) console.log("Live Activity push token:", pushToken);
        })
        .catch((e) =>
          console.log("Failed to get Live Activity push token:", e),
        );
    } catch (e) {
      console.log("Live Activity start failed:", e);
    }

    // Separately, best-effort notify the backend (for push-to-update later) — failure here shouldn't block anything
    try {
      await requestLiveActivity(
        matchId,
        pushTokenRef.current ?? undefined,
        "start",
      );
    } catch (e) {
      console.log("Backend push registration failed (non-fatal):", e);
    }

    setIsStarting(false);
  }, []);

  const stopActivity = useCallback(async () => {
    const matchId = activeMatchId;
    if (!matchId) return;

    try {
      await requestLiveActivity(
        matchId,
        pushTokenRef.current ?? undefined,
        "stop",
      );
      setActiveMatchId(null);

      if (activityRef.current) {
        try {
          await activityRef.current.end("default");
          activityRef.current = null;
        } catch (e) {
          console.log("Live Activity end failed:", e);
        }
      }
    } catch {
      // ignore
    }
  }, [activeMatchId]);

  return {
    activeMatchId,
    pushToken: pushTokenRef.current,
    isStarting,
    startActivity,
    stopActivity,
  };
}

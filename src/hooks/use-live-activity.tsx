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

  const startActivity = useCallback(
    async (matchId: number, props: MatchActivityProps) => {
      setIsStarting(true);
      try {
        // LiveActivityFactory.start(props, url?) takes the content-state
        // object FIRST. The system generates the activity ID; we never pass
        // matchId here (it was previously passed as `props`, discarding the
        // real props and sending the id string as the content state).
        const instance = MatchActivity.start(props);
        activityRef.current = instance;
        setActiveMatchId(matchId);
      } catch (e) {
        console.log("Live Activity start failed:", e);
      }
      try {
        await requestLiveActivity(
          matchId,
          pushTokenRef.current ?? undefined,
          "start",
          {
            team1Score: props.team1Score,
            team2Score: props.team2Score,
            currentRound: props.roundScoreA,
            totalRounds: props.roundScoreA + props.roundScoreB,
            status: "running",
            mapName: props.mapLabel,
          },
        );
      } catch (e) {
        console.log("Backend push registration failed (non-fatal):", e);
      }
      setIsStarting(false);
    },
    [],
  );
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

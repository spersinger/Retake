import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { requestLiveActivity } from "@/api/notifications";

export function useLiveActivity() {
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const pushTokenRef = useRef<string | null>(null);

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
  }, []);

  const startActivity = useCallback(async (matchId: number) => {
    setIsStarting(true);
    try {
      await requestLiveActivity(matchId, pushTokenRef.current ?? undefined, "start");
      setActiveMatchId(matchId);
    } catch {
      // ignore
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stopActivity = useCallback(async () => {
    const matchId = activeMatchId;
    if (!matchId) return;
    try {
      await requestLiveActivity(matchId, pushTokenRef.current ?? undefined, "stop");
      setActiveMatchId(null);
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

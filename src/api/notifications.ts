import axios from "axios";

const RETAKE_SERVER_BASE_URL =
  process.env.EXPO_PUBLIC_RETAKE_SERVER_URL || "http://localhost:3003";

export interface StartLiveActivityRequest {
  id: number;
  pushToken?: string;
  action: "start" | "stop" | "update";
  contentState?: {
    team1Score: number;
    team2Score: number;
    currentRound: number;
    totalRounds: number;
    status: string;
    mapName: string;
  };
}

// For testing purposes - provides a mock push token when a real one is not needed
// Format matches ExpoPushToken[<alphanumerics_underscore_hyphen>]
const getMockPushToken = (): string => {
  // Use a consistent mock value for testing
  return "ExponentPushToken[test-mock-token-12345]";
};

export const requestLiveActivity = async (
  matchId: number,
  pushToken?: string,
  action: "start" | "stop" | "update" = "start",
  contentState?: StartLiveActivityRequest["contentState"],
) => {
  try {
    const body: StartLiveActivityRequest = {
      id: matchId,
      action,
    };
    if (!pushToken) {
      pushToken = getMockPushToken();
      console.log("Using mock push token:", pushToken);
    }
    body.pushToken = pushToken;
    if (contentState) {
      body.contentState = contentState;
    }

    const response = await axios.post(
      `${RETAKE_SERVER_BASE_URL}/server/notif/request`,
      body,
    );
    console.log(`Live Activity ${action} for match ${matchId}:`, response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Live Activity ${action} failed:`,
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.error(`Live Activity ${action} failed:`, error);
    }
    return null;
  }
};

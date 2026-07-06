import axios from "axios";

const RETAKE_SERVER_BASE_URL =
  process.env.EXPO_PUBLIC_RETAKE_SERVER_URL || "http://localhost:3003";

export interface StartLiveActivityRequest {
  id: number;
  pushToken?: string;
  action: "start" | "stop";
}

export const requestLiveActivity = async (
  matchId: number,
  pushToken?: string,
  action: "start" | "stop" = "start",
) => {
  try {
    const body: StartLiveActivityRequest = {
      id: matchId,
      action,
    };
    if (pushToken) {
      body.pushToken = pushToken;
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

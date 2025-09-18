import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://app.bmgjewellers.com/api/v1";

export interface Notification {
  Id: number;
  UserId: number;
  FcmToken: string;
  Title: string;
  Message: string;
  ImageUrl: string;
  Status: string;
  CreatedAt: string;
  SentAt: string;
  DeviceId: number;
}

/**
 * Fetch notifications using fetch API
 * Gets userId from AsyncStorage
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const userId = await AsyncStorage.getItem("user_id");

    if (!userId) {
      console.warn("⚠️ No userId found in AsyncStorage");
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }
    return await response.json();
  } catch (error: any) {
    console.error("❌ Error fetching notifications:", error.message || error);
    return [];
  }
};

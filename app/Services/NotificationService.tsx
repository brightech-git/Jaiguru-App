import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

// ⚡ Foreground notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ✅ Get Expo push token
export async function registerForPushNotificationsAsync() {
  let token: string | null = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return null;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;

    console.log("📱 Expo Push Token:", token);

    // ✅ Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
      });
    }

    return token;
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return null;
}

// ✅ Send test push via Expo
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    channelId: "default", // ✅ required for Android
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log("📤 Push response:", data);
    return data;
  } catch (err) {
    console.error("❌ Push send error:", err);
    throw err;
  }
}

// ✅ Register device + token to your backend
export async function registerDeviceToken(userId: string, expoToken: string) {
  try {
    const payload = {
      deviceId: `mobile-${Device.osInternalBuildId || Date.now()}`, // unique per device
      deviceType: "mobile",
      expoToken,
      fcmToken: "",
      userId: userId.toString(),
    };

    console.log("🚀 Sending device payload:", payload);

    const response = await fetch(
      "https://app.bmgjewellers.com/api/v1/device/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server error ${response.status}: ${text}`);
    }

    const result = await response.text();
    console.log("✅ Device register response:", result);
    return result;
  } catch (err) {
    console.error("❌ Device registration error:", err);
    throw err;
  }
}

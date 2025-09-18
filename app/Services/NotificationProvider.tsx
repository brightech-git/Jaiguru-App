// app/Components/NotificationHandler.tsx
import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { registerForPushNotificationsAsync, registerDeviceToken } from "../Services/NotificationService";

const NotificationHandler = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.login);

  useEffect(() => {
    // Setup notification listeners
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📩 Notification received:", notification);
      }
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("👆 Notification tapped:", response);
    });

    // Register for push notifications if user is logged in
    const registerNotifications = async () => {
      if (user && user.id) {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            // Send token to your backend
            await registerDeviceToken(user.id, token);
          }
        } catch (error) {
          console.error("Failed to register for push notifications:", error);
        }
      }
    };

    registerNotifications();

    return () => {
      subscription.remove();
      responseSub.remove();
    };
  }, [user, dispatch]);

  return null; // This component doesn't render anything
};

export default NotificationHandler;
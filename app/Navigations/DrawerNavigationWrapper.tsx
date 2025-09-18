// app/Components/DrawerNavigationWrapper.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { registerForPushNotificationsAsync, registerDeviceToken } from "../Services/NotificationService";

const DrawerNavigationWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.login);

  useEffect(() => {
    // Register for push notifications when drawer is opened and user is logged in
    const registerNotifications = async () => {
      if (user && user.id) {
        try {
          console.log("Registering for push notifications...");
          const token = await registerForPushNotificationsAsync();
          if (token) {
            console.log("Push token obtained:", token);
            // Send token to your backend
            await registerDeviceToken(user.id, token);
          }
        } catch (error) {
          console.error("Failed to register for push notifications:", error);
        }
      } else {
        console.log("User not logged in, skipping push notification registration");
      }
    };

    registerNotifications();
  }, [user, dispatch]);

  return <>{children}</>;
};

export default DrawerNavigationWrapper;
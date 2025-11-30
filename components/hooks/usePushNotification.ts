import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    } as Notifications.NotificationBehavior),
});

export function usePushNotification() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const [notificationResponse, setNotificationResponse] =
    useState<Notifications.NotificationResponse>();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("알림 권한을 허용해야 알림을 받을 수 있습니다!");
        return;
      }

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ||
          Constants.easConfig?.projectId;

        if (!projectId) {
          console.log(
            "Project ID not found in app.json. Check 'eas.projectId'"
          );
        }

        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
          })
        ).data;

        console.log("🔥 내 엑스포 푸시 토큰:", token);
      } catch (e) {
        console.error("토큰 발급 실패:", e);
      }
    } else {
      alert(
        "에뮬레이터에서는 푸시 알림이 안 됩니다. 실제 폰으로 테스트하세요."
      );
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("알림 클릭함:", response);
        setNotificationResponse(response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { expoPushToken, notification, notificationResponse };
}

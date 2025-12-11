// hooks/useGoogleAuth.tsx
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../api/services/chatApi";
import { useTranslation } from "react-i18next";

GoogleSignin.configure({
  webClientId:
    "358721642016-j5hcv6tjn6rvu04hk65qokap8hulhlgv.apps.googleusercontent.com",
  offlineAccess: true,
  scopes: [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
  ],
});

export function useGoogleAuth() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, logout } = useAuth();
  const { t } = useTranslation();

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      try {
        await GoogleSignin.signOut();
      } catch (e) {}

      const response = await GoogleSignin.signIn();

      if (!response || response.type === "cancelled") {
        console.log("User cancelled login");
        return;
      }

      const { idToken, user } = response.data || (response as any);

      if (!idToken) {
        console.log("No idToken - possibly cancelled");
        return;
      }

      const tokens = await GoogleSignin.getTokens();
      const googleAccessToken = tokens.accessToken;

      console.log(" 구글 ID Token (백엔드용):", idToken ? "있음" : "없음");
      console.log(
        " 구글 Access Token (캘린더용):",
        googleAccessToken ? "있음" : "없음"
      );

      if (!idToken) {
        Alert.alert(t("auth.error"), t("auth.googleTokenError"));
        return;
      }

      await AsyncStorage.setItem("googleAccessToken", googleAccessToken);

      console.log("백엔드 로그인 요청 중...");
      const res = await apiClient.post("/api/auth/google/login", { idToken });

      const data = res.data;
      console.log(
        " 백엔드 응답 user 객체:",
        JSON.stringify(data.user, null, 2)
      );

      console.log(" 백엔드에서 받은 accessToken:", data.accessToken);
      console.log(" 토큰 타입:", typeof data.accessToken);
      console.log(" 토큰 길이:", data.accessToken?.length);

      await login(data.accessToken, data.user);
      if (data.user.usernameSet) {
        await new Promise<void>((resolve) => {
          Alert.alert(
            t("auth.loginSuccess"),
            t("auth.welcomeMessage", { username: data.user.username }),
            [{ text: t("common.confirm"), onPress: () => resolve() }]
          );
        });
      }
      navigation.navigate("MainTabs");

      const savedToken = await AsyncStorage.getItem("accessToken");
      console.log(" AsyncStorage에 저장된 토큰:", savedToken);
      console.log(" 저장 성공 여부:", savedToken === data.accessToken);

      return response;
    } catch (error: any) {
      console.log(" 로그인 에러:", error);
      console.log(" 에러 코드:", error.code);

      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === statusCodes.IN_PROGRESS ||
        error.code === "getTokens" ||
        error.message?.toLowerCase().includes("cancel") ||
        error.message?.includes("getTokens")
      ) {
        console.log("User cancelled or in progress");
        return;
      }

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(t("auth.error"), t("auth.playServicesError"));
        return;
      }

      console.error("Login Error:", error);
      Alert.alert(t("auth.loginFailed"), t("auth.serverError"));
    }
  };

  const signOut = async () => {
    try {
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.log("구글 로그아웃 중 에러(무시 가능):", e);
      }

      await AsyncStorage.removeItem("googleAccessToken");
      await logout();

      console.log(" 통합 로그아웃 완료");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return {
    signIn,
    signOut,
  };
}

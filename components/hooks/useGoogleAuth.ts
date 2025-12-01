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

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.11:8080";

console.log("🚀 현재 사용 중인 백엔드 URL:", API_URL);

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

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      // 이전 로그인 세션 완전히 끊기 (계정 선택창 강제)
      try {
        await GoogleSignin.revokeAccess();
      } catch (e) {
        // 이전 세션이 없으면 에러나는데 무시
      }
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // 무시
      }

      // 1. 구글 로그인 시도
      const response = await GoogleSignin.signIn();

      // 2. 데이터 추출
      const { idToken, user } = response.data || (response as any);

      // 3. Access Token 추출
      const tokens = await GoogleSignin.getTokens();
      const googleAccessToken = tokens.accessToken;

      console.log("🔥 구글 ID Token (백엔드용):", idToken ? "있음" : "없음");
      console.log(
        "🔥 구글 Access Token (캘린더용):",
        googleAccessToken ? "있음" : "없음"
      );

      if (!idToken) {
        Alert.alert("오류", "구글 토큰을 가져오지 못했습니다.");
        return;
      }

      // 캘린더용 토큰 저장
      await AsyncStorage.setItem("googleAccessToken", googleAccessToken);

      // 4. 백엔드로 구글 ID 토큰 전송
      console.log("백엔드 로그인 요청 중...");
      const res = await fetch(`${API_URL}/api/auth/google/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: idToken }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server Error: ${errorText}`);
      }

      const data = await res.json();
      console.log(
        "🔍 백엔드 응답 user 객체:",
        JSON.stringify(data.user, null, 2)
      );

      // 5. 앱 로그인 처리
      await login(data.accessToken, data.user);

      // 6. 화면 이동 분기
      Alert.alert(
        "로그인 성공",
        `환영합니다, ${data.user.username || data.user.email}님!`,
        [
          {
            text: "확인",
            onPress: () => {
              if (!data.user.usernameSet) {
                // 1순위: 닉네임 미설정 → 닉네임 설정
                navigation.navigate("SetUsername");
              } else if (data.user.role === "guest") {
                // 2순위: 닉네임 O, 학교 인증 X → 학교 인증 (선택적)
                navigation.reset({
                  index: 1,
                  routes: [{ name: "MainTabs" }, { name: "SchoolAuth" }],
                });
              } else {
                // 3순위: 둘 다 완료 → 메인
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainTabs" }],
                });
              }
            },
          },
        ]
      );

      return response;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled login");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("오류", "Google Play 서비스를 사용할 수 없습니다.");
      } else {
        console.error("Login Error:", error);
        Alert.alert("로그인 실패", "서버와 통신 중 문제가 발생했습니다.");
      }
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

      console.log("👋 통합 로그아웃 완료");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return {
    signIn,
    signOut,
  };
}

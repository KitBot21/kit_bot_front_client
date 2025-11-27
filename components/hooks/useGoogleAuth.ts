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
import AsyncStorage from "@react-native-async-storage/async-storage"; // 👈 추가

// 백엔드 주소
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.11:8080";

console.log("🚀 현재 사용 중인 백엔드 URL:", API_URL);
// Google Sign-In 설정
GoogleSignin.configure({
  webClientId:
    "358721642016-j5hcv6tjn6rvu04hk65qokap8hulhlgv.apps.googleusercontent.com",
  offlineAccess: true,
  // 👇 [중요] 캘린더 권한 추가!
  scopes: [
    "https://www.googleapis.com/auth/calendar.readonly", // 캘린더 읽기 권한
    "https://www.googleapis.com/auth/calendar.events", // 이벤트 관리 권한
  ],
});

export function useGoogleAuth() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // AuthContext의 login 함수 가져오기
  const { login, logout } = useAuth();

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      // 1. 구글 로그인 시도
      const response = await GoogleSignin.signIn();

      // 2. 데이터 추출
      const { idToken, user } = response.data || (response as any);

      // 👇 [중요] 구글 캘린더 API용 Access Token 추출
      // signIn() 만으로는 accessToken이 안 올 수 있어서 getTokens()를 사용합니다.
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

      // 👇 [중요] 캘린더 화면에서 쓰기 위해 구글 토큰을 따로 저장
      await AsyncStorage.setItem("googleAccessToken", googleAccessToken);

      // 3. 백엔드로 구글 ID 토큰 전송 (기존 로직 유지)
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
      console.log("✅ 백엔드 로그인 성공:", data.user.email);

      // 4. 앱 로그인 처리 (백엔드에서 받은 앱 전용 토큰 저장)
      await login(data.accessToken, data.user);

      // 5. 화면 이동
      Alert.alert(
        "로그인 성공",
        `환영합니다, ${data.user.username || data.user.email}님!`,
        [
          {
            text: "확인",
            onPress: () => {
              if (!data.user.usernameSet) {
                navigation.navigate("SetUsername");
              } else {
                navigation.navigate("MainTabs");
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
      // 1. 구글 연결 끊기 (이걸 해야 다음에 로그인할 때 계정 선택창이 뜸)
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.log("구글 로그아웃 중 에러(무시 가능):", e);
      }

      // 2. 캘린더용 토큰 삭제
      await AsyncStorage.removeItem("googleAccessToken");

      // 3. 앱 내부 로그아웃 (AuthContext의 logout 실행)
      // 이게 실행되면 user가 null이 되면서 자동으로 로그인 화면으로 튕겨 나감
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

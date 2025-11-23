import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.10:8080";

export function useGoogleAuth() {
  const { login } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 1. 배포용 (APK 파일) 주소 생성: kitbotfront://...
  const nativeRedirectUri = makeRedirectUri({
    scheme: "kitbotfront",
  });

  // 2. 개발용 (Expo Go) 프록시 주소 (아까 확인한 그 주소!)
  const proxyRedirectUri = "https://auth.expo.io/@haeramram/kit_bot_front";

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,

    // 👇 [핵심 수정] 에러 나던 useProxy를 지우고 이렇게 바꾸세요!
    // "개발 중이면(__DEV__) 프록시 주소를 쓰고, 아니면 네이티브 주소를 써라"
    redirectUri: __DEV__ ? proxyRedirectUri : nativeRedirectUri,
  });

  useEffect(() => {
    handleGoogleResponse();
  }, [response]);

  // ... (나머지 handleGoogleResponse 등 아래 코드는 그대로 유지) ...

  const handleGoogleResponse = async () => {
    // ... 기존 로직 ...
  };

  return {
    promptAsync,
    request,
  };
}

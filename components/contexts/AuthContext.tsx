import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { queryClient } from "@/components/lib/queryClient";
import {
  updatePushToken,
  deletePushToken,
} from "@/components/api/services/chatApi";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiClient } from "@/components/api/services/chatApi";

export type UserRole = "guest" | "kumoh" | "admin";

interface User {
  id: string;
  email: string;
  username: string | null;
  profileImg?: string;
  role: UserRole;
  usernameSet: boolean;
  notificationEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getPushToken(): Promise<string | undefined> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    console.log("에뮬레이터에서는 푸시 토큰 발급 불가");
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("알림 권한 없음");
    return undefined;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;

    console.log("🔥 푸시 토큰 발급:", token);
    return token;
  } catch (e) {
    console.error("토큰 발급 실패:", e);
    return undefined;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("googleAccessToken");
      setIsLoading(false);
    };

    loadAuthData();
  }, []);

  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setAccessToken(token);
      setUser(userData);
      const pushToken = await getPushToken();
      if (pushToken) {
        await updatePushToken(pushToken);
        console.log(" 로그인 시 pushToken 저장 완료");
      }
    } catch (error) {
      console.error("로그인 저장 실패:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("🔍 로그아웃 시 토큰:", token ? "있음" : "없음");

      if (token) {
        await apiClient.delete("/api/user/push-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(" 로그아웃 시 pushToken 삭제 완료");
      }
    } catch (e) {
      console.log("pushToken 삭제 실패 (무시):", e);
    }

    await AsyncStorage.clear();
    queryClient.clear();
    setAccessToken(null);
    setUser(null);
  };

  const updateUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("사용자 정보 업데이트 실패:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!accessToken && !!user,
        isProfileComplete: !!accessToken && !!user && !!user.usernameSet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

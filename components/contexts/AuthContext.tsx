// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  email: string;
  username: string | null;
  profileImg: string;
  role: string;
  isUsernameSet: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        setAccessToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("인증 정보 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setAccessToken(token);
      setUser(userData);
    } catch (error) {
      console.error("로그인 저장 실패:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("user");
      setAccessToken(null);
      setUser(null);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
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

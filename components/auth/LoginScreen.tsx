import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useGoogleAuth();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.navigate("MainTabs");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed-outline" size={80} color="#007AFF" />
        <Text style={styles.title}>{t("auth.loginRequired")}</Text>
        <Text style={styles.subtitle}>{t("auth.loginSubtitle")}</Text>

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.googleButtonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="logo-google"
                size={24}
                color="#FFFFFF"
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>
                {t("auth.googleLogin")}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 32,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
  },
});

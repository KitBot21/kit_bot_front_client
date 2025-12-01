import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.10:8080";

export default function SetUsernameScreen() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { accessToken, updateUser } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  const validateUsername = (value: string): boolean => {
    if (value.length < 2 || value.length > 10) {
      setError(t("setUsername.lengthError"));
      return false;
    }

    const regex = /^[가-힣a-zA-Z0-9_]+$/;
    if (!regex.test(value)) {
      setError(t("setUsername.formatError"));
      return false;
    }

    setError("");
    return true;
  };

  const checkUsername = async (value: string) => {
    if (!validateUsername(value)) return;

    setChecking(true);
    try {
      const res = await fetch(
        `${API_URL}/api/user/username/check?username=${encodeURIComponent(
          value
        )}`
      );
      const data = await res.json();

      if (!data.available) {
        setError(t("setUsername.duplicateError"));
      }
    } catch (error) {
      console.error("중복 체크 실패:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateUsername(username)) return;
    if (error) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/user/username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (data.success) {
        await updateUser(data.user);
        Alert.alert(t("common.complete"), t("setUsername.success"), [
          {
            text: t("common.confirm"),
            onPress: () => {
              if (data.user.role === "guest") {
                navigation.reset({
                  index: 1,
                  routes: [{ name: "MainTabs" }, { name: "SchoolAuth" }],
                });
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainTabs" }],
                });
              }
            },
          },
        ]);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("닉네임 설정 실패:", error);
      Alert.alert(t("common.error"), t("setUsername.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Ionicons name="person-circle-outline" size={80} color="#007AFF" />
        <Text style={styles.title}>{t("setUsername.title")}</Text>
        <Text style={styles.subtitle}>{t("setUsername.subtitle")}</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={t("setUsername.placeholder")}
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              setError("");
            }}
            onBlur={() => username && checkUsername(username)}
            maxLength={10}
            autoFocus
          />
          {checking && (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={styles.inputIcon}
            />
          )}
          {!checking && username && !error && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#34C759"
              style={styles.inputIcon}
            />
          )}
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.helperText}>{t("setUsername.helperText")}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!username || error || submitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!username || !!error || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>{t("common.complete")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  inputWrapper: {
    width: "100%",
    position: "relative",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  inputIcon: {
    position: "absolute",
    right: 16,
    top: 13,
  },
  errorText: {
    width: "100%",
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 8,
  },
  helperText: {
    width: "100%",
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 8,
  },
  submitButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

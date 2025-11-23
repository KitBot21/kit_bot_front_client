// components/Auth/SetUsernameScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.10:8080";

export default function SetUsernameScreen() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { accessToken, updateUser, user } = useAuth();
  const navigation = useNavigation();

  // 닉네임 유효성 검사
  const validateUsername = (value: string): boolean => {
    if (value.length < 2 || value.length > 10) {
      setError("닉네임은 2자 이상 10자 이하여야 합니다.");
      return false;
    }

    const regex = /^[가-힣a-zA-Z0-9_]+$/;
    if (!regex.test(value)) {
      setError("닉네임은 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.");
      return false;
    }

    setError("");
    return true;
  };

  // 닉네임 중복 체크
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
        setError("이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      console.error("중복 체크 실패:", error);
    } finally {
      setChecking(false);
    }
  };

  // 닉네임 설정
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
        // 사용자 정보 업데이트
        await updateUser(data.user);
        Alert.alert("완료", "닉네임이 설정되었습니다!", [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("닉네임 설정 실패:", error);
      Alert.alert("오류", "닉네임 설정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="person-circle-outline" size={80} color="#007AFF" />
        <Text style={styles.title}>닉네임을 설정해주세요</Text>
        <Text style={styles.subtitle}>
          게시판에서 사용할 닉네임을 입력해주세요
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="닉네임 (2-10자)"
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
          <Text style={styles.helperText}>
            한글, 영문, 숫자, 밑줄 사용 가능
          </Text>
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
            <Text style={styles.submitButtonText}>완료</Text>
          )}
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
  },
  content: {
    padding: 32,
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

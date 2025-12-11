import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/components/contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";
import {
  KeyboardAvoidingView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { apiClient } from "@/components/api/services/chatApi";

export default function EditNicknameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, updateUser, accessToken } = useAuth();
  const { t } = useTranslation();

  const [newNickname, setNewNickname] = useState(user?.username || "");
  const [nicknameError, setNicknameError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUsername = (value: string): boolean => {
    setNicknameError("");

    if (value.length < 2) {
      setNicknameError(t("setUsername.minLengthError"));
      return false;
    }
    if (value.length > 10) {
      setNicknameError(t("setUsername.maxLengthError"));
      return false;
    }
    if (!/^[가-힣a-zA-Z0-9]+$/.test(value)) {
      setNicknameError(t("setUsername.invalidCharError"));
      return false;
    }
    return true;
  };

  const checkUsername = async (value: string) => {
    if (value === user?.username) {
      setNicknameError("");
      return;
    }

    if (!validateUsername(value)) return;

    setIsChecking(true);
    try {
      const res = await apiClient.get(
        `/api/user/username/check?username=${encodeURIComponent(value)}`
      );
      const data = res.data;

      if (!data.available) {
        setNicknameError(t("setUsername.duplicateError"));
      }
    } catch (error) {
      console.error("중복 체크 실패:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const debouncedCheckUsername = useCallback(
    debounce((value: string) => checkUsername(value), 500),
    [user?.username]
  );

  const handleNicknameChange = (value: string) => {
    setNewNickname(value);
    setNicknameError("");

    if (value.trim()) {
      debouncedCheckUsername(value);
    }
  };

  const handleSave = async () => {
    if (newNickname === user?.username) {
      navigation.goBack();
      return;
    }

    if (!validateUsername(newNickname)) return;
    if (nicknameError) return;

    setIsSubmitting(true);
    try {
      const res = await apiClient.post(
        `/api/user/username`,
        { username: newNickname },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = res.data;

      if (data.success) {
        await updateUser(data.user);
        Alert.alert(t("common.complete"), t("mypage.nicknameChanged"), [
          { text: t("common.confirm"), onPress: () => navigation.goBack() },
        ]);
      } else {
        setNicknameError(data.message || t("common.failed"));
      }
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
      Alert.alert(t("common.error"), t("common.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSave =
    !isChecking &&
    !isSubmitting &&
    !nicknameError &&
    newNickname.trim().length >= 2;

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.currentSection}>
          <Text style={styles.currentNickname}>
            {user?.username || t("mypage.nicknameEmpty")}
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>{t("mypage.newNickname")}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, nicknameError && styles.inputError]}
              value={newNickname}
              onChangeText={handleNicknameChange}
              placeholder={t("mypage.nicknamePlaceholder")}
              placeholderTextColor="#999"
              autoFocus
              maxLength={10}
              editable={!isSubmitting}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isChecking && (
              <ActivityIndicator
                size="small"
                color="#007AFF"
                style={styles.indicator}
              />
            )}
          </View>

          {nicknameError ? (
            <View style={styles.messageRow}>
              <Ionicons name="alert-circle" size={14} color="#FF3B30" />
              <Text style={styles.errorText}>{nicknameError}</Text>
            </View>
          ) : (
            <View style={styles.messageRow}>
              <Ionicons name="information-circle" size={14} color="#8E8E93" />
              <Text style={styles.hintText}>{t("mypage.nicknameHint")}</Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) + 20 },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t("common.save")}</Text>
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
    padding: 20,
  },
  currentSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: 8,
  },
  currentNickname: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  inputSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F9F9F9",
  },
  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  indicator: {
    marginLeft: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
  },
  hintText: {
    color: "#8E8E93",
    fontSize: 13,
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#B0D4F1",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

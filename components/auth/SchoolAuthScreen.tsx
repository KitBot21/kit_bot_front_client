import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSchoolAuth } from "@/components/hooks/useSchoolAuth";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/App";

export default function SchoolAuthScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const codeInputRef = useRef<TextInput>(null);
  const {
    studentId,
    setStudentId,
    code,
    setCode,
    isSent,
    loading,
    handleSend,
    handleVerify,
    resetForm,
  } = useSchoolAuth();

  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  const handleCodeBoxPress = () => {
    codeInputRef.current?.focus();
  };

  const renderCodeBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      boxes.push(
        <View
          key={i}
          style={[styles.codeBox, code.length === i && styles.codeBoxFocused]}
        >
          <Text style={styles.codeText}>{code[i] || ""}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Ionicons name="close" size={28} color="#8E8E93" />
        </TouchableOpacity>

        <Ionicons
          name="school-outline"
          size={60}
          color="#007AFF"
          style={styles.icon}
        />
        <Text style={styles.title}>{t("schoolAuth.title")}</Text>
        <Text style={styles.subtitle}>{t("schoolAuth.subtitle")}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("schoolAuth.studentId")}</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, isSent && styles.disabledInput]}
              value={studentId}
              onChangeText={setStudentId}
              editable={!isSent}
              placeholderTextColor="#999"
            />
            <Text style={styles.domain}>@kumoh.ac.kr</Text>
          </View>
        </View>

        {isSent && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("schoolAuth.verificationCode")}</Text>

            <TouchableOpacity
              style={styles.codeBoxContainer}
              onPress={handleCodeBoxPress}
              activeOpacity={0.8}
            >
              {renderCodeBoxes()}
            </TouchableOpacity>

            <TextInput
              ref={codeInputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              caretHidden={true}
            />

            <Text style={styles.codeHint}>{t("schoolAuth.codeHint")}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <>
              {!isSent ? (
                <TouchableOpacity
                  style={[
                    styles.mainButton,
                    !studentId.trim() && styles.mainButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!studentId.trim()}
                >
                  <Text style={styles.buttonText}>
                    {t("schoolAuth.getCode")}
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.mainButton,
                      code.length < 6 && styles.mainButtonDisabled,
                    ]}
                    onPress={handleVerify}
                    disabled={code.length < 6}
                  >
                    <Text style={styles.buttonText}>
                      {t("schoolAuth.verify")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subButton}
                    onPress={resetForm}
                  >
                    <Text style={styles.subButtonText}>
                      {t("schoolAuth.reenter")}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  skipButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  icon: {
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F9F9F9",
  },
  disabledInput: {
    backgroundColor: "#F0F0F0",
    color: "#999",
  },
  domain: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },

  codeBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  codeBox: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  codeBoxFocused: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F7FF",
  },
  codeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  codeHint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },

  buttonContainer: {
    marginTop: 10,
    gap: 12,
  },
  mainButton: {
    height: 52,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  mainButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  subButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  subButtonText: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "underline",
  },
});

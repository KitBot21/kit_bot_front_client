import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSchoolAuth } from "@/components/hooks/useSchoolAuth"; // 👈 Hook 가져오기

export default function SchoolAuthScreen() {
  // 훅에서 로직과 상태를 다 가져옵니다.
  const {
    studentId,
    setStudentId,
    code,
    setCode,
    isSent,
    loading,
    handleSend,
    handleVerify,
    resetForm, // "학번 다시 입력하기"용 함수
  } = useSchoolAuth();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Ionicons
          name="school-outline"
          size={60}
          color="#007AFF"
          style={styles.icon}
        />
        <Text style={styles.title}>금오공대 학생 인증</Text>
        <Text style={styles.subtitle}>
          게시글 작성을 위해{"\n"}학교 웹메일 인증이 필요합니다.
        </Text>

        {/* 학번 입력 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>학번</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, isSent && styles.disabledInput]}
              value={studentId}
              onChangeText={setStudentId}
              editable={!isSent}
            />
            <Text style={styles.domain}>@kumoh.ac.kr</Text>
          </View>
        </View>

        {/* 인증번호 입력 */}
        {isSent && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>인증번호</Text>
            <TextInput
              style={styles.input}
              placeholder="메일로 온 6자리 숫자"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
        )}

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <>
              {!isSent ? (
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={handleSend}
                >
                  <Text style={styles.buttonText}>인증번호 받기</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.mainButton}
                    onPress={handleVerify}
                  >
                    <Text style={styles.buttonText}>인증 완료</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subButton}
                    onPress={resetForm}
                  >
                    <Text style={styles.subButtonText}>학번 다시 입력하기</Text>
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

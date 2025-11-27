// src/hooks/useSchoolAuth.ts
import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/components/contexts/AuthContext";
import {
  sendVerificationEmail,
  verifyEmailCode,
} from "../api/services/chatApi";
export function useSchoolAuth() {
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuth();

  const [studentId, setStudentId] = useState("");
  const [code, setCode] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. 전송 핸들러
  const handleSend = async () => {
    if (!studentId || studentId.length < 8) {
      Alert.alert("알림", "올바른 학번을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await sendVerificationEmail(studentId, user?.email); // API 호출
      setIsSent(true);
      Alert.alert(
        "전송 완료",
        "학교 메일(@kumoh.ac.kr)로 인증번호를 보냈습니다."
      );
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "메일 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 2. 검증 핸들러
  const handleVerify = async () => {
    if (!code) {
      Alert.alert("알림", "인증번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await verifyEmailCode(studentId, code, user?.email); // API 호출

      // 성공 시 유저 정보 업데이트 (guest -> kumoh)
      if (user) {
        const updatedUser = {
          ...user,
          role: "kumoh" as const, // 백엔드 Enum과 일치
          schoolEmail: `${studentId}@kumoh.ac.kr`,
        };
        await updateUser(updatedUser);
      }

      Alert.alert("인증 성공", "이제 게시글 작성이 가능합니다!", [
        {
          text: "확인",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
          },
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("인증 실패", "인증번호가 일치하지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsSent(false);
    setCode("");
  };

  return {
    studentId,
    setStudentId,
    code,
    setCode,
    isSent,
    loading,
    handleSend,
    handleVerify,
    resetForm,
  };
}

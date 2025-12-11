import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/components/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  sendVerificationEmail,
  verifyEmailCode,
} from "../api/services/chatApi";

export function useSchoolAuth() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, login } = useAuth();

  const [studentId, setStudentId] = useState("");
  const [code, setCode] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!studentId || studentId.length < 8) {
      Alert.alert(t("common.alert"), t("schoolAuth.invalidStudentId"));
      return;
    }

    try {
      setLoading(true);
      await sendVerificationEmail(studentId, user?.email);
      setIsSent(true);
      Alert.alert(
        t("schoolAuth.sendComplete"),
        t("schoolAuth.sendCompleteDesc")
      );
    } catch (error: any) {
      console.error(error);

      const message = error.response?.data?.message;
      if (message?.includes("이미")) {
        Alert.alert(t("common.error"), t("schoolAuth.alreadyVerified"));
      } else {
        Alert.alert(t("common.error"), t("schoolAuth.sendFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code) {
      Alert.alert(t("common.alert"), t("schoolAuth.enterCode"));
      return;
    }

    try {
      setLoading(true);
      const response = await verifyEmailCode(studentId, code, user?.email);

      if (response.accessToken && response.user) {
        await login(response.accessToken, response.user);
      }

      Alert.alert(
        t("schoolAuth.verifySuccess"),
        t("schoolAuth.verifySuccessDesc"),
        [
          {
            text: t("common.confirm"),
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "MainTabs" }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        t("schoolAuth.verifyFailed"),
        t("schoolAuth.verifyFailedDesc")
      );
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

import { useMutation } from "@tanstack/react-query";
import { updatePushToken } from "../api/services/chatApi";
import { Alert } from "react-native";

export const useUpdatePushToken = () => {
  return useMutation({
    mutationFn: (token: string) => updatePushToken(token),
    onSuccess: () => {
      console.log("푸시토큰서버저장완료");
    },
    onError: (error: any) => {
      console.error("푸시토큰 저장 실패");
    },
  });
};

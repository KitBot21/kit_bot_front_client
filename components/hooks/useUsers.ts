import { useMutation } from "@tanstack/react-query";
import { withdrawUser } from "../api/services/chatApi";

export const useWithdraw = () => {
  return useMutation({
    mutationFn: () => withdrawUser(),
  });
};

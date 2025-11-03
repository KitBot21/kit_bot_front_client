import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { postChatQuery } from "../services/chatApi";
import { QueryResponseDTO } from "../types/chat_types";

type ChatMutationOptions = UseMutationOptions<QueryResponseDTO, Error, string>;

export const usePostChatQuery = (options?: ChatMutationOptions) => {
  return useMutation<QueryResponseDTO, Error, string>({
    mutationFn: (userQuestion: string) => postChatQuery(userQuestion),

    ...options,
  });
};

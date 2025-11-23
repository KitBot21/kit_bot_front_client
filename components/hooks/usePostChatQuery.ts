import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { postChatQuery } from "../api/services/chatApi";
import { QueryResponseDTO } from "../api/types/APITypes/chat_types";

type ChatMutationOptions = UseMutationOptions<QueryResponseDTO, Error, string>;

export const usePostChatQuery = (options?: ChatMutationOptions) => {
  return useMutation<QueryResponseDTO, Error, string>({
    mutationFn: (userQuestion: string) => postChatQuery(userQuestion),

    ...options,
  });
};

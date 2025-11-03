import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentCreateRequest } from "../types/APITypes/CommentTypes";
import { getComments, getReplies, createComment } from "../services/chatApi";

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
  });
};

export const useReplies = (commentId: string) => {
  return useQuery({
    queryKey: ["replies", commentId],
    queryFn: () => getReplies(commentId),
    enabled: !!commentId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestData: CommentCreateRequest) =>
      createComment(requestData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });

      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["replies", variables.parentId],
        });
      }
    },
    onError: (error) => {
      console.error("댓글 작성 실패:", error);
    },
  });
};

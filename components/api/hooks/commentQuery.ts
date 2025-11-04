import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentCreateRequest } from "../types/APITypes/commentTypes";
import {
  getComments,
  getReplies,
  createComment,
  reportComment,
  toggleRecommendComment,
  deleteComment,
} from "../services/chatApi";

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
    mutationFn: (data: CommentCreateRequest) => createComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });

      queryClient.invalidateQueries({
        queryKey: ["post", variables.postId],
      });

      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["replies", variables.parentId],
        });
      }
    },
  });
};

export const useToggleRecommendComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => toggleRecommendComment(commentId),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      await queryClient.cancelQueries({ queryKey: ["replies"] });

      const previousComments = queryClient.getQueriesData({
        queryKey: ["comments"],
      });
      const previousReplies = queryClient.getQueriesData({
        queryKey: ["replies"],
      });

      queryClient.setQueriesData<any>(
        { queryKey: ["comments"] },
        (old: any) => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isRecommended: !comment.isRecommended,
                    recommendCount: comment.isRecommended
                      ? Math.max(0, comment.recommendCount - 1)
                      : comment.recommendCount + 1,
                  }
                : comment
            );
          }
          return old;
        }
      );

      queryClient.setQueriesData<any>({ queryKey: ["replies"] }, (old: any) => {
        if (!old) return old;

        if (Array.isArray(old)) {
          return old.map((reply) =>
            reply.id === commentId
              ? {
                  ...reply,
                  isRecommended: !reply.isRecommended,
                  recommendCount: reply.isRecommended
                    ? Math.max(0, reply.recommendCount - 1)
                    : reply.recommendCount + 1,
                }
              : reply
          );
        }
        return old;
      });

      return { previousComments, previousReplies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["replies"] });
    },

    onError: (error, _, context) => {
      console.error("추천 실패:", error);

      if (context?.previousComments) {
        context.previousComments.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }

      if (context?.previousReplies) {
        context.previousReplies.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
};

export const useReportComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      reason,
    }: {
      commentId: string;
      reason: string;
    }) => reportComment(commentId, reason),

    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      await queryClient.cancelQueries({ queryKey: ["replies"] });

      const previousComments = queryClient.getQueriesData({
        queryKey: ["comments"],
      });
      const previousReplies = queryClient.getQueriesData({
        queryKey: ["replies"],
      });

      queryClient.setQueriesData<any>(
        { queryKey: ["comments"] },
        (old: any) => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isReported: true,
                    reportCount: comment.reportCount + 1,
                  }
                : comment
            );
          }
          return old;
        }
      );

      queryClient.setQueriesData<any>({ queryKey: ["replies"] }, (old: any) => {
        if (!old) return old;

        if (Array.isArray(old)) {
          return old.map((reply) =>
            reply.id === commentId
              ? {
                  ...reply,
                  isReported: true,
                  reportCount: reply.reportCount + 1,
                }
              : reply
          );
        }
        return old;
      });

      return { previousComments, previousReplies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["replies"] });
    },

    onError: (error, _, context) => {
      console.error("신고 실패:", error);

      if (context?.previousComments) {
        context.previousComments.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }

      if (context?.previousReplies) {
        context.previousReplies.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
};

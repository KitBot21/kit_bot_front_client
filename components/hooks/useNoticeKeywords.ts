import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyKeywords,
  updateMyKeywords,
  toggleKeywordSubscription,
  getNoticeKeywords,
} from "../api/services/chatApi";

export const useNoticeKeywords = () => {
  return useQuery({
    queryKey: ["noticeKeywords"],
    queryFn: getNoticeKeywords,
    staleTime: 1000 * 60 * 60,
  });
};

export const useMyKeywords = () => {
  return useQuery({
    queryKey: ["myKeywords"],
    queryFn: getMyKeywords,
  });
};

export const useToggleKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyword: string) => toggleKeywordSubscription(keyword),

    onMutate: async (keyword) => {
      await queryClient.cancelQueries({ queryKey: ["myKeywords"] });

      const previousKeywords = queryClient.getQueryData(["myKeywords"]);

      queryClient.setQueryData<any>(["myKeywords"], (old: any) => {
        if (!old) return old;

        if (Array.isArray(old)) {
          const exists = old.find((item) => item.keyword === keyword);
          if (exists) {
            return old.map((item) =>
              item.keyword === keyword
                ? { ...item, enabled: !item.enabled }
                : item
            );
          } else {
            return [...old, { keyword, enabled: true }];
          }
        }
        return old;
      });

      return { previousKeywords };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myKeywords"] });
    },

    onError: (error, _, context) => {
      console.error("키워드 토글 실패:", error);
      if (context?.previousKeywords) {
        queryClient.setQueryData(["myKeywords"], context.previousKeywords);
      }
    },
  });
};

export const useUpdateKeywords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabledKeywords: string[]) =>
      updateMyKeywords(enabledKeywords),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myKeywords"] });
    },

    onError: (error) => {
      console.error("키워드 저장 실패:", error);
    },
  });
};

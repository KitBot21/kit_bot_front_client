// hooks/useNoticeKeywords.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyKeywords,
  updateMyKeywords,
  toggleKeywordSubscription,
  getNoticeKeywords,
} from "../api/services/chatApi";

// 1. 고정 키워드 목록 조회 (5개)
export const useNoticeKeywords = () => {
  return useQuery({
    queryKey: ["noticeKeywords"],
    queryFn: getNoticeKeywords,
    staleTime: 1000 * 60 * 60, // 1시간 (고정값이라 자주 안 바뀜)
  });
};

// 2. 내 구독 키워드 조회
export const useMyKeywords = () => {
  return useQuery({
    queryKey: ["myKeywords"],
    queryFn: getMyKeywords,
  });
};

// 3. 키워드 구독 토글
export const useToggleKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyword: string) => toggleKeywordSubscription(keyword),

    onMutate: async (keyword) => {
      await queryClient.cancelQueries({ queryKey: ["myKeywords"] });

      const previousKeywords = queryClient.getQueryData(["myKeywords"]);

      // 낙관적 업데이트
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
            // 새로 추가
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

// 4. 키워드 일괄 저장
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

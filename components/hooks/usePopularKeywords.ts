import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PopularKeywordsParams } from "../api/types/APITypes/popularTypes";
import {
  fetchPopularKeywords,
  fetchLatestQuestionByKeyword,
} from "../api/services/chatApi";

export const popularQueryKeys = {
  all: ["popular"] as const,
  keywords: (size?: number) =>
    [...popularQueryKeys.all, "keywords", size] as const,
  latestQuestion: (keyword: string) =>
    [...popularQueryKeys.all, "latestQuestion", keyword] as const,
};

export const usePopularKeywords = (params?: PopularKeywordsParams) => {
  return useQuery({
    queryKey: popularQueryKeys.keywords(params?.size),
    queryFn: () => fetchPopularKeywords(params),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 10,
  });
};

export const useLatestQuestionByKeyword = (keyword: string) => {
  return useQuery({
    queryKey: popularQueryKeys.latestQuestion(keyword),
    queryFn: () => fetchLatestQuestionByKeyword(keyword),
    enabled: !!keyword,
    staleTime: 1000 * 60 * 5,
  });
};

// hooks/usePosts.ts
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  getPosts,
  createPost,
  getPost,
  toggleRecommendPost,
  reportPost,
  updatePost,
  deletePost,
} from "../services/chatApi";
import {
  PostCreateRequest,
  PostUpdateRequest,
} from "../types/APITypes/postTypes";

export const usePosts = (keyword?: string) => {
  return useInfiniteQuery({
    queryKey: ["posts", keyword],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      getPosts({
        keyword,
        after: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.nextCursor : undefined;
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostCreateRequest) => createPost(data),
    onSuccess: () => {
      // 게시글 목록 쿼리를 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      console.log("usePost - fetching postId:", postId); // 디버깅 로그
      const result = await getPost(postId);
      console.log("usePost - result:", result); // 디버깅 로그
      return result;
    },
    enabled: !!postId,
  });
};

export const useToggleRecommendPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleRecommendPost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useReportPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason: string }) =>
      reportPost(postId, reason),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: PostUpdateRequest;
    }) => updatePost(postId, data),
    onSuccess: (_, { postId }) => {
      // 게시글 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      // 게시글 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      // 게시글 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

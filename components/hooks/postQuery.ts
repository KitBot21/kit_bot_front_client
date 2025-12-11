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
  fetchMyPosts,
} from "../api/services/chatApi";
import {
  PostCreateRequest,
  PostUpdateRequest,
} from "../api/types/APITypes/postTypes";

export const usePosts = (keyword?: string, enabled: boolean = true) => {
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
    enabled: enabled,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostCreateRequest) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const usePost = (postId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      console.log("usePost - fetching postId:", postId);
      const result = await getPost(postId);
      console.log("usePost - result:", result);
      return result;
    },
    enabled: enabled,
  });
};

export const useToggleRecommendPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleRecommendPost(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousPost = queryClient.getQueryData(["post", postId]);

      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          recommended: !old.recommended,
          recommendCount: old.recommended
            ? old.recommendCount - 1
            : old.recommendCount + 1,
        };
      });

      return { previousPost };
    },

    onError: (err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },

    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
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
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
};

export const useMyPosts = () => {
  return useInfiniteQuery({
    queryKey: ["myPosts"],
    queryFn: ({ pageParam = 0 }) => fetchMyPosts(pageParam, 10),
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.number + 1;
    },
    initialPageParam: 0,
  });
};

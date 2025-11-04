import axios from "axios";
import {
  QueryRequestDTO,
  QueryResponseDTO,
} from "../types/APITypes/chat_types";
import {
  CommentCreateRequest,
  CommentResponseDTO,
} from "../types/APITypes/commentTypes";

import {
  Post,
  PostsParams,
  PostsResponse,
  PostCreateRequest,
  PostUpdateRequest,
} from "../types/APITypes/postTypes";

const API_BASE_URL = "http://172.30.93.10:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const postChatQuery = async (
  userQuestion: string
): Promise<QueryResponseDTO> => {
  const requestData: QueryRequestDTO = {
    question: userQuestion,
    lang: "ko",
  };

  try {
    const response = await apiClient.post<QueryResponseDTO>(
      "/chat/query",
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("API Error in postChatQuery:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "서버 통신 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const getComments = async (
  postId: string
): Promise<CommentResponseDTO[]> => {
  try {
    const response = await apiClient.get<CommentResponseDTO[]>(
      `/comments/post/${postId}`
    );
    return response.data;
  } catch (error) {
    console.error("API Error in getComments:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "댓글 조회 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const getReplies = async (
  commentId: string
): Promise<CommentResponseDTO[]> => {
  try {
    const response = await apiClient.get<CommentResponseDTO[]>(
      `/comments/${commentId}/replies`
    );
    return response.data;
  } catch (error) {
    console.error("API Error in getReplies:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "대댓글 조회 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const createComment = async (
  requestData: CommentCreateRequest
): Promise<CommentResponseDTO> => {
  try {
    const response = await apiClient.post<CommentResponseDTO>(
      "/comments",
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("API Error in createComment:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "댓글 작성 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const toggleRecommendComment = async (
  commentId: string
): Promise<void> => {
  try {
    await apiClient.post(`/comments/${commentId}/recommend/toggle`);
  } catch (error) {
    console.error("API Error in toggleRecommendComment:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "추천 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const reportComment = async (
  commentId: string,
  reason: string
): Promise<void> => {
  try {
    await apiClient.post(`/comments/${commentId}/report`, { reason });
  } catch (error) {
    console.error("API Error in reportComment:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "신고 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const getPosts = async ({
  keyword = "",
  after,
  limit = 10,
}: PostsParams): Promise<PostsResponse> => {
  try {
    const params = new URLSearchParams();

    if (keyword) params.append("keyword", keyword);
    if (after) params.append("after", after);
    params.append("limit", limit.toString());

    const response = await apiClient.get<PostsResponse>(
      `/api/posts/cursor?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("API Error in getPosts:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "게시글 조회 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const createPost = async (requestData: PostCreateRequest) => {
  try {
    const response = await apiClient.post("/api/posts", requestData);
    return response.data;
  } catch (error) {
    console.error("API Error in createPost:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "게시글 작성 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const getPost = async (postId: string): Promise<Post> => {
  try {
    const response = await apiClient.get<Post>(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("API Error in getPost:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "게시글 조회 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const toggleRecommendPost = async (postId: string): Promise<void> => {
  try {
    await apiClient.post(`/api/posts/${postId}/recommend/toggle`);
  } catch (error) {
    console.error("API Error in toggleRecommendPost:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "추천 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const reportPost = async (
  postId: string,
  reason: string
): Promise<void> => {
  try {
    await apiClient.post(`/api/posts/${postId}/report/toggle`, { reason });
  } catch (error) {
    console.error("API Error in reportPost:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "신고 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const updatePost = async (
  postId: string,
  requestData: PostUpdateRequest
): Promise<Post> => {
  try {
    const response = await apiClient.patch<Post>(
      `/api/posts/${postId}`,
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("API Error in updatePost:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "게시글 수정 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/posts/${postId}`);
  } catch (error) {
    console.error("API Error in deletePost:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "게시글 삭제 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    await apiClient.delete(`/comments/${commentId}`);
  } catch (error) {
    console.error("API Error in deleteComment:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "댓글 삭제 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

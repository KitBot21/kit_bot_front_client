import axios from "axios";
import {
  QueryRequestDTO,
  QueryResponseDTO,
} from "../types/APITypes/chat_types";
import {
  CommentCreateRequest,
  CommentResponseDTO,
} from "../types/APITypes/CommentTypes";

const API_BASE_URL = "http://192.168.0.11:8080";

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

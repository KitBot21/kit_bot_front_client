import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // [1] 이거 추가
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
  MyPostResponse,
} from "../types/APITypes/postTypes";
import { GoogleCalendarEvent } from "../types/APITypes/googleCalendarTypes";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // 저장소에서 토큰 꺼내기
    const token = await AsyncStorage.getItem("accessToken");

    // 토큰이 있으면 헤더에 'Bearer 토큰' 형태로 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// [4] (선택) 응답 인터셉터: 403 에러 로그 확인용
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      console.error("🚨 403 Forbidden: 토큰 권한 없음 (로그인 필요)");
    }
    return Promise.reject(error);
  }
);

export const postChatQuery = async (
  userQuestion: string
): Promise<QueryResponseDTO> => {
  const requestData: QueryRequestDTO = {
    question: userQuestion,
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

export const fetchMyPosts = async (page = 0, size = 10) => {
  const { data } = await apiClient.get<MyPostResponse>("/api/posts/me", {
    params: {
      page,
      size,
      sort: "createdAt,desc", // 최신순 정렬 기본값
    },
  });
  return data;
};

export const createGoogleEvent = async (
  accessToken: string,
  eventData: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    reminders?: number[]; // [10] 이면 10분 전 알림
  }
) => {
  try {
    const startDateTime = `${eventData.date}T${
      eventData.startTime || "09:00"
    }:00+09:00`;
    const endDateTime = `${eventData.date}T${
      eventData.endTime || "10:00"
    }:00+09:00`;

    // 📍 알림 설정 로직 추가
    const remindersOverrides =
      eventData.reminders?.map((min) => ({
        method: "popup", // 스마트폰 푸시 알림
        minutes: min,
      })) || [];

    const body = {
      summary: eventData.title,
      description: "KIT-Bot 앱에서 등록됨",
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Seoul",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Seoul",
      },
      // 📍 여기가 핵심: 알림 설정
      reminders: {
        useDefault: remindersOverrides.length === 0, // 알림 설정 없으면 구글 기본값 사용
        overrides: remindersOverrides, // 있으면 내 설정 덮어쓰기
      },
    };

    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ 일정 등록 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 일정 등록 실패:", error);
    throw error;
  }
};

export const fetchGoogleEvents = async (
  accessToken: string,
  timeMin: string,
  timeMax: string
) => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          timeMin: timeMin,
          timeMax: timeMax,
          singleEvents: true,
          orderBy: "startTime",
        },
      }
    );
    return response.data.items as GoogleCalendarEvent[];
  } catch (error) {
    console.error("구글 캘린더 조회 실패:", error);
    return [];
  }
};

export const sendVerificationEmail = async (
  studentId: string,
  googleEmail?: string
) => {
  const response = await apiClient.post("/api/auth/email/send", {
    studentId,
    googleEmail,
  });
  return response.data;
};

// 2. 인증번호 검증 API
export const verifyEmailCode = async (
  studentId: string,
  code: string,
  googleEmail?: string
) => {
  const response = await apiClient.post("/api/auth/email/verify", {
    studentId,
    code,
    googleEmail,
  });
  return response.data;
};

export const updatePushToken = async (pushToken: string) => {
  try {
    const response = await apiClient.post("/api/user/push-token", {
      pushToken: pushToken,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

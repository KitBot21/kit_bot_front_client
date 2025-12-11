import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  QueryRequestDTO,
  QueryResponseDTO,
} from "../types/APITypes/chat_types";
import {
  CommentCreateRequest,
  CommentResponseDTO,
} from "../types/APITypes/commentTypes";
import i18n from "@/components/i18n";
import {
  Post,
  PostsParams,
  PostsResponse,
  PostCreateRequest,
  PostUpdateRequest,
  MyPostResponse,
} from "../types/APITypes/postTypes";
import { GoogleCalendarEvent } from "../types/APITypes/googleCalendarTypes";
import {
  KeywordSubscription,
  MyKeywordsResponse,
  NoticeKeywordInfo,
} from "../types/APITypes/subscripeKeyword";
import { NotificationItem } from "../types/APITypes/notification";
import {
  PopularKeyword,
  PopularKeywordsParams,
  LatestQuestionByKeyword,
} from "../types/APITypes/popularTypes";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
    appLanguage: i18n.language,
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
      sort: "createdAt,desc",
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
    reminders?: number[];
  }
) => {
  try {
    const startDateTime = `${eventData.date}T${
      eventData.startTime || "09:00"
    }:00+09:00`;
    const endDateTime = `${eventData.date}T${
      eventData.endTime || "10:00"
    }:00+09:00`;

    const remindersOverrides =
      eventData.reminders?.map((min) => ({
        method: "popup",
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
      reminders: {
        useDefault: remindersOverrides.length === 0,
        overrides: remindersOverrides,
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

    console.log(" 일정 등록 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error(" 일정 등록 실패:", error);
    throw error;
  }
};

export const updateGoogleEvent = async (
  accessToken: string,
  eventId: string,
  eventData: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    reminders?: number[];
  }
) => {
  try {
    const startDateTime = `${eventData.date}T${
      eventData.startTime || "09:00"
    }:00+09:00`;
    const endDateTime = `${eventData.date}T${
      eventData.endTime || "10:00"
    }:00+09:00`;

    const remindersOverrides =
      eventData.reminders?.map((min) => ({
        method: "popup",
        minutes: min,
      })) || [];

    const body = {
      summary: eventData.title,
      description: "KIT-Bot 앱에서 수정됨",
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Seoul",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Seoul",
      },
      reminders: {
        useDefault: remindersOverrides.length === 0,
        overrides: remindersOverrides,
      },
    };

    const response = await axios.patch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" 일정 수정 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error(" 일정 수정 실패:", error);
    throw error;
  }
};

export const deleteGoogleEvent = async (
  accessToken: string,
  eventId: string
) => {
  try {
    await axios.delete(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(" 일정 삭제 성공:", eventId);
    return true;
  } catch (error) {
    console.error(" 일정 삭제 실패:", error);
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

export const getMyKeywords = async (): Promise<KeywordSubscription[]> => {
  try {
    const response = await apiClient.get<KeywordSubscription[]>(
      "/api/notice-keywords/me"
    );
    return response.data;
  } catch (error) {
    console.error("API Error in getMyKeywords:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "키워드 조회 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const updateMyKeywords = async (
  enabledKeywords: string[]
): Promise<MyKeywordsResponse> => {
  try {
    const response = await apiClient.put<MyKeywordsResponse>(
      "/api/notice-keywords/me",
      { enabledKeywords }
    );
    return response.data;
  } catch (error) {
    console.error("API Error in updateMyKeywords:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "키워드 저장 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const toggleKeywordSubscription = async (
  keyword: string
): Promise<KeywordSubscription> => {
  try {
    const response = await apiClient.patch<KeywordSubscription>(
      `/api/notice-keywords/${keyword}/toggle`
    );
    return response.data;
  } catch (error) {
    console.error("API Error in toggleKeywordSubscription:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "키워드 토글 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const getNoticeKeywords = async (): Promise<NoticeKeywordInfo[]> => {
  try {
    const response = await apiClient.get<NoticeKeywordInfo[]>(
      "/api/notice-keywords"
    );
    return response.data;
  } catch (error) {
    console.error("API Error in getNoticeKeywords:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message ||
          "키워드 목록 조회 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const getMyNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const response = await apiClient.get<NotificationItem[]>(
      "/api/notifications/me"
    );
    return response.data;
  } catch (error) {
    console.error("API Error in getMyNotifications:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "알림 조회 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    await apiClient.patch(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    console.error("API Error in markNotificationAsRead:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "알림 읽음 처리 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<number>(
      "/api/notifications/me/unread-count"
    );
    return response.data;
  } catch (error) {
    console.error("API Error in getUnreadNotificationCount:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "알림 개수 조회 중 오류가 발생했습니다."
      );
    }
    throw new Error("네트워크 오류가 발생했습니다.");
  }
};

export const fetchPopularKeywords = async (
  params?: PopularKeywordsParams
): Promise<PopularKeyword[]> => {
  const response = await apiClient.get<PopularKeyword[]>(
    "/api/popular/answer-keywords",
    {
      params: {
        size: params?.size ?? 5,
      },
    }
  );
  return response.data;
};

export const fetchLatestQuestionByKeyword = async (
  keyword: string
): Promise<LatestQuestionByKeyword | null> => {
  try {
    const response = await apiClient.get<LatestQuestionByKeyword>(
      `/api/popular/answer-keywords/latest-question`,
      { params: { keyword } }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  await apiClient.delete(`/api/notifications/${notificationId}`);
};

export const deleteAllNotifications = async (): Promise<void> => {
  await apiClient.delete("/api/notifications/all");
};

export const withdrawUser = async (): Promise<void> => {
  await apiClient.delete("/api/user/me");
};

export const updateNotificationEnabled = async (
  enabled: boolean
): Promise<void> => {
  await apiClient.patch("/api/user/notification", { enabled });
};

export const deletePushToken = async (): Promise<void> => {
  await apiClient.delete("/api/user/push-token");
};

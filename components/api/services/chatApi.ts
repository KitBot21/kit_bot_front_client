import axios from "axios";
import { QueryRequestDTO, QueryResponseDTO } from "../types/chat_types";

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

export interface SourceDTO {
  docId: number;
  title: string; // 사용자에게 보여줄 문서 제목
  link: string; // 사용자가 클릭할 실제 URL
}

// 서버로 보낼 데이터 (Request)
export interface QueryRequestDTO {
  question: string;
  lang: string;
}

// 서버에서 받을 데이터 (Response)
export interface QueryResponseDTO {
  answer: string;
  sources: SourceDTO[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
}

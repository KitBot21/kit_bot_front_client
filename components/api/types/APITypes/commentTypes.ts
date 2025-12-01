export interface CommentCreateRequest {
  postId: string;
  content: string;
  parentId?: string | null;
  authorId: string | undefined;
}

// CommentTypes.ts
export interface CommentResponseDTO {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  parentId: string | null;
  recommendCount: number;
  reportCount: number;
  createdAt: string;
  status: string;
  isRecommended: boolean; // 추가
  isReported: boolean; // 추가
}

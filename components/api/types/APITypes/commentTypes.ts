export interface CommentCreateRequest {
  postId: string;
  content: string;
  parentId?: string | null;
}

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
}

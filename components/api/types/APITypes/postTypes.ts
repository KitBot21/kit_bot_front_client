// types/APITypes/postTypes.ts
export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  status: string;
  recommendCount: number;
  reportCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  blindedAt: string;
  blindedReason: string;
  reported: boolean;
  recommended: boolean;
}

export interface PostsResponse {
  items: Post[];
  nextCursor: string;
  hasNext: boolean;
}

export interface PostsParams {
  keyword?: string;
  after?: string;
  limit?: number;
}

export interface PostCreateRequest {
  authorId: string;
  title: string;
  content: string;
}

export interface PostReportRequest {
  postId: string;
  reason: string;
}

export interface PostUpdateRequest {
  authorId: string;
  title: string;
  content: string;
}

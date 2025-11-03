export interface CommentType {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isAnswer?: boolean;
}

export interface PostDetailType {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  views: number;
  tags: string[];
  isResolved: boolean;
}

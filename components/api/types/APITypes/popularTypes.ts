export interface PopularKeyword {
  keyword: string;
  count: number;
}

export interface PopularKeywordsParams {
  size?: number;
}

export interface LatestQuestionByKeyword {
  queryId: string;
  question: string;
  keyword: string;
  createdAt: string;
}

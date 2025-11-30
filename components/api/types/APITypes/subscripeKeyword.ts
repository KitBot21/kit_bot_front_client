export interface KeywordSubscription {
  keyword: string;
  enabled: boolean;
}

export interface MyKeywordsResponse {
  subscriptions: KeywordSubscription[];
}

export interface NoticeKeywordInfo {
  key: string;
  label: string;
}

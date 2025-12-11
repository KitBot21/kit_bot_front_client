export interface SourceDTO {
  docId: number;
  title: string;
  link: string;
}

export interface QueryRequestDTO {
  question: string;
  appLanguage: string;
}

export interface QueryResponseDTO {
  answer: string;
  sources: SourceDTO[];
  isDate: boolean;
  scheduleTitle?: string;
  startDate?: string;
  endDate?: string;
}

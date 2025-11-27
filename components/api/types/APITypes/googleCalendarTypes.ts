export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string; // 시간 지정 일정
    date?: string; // 종일 일정
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

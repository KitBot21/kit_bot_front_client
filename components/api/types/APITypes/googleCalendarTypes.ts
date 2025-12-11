export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  reminders?: {
    useDefault?: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

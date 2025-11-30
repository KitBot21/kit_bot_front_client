export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  keyword: string;
  noticeId: string;
  title: string;
  pushed: boolean;
  read: boolean;
  createdAt: string;
}

import axiosClient from "./axiosClient";
import { apiBaseUrl } from "./apiBaseUrl";

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  targetUrl?: string | null;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
  actorId?: number | null;
  actorName?: string | null;
};

type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type NotificationSummary = {
  unreadCount: number;
  notifications: PageResponse<NotificationItem>;
};

export const NotificationService = {
  getMine: (page = 0, size = 8) =>
    axiosClient.get<{ code: number; result: NotificationSummary }>("/notifications", { params: { page, size } }),
  getUnreadCount: () => axiosClient.get<{ code: number; result: number }>("/notifications/unread-count"),
  markAsRead: (id: number) => axiosClient.patch<{ code: number; result: NotificationItem }>(`/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.patch<{ code: number; result: number }>("/notifications/read-all"),
  streamUrl: (token: string) => `${apiBaseUrl}/notifications/stream?token=${encodeURIComponent(token)}`,
};

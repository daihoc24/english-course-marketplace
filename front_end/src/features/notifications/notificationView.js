import {
  FiBell,
  FiBookOpen,
  FiDollarSign,
  FiFileText,
  FiMessageSquare,
} from "react-icons/fi";

export const NOTIFICATION_PAGE_SIZE = 8;

export const notificationStatusOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "UNREAD", label: "Chưa đọc" },
  { value: "READ", label: "Đã đọc" },
];

export const notificationTypeMeta = {
  REPORT: {
    label: "Khiếu nại",
    icon: FiMessageSquare,
    className: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  REFUND: {
    label: "Hoàn tiền",
    icon: FiDollarSign,
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  ORDER: {
    label: "Đơn hàng",
    icon: FiFileText,
    className: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  COURSE: {
    label: "Khóa học",
    icon: FiBookOpen,
    className: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  SYSTEM: {
    label: "Hệ thống",
    icon: FiBell,
    className: "bg-slate-50 text-slate-700 ring-slate-200",
  },
};

export const normalizeNotificationType = (value) => (value || "SYSTEM").toString().toUpperCase();

export const formatNotificationTime = (value) => {
  if (!value) return "Chưa có dữ liệu";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu";

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffMinutes < 24 * 60) return `${Math.floor(diffMinutes / 60)} giờ trước`;
  return date.toLocaleString("vi-VN");
};

export const getNotificationStats = (items) => {
  const unread = items.filter((item) => !item.read).length;
  return {
    total: items.length,
    unread,
    read: Math.max(0, items.length - unread),
  };
};

export const filterNotifications = (items, searchTerm, statusFilter) => {
  const keyword = searchTerm.trim().toLowerCase();

  return [...items]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .filter((item) => {
      if (statusFilter === "UNREAD" && item.read) return false;
      if (statusFilter === "READ" && !item.read) return false;
      if (!keyword) return true;
      return [item.title, item.message, item.actorName, item.type].join(" ").toLowerCase().includes(keyword);
    });
};

export const getNotificationFallbackRoute = (notification) => {
  if (notification.targetUrl) return notification.targetUrl;
  if (notification.type === "REPORT") return "/my-reports";
  if (notification.type === "REFUND") return "/my-refunds";
  if (notification.type === "ORDER") return "/history";
  return "";
};

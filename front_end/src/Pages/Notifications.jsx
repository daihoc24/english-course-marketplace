import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationService } from "../API/NotificationService";
import AdminPagination from "../component/AdminPagination";
import NotificationAuthGate from "../features/notifications/NotificationAuthGate";
import NotificationFilters from "../features/notifications/NotificationFilters";
import NotificationHero from "../features/notifications/NotificationHero";
import NotificationList from "../features/notifications/NotificationList";
import NotificationStats from "../features/notifications/NotificationStats";
import {
  filterNotifications,
  getNotificationFallbackRoute,
  getNotificationStats,
  NOTIFICATION_PAGE_SIZE,
} from "../features/notifications/notificationView";
import { readStoredSession } from "../utils/session";

const Notifications = () => {
  const navigate = useNavigate();
  const session = useMemo(() => readStoredSession(), []);
  const isLoggedIn = Boolean(session?.token);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const response = await NotificationService.getMine(0, 100);
      const notifications = response.data?.result?.notifications?.content;
      setItems(Array.isArray(notifications) ? notifications : []);
    } catch (error) {
      console.error("Không tải được thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const stats = useMemo(() => getNotificationStats(items), [items]);
  const filteredItems = useMemo(
    () => filterNotifications(items, searchTerm, statusFilter),
    [items, searchTerm, statusFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / NOTIFICATION_PAGE_SIZE));
  const visibleItems = filteredItems.slice(
    (page - 1) * NOTIFICATION_PAGE_SIZE,
    page * NOTIFICATION_PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const refreshHeaderNotifications = () => {
    window.dispatchEvent(new Event("notification:refresh"));
  };

  const markAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      refreshHeaderNotifications();
    } catch (error) {
      console.error("Không thể đánh dấu đã đọc:", error);
    }
  };

  const markAsRead = async (notification) => {
    if (notification.read) return;
    await NotificationService.markAsRead(notification.id);
    setItems((current) => current.map((item) => (
      item.id === notification.id ? { ...item, read: true } : item
    )));
    refreshHeaderNotifications();
  };

  const openNotification = async (notification) => {
    try {
      await markAsRead(notification);
    } catch (error) {
      console.warn("Không thể đánh dấu đã đọc:", error);
    }

    const route = getNotificationFallbackRoute(notification);
    if (route) navigate(route);
  };

  const goTarget = (notification) => {
    if (notification.targetUrl) navigate(notification.targetUrl);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {!isLoggedIn ? (
          <NotificationAuthGate onLogin={() => navigate("/auth/login")} />
        ) : (
          <>
            <NotificationHero onMarkAllRead={markAllRead} onRefresh={loadNotifications} />
            <NotificationStats stats={stats} />
            <NotificationFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
            />
            <NotificationList
              items={visibleItems}
              loading={loading && items.length === 0}
              onGoTarget={goTarget}
              onOpen={openNotification}
              page={page}
            />

            {!loading && filteredItems.length > 0 && (
              <AdminPagination
                className="mt-6 border-t-0 px-0"
                currentPage={page}
                itemLabel="thông báo"
                onPageChange={setPage}
                pageSize={NOTIFICATION_PAGE_SIZE}
                totalItems={filteredItems.length}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Notifications;

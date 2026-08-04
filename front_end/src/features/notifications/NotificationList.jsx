import { FiAlertCircle } from "react-icons/fi";
import { NOTIFICATION_PAGE_SIZE } from "./notificationView";
import NotificationCard from "./NotificationCard";

export default function NotificationList({
  items,
  loading,
  onGoTarget,
  onOpen,
  page,
}) {
  if (loading) {
    return (
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Đang tải thông báo...
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <FiAlertCircle className="mx-auto mb-4 text-3xl text-slate-400" />
        <h2 className="text-xl font-bold">Chưa có thông báo phù hợp</h2>
        <p className="mt-2 text-sm text-slate-500">
          Khi có cập nhật mới từ hệ thống, khiếu nại hoặc hoàn tiền, bạn sẽ thấy tại đây.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {items.map((item, index) => (
        <NotificationCard
          key={item.id}
          item={item}
          number={(page - 1) * NOTIFICATION_PAGE_SIZE + index + 1}
          onGoTarget={onGoTarget}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}

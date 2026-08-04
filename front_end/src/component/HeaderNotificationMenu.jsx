import { FiBell } from "react-icons/fi";

export default function HeaderNotificationMenu({
  formatNotificationTime,
  notificationCount = 0,
  notificationLoading = false,
  notifications = [],
  onMarkAllRead,
  onNotificationClick,
  onViewAll,
}) {
  return (
    <div className="absolute right-0 top-full mt-4 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/25">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">Thông báo</p>
          <p className="text-xs text-slate-500">{notificationCount} thông báo chưa đọc</p>
        </div>
        {notificationCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Đọc tất cả
          </button>
        )}
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {notificationLoading && notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">Đang tải thông báo...</div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <FiBell className="text-xl text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Chưa có thông báo</p>
            <p className="mt-1 text-xs text-slate-500">Khi có cập nhật mới, bạn sẽ thấy tại đây.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => onNotificationClick(notification)}
              className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                notification.read ? "bg-white" : "bg-blue-50/70"
              }`}
            >
              <div className="flex gap-3">
                <span className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${notification.read ? "bg-slate-300" : "bg-blue-600"}`} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-950">{notification.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{notification.message}</span>
                  <span className="mt-2 block text-[11px] font-medium text-slate-400">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </span>
              </div>
            </button>
          ))
        )}
      </div>
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Xem tất cả thông báo
        </button>
      </div>
    </div>
  );
}

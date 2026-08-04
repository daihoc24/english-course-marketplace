import { FiClock, FiExternalLink } from "react-icons/fi";
import {
  formatNotificationTime,
  normalizeNotificationType,
  notificationTypeMeta,
} from "./notificationView";

export default function NotificationCard({ item, number, onGoTarget, onOpen }) {
  const meta = notificationTypeMeta[normalizeNotificationType(item.type)] || notificationTypeMeta.SYSTEM;
  const Icon = meta.icon;

  return (
    <article
      className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        item.read ? "border-slate-200" : "border-blue-200 ring-4 ring-blue-50"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
              {number}
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${meta.className}`}>
              <Icon /> {meta.label}
            </span>
            {!item.read && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                Chưa đọc
              </span>
            )}
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-950">{item.title}</h2>
          <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{item.message}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {item.actorName && (
              <span>
                Từ: <strong className="text-slate-700">{item.actorName}</strong>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <FiClock /> {formatNotificationTime(item.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-60">
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            Mở thông báo
          </button>
          <button
            type="button"
            onClick={() => onGoTarget(item)}
            disabled={!item.targetUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiExternalLink /> Đi tới trang liên quan
          </button>
        </div>
      </div>
    </article>
  );
}

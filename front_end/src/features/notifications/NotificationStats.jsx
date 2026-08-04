const statCards = [
  { key: "total", label: "Tổng thông báo", className: "border-slate-200 bg-white text-slate-950" },
  { key: "unread", label: "Chưa đọc", className: "border-amber-100 bg-amber-50 text-amber-700" },
  { key: "read", label: "Đã đọc", className: "border-emerald-100 bg-emerald-50 text-emerald-700" },
];

export default function NotificationStats({ stats }) {
  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-3">
      {statCards.map((item) => (
        <div key={item.key} className={`rounded-2xl border p-5 shadow-sm ${item.className}`}>
          <p className="text-sm opacity-80">{item.label}</p>
          <p className="mt-2 text-3xl font-bold">{stats[item.key]}</p>
        </div>
      ))}
    </section>
  );
}

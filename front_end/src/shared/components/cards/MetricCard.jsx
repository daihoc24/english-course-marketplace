const toneClass = {
  slate: "border-slate-200 bg-white text-slate-900",
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  sky: "border-sky-100 bg-sky-50 text-sky-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  orange: "border-orange-100 bg-orange-50 text-orange-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  rose: "border-rose-100 bg-rose-50 text-rose-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
};

export default function MetricCard({ icon, label, value, tone = "slate" }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass[tone] || toneClass.slate}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        {icon && <div className="rounded-xl bg-white/70 p-3 text-xl">{icon}</div>}
      </div>
    </div>
  );
}

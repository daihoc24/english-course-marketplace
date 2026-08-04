const toneClass = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  sky: "bg-sky-100 text-sky-800 ring-sky-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  orange: "bg-orange-100 text-orange-800 ring-orange-200",
  emerald: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rose: "bg-rose-100 text-rose-800 ring-rose-200",
  violet: "bg-violet-100 text-violet-800 ring-violet-200",
};

export default function StatusBadge({
  children,
  className = "",
  label,
  title,
  tone = "slate",
}) {
  const content = children || label || "—";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ${toneClass[tone] || toneClass.slate} ${className}`}
      title={title}
    >
      {content}
    </span>
  );
}

const toneClass = {
  slate: "bg-slate-50 text-slate-500 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
};

const sizeClass = {
  sm: "px-2.5 py-1",
  md: "px-3 py-2",
};

const shapeClass = {
  pill: "rounded-full",
  rounded: "rounded-lg",
};

export default function InfoBadge({
  children,
  className = "",
  icon,
  label,
  shape = "rounded",
  size = "md",
  title,
  tone = "slate",
}) {
  const content = children || label || "—";

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium ring-1 ${shapeClass[shape] || shapeClass.rounded} ${sizeClass[size] || sizeClass.md} ${toneClass[tone] || toneClass.slate} ${className}`}
      title={title}
    >
      {icon}
      {content}
    </span>
  );
}

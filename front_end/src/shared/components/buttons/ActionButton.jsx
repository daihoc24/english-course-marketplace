const toneClass = {
  blue: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
  emerald: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300",
  orange: "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300",
  rose: "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300",
  slate: "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 disabled:text-slate-400",
};

export default function ActionButton({
  busy = false,
  children,
  className = "",
  icon,
  tone = "blue",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed ${toneClass[tone] || toneClass.blue} ${className}`}
      {...props}
    >
      {icon}
      {busy ? "Đang gửi..." : children}
    </button>
  );
}

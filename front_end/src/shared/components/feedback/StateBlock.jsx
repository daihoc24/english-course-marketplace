export default function StateBlock({ className = "", compact = false, text }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 ${compact ? "h-full" : "min-h-48"} ${className}`}
    >
      {text}
    </div>
  );
}

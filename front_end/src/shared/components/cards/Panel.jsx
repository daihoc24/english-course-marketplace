export default function Panel({ bodyClassName = "min-h-80", children, title }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-4 font-bold text-slate-950">{title}</h2>}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

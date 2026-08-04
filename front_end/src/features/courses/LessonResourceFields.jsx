import { FiLink, FiTrash2 } from "react-icons/fi";

export default function LessonResourceFields({
  onChange,
  onRemove,
  resources,
}) {
  const items = resources?.length ? resources : [{ title: "", url: "" }];
  const removeDisabled = items.length <= 1;

  return (
    <div className="space-y-3">
      {items.map((resource, index) => (
        <div key={`resource-${index}`} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <input
              type="text"
              value={resource.title}
              onChange={(event) => onChange(index, "title", event.target.value)}
              placeholder="Tên tài liệu"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            />
            <div className="relative">
              <FiLink className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={resource.url}
                onChange={(event) => onChange(index, "url", event.target.value)}
                placeholder="Link tài liệu nếu có"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="inline-flex items-center justify-center rounded-lg border border-red-100 bg-white px-3 py-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={removeDisabled}
              aria-label="Xóa tài liệu"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

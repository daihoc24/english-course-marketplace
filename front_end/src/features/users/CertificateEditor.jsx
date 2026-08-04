import { Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { normalizeCertificateUrl } from "../../utils/certificates";

export default function CertificateEditor({
  items,
  onAdd,
  onChange,
  onRemove,
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const itemUrl = normalizeCertificateUrl(item.link);
        const hasLink = Boolean(itemUrl);

        return (
          <div key={`certificate-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-700">Chứng chỉ {index + 1}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    hasLink ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {hasLink ? "Có liên kết" : "Chưa có liên kết"}
                </span>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-red-600 hover:bg-red-50"
                  aria-label="Xóa chứng chỉ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <input
                value={item.title}
                onChange={(event) => onChange(index, "title", event.target.value)}
                placeholder="Ví dụ: TOEIC 1000, IELTS 7.5"
                className="profile-input"
              />
              <input
                value={item.link}
                onChange={(event) => onChange(index, "link", event.target.value)}
                placeholder="Link minh chứng nếu có"
                className="profile-input"
              />
              {hasLink ? (
                <a
                  href={itemUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <LinkIcon className="h-4 w-4" />
                  Mở liên kết
                </a>
              ) : (
                <div className="inline-flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                  Tùy chọn
                </div>
              )}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100"
      >
        <Plus className="h-4 w-4" />
        Thêm chứng chỉ
      </button>
    </div>
  );
}

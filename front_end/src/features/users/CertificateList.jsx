import { Link as LinkIcon } from "lucide-react";
import { normalizeCertificateUrl } from "../../utils/certificates";

export default function CertificateList({ emptyText = "Chưa cập nhật chứng chỉ.", items }) {
  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const itemUrl = normalizeCertificateUrl(item.link);
        const hasLink = Boolean(itemUrl);

        return (
          <div
            key={`${item.title}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 rounded-xl bg-white p-2 text-blue-600">
                  <LinkIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{item.title || "Chứng chỉ"}</p>
                  <p className="text-xs text-slate-500">
                    {hasLink ? "Có liên kết xác minh." : "Chưa có liên kết."}
                  </p>
                </div>
              </div>
              {hasLink && (
                <a
                  href={itemUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <LinkIcon className="h-4 w-4" />
                  Mở liên kết
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

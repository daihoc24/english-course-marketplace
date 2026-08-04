import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { normalizeCertificateUrl } from "../../utils/certificates";

export default function LessonResourceList({ emptyText = "Bài học này chưa có tài liệu đính kèm.", resources = [] }) {
  if (!resources.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {resources.map((resource, index) => {
        const resourceUrl = normalizeCertificateUrl(resource.url);

        return (
          <li
            key={resource.id || `${resource.title}-${index}`}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                <LinkIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{resource.title || resource.fileName || "Tài liệu bài học"}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                  {resourceUrl ? "Liên kết tài liệu" : "Chưa có liên kết hợp lệ"}
                </p>
              </div>
            </div>

            {resourceUrl ? (
              <a
                href={resourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
                Mở tài liệu
              </a>
            ) : (
              <span className="text-sm text-slate-500">Chưa có liên kết hợp lệ</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

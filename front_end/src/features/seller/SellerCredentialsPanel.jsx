import { Award, BookOpen, Clock, Link as LinkIcon, ShieldCheck, Star } from "lucide-react";
import { normalizeCertificateUrl } from "../../utils/certificates";

function SellerCertificates({ certificates }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-950">
        <Award size={20} className="text-amber-500" />
        Chứng chỉ & thành tựu
      </h3>
      {certificates.length ? (
        <div className="space-y-3">
          {certificates.map((certificate, index) => {
            const certificateUrl = normalizeCertificateUrl(certificate.link);
            return (
              <div
                key={`${certificate.title}-${index}`}
                className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Award size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-950">{certificate.title || "Chứng chỉ"}</p>
                  {certificateUrl ? (
                    <p className="mt-1 truncate text-sm text-slate-500">Có liên kết xác minh.</p>
                  ) : (
                    <p className="mt-1 truncate text-sm text-slate-500">Chưa có liên kết.</p>
                  )}
                </div>
                {certificateUrl && (
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <LinkIcon size={16} />
                    Mở liên kết
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
          Người bán chưa cập nhật chứng chỉ. Có thể bổ sung trong trang thông tin cá nhân.
        </p>
      )}
    </div>
  );
}

function TeachingOverview({ certificatesCount, stats }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-6">
      <h3 className="mb-4 text-lg font-bold text-slate-950">Tổng quan giảng dạy</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-5">
          <BookOpen className="mb-3 text-blue-600" />
          <p className="text-2xl font-extrabold text-slate-950">{stats.totalCourses}</p>
          <p className="text-sm text-slate-500">Khóa học công khai</p>
        </div>
        <div className="rounded-2xl bg-white p-5">
          <Clock className="mb-3 text-emerald-600" />
          <p className="text-2xl font-extrabold text-slate-950">{stats.totalDurationLabel}</p>
          <p className="text-sm text-slate-500">Tổng thời lượng</p>
        </div>
        <div className="rounded-2xl bg-white p-5">
          <Star className="mb-3 text-amber-500" />
          <p className="text-2xl font-extrabold text-slate-950">{stats.averageRating || "Chưa có"}</p>
          <p className="text-sm text-slate-500">Đánh giá trung bình</p>
        </div>
        <div className="rounded-2xl bg-white p-5">
          <ShieldCheck className="mb-3 text-violet-600" />
          <p className="text-2xl font-extrabold text-slate-950">{certificatesCount}</p>
          <p className="text-sm text-slate-500">Chứng chỉ</p>
        </div>
      </div>
    </div>
  );
}

export default function SellerCredentialsPanel({ certificates, stats }) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <SellerCertificates certificates={certificates} />
      <TeachingOverview certificatesCount={certificates.length} stats={stats} />
    </div>
  );
}

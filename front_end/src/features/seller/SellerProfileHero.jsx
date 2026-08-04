import { Award, ShieldCheck, User } from "lucide-react";
import { getSellerHeroIntro } from "./sellerDetailView";

export default function SellerProfileHero({ certificatesCount, seller, stats }) {
  return (
    <div className="relative bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_28%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_54%,#7c3aed_100%)] px-7 py-8 text-white md:px-10">
      <div className="absolute right-8 top-8 hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur md:block">
        Hồ sơ giảng viên
      </div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-3xl border-4 border-white/80 bg-white/15 shadow-2xl">
          {seller.avatar ? (
            <img src={seller.avatar} alt={seller.fullname} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User size={54} className="text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
              <ShieldCheck size={14} />
              Người bán đã xác thực
            </span>
            {certificatesCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-slate-950">
                <Award size={14} />
                {certificatesCount} chứng chỉ
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            {seller.fullname || seller.username || "Người bán"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 md:text-base">
            {getSellerHeroIntro(seller)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur">
              <p className="text-2xl font-extrabold">{stats.totalCourses}</p>
              <p className="text-xs font-medium text-blue-50">Khóa học</p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur">
              <p className="text-2xl font-extrabold">{stats.averageRating || "—"}</p>
              <p className="text-xs font-medium text-blue-50">Đánh giá TB</p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur">
              <p className="text-2xl font-extrabold">{stats.totalLessons}</p>
              <p className="text-xs font-medium text-blue-50">Bài học</p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur">
              <p className="text-2xl font-extrabold">{stats.totalHeroDurationLabel}</p>
              <p className="text-xs font-medium text-blue-50">Tổng thời lượng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

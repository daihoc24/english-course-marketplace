import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Star, Users, BookOpen, Award, ArrowLeft } from "lucide-react";
import axiosClient from "../API/axiosClient";
import { parseCertificateEntries } from "../utils/certificates";

const Teachers = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get("/seller/teachers/catalog");
        const body = res.data;
        const list = Array.isArray(body?.result) ? body.result : [];
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || e.message || "Không tải được danh sách");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách giảng viên</h1>
        <p className="text-gray-600 mb-8">
          Thông tin lấy từ tài khoản người bán (SELLER) và số liệu khóa học / học viên trên hệ thống.
        </p>

        {loading && (
          <div className="text-center py-20 text-gray-600">Đang tải…</div>
        )}
        {error && !loading && (
          <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3">{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl bg-gray-800 text-gray-300 px-6 py-12 text-center">
            Chưa có giảng viên nào (hoặc chưa kích hoạt tài khoản).
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((t) => {
            const teacherCertificates = parseCertificateEntries(t.certificate);
            return (
            <article
              key={t.id}
              className="rounded-2xl bg-gray-800 text-gray-100 shadow-xl border border-gray-700/80 p-6 flex flex-col gap-4"
            >
              <div className="flex gap-4">
                <div className="shrink-0">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt=""
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-white italic truncate">{t.fullname}</h2>
                  {t.introduce && (
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">📌 {t.introduce}</p>
                  )}
                  {teacherCertificates.length > 0 && (
                    <div className="mt-2 flex items-start gap-1 text-sm text-gray-400">
                      <Award className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div className="flex flex-wrap gap-1.5">
                        {teacherCertificates.slice(0, 3).map((certificate, index) => (
                          <span key={`${certificate.title}-${index}`} className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-200">
                            {certificate.title || "Chứng nhận"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>
                    {t.averageRating > 0 ? `${t.averageRating} điểm TB` : "Chưa có đánh giá"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{t.totalStudents ?? 0} học viên</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {t.totalCourses ?? 0} khóa học
                    {typeof t.activeCourses === "number"
                      ? ` (${t.activeCourses} đang mở bán)`
                      : ""}
                  </span>
                </div>
              </div>

              <div className="mt-auto flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/seller/${t.id}`)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 shadow"
                >
                  Xem hồ sơ
                </button>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Teachers;

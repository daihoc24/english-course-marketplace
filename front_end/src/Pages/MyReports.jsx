import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiMessageSquare,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import axiosClient from "../API/axiosClient";
import { getMyReports } from "../API/ReportService";
import AdminPagination from "../component/AdminPagination";
import {
  PAGE_SIZE,
  matchesStatusFilter,
  statusFilterOptions,
  toReport,
} from "../features/complaints/myReportsView";
import { readStoredSession } from "../utils/session";

const MyReportCard = React.lazy(() => import("../features/complaints/MyReportCard"));

const MyReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = readStoredSession();
  const isLoggedIn = Boolean(session?.token);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const courseIdFromUrl = params.get("courseId") || "";
  const courseTitleFromUrl = params.get("courseTitle") || "";
  const reportIdFromUrl = params.get("reportId") || "";
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(isLoggedIn);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [resolvedCourseName, setResolvedCourseName] = useState("");

  const loadReports = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const response = await getMyReports();
      setReports((Array.isArray(response.data?.result) ? response.data.result : []).map(toReport));
      setError("");
    } catch (err) {
      console.error("Không thể tải khiếu nại của tôi:", err);
      setError(err?.response?.data?.message || "Không thể tải danh sách khiếu nại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const filteredReports = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return [...reports]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .filter((report) => {
        const matchesCourse = !courseIdFromUrl || String(report.courseId) === String(courseIdFromUrl);
        const matchesStatus = matchesStatusFilter(report.status, statusFilter);
        const matchesKeyword = !keyword || [report.courseName, report.subject, report.detail, report.adminResponse]
          .join(" ").toLowerCase().includes(keyword);
        return matchesCourse && matchesStatus && matchesKeyword;
      });
  }, [reports, searchTerm, statusFilter, courseIdFromUrl]);

  const reportCourseName = useMemo(() => {
    if (!courseIdFromUrl) return "";
    return reports.find((report) => String(report.courseId) === String(courseIdFromUrl))?.courseName?.trim() || "";
  }, [reports, courseIdFromUrl]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const visibleReports = filteredReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (!courseIdFromUrl) {
      setResolvedCourseName("");
      return;
    }

    const titleFromUrl = courseTitleFromUrl.trim();
    if (titleFromUrl) {
      setResolvedCourseName(titleFromUrl);
      return;
    }

    if (reportCourseName) {
      setResolvedCourseName(reportCourseName);
      return;
    }

    let isCancelled = false;
    const loadCourseTitle = async () => {
      try {
        const response = await axiosClient.get(`/courses/${courseIdFromUrl}`);
        const courseData = response.data?.result || response.data || {};
        const title = (courseData.name || courseData.title || "").trim();
        if (!isCancelled) {
          setResolvedCourseName(title);
        }
      } catch (_error) {
        if (!isCancelled) {
          setResolvedCourseName("");
        }
      }
    };

    loadCourseTitle();

    return () => {
      isCancelled = true;
    };
  }, [courseIdFromUrl, courseTitleFromUrl, reportCourseName]);

  const filteredCourseName = resolvedCourseName || courseTitleFromUrl.trim() || reportCourseName || (courseIdFromUrl ? `Khóa học #${courseIdFromUrl}` : "");
  const stats = useMemo(() => {
    const completed = reports.filter((item) => ["RESOLVED", "REFUND_RECOMMENDED"].includes(item.status)).length;
    return { total: reports.length, pending: reports.length - completed, completed };
  }, [reports]);

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, courseIdFromUrl]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  useEffect(() => {
    if (!reportIdFromUrl || loading) return;
    const reportIndex = filteredReports.findIndex((report) => String(report.id) === String(reportIdFromUrl));
    if (reportIndex >= 0) setPage(Math.floor(reportIndex / PAGE_SIZE) + 1);
  }, [reportIdFromUrl, filteredReports, loading]);
  useEffect(() => {
    if (!reportIdFromUrl) return;
    const timer = window.setTimeout(() => document.getElementById(`my-report-${reportIdFromUrl}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
    return () => window.clearTimeout(timer);
  }, [reportIdFromUrl, page, visibleReports.length]);

  const clearCourseFilter = () => navigate("/my-reports");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {!isLoggedIn ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <FiMessageSquare className="mx-auto mb-4 text-3xl text-blue-600" />
            <h1 className="text-2xl font-bold">Đăng nhập để xem khiếu nại</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">Theo dõi phản hồi chính thức từ quản trị viên cho các khiếu nại và đề xuất hoàn tiền của bạn.</p>
            <button type="button" onClick={() => navigate("/auth/login")} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">Đăng nhập</button>
          </section>
        ) : <>
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative p-8 sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_30%)]" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100"><FiMessageSquare /> Trung tâm hỗ trợ</span>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Khiếu nại của tôi</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Trao đổi với quản trị viên về chất lượng khóa học và theo dõi mọi đề xuất hoàn tiền tại một nơi.</p>
                </div>
                <button type="button" onClick={loadReports} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700"><FiRefreshCw /> Làm mới</button>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Tổng khiếu nại</p><p className="mt-2 text-3xl font-bold">{stats.total}</p></div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm"><p className="text-sm text-amber-700">Đang xử lý</p><p className="mt-2 text-3xl font-bold text-amber-700">{stats.pending}</p></div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm"><p className="text-sm text-emerald-700">Đã có kết luận</p><p className="mt-2 text-3xl font-bold text-emerald-700">{stats.completed}</p></div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            {courseIdFromUrl && <div className="mb-3 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800"><span>Đang xem khiếu nại của khóa học: <strong>{filteredCourseName}</strong></span><button type="button" onClick={clearCourseFilter} className="font-semibold hover:underline">Xóa lọc</button></div>}
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm theo khóa học, tiêu đề hoặc nội dung khiếu nại..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50">
                {statusFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="mt-6 space-y-4">
            {loading ? <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">Đang tải danh sách khiếu nại...</div>
              : error ? <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">{error}</div>
              : filteredReports.length === 0 ? <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"><FiAlertCircle className="mx-auto mb-4 text-3xl text-slate-400" /><h2 className="text-xl font-bold">Chưa có khiếu nại phù hợp</h2><p className="mt-2 text-sm text-slate-500">Khi bạn gửi khiếu nại trong trang chi tiết khóa học, nội dung sẽ xuất hiện ở đây.</p></div>
              : (
                <React.Suspense
                  fallback={<div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">Đang tải danh sách khiếu nại...</div>}
                >
                  {visibleReports.map((report, index) => (
                    <MyReportCard
                      key={report.id}
                      index={index}
                      isFocused={String(report.id) === reportIdFromUrl}
                      onViewCourse={(courseId) => navigate(`/detail/${courseId}`)}
                      page={page}
                      pageSize={PAGE_SIZE}
                      report={report}
                    />
                  ))}
                </React.Suspense>
              )}
          </section>
          {!loading && !error && filteredReports.length > 0 && (
            <AdminPagination
              className="mt-6 border-t-0 px-0"
              currentPage={page}
              itemLabel="khiếu nại"
              onPageChange={setPage}
              pageSize={PAGE_SIZE}
              totalItems={filteredReports.length}
            />
          )}
        </>}
      </main>
    </div>
  );
};

export default MyReports;



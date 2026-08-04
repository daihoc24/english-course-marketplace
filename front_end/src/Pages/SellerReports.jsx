import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getSellerReports, sellerRespondReport } from "../API/ReportService";
import AdminPagination from "../component/AdminPagination";
import SellerReportFilters from "../features/seller/SellerReportFilters";
import { SellerReportsHero, SellerReportStats } from "../features/seller/SellerReportsHero";
import SellerReportsList from "../features/seller/SellerReportsList";
import {
  getSellerReportStats,
  SELLER_REPORT_PAGE_SIZE,
  toSellerReport,
} from "../features/seller/sellerReportsView";
import { normalizePagePayload } from "../utils/pagination";
import useDebouncedValue from "../utils/useDebouncedValue";

const SellerReportDetailModal = React.lazy(() => import("../features/seller/SellerReportDetailModal"));

const modalFallback = (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
    <div className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-2xl">
      Đang tải chi tiết khiếu nại...
    </div>
  </div>
);

const SellerReports = ({ embedded = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSellerReports({
        page: page - 1,
        size: SELLER_REPORT_PAGE_SIZE,
        keyword: debouncedSearchTerm.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      const { content, totalElements } = normalizePagePayload(response.data);
      setReports(content.map(toSellerReport));
      setTotalReports(totalElements);
      setError("");
    } catch (err) {
      console.error("Không thể tải khiếu nại của người bán:", err);
      setError(err?.response?.data?.message || "Không thể tải danh sách khiếu nại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, page, statusFilter]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  useEffect(() => {
    const reportId = new URLSearchParams(location.search).get("reportId");
    if (!reportId || reports.length === 0) return;
    const found = reports.find((item) => item.id === String(reportId));
    if (found) {
      setSelectedReport(found);
      setResponseText(found.sellerResponse || "");
    }
  }, [location.search, reports]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  const stats = useMemo(
    () => getSellerReportStats(reports, totalReports),
    [reports, totalReports]
  );

  const openReport = (report) => {
    setSelectedReport(report);
    setResponseText(report.sellerResponse || "");
    setSuccessMessage("");
    navigate(
      embedded ? `/seller/dashboard?tab=reports&reportId=${report.id}` : `/seller/reports?reportId=${report.id}`,
      { replace: false }
    );
  };

  const closeReport = () => {
    setSelectedReport(null);
    setResponseText("");
    navigate(embedded ? "/seller/dashboard?tab=reports" : "/seller/reports", { replace: true });
  };

  const handleRespond = async () => {
    if (selectedReport?.status !== "SELLER_ACTION_REQUIRED") {
      setError("Bạn chỉ có thể phản hồi khi admin đã yêu cầu khắc phục khiếu nại này.");
      return;
    }
    if (!selectedReport || !responseText.trim()) {
      setError("Vui lòng nhập nội dung cập nhật trước khi gửi.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await sellerRespondReport(selectedReport.id, responseText.trim());
      const updated = toSellerReport(response.data?.result);
      setReports((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedReport(updated);
      setResponseText(updated.sellerResponse || "");
      setSuccessMessage("Đã gửi phản hồi cho admin và học viên.");
    } catch (err) {
      console.error("Không thể gửi phản hồi khiếu nại:", err);
      setError(err?.response?.data?.message || "Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const canRespond = selectedReport?.status === "SELLER_ACTION_REQUIRED";

  return (
    <div className={embedded ? "text-slate-950" : "min-h-screen bg-slate-50 text-slate-950"}>
      <main className={embedded ? "mx-auto max-w-7xl" : "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"}>
        {!embedded && (
          <button
            type="button"
            onClick={() => navigate("/seller/dashboard")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
          >
            <FiArrowLeft /> Về dashboard người bán
          </button>
        )}

        <SellerReportsHero loading={loading} onRefresh={loadReports} />
        <SellerReportStats stats={stats} />
        <SellerReportFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
        />
        <SellerReportsList
          error={error}
          loading={loading}
          onOpenReport={openReport}
          page={page}
          reports={reports}
        />

        {!loading && reports.length > 0 && (
          <AdminPagination
            currentPage={page}
            itemLabel="khiếu nại"
            onPageChange={setPage}
            pageSize={SELLER_REPORT_PAGE_SIZE}
            totalItems={totalReports}
          />
        )}
      </main>

      {selectedReport && (
        <React.Suspense fallback={modalFallback}>
          <SellerReportDetailModal
            canRespond={canRespond}
            error={error}
            onClose={closeReport}
            onRespond={handleRespond}
            onResponseChange={setResponseText}
            report={selectedReport}
            responseText={responseText}
            saving={saving}
            successMessage={successMessage}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default SellerReports;

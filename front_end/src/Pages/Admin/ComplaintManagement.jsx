import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  Eye,
  Image as ImageIcon,
  RefreshCw,
  Video,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminPagination from "../../component/AdminPagination";
import axiosClient from "../../API/axiosClient";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import StatusBadge from "../../shared/components/badges/StatusBadge";
import ActionButton from "../../shared/components/buttons/ActionButton";
import MetricCard from "../../shared/components/cards/MetricCard";
import { AdminPageHeader, AdminPageShell } from "../../shared/components/layout/AdminPageLayout";
import TableToolbar from "../../shared/components/table/TableToolbar";
import { formatDateTime } from "../../shared/utils/formatters";
import {
  complaintCategoryLabel,
  complaintPriorityLabel,
  complaintPriorityTone,
  complaintStatusLabel,
  complaintStatusOptions,
  complaintStatusTone,
  complaintInitialResponse,
  isVideoEvidenceUrl,
  toComplaint,
} from "../../features/complaints/complaintView";

const ComplaintDetailPanel = lazy(() => import("../../features/complaints/ComplaintDetailPanel"));

const ComplaintDetailFallback = () => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-2xl">
      Đang tải chi tiết khiếu nại...
    </div>
  </div>
);

const api = {
  getAllReports: async (params) => {
    const response = await axiosClient.get("/reports/all", { params });
    return normalizePagePayload(response.data);
  },
  resolveReport: async (id, responseText) => {
    const response = await axiosClient.patch(`/reports/${id}/resolve`, { responseText });
    return response.data?.result;
  },
  requestSellerAction: async (id, responseText) => {
    const response = await axiosClient.patch(`/reports/${id}/request-seller-action`, { responseText });
    return response.data?.result;
  },
  recommendRefund: async (id, responseText) => {
    const response = await axiosClient.patch(`/reports/${id}/recommend-refund`, { responseText });
    return response.data?.result;
  },
};

const formatDate = (value) => formatDateTime(value, "Chưa có");

export default function ComplaintManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const loadComplaints = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const page = await api.getAllReports({
        page: currentPage - 1,
        size: pageSize,
        keyword: debouncedSearchTerm.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setComplaints(page.content.map(toComplaint));
      setTotalComplaints(page.totalElements);
      setError("");
    } catch (err) {
      console.error("Không thể tải danh sách khiếu nại:", err);
      setError(err?.response?.data?.message || "Không thể tải danh sách khiếu nại. Vui lòng thử lại.");
      setComplaints([]);
      setTotalComplaints(0);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, pageSize, statusFilter]);

  useEffect(() => {
    void loadComplaints();
  }, [loadComplaints]);

  useEffect(() => {
    const onNotification = (event) => {
      if (["REPORT_SUBMITTED", "REPORT_SELLER_FIXED"].includes(event.detail?.type)) {
        void loadComplaints({ silent: true });
      }
    };
    window.addEventListener("notification:new", onNotification);
    return () => window.removeEventListener("notification:new", onNotification);
  }, [loadComplaints]);

  const rowStartIndex = (currentPage - 1) * pageSize;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, pageSize]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(totalComplaints / pageSize));
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageSize, totalComplaints]);

  useEffect(() => {
    const reportId = new URLSearchParams(location.search).get("reportId");
    if (!reportId || complaints.length === 0) return;

    const complaint = complaints.find((item) => item.id === reportId);
    if (complaint) {
      setSelectedComplaint(complaint);
      setResponse(complaintInitialResponse(complaint));
    }
  }, [location.search, complaints]);

  const stats = useMemo(() => {
    const pending = complaints.filter((item) => item.status === "PENDING").length;
    const sellerAction = complaints.filter((item) => item.status === "SELLER_ACTION_REQUIRED").length;
    const sellerFixed = complaints.filter((item) => item.status === "SELLER_FIXED").length;
    const closed = complaints.filter((item) => ["RESOLVED", "REFUND_RECOMMENDED"].includes(item.status)).length;
    return { pending, sellerAction, sellerFixed, closed, total: totalComplaints };
  }, [complaints, totalComplaints]);

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setResponse(complaintInitialResponse(complaint));
    setSuccessMessage("");
    setError("");
    navigate(`/admin/ComplaintManagement?reportId=${complaint.id}`, { replace: false });
  };

  const closeComplaint = () => {
    setSelectedComplaint(null);
    setResponse("");
    setSuccessMessage("");
    navigate("/admin/ComplaintManagement", { replace: true });
  };

  const applyAction = async (action, successText) => {
    if (!selectedComplaint || !response.trim()) {
      setError("Nhập nội dung xử lý trước khi gửi.");
      return;
    }

    try {
      setSavingAction(action);
      setError("");
      const handlers = {
        resolve: api.resolveReport,
        seller: api.requestSellerAction,
        refund: api.recommendRefund,
      };
      const updated = toComplaint(await handlers[action](selectedComplaint.id, response.trim()));
      setComplaints((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedComplaint(updated);
      setResponse(complaintInitialResponse(updated));
      setSuccessMessage(successText);
    } catch (err) {
      console.error("Không thể xử lý khiếu nại:", err);
      setError(err?.response?.data?.message || "Không thể xử lý khiếu nại. Vui lòng thử lại.");
    } finally {
      setSavingAction("");
    }
  };

  return (
    <>
      <AdminPageShell>
        <AdminPageHeader
          eyebrow="Chăm sóc học viên"
          title="Khiếu nại"
          description="Theo dõi phản ánh của học viên, yêu cầu người bán xử lý hoặc đề xuất hoàn tiền khi cần."
          actions={(
            <ActionButton
              type="button"
              onClick={() => loadComplaints()}
              tone="slate"
              className="rounded-xl px-4 text-sm"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Làm mới
            </ActionButton>
          )}
        />

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Tổng khiếu nại" value={stats.total.toLocaleString("vi-VN")} />
            <MetricCard label="Chờ admin xem (trang này)" value={stats.pending.toLocaleString("vi-VN")} tone="amber" />
            <MetricCard label="Chờ người bán (trang này)" value={stats.sellerAction.toLocaleString("vi-VN")} tone="orange" />
            <MetricCard label="Người bán phản hồi (trang này)" value={stats.sellerFixed.toLocaleString("vi-VN")} tone="blue" />
            <MetricCard label="Đã kết luận (trang này)" value={stats.closed.toLocaleString("vi-VN")} tone="emerald" />
          </div>

          <div className="mb-6">
            <TableToolbar
              filterOptions={complaintStatusOptions}
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm theo học viên, khóa học, người bán hoặc nội dung..."
              searchValue={searchTerm}
            />
          </div>

          {error && !selectedComplaint && (
            <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-16 px-5 py-3">STT</th>
                    <th className="px-5 py-3">Người gửi</th>
                    <th className="px-5 py-3">Khóa học / tiêu đề</th>
                    <th className="px-5 py-3">Người bán</th>
                    <th className="px-5 py-3">Loại</th>
                    <th className="px-5 py-3">Ưu tiên</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-5 py-12 text-center text-slate-500">
                        Đang tải danh sách khiếu nại...
                      </td>
                    </tr>
                  ) : complaints.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-5 py-12 text-center text-slate-500">
                        Chưa có khiếu nại phù hợp.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((complaint, index) => (
                      <tr key={complaint.id} className="align-top transition hover:bg-slate-50/80">
                        <td className="px-5 py-4 font-semibold text-slate-700">{rowStartIndex + index + 1}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-950">{complaint.userName}</p>
                          <p className="mt-1 text-xs text-slate-500">{complaint.userEmail}</p>
                          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={13} /> {formatDate(complaint.date)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="flex items-center gap-2 font-semibold text-slate-950">
                            {complaint.subject}
                            {complaint.attachmentUrl &&
                              (isVideoEvidenceUrl(complaint.attachmentUrl) ? (
                                <Video className="h-4 w-4 text-blue-500" />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              ))}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{complaint.courseTitle}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">{complaint.sellerName}</p>
                          <p className="mt-1 text-xs text-slate-500">{complaint.sellerEmail || "Chưa có email"}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{complaintCategoryLabel[complaint.category] || complaint.category}</td>
                        <td className="px-5 py-4">
                          <StatusBadge tone={complaintPriorityTone[complaint.priority] || "slate"}>
                            {complaintPriorityLabel[complaint.priority] || complaint.priority}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge tone={complaintStatusTone[complaint.status] || "slate"}>
                            {complaintStatusLabel[complaint.status] || complaint.status}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ActionButton
                            type="button"
                            onClick={() => openComplaint(complaint)}
                          >
                            <Eye size={14} /> Xem
                          </ActionButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <AdminPagination
              currentPage={currentPage}
              itemLabel="khiếu nại"
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSize={pageSize}
              totalItems={totalComplaints}
            />
          </section>
      </AdminPageShell>

      {selectedComplaint && (
        <Suspense fallback={<ComplaintDetailFallback />}>
          <ComplaintDetailPanel
            complaint={selectedComplaint}
            error={error}
            formatDate={formatDate}
            onApplyAction={applyAction}
            onClose={closeComplaint}
            onResponseChange={setResponse}
            response={response}
            savingAction={savingAction}
            successMessage={successMessage}
          />
        </Suspense>
      )}
    </>
  );
}

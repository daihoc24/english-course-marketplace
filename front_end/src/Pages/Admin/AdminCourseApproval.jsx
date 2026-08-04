import React, { useState, useEffect, useMemo } from "react";
import { FiX, FiBook } from "react-icons/fi";
import axiosClient from "../../API/axiosClient";
import AdminPagination from "../../component/AdminPagination";
import AdminCourseReviewCard from "../../features/courseReviews/AdminCourseReviewCard";
import {
  courseReviewStatusOptions,
  getCourseReviewSummary,
  toCourseReviewItem,
} from "../../features/courseReviews/courseReviewView";
import MetricCard from "../../shared/components/cards/MetricCard";
import { AdminPageHeader, AdminPageShell } from "../../shared/components/layout/AdminPageLayout";
import TableToolbar from "../../shared/components/table/TableToolbar";
import { loadSwal } from "../../shared/utils/alerts";
import { formatDateTime } from "../../shared/utils/formatters";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";

const AdminCourseReviewModal = React.lazy(() => import("../../features/courseReviews/AdminCourseReviewModal"));

const ReviewModalFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-2xl">
      Đang tải chi tiết khóa học...
    </div>
  </div>
);

const AdminCourseApproval = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRequests, setTotalRequests] = useState(0);
  const debouncedSearchTerm = useDebouncedValue(searchTerm);


  useEffect(() => {
    const loadPendingReviews = async () => {
      try {
        const response = await axiosClient.get("/admin/course-reviews", {
          params: {
            page: currentPage - 1,
            size: pageSize,
            keyword: debouncedSearchTerm.trim() || undefined,
            status: filterStatus === "all" ? undefined : filterStatus.toUpperCase(),
          },
        });
        const page = normalizePagePayload(response.data);
        const reviews = page.content.map(toCourseReviewItem);
        setRequests(reviews);
        setTotalRequests(page.totalElements);
      } catch (error) {
        console.error("Không tải được hàng đợi kiểm duyệt", error);
        setRequests([]);
        setTotalRequests(0);
      }
    };
    void loadPendingReviews();
  }, [currentPage, debouncedSearchTerm, filterStatus, pageSize]);

  const rowStartIndex = (currentPage - 1) * pageSize;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, pageSize]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(totalRequests / pageSize));
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageSize, totalRequests]);

  const handleApprove = async (requestId) => {
    if (!requestId || actionLoading) return;
    const Swal = await loadSwal();
    setActionLoading(true);
    try {
      const response = await axiosClient.patch(`/admin/course-reviews/${requestId}`, {
        decision: "APPROVED",
        note: "Đạt checklist chất lượng"
      });

      if (response.data?.code && response.data.code !== 200) {
        throw new Error(response.data?.message || "Không thể phê duyệt yêu cầu.");
      }

      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: "approved",
                approvedAt: new Date().toISOString(),
                approvedBy: "Current Admin",
              }
            : request
        )
      );

      setShowModal(false);
      setNotice({ type: "success", message: "Khóa học đã được phê duyệt." });
      await Swal.fire({
        icon: "success",
        title: "Đã phê duyệt",
        text: "Khóa học đã được công khai trên nền tảng.",
        confirmButtonText: "OK"
      });
    } catch (error) {
      console.error("Error approving request:", error);
      const message = error.response?.data?.message || error.message || "Không thể phê duyệt yêu cầu. Vui lòng thử lại.";
      setNotice({ type: "error", message });
      await Swal.fire({
        icon: "error",
        title: "Lỗi khi phê duyệt",
        text: message,
        confirmButtonText: "OK"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (actionLoading) return;
    const Swal = await loadSwal();
    if (!rejectionReason.trim()) {
      setNotice({ type: "error", message: "Vui lòng cung cấp lý do từ chối." });
      Swal.fire({
        icon: "warning",
        title: "Thiếu lý do từ chối",
        text: "Vui lòng nhập lý do để giảng viên biết cần sửa gì.",
        confirmButtonText: "OK"
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await axiosClient.patch(`/admin/course-reviews/${requestId}`, { decision: "REJECTED", note: rejectionReason });

      if (response.data?.code && response.data.code !== 200) {
        throw new Error(response.data?.message || "Không thể từ chối yêu cầu.");
      }

      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: "rejected",
                rejectedAt: new Date().toISOString(),
                rejectionReason,
                rejectedBy: "Current Admin",
              }
            : request
        )
      );

      setShowModal(false);
      setRejectionReason("");
      setNotice({ type: "success", message: "Khóa học đã bị từ chối." });
      await Swal.fire({
        icon: "success",
        title: "Đã từ chối",
        text: "Yêu cầu đã được cập nhật.",
        confirmButtonText: "OK"
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      const message = error.response?.data?.message || error.message || "Không thể từ chối yêu cầu. Vui lòng thử lại.";
      setNotice({ type: "error", message });
      await Swal.fire({
        icon: "error",
        title: "Lỗi khi từ chối",
        text: message,
        confirmButtonText: "OK"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => formatDateTime(dateString, "Chưa cập nhật");

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setSelectedLessonIndex(0);
    setModalType("view");
    setShowModal(true);
  };

  const handleApproveModal = (request) => {
    setSelectedRequest(request);
    setSelectedLessonIndex(0);
    setModalType("approve");
    setShowModal(true);
  };

  const handleRejectModal = (request) => {
    setSelectedRequest(request);
    setSelectedLessonIndex(0);
    setModalType("reject");
    setShowModal(true);
  };

  const summary = useMemo(() => getCourseReviewSummary(requests), [requests]);

  return (
    <AdminPageShell contentClassName="mx-auto max-w-[1500px]">
      <AdminPageHeader
        eyebrow="Nội dung"
        title="Quản lý phê duyệt khóa học"
        description="Duyệt nội dung khóa học do giảng viên gửi lên trước khi công khai cho học viên."
      />

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <MetricCard label="Chờ duyệt (trang này)" value={summary.pending.toLocaleString("vi-VN")} tone="amber" />
          <MetricCard label="Đã duyệt (trang này)" value={summary.approved.toLocaleString("vi-VN")} tone="emerald" />
          <MetricCard label="Từ chối (trang này)" value={summary.rejected.toLocaleString("vi-VN")} tone="rose" />
        </div>
        {notice && (
          <div
            className={`mb-6 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-red-100 bg-red-50 text-red-700"
            }`}
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded p-1 text-current/80 hover:bg-white/70 hover:text-current"
              aria-label="Đóng thông báo"
            >
              <FiX />
            </button>
          </div>
        )}

        <div className="mb-6">
          <TableToolbar
            filterOptions={courseReviewStatusOptions}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo tên khóa học, giảng viên, mã yêu cầu..."
            searchValue={searchTerm}
          />
        </div>
        {/* Requests List */}
        <div className="space-y-4">
          {requests.map((request, index) => (
            <AdminCourseReviewCard
              key={request.id}
              formatDate={formatDate}
              onApprove={handleApproveModal}
              onReject={handleRejectModal}
              onView={handleViewRequest}
              request={request}
              rowNumber={rowStartIndex + index + 1}
            />
          ))}
        </div>

        <AdminPagination
          currentPage={currentPage}
          itemLabel="yêu cầu"
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          totalItems={totalRequests}
        />

        {!requests.length && (
          <div className="text-center py-12">
            <FiBook size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có yêu cầu nào
            </h3>
            <p className="text-gray-600">
              Không tìm thấy yêu cầu nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        )}

        {showModal && selectedRequest && (
          <React.Suspense fallback={<ReviewModalFallback />}>
            <AdminCourseReviewModal
              open={showModal}
              request={selectedRequest}
              modalType={modalType}
              rejectionReason={rejectionReason}
              selectedLessonIndex={selectedLessonIndex}
              actionLoading={actionLoading}
              formatDate={formatDate}
              onClose={() => setShowModal(false)}
              onApprove={handleApprove}
              onReject={handleReject}
              onModalTypeChange={setModalType}
              onRejectionReasonChange={setRejectionReason}
              onLessonIndexChange={setSelectedLessonIndex}
            />
          </React.Suspense>
        )}
    </AdminPageShell>
  );
};

export default AdminCourseApproval;

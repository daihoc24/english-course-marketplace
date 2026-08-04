import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminPagination from "../../component/AdminPagination";
import axiosClient from "../../API/axiosClient";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import AdminRefundRow from "../../features/refunds/AdminRefundRow";
import MetricCard from "../../shared/components/cards/MetricCard";
import ActionButton from "../../shared/components/buttons/ActionButton";
import { AdminPageHeader, AdminPageShell } from "../../shared/components/layout/AdminPageLayout";
import DataTable from "../../shared/components/table/DataTable";
import TableToolbar from "../../shared/components/table/TableToolbar";
import { loadSwal } from "../../shared/utils/alerts";
import {
  getRefundSummary,
  isVideoEvidenceUrl,
  refundActionLabel,
  refundStatusFilterOptions,
  refundTableColumnWidths,
  refundTableColumns,
} from "../../features/refunds/refundView";

export default function RefundManagement() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const loadRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/admin/refund-requests", {
        params: {
          page: currentPage - 1,
          size: pageSize,
          keyword: debouncedSearch.trim() || undefined,
          status: status === "ALL" ? undefined : status,
        },
      });
      const page = normalizePagePayload(response.data);
      setRefunds(page.content);
      setTotalRefunds(page.totalElements);
    } catch (error) {
      setRefunds([]);
      setTotalRefunds(0);
      const Swal = await loadSwal();
      await Swal.fire({
        icon: "error",
        title: "Không tải được danh sách hoàn tiền",
        text: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, pageSize, status]);

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  const decide = async (refund, decision) => {
    const Swal = await loadSwal();
    const result = await Swal.fire({
      title: decision === "APPROVED" ? "Cộng tiền hoàn vào tín dụng?" : "Từ chối hoàn tiền?",
      input: "textarea",
      inputLabel: "Ghi chú cho người học",
      inputPlaceholder: "Nhập lý do hoặc hướng dẫn xử lý...",
      showCancelButton: true,
      confirmButtonText: refundActionLabel[decision],
      cancelButtonText: "Hủy",
      confirmButtonColor: decision === "APPROVED" ? "#059669" : "#e11d48",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axiosClient.patch(`/admin/refund-requests/${refund.id}`, {
        decision,
        adminNote: result.value || null,
      });
      const updatedRefund = response.data?.result;
      await loadRefunds();
      await Swal.fire({
        icon: updatedRefund?.status === "REQUIRES_ATTENTION" ? "warning" : "success",
        title: updatedRefund?.status === "REQUIRES_ATTENTION" ? "Cần kiểm tra thêm" : "Đã cập nhật",
        text: updatedRefund?.status === "REQUIRES_ATTENTION"
          ? "Chưa thể hoàn tiền tự động. Học viên và người bán đã được thông báo để chờ admin xử lý tiếp."
          : decision === "APPROVED"
            ? "Yêu cầu đã được hoàn tiền qua đúng kênh thanh toán ban đầu."
            : "Yêu cầu đã bị từ chối.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật",
        text: error?.response?.data?.message || "Vui lòng thử lại.",
      });
    }
  };

  const previewEvidence = async (refund) => {
    const Swal = await loadSwal();
    if (!refund?.attachmentUrl) {
      await Swal.fire({
        icon: "info",
        title: "Không có minh chứng",
        text: "Học viên không đính kèm ảnh hoặc video cho yêu cầu hoàn tiền này.",
      });
      return;
    }

    const url = String(refund.attachmentUrl).replace(/"/g, "&quot;");
    const isVideo = isVideoEvidenceUrl(url);
    await Swal.fire({
      title: "Minh chứng hoàn tiền",
      html: `
        <div style="text-align:left">
          <p style="margin:0 0 12px;color:#64748b;font-size:14px">${refund.courseName || "Khóa học"} · ${refund.requesterName || "Học viên"}</p>
          <div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:18px;background:#020617">
            ${
              isVideo
                ? `<video src="${url}" controls preload="metadata" style="display:block;width:100%;max-height:70vh;background:#020617"></video>`
                : `<img src="${url}" alt="Minh chứng hoàn tiền" style="display:block;width:100%;max-height:70vh;object-fit:contain;background:#f8fafc" />`
            }
          </div>
          <a href="${url}" target="_blank" rel="noreferrer" style="display:inline-flex;margin-top:12px;color:#2563eb;font-weight:700;text-decoration:none">Mở trong tab mới</a>
        </div>
      `,
      width: 900,
      showConfirmButton: true,
      confirmButtonText: "Đóng",
      confirmButtonColor: "#2563eb",
    });
  };

  const rowStartIndex = (currentPage - 1) * pageSize;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, status, pageSize]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(totalRefunds / pageSize));
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageSize, totalRefunds]);

  const summary = useMemo(() => getRefundSummary(refunds, totalRefunds), [refunds, totalRefunds]);

  return (
    <AdminPageShell>
      <AdminPageHeader
        eyebrow="Quản lý hoàn tiền"
        title="Yêu cầu hoàn tiền từ khách hàng"
        description="Admin chỉ duyệt hoặc từ chối. Cổng hoàn tiền được tự động lấy từ giao dịch gốc mà học viên đã dùng khi mua khóa học."
        actions={(
          <ActionButton
            type="button"
            onClick={loadRefunds}
            tone="slate"
            className="rounded-xl px-4 text-sm"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Làm mới
          </ActionButton>
        )}
      />

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <MetricCard label="Tổng yêu cầu" value={summary.total} tone="slate" />
          <MetricCard label="Cần admin xử lý (trang này)" value={summary.pending} tone="amber" />
          <MetricCard label="Đã cộng tín dụng (trang này)" value={summary.approved} tone="emerald" />
        </div>

        <TableToolbar
          filterOptions={refundStatusFilterOptions}
          filterValue={status}
          onFilterChange={setStatus}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm theo khóa học, người học, lý do, cổng thanh toán..."
          searchValue={search}
        />

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <DataTable
            columns={refundTableColumns}
            colWidths={refundTableColumnWidths}
            emptyMessage="Chưa có yêu cầu hoàn tiền."
            loading={loading}
            minWidth={1840}
          >
            {refunds.map((refund, index) => (
              <AdminRefundRow
                key={refund.id}
                onDecision={decide}
                onPreviewEvidence={previewEvidence}
                refund={refund}
                rowNumber={rowStartIndex + index + 1}
              />
            ))}
          </DataTable>
          <AdminPagination
            currentPage={currentPage}
            itemLabel="yêu cầu"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
            totalItems={totalRefunds}
          />
        </section>

    </AdminPageShell>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import SellerService from "../../API/SellerService";
import AdminPagination from "../../component/AdminPagination";
import ActionButton from "../../shared/components/buttons/ActionButton";
import MetricCard from "../../shared/components/cards/MetricCard";
import DataTable from "../../shared/components/table/DataTable";
import TableToolbar from "../../shared/components/table/TableToolbar";
import { loadSwal } from "../../shared/utils/alerts";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import SellerRefundRow from "./SellerRefundRow";
import {
  getSellerRefundSummary,
  sellerRefundColumnWidths,
  sellerRefundStatusOptions,
  sellerRefundTableColumns,
} from "./sellerRefundView";
import { SellerLoadingState } from "./SellerStates";

const RefundTab = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debouncedKeyword = useDebouncedValue(keyword);

  const loadRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await SellerService.getSellerRefundRequests({
        page: currentPage - 1,
        size: pageSize,
        keyword: debouncedKeyword.trim() || undefined,
        status: statusFilter || undefined,
      });
      const { content, totalElements } = normalizePagePayload(response);
      setRefundRequests(content);
      setTotalRefunds(totalElements);
    } catch (err) {
      console.error("Không thể tải yêu cầu hoàn tiền:", err);
      setError(err?.response?.data?.message || "Không thể tải yêu cầu hoàn tiền");
      setRefundRequests([]);
      setTotalRefunds(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedKeyword, pageSize, statusFilter]);

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, pageSize, statusFilter]);

  const refundSummary = useMemo(
    () => getSellerRefundSummary(refundRequests, totalRefunds),
    [refundRequests, totalRefunds]
  );

  const previewEvidence = useCallback(async (refund) => {
    const url = String(refund?.attachmentUrl || "");
    if (!url) {
      const Swal = await loadSwal();
      await Swal.fire(
        "Không có minh chứng",
        "Học viên không đính kèm minh chứng cho yêu cầu này.",
        "info"
      );
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      const Swal = await loadSwal();
      await Swal.fire("Không thể mở minh chứng", "Đường dẫn minh chứng không hợp lệ.", "warning");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  if (loading && refundRequests.length === 0) {
    return <SellerLoadingState text="Đang tải yêu cầu hoàn tiền..." />;
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Hoàn tiền</h1>
        <p className="mt-1 text-sm text-gray-500">
          Theo dõi các yêu cầu hoàn tiền liên quan đến khóa học của bạn.
        </p>
      </div>

      <div className="mb-6">
        <TableToolbar
          actions={(
            <ActionButton onClick={loadRefunds} icon={<FiRefreshCw />} tone="slate">
              Làm mới
            </ActionButton>
          )}
          filterOptions={sellerRefundStatusOptions}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          onSearchChange={setKeyword}
          searchPlaceholder="Tìm học viên, khóa học, lý do..."
          searchValue={keyword}
        />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard label="Tổng yêu cầu" value={refundSummary.total.toLocaleString("vi-VN")} tone="slate" />
        <MetricCard label="Cần rà soát" value={refundSummary.pending.toLocaleString("vi-VN")} tone="amber" />
        <MetricCard label="Đã hoàn tất" value={refundSummary.approved.toLocaleString("vi-VN")} tone="emerald" />
        <MetricCard label="Không duyệt" value={refundSummary.rejected.toLocaleString("vi-VN")} tone="rose" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          columns={sellerRefundTableColumns}
          colWidths={sellerRefundColumnWidths}
          emptyMessage="Chưa có yêu cầu hoàn tiền phù hợp"
          minWidth={1710}
        >
          {refundRequests.map((refund, index) => (
            <SellerRefundRow
              key={refund.id}
              refund={refund}
              rowNumber={(currentPage - 1) * pageSize + index + 1}
              onPreviewEvidence={previewEvidence}
            />
          ))}
        </DataTable>
        <AdminPagination
          currentPage={currentPage}
          itemLabel="yêu cầu"
          onPageChange={setCurrentPage}
          onPageSizeChange={(nextSize) => {
            setPageSize(nextSize);
            setCurrentPage(1);
          }}
          pageSize={pageSize}
          totalItems={totalRefunds}
        />
      </div>
    </div>
  );
};

export default RefundTab;

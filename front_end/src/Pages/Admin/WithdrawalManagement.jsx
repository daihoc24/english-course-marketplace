import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, Zap } from "lucide-react";
import AdminPagination from "../../component/AdminPagination";
import axiosClient from "../../API/axiosClient";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import AdminWithdrawalRow from "../../features/withdrawals/AdminWithdrawalRow";
import MetricCard from "../../shared/components/cards/MetricCard";
import ActionButton from "../../shared/components/buttons/ActionButton";
import { AdminPageHeader, AdminPageShell } from "../../shared/components/layout/AdminPageLayout";
import DataTable from "../../shared/components/table/DataTable";
import TableToolbar from "../../shared/components/table/TableToolbar";
import { loadSwal } from "../../shared/utils/alerts";
import {
  getWithdrawalSummary,
  withdrawalActionLabel,
  withdrawalStatusFilterOptions,
  withdrawalTableColumnWidths,
  withdrawalTableColumns,
} from "../../features/withdrawals/withdrawalView";

export default function WithdrawalManagement() {
  const [searchParams] = useSearchParams();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRunning, setAutoRunning] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/admin/withdrawal-requests", {
        params: {
          page: currentPage - 1,
          size: pageSize,
          keyword: debouncedSearch.trim() || undefined,
          status: status === "ALL" ? undefined : status,
        },
      });
      const page = normalizePagePayload(response.data);
      setWithdrawals(page.content);
      setTotalWithdrawals(page.totalElements);
    } catch (error) {
      setWithdrawals([]);
      setTotalWithdrawals(0);
      const Swal = await loadSwal();
      await Swal.fire({
        icon: "error",
        title: "Không tải được yêu cầu rút tiền",
        text: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, pageSize, status]);

  useEffect(() => {
    void loadWithdrawals();
  }, [loadWithdrawals]);

  useEffect(() => {
    const statusFromUrl = searchParams.get("status");
    if (statusFromUrl) setStatus(statusFromUrl);
  }, [searchParams]);

  const decide = async (withdrawal, decision) => {
    const Swal = await loadSwal();
    const paid = decision === "PAID" || decision === "APPROVED";
    const failed = decision === "FAILED";
    const result = await Swal.fire({
      title: paid
        ? "Xác nhận đã chi trả?"
        : failed
        ? "Đánh dấu chi trả thất bại?"
        : "Từ chối yêu cầu rút tiền?",
      text: paid
        ? "Hệ thống sẽ ghi nhận yêu cầu đã được chi trả thủ công."
        : failed
        ? "Người bán sẽ thấy khoản chi trả thất bại cùng ghi chú xử lý."
        : "Người bán sẽ thấy trạng thái từ chối cùng ghi chú xử lý.",
      input: "textarea",
      inputLabel: paid
        ? "Ghi chú hoặc mã giao dịch"
        : failed
        ? "Lý do thất bại"
        : "Lý do từ chối",
      inputPlaceholder: paid
        ? "VD: Đã chuyển khoản qua Vietcombank, mã GD 123456"
        : failed
        ? "VD: Ngân hàng trả lỗi tài khoản không tồn tại"
        : "VD: Thông tin tài khoản chưa khớp",
      showCancelButton: true,
      confirmButtonText: withdrawalActionLabel[decision],
      cancelButtonText: "Hủy",
      confirmButtonColor: paid ? "#059669" : "#e11d48",
    });

    if (!result.isConfirmed) return;

    try {
      await axiosClient.patch(`/admin/withdrawal-requests/${withdrawal.id}`, {
        decision,
        adminNote: result.value || null,
      });
      await loadWithdrawals();
      await Swal.fire({
        icon: "success",
        title: "Đã cập nhật",
        text: paid
          ? "Khoản chi trả đã được đánh dấu là đã chi trả."
          : failed
          ? "Khoản chi trả đã được đánh dấu thất bại."
          : "Yêu cầu rút tiền đã bị từ chối.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật",
        text: error?.response?.data?.message || "Vui lòng thử lại.",
      });
    }
  };

  const runAutoPayout = async () => {
    const Swal = await loadSwal();
    const result = await Swal.fire({
      icon: "question",
      title: "Chạy chi trả tự động?",
      text: "Hệ thống sẽ tự chi trả người bán đủ điều kiện và chuyển các ca cần xem lại sang hàng admin kiểm tra.",
      showCancelButton: true,
      confirmButtonText: "Chạy job",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#2563eb",
    });

    if (!result.isConfirmed) return;

    try {
      setAutoRunning(true);
      const response = await axiosClient.post("/admin/withdrawal-requests/auto-run");
      const summary = response.data?.result || {};
      await loadWithdrawals();
      await Swal.fire({
        icon: summary.exceptionCount > 0 ? "warning" : "success",
        title: "Đã chạy chi trả tự động",
        html: `
          <div style="text-align:left">
            <p>Đã quét: <b>${summary.scannedSellers || 0}</b> người bán</p>
            <p>Đã chi trả: <b>${summary.paidCount || 0}</b></p>
            <p>Cần admin kiểm tra: <b>${summary.exceptionCount || 0}</b></p>
            <p>Bỏ qua: <b>${summary.skippedCount || 0}</b></p>
          </div>
        `,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể chạy chi trả tự động",
        text: error?.response?.data?.message || "Vui lòng thử lại.",
      });
    } finally {
      setAutoRunning(false);
    }
  };

  const rowStartIndex = (currentPage - 1) * pageSize;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, status, pageSize]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(totalWithdrawals / pageSize));
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageSize, totalWithdrawals]);

  const summary = useMemo(
    () => getWithdrawalSummary(withdrawals, totalWithdrawals),
    [totalWithdrawals, withdrawals]
  );

  return (
    <AdminPageShell>
      <AdminPageHeader
        eyebrow="Bộ phận thanh toán"
        title="Chi trả cho giảng viên"
        description="Theo dõi chi trả tự động, xử lý ngoại lệ và lưu lại mã giao dịch chuyển khoản ảo cho người bán."
        actions={(
          <>
            <ActionButton
              type="button"
              onClick={runAutoPayout}
              disabled={autoRunning}
              className="rounded-xl px-4 text-sm"
            >
              <Zap size={16} /> {autoRunning ? "Đang chạy..." : "Chạy chi trả tự động"}
            </ActionButton>
            <ActionButton
              type="button"
              onClick={loadWithdrawals}
              tone="slate"
              className="rounded-xl px-4 text-sm"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Làm mới
            </ActionButton>
          </>
        )}
      />

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Tổng yêu cầu" value={summary.total} tone="slate" />
          <MetricCard
            label="Chờ xử lý (trang này)"
            value={summary.pending}
            tone="amber"
          />
          <MetricCard
            label="Cần kiểm tra thêm (trang này)"
            value={summary.attention}
            tone="orange"
          />
          <MetricCard
            label="Đã chi trả (trang này)"
            value={summary.paid}
            tone="emerald"
          />
          <MetricCard label="Từ chối / lỗi (trang này)" value={summary.rejected} tone="rose" />
        </div>

        <TableToolbar
          filterOptions={withdrawalStatusFilterOptions}
          filterValue={status}
          onFilterChange={setStatus}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm theo người bán, ngân hàng, số tài khoản, ghi chú..."
          searchValue={search}
        />

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <DataTable
            columns={withdrawalTableColumns}
            colWidths={withdrawalTableColumnWidths}
            emptyMessage="Chưa có yêu cầu rút tiền."
            loading={loading}
            minWidth={1680}
          >
            {withdrawals.map((withdrawal, index) => (
              <AdminWithdrawalRow
                key={withdrawal.id}
                onDecision={decide}
                rowNumber={rowStartIndex + index + 1}
                withdrawal={withdrawal}
              />
            ))}
          </DataTable>
          <AdminPagination
            currentPage={currentPage}
            itemLabel="yêu cầu"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
            totalItems={totalWithdrawals}
          />
        </section>

    </AdminPageShell>
  );
}

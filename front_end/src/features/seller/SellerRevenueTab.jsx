import { useCallback, useContext, useEffect, useState } from "react";
import SellerService from "../../API/SellerService";
import { ProductContext } from "../../context/ProductContext";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import SellerRevenueChart from "./SellerRevenueChart";
import SellerRevenueSummary from "./SellerRevenueSummary";
import SellerRevenueTransactionsTable from "./SellerRevenueTransactionsTable";
import { normalizeMonthlyRevenue } from "./sellerRevenueView";
import { getSellerIdFromSession } from "./sellerSession";
import { SellerLoadingState } from "./SellerStates";

export default function SellerRevenueTab() {
  const [revenueData, setRevenueData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionKeyword, setTransactionKeyword] = useState("");
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPageSize, setTransactionPageSize] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [sellerStats, setSellerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useContext(ProductContext);
  const debouncedTransactionKeyword = useDebouncedValue(transactionKeyword);
  const sellerId = getSellerIdFromSession(session);

  const fetchRevenueData = useCallback(async () => {
    if (!sellerId) {
      setError("Vui lòng đăng nhập bằng tài khoản giảng viên");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [revenueResponse, statsResponse, transactionResponse] = await Promise.all([
        SellerService.getSellerRevenue(sellerId),
        SellerService.getSellerStats(sellerId),
        SellerService.getSellerRevenueTransactions(sellerId, {
          page: transactionPage - 1,
          size: transactionPageSize,
          keyword: debouncedTransactionKeyword.trim() || undefined,
          status: "PAID",
        }),
      ]);

      if (revenueResponse.code === 200) {
        setRevenueData(normalizeMonthlyRevenue(revenueResponse.result?.monthlyData || []));
      }

      if (statsResponse.code === 200) {
        setSellerStats(statsResponse.result);
      }

      if (transactionResponse.code === 200) {
        const { content, totalElements } = normalizePagePayload(transactionResponse);
        setTransactions(content);
        setTotalTransactions(totalElements);
      }
    } catch (fetchError) {
      console.error("Error fetching revenue data:", fetchError);
      setError("Không thể tải dữ liệu doanh thu");
      setRevenueData([]);
      setTransactions([]);
      setTotalTransactions(0);
      setSellerStats(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedTransactionKeyword, sellerId, transactionPage, transactionPageSize]);

  useEffect(() => {
    void fetchRevenueData();
  }, [fetchRevenueData]);

  useEffect(() => {
    setTransactionPage(1);
  }, [debouncedTransactionKeyword, transactionPageSize]);

  if (loading) {
    return <SellerLoadingState text="Đang tải dữ liệu doanh thu..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Doanh thu người bán</p>
        <h1 className="text-2xl font-bold text-gray-900">Doanh thu</h1>
        <p className="max-w-3xl text-sm text-gray-500">
          Theo dõi doanh thu đã thanh toán, số đơn hàng và lịch sử giao dịch của các khóa học đang bán.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <SellerRevenueSummary sellerStats={sellerStats} />
      <SellerRevenueChart revenueData={revenueData} />
      <SellerRevenueTransactionsTable
        keyword={transactionKeyword}
        onKeywordChange={setTransactionKeyword}
        onPageChange={setTransactionPage}
        onPageSizeChange={(nextSize) => {
          setTransactionPageSize(nextSize);
          setTransactionPage(1);
        }}
        page={transactionPage}
        pageSize={transactionPageSize}
        totalItems={totalTransactions}
        transactions={transactions}
      />
    </div>
  );
}

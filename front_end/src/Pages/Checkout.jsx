import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct } from "../context/ProductContext";
import axiosClient from "../API/axiosClient";
import PaymentService from "../API/PaymentService";
import { getLearnerWallet } from "../API/RefundService";
import { loadSwal } from "../shared/utils/alerts";
import { formatVND } from "../utils/formatVND";
import { getActiveSession } from "../utils/session";

const CheckoutPage = () => {
  const { products, session } = useProduct();
  const activeSession = getActiveSession(session);
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [learningCredit, setLearningCredit] = useState(0);
  const [useLearningCredit, setUseLearningCredit] = useState(true);
  const [courseInfo, setCourseInfo] = useState({
    id: id,
    name: "Đang tải…",
    price: 0,
    image: null,
  });

  const loadCourse = useCallback(async () => {
    if (!id) return;
    const fromList = products.find((p) => String(p.id) === String(id));
    if (fromList) {
      setCourseInfo({
        id: fromList.id,
        name: fromList.name,
        price: Number(fromList.price) || 0,
        image: fromList.image || null,
      });
    }
    try {
      const uid = activeSession?.currentUser?.id;
      const res = await axiosClient.get(`/courses/${id}`, {
        params: uid ? { userId: uid } : {},
      });
      if (res.data?.code === 200 && res.data?.result) {
        const c = res.data.result;
        setCourseInfo({
          id: c.id,
          name: c.name,
          price: Number(c.price) || 0,
          image: null,
        });
      }
    } catch {
      /* giữ từ products */
    }
  }, [id, products, activeSession?.currentUser?.id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    const loadWallet = async () => {
      if (!activeSession?.token) {
        setLearningCredit(0);
        return;
      }
      try {
        const response = await getLearnerWallet(activeSession.token);
        setLearningCredit(Number(response.data?.result?.balanceVnd || 0));
      } catch {
        setLearningCredit(0);
      }
    };
    void loadWallet();
  }, [activeSession?.token]);

  const calculateSubtotal = () => Number(courseInfo.price) || 0;
  const minimumVnPayAmount = 25000;
  const calculateCreditApplied = () => {
    const subtotal = calculateSubtotal();
    if (!useLearningCredit || learningCredit <= 0 || subtotal <= 0) return 0;
    const rawCredit = Math.min(learningCredit, subtotal);
    const remaining = subtotal - rawCredit;
    if (remaining > 0 && remaining < minimumVnPayAmount) {
      return Math.max(0, subtotal - minimumVnPayAmount);
    }
    return rawCredit;
  };
  const calculatePayable = () => Math.max(0, calculateSubtotal() - calculateCreditApplied());

  /** Gọi API thanh toán thật qua PaymentService và redirect sang cổng thanh toán */
  const handlePay = async () => {
    if (!activeSession?.token) {
      const Swal = await loadSwal();
      Swal.fire({
        icon: "info",
        title: "Đăng nhập",
        text: "Vui lòng đăng nhập để thanh toán và lưu đơn hàng.",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
      }).then((r) => {
        if (r.isConfirmed) navigate("/login");
      });
      return;
    }
    const courseIdNum = parseInt(id, 10);
    if (Number.isNaN(courseIdNum)) {
      const Swal = await loadSwal();
      Swal.fire({ icon: "error", title: "Lỗi", text: "Không xác định được khóa học." });
      return;
    }
    setLoading(true);
    try {
      const amount = calculatePayable();
      const creditAmount = calculateCreditApplied();
      const userId = activeSession.currentUser.id;
      const token = activeSession.token;

      if (amount <= 0) {
        const res = await PaymentService.creditPurchase({ token, courseId: courseIdNum, userId });
        if (res.data?.code !== 200) throw new Error(res.data?.message || "Không thể mua bằng tín dụng học tập.");
        const Swal = await loadSwal();
        await Swal.fire({
          icon: "success",
          title: "Mua khóa học thành công",
          text: "Khóa học đã được thanh toán bằng tín dụng học tập.",
        });
        navigate(`/course-video/${courseIdNum}`);
        return;
      }

      const res = await PaymentService.vnPay({ amount, token, courseId: courseIdNum, userId, creditAmount });
      const paymentUrl = res.data?.result;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán từ server.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Thanh toán thất bại. Vui lòng thử lại.";
      const Swal = await loadSwal();
      Swal.fire({ icon: "error", title: "Lỗi", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const creditApplied = calculateCreditApplied();
  const payableAmount = calculatePayable();
  const creditAdjustedForVnPay = useLearningCredit
    && learningCredit > 0
    && learningCredit < subtotal
    && subtotal - Math.min(learningCredit, subtotal) > 0
    && subtotal - Math.min(learningCredit, subtotal) < minimumVnPayAmount;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-gray-200 flex items-center justify-end px-6 py-3 border-b border-gray-300">
        <button type="button" className="text-gray-700" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full bg-white mt-8 rounded-lg shadow overflow-hidden">
        {/* Phần trái — Chọn phương thức thanh toán */}
        <div className="w-full lg:w-2/3 p-8 border-r border-gray-200">
          <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

          <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="note">
            <strong>Thanh toán thử nghiệm:</strong> Cổng thanh toán sandbox không phát sinh giao dịch tiền thật.
          </div>
          {learningCredit > 0 && (
            <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <input
                type="checkbox"
                checked={useLearningCredit}
                onChange={(event) => setUseLearningCredit(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex-1">
                <span className="block font-semibold text-blue-900">Dùng tín dụng học tập</span>
                <span className="mt-1 block text-sm text-blue-700">
                  Bạn đang có {formatVND(learningCredit)} từ các yêu cầu hoàn tiền đã được duyệt.
                </span>
                {creditAdjustedForVnPay && (
                  <span className="mt-2 block text-xs text-blue-700">
                    Hệ thống giữ lại một phần tín dụng để số tiền thanh toán VNPay không thấp hơn {formatVND(minimumVnPayAmount)}.
                  </span>
                )}
              </span>
            </label>
          )}
          <div className="space-y-4">
            <div className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
              <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">VNPay</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">VNPay</div>
                <div className="text-sm text-gray-500">
                  Thanh toán qua ngân hàng, ví điện tử
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Phần phải — Tóm tắt đơn hàng */}
        <div className="w-full lg:w-1/3 bg-gray-50 p-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-xs bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h2>
            <div className="mb-4 divide-y">
              {courseInfo ? (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium text-sm">{courseInfo.name}</div>
                      <div className="text-xs text-gray-500">x1</div>
                    </div>
                  </div>
                  <span className="font-medium text-sm">{formatVND(calculateSubtotal())}</span>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">Chưa chọn khóa học.</div>
              )}
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="font-medium">Giá gốc:</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            {creditApplied > 0 && (
              <div className="flex justify-between mb-2 text-sm text-blue-700">
                <span className="font-medium">Tín dụng học tập:</span>
                <span>-{formatVND(creditApplied)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>{payableAmount > 0 ? "Cần thanh toán:" : "Thanh toán:"}</span>
              <span>{payableAmount > 0 ? formatVND(payableAmount) : "Tín dụng học tập"}</span>
            </div>
            <button
              type="button"
              className="w-full py-3 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition disabled:opacity-50"
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : payableAmount > 0 ? "Thanh toán qua VNPay" : "Mua bằng tín dụng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProduct } from "../context/ProductContext";
import PaymentService from "../API/PaymentService";
import { FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import { getActiveSession } from "../utils/session";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useProduct();
  const activeSession = getActiveSession(session);

  const [status, setStatus] = useState("loading"); // loading | success | error | missing
  const [message, setMessage] = useState("");
  const [courseId, setCourseId] = useState(null);
  const processedRef = useRef(false); // Guard against double execution

  useEffect(() => {
    if (processedRef.current) return; // Already processed
    processedRef.current = true;

    const processPayment = async () => {
      const vnpResponseCode = searchParams.get("vnp_ResponseCode");

      // VNPay flow
      if (vnpResponseCode !== null) {
        const orderInfo = searchParams.get("vnp_OrderInfo");
        const orderId = orderInfo?.replace("courseId=", "") || null;
        setCourseId(orderId);

        if (vnpResponseCode === "00") {
          try {
            const authToken = activeSession?.token;
            if (!authToken) {
              throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            }
            const res = await PaymentService.vnPayConfirm({
              callback: Object.fromEntries(searchParams.entries()),
              token: authToken,
            });
            const body = res.data;
            if (body?.code === 200) {
              setStatus("success");
              setMessage("Thanh toán thành công! Đơn hàng đã được ghi nhận.");
            } else {
              setStatus("error");
              setMessage(
                "Thanh toán thành công nhưng chưa ghi nhận đơn hàng. Vui lòng liên hệ hỗ trợ."
              );
            }
          } catch (err) {
            setStatus("error");
            setMessage(
              err?.response?.data?.message ||
                "Thanh toán thành công nhưng chưa ghi nhận đơn hàng. Vui lòng liên hệ hỗ trợ."
            );
          }
        } else {
          setStatus("error");
          setMessage(
            `Thanh toán thất bại (Mã lỗi: ${vnpResponseCode}). Vui lòng thử lại.`
          );
        }
        return;
      }

      // No valid query params
      setStatus("missing");
      setMessage("Không tìm thấy thông tin thanh toán.");
    };

    processPayment();
  }, [searchParams, activeSession?.token]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold mb-2">Đang xử lý thanh toán...</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-green-700">
            Thanh toán thành công!
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              data-testid="payment-result-go-to-course"
              onClick={() => navigate(`/course-video/${courseId}`)}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Vào học ngay
            </button>
            <button
              type="button"
              data-testid="payment-result-go-home"
              onClick={() => navigate("/")}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 font-medium transition"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-700">
            Thanh toán thất bại
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {courseId && (
              <button
                type="button"
                data-testid="payment-result-retry"
                onClick={() => navigate(`/checkout/${courseId}`)}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Thử lại
              </button>
            )}
            <button
              type="button"
              data-testid="payment-result-go-home-error"
              onClick={() => navigate("/")}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 font-medium transition"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Missing params state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-yellow-700">
          Không tìm thấy thông tin thanh toán
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          type="button"
          data-testid="payment-result-go-home-missing"
          onClick={() => navigate("/")}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default PaymentResult;

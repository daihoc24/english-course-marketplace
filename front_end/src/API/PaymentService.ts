import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";
import type { PaymentUrlResponse } from "../types/api";

type PaymentParams = { amount?: number; courseId: number; userId: number; token: string; creditAmount?: number };
type VnPayConfirmParams = { callback: Record<string, string>; token: string };

const authenticatedHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

const PaymentService = {
  vnPay: ({ courseId, userId, token, creditAmount = 0 }: PaymentParams): Promise<AxiosResponse<PaymentUrlResponse>> =>
    axiosClient.get("/payment/vnpay", { params: { courseId, userId, creditAmount }, headers: authenticatedHeaders(token) }),

  vnPayConfirm: ({ callback, token }: VnPayConfirmParams) =>
    axiosClient.post("/payment/vnpay/confirm", callback, { headers: authenticatedHeaders(token) }),

  creditPurchase: ({ courseId, userId, token }: PaymentParams) =>
    axiosClient.post("/payment/learning-credit/purchase", {}, { params: { courseId, userId }, headers: authenticatedHeaders(token) }),
};

export default PaymentService;

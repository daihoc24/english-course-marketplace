import axiosClient from "./axiosClient";

export const createRefundRequest = (orderId: number, reason: string, token: string, attachment?: File | null) => {
  const formData = new FormData();
  formData.append("reason", reason);
  if (attachment) formData.append("attachment", attachment);

  return axiosClient.post(`/orders/${orderId}/refund-requests`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMyRefundRequests = (token: string) =>
  axiosClient.get("/orders/refund-requests/mine", { headers: { Authorization: `Bearer ${token}` } });

export const getLearnerWallet = (token: string) =>
  axiosClient.get("/learner/wallet", { headers: { Authorization: `Bearer ${token}` } });

export const withdrawLearnerCreditDemo = (amountVnd: number, token: string) =>
  axiosClient.post(
    "/learner/wallet/withdrawals/demo",
    { amountVnd },
    { headers: { Authorization: `Bearer ${token}` } }
  );

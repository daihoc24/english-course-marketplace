import axiosClient from "./axiosClient";

export type ReportPayload = Record<string, unknown>;

export const createReport = async (data: ReportPayload | FormData) => {
  const sessionText = localStorage.getItem("session");
  const session = sessionText ? (JSON.parse(sessionText) as { token?: string }) : {};
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  return axiosClient.post("/reports/create", data, {
    headers: {
      ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
    },
  });
};

export const getMyReports = async (courseId?: number | string) => {
  const sessionText = localStorage.getItem("session");
  const session = sessionText ? (JSON.parse(sessionText) as { token?: string }) : {};
  return axiosClient.get("/reports/mine", {
    params: courseId ? { courseId } : undefined,
    headers: session.token ? { Authorization: `Bearer ${session.token}` } : undefined,
  });
};

export const getSellerReports = async (params: Record<string, unknown> = {}) => {
  const sessionText = localStorage.getItem("session");
  const session = sessionText ? (JSON.parse(sessionText) as { token?: string }) : {};
  return axiosClient.get("/reports/seller", {
    params,
    headers: session.token ? { Authorization: `Bearer ${session.token}` } : undefined,
  });
};

export const requestSellerAction = async (reportId: number | string, responseText: string) => {
  const sessionText = localStorage.getItem("session");
  const session = sessionText ? (JSON.parse(sessionText) as { token?: string }) : {};
  return axiosClient.patch(`/reports/${reportId}/request-seller-action`, { responseText }, {
    headers: session.token ? { Authorization: `Bearer ${session.token}` } : undefined,
  });
};

export const sellerRespondReport = async (reportId: number | string, responseText: string) => {
  const sessionText = localStorage.getItem("session");
  const session = sessionText ? (JSON.parse(sessionText) as { token?: string }) : {};
  return axiosClient.patch(`/reports/${reportId}/seller-response`, { responseText }, {
    headers: session.token ? { Authorization: `Bearer ${session.token}` } : undefined,
  });
};

export const recommendReportRefund = async (reportId: number | string, responseText: string) => {
  const sessionText = localStorage.getItem("session");
  const session = sessionText ? (JSON.parse(sessionText) as { token?: string }) : {};
  return axiosClient.patch(`/reports/${reportId}/recommend-refund`, { responseText }, {
    headers: session.token ? { Authorization: `Bearer ${session.token}` } : undefined,
  });
};

export default createReport;

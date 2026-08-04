import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import {
  uploadRawFileDirect,
  type DirectUploadSignature,
} from "../utils/cloudinaryUpload";

type SellerId = number;
export type SellerCoursePayload = Record<string, unknown>;
export type LessonResourcePayload = {
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  sortOrder?: number;
  title?: string;
  type?: string;
  url?: string;
};
export type LessonUploadPayload = { file: File; episodeNumber: number; isPreview: boolean; title?: string; resources?: LessonResourcePayload[] };
type QueryParams = Record<string, unknown>;

const SellerService = {
  createCourse: async (sellerId: SellerId, courseData: SellerCoursePayload) =>
    (await axiosClient.post(`/seller/${sellerId}/courses`, courseData)).data,

  updateCourse: async (sellerId: SellerId, courseId: number, courseData: SellerCoursePayload) =>
    (await axiosClient.put(`/seller/${sellerId}/courses/${courseId}`, courseData)).data,

  deleteCourse: async (sellerId: SellerId, courseId: number) =>
    (await axiosClient.delete(`/seller/${sellerId}/courses/${courseId}`)).data,

  getCourseImageUploadSignature: async (sellerId: SellerId) =>
    (await axiosClient.post<ApiResponse<DirectUploadSignature>>(`/seller/${sellerId}/courses/image-upload-signature`)).data,

  submitCourseForReview: async (sellerId: SellerId, courseId: number) =>
    (await axiosClient.post(`/seller/${sellerId}/courses/${courseId}/submit-review`)).data,

  getSellerCourses: async (sellerId: SellerId, params: QueryParams = {}) =>
    (await axiosClient.get<ApiResponse<unknown>>(`/seller/${sellerId}/courses/managed`, { params })).data,

  getSellerStats: async (sellerId: SellerId) =>
    (await axiosClient.get(`/seller/${sellerId}/stats`)).data,

  getSellerRevenue: async (sellerId: SellerId) =>
    (await axiosClient.get(`/seller/${sellerId}/revenue`)).data,

  getSellerRevenueTransactions: async (sellerId: SellerId, params: QueryParams = {}) =>
    (await axiosClient.get(`/seller/${sellerId}/revenue/transactions`, { params })).data,

  getSellerRefundRequests: async (params: QueryParams = {}) =>
    (await axiosClient.get("/seller/refund-requests", { params })).data,

  getWithdrawalRequests: async (sellerId: SellerId, params: QueryParams = {}) =>
    (await axiosClient.get(`/seller/${sellerId}/withdrawal-requests`, { params })).data,

  getWalletTransactions: async (sellerId: SellerId, params: QueryParams = {}) =>
    (await axiosClient.get(`/seller/${sellerId}/wallet-transactions`, { params })).data,

  getWalletSummary: async (sellerId: SellerId) =>
    (await axiosClient.get(`/seller/${sellerId}/wallet-summary`)).data,

  topUpWalletDemo: async (sellerId: SellerId, payload: Record<string, unknown>) =>
    (await axiosClient.post(`/seller/${sellerId}/wallet-topups/demo`, payload)).data,

  getPayoutAccount: async (sellerId: SellerId) =>
    (await axiosClient.get(`/seller/${sellerId}/payout-account`)).data,

  savePayoutAccount: async (sellerId: SellerId, payload: Record<string, unknown>) =>
    (await axiosClient.patch(`/seller/${sellerId}/payout-account`, payload)).data,

  createDemoPayoutAccount: async (sellerId: SellerId) =>
    (await axiosClient.post(`/seller/${sellerId}/payout-account/demo`)).data,

  createWithdrawalRequest: async (sellerId: SellerId, payload: Record<string, unknown>) =>
    (await axiosClient.post(`/seller/${sellerId}/withdrawal-requests`, payload)).data,

  getSellerByCourseId: async (courseId: number) =>
    (await axiosClient.get(`/seller/${courseId}`)).data,

  getCoursesBySeller: async (sellerId: SellerId) =>
    (await axiosClient.get<ApiResponse<unknown[]>>(`/seller/${sellerId}/courses`)).data,

  getLessonUploadSignature: async (sellerId: SellerId, courseId: number) =>
    (await axiosClient.post<ApiResponse<DirectUploadSignature>>(`/seller/${sellerId}/courses/${courseId}/lessons/upload-signature`)).data,

  getLessonResourceUploadSignature: async (sellerId: SellerId, courseId: number) =>
    (await axiosClient.post<ApiResponse<DirectUploadSignature>>(`/seller/${sellerId}/courses/${courseId}/lessons/resources/upload-signature`)).data,

  uploadVideoDirect: async (signature: DirectUploadSignature, file: File, onProgress?: (percent: number) => void) => {
    if (!signature.publicId) throw new Error("Thieu ma upload video");
    const chunkSize = 20 * 1024 * 1024;
    const uploadId = crypto.randomUUID();
    const endpoint = `https://api.cloudinary.com/v1_1/${signature.cloudName}/video/upload`;
    let finalResponse: Record<string, unknown> | null = null;
    for (let start = 0; start < file.size; start += chunkSize) {
      const end = Math.min(start + chunkSize, file.size);
      const body = new FormData();
      body.append("file", file.slice(start, end), file.name);
      body.append("api_key", signature.apiKey);
      body.append("timestamp", String(signature.timestamp));
      body.append("signature", signature.signature);
      body.append("public_id", signature.publicId);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Range": `bytes ${start}-${end - 1}/${file.size}`, "X-Unique-Upload-Id": uploadId },
        body,
      });
      const result = await response.json() as Record<string, unknown>;
      if (!response.ok) throw new Error(String(result.error ? (result.error as { message?: string }).message : "Cloudinary upload failed"));
      finalResponse = result;
      onProgress?.(Math.round((end / file.size) * 100));
    }
    if (!finalResponse?.secure_url || !finalResponse.public_id) throw new Error("Cloudinary did not return video metadata");
    return { secureUrl: String(finalResponse.secure_url), publicId: String(finalResponse.public_id), durationSeconds: Math.ceil(Number(finalResponse.duration || 0)) };
  },

  uploadCourseImage: async (signature: DirectUploadSignature, file: File) => {
    if (!signature.publicId) throw new Error("Thieu ma upload anh bia");
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signature.apiKey);
    body.append("timestamp", String(signature.timestamp));
    body.append("signature", signature.signature);
    body.append("public_id", signature.publicId);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, { method: "POST", body });
    const result = await response.json() as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) throw new Error(result.error?.message || "Không thể upload ảnh bìa");
    return result.secure_url;
  },

  uploadRawFileDirect,

  saveLesson: async (sellerId: SellerId, courseId: number, lesson: Omit<LessonUploadPayload, "file"> & { publicId: string; secureUrl: string; durationSeconds: number }) =>
    (await axiosClient.post(`/seller/${sellerId}/courses/${courseId}/lessons`, lesson)).data,

  getLessons: async (sellerId: SellerId, courseId: number) =>
    (await axiosClient.get(`/seller/${sellerId}/courses/${courseId}/lessons`)).data,

  updateLessonResources: async (sellerId: SellerId, courseId: number, lessonId: number, resources: LessonResourcePayload[]) =>
    (await axiosClient.put(`/seller/${sellerId}/courses/${courseId}/lessons/${lessonId}/resources`, resources)).data,

  deleteLesson: async (sellerId: SellerId, courseId: number, lessonId: number) =>
    (await axiosClient.delete(`/seller/${sellerId}/courses/${courseId}/lessons/${lessonId}`)).data,
};

export default SellerService;

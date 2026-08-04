import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import {
  uploadRawFileDirect,
  type DirectUploadSignature,
} from "../utils/cloudinaryUpload";

export type UserProfileUpdate = Record<string, unknown>;

const UserService = {
  updateUserProfile: (data: UserProfileUpdate) => axiosClient.put("/users/me", data),
  getCertificateUploadSignature: async () =>
    (await axiosClient.post<ApiResponse<DirectUploadSignature>>("/users/me/certificates/upload-signature")).data,
  uploadRawFileDirect,
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.put("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default UserService;

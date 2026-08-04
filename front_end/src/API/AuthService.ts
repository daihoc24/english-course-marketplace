import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";
import type { ApiResponse, LoginRequest, LoginSession } from "../types/api";

type RegisterRequest = Record<string, unknown>;
type LogoutRequest = { token: string };

export const signIn = (body: LoginRequest): Promise<AxiosResponse<ApiResponse<LoginSession>>> =>
  axiosClient.post("/auth/login", body);

export const register = (body: RegisterRequest) => axiosClient.post("/users/createUser", body);

export const checkEmailExists = (email: string) =>
  axiosClient.post<ApiResponse<boolean>>("/users/existUser", null, { params: { email } });

export const logOutApi = (body: LogoutRequest) =>
  axiosClient.post("/auth/logout", body, { headers: { Authorization: `Bearer ${body.token}` } });

export const verifyRegister = (email: string) =>
  axiosClient.post("/verifyRegister", null, { params: { email }, timeout: 15000 });

export const confirmRegisterCode = (email: string, code: string) =>
  axiosClient.post("/verifyRegister/confirm", null, { params: { email, code }, timeout: 15000 });

export const forgotPassword = (email: string) =>
  axiosClient.post("/forgotPassword", null, { params: { email }, timeout: 15000 });

export const resetPassword = (token: string, newPassword: string) =>
  axiosClient.post("/auth/reset-password", { token, newPassword }, { timeout: 15000 });

export const introspect = (body: { token: string }) => axiosClient.post("/auth/introspect", body);

export const getUserById = (userId: number) => axiosClient.get(`/users/id/${userId}`, { timeout: 15000 });

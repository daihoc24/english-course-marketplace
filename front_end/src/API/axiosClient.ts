import axios, { type InternalAxiosRequestConfig } from "axios";
import { readStoredSession } from "../utils/session";
import { apiBaseUrl } from "./apiBaseUrl";

type StoredSession = {
  token?: string;
  currentUser?: { id?: number; role?: string };
};

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const publicEndpoints = new Set([
  "/auth/login",
  "/auth/introspect",
  "/auth/logout",
  "/users/createUser",
  "/users/existUser",
  "/verifyRegister",
  "/forgotPassword",
]);

const isPublicEndpoint = (url: string, method?: string) =>
  publicEndpoints.has(url) ||
  url.startsWith("/auth/") ||
  url.startsWith("/favorites/idUser/") ||
  url.startsWith("/verifyRegister/") ||
  url.startsWith("/seller/teachers/") ||
  url.startsWith("/users/id/") ||
  /\/seller\/\d+$/.test(url) ||
  (method?.toUpperCase() === "GET" && /\/seller\/\d+\/courses$/.test(url));

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const baseUrl = config.url?.split("?")[0] || "";
  const normalizedUrl = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;

  if (isPublicEndpoint(baseUrl, config.method) || isPublicEndpoint(normalizedUrl, config.method)) return config;

  const session = readStoredSession() as StoredSession | null;
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const baseUrl = error.config?.url?.split("?")[0] || "";
    const normalizedUrl = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
    const isPublicRequest = isPublicEndpoint(baseUrl, error.config?.method) || isPublicEndpoint(normalizedUrl, error.config?.method);
    if (error.response?.status === 401 && !isPublicRequest) {
      localStorage.removeItem("session");
      window.dispatchEvent(new Event("sessionUpdated"));
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

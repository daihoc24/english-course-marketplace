const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const apiBaseUrl = configuredApiBaseUrl
  ? trimTrailingSlash(configuredApiBaseUrl)
  : typeof window !== "undefined" && window.location?.hostname
    ? ["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? `${window.location.protocol || "http:"}//${window.location.hostname}:8080/api`
      : `${trimTrailingSlash(window.location.origin)}/api`
    : "http://localhost:8080/api";

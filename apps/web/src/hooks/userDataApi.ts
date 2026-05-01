export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const authFailureStatusCode = 401;

export const missingApiBaseUrlMessage = "VITE_API_BASE_URL is not configured.";

export const fetchWithSession = (input: URL | RequestInfo, init?: RequestInit) =>
  fetch(input, {
    ...init,
    credentials: "include"
  });

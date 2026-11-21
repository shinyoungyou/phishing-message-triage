import { CONFIG } from "./config.js";

async function request(endpoint, options = {}) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    Accept: "application/json",
  };

  if (options.body && typeof options.body === "object") {
    defaultHeaders["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    credentials: "include", // Required for HttpOnly session cookie
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.code = data?.error?.code || "REQUEST_FAILED";
    error.fields = data?.error?.fields || null;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (credentials) =>
    request("/api/v1/auth/register", { method: "POST", body: credentials }),

  login: (credentials) =>
    request("/api/v1/auth/login", { method: "POST", body: credentials }),

  logout: () =>
    request("/api/v1/auth/logout", { method: "POST" }),

  getProfile: () =>
    request("/api/v1/users/me", { method: "GET" }),

  // Triage (Nicolas)
  analyzeEmail: (payload) =>
    request("/api/v1/triage", { method: "POST", body: payload }),

  // Admin (Shinyoung)
  getAdminUsers: (page = 1, limit = 10) =>
    request(`/api/v1/admin/users?page=${page}&limit=${limit}`, { method: "GET" }),
};

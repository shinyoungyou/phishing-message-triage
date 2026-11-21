// Configuration for the Phishing Triage API client.
// Dynamically chooses localhost during development, and the Render backend in production.

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "";

export const CONFIG = {
  // Allow overriding API Base via localStorage for testing different environments
  API_BASE_URL:
    localStorage.getItem("triage_api_url") ||
    (isLocalhost
      ? "http://localhost:3000"
      : "https://phishing-message-triage-api.onrender.com"),
};

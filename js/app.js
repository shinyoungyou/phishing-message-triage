import { api } from "./api.js";
import { CONFIG } from "./config.js";
import { UI_MESSAGES } from "./messages.js";

// Application State
const state = {
  user: null,
  activeTab: "triage", // "triage" | "admin" | "auth"
  authMode: "login", // "login" | "register"
  adminPage: 1,
  adminLimit: 10,
  adminTotal: 0,
};

// DOM Elements
const elements = {
  // Navigation & User Info
  navUserBadge: document.getElementById("nav-user-badge"),
  navUserEmail: document.getElementById("nav-user-email"),
  navUserRole: document.getElementById("nav-user-role"),
  navTriageBtn: document.getElementById("nav-triage-btn"),
  navAdminBtn: document.getElementById("nav-admin-btn"),
  navAuthBtn: document.getElementById("nav-auth-btn"),
  navLogoutBtn: document.getElementById("nav-logout-btn"),
  apiStatusBadge: document.getElementById("api-status-badge"),

  // Views
  viewLoading: document.getElementById("view-loading"),
  viewAuth: document.getElementById("view-auth"),
  viewTriage: document.getElementById("view-triage"),
  viewAdmin: document.getElementById("view-admin"),

  // Auth Elements
  authTabLogin: document.getElementById("auth-tab-login"),
  authTabRegister: document.getElementById("auth-tab-register"),
  authForm: document.getElementById("auth-form"),
  authEmail: document.getElementById("auth-email"),
  authPassword: document.getElementById("auth-password"),
  authSubmitBtn: document.getElementById("auth-submit-btn"),
  authAlert: document.getElementById("auth-alert"),
  demoUserBtn: document.getElementById("demo-user-btn"),
  demoAdminBtn: document.getElementById("demo-admin-btn"),

  // Triage Elements
  triageForm: document.getElementById("triage-form"),
  triageSubject: document.getElementById("triage-subject"),
  triageSenderName: document.getElementById("triage-sender-name"),
  triageSenderAddress: document.getElementById("triage-sender-address"),
  triageBody: document.getElementById("triage-body"),
  triageMode: document.getElementById("triage-mode"),
  triageCharCount: document.getElementById("triage-char-count"),
  triageSubmitBtn: document.getElementById("triage-submit-btn"),
  triageAlert: document.getElementById("triage-alert"),
  samplePhishingBtn: document.getElementById("sample-phishing-btn"),
  sampleLegitBtn: document.getElementById("sample-legit-btn"),

  // Triage Results
  triageResultsContainer: document.getElementById("triage-results-container"),
  resultVerdictBadge: document.getElementById("result-verdict-badge"),
  resultStatusBadge: document.getElementById("result-status-badge"),
  resultAnalysisId: document.getElementById("result-analysis-id"),
  resultTimestamp: document.getElementById("result-timestamp"),
  resultReasonCodes: document.getElementById("result-reason-codes"),
  geminiExplanation: document.getElementById("gemini-explanation"),
  geminiIndicatorsContainer: document.getElementById("gemini-indicators-container"),
  geminiModelMeta: document.getElementById("gemini-model-meta"),
  jevPhishingBar: document.getElementById("jev-phishing-bar"),
  jevPhishingText: document.getElementById("jev-phishing-text"),
  jevLegitBar: document.getElementById("jev-legit-bar"),
  jevLegitText: document.getElementById("jev-legit-text"),
  jevUnclearBar: document.getElementById("jev-unclear-bar"),
  jevUnclearText: document.getElementById("jev-unclear-text"),
  jevModelMeta: document.getElementById("jev-model-meta"),

  // Admin Elements
  adminUsersTableBody: document.getElementById("admin-users-table-body"),
  adminAlert: document.getElementById("admin-alert"),
  adminPrevBtn: document.getElementById("admin-prev-btn"),
  adminNextBtn: document.getElementById("admin-next-btn"),
  adminPageInfo: document.getElementById("admin-page-info"),
  adminTotalInfo: document.getElementById("admin-total-info"),
};

// Utilities
function showAlert(element, message, type = "error") {
  if (!element) return;
  element.textContent = message;
  element.className = `p-3.5 rounded-lg text-sm mb-4 border transition-all ${
    type === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : type === "success"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : "bg-blue-50 text-blue-800 border-blue-200"
  }`;
  element.classList.remove("hidden");
}

function hideAlert(element) {
  if (!element) return;
  element.textContent = "";
  element.classList.add("hidden");
}

// View Navigation
function setView(viewName) {
  state.activeTab = viewName;
  elements.viewLoading.classList.add("hidden");
  elements.viewAuth.classList.add("hidden");
  elements.viewTriage.classList.add("hidden");
  elements.viewAdmin.classList.add("hidden");

  elements.navTriageBtn.classList.remove("text-indigo-600", "border-indigo-600");
  elements.navAdminBtn.classList.remove("text-indigo-600", "border-indigo-600");

  if (viewName === "auth") {
    elements.viewAuth.classList.remove("hidden");
  } else if (viewName === "triage") {
    elements.viewTriage.classList.remove("hidden");
    elements.navTriageBtn.classList.add("text-indigo-600", "border-indigo-600");
  } else if (viewName === "admin") {
    elements.viewAdmin.classList.remove("hidden");
    elements.navAdminBtn.classList.add("text-indigo-600", "border-indigo-600");
    loadAdminUsers(state.adminPage);
  }
}

// Auth State Rendering
function updateAuthUI() {
  if (state.user) {
    elements.navUserBadge.classList.remove("hidden");
    elements.navUserEmail.textContent = state.user.email;
    elements.navUserRole.textContent = state.user.role.toUpperCase();
    elements.navUserRole.className = `px-2 py-0.5 rounded text-xs font-semibold ${
      state.user.role === "admin"
        ? "bg-purple-100 text-purple-800"
        : "bg-slate-100 text-slate-800"
    }`;

    elements.navTriageBtn.classList.remove("hidden");
    elements.navAdminBtn.classList.toggle("hidden", state.user.role !== "admin");
    elements.navAuthBtn.classList.add("hidden");
    elements.navLogoutBtn.classList.remove("hidden");
  } else {
    elements.navUserBadge.classList.add("hidden");
    elements.navTriageBtn.classList.add("hidden");
    elements.navAdminBtn.classList.add("hidden");
    elements.navAuthBtn.classList.remove("hidden");
    elements.navLogoutBtn.classList.add("hidden");
  }
}

// Authentication Handlers
async function checkCurrentSession() {
  try {
    const data = await api.getProfile();
    state.user = data.user;
    updateAuthUI();
    setView("triage");
  } catch {
    state.user = null;
    updateAuthUI();
    setView("auth");
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  hideAlert(elements.authAlert);

  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  if (!email || !password) {
    showAlert(elements.authAlert, UI_MESSAGES.errors.requiredFields, "error");
    return;
  }

  elements.authSubmitBtn.disabled = true;
  elements.authSubmitBtn.textContent = "Processing...";

  try {
    if (state.authMode === "register") {
      await api.register({ email, password });
      showAlert(elements.authAlert, UI_MESSAGES.auth.registerSuccess, "success");
      setAuthMode("login");
      elements.authEmail.value = email;
      elements.authPassword.value = "";
    } else {
      const data = await api.login({ email, password });
      state.user = data.user;
      updateAuthUI();
      setView("triage");
      showAlert(elements.triageAlert, `Welcome, ${state.user.email}!`, "success");
    }
  } catch (err) {
    showAlert(elements.authAlert, err.message, "error");
  } finally {
    elements.authSubmitBtn.disabled = false;
    elements.authSubmitBtn.textContent =
      state.authMode === "login"
        ? UI_MESSAGES.auth.loginButton
        : UI_MESSAGES.auth.registerButton;
  }
}

function setAuthMode(mode) {
  state.authMode = mode;
  hideAlert(elements.authAlert);

  if (mode === "login") {
    elements.authTabLogin.className =
      "py-2 px-4 border-b-2 font-medium text-sm text-indigo-600 border-indigo-600";
    elements.authTabRegister.className =
      "py-2 px-4 border-b-2 font-medium text-sm text-slate-500 border-transparent hover:text-slate-700";
    elements.authSubmitBtn.textContent = UI_MESSAGES.auth.loginButton;
  } else {
    elements.authTabRegister.className =
      "py-2 px-4 border-b-2 font-medium text-sm text-indigo-600 border-indigo-600";
    elements.authTabLogin.className =
      "py-2 px-4 border-b-2 font-medium text-sm text-slate-500 border-transparent hover:text-slate-700";
    elements.authSubmitBtn.textContent = UI_MESSAGES.auth.registerButton;
  }
}

// Triage Handlers
async function handleTriageSubmit(e) {
  e.preventDefault();
  hideAlert(elements.triageAlert);

  if (!state.user) {
    showAlert(elements.triageAlert, "Please sign in to analyze emails.", "error");
    setView("auth");
    return;
  }

  const subject = elements.triageSubject.value.trim();
  const senderName = elements.triageSenderName.value.trim();
  const senderAddress = elements.triageSenderAddress.value.trim();
  const body = elements.triageBody.value.trim();
  const mode = elements.triageMode.value;

  if (!senderAddress || !body) {
    showAlert(elements.triageAlert, UI_MESSAGES.errors.requiredFields, "error");
    return;
  }

  elements.triageSubmitBtn.disabled = true;
  elements.triageSubmitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg> ${UI_MESSAGES.triage.analyzingBtn}`;

  try {
    const result = await api.analyzeEmail({
      subject,
      senderName,
      senderAddress,
      body,
      mode,
    });
    renderTriageResult(result);
    showAlert(elements.triageAlert, "Analysis completed and saved to database.", "success");
    elements.triageResultsContainer.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    showAlert(elements.triageAlert, err.message, "error");
  } finally {
    elements.triageSubmitBtn.disabled = false;
    elements.triageSubmitBtn.textContent = UI_MESSAGES.triage.submitBtn;
  }
}

function renderTriageResult(data) {
  elements.triageResultsContainer.classList.remove("hidden");

  // Overall Verdict Badge
  const classification = data.classification || "unclear";
  if (classification === "phishing") {
    elements.resultVerdictBadge.textContent = "PHISHING DETECTED";
    elements.resultVerdictBadge.className =
      "px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-300";
  } else if (classification === "likely_legitimate") {
    elements.resultVerdictBadge.textContent = "LIKELY LEGITIMATE";
    elements.resultVerdictBadge.className =
      "px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
  } else {
    elements.resultVerdictBadge.textContent = "UNCLEAR / SUSPICIOUS";
    elements.resultVerdictBadge.className =
      "px-3 py-1.5 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-300";
  }

  // Status & Metadata
  elements.resultStatusBadge.textContent = (data.status || "completed").toUpperCase();
  elements.resultAnalysisId.textContent = data.analysisId || "N/A";
  elements.resultTimestamp.textContent = new Date(data.createdAt).toLocaleString();

  // Reason codes
  elements.resultReasonCodes.innerHTML = "";
  const codes = data.reasonCodes || [];
  if (codes.length === 0) {
    elements.resultReasonCodes.textContent = "None";
  } else {
    for (const code of codes) {
      const badge = document.createElement("span");
      badge.className = "px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border";
      badge.textContent = code;
      elements.resultReasonCodes.appendChild(badge);
    }
  }

  // Gemini Card
  const gemini = data.gemini || {};
  elements.geminiExplanation.textContent =
    gemini.explanation || "(No explanation available or provider failed)";

  elements.geminiIndicatorsContainer.innerHTML = "";
  const indicators = gemini.indicators || [];
  if (indicators.length === 0) {
    const emptySpan = document.createElement("span");
    emptySpan.className = "text-xs text-slate-400 italic";
    emptySpan.textContent = "No specific threat indicators flagged.";
    elements.geminiIndicatorsContainer.appendChild(emptySpan);
  } else {
    for (const ind of indicators) {
      const tag = document.createElement("span");
      tag.className = "px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-md border border-rose-200";
      tag.textContent = ind;
      elements.geminiIndicatorsContainer.appendChild(tag);
    }
  }

  const durationStr = gemini.durationMs ? `${gemini.durationMs}ms` : "N/A";
  elements.geminiModelMeta.textContent = `Model: ${gemini.modelId || "Gemini"} | Latency: ${durationStr}`;

  // Jev Card
  const jev = data.jev || {};
  const probs = jev.probabilities || { phishing: 0, likely_legitimate: 0, unclear: 0 };
  const pPhishing = Math.round((probs.phishing || 0) * 100);
  const pLegit = Math.round((probs.likely_legitimate || 0) * 100);
  const pUnclear = Math.round((probs.unclear || 0) * 100);

  elements.jevPhishingBar.style.width = `${pPhishing}%`;
  elements.jevPhishingText.textContent = `${pPhishing}%`;

  elements.jevLegitBar.style.width = `${pLegit}%`;
  elements.jevLegitText.textContent = `${pLegit}%`;

  elements.jevUnclearBar.style.width = `${pUnclear}%`;
  elements.jevUnclearText.textContent = `${pUnclear}%`;

  const jevDuration = jev.durationMs ? `${jev.durationMs}ms` : "N/A";
  elements.jevModelMeta.textContent = `Model: ${jev.modelId || "Jev System One"} | Latency: ${jevDuration}`;
}

// Sample Email Loaders
function loadSamplePhishing() {
  elements.triageSubject.value = "URGENT: Verify your direct deposit credentials immediately";
  elements.triageSenderName.value = "Corporate Payroll Security";
  elements.triageSenderAddress.value = "payroll-security@portal-verification-service.tk";
  elements.triageBody.value = `Dear Employee,

We detected an unauthorized sign-in attempt to your payroll and tax account from an unrecognized IP address.

To ensure your direct deposit is not frozen before the upcoming payroll cut-off, you must verify your identity immediately by visiting our secure server:
http://portal-verification-service.tk/login/auth

You will be prompted to enter your corporate password and two-factor code. Failure to complete this within 12 hours will result in indefinite account suspension.

Sincerely,
Corporate Payroll & Information Security`;

  updateCharCount();
  hideAlert(elements.triageAlert);
}

function loadSampleLegitimate() {
  elements.triageSubject.value = "Weekly Team Sync Agenda & Sprint Goals";
  elements.triageSenderName.value = "Calvin Miller";
  elements.triageSenderAddress.value = "calvin@bcit.ca";
  elements.triageBody.value = `Hi team,

Here is our proposed agenda for tomorrow's project meeting:
1. Milestone 1 deliverables and database evidence verification
2. Reviewing the Gemini orchestrator and Jev decision outputs
3. Frontend GitHub Pages deployment and Render API connection checks

Please feel free to add any items to the shared meeting doc beforehand.

Best,
Calvin`;

  updateCharCount();
  hideAlert(elements.triageAlert);
}

function updateCharCount() {
  const len = elements.triageBody.value.length;
  elements.triageCharCount.textContent = `${len.toLocaleString()} / 20,000 characters`;
}

// Admin Handlers
async function loadAdminUsers(page = 1) {
  state.adminPage = page;
  hideAlert(elements.adminAlert);
  elements.adminUsersTableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-500">Loading users...</td></tr>`;

  try {
    const data = await api.getAdminUsers(page, state.adminLimit);
    state.adminTotal = data.total;

    elements.adminUsersTableBody.innerHTML = "";
    if (data.items.length === 0) {
      elements.adminUsersTableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-500">No registered users found.</td></tr>`;
      return;
    }

    for (const user of data.items) {
      const tr = document.createElement("tr");
      tr.className = "border-b hover:bg-slate-50 transition-colors";

      const tdId = document.createElement("td");
      tdId.className = "p-3 font-mono text-xs text-slate-500";
      tdId.textContent = user.id;

      const tdEmail = document.createElement("td");
      tdEmail.className = "p-3 text-sm font-medium text-slate-900";
      tdEmail.textContent = user.email;

      const tdRole = document.createElement("td");
      tdRole.className = "p-3 text-sm";
      const roleBadge = document.createElement("span");
      roleBadge.textContent = user.role;
      roleBadge.className = `px-2 py-0.5 rounded text-xs font-semibold ${
        user.role === "admin"
          ? "bg-purple-100 text-purple-800"
          : "bg-slate-100 text-slate-800"
      }`;
      tdRole.appendChild(roleBadge);

      const tdCreated = document.createElement("td");
      tdCreated.className = "p-3 text-sm text-slate-500";
      tdCreated.textContent = user.createdAt
        ? new Date(user.createdAt).toLocaleString()
        : "N/A";

      tr.appendChild(tdId);
      tr.appendChild(tdEmail);
      tr.appendChild(tdRole);
      tr.appendChild(tdCreated);
      elements.adminUsersTableBody.appendChild(tr);
    }

    const maxPage = Math.max(1, Math.ceil(data.total / state.adminLimit));
    elements.adminPageInfo.textContent = `Page ${page} of ${maxPage}`;
    elements.adminTotalInfo.textContent = `Total registered users: ${data.total}`;
    elements.adminPrevBtn.disabled = page <= 1;
    elements.adminNextBtn.disabled = page >= maxPage;
  } catch (err) {
    showAlert(elements.adminAlert, err.message, "error");
    elements.adminUsersTableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500">Access Denied: ${err.message}</td></tr>`;
  }
}

// Event Listeners Initialization
function initEventListeners() {
  // Navigation
  elements.navTriageBtn.addEventListener("click", () => setView("triage"));
  elements.navAdminBtn.addEventListener("click", () => setView("admin"));
  elements.navAuthBtn.addEventListener("click", () => setView("auth"));
  elements.navLogoutBtn.addEventListener("click", async () => {
    try {
      await api.logout();
    } finally {
      state.user = null;
      updateAuthUI();
      setView("auth");
      showAlert(elements.authAlert, UI_MESSAGES.auth.logoutSuccess, "success");
    }
  });

  // Auth Tabs & Form
  elements.authTabLogin.addEventListener("click", () => setAuthMode("login"));
  elements.authTabRegister.addEventListener("click", () => setAuthMode("register"));
  elements.authForm.addEventListener("submit", handleAuthSubmit);

  // Demo Logins
  elements.demoUserBtn.addEventListener("click", () => {
    elements.authEmail.value = "john@john.com";
    elements.authPassword.value = "123";
    setAuthMode("login");
  });
  elements.demoAdminBtn.addEventListener("click", () => {
    elements.authEmail.value = "admin@admin.com";
    elements.authPassword.value = "111";
    setAuthMode("login");
  });

  // Triage Form & Samples
  elements.triageForm.addEventListener("submit", handleTriageSubmit);
  elements.samplePhishingBtn.addEventListener("click", loadSamplePhishing);
  elements.sampleLegitBtn.addEventListener("click", loadSampleLegitimate);
  elements.triageBody.addEventListener("input", updateCharCount);

  // Admin Pagination
  elements.adminPrevBtn.addEventListener("click", () => {
    if (state.adminPage > 1) loadAdminUsers(state.adminPage - 1);
  });
  elements.adminNextBtn.addEventListener("click", () => {
    loadAdminUsers(state.adminPage + 1);
  });

  // Display active API target
  if (elements.apiStatusBadge) {
    elements.apiStatusBadge.textContent = `API: ${CONFIG.API_BASE_URL}`;
  }
}

// Application Boot
document.addEventListener("DOMContentLoaded", () => {
  elements.viewLoading.textContent = UI_MESSAGES.auth.checkingSession;
  initEventListeners();
  checkCurrentSession();
});

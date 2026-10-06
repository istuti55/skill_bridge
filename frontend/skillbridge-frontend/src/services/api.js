const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// ==================== STORAGE HELPERS ====================

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user";

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

export const getUserRole = () => getStoredUser()?.role || null;
export const isAuthenticated = () => !!getAccessToken();

// Where each role lands after login
export const getHomeRoute = (role) =>
  role === "company" ? "/company" : "/dashboard";

const clearSession = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

// ==================== ERROR HELPER ====================

const extractErrorMessage = (data) => {
  if (!data || typeof data !== "object") {
    return "Something went wrong";
  }

  if (typeof data.error === "string") return data.error;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  const parts = [];

  Object.entries(data).forEach(([field, value]) => {
    const text = Array.isArray(value) ? value.join(" ") : String(value);

    parts.push(
      field === "non_field_errors"
        ? text
        : `${field}: ${text}`
    );
  });

  return parts.join(" | ") || "Something went wrong";
};

// ==================== CORE REQUEST ====================

let refreshPromise = null;

const refreshAccessToken = () => {
  if (refreshPromise) return refreshPromise;

  const refresh = getRefreshToken();

  if (!refresh) {
    return Promise.resolve(false);
  }

  refreshPromise = fetch(`${API_BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  })
    .then(async (res) => {
      if (!res.ok) return false;

      const data = await res.json();

      if (!data.access) return false;

      localStorage.setItem(ACCESS_KEY, data.access);

      if (data.refresh) {
        localStorage.setItem(REFRESH_KEY, data.refresh);
      }

      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const forceLogout = () => {
  clearSession();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

const request = async (
  endpoint,
  options = {},
  isRetry = false
) => {
  const { skipAuth, ...fetchOptions } = options;
  const token = getAccessToken();

  const headers = {
    ...(fetchOptions.headers || {}),
  };

  if (token && !skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...fetchOptions,
        headers,
      }
    );
  } catch {
    throw new Error(
      "Cannot reach the server. Check that the backend is running."
    );
  }

  // Expired access token:
  // refresh once, retry once, otherwise log out
  if (response.status === 401 && !skipAuth) {
    if (
      !isRetry &&
      (await refreshAccessToken())
    ) {
      return request(endpoint, options, true);
    }

    forceLogout();

    throw new Error(
      "Your session expired. Please log in again."
    );
  }

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data)
    );
  }

  return data;
};

// ==================== AUTH ====================

export const registerUser = async (userData) => {
  return request("/register/", {
    method: "POST",
    body: JSON.stringify(userData),
    skipAuth: true,
  });
};

export const loginUser = async (
  email,
  password
) => {
  const data = await request("/login/", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
    skipAuth: true,
  });

  if (data.access) {
    localStorage.setItem(
      ACCESS_KEY,
      data.access
    );
  }

  if (data.refresh) {
    localStorage.setItem(
      REFRESH_KEY,
      data.refresh
    );
  }

  if (data.user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(data.user)
    );
  }

  return data;
};

// Backend has no logout endpoint.
// JWT is stateless, so clear local storage.
export const logoutUser = () => {
  clearSession();
};

// ==================== PROFILE ====================

export const getMyProfile = async () =>
  request("/candidates/me/");

// ==================== RESUME ====================

export const uploadResume = async (file) => {
  const formData = new FormData();

  formData.append("cv_file", file);

  return request(
    "/candidates/upload-cv/",
    {
      method: "POST",
      body: formData,
    }
  );
};

// ==================== JOBS ====================

// Get jobs
// Candidate: approved jobs
// Company: company's own jobs
// Admin: all jobs
export const getJobs = async () =>
  request("/jobs/");

// Get a single job
export const getJobDetails = async (jobId) =>
  request(`/jobs/${jobId}/`);

// Candidate applies to a job
export const applyToJob = async (jobId) =>
  request(`/jobs/${jobId}/apply/`, {
    method: "POST",
  });

// Candidate gets their match for a job
export const getJobMatch = async (jobId) =>
  request(`/jobs/${jobId}/match/`);

// ==================== COMPANY JOB MANAGEMENT ====================

// Company creates a new job
export const createJob = async (jobData) =>
  request("/jobs/", {
    method: "POST",
    body: JSON.stringify(jobData),
  });

// Company edits its own job
export const updateJob = async (
  jobId,
  jobData
) =>
  request(`/jobs/${jobId}/`, {
    method: "PATCH",
    body: JSON.stringify(jobData),
  });

// Company deletes its own job
// Backend rejects deletion if applications exist
export const deleteJob = async (jobId) =>
  request(`/jobs/${jobId}/`, {
    method: "DELETE",
  });

// Company closes its own job
export const closeJob = async (jobId) =>
  request(`/jobs/${jobId}/close/`, {
    method: "PATCH",
  });

// ==================== AI / CAREER ====================

export const getSkillGaps = async (
  jobId,
  { narrative = false } = {}
) => {
  const query = narrative
    ? "&narrative=true"
    : "";

  return request(
    `/skill-gaps/?job_id=${jobId}${query}`
  );
};

export const getCareerPaths = async (jobId) => {
  const query = jobId
    ? `?job_id=${jobId}`
    : "";

  return request(
    `/candidates/career-paths/${query}`
  );
};

// ==================== APPLICATIONS ====================

export const getMyApplications = async () =>
  request("/applications/mine/");

// ==================== DASHBOARDS ====================

export const getCandidateDashboard = async () =>
  request("/dashboard/candidate/");

export const getCompanyDashboard = async () =>
  request("/dashboard/company/");

// ==================== COMPANY / RECRUITMENT ====================

export const getJobApplications = async (
  jobId
) =>
  request(
    `/jobs/${jobId}/applications/`
  );

export const getRankedCandidates = async (
  jobId
) =>
  request(
    `/jobs/${jobId}/ranked-candidates/`
  );

export const getCandidateMatch = async (
  jobId,
  candidateId
) =>
  request(
    `/jobs/${jobId}/candidates/${candidateId}/match/`
  );

// Recruitment stages:
// applied
// shortlisted
// interview_scheduled
// offer_extended
// hired
// rejected

export const updateApplicationStage = async (
  applicationId,
  stage,
  extra = {}
) => {
  return request(
    `/applications/${applicationId}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        recruitment_stage: stage,
        ...extra,
      }),
    }
  );
};

// ==================== NOTIFICATIONS ====================

export const getNotifications = async () =>
  request("/notifications/");

// Backend route is PATCH
export const markNotificationRead = async (
  notificationId
) =>
  request(
    `/notifications/${notificationId}/read/`,
    {
      method: "PATCH",
    }
  );
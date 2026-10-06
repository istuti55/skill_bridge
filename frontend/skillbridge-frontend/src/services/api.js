const API_BASE_URL = "http://127.0.0.1:8000/api";

const getAccessToken = () => {
  const token = localStorage.getItem("access_token");

  console.log("ACCESS TOKEN EXISTS:", !!token);
  console.log("TOKEN LENGTH:", token ? token.length : 0);

  return token;
};

const request = async (endpoint, options = {}) => {
  const token = getAccessToken();

  const headers = {
    ...(options.headers || {}),
  };

  // Send JWT only when authentication is required.
  // Register and Login use skipAuth: true.
  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData.
  // Browser automatically sets multipart/form-data boundary.
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.log("Backend error:", data);

    throw new Error(
      data.detail ||
        data.message ||
        data.error ||
        JSON.stringify(data) ||
        "Something went wrong"
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

export const loginUser = async (email, password) => {
  const data = await request("/login/", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
    skipAuth: true,
  });

  // Save access token
  if (data.access) {
    localStorage.setItem("access_token", data.access);
  }

  // Save refresh token
  if (data.refresh) {
    localStorage.setItem("refresh_token", data.refresh);
  }

  // Save user information
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

// ==================== PROFILE ====================

export const getMyProfile = async () => {
  return request("/candidates/me/");
};

// ==================== RESUME ====================

export const uploadResume = async (file) => {
  const formData = new FormData();

  formData.append("cv_file", file);

  return request("/candidates/upload-cv/", {
    method: "POST",
    body: formData,
  });
};

// ==================== JOBS ====================

export const getJobs = async () => {
  return request("/jobs/");
};

export const applyToJob = async (jobId) => {
  return request(`/jobs/${jobId}/apply/`, {
    method: "POST",
  });
};

export const getJobMatch = async (jobId) => {
  return request(`/jobs/${jobId}/match/`);
};

// ==================== AI / CAREER ====================

export const getSkillGaps = async (jobId) => {
  return request(`/skill-gaps/?job_id=${jobId}`);
};

export const getCareerPaths = async () => {
  return request("/candidates/career-paths/");
};

// ==================== APPLICATIONS ====================

export const getMyApplications = async () => {
  return request("/applications/mine/");
};

// ==================== NOTIFICATIONS ====================

export const getNotifications = async () => {
  return request("/notifications/");
};

export const markNotificationRead = async (notificationId) => {
  return request(`/notifications/${notificationId}/read/`, {
    method: "POST",
  });
};
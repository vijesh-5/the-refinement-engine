// Frontend API Client for Artifex Backend

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "API request failed");
  }

  return data;
};

// ============================================
// AUTHENTICATION
// ============================================

export const signup = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await handleResponse(response);

  if (result.success && result.data) {
    localStorage.setItem("accessToken", result.data.accessToken);
    localStorage.setItem("refreshToken", result.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }

  return result;
};

export const login = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await handleResponse(response);

  if (result.success && result.data) {
    localStorage.setItem("accessToken", result.data.accessToken);
    localStorage.setItem("refreshToken", result.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }

  return result;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (refreshToken) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// ============================================
// AI GENERATION
// ============================================

export const generateBlog = async (data: {
  topic: string;
  audience: string;
  tone: string;
  keywords?: string[];
  length: "short" | "medium" | "long";
  intent?: string;
}) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/generate/blog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const generateAd = async (data: {
  platform: "Facebook" | "Instagram" | "Google" | "LinkedIn";
  product: string;
  targetAudience: string;
  keyBenefit: string;
  tone: "direct" | "playful" | "urgent" | "professional";
}) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/generate/ad`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const generateProduct = async (data: {
  productName: string;
  features: string;
  tone: string;
  targetAudience: string;
  length: "short" | "medium" | "long";
}) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/generate/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

// ============================================
// CONTENT MANAGEMENT
// ============================================

export const getMyContent = async (filters?: any) => {
  const token = getAuthToken();
  const params = new URLSearchParams();

  if (filters?.contentType) params.append("contentType", filters.contentType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());

  const response = await fetch(`${API_BASE_URL}/content?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
};

export const getContent = async (contentId: string) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
};

export const deleteContent = async (contentId: string) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
};

// ============================================
// USER PROFILE & DASHBOARD
// ============================================

export const getProfile = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const getDashboard = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};

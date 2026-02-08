// Frontend API Client for Artifex Backend
// Place this file at: src/lib/api.ts

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
    throw new Error(data.error || "API request failed");
  }

  return data;
};

// ============================================
// AUTHENTICATION
// ============================================

export const signup = async (data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await handleResponse(response);

  // Save tokens to localStorage
  if (result.success && result.data) {
    localStorage.setItem("accessToken", result.data.accessToken);
    localStorage.setItem("refreshToken", result.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }

  return result;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await handleResponse(response);

  // Save tokens to localStorage
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

  // Clear localStorage
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

export const getMyContent = async (filters?: {
  contentType?: "blog" | "ad" | "product" | "general";
  status?: "DRAFT" | "COMPLETE";
  limit?: number;
  offset?: number;
}) => {
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
// USER PROFILE
// ============================================

export const getProfile = async () => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
};

export const updateProfile = async (data: {
  firstName?: string;
  lastName?: string;
}) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

// ============================================
// DASHBOARD
// ============================================

export const getDashboard = async () => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
};

// ============================================
// TEMPLATES
// ============================================

export const getTemplates = async () => {
  const response = await fetch(`${API_BASE_URL}/templates`);
  return handleResponse(response);
};

export const getTemplateCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/templates/categories`);
  return handleResponse(response);
};

// ============================================
// EXAMPLE USAGE IN COMPONENTS
// ============================================

/*
// In your Blog Creator component:
import { generateBlog } from '@/lib/api';

const handleGenerateBlog = async () => {
  try {
    const result = await generateBlog({
      topic: formData.topic,
      audience: formData.audience,
      tone: formData.tone,
      keywords: formData.keywords,
      length: formData.length,
      intent: formData.intent,
    });
    
    if (result.success) {
      const blogData = result.data;
      // Display: blogData.title, blogData.content, blogData.outline, etc.
      console.log('Generated blog:', blogData);
    }
  } catch (error) {
    console.error('Blog generation failed:', error);
    // Show error to user
  }
};

// In your Ad Copywriter component:
import { generateAd } from '@/lib/api';

const handleGenerateAd = async () => {
  try {
    const result = await generateAd({
      platform: formData.platform,
      product: formData.product,
      targetAudience: formData.targetAudience,
      keyBenefit: formData.keyBenefit,
      tone: formData.tone,
    });
    
    if (result.success) {
      const adData = result.data;
      // Display all 3 variants
      adData.variants.forEach((variant, index) => {
        console.log(`Variant ${index + 1}:`, variant);
      });
    }
  } catch (error) {
    console.error('Ad generation failed:', error);
  }
};

// In your My Content page:
import { getMyContent } from '@/lib/api';

const loadContent = async () => {
  try {
    const result = await getMyContent({
      contentType: 'blog', // or 'ad', 'product', or omit for all
      limit: 20,
      offset: 0,
    });
    
    if (result.success) {
      const contents = result.data;
      const meta = result.meta;
      console.log(`Showing ${contents.length} of ${meta.total} items`);
      // Display content list
    }
  } catch (error) {
    console.error('Failed to load content:', error);
  }
};
*/

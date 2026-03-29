// Frontend API Client for Artifex Backend

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export interface ContentScore {
  total: number;
  readability: number;
  seo: number;
  engagement: number;
  details?: {
    readabilityFeedback: string;
    seoFeedback: string;
    engagementFeedback: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface BlogContent {
  id: string;
  title: string;
  body: string;
  content: string; // compatibility with old code
  score: ContentScore;
  seoInsights?: string;
  conversionInsights?: string;
  reasoningSummary?: string;
}

export interface AdVariant {
  headline: string;
  primaryText: string;
  cta: string;
  tags?: string[];
}

export interface AdContent {
  id: string;
  platform: string;
  variants: AdVariant[];
  score: ContentScore;
  reasoningSummary?: string;
}

export interface ProductContent {
  id: string;
  productName: string;
  bulletFeatures: string[];
  shortDescription: string;
  longDescription: string;
  score: ContentScore;
  reasoningSummary?: string;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  versionNumber: number;
  body: string;
  improvementType: string | null;
  scores: ContentScore;
  createdAt: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  industry?: string;
  tone: string;
  targetAudience?: string;
  brandVoice?: string;
  bannedWords: string[];
  keySellingPoints: string[];
  createdAt: string;
  updatedAt: string;
}

// Helper to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json();

  if (!response.ok) {
    let errorMessage = data.error || data.message || "API request failed";
    
    // Handle Zod validation details if present
    if (data.details && Array.isArray(data.details)) {
      const details = data.details.map((d: any) => `${d.field}: ${d.message}`).join(", ");
      errorMessage = `Validation Error: ${details}`;
    }
    
    throw new Error(errorMessage);
  }

  return data;
};

// ============================================
// AUTHENTICATION
// ============================================

export const signup = async (data: Record<string, string>) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<AuthResponse>(response);

  if (result.success && result.data) {
    localStorage.setItem("accessToken", result.data.accessToken);
    localStorage.setItem("refreshToken", result.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }

  return result;
};

export const login = async (data: Record<string, string>) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<AuthResponse>(response);

  if (result.success && result.data) {
    localStorage.setItem("accessToken", result.data.accessToken);
    localStorage.setItem("refreshToken", result.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }

  return result;
};

// Centralized wrapper for authenticated requests with automated token refresh
const fetchWithAuth = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  // If unauthorized, attempt to refresh token
  if (response.status === 401 && !url.includes("/auth/refresh")) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      throw new Error("Session expired. Please login again.");
    }

    try {
      // Attempt to refresh
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshResult = (await refreshResponse.json()) as ApiResponse<AuthResponse>;
        if (refreshResult.success && refreshResult.data) {
          // Store new tokens
          localStorage.setItem("accessToken", refreshResult.data.accessToken);
          localStorage.setItem("refreshToken", refreshResult.data.refreshToken);

          // Retry the original request with new token
          const newToken = refreshResult.data.accessToken;
          return fetchWithAuth<T>(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
          });
        }
      }
    } catch (error) {
      console.error("Token refresh failed", error);
    }

    // If refresh fails, cleanup and throw
    logout();
    throw new Error("Session expired. Please login again.");
  }

  return handleResponse<T>(response);
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
  brandId?: string;
}) => {
  return fetchWithAuth<BlogContent>(`${API_BASE_URL}/generate/blog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const generateAd = async (data: {
  platform: "Facebook" | "Instagram" | "Google" | "LinkedIn";
  product: string;
  targetAudience: string;
  keyBenefit: string;
  tone: "direct" | "playful" | "urgent" | "professional";
  brandId?: string;
}) => {
  return fetchWithAuth<AdContent>(`${API_BASE_URL}/generate/ad`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const generateProduct = async (data: {
  productName: string;
  features: string;
  tone: string;
  targetAudience: string;
  length: "short" | "medium" | "long";
  brandId?: string;
}) => {
  return fetchWithAuth<ProductContent>(`${API_BASE_URL}/generate/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// ============================================
// CONTENT MANAGEMENT
// ============================================

export interface ContentFilters {
  contentType?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const getMyContent = async (filters?: ContentFilters) => {
  const params = new URLSearchParams();

  if (filters?.contentType) params.append("contentType", filters.contentType);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());

  return fetchWithAuth(`${API_BASE_URL}/content?${params.toString()}`);
};

export const getContent = async (contentId: string) => {
  return fetchWithAuth(`${API_BASE_URL}/content/${contentId}`);
};

export const deleteContent = async (contentId: string) => {
  return fetchWithAuth(`${API_BASE_URL}/content/${contentId}`, {
    method: "DELETE",
  });
};

export const improveContent = async (contentId: string, mode: string) => {
  return fetchWithAuth<ContentVersion>(`${API_BASE_URL}/content/${contentId}/improve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
};

export const getContentVersions = async (contentId: string) => {
  return fetchWithAuth<ContentVersion[]>(`${API_BASE_URL}/content/${contentId}/versions`);
};

// ============================================
// USER PROFILE & DASHBOARD
// ============================================

export const getProfile = async () => {
  return fetchWithAuth(`${API_BASE_URL}/users/profile`);
};

export const getDashboard = async () => {
  return fetchWithAuth(`${API_BASE_URL}/dashboard`);
};

// ============================================
// CONTENT MANAGEMENT
// ============================================

export interface SaveContentInput {
  title: string;
  body: string;
  contentType: "blog" | "ad" | "product" | "general";
  status: "DRAFT" | "COMPLETE";
  generatedOutput?: any;
  inputData?: any;
}

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  status: "DRAFT" | "COMPLETE";
  contentType: string;
  inputData: any;
  generatedOutput: any;
  createdAt: string;
  updatedAt: string;
  template?: { id: string; name: string; category: string } | null;
}

export interface ContentListResponse {
  data: ContentItem[];
  meta: { total: number; limit: number; offset: number; hasMore: boolean };
}

export const saveContent = async (data: SaveContentInput) => {
  return fetchWithAuth<ContentItem>(`${API_BASE_URL}/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const listContent = async (params?: {
  status?: string;
  contentType?: string;
  limit?: number;
  offset?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.contentType) query.set("contentType", params.contentType);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  return fetchWithAuth<ContentListResponse>(
    `${API_BASE_URL}/content${qs ? `?${qs}` : ""}`
  );
};

export const getContentItem = async (id: string) => {
  return fetchWithAuth<ContentItem>(`${API_BASE_URL}/content/${id}`);
};

export const updateContentItem = async (
  id: string,
  data: Partial<Pick<SaveContentInput, "title" | "body" | "status">>
) => {
  return fetchWithAuth<ContentItem>(`${API_BASE_URL}/content/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteContentItem = async (id: string) => {
  return fetchWithAuth(`${API_BASE_URL}/content/${id}`, {
    method: "DELETE",
  });
};

// ============================================
// BRAND MANAGEMENT
// ============================================

export const getBrands = async () => {
  return fetchWithAuth<BrandProfile[]>(`${API_BASE_URL}/brands`);
};

export const getBrand = async (id: string) => {
  return fetchWithAuth<BrandProfile>(`${API_BASE_URL}/brands/${id}`);
};

export const createBrand = async (data: Omit<BrandProfile, "id" | "createdAt" | "updatedAt">) => {
  return fetchWithAuth<BrandProfile>(`${API_BASE_URL}/brands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const updateBrand = async (id: string, data: Partial<BrandProfile>) => {
  return fetchWithAuth<BrandProfile>(`${API_BASE_URL}/brands/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteBrand = async (id: string) => {
  return fetchWithAuth(`${API_BASE_URL}/brands/${id}`, {
    method: "DELETE",
  });
};

// ============================================
// COMPETITOR ANALYSIS
// ============================================

export interface CompetitorInsight {
  id: string;
  brandProfileId: string;
  url: string;
  domain: string;
  title: string | null;
  keyMessages: string[];
  toneAnalysis: string | null;
  strengthAreas: string[];
  weaknessGaps: string[];
  rawSummary: string | null;
  lastAnalyzed: string;
  createdAt: string;
}

export const analyzeCompetitor = async (data: { url: string; brandProfileId: string }) => {
  return fetchWithAuth<CompetitorInsight>(`${API_BASE_URL}/competitors/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const getCompetitors = async (brandId: string) => {
  return fetchWithAuth<CompetitorInsight[]>(`${API_BASE_URL}/competitors/brand/${brandId}`);
};

// ============================================
// PHASE 11 — MEDIA ASSETS
// ============================================

export interface ContentAsset {
  id: string;
  contentId: string;
  assetType: "image" | "video" | "audio" | "other";
  url: string;
  publicId: string | null;
  metadata: any;
  createdAt: string;
}

export const generateImage = async (
  contentId: string,
  prompt?: string
): Promise<ApiResponse<ContentAsset>> => {
  return fetchWithAuth<ContentAsset>(`${API_BASE_URL}/content/${contentId}/assets/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
};

export const listAssets = async (contentId: string): Promise<ApiResponse<ContentAsset[]>> => {
  return fetchWithAuth<ContentAsset[]>(`${API_BASE_URL}/content/${contentId}/assets`);
};

export const deleteAsset = async (contentId: string, assetId: string): Promise<ApiResponse<unknown>> => {
  return fetchWithAuth(`${API_BASE_URL}/content/${contentId}/assets/${assetId}`, {
    method: "DELETE",
  });
};

export const deleteCompetitor = async (id: string) => {
  return fetchWithAuth(`${API_BASE_URL}/competitors/${id}`, {
    method: "DELETE",
  });
};

// ============================================
// PHASE 11 — EXPORT
// ============================================

export type ExportFormat = "pdf" | "html" | "docx";

export const exportContent = async (contentId: string, format: ExportFormat): Promise<void> => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/content/${contentId}/export?format=${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Export failed");

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const filename = disposition.match(/filename="(.+)"/)?.[1] ?? `content.${format}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ============================================
// PHASE 12 — SOCIAL FORMATTER
// ============================================

export type SocialPlatform = "x" | "linkedin" | "caption" | "all";

export interface SocialFormats {
  x?: { thread: string[] };
  linkedin?: { slides: Array<{ heading: string; content: string }> };
  caption?: { text: string; hashtags: string[] };
}

export const formatSocial = async (data: {
  content: string;
  title: string;
  platform: SocialPlatform;
  url?: string;
}): Promise<ApiResponse<SocialFormats>> => {
  return fetchWithAuth<SocialFormats>(`${API_BASE_URL}/format/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// ============================================
// PHASE 12 — PUBLIC SHARE LINKS
// ============================================

export interface ShareLink {
  id: string;
  slug: string;
  isActive: boolean;
  contentId: string;
  createdAt: string;
  shareUrl: string;
}

export const createShareLink = async (contentId: string): Promise<ApiResponse<ShareLink>> => {
  return fetchWithAuth<ShareLink>(`${API_BASE_URL}/content/${contentId}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};

export const listShareLinks = async (contentId: string): Promise<ApiResponse<ShareLink[]>> => {
  return fetchWithAuth<ShareLink[]>(`${API_BASE_URL}/content/${contentId}/share`);
};

export const revokeShareLink = async (contentId: string, linkId: string): Promise<ApiResponse<unknown>> => {
  return fetchWithAuth(`${API_BASE_URL}/content/${contentId}/share/${linkId}`, {
    method: "DELETE",
  });
};

// Unauthenticated public reader (no auth headers)
export interface PublicContentView {
  title: string;
  body: string;
  contentType: string;
  funnelStage: string | null;
  createdAt: string;
}

export const getPublicContent = async (slug: string): Promise<ApiResponse<PublicContentView>> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:5000"}/public/${slug}`
  );
  return handleResponse<PublicContentView>(response);
};

// ============================================
// PHASE 13 — A/B VARIANTS
// ============================================

export interface AbVariant {
  id: string;
  contentId: string;
  variantLabel: string;
  contentText: string;
  createdAt: string;
}

export const createVariant = async (
  contentId: string,
  opts?: { variantLabel?: string; focus?: string }
): Promise<ApiResponse<AbVariant>> => {
  return fetchWithAuth<AbVariant>(`${API_BASE_URL}/content/${contentId}/variants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts ?? {}),
  });
};

export const listVariants = async (contentId: string): Promise<ApiResponse<AbVariant[]>> => {
  return fetchWithAuth<AbVariant[]>(`${API_BASE_URL}/content/${contentId}/variants`);
};

export const deleteVariant = async (
  contentId: string,
  variantId: string
): Promise<ApiResponse<unknown>> => {
  return fetchWithAuth(`${API_BASE_URL}/content/${contentId}/variants/${variantId}`, {
    method: "DELETE",
  });
};

// ============================================
// PHASE 13 — ANALYTICS
// ============================================

export interface PerformanceTrend {
  contentId: string;
  title: string;
  totalImpressions: number;
  totalClicks: number;
  avgCTR: number;
  avgPosition: number;
  trend: "rising" | "stable" | "declining";
  deltaImpressions: number;
  deltaCTR: number;
}

export interface PerformanceRow {
  id: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  date: string;
}

export const getAnalyticsTrends = async (days = 28): Promise<ApiResponse<PerformanceTrend[]>> => {
  return fetchWithAuth<PerformanceTrend[]>(`${API_BASE_URL}/analytics/trends?days=${days}`);
};

export const getContentPerformance = async (
  id: string,
  days = 90
): Promise<ApiResponse<{ content: { id: string; title: string }; rows: PerformanceRow[] }>> => {
  return fetchWithAuth(`${API_BASE_URL}/analytics/content/${id}?days=${days}`);
};

export const triggerGSCSync = async (): Promise<ApiResponse<{ message: string }>> => {
  return fetchWithAuth<{ message: string }>(`${API_BASE_URL}/analytics/sync`, { method: "POST" });
};

// ============================================
// CONTENT-DERIVED ANALYTICS
// ============================================

export interface ContentAnalyticsItem {
  id: string;
  title: string;
  contentType: string;
  status: string;
  createdAt: string;
  wordCount: number;
  score: { total: number; readability: number; seo: number; engagement: number } | null;
  versions: number;
  abVariants: number;
}

export interface ContentAnalytics {
  summary: {
    totalContent: number;
    totalWords: number;
    totalVersions: number;
    avgScore: number;
    avgReadability: number;
    avgSEO: number;
    avgEngagement: number;
  };
  byType: Record<string, number>;
  timeline: Array<{ week: string; count: number }>;
  topPerformers: ContentAnalyticsItem[];
  lowPerformers: ContentAnalyticsItem[];
  items: ContentAnalyticsItem[];
}

export const getAnalyticsOverview = async (): Promise<ApiResponse<ContentAnalytics>> => {
  return fetchWithAuth<ContentAnalytics>(`${API_BASE_URL}/analytics/overview`);
};

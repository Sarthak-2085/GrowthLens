// Typed client for the GrowthLens FastAPI backend.
// Base URL comes from NEXT_PUBLIC_API_URL (see .env).

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

export interface Campaign {
  id: number;
  dataset_id: string;
  campaign_name: string;
  budget: number;
  clicks: number;
  impressions: number;
  conversions: number;
  revenue: number;
  channel: string;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Dataset {
  id: string;
  filename: string;
  row_count: number;
  uploaded_at: string;
}

export interface RowError {
  row: number;
  reason: string;
}

export interface UploadResponse {
  dataset: Dataset;
  inserted: number;
  skipped: number;
  errors: RowError[];
}

export interface CampaignMetrics {
  id: number;
  campaign_name: string;
  channel: string;
  budget: number;
  revenue: number;
  roi: number;
  ctr: number;
  cpc: number;
  cpa: number;
  cvr: number;
  budget_efficiency: number;
}

export interface AnalyticsSummary {
  total_campaigns: number;
  total_budget: number;
  total_revenue: number;
  overall_roi: number;
  overall_ctr: number;
  overall_cpc: number;
  overall_cpa: number;
  overall_cvr: number;
  best_campaign: CampaignMetrics | null;
  worst_campaign: CampaignMetrics | null;
  most_efficient_campaign: CampaignMetrics | null;
  campaign_metrics: CampaignMetrics[];
}

export type RecommendationType = 'increase' | 'decrease' | 'optimize' | 'alert';
export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface Recommendation {
  id: string;
  campaign_id: number;
  campaign_name: string;
  channel: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  headline: string;
  detail: string;
  potential_impact: string;
  action: string;
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError('Could not reach the GrowthLens backend. Is it running?');
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // ignore — use default detail
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function getCampaigns(datasetId?: string): Promise<Campaign[]> {
  const query = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}&limit=500` : '?limit=500';
  return request<Campaign[]>(`/api/campaigns${query}`);
}

export function getDatasets(): Promise<Dataset[]> {
  return request<Dataset[]>('/api/datasets');
}

export function uploadCampaignCsv(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return request<UploadResponse>('/api/upload', { method: 'POST', body: formData });
}

export function deleteCampaign(id: number): Promise<void> {
  return request<void>(`/api/campaigns/${id}`, { method: 'DELETE' });
}

export function deleteDataset(id: string): Promise<void> {
  return request<void>(`/api/datasets/${id}`, { method: 'DELETE' });
}

export function checkHealth(): Promise<{ status: string }> {
  return request<{ status: string }>('/api/health');
}

export function getAnalyticsSummary(datasetId?: string): Promise<AnalyticsSummary> {
  const query = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : '';
  return request<AnalyticsSummary>(`/api/analytics/summary${query}`);
}

export function getRecommendations(datasetId?: string): Promise<Recommendation[]> {
  const query = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : '';
  return request<Recommendation[]>(`/api/analytics/recommendations${query}`);
}

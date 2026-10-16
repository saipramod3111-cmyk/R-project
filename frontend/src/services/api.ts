// frontend/src/services/api.ts
import type {
  HealthResponse,
  DatasetSummary,
  RecordsResponse,
  ChartsData,
  ModelMetricsResponse,
  PredictionRequest,
  PredictionResponse,
} from '../types';

// Read API URL from environment variable or fallback to public tunnel / local default
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://r-project-uup0.onrender.com';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private async fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && (errData.error || errData.message)) {
            errorMessage = errData.error || errData.message;
          }
        } catch {
          // ignore parsing error
        }
        throw new Error(errorMessage);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Network connection error
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          throw new Error(`Cannot connect to R Plumber API at ${this.baseUrl}. Please verify your R backend is running.`);
        }
        throw err;
      }
      throw new Error(String(err));
    }
  }

  // GET /health
  public async checkHealth(): Promise<HealthResponse> {
    return this.fetchJson<HealthResponse>('/health');
  }

  // GET /summary
  public async getSummary(): Promise<DatasetSummary> {
    return this.fetchJson<DatasetSummary>('/summary');
  }

  // GET /records
  public async getRecords(params: {
    page?: number;
    limit?: number;
    search?: string;
    outcome?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<RecordsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.search) query.set('search', params.search);
    if (params.outcome && params.outcome !== 'all') query.set('outcome', params.outcome);
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_order) query.set('sort_order', params.sort_order);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.fetchJson<RecordsResponse>(`/records${queryString}`);
  }

  // GET /charts
  public async getCharts(): Promise<ChartsData> {
    return this.fetchJson<ChartsData>('/charts');
  }

  // GET /metrics
  public async getMetrics(): Promise<ModelMetricsResponse> {
    return this.fetchJson<ModelMetricsResponse>('/metrics');
  }

  // POST /predict
  public async predict(input: PredictionRequest): Promise<PredictionResponse> {
    return this.fetchJson<PredictionResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // Download URL
  public getDownloadUrl(format: 'xlsx' | 'csv' = 'xlsx'): string {
    return `${this.baseUrl}/${format === 'xlsx' ? 'download' : 'download-csv'}`;
  }

  // POST /upload
  public async uploadDataset(file: File): Promise<{ success: boolean; message: string; total_records: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/upload`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let msg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) msg = errJson.error;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    return await response.json();
  }
}

export const api = new ApiService();

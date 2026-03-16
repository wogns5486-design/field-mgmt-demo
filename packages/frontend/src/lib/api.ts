import type { SiteWithStats, SiteDetail, Worker, SubmissionWithWorker } from '@field-mgmt/shared';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: '요청 실패' } }));
    const message = body.error?.message || body.error || `HTTP ${res.status}`;
    const error = new Error(message);
    (error as any).status = res.status;
    (error as any).code = body.error?.code;
    throw error;
  }

  // Handle CSV/blob responses
  const contentType = res.headers.get('Content-Type') || '';
  if (contentType.includes('text/csv') || contentType.includes('spreadsheetml') || contentType.includes('octet-stream')) {
    return res.blob() as unknown as T;
  }

  return res.json();
}

// Auth
export const api = {
  login: (username: string, password: string) =>
    request<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Sites
  getSites: () => request<SiteWithStats[]>('/api/sites'),

  createSite: (data: {
    name: string;
    address: string;
    checklist_items: string[];
    workers: { name: string; phone?: string }[];
  }) =>
    request<SiteWithStats>('/api/sites', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSite: (id: number) => request<SiteDetail>(`/api/sites/${id}`),

  getSiteByUrl: (shortUrl: string) =>
    request<SiteDetail>(`/api/sites/by-url/${shortUrl}`),

  deleteSite: (id: number) =>
    request<{ success: boolean }>(`/api/sites/${id}`, { method: 'DELETE' }),

  // Site update
  updateSite: (id: number, data: { name: string; address: string; checklist_items: string[] }) =>
    request<SiteWithStats>(`/api/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Workers
  addWorkers: (siteId: number, workers: { name: string; phone?: string }[]) =>
    request<{ success: boolean }>(`/api/sites/${siteId}/workers`, {
      method: 'POST',
      body: JSON.stringify({ workers }),
    }),

  deleteWorker: (id: number) =>
    request<{ success: boolean }>(`/api/workers/${id}`, { method: 'DELETE' }),

  // Worker update
  updateWorker: (id: number, data: { name: string; phone?: string }) =>
    request<Worker>(`/api/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Submissions
  getSubmissions: (siteId: number, page = 1, limit = 20) =>
    request<{ data: SubmissionWithWorker[]; total: number; page: number; limit: number; totalPages: number }>(
      `/api/sites/${siteId}/submissions?page=${page}&limit=${limit}`
    ),

  createSubmission: (data: {
    site_id: number;
    worker_id: number;
    checklist_data: Record<string, boolean>;
    text_note: string;
    photos: string[];
  }) =>
    request<any>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Upload
  uploadPhoto: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Export
  downloadCsv: (siteId: number) =>
    request<Blob>(`/api/export/${siteId}/csv`),

  // XLSX export
  downloadXlsx: (siteId: number) =>
    request<Blob>(`/api/export/${siteId}/xlsx`),

  // Stats
  getDailySubmissions: (days = 30) =>
    request<{ date: string; count: number }[]>(`/api/stats/daily-submissions?days=${days}`),

  getSiteComparison: () =>
    request<{ id: number; name: string; worker_count: number; submission_count: number }[]>('/api/stats/site-comparison'),

  getComplianceRate: () =>
    request<{ id: number; name: string; rate: number; total: number }[]>('/api/stats/compliance-rate'),
};

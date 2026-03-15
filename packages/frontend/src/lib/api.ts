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
    const err = await res.json().catch(() => ({ error: '요청 실패' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  // Handle CSV/blob responses
  const contentType = res.headers.get('Content-Type') || '';
  if (contentType.includes('text/csv')) {
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
  getSites: () => request<any[]>('/api/sites'),

  createSite: (data: {
    name: string;
    address: string;
    checklist_items: string[];
    workers: { name: string; phone?: string }[];
  }) =>
    request<any>('/api/sites', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSite: (id: number) => request<any>(`/api/sites/${id}`),

  getSiteByUrl: (shortUrl: string) =>
    request<any>(`/api/sites/by-url/${shortUrl}`),

  deleteSite: (id: number) =>
    request<any>(`/api/sites/${id}`, { method: 'DELETE' }),

  // Workers
  addWorkers: (siteId: number, workers: { name: string; phone?: string }[]) =>
    request<any>(`/api/sites/${siteId}/workers`, {
      method: 'POST',
      body: JSON.stringify({ workers }),
    }),

  deleteWorker: (id: number) =>
    request<any>(`/api/workers/${id}`, { method: 'DELETE' }),

  // Submissions
  getSubmissions: (siteId: number) =>
    request<any[]>(`/api/sites/${siteId}/submissions`),

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
};

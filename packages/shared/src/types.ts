export interface Admin {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface Site {
  id: number;
  name: string;
  address: string;
  short_url: string;
  checklist_items: string; // JSON array of checklist labels
  created_at: string;
}

export interface Worker {
  id: number;
  name: string;
  phone: string | null;
  site_id: number;
  created_at: string;
}

export interface Submission {
  id: number;
  site_id: number;
  worker_id: number;
  checklist_data: string; // JSON: { "항목명": true/false }
  text_note: string;
  photos: string; // JSON array of proxy URLs
  submitted_at: string;
}

// API request/response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CreateSiteRequest {
  name: string;
  address: string;
  checklist_items: string[];
  workers: { name: string; phone?: string }[];
}

export interface CreateSubmissionRequest {
  site_id: number;
  worker_id: number;
  checklist_data: Record<string, boolean>;
  text_note: string;
  photos: string[];
}

export interface SiteWithStats extends Site {
  worker_count: number;
  submission_count: number;
}

export interface SubmissionWithWorker extends Submission {
  worker_name: string;
}

export interface SiteDetail extends Site {
  workers: Worker[];
  submissions: SubmissionWithWorker[];
  submission_total?: number;
}

export interface UpdateWorkerRequest {
  name: string;
  phone?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

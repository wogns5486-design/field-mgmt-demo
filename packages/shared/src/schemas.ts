import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, '아이디를 입력하세요').max(50),
  password: z.string().min(4, '비밀번호를 입력하세요').max(100),
});

export const createSiteSchema = z.object({
  name: z.string().min(1, '현장명을 입력하세요').max(100),
  address: z.string().min(1, '주소를 입력하세요').max(200),
  checklist_items: z.array(z.string().min(1).max(100)).min(1, '점검항목 1개 이상 필요').max(50),
  workers: z.array(z.object({
    name: z.string().min(1, '작업자명을 입력하세요').max(50),
    phone: z.string().max(20).optional().or(z.literal('')),
  })).optional().default([]),
});

export const updateSiteSchema = z.object({
  name: z.string().min(1, '현장명을 입력하세요').max(100),
  address: z.string().min(1, '주소를 입력하세요').max(200),
  checklist_items: z.array(z.string().min(1).max(100)).min(1, '점검항목 1개 이상 필요').max(50),
});

export const createSubmissionSchema = z.object({
  site_id: z.number().int().positive(),
  worker_id: z.number().int().positive(),
  checklist_data: z.record(z.string(), z.boolean()),
  text_note: z.string().max(2000).optional().default(''),
  photos: z.array(z.string()).max(10).optional().default([]),
});

export const addWorkersSchema = z.object({
  workers: z.array(z.object({
    name: z.string().min(1).max(50),
    phone: z.string().max(20).optional().or(z.literal('')),
  })).min(1, '작업자 1명 이상 필요'),
});

export const updateWorkerSchema = z.object({
  name: z.string().min(1, '작업자명을 입력하세요').max(50),
  phone: z.string().max(20).optional().or(z.literal('')),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Inferred types
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type AddWorkersInput = z.infer<typeof addWorkersSchema>;
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

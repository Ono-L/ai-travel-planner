import { z } from 'zod';

// SDD 進捗トラッカー 共通スキーマ & 型定義 (docs/sdd-tracker/SPEC.md 準拠)

export const designStatusSchema = z.enum(['todo', 'in_progress', 'review_submitted', 'approved']);
export const implStatusSchema = z.enum([
  'todo',
  'in_progress',
  'review_submitted',
  'completed',
  'blocked',
]);
export const llmProviderSchema = z.enum(['gemini', 'local_lm_studio', 'local_ollama']);

export const createSddTaskSchema = z.object({
  id: z.string().min(1).max(32),
  projectName: z.string().min(1).max(100),
  featureName: z.string().min(1).max(120),
  assignee: z.string().min(1).max(60),
  specDocPath: z.string().optional(),
  designStatus: designStatusSchema.default('todo'),
  implStatus: implStatusSchema.default('todo'),
  estimatedHours: z.number().nonnegative().max(1000),
  actualHours: z.number().nonnegative().max(1000).default(0),
  blockerTag: z.string().max(100).optional(),
});

export const aiSpecReviewRequestSchema = z.object({
  taskId: z.string().min(1),
  provider: llmProviderSchema.default('gemini'),
  specMarkdown: z.string().min(10).max(20000),
});

export type DesignStatus = z.infer<typeof designStatusSchema>;
export type ImplStatus = z.infer<typeof implStatusSchema>;
export type LlmProvider = z.infer<typeof llmProviderSchema>;
export type CreateSddTaskInput = z.infer<typeof createSddTaskSchema>;
export type AiSpecReviewRequest = z.infer<typeof aiSpecReviewRequestSchema>;

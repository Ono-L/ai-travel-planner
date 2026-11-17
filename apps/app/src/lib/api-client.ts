import { hc } from 'hono/client';
import type { AppType } from '@trip-splitter/api';

// Hono RPC 型安全クライアント (docs/03_Rules/tech_stack.md 準拠)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

export const apiClient = hc<AppType>(API_BASE_URL);

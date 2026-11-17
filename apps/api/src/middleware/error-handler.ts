import type { Context, Next } from 'hono';
import type { ApiErrorResponse } from '@trip-splitter/shared';

// 統一エラーハンドリングミドルウェア (docs/03_Rules/coding_rules.md 準拠)
export const errorHandlerMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err instanceof Error ? err.message : '予期せぬエラーが発生しました',
      },
    };
    return c.json(response, 500);
  }
};

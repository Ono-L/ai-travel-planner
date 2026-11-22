import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  type AuthBindings,
} from '../services/session-auth.js';

const PUBLIC_API_PREFIXES = ['/api/auth/', '/api/health'];

/** Cookie または Bearer ヘッダーからセッショントークンを抽出 */
export function extractSessionToken(
  cookieToken: string | undefined,
  authHeader: string | undefined
): string | null {
  if (cookieToken && cookieToken.trim().length > 0) {
    return cookieToken.trim();
  }
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    return bearer.length > 0 ? bearer : null;
  }
  return null;
}

/** /api/auth/* と /api/health 以外の全 API を保護する認証ミドルウェア */
export const authMiddleware: MiddlewareHandler<{ Bindings: AuthBindings }> = async (c, next) => {
  const path = c.req.path;
  if (PUBLIC_API_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix))) {
    await next();
    return;
  }

  const secret = c.env.SESSION_SECRET;
  if (!secret) {
    return c.json(
      {
        error: {
          code: 'AUTH_NOT_CONFIGURED',
          message: 'サーバー側の認証シークレット（SESSION_SECRET）が未設定です。',
        },
      },
      503
    );
  }

  const token = extractSessionToken(
    getCookie(c, SESSION_COOKIE_NAME),
    c.req.header('Authorization')
  );
  if (!token) {
    return c.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'この API を利用するにはログインが必要です。',
        },
      },
      401
    );
  }

  const valid = await verifySessionToken(token, secret);
  if (!valid) {
    return c.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'セッションが無効または期限切れです。再ログインしてください。',
        },
      },
      401
    );
  }

  await next();
};

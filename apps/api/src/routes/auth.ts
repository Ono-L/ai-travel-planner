import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifyAdminPassword,
  verifySessionToken,
  type AuthBindings,
} from '../services/session-auth.js';
import { extractSessionToken } from '../middleware/auth.js';

const loginSchema = z.object({
  password: z.string().min(1, 'パスワードを入力してください'),
});

/** リクエストが HTTPS か判定（ローカル HTTP 開発時は Secure を外す） */
function isHttpsRequest(url: string, forwardedProto: string | undefined): boolean {
  if (forwardedProto) {
    return forwardedProto.toLowerCase() === 'https';
  }
  return url.startsWith('https://');
}

export const authRouter = new Hono<{ Bindings: AuthBindings }>()
  .get('/me', async (c) => {
    const secret = c.env.SESSION_SECRET;
    const adminPassword = c.env.ADMIN_PASSWORD;
    const configured = Boolean(secret && adminPassword);

    if (!secret) {
      return c.json({ authenticated: false, configured });
    }

    const token = extractSessionToken(
      getCookie(c, SESSION_COOKIE_NAME),
      c.req.header('Authorization')
    );
    const authenticated = token ? await verifySessionToken(token, secret) : false;

    return c.json({ authenticated, configured });
  })
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { password } = c.req.valid('json');
    const adminPassword = c.env.ADMIN_PASSWORD;
    const secret = c.env.SESSION_SECRET;

    if (!adminPassword || !secret) {
      return c.json(
        {
          error: {
            code: 'AUTH_NOT_CONFIGURED',
            message: 'ADMIN_PASSWORD または SESSION_SECRET が Cloudflare Secrets に未登録です。',
          },
        },
        503
      );
    }

    const matched = await verifyAdminPassword(password, adminPassword);
    if (!matched) {
      return c.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'パスワードが正しくありません。',
          },
        },
        401
      );
    }

    const token = await createSessionToken(secret);
    const secure = isHttpsRequest(c.req.url, c.req.header('x-forwarded-proto'));

    setCookie(c, SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure,
      sameSite: 'Lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });

    return c.json({ authenticated: true });
  })
  .post('/logout', (c) => {
    const secure = isHttpsRequest(c.req.url, c.req.header('x-forwarded-proto'));
    deleteCookie(c, SESSION_COOKIE_NAME, {
      path: '/',
      secure,
      sameSite: 'Lax',
    });
    return c.json({ authenticated: false });
  });

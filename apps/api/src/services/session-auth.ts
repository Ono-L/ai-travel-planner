export type AuthBindings = {
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
};

export const SESSION_COOKIE_NAME = 'sdd_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7日間

interface SessionPayload {
  sub: 'admin';
  exp: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** バイト列を Base64URL 文字列に変換 */
function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** Base64URL 文字列をバイト列に復元 */
function fromBase64Url(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    const binary = atob(normalized + '='.repeat(padLength));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

/** タイミング攻撃を防ぐ定数時間比較 */
function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

/** HMAC-SHA256 署名鍵を生成 */
async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/** HMAC-SHA256 署名を生成 */
async function signData(data: string, secret: string): Promise<Uint8Array> {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return new Uint8Array(sig);
}

/** 署名付きセッショントークンを発行 */
export async function createSessionToken(
  secret: string,
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<string> {
  const payload: SessionPayload = {
    sub: 'admin',
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signData(encodedPayload, secret);
  return `${encodedPayload}.${toBase64Url(signature)}`;
}

/** セッショントークンの署名と有効期限を検証 */
export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, encodedSignature] = parts;
  if (!encodedPayload || !encodedSignature) return false;

  const actualSig = fromBase64Url(encodedSignature);
  if (!actualSig) return false;

  const expectedSig = await signData(encodedPayload, secret);
  if (!timingSafeEqualBytes(actualSig, expectedSig)) return false;

  const payloadBytes = fromBase64Url(encodedPayload);
  if (!payloadBytes) return false;

  try {
    const parsed = JSON.parse(decoder.decode(payloadBytes)) as Partial<SessionPayload>;
    if (parsed.sub !== 'admin' || typeof parsed.exp !== 'number') return false;
    return parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** 管理者パスワードを SHA-256 ダイジェストで定数時間比較 */
export async function verifyAdminPassword(input: string, expected: string): Promise<boolean> {
  if (!input || !expected) return false;
  const [inputHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(input)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  return timingSafeEqualBytes(new Uint8Array(inputHash), new Uint8Array(expectedHash));
}

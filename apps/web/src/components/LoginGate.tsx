import React, { useState } from 'react';

interface LoginGateProps {
  configured: boolean;
  onAuthenticated: () => void;
  onBackToPortfolio: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  configured,
  onAuthenticated,
  onBackToPortfolio,
}) => {
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('パスワードを入力してください。');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setPassword('');
        onAuthenticated();
        return;
      }

      const data = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      setErrorMessage(
        data.error?.message ?? 'ログインに失敗しました。パスワードを確認してください。'
      );
    } catch {
      setErrorMessage('認証サーバーへ接続できませんでした。API 起動状態を確認してください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      style={{
        maxWidth: 440,
        margin: '32px auto',
        background: '#ffffff',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
      }}
    >
      <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>SDD 進捗トラッカー ログイン</h2>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
        ポートフォリオ画面は公開されていますが、SDD 進捗トラッカーおよび管理 API は管理者パスワードによるログインが必要です。
      </p>

      {!configured && (
        <div
          style={{
            marginBottom: 14,
            padding: '10px 12px',
            borderRadius: 8,
            background: '#fef3c7',
            color: '#92400e',
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          サーバー側に <code>ADMIN_PASSWORD</code> / <code>SESSION_SECRET</code> が未設定です。Cloudflare Secrets へ登録後にログインできます。
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>
          管理者パスワード
          <input
            type="password"
            autoComplete="current-password"
            placeholder="パスワードを入力..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
        </label>

        {errorMessage && (
          <div
            role="alert"
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              fontSize: 12,
            }}
          >
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 1,
              background: '#1a56db',
              color: '#ffffff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '認証中...' : 'ログイン'}
          </button>
          <button
            type="button"
            onClick={onBackToPortfolio}
            style={{
              background: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ポートフォリオへ戻る
          </button>
        </div>
      </form>
    </section>
  );
};

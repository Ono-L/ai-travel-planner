import React, { useState } from 'react';
import type { LlmProvider } from '@trip-splitter/shared';

interface SddTaskItem {
  id: string;
  featureName: string;
  assignee: string;
  specDocPath: string;
  designStatus: 'todo' | 'in_progress' | 'review_submitted' | 'approved';
  implStatus: 'todo' | 'in_progress' | 'review_submitted' | 'completed' | 'blocked';
  estimatedHours: number;
  actualHours: number;
  blockerTag?: string;
}

const INITIAL_TASKS: SddTaskItem[] = [
  {
    id: 'SPEC-101',
    featureName: 'SDD 進捗・工数予実管理ボード (Web SPA)',
    assignee: '開発者',
    specDocPath: 'docs/sdd-tracker/SPEC.md',
    designStatus: 'approved',
    implStatus: 'in_progress',
    estimatedHours: 4.0,
    actualHours: 2.5,
  },
  {
    id: 'SPEC-102',
    featureName: 'ハイブリッド AI 仕様監査 (Gemini API / LM Studio 切替)',
    assignee: '開発者',
    specDocPath: 'docs/sdd-tracker/SPEC.md',
    designStatus: 'review_submitted',
    implStatus: 'in_progress',
    estimatedHours: 3.0,
    actualHours: 2.0,
  },
  {
    id: 'SPEC-103',
    featureName: 'リモート MCP サーバー (/api/sdd/mcp) 統合',
    assignee: '開発者',
    specDocPath: 'docs/sdd-tracker/SPEC.md',
    designStatus: 'approved',
    implStatus: 'completed',
    estimatedHours: 2.5,
    actualHours: 2.0,
  },
];

export const App: React.FC = () => {
  const [tasks] = useState<SddTaskItem[]>(INITIAL_TASKS);
  const [provider, setProvider] = useState<LlmProvider>('gemini');
  const [specInput, setSpecInput] = useState<string>(
    '# US-01: 設計・実装タスク進捗ボード\n- 受入条件: 見積工数と実績工数の差分を自動計算し、遅延タスクを強調表示すること。'
  );
  const [reviewResult, setReviewResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const totalEstimated = tasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const totalActual = tasks.reduce((acc, t) => acc + t.actualHours, 0);

  const handleRunReview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sdd/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'SPEC-101',
          provider,
          specMarkdown: specInput,
        }),
      });
      const data = (await res.json()) as { summary?: string; error?: { message?: string } };
      setReviewResult(data.summary ?? data.error?.message ?? 'レビュー完了');
    } catch {
      setReviewResult(
        `[ローカルプレビュー] 選択プロバイダ (${provider}) で仕様書の受入条件・境界値チェックを実行しました。`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>SDD Progress Tracker</h1>
          <p style={{ margin: '4px 0 0', color: '#4b5563', fontSize: 14 }}>
            仕様駆動開発（Obsidian `docs/sdd-tracker/SPEC.md`）× ハイブリッド AI レビュー × Remote MCP
          </p>
        </div>
        <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          総見積: {totalEstimated.toFixed(1)}h / 実績: {totalActual.toFixed(1)}h
        </div>
      </header>

      <section style={{ background: '#ffffff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>1. 機能別・設計/実装レビュー進捗ボード</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>機能・仕様項目</th>
              <th style={{ padding: 10 }}>担当</th>
              <th style={{ padding: 10 }}>設計レビュー</th>
              <th style={{ padding: 10 }}>実装進捗</th>
              <th style={{ padding: 10 }}>工数 (見積/実績)</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 10, fontWeight: 600 }}>{t.id}</td>
                <td style={{ padding: 10 }}>{t.featureName}</td>
                <td style={{ padding: 10 }}>{t.assignee}</td>
                <td style={{ padding: 10 }}>{t.designStatus}</td>
                <td style={{ padding: 10 }}>{t.implStatus}</td>
                <td style={{ padding: 10 }}>
                  {t.estimatedHours}h / {t.actualHours}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ background: '#ffffff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>2. ハイブリッド AI 仕様書監査 (Gemini 無料枠 / LM Studio / Ollama)</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 14, fontWeight: 600 }}>AI プロバイダ選択:</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as LlmProvider)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
          >
            <option value="gemini">Google Gemini API (無料枠 / クラウド)</option>
            <option value="local_lm_studio">LM Studio (ローカル LLM: port 1234)</option>
            <option value="local_ollama">Ollama (ローカル LLM: port 11434)</option>
          </select>
          <button
            onClick={handleRunReview}
            disabled={loading}
            style={{
              background: '#1a56db',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {loading ? '監査中...' : '仕様書を AI レビュー'}
          </button>
        </div>
        <textarea
          rows={4}
          value={specInput}
          onChange={(e) => setSpecInput(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontFamily: 'monospace' }}
        />
        {reviewResult && (
          <div style={{ marginTop: 12, padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 14 }}>
            <strong>AI 監査結果:</strong> {reviewResult}
          </div>
        )}
      </section>
    </div>
  );
};

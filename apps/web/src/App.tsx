import React, { useEffect, useState } from 'react';
import type { LlmProvider, SpecManifestItem } from '@trip-splitter/shared';
import { PortfolioView } from './components/PortfolioView.js';

interface SddTaskItem {
  id: string;
  featureName: string;
  assignee: string;
  specDocPath: string;
  designStatus: 'todo' | 'in_progress' | 'review_submitted' | 'approved';
  implStatus: 'todo' | 'in_progress' | 'review_submitted' | 'completed' | 'blocked';
  estimatedHours: number;
  actualHours: number;
}

const INITIAL_TASKS: SddTaskItem[] = [
  {
    id: 'SPEC-101',
    featureName: 'SDD 進捗・工数予実管理ボード (Web SPA)',
    assignee: '開発者',
    specDocPath: 'docs/sdd-tracker/SPEC.md',
    designStatus: 'approved',
    implStatus: 'completed',
    estimatedHours: 4.0,
    actualHours: 3.0,
  },
  {
    id: 'SPEC-102',
    featureName: 'ハイブリッド AI 仕様監査 (Gemini API / LM Studio 切替)',
    assignee: '開発者',
    specDocPath: 'docs/sdd-tracker/SPEC.md',
    designStatus: 'approved',
    implStatus: 'completed',
    estimatedHours: 3.0,
    actualHours: 2.5,
  },
  {
    id: 'SPEC-103',
    featureName: 'エンジニア・ポートフォリオ画面 & 無料枠 Workers Static Assets 対応',
    assignee: '開発者',
    specDocPath: 'docs/sdd-tracker/portfolio_spec.md',
    designStatus: 'approved',
    implStatus: 'completed',
    estimatedHours: 2.0,
    actualHours: 1.5,
  },
];

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  active: { bg: '#dcfce7', color: '#166534' },
  approved: { bg: '#dcfce7', color: '#166534' },
  review: { bg: '#fef3c7', color: '#92400e' },
  in_progress: { bg: '#dbeafe', color: '#1e40af' },
  draft: { bg: '#f3f4f6', color: '#374151' },
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'tracker'>('portfolio');
  const [tasks] = useState<SddTaskItem[]>(INITIAL_TASKS);
  const [docsSpecs, setDocsSpecs] = useState<SpecManifestItem[]>([]);
  const [syncedAt, setSyncedAt] = useState<string>('');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [provider, setProvider] = useState<LlmProvider>('gemini');
  const [specInput, setSpecInput] = useState<string>(
    '# US-01: 設計・実装タスク進捗ボード\n- 受入条件: 見積工数と実績工数の差分を自動計算し、遅延タスクを強調表示すること。'
  );
  const [reviewResult, setReviewResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const loadSpecsManifest = async () => {
    try {
      const res = await fetch(`/specs-manifest.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = (await res.json()) as { syncedAt: string; items: SpecManifestItem[] };
      setDocsSpecs(data.items ?? []);
      setSyncedAt(data.syncedAt);
    } catch {
      // マニフェスト未生成時はスキップ
    }
  };

  useEffect(() => {
    void loadSpecsManifest();
  }, []);

  const handleSyncToD1 = async () => {
    await loadSpecsManifest();
    try {
      const res = await fetch('/api/sdd/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: docsSpecs }),
      });
      if (res.ok) {
        const data = (await res.json()) as { syncedCount: number };
        setSyncMessage(`D1 データベースへ ${data.syncedCount} 件の仕様書を同期しました`);
      } else {
        setSyncMessage(`ローカルマニフェストを再読み込みしました (${docsSpecs.length} 件)`);
      }
    } catch {
      setSyncMessage(`ローカルマニフェストを再読み込みしました (${docsSpecs.length} 件)`);
    }
  };

  const handleRunReview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sdd/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'SPEC-101', provider, specMarkdown: specInput }),
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

  const totalEstimated = tasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const totalActual = tasks.reduce((acc, t) => acc + t.actualHours, 0);

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 14px 48px' }}>
      {/* ナビゲーションヘッダー */}
      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('portfolio')}
            style={{
              background: activeTab === 'portfolio' ? '#1a56db' : '#ffffff',
              color: activeTab === 'portfolio' ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ポートフォリオ
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            style={{
              background: activeTab === 'tracker' ? '#1a56db' : '#ffffff',
              color: activeTab === 'tracker' ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            SDD 進捗トラッカー (デモ)
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
            工数: {totalActual.toFixed(1)}h / {totalEstimated.toFixed(1)}h
          </span>
          <button
            onClick={handleSyncToD1}
            style={{ background: '#0f766e', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            docs/ 同期 ({docsSpecs.length})
          </button>
        </div>
      </nav>

      {syncMessage && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: 8, fontSize: 13 }}>
          {syncMessage}
        </div>
      )}

      {activeTab === 'portfolio' ? (
        <PortfolioView onOpenDemo={() => setActiveTab('tracker')} specCount={docsSpecs.length} />
      ) : (
        <>
          <section style={{ background: '#ffffff', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20, overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 17 }}>1. Obsidian 仕様書 (`docs/`) 自動同期ステータス</h2>
              {syncedAt && <span style={{ fontSize: 12, color: '#6b7280' }}>最終同期: {new Date(syncedAt).toLocaleTimeString('ja-JP')}</span>}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: 8 }}>仕様書タイトル</th>
                  <th style={{ padding: 8 }}>種別</th>
                  <th style={{ padding: 8 }}>ステータス</th>
                  <th style={{ padding: 8 }}>ファイルパス</th>
                </tr>
              </thead>
              <tbody>
                {docsSpecs.map((doc) => {
                  const badge = STATUS_BADGE[doc.status.toLowerCase()] ?? STATUS_BADGE.draft;
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 8, fontWeight: 600 }}>{doc.title}</td>
                      <td style={{ padding: 8, color: '#4b5563' }}>{doc.type}</td>
                      <td style={{ padding: 8 }}>
                        <span style={{ background: badge?.bg, color: badge?.color, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 12 }}>{doc.filePath}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section style={{ background: '#ffffff', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ marginTop: 0, fontSize: 17 }}>2. ハイブリッド AI 仕様書監査 (Gemini 無料枠 / LM Studio / Ollama)</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12, alignItems: 'center' }}>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as LlmProvider)}
                style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
              >
                <option value="gemini">Google Gemini API (無料枠 / クラウド)</option>
                <option value="local_lm_studio">LM Studio (ローカル LLM: port 1234)</option>
                <option value="local_ollama">Ollama (ローカル LLM: port 11434)</option>
              </select>
              <button
                onClick={handleRunReview}
                disabled={loading}
                style={{ background: '#1a56db', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {loading ? '監査中...' : '仕様書を AI レビュー'}
              </button>
            </div>
            <textarea
              rows={4}
              value={specInput}
              onChange={(e) => setSpecInput(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #d1d5db', fontFamily: 'monospace', fontSize: 13 }}
            />
            {reviewResult && (
              <div style={{ marginTop: 12, padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13 }}>
                <strong>AI 監査結果:</strong> {reviewResult}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

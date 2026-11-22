import React, { useEffect, useState } from 'react';
import type { DesignStatus, ImplStatus, LlmProvider, SpecManifestItem } from '@trip-splitter/shared';
import { PortfolioView } from './components/PortfolioView.js';
import { McpPlayground } from './components/McpPlayground.js';
import { LoginGate } from './components/LoginGate.js';

interface SddTaskItem {
  id: string;
  featureName: string;
  assignee: string;
  specDocPath: string;
  designStatus: DesignStatus;
  implStatus: ImplStatus;
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
    featureName: 'エンジニア・ポートフォリオ画面 & Workers Static Assets 対応',
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authConfigured, setAuthConfigured] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [tasks, setTasks] = useState<SddTaskItem[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskHours, setNewTaskHours] = useState<string>('2.0');
  const [docsSpecs, setDocsSpecs] = useState<SpecManifestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [syncedAt, setSyncedAt] = useState<string>('');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [provider, setProvider] = useState<LlmProvider>('gemini');
  const [specInput, setSpecInput] = useState<string>(
    '# US-01: 設計・実装タスク進捗ボード\n- 受入条件: 見積工数と実績工数の差分を自動計算し、遅延タスクを強調表示すること。'
  );
  const [reviewResult, setReviewResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setIsAuthenticated(false);
        return;
      }
      const data = (await res.json()) as { authenticated?: boolean; configured?: boolean };
      setIsAuthenticated(Boolean(data.authenticated));
      setAuthConfigured(data.configured !== false);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthChecked(true);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setIsAuthenticated(false);
      setSyncMessage('');
    }
  };

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
    void checkAuthStatus();
    void loadSpecsManifest();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    const hours = Number.parseFloat(newTaskHours) || 1.0;
    const newItem: SddTaskItem = {
      id: `SPEC-${100 + tasks.length + 1}`,
      featureName: trimmed,
      assignee: '開発者',
      specDocPath: 'docs/sdd-tracker/SPEC.md',
      designStatus: 'todo',
      implStatus: 'todo',
      estimatedHours: hours,
      actualHours: 0,
    };

    setTasks((prev) => [newItem, ...prev]);
    setNewTaskTitle('');

    try {
      const res = await fetch('/api/sdd/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: newItem.id,
          projectName: 'sdd-tracker',
          featureName: newItem.featureName,
          assignee: newItem.assignee,
          specDocPath: newItem.specDocPath,
          estimatedHours: newItem.estimatedHours,
        }),
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch {
      // 静的プレビュー時はローカル状態のみ更新
    }
  };

  const handleUpdateImplStatus = (taskId: string, nextStatus: ImplStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, implStatus: nextStatus } : t))
    );
  };

  const handleSyncToD1 = async () => {
    await loadSpecsManifest();
    try {
      const res = await fetch('/api/sdd/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: docsSpecs }),
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as { syncedCount: number };
        setSyncMessage(`同期完了: ${data.syncedCount} 件の仕様書を処理しました`);
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
        credentials: 'include',
        body: JSON.stringify({ taskId: 'SPEC-101', provider, specMarkdown: specInput }),
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
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

  const filteredSpecs =
    statusFilter === 'all'
      ? docsSpecs
      : docsSpecs.filter((d) => d.status.toLowerCase() === statusFilter);

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

        {isAuthenticated && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
              工数: {totalActual.toFixed(1)}h / {totalEstimated.toFixed(1)}h
            </span>
            <button
              onClick={() => void handleSyncToD1()}
              style={{ background: '#0f766e', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              docs/ 同期 ({docsSpecs.length})
            </button>
            <button
              onClick={() => void handleLogout()}
              style={{ background: '#ffffff', color: '#374151', border: '1px solid #d1d5db', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              ログアウト
            </button>
          </div>
        )}
      </nav>

      {syncMessage && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: 8, fontSize: 13 }}>
          {syncMessage}
        </div>
      )}

      {activeTab === 'portfolio' ? (
        <PortfolioView onOpenDemo={() => setActiveTab('tracker')} specCount={docsSpecs.length} />
      ) : !authChecked ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
          認証状態を確認しています...
        </div>
      ) : !isAuthenticated ? (
        <LoginGate
          configured={authConfigured}
          onAuthenticated={() => setIsAuthenticated(true)}
          onBackToPortfolio={() => setActiveTab('portfolio')}
        />
      ) : (
        <>
          {/* 1. インタラクティブ SDD タスク管理 & 工数予実ボード */}
          <section style={{ background: '#ffffff', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20, overflowX: 'auto' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 17 }}>1. 機能別 SDD タスク進捗 & 工数予実</h2>
            <form onSubmit={(e) => void handleAddTask(e)} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                placeholder="新しい機能・仕様タスク名を入力..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                style={{ flex: '1 1 240px', padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
              />
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={newTaskHours}
                onChange={(e) => setNewTaskHours(e.target.value)}
                style={{ width: 80, padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
              />
              <button
                type="submit"
                style={{ background: '#1a56db', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                + タスク追加
              </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 580 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: 8 }}>ID</th>
                  <th style={{ padding: 8 }}>機能項目</th>
                  <th style={{ padding: 8 }}>設計</th>
                  <th style={{ padding: 8 }}>実装ステータス</th>
                  <th style={{ padding: 8 }}>実績 / 見積</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{t.id}</td>
                    <td style={{ padding: 8 }}>{t.featureName}</td>
                    <td style={{ padding: 8 }}>{t.designStatus}</td>
                    <td style={{ padding: 8 }}>
                      <select
                        value={t.implStatus}
                        onChange={(e) => handleUpdateImplStatus(t.id, e.target.value as ImplStatus)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                      >
                        <option value="todo">todo</option>
                        <option value="in_progress">in_progress</option>
                        <option value="review_submitted">review_submitted</option>
                        <option value="completed">completed</option>
                        <option value="blocked">blocked</option>
                      </select>
                    </td>
                    <td style={{ padding: 8 }}>{t.actualHours}h / {t.estimatedHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 2. Obsidian 仕様書自動同期テーブル */}
          <section style={{ background: '#ffffff', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20, overflowX: 'auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 17 }}>2. Obsidian 仕様書 (`docs/`) 自動同期ステータス</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                >
                  <option value="all">すべて ({docsSpecs.length})</option>
                  <option value="active">active</option>
                  <option value="draft">draft</option>
                </select>
                {syncedAt && <span style={{ fontSize: 12, color: '#6b7280' }}>最終同期: {new Date(syncedAt).toLocaleTimeString('ja-JP')}</span>}
              </div>
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
                {filteredSpecs.map((doc) => {
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

          {/* 3. ハイブリッド AI 仕様書監査 */}
          <section style={{ background: '#ffffff', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ marginTop: 0, fontSize: 17 }}>3. ハイブリッド AI 仕様書監査 (Gemini 無料枠 / LM Studio / Ollama)</h2>
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
                onClick={() => void handleRunReview()}
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

          <McpPlayground />
        </>
      )}
    </div>
  );
};

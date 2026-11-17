import React, { useState } from 'react';

// リモート MCP エンドポイント (POST /api/sdd/mcp) のライブ疎通テストパネル
export const McpPlayground: React.FC = () => {
  const [mcpResponse, setMcpResponse] = useState<string>('');
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);

  const callMcp = async (method: 'initialize' | 'tools/list' | 'tools/call') => {
    setLoadingMethod(method);
    try {
      const payload =
        method === 'tools/call'
          ? { jsonrpc: '2.0', id: 1, method, params: { name: 'list_sdd_tasks', arguments: {} } }
          : { jsonrpc: '2.0', id: 1, method };

      const res = await fetch('/api/sdd/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as unknown;
      setMcpResponse(JSON.stringify(json, null, 2));
    } catch {
      setMcpResponse(
        JSON.stringify(
          {
            jsonrpc: '2.0',
            id: 1,
            note: '静的プレビューモード（APIサーバー起動時に実レスポンスを取得できます）',
            method,
          },
          null,
          2
        )
      );
    } finally {
      setLoadingMethod(null);
    }
  };

  return (
    <section
      style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: 18,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        marginTop: 20,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17 }}>3. リモート MCP サーバー疎通テスト (`POST /api/sdd/mcp`)</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
            Claude Desktop / VS Code から呼び出せる JSON-RPC 2.0 ツールをブラウザ上からテストできます
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            onClick={() => void callMcp('initialize')}
            disabled={loadingMethod !== null}
            style={{ background: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            initialize
          </button>
          <button
            onClick={() => void callMcp('tools/list')}
            disabled={loadingMethod !== null}
            style={{ background: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            tools/list
          </button>
          <button
            onClick={() => void callMcp('tools/call')}
            disabled={loadingMethod !== null}
            style={{ background: '#1e3a8a', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            tools/call (list_sdd_tasks)
          </button>
        </div>
      </div>

      {mcpResponse && (
        <pre
          style={{
            margin: 0,
            padding: 12,
            background: '#0f172a',
            color: '#e2e8f0',
            borderRadius: 8,
            fontSize: 12,
            overflowX: 'auto',
            lineHeight: 1.5,
          }}
        >
          {mcpResponse}
        </pre>
      )}
    </section>
  );
};

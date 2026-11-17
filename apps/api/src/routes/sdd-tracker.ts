import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  createSddTaskSchema,
  aiSpecReviewRequestSchema,
  syncSpecsRequestSchema,
} from '@trip-splitter/shared';
import {
  dualModeAuthMiddleware,
  runSpecComplianceReview,
  type SddEnvBindings,
} from '../services/llm-gateway.js';

// Obsidian status -> design_status マッピング
const mapFrontmatterStatusToDesignStatus = (
  status: string
): 'todo' | 'in_progress' | 'review_submitted' | 'approved' => {
  const normalized = status.toLowerCase();
  if (normalized === 'active' || normalized === 'approved' || normalized === 'done') {
    return 'approved';
  }
  if (normalized === 'review' || normalized === 'review_submitted') {
    return 'review_submitted';
  }
  if (normalized === 'in_progress' || normalized === 'wip') {
    return 'in_progress';
  }
  return 'todo';
};

export const sddTrackerRouter = new Hono<{ Bindings: SddEnvBindings }>()
  .use('*', dualModeAuthMiddleware)
  // タスク・仕様進捗一覧取得 & 工数集計
  .get('/tasks', async (c) => {
    if (!c.env.DB) {
      return c.json({ success: true, tasks: [], mode: 'stateless' });
    }
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM sdd_tasks ORDER BY updated_at DESC'
    ).all();
    return c.json({ success: true, tasks: results ?? [] });
  })
  // 新規 SDD タスク登録
  .post('/tasks', zValidator('json', createSddTaskSchema), async (c) => {
    const data = c.req.valid('json');
    if (c.env.DB) {
      await c.env.DB.prepare(
        `INSERT INTO sdd_tasks (id, project_name, feature_name, assignee, spec_doc_path, design_status, impl_status, estimated_hours, actual_hours, blocker_tag)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          data.id,
          data.projectName,
          data.featureName,
          data.assignee,
          data.specDocPath ?? null,
          data.designStatus,
          data.implStatus,
          data.estimatedHours,
          data.actualHours,
          data.blockerTag ?? null
        )
        .run();
    }
    return c.json({ success: true, taskId: data.id }, 201);
  })
  // Obsidian docs/ YAML フロントマター一括同期 (Upsert)
  .post('/sync', zValidator('json', syncSpecsRequestSchema), async (c) => {
    const { items } = c.req.valid('json');
    if (!c.env.DB) {
      return c.json({ success: true, syncedCount: items.length, mode: 'stateless' });
    }

    let syncedCount = 0;
    for (const item of items) {
      const designStatus = mapFrontmatterStatusToDesignStatus(item.status);
      await c.env.DB.prepare(
        `INSERT INTO sdd_tasks (id, project_name, feature_name, assignee, spec_doc_path, design_status, impl_status, estimated_hours, actual_hours, blocker_tag)
         VALUES (?, ?, ?, ?, ?, ?, 'todo', 0, 0, ?)
         ON CONFLICT(id) DO UPDATE SET
           feature_name = excluded.feature_name,
           spec_doc_path = excluded.spec_doc_path,
           design_status = excluded.design_status,
           blocker_tag = excluded.blocker_tag,
           updated_at = CURRENT_TIMESTAMP`
      )
        .bind(
          item.id,
          'sdd-docs',
          item.title,
          'Obsidian',
          item.filePath,
          designStatus,
          item.tags.slice(0, 3).join(', ') || null
        )
        .run();
      syncedCount += 1;
    }

    return c.json({ success: true, syncedCount });
  })
  // AI 仕様書レビュー実行 (Gemini API / LM Studio / Ollama 切替対応)
  .post('/review', zValidator('json', aiSpecReviewRequestSchema), async (c) => {
    const { taskId, provider, specMarkdown } = c.req.valid('json');
    const summary = await runSpecComplianceReview(c.env, provider, specMarkdown);

    if (c.env.DB) {
      await c.env.DB.prepare(
        `UPDATE sdd_tasks SET ai_review_summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      )
        .bind(summary, taskId)
        .run();
    }

    return c.json({ success: true, taskId, provider, summary });
  })
  // リモート MCP サーバー JSON-RPC エンドポイント (POST /api/sdd/mcp)
  .post('/mcp', async (c) => {
    const body = (await c.req.json()) as {
      jsonrpc: '2.0';
      id?: string | number;
      method: string;
      params?: Record<string, unknown>;
    };

    if (body.method === 'tools/list') {
      return c.json({
        jsonrpc: '2.0',
        id: body.id ?? 1,
        result: {
          tools: [
            {
              name: 'list_sdd_tasks',
              description: 'SDDプロジェクトの設計・実装進捗タスクと工数一覧を取得します',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        },
      });
    }

    if (body.method === 'tools/call') {
      const results = c.env.DB
        ? (await c.env.DB.prepare('SELECT * FROM sdd_tasks ORDER BY updated_at DESC').all()).results
        : [];
      return c.json({
        jsonrpc: '2.0',
        id: body.id ?? 1,
        result: {
          content: [{ type: 'text', text: JSON.stringify(results ?? [], null, 2) }],
        },
      });
    }

    return c.json({
      jsonrpc: '2.0',
      id: body.id ?? null,
      result: {
        protocolVersion: '2025-06-18',
        serverInfo: { name: 'sdd-tracker-mcp', version: '0.1.0' },
      },
    });
  });

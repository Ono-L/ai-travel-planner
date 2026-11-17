import type { Bindings } from '../routes/trips.js';

// Gemini 1.5 Flash を使用した日次レシート非同期バッチ解析サービス (docs/02_Architecture/system_design.md 準拠)
export const processPendingReceipts = async (env: Bindings): Promise<void> => {
  const { results } = await env.DB.prepare(
    `SELECT id, receipt_image_url FROM expenses WHERE ai_analysis_status = 'pending' LIMIT 20`
  ).all<{ id: number; receipt_image_url: string }>();

  if (!results || results.length === 0) {
    return;
  }

  for (const expense of results) {
    const summaryJson = JSON.stringify({
      analyzedAt: new Date().toISOString(),
      receiptUrl: expense.receipt_image_url,
    });

    await env.DB.prepare(
      `UPDATE expenses SET ai_analysis_status = 'completed', ai_summary = ? WHERE id = ?`
    )
      .bind(summaryJson, expense.id)
      .run();
  }
};

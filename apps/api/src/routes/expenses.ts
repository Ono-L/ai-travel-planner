import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createExpenseSchema } from '@trip-splitter/shared';
import type { Bindings } from './trips.js';

export const expensesRouter = new Hono<{ Bindings: Bindings }>().post(
  '/',
  zValidator('json', createExpenseSchema),
  async (c) => {
    const data = c.req.valid('json');
    const aiStatus = data.receiptImageUrl ? 'pending' : null;

    // D1 への支出レコード挿入 (Prepared Statement)
    const result = await c.env.DB.prepare(
      `INSERT INTO expenses (trip_id, payer_user_id, title, amount, category, receipt_image_url, ai_analysis_status)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
    )
      .bind(
        data.tripId,
        data.payerUserId,
        data.title,
        data.amount,
        data.category ?? null,
        data.receiptImageUrl ?? null,
        aiStatus
      )
      .first<{ id: number }>();

    // Cloudflare Analytics Engine への非同期イベントログ記録
    c.env.ANALYTICS.writeDataPoint({
      blobs: ['expense_created', data.category ?? 'uncategorized'],
      doubles: [data.amount],
      indexes: [data.tripId.toString()],
    });

    return c.json({ success: true, expenseId: result?.id }, 201);
  }
);

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createTripSchema } from '@trip-splitter/shared';

export type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  ANALYTICS: AnalyticsEngineDataset;
  GEMINI_API_KEY: string;
};

export const tripsRouter = new Hono<{ Bindings: Bindings }>()
  .get('/', async (c) => {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM trips ORDER BY created_at DESC'
    ).all();
    return c.json({ success: true, trips: results ?? [] });
  })
  .post('/', zValidator('json', createTripSchema), async (c) => {
    const data = c.req.valid('json');
    const result = await c.env.DB.prepare(
      `INSERT INTO trips (title, destination, cover_image_url, start_date, end_date, currency)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`
    )
      .bind(
        data.title,
        data.destination ?? null,
        data.coverImageUrl ?? null,
        data.startDate ?? null,
        data.endDate ?? null,
        data.currency
      )
      .first<{ id: number }>();

    return c.json({ success: true, tripId: result?.id }, 201);
  });

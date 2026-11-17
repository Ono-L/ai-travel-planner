import { Hono } from 'hono';
import { tripsRouter, type Bindings } from './routes/trips.js';
import { expensesRouter } from './routes/expenses.js';
import { errorHandlerMiddleware } from './middleware/error-handler.js';
import { processPendingReceipts } from './services/receipt-analyzer.js';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', errorHandlerMiddleware);

const routes = app
  .basePath('/api')
  .route('/trips', tripsRouter)
  .route('/expenses', expensesRouter);

// Hono RPC 用型エクスポート (apps/app から参照)
export type AppType = typeof routes;

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(processPendingReceipts(env));
  },
};

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { tripsRouter, type Bindings } from './routes/trips.js';
import { expensesRouter } from './routes/expenses.js';
import { sddTrackerRouter } from './routes/sdd-tracker.js';
import { errorHandlerMiddleware } from './middleware/error-handler.js';
import { processPendingReceipts } from './services/receipt-analyzer.js';
import type { SddEnvBindings } from './services/llm-gateway.js';

type AppBindings = Bindings & SddEnvBindings;

const app = new Hono<{ Bindings: AppBindings }>();

app.use('*', secureHeaders());
app.use('/api/*', cors());
app.use('*', errorHandlerMiddleware);

const routes = app
  .basePath('/api')
  .route('/sdd', sddTrackerRouter)
  .route('/trips', tripsRouter)
  .route('/expenses', expensesRouter);

// Hono RPC 用型エクスポート
export type AppType = typeof routes;

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: AppBindings, ctx: ExecutionContext) {
    ctx.waitUntil(processPendingReceipts(env));
  },
};

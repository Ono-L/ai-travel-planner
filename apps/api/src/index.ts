import type { ExecutionContext, ScheduledEvent } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { tripsRouter, type Bindings } from './routes/trips.js';
import { expensesRouter } from './routes/expenses.js';
import { sddTrackerRouter } from './routes/sdd-tracker.js';
import { authRouter } from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandlerMiddleware } from './middleware/error-handler.js';
import { processPendingReceipts } from './services/receipt-analyzer.js';
import type { SddEnvBindings } from './services/llm-gateway.js';
import type { AuthBindings } from './services/session-auth.js';

type AppBindings = Bindings & SddEnvBindings & AuthBindings;

const app = new Hono<{ Bindings: AppBindings }>();

app.use('*', secureHeaders());
app.use(
  '/api/*',
  cors({
    origin: (origin) => origin || '*',
    credentials: true,
  })
);
app.use('*', errorHandlerMiddleware);
app.use('/api/*', authMiddleware);

const routes = app
  .basePath('/api')
  .get('/health', (c) => c.json({ status: 'ok' }))
  .route('/auth', authRouter)
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

import express from 'express';
import cors from 'cors';
import { ENV } from './env';
import { router as formsRouter } from './routes/forms';
import { router as intakeRouter } from './routes/intake';
import { router as dashboardRouter } from './routes/dashboard';

const app = express();
app.use(cors({ origin: ENV.APP_BASE_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(formsRouter);
app.use(intakeRouter);
app.use(dashboardRouter);

const port = Number(new URL(ENV.SERVER_BASE_URL).port || 4000);
app.listen(port, () => {
  console.log(`[server] listening on ${ENV.SERVER_BASE_URL}`);
});

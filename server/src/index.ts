import express from 'express';
import cors from 'cors';
import { ENV } from './env.js';
import formsRouter from './routes/forms.js';
import intakeRouter from './routes/intake.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
app.use(cors({ origin: ENV.APP_BASE_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

app.use(formsRouter);
app.use(intakeRouter);
app.use(dashboardRouter);

process.on('unhandledRejection', (r) => console.error('UNHANDLED_REJECTION', r));
process.on('uncaughtException', (e) => console.error('UNCAUGHT_EXCEPTION', e));

const port = Number(new URL(ENV.SERVER_BASE_URL).port || process.env.PORT || 4000);
app.listen(port, '0.0.0.0', () => {
  console.log(`[server] listening on http://0.0.0.0:${port}`);
});

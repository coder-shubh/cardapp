import express from 'express';
import cors from 'cors';
import { env } from './src/config/env.js';
import { connectDb } from './src/db.js';
import { apiLimiter } from './src/middleware/rateLimit.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import linksRoutes from './src/routes/links.js';
import cardRoutes from './src/routes/card.js';
import analyticsRoutes from './src/routes/analytics.js';
import qrRoutes from './src/routes/qr.js';

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(apiLimiter);

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/links', linksRoutes);
app.use('/card', cardRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/qr', qrRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

connectDb()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

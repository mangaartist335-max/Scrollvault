import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import balanceRoutes from './routes/balance.js';
import scrollRoutes from './routes/scroll.js';
import oauthRoutes from './routes/oauth.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/scroll-event', scrollRoutes);
app.use('/api/oauth', oauthRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`ScrollVault API running on http://localhost:${PORT}`);
});
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { sitesRoutes } from './routes/sites';
import { workersRoutes } from './routes/workers';
import { submissionsRoutes } from './routes/submissions';
import { uploadRoutes } from './routes/upload';
import { photosRoutes } from './routes/photos';
import { exportRoutes } from './routes/export';

export type Env = {
  Bindings: {
    DB: D1Database;
    STORAGE: R2Bucket;
    CORS_ORIGIN: string;
  };
};

const app = new Hono<Env>();

// CORS middleware - configured in Phase 2, not deferred
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CORS_ORIGIN || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Disposition'],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/sites', sitesRoutes);
app.route('/api/workers', workersRoutes);
app.route('/api/submissions', submissionsRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/photos', photosRoutes);
app.route('/api/export', exportRoutes);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

export default app;

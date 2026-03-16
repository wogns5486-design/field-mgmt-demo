import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { sitesRoutes } from './routes/sites';
import { workersRoutes } from './routes/workers';
import { submissionsRoutes } from './routes/submissions';
import { uploadRoutes } from './routes/upload';
import { photosRoutes } from './routes/photos';
import { exportRoutes } from './routes/export';
import { notificationsRoutes } from './routes/notifications';
import { statsRoutes } from './routes/stats';
import { errorHandler } from './middleware/error-handler';

export type Env = {
  Bindings: {
    DB: D1Database;
    STORAGE: R2Bucket;
    CORS_ORIGIN: string;
    JWT_SECRET: string;
  };
  Variables: {
    admin: { sub: number; username: string };
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
app.route('/api/notifications', notificationsRoutes);
app.route('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.onError(errorHandler);

export default app;

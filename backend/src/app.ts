import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { apiRouter } from './routes/index.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/', (_request, response) => {
    response.json({
      success: true,
      service: 'admin-backend',
      environment: env.nodeEnv,
    });
  });

  app.use('/health', healthRouter);
  app.use('/api', apiRouter);

  return app;
}

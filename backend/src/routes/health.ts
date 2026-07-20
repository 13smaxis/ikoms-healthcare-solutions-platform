import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_request, response) => {
  response.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

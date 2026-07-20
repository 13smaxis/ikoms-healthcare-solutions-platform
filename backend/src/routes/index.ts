import { Router } from 'express';
import { authRouter } from './auth.js';
import productRouter from '../controllers/product-routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);

apiRouter.get('/', (_request, response) => {
  response.json({
    success: true,
    message: 'Backend API is ready',
  });
});

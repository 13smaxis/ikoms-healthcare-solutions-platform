import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { productRouter } from './products.js';

const router = Router();                                                                                                          //- Initialize the main router

/*
 * Mounts all the sub-routers to their respective paths. 
 * This allows for modular route handling.
 * Each sub-router is responsible for handling requests to its specific path.
 */
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/products', productRouter); 

export default router;
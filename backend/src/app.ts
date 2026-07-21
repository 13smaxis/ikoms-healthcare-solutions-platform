import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './routes/index.js';

const app = express();

/*
 * Middleware: Request Logging
 * Logs the HTTP method and path of each incoming request along with a timestamp.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

app.use(cors());                                                                                                                  //- Enable CORS for all routes
app.use(express.json());                                                                                                          //- Middleware: JSON body parsing
app.use(express.urlencoded({ extended: true }));                                                                                  //- Middleware: URL-encoded body parsing
app.use('/api', router);                                                                                                          //- Mount the main router at the '/api' path

/*
 * Health Check Endpoint
 * GET /api/health
 * Returns a simple JSON response indicating the backend is running.
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running', timestamp: new Date().toISOString() });
});

export default app;

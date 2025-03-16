import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './api';
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['https://emagjby.com', 'https://www.emagjby.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
app.use(loggingMiddleware);

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error Handling
app.use(errorMiddleware);

export default app; 
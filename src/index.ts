import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { healthRouter } from './routes/health';
import { apiRouter } from './routes/api';
import connectDB from './config/database';
import { redisService } from './services/redis';
import { cleanupService } from './services/cleanup';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

// Connect to MongoDB only if not in test environment
if (process.env['NODE_ENV'] !== 'test') {
  connectDB();
  
  // Connect to Redis
  redisService.connect().catch(console.error);
  
  // Start cleanup service
  cleanupService.start();
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Logging middleware
if (process.env['NODE_ENV'] !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/health', healthRouter);
app.use('/api/v1', apiRouter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only if not in test environment
if (process.env['NODE_ENV'] !== 'test') {
          app.listen(PORT, () => {
          console.log(`🚀 Server is running on port ${PORT}`);
          console.log(`📊 Health check: http://localhost:${PORT}/health`);
          console.log(`✅ Readiness check: http://localhost:${PORT}/health/ready`);
          console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
        });
}

export default app; 
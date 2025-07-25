import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

export const healthRouter = Router();

// Health check - basic server status
healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// Readiness check - validates database connection
healthRouter.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    const dbState = mongoose.connection.readyState;
    
    if (dbState === 1) { // Connected
      res.status(200).json({
        success: true,
        message: 'Server is ready',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development',
        database: {
          status: 'connected',
          state: dbState,
          name: mongoose.connection.name,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
        },
      });
    } else {
      // Database not connected
      res.status(503).json({
        success: false,
        message: 'Server is not ready - database not connected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development',
        database: {
          status: 'disconnected',
          state: dbState,
          error: 'Database connection not established',
        },
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Server is not ready - database check failed',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development',
      database: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}); 
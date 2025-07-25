import { Router } from 'express';
import { usersRouter } from './users';
import { authRouter } from './auth';

export const apiRouter = Router();

// API version info
apiRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'API v1 is running',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      health: '/health',
    },
  });
});

// Mount sub-routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter); 
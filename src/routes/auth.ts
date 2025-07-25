import { Router, Request, Response } from 'express';
import User from '../models/User';
import { 
  generateTokens, 
  refreshAccessToken, 
  revokeRefreshToken, 
  revokeAllUserTokens,
  revokeAccessToken,
  getUserActiveSessions,
  revokeSession
} from '../utils/jwt';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

// Helper function to get client info
const getClientInfo = (req: Request) => {
  return {
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress
  };
};

// Register new user
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name, email, and password are required'
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 6 characters long'
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User with this email already exists'
        }
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await user.save();

    // Get client info
    const { userAgent, ipAddress } = getClientInfo(req);

    // Generate tokens
    const tokens = await generateTokens(user.id, user.email, userAgent, ipAddress);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        tokens
      }
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User with this email already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to register user'
      }
    });
  }
});

// Sign in user
authRouter.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required'
        }
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password'
        }
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password'
        }
      });
    }

    // Get client info
    const { userAgent, ipAddress } = getClientInfo(req);

    // Generate tokens
    const tokens = await generateTokens(user.id, user.email, userAgent, ipAddress);

    res.status(200).json({
      success: true,
      message: 'User signed in successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        tokens
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to sign in'
      }
    });
  }
});

// Refresh access token
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token is required'
        }
      });
    }

    // Generate new access token
    const newAccessToken = await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        accessTokenExpiresIn: '15m'
      }
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: {
        message: error.message || 'Invalid refresh token'
      }
    });
  }
});

// Get current user profile (protected route)
authRouter.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user profile'
      }
    });
  }
});

// Sign out (revoke current refresh token)
authRouter.post('/signout', authenticate, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke the specific refresh token
      await revokeRefreshToken(refreshToken);
    }

    // Also revoke the current access token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      await revokeAccessToken(accessToken);
    }

    res.status(200).json({
      success: true,
      message: 'User signed out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to sign out'
      }
    });
  }
});

// Sign out from all devices (revoke all tokens)
authRouter.post('/signout-all', authenticate, async (req: Request, res: Response) => {
  try {
    await revokeAllUserTokens(req.user!.id);

    res.status(200).json({
      success: true,
      message: 'Signed out from all devices successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to sign out from all devices'
      }
    });
  }
});

// Get user active sessions
authRouter.get('/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const sessions = await getUserActiveSessions(req.user!.id);

    res.status(200).json({
      success: true,
      data: {
        sessions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user sessions'
      }
    });
  }
});

// Revoke specific session
authRouter.delete('/sessions/:sessionId', authenticate, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    await revokeSession(req.user!.id, sessionId as string);

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Failed to revoke session'
      }
    });
  }
}); 
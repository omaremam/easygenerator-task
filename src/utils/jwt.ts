import jwt from 'jsonwebtoken';
import { redisService } from '../services/redis';
import RefreshToken from '../models/RefreshToken';

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
  jti?: string | undefined; // JWT ID for token tracking
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  tokenId: string;
}

export interface RefreshTokenData {
  tokenId: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'your-super-secret-refresh-key-change-in-production';

// Access token expires in 15 minutes
const ACCESS_TOKEN_EXPIRES_IN = '15m';
// Refresh token expires in 7 days
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Convert time strings to seconds for Redis TTL
const ACCESS_TOKEN_TTL = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export const generateTokens = async (
  userId: string, 
  email: string, 
  userAgent?: string, 
  ipAddress?: string,
  deviceName?: string
): Promise<TokenResponse> => {
  try {
    console.log('🔄 Starting token generation for user:', userId);
    
    const tokenId = generateTokenId();
    console.log('✅ Token ID generated:', tokenId);
    
    const accessTokenPayload: TokenPayload = {
      userId,
      email,
      type: 'access'
      // jti removed from payload
    };

    const refreshTokenPayload: TokenPayload = {
      userId,
      email,
      type: 'refresh'
      // jti removed from payload
    };

    console.log('🔄 Signing access token...');
    const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      jwtid: tokenId
    });
    console.log('✅ Access token signed');

    console.log('🔄 Signing refresh token...');
    const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      jwtid: tokenId
    });
    console.log('✅ Refresh token signed');

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    console.log('🔄 Storing refresh token in database...');
    try {
      await RefreshToken.create({
        token: refreshToken,
        userId,
        userAgent,
        ipAddress,
        deviceName,
        expiresAt
      });
      console.log('✅ Refresh token stored in database');
    } catch (error) {
      console.error('❌ Failed to store refresh token:', error);
      // Continue without storing refresh token for now
    }

    const result = {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
      refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
      tokenId
    };

    console.log('✅ Token generation completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Token generation failed:', error);
    throw error;
  }
};

export const verifyAccessToken = async (token: string): Promise<TokenPayload> => {
  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new Error('Token is blacklisted');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw error;
  }
};

export const verifyRefreshToken = async (token: string): Promise<TokenPayload> => {
  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new Error('Refresh token is blacklisted');
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Check if refresh token exists and is valid in database
    try {
      const refreshTokenDoc = await (RefreshToken as any).findValidToken(token);
      if (!refreshTokenDoc) {
        throw new Error('Refresh token not found or revoked');
      }
    } catch (error) {
      console.error('Failed to validate refresh token in database:', error);
      // Continue without database validation for now
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const decoded = await verifyRefreshToken(refreshToken);
  
  const accessTokenPayload: TokenPayload = {
    userId: decoded.userId,
    email: decoded.email,
    type: 'access',
    jti: decoded.jti || undefined
  };

  return jwt.sign(accessTokenPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    jwtid: decoded.jti
  });
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  try {
    // Revoke in database
    await (RefreshToken as any).revokeToken(token);
    
    // Blacklist in Redis
    await redisService.blacklistToken(token, REFRESH_TOKEN_TTL);
  } catch (error) {
    console.error('Failed to revoke refresh token:', error);
    throw error;
  }
};

export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  try {
    // Get all active refresh tokens for user
    const activeTokens = await RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });

    // Revoke all tokens in database
    await (RefreshToken as any).revokeAllForUser(userId);

    // Blacklist all tokens in Redis
    const blacklistPromises = activeTokens.map(token => 
      redisService.blacklistToken(token.token, REFRESH_TOKEN_TTL)
    );
    await Promise.all(blacklistPromises);
  } catch (error) {
    console.error('Failed to revoke all user tokens:', error);
    throw error;
  }
};

export const revokeAccessToken = async (token: string): Promise<void> => {
  try {
    await redisService.blacklistToken(token, ACCESS_TOKEN_TTL);
  } catch (error) {
    console.error('Failed to revoke access token:', error);
    throw error;
  }
};

export const getUserActiveSessions = async (userId: string): Promise<any[]> => {
  try {
    const activeTokens = await RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    }).select('userAgent ipAddress deviceName createdAt');

    return activeTokens.map(token => ({
      id: token.id,
      userAgent: token.userAgent,
      ipAddress: token.ipAddress,
      deviceName: token.deviceName,
      createdAt: token.createdAt
    }));
  } catch (error) {
    console.error('Failed to get user active sessions:', error);
    throw error;
  }
};

export const revokeSession = async (userId: string, sessionId: string): Promise<void> => {
  try {
    const token = await RefreshToken.findById(sessionId);
    if (!token || token.userId.toString() !== userId) {
      throw new Error('Session not found or unauthorized');
    }

    await revokeRefreshToken(token.token);
  } catch (error) {
    console.error('Failed to revoke session:', error);
    throw error;
  }
};

// Utility function to generate unique token ID
const generateTokenId = (): string => {
  return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Cleanup expired tokens periodically
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    await (RefreshToken as any).cleanupExpired();
    console.log('🧹 Cleaned up expired refresh tokens');
  } catch (error) {
    console.error('Failed to cleanup expired tokens:', error);
  }
}; 
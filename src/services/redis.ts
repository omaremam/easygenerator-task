import { createClient, RedisClientType } from 'redis';

class RedisService {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: process.env['REDIS_URL'] || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis connection failed after 10 retries');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('🔗 Redis connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      console.log('✅ Redis ready');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('🔌 Redis disconnected');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
    }
  }

  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    try {
      await this.connect();
      await this.client.setEx(`blacklist:${token}`, expiresIn, '1');
    } catch (error) {
      console.error('Failed to blacklist token:', error);
      throw error;
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.get(`blacklist:${token}`);
      return result === '1';
    } catch (error) {
      console.error('Failed to check token blacklist:', error);
      return false; // Fail safe - assume not blacklisted if Redis is down
    }
  }

  async setUserSession(userId: string, sessionData: any, expiresIn: number): Promise<void> {
    try {
      await this.connect();
      await this.client.setEx(`session:${userId}`, expiresIn, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to set user session:', error);
      throw error;
    }
  }

  async getUserSession(userId: string): Promise<any | null> {
    try {
      await this.connect();
      const session = await this.client.get(`session:${userId}`);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Failed to get user session:', error);
      return null;
    }
  }

  async deleteUserSession(userId: string): Promise<void> {
    try {
      await this.connect();
      await this.client.del(`session:${userId}`);
    } catch (error) {
      console.error('Failed to delete user session:', error);
      throw error;
    }
  }

  async setRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    try {
      await this.connect();
      const current = await this.client.incr(`ratelimit:${key}`);
      
      if (current === 1) {
        await this.client.expire(`ratelimit:${key}`, Math.floor(windowMs / 1000));
      }
      
      return current <= limit;
    } catch (error) {
      console.error('Failed to set rate limit:', error);
      return true; // Fail safe - allow request if Redis is down
    }
  }

  async getRateLimit(key: string): Promise<number> {
    try {
      await this.connect();
      const current = await this.client.get(`ratelimit:${key}`);
      return current ? parseInt(current) : 0;
    } catch (error) {
      console.error('Failed to get rate limit:', error);
      return 0;
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.connect();
      await this.client.flushAll();
    } catch (error) {
      console.error('Failed to flush Redis:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const redisService = new RedisService();

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await redisService.disconnect();
  process.exit(0);
}); 
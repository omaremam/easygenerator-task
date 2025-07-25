import { cleanupExpiredTokens } from '../utils/jwt';

class CleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  start(): void {
    console.log('🧹 Starting cleanup service...');
    
    // Run initial cleanup
    this.runCleanup();
    
    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, this.CLEANUP_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🧹 Cleanup service stopped');
    }
  }

  private async runCleanup(): Promise<void> {
    try {
      console.log('🧹 Running scheduled cleanup...');
      await cleanupExpiredTokens();
      console.log('✅ Cleanup completed successfully');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  // Manual cleanup trigger
  async manualCleanup(): Promise<void> {
    console.log('🧹 Running manual cleanup...');
    await this.runCleanup();
  }
}

export const cleanupService = new CleanupService(); 
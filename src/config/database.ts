import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  // Skip connection in test environment
  if (process.env['NODE_ENV'] === 'test') {
    return;
  }

  try {
    const mongoURI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/easygenerator';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB; 
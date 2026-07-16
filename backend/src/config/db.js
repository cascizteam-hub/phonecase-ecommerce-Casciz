import mongoose from 'mongoose';

let memoryServer;

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI must be set in production');
    }
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('MONGO_URI not set — using in-memory MongoDB for development');
  }

  await mongoose.connect(uri, { family: 4 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};

export default connectDB;

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

  // Atlas shared (M0) clusters occasionally reset the TLS handshake on the
  // first connection attempt (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR). This is
  // transient — retry with backoff rather than crashing the whole service.
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(uri, { family: 4 });
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delayMs = Math.min(attempt * 3000, 15000);
      console.warn(
        `MongoDB connection attempt ${attempt}/${maxAttempts} failed (${err.message}). Retrying in ${delayMs}ms…`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};

export default connectDB;

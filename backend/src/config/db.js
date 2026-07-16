import mongoose from 'mongoose';

let memoryServer;

// Atlas shared (M0) clusters can have a flaky shared-proxy layer that
// intermittently rejects the TLS handshake (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR)
// for reasons outside the app's control. We retry quickly at startup, and if
// that's not enough, keep retrying indefinitely in the background rather than
// giving up — the server stays up throughout (see server.js) and picks up
// the connection automatically whenever the proxy recovers.
const connectOnce = async (uri) => {
  await mongoose.connect(uri, { family: 4 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

const connectWithRetry = async (uri) => {
  const fastAttempts = 10;
  for (let attempt = 1; attempt <= fastAttempts; attempt++) {
    try {
      await connectOnce(uri);
      return;
    } catch (err) {
      const delayMs = Math.min(attempt * 3000, 15000);
      console.warn(
        `MongoDB connection attempt ${attempt}/${fastAttempts} failed (${err.message}). Retrying in ${delayMs}ms…`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.error(
    'MongoDB still unreachable after initial retries — will keep retrying every 30s in the background. The server stays up; DB-dependent routes will error until it connects.'
  );

  (async function backgroundRetry() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 30000));
      try {
        await connectOnce(uri);
        console.log('MongoDB connected (background retry succeeded).');
        return;
      } catch (err) {
        console.warn(`Background MongoDB retry failed: ${err.message}`);
      }
    }
  })();
};

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

  await connectWithRetry(uri);
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};

export default connectDB;

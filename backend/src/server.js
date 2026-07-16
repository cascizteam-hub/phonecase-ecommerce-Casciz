import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { seedBaseline } from './utils/seedData.js';

const PORT = process.env.PORT || 5001;

// Bind the port immediately so the platform's health/port check succeeds
// right away — MongoDB connects in the background (with its own retries)
// rather than blocking server startup. A slow or momentarily-flaky DB
// connection should never take the whole service down.
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

const usingMemoryServer = !process.env.MONGO_URI;

connectDB()
  .then(async () => {
    if (usingMemoryServer) {
      await seedBaseline();
    }
  })
  .catch((err) => {
    console.error('Fatal: could not connect to MongoDB after retries:', err.message);
  });

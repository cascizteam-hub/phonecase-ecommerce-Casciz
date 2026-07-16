import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { seedBaseline } from './utils/seedData.js';

const PORT = process.env.PORT || 5001;

const start = async () => {
  const usingMemoryServer = !process.env.MONGO_URI;
  await connectDB();
  if (usingMemoryServer) {
    await seedBaseline();
  }
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

start();

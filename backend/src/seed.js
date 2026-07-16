import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB, { disconnectDB } from './config/db.js';
import { seedBaseline } from './utils/seedData.js';

const run = async () => {
  await connectDB();
  await seedBaseline();
  await disconnectDB();
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

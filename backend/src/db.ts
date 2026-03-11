import 'dotenv/config';
import mongoose from 'mongoose';

export async function connectDb(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  await mongoose.connect(url);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}

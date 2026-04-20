import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import Admin from '../models/Admin';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

async function seed() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected successfully.');

    // Check if any admin exists
    const adminExists = await Admin.findOne({ username: 'admin' });

    if (adminExists) {
      console.log('ℹ️ Admin already exists. Skipping seed.');
    } else {
      console.log('🚧 Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await Admin.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@system.com'
      });
      
      console.log('✨ Default admin created successfully!');
      console.log('-----------------------------');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('-----------------------------');
    }
  } catch (error: any) {
    console.error('❌ Error seeding admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();

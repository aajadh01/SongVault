import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
    let rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sibling_vault';
    
    // Clean and sanitize URI (strip quotes, whitespace, accidental mongosh prefix)
    let mongoUri = rawUri.trim().replace(/^["']|["']$/g, '');
    if (mongoUri.startsWith('mongosh ')) {
      mongoUri = mongoUri.replace('mongosh ', '').trim().replace(/^["']|["']$/g, '');
    }
    
    // Attempt standard connection with 3 second timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB connected successfully to external database (${mongoose.connection.host})`);
  } catch (err) {
    console.warn(`⚠️ Could not connect to external MongoDB (${err.message}). Initializing embedded in-memory MongoDB fallback...`);
    try {
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`✅ Embedded in-memory MongoDB started and connected at ${inMemoryUri}`);
    } catch (memErr) {
      console.error(`❌ Failed to start in-memory MongoDB:`, memErr);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
};

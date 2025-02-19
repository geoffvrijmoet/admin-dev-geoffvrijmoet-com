const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Try to get MongoDB URI from various sources
const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MongoDB URI not found!');
  console.error('Please ensure one of these is set in your .env.local file:');
  console.error('- MONGODB_URI');
  console.error('- NEXT_PUBLIC_MONGODB_URI');
  process.exit(1);
}

async function renameTimeLogFields() {
  let client;
  try {
    console.log('Starting field rename operation...');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db('dev_geoffvrijmoet_com');
    const timeLogsCollection = db.collection('time_logs');
    
    // Update all documents that have the 'project' field
    const result = await timeLogsCollection.updateMany(
      { project: { $exists: true } },
      { $rename: { "project": "projectName" } }
    );
    
    console.log(`Operation completed successfully!`);
    console.log(`Modified ${result.modifiedCount} documents`);
    console.log(`Matched ${result.matchedCount} documents`);
    
  } catch (error) {
    console.error('Error during rename operation:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
}

// Run the script
renameTimeLogFields(); 
import { MongoClient } from 'mongodb';
import { BusinessInsight } from '@/types/business';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getCollection(collectionName: string) {
  const client = await clientPromise;
  const db = client.db('dev_geoffvrijmoet_com');
  return db.collection(collectionName);
}

export async function getInsightsCollection() {
  const client = await clientPromise;
  const db = client.db('dev_geoffvrijmoet_com');
  return db.collection<BusinessInsight>('business_planning');
}

export async function getAllInsights(): Promise<BusinessInsight[]> {
  const collection = await getInsightsCollection();
  return collection.find({}).sort({ timestamp: -1 }).toArray();
}

export async function addInsight(insight: Omit<BusinessInsight, '_id'>): Promise<BusinessInsight> {
  const collection = await getInsightsCollection();
  const result = await collection.insertOne(insight as unknown as BusinessInsight);
  return { ...insight, _id: result.insertedId.toString() };
}

export async function updateInsight(insight: BusinessInsight): Promise<void> {
  const collection = await getInsightsCollection();
  const { _id, ...updateData } = insight;
  await collection.updateOne(
    { _id },
    { $set: updateData }
  );
}

export async function deleteInsight(id: string): Promise<void> {
  const collection = await getInsightsCollection();
  await collection.deleteOne({ _id: id });
}

export default clientPromise; 
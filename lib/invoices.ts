import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';
import { TimeLog } from './time-logs';

export interface Invoice {
  _id?: ObjectId;
  number: string;
  date: Date;
  client: string;
  items: {
    project: string;
    description: string;
    hours: number;
    rate: number;
    amount: number;
  }[];
  timeLogs: ObjectId[] | string[];
  subtotal: number;
  total: number;
  status: 'draft' | 'pending' | 'paid';
  rateType: 'hourly' | 'fixed';
  createdAt: Date;
  updatedAt: Date;
}

export async function createInvoice(data: {
  number: string;
  date: Date;
  timeLogs: string[];
}) {
  const client = await clientPromise;
  const db = client.db();
  
  // Get all time logs
  const timeLogIds = data.timeLogs.map(id => new ObjectId(id));
  const timeLogs = await db
    .collection<TimeLog>('time_logs')
    .find({ _id: { $in: timeLogIds } })
    .toArray();

  // Group by project
  const projectGroups = timeLogs.reduce((acc, log) => {
    const key = `${log.project}`;
    if (!acc[key]) {
      acc[key] = {
        project: log.project,
        description: `Time logged for ${log.project}`,
        hours: 0,
        rate: log.rate,
        amount: 0
      };
    }
    acc[key].hours += log.hours;
    acc[key].amount += log.hours * log.rate;
    return acc;
  }, {} as Record<string, Invoice['items'][0]>);

  const items = Object.values(projectGroups);
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  const invoice: Omit<Invoice, '_id'> = {
    number: data.number,
    date: data.date,
    client: timeLogs[0].client, // Assuming all logs are for the same client
    items,
    timeLogs: timeLogIds,
    subtotal,
    total: subtotal, // Add tax calculation if needed
    status: 'pending',
    rateType: 'hourly',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Create invoice
  const result = await db.collection<Invoice>('invoices').insertOne(invoice);

  // Mark time logs as invoiced
  await db.collection<TimeLog>('time_logs').updateMany(
    { _id: { $in: timeLogIds } },
    { 
      $set: { 
        invoiced: true,
        updatedAt: new Date()
      } 
    }
  );

  return result;
}

export async function getInvoices() {
  const client = await clientPromise;
  const db = client.db();
  
  return db
    .collection<Invoice>('invoices')
    .find({})
    .sort({ date: -1 })
    .toArray();
} 
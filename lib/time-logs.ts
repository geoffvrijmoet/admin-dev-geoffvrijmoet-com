import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

export interface TimeLog {
  _id?: ObjectId;
  project: string;
  client: string;
  startTime: Date;
  endTime: Date;
  hours: number;
  description?: string;
  invoiced: boolean;
  createdAt: Date;
  updatedAt: Date;
  rate: number;
  rateType: string;
  potentialInvoice?: number;
  datePaid?: Date;
}

export async function addTimeLog(timeLog: Omit<TimeLog, '_id' | 'invoiced' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  const result = await timeLogs.insertOne({
    ...timeLog,
    invoiced: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return result;
}

export async function getUnbilledTimeLogs(project: string) {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  return timeLogs.find({
    project,
    invoiced: false,
  }).sort({ startTime: 1 }).toArray();
}

export async function getProjectTimeLogs(project: string) {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  return timeLogs.find({
    project,
  }).sort({ startTime: -1 }).toArray();
}

export async function markLogsAsInvoiced(logIds: ObjectId[]) {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  return timeLogs.updateMany(
    { _id: { $in: logIds } },
    { 
      $set: { 
        invoiced: true,
        updatedAt: new Date(),
      } 
    }
  );
}

export async function getProjectTotalHours() {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  const result = await timeLogs.aggregate([
    {
      $group: {
        _id: "$project",
        totalHours: { $sum: "$hours" }
      }
    }
  ]).toArray();

  return result.map(item => ({
    project: item._id,
    hours: item.totalHours
  }));
}

export async function getProjectAverageRates() {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  const result = await timeLogs.aggregate([
    {
      $group: {
        _id: "$project",
        totalHours: { $sum: "$hours" },
        avgRate: { $avg: "$rate" }
      }
    }
  ]).toArray();

  return result.map(item => ({
    project: item._id,
    hours: item.totalHours,
    averageRate: item.avgRate || 0
  }));
}

export async function getProjectStats() {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  const result = await timeLogs.aggregate([
    {
      $group: {
        _id: "$project",
        totalHours: { $sum: "$hours" },
        avgRate: { $avg: "$rate" },
        potentialInvoice: {
          $sum: { $multiply: ["$hours", "$rate"] }
        }
      }
    }
  ]).toArray();

  return result.map(item => ({
    project: item._id,
    hours: item.totalHours,
    averageRate: item.avgRate || 0,
    potentialInvoice: item.potentialInvoice || 0
  }));
} 
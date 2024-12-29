'use server'

import { addTimeLog, TimeLog } from '@/lib/time-logs';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function logTime(data: { 
  project: string; 
  hours: number; 
  startTime: string;
  endTime: string;
  description?: string;
}) {
  try {
    const timeLogResult = await addTimeLog({
      project: data.project,
      client: data.project.split(' - ')[0],
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      hours: data.hours,
      description: data.description,
      rate: 0,
      rateType: 'hourly'
    });
    
    return { success: true, data: timeLogResult };
  } catch (error) {
    console.error('Failed to log time:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to log time');
  }
}

export async function getRecentLogs() {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  return timeLogs
    .find({})
    .sort({ startTime: -1 })
    .limit(10)
    .toArray();
}

export async function deleteTimeLog(id: string) {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  await timeLogs.deleteOne({ _id: new ObjectId(id) });
}

export async function updateTimeLog(log: TimeLog) {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  await timeLogs.updateOne(
    { _id: new ObjectId(log._id) },
    { 
      $set: { 
        client: log.client,
        project: log.project,
        rate: log.rate,
        hours: log.hours,
        updatedAt: new Date() 
      } 
    }
  );
}

export async function updateTimeLogRate(
  id: string, 
  data: { rate: number; rateType: string }
) {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  await timeLogs.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        rate: data.rate,
        rateType: data.rateType,
        updatedAt: new Date() 
      } 
    }
  );
} 
'use server'

import { addTimeLog, getProjectTotalHours, TimeLog } from '@/lib/time-logs';
import { getAllInvoices, updateProjectHours } from '@/lib/google-sheets';
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
    // First, save to MongoDB
    const timeLogResult = await addTimeLog({
      project: data.project,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      hours: data.hours,
      description: data.description,
    });

    // Then, update Google Sheets
    const invoices = await getAllInvoices();
    const projectRow = invoices.find(inv => inv.project === data.project);
    
    if (projectRow) {
      await updateProjectHours(data.project, projectRow.hoursWorked + data.hours);
    }
    
    return { success: true, data: timeLogResult };
  } catch (error) {
    console.error('Failed to log time:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to log time');
  }
}

export async function syncHours() {
  try {
    const [mongoHours, invoices] = await Promise.all([
      getProjectTotalHours(),
      getAllInvoices()
    ]);

    for (const projectHours of mongoHours) {
      const projectRow = invoices.find(inv => inv.project === projectHours.project);
      if (projectRow) {
        await updateProjectHours(projectHours.project, projectHours.hours);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to sync hours:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to sync hours');
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
  
  // Sync with Google Sheets after deletion
  await syncHours();
}

export async function updateTimeLog(log: TimeLog) {
  const client = await clientPromise;
  const timeLogs = client.db().collection<TimeLog>('time_logs');
  
  await timeLogs.updateOne(
    { _id: new ObjectId(log._id) },
    { 
      $set: { 
        ...log,
        updatedAt: new Date() 
      } 
    }
  );
  
  // Sync with Google Sheets after update
  await syncHours();
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
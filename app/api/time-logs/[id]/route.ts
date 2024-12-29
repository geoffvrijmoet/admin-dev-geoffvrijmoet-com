import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { TimeLog } from '@/lib/time-logs';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const timeLogs = client.db().collection<TimeLog>('time_logs');
    
    await timeLogs.deleteOne({ _id: new ObjectId(params.id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete time log:', error);
    return NextResponse.json(
      { error: 'Failed to delete time log' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const result = await db
      .collection<TimeLog>('time_logs')
      .updateOne(
        { _id: new ObjectId(params.id) },
        { 
          $set: { 
            ...body,
            updatedAt: new Date() 
          } 
        }
      );

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'Time log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update time log:', error);
    return NextResponse.json(
      { error: 'Failed to update time log' },
      { status: 500 }
    );
  }
} 
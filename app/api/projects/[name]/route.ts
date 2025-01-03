import { NextResponse } from 'next/server';
import { updateProject } from '@/lib/projects';
import clientPromise from '@/lib/mongodb';
import { TimeLog } from '@/lib/time-logs';

export async function PATCH(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Update project
    await updateProject(params.name, body);

    // If rate type is changing to fixed, update all related time logs
    if (body.rateType === 'fixed') {
      await db.collection<TimeLog>('time_logs').updateMany(
        { project: params.name },
        { 
          $set: { 
            rate: -1, // Use -1 to indicate fixed-rate project
            rateType: 'fixed',
            updatedAt: new Date() 
          } 
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
} 
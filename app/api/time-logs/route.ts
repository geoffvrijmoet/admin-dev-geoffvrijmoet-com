import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { addTimeLog, getUnbilledTimeLogs } from '@/lib/time-logs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received time log request:', body);
    
    if (!body.project || !body.startTime || !body.endTime || typeof body.hours !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await addTimeLog({
      project: body.project,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      hours: body.hours,
      description: body.description,
      rate: 0,
      rateType: 'hourly'
    });
    
    console.log('Time log saved:', result);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to add time log:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add time log' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project');
  
  if (!project) {
    return NextResponse.json(
      { error: 'Project is required' },
      { status: 400 }
    );
  }

  try {
    const logs = await getUnbilledTimeLogs(project);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to get time logs:', error);
    return NextResponse.json(
      { error: 'Failed to get time logs' },
      { status: 500 }
    );
  }
} 
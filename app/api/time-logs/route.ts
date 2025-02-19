import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { TimeLog } from '@/types/business';

export async function POST(req: NextRequest) {
  try {
    const collection = await getCollection('time_logs');
    const timeLog = await req.json();
    
    const result = await collection.insertOne(timeLog);
    
    return NextResponse.json({ 
      message: 'Time log created successfully',
      _id: result.insertedId 
    });
  } catch (error: unknown) {
    let errorMessage = 'Failed to create time log';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
} 
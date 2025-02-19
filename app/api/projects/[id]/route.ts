import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await getCollection('projects');
    const updates = await req.json();
    
    // Remove _id from updates if present
    const updateData = { ...updates };
    delete updateData._id;
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Project updated successfully' });
  } catch (error: unknown) {
    let errorMessage = 'Failed to update project';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
} 
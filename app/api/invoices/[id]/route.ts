import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Convert string IDs to ObjectIds if present
    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    if (body.timeLogs) {
      updateData.timeLogs = body.timeLogs.map((id: string) => new ObjectId(id));
    }

    const result = await db.collection('invoices').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
} 
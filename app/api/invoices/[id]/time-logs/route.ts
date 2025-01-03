import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // First get the invoice to get the client
    const invoice = await db.collection('invoices').findOne({ 
      _id: new ObjectId(params.id) 
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get all time logs for this client
    const logs = await db
      .collection('time_logs')
      .find({ 
        client: invoice.client,
        // Include logs that are either not invoiced or are part of this invoice
        $or: [
          { invoiced: { $ne: true } },
          { _id: { $in: invoice.timeLogs } }
        ]
      })
      .sort({ startTime: -1 })
      .toArray();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Failed to fetch time logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time logs' },
      { status: 500 }
    );
  }
} 
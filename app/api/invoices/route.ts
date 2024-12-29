import { NextResponse } from 'next/server';
import { createInvoice, getInvoices } from '@/lib/invoices';

export async function GET() {
  try {
    const invoices = await getInvoices();
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.number || !body.date || !body.timeLogs?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await createInvoice({
      number: body.number,
      date: new Date(body.date),
      timeLogs: body.timeLogs
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 
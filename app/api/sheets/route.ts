import { NextResponse } from 'next/server';
import { getProjectHours, getInvoiceData } from '@/lib/google-sheets';

export async function GET() {
  try {
    const [hours, invoices] = await Promise.all([
      getProjectHours(),
      getInvoiceData(),
    ]);

    return NextResponse.json({
      hours,
      invoices,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
} 
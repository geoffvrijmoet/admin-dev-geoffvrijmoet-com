import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Invoice } from '@/lib/invoices';
import { generateInvoicePDF } from '@/lib/generate-invoice-pdf';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const invoice = await client
      .db()
      .collection<Invoice>('invoices')
      .findOne({ _id: new ObjectId(params.id) });

    console.log('Found invoice:', invoice);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const pdfBytes = await generateInvoicePDF(invoice);

    // Create response with PDF headers
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
} 
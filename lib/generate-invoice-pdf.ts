import { Invoice } from './invoices';
import { format } from 'date-fns';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateInvoicePDF(invoice: Invoice): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header
  page.drawText('INVOICE', {
    x: 50,
    y: height - 50,
    size: 24,
    font: boldFont,
  });

  // Invoice Details
  page.drawText(`Invoice Number: ${invoice.number || 'N/A'}`, {
    x: 50,
    y: height - 100,
    size: 12,
    font: font,
  });

  page.drawText(`Date: ${format(new Date(invoice.date || new Date()), 'PPP')}`, {
    x: 50,
    y: height - 120,
    size: 12,
    font: font,
  });

  // Client Info
  page.drawText(`Client: ${invoice.client || 'N/A'}`, {
    x: 50,
    y: height - 160,
    size: 12,
    font: boldFont,
  });

  // Items Table Header
  const tableTop = height - 200;
  const lineHeight = 20;
  
  page.drawLine({
    start: { x: 50, y: tableTop },
    end: { x: width - 50, y: tableTop },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawText('Project', { x: 50, y: tableTop - 15, size: 10, font: boldFont });
  page.drawText('Hours', { x: 300, y: tableTop - 15, size: 10, font: boldFont });
  page.drawText('Rate', { x: 400, y: tableTop - 15, size: 10, font: boldFont });
  page.drawText('Amount', { x: 500, y: tableTop - 15, size: 10, font: boldFont });

  // Items
  let currentY = tableTop - 40;
  for (const item of invoice.items || []) {
    page.drawText(item.project || 'N/A', { x: 50, y: currentY, size: 10, font: font });
    page.drawText((item.hours || 0).toFixed(2), { x: 300, y: currentY, size: 10, font: font });
    page.drawText(`$${(item.rate || 0).toFixed(2)}`, { x: 400, y: currentY, size: 10, font: font });
    page.drawText(`$${(item.amount || 0).toFixed(2)}`, { x: 500, y: currentY, size: 10, font: font });
    currentY -= lineHeight;
  }

  // Totals
  const totalsY = currentY - 20;
  page.drawLine({
    start: { x: 50, y: totalsY + 10 },
    end: { x: width - 50, y: totalsY + 10 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawText('Subtotal:', { x: 400, y: totalsY - 10, size: 10, font: boldFont });
  page.drawText(`$${(invoice.subtotal || 0).toFixed(2)}`, { x: 500, y: totalsY - 10, size: 10, font: font });

  page.drawText('Total:', { x: 400, y: totalsY - 30, size: 12, font: boldFont });
  page.drawText(`$${(invoice.total || 0).toFixed(2)}`, { x: 500, y: totalsY - 30, size: 12, font: boldFont });

  return pdfDoc.save();
} 
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

if (!GOOGLE_PRIVATE_KEY || !GOOGLE_CLIENT_EMAIL || !GOOGLE_SHEET_ID) {
  throw new Error('Google credentials not properly configured');
}

const client = new JWT({
  email: GOOGLE_CLIENT_EMAIL,
  key: GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth: client });

interface ColumnMap {
  client: number;
  project: number;
  hoursWorked: number;
  rate: number;
  rateType: number;
  invoiced: number;
  afterFee: number;
  dateInvoiced: number;
  datePaid: number;
}

interface InvoiceRow {
  client: string;
  project: string;
  hoursWorked: number;
  rate: number;
  rateType: string;
  invoiced: number;
  afterFee: number;
  dateInvoiced: string;
  datePaid: string;
  runningHourlyRate: number;
}

async function getColumnMap(): Promise<ColumnMap> {
  try {
    console.log('Attempting to access sheet:', GOOGLE_SHEET_ID);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!1:1', // First row only
    });

    if (!response.data.values || response.data.values.length === 0) {
      console.error('No data found in spreadsheet');
      throw new Error('No data found in spreadsheet');
    }

    const headers = response.data.values[0];
    console.log('Found headers:', headers);

    const columnMap: Partial<ColumnMap> = {};

    headers.forEach((header, index) => {
      const headerStr = header.toString().toLowerCase().trim();
      switch (headerStr) {
        case 'client':
          columnMap.client = index;
          break;
        case 'project':
          columnMap.project = index;
          break;
        case 'hours worked':
          columnMap.hoursWorked = index;
          break;
        case '$ rate':
          columnMap.rate = index;
          break;
        case 'type of rate':
          columnMap.rateType = index;
          break;
        case '$ invoiced':
          columnMap.invoiced = index;
          break;
        case '$ after fee':
          columnMap.afterFee = index;
          break;
        case 'date invoiced':
          columnMap.dateInvoiced = index;
          break;
        case 'date paid':
          columnMap.datePaid = index;
          break;
      }
    });

    console.log('Column mapping:', columnMap);
    return columnMap as ColumnMap;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error accessing Google Sheet:', error);
    throw new Error(`Failed to access Google Sheet: ${error.message}`);
  }
}

export async function getAllInvoices(): Promise<InvoiceRow[]> {
  try {
    const columnMap = await getColumnMap();
    console.log('Getting data with column map:', columnMap);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1', // Changed from 'Sheet1!A2:J' to just 'Sheet1' to get all data
    });

    console.log('Raw response:', response.data);

    if (!response.data.values || response.data.values.length <= 1) {
      console.log('No data rows found');
      return [];
    }

    // Skip the header row
    const dataRows = response.data.values.slice(1);
    console.log('Data rows:', dataRows);

    return dataRows.map((row, index) => {
      try {
        const hoursWorked = parseFloat(row[columnMap.hoursWorked]) || 0;
        const invoiced = parseFloat((row[columnMap.invoiced] || '').replace(/[^0-9.-]+/g, '')) || 0;
        const rate = parseFloat((row[columnMap.rate] || '').replace(/[^0-9.-]+/g, '')) || 0;
        const afterFee = parseFloat((row[columnMap.afterFee] || '').replace(/[^0-9.-]+/g, '')) || 0;

        return {
          client: row[columnMap.client] || '',
          project: row[columnMap.project] || '',
          hoursWorked,
          rate,
          rateType: row[columnMap.rateType] || '',
          invoiced,
          afterFee,
          dateInvoiced: row[columnMap.dateInvoiced] || '',
          datePaid: row[columnMap.datePaid] || '',
          runningHourlyRate: hoursWorked ? invoiced / hoursWorked : 0,
        };
      } catch (err: unknown) {
        const error = err as Error;
        console.error(`Error processing row ${index}:`, error);
        console.error('Problematic row:', row);
        throw new Error(`Failed to process row ${index}: ${error.message}`);
      }
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in getAllInvoices:', error);
    throw new Error(`Failed to get invoices: ${error.message}`);
  }
}

export async function addInvoiceRow(invoice: Omit<InvoiceRow, 'runningHourlyRate'>) {
  const columnMap = await getColumnMap();
  const maxColumns = Math.max(...Object.values(columnMap)) + 1;
  
  // Create an array with empty strings for all columns
  const rowData = new Array(maxColumns).fill('');
  
  // Fill in the data using the column map
  rowData[columnMap.client] = invoice.client;
  rowData[columnMap.project] = invoice.project;
  rowData[columnMap.hoursWorked] = invoice.hoursWorked.toString();
  rowData[columnMap.rate] = invoice.rate.toString();
  rowData[columnMap.rateType] = invoice.rateType;
  rowData[columnMap.invoiced] = invoice.invoiced.toString();
  rowData[columnMap.afterFee] = invoice.afterFee.toString();
  rowData[columnMap.dateInvoiced] = invoice.dateInvoiced;
  rowData[columnMap.datePaid] = invoice.datePaid;

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Sheet1!A2:J2',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });
}

export async function getDashboardStats() {
  try {
    const invoices = await getAllInvoices();
    console.log('Got invoices for stats:', invoices);

    if (!invoices.length) {
      return {
        totalHours: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        monthlyStats: { hours: 0, invoiced: 0, paid: 0 },
        averageHourlyRate: 0,
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyInvoices = invoices.filter(inv => {
      if (!inv.dateInvoiced) return false;
      const invoiceDate = new Date(inv.dateInvoiced);
      return !isNaN(invoiceDate.getTime()) && 
             invoiceDate.getMonth() === currentMonth && 
             invoiceDate.getFullYear() === currentYear;
    });

    const validHourlyInvoices = invoices.filter(inv => inv.hoursWorked > 0);

    return {
      totalHours: invoices.reduce((sum, inv) => sum + (inv.hoursWorked || 0), 0),
      totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.invoiced || 0), 0),
      totalPaid: invoices
        .filter(inv => inv.datePaid)
        .reduce((sum, inv) => sum + (inv.invoiced || 0), 0),
      monthlyStats: monthlyInvoices.reduce((stats, inv) => ({
        hours: stats.hours + (inv.hoursWorked || 0),
        invoiced: stats.invoiced + (inv.invoiced || 0),
        paid: stats.paid + (inv.datePaid ? inv.invoiced : 0),
      }), { hours: 0, invoiced: 0, paid: 0 }),
      averageHourlyRate: validHourlyInvoices.length
        ? validHourlyInvoices.reduce((sum, inv) => sum + (inv.runningHourlyRate || 0), 0) / validHourlyInvoices.length
        : 0,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in getDashboardStats:', error);
    throw error;
  }
}

export async function getProjectHours() {
  const invoices = await getAllInvoices();
  return invoices.map(invoice => ({
    project: invoice.project,
    hours: invoice.hoursWorked,
    date: invoice.dateInvoiced,
  }));
}

export async function getInvoiceData() {
  const invoices = await getAllInvoices();
  return invoices.map(invoice => ({
    project: invoice.project,
    amount: invoice.invoiced,
    status: invoice.datePaid ? 'paid' : 'unpaid',
  }));
} 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, FileText, Wallet, TrendingUp } from "lucide-react";
import { getDashboardStats, getAllInvoices } from "@/lib/google-sheets";

export default async function DashboardPage() {
  try {
    const [stats, invoices] = await Promise.all([
      getDashboardStats(),
      getAllInvoices(),
    ]);

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your freelance business
          </p>
        </div>

        {/* Monthly Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Hours</CardTitle>
              <Clock className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyStats.hours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Hours this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <FileText className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.monthlyStats.invoiced.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Invoiced this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.averageHourlyRate.toLocaleString()}/hr
              </div>
              <p className="text-xs text-muted-foreground">Average hourly rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalPaid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats.totalInvoiced - stats.totalPaid).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Amount pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{invoice.project}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.client} • {invoice.rateType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {invoice.hoursWorked} hrs
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${invoice.rate}/hr
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{invoice.project}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.dateInvoiced).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${invoice.invoiced.toLocaleString()}
                      </p>
                      <p className={`text-xs ${invoice.datePaid ? 'text-green-500' : 'text-orange-500'}`}>
                        {invoice.datePaid ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (err: unknown) {
    const error = err as Error;
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold tracking-tight text-red-500">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          {error.message}
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Please make sure:
          <ul className="list-disc list-inside mt-2">
            <li>The Google Sheet exists and is accessible</li>
            <li>The service account has been granted access to the sheet</li>
            <li>The environment variables are correctly configured</li>
          </ul>
        </p>
      </div>
    );
  }
} 
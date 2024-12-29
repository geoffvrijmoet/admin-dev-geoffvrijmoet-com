import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, FileText, Wallet, TrendingUp } from "lucide-react";
import { getProjectStats } from "@/lib/time-logs";
import { getRecentLogs } from "@/app/time-tracking/actions";
import { getInvoices } from "@/lib/invoices";
import { AddProjectButton } from "@/components/add-project-button";
import { TimeLog } from "@/lib/time-logs";
import { RecentTimeLogs } from "@/components/recent-time-logs";

function formatDuration(hours: number) {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  
  return parts.join(' ') || '0s';
}

function groupLogsByProject(logs: TimeLog[]) {
  const grouped = logs.reduce((acc, log) => {
    const key = `${log.client}|||${log.project}`;
    if (!acc[key]) {
      acc[key] = {
        client: log.client,
        project: log.project,
        hours: 0,
        rate: log.rate,
        rateType: log.rateType
      };
    }
    acc[key].hours += log.hours;
    return acc;
  }, {} as Record<string, {
    client: string;
    project: string;
    hours: number;
    rate: number;
    rateType: string;
  }>);

  return Object.values(grouped)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);
}

export default async function DashboardPage() {
  try {
    const [stats, recentLogs, invoices] = await Promise.all([
      getProjectStats(),
      getRecentLogs(),
      getInvoices()
    ]);

    // Monthly calculations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyLogs = recentLogs.filter(log => {
      const logDate = new Date(log.startTime);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });

    const monthlyHours = monthlyLogs.reduce((sum, log) => sum + log.hours, 0);
    const monthlyRevenue = Number(monthlyLogs
      .reduce((sum, log) => sum + (log.hours * log.rate), 0)
      .toFixed(2));

    // Invoice calculations
    const totalInvoiced = Number(invoices
      .reduce((sum, inv) => sum + inv.total, 0)
      .toFixed(2));
    const totalPaid = Number(invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)
      .toFixed(2));
    const totalOutstanding = Number((totalInvoiced - totalPaid).toFixed(2));

    // Average rate calculation
    const averageRate = Number((stats.length > 0
      ? stats.reduce((sum, stat) => sum + stat.averageRate, 0) / stats.length
      : 0).toFixed(2));

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of your freelance business
            </p>
          </div>
          <AddProjectButton />
        </div>

        {/* Monthly Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Hours</CardTitle>
              <Clock className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyHours.toFixed(1)}</div>
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
                ${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Revenue this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${averageRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr
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
                ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {groupLogsByProject(recentLogs).map((project, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {project.project} • {project.client}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project.rateType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {project.hours.toFixed(2)} hrs ({formatDuration(project.hours)})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${project.rate}/hr
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
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice._id?.toString()} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{invoice.client}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${invoice.total.toLocaleString()}
                      </p>
                      <p className={`text-xs ${invoice.status === 'paid' ? 'text-green-500' : 'text-orange-500'}`}>
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Recent Timelogs section */}
        <div>
          <RecentTimeLogs 
            logs={recentLogs} 
            onEdit={async (log) => {
              'use server';
              const response = await fetch('/api/time-logs/' + log._id, {
                method: 'PATCH',
                body: JSON.stringify(log)
              });
              if (!response.ok) throw new Error('Failed to update time log');
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold tracking-tight text-red-500">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      </div>
    );
  }
} 
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Wallet, TrendingUp } from "lucide-react";
import { AddProjectButton } from "@/components/add-project-button";
import { RecentTimeLogsWrapper } from "@/components/recent-time-logs-wrapper";
import { TimeLog } from "@/lib/time-logs";
import { Invoice } from "@/lib/invoices";
import { DashboardProjects } from "@/components/dashboard-projects";
import { Project } from "@/lib/projects";
import Link from "next/link";

interface DashboardStats {
  totalHours: number;
  averageHourlyRate: number;
  totalPaid: number;
  totalOutstanding: number;
}

interface DashboardContentProps {
  stats: DashboardStats;
  recentLogs: TimeLog[];
  invoices: Invoice[];
  projects: Project[];
}

export function DashboardContent({ stats, recentLogs, invoices, projects }: DashboardContentProps) {
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              ${stats.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Amount pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.averageHourlyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr
            </div>
            <p className="text-xs text-muted-foreground">Average hourly rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardProjects projects={projects} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Link href="/invoices">
              <CardTitle className="hover:text-blue-500 transition-colors cursor-pointer">
                Invoices
              </CardTitle>
            </Link>
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

      <div>
        <RecentTimeLogsWrapper logs={recentLogs} />
      </div>
    </div>
  );
} 
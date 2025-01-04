import { DashboardContent } from "@/components/dashboard-content";
import { getDashboardStats } from "@/lib/time-logs";
import { getRecentLogs } from "@/app/time-tracking/actions";
import { getInvoices } from "@/lib/invoices";
import { getProjects } from "@/lib/projects";

export default async function DashboardPage() {
  const [dashboardStats, recentLogs, invoices, projects] = await Promise.all([
    getDashboardStats(),
    getRecentLogs(),
    getInvoices(),
    getProjects()
  ]);

  return <DashboardContent 
    stats={dashboardStats} 
    recentLogs={recentLogs} 
    invoices={invoices}
    projects={projects}
  />;
} 
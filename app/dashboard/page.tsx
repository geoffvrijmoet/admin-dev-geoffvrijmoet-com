import { DashboardContent } from "@/components/dashboard-content";
import { getProjectStats } from "@/lib/time-logs";
import { getRecentLogs } from "@/app/time-tracking/actions";
import { getInvoices } from "@/lib/invoices";
import { getProjects } from "@/lib/projects";

export default async function DashboardPage() {
  const [stats, recentLogs, invoices, projects] = await Promise.all([
    getProjectStats(),
    getRecentLogs(),
    getInvoices(),
    getProjects()
  ]);

  return <DashboardContent 
    stats={stats} 
    recentLogs={recentLogs} 
    invoices={invoices}
    projects={projects}
  />;
} 
import { getAllInvoices } from "@/lib/google-sheets";
import { TimeTrackingForm } from "@/components/time-tracking-form";
import { TimeLogList } from "@/components/time-log-list";
import { SyncButton } from "@/components/sync-button";
import { logTime, syncHours, getRecentLogs, deleteTimeLog, updateTimeLog } from "./actions";

export default async function TimeTrackingPage() {
  const [invoices, recentLogs] = await Promise.all([
    getAllInvoices(),
    getRecentLogs()
  ]);
  
  const projects = Array.from(new Set(invoices.map(inv => inv.project)));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Time Tracking</h2>
          <p className="text-muted-foreground">
            Track time spent on projects
          </p>
        </div>
        <SyncButton onSync={syncHours} />
      </div>

      <TimeTrackingForm 
        projects={projects}
        onLogTime={logTime}
      />

      <TimeLogList 
        logs={recentLogs}
        onDelete={deleteTimeLog}
        onEdit={updateTimeLog}
      />
    </div>
  );
} 
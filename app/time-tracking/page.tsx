import { TimeTrackingForm } from "@/components/time-tracking-form";
import { TimeLogList } from "@/components/time-log-list";
import { logTime, getRecentLogs, deleteTimeLog, updateTimeLog, updateTimeLogRate } from "./actions";
import { getProjects } from "../../lib/projects";

export default async function TimeTrackingPage() {
  const [projects, recentLogs] = await Promise.all([
    getProjects(),
    getRecentLogs()
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Time Tracking</h2>
        <p className="text-muted-foreground">
          Track time spent on projects
        </p>
      </div>

      <TimeTrackingForm 
        projects={projects}
        onLogTime={logTime}
      />

      <TimeLogList 
        logs={recentLogs}
        onDelete={deleteTimeLog}
        onEdit={updateTimeLog}
        onUpdateRate={updateTimeLogRate}
      />
    </div>
  );
} 
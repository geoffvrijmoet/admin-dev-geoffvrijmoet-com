import { TimeTrackingForm } from "@/components/time-tracking-form";
import { TimeLogList } from "@/components/time-log-list";
import { AddTimeLog } from "@/components/add-time-log";
import { logTime, getRecentLogs, deleteTimeLog, updateTimeLog, updateTimeLogRate } from "./actions";
import { getProjects } from "@/lib/projects";

export default async function TimeTrackingPage() {
  const [projects, recentLogs] = await Promise.all([
    getProjects(),
    getRecentLogs()
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Time Tracking</h2>
          <p className="text-muted-foreground">
            Track time spent on projects
          </p>
        </div>
        <div className="flex gap-4">
          <AddTimeLog onAddLog={logTime} />
          <TimeTrackingForm 
            projects={projects}
            onLogTime={logTime}
          />
        </div>
      </div>

      <TimeLogList 
        logs={recentLogs}
        onDelete={deleteTimeLog}
        onEdit={updateTimeLog}
        onUpdateRate={updateTimeLogRate}
      />
    </div>
  );
} 
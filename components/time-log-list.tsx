'use client';

import { TimeLog } from "@/lib/time-logs";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { RateDialog } from "@/components/rate-dialog";

interface TimeLogListProps {
  logs: TimeLog[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (log: TimeLog) => void;
  onUpdateRate: (logId: string, data: { rate: number; rateType: string }) => Promise<void>;
}

function formatDuration(hours: number) {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const parts = [];
  if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} minute${m !== 1 ? 's' : ''}`);
  if (s > 0) parts.push(`${s} second${s !== 1 ? 's' : ''}`);
  
  return parts.join(' ') || '0 seconds';
}

export function TimeLogList({ logs, onDelete, onEdit, onUpdateRate }: TimeLogListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Recent Time Logs</h3>
      <div className="rounded-md border">
        {logs.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No time logs found
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div
                key={log._id?.toString()}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="space-y-1">
                  <p className="font-medium">{log.project}</p>
                  <div className="flex items-center gap-2">
                    <RateDialog
                      rate={log.rate}
                      rateType={log.rateType}
                      onSave={async (data) => onUpdateRate(log._id!.toString(), data)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {log.description || 'No description'}
                  </p>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span>
                      {log.hours.toFixed(2)} hours ({formatDuration(log.hours)})
                    </span>
                    <span>{formatDistanceToNow(log.startTime)} ago</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(log)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(log._id!.toString())}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
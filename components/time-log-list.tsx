'use client';

import { TimeLog } from "@/lib/time-logs";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TimeLogListProps {
  logs: TimeLog[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (log: TimeLog) => void;
}

export function TimeLogList({ logs, onDelete, onEdit }: TimeLogListProps) {
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
                  <p className="text-sm text-muted-foreground">
                    {log.description || 'No description'}
                  </p>
                  <div className="flex gap-x-2 text-sm text-muted-foreground">
                    <span>{log.hours.toFixed(2)} hours</span>
                    <span>•</span>
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
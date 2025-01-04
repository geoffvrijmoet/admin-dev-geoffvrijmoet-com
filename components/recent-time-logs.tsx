'use client';

import { useState } from "react";
import { TimeLog } from "@/lib/time-logs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { EditTimeLogDialog } from "./edit-time-log-dialog";
import Link from "next/link";
import { toEasternTime } from '@/lib/date-utils';

interface RecentTimeLogsProps {
  logs: TimeLog[];
  onEdit: (log: TimeLog) => Promise<void>;
}

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

export function RecentTimeLogs({ logs, onEdit }: RecentTimeLogsProps) {
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <Link href="/time-tracking">
            <CardTitle className="hover:text-blue-500 transition-colors cursor-pointer">
              Timelogs
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.slice(0, 5).map((log, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-medium">
                    {log.project} • {log.client}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.rateType}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {log.hours.toFixed(2)} hrs ({formatDuration(log.hours)})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.rate === -1 ? 'Fixed Rate' : `$${log.rate}/hr`}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedLog && (
        <EditTimeLogDialog
          log={selectedLog}
          open={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
          onSave={onEdit}
        />
      )}
    </>
  );
} 
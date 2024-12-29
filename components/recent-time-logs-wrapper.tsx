'use client';

import { TimeLog } from "@/lib/time-logs";
import { RecentTimeLogs } from "./recent-time-logs";

interface RecentTimeLogsWrapperProps {
  logs: TimeLog[];
}

export function RecentTimeLogsWrapper({ logs }: RecentTimeLogsWrapperProps) {
  const handleEdit = async (log: TimeLog) => {
    try {
      if (!log._id) {
        throw new Error('Log ID is missing');
      }

      const response = await fetch(`/api/time-logs/${log._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client: log.client,
          project: log.project,
          hours: log.hours,
          rate: log.rate,
          rateType: log.rateType,
          startTime: log.startTime,
          endTime: log.endTime,
          description: log.description
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update time log');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating time log:', error);
      alert(error instanceof Error ? error.message : 'Failed to update time log');
    }
  };

  return <RecentTimeLogs logs={logs} onEdit={handleEdit} />;
} 
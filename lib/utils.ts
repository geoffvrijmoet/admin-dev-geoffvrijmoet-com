import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TimeLog } from "./time-logs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function groupLogsByProject(logs: TimeLog[]) {
  const grouped = logs.reduce((acc, log) => {
    const key = `${log.client}|||${log.project}`;
    if (!acc[key]) {
      acc[key] = {
        client: log.client,
        project: log.project,
        hours: 0,
        rate: log.rate,
        rateType: log.rateType
      };
    }
    acc[key].hours += log.hours;
    return acc;
  }, {} as Record<string, {
    client: string;
    project: string;
    hours: number;
    rate: number;
    rateType: string;
  }>);

  return Object.values(grouped);
}

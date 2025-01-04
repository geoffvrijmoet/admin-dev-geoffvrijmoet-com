import { toDate } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'America/New_York';

export function toEasternTime(date: Date): Date {
  return new Date(formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"));
}

export function fromEasternTime(date: Date): Date {
  return toDate(formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"));
} 
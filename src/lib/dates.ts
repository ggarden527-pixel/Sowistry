import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";

export const toISO = (d: Date) => format(d, "yyyy-MM-dd");
export const getToday = () => startOfDay(new Date());
export const offsetISO = (days: number, base: Date = getToday()) => toISO(addDays(base, days));
/** Calendar days from `today` until the ISO date (negative = in the past). */
export const daysFrom = (iso: string, today: Date) => differenceInCalendarDays(parseISO(iso), today);
export const addDaysISO = (iso: string, days: number) => toISO(addDays(parseISO(iso), days));

export function relativeDayLabel(days: number): string {
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days === -1) return "1 day overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function agoLabel(days: number): string {
  const d = Math.abs(days);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

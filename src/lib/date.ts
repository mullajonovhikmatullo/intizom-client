import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subDays, isSameDay, parseISO } from "date-fns";

export const todayKey = () => format(new Date(), "yyyy-MM-dd");
export const dateKey = (d: Date) => format(d, "yyyy-MM-dd");

export function rangeDays(from: Date, to: Date) {
  return eachDayOfInterval({ start: from, end: to });
}

export function lastNDays(n: number) {
  const today = new Date();
  return rangeDays(subDays(today, n - 1), today);
}

export function weekRange(d = new Date()) {
  return { from: startOfWeek(d, { weekStartsOn: 1 }), to: endOfWeek(d, { weekStartsOn: 1 }) };
}

export function monthRange(d = new Date()) {
  return { from: startOfMonth(d), to: endOfMonth(d) };
}

export { format, isSameDay, parseISO, subDays };

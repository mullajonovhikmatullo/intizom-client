import { Habit, HabitLogs } from "./types";
import { dateKey, rangeDays, todayKey } from "./date";
import { subDays } from "date-fns";
import { apiPaginatedRequest, apiRequest } from "./api";

interface HabitLogRecord {
  habitId: string;
  date: string;
  completed: boolean;
}

type HabitPayload = Pick<Habit, "title" | "type" | "targetDays"> & {
  time?: string | null;
};

export function toHabitLogs(records: HabitLogRecord[]): HabitLogs {
  return records.reduce<HabitLogs>((acc, log) => {
    if (!log.completed) return acc;
    acc[log.habitId] = {
      ...(acc[log.habitId] || {}),
      [log.date]: true,
    };
    return acc;
  }, {});
}

export async function fetchHabits() {
  return apiPaginatedRequest<Habit>("/habits");
}

export async function fetchHabitLogs() {
  const logs = await apiRequest<HabitLogRecord[]>("/habits/logs", { method: "GET" });
  return toHabitLogs(logs);
}

export async function createHabit(data: HabitPayload) {
  return apiRequest<Habit>("/habits", {
    method: "POST",
    body: JSON.stringify({ ...data, time: data.time || undefined }),
  });
}

export async function updateHabit(id: string, data: HabitPayload) {
  return apiRequest<Habit>(`/habits/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...data, time: data.time || null }),
  });
}

export async function deleteHabit(id: string) {
  await apiRequest<void>(`/habits/${id}`, { method: "DELETE" });
}

export async function setHabitPinned(id: string, pinned: boolean) {
  return apiRequest<Habit>(`/habits/${id}/pin`, {
    method: "PATCH",
    body: JSON.stringify({ pinned }),
  });
}

export async function setHabitLog(id: string, date: string) {
  return apiRequest<HabitLogRecord>(`/habits/${id}/logs/${date}`, {
    method: "PUT",
    body: JSON.stringify({ completed: true }),
  });
}

export async function deleteHabitLog(id: string, date: string) {
  await apiRequest<void>(`/habits/${id}/logs/${date}`, { method: "DELETE" });
}

export function isCompleted(logs: HabitLogs, habitId: string, date: string) {
  return !!logs[habitId]?.[date];
}

export function dailyCompletion(habits: Habit[], logs: HabitLogs, date = todayKey()) {
  // Only count habits that existed on the given date
  const active = habits.filter((h) => dateKey(new Date(h.createdAt)) <= date);
  if (active.length === 0) return 0;
  const goods = active.filter((h) => h.type === "good");
  const bads = active.filter((h) => h.type === "bad");
  let done = 0;
  goods.forEach((h) => { if (isCompleted(logs, h.id, date)) done++; });
  bads.forEach((h) => { if (!isCompleted(logs, h.id, date)) done++; });
  return Math.round((done / active.length) * 100);
}

export function rangeCompletion(habits: Habit[], logs: HabitLogs, from: Date, to: Date) {
  const days = rangeDays(from, to).filter((d) => d <= new Date());
  if (days.length === 0 || habits.length === 0) return 0;
  const total = days.reduce((sum, d) => sum + dailyCompletion(habits, logs, dateKey(d)), 0);
  return Math.round(total / days.length);
}

export function habitStreak(habit: Habit, logs: HabitLogs) {
  let count = 0;
  let cursor = new Date();
  const created = dateKey(new Date(habit.createdAt));
  const entries = logs[habit.id] || {};
  const isSuccess = (key: string) => (habit.type === "good" ? !!entries[key] : !entries[key]);
  while (true) {
    const key = dateKey(cursor);
    if (key < created) break;
    if (isSuccess(key)) {
      count++;
      cursor = subDays(cursor, 1);
    } else {
      if (count === 0 && key === todayKey()) {
        cursor = subDays(cursor, 1);
        continue;
      }
      break;
    }
    if (count > 3650) break;
  }
  return count;
}

export function streak(habits: Habit[], logs: HabitLogs) {
  if (habits.length === 0) return 0;
  let count = 0;
  let cursor = new Date();
  // Only count days where ALL habits "succeeded"
  while (true) {
    const key = dateKey(cursor);
    const pct = dailyCompletion(habits, logs, key);
    if (pct === 100) {
      count++;
      cursor = subDays(cursor, 1);
    } else {
      // Allow today to be incomplete without breaking streak
      if (count === 0 && key === todayKey()) {
        cursor = subDays(cursor, 1);
        continue;
      }
      break;
    }
    if (count > 3650) break;
  }
  return count;
}

export function daysCompletedTowardGoal(habit: Habit, logs: HabitLogs) {
  const entries = logs[habit.id] || {};
  if (habit.type === "good") {
    return Object.values(entries).filter(Boolean).length;
  }
  // bad habit: count days since createdAt where it was NOT checked
  const created = new Date(habit.createdAt);
  const today = new Date();
  const days = rangeDays(created, today);
  return days.filter((d) => !entries[dateKey(d)]).length;
}

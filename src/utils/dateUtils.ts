import { DayOfWeek, getDayOfWeekMessage } from '../models/DayOfWeek';

export function getDayOfWeekFromDate(date: Date): string {
  const days = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];
  return getDayOfWeekMessage(days[date.getDay()]);
}

export function formatDate(date: Date): string {
  if (!Number.isFinite(date.getTime())) return 'Data desconhecida';

  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function getFirstValidDate(...values: unknown[]): Date | null {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value as string);
    if (Number.isFinite(date.getTime())) return date;
  }

  return null;
}

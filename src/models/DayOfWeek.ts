export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export const DayOfWeekMessage: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Segunda-feira',
  [DayOfWeek.TUESDAY]: 'Terça-feira',
  [DayOfWeek.WEDNESDAY]: 'Quarta-feira',
  [DayOfWeek.THURSDAY]: 'Quinta-feira',
  [DayOfWeek.FRIDAY]: 'Sexta-feira',
  [DayOfWeek.SATURDAY]: 'Sábado',
  [DayOfWeek.SUNDAY]: 'Domingo',
}

export const DAY_OF_WEEK_ORDER: Record<DayOfWeek, number> = {
  [DayOfWeek.MONDAY]: 1,
  [DayOfWeek.TUESDAY]: 2,
  [DayOfWeek.WEDNESDAY]: 3,
  [DayOfWeek.THURSDAY]: 4,
  [DayOfWeek.FRIDAY]: 5,
  [DayOfWeek.SATURDAY]: 6,
  [DayOfWeek.SUNDAY]: 7,
};

export function getDayOfWeekMessage(status?: DayOfWeek) {
  if (!status) return ''
  return DayOfWeekMessage[status]
}
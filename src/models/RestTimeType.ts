export enum RestTimeType {
  NO_REST = 'NO_REST',
  SEG_60 = 'SEG_60',
  SEG_90 = 'SEG_90',
  SEG_120 = 'SEG_120',
  SEG_180 = 'SEG_180',
}

export const RestTimeTypeSeconds: Record<RestTimeType, number> = {
  [RestTimeType.NO_REST]: 0,
  [RestTimeType.SEG_60]: 60,
  [RestTimeType.SEG_90]: 90,
  [RestTimeType.SEG_120]: 120,
  [RestTimeType.SEG_180]: 180,
}

export function getRestTimeTypeSeconds(status?: RestTimeType): number {
  if (!status) return 0
  return RestTimeTypeSeconds[status]
}
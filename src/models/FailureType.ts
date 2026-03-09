export enum FailureType {
  FAILURE = 'FAILURE',
  ONE_RESERVED = 'ONE_RESERVED',
  ZERO_RESERVED = 'ZERO_RESERVED',
  REMAINING_REPS = 'REMAINING_REPS',
}

export const FailureTypeMessage: Record<FailureType, string> = {
  [FailureType.FAILURE]: 'Até a Falha',
  [FailureType.ONE_RESERVED]: '1 na reserva',
  [FailureType.ZERO_RESERVED]: '0 na reserva',
  [FailureType.REMAINING_REPS]: 'Sobrando',
}

export function getFailureTypeMessage(status?: FailureType) {
  if (!status) return ''
  return FailureTypeMessage[status]
}
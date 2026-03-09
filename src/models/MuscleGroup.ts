export enum MuscleGroup {
  Chest = 'Chest',
  Back = 'Back',
  Quads = 'Quads',
  Glutes = 'Glutes',
  Hamstrings = 'Hamstrings',
  Calves = 'Calves',
  Shoulders = 'Shoulders',
  Biceps = 'Biceps',
  Triceps = 'Triceps',
  Forearms = 'Forearms',
  Core = 'Core',
}

export const MuscleGroupMessage: Record<MuscleGroup, string> = {
  [MuscleGroup.Chest]: 'PEI',
  [MuscleGroup.Back]: 'COS',
  [MuscleGroup.Quads]: 'QUAD',
  [MuscleGroup.Glutes]: 'GLU',
  [MuscleGroup.Hamstrings]: 'POS',
  [MuscleGroup.Calves]: 'PAN',
  [MuscleGroup.Shoulders]: 'OMB',
  [MuscleGroup.Biceps]: 'BIC',
  [MuscleGroup.Triceps]: 'TRI',
  [MuscleGroup.Forearms]: 'AB',
  [MuscleGroup.Core]: 'CORE',
}

export const MuscleGroupTranslate: Record<MuscleGroup, string> = {
  [MuscleGroup.Chest]: 'Peitoral',
  [MuscleGroup.Back]: 'Costas',
  [MuscleGroup.Quads]: 'Quadríceps',
  [MuscleGroup.Glutes]: 'Glúteos',
  [MuscleGroup.Hamstrings]: 'Posteriores',
  [MuscleGroup.Calves]: 'Panturrilhas',
  [MuscleGroup.Shoulders]: 'Ombros',
  [MuscleGroup.Biceps]: 'Bíceps',
  [MuscleGroup.Triceps]: 'Tríceps',
  [MuscleGroup.Forearms]: 'Antebraços',
  [MuscleGroup.Core]: 'Core',
}

export function getMuscleGroupMessage(status?: MuscleGroup) {
  if (!status) return ''
  return MuscleGroupMessage[status]
}

export function getMuscleGroupTranslate(status?: MuscleGroup) {
  if (!status) return ''
  return MuscleGroupTranslate[status]
}
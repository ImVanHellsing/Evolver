import { MuscleGroup } from './MuscleGroup';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
}
import { SetType } from '../models/SetType';
import { MuscleGroup } from '../models/MuscleGroup';

/**
 * Calculates the rest time in seconds based on exercise context and completed set type.
 *
 * - Between warmup and recognition: 1 min (60s)
 * - Between recognition and work: 1m30s (90s)
 * - Between work and top set: 2 min (120s)
 * - Between work and top set for lower body: 3 min (180s)
 * - Between unilateral exercises: slightly less rest
 */
export function getIntelligentRestTime(
  exerciseName: string,
  muscleGroup: MuscleGroup,
  setType: SetType
): number {
  const isLower = [
    MuscleGroup.Quads,
    MuscleGroup.Glutes,
    MuscleGroup.Adductors,
    MuscleGroup.Hamstrings,
    MuscleGroup.Calves,
  ].includes(muscleGroup);

  const isUnilateral = exerciseName.toLowerCase().includes('unilateral');

  let baseTime = 90; // Default fallback

  if (setType === SetType.WarmUpSet) {
    // Warmup to recognition/warmup rest: 60s
    baseTime = isUnilateral ? 45 : 60;
  } else if (setType === SetType.RampUpSet) {
    // Recognition/RampUp to work rest: 90s
    baseTime = isUnilateral ? 60 : 90;
  } else if (setType === SetType.WorkSet) {
    // Work set rest: 120s (or 180s for lower body top sets, which we also suggest after work sets)
    if (isLower) {
      baseTime = isUnilateral ? 120 : 180;
    } else {
      baseTime = isUnilateral ? 90 : 120;
    }
  } else if (setType === SetType.TopSet) {
    // Top set rest: 120s (or 180s for lower body)
    if (isLower) {
      baseTime = isUnilateral ? 120 : 180;
    } else {
      baseTime = isUnilateral ? 90 : 120;
    }
  } else if (setType === SetType.BackoffSet) {
    // Backoff set rest: 90s
    baseTime = isUnilateral ? 60 : 90;
  }

  return baseTime;
}

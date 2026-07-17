import { SetType } from '../models/SetType';
import { MuscleGroup } from '../models/MuscleGroup';
import { SetLog } from '../models/Set';

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
  completedType: SetType | null,
  nextType: SetType
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

  // If we don't have a completed set type yet (e.g. first set of the exercise)
  const effectiveCompletedType = completedType || nextType;

  if (effectiveCompletedType === SetType.WarmUpSet) {
    // Warmup -> RampUp or Warmup -> Warmup: 60s
    baseTime = isUnilateral ? 45 : 60;
  } else if (effectiveCompletedType === SetType.RampUpSet) {
    // RampUp -> WorkSet or RampUp -> RampUp: 90s
    baseTime = isUnilateral ? 60 : 90;
  } else if (effectiveCompletedType === SetType.WorkSet) {
    // WorkSet -> WorkSet or WorkSet -> TopSet: 120s (180s for lower body)
    if (isLower) {
      baseTime = isUnilateral ? 120 : 180;
    } else {
      baseTime = isUnilateral ? 90 : 120;
    }
  } else if (effectiveCompletedType === SetType.TopSet) {
    // TopSet -> BackoffSet or TopSet -> TopSet: 120s (180s for lower body)
    if (isLower) {
      baseTime = isUnilateral ? 120 : 180;
    } else {
      baseTime = isUnilateral ? 90 : 120;
    }
  } else if (effectiveCompletedType === SetType.BackoffSet) {
    // BackoffSet -> BackoffSet: 90s
    baseTime = isUnilateral ? 60 : 90;
  }

  return baseTime;
}
export function getNextSetType(loggedSets: SetLog[]): SetType {
  if (loggedSets.length === 0) {
    return SetType.WarmUpSet;
  }
  const lastSet = loggedSets[loggedSets.length - 1];
  if (lastSet.type === SetType.WarmUpSet) {
    const warmupCount = loggedSets.filter(s => s.type === SetType.WarmUpSet).length;
    return warmupCount >= 2 ? SetType.RampUpSet : SetType.WarmUpSet;
  } else if (lastSet.type === SetType.RampUpSet) {
    return SetType.WorkSet;
  } else if (lastSet.type === SetType.WorkSet) {
    const workCount = loggedSets.filter(s => s.type === SetType.WorkSet).length;
    return workCount >= 2 ? SetType.TopSet : SetType.WorkSet;
  } else if (lastSet.type === SetType.TopSet) {
    return SetType.BackoffSet;
  }
  return SetType.BackoffSet;
}

import { getIntelligentRestTime, getNextSetType } from '../src/utils/timerUtils';
import { SetType } from '../src/models/SetType';
import { MuscleGroup } from '../src/models/MuscleGroup';
import { SetLog } from '../src/models/Set';
import { FailureType } from '../src/models/FailureType';

describe('getIntelligentRestTime', () => {
  it('should return correct rest times for upper body bilateral sets', () => {
    // Warmup -> Warmup: 60s
    expect(getIntelligentRestTime('Supino Reto', MuscleGroup.Chest, SetType.WarmUpSet, SetType.WarmUpSet)).toBe(60);

    // Warmup -> RampUp: 60s
    expect(getIntelligentRestTime('Supino Reto', MuscleGroup.Chest, SetType.WarmUpSet, SetType.RampUpSet)).toBe(60);

    // RampUp -> WorkSet: 90s
    expect(getIntelligentRestTime('Supino Reto', MuscleGroup.Chest, SetType.RampUpSet, SetType.WorkSet)).toBe(90);

    // WorkSet -> WorkSet: 120s
    expect(getIntelligentRestTime('Supino Reto', MuscleGroup.Chest, SetType.WorkSet, SetType.WorkSet)).toBe(120);

    // TopSet -> BackoffSet: 120s
    expect(getIntelligentRestTime('Supino Reto', MuscleGroup.Chest, SetType.TopSet, SetType.BackoffSet)).toBe(120);

    // BackoffSet -> BackoffSet: 90s
    expect(getIntelligentRestTime('Supino Reto', MuscleGroup.Chest, SetType.BackoffSet, SetType.BackoffSet)).toBe(90);
  });

  it('should return correct rest times for upper body unilateral/dumbbell sets (shorter rest)', () => {
    // Unilateral exercise name
    expect(getIntelligentRestTime('Rosca Biceps Unilateral', MuscleGroup.Biceps, SetType.WarmUpSet, SetType.WarmUpSet)).toBe(45);
    expect(getIntelligentRestTime('Triceps Unilateral Polia', MuscleGroup.Triceps, SetType.WorkSet, SetType.WorkSet)).toBe(90);
  });

  it('should return correct rest times for lower body work/top sets (longer rest)', () => {
    // Quads bilateral work set: 180s
    expect(getIntelligentRestTime('Agachamento Livre', MuscleGroup.Quads, SetType.WorkSet, SetType.WorkSet)).toBe(180);

    // Hamstrings unilateral work set: 120s
    expect(getIntelligentRestTime('Mesa Flexora Unilateral', MuscleGroup.Hamstrings, SetType.WorkSet, SetType.WorkSet)).toBe(120);
  });

  it('should fallback to nextType if completedType is null', () => {
    // WarmUpSet: 60s
    expect(getIntelligentRestTime('Supino Reto', MuscleGroup.Chest, null, SetType.WarmUpSet)).toBe(60);
    // WorkSet: 120s
    expect(getIntelligentRestTime('Supino Reto', MuscleGroup.Chest, null, SetType.WorkSet)).toBe(120);
  });
});

describe('getNextSetType', () => {
  it('should return WarmUpSet if no sets have been logged', () => {
    expect(getNextSetType([])).toBe(SetType.WarmUpSet);
  });

  it('should suggest WarmUpSet if only one WarmUpSet has been logged', () => {
    const mockSets: SetLog[] = [
      { id: '1', type: SetType.WarmUpSet, weight: 10, reps: 10, failureType: FailureType.REMAINING_REPS, notes: '' }
    ];
    expect(getNextSetType(mockSets)).toBe(SetType.WarmUpSet);
  });

  it('should suggest RampUpSet after 2 WarmUpSets', () => {
    const mockSets: SetLog[] = [
      { id: '1', type: SetType.WarmUpSet, weight: 10, reps: 10, failureType: FailureType.REMAINING_REPS, notes: '' },
      { id: '2', type: SetType.WarmUpSet, weight: 12, reps: 10, failureType: FailureType.REMAINING_REPS, notes: '' }
    ];
    expect(getNextSetType(mockSets)).toBe(SetType.RampUpSet);
  });

  it('should suggest WorkSet after a RampUpSet', () => {
    const mockSets: SetLog[] = [
      { id: '1', type: SetType.WarmUpSet, weight: 10, reps: 10, failureType: FailureType.REMAINING_REPS, notes: '' },
      { id: '2', type: SetType.WarmUpSet, weight: 12, reps: 10, failureType: FailureType.REMAINING_REPS, notes: '' },
      { id: '3', type: SetType.RampUpSet, weight: 15, reps: 8, failureType: FailureType.REMAINING_REPS, notes: '' }
    ];
    expect(getNextSetType(mockSets)).toBe(SetType.WorkSet);
  });

  it('should suggest WorkSet if only one WorkSet has been logged', () => {
    const mockSets: SetLog[] = [
      { id: '1', type: SetType.WorkSet, weight: 20, reps: 8, failureType: FailureType.REMAINING_REPS, notes: '' }
    ];
    expect(getNextSetType(mockSets)).toBe(SetType.WorkSet);
  });

  it('should suggest TopSet after 2 WorkSets', () => {
    const mockSets: SetLog[] = [
      { id: '1', type: SetType.WorkSet, weight: 20, reps: 8, failureType: FailureType.REMAINING_REPS, notes: '' },
      { id: '2', type: SetType.WorkSet, weight: 20, reps: 8, failureType: FailureType.REMAINING_REPS, notes: '' }
    ];
    expect(getNextSetType(mockSets)).toBe(SetType.TopSet);
  });

  it('should suggest BackoffSet after a TopSet', () => {
    const mockSets: SetLog[] = [
      { id: '1', type: SetType.TopSet, weight: 25, reps: 6, failureType: FailureType.REMAINING_REPS, notes: '' }
    ];
    expect(getNextSetType(mockSets)).toBe(SetType.BackoffSet);
  });
});


import { ExerciseTemplate } from '../../models/Exercise';
import { MuscleGroup } from '../../models/MuscleGroup';
import { reorderExercise } from './index';

const exercises = ['a', 'b', 'c'].map(id => ({
  id,
  name: id.toUpperCase(),
  description: '',
  muscleGroup: MuscleGroup.Chest,
})) satisfies ExerciseTemplate[];

test('moves an exercise forward without changing its identity', () => {
  expect(reorderExercise(exercises, 0, 2).map(item => item.id)).toEqual(['b', 'c', 'a']);
  expect(exercises.map(item => item.id)).toEqual(['a', 'b', 'c']);
});

test('moves an exercise backward', () => {
  expect(reorderExercise(exercises, 2, 0).map(item => item.id)).toEqual(['c', 'a', 'b']);
});

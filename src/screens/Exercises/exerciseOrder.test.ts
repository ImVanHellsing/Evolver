import { ExerciseTemplate } from '../../models/Exercise';
import { MuscleGroup } from '../../models/MuscleGroup';
import { appendExercise, reorderExercise } from './index';

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

test('appends a new exercise at the end without mutating the source', () => {
  const added: ExerciseTemplate = {
    id: 'd',
    name: 'D',
    description: '',
    muscleGroup: MuscleGroup.Back,
  };

  expect(appendExercise(exercises, added).map(item => item.id)).toEqual(['a', 'b', 'c', 'd']);
  expect(exercises.map(item => item.id)).toEqual(['a', 'b', 'c']);
});

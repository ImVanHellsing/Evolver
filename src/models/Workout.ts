import { ExerciseLog, ExerciseTemplate } from "./Exercise";
import { DayOfWeek } from "./DayOfWeek";
import { SetType } from "./SetType";

export interface WorkoutTemplate {
	id: string;
	description: string;
	dayOfWeek: DayOfWeek;
	exercises: ExerciseTemplate[];
}

export interface WorkoutSession {
	id: string;
	routineTemplateId: string;
	workoutTemplateId: string;

	exercises: ExerciseLog[];

	duration?: number;
	caloriesEstimated?: number;

	date: Date;
}

export const getWorkoutAmountOfValidSets = (workout: WorkoutTemplate) => {
	return workout.exercises.reduce((acc, exercise) => {
		return acc + (exercise.sets || []).filter(set => set.type === SetType.WorkSet || set.type === SetType.TopSet).length;
	}, 0);
}
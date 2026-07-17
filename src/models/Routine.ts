import { WorkoutTemplate } from "./Workout";

export type RoutineSource = 'template' | 'custom';

export interface RoutineTemplate {
	id: string;
	name: string;
	workouts: WorkoutTemplate[];
	source?: RoutineSource;
	createdAt?: string;
	updatedAt?: string;
}

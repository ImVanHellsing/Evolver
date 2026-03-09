import { WorkoutTemplate } from "./Workout";

export interface RoutineTemplate {
	id: string;
	name: string;
	workouts: WorkoutTemplate[];
}
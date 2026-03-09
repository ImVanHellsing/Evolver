import { RoutineTemplate } from "@/models/Routine";
import { WorkoutTemplate } from "@/models/Workout";

export const Routes = {
	Home: 'Home',
	History: 'History',
	Routines: 'Routines',
	Workouts: 'Workouts',
	Exercises: 'Exercises',
	WorkoutRunner: 'WorkoutRunner',
	WorkoutSessionDetail: 'WorkoutSessionDetail',
} as const

export type RouteName = typeof Routes[keyof typeof Routes];

export type RootStackParamList = {
	[Routes.Home]: undefined;
	[Routes.History]: undefined;
	[Routes.Routines]: undefined;
	[Routes.Workouts]: { routine: RoutineTemplate };
	[Routes.Exercises]: {
		routineTemplateId: string,
		workout: WorkoutTemplate
	};
	[Routes.WorkoutRunner]: {
		routineTemplateId: string,
		workout: WorkoutTemplate
	};
	[Routes.WorkoutSessionDetail]: {
		session: import("@/models/Workout").WorkoutSession
	};
}

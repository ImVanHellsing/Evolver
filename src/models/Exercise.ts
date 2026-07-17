import { MuscleGroup } from "./MuscleGroup";
import { SetLog, SetTemplate } from "./Set";

export interface ExerciseTemplate {
	id: string;
	name: string;
	description: string;
	muscleGroup: MuscleGroup;
	sets?: SetTemplate[]
}

export interface ExerciseLog {
	id?: string;
	exerciseTemplateId: string;
	exerciseNameSnapshot?: string;
	notes: string;
	sets: SetLog[];
}

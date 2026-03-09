import { MuscleGroup } from "./MuscleGroup";
import { SetLog, SetTemplate } from "./Set";

export interface ExerciseTemplate {
	id: string;
	name: string;
	description: string;
	muscleGroup: MuscleGroup;
	sets: SetTemplate[]
}

export interface ExerciseLog {
	exerciseTemplateId: string;
	notes: string;
	sets: SetLog[];
}
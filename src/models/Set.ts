import { FailureType } from "./FailureType";
import { RestTimeType } from "./RestTimeType";
import { SetType } from "./SetType";

export interface SetTemplate {
	id: string;
	type: SetType;
	reps?: number;
	weight?: number;
	restTime?: RestTimeType;
	failureType?: FailureType;
	notes?: string;
}

export interface SetLog {
	id: string;
	templateSetId?: string;
	reps: number;
	weight: number;
	failureType: FailureType;
	notes: string;
	type: SetType;
}

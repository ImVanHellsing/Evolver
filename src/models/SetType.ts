export enum SetType {
	ClusterSet = 'CLUSTER_SET',
	TopSet = 'TopSet',
	WorkSet = 'WorkSet',
	BackoffSet = 'BackoffSet',
	RampUpSet = 'RampUpSet',
	WarmUpSet = 'WarmUpSet',
}

export const SetTypeMessage: Record<SetType, string> = {
	[SetType.ClusterSet]: 'Cluster Set',
	[SetType.TopSet]: 'Top Set',
	[SetType.WorkSet]: 'Série de Trabalho',
	[SetType.BackoffSet]: 'Backoff Set',
	[SetType.RampUpSet]: 'Série de Reconhecimento',
	[SetType.WarmUpSet]: 'Série de Aquecimento'
}

export function getSetTypeMessage(status: SetType) {
	return SetTypeMessage[status]
}

export function isExerciseFinishingSet(type: SetType): boolean {
	return type === SetType.BackoffSet || type === SetType.ClusterSet;
}

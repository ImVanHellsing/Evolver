export enum SetType {
	TopSet = 'TopSet',
	WorkSet = 'WorkSet',
	BackoffSet = 'BackoffSet',
	RampUpSet = 'RampUpSet',
	WarmUpSet = 'WarmUpSet',
}

export const SetTypeMessage: Record<SetType, string> = {
	[SetType.TopSet]: 'Top Set',
	[SetType.WorkSet]: 'Série de Trabalho',
	[SetType.BackoffSet]: 'Backoff Set',
	[SetType.RampUpSet]: 'Série de Reconhecimento',
	[SetType.WarmUpSet]: 'Série de Aquecimento'
}

export function getSetTypeMessage(status: SetType) {
	return SetTypeMessage[status]
}
import pplTest from './template-test.json';
import pplNew from './template-ppl-fb-new.json';
import torsoLibs from './template-torso-limbs.json';
import { RoutineTemplate } from '@/models/Routine';

export const routineTemplates: RoutineTemplate[] = [
  pplNew as any,
  torsoLibs as any,
  // "Rotina Teste" is only for development builds; release builds don't ship it.
  ...(__DEV__ ? [pplTest as any] : []),
];

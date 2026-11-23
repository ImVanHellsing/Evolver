import pplTest from './template-test.json';
import pplNew from './template-ppl-fb-new.json';
import torsoLibs from './template-torso-limbs.json';
import { RoutineTemplate } from '@/models/Routine';

export const routineTemplates: RoutineTemplate[] = [
  pplNew as any,
  torsoLibs as any,
  pplTest as any
];

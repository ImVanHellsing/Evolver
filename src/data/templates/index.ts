import pplTest from './template-test.json';
import pplNew from './template-ppl-fb-new.json';
import tatianeTemplate from './template-tatiane.json';
import { RoutineTemplate } from '@/models/Routine';

export const routineTemplates: RoutineTemplate[] = [
  pplNew as any,
  tatianeTemplate as any,
  pplTest as any
];

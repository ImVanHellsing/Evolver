import type { RootStackParamList } from '@/app/navigation/routes';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export { }; 
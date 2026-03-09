import { RouteProp, useRoute } from '@react-navigation/native';

import { RootStackParamList } from '@/app/navigation/routes';

type RoutesWithParams = {
  [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined
  ? never
  : K
}[keyof RootStackParamList];

type ParamsOf<K extends keyof RootStackParamList> = RootStackParamList[K];
type NonNullableParams<T> = T extends undefined ? never : T;

export function useAppRouteParams<T extends RoutesWithParams>() {
  const route = useRoute<RouteProp<RootStackParamList, T>>();

  if (!route.params) {
    throw new Error(`Missing params for route: ${String(route.name)}`);
  }

  return route.params as NonNullableParams<ParamsOf<T>>;
}
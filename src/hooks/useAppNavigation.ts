import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../app/navigation/routes';

export function useAppNavigation() {
	return useNavigation<StackNavigationProp<RootStackParamList>>();
}

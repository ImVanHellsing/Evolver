import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useAppNavigation } from '../../hooks/useAppNavigation';

import { styles } from './styles';

interface HeaderProps {
	title: string;
	onActionPress?: () => void;
	showBackButton?: boolean;
}

export function Header({ title, onActionPress, showBackButton = false }: HeaderProps) {
	const navigation = useAppNavigation();

	const handleActionPress = () => {
		if (onActionPress) {
			onActionPress();
		} else {
			navigation.goBack();
		}
	};

	return (
		<View style={styles.container}>
			{showBackButton && (
				<TouchableOpacity
					style={styles.backButton}
					onPress={handleActionPress}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Text style={styles.backText}>{'<'}</Text>
				</TouchableOpacity>
			)}
			<Text style={styles.title}>{title}</Text>
		</View>
	);
}

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		height: 60,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
		paddingHorizontal: 16,
	},
	backButton: {
		position: 'absolute',
		left: 16,
		padding: 8,
	},
	backText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#000',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#000',
	},
});

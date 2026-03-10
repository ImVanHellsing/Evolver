import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		justifyContent: 'center',

	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#000',
	},
	subtitle: {
		fontSize: 14,
		opacity: 0.75,
		marginBottom: 8,
		color: '#000',
	},
	buttons: {
		gap: 12,
		marginTop: 12,
	},
	bigButton: {
		borderWidth: 1,
		borderRadius: 16,
		padding: 16,
		minHeight: 96,
		justifyContent: 'center',
	},
	bigButtonTitle: {
		fontSize: 18,
		fontWeight: '700',
		marginBottom: 4,
		color: '#000',
	},
	bigButtonDesc: {
		fontSize: 13,
		opacity: 0.8,
		color: '#000',
	},
});
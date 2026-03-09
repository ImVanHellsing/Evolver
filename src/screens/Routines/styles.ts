import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	innerContainer: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		marginBottom: 16,
	},
	bigButton: {
		borderWidth: 1,
		borderRadius: 16,
		padding: 16,
		minHeight: 96,
		justifyContent: 'center',
		marginBottom: 16,
	},
	bigButtonTitle: {
		fontSize: 18,
		fontWeight: '700',
		marginBottom: 4,
	},
	bigButtonDesc: {
		fontSize: 13,
		opacity: 0.8,
	},
	fab: {
		position: 'absolute',
		bottom: 24,
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#000', // Using a default blue for now, can be theme color
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 6, // for Android shadow
		shadowColor: '#000', // for iOS shadow
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	fabIcon: {
		fontSize: 32,
		color: 'white',
		fontWeight: 'bold',
		marginTop: -4, // Adjust vertical alignment of + sign
	},
});
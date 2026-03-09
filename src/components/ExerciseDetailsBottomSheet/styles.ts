import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  descriptionContainer: {
    marginTop: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  title: {
    flexShrink: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    textAlignVertical: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
    textAlignVertical: 'center',
  },
  closeButton: {
    alignSelf: 'center',
    padding: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  muscleBadge: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  muscleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButtonsContainer: {
    justifyContent: 'flex-start',
    gap: 16,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

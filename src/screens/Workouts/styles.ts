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
  hint: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    color: '#999',
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
  summaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  summaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '40%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  volumeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  volumeMuscle: {
    fontSize: 16,
    fontWeight: '500',
  },
  volumeCount: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
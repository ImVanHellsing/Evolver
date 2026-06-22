import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30', // Warning color
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  scrollList: {
    maxHeight: 180,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  scrollListContent: {
    padding: 12,
    gap: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  exerciseName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  warningMessage: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f3f3f3',
  },
  modalButtonConfirm: {
    backgroundColor: 'black',
  },
  modalButtonTextCancel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  modalButtonTextConfirm: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

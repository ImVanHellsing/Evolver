import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFF',
  },
  modalTitle: {
    color: '#1C1C1E',
    fontSize: 21,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#636366',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 16,
  },
  formContent: {
    gap: 10,
    paddingBottom: 4,
  },
  label: {
    color: '#333',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 9,
    color: '#1C1C1E',
    backgroundColor: '#F9F9FA',
    fontSize: 15,
  },
  descriptionInput: {
    minHeight: 90,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    minWidth: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 9,
    backgroundColor: '#FFF',
  },
  muscleChipSelected: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  muscleChipText: {
    color: '#636366',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  muscleChipTextSelected: {
    color: '#FFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.4,
  },
});

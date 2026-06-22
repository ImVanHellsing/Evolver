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
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  daySelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minWidth: '30%',
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  dayChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  dayChipTextSelected: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f9f9f9',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

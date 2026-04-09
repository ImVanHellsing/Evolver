import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  pressableContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  leftContent: {
    flex: 1,
    marginRight: 8,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1C1C1E',
  },
  desc: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
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
  expandIcon: {
    fontSize: 20,
    padding: 4,
  },
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descriptionText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
  },
  editDescBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  editDescBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  }
});

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  pressableContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
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
    fontWeight: '700',
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    opacity: 0.8,
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
});

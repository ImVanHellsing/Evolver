import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  listContent: {
    padding: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  routineName: {
    fontSize: 14,
    color: '#48484A',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  dayOfWeek: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
  },
  sessionInfoContainer: {
    flexDirection: 'row',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 8,
  },
  sessionInfoText: {
    fontSize: 13,
    color: '#8E8E93',
    marginRight: 16,
  },
  sessionInfoValue: {
    color: '#1C1C1E',
    fontWeight: '500',
  },
});

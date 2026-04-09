import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#E9F2FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCE0FF',
  },
  infoText: {
    color: '#0056B3',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  exerciseCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  setNumber: {
    flex: 0.5,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  setComparisonBoxPrev: {
    flex: 1.5,
  },
  setComparisonBoxCurr: {
    flex: 1,
  },
  prevText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  currText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 15,
    color: '#C7C7CC',
  },
  statusBox: {
    flex: 1,
    alignItems: 'center',
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 32,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 8,
  },
  statsLabel: {
    fontSize: 11,
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
});

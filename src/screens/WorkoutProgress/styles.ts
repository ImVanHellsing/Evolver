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
  positionSection: {
    marginBottom: 4,
  },
  positionLabel: {
    color: '#636366',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
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
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#F2F2F7',
  },
  changeBadgeAdded: {
    backgroundColor: '#E8F8EC',
  },
  changeBadgeRemoved: {
    backgroundColor: '#FDECEA',
  },
  changeBadgeText: {
    color: '#636366',
    fontSize: 12,
    fontWeight: '700',
  },
  changeBadgeTextAdded: {
    color: '#248A3D',
  },
  changeBadgeTextRemoved: {
    color: '#D70015',
  },
  recordLabel: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
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
  setNumberHeader: {
    flex: 0.5,
  },
  previousHeader: {
    flex: 1.5,
  },
  currentHeader: {
    flex: 1,
  },
  statusHeader: {
    flex: 1,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  standaloneSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
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
  noValidSetsText: {
    color: '#8E8E93',
    fontSize: 14,
    paddingVertical: 8,
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
  statusEvolution: {
    backgroundColor: '#34C759',
  },
  statusStagnation: {
    backgroundColor: '#AFABB3',
  },
  statusInvolution: {
    backgroundColor: '#FF3B30',
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
});

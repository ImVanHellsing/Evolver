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
  summaryHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  exerciseSetsCount: {
    fontSize: 13,
    color: '#8E8E93',
  },
  expandIcon: {
    fontSize: 12,
    color: '#C7C7CC',
    marginLeft: 8,
  },
  setsList: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    alignItems: 'center',
  },
  setNumber: {
    width: 30,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  setData: {
    flex: 1,
  },
  setText: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  setBold: {
    fontWeight: 'bold',
  },
  failureType: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 2,
  },
  setNotes: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 2,
  },
  exerciseNotesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9F9FB',
    borderRadius: 8,
  },
  exerciseNotesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginBottom: 4,
  },
  exerciseNotes: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
  },
  footerInfo: {
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerDate: {
    fontSize: 12,
    color: '#AEAEB2',
  }
});

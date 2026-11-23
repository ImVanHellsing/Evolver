import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  innerContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { color: '#1C1C1E', fontSize: 28, fontWeight: '700' },
  hint: {
    color: '#8E8E93', fontSize: 14, lineHeight: 19, fontWeight: '500',
    marginTop: 5, marginBottom: 16,
  },
  scrollContent: { paddingBottom: 100 },
  daySlot: {
    position: 'relative',
    zIndex: 0,
    overflow: 'visible',
    marginBottom: 16,
  },
  daySlotEditing: {
    minHeight: 104, padding: 8, borderWidth: 1, borderColor: '#D1D1D6',
    borderRadius: 14, backgroundColor: '#ECECF0',
  },
  daySlotDragging: {
    zIndex: 100,
    elevation: 20,
  },
  dayLabel: {
    color: '#636366', fontSize: 13, fontWeight: '800', letterSpacing: 0.4,
    marginBottom: 7, textTransform: 'uppercase',
  },
  workoutCard: {
    padding: 15, borderRadius: 12, backgroundColor: '#FFF', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  workoutCardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, marginBottom: 5,
  },
  workoutCardTitle: { flex: 1, color: '#1C1C1E', fontSize: 18, fontWeight: '700' },
  editWorkoutButton: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    borderRadius: 18, backgroundColor: '#F2F2F7',
  },
  editWorkoutIcon: { fontSize: 17 },
  workoutCardDescription: { color: '#636366', fontSize: 13, lineHeight: 18 },
  workoutSessionText: { color: '#8E8E93', fontSize: 12, marginTop: 5 },
  emptyDayButton: {
    minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, borderWidth: 1.5, borderColor: '#AEAEB2', borderStyle: 'dashed',
    borderRadius: 12, backgroundColor: 'transparent',
  },
  emptyDayIcon: { color: '#636366', fontSize: 21, fontWeight: '500' },
  emptyDayText: { color: '#636366', fontSize: 14, fontWeight: '700' },
  emptyDayEditing: {
    minHeight: 66, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
    borderColor: '#AEAEB2', borderStyle: 'dashed', borderRadius: 10,
  },
  emptyDayEditingText: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  draggableWorkout: { zIndex: 0 },
  draggableWorkoutActive: { zIndex: 20, elevation: 12, opacity: 0.94 },
  editWorkoutCard: {
    minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 10, backgroundColor: '#FFF',
  },
  dragHandle: {
    width: 36, minHeight: 48, alignItems: 'center', justifyContent: 'center',
    borderRadius: 9, backgroundColor: '#F2F2F7',
  },
  dragHandleIcon: { color: '#636366', fontSize: 25, fontWeight: '700' },
  editWorkoutContent: { flex: 1 },
  editWorkoutTitle: { color: '#1C1C1E', fontSize: 16, fontWeight: '700', marginBottom: 3 },
  reorderActions: {
    position: 'absolute', left: 16, right: 16, bottom: 20, flexDirection: 'row',
    gap: 10, padding: 8, borderRadius: 16, backgroundColor: '#FFF', elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 8,
  },
  revertButton: {
    flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#C7C7CC', borderRadius: 12, backgroundColor: '#FFF',
  },
  revertButtonText: { color: '#1C1C1E', fontSize: 15, fontWeight: '700' },
  saveScheduleButton: {
    flex: 1.35, minHeight: 50, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, backgroundColor: '#000',
  },
  saveScheduleButtonText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});

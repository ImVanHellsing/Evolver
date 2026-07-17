import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  tabBar: {
    minHeight: 72,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  workoutIcon: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutIconBar: {
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#8A8A8A',
  },
  workoutIconPlate: {
    position: 'absolute',
    width: 5,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#8A8A8A',
  },
  workoutIconPlateLeft: {
    left: 3,
  },
  workoutIconPlateRight: {
    right: 3,
  },
  historyIcon: {
    width: 24,
    height: 24,
    borderWidth: 2.5,
    borderColor: '#8A8A8A',
    borderRadius: 12,
  },
  historyIconActive: {
    borderColor: '#111111',
  },
  historyHourHand: {
    position: 'absolute',
    left: 9,
    top: 4,
    width: 2.5,
    height: 7,
    borderRadius: 2,
    backgroundColor: '#8A8A8A',
  },
  historyMinuteHand: {
    position: 'absolute',
    left: 10,
    top: 9,
    width: 6,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#8A8A8A',
    transform: [{ rotate: '25deg' }],
  },
  iconPartActive: {
    backgroundColor: '#111111',
  },
});

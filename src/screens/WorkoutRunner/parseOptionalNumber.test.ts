import { parseOptionalNumber } from './useWorkoutRunner';

describe('parseOptionalNumber', () => {
  it('keeps empty or invalid input as undefined instead of 0', () => {
    expect(parseOptionalNumber('')).toBeUndefined();
    expect(parseOptionalNumber('   ')).toBeUndefined();
    expect(parseOptionalNumber('abc')).toBeUndefined();
  });

  it('parses numbers, accepting a comma as decimal separator', () => {
    expect(parseOptionalNumber('45')).toBe(45);
    expect(parseOptionalNumber('320,5')).toBe(320.5);
    expect(parseOptionalNumber('0')).toBe(0);
  });
});

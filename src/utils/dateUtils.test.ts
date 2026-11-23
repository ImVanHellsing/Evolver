import { formatDate, getFirstValidDate } from './dateUtils';

describe('dateUtils', () => {
  it('uses the first valid date and ignores malformed legacy values', () => {
    const result = getFirstValidDate('invalid-date', undefined, '2026-07-31T12:00:00.000Z');

    expect(result?.toISOString()).toBe('2026-07-31T12:00:00.000Z');
  });

  it('returns a safe label for an invalid date', () => {
    expect(formatDate(new Date(Number.NaN))).toBe('Data desconhecida');
  });
});

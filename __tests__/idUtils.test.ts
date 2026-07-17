import { createEntityId } from '../src/utils/idUtils';

describe('createEntityId', () => {
  it('creates prefixed ULID identifiers', () => {
    const id = createEntityId('routine', 1_700_000_000_000);

    expect(id).toMatch(/^routine_[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it('creates unique and sortable identifiers in the same millisecond', () => {
    const first = createEntityId('set_log', 1_700_000_000_001);
    const second = createEntityId('set_log', 1_700_000_000_001);

    expect(first).not.toBe(second);
    expect(first < second).toBe(true);
  });
});

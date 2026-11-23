import { formatClusterBlocks, getClusterTotal } from './clusterUtils';

describe('cluster blocks', () => {
  it('sums the actual blocks as total reps', () => {
    expect(getClusterTotal([4, 4, 3, 2])).toBe(13);
    expect(getClusterTotal([])).toBe(0);
    expect(getClusterTotal([4, 3, 2].filter((_, index) => index !== 1))).toBe(6);
  });

  it('formats blocks without changing legacy sets', () => {
    expect(formatClusterBlocks([4, 3, 2])).toBe('Blocos: 4 + 3 + 2');
    expect(formatClusterBlocks()).toBe('');
  });
});

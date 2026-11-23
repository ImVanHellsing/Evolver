export const getClusterTotal = (blocks: readonly number[]) =>
  blocks.reduce((total, reps) => total + reps, 0);

export const formatClusterBlocks = (blocks?: readonly number[]) =>
  blocks?.length ? `Blocos: ${blocks.join(' + ')}` : '';

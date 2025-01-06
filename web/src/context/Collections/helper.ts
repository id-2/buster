import type { BusterCollection } from '@/api/busterv2/collection';

export const canEditCollection = (collection: BusterCollection) => {
  return collection.permission === 'owner' || collection.permission === 'editor';
};

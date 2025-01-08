import { useCreateReactQuery } from '@/api/createReactQuery';
import { getDatasets } from './requests';
import { BusterDatasetListItem } from './responseInterfaces';
import { useMemoizedFn } from 'ahooks';

export const useGetDatasets = (params?: Parameters<typeof getDatasets>[0]) => {
  const queryFn = useMemoizedFn(() => getDatasets(params));
  return useCreateReactQuery<BusterDatasetListItem[]>({
    queryKey: ['datasets', params || {}],
    queryFn,
    initialData: []
  });
};

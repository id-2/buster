import { useCreateReactMutation, useCreateReactQuery } from '@/api/createReactQuery';
import { createDataset, getDatasetData, getDatasetMetadata, getDatasets } from './requests';
import { BusterDataset, BusterDatasetData, BusterDatasetListItem } from './responseInterfaces';
import { useMemoizedFn } from 'ahooks';

export const useGetDatasets = (params?: Parameters<typeof getDatasets>[0]) => {
  const queryFn = useMemoizedFn(() => getDatasets(params));
  return useCreateReactQuery<BusterDatasetListItem[]>({
    queryKey: ['datasets', params || {}],
    queryFn,
    initialData: []
  });
};

export const useGetDatasetData = (datasetId: string) => {
  const queryFn = useMemoizedFn(() => getDatasetData(datasetId));
  return useCreateReactQuery<BusterDatasetData>({
    queryKey: ['datasetData', datasetId],
    queryFn,
    enabled: !!datasetId
  });
};

export const useGetDatasetMetadata = (datasetId: string) => {
  const queryFn = useMemoizedFn(() => getDatasetMetadata(datasetId));
  return useCreateReactQuery<BusterDataset>({
    queryKey: ['datasetMetadata', datasetId],
    queryFn,
    enabled: !!datasetId
  });
};

export const useCreateDataset = () => {
  const mutationFn = useMemoizedFn((dataset: BusterDataset) => createDataset(dataset));
  const onSuccess = useMemoizedFn((data: any) => {});
  const onError = useMemoizedFn((data: any) => {});
  return useCreateReactMutation({
    mutationFn,
    onSuccess,
    onError
  });
};

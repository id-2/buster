import { useCreateReactMutation, useCreateReactQuery } from '@/api/createReactQuery';
import { createDataset, getDatasetData, getDatasetMetadata, getDatasets } from './requests';
import { BusterDataset, BusterDatasetData, BusterDatasetListItem } from './responseInterfaces';
import { useMemoizedFn } from 'ahooks';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const mutationFn = useMemoizedFn((dataset: BusterDataset) => createDataset(dataset));
  const onSuccess = useMemoizedFn((newDataset: BusterDataset) => {
    console.log('newDataset', newDataset);
    queryClient.setQueryData<BusterDatasetListItem[]>(['datasets', {}], (oldData) => {
      //   const newListItem: BusterDatasetListItem = {
      //     ...newDataset,
      //     name: newDataset.name,
      //     created_at: newDataset.created_at,
      //     updated_at: newDataset.updated_at,
      //     definition: newDataset.definition,
      //     owner: '',
      //   };
      return oldData;
    });
  });
  const onError = useMemoizedFn((error: any) => {
    console.error('Failed to create dataset:', error);
  });
  return useCreateReactMutation({
    mutationFn,
    onSuccess,
    onError
  });
};

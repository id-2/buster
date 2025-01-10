import { useCreateReactMutation, useCreateReactQuery } from '@/api/createReactQuery';
import {
  listDatasetGroups,
  deleteDatasetGroup,
  createDatasetGroup,
  getDatasetGroup,
  updateDatasetGroup
} from './requests';
import { useQueryClient } from '@tanstack/react-query';
import { useMemoizedFn } from 'ahooks';

export const useListDatasetGroups = () => {
  const queryFn = useMemoizedFn(() => listDatasetGroups());
  return useCreateReactQuery({
    queryKey: ['dataset_groups'],
    queryFn
  });
};

export const useDeleteDatasetGroup = () => {
  const queryClient = useQueryClient();
  const mutationFn = useMemoizedFn(async (id: string) => {
    const res = await deleteDatasetGroup(id);
    queryClient.invalidateQueries({ queryKey: ['dataset_groups'] });
    return res;
  });
  const onSuccess = useMemoizedFn(() => {
    queryClient.invalidateQueries({ queryKey: ['dataset_groups'] });
  });

  return useCreateReactMutation({
    mutationFn,
    onSuccess
  });
};

export const useUpdateDatasetGroup = () => {
  const queryClient = useQueryClient();
  const mutationFn = useMemoizedFn(async (data: Parameters<typeof updateDatasetGroup>[0]) => {
    const res = await updateDatasetGroup(data);
    queryClient.invalidateQueries({ queryKey: ['dataset_groups'] });
    return res;
  });

  return useCreateReactMutation({
    mutationFn
  });
};

export const useGetDatasetGroup = (datasetId: string) => {
  const queryFn = useMemoizedFn(() => getDatasetGroup(datasetId));
  return useCreateReactQuery({
    queryKey: ['dataset_groups', datasetId],
    queryFn
  });
};

export const useCreateDatasetGroup = (datasetId?: string) => {
  const queryClient = useQueryClient();
  const mutationFn = useMemoizedFn(async (data: Parameters<typeof createDatasetGroup>[0]) => {
    const res = await createDatasetGroup(data);
    queryClient.invalidateQueries({ queryKey: ['dataset_groups'] });
    if (datasetId) {
      queryClient.invalidateQueries({ queryKey: ['dataset_groups', datasetId] });
      queryClient.invalidateQueries({ queryKey: ['list_dataset_groups', datasetId] });
    }
    return res;
  });
  const onSuccess = useMemoizedFn(() => {
    queryClient.invalidateQueries({ queryKey: ['dataset_groups'] });
  });

  return useCreateReactMutation({
    mutationFn,
    onSuccess
  });
};

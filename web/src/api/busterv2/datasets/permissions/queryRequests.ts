import { useCreateReactQuery, useCreateReactMutation } from '@/api/createReactQuery';
import {
  getDatasetPermissionsOverview,
  listDatasetGroups,
  listPermissionGroups,
  listPermissionUsers,
  updateDatasetGroups,
  updatePermissionGroups,
  updatePermissionUsers
} from './requests';
import { useMemoizedFn } from 'ahooks';
import { QueryClient } from '@tanstack/react-query';
import { getDatasetPermissionsOverview_server } from './serverRequests';

export const useGetDatasetPermissionsOverview = (dataset_id: string) => {
  const queryFn = useMemoizedFn(() => getDatasetPermissionsOverview({ dataset_id }));

  return useCreateReactQuery({
    queryKey: ['dataset_permissions_overview', dataset_id],
    queryFn
  });
};

export const prefetchGetDatasetPermissionsOverview = async (
  datasetId: string,
  queryClientProp?: QueryClient
) => {
  const queryClient = queryClientProp || new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['dataset_permissions_overview', datasetId],
    queryFn: () => getDatasetPermissionsOverview_server(datasetId)
  });
  return queryClient;
};

export const useListPermissionGroups = (dataset_id: string) => {
  const queryFn = useMemoizedFn(() => listPermissionGroups({ dataset_id }));

  return useCreateReactQuery({
    queryKey: ['list_permission_groups', dataset_id],
    queryFn
  });
};

export const useListDatasetGroups = (dataset_id: string) => {
  const queryFn = useMemoizedFn(() => listDatasetGroups({ dataset_id }));

  return useCreateReactQuery({
    queryKey: ['list_dataset_groups', dataset_id],
    queryFn
  });
};

export const useListPermissionUsers = (dataset_id: string) => {
  const queryFn = useMemoizedFn(() => listPermissionUsers({ dataset_id }));

  return useCreateReactQuery({
    queryKey: ['list_permission_users', dataset_id],
    queryFn
  });
};

export const useUpdatePermissionGroups = (dataset_id: string) => {
  const mutationFn = useMemoizedFn((groups: { id: string; assigned: boolean }[]) =>
    updatePermissionGroups({ dataset_id, groups })
  );
  const onSuccess = useMemoizedFn(() => {
    // queryClient.invalidateQueries({ queryKey: ['dataset_permissions_overview', dataset_id] });
  });

  return useCreateReactMutation({
    mutationFn,
    onSuccess
  });
};

export const useUpdateDatasetGroups = (dataset_id: string) => {
  const mutationFn = useMemoizedFn((groups: { id: string; assigned: boolean }[]) =>
    updateDatasetGroups({ dataset_id, groups })
  );
  const onSuccess = useMemoizedFn(() => {
    // queryClient.invalidateQueries({ queryKey: ['dataset_permissions_overview', dataset_id] });
  });

  return useCreateReactMutation({
    mutationFn,
    onSuccess
  });
};

export const useUpdatePermissionUsers = (dataset_id: string) => {
  const mutationFn = useMemoizedFn((users: { id: string; assigned: boolean }[]) =>
    updatePermissionUsers({ dataset_id, users })
  );
  const onSuccess = useMemoizedFn(() => {
    // queryClient.invalidateQueries({ queryKey: ['dataset_permissions_overview', dataset_id] });
  });

  return useCreateReactMutation({
    mutationFn,
    onSuccess
  });
};
